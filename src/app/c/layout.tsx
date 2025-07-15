"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, MessageCircle, Plus, MoreVertical, Loader2 } from "lucide-react";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { useChats } from "@/hooks/useChats";
import { useRouter } from "next/navigation";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { chats, loading, error, createChat } = useChats();
  const router = useRouter();
  const pathname = usePathname();
  
  // Controlla se siamo nella chat specifica (nasconde sidebar su mobile)
  const isInSpecificChat = pathname !== '/c';

  const filteredConversations = chats.filter(chat =>
    (chat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChat = async () => {
    try {
      setIsCreating(true);
      const newChat = await createChat();
      router.push(`/c/${newChat.id}`);
    } catch (err) {
      console.error('Errore nella creazione della chat:', err);
    } finally {
      setIsCreating(false);
    }
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
          <MessageCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Errore nel caricamento
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex">
        {/* Sidebar delle Chat - Persistente */}
        <div className={`w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
          isInSpecificChat ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chat AI
              </h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCreateChat}
                  disabled={isCreating}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                  title="Nuova chat"
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
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
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
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
                  <button 
                    onClick={handleCreateChat}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isCreating ? 'Creazione...' : 'Nuova Chat'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Area Principale - Contenuto dinamico */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
} 