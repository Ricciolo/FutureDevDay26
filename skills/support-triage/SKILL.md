---
name: support-triage
description: "Trigger: use when the user asks to analyze, classify or transform a support ticket into technical work items, developer briefs or QA checklists."
---

## Processo di triage

Quando analizzi un ticket, segui **sempre** questi passi nell'ordine indicato:

### 1. Carica il ticket

Usa `support_get_ticket` con l'ID del ticket.

Verifica: ticketId, customerId, modulo, severità, descrizione.

### 2. Recupera il contesto cliente

Usa `support_get_customer_context` con il customerId del ticket.

Annota: versione installata, moduli abilitati, personalizzazioni attive, data ultimo deployment.

### 3. Cerca problemi noti

Usa `support_search_known_issues` con:

- `query` — parole chiave dalla descrizione del ticket e dai nomi delle personalizzazioni attive
- `module` — il modulo del ticket
- `version` — la versione installata del cliente

Se non trovi risultati con modulo e versione, prova con solo la query (senza filtri).

### 4. Leggi i log recenti

Usa `support_get_recent_logs` **obbligatoriamente** se il ticket menziona:

- errori applicativi
- blocchi o crash
- stampa, esportazione, importazione
- malfunzionamenti generici
- comportamento cambiato dopo un aggiornamento

Filtra per il modulo del ticket.

### 5. Classifica il ticket

Classifica il ticket in una di queste categorie:

- **`bug/regressione`** — comportamento che funzionava prima dell'aggiornamento e ora è rotto
- **`configurazione`** — problema dovuto a impostazioni errate o mancanti, non a codice
- **`richiesta evolutiva`** — nuova funzionalità o miglioramento richiesto dal cliente
- **`informazione mancante`** — dati insufficienti per una diagnosi affidabile

### 6. Non inventare

Non aggiungere file sorgenti, cause tecniche, versioni o log che non provengono dai tool MCP.

Se i dati non sono sufficienti, dichiaralo nella classificazione (`informazione mancante`) e specifica cosa manca.

### 7. Produci output operativo

L'output deve essere utile e diretto. Non generico.

## Output atteso

| Sezione | Contenuto |
|---------|-----------|
| **Classificazione** | Categoria + motivazione basata su evidenze |
| **Evidenze** | Solo dati dai tool MCP, non interpretazioni |
| **Probabile causa** | Tecnica, verificabile, con riferimento a file o componenti |
| **Sintesi per supporto** | Breve, chiara, orientata all'azione immediata |
| **Brief tecnico per sviluppatore** | File da controllare, causa sospetta, test da aggiungere |
| **Checklist QA** | Scenari di test concreti e verificabili |
| **Risposta per il cliente** | Professionale, senza dettagli tecnici interni |

## Regole di tono

- Sintetico. Nessuna formula generica come "potrebbe dipendere da diversi fattori".
- Tecnico. Usa i nomi di file, componenti e versioni reali dai tool.
- Operativo. Ogni affermazione deve permettere un'azione concreta.
- Onesto. Se i dati non bastano, dillo.
