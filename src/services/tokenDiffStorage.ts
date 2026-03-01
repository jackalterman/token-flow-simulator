import { openDB } from './db';

const STORE_NAME = 'token-diff';

export interface TokenDiffState {
  tokenA: string;
  tokenB: string;
}


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
