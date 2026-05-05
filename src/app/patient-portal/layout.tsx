'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ClipboardList, Pill, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const isLoginPage = pathname === '/patient-portal/login';

  const navItems = [
    { icon: Home, label: t('patientPortal.nav.home'), path: '/patient-portal' },
    { icon: ClipboardList, label: t('patientPortal.nav.records'), path: '/patient-portal/records' },
    { icon: Pill, label: t('patientPortal.nav.meds'), path: '/patient-portal/medications' },
    { icon: User, label: t('patientPortal.nav.profile'), path: '/patient-portal/profile' },
  ];

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b">
        <div className="flex items-center gap-2">
           <div className="bg-primary rounded-lg p-1.5 shadow-md">
             <Home className="h-5 w-5 text-white" />
           </div>
           <span className="font-bold text-slate-800 tracking-tight text-lg">H365 Patient</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-500 hover:text-red-600 transition-colors"
          onClick={() => router.push('/patient-portal/login')}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-white/80 backdrop-blur-lg px-2 py-2 safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] py-1 transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
              <span className={cn("text-[10px] font-medium uppercase tracking-wider", isActive ? "text-primary" : "text-slate-400")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-2 h-1 w-8 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
