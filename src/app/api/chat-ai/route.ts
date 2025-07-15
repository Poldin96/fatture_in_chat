import { NextRequest, NextResponse } from 'next/server'
import { FatturaBody, REQUEST_TYPES } from '@/lib/supabase/requestTypes'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Definizione dei tools che Claude può utilizzare
const tools = [
  {
    name: "create_fattura",
    description: "Crea una nuova fattura. Usa questo tool quando l'utente vuole generare una fattura con tutti i dati necessari.",
    input_schema: {
      type: "object" as const,
      properties: {
        debitore: {
          type: "object" as const,
          properties: {
            denominazione: { type: "string" as const, description: "Nome/ragione sociale del cliente" },
            partitaIva: { type: "string" as const, description: "Partita IVA (opzionale)" },
            codiceFiscale: { type: "string" as const, description: "Codice fiscale (opzionale)" },
            indirizzo: { type: "string" as const, description: "Indirizzo completo" },
            cap: { type: "string" as const, description: "CAP" },
            citta: { type: "string" as const, description: "Città" },
            provincia: { type: "string" as const, description: "Provincia (sigla)" },
            pec: { type: "string" as const, description: "PEC (opzionale)" },
            codiceDestinatario: { type: "string" as const, description: "Codice destinatario SDI (opzionale)" }
          },
          required: ["denominazione", "indirizzo", "cap", "citta", "provincia"]
        },
        numeroFattura: { type: "string" as const, description: "Numero progressivo della fattura" },
        dataEmissione: { type: "string" as const, description: "Data di emissione in formato ISO (YYYY-MM-DD)" },
        dataScadenza: { type: "string" as const, description: "Data di scadenza in formato ISO (YYYY-MM-DD)" },
        imponibile: { type: "number" as const, description: "Importo imponibile senza IVA" },
        percentualeIva: { type: "number" as const, description: "Percentuale IVA (es. 22)" },
        oggetto: { type: "string" as const, description: "Oggetto/descrizione breve della fattura" },
        descrizione: { type: "string" as const, description: "Descrizione dettagliata (opzionale)" },
        modalitaPagamento: { type: "string" as const, description: "Modalità di pagamento (es. Bonifico bancario)" },
        causale: { type: "string" as const, description: "Causale (opzionale)" },
        note: { type: "string" as const, description: "Note aggiuntive (opzionale)" },
        regimeFiscale: { type: "string" as const, description: "Regime fiscale (opzionale)" }
      },
      required: ["debitore", "numeroFattura", "dataEmissione", "dataScadenza", "imponibile", "percentualeIva", "oggetto", "modalitaPagamento"]
    }
  }
]

async function createFattura(params: FatturaBody, entityId: string, originalRequest: NextRequest) {
  try {
    // Calcola automaticamente IVA e totale
    const imponibile = params.imponibile
    const percentualeIva = params.percentualeIva
    const iva = (imponibile * percentualeIva) / 100
    const importoTotale = imponibile + iva

    const fatturaBody: FatturaBody = {
      debitore: params.debitore,
      numeroFattura: params.numeroFattura,
      dataEmissione: params.dataEmissione,
      dataScadenza: params.dataScadenza,
      imponibile,
      iva,
      percentualeIva,
      importoTotale,
      oggetto: params.oggetto,
      descrizione: params.descrizione,
      modalitaPagamento: params.modalitaPagamento,
      causale: params.causale,
      note: params.note,
      regimeFiscale: params.regimeFiscale
    }

    // Prepara gli headers con i cookie della richiesta originale
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Passa i cookie della richiesta originale
    const cookieHeader = originalRequest.headers.get('cookie')
    if (cookieHeader) {
      headers['cookie'] = cookieHeader
    }

    // Passa anche l'header Authorization se presente
    const authHeader = originalRequest.headers.get('Authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Chiama l'API per creare la fattura
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: REQUEST_TYPES.FATTURA,
        body: fatturaBody,
        entity_id: entityId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Errore API: ${errorData.error}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Errore nella creazione della fattura:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, messages, entityId } = await request.json()

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Dati richiesti mancanti' }, { status: 400 })
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Nessun messaggio fornito' }, { status: 400 })
    }

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID è obbligatorio' }, { status: 400 })
    }

    // Prepara i messaggi per Claude
    const claudeMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    // Chiama Claude con i tools
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Sonnet 4 non è ancora disponibile, uso Sonnet 3.5
      max_tokens: 1000,
      temperature: 0.7,
      system: `Sei un assistente AI specializzato nella gestione di fatture per "Fatture in Chat".

Il tuo compito è aiutare gli utenti a:
- Creare fatture con tutti i dati necessari
- Gestire informazioni sui clienti
- Calcolare automaticamente IVA e totali
- Fornire supporto per la normativa fiscale italiana

IMPORTANTE:
- Quando crei una fattura, assicurati di raccogliere TUTTI i dati obbligatori
- Calcola automaticamente IVA e importo totale
- Usa sempre il formato ISO per le date (YYYY-MM-DD)
- Chiedi conferma prima di creare la fattura
- Sii preciso e professionale

DATI OBBLIGATORI per una fattura:
- Denominazione cliente
- Indirizzo completo (via, CAP, città, provincia)
- Numero fattura
- Data emissione e scadenza
- Importo imponibile
- Percentuale IVA
- Oggetto/descrizione
- Modalità di pagamento

Rispondi sempre in italiano e usa emoji per rendere più chiara la comunicazione.`,
      messages: claudeMessages,
      tools: tools
    })

    // Gestisci la risposta di Claude
    let finalResponse = ''
    const toolResults = []

    for (const content of response.content) {
      if (content.type === 'text') {
        finalResponse += content.text
             } else if (content.type === 'tool_use') {
         try {
           if (content.name === 'create_fattura') {
             const input = content.input as FatturaBody // Tipo cast temporaneo per l'input
             const result = await createFattura(input, entityId, request)
             toolResults.push({
               tool_use_id: content.id,
               result: result
             })
             
             // Aggiungi messaggio di successo
             finalResponse += `\n\n✅ **Fattura creata con successo!**\n\n`
             finalResponse += `📄 **Numero**: ${input.numeroFattura}\n`
             finalResponse += `👤 **Cliente**: ${input.debitore.denominazione}\n`
             finalResponse += `💰 **Importo**: €${input.imponibile} + IVA ${input.percentualeIva}% = €${((input.imponibile * (1 + input.percentualeIva / 100))).toFixed(2)}\n`
             finalResponse += `📅 **Emissione**: ${input.dataEmissione}\n`
             finalResponse += `⏰ **Scadenza**: ${input.dataScadenza}\n\n`
             finalResponse += `La fattura è stata inviata al sistema. Puoi visualizzarla nella sezione "Richieste".`
           }
         } catch (error) {
           console.error('Errore nell\'esecuzione del tool:', error)
           finalResponse += `\n\n❌ **Errore nella creazione della fattura**: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
         }
       }
    }

    // Se non c'è contenuto, usa un messaggio di default
    if (!finalResponse.trim()) {
      finalResponse = `🤖 **Assistente AI per Fatture**

Sono qui per aiutarti con la gestione delle fatture!

Posso aiutarti a:
• 📋 Creare nuove fatture
• 💰 Calcolare IVA e totali
• 👥 Gestire i dati clienti
• 📊 Fornire informazioni fiscali

Cosa vuoi fare oggi?`
    }

    return NextResponse.json({ 
      response: finalResponse,
      chatId,
      toolResults 
    })

  } catch (error) {
    console.error('Errore API chat-ai:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
} 