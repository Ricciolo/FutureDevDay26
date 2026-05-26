export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export function createResultResponse(
  id: string | number | null | undefined,
  result: unknown
): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

export function createErrorResponse(
  id: string | number | null | undefined,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, data } };
}

export function parseJsonRpcMessage(line: string): JsonRpcRequest | null {
  try {
    const parsed = JSON.parse(line.trim());
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.jsonrpc === "2.0" &&
      typeof parsed.method === "string"
    ) {
      return parsed as JsonRpcRequest;
    }
    return null;
  } catch {
    return null;
  }
}
