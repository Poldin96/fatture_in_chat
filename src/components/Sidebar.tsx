"use client";
import Link from "next/link";
import { useState } from "react";
import { UserSquare, ListChecks, User, LogOut, ChevronsLeft, ChevronsRight, MessageCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className={`bg-white/95 dark:bg-black/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col justify-between min-h-screen transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <span className="text-lg font-medium text-gray-900 dark:text-white tracking-tight">fatture in chat</span>
          )}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Espandi sidebar' : 'Collassa sidebar'}
          >
            {collapsed ? 
              <ChevronsRight size={18} className="text-gray-500 dark:text-gray-400" /> : 
              <ChevronsLeft size={18} className="text-gray-500 dark:text-gray-400" />
            }
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          <Link 
            href="/c" 
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-medium"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <MessageCircle size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Chat AI</span>
                <ExternalLink size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200" />
              </div>
            )}
          </Link>
          
          <Link 
            href="/clienti" 
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-medium"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <UserSquare size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </div>
            {!collapsed && <span className="text-sm">Clienti</span>}
          </Link>
          
          <Link 
            href="/richieste" 
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-medium"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <ListChecks size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </div>
            {!collapsed && <span className="text-sm">Richieste</span>}
          </Link>
        </nav>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-6 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="space-y-2">
          <Link 
            href="/profilo" 
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 font-medium"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <User size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </div>
            {!collapsed && <span className="text-sm">Profilo</span>}
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium w-full text-left"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </div>
            {!collapsed && <span className="text-sm">Esci</span>}
          </button>
        </div>
      </div>
    </aside>
  );
} 