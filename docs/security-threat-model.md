# Security Threat Model

## Assets

- Catalog integrity.
- Download target safety.
- User trust in direct-download badges.
- Optional ad placement boundaries.
- ChatGPT app tool metadata and structured output.

## Trust Boundaries

- User browser to Next.js app.
- Next.js download resolver to GitHub/Homebrew/official domains.
- macOS app to bundled catalog and external download targets.
- ChatGPT host to MCP server and widget iframe.

## Main Risks

- A catalog entry points to a malicious or community-gated URL.
- A GitHub release asset regex matches the wrong file.
- The website appears to endorse stale or abandoned apps.
- Optional ads become visually dominant or confusing.
- Widget CSP is too broad.

## Mitigations Implemented

- Blocked host list for Discord, social networks, shorteners, and patronage pages.
- Download resolution is read-only and never executes installers.
- GitHub/Homebrew downloads are resolved from official APIs.
- EthicalAds slot is hidden until configured.
- ChatGPT tools are read-only with tool annotations.
- Widget CSP allows only required resource hosts.

## Follow-Up Hardening

- Add checksum display where upstream provides checksums.
- Add release freshness score.
- Add human review queue for catalog submissions.
- Add CI diff review for changed resolver targets.

