'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function PatientLoginPage() {
  const router = useRouter();
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const { toast } = useToast();
  
  const [nid, setNid] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!nid || nid.length < 5) {
      toast({
        variant: "destructive",
        title: t('patientPortal.error.invalidId'),
        description: "National ID must be at least 5 digits for this demo."
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Store session (mock)
      localStorage.setItem('patient_nid', nid);
      localStorage.setItem('patient_name', 'Augusto Mendes'); // Mock patient name
      
      router.push('/patient-portal');
      toast({
        title: "Welcome to H365 Portal",
        description: "You have successfully logged in."
      });
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
             <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('patientPortal.login.title')}
          </h1>
          <p className="text-sm text-slate-500 px-4">
            {t('patientPortal.login.subtitle')}
          </p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden">
          <CardHeader className="bg-white pb-2">
            <Badge variant="outline" className="w-fit mb-2 bg-slate-50 text-slate-500 border-slate-200 font-medium">
              NHIS CERTIFIED
            </Badge>
            <CardTitle className="text-lg">{t('patientPortal.login.idLabel')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('patientPortal.login.idPlaceholder')}
                  value={nid}
                  onChange={(e) => setNid(e.target.value.replace(/\D/g, ''))}
                  className="h-12 text-lg text-center tracking-[0.2em] font-mono border-slate-200 focus:ring-primary/20"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/95 shadow-md shadow-primary/20 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('patientPortal.login.button')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-3 text-[11px] text-blue-700 leading-relaxed">
               <Info className="h-4 w-4 shrink-0 mt-0.5" />
               <p>
                 {t('patientPortal.login.footer')}
               </p>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/80 border-t flex flex-col pt-4">
             <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Security Standard</span>
                <div className="h-px flex-1 bg-slate-200" />
             </div>
             <div className="flex justify-center gap-6 mt-4 opacity-50 grayscale">
                <Image src="https://flagcdn.com/w40/mz.png" alt="MZ" width={40} height={30} className="h-4 w-auto" />
                <Image src="https://flagcdn.com/w40/ng.png" alt="NG" width={40} height={30} className="h-4 w-auto" />
                <Image src="https://flagcdn.com/w40/et.png" alt="ET" width={40} height={30} className="h-4 w-auto" />
             </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Powered by H365 Universal Health Node • v0.4.2
        </p>
      </div>
    </div>
  );
}
