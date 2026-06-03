import { SentryLogger } from './sentry-logger';

/**
 * HealthFlow Offline-First Local Storage Wrapper
 * Uses IndexedDB in the browser with localStorage fallbacks for maximum resilience.
 * Logs all database errors to SentryLogger.
 */
export class LocalDB {
  private static STORAGE_KEY_PREFIX = "h365_data_";
  private static QUEUE_KEY = "h365_sync_queue";

  private static DB_NAME = "h365_local_db";
  private static DB_VERSION = 1;
  private static STORE_COLLECTIONS = "collections";
  private static STORE_QUEUE = "sync_queue";

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("IndexedDB is not available on server-side"));
        return;
      }
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        const err = request.error || new Error("Failed to open IndexedDB");
        SentryLogger.logError(err, { context: "IndexedDB Open" });
        reject(err);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_COLLECTIONS)) {
          db.createObjectStore(this.STORE_COLLECTIONS);
        }
        if (!db.objectStoreNames.contains(this.STORE_QUEUE)) {
          db.createObjectStore(this.STORE_QUEUE, { keyPath: "id" });
        }
      };
    });
  }

  static async save<T>(collection: string, data: T, base?: any): Promise<void> {
    if (typeof window === "undefined") return;
    
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_COLLECTIONS, "readwrite");
        const store = tx.objectStore(this.STORE_COLLECTIONS);
        const req = store.put(data, collection);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error("Put failed"));
      });
      
      await this.addToQueue(collection, data, base);
    } catch (e: any) {
      console.error("LocalDB Save Error:", e);
      SentryLogger.logStorageQuotaError(e);
      
      // Fallback to localStorage on IndexedDB failure
      try {
        const key = this.STORAGE_KEY_PREFIX + collection;
        localStorage.setItem(key, JSON.stringify(data));
        await this.addToQueue(collection, data, base);
      } catch (localErr: any) {
        SentryLogger.logStorageQuotaError(localErr);
      }
    }
  }

  private static async addToQueue(collection: string, data: any, base?: any): Promise<void> {
    const queueItem = {
      id: Math.random().toString(36).substr(2, 9),
      collection,
      payload: data,
      base: base || null,
      timestamp: new Date().toISOString()
    };

    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_QUEUE, "readwrite");
        const store = tx.objectStore(this.STORE_QUEUE);
        const req = store.put(queueItem);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error("Queue write failed"));
      });
    } catch (e: any) {
      console.error("LocalDB AddToQueue Error:", e);
      SentryLogger.logError(e, { context: "LocalDB.addToQueue", queueItem });
      
      // Fallback to localStorage
      try {
        const queueKey = this.QUEUE_KEY;
        const saved = localStorage.getItem(queueKey);
        const queue = saved ? JSON.parse(saved) : [];
        queue.push(queueItem);
        localStorage.setItem(queueKey, JSON.stringify(queue));
      } catch (localErr: any) {
        SentryLogger.logError(localErr, { context: "LocalDB.addToQueue fallback" });
      }
    }
  }

  static async getQueue(): Promise<any[]> {
    if (typeof window === "undefined") return [];
    try {
      const db = await this.openDB();
      return await new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction(this.STORE_QUEUE, "readonly");
        const store = tx.objectStore(this.STORE_QUEUE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error || new Error("GetAll queue failed"));
      });
    } catch (e: any) {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem(this.QUEUE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (localErr) {
        return [];
      }
    }
  }

  static async clearQueue(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_QUEUE, "readwrite");
        const store = tx.objectStore(this.STORE_QUEUE);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error("Clear queue failed"));
      });
    } catch (e: any) {
      SentryLogger.logError(e, { context: "LocalDB.clearQueue" });
      localStorage.removeItem(this.QUEUE_KEY);
    }
  }

  static async get<T>(collection: string, defaultValue: T): Promise<T> {
    if (typeof window === "undefined") return defaultValue;
    try {
      const db = await this.openDB();
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(this.STORE_COLLECTIONS, "readonly");
        const store = tx.objectStore(this.STORE_COLLECTIONS);
        const req = store.get(collection);
        req.onsuccess = () => {
          if (req.result === undefined) {
            resolve(defaultValue);
          } else {
            resolve(req.result);
          }
        };
        req.onerror = () => reject(req.error || new Error("Get collection failed"));
      });
    } catch (e: any) {
      // Fallback to localStorage
      try {
        const key = this.STORAGE_KEY_PREFIX + collection;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
      } catch (localErr) {
        return defaultValue;
      }
    }
  }

  static async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_COLLECTIONS, "readwrite");
        const store = tx.objectStore(this.STORE_COLLECTIONS);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error("Clear collection failed"));
      });
    } catch (e: any) {
      SentryLogger.logError(e, { context: "LocalDB.clear" });
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}
