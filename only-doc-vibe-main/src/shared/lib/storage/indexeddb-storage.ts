import { getIsClient } from "../utils/getIsClient";

type Options = {
  dbName?: string;
  storeName?: string;
  version?: number;
};

export class IDBStorage implements Storage {
  private db!: IDBDatabase;
  private readonly storeName: string;
  private cache: Map<string, string>;
  private static instance: IDBStorage | null = null;

  private constructor(
    db: IDBDatabase,
    storeName: string,
    initial: Map<string, string>
  ) {
    this.db = db;
    this.storeName = storeName;
    this.cache = initial;
  }

  static async getInstance(opts: Options = {}): Promise<IDBStorage> {
    if (!getIsClient()) {
      return {} as IDBStorage;
    }

    if (IDBStorage.instance) {
      return IDBStorage.instance;
    }

    const dbName = opts.dbName ?? "app-kv";
    const storeName = opts.storeName ?? "kv";
    const version = opts.version ?? 1;

    const db = await openDB(dbName, storeName, version);
    const initial = await readAll(db, storeName);

    IDBStorage.instance = new IDBStorage(db, storeName, initial);

    return IDBStorage.instance;
  }

  get length(): number {
    return this.cache.size;
  }

  key(index: number): string | null {
    if (index < 0 || index >= this.cache.size) return null;

    return Array.from(this.cache.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.cache.has(key) ? this.cache.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    const v = String(value);
    this.cache.set(key, v);
    // фоновий запис
    void this.putToIDB(key, v);
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    void this.deleteFromIDB(key);
  }

  clear(): void {
    this.cache.clear();
    void this.clearIDB();
  }

  private putToIDB(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, "readwrite");
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error);
      tx.objectStore(this.storeName).put(value, key);
    }).catch((e) => {
      console.error("[IDBLikeStorage.put] failed:", e);
    }) as Promise<void>;
  }

  private deleteFromIDB(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, "readwrite");
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error);
      tx.objectStore(this.storeName).delete(key);
    }).catch((e) =>
      console.error("[IDBLikeStorage.delete] failed:", e)
    ) as Promise<void>;
  }

  private clearIDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, "readwrite");
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error);
      tx.objectStore(this.storeName).clear();
    }).catch((e) =>
      console.error("[IDBLikeStorage.clear] failed:", e)
    ) as Promise<void>;
  }
}

function openDB(
  dbName: string,
  storeName: string,
  version: number
): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("indexedDB is not available (SSR or old browser).");
  }

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function readAll(
  db: IDBDatabase,
  storeName: string
): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    const map = new Map<string, string>();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result as IDBCursorWithValue | null;
      if (!cursor) return;

      const key = String(cursor.key);
      const value = String(cursor.value);
      map.set(key, value);
      cursor.continue();
    };
    tx.oncomplete = () => resolve(map);
    tx.onerror = () => reject(tx.error);
  });
}
