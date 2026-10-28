/**
 * CareBridge — Custom Hook: useLocalStorage
 * File: src/hooks/useLocalStorage.js
 * 
 * Reusable hook that synchronizes state with browser localStorage.
 * Includes defensive error handling for quota/corruption, multi-tab sync,
 * and seamless fallback to initial defaults.
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  // Read value with error recovery
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`[useLocalStorage] Warning: Could not read key "${key}". Using default fallback.`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  // Set and persist value
  const setValue = useCallback((value) => {
    if (typeof window === 'undefined') {
      console.warn(`[useLocalStorage] Local storage unavailable in non-browser environment.`);
      return;
    }

    try {
      setStoredValue((currentVal) => {
        const valueToStore = value instanceof Function ? value(currentVal) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Notify same-tab listeners
          window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key, value: valueToStore } }));
        } catch (storageError) {
          console.error(`[useLocalStorage] Quota or write failure for key "${key}":`, storageError);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`[useLocalStorage] Error setting key "${key}":`, error);
    }
  }, [key]);

  // Synchronize across browser tabs and same-tab custom dispatch
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event instanceof StorageEvent) {
        if (event.key === key && event.newValue !== null) {
          try {
            setStoredValue(JSON.parse(event.newValue));
          } catch (e) {
            console.warn(`[useLocalStorage] Corrupted external storage update for "${key}":`, e);
          }
        }
      } else if (event instanceof CustomEvent && event.detail?.key === key) {
        setStoredValue(event.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-sync', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-sync', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

