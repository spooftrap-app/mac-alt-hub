# ChatGPT App Submission Notes

## App Name

MacAltHub

## Description

Find verified alternatives to paid macOS utility apps, compare them, and inspect trust signals before downloading.

## Tool Justification

- `search_alternatives`: lets ChatGPT answer "what can replace paid app X?" with catalog-backed results.
- `get_app_detail`: lets ChatGPT inspect license, price, trust badges, and official source for a specific result.
- `compare_apps`: supports side-by-side decision making.

## Data Handling

The app is read-only and does not require authentication. Tool results return catalog metadata only.

## Widget

The widget renders search and comparison results using MCP Apps UI. It does not embed subframes and only allows the favicon resource host for images.

