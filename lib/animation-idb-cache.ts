import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface SignBridgeDB extends DBSchema {
  models: {
    key: string;
    value: ArrayBuffer;
  };
}

let dbPromise: Promise<IDBPDatabase<SignBridgeDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<SignBridgeDB>("signbridge-anim-v1", 1, {
      upgrade(db) {
        db.createObjectStore("models");
      },
    });
  }
  return dbPromise;
}

/** Cache downloaded VRM/GLB buffers for faster reload (offline-friendly with SW). */
export async function readCachedModel(url: string): Promise<ArrayBuffer | undefined> {
  try {
    const db = await getDb();
    return (await db.get("models", url)) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function writeCachedModel(url: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await getDb();
    await db.put("models", buffer, url);
  } catch {
    /* ignore quota / private mode */
  }
}

export async function deleteCachedModel(url: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete("models", url);
  } catch {
    /* ignore */
  }
}
