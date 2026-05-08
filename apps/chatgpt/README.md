# MacAltHub ChatGPT App

This package exposes MacAltHub as a read-only Apps SDK MCP server.

## Tools

- `search_alternatives` - Search by paid app, free app, category, or need.
- `get_app_detail` - Fetch trust, license, price, homepage, and replacement info by app id.
- `compare_apps` - Compare two to four app ids side by side.

## Local Run

```bash
npm run dev -w @macalthub/chatgpt
```

The MCP endpoint is available at `http://localhost:8787/mcp`.

## Apps SDK Notes

The server follows the OpenAI Apps SDK guidance for:

- `registerAppResource` with `RESOURCE_MIME_TYPE`
- `_meta.ui.resourceUri` and `openai/outputTemplate`
- read-only tool annotations
- a component CSP that allows only the favicon resource host

