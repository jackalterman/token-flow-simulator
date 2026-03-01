import { CollectionItem } from '../types';
import { getCollectionItems, saveCollectionItem, deleteCollectionItem } from './jwtStorage';

const STORAGE_KEY = 'SecurityTribeToolkit_collection';
const MIGRATION_KEY = 'SecurityTribeToolkit_collection_migrated_v5';

export const storageService = {
  async saveItem(item: Omit<CollectionItem, 'id' | 'timestamp'>): Promise<CollectionItem> {
    const newItem: CollectionItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    await saveCollectionItem(newItem);
    return newItem;
  },

  async getItems(): Promise<CollectionItem[]> {
    // Check for migration
    const isMigrated = localStorage.getItem(MIGRATION_KEY);
    if (!isMigrated) {
      await this.migrateFromLocalStorage();
    }
    
    return await getCollectionItems();
  },

  async migrateFromLocalStorage(): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const items: CollectionItem[] = JSON.parse(stored);
        for (const item of items) {
          await saveCollectionItem(item);
        }
        localStorage.setItem(MIGRATION_KEY, 'true');
        // We keep the old data in localStorage for a while just in case, 
        // but mark it as migrated.
      } catch (e) {
        console.error('Migration failed', e);
      }
    } else {
      localStorage.setItem(MIGRATION_KEY, 'true');
    }
  },

  async deleteItem(id: string): Promise<void> {
    await deleteCollectionItem(id);
  },

  clearItems(): void {
    // Not typically used for IDB without a clear all method, 
    // but we can implement it if needed.
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
