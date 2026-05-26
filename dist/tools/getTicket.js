import { getTicket as fetchTicket } from "../data/repository.js";
import { createTextContent, createErrorContent } from "../protocol/mcpTypes.js";
export const definition = {
    name: "support_get_ticket",
    description: "Recupera un ticket di assistenza cliente dal sistema di supporto. Restituisce ID, cliente, titolo, descrizione, modulo, severità e data di creazione.",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "ID del ticket (es. SUP-1842)",
            },
        },
        required: ["ticketId"],
    },
};
export async function call(args) {
    const ticketId = args["ticketId"];
    if (typeof ticketId !== "string" || !ticketId.trim()) {
        return createErrorContent("Input non valido: ticketId deve essere una stringa non vuota.");
    }
    const ticket = await fetchTicket(ticketId.trim());
    if (!ticket) {
        return createErrorContent(`Ticket non trovato: ${ticketId}`);
    }
    return createTextContent(JSON.stringify(ticket, null, 2));
}
