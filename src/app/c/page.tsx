"use client";
import { useState } from "react";
import { MessageCircle, Plus, Loader2 } from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { createChat } = useChats();
  const router = useRouter();

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

  return (
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
          <button 
            onClick={handleCreateChat}
            disabled={isCreating}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors mx-auto disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isCreating ? 'Creazione Chat...' : 'Inizia Nuova Chat'}
          </button>
        </div>
      </div>
    );
} 