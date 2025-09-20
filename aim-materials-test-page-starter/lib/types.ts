// lib/types.ts
export type DataSource = 'mp' | 'ml';

export interface Material {
  id: string;              // stable unique id used in UI
  source: DataSource;      // 'mp' | 'ml'
  formula: string;         // e.g., "Al2O3"
  mp_id?: string;          // for MP-sourced items
  ml_id?: string;          // for ML-sourced items
  name?: string;           // optional common name
  spacegroup?: string;
  band_gap?: number | null;          // eV
  formation_energy?: number | null;  // eV/atom (or specify units)
  density?: number | null;           // g/cm^3
  youngs_modulus?: number | null;    // GPa
  bulk_modulus?: number | null;      // GPa
  poisson_ratio?: number | null;
  fracture_toughness?: number | null; // MPa·m^0.5 (if available)
  tags?: string[];
  // catch-all for extra props; show selectively in UI
  props?: Record<string, string | number | null>;
}

export interface SearchQuery {
  q?: string;                         // formula or keyword
  dataset?: 'all' | 'mp' | 'ml';
  page?: number;
  pageSize?: number;
  // numeric filters (optional)
  bandGapMin?: number; bandGapMax?: number;
  toughMin?: number; toughMax?: number; // fracture toughness
  densMin?: number; densMax?: number;
}

export interface SearchResult {
  total: number;        // total hits (after merge/filter)
  items: Material[];    // paginated items
}
