
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
      // The LAN server URL would typically be configured per facility
      // For this SaaS prototype, we default to the backend service address
      const LAN_SERVER_URL = process.env.NEXT_PUBLIC_LAN_SERVER_URL || ''; 
      
      const response = await fetch(`${LAN_SERVER_URL}/api/sync/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workstationId: typeof window !== 'undefined' ? window.localStorage.getItem('h365_ws_id') : 'WS-UNKNOWN',
          facilityId: 'FAC-DEMO',
          batch: queue
        })
      });

      if (!response.ok) {
        throw new Error(`LAN server responded with ${response.status}`);
      }
      
      const result = await response.json();
      console.log("[OfflineManager] Sync successful:", result.message);
      
      // Only clear the items that were successfully processed if we had item-level results
      // For simplicity in this PR, we clear the whole queue if the batch was accepted
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
