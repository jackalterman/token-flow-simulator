import { HarRoot } from './har';

const DB_NAME = 'SecurityTribeToolkitDB';
const STORE_NAME = 'har-file';
const DB_VERSION = 1;

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
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveHarToDB = async (data: HarRoot): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, 'current-har');

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving HAR to DB');
  });
};

export const getHarFromDB = async (): Promise<HarRoot | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current-har');

    request.onsuccess = () => {
        resolve(request.result || null);
    };
    request.onerror = () => reject('Error reading HAR from DB');
  });
};

export const clearHarFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('current-har');

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error clearing HAR from DB');
  });
};
