// lib/search-mp.ts (server only)
import type { Material, SearchQuery } from './types';

const BASE = process.env.MP_API_BASE_URL || 'https://api.materialsproject.org';
const SUMMARY_PATH = process.env.MP_API_SUMMARY_PATH || '/materials/summary';
const KEY = process.env.MP_API_KEY;

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (KEY) h['X-API-KEY'] = KEY; // current header name used by MP
  return h;
}

function buildCriteria(q: SearchQuery) {
  const criteria: any = {};
  if (q.q) {
    criteria.formula = q.q; // e.g., "Al2O3"
  }
  const props: any = {};
  if (q.bandGapMin !== undefined) props.band_gap_min = q.bandGapMin;
  if (q.bandGapMax !== undefined) props.band_gap_max = q.bandGapMax;
  if (q.densMin !== undefined) props.density_min = q.densMin;
  if (q.densMax !== undefined) props.density_max = q.densMax;
  return { criteria, props };
}

export async function searchMP(q: SearchQuery): Promise<Material[]> {
  if (!KEY) return [];

  const url = `${BASE}${SUMMARY_PATH}`;
  const body = buildCriteria(q);

  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      criteria: body.criteria,
      properties: [
        'material_id',
        'formula_pretty',
        'band_gap',
        'density',
        'symmetry.symbol',
        'elasticity.K_VRH',
        'elasticity.G_VRH',
        'elasticity.poisson_ratio',
        'formation_energy_per_atom'
      ],
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('MP API error', res.status, await res.text());
    return [];
  }

  const json: any = await res.json();
  const docs: any[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);

  const items: Material[] = docs.map((d, i) => ({
    id: d.material_id ?? `mp_${i}`,
    source: 'mp',
    formula: d.formula_pretty ?? d.formula ?? '—',
    mp_id: d.material_id,
    spacegroup: d?.symmetry?.symbol ?? d?.spacegroup?.symbol ?? undefined,
    band_gap: d.band_gap ?? null,
    density: d.density ?? null,
    formation_energy: d.formation_energy_per_atom ?? null,
    youngs_modulus: d?.elasticity?.E_Young ?? null,
    bulk_modulus: d?.elasticity?.K_VRH ?? null,
    poisson_ratio: d?.elasticity?.poisson_ratio ?? null,
    fracture_toughness: null,
    props: {
      K_VRH: d?.elasticity?.K_VRH ?? null,
      G_VRH: d?.elasticity?.G_VRH ?? null,
    },
  }));

  const inRange = (v: number | null | undefined, lo?: number, hi?: number) => {
    if (v == null) return false;
    if (lo !== undefined && v < lo) return false;
    if (hi !== undefined && v > hi) return false;
    return true;
  };

  return items.filter((m) => {
    if (q.bandGapMin !== undefined || q.bandGapMax !== undefined) {
      if (!inRange(m.band_gap, q.bandGapMin, q.bandGapMax)) return false;
    }
    if (q.densMin !== undefined || q.densMax !== undefined) {
      if (!inRange(m.density, q.densMin, q.densMax)) return false;
    }
    return true;
  });
}
