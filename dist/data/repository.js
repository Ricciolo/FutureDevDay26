import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
// ESM-safe __dirname equivalent
// Compiled output is in dist/data/, so ../../ resolves to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..", "..");
const dataDir = join(projectRoot, "demo-data");
async function readJsonFile(relativePath) {
    const fullPath = join(dataDir, relativePath);
    const content = await readFile(fullPath, "utf-8");
    return JSON.parse(content);
}
export async function getTicket(ticketId) {
    const tickets = await readJsonFile("tickets.json");
    return (tickets.find((t) => t.ticketId.toLowerCase() === ticketId.toLowerCase()) ?? null);
}
export async function getCustomerContext(customerId) {
    const customers = await readJsonFile("customers.json");
    return (customers.find((c) => c.customerId.toLowerCase() === customerId.toLowerCase()) ?? null);
}
export async function searchKnownIssues(query, module, version) {
    const issues = await readJsonFile("known-issues.json");
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1);
    return issues.filter((issue) => {
        // Filter by module (exact, case-insensitive)
        if (module && issue.module.toLowerCase() !== module.toLowerCase()) {
            return false;
        }
        // Filter by version (exact match in affectedVersions)
        if (version && !issue.affectedVersions.includes(version)) {
            return false;
        }
        // Match query words against all searchable text
        const searchableText = [
            issue.title,
            issue.module,
            issue.probableCause,
            issue.issueId,
            ...issue.affectedVersions,
            ...issue.relatedFiles,
            ...issue.suggestedTests,
        ]
            .join(" ")
            .toLowerCase();
        return queryWords.length === 0 || queryWords.some((w) => searchableText.includes(w));
    });
}
export async function getRecentLogs(customerId, module, maxLines) {
    // Derive log filename: CUST-ROSSI -> rossi-app.log
    const clientSlug = customerId.toLowerCase().replace(/^cust-/, "");
    const logFile = join(dataDir, "logs", `${clientSlug}-app.log`);
    let allLines = [];
    try {
        const content = await readFile(logFile, "utf-8");
        allLines = content
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
    }
    catch {
        // Log file not found — return empty result
        allLines = [];
    }
    // Filter by module name (case-insensitive substring match)
    const filtered = module
        ? allLines.filter((l) => l.toLowerCase().includes(module.toLowerCase()))
        : allLines;
    const limit = maxLines ?? 50;
    const lines = filtered.slice(-limit);
    return { customerId, module, lines };
}
