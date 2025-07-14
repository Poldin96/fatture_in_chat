"use client";
import React, { useState } from "react";
import { X, FileText, Receipt, Save, Loader2 } from "lucide-react";
import { 
  REQUEST_TYPES, 
  RequestType, 
  RequestBody, 
  FatturaBody, 
  CostoBody,
  MODALITA_PAGAMENTO,
  CATEGORIE_COSTO,
  TIPI_DOCUMENTO,
  REGIME_FISCALE
} from "@/lib/supabase/requestTypes";

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: RequestType, body: RequestBody) => Promise<void>;
}

export function AddRequestModal({ isOpen, onClose, onSave }: AddRequestModalProps) {
  const [selectedType, setSelectedType] = useState<RequestType>(REQUEST_TYPES.FATTURA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stato per fattura
  const [fatturaData, setFatturaData] = useState<FatturaBody>({
    debitore: {
      denominazione: "",
      partitaIva: "",
      codiceFiscale: "",
      indirizzo: "",
      cap: "",
      citta: "",
      provincia: "",
      pec: "",
      codiceDestinatario: ""
    },
    numeroFattura: "",
    dataEmissione: "",
    dataScadenza: "",
    imponibile: 0,
    iva: 0,
    percentualeIva: 22,
    importoTotale: 0,
    oggetto: "",
    descrizione: "",
    modalitaPagamento: MODALITA_PAGAMENTO[0],
    causale: "",
    note: "",
    regimeFiscale: REGIME_FISCALE[0]
  });

  // Stato per costo
  const [costoData, setCostoData] = useState<CostoBody>({
    fornitore: {
      denominazione: "",
      partitaIva: "",
      codiceFiscale: "",
      indirizzo: "",
      cap: "",
      citta: "",
      provincia: ""
    },
    numeroDocumento: "",
    dataDocumento: "",
    tipoDocumento: TIPI_DOCUMENTO[0],
    imponibile: 0,
    iva: 0,
    percentualeIva: 22,
    importoTotale: 0,
    categoria: CATEGORIE_COSTO[0],
    sottocategoria: "",
    oggetto: "",
    descrizione: "",
    modalitaPagamento: MODALITA_PAGAMENTO[0],
    dataPagamento: "",
    deducibilita: {
      percentuale: 100,
      importoDeducibile: 0,
      note: ""
    },
    centroCosto: "",
    progetto: "",
    note: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const body = selectedType === REQUEST_TYPES.FATTURA ? fatturaData : costoData;
      
      // Validazione base
      if (selectedType === REQUEST_TYPES.FATTURA) {
        if (!fatturaData.debitore.denominazione || !fatturaData.numeroFattura || !fatturaData.oggetto) {
          throw new Error("Compilare tutti i campi obbligatori");
        }
      } else {
        if (!costoData.fornitore.denominazione || !costoData.numeroDocumento || !costoData.oggetto) {
          throw new Error("Compilare tutti i campi obbligatori");
        }
      }

      await onSave(selectedType, body);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Errore durante il salvataggio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedType(REQUEST_TYPES.FATTURA);
    setFatturaData({
      debitore: {
        denominazione: "",
        partitaIva: "",
        codiceFiscale: "",
        indirizzo: "",
        cap: "",
        citta: "",
        provincia: "",
        pec: "",
        codiceDestinatario: ""
      },
      numeroFattura: "",
      dataEmissione: "",
      dataScadenza: "",
      imponibile: 0,
      iva: 0,
      percentualeIva: 22,
      importoTotale: 0,
      oggetto: "",
      descrizione: "",
      modalitaPagamento: MODALITA_PAGAMENTO[0],
      causale: "",
      note: "",
      regimeFiscale: REGIME_FISCALE[0]
    });
    setCostoData({
      fornitore: {
        denominazione: "",
        partitaIva: "",
        codiceFiscale: "",
        indirizzo: "",
        cap: "",
        citta: "",
        provincia: ""
      },
      numeroDocumento: "",
      dataDocumento: "",
      tipoDocumento: TIPI_DOCUMENTO[0],
      imponibile: 0,
      iva: 0,
      percentualeIva: 22,
      importoTotale: 0,
      categoria: CATEGORIE_COSTO[0],
      sottocategoria: "",
      oggetto: "",
      descrizione: "",
      modalitaPagamento: MODALITA_PAGAMENTO[0],
      dataPagamento: "",
      deducibilita: {
        percentuale: 100,
        importoDeducibile: 0,
        note: ""
      },
      centroCosto: "",
      progetto: "",
      note: ""
    });
    setError(null);
    onClose();
  };

  // Funzione per calcolare importo totale
  const calculateTotal = (imponibile: number, iva: number) => {
    return imponibile + iva;
  };

  // Funzione per calcolare IVA
  const calculateIva = (imponibile: number, percentuale: number) => {
    return (imponibile * percentuale) / 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-thin text-gray-900 dark:text-white">
            Nuova richiesta
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-600 dark:text-red-400 text-sm">
              ⚠️ {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tipo di richiesta */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Tipo di richiesta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedType(REQUEST_TYPES.FATTURA)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === REQUEST_TYPES.FATTURA
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Fattura</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Fattura emessa verso cliente
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType(REQUEST_TYPES.COSTO)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === REQUEST_TYPES.COSTO
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              >
                <Receipt className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Costo</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Spesa sostenuta dall&apos;azienda
                </div>
              </button>
            </div>
          </div>

          {/* Form per Fattura */}
          {selectedType === REQUEST_TYPES.FATTURA && (
            <div className="space-y-6">
              {/* Dati del debitore */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Dati del debitore
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Denominazione *
                    </label>
                    <input
                      type="text"
                      required
                      value={fatturaData.debitore.denominazione}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        debitore: { ...fatturaData.debitore, denominazione: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Partita IVA
                    </label>
                    <input
                      type="text"
                      value={fatturaData.debitore.partitaIva || ""}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        debitore: { ...fatturaData.debitore, partitaIva: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Codice Fiscale
                    </label>
                    <input
                      type="text"
                      value={fatturaData.debitore.codiceFiscale || ""}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        debitore: { ...fatturaData.debitore, codiceFiscale: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Indirizzo
                    </label>
                    <input
                      type="text"
                      value={fatturaData.debitore.indirizzo}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        debitore: { ...fatturaData.debitore, indirizzo: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dati fattura */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Dati della fattura
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Numero fattura *
                    </label>
                    <input
                      type="text"
                      required
                      value={fatturaData.numeroFattura}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        numeroFattura: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data emissione *
                    </label>
                    <input
                      type="date"
                      required
                      value={fatturaData.dataEmissione}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        dataEmissione: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data scadenza *
                    </label>
                    <input
                      type="date"
                      required
                      value={fatturaData.dataScadenza}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        dataScadenza: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Modalità pagamento
                    </label>
                    <select
                      value={fatturaData.modalitaPagamento}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        modalitaPagamento: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {MODALITA_PAGAMENTO.map(modalita => (
                        <option key={modalita} value={modalita}>{modalita}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Oggetto e descrizione */}
              <div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Oggetto *
                    </label>
                    <input
                      type="text"
                      required
                      value={fatturaData.oggetto}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        oggetto: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={fatturaData.descrizione || ""}
                      onChange={(e) => setFatturaData({
                        ...fatturaData,
                        descrizione: e.target.value
                      })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Importi */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Importi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imponibile *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={fatturaData.imponibile}
                      onChange={(e) => {
                        const imponibile = parseFloat(e.target.value) || 0;
                        const iva = calculateIva(imponibile, fatturaData.percentualeIva);
                        setFatturaData({
                          ...fatturaData,
                          imponibile,
                          iva,
                          importoTotale: calculateTotal(imponibile, iva)
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      % IVA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={fatturaData.percentualeIva}
                      onChange={(e) => {
                        const percentualeIva = parseFloat(e.target.value) || 0;
                        const iva = calculateIva(fatturaData.imponibile, percentualeIva);
                        setFatturaData({
                          ...fatturaData,
                          percentualeIva,
                          iva,
                          importoTotale: calculateTotal(fatturaData.imponibile, iva)
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IVA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={fatturaData.iva}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Totale
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={fatturaData.importoTotale}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form per Costo */}
          {selectedType === REQUEST_TYPES.COSTO && (
            <div className="space-y-6">
              {/* Dati del fornitore */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Dati del fornitore
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Denominazione *
                    </label>
                    <input
                      type="text"
                      required
                      value={costoData.fornitore.denominazione}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        fornitore: { ...costoData.fornitore, denominazione: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Partita IVA
                    </label>
                    <input
                      type="text"
                      value={costoData.fornitore.partitaIva || ""}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        fornitore: { ...costoData.fornitore, partitaIva: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dati documento */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Dati del documento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Numero documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={costoData.numeroDocumento}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        numeroDocumento: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data documento *
                    </label>
                    <input
                      type="date"
                      required
                      value={costoData.dataDocumento}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        dataDocumento: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo documento
                    </label>
                    <select
                      value={costoData.tipoDocumento}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        tipoDocumento: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {TIPI_DOCUMENTO.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={costoData.categoria}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        categoria: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {CATEGORIE_COSTO.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Oggetto e descrizione */}
              <div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Oggetto *
                    </label>
                    <input
                      type="text"
                      required
                      value={costoData.oggetto}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        oggetto: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={costoData.descrizione || ""}
                      onChange={(e) => setCostoData({
                        ...costoData,
                        descrizione: e.target.value
                      })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Importi */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Importi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imponibile *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={costoData.imponibile}
                      onChange={(e) => {
                        const imponibile = parseFloat(e.target.value) || 0;
                        const iva = calculateIva(imponibile, costoData.percentualeIva);
                        const importoTotale = calculateTotal(imponibile, iva);
                        setCostoData({
                          ...costoData,
                          imponibile,
                          iva,
                          importoTotale,
                          deducibilita: {
                            ...costoData.deducibilita,
                            importoDeducibile: (importoTotale * costoData.deducibilita.percentuale) / 100
                          }
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      % IVA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costoData.percentualeIva}
                      onChange={(e) => {
                        const percentualeIva = parseFloat(e.target.value) || 0;
                        const iva = calculateIva(costoData.imponibile, percentualeIva);
                        const importoTotale = calculateTotal(costoData.imponibile, iva);
                        setCostoData({
                          ...costoData,
                          percentualeIva,
                          iva,
                          importoTotale,
                          deducibilita: {
                            ...costoData.deducibilita,
                            importoDeducibile: (importoTotale * costoData.deducibilita.percentuale) / 100
                          }
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IVA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costoData.iva}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Totale
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costoData.importoTotale}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Deducibilità */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Deducibilità fiscale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      % Deducibilità
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={costoData.deducibilita.percentuale}
                      onChange={(e) => {
                        const percentuale = parseFloat(e.target.value) || 0;
                        setCostoData({
                          ...costoData,
                          deducibilita: {
                            ...costoData.deducibilita,
                            percentuale,
                            importoDeducibile: (costoData.importoTotale * percentuale) / 100
                          }
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Importo deducibile
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costoData.deducibilita.importoDeducibile}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salva richiesta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 