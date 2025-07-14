"use client";
import { useState } from "react";
import { Search, MessageCircle, Plus, MoreVertical } from "lucide-react";
import { ConversationItem } from "@/components/chat/ConversationItem";

// Mock data per le conversazioni
const mockConversations = [
  {
    id: "1",
    title: "Nuova Fattura - Alfa Srl",
    lastMessage: "Perfetto! Ho raccolto tutti i dati necessari per la fattura.",
    timestamp: "2024-01-15T10:30:00Z",
    unreadCount: 2,
    isActive: false,
  },
  {
    id: "2", 
    title: "Consulenza Fiscale",
    lastMessage: "Hai bisogno di aiuto con la fatturazione?",
    timestamp: "2024-01-15T09:15:00Z",
    unreadCount: 0,
    isActive: false,
  },
  {
    id: "3",
    title: "Fattura Beta Spa",
    lastMessage: "Sto elaborando i dati per la fattura di Beta Spa...",
    timestamp: "2024-01-14T16:45:00Z",
    unreadCount: 1,
    isActive: false,
  },
];



export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation] = useState<string | null>(null);

  const filteredConversations = mockConversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex">
        {/* Lista Conversazioni - Sidebar */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
                className="w-fit min-w-64 pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Lista Conversazioni */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={activeConversation === conversation.id}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? "Nessuna conversazione trovata" : "Nessuna conversazione"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {searchQuery 
                    ? "Prova a modificare i termini di ricerca"
                    : "Inizia una nuova conversazione con l'AI per creare la tua prima fattura"
                  }
                </p>
                {!searchQuery && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Nuova Chat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Area Principale - Desktop Only */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-4">
              Benvenuto in Fatture in Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Seleziona una conversazione dalla lista per iniziare a chattare con l&apos;AI, 
              oppure crea una nuova conversazione per generare fatture in modo semplice e veloce.
            </p>
            <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              Inizia Nuova Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 