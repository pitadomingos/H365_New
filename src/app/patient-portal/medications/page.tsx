'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  History, 
  Bell, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Info,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

export default function PatientMedicationsPage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const { toast } = useToast();
  const [confirmedMeds, setConfirmedMeds] = useState<number[]>([]);

  const activeMedications = [
    { 
      id: 1, 
      name: 'Lisinopril', 
      dosage: '10mg', 
      frequency: 'Once daily (Morning)', 
      reason: 'Hypertension',
      reminders: '08:00 AM',
      instructions: 'Take with water before breakfast.',
      pillColor: 'bg-blue-400'
    },
    { 
      id: 2, 
      name: 'Metformin', 
      dosage: '500mg', 
      frequency: 'Twice daily (Morning/Evening)', 
      reason: 'Blood Glucose Control',
      reminders: '08:00 AM, 08:00 PM',
      instructions: 'Take with food to minimize stomach upset.',
      pillColor: 'bg-orange-400'
    },
  ];

  const handleConfirmIntake = (id: number) => {
    if (confirmedMeds.includes(id)) return;
    
    setConfirmedMeds(prev => [...prev, id]);
    toast({
      title: "Intake Confirmed",
      description: "Your provider has been notified of your adherence. Keep it up!",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('patientPortal.meds.title')}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
             <Bell className="h-3 w-3 text-primary" /> 2 reminders active for today
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 border-slate-200"
          onClick={() => toast({ title: "Prescription History", description: "Loading your full medication logs from 2024-2026..." })}
        >
           <History className="h-5 w-5 text-slate-500" />
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
          {t('patientPortal.meds.active')}
        </h3>
        
        {activeMedications.map((med) => {
          const isConfirmed = confirmedMeds.includes(med.id);
          return (
            <Card key={med.id} className="shadow-sm border-slate-100 overflow-hidden transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex">
                  <div className={`w-2 ${med.pillColor}`} />
                  <div className="p-4 flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                       <div className="space-y-0.5">
                          <h4 className="text-lg font-bold text-slate-800 leading-none">{med.name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{med.dosage} • {med.reason}</p>
                       </div>
                       <Badge variant={isConfirmed ? "default" : "outline"} className={isConfirmed ? "bg-green-500 hover:bg-green-500" : "text-slate-400"}>
                          {isConfirmed ? "TAKEN" : "PENDING"}
                       </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                       <div className="flex items-center gap-1.5 border-r pr-3 border-slate-200">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{med.reminders}</span>
                       </div>
                       <div className="flex-1 italic leading-tight text-slate-500">
                          &quot;{med.instructions}&quot;
                       </div>
                    </div>

                    <Button 
                      className={`w-full h-11 text-sm font-bold shadow-sm transition-all duration-300 ${
                        isConfirmed 
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 cursor-default" 
                        : "bg-primary hover:bg-primary/95 text-white"
                      }`}
                      onClick={() => handleConfirmIntake(med.id)}
                      disabled={isConfirmed}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {t('patientPortal.meds.reminder')} (Done)
                        </>
                      ) : (
                        <>
                          <Pill className="h-4 w-4 mr-2" />
                          {t('patientPortal.meds.reminder')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Refill Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
          Refill Requests
        </h3>
        <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Plus className="h-16 w-16" />
          </div>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-1">
                <p className="text-sm font-bold">Need a prescription refill?</p>
                <p className="text-xs text-slate-300">Request a renewal from your primary doctor without visiting the clinic.</p>
             </div>
             <Button 
               variant="secondary" 
               className="w-full bg-white text-slate-900 font-bold h-10 hover:bg-slate-100"
               onClick={() => toast({ title: "Refill Requested", description: "Request sent to Dr. Santos. You'll be notified of approval." })}
             >
                Start Refill Request
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Warning Box */}
      <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex gap-3">
         <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
         <div className="space-y-1">
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Side Effect Reporting</p>
            <p className="text-[10px] text-red-600 leading-relaxed">
              If you experience severe dizziness, swelling, or rash after taking your medication, STOP intake and contact your clinic immediately or visit the ER.
            </p>
         </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
