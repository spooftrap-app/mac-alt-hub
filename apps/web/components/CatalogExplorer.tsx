"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Command,
  Download,
  ExternalLink,
  GitCompare,
  Search,
  ShieldCheck,
  X
} from "lucide-react";
import {
  directDownloadPath,
  downloadLabel,
  iconUrl,
  searchCatalog,
  type CatalogApp,
  type CategorySummary
} from "@macalthub/catalog";
import { useEffect, useMemo, useState } from "react";
import { AdSlot } from "./ads/AdSlot";

type Props = {
  apps: CatalogApp[];
  categories: CategorySummary[];
  featured: CatalogApp[];
};

function AppIcon({ app }: { app: CatalogApp }) {
  return (
    <span className="app-icon" style={{ background: app.accent }}>
      <img src={iconUrl(app)} alt="" loading="lazy" />
    </span>
  );
}

function AppCard({
  app,
  selected,
  onToggleCompare
}: {
  app: CatalogApp;
  selected: boolean;
  onToggleCompare: (id: string) => void;
}) {
  return (
    <motion.article
      className="app-card"
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
    >
      <div className="app-card-head">
        <AppIcon app={app} />
        <button
          aria-label={selected ? `Remove ${app.name} from compare` : `Compare ${app.name}`}
          className={selected ? "icon-button selected" : "icon-button"}
          onClick={() => onToggleCompare(app.id)}
          title={selected ? "Remove from compare" : "Compare"}
        >
          {selected ? <Check size={16} /> : <GitCompare size={16} />}
        </button>
      </div>
      <div className="app-card-copy">
        <div>
          <p className="category-label">{app.category}</p>
          <h3>{app.name}</h3>
        </div>
        <p>{app.tagline}</p>
      </div>
      <div className="paid-row">
        <span>Replaces</span>
        <strong>{app.paidAlternatives.slice(0, 2).join(", ")}</strong>
      </div>
      <div className="badge-row">
        {app.badges.slice(0, 3).map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
      <div className="card-actions">
        <a href={directDownloadPath(app)} className="download-link">
          <Download size={15} />
          Download
        </a>
        <Link href={`/apps/${app.id}`} className="details-link">
          Details
        </Link>
      </div>
    </motion.article>
  );
}

function CommandPalette({
  apps,
  open,
  onClose,
  onPick
}: {
  apps: CatalogApp[];
  open: boolean;
  onClose: () => void;
  onPick: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCatalog(query).slice(0, 8), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="palette-input">
              <Search size={18} />
              <input
                autoFocus
                placeholder="Search alternatives, paid apps, categories..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button aria-label="Close search" onClick={onClose}>
                <X size={17} />
              </button>
            </div>
            <div className="palette-results">
              {results.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onPick(app.name);
                    onClose();
                  }}
                >
                  <AppIcon app={app} />
                  <span>
                    <strong>{app.name}</strong>
                    <small>{app.paidAlternatives.join(", ")}</small>
                  </span>
                </button>
              ))}
              {!results.length ? <p className="empty-copy">No match yet. Try a paid app name.</p> : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CompareTray({
  apps,
  onRemove,
  onClear
}: {
  apps: CatalogApp[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <AnimatePresence>
      {apps.length ? (
        <motion.aside
          className="compare-tray"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 22 }}
        >
          <div>
            <strong>Compare tray</strong>
            <span>{apps.length}/3 selected</span>
          </div>
          <div className="compare-icons">
            {apps.map((app) => (
              <button key={app.id} onClick={() => onRemove(app.id)} title={`Remove ${app.name}`}>
                <AppIcon app={app} />
              </button>
            ))}
          </div>
          <button className="secondary-compact" onClick={onClear}>
            Clear
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export function CatalogExplorer({ apps, categories, featured }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const filteredApps = useMemo(() => searchCatalog(query, category), [query, category]);
  const comparedApps = useMemo(
    () => apps.filter((app) => compareIds.includes(app.id)),
    [apps, compareIds]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((candidate) => candidate !== id);
      }
      return [...current, id].slice(-3);
    });
  }

  return (
    <>
      <section className="app-shell">
        <aside className="sidebar">
          <div className="traffic-lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-lockup">
            <img className="brand-mark" src="/assets/macalthub-mark.svg" alt="" />
            <div>
              <strong>MacAltHub</strong>
              <span>Paid app alternatives</span>
            </div>
          </div>
          <nav className="category-nav" aria-label="Catalog categories">
            <button className={category === "All" ? "active" : ""} onClick={() => setCategory("All")}>
              <span>All apps</span>
              <strong>{apps.length}</strong>
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                className={category === item.label ? "active" : ""}
                onClick={() => setCategory(item.label)}
              >
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </button>
            ))}
          </nav>
        </aside>

        <section className="catalog-surface">
          <header className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search apps, paid alternatives, categories..."
              />
            </div>
            <button className="command-button" onClick={() => setPaletteOpen(true)}>
              <Command size={16} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
          </header>

          <section className="hero-panel">
            <div className="hero-copy">
              <h1>Direct-download alternatives for paid Mac utilities.</h1>
              <p>
                Search {apps.length} macOS apps with source, license, architecture, category, and
                trust signals visible before you click download.
              </p>
              <div className="hero-trust">
                <span>
                  <ShieldCheck size={16} />
                  No Discord gates
                </span>
                <span>
                  <BadgeCheck size={16} />
                  Verified source routes
                </span>
                <span>
                  <Download size={16} />
                  Direct resolver
                </span>
              </div>
            </div>
            <motion.div
              className="hero-stack"
              animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              {featured.slice(0, 6).map((app, index) => (
                <Link
                  href={`/apps/${app.id}`}
                  key={app.id}
                  className="mini-feature"
                  style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}
                >
                  <AppIcon app={app} />
                  <span>{app.name}</span>
                </Link>
              ))}
            </motion.div>
          </section>

          <section className="proof-strip" aria-label="Catalog quality summary">
            <div>
              <strong>{apps.length}</strong>
              <span>curated Mac utilities</span>
            </div>
            <div>
              <strong>{categories.length}</strong>
              <span>workflow categories</span>
            </div>
            <div>
              <strong>0</strong>
              <span>Discord-gated download CTAs</span>
            </div>
            <div>
              <strong>3</strong>
              <span>compare slots per tray</span>
            </div>
          </section>

          <AdSlot />

          {comparedApps.length >= 2 ? (
            <section className="comparison-table">
              <div className="section-title">
                <GitCompare size={18} />
                <h2>Comparison</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>App</th>
                      <th>Replaces</th>
                      <th>License</th>
                      <th>Architecture</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparedApps.map((app) => (
                      <tr key={app.id}>
                        <td>{app.name}</td>
                        <td>{app.paidAlternatives.slice(0, 2).join(", ")}</td>
                        <td>{app.license}</td>
                        <td>{app.architecture.join(", ")}</td>
                        <td>
                          <a href={directDownloadPath(app)}>{downloadLabel(app)}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="catalog-header">
            <div>
              <p className="category-label">{category}</p>
              <h2>{filteredApps.length} verified alternatives</h2>
            </div>
            <p>
              Every card shows what it replaces, why it is trusted, and where the download resolves.
            </p>
          </section>

          <motion.div className="app-grid" layout>
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app) => (
                <AppCard
                  app={app}
                  key={app.id}
                  selected={compareIds.includes(app.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      </section>

      <CommandPalette
        apps={apps}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPick={(value) => setQuery(value)}
      />
      <CompareTray
        apps={comparedApps}
        onRemove={(id) => setCompareIds((current) => current.filter((candidate) => candidate !== id))}
        onClear={() => setCompareIds([])}
      />
    </>
  );
}
