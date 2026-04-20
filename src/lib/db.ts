/**
 * HealthFlow Offline-First Local Storage Wrapper
 * Simulates a document database in the browser using localStorage.
 * This ensures data persists even if the cloud sync is unavailable.
 */

export class LocalDB {
  private static STORAGE_KEY_PREFIX = "h365_data_";
  private static QUEUE_KEY = "h365_sync_queue";

  static async save<T>(collection: string, data: T): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const key = this.STORAGE_KEY_PREFIX + collection;
      localStorage.setItem(key, JSON.stringify(data));
      
      // Add to Sync Queue
      await this.addToQueue(collection, data);
    } catch (e) {
      console.error("LocalDB Save Error:", e);
    }
  }

  private static async addToQueue(collection: string, data: any): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      id: Math.random().toString(36).substr(2, 9),
      collection,
      payload: data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async getQueue(): Promise<any[]> {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(this.QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  static async clearQueue(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.QUEUE_KEY);
  }

  static async get<T>(collection: string, defaultValue: T): Promise<T> {
    if (typeof window === "undefined") return defaultValue;
    try {
      const key = this.STORAGE_KEY_PREFIX + collection;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error("LocalDB Get Error:", e);
      return defaultValue;
    }
  }

  static async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
