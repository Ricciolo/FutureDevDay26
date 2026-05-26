import { searchKnownIssues as search } from "../data/repository.js";
import type { McpToolDefinition, McpToolCallResult } from "../protocol/mcpTypes.js";
import { createTextContent, createErrorContent } from "../protocol/mcpTypes.js";

export const definition: McpToolDefinition = {
  name: "support_search_known_issues",
  description:
    "Cerca problemi noti e regressioni note nel database dei known issues. Filtra per modulo, versione installata e parole chiave dalla descrizione del ticket.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Parole chiave di ricerca estratte dalla descrizione del ticket (es. 'pdf rendering layout invoice')",
      },
      module: {
        type: "string",
        description:
          "Modulo software da filtrare (es. Billing, Orders, Reporting, ImportExport)",
      },
      version: {
        type: "string",
        description: "Versione software installata (es. 4.8.2)",
      },
    },
    required: ["query"],
  },
};

export async function call(
  args: Record<string, unknown>
): Promise<McpToolCallResult> {
  const query = args["query"];
  if (typeof query !== "string" || !query.trim()) {
    return createErrorContent(
      "Input non valido: query deve essere una stringa non vuota."
    );
  }

  const module =
    typeof args["module"] === "string" ? args["module"] : undefined;
  const version =
    typeof args["version"] === "string" ? args["version"] : undefined;

  const matches = await search(query.trim(), module, version);
  return createTextContent(JSON.stringify({ matches }, null, 2));
}
