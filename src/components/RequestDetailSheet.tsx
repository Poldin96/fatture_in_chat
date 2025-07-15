"use client";
import React, { useEffect, useState } from "react";
import { X, FileText, Receipt, Building2, Calendar, CreditCard, DollarSign, Hash, MapPin, Info } from "lucide-react";
import { Request, RequestBody, isFatturaBody, isCostoBody, REQUEST_TYPES } from "@/lib/supabase/requestTypes";
import { useEntity } from "@/contexts/EntityContext";

interface RequestDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export const RequestDetailSheet: React.FC<RequestDetailSheetProps> = ({
  isOpen,
  onClose,
  requestId
}) => {
  const { selectedEntity } = useEntity();
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && requestId && selectedEntity) {
      loadRequestDetails();
    }
  }, [isOpen, requestId, selectedEntity]);

  const loadRequestDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/requests/${requestId}?entity_id=${selectedEntity!.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel caricamento dei dettagli');
      }

      const data = await response.json();
      setRequest(data);
    } catch (error) {
      console.error('Error loading request details:', error);
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dei dettagli');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestione click sull'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Gestione ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case REQUEST_TYPES.FATTURA:
        return <FileText className="w-5 h-5 text-blue-600" />;
      case REQUEST_TYPES.COSTO:
        return <Receipt className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Approvata
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Rifiutata
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            In attesa
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderFatturaDetails = (body: RequestBody) => {
    if (!isFatturaBody(body)) return null;

    return (
      <div className="space-y-6">
        {/* Informazioni della fattura */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informazioni fattura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Numero:</span>
              <span className="font-medium text-gray-900 dark:text-white">{body.numeroFattura}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Data emissione:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(body.dataEmissione)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Data scadenza:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(body.dataScadenza)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Pagamento:</span>
              <span className="font-medium text-gray-900 dark:text-white">{body.modalitaPagamento}</span>
            </div>
          </div>
        </div>

        {/* Informazioni debitore */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Debitore
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {body.debitore.denominazione}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">P.IVA:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {body.debitore.partitaIva}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">PEC:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {body.debitore.pec}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400">Indirizzo:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {body.debitore.indirizzo}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Città:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {body.debitore.citta} ({body.debitore.provincia}) - {body.debitore.cap}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Importi */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Importi
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Imponibile</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(body.imponibile)}
                </p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">IVA ({body.percentualeIva}%)</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(body.iva)}
                </p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Totale</span>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(body.importoTotale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCostoDetails = (body: RequestBody) => {
    if (!isCostoBody(body)) return null;

    return (
      <div className="space-y-6">
        {/* Informazioni del costo */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informazioni costo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Data documento:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(body.dataDocumento)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Pagamento:</span>
              <span className="font-medium text-gray-900 dark:text-white">{body.modalitaPagamento}</span>
            </div>
          </div>
        </div>

        {/* Informazioni fornitore */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fornitore
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {body.fornitore.denominazione}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">P.IVA:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {body.fornitore.partitaIva || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">CF:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {body.fornitore.codiceFiscale || 'N/A'}
                </span>
              </div>
              {body.fornitore.indirizzo && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 dark:text-gray-400">Indirizzo:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {body.fornitore.indirizzo}
                  </span>
                </div>
              )}
              {body.fornitore.citta && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Città:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {body.fornitore.citta} 
                    {body.fornitore.provincia && ` (${body.fornitore.provincia})`}
                    {body.fornitore.cap && ` - ${body.fornitore.cap}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Importi */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Importi
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Imponibile</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(body.imponibile)}
                </p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">IVA ({body.percentualeIva}%)</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(body.iva)}
                </p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Totale</span>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(body.importoTotale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleOverlayClick}
      />
      
      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {request && getTypeIcon(request.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dettagli richiesta
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {request && getTypeLabel(request.type)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <Info className="w-12 h-12 mx-auto mb-2" />
                <p>{error}</p>
              </div>
              <button
                onClick={loadRequestDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Riprova
              </button>
            </div>
          ) : request ? (
            <div className="space-y-6">
              {/* Informazioni generali */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informazioni generali
                  </h3>
                  {getStatusBadge(request.status)}
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Oggetto:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {request.body.oggetto}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Data creazione:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dettagli specifici per tipo */}
              {request.type === REQUEST_TYPES.FATTURA && renderFatturaDetails(request.body)}
              {request.type === REQUEST_TYPES.COSTO && renderCostoDetails(request.body)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}; 