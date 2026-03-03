import { openDB } from './db';

const STORE_NAME = 'token-tester';

export interface TokenTesterState {
  url: string;
  method: string;
  headers: { key: string; value: string; enabled?: boolean }[];
  authType: 'none' | 'basic' | 'bearer';
  basicAuth?: { user: string; pass: string };
  bearerToken?: string;
  bodyType: 'json' | 'form';
  body: string;
  formData: { key: string; value: string; enabled?: boolean }[];
  variables?: { key: string; value: string; enabled?: boolean }[];
}


export const saveTokenTesterState = async (state: TokenTesterState): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(state, 'current-state');

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving token tester state');
  });
};

export const getTokenTesterState = async (): Promise<TokenTesterState | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current-state');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject('Error reading token tester state');
  });
};
