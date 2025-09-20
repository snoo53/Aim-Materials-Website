// app/test/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Material } from '../../lib/types';

interface ApiResponse {
  total: number;
  items: Material[];
}

type ViewMode = 'cards' | 'table';

export default function TestPage() {
  const [q, setQ] = useState('');
  const [dataset, setDataset] = useState<'all' | 'mp' | 'ml'>('all');
  const [bandGapMin, setBandGapMin] = useState<string>('');
  const [bandGapMax, setBandGapMax] = useState<string>('');
  const [toughMin, setToughMin] = useState<string>('');
  const [toughMax, setToughMax] = useState<string>('');
  const [densMin, setDensMin] = useState<string>('');
  const [densMax, setDensMax] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [view, setView] = useState<ViewMode>('cards');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse>({ total: 0, items: [] });

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    p.set('dataset', dataset);
    p.set('page', String(page));
    p.set('pageSize', String(pageSize));
    if (bandGapMin) p.set('bandGapMin', bandGapMin);
    if (bandGapMax) p.set('bandGapMax', bandGapMax);
    if (toughMin) p.set('toughMin', toughMin);
    if (toughMax) p.set('toughMax', toughMax);
    if (densMin) p.set('densMin', densMin);
    if (densMax) p.set('densMax', densMax);
    return p.toString();
  }, [q, dataset, page, pageSize, bandGapMin, bandGapMax, toughMin, toughMax, densMin, densMax]);

  async function fetchData() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/search?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [params]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Test Materials Search</h1>

      {/* Controls */}
      <div className="grid md:grid-cols-4 gap-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4">
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Formula or keyword (e.g., Al2O3, Inconel)"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Dataset</label>
          <select
            value={dataset}
            onChange={(e) => { setDataset(e.target.value as any); setPage(1); }}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="ml">ML only</option>
            <option value="mp">Materials Project only</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">View</label>
          <select value={view} onChange={(e) => setView(e.target.value as ViewMode)} className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2">
            <option value="cards">Cards</option>
            <option value="table">Table</option>
          </select>
        </div>

        {/* Numeric filters */}
        <div className="grid grid-cols-2 gap-3 md:col-span-4">
          <div>
            <div className="text-xs text-neutral-400 mb-1">Band gap (eV)</div>
            <div className="flex gap-2">
              <input value={bandGapMin} onChange={(e) => { setBandGapMin(e.target.value); setPage(1); }} placeholder="min"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2" />
              <input value={bandGapMax} onChange={(e) => { setBandGapMax(e.target.value); setPage(1); }} placeholder="max"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Fracture toughness (MPa·m^0.5)</div>
            <div className="flex gap-2">
              <input value={toughMin} onChange={(e) => { setToughMin(e.target.value); setPage(1); }} placeholder="min"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2" />
              <input value={toughMax} onChange={(e) => { setToughMax(e.target.value); setPage(1); }} placeholder="max"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Density (g/cm³)</div>
            <div className="flex gap-2">
              <input value={densMin} onChange={(e) => { setDensMin(e.target.value); setPage(1); }} placeholder="min"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2" />
              <input value={densMax} onChange={(e) => { setDensMax(e.target.value); setPage(1); }} placeholder="max"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 text-sm text-neutral-400">
        {loading ? 'Searching…' : `${data.total} results`}
        {error && <span className="text-red-400 ml-2">{error}</span>}
      </div>

      {/* Results */}
      {view === 'cards' ? (
        <CardGrid items={data.items} />
      ) : (
        <ResultTable items={data.items} />
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-2 rounded-xl border border-neutral-700 disabled:opacity-50"
        >Prev</button>
        <div className="text-sm text-neutral-400">Page {page}</div>
        <button
          disabled={loading || data.items.length < pageSize}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 rounded-xl border border-neutral-700 disabled:opacity-50"
        >Next</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="text-xs text-neutral-400">
      <span className="text-neutral-500">{label}: </span>
      <span className="text-neutral-200">{value ?? '—'}</span>
    </div>
  );
}

function SourceBadge({ src }: { src: 'mp' | 'ml' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${src === 'ml' ? 'border-emerald-500/40 text-emerald-300' : 'border-sky-500/40 text-sky-300'}`}>
      {src.toUpperCase()}
    </span>
  );
}

function CardGrid({ items }: { items: Material[] }) {
  return (
    <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {items.map((m) => (
        <div key={m.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-medium">{m.formula}</div>
            <SourceBadge src={m.source} />
          </div>
          {m.name && <div className="text-sm text-neutral-400 mb-2">{m.name}</div>}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Band gap (eV)" value={m.band_gap} />
            <Stat label="Density (g/cm³)" value={m.density} />
            <Stat label="E (GPa)" value={m.youngs_modulus} />
            <Stat label="K_Ic (MPa·m^0.5)" value={m.fracture_toughness} />
            <Stat label="Spacegroup" value={m.spacegroup} />
          </div>
          {m.mp_id && (
            <div className="mt-3 text-xs text-neutral-500">MP ID: {m.mp_id}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultTable({ items }: { items: Material[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-neutral-950">
          <tr className="text-left text-neutral-400">
            <th className="px-3 py-2">Formula</th>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">Band gap</th>
            <th className="px-3 py-2">Density</th>
            <th className="px-3 py-2">E (GPa)</th>
            <th className="px-3 py-2">K_Ic</th>
            <th className="px-3 py-2">Spacegroup</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id} className="border-t border-neutral-800">
              <td className="px-3 py-2">{m.formula}</td>
              <td className="px-3 py-2"><SourceBadge src={m.source} /></td>
              <td className="px-3 py-2">{m.band_gap ?? '—'}</td>
              <td className="px-3 py-2">{m.density ?? '—'}</td>
              <td className="px-3 py-2">{m.youngs_modulus ?? '—'}</td>
              <td className="px-3 py-2">{m.fracture_toughness ?? '—'}</td>
              <td className="px-3 py-2">{m.spacegroup ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
