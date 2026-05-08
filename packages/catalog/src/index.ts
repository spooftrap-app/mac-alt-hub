import resolvedCatalog from "../../../content/catalog.resolved.json";

export type DownloadKind = "github-release" | "homebrew-cask" | "official-direct" | "release-page";

export type DownloadResolver =
  | {
      kind: "github-release";
      repo: string;
      assetRegex: string;
      fallbackUrl: string;
    }
  | {
      kind: "homebrew-cask";
      token: string;
      fallbackUrl: string;
    }
  | {
      kind: "official-direct" | "release-page";
      url: string;
    };

export type CatalogApp = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  accent: string;
  paidAlternatives: string[];
  license: string;
  price: string;
  platforms: string[];
  architecture: string[];
  homepage: string;
  source?: string;
  popularity: number;
  badges: string[];
  trust: string[];
  resolver: DownloadResolver;
  resolvedDownload?: {
    kind: DownloadKind;
    url: string;
    label: string;
    source: string;
    verifiedAt: string;
  };
  notes: string;
};

export type CategorySummary = {
  id: string;
  label: string;
  count: number;
};

export const blockedDownloadHosts = [
  "discord.com",
  "discord.gg",
  "x.com",
  "twitter.com",
  "t.me",
  "telegram.me",
  "bit.ly",
  "tinyurl.com",
  "linktr.ee",
  "ko-fi.com",
  "patreon.com"
] as const;

export const catalog = resolvedCatalog as CatalogApp[];

export const categories: CategorySummary[] = Array.from(
  catalog.reduce((map, item) => {
    map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, new Map<string, number>())
)
  .map(([label, count]) => ({
    id: slugify(label),
    label,
    count
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAppById(id: string): CatalogApp | undefined {
  return catalog.find((app) => app.id === id);
}

export function getFeaturedApps(limit = 12): CatalogApp[] {
  return [...catalog].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export function getPaidAlternatives(): string[] {
  return Array.from(new Set(catalog.flatMap((item) => item.paidAlternatives))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function searchCatalog(query: string, category = "All"): CatalogApp[] {
  const normalized = query.trim().toLowerCase();
  return catalog
    .filter((item) => category === "All" || item.category === category)
    .filter((item) => {
      if (!normalized) {
        return true;
      }

      const haystack = [
        item.name,
        item.tagline,
        item.category,
        item.license,
        item.price,
        item.notes,
        ...item.badges,
        ...item.trust,
        ...item.paidAlternatives
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    })
    .sort((a, b) => b.popularity - a.popularity);
}

export function compareApps(ids: string[]): CatalogApp[] {
  const wanted = new Set(ids);
  return catalog.filter((item) => wanted.has(item.id));
}

export function iconUrl(app: CatalogApp): string {
  const hostname = new URL(app.homepage).hostname;
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
}

export function downloadLabel(app: CatalogApp): string {
  if (app.resolver.kind === "github-release") {
    return "Download latest release";
  }

  if (app.resolver.kind === "homebrew-cask") {
    return "Download verified cask";
  }

  if (app.resolver.kind === "official-direct") {
    return "Download from official site";
  }

  return "Open release page";
}

export function directDownloadPath(app: CatalogApp): string {
  return app.resolvedDownload?.url ?? fallbackDownloadUrl(app);
}

export function fallbackDownloadUrl(app: CatalogApp): string {
  if (app.resolver.kind === "github-release" || app.resolver.kind === "homebrew-cask") {
    return app.resolver.fallbackUrl;
  }

  return app.resolver.url;
}

export function isBlockedDownloadUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return blockedDownloadHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return true;
  }
}

export function validateCatalog(items: CatalogApp[] = catalog): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      errors.push(`Duplicate app id: ${item.id}`);
    }
    ids.add(item.id);

    if (!item.name || !item.category || !item.homepage) {
      errors.push(`${item.id} is missing required display fields`);
    }

    if (!item.paidAlternatives.length) {
      errors.push(`${item.id} should name at least one paid alternative`);
    }

    const candidate =
      item.resolver.kind === "github-release" || item.resolver.kind === "homebrew-cask"
        ? item.resolver.fallbackUrl
        : item.resolver.url;

    if (isBlockedDownloadUrl(candidate)) {
      errors.push(`${item.id} has a blocked or invalid download target: ${candidate}`);
    }
  }

  return errors;
}
