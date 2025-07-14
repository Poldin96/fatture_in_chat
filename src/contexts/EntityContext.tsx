"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipo per l'entità dall'API
interface Entity {
  id: string;
  name: string;
  body: {
    partita_iva?: string;
    tipo?: string;
  };
  role: string;
  created_at: string;
  updated_at: string;
}

interface EntityContextType {
  entities: Entity[];
  selectedEntity: Entity | null;
  setSelectedEntity: (entity: Entity | null) => void;
  isLoading: boolean;
  loadEntities: () => Promise<void>;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntities = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/entities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Error loading entities:', response.status);
        return;
      }

      const data = await response.json();
      const entitiesList = data.entities || [];
      setEntities(entitiesList);
      
      // Seleziona la prima entità di default se non c'è già una selezione
      if (entitiesList.length > 0 && !selectedEntity) {
        setSelectedEntity(entitiesList[0]);
      }
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carica le entità all'avvio
  useEffect(() => {
    loadEntities();
  }, []);

  return (
    <EntityContext.Provider value={{
      entities,
      selectedEntity,
      setSelectedEntity,
      isLoading,
      loadEntities
    }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntity must be used within an EntityProvider');
  }
  return context;
}

export type { Entity }; 