# MacAltHub Publishing Guide

This guide is the operator path for publishing MacAltHub across the website, macOS app, ChatGPT app, and launch materials.

## Release Inputs

- Version source: `VERSION`
- Changelog: `CHANGELOG.md`
- Website config: `vercel.json`
- macOS appcast: `content/releases/macalthub-appcast.json`
- Release manifest: `dist/release-manifest.json`
- GitHub workflows: `.github/workflows/catalog.yml`, `.github/workflows/web.yml`, `.github/workflows/release.yml`

## Web Publish

Vercel is the expected host.

```bash
npm run release:prepare
npm run typecheck
npm test
npm run build
npm run smoke:web
npm run screenshots:web
npx vercel --yes
```

For production:

```bash
npx vercel --prod --yes
```

Set these Vercel environment variables when available:

- `NEXT_PUBLIC_ETHICALADS_PUBLISHER`: enables the live EthicalAds slot.
- `NEXT_PUBLIC_SITE_URL`: canonical production URL.

The ad component renders a quiet sponsor-ready fallback until `NEXT_PUBLIC_ETHICALADS_PUBLISHER` exists, so production can ship before ad approval.

## GitHub Publish

The recommended repo target is `spooftrap-app/mac-alt-hub`.

```bash
gh repo create spooftrap-app/mac-alt-hub --private --source=. --remote=origin --push
```

If the repo already exists:

```bash
git remote add origin https://github.com/spooftrap-app/mac-alt-hub.git
git push -u origin main
git push origin v0.1.0
```

## macOS Release

```bash
npm run release:prepare
npm run release:package
gh release create "v$(cat VERSION)" \
  "dist/MacAltHub-$(cat VERSION).zip" \
  "dist/MacAltHub-$(cat VERSION).zip.sha256" \
  "content/releases/macalthub-appcast.json" \
  "dist/release-manifest.json" \
  --title "MacAltHub $(cat VERSION)" \
  --notes-file CHANGELOG.md
```

The appcast uses a direct GitHub release asset URL. The macOS app checks the feed and opens the release URL; it does not execute downloaded installers.

## ChatGPT App Publish Prep

```bash
npm run build -w @macalthub/chatgpt
node apps/chatgpt/dist/server.js
```

Use `apps/chatgpt/chatgpt-app-submission.json` and `docs/chatgpt-app-submission.md` as the submission packet.

## Rollback

1. Revert the Vercel production alias to the previous deployment.
2. Mark the GitHub release as a prerelease or delete the broken asset.
3. Restore the previous `content/releases/macalthub-appcast.json`.
4. Create a patch version and run the full release checklist again.
