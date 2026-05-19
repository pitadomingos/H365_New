
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListCollapse, Loader2, Activity as ActivityIcon } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator, type Locale } from '@/lib/i18n';
import { SentryLogger, type LogEntry } from "@/lib/sentry-logger";

export default function SystemActivityLogPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call loading logs from SentryLogger
    const timer = setTimeout(() => {
      setActivityLog(SentryLogger.getLogs());
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ListCollapse className="h-8 w-8" /> {t('systemActivityLog.pageTitle')}
        </h1>
        {/* Add filtering/date range options here in the future */}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('systemActivityLog.log.title')}</CardTitle>
          <CardDescription>{t('systemActivityLog.log.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">{t('systemActivityLog.loading')}</p>
            </div>
          ) : activityLog.length > 0 ? (
            <ul className="space-y-4">
              {activityLog.map((item) => (
                <li key={item.id} className="p-3 border rounded-md shadow-sm bg-background hover:bg-muted/50">
                  <div className="flex items-start gap-3">
                    <ActivityIcon className="h-5 w-5 mt-1 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{item.user}</span> {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.timestamp).toLocaleString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground/80 mt-1">{t('systemActivityLog.detailsLabel')}: {item.details}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-6">{t('systemActivityLog.empty')}</p>
          )}
          {/* Add pagination controls here in the future */}
        </CardContent>
      </Card>
    </div>
  );
}
