import { CollectionItem } from '../types';

const STORAGE_KEY = 'tokenflow_collection';

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
  }
};
