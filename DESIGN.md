# MacAltHub Design System

## Visual Direction

MacAltHub should feel like a calm native macOS catalog: glassy but not gimmicky, dense enough for utility discovery, and more App Store/library than SaaS landing page.

## Tokens

- Background: `#f5f7fb`
- Ink: `#111827`
- Secondary ink: `#667085`
- Separator: `rgba(17, 24, 39, 0.11)`
- Surface: `rgba(255, 255, 255, 0.72)`
- Elevated surface: `rgba(255, 255, 255, 0.88)`
- Blue: `#0a84ff`
- Green: `#30d158`
- Orange: `#ff9f0a`
- Pink: `#ff375f`
- Violet: `#8e52ff`

## Typography

- UI: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, sans-serif
- Display: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, sans-serif
- Letter spacing stays at `0`.

## Component Rules

- App tiles use 8px radius or less for cards and 18-22px for app icons.
- Badges are compact and information-bearing only: verified download, open source, universal binary, Homebrew, privacy.
- The catalog is list/grid-first, not a marketing hero-first page.
- Motion should clarify state changes: command palette, filter transitions, tile hover, compare tray, and download safety feedback.
- Respect `prefers-reduced-motion`.

