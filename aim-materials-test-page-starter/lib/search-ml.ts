// lib/search-ml.ts (server only)
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Material, SearchQuery } from './types';

let ML_CACHE: Material[] | null = null;

async function loadML(): Promise<Material[]> {
  if (ML_CACHE) return ML_CACHE;
  const p = path.join(process.cwd(), 'data', 'ml_materials.json');
  const raw = await fs.readFile(p, 'utf-8');
  const items = JSON.parse(raw) as Material[];
  // ensure required fields & ids
  ML_CACHE = items.map((x, i) => ({
    id: x.id || x.ml_id || `ml_${i}`,
    source: 'ml',
    formula: x.formula,
    mp_id: undefined,
    ml_id: x.ml_id ?? x.id ?? `ml_${i}`,
    name: x.name,
    spacegroup: x.spacegroup,
    band_gap: x.band_gap ?? null,
    formation_energy: x.formation_energy ?? null,
    density: x.density ?? null,
    youngs_modulus: x.youngs_modulus ?? null,
    bulk_modulus: x.bulk_modulus ?? null,
    poisson_ratio: x.poisson_ratio ?? null,
    fracture_toughness: x.fracture_toughness ?? null,
    tags: x.tags ?? [],
    props: x.props ?? {},
  }));
  return ML_CACHE;
}

export async function searchML(q: SearchQuery): Promise<Material[]> {
  const data = await loadML();
  const norm = (s: string) => s.toLowerCase();
  return data.filter((m) => {
    // text match (formula, name, tags)
    if (q.q) {
      const needle = norm(q.q);
      const hay = [m.formula, m.name ?? '', ...(m.tags ?? [])].map(norm).join(' ');
      if (!hay.includes(needle)) return false;
    }
    // numeric filters
    const inRange = (v: number | null | undefined, lo?: number, hi?: number) => {
      if (v === null || v === undefined) return false;
      if (lo !== undefined && v < lo) return false;
      if (hi !== undefined && v > hi) return false;
      return true;
    };

    if (q.bandGapMin !== undefined || q.bandGapMax !== undefined) {
      if (!inRange(m.band_gap, q.bandGapMin, q.bandGapMax)) return false;
    }
    if (q.toughMin !== undefined || q.toughMax !== undefined) {
      if (!inRange(m.fracture_toughness, q.toughMin, q.toughMax)) return false;
    }
    if (q.densMin !== undefined || q.densMax !== undefined) {
      if (!inRange(m.density, q.densMin, q.densMax)) return false;
    }
    return true;
  });
}
