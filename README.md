# MacAltHub

MacAltHub is a macOS-style hub for finding trusted alternatives to paid Mac utilities. It ships as a public website, a native SwiftUI macOS app, and a ChatGPT app backed by the same catalog.

## What Is Included

- `apps/web` - Next.js catalog website with search, filters, comparison, subtle motion, and direct download resolution.
- `apps/macos` - SwiftUI `NavigationSplitView` app with saved apps, compare tray, and native download resolution.
- `apps/chatgpt` - Apps SDK MCP server and widget scaffold for searching and comparing alternatives in ChatGPT.
- `packages/catalog` - Shared typed catalog, validation, search, compare, and download safety helpers.
- `packages/design` - Shared design tokens.
- `docs` - Launch plan, design system, privacy policy, data/source policy, deck outline, security notes, and marketing briefs.
- `scripts` - Catalog verification, macOS data sync, and launch artifact generation.

## Quick Start

```bash
npm install
npm run sync:macos
npm run typecheck
npm run build
npm run dev
```

Run the macOS app:

```bash
npm run macos:run
```

Verify the catalog:

```bash
npm run verify:catalog
```

Prepare a versioned release:

```bash
npm run release:prepare
npm run version:check
```

Smoke-test the running website:

```bash
npm run smoke:web
```

## Direct Download Policy

MacAltHub never treats Discord, social posts, opaque shorteners, or invite-gated communities as download targets. Download CTAs are resolved from official project sites, GitHub release assets, Homebrew Cask URLs, or clearly labeled source/release pages.

## Optional Ads

The website includes a single restrained EthicalAds-compatible slot. It renders a live EthicalAds placement when `NEXT_PUBLIC_ETHICALADS_PUBLISHER` is configured, and a quiet sponsor-ready fallback otherwise.

## Versioning And Updates

Version metadata lives in `VERSION`, `CHANGELOG.md`, and `content/releases/macalthub-appcast.json`. The macOS app checks this feed and opens release URLs for updates. Full signed install updates should be enabled through Sparkle once signing keys and a hosted appcast are available.
