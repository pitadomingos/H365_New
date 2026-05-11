
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { OfflineManager } from '@/lib/offline-manager';

interface OfflineContextType {
  isOnline: boolean;
  isLanOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isLanOnline, setIsLanOnline] = useState(true);
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
    
    // Heartbeat for LAN server
    const checkLan = async () => {
      try {
        const LAN_URL = process.env.NEXT_PUBLIC_LAN_SERVER_URL || '';
        const res = await fetch(`${LAN_URL}/`, { method: 'HEAD', mode: 'no-cors' });
        setIsLanOnline(true);
      } catch (e) {
        setIsLanOnline(false);
      }
    };

    checkLan();
    performSync();

    // Background sync check every 2 minutes for LAN
    const interval = setInterval(() => {
      checkLan();
      if (navigator.onLine) performSync();
    }, 2 * 60 * 1000);

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
    <OfflineContext.Provider value={{ isOnline, isLanOnline, isSyncing, lastSync, syncNow: performSync }}>
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
