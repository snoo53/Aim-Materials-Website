import React, { useMemo, useState } from "react";

// 💡 This is a self-contained visual mock of the Test page UI.
// It uses local sample data (no external calls) so you can see/feel the UX.

const SAMPLE = [
  {
    id: "ml_001",
    source: "ml",
    formula: "Al2O3",
    name: "Alumina (candidate)",
    spacegroup: "R-3c",
    band_gap: 8.5,
    formation_energy: -1.75,
    density: 3.95,
    youngs_modulus: 390,
    bulk_modulus: 250,
    poisson_ratio: 0.23,
    fracture_toughness: 3.5,
    tags: ["oxide", "ceramic", "aerospace"],
  },
  {
    id: "ml_002",
    source: "ml",
    formula: "Ni3Al",
    name: "γ' (gamma-prime) intermetallic",
    spacegroup: "Pm-3m",
    band_gap: 0.0,
    formation_energy: -0.52,
    density: 7.6,
    youngs_modulus: 220,
    bulk_modulus: 150,
    poisson_ratio: 0.28,
    fracture_toughness: 20.0,
    tags: ["intermetallic", "superalloy"],
  },
  {
    id: "ml_003",
    source: "ml",
    formula: "Ti6Al4V",
    name: "Ti-6Al-4V (approx)",
    spacegroup: "P6_3/mmc",
    band_gap: 0.0,
    density: 4.43,
    youngs_modulus: 114,
    bulk_modulus: 110,
    poisson_ratio: 0.34,
    fracture_toughness: 55.0,
    tags: ["titanium", "alloy", "aerospace"],
  },
  {
    id: "mp_001",
    source: "mp",
    formula: "SiC",
    name: "Silicon Carbide",
    spacegroup: "F-43m",
    band_gap: 2.3,
    density: 3.21,
    youngs_modulus: 450,
    fracture_toughness: 3.7,
    tags: ["carbide", "ceramic"],
  },
  {
    id: "mp_002",
    source: "mp",
    formula: "ZrO2",
    name: "Zirconia (YSZ-like)",
    spacegroup: "Fm-3m",
    band_gap: 5.0,
    density: 5.7,
    youngs_modulus: 210,
    fracture_toughness: 8.0,
    tags: ["oxide", "tbc"],
  },
];

function Stat({ label, value }) {
  return (
    <div className="text-xs text-neutral-400">
      <span className="text-neutral-500">{label}: </span>
      <span className="text-neutral-200">{value ?? "—"}</span>
    </div>
  );
}

function SourceBadge({ src }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
        src === "ml"
          ? "border-emerald-500/40 text-emerald-300"
          : "border-sky-500/40 text-sky-300"
      }`}
    >
      {src.toUpperCase()}
    </span>
  );
}

function CardGrid({ items }) {
  return (
    <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {items.map((m) => (
        <div
          key={m.id}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-medium">{m.formula}</div>
            <SourceBadge src={m.source} />
          </div>
          {m.name && (
            <div className="text-sm text-neutral-400 mb-2">{m.name}</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Band gap (eV)" value={m.band_gap} />
            <Stat label="Density (g/cm³)" value={m.density} />
            <Stat label="E (GPa)" value={m.youngs_modulus} />
            <Stat label="K_Ic" value={m.fracture_toughness} />
            <Stat label="Spacegroup" value={m.spacegroup} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultTable({ items }) {
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
              <td className="px-3 py-2">
                <SourceBadge src={m.source} />
              </td>
              <td className="px-3 py-2">{m.band_gap ?? "—"}</td>
              <td className="px-3 py-2">{m.density ?? "—"}</td>
              <td className="px-3 py-2">{m.youngs_modulus ?? "—"}</td>
              <td className="px-3 py-2">{m.fracture_toughness ?? "—"}</td>
              <td className="px-3 py-2">{m.spacegroup ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TestPagePreview() {
  const [q, setQ] = useState("");
  const [dataset, setDataset] = useState("all"); // all | ml | mp
  const [bandGapMin, setBandGapMin] = useState("");
  const [bandGapMax, setBandGapMax] = useState("");
  const [toughMin, setToughMin] = useState("");
  const [toughMax, setToughMax] = useState("");
  const [densMin, setDensMin] = useState("");
  const [densMax, setDensMax] = useState("");
  const [view, setView] = useState("cards"); // cards | table

  const items = useMemo(() => {
    const text = q.trim().toLowerCase();
    const inRange = (v, lo, hi) => {
      if (v == null) return false;
      if (lo !== undefined && lo !== "" && Number(v) < Number(lo)) return false;
      if (hi !== undefined && hi !== "" && Number(v) > Number(hi)) return false;
      return true;
    };

    return SAMPLE.filter((m) => {
      if (dataset !== "all" && m.source !== dataset) return false;
      if (text) {
        const hay = [m.formula, m.name ?? "", ...(m.tags ?? [])]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(text)) return false;
      }
      if (bandGapMin || bandGapMax) {
        if (!inRange(m.band_gap, bandGapMin, bandGapMax)) return false;
      }
      if (toughMin || toughMax) {
        if (!inRange(m.fracture_toughness, toughMin, toughMax)) return false;
      }
      if (densMin || densMax) {
        if (!inRange(m.density, densMin, densMax)) return false;
      }
      return true;
    });
  }, [q, dataset, bandGapMin, bandGapMax, toughMin, toughMax, densMin, densMax]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">
        Test Materials Search (Preview)
      </h1>

      {/* Controls */}
      <div className="grid md:grid-cols-4 gap-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4">
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Formula or keyword (e.g., Al2O3, SiC, Inconel)"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Dataset</label>
          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="ml">ML only</option>
            <option value="mp">Materials Project only</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">View</label>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option value="cards">Cards</option>
            <option value="table">Table</option>
          </select>
        </div>

        {/* Numeric filters */}
        <div className="grid grid-cols-2 gap-3 md:col-span-4">
          <div>
            <div className="text-xs text-neutral-400 mb-1">Band gap (eV)</div>
            <div className="flex gap-2">
              <input
                value={bandGapMin}
                onChange={(e) => setBandGapMin(e.target.value)}
                placeholder="min"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
              <input
                value={bandGapMax}
                onChange={(e) => setBandGapMax(e.target.value)}
                placeholder="max"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">
              Fracture toughness (MPa·m^0.5)
            </div>
            <div className="flex gap-2">
              <input
                value={toughMin}
                onChange={(e) => setToughMin(e.target.value)}
                placeholder="min"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
              <input
                value={toughMax}
                onChange={(e) => setToughMax(e.target.value)}
                placeholder="max"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Density (g/cm³)</div>
            <div className="flex gap-2">
              <input
                value={densMin}
                onChange={(e) => setDensMin(e.target.value)}
                placeholder="min"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
              <input
                value={densMax}
                onChange={(e) => setDensMax(e.target.value)}
                placeholder="max"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-sm text-neutral-400">
        {items.length} results (sample data)
      </div>

      {view === "cards" ? <CardGrid items={items} /> : <ResultTable items={items} />}

      <p className="mt-6 text-xs text-neutral-500">
        *Preview uses mocked data for demo. Your live site will connect this UI to
        `/api/search` and the Materials Project + your ML dataset.
      </p>
    </div>
  );
}
