export const TEMPLATE_URI = "ui://widget/macalthub-catalog-v1.html";

export const widgetHtml = `
<div id="root" class="macalthub-widget">
  <header>
    <div>
      <strong>MacAltHub</strong>
      <span>Verified Mac app alternatives</span>
    </div>
    <button id="fullscreen" title="Open larger view">Expand</button>
  </header>
  <main id="content"></main>
</div>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif; }
  .macalthub-widget { padding: 14px; color: #111827; background: #f5f7fb; min-height: 100%; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
  header strong, header span { display: block; }
  header strong { font-size: 15px; }
  header span { color: #667085; font-size: 12px; margin-top: 1px; }
  button { border: 1px solid rgba(17,24,39,.12); border-radius: 8px; background: white; color: #111827; min-height: 32px; padding: 0 10px; font: inherit; cursor: pointer; }
  .grid { display: grid; gap: 8px; }
  .card { border: 1px solid rgba(17,24,39,.1); background: rgba(255,255,255,.86); border-radius: 8px; padding: 12px; }
  .card h3 { margin: 0 0 4px; font-size: 15px; }
  .card p { margin: 0; color: #475467; line-height: 1.4; font-size: 13px; }
  .meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .meta span { border-radius: 7px; background: rgba(10,132,255,.09); color: #1d4f84; padding: 4px 7px; font-size: 11px; }
  .empty { color: #667085; padding: 18px 0; }
  @media (prefers-color-scheme: dark) {
    .macalthub-widget { background: #101318; color: #f8fafc; }
    .card, button { background: #171b22; color: #f8fafc; border-color: rgba(255,255,255,.12); }
    .card p, header span, .empty { color: #a5adba; }
    .meta span { background: rgba(10,132,255,.22); color: #93c5fd; }
  }
</style>
<script>
  const content = document.getElementById("content");
  const fullscreen = document.getElementById("fullscreen");

  function normalizePayload(payload) {
    if (!payload) return [];
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.apps)) return payload.apps;
    if (payload.app) return [payload.app];
    return [];
  }

  function render(payload) {
    const apps = normalizePayload(payload);
    if (!apps.length) {
      content.innerHTML = '<p class="empty">Ask ChatGPT to search for a paid Mac app or category, like "alternatives to Bartender" or "dictation apps like Wspr".</p>';
      return;
    }

    content.innerHTML = '<div class="grid">' + apps.map((app) => {
      const badges = [...(app.badges || []), ...(app.trust || [])].slice(0, 4);
      return '<article class="card">' +
        '<h3>' + escapeHtml(app.name) + '</h3>' +
        '<p>' + escapeHtml(app.tagline || '') + '</p>' +
        '<p><strong>Replaces:</strong> ' + escapeHtml((app.paidAlternatives || []).join(", ")) + '</p>' +
        '<div class="meta">' + badges.map((badge) => '<span>' + escapeHtml(badge) + '</span>').join('') + '</div>' +
      '</article>';
    }).join('') + '</div>';
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  render(window.openai?.toolOutput);
  window.addEventListener("openai:set_globals", (event) => {
    render(event.detail?.globals?.toolOutput ?? window.openai?.toolOutput);
  }, { passive: true });
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method === "ui/notifications/tool-result") render(message.params?.structuredContent);
  }, { passive: true });
  fullscreen.onclick = () => window.openai?.requestDisplayMode?.({ mode: "fullscreen" });
</script>
`.trim();

