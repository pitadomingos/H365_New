
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { OfflineManager } from '@/lib/offline-manager';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial hydration and sync
    OfflineManager.hydrateWorkspace(['clinical_tasks', 'inventory_cache', 'user_settings']);
    performSync();

    // Background sync check every 5 minutes if online
    const interval = setInterval(() => {
      if (navigator.onLine) performSync();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const performSync = async () => {
    setIsSyncing(true);
    await OfflineManager.syncWithServer();
    setLastSync(new Date());
    setIsSyncing(false);
  };

  return (
    <OfflineContext.Provider value={{ isOnline, isSyncing, lastSync, syncNow: performSync }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
