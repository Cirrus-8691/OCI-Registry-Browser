// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// Fonction pour récupérer la valeur initiale
function getStorageValue<T>(key: string, defaultValue: T): T {
  // Assurez-vous que nous sommes côté client avant d'accéder à localStorage
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const saved = localStorage.getItem(key);
    // Parse JSON si la valeur est stockée sous forme de chaîne JSON
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.error('Erreur de lecture/parsing localStorage:', error);
  }

  return defaultValue;
}

export const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  // 1. Initialisation : utilise la valeur par défaut côté serveur,
  // puis la valeur de localStorage côté client.
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  // 2. Persistance : met à jour localStorage à chaque changement de `value`
  useEffect(() => {
    try {
      // S'assure d'être dans le navigateur avant d'écrire
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Erreur d\'écriture localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
};