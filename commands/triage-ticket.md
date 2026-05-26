---
description: Run complete Ticket2Fix second-level support triage for a ticket
argument-hint: SUP-1234
---

Esegui il triage tecnico completo del ticket indicato in `$ARGUMENTS`.

Prima di procedere verifica che `$ARGUMENTS` contenga un identificativo nel formato `SUP-1234`.

Se manca un ticket ID valido, chiedi all'utente di fornire un identificativo valido e interrompi il workflow.

Questo command è destinato al supporto tecnico di secondo livello, allo sviluppo e al QA.

Non generare risposte dirette per il cliente.

**Workflow obbligatorio:**

1. Carica la skill `support-triage`.
2. Usa il tool MCP `support_get_ticket` per recuperare il ticket.
3. Usa il tool MCP `support_get_customer_context` per recuperare cliente, versione, moduli e personalizzazioni.
4. Usa il tool MCP `support_search_known_issues` per cercare problemi noti usando descrizione, modulo, versione e personalizzazioni.
5. Usa il tool MCP `support_get_recent_logs` se il ticket riguarda errore, blocco, crash, stampa, importazione, esportazione o malfunzionamento.
6. Non inventare cliente, versione, moduli, log, file sorgenti, cause tecniche o azioni già svolte.
7. Se i dati sono insufficienti, dichiaralo chiaramente.

**Produci questo output:**

## Classificazione

Classifica il ticket come uno tra:

- bug/regressione
- configurazione
- richiesta evolutiva
- informazione mancante

## Evidenze

Elenca solo evidenze derivate dai tool MCP.

Includi, se disponibili:

- ticket
- cliente
- versione installata
- moduli coinvolti
- personalizzazioni rilevanti
- problemi noti correlati
- log rilevanti

## Probabile causa

Indica la causa più probabile solo se supportata dai dati.

Se non ci sono dati sufficienti, scrivi:

```text
Causa non determinabile con i dati disponibili.
```

## Sintesi interna per supporto di secondo livello

Scrivi una sintesi breve e operativa per il team di supporto tecnico.

Deve aiutare a capire:

- cosa è successo
- quanto sembra critico
- quali dati sono già disponibili
- quali verifiche fare prima di escalare

## Brief tecnico per sviluppatore

Includi:

- area tecnica probabile
- file probabili da verificare, solo se presenti nei dati recuperati
- sintomo tecnico
- ipotesi tecnica
- dati necessari per riprodurre
- rischi o regressioni possibili

## Checklist QA

Includi test manuali o tecnici coerenti con il ticket.

La checklist deve coprire:

- scenario principale
- scenario con personalizzazioni cliente
- regressioni correlate
- casi negativi
- criteri minimi di accettazione

## Dati mancanti da raccogliere

Elenca le informazioni ancora necessarie, ad esempio:

- ID documento
- timestamp errore
- utente coinvolto
- screenshot
- file importato
- configurazione specifica
- conferma versione installata

## Prossime azioni consigliate

Separa le azioni per:

**Supporto tecnico**

- verifiche da fare
- dati da raccogliere
- eventuale workaround interno da verificare

**Sviluppo**

- aree da controllare
- test da aggiungere
- fix o analisi da pianificare

**QA**

- test da eseguire
- regressioni da coprire
