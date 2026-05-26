export function createResultResponse(id, result) {
    return { jsonrpc: "2.0", id: id ?? null, result };
}
export function createErrorResponse(id, code, message, data) {
    return { jsonrpc: "2.0", id: id ?? null, error: { code, message, data } };
}
export function parseJsonRpcMessage(line) {
    try {
        const parsed = JSON.parse(line.trim());
        if (parsed &&
            typeof parsed === "object" &&
            parsed.jsonrpc === "2.0" &&
            typeof parsed.method === "string") {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
}
