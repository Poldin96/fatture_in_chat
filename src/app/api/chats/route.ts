import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChatWithLastMessage, ChatBody, ChatMessage } from '@/lib/supabase/types'
import { getOrCreateProfile } from '@/lib/supabase/profileUtils'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verifica l'autenticazione
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni o crea il profilo
    const profile = await getOrCreateProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Impossibile ottenere il profilo' }, { status: 500 })
    }

    // Recupera le chat dell'utente ordinandole per data di modifica (più recenti prima)
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('profile_id', profile.id)
      .order('edited_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (chatsError) {
      console.error('Errore nel recupero delle chat:', chatsError)
      return NextResponse.json({ error: 'Errore nel recupero delle chat' }, { status: 500 })
    }

    // Processa le chat per estrarre informazioni aggiuntive
    const processedChats: ChatWithLastMessage[] = (chats || []).map(chat => {
      let lastMessage = ''
      let messageCount = 0
      
      if (chat.body) {
        try {
          const chatBody = chat.body as ChatBody
          if (chatBody.messages && Array.isArray(chatBody.messages)) {
            messageCount = chatBody.messages.length
            // Ottieni l'ultimo messaggio
            if (chatBody.messages.length > 0) {
              const lastMsg = chatBody.messages[chatBody.messages.length - 1]
              lastMessage = lastMsg.content || ''
              // Limita la lunghezza dell'ultimo messaggio per l'anteprima
              if (lastMessage.length > 100) {
                lastMessage = lastMessage.substring(0, 100) + '...'
              }
            }
          }
        } catch (error) {
          console.error('Errore nel parsing del body della chat:', error)
        }
      }

      return {
        ...chat,
        lastMessage,
        messageCount,
        unreadCount: 0 // Per ora impostiamo a 0, in futuro possiamo implementare la logica
      }
    })

    return NextResponse.json({ chats: processedChats })
  } catch (error) {
    console.error('Errore API chats:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verifica l'autenticazione
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni o crea il profilo
    const profile = await getOrCreateProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Impossibile ottenere il profilo' }, { status: 500 })
    }

    const { name, initialMessage } = await request.json()

    // Crea i messaggi iniziali
    const messages: ChatMessage[] = []
    
    if (initialMessage) {
      // Aggiungi il messaggio di benvenuto dell'AI
      messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date().toISOString()
      })
    }

    // Crea una nuova chat
    const newChatBody: ChatBody = {
      messages,
      metadata: {
        lastActivity: new Date().toISOString(),
        messageCount: messages.length
      }
    }

    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert({
        name: name || 'Nuova Chat',
        profile_id: profile.id,
        body: newChatBody,
        edited_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Errore nella creazione della chat:', createError)
      return NextResponse.json({ error: 'Errore nella creazione della chat' }, { status: 500 })
    }

    return NextResponse.json({ chat: newChat })
  } catch (error) {
    console.error('Errore API chats POST:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
} 