Custom Developer Agent per triage di ticket di assistenza e handoff tecnico a supporto, sviluppo e QA.

Compatibile con **GitHub Copilot CLI** e **Claude Code CLI** tramite protocollo MCP (Model Context Protocol).

Il server MCP è scritto in TypeScript, gira in locale e non richiede database né API esterne.

---

## In Breve

Ticket2Fix MCP Agent fornisce:

- un agente dedicato `ticket2fix`
- una skill on-demand `support-triage` per il processo di triage
- un server MCP locale con 4 tool aziendali
- un hook `UserPromptSubmit` come guardrail deterministico di processo
- uno slash command per workflow ripetibili: `triage-ticket`

In pratica, l'agente può:

- recuperare ticket di assistenza per ID
- caricare versione installata, moduli e personalizzazioni del cliente
- cercare problemi noti per modulo, versione e parole chiave
- leggere i log applicativi recenti filtrati per modulo
- trasformare un ticket ambiguo in classificazione, brief tecnico, checklist QA e risposta cliente

Salta a: [✅ Prerequisiti](#-prerequisiti) | [🔨 Build](#-build) | [🧩 Claude Code](#-installazione-con-claude-code) | [🧩 GitHub Copilot CLI](#-installazione-con-github-copilot-cli) | [🚀 Quickstart](#-quickstart)

---

## Scopo della demo

Mostrare la differenza concreta tra un LLM generico e un agente custom:

| LLM generico | Ticket2Fix Master |
|---|---|
| Risposta plausibile ma senza contesto reale | Usa ticket, versione, personalizzazioni, log e known issues |
| Indovina la causa tecnica | Ricerca problemi noti nel database aziendale |
| Produce analisi generica | Produce output operativo per supporto, sviluppo e QA |
| Delega il controllo del processo al prompt engineering | Applica guardrail deterministici tramite hook |

---

## Architettura della demo

### Hook Claude Code

La demo include anche un hook deterministico.

Lo scopo dell'hook non è fare analisi del ticket, ma applicare una regola di processo prima che l'agente inizi a lavorare.

**Hook scelto:** `UserPromptSubmit` (chiave JSON: `userPromptSubmitted`)

**Motivo:**

- intercetta il prompt dell'utente prima dell'elaborazione del modello
- può bloccare prompt incompleti
- può aggiungere contesto operativo all'agente
- rende visibile il concetto di guardrail deterministico

**Regola demo:**

Se l'utente chiede di analizzare un ticket, ma non indica un identificativo nel formato `SUP-1234`, il prompt viene bloccato e viene richiesto di specificare il ticket ID.

Questo mostra che alcune regole non devono essere affidate solo al system prompt o alla skill: possono essere applicate in modo deterministico tramite hook.

---

## ✅ Prerequisiti

- Windows
- Node.js 20 o superiore
- npm
- GitHub Copilot CLI oppure Claude Code

---

## 🔨 Build

Dopo aver clonato o installato il repository, compilare il progetto:

```bash
npm install
npm run build
```

Il build genera `dist/server.js`, l'eseguibile del server MCP.

---

## 🧩 Installazione con Claude Code

Avvia Claude Code:

```
claude
```

Aggiungi questo repository GitHub come marketplace:

```
/plugin marketplace add your-user/ticket2fix-mcp-agent
```

> Sostituisci `your-user/ticket2fix-mcp-agent` con il percorso GitHub reale del repository.

Installa il plugin Ticket2Fix da quel marketplace:

```
/plugin install ticket2fix-mcp-agent@ticket2fix-plugins
```

Se Claude chiede di applicare i cambiamenti senza riavviare:

```
/reload-plugins
```

Per aggiornare il plugin in seguito:

```
/plugin update
```

Seleziona l'agente Ticket2Fix:

```
/agents
ticket2fix
```

---

## 🧩 Installazione con GitHub Copilot CLI

Aggiungi questo repository GitHub come marketplace:

```
copilot plugin marketplace add your-user/ticket2fix-mcp-agent
```

Installa il plugin:

```
copilot plugin install your-user/ticket2fix-mcp-agent
```

Avvia Copilot CLI:

```
copilot
```

Seleziona l'agente Ticket2Fix:

```
/agent
ticket2fix
```

Abilita approvazioni automatiche (consigliato per evitare prompt ripetuti):

```
/allow-all on
```

---

## 🚀 Quickstart

Dopo aver installato il plugin, il workflow è lo stesso indipendentemente dall'assistente scelto.

Apri un terminale e avvia il tuo assistente:

```
copilot
```

oppure:

```
claude
```

Seleziona l'agente `ticket2fix`.

Copilot CLI:

```
/agent
ticket2fix
```

Claude Code:

```
/agents
ticket2fix
```

Se usi Copilot CLI, abilita le approvazioni automatiche:

```
/allow-all on
```

Inizia con un prompt concreto:

```
Analizza il ticket SUP-1842 e produci classificazione, brief tecnico, checklist QA e risposta cliente.
```

L'agente caricherà la skill `support-triage`, userà i 4 tool MCP per recuperare ticket, contesto cliente, problemi noti e log, e produrrà un output operativo strutturato.

---

## Tool MCP esposti

| Tool | Descrizione |
|---|---|
| `support_get_ticket` | Recupera ticket per ID |
| `support_get_customer_context` | Versione, moduli, personalizzazioni cliente |
| `support_search_known_issues` | Cerca problemi noti per modulo, versione, parole chiave |
| `support_get_recent_logs` | Log applicativi recenti filtrati per modulo |

## Slash command disponibili

Il plugin espone uno slash command principale.

```text
/ticket2fix-mcp-agent:triage-ticket SUP-1842
```

### triage-ticket

Esegue il triage tecnico completo del ticket.

Usa i tool MCP per recuperare: ticket, contesto cliente, versione installata, moduli attivi, personalizzazioni, problemi noti, log recenti.

Produce: classificazione, evidenze, probabile causa, sintesi interna per supporto di secondo livello, brief tecnico per sviluppatore, checklist QA, dati mancanti, prossime azioni consigliate.

```text
/ticket2fix-mcp-agent:triage-ticket SUP-1842
```

> Il command è uno strumento interno. Non genera risposte dirette per il cliente.

## Hook demo

La demo include un hook `UserPromptSubmit`.

Serve per mostrare un guardrail deterministico prima dell'esecuzione dell'agente.

**Esempio bloccato:**

```text
Analizza questo ticket e dimmi se è un bug.
```

Motivo: manca l'identificativo nel formato `SUP-1234`.

**Esempio accettato:**

```text
Analizza il ticket SUP-1842 e produci classificazione, brief tecnico, checklist QA e risposta cliente.
```

In questo caso il hook aggiunge contesto all'agente, ricordando di usare:

- skill `support-triage`
- tool MCP Ticket2Fix
- dati reali recuperati dai tool
- nessuna informazione inventata

---

## Checklist prima della demo

- Verificare che la cartella `hooks/` sia alla root del plugin.
- Verificare che `hooks/hooks.json` venga caricato dal plugin.
- Verificare con `/hooks` in Claude Code che l'hook `UserPromptSubmit` (`userPromptSubmitted`) sia visibile.
- Provare un prompt senza ticket ID e verificare che venga bloccato.
- Provare un prompt con `SUP-1842` e verificare che venga accettato.

> Claude Code espone anche `/hooks` per ispezionare gli hook configurati e verificarne origine, evento, comando e dettagli.
- Verificare con `/project` o `/help` in Claude Code che i command `triage-ticket` e `technical-handoff` siano visibili come slash command.

---

## Prompt demo live

**Demo 0 — Hook guardrail (prompt incompleto):**

**Prompt volutamente incompleto:**

```text
Analizza questo ticket e dimmi se è un bug.
```

**Risultato atteso:** prompt bloccato dal hook, manca un ticket ID nel formato `SUP-1234`.

**Prompt corretto:**

```text
Analizza il ticket SUP-1842 e produci classificazione, brief tecnico, checklist QA e risposta cliente.
```

**Risultato atteso:** il prompt passa, il hook aggiunge contesto e l'agente usa skill e tool MCP.

**Demo 1 — Triage completo (SUP-1842 / Rossi S.r.l. / Billing):**
```
Analizza il ticket SUP-1842 e produci classificazione, brief tecnico, checklist QA e risposta cliente.
```

**Demo 2 — Bug o richiesta evolutiva (SUP-1880 / Bianchi S.p.A. / Reporting):**
```
Analizza il ticket SUP-1880 e dimmi se è bug o richiesta evolutiva.
```

**Demo 3 — Importazione ordini (SUP-1901 / Verdi S.n.c. / Orders):**
```
Partendo da SUP-1901, trova la causa più probabile del problema di importazione ordini.
```

## Sequenza demo consigliata

**Passo 1 — Hook guardrail (prompt incompleto):**

```text
Analizza questo ticket e dimmi se è un bug.
```

**Risultato atteso:** il hook blocca la richiesta perché manca un ticket ID nel formato `SUP-1234`.

**Passo 2 — Triage tecnico completo:**

```text
/ticket2fix-mcp-agent:triage-ticket SUP-1842
```

**Risultato atteso:** workflow completo di triage tecnico interno con classificazione, brief, checklist QA e prossime azioni.

---

## Struttura del progetto

```
src/
  server.ts               # Entry point MCP (stdin/stdout, JSON-RPC 2.0)
  protocol/
    jsonRpc.ts            # Tipi e helper JSON-RPC
    mcpTypes.ts           # Tipi MCP e helper content
  data/
    repository.ts         # Lettura file JSON e log locali
  tools/
    getTicket.ts          # Tool: support_get_ticket
    getCustomerContext.ts # Tool: support_get_customer_context
    searchKnownIssues.ts  # Tool: support_search_known_issues
    getRecentLogs.ts      # Tool: support_get_recent_logs
  types/
    domain.ts             # Tipi di dominio

demo-data/                # Tutti i dati mock (nessun DB, nessuna API)
  tickets.json
  customers.json
  known-issues.json
  logs/
    rossi-app.log
    bianchi-app.log
    verdi-app.log

agents/
  ticket2fix.agent.md          # Definizione agente

skills/
  support-triage/
    SKILL.md             # Skill on-demand per il processo di triage

hooks/
  hooks.json                      # Configurazione hook userPromptSubmitted
  validate-support-prompt.mjs     # Guardrail: blocca prompt senza ticket ID

commands/
  triage-ticket.md                # Slash command: triage tecnico completo
```

> **Nota**: tutti i dati sono mock locali in `demo-data/`. Nessun database. Nessuna API esterna. Nessun servizio cloud.

---

> I command non sostituiscono i tool MCP.
>
> I tool MCP espongono dati e capacità aziendali.
> La skill definisce il metodo.
> Il hook applica guardrail deterministici.
> I command trasformano workflow frequenti in azioni ripetibili.
>
> In questo modo il custom developer agent non è una chat generica, ma uno strumento operativo integrato nel flusso di lavoro.
