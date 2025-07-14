"use client";
import Link from "next/link";
import { useState } from "react";
import { UserSquare, ListChecks, User, LogOut, ChevronsLeft, ChevronsRight, MessageCircle, ExternalLink, Building2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";
import { Entity, useEntity } from "@/contexts/EntityContext";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
  const { entities, selectedEntity, setSelectedEntity, isLoading: isLoadingEntities } = useEntity();
  const router = useRouter();

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsEntityDropdownOpen(false);
  };

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
        <div className="space-y-4">
          {/* Entity Selector */}
          {!collapsed && (
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Entità fiscale
              </label>
              
              {isLoadingEntities ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Caricamento...</span>
                </div>
              ) : entities.length === 0 ? (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Nessuna entità</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedEntity?.name || 'Seleziona entità'}
                        </div>
                        {selectedEntity?.body?.tipo && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedEntity.body.tipo}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isEntityDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isEntityDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {entities.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => handleEntitySelect(entity)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            selectedEntity?.id === entity.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <Building2 size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {entity.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {entity.body?.tipo || 'N/A'} • {entity.role}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Collapsed entity indicator */}
          {collapsed && selectedEntity && (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Building2 size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          )}
          
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
      </div>
    </aside>
  );
} 