
"use client";

import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';

export function LocaleToggle() {
  const localeContext = useLocale();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !localeContext) {
    return null; // Render nothing on server and initial client render pass, or if context not ready
  }

  const { currentLocale, toggleLocale } = localeContext;
  const t = getTranslator(currentLocale);

  return (
    <div className="flex items-center space-x-2">
      <Label
        htmlFor="global-language-toggle"
        className={currentLocale === 'en' ? 'font-semibold text-primary' : 'text-muted-foreground'}
      >
        {t('techOverview.langToggle.en')}
      </Label>
      <Switch
        id="global-language-toggle"
        checked={currentLocale === 'pt'}
        onCheckedChange={toggleLocale}
        aria-label="Toggle language"
      />
      <Label
        htmlFor="global-language-toggle"
        className={currentLocale === 'pt' ? 'font-semibold text-primary' : 'text-muted-foreground'}
      >
        {t('techOverview.langToggle.pt')}
      </Label>
    </div>
  );
}
