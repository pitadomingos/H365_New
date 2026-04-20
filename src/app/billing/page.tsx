
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { getTranslator, type Locale } from '@/lib/i18n';
import { useLocale } from "@/context/locale-context";
import React from 'react';


export default function BillingPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8" /> {t('billing.pageTitle')}
          </h1>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('billing.overview.title')}</CardTitle>
            <CardDescription>{t('billing.overview.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('techOverview.section5.itemBilling.desc')}</p>
            
            <h3 className="mt-4 font-semibold text-lg">{t('billing.features.title')}</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 text-sm">
              <li>{t('billing.features.item1')}</li>
              <li>{t('billing.features.item2')}</li>
              <li>{t('billing.features.item3')}</li>
              <li>{t('billing.features.item4')}</li>
              <li>{t('billing.features.item5')}</li>
              <li>{t('billing.features.item6')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
  );
}

    
