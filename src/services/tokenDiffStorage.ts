const DB_NAME = 'SecurityTribeToolkitDB';
const STORE_NAME = 'token-diff';
const DB_VERSION = 2; // Increment version to add new store

export interface TokenDiffState {
  tokenA: string;
  tokenB: string;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create token-diff store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      
      // Also ensure har-file store exists (for backward compatibility)
      if (!db.objectStoreNames.contains('har-file')) {
        db.createObjectStore('har-file');
      }
    };
  });
};

export const saveTokenDiffToDB = async (data: TokenDiffState): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, 'current-tokens');

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving tokens to DB');
  });
};

export const getTokenDiffFromDB = async (): Promise<TokenDiffState | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current-tokens');

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject('Error reading tokens from DB');
  });
};

export const clearTokenDiffFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('current-tokens');

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error clearing tokens from DB');
  });
};
