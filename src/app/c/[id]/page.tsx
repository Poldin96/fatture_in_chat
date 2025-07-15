"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useEntity } from "@/contexts/EntityContext";
import React from "react";

export default function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id } = React.use(params);
  const { selectedEntity } = useEntity();
  
  const { chat, messages, loading, error, isTyping, sendMessage } = useChat(id, selectedEntity?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Caricamento chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-screen">
      
      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-0">
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
      
      {/* Input Area - Fisso in fondo */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
      </div>
    </div>
  );
} 