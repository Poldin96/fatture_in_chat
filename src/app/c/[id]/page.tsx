"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Loader2, AlertCircle } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useChats } from "@/hooks/useChats";
import React from "react";

export default function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id } = React.use(params);
  
  const { chat, messages, loading, error, isTyping, sendMessage } = useChat(id);
  const { chats } = useChats();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Caricamento chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Errore nel caricamento
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link 
            href="/c"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Torna alle chat
          </Link>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Chat non trovata
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La chat che stai cercando non esiste o non hai i permessi per accedervi.
          </p>
          <Link 
            href="/c"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Torna alle chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex">
        {/* Lista Conversazioni - Hidden on Mobile */}
        <div className="hidden lg:flex w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chat AI
              </h1>
            </div>
          </div>
          
          {/* Lista Conversazioni */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((conversation) => (
              <Link key={conversation.id} href={`/c/${conversation.id}`}>
                <div className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer border-l-4 ${
                  conversation.id === id
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500' 
                    : 'border-transparent'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate pr-2">
                      {conversation.name || 'Chat senza titolo'}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {new Date(conversation.edited_at || conversation.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate leading-relaxed">
                    {conversation.lastMessage || 'Nessun messaggio'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Area Chat */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {/* Header Chat */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/c" className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {chat.name || "Chat senza titolo"}
                </h2>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Messaggi */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Inizia la conversazione
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Scrivi un messaggio per iniziare a chattare con l&apos;AI per le tue fatture
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
        </div>
      </div>
    </div>
  );
} 