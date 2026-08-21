"use client";

// Wrapper mínimo sobre IndexedDB (a API nativa do navegador é baseada em
// callbacks/eventos) só com o que a fila de manejos pendentes precisa:
// put, getAll e delete num único object store. Não usa nenhuma lib externa
// de propósito — o uso aqui é simples demais pra justificar uma dependência.

const DB_NAME = "arvo-offline";
const DB_VERSION = 1;
export const STORE_MANEJOS_PENDENTES = "manejos_pendentes";

function abrirDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const dbInstance = req.result;
      if (!dbInstance.objectStoreNames.contains(STORE_MANEJOS_PENDENTES)) {
        dbInstance.createObjectStore(STORE_MANEJOS_PENDENTES, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut<T>(store: string, valor: T): Promise<void> {
  const dbInstance = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(store, "readwrite");
    tx.objectStore(store).put(valor);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbGetAll<T>(store: string): Promise<T[]> {
  const dbInstance = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(store: string, id: string): Promise<void> {
  const dbInstance = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
