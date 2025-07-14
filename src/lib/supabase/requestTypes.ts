// Tipi di richiesta disponibili
export const REQUEST_TYPES = {
  FATTURA: 'fattura',
  COSTO: 'costo'
} as const;

export type RequestType = typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];

// Definizione dei campi per le fatture secondo la normativa italiana
export interface FatturaBody {
  // Dati del debitore (cliente che deve pagare)
  debitore: {
    denominazione: string;
    partitaIva?: string;
    codiceFiscale?: string;
    indirizzo: string;
    cap: string;
    citta: string;
    provincia: string;
    pec?: string;
    codiceDestinatario?: string; // Codice destinatario SDI
  };

  // Dati della fattura
  numeroFattura: string;
  dataEmissione: string; // formato ISO 8601
  dataScadenza: string; // formato ISO 8601
  
  // Importi
  imponibile: number;
  iva: number;
  percentualeIva: number;
  importoTotale: number;
  
  // Descrizione
  oggetto: string;
  descrizione?: string;
  
  // Modalità di pagamento
  modalitaPagamento: string; // es. "Bonifico bancario", "Contrassegno", etc.
  
  // Causale
  causale?: string;
  
  // Note aggiuntive
  note?: string;
  
  // Ritenuta d'acconto (se applicabile)
  ritenuta?: {
    percentuale: number;
    importo: number;
    causale: string;
  };
  
  // Regime fiscale
  regimeFiscale?: string; // es. "Regime ordinario", "Regime forfettario", etc.
}

// Definizione dei campi per i costi/spese secondo la normativa italiana
export interface CostoBody {
  // Dati del fornitore/creditore
  fornitore: {
    denominazione: string;
    partitaIva?: string;
    codiceFiscale?: string;
    indirizzo?: string;
    cap?: string;
    citta?: string;
    provincia?: string;
  };

  // Dati del documento di spesa
  numeroDocumento: string;
  dataDocumento: string; // formato ISO 8601
  tipoDocumento: string; // es. "Fattura", "Ricevuta", "Scontrino", "Nota spese", etc.
  
  // Importi
  imponibile: number;
  iva: number;
  percentualeIva: number;
  importoTotale: number;
  
  // Classificazione della spesa
  categoria: string; // es. "Consulenze", "Materiali", "Trasporti", "Utenze", etc.
  sottocategoria?: string;
  
  // Descrizione
  oggetto: string;
  descrizione?: string;
  
  // Modalità di pagamento
  modalitaPagamento: string;
  dataPagamento?: string; // formato ISO 8601
  
  // Deducibilità fiscale
  deducibilita: {
    percentuale: number; // es. 100, 50, 20, 0
    importoDeducibile: number;
    note?: string;
  };
  
  // Centro di costo (se applicabile)
  centroCosto?: string;
  
  // Progetto/commessa (se applicabile)
  progetto?: string;
  
  // Note aggiuntive
  note?: string;
  
  // Ritenuta d'acconto subita (se applicabile)
  ritenuta?: {
    percentuale: number;
    importo: number;
    causale: string;
  };
}

// Tipo unione per il body delle richieste
export type RequestBody = FatturaBody | CostoBody;

// Interfaccia per la richiesta completa
export interface Request {
  id: string;
  created_at: string;
  updated_at?: string;
  type: RequestType;
  status: 'pending' | 'approved' | 'rejected';
  body: RequestBody;
  entity_id: string;
}

// Funzioni helper per la validazione
export const isFatturaBody = (body: RequestBody): body is FatturaBody => {
  return 'debitore' in body && 'numeroFattura' in body;
};

export const isCostoBody = (body: RequestBody): body is CostoBody => {
  return 'fornitore' in body && 'numeroDocumento' in body;
};

// Opzioni per i select delle form
export const MODALITA_PAGAMENTO = [
  'Bonifico bancario',
  'Contrassegno',
  'Carta di credito',
  'Assegno',
  'Contanti',
  'Paypal',
  'Addebito diretto SEPA',
  'Altro'
] as const;

export const CATEGORIE_COSTO = [
  'Consulenze professionali',
  'Materiali e forniture',
  'Trasporti e logistica',
  'Utenze (energia, gas, acqua)',
  'Affitti e canoni',
  'Marketing e pubblicità',
  'Formazione e corsi',
  'Spese generali',
  'Manutenzioni e riparazioni',
  'Assicurazioni',
  'Tasse e imposte',
  'Spese bancarie',
  'Altro'
] as const;

export const TIPI_DOCUMENTO = [
  'Fattura',
  'Ricevuta fiscale',
  'Scontrino fiscale',
  'Nota spese',
  'Parcella professionale',
  'Bolletta',
  'Canone',
  'Altro'
] as const;

export const REGIME_FISCALE = [
  'Regime ordinario',
  'Regime forfettario',
  'Regime dei minimi',
  'Regime fiscale di vantaggio',
  'Altro'
] as const; 