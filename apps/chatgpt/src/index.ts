import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMacAltHubServer } from "./server.js";

const port = Number(process.env.PORT ?? 8787);
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "macalthub", endpoint: "/mcp" });
});

app.post("/mcp", async (req, res) => {
  const server = createMacAltHubServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(port, () => {
  console.log(`MacAltHub MCP server listening on http://localhost:${port}/mcp`);
});

