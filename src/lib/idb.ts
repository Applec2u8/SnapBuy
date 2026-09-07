const DB_NAME = 'SnapBuyBackupDB';
const DB_VERSION = 1;
const STORE_NAME = 'export_chunks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function saveExportChunk(key: string, data: any[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get existing data if any, then append
    const getReq = store.get(key);
    
    getReq.onsuccess = () => {
      const existing = getReq.result || [];
      const putReq = store.put([...existing, ...data], key);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function getExportData(key: string): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const getReq = store.get(key);
    
    getReq.onsuccess = () => resolve(getReq.result || []);
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function clearExportData(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const deleteReq = store.delete(key);
    
    deleteReq.onsuccess = () => resolve();
    deleteReq.onerror = () => reject(deleteReq.error);
  });
}
