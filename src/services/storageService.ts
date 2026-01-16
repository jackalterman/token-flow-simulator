import { CollectionItem } from '../types';

const STORAGE_KEY = 'SecurityTribeToolkit_collection';

export const storageService = {
  saveItem(item: Omit<CollectionItem, 'id' | 'timestamp'>): CollectionItem {
    const items = this.getItems();
    const newItem: CollectionItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    items.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },

  getItems(): CollectionItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored items', e);
      return [];
    }
  },

  deleteItem(id: string): void {
    const items = this.getItems().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  clearItems(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  saveSessionState(key: string, data: any): void {
    const storageKey = `SecurityTribeToolkit_state_${key}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  },

  getSessionState<T>(key: string): T | null {
    const storageKey = `SecurityTribeToolkit_state_${key}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Failed to parse stored state for ${key}`, e);
      return null;
    }
  },

  clearSessionState(key: string): void {
    const storageKey = `SecurityTribeToolkit_state_${key}`;
    localStorage.removeItem(storageKey);
  }
};
