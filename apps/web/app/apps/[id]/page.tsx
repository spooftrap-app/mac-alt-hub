import Link from "next/link";
import { notFound } from "next/navigation";
import {
  catalog,
  directDownloadPath,
  downloadLabel,
  getAppById,
  iconUrl,
  type CatalogApp
} from "@macalthub/catalog";
import { ArrowLeft, BadgeCheck, Download, ExternalLink, GitCompare, ShieldCheck } from "lucide-react";

export function generateStaticParams() {
  return catalog.map((app) => ({ id: app.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getAppById(id);
  if (!app) {
    return {};
  }

  return {
    title: `${app.name} - MacAltHub`,
    description: `${app.name}: ${app.tagline}`
  };
}

function SimilarApps({ app }: { app: CatalogApp }) {
  const alternatives = catalog
    .filter((candidate) => candidate.id !== app.id && candidate.category === app.category)
    .slice(0, 6);

  return (
    <section className="detail-section">
      <h2>More in {app.category}</h2>
      <div className="similar-grid">
        {alternatives.map((candidate) => (
          <Link className="similar-card" key={candidate.id} href={`/apps/${candidate.id}`}>
            <img src={iconUrl(candidate)} alt="" />
            <span>{candidate.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getAppById(id);
  if (!app) {
    notFound();
  }

  return (
    <main className="detail-shell">
      <nav className="detail-nav">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} />
          Catalog
        </Link>
      </nav>

      <article className="detail-hero">
        <div className="detail-icon" style={{ background: app.accent }}>
          <img src={iconUrl(app)} alt="" />
        </div>
        <div className="detail-copy">
          <p className="detail-category">{app.category}</p>
          <h1>{app.name}</h1>
          <p>{app.tagline}</p>
          <div className="detail-actions">
            <a className="primary-button" href={directDownloadPath(app)}>
              <Download size={17} />
              {downloadLabel(app)}
            </a>
            <a className="secondary-button" href={app.homepage} target="_blank" rel="noreferrer">
              <ExternalLink size={17} />
              Official site
            </a>
          </div>
        </div>
      </article>

      <section className="detail-panel">
        <div>
          <span className="panel-label">Replaces</span>
          <strong>{app.paidAlternatives.join(", ")}</strong>
        </div>
        <div>
          <span className="panel-label">License</span>
          <strong>{app.license}</strong>
        </div>
        <div>
          <span className="panel-label">Price</span>
          <strong>{app.price}</strong>
        </div>
        <div>
          <span className="panel-label">Architecture</span>
          <strong>{app.architecture.join(", ")}</strong>
        </div>
      </section>

      <section className="detail-section">
        <h2>Trust signals</h2>
        <div className="trust-list">
          {app.trust.map((item) => (
            <span key={item}>
              <ShieldCheck size={16} />
              {item}
            </span>
          ))}
          {app.badges.map((badge) => (
            <span key={badge}>
              <BadgeCheck size={16} />
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>Why it belongs here</h2>
        <p>{app.notes}</p>
      </section>

      <section className="detail-section comparison-strip">
        <GitCompare size={18} />
        <p>
          Compare {app.name} against {app.paidAlternatives[0]} and nearby alternatives from the
          catalog homepage.
        </p>
      </section>

      <SimilarApps app={app} />
    </main>
  );
}

