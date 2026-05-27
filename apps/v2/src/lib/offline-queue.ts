/**
 * IndexedDB-backed offline queue for quest submissions.
 *
 * If submitQuest() fails because the user is offline, we stash the photo
 * blob + form fields in IDB and register a Background Sync (or fall back
 * to the `online` event on Safari/iOS). The service worker / a foreground
 * helper drains the queue, fetches a fresh presigned URL, uploads, and
 * calls submitQuest.
 */
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "heroquest-offline";
const DB_VERSION = 1;
const STORE = "pending-quests";

export type PendingQuest = {
  id: string;
  blob: Blob;
  contentType: string;
  description: string;
  category: string;
  createdAt: number;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueuePending(item: PendingQuest): Promise<void> {
  const db = await getDb();
  await db.put(STORE, item);
}

export async function listPending(): Promise<PendingQuest[]> {
  const db = await getDb();
  return db.getAll(STORE);
}

export async function removePending(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}

export async function countPending(): Promise<number> {
  const db = await getDb();
  return db.count(STORE);
}
