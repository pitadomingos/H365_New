
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import { getTranslator, type Locale } from '@/lib/i18n';
import { useLocale } from "@/context/locale-context";
import React from 'react';

export default function BloodBankPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Droplets className="h-8 w-8" /> {t('bloodBank.pageTitle')}
          </h1>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('bloodBank.overview.title')}</CardTitle>
            <CardDescription>{t('bloodBank.overview.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('techOverview.section5.itemBloodBank.desc')}</p>
            <h3 className="mt-4 font-semibold text-lg">{t('bloodBank.features.title')}</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 text-sm">
              <li>{t('bloodBank.features.item1')}</li>
              <li>{t('bloodBank.features.item2')}</li>
              <li>{t('bloodBank.features.item3')}</li>
              <li>{t('bloodBank.features.item4')}</li>
              <li>{t('bloodBank.features.item5')}</li>
              <li>{t('bloodBank.features.item6')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
  );
}

    
