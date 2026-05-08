import { catalog, categories, getFeaturedApps } from "@macalthub/catalog";
import { CatalogExplorer } from "../components/CatalogExplorer";

export default function HomePage() {
  return (
    <main>
      <CatalogExplorer apps={catalog} categories={categories} featured={getFeaturedApps(10)} />
    </main>
  );
}

