export function createTextContent(text) {
    return { content: [{ type: "text", text }] };
}
export function createErrorContent(message) {
    return { content: [{ type: "text", text: message }], isError: true };
}
