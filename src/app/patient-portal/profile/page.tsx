'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  Bell, 
  LogOut, 
  Smartphone, 
  Lock, 
  Eye, 
  QrCode,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PatientProfilePage() {
  const router = useRouter();
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const [patientName, setPatientName] = useState('Augusto Mendes');
  const [nid, setNid] = useState('8832-1102-44');

  useEffect(() => {
    const storedName = localStorage.getItem('patient_name');
    const storedNid = localStorage.getItem('patient_nid');
    if (storedName) setPatientName(storedName);
    if (storedNid) setNid(storedNid);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('patient_nid');
    localStorage.removeItem('patient_name');
    router.push('/patient-portal/login');
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
        {t('patientPortal.nav.profile')}
      </h2>

      {/* User Card */}
      <div className="flex flex-col items-center py-6 space-y-4 bg-white rounded-2xl shadow-sm border border-slate-100">
         <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-primary/10 overflow-hidden">
               <Image 
                 src="https://picsum.photos/seed/patient/400" 
                 alt="User" 
                 width={96} 
                 height={96} 
                 className="object-cover"
                 referrerPolicy="no-referrer"
               />
            </div>
            <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
         </div>
         <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-800">{patientName}</h3>
            <p className="text-sm text-slate-500 font-mono tracking-tighter">NHIS: {nid}</p>
         </div>
         <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-widest text-[9px] font-bold">Standard Patient</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 uppercase tracking-widest text-[9px] font-bold">Verified</Badge>
         </div>
      </div>

      {/* Digital Health Card Quick Access */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                 <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-sm font-bold text-slate-800">{t('patientPortal.idCard.title')}</p>
                 <p className="text-[10px] text-slate-500">{t('patientPortal.idCard.scanDesc')}</p>
              </div>
           </div>
           <Button size="icon" variant="ghost" className="text-primary hover:bg-white">
              <Share2 className="h-4 w-4" />
           </Button>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-4">
         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">App Settings</h3>
         <Card className="border-slate-100 shadow-sm divide-y">
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Health Notifications</span>
               </div>
               <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Device Biometrics</span>
               </div>
               <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Hide PII on Summary</span>
               </div>
               <Switch />
            </div>
         </Card>

         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Privacy & Support</h3>
         <Card className="border-slate-100 shadow-sm divide-y">
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Privacy Policy</span>
               </div>
               <ExternalLink className="h-4 w-4 text-slate-300" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors" onClick={() => router.push('/technical-documentation')}>
               <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">System Information</span>
               </div>
               <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
         </Card>

         <Button 
           variant="outline" 
           className="w-full h-12 text-red-600 border-red-100 hover:bg-red-50 font-bold"
           onClick={handleLogout}
         >
           <LogOut className="h-5 w-5 mr-2" />
           Log Out from Portal
         </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 font-medium pb-8 uppercase tracking-widest">
        H365 Clinical Node ID: CL-772-MZ
      </p>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
