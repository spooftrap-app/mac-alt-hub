import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  appDetail,
  catalogStats,
  compareAlternatives,
  searchAlternatives
} from "./catalogTools.js";
import { TEMPLATE_URI, widgetHtml } from "./widget.js";

const appSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  category: z.string(),
  paidAlternatives: z.array(z.string()),
  license: z.string(),
  price: z.string(),
  homepage: z.string(),
  badges: z.array(z.string()),
  trust: z.array(z.string())
});

export function createMacAltHubServer() {
  const server = new McpServer({ name: "macalthub", version: "0.1.0" });

  registerAppResource(server, "macalthub-catalog", TEMPLATE_URI, {}, async () => ({
    contents: [
      {
        uri: TEMPLATE_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: widgetHtml,
        _meta: {
          ui: {
            prefersBorder: true,
            csp: {
              connectDomains: [],
              resourceDomains: ["https://www.google.com"]
            }
          },
          "openai/widgetDescription":
            "A compact MacAltHub widget that displays verified alternatives to paid macOS utilities."
        }
      }
    ]
  }));

  registerAppTool(
    server,
    "search_alternatives",
    {
      title: "Search Mac alternatives",
      description:
        "Use this when the user wants alternatives to a paid macOS utility, a category of Mac apps, or a direct-download replacement.",
      inputSchema: {
        query: z.string().optional(),
        category: z.string().optional(),
        paidApp: z.string().optional(),
        limit: z.number().int().min(1).max(12).optional()
      },
      outputSchema: {
        results: z.array(appSummarySchema),
        totalApps: z.number().int(),
        categories: z.array(z.string())
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      },
      _meta: {
        ui: { resourceUri: TEMPLATE_URI },
        "openai/outputTemplate": TEMPLATE_URI,
        "openai/toolInvocation/invoking": "Searching MacAltHub...",
        "openai/toolInvocation/invoked": "Alternatives ready"
      }
    },
    async (input) => {
      const stats = catalogStats();
      const results = searchAlternatives(input);
      return {
        structuredContent: {
          results,
          totalApps: stats.totalApps,
          categories: stats.categories
        },
        content: [
          {
            type: "text",
            text: results.length
              ? `Found ${results.length} MacAltHub alternatives.`
              : "No matching alternatives found in the current MacAltHub catalog."
          }
        ]
      };
    }
  );

  registerAppTool(
    server,
    "get_app_detail",
    {
      title: "Get app detail",
      description:
        "Use this when the user asks for details, trust signals, license, price, or official source information for a specific MacAltHub app id.",
      inputSchema: {
        id: z.string()
      },
      outputSchema: {
        app: appSummarySchema.optional()
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      },
      _meta: {
        ui: { resourceUri: TEMPLATE_URI },
        "openai/outputTemplate": TEMPLATE_URI,
        "openai/toolInvocation/invoking": "Opening app detail...",
        "openai/toolInvocation/invoked": "App detail ready"
      }
    },
    async ({ id }) => {
      const app = appDetail(id);
      return {
        structuredContent: { app },
        content: [
          {
            type: "text",
            text: app ? `${app.name} replaces ${app.paidAlternatives.join(", ")}.` : "App not found."
          }
        ]
      };
    }
  );

  registerAppTool(
    server,
    "compare_apps",
    {
      title: "Compare Mac alternatives",
      description:
        "Use this when the user wants a side-by-side comparison of two to four MacAltHub app ids.",
      inputSchema: {
        ids: z.array(z.string()).min(2).max(4)
      },
      outputSchema: {
        apps: z.array(appSummarySchema)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      },
      _meta: {
        ui: { resourceUri: TEMPLATE_URI },
        "openai/outputTemplate": TEMPLATE_URI,
        "openai/toolInvocation/invoking": "Comparing apps...",
        "openai/toolInvocation/invoked": "Comparison ready"
      }
    },
    async ({ ids }) => {
      const apps = compareAlternatives(ids);
      return {
        structuredContent: { apps },
        content: [
          {
            type: "text",
            text: `Comparing ${apps.map((app) => app.name).join(", ")}.`
          }
        ]
      };
    }
  );

  return server;
}

export default createMacAltHubServer();

