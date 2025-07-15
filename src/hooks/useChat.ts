import { useState, useEffect, useCallback } from 'react'
import { Chat, ChatMessage, ChatBody } from '@/lib/supabase/types'
import { useChat as useAIChat } from 'ai/react'

export function useChat(chatId: string, entityId?: string) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Usa l'AI SDK per lo streaming
  const {
    isLoading: isStreaming,
    append: appendMessage,
    messages: streamMessages,
    setMessages: setStreamMessages,
  } = useAIChat({
    api: '/api/chat-ai-stream',
    body: { entityId },
    onError: (error) => {
      console.error('❌ Errore AI:', error)
      setError(error.message)
    },
    onFinish: async (message) => {
      // Debug: log del messaggio dell'AI
      console.log('🔍 Messaggio AI completato:', message.content)
      console.log('🔍 Messaggio AI completo:', message)
      
      // Salva il messaggio dell'AI nel database quando lo streaming finisce
      await saveMessageToDatabase(message.content, 'assistant')
    }
  })

  // Funzione per salvare i messaggi nel database
  const saveMessageToDatabase = async (content: string, role: 'user' | 'assistant') => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newMessage: {
            role,
            content
          }
        })
      })
    } catch (error) {
      console.error('Errore nel salvataggio del messaggio:', error)
    }
  }

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
        const chatMessages = chatBody.messages || []
        setMessages(chatMessages)
        
        // Sincronizza i messaggi con l'AI SDK
        const aiMessages = chatMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.timestamp)
        }))
        setStreamMessages(aiMessages)
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
    if (!entityId) {
      setError('Nessuna entità selezionata')
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    // Aggiungi il messaggio dell'utente immediatamente
    setMessages(prev => [...prev, userMessage])

    try {
      // Salva il messaggio dell'utente nel database
      await saveMessageToDatabase(content.trim(), 'user')
      
      // Invia il messaggio all'API per lo streaming
      await appendMessage({
        role: 'user',
        content: content.trim()
      })

      // Aggiorna la chat con i nuovi dati
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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'invio del messaggio')
      console.error('Errore nell\'invio del messaggio:', err)
      
      // Rimuovi il messaggio dell'utente in caso di errore
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
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

  // Converti i messaggi stream in ChatMessage (solo user/assistant)
  const convertedMessages = streamMessages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      id: msg.id || crypto.randomUUID(),
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt?.toISOString() || new Date().toISOString()
    }))

  return {
    chat,
    messages: streamMessages.length > 0 ? convertedMessages : messages,
    loading,
    error,
    isTyping: isStreaming,
    sendMessage,
    updateChatName,
    refetchChat: fetchChat
  }
} 