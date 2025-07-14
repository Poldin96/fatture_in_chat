"use client";
import Link from "next/link";
import { useState, useRef, useEffect, use } from "react";
import { ArrowLeft, MoreVertical, Search, Plus } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

// Mock data per la conversazione
const mockConversations = [
  {
    id: "1",
    title: "Nuova Fattura - Alfa Srl",
    lastMessage: "Perfetto! Ho raccolto tutti i dati necessari per la fattura.",
    timestamp: "2024-01-15T10:30:00Z",
    unreadCount: 2,
  },
  {
    id: "2", 
    title: "Consulenza Fiscale",
    lastMessage: "Hai bisogno di aiuto con la fatturazione?",
    timestamp: "2024-01-15T09:15:00Z",
    unreadCount: 0,
  },
  {
    id: "3",
    title: "Fattura Beta Spa",
    lastMessage: "Sto elaborando i dati per la fattura di Beta Spa...",
    timestamp: "2024-01-14T16:45:00Z",
    unreadCount: 1,
  },
];

const mockMessages = [
  {
    id: "1",
    text: "Ciao! Sono l'AI di Fatture in Chat. Come posso aiutarti oggi?",
    sender: "ai" as const,
    timestamp: "2024-01-15T10:00:00Z",
    status: "delivered" as const
  },
  {
    id: "2",
    text: "Devo creare una fattura per Alfa Srl per 2500 euro per servizi di consulenza",
    sender: "user" as const,
    timestamp: "2024-01-15T10:01:00Z",
    status: "delivered" as const
  },
  {
    id: "3",
    text: "Perfetto! Ho raccolto i seguenti dati:\n\n🏢 **Cliente**: Alfa Srl\n💰 **Importo**: €2.500,00\n📋 **Servizio**: Consulenza\n\nMi puoi fornire maggiori dettagli sul tipo di consulenza prestata?",
    sender: "ai" as const,
    timestamp: "2024-01-15T10:02:00Z",
    status: "delivered" as const
  },
  {
    id: "4",
    text: "Consulenza strategica e fiscale per l'anno 2024",
    sender: "user" as const,
    timestamp: "2024-01-15T10:03:00Z",
    status: "delivered" as const
  },
  {
    id: "5",
    text: "Eccellente! Ecco il riepilogo completo:\n\n✅ **Dati Fattura Raccolti**\n🏢 Cliente: Alfa Srl\n💰 Importo: €2.500,00 + IVA 22%\n📋 Oggetto: Consulenza strategica e fiscale anno 2024\n📅 Data: 15/01/2024\n\nTutti i dati sono stati registrati nel sistema. Il tuo commercialista riceverà una notifica con i dettagli completi.",
    sender: "ai" as const,
    timestamp: "2024-01-15T10:04:00Z",
    status: "delivered" as const
  },
];



export default function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { id } = use(params);
  const conversationId = id;
  const currentConversation = mockConversations.find(c => c.id === conversationId);

  const filteredConversations = mockConversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
      status: "delivered" as const
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // Simula risposta AI
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: "Grazie per il messaggio! Sto elaborando la tua richiesta...",
        sender: "ai" as const,
        timestamp: new Date().toISOString(),
        status: "delivered" as const
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

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
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca conversazioni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Lista Conversazioni */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === conversationId}
              />
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
                  {currentConversation?.title || "Conversazione"}
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
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 