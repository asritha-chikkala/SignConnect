"use client";

import { openDB } from "idb";
import { useCallback } from "react";
import type { EmergencyPhrase } from "@/types";

const DB_NAME = "signbridge-offline";
const STORE_NAME = "emergency-phrases";

async function db() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export function useIndexedEmergencyCache() {
  const primeCache = useCallback(async (phrases: EmergencyPhrase[]) => {
    const conn = await db();
    const tx = conn.transaction(STORE_NAME, "readwrite");
    for (const phrase of phrases) {
      await tx.store.put(phrase);
    }
    await tx.done;
  }, []);

  const getCached = useCallback(async () => {
    const conn = await db();
    return conn.getAll(STORE_NAME);
  }, []);

  return { primeCache, getCached };
}
