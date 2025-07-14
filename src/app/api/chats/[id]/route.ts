import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChatBody, ChatMessage } from '@/lib/supabase/types'
import { getOrCreateProfile } from '@/lib/supabase/profileUtils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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

    // Recupera la chat specifica
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .eq('profile_id', profile.id)
      .single()

    if (chatError) {
      if (chatError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chat non trovata' }, { status: 404 })
      }
      console.error('Errore nel recupero della chat:', chatError)
      return NextResponse.json({ error: 'Errore nel recupero della chat' }, { status: 500 })
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('Errore API chat GET:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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

    const { name, messages, newMessage } = await request.json()

    // Recupera la chat esistente per verificare la proprietà
    const { data: existingChat, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .eq('profile_id', profile.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chat non trovata' }, { status: 404 })
      }
      console.error('Errore nel recupero della chat:', fetchError)
      return NextResponse.json({ error: 'Errore nel recupero della chat' }, { status: 500 })
    }

    // Prepara i dati di aggiornamento
    const updateData: {
      edited_at: string;
      name?: string;
      body?: ChatBody;
    } = {
      edited_at: new Date().toISOString()
    }

    if (name !== undefined) {
      updateData.name = name
    }

    if (messages || newMessage) {
      let updatedMessages: ChatMessage[] = []
      
      if (messages) {
        // Aggiorna tutti i messaggi
        updatedMessages = messages
      } else if (newMessage) {
        // Aggiungi un nuovo messaggio
        const existingBody = existingChat.body as ChatBody
        updatedMessages = existingBody?.messages || []
        updatedMessages.push({
          id: crypto.randomUUID(),
          role: newMessage.role || 'user',
          content: newMessage.content,
          timestamp: new Date().toISOString()
        })
      }

      const updatedBody: ChatBody = {
        messages: updatedMessages,
        metadata: {
          lastActivity: new Date().toISOString(),
          messageCount: updatedMessages.length
        }
      }

      updateData.body = updatedBody
    }

    // Aggiorna la chat
    const { data: updatedChat, error: updateError } = await supabase
      .from('chats')
      .update(updateData)
      .eq('id', id)
      .eq('profile_id', profile.id)
      .select()
      .single()

    if (updateError) {
      console.error('Errore nell\'aggiornamento della chat:', updateError)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento della chat' }, { status: 500 })
    }

    return NextResponse.json({ chat: updatedChat })
  } catch (error) {
    console.error('Errore API chat PUT:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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

    // Elimina la chat
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', id)
      .eq('profile_id', profile.id)

    if (deleteError) {
      console.error('Errore nell\'eliminazione della chat:', deleteError)
      return NextResponse.json({ error: 'Errore nell\'eliminazione della chat' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Chat eliminata con successo' })
  } catch (error) {
    console.error('Errore API chat DELETE:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
} 