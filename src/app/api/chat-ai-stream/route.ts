import { NextRequest, NextResponse } from 'next/server'
import { ChatMessage } from '@/lib/supabase/types'
import { FatturaBody, REQUEST_TYPES } from '@/lib/supabase/requestTypes'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, tool } from 'ai'
import { z } from 'zod'

// Schema per il tool di creazione fattura
const createFatturaSchema = z.object({
  entity_id: z.string().describe('ID dell\'entità per cui creare la fattura'),
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

// Funzione per recuperare le entities dell'utente
async function getUserEntities(request: NextRequest): Promise<UserEntity[]> {
  try {
    const headers: HeadersInit = {}
    
    // Passa i cookie della richiesta originale
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers['cookie'] = cookieHeader
    }

    // Passa anche l'header Authorization se presente
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/entities`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      console.warn('⚠️ Errore nel recupero entities:', await response.text())
      return []
    }

    const data = await response.json()
    return (data.entities || []) as UserEntity[]
  } catch (error) {
    console.warn('⚠️ Errore nel recupero entities:', error)
    return []
  }
}

// Interfaccia per le entities
interface UserEntity {
  id: string
  name: string
  body?: {
    partita_iva?: string
    tipo?: string
  }
  role: string
  created_at?: string
  updated_at?: string
}

// Funzione per costruire il system prompt dinamico
function buildSystemPrompt(entities: UserEntity[], currentDateTime: string) {
  const entitiesContext = entities.length > 0 
    ? `

🏢 **ENTITÀ DISPONIBILI:**
${entities.map(entity => `• **${entity.name}** (ID: ${entity.id})
  - Ruolo: ${entity.role}
  - P.IVA: ${entity.body?.partita_iva || 'N/A'}
  - Tipo: ${entity.body?.tipo || 'N/A'}`).join('\n')}

IMPORTANTE per la creazione fatture:
- DEVI sempre specificare l'entity_id quando crei una fattura
- Se l'utente non specifica per quale entità, chiedi di scegliere tra quelle disponibili
- Se c'è una sola entità disponibile, puoi usarla automaticamente informando l'utente`
    : `

⚠️ **NESSUNA ENTITÀ DISPONIBILE:**
L'utente non ha entità associate. Non è possibile creare fatture senza un'entità.
Suggerisci di creare prima un'entità nella sezione appropriata.`

  return `Sei un assistente AI specializzato nella gestione di fatture per "Fatture in Chat".

⏰ **CONTESTO TEMPORALE:**
Data e ora attuali: ${currentDateTime}

Il tuo compito è aiutare gli utenti a:
- Creare fatture con tutti i dati necessari
- Gestire informazioni sui clienti  
- Calcolare automaticamente IVA e totali
- Fornire supporto per la normativa fiscale italiana${entitiesContext}

IMPORTANTE:
- Quando crei una fattura, assicurati di raccogliere TUTTI i dati obbligatori
- Calcola automaticamente IVA e importo totale
- Usa sempre il formato ISO per le date (YYYY-MM-DD)
- Per le date, considera il contesto temporale fornito
- Chiedi conferma prima di creare la fattura
- Sii preciso e professionale
- SEMPRE dopo aver eseguito un'azione, fornisci un feedback dettagliato all'utente
- CRITICAMENTE IMPORTANTE: Quando usi un tool, il risultato del tool DEVE essere incluso nella tua risposta finale all'utente
- OBBLIGATORIO: Dopo aver chiamato create_fattura, devi SEMPRE rispondere con il risultato del tool mostrandolo all'utente
- Non limitarti a processare il tool in silenzio - mostra SEMPRE il feedback completo nella chat

DATI OBBLIGATORI per una fattura:
- Entity ID (dall'elenco sopra)
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
3. Informazioni su dove l'utente può trovare la fattura: ovvero nella sezione Richieste`
}

async function createFattura(params: z.infer<typeof createFatturaSchema>, originalRequest: NextRequest) {
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

    // Chiama l'API per creare la fattura usando l'entity_id dal parametro
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: REQUEST_TYPES.FATTURA,
        body: fatturaBody,
        entity_id: params.entity_id
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
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messaggi richiesti mancanti' }, { status: 400 })
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Nessun messaggio fornito' }, { status: 400 })
    }

    // Recupera le entities dell'utente
    console.log('🏢 Recupero entities dell\'utente...')
    const userEntities = await getUserEntities(request)
    console.log(`✅ Trovate ${userEntities.length} entities`)

    // Costruisci il contesto temporale
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome'
    }
    const currentDateTime = now.toLocaleDateString('it-IT', options)
    console.log(`🕒 Contesto temporale: ${currentDateTime}`)

    // Costruisci il system prompt dinamico
    const systemPrompt = buildSystemPrompt(userEntities, currentDateTime)

    // Prepara i messaggi per Claude
    const claudeMessages = messages.map((msg: ChatMessage) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    // Usa l'AI SDK per lo streaming con maxSteps per consentire follow-up
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      temperature: 0.7,
      maxTokens: 1500,
      maxSteps: 3, // Permette multiple interazioni per follow-up dopo tool execution
      system: systemPrompt,
      messages: claudeMessages,
      tools: {
        create_fattura: tool({
          description: 'Crea una nuova fattura. Usa questo tool quando l\'utente vuole generare una fattura con tutti i dati necessari. IMPORTANTE: Devi specificare l\'entity_id. Dopo aver eseguito questo tool, DEVI SEMPRE generare una risposta di follow-up per mostrare il risultato all\'utente.',
          parameters: createFatturaSchema,
          execute: async (params) => {
            console.log('🔧 Eseguendo tool create_fattura per entity:', params.entity_id)
            const toolResult = await createFattura(params, request)
            console.log('✅ Tool eseguito, result:', toolResult)
            
            if (toolResult.success) {
              const entityName = userEntities.find(e => e.id === params.entity_id)?.name || 'Entità sconosciuta'
              
              // Restituisce un risultato strutturato che l'AI può processare
              return {
                success: true,
                entityName,
                numeroFattura: toolResult.summary!.numeroFattura,
                cliente: toolResult.summary!.cliente,
                imponibile: toolResult.summary!.imponibile,
                percentualeIva: toolResult.summary!.percentualeIva,
                totale: toolResult.summary!.totale,
                dataEmissione: toolResult.summary!.dataEmissione,
                dataScadenza: toolResult.summary!.dataScadenza,
                message: 'Fattura creata con successo! Mostra questo risultato all\'utente.'
              }
            } else {
              return {
                success: false,
                error: toolResult.error,
                message: 'Si è verificato un errore nella creazione della fattura. Mostra questo errore all\'utente.'
              }
            }
          }
        })
      },
      onStepFinish: ({ stepType, text, toolCalls, toolResults }) => {
        console.log('🎯 Step finished:', stepType)
        console.log('📝 Generated text:', text)
        console.log('🛠️ Tool calls:', toolCalls?.length || 0)
        console.log('📤 Tool results:', toolResults?.length || 0)
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