// Hook UserPromptSubmit — eseguito da Claude Code prima che ogni prompt venga elaborato dal modello.
// Riceve il contesto via stdin come JSON e può bloccare il prompt o iniettare contesto aggiuntivo.
import process from "node:process";

// Accumula i chunk di stdin e restituisce la stringa completa quando lo stream si chiude.
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

// Restituisce true se il prompt contiene almeno una parola chiave del dominio supporto.
// Usato come guard: se il prompt non riguarda ticket, l'hook non fa nulla.
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

// Verifica che il prompt contenga un ID ticket nel formato SUP-NNNN (minimo 4 cifre).
function containsTicketId(prompt) {
  return /\bSUP-\d{4,}\b/i.test(prompt);
}

// Estrae il primo ID ticket trovato nel prompt e lo restituisce in maiuscolo.
function getTicketId(prompt) {
  const match = prompt.match(/\bSUP-\d{4,}\b/i);
  return match ? match[0].toUpperCase() : null;
}

// Serializza il valore come JSON su stdout — unico canale di comunicazione verso Claude Code.
function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

try {
  const rawInput = await readStdin();

  // stdin vuoto: Claude Code non ha passato dati, nessuna azione necessaria.
  if (!rawInput.trim()) {
    process.exit(0);
  }

  // Il JSON di input di Claude Code contiene almeno: session_id, hook_event_name, prompt.
  // Se è attivo un agent, include anche agent_type con il nome dal frontmatter dell'agent.
  const input = JSON.parse(rawInput);

  // Questo hook è specifico per l'agente ticket2fix: ignoralo per qualsiasi altro contesto.
  if (input.agent_type !== "ticket2fix") {
    process.exit(0);
  }

  const prompt = typeof input.prompt === "string" ? input.prompt : "";

  // Prompt vuoto: niente da analizzare.
  if (!prompt.trim()) {
    process.exit(0);
  }

  // Prompt non correlato al supporto: l'hook si disattiva senza interferire.
  if (!isSupportTicketPrompt(prompt)) {
    process.exit(0);
  }

  // Prompt di supporto senza ID ticket: blocca e chiedi all'utente di specificarlo.
  // Claude Code mostra `reason` all'utente e cancella il prompt dal contesto.
  if (!containsTicketId(prompt)) {
    writeJson({
      decision: "block",
      reason: "Per analizzare un ticket devi indicare un identificativo nel formato SUP-1234, ad esempio SUP-1842."
    });

    process.exit(0);
  }

  const ticketId = getTicketId(prompt);

  // Prompt valido: inietta additionalContext nel context window di Claude.
  // Il testo viene inserito come system reminder accanto al prompt corrente,
  // visibile al modello ma non mostrato come messaggio in chat.
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
  // Errore non bloccante: stderr viene mostrato come notice nel transcript,
  // ma l'esecuzione continua normalmente (exit 0, non exit 2).
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Ticket2Fix hook error: ${message}\n`);
  process.exit(0);
}
