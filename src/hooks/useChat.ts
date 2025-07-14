import { useState, useEffect, useCallback } from 'react'
import { Chat, ChatMessage, ChatBody } from '@/lib/supabase/types'

export function useChat(chatId: string) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const fetchChat = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/chats/${chatId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nel recupero della chat')
      }
      
      setChat(data.chat)
      
      // Estrai i messaggi dal body
      if (data.chat.body) {
        const chatBody = data.chat.body as ChatBody
        setMessages(chatBody.messages || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Errore nel recupero della chat:', err)
    } finally {
      setLoading(false)
    }
  }, [chatId])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    // Aggiungi il messaggio dell'utente immediatamente
    setMessages(prev => [...prev, userMessage])

    try {
      setIsTyping(true)
      
      // Invia il messaggio all'API
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newMessage: {
            role: 'user',
            content: content.trim()
          }
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio del messaggio')
      }

      // Aggiorna la chat con i nuovi dati
      setChat(data.chat)
      
      // Chiama l'API per la risposta dell'AI
      const aiResponse = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          messages: [...messages, userMessage]
        })
      })

      const aiData = await aiResponse.json()
      
      if (!aiResponse.ok) {
        throw new Error(aiData.error || 'Errore nella risposta dell\'AI')
      }

      // Aggiungi la risposta dell'AI
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiData.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])

      // Aggiorna la chat con la risposta dell'AI
      await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newMessage: {
            role: 'assistant',
            content: aiData.response
          }
        })
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'invio del messaggio')
      console.error('Errore nell\'invio del messaggio:', err)
      
      // Rimuovi il messaggio dell'utente in caso di errore
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsTyping(false)
    }
  }

  const updateChatName = async (name: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento del nome')
      }

      setChat(data.chat)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento del nome')
      console.error('Errore nell\'aggiornamento del nome:', err)
    }
  }

  useEffect(() => {
    if (chatId) {
      fetchChat()
    }
  }, [chatId, fetchChat])

  return {
    chat,
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    updateChatName,
    refetchChat: fetchChat
  }
} 