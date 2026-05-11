'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  BrainCircuit, 
  Lock, 
  ArrowLeft, 
  Server,
  Cloud,
  Info,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function TechnicalDocumentationPage() {
  const router = useRouter();
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const sections = [
    {
      icon: WifiOff,
      title: t('system.docs.connectivity.title'),
      desc: t('system.docs.connectivity.desc'),
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      icon: BrainCircuit,
      title: t('system.docs.ai.title'),
      desc: t('system.docs.ai.desc'),
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      icon: Lock,
      title: t('system.docs.security.title'),
      desc: t('system.docs.security.desc'),
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-md mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="pl-0 text-slate-500 hover:text-primary transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('system.docs.back')}
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              {t('system.docs.title')}
            </h1>
            <p className="text-sm text-slate-500">
              {t('system.docs.subtitle')}
            </p>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-4">
          <Link href="/docs" className="block group">
            <Card className="border-2 border-dashed border-teal-200 bg-teal-50/30 group-hover:border-teal-500 transition-all overflow-hidden">
               <CardContent className="p-6 flex gap-4">
                  <div className={`h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/20`}>
                     <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                     <h2 className="text-lg font-bold text-teal-900 leading-none flex items-center gap-2">
                        Detailed Technical Manuals
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </h2>
                     <p className="text-xs text-teal-700 leading-relaxed">
                        Access deep-dives on interoperability, security audits, and offline architecture.
                     </p>
                  </div>
               </CardContent>
            </Card>
          </Link>

          {sections.map((section, index) => (
            <Card key={index} className="border-none shadow-sm overflow-hidden">
               <CardContent className="p-6 flex gap-4">
                  <div className={`h-12 w-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center shrink-0 border border-slate-100`}>
                     <section.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                     <h2 className="text-lg font-bold text-slate-800 leading-none">
                        {section.title}
                     </h2>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        {section.desc}
                     </p>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>

        {/* System Architecture Visualization (Simplified) */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
            Data Flow Architecture
          </h3>
          <Card className="bg-slate-900 text-white border-none p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Server className="h-32 w-32" />
             </div>
             
             <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex w-full justify-between items-center px-4">
                   <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                         <Smartphone className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase">Mobile Client</span>
                   </div>
                   
                   <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="h-px bg-slate-700 w-full relative">
                         <Wifi className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono">L-LAN (Peer)</span>
                   </div>

                   <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                         <Server className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase">Local Edge Node</span>
                   </div>

                   <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="h-px bg-slate-700 w-full relative">
                         <Cloud className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-blue-400 animate-pulse" />
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono">Satellite Sync</span>
                   </div>

                   <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                         <ShieldCheck className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase">MoH Core</span>
                   </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 w-full">
                   <div className="flex gap-3 text-[10px] items-start">
                      <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-slate-300 leading-normal">
                         H365 uses <strong>Attribute-Based Access Control (ABAC)</strong>. Your identifiers are verified against the National Instance of OpenHIE before any clinical data is decrypted for mobile viewing.
                      </p>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        <div className="pt-8 flex flex-col items-center space-y-4 text-center">
           <div className="h-10 w-32 grayscale opacity-30 invert relative">
              <Image 
                src="https://flagcdn.com/w80/mz.png" 
                alt="MoH Logo" 
                fill 
                className="object-contain" 
              />
           </div>
           <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">
             This system is part of the National Integrated Health Information System (NIHIS). Unauthorized access is prohibited.
           </p>
        </div>
      </div>
    </div>
  );
}

function Smartphone(props: any) {
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
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}
