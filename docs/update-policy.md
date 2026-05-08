# Update Policy

MacAltHub supports versioned release metadata from `content/releases/macalthub-appcast.json`.

## Current Behavior

- The macOS app reads bundled `version.json` and `appcast.json`.
- It checks for newer versions on the catalog home.
- If a newer version exists, it opens the release URL.
- It never executes installers automatically.

## Production Auto-Update Path

To enable full automatic installation:

1. Add Sparkle to the macOS target.
2. Generate EdDSA signing keys.
3. Host the appcast JSON or Sparkle XML on a stable HTTPS domain.
4. Add `sha256` and `signature` to every release entry.
5. Update the Settings feed URL to the hosted feed.
6. Keep GitHub Actions release artifacts attached to version tags.

This avoids fake "auto update" behavior while keeping the app ready for proper signed updates.

