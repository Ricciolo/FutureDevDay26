import { getRecentLogs as fetchLogs } from "../data/repository.js";
import { createTextContent, createErrorContent } from "../protocol/mcpTypes.js";
export const definition = {
    name: "support_get_recent_logs",
    description: "Recupera estratti di log applicativi recenti del cliente, opzionalmente filtrati per modulo. Utile per individuare errori, eccezioni e stack trace correlati al ticket.",
    inputSchema: {
        type: "object",
        properties: {
            customerId: {
                type: "string",
                description: "ID del cliente (es. CUST-ROSSI)",
            },
            module: {
                type: "string",
                description: "Modulo da usare come filtro sulle righe di log (es. Billing, Orders)",
            },
            maxLines: {
                type: "number",
                description: "Numero massimo di righe di log da restituire (default: 50)",
            },
        },
        required: ["customerId"],
    },
};
export async function call(args) {
    const customerId = args["customerId"];
    if (typeof customerId !== "string" || !customerId.trim()) {
        return createErrorContent("Input non valido: customerId deve essere una stringa non vuota.");
    }
    const module = typeof args["module"] === "string" ? args["module"] : undefined;
    const maxLines = typeof args["maxLines"] === "number" ? args["maxLines"] : undefined;
    const result = await fetchLogs(customerId.trim(), module, maxLines);
    return createTextContent(JSON.stringify(result, null, 2));
}
