# Data And Source Policy

## Inclusion Criteria

MacAltHub prioritizes macOS utilities that are:

- Useful replacements for a named paid app or paid feature set.
- Available from an official project site, GitHub release, or Homebrew Cask.
- Not gated behind Discord, Telegram, social posts, opaque shorteners, or invite-only communities.
- Clearly labeled by license and price.

## Download Verification

`npm run verify:catalog` resolves downloads in this order:

1. GitHub release asset matching the app's regex.
2. Homebrew Cask URL.
3. Official direct URL or release page.

Resolved URLs are checked against blocked community and shortener hosts.

## Staleness

Apps with failing release resolution remain visible only with a fallback warning in `content/catalog.resolved.json`. A future production gate should hide apps with repeated failures older than 30 days.

## Corrections

Catalog corrections should update `content/catalog.seed.json`, then run:

```bash
npm run verify:catalog
npm run sync:macos
```

