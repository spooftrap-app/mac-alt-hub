# MacAltHub Release Checklist

## Versioning

1. Update `VERSION`.
2. Add an entry to `CHANGELOG.md`.
3. Run `npm run release:prepare`.
4. Commit changes and tag with `v<version>`.

## Quality Gates

```bash
npm run version:check
npm run typecheck
npm test
npm run build
npm run sync:macos
npm run macos:build
npm run smoke:web
```

## Catalog Gates

```bash
npm run verify:catalog
```

Warnings from GitHub rate limiting are acceptable only when the fallback URL is an official release page and not a blocked host.

## macOS Release

```bash
cd apps/macos
BUILD_NUMBER=1 ./script/build_and_run.sh --package-only
ditto -c -k --sequesterRsrc --keepParent dist/MacAltHub.app ../../MacAltHub.app.zip
```

For real automatic install updates, add Sparkle signing keys and replace the placeholder `signature` and `sha256` fields in `content/releases/macalthub-appcast.json`.

## Web Publish

The root `vercel.json` builds the web workspace from the monorepo. The claimable deploy command is:

```bash
bash /Users/28atotten/.codex/skills/vercel-deploy/scripts/deploy.sh /Users/28atotten/Projects/mac-alt-hub
```

If the claimable deployment endpoint returns a build-in-progress response without URLs, push the committed repo to GitHub and connect it to Vercel using:

- Build command: `npm run build -w @macalthub/web`
- Install command: `npm install`
- Output directory: `apps/web/.next`

## Ads

Set `NEXT_PUBLIC_ETHICALADS_PUBLISHER` in Vercel to enable live EthicalAds. Without it, MacAltHub shows a quiet sponsor-ready fallback slot.

