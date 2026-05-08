# MacAltHub Automation

MacAltHub uses GitHub Actions plus Vercel project settings for recurring checks and release publishing.

## Scheduled Catalog Verification

Workflow: `.github/workflows/catalog.yml`

- Runs every day at 08:27 UTC.
- Runs on catalog package changes and manual dispatch.
- Validates schema, duplicate IDs, banned download hosts, stale metadata, redirect rules, and direct-download provenance.

## Web CI

Workflow: `.github/workflows/web.yml`

- Runs on pushes and pull requests touching the web app, catalog, design tokens, or scripts.
- Installs Node 22 dependencies.
- Runs release metadata prep, typecheck, tests, production build, smoke checks, and Playwright screenshots.
- Uploads screenshots from `docs/screenshots`.

## Release CI

Workflow: `.github/workflows/release.yml`

- Runs for tags matching `v*.*.*` and manual dispatch.
- Builds the full monorepo.
- Builds and packages the macOS app.
- Generates `MacAltHub-<version>.zip`, SHA-256 checksum, appcast, and release manifest.
- Uploads the release bundle as a workflow artifact.

## Dependabot

Config: `.github/dependabot.yml`

- Checks npm workspaces weekly.
- Checks GitHub Actions weekly.
- Keeps dependency maintenance visible without interrupting catalog work daily.

## Local Operator Automation

Use these scripts before publishing:

```bash
npm run release:prepare
npm run typecheck
npm test
npm run build
npm run smoke:web
npm run screenshots:web
npm run release:package
```

Use `MACALTHUB_BASE_URL` to point smoke and screenshots at preview or production:

```bash
MACALTHUB_BASE_URL=https://your-preview.vercel.app npm run smoke:web
MACALTHUB_BASE_URL=https://your-preview.vercel.app npm run screenshots:web
```

## Monitoring Hooks To Add After Launch

- Vercel Analytics or Speed Insights for Core Web Vitals.
- GitHub scheduled issue if catalog verification fails repeatedly.
- Uptime check against `/`, `/apps/rectangle`, and `/api/download/rectangle`.
- EthicalAds dashboard check once `NEXT_PUBLIC_ETHICALADS_PUBLISHER` is live.
