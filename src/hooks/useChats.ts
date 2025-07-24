import { useState, useEffect } from 'react'
import { ChatWithLastMessage } from '@/lib/supabase/types'

export function useChats() {
  const [chats, setChats] = useState<ChatWithLastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/chats')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nel recupero delle chat')
      }
      
      setChats(data.chats || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Errore nel recupero delle chat:', err)
    } finally {
      setLoading(false)
    }
  }

  const createChat = async (name?: string, initialMessage?: string) => {
    try {
      // Messaggio di benvenuto automatico se non viene fornito un messaggio iniziale
      const welcomeMessage = initialMessage || `👋 **Ciao! Sono l'AI di Fatture in Chat**

Sono qui per aiutarti a:
• ✏️ Creare nuove fatture
• 👥 Gestire i clienti
• 📊 Consultare lo storico
• 🔍 Cercare documenti

Come posso aiutarti oggi?`

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name || 'Nuova Chat',
          initialMessage: welcomeMessage
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nella creazione della chat')
      }
      
      // Invece di ricaricare tutte le chat, aggiungiamo direttamente la nuova chat allo stato
      const newChatWithMessage: ChatWithLastMessage = {
        ...data.chat,
        lastMessage: welcomeMessage.length > 100 ? welcomeMessage.substring(0, 100) + '...' : welcomeMessage,
        messageCount: 1,
        unreadCount: 0
      }
      
      // Aggiungiamo la nuova chat in cima alla lista (più recente)
      setChats(prevChats => [newChatWithMessage, ...prevChats])
      
      return data.chat
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione della chat')
      console.error('Errore nella creazione della chat:', err)
      throw err
    }
  }

  const refreshChats = () => {
    fetchChats()
  }

  useEffect(() => {
    fetchChats()
  }, [])

  return {
    chats,
    loading,
    error,
    createChat,
    refreshChats,
  }
} 