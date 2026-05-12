'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Droplet, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink,
  QrCode,
  Activity,
  History,
  TrendingUp,
  Download,
  Info,
  Apple,
  Stethoscope,
  Heart,
  ShieldCheck as ShieldIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import Image from 'next/image';

export default function PatientDashboard() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('patient_profile');
    if (storedProfile) {
      setPatient(JSON.parse(storedProfile));
    }
  }, []);

  if (!patient) return null;

  const patientName = patient.fullName;
  const patientPhoto = patient.photoUrl || 'https://picsum.photos/seed/patient/200';
  const nid = patient.nationalId;

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('patientPortal.dashboard.welcome', { name: patientName.split(' ')[0] })}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
             <Activity className="h-3 w-3 text-green-500" /> System Status: Online • Last Sync 2m ago
          </p>
        </div>
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden">
           <Image 
             src={patientPhoto} 
             alt="User" 
             width={48} 
             height={48} 
             className="rounded-full object-cover"
             referrerPolicy="no-referrer"
           />
        </div>
      </div>

      {/* Digital Health ID Card */}
      <Card className="bg-gradient-to-br from-primary to-indigo-700 text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Droplet className="h-24 w-24" />
        </div>
        <CardContent className="p-6 space-y-6 relative z-10">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">National Health Service</p>
               <h3 className="text-xl font-bold leading-none">{patientName}</h3>
             </div>
             <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <QrCode className="h-8 w-8" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-0.5">
                <p className="text-[10px] uppercase opacity-70">Document ID</p>
                <p className="font-mono text-sm tracking-wider">{nid}</p>
             </div>
             <div className="space-y-0.5 text-right">
                <p className="text-[10px] uppercase opacity-70">{t('patientPortal.dashboard.bloodType')}</p>
                <p className="text-lg font-bold">B Positive (B+)</p>
             </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
             <div className="flex -space-x-1">
                <div className="h-6 w-10 bg-white/20 rounded-sm border border-white/30" />
                <div className="h-6 w-10 bg-white/10 rounded-sm border border-white/20" />
             </div>
             <p className="text-[10px] italic opacity-80">Valid: LIFETIME ACCESS</p>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
          {t('patientPortal.dashboard.summary')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm border-slate-100 hover:border-red-200 transition-colors group">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-red-50 text-red-700 border-red-100">CRITICAL</Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{t('patientPortal.dashboard.allergies')}</p>
                <p className="text-sm font-semibold text-slate-800">Penicillin, Latex</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100 hover:border-blue-200 transition-colors group">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Dna className="h-5 w-5 text-blue-500" />
                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100">MONITOR</Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{t('patientPortal.dashboard.conditions')}</p>
                <p className="text-sm font-semibold text-slate-800">Hypertension</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clinical Recommendations & Nutrition */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
          {t('patientPortal.dashboard.recommendations')}
        </h3>
        
        <div className="space-y-3">
          {/* Nutrition Guidance */}
          <Card className="shadow-sm border-slate-100 overflow-hidden border-l-4 border-l-green-500">
            <CardContent className="p-4 flex gap-4">
               <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                  <Apple className="h-5 w-5" />
               </div>
               <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{t('patientPortal.dashboard.nutrition')}</p>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-green-50 text-green-700 border-green-200">ACTIVE</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Low Sodium Diet Plan</p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Increase intake of potassium-rich foods (bananas, potatoes) to support your blood pressure management. Limit processed salts.
                  </p>
               </div>
            </CardContent>
          </Card>

          {/* HIV/TB or Chronic Status */}
          <Card className="shadow-sm border-slate-100 overflow-hidden border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex gap-4">
               <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Stethoscope className="h-5 w-5" />
               </div>
               <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{t('patientPortal.dashboard.treatmentPlan')}</p>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-200">STABLE</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-800">HIV Management (ART)</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[95%]" />
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">95% Compliance</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Viral load at last check (Mar 20) was undetected. Next CD4 count scheduled for June 5.
                  </p>
               </div>
            </CardContent>
          </Card>

          {/* TB Monitoring */}
          <Card className="shadow-sm border-slate-100 overflow-hidden border-l-4 border-l-orange-500">
            <CardContent className="p-4 flex gap-4">
               <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                  <Activity className="h-5 w-5" />
               </div>
               <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">TB Screening & Prevention</p>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-orange-50 text-orange-700 border-orange-200">PENDING</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Sputum Test Required</p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Please visit the lab for your scheduled TB screening. Early detection is critical for your treatment plan.
                  </p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Last Visit */}
      <Card className="shadow-sm border-slate-100 overflow-hidden group">
        <CardHeader className="bg-slate-50/50 py-3 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {t('patientPortal.dashboard.recentVisit')}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">May 02, 2026</span>
        </CardHeader>
        <CardContent className="p-4 py-3 space-y-4">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
               <p className="text-md font-bold text-slate-800 leading-none">Internal Medicine</p>
               <p className="text-xs text-slate-500 flex items-center gap-1">
                 <MapPin className="h-3 w-3" /> Central General Hospital
               </p>
             </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                <ExternalLink className="h-4 w-4" />
             </Button>
          </div>
          <div className="p-2 border border-dashed rounded-md bg-slate-50/30">
             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Clinic Summary</p>
             <p className="text-xs italic text-slate-600 leading-snug">
               &quot;Patient stable on current treatment. Blood pressure slightly elevated at 145/95. Recommended daily walking and sodium restriction.&quot;
             </p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
          {t('patientPortal.dashboard.upcoming')}
        </h3>
        <Card className="shadow-sm border-slate-100 divide-y">
           <div className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center border border-orange-100">
                 <span className="text-[10px] font-bold leading-none">MAY</span>
                 <span className="text-lg font-bold leading-none">12</span>
              </div>
              <div className="flex-1 space-y-1">
                 <p className="text-sm font-bold text-slate-800 leading-none">Cardiology Review</p>
                 <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 09:30 AM • Dr. Ricardo Santos
                 </p>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">TOMORROW</Badge>
           </div>
           
           <div className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100">
                 <span className="text-[10px] font-bold leading-none">JUN</span>
                 <span className="text-lg font-bold leading-none">05</span>
              </div>
              <div className="flex-1 space-y-1">
                 <p className="text-sm font-bold text-slate-800 leading-none">Routine Lab Work</p>
                 <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 08:00 AM • Main Laboratory
                 </p>
              </div>
           </div>
        </Card>
      </div>

      {/* Support Box */}
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
         <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
               <Info className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Health Information Hub</p>
         </div>
         <p className="text-xs text-slate-600 leading-relaxed">
            Every entry in your health hub is verified by a clinical provider. For emergencies, please call the National Medical Helpline (117) or visit your nearest ER.
         </p>
         <Button variant="outline" className="w-full h-9 border-primary/20 text-primary text-xs font-bold hover:bg-primary/5">
            <Download className="h-3.5 w-3.5 mr-2" /> Download Health Report (PDF)
         </Button>
      </div>

      <div className="h-4" /> {/* Spacer for bottom nav */}
    </div>
  );
}
