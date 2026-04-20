
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListCollapse, Loader2, Activity as ActivityIcon } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator, type Locale } from '@/lib/i18n';

interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  timestamp: string; // Could be a Date object, formatted for display
  details?: string; // Optional additional details
}

const mockSystemActivityLog: ActivityLogItem[] = [
  { id: "sa001", user: "Dr. Smith", action: "updated patient chart for Alice Johnson.", timestamp: "2024-08-15 10:30:00 AM", details: "Added new medication: Aspirin 75mg" },
  { id: "sa002", user: "Reception", action: "registered new patient: Bob Williams.", timestamp: "2024-08-15 10:15:00 AM", details: "National ID: BW12345" },
  { id: "sa003", user: "LabTech01", action: "uploaded results for patient ID #7890.", timestamp: "2024-08-15 09:00:00 AM", details: "Test: CBC, Glucose. All normal." },
  { id: "sa004", user: "Nurse Eva", action: "scheduled follow-up for Mike Brown.", timestamp: "2024-08-15 07:00:00 AM", details: "Appointment on 2024-08-22." },
  { id: "sa005", user: "Ward A Admin", action: "discharged patient: Charlie Davis.", timestamp: "2024-08-15 05:00:00 AM" },
  { id: "sa006", user: "System", action: "Automated backup completed.", timestamp: "2024-08-15 03:00:00 AM" },
  { id: "sa007", user: "Dr. Jones", action: "ordered lab tests for patient: Sarah Miller.", timestamp: "2024-08-14 04:30:00 PM", details: "Tests: Lipid Panel, TSH" },
  { id: "sa008", user: "Pharmacist02", action: "dispensed medication for RX00123.", timestamp: "2024-08-14 03:15:00 PM", details: "Medication: Amoxicillin 250mg" },
  { id: "sa009", user: "AdminUser", action: "updated user role for 'nurse_eva'.", timestamp: "2024-08-14 02:00:00 PM", details: "Role changed to 'Senior Nurse'" },
  { id: "sa010", user: "ImagingTech", action: "uploaded X-Ray report for patient ID #5678.", timestamp: "2024-08-14 01:00:00 PM" },
  { id: "sa011", user: "Dr. Smith", action: "viewed patient record: Bob Williams.", timestamp: "2024-08-14 12:00:00 PM" },
  { id: "sa012", user: "System", action: "Low stock alert for Paracetamol triggered.", timestamp: "2024-08-14 11:00:00 AM" },
];

export default function SystemActivityLogPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setActivityLog(mockSystemActivityLog);
      setIsLoading(false);
    }, 1000);
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
