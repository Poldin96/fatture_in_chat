"use client";
import React, { useState, useEffect } from "react";
import { Plus, FilePlus, Info, Building2, Mail, Hash } from "lucide-react";
import { AddClientModal } from "@/components/AddClientModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Client, ClientBody } from "@/lib/supabase/types";
import { useEntity } from "@/contexts/EntityContext";

export default function ClientiPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedEntity } = useEntity();
  
  // Stato per il dialog di conferma eliminazione
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    clientId: '',
    clientName: '',
    isDeleting: false
  });

  // Carica i clienti tramite API
  useEffect(() => {
    if (selectedEntity) {
      loadClients();
    }
  }, [selectedEntity]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!selectedEntity) {
        setError('Nessuna entity selezionata');
        return;
      }
      
      const response = await fetch(`/api/clients?entity_id=${selectedEntity.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel caricamento dei clienti');
      }

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dei clienti');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClient = async (name: string, body: ClientBody) => {
    try {
      if (!selectedEntity) {
        throw new Error('Nessuna entity selezionata');
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, body, entity_id: selectedEntity.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel salvataggio del cliente');
      }

      const newClient = await response.json();
      
      // Aggiorna la lista dei clienti
      setClients(prev => [newClient, ...prev]);
    } catch (error) {
      console.error('Error saving client:', error);
      throw error; // Rilancia l'errore per essere gestito dal modal
    }
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    setDeleteDialog({
      isOpen: true,
      clientId,
      clientName,
      isDeleting: false
    });
  };

  const confirmDeleteClient = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      
      if (!selectedEntity) {
        throw new Error('Nessuna entity selezionata');
      }
      
      const response = await fetch(`/api/clients?id=${deleteDialog.clientId}&entity_id=${selectedEntity.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'eliminazione del cliente');
      }

      // Rimuovi il cliente dalla lista
      setClients(prev => prev.filter(client => client.id !== deleteDialog.clientId));
      
      // Chiudi il dialog
      setDeleteDialog({
        isOpen: false,
        clientId: '',
        clientName: '',
        isDeleting: false
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error instanceof Error ? error.message : 'Errore nell\'eliminazione del cliente');
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDeleteClient = () => {
    setDeleteDialog({
      isOpen: false,
      clientId: '',
      clientName: '',
      isDeleting: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-thin text-gray-900 dark:text-white">
                  Clienti
                </h1>
                {selectedEntity && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {selectedEntity.name}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Gestisci i tuoi clienti e le loro informazioni
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              <Plus size={20} />
              <span>Aggiungi cliente</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-red-600 dark:text-red-400">
                ⚠️ {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Caricamento clienti...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Nessun cliente trovato
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus size={16} />
                  Aggiungi il primo cliente
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      P.IVA
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {client.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {client.body?.companyType || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {client.body?.piva || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {client.body?.email || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors duration-200">
                            <FilePlus size={14} />
                            <span className="hidden sm:inline">Nuova richiesta</span>
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                            <Info size={14} />
                            <span className="hidden sm:inline">Dettagli</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(client.id, client.name || 'Cliente senza nome')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium rounded-full hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-200"
                          >
                            <span className="hidden sm:inline">Elimina</span>
                            <span className="sm:hidden">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        {!isLoading && clients.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Mostrando {clients.length} {clients.length === 1 ? 'cliente' : 'clienti'}
            </p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDeleteClient}
        onConfirm={confirmDeleteClient}
        title="Elimina cliente"
        message={`Sei sicuro di voler eliminare il cliente "${deleteDialog.clientName}"? Questa azione non può essere annullata.`}
        confirmText="Elimina cliente"
        cancelText="Annulla"
        confirmVariant="danger"
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
} 