import { getCustomerContext as fetchCustomer } from "../data/repository.js";
import type { McpToolDefinition, McpToolCallResult } from "../protocol/mcpTypes.js";
import { createTextContent, createErrorContent } from "../protocol/mcpTypes.js";

export const definition: McpToolDefinition = {
  name: "support_get_customer_context",
  description:
    "Recupera il contesto operativo del cliente: versione software installata, moduli abilitati, personalizzazioni attive e data dell'ultimo deployment.",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "ID del cliente (es. CUST-ROSSI)",
      },
    },
    required: ["customerId"],
  },
};

export async function call(
  args: Record<string, unknown>
): Promise<McpToolCallResult> {
  const customerId = args["customerId"];
  if (typeof customerId !== "string" || !customerId.trim()) {
    return createErrorContent(
      "Input non valido: customerId deve essere una stringa non vuota."
    );
  }

  const customer = await fetchCustomer(customerId.trim());
  if (!customer) {
    return createErrorContent(`Cliente non trovato: ${customerId}`);
  }

  return createTextContent(JSON.stringify(customer, null, 2));
}
