"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useOffline } from "@/context/offline-context";

export function ConnectivityIndicator() {
  const { isOnline, isLanOnline, isSyncing } = useOffline();
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    setShowStatus(true);
    const timer = setTimeout(() => {
      if (isOnline && isLanOnline && !isSyncing) setShowStatus(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOnline, isLanOnline, isSyncing]);

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
            "flex items-center gap-4 px-5 py-2 rounded-full border shadow-xl backdrop-blur-lg",
            (isOnline && isLanOnline) ? "bg-green-50/95 border-green-200 text-green-800" : 
            isLanOnline ? "bg-amber-50/95 border-amber-200 text-amber-800" : "bg-red-50/95 border-red-200 text-red-800"
          )}>
            <div className="flex items-center gap-2 pr-4 border-r border-current/20">
              <RefreshCcw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isLanOnline ? "LAN: Connected" : "LAN: Offline"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {isOnline ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isOnline ? "WAN: Active" : "WAN: Disconnected"}
              </span>
            </div>

            {isSyncing && (
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full bg-blue-500 ml-1" 
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
