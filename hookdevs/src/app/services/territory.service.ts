import { Injectable } from '@angular/core';

export interface TechBadge { mark: string; color: string; ink: string; }
export interface TerritorialRegion {
  id: string;
  name: string;
  short: string;
  provinces: string[];
  employment: number;
  unemployment: number;
  activity: number;
  subocupacion: number;
  evolution: number[];
  techs: string[];
}
export interface TerritoryPayload {
  territorialRegions: TerritorialRegion[];
  techCatalog: Record<string, TechBadge>;
}

@Injectable({ providedIn: 'root' })
export class TerritoryService {
  private cache?: Promise<TerritoryPayload>;

  load(): Promise<TerritoryPayload> {
    if (!this.cache) {
      this.cache = fetch(`assets/data/market-data.json?ts=${Date.now()}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => ({
          territorialRegions: data.territorialRegions as TerritorialRegion[],
          techCatalog: data.techCatalog as Record<string, TechBadge>,
        }))
        .catch(() => ({ territorialRegions: [], techCatalog: {} }));
    }
    return this.cache;
  }
}
