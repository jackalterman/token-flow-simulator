import { openDB } from './db';

export interface JwtEncoderState {
    alg: string;
    header: string;
    payload: string;
    secret: string;
    privateKey: string;
}

export interface JwtDecoderState {
    token: string;
    key: string;
    audience: string;
    issuer: string;
}


export const saveCollectionItem = async (item: any): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['collection'], 'readwrite');
        const store = transaction.objectStore('collection');
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject('Error saving collection item');
    });
};

export const getCollectionItems = async (): Promise<any[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['collection'], 'readonly');
        const store = transaction.objectStore('collection');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject('Error reading collections');
    });
};

export const deleteCollectionItem = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['collection'], 'readwrite');
        const store = transaction.objectStore('collection');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject('Error deleting collection item');
    });
};

export const saveJwtEncoderState = async (state: JwtEncoderState): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jwt-encoder'], 'readwrite');
        const store = transaction.objectStore('jwt-encoder');
        const request = store.put(state, 'current-state');
        request.onsuccess = () => resolve();
        request.onerror = () => reject('Error saving encoder state');
    });
};

export const getJwtEncoderState = async (): Promise<JwtEncoderState | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jwt-encoder'], 'readonly');
        const store = transaction.objectStore('jwt-encoder');
        const request = store.get('current-state');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject('Error reading encoder state');
    });
};

export const saveJwtDecoderState = async (state: JwtDecoderState): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jwt-decoder'], 'readwrite');
        const store = transaction.objectStore('jwt-decoder');
        const request = store.put(state, 'current-state');
        request.onsuccess = () => resolve();
        request.onerror = () => reject('Error saving decoder state');
    });
};

export const getJwtDecoderState = async (): Promise<JwtDecoderState | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jwt-decoder'], 'readonly');
        const store = transaction.objectStore('jwt-decoder');
        const request = store.get('current-state');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject('Error reading decoder state');
    });
};
