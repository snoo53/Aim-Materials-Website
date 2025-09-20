// app/api/search/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { searchML } from '../../../lib/search-ml';
import { searchMP } from '../../../lib/search-mp';
import type { Material, SearchQuery, SearchResult } from '../../../lib/types';

function num(v: string | null, d?: number) {
  if (v == null) return d as any;
  const n = Number(v);
  return Number.isFinite(n) ? (n as any) : d;
}

function parseQuery(req: NextRequest): SearchQuery {
  const u = new URL(req.url);
  return {
    q: u.searchParams.get('q') || undefined,
    dataset: (u.searchParams.get('dataset') as any) || 'all',
    page: num(u.searchParams.get('page'), 1),
    pageSize: num(u.searchParams.get('pageSize'), 24),
    bandGapMin: num(u.searchParams.get('bandGapMin')),
    bandGapMax: num(u.searchParams.get('bandGapMax')),
    toughMin: num(u.searchParams.get('toughMin')),
    toughMax: num(u.searchParams.get('toughMax')),
    densMin: num(u.searchParams.get('densMin')),
    densMax: num(u.searchParams.get('densMax')),
  };
}

function score(q: SearchQuery, m: Material): number {
  let s = 0;
  if (q.q) {
    const needle = q.q.toLowerCase();
    const hay = [m.formula, m.name ?? '', ...(m.tags ?? [])]
      .join(' ').toLowerCase();
    if (hay.includes(needle)) s += 10;
    if (m.formula.toLowerCase() === needle) s += 30;
  }
  if (m.source === 'ml') s += 2;
  return s;
}

function dedupe(items: Material[]): Material[] {
  const seen = new Map<string, Material>();
  for (const m of items) {
    const key = m.mp_id || `${m.source}:${m.formula}:${m.spacegroup ?? ''}`;
    if (!seen.has(key)) seen.set(key, m);
  }
  return Array.from(seen.values());
}

export async function GET(req: NextRequest) {
  const q = parseQuery(req);

  const wantMP = q.dataset === 'all' || q.dataset === 'mp';
  const wantML = q.dataset === 'all' || q.dataset === 'ml';

  const [ml, mp] = await Promise.all([
    wantML ? searchML(q).catch(() => []) : Promise.resolve([]),
    wantMP ? searchMP(q).catch(() => []) : Promise.resolve([]),
  ]);

  let merged = dedupe([...(ml as Material[]), ...(mp as Material[])]);
  merged.sort((a, b) => score(q, b) - score(q, a));

  const total = merged.length;
  const page = q.page ?? 1;
  const pageSize = Math.max(1, Math.min(q.pageSize ?? 24, 100));
  const start = (page - 1) * pageSize;
  const items = merged.slice(start, start + pageSize);

  const result: SearchResult = { total, items };
  return NextResponse.json(result, { status: 200 });
}
