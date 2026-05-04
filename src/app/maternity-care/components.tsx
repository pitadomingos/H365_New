"use client";

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { CalendarIcon, HistoryIcon, Thermometer, Weight, Ruler, Sigma, ActivityIcon as BloodPressureIcon } from "lucide-react";

/**
 * List of antenatal visits.
 */
export const VisitHistoryTable = memo(({ 
  visits, 
  t 
}: { 
  visits: any[]; 
  t: (key: string) => string 
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('maternity.details.visits.table.date')}</TableHead>
          <TableHead>{t('maternity.details.visits.table.ga')}</TableHead>
          <TableHead>{t('maternity.details.visits.table.vitals')}</TableHead>
          <TableHead>{t('maternity.details.visits.table.fhr')}</TableHead>
          <TableHead>{t('maternity.details.visits.table.notes')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => (
          <TableRow key={visit.id}>
            <TableCell className="font-medium">{new Date(visit.date).toLocaleDateString()}</TableCell>
            <TableCell>{visit.gestationalAge}</TableCell>
            <TableCell className="text-xs">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1"><Weight className="h-3 w-3" /> {visit.weightKg} kg</span>
                <span className="flex items-center gap-1"><BloodPressureIcon className="h-3 w-3" /> {visit.bp}</span>
                {visit.bmi && <span className="flex items-center gap-1 font-semibold text-primary"><Sigma className="h-3 w-3" /> {t('maternity.details.bmi')}: {visit.bmi}</span>}
              </div>
            </TableCell>
            <TableCell>{visit.fhrBpm} {t('maternity.details.bpm')}</TableCell>
            <TableCell className="text-xs max-w-[200px] truncate" title={visit.notes}>{visit.notes}</TableCell>
          </TableRow>
        ))}
        {visits.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
              {t('maternity.details.visits.empty')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
});

VisitHistoryTable.displayName = "VisitHistoryTable";

/**
 * Patient Bio card.
 */
export const PatientBioCard = memo(({ 
  patient, 
  t 
}: { 
  patient: any; 
  t: (key: string) => string 
}) => {
  return (
    <Card className="shadow-sm border-primary/20 bg-primary/5">
      <CardHeader className="pb-3 text-center">
        <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md relative mb-3">
          <Image 
            src={patient.photoUrl} 
            alt={patient.fullName}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <CardTitle className="text-xl">{patient.fullName}</CardTitle>
        <CardDescription>
          {patient.age} {t('maternity.details.years')} • {t('maternity.details.gestationalAge')}: {patient.gestationalAge}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2 border rounded-md bg-background">
          <p className="text-muted-foreground mb-0.5">{t('maternity.details.bloodGroup')}</p>
          <p className="font-bold text-sm">{patient.bloodGroup} {patient.rhFactor}</p>
        </div>
        <div className="p-2 border rounded-md bg-background">
          <p className="text-muted-foreground mb-0.5">{t('maternity.details.gravidaPara')}</p>
          <p className="font-bold text-sm">G{patient.gravida} P{patient.para}</p>
        </div>
        <div className="p-2 border rounded-md bg-background col-span-2">
          <p className="text-muted-foreground mb-0.5">{t('maternity.details.edd')}</p>
          <p className="font-bold text-sm text-primary flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {new Date(patient.edd).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

PatientBioCard.displayName = "PatientBioCard";
