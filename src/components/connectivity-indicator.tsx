"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useOffline } from "@/context/offline-context";

export function ConnectivityIndicator() {
  const { isOnline, isSyncing } = useOffline();
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    setShowStatus(true);
    const timer = setTimeout(() => {
      if (isOnline && !isSyncing) setShowStatus(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOnline, isSyncing]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg backdrop-blur-md",
            isOnline ? "bg-green-50/90 border-green-200 text-green-700" : "bg-red-50/90 border-red-200 text-red-700"
          )}>
            {isSyncing ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : isOnline ? (
              <Cloud className="h-4 w-4" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
            <span className="text-xs font-medium">
              {isSyncing ? "Syncing data..." : isOnline ? "Online - Records Syncing" : "Offline Mode - Data Saved Locally"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
