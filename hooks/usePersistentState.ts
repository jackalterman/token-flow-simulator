import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { storageService } from '../services/storageService';

/**
 * A custom hook that works like useState but persists the value to localStorage
 * @param key The unique key for storage
 * @param defaultValue The initial value if no stored value exists
 */
export function usePersistentState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  // Load initial state from storage or use defaultValue
  const [state, setState] = useState<T>(() => {
    const stored = storageService.getSessionState<T>(key);
    return stored !== null ? stored : defaultValue;
  });

  // Update storage whenever state changes
  useEffect(() => {
    storageService.saveSessionState(key, state);
  }, [key, state]);

  return [state, setState];
}
