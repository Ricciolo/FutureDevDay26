import * as readline from "readline";
import { parseJsonRpcMessage, createResultResponse, createErrorResponse, } from "./protocol/jsonRpc.js";
import { definition as getTicketDef, call as callGetTicket, } from "./tools/getTicket.js";
import { definition as getCustomerContextDef, call as callGetCustomerContext, } from "./tools/getCustomerContext.js";
import { definition as searchKnownIssuesDef, call as callSearchKnownIssues, } from "./tools/searchKnownIssues.js";
import { definition as getRecentLogsDef, call as callGetRecentLogs, } from "./tools/getRecentLogs.js";
// ── Tool registry ──────────────────────────────────────────────────────────
const TOOLS = [
    getTicketDef,
    getCustomerContextDef,
    searchKnownIssuesDef,
    getRecentLogsDef,
];
const TOOL_HANDLERS = {
    support_get_ticket: callGetTicket,
    support_get_customer_context: callGetCustomerContext,
    support_search_known_issues: callSearchKnownIssues,
    support_get_recent_logs: callGetRecentLogs,
};
// ── I/O helpers ────────────────────────────────────────────────────────────
function writeResponse(response) {
    process.stdout.write(JSON.stringify(response) + "\n");
}
function log(msg) {
    process.stderr.write(`[ticket2fix-mcp] ${msg}\n`);
}
// ── Message handler ────────────────────────────────────────────────────────
async function handleMessage(line) {
    const request = parseJsonRpcMessage(line);
    if (!request) {
        log(`Ignored non-JSON-RPC message (${line.substring(0, 80)})`);
        return;
    }
    // Notifications (no id) do not require a response
    if (request.id === undefined) {
        log(`Notification received: ${request.method}`);
        return;
    }
    log(`Request: ${request.method} (id=${request.id})`);
    try {
        switch (request.method) {
            case "initialize": {
                const result = {
                    protocolVersion: "2024-11-05",
                    capabilities: { tools: {} },
                    serverInfo: { name: "ticket2fix-support-server", version: "1.0.0" },
                };
                writeResponse(createResultResponse(request.id, result));
                break;
            }
            case "tools/list": {
                writeResponse(createResultResponse(request.id, { tools: TOOLS }));
                break;
            }
            case "tools/call": {
                const params = request.params;
                const toolName = params?.name;
                const args = params?.arguments ?? {};
                if (!toolName) {
                    writeResponse(createErrorResponse(request.id, -32602, "Missing required parameter: name"));
                    break;
                }
                const handler = TOOL_HANDLERS[toolName];
                if (!handler) {
                    writeResponse(createErrorResponse(request.id, -32601, `Tool not found: ${toolName}`));
                    break;
                }
                const result = await handler(args);
                writeResponse(createResultResponse(request.id, result));
                break;
            }
            default:
                writeResponse(createErrorResponse(request.id, -32601, `Method not found: ${request.method}`));
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log(`Error handling ${request.method}: ${message}`);
        writeResponse(createErrorResponse(request.id, -32603, "Internal server error", message));
    }
}
// ── Startup ────────────────────────────────────────────────────────────────
log("Ticket2Fix MCP Server started. Listening on stdin...");
const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
});
// Track in-flight handler promises so we can drain them before exit
const pending = new Set();
rl.on("line", (line) => {
    const trimmed = line.trim();
    if (trimmed) {
        const p = handleMessage(trimmed).catch((err) => {
            log(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`);
        });
        pending.add(p);
        p.finally(() => pending.delete(p));
    }
});
rl.on("close", () => {
    // Drain all pending async handlers before exiting so responses are flushed
    Promise.allSettled([...pending]).then(() => {
        log("stdin closed — server shutting down.");
        process.exit(0);
    });
});
