import { NextRequest, NextResponse } from 'next/server'
import { ChatMessage } from '@/lib/supabase/types'

// Funzione per generare risposta dell'AI (simulata)
function generateAIResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]
  const userMessage = lastMessage.content.toLowerCase()

  // Risposte basate su parole chiave per le fatture
  if (userMessage.includes('fattura') || userMessage.includes('invoice')) {
    if (userMessage.includes('crea') || userMessage.includes('nuova') || userMessage.includes('genera')) {
      return `🏢 **Creazione Fattura**

Perfetto! Ti aiuto a creare una nuova fattura. Ho bisogno di alcune informazioni:

📋 **Dati necessari:**
• Nome del cliente
• Importo (con o senza IVA)
• Descrizione del servizio/prodotto
• Data di emissione (opzionale)

Puoi fornirmi questi dati?`
    }
    
    if (userMessage.includes('cliente') || userMessage.includes('azienda')) {
      return `👥 **Gestione Cliente**

Perfetto! Per registrare il cliente ho bisogno di:

🏢 **Dati Cliente:**
• Ragione sociale
• Partita IVA
• Codice fiscale
• Indirizzo
• Email (opzionale)

Puoi fornirmi questi dati?`
    }
  }

  // Estrazione automatica di informazioni da messaggi
  const companyMatch = userMessage.match(/(\w+\s+srl|\w+\s+spa|\w+\s+s\.r\.l\.|\w+\s+s\.p\.a\.)/i)
  const amountMatch = userMessage.match(/(\d+(?:\.\d{3})*(?:,\d{2})?)\s*(?:euro|€|eur)/i)
  const serviceMatch = userMessage.match(/(?:consulenza|servizio|prodotto|vendita|assistenza)\s+([^.]+)/i)

  if (companyMatch || amountMatch || serviceMatch) {
    let response = `✅ **Dati Raccolti**\n\n`
    
    if (companyMatch) {
      response += `🏢 **Cliente**: ${companyMatch[1]}\n`
    }
    
    if (amountMatch) {
      const amount = amountMatch[1]
      response += `💰 **Importo**: €${amount}\n`
    }
    
    if (serviceMatch) {
      response += `📋 **Servizio**: ${serviceMatch[1]}\n`
    }
    
    response += `\n📅 **Data**: ${new Date().toLocaleDateString('it-IT')}\n`
    
    if (companyMatch && amountMatch && serviceMatch) {
      response += `\n🎉 **Fattura Pronta!**\nTutti i dati sono stati registrati. Vuoi che proceda con l'invio al commercialista?`
    } else {
      response += `\n❓ **Informazioni Mancanti**\nMi mancano ancora alcuni dati per completare la fattura. Puoi fornirmeli?`
    }
    
    return response
  }

  // Saluti e messaggi generici
  if (userMessage.includes('ciao') || userMessage.includes('salve') || userMessage.includes('buongiorno')) {
    return `👋 **Ciao! Sono l'AI di Fatture in Chat**

Sono qui per aiutarti a:
• ✏️ Creare nuove fatture
• 👥 Gestire i clienti
• 📊 Consultare lo storico
• 🔍 Cercare documenti

Come posso aiutarti oggi?`
  }

  if (userMessage.includes('grazie') || userMessage.includes('perfetto') || userMessage.includes('bene')) {
    return `😊 **Prego!**

Sono felice di esserti utile. C'è altro che posso fare per te?

💡 **Suggerimento**: Puoi dire "crea fattura" per iniziare una nuova fattura velocemente!`
  }

  if (userMessage.includes('aiuto') || userMessage.includes('help')) {
    return `🆘 **Guida Rapida**

Ecco cosa posso fare per te:

**📝 Fatture:**
• "Crea fattura per [Cliente]"
• "Fattura da [Importo] euro"
• "Servizio di [Descrizione]"

**👥 Clienti:**
• "Nuovo cliente [Nome]"
• "Dati cliente [Nome]"

**📊 Consultazione:**
• "Storico fatture"
• "Fatture del mese"

Prova a scrivere quello che vuoi fare!`
  }

  // Risposta generica
  return `🤖 **Assistente AI per Fatture**

Ho capito che vuoi "${lastMessage.content}"

Ti posso aiutare con:
• 📋 Creazione fatture
• 👥 Gestione clienti
• 💰 Calcoli fiscali
• 📊 Reportistica

Puoi essere più specifico su cosa vuoi fare? Ad esempio:
• "Crea una fattura per..."
• "Aggiungi cliente..."
• "Calcola IVA su..."`
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, messages } = await request.json()

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Dati richiesti mancanti' }, { status: 400 })
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Nessun messaggio fornito' }, { status: 400 })
    }

    // Genera la risposta dell'AI
    const aiResponse = generateAIResponse(messages)

    // Simula un piccolo delay per sembrare più realistico
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ 
      response: aiResponse,
      chatId 
    })

  } catch (error) {
    console.error('Errore API chat-ai:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
} 