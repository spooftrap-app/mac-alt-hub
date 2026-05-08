# MacAltHub Release Checklist

Use this as the launch-room checklist for every public release.

## 1. Version And Catalog

- [ ] Update `VERSION`.
- [ ] Add the release notes to `CHANGELOG.md`.
- [ ] Update or add catalog entries in `content/catalog.seed.json`.
- [ ] Run `npm run release:prepare`.
- [ ] Confirm `content/releases/macalthub-appcast.json` and `dist/release-manifest.json` changed as expected.

## 2. Quality Gates

```bash
npm run verify:catalog
npm run version:check
npm run typecheck
npm test
npm run build
npm run build:static
npm run macos:build
```

Warnings from GitHub rate limiting are acceptable only when the fallback URL is an official release page and not a blocked host.

## 3. Running App Checks

Start the web app, then run smoke checks and capture screenshots:

```bash
npm run dev
npm run smoke:web
npm run screenshots:web
```

Run the macOS app smoke:

```bash
cd apps/macos
./script/build_and_run.sh --verify
```

Check these visual states:

- [ ] Homepage catalog loads with the sidebar, search, hero, ad/sponsor slot, and app cards.
- [ ] Mobile homepage does not overlap text or controls.
- [ ] Detail page shows trusted download, source, architecture, and similar apps.
- [ ] macOS app opens to Catalog Home, then search/detail/download flows work.

## 4. Package macOS

```bash
npm run release:package
```

This creates:

- `dist/MacAltHub-<version>.zip`
- `dist/MacAltHub-<version>.zip.sha256`
- refreshed `content/releases/macalthub-appcast.json`
- refreshed `dist/release-manifest.json`

The current updater opens a verified release URL and never executes installers. For fully automatic in-app install updates, add Sparkle signing keys, notarization, and signed appcast signatures.

## 5. Publish

- [ ] Commit release changes.
- [ ] Tag with `v<version>`.
- [ ] Push `main` and the version tag.
- [ ] Create or update the GitHub release with the zip, checksum, appcast, and manifest.
- [ ] Confirm `.github/workflows/pages.yml` deployed GitHub Pages.
- [ ] Deploy `apps/web/out` to Cloudflare with `npm run publish:cloudflare` if Cloudflare is connected.
- [ ] Set `NEXT_PUBLIC_ETHICALADS_PUBLISHER` in the chosen web host when EthicalAds approves the publisher ID.
- [ ] Run `MACALTHUB_BASE_URL=<production-url> npm run smoke:web`.
- [ ] Run `MACALTHUB_BASE_URL=<production-url> npm run screenshots:web`.

Publishing details live in `docs/publishing.md`; recurring automation details live in `docs/automation.md`.
