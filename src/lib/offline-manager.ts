
import { LocalDB } from './db';

/**
 * OfflineManager handles the logic of coordinating local-first data 
 * and background synchronisation with the LAN server.
 */
export class OfflineManager {
  private static isSyncing = false;
  private static memoryCache: Record<string, any> = {};

  /**
   * Reads data, preferring memory then disk (LocalDB)
   */
  static async query<T>(collection: string, defaultValue: T): Promise<T> {
    // 1. Check Memory Cache (Volatile, fast)
    if (this.memoryCache[collection]) {
      return this.memoryCache[collection] as T;
    }

    // 2. Check LocalDB (Persisted)
    const data = await LocalDB.get(collection, defaultValue);
    this.memoryCache[collection] = data;
    return data;
  }

  /**
   * Saves data locally and adds to sync queue
   */
  static async mutate<T>(collection: string, data: T): Promise<void> {
    // Update Memory
    this.memoryCache[collection] = data;
    
    // Persist to LocalDB (This also adds to the Sync Queue)
    await LocalDB.save(collection, data);
    
    // Trigger opportunistic sync if online
    if (typeof navigator !== "undefined" && navigator.onLine) {
      this.syncWithServer();
    }
  }

  /**
   * Pushes the local queue to the LAN server
   */
  static async syncWithServer(): Promise<void> {
    if (this.isSyncing) return;
    
    const queue = await LocalDB.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    console.log(`[OfflineManager] Syncing ${queue.length} items to LAN server...`);

    try {
      // In a real app, this would be an API call to the LAN server
      // For this SaaS prototype, we simulate a batch push
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("[OfflineManager] Finalising sync. Clearing local queue.");
      await LocalDB.clearQueue();
    } catch (error) {
      console.error("[OfflineManager] Sync failed. Will retry when connection stabilizes.", error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Pre-hydrates the machine's memory with the user's workspace
   */
  static async hydrateWorkspace(collections: string[]): Promise<void> {
    for (const col of collections) {
      const data = await LocalDB.get(col, null);
      if (data) {
        this.memoryCache[col] = data;
      }
    }
  }
}
