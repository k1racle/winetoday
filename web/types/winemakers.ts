import type { MediaAsset } from './content';

export type ContentBlocksValue = any[];

export interface RegionSummary {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  parentId?: string | null;
  _count?: {
    wineries?: number;
    wines?: number;
    terroirs?: number;
  };
}

export interface WinerySummary {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  foundedYear?: number | null;
  logo?: MediaAsset | null;
  region?: RegionSummary | null;
  _count?: {
    persons?: number;
    wines?: number;
  };
}

export interface TerroirSummary {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  region?: RegionSummary | null;
  exposition?: string | null;
  elevationM?: number | null;
  soil?: string | null;
}

export interface PersonSummary {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  featured?: boolean;
  photo?: MediaAsset | null;
  winery?: WinerySummary | null;
}

export interface WineSummary {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  type?: string | null;
  style?: string | null;
  vintage?: number | null;
  winery?: WinerySummary | null;
  region?: RegionSummary | null;
  terroir?: TerroirSummary | null;
}

export interface PersonDetail extends PersonSummary {
  bioBlocks: ContentBlocksValue;
  career: Array<{
    from?: string | number | null;
    to?: string | number | null;
    role?: string | null;
    place?: string | null;
    note?: string | null;
  }>;
  relationsFrom: Array<{
    type: string;
    related: PersonSummary;
  }>;
  relationsTo: Array<{
    type: string;
    person: PersonSummary;
  }>;
  wines: Array<{
    role?: string | null;
    wine: WineSummary;
  }>;
}

export interface WineDetail extends WineSummary {
  grapes: string[];
  description: ContentBlocksValue;
  winemakers: Array<{
    role?: string | null;
    person: PersonSummary;
  }>;
}

export interface RegionDetail extends RegionSummary {
  description: ContentBlocksValue;
  climate?: string | null;
  soil?: string | null;
  parent?: RegionSummary | null;
  children: RegionSummary[];
  wineries: WinerySummary[];
  wines: WineSummary[];
  terroirs: TerroirSummary[];
}

export interface WineryDetail extends WinerySummary {
  description: ContentBlocksValue;
  persons: PersonSummary[];
  wines: WineSummary[];
}

export interface TerroirDetail extends TerroirSummary {
  description: ContentBlocksValue;
  wines: WineSummary[];
}

export interface WinepediaSearchResult {
  q: string;
  persons: PersonSummary[];
  wines: WineSummary[];
  regions: RegionSummary[];
  wineries: WinerySummary[];
}
