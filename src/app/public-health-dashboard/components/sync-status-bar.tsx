"use client";

import React from "react";
import { CloudOff, Cloud, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncStatusBarProps {
  isOffline: boolean;
  isSyncing: boolean;
  queueLength: number;
  lastSyncTime: string;
  onForceSync: () => void;
}

export function SyncStatusBar({
  isOffline,
  isSyncing,
  queueLength,
  lastSyncTime,
  onForceSync,
}: SyncStatusBarProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border mb-6">
      <div className="flex items-center space-x-4">
        {isOffline ? (
          <div className="flex items-center space-x-2 text-destructive">
            <CloudOff className="h-5 w-5" />
            <span className="font-medium text-sm">Offline (Buffer Ativo)</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-500">
            <Wifi className="h-5 w-5" />
            <span className="font-medium text-sm">Online</span>
          </div>
        )}
        <div className="h-4 w-[1px] bg-border" />
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          <Cloud className="h-4 w-4" />
          <span>
            {queueLength} registos em fila para SIS-MA
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-muted-foreground">Último Sync: {lastSyncTime}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onForceSync}
          disabled={isSyncing || (isOffline && queueLength === 0)}
          className="h-8"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "A Sincronizar..." : "Forçar Sincronização"}
        </Button>
      </div>
    </div>
  );
}
