export interface McpTextContent {
  type: "text";
  text: string;
}

export interface McpToolCallResult {
  content: McpTextContent[];
  isError?: boolean;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: {
    tools: Record<string, never>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export function createTextContent(text: string): McpToolCallResult {
  return { content: [{ type: "text", text }] };
}

export function createErrorContent(message: string): McpToolCallResult {
  return { content: [{ type: "text", text: message }], isError: true };
}
