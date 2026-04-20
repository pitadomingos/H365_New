"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      // Simulate sync
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setTimeout(() => setShowStatus(false), 3000);
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
