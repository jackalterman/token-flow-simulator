const DB_NAME = 'SecurityTribeToolkitDB';
const DB_VERSION = 5;

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
      
      // Define all stores here to ensure consistency
      if (!db.objectStoreNames.contains('har-file')) db.createObjectStore('har-file');
      if (!db.objectStoreNames.contains('token-diff')) db.createObjectStore('token-diff');
      if (!db.objectStoreNames.contains('token-tester')) db.createObjectStore('token-tester');
      if (!db.objectStoreNames.contains('jwt-encoder')) db.createObjectStore('jwt-encoder');
      if (!db.objectStoreNames.contains('jwt-decoder')) db.createObjectStore('jwt-decoder');
      if (!db.objectStoreNames.contains('collection')) {
        db.createObjectStore('collection', { keyPath: 'id' });
      }
    };
  });
};
