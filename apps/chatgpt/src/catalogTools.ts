import { catalog, compareApps, getAppById, searchCatalog, type CatalogApp } from "@macalthub/catalog";

export type SearchInput = {
  query?: string;
  category?: string;
  paidApp?: string;
  limit?: number;
};

export type AppSummary = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  paidAlternatives: string[];
  license: string;
  price: string;
  homepage: string;
  badges: string[];
  trust: string[];
};

export function toSummary(app: CatalogApp): AppSummary {
  return {
    id: app.id,
    name: app.name,
    tagline: app.tagline,
    category: app.category,
    paidAlternatives: app.paidAlternatives,
    license: app.license,
    price: app.price,
    homepage: app.homepage,
    badges: app.badges,
    trust: app.trust
  };
}

export function searchAlternatives(input: SearchInput): AppSummary[] {
  const query = [input.query, input.paidApp].filter(Boolean).join(" ");
  const category = input.category && input.category !== "All" ? input.category : "All";
  return searchCatalog(query, category).slice(0, input.limit ?? 8).map(toSummary);
}

export function appDetail(id: string): AppSummary | undefined {
  const app = getAppById(id);
  return app ? toSummary(app) : undefined;
}

export function compareAlternatives(ids: string[]): AppSummary[] {
  return compareApps(ids.slice(0, 4)).map(toSummary);
}

export function catalogStats() {
  return {
    totalApps: catalog.length,
    categories: Array.from(new Set(catalog.map((app) => app.category))).sort(),
    popularPaidAlternatives: Array.from(new Set(catalog.flatMap((app) => app.paidAlternatives))).slice(0, 40)
  };
}

