
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import React from 'react';

export default function CampaignsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8" /> {t('campaigns.pageTitle')}
          </h1>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('campaigns.overview.title')}</CardTitle>
            <CardDescription>{t('campaigns.overview.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('campaigns.underDevelopment')}</p>
            <h3 className="mt-4 font-semibold text-lg">{t('campaigns.features.title')}</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 text-sm">
              <li>{t('campaigns.features.item1')}</li>
              <li>{t('campaigns.features.item2')}</li>
              <li>{t('campaigns.features.item3')}</li>
              <li>{t('campaigns.features.item4')}</li>
              <li>{t('campaigns.features.item5')}</li>
              <li>{t('campaigns.features.item6')}</li>
              <li>{t('campaigns.features.item7')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
  );
}
    
