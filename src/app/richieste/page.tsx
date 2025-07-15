"use client";
import React, { useState, useEffect } from "react";
import { FilePlus, Clock, CheckCircle, XCircle, FileText, Receipt, Building2, Info } from "lucide-react";
import { useEntity } from "@/contexts/EntityContext";
import { AddRequestModal } from "@/components/AddRequestModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RequestDetailSheet } from "@/components/RequestDetailSheet";
import { Request, RequestType, RequestBody, REQUEST_TYPES, isFatturaBody, isCostoBody } from "@/lib/supabase/requestTypes";

export default function RichiestePage() {
  const { selectedEntity } = useEntity();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stato per il dialog di conferma eliminazione
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    requestId: '',
    requestName: '',
    isDeleting: false
  });

  // Stato per il sheet dei dettagli
  const [detailsSheet, setDetailsSheet] = useState({
    isOpen: false,
    requestId: ''
  });

  // Carica le richieste tramite API
  useEffect(() => {
    if (selectedEntity) {
      loadRequests();
    }
  }, [selectedEntity]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!selectedEntity) {
        setError('Nessuna entity selezionata');
        return;
      }
      
      const response = await fetch(`/api/requests?entity_id=${selectedEntity.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel caricamento delle richieste');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError(error instanceof Error ? error.message : 'Errore nel caricamento delle richieste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRequest = async (type: RequestType, body: RequestBody) => {
    try {
      if (!selectedEntity) {
        throw new Error('Nessuna entity selezionata');
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, body, entity_id: selectedEntity.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel salvataggio della richiesta');
      }

      const newRequest = await response.json();
      
      // Aggiorna la lista delle richieste
      setRequests(prev => [newRequest, ...prev]);
    } catch (error) {
      console.error('Error saving request:', error);
      throw error; // Rilancia l'errore per essere gestito dal modal
    }
  };

  const handleDeleteRequest = (requestId: string, requestName: string) => {
    setDeleteDialog({
      isOpen: true,
      requestId,
      requestName,
      isDeleting: false
    });
  };

  const handleViewDetails = (requestId: string) => {
    setDetailsSheet({
      isOpen: true,
      requestId
    });
  };

  const handleCloseDetails = () => {
    setDetailsSheet({
      isOpen: false,
      requestId: ''
    });
  };

  const confirmDeleteRequest = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      
      if (!selectedEntity) {
        throw new Error('Nessuna entity selezionata');
      }
      
      const response = await fetch(`/api/requests?id=${deleteDialog.requestId}&entity_id=${selectedEntity.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'eliminazione della richiesta');
      }

      // Rimuovi la richiesta dalla lista
      setRequests(prev => prev.filter(request => request.id !== deleteDialog.requestId));
      
      // Chiudi il dialog
      setDeleteDialog({
        isOpen: false,
        requestId: '',
        requestName: '',
        isDeleting: false
      });
    } catch (error) {
      console.error('Error deleting request:', error);
      setError(error instanceof Error ? error.message : 'Errore nell\'eliminazione della richiesta');
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDeleteRequest = () => {
    setDeleteDialog({
      isOpen: false,
      requestId: '',
      requestName: '',
      isDeleting: false
    });
  };

  // Funzione per ottenere l'intestatario dalla richiesta
  const getIntestatario = (request: Request) => {
    if (isFatturaBody(request.body)) {
      return request.body.debitore.denominazione;
    } else if (isCostoBody(request.body)) {
      return request.body.fornitore.denominazione;
    }
    return 'N/A';
  };

  // Funzione per ottenere l'icona del tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case REQUEST_TYPES.FATTURA:
        return <FileText className="w-4 h-4 text-blue-600" />;
      case REQUEST_TYPES.COSTO:
        return <Receipt className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Funzione per ottenere l'etichetta del tipo
  const getTypeLabel = (type: string) => {
    switch (type) {
      case REQUEST_TYPES.FATTURA:
        return 'Fattura';
      case REQUEST_TYPES.COSTO:
        return 'Costo';
      default:
        return 'Sconosciuto';
    }
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
                  Richieste
                </h1>
                {selectedEntity && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {selectedEntity.name}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Richieste pervenute da dialoghi con l&apos;AI nelle chat
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              <FilePlus size={20} />
              <span>Nuova richiesta</span>
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

        {/* Requests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Caricamento richieste...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center">
                <FilePlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Nessuna richiesta trovata
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FilePlus size={16} />
                  Aggiungi la prima richiesta
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipologia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Intestatario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Oggetto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.type)}
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getTypeLabel(request.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getIntestatario(request)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {request.body.oggetto}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : request.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {request.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {request.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                          {request.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {request.status === "approved" ? "Approvata" : request.status === "rejected" ? "Rifiutata" : "In attesa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(request.created_at).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewDetails(request.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            <Info size={14} />
                            <span className="hidden sm:inline">Dettagli</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(request.id, request.body.oggetto)}
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
        {!isLoading && requests.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Mostrando {requests.length} {requests.length === 1 ? 'richiesta' : 'richieste'}
            </p>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      <AddRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRequest}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDeleteRequest}
        onConfirm={confirmDeleteRequest}
        title="Elimina richiesta"
        message={`Sei sicuro di voler eliminare la richiesta "${deleteDialog.requestName}"? Questa azione non può essere annullata.`}
        confirmText="Elimina richiesta"
        cancelText="Annulla"
        confirmVariant="danger"
        isLoading={deleteDialog.isDeleting}
      />

      {/* Request Details Sheet */}
      <RequestDetailSheet
        isOpen={detailsSheet.isOpen}
        onClose={handleCloseDetails}
        requestId={detailsSheet.requestId}
      />
    </div>
  );
} 