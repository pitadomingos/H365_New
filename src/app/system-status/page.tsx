"use client";

import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  CloudOff, 
  Server, 
  RefreshCcw, 
  Database, 
  AlertTriangle,
  CheckCircle2,
  Settings,
  Activity,
  HardDrive,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LocalDB } from "@/lib/db";
import { motion } from "motion/react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';

export default function SystemStatusPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    loadQueue();

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const loadQueue = async () => {
    const queue = await LocalDB.getQueue();
    setSyncQueue(queue);
  };

  const startManualSync = async () => {
    if (!isOnline || syncQueue.length === 0) return;
    
    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate batch sync
    for (let i = 0; i <= 100; i += 20) {
      setSyncProgress(i);
      await new Promise(r => setTimeout(r, 600));
    }

    await LocalDB.clearQueue();
    setSyncQueue([]);
    setIsSyncing(false);
    setSyncProgress(0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('systemStatus.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('systemStatus.pageDescription')}</p>
        </div>
        <Badge variant={isOnline ? "default" : "destructive"} className="h-6 gap-1">
          {isOnline ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
          {isOnline ? t('systemStatus.onlineBadge') : t('systemStatus.offlineBadge')}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cloud Status */}
        <Card className={!isOnline ? "opacity-60" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-500" /> {t('systemStatus.cloudInstance.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isOnline ? t('systemStatus.cloudInstance.active') : t('systemStatus.cloudInstance.unreachable')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('systemStatus.cloudInstance.endpoint', { endpoint: 'h365-national-cloud.gov.na' })}
            </p>
          </CardContent>
        </Card>

        {/* Local Node Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-green-500" /> {t('systemStatus.localNode.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('systemStatus.localNode.primary')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('systemStatus.localNode.authoritative')}
            </p>
          </CardContent>
        </Card>

        {/* Sync Queue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" /> {t('systemStatus.syncQueue.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('systemStatus.syncQueue.records', { count: syncQueue.length })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {syncQueue.length > 0 ? t('systemStatus.syncQueue.awaiting') : t('systemStatus.syncQueue.mirrored')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" /> {t('systemStatus.reconciliation.title')}
            </CardTitle>
            <CardDescription>
              {t('systemStatus.reconciliation.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSyncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>{t('systemStatus.reconciliation.uploading')}</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}
            
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('systemStatus.reconciliation.autoSync.label')}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('systemStatus.reconciliation.autoSync.enabled')}</Badge>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">{t('systemStatus.reconciliation.handshake.label')}</span>
                <span className="text-sm text-muted-foreground">{t('systemStatus.reconciliation.handshake.time', { time: '4 minutes' })}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button 
              className="w-full" 
              onClick={startManualSync} 
              disabled={syncQueue.length === 0 || !isOnline || isSyncing}
            >
              {isSyncing ? t('systemStatus.reconciliation.syncingButton') : t('systemStatus.reconciliation.forceButton')}
            </Button>
          </CardFooter>
        </Card>

        {/* Module-Specific Sync Health */}
        <Card className="col-span-1">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Activity className="h-5 w-5 text-indigo-500" /> {t('systemStatus.moduleHealth.title')}
             </CardTitle>
             <CardDescription>
               {t('systemStatus.moduleHealth.desc')}
             </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Patient Records", status: "synced", count: 0 },
                  { name: "Lab Results", status: "pending", count: 12 },
                  { name: "Imaging Files", status: "stale", count: 3 },
                  { name: "Inventory Logs", status: "synced", count: 0 },
                ].map((m, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col gap-1.5">
                    <span className="text-xs font-semibold">{m.name}</span>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={cn(
                        "text-[10px] h-4 px-1.5",
                        m.status === "synced" ? "bg-green-100 text-green-700 border-none" :
                        m.status === "pending" ? "bg-blue-100 text-blue-700 border-none" :
                        "bg-red-100 text-red-700 border-none"
                      )}>
                        {t(`systemStatus.moduleHealth.${m.status}`)}
                      </Badge>
                      {m.count > 0 && <span className="text-[10px] font-bold text-muted-foreground">{m.count}</span>}
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button variant="ghost" className="w-full text-xs gap-2">
               View Full Sync Audit <ArrowRight className="h-3 w-3" />
             </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-500" /> {t('systemStatus.config.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('systemStatus.config.facilityId.label')}</label>
              <div className="text-sm font-mono bg-muted p-2 rounded">FAC-WHK-CENTRAL-001</div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('systemStatus.config.storage.label')}</label>
              <div className="flex items-end gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t('systemStatus.config.storage.used', { used: '12.4', total: '500' })}</span>
              </div>
              <Progress value={2.5} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full gap-2">
              <Settings className="h-4 w-4" /> {t('systemStatus.config.advancedButton')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {syncQueue.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">{t('systemStatus.pendingAlert.title')}</p>
              <p className="text-xs text-orange-700">
                {t('systemStatus.pendingAlert.description', { count: syncQueue.length })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
