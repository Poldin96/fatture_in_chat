import { NextRequest, NextResponse } from 'next/server'
import { ChatMessage } from '@/lib/supabase/types'
import { FatturaBody, REQUEST_TYPES } from '@/lib/supabase/requestTypes'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, tool } from 'ai'
import { z } from 'zod'

// Schema per il tool di creazione fattura
const createFatturaSchema = z.object({
  debitore: z.object({
    denominazione: z.string().describe('Nome/ragione sociale del cliente'),
    partitaIva: z.string().optional().describe('Partita IVA (opzionale)'),
    codiceFiscale: z.string().optional().describe('Codice fiscale (opzionale)'),
    indirizzo: z.string().describe('Indirizzo completo'),
    cap: z.string().describe('CAP'),
    citta: z.string().describe('Città'),
    provincia: z.string().describe('Provincia (sigla)'),
    pec: z.string().optional().describe('PEC (opzionale)'),
    codiceDestinatario: z.string().optional().describe('Codice destinatario SDI (opzionale)')
  }),
  numeroFattura: z.string().describe('Numero progressivo della fattura'),
  dataEmissione: z.string().describe('Data di emissione in formato ISO (YYYY-MM-DD)'),
  dataScadenza: z.string().describe('Data di scadenza in formato ISO (YYYY-MM-DD)'),
  imponibile: z.number().describe('Importo imponibile senza IVA'),
  percentualeIva: z.number().describe('Percentuale IVA (es. 22)'),
  oggetto: z.string().describe('Oggetto/descrizione breve della fattura'),
  descrizione: z.string().optional().describe('Descrizione dettagliata (opzionale)'),
  modalitaPagamento: z.string().describe('Modalità di pagamento (es. Bonifico bancario)'),
  causale: z.string().optional().describe('Causale (opzionale)'),
  note: z.string().optional().describe('Note aggiuntive (opzionale)'),
  regimeFiscale: z.string().optional().describe('Regime fiscale (opzionale)')
})

async function createFattura(params: z.infer<typeof createFatturaSchema>, entityId: string, originalRequest: NextRequest) {
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
    return {
      success: true,
      fattura: result,
      summary: {
        numeroFattura: params.numeroFattura,
        cliente: params.debitore.denominazione,
        imponibile: params.imponibile,
        percentualeIva: params.percentualeIva,
        totale: importoTotale,
        dataEmissione: params.dataEmissione,
        dataScadenza: params.dataScadenza
      }
    }
  } catch (error) {
    console.error('Errore nella creazione della fattura:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, entityId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messaggi richiesti mancanti' }, { status: 400 })
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Nessun messaggio fornito' }, { status: 400 })
    }

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID è obbligatorio' }, { status: 400 })
    }

    // Prepara i messaggi per Claude
    const claudeMessages = messages.map((msg: ChatMessage) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    // Usa l'AI SDK per lo streaming
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      temperature: 0.7,
      maxTokens: 1000,
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
- SEMPRE dopo aver eseguito un'azione, fornisci un feedback dettagliato all'utente
- CRITICAMENTE IMPORTANTE: Quando usi un tool, il risultato del tool DEVE essere incluso nella tua risposta finale all'utente

DATI OBBLIGATORI per una fattura:
- Denominazione cliente
- Indirizzo completo (via, CAP, città, provincia)
- Numero fattura
- Data emissione e scadenza
- Importo imponibile
- Percentuale IVA
- Oggetto/descrizione
- Modalità di pagamento

Rispondi sempre in italiano e usa emoji per rendere più chiara la comunicazione.

FORMATO RISPOSTA: Quando crei una fattura, la tua risposta deve includere:
1. Il risultato dell'operazione (successo/errore)
2. I dettagli della fattura creata
3. Informazioni su dove l'utente può trovare la fattura`,
      messages: claudeMessages,
      tools: {
        create_fattura: tool({
          description: 'Crea una nuova fattura. Usa questo tool quando l\'utente vuole generare una fattura con tutti i dati necessari. IMPORTANTE: Dopo aver eseguito questo tool, fornisci SEMPRE un feedback dettagliato all\'utente.',
          parameters: createFatturaSchema,
          execute: async (params) => {
            console.log('🔧 Eseguendo tool create_fattura...')
            const result = await createFattura(params, entityId, request)
            console.log('✅ Tool eseguito, result:', result)
            
            if (result.success) {
              const feedback = `✅ **Fattura creata con successo!**

📄 **Numero**: ${result.summary!.numeroFattura}
👤 **Cliente**: ${result.summary!.cliente}
💰 **Importo**: €${result.summary!.imponibile} + IVA ${result.summary!.percentualeIva}% = €${result.summary!.totale.toFixed(2)}
📅 **Emissione**: ${result.summary!.dataEmissione}
⏰ **Scadenza**: ${result.summary!.dataScadenza}

La fattura è stata inviata al sistema. Puoi visualizzarla nella sezione "Richieste".`
              console.log('📤 Feedback generato:', feedback)
              return feedback
            } else {
              const errorFeedback = `❌ **Errore nella creazione della fattura**: ${result.error}`
              console.log('❌ Errore feedback:', errorFeedback)
              return errorFeedback
            }
          }
        })
      }
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Errore API chat-ai-stream:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
} 