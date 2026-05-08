# MacAltHub Figma Design System

## Pages

1. Cover
2. Tokens
3. Components
4. Website Screens
5. macOS App Screens
6. ChatGPT Widget
7. Marketing Assets

## Tokens

- `color/background` - `#F5F7FB`
- `color/ink` - `#111827`
- `color/muted` - `#667085`
- `color/line` - `rgba(17, 24, 39, 0.11)`
- `color/surface` - `rgba(255, 255, 255, 0.72)`
- `color/blue` - `#0A84FF`
- `color/green` - `#30D158`
- `color/orange` - `#FF9F0A`
- `color/pink` - `#FF375F`
- `radius/tile` - `8`
- `radius/icon` - `20`
- `shadow/tile` - `0 18 50 rgba(17, 24, 39, 0.08)`

## Components

- App icon: rounded square, favicon/image center, tokenized accent background.
- App tile: icon, compare button, category label, name, tagline, paid alternative row, badges, actions.
- Category row: native sidebar density, title plus count.
- Download button: blue filled button with `Download` icon.
- Trust badge: compact token with check/seal icon and useful text only.
- Compare tray: translucent floating bar with selected icons and clear action.
- Detail hero: large icon, category, title, tagline, download and official site actions.
- ChatGPT widget card: compact result card with replacement, license, badges.

## Key Screens

- Website: catalog homepage at desktop, mobile, app detail, command palette, compare table.
- macOS app: launch window, filtered results, detail pane, compare tray, settings.
- ChatGPT app: default empty widget, search results, comparison results.

## Implementation Mapping

- Web tokens live in `apps/web/app/globals.css`.
- Shared JS tokens live in `packages/design/src/index.ts`.
- SwiftUI adapts tokens via semantic materials plus `Color(hex:)`.
- Icons use `lucide-react` on web and SF Symbols in SwiftUI.

