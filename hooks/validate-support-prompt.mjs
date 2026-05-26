import process from "node:process";

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";

    process.stdin.setEncoding("utf8");

    process.stdin.on("data", chunk => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    process.stdin.on("error", error => {
      reject(error);
    });
  });
}

function isSupportTicketPrompt(prompt) {
  const normalized = prompt.toLowerCase();

  const keywords = [
    "ticket",
    "supporto",
    "assistenza",
    "triage",
    "classifica",
    "classificazione",
    "bug",
    "regressione",
    "evolutiva",
    "brief tecnico",
    "checklist qa",
    "risposta cliente"
  ];

  return keywords.some(keyword => normalized.includes(keyword));
}

function containsTicketId(prompt) {
  return /\bSUP-\d{4,}\b/i.test(prompt);
}

function getTicketId(prompt) {
  const match = prompt.match(/\bSUP-\d{4,}\b/i);
  return match ? match[0].toUpperCase() : null;
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

try {
  const rawInput = await readStdin();

  if (!rawInput.trim()) {
    process.exit(0);
  }

  const input = JSON.parse(rawInput);
  const prompt = typeof input.prompt === "string" ? input.prompt : "";

  if (!prompt.trim()) {
    process.exit(0);
  }

  if (!isSupportTicketPrompt(prompt)) {
    process.exit(0);
  }

  if (!containsTicketId(prompt)) {
    writeJson({
      decision: "block",
      reason: "Per analizzare un ticket devi indicare un identificativo nel formato SUP-1234, ad esempio SUP-1842."
    });

    process.exit(0);
  }

  const ticketId = getTicketId(prompt);

  writeJson({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: [
        `Ticket rilevato dal prompt: ${ticketId}.`,
        "Per questa richiesta l'agente deve usare la skill support-triage.",
        "L'agente deve recuperare dati tramite i tool MCP Ticket2Fix prima di classificare il ticket.",
        "L'agente non deve inventare cliente, versione, moduli, log, file sorgenti o cause tecniche."
      ].join("\n")
    }
  });

  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Ticket2Fix hook error: ${message}\n`);
  process.exit(0);
}
