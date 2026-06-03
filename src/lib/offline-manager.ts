import { LocalDB } from './db';
import { SentryLogger } from './sentry-logger';

/**
 * OfflineManager handles the logic of coordinating local-first data 
 * and background synchronisation with the LAN server.
 * Implements Operational Transform-style Three-Way merge conflict resolution.
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
   * Saves data locally and adds to sync queue with optional base (ancestor) state
   */
  static async mutate<T>(collection: string, data: T, base?: any): Promise<void> {
    // Update Memory
    this.memoryCache[collection] = data;
    
    // Persist to LocalDB (This also adds to the Sync Queue)
    await LocalDB.save(collection, data, base);
    
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
      
      // Clear the items that were successfully processed
      await LocalDB.clearQueue();
    } catch (error: any) {
      console.error("[OfflineManager] Sync failed. Will retry when connection stabilizes.", error);
      SentryLogger.logError(error, {
        context: "OfflineManager.syncWithServer",
        queueSize: queue.length
      });
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

  /**
   * Performs a three-way merge to resolve text conflicts,
   * falling back to last-write-wins (LWW) resolution for non-mergeable values.
   */
  static resolveConflict<T extends Record<string, any>>(local: T, remote: T, base?: T | null): T {
    if (!local) return remote;
    if (!remote) return local;

    const baseObj = base || {} as Record<string, any>;
    const merged = { ...remote, ...local } as any;

    const localTime = new Date(local.updatedAt || local.timestamp || 0).getTime();
    const remoteTime = new Date(remote.updatedAt || remote.timestamp || 0).getTime();

    for (const key of Object.keys(merged)) {
      const localVal = local[key];
      const remoteVal = remote[key];
      const baseVal = baseObj[key];

      if (localVal !== undefined && remoteVal !== undefined) {
        if (localVal === remoteVal) {
          merged[key] = localVal;
        } else if (
          typeof localVal === 'object' && localVal !== null &&
          typeof remoteVal === 'object' && remoteVal !== null &&
          !Array.isArray(localVal) && !Array.isArray(remoteVal)
        ) {
          merged[key] = this.resolveConflict(localVal, remoteVal, baseVal);
        } else if (typeof localVal === 'string' && typeof remoteVal === 'string') {
          const baseStr = typeof baseVal === 'string' ? baseVal : "";
          merged[key] = this.mergeStrings3Way(baseStr, localVal, remoteVal);
        } else {
          // Last-write-wins for primitive conflicts
          merged[key] = localTime >= remoteTime ? localVal : remoteVal;
        }
      } else if (localVal !== undefined) {
        merged[key] = localVal;
      } else {
        merged[key] = remoteVal;
      }
    }

    return merged;
  }

  /**
   * Helper utility executing a line-by-line three-way merge
   */
  private static mergeStrings3Way(base: string, local: string, remote: string): string {
    if (local === remote) return local;
    if (local === base) return remote;
    if (remote === base) return local;

    const baseLines = base.split('\n');
    const localLines = local.split('\n');
    const remoteLines = remote.split('\n');

    const mergedLines: string[] = [];
    
    let lIdx = 0;
    let rIdx = 0;
    let bIdx = 0;

    while (lIdx < localLines.length || rIdx < remoteLines.length) {
      const lLine = localLines[lIdx];
      const rLine = remoteLines[rIdx];
      const bLine = baseLines[bIdx];

      if (lLine === rLine) {
        if (lLine !== undefined) mergedLines.push(lLine);
        lIdx++;
        rIdx++;
        bIdx++;
      } else if (lLine !== undefined && lLine === bLine) {
        if (rLine !== undefined) mergedLines.push(rLine);
        rIdx++;
        bIdx++;
      } else if (rLine !== undefined && rLine === bLine) {
        if (lLine !== undefined) mergedLines.push(lLine);
        lIdx++;
        bIdx++;
      } else {
        // Conflict detected - embed merge markers for manual clinician resolution
        mergedLines.push(`<<<<<<< LOCAL (Workstation Edit)`);
        if (lLine !== undefined) mergedLines.push(lLine);
        mergedLines.push(`=======`);
        if (rLine !== undefined) mergedLines.push(rLine);
        mergedLines.push(`>>>>>>> REMOTE (Facility Hub Conflict)`);
        
        lIdx++;
        rIdx++;
        bIdx++;
      }
    }

    return mergedLines.join('\n');
  }
}
