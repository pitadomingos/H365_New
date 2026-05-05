
"use client";

import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Video, 
  Search, 
  Download, 
  ChevronRight,
  GraduationCap,
  Users,
  Stethoscope,
  Database,
  SearchCheck,
  HelpCircle,
  Layout,
  ExternalLink,
  Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';

// Training Media Types
type MediaType = 'VIDEO' | 'PDF' | 'QUIZ' | 'GUIDE';

interface Resource {
  id: string;
  title: string;
  duration: string;
  type: MediaType;
  completed: boolean;
  desc: string;
}

interface Pathway {
  id: string;
  titleKey: string;
  icon: any;
  progress: number;
  totalResources: number;
  completedResources: number;
  color: string;
  resources: Resource[];
}

const MOCK_PATHWAYS: Pathway[] = [
  {
    id: 'clinical',
    titleKey: 'training.pathway.clinical',
    icon: Stethoscope,
    progress: 75,
    totalResources: 8,
    completedResources: 6,
    color: 'blue',
    resources: [
      { id: 'c-1', title: 'Standard Patient Consultation Flow', duration: '12m', type: 'VIDEO', completed: true, desc: 'A step-by-step guide on recording Vitals and Symptoms in the platform.' },
      { id: 'c-2', title: 'Electronic Prescriptions (ePrescribe)', duration: '8m', type: 'VIDEO', completed: true, desc: 'How to manage the hospital pharmacy formulary and issue digital prescriptions.' },
      { id: 'c-3', title: 'Maternity Care & ANC Mapping', duration: '15m', type: 'GUIDE', completed: true, desc: 'Detailed workflow for Anti-Natal Care and high-risk pregnancy tracking.' },
      { id: 'c-4', title: 'Clinical Safety Protocol', duration: '5m', type: 'QUIZ', completed: false, desc: 'Verifying patient identity across digital records.' },
    ]
  },
  {
    id: 'admin',
    titleKey: 'training.pathway.admin',
    icon: Users,
    progress: 30,
    totalResources: 5,
    completedResources: 1,
    color: 'emerald',
    resources: [
      { id: 'a-1', title: 'Patient Registration & MPI Search', duration: '10m', type: 'VIDEO', completed: true, desc: 'How to uniquely identify patients using the Master Patient Index.' },
      { id: 'a-2', title: 'Health Insurance Billing Systems', duration: '20m', type: 'PDF', completed: false, desc: 'Integration with national insurance funds and claim reconciliation.' },
      { id: 'a-3', title: 'Inventory Request Workflow', duration: '6m', type: 'VIDEO', completed: false, desc: 'Ordering stock from the National Warehouse.' },
    ]
  },
  {
    id: 'it',
    titleKey: 'training.pathway.it',
    icon: Database,
    progress: 10,
    totalResources: 6,
    completedResources: 0,
    color: 'amber',
    resources: [
      { id: 'i-1', title: 'Managed Sync & Offline Operations', duration: '15m', type: 'VIDEO', completed: false, desc: 'Operating H365 when low-bandwidth or disconnected.' },
      { id: 'i-2', title: 'Role Based Access Control (RBAC)', duration: '12m', type: 'PDF', completed: false, desc: 'Configuring user permissions and security groups.' },
      { id: 'i-3', title: 'System Heartbeat & Node Status', duration: '5m', type: 'GUIDE', completed: false, desc: 'Monitoring the health of your local hospital node.' },
    ]
  }
];

export default function TrainingMaterialsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [activePathway, setActivePathway] = useState<string>('clinical');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPathway = MOCK_PATHWAYS.find(p => p.id === activePathway);

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <GraduationCap className="w-full h-full -rotate-12 translate-x-12 translate-y-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-blue-500 text-white border-none uppercase tracking-widest text-[10px] py-1 px-3">
             {t('training.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {t('training.hero.title')}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            {t('training.hero.desc')}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
             <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 h-12 shadow-xl shadow-blue-500/20">
               {t('training.hero.resume')}
             </Button>
             <Button variant="outline" className="border-slate-700 text-white hover:bg-white/10 font-bold px-8 h-12">
               {t('training.hero.download')}
             </Button>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Learning Pathways Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">{t('training.sidebar.pathways')}</h3>
             <div className="flex flex-col gap-3">
                {MOCK_PATHWAYS.map((path) => {
                  const Icon = path.icon;
                  return (
                    <button
                      key={path.id}
                      onClick={() => setActivePathway(path.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all duration-300 group",
                        activePathway === path.id 
                          ? "bg-white dark:bg-slate-900 border-primary shadow-lg ring-4 ring-primary/5" 
                          : "bg-background border-border hover:border-primary/50 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-4 mb-4">
                         <div className={cn(
                           "p-3 rounded-xl transition-transform group-hover:scale-110",
                           activePathway === path.id ? `bg-${path.color}-100 text-${path.color}-600` : "bg-muted text-muted-foreground"
                         )}>
                           <Icon className="h-6 w-6" />
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-sm">{t(path.titleKey as any)}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                              {path.completedResources} / {path.totalResources} {t('training.resource.completed').toLowerCase()}
                            </p>
                         </div>
                         {path.progress === 100 && (
                           <Award className="h-5 w-5 text-amber-500 shrink-0" />
                         )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black italic">
                          <span className="text-muted-foreground">{t('training.sidebar.progress')}</span>
                          <span>{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-1.5" />
                      </div>
                    </button>
                  )
                })}
             </div>
          </div>

          <Card className="border-none shadow-xl bg-primary/5">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                   <Award className="h-4 w-4 text-amber-600" /> {t('training.sidebar.certTitle')}
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                   {t('training.sidebar.certDesc')}
                </p>
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-dashed flex items-center gap-3">
                   <div className="p-2 bg-slate-100 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-slate-400" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('training.sidebar.milestone')}</p>
                      <h5 className="text-xs font-black">H365 Clinical Lead v2.0</h5>
                   </div>
                </div>
             </CardContent>
          </Card>
        </aside>

        {/* Right Column: Resource List */}
        <main className="lg:col-span-8 flex flex-col gap-6">
           {/* Filtering and Selection Header */}
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background p-4 rounded-2xl border shadow-sm">
             <div className="flex items-center gap-4">
                <Layout className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black uppercase tracking-tight">{t(currentPathway?.titleKey as any)}</h2>
             </div>
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('training.search.placeholder')} 
                  className="pl-9 h-10 text-xs border-none bg-muted/40 transition-all focus:bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
           </div>

           {/* Resources Feed */}
           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {currentPathway?.resources
                  .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((res, i) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={cn(
                      "group border-none shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden",
                      res.completed ? "bg-slate-50 dark:bg-slate-900/50" : "bg-white dark:bg-slate-900"
                    )}>
                      {res.completed && (
                        <div className="absolute top-0 right-0 p-2">
                           <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                              <CheckCircle2 className="h-3 w-3" />
                           </div>
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                           <div className={cn(
                             "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                             res.type === 'VIDEO' ? "bg-red-50 text-red-600" :
                             res.type === 'QUIZ' ? "bg-amber-50 text-amber-600" :
                             "bg-blue-50 text-blue-600"
                           )}>
                              {res.type === 'VIDEO' ? <Video className="h-8 w-8" /> : 
                               res.type === 'QUIZ' ? <SearchCheck className="h-8 w-8" /> : 
                               <FileText className="h-8 w-8" />
                              }
                           </div>

                           <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                 <h3 className="text-md font-bold group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">{res.title}</h3>
                                 <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-slate-200">
                                   {res.type}
                                 </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                                {res.desc}
                              </p>
                              <div className="flex items-center gap-6 pt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                  <Clock className="h-3.5 w-3.5" /> {t('training.resource.estimated')}: {res.duration}
                                </span>
                                <span className={cn(
                                  "flex items-center gap-1.5 text-[10px] font-bold",
                                  res.completed ? "text-emerald-600" : "text-amber-600"
                                )}>
                                  {res.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                  {res.completed ? t('training.resource.completed') : t('training.resource.inProgress')}
                                </span>
                              </div>
                           </div>

                           <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 md:pt-2">
                              <Button size="sm" className={cn(
                                "gap-2 text-[10px] font-black uppercase h-10 px-6",
                                res.completed ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800" : "bg-primary text-white"
                              )}>
                                {res.completed ? t('training.action.review') : t('training.action.start')}
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 gap-2">
                                <Download className="h-4 w-4" /> {t('training.action.downloadPdf')}
                              </Button>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           {/* Feedback & Support Section */}
           <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden group">
                 <CardContent className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                       <h3 className="text-lg font-black uppercase">{t('training.support.helpTitle')}</h3>
                       <HelpCircle className="h-8 w-8 text-slate-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                       {t('training.support.helpDesc')}
                    </p>
                    <Button className="w-full bg-white text-slate-900 border-none font-bold uppercase text-[10px] h-11">
                       {t('training.support.contact')}
                    </Button>
                 </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-blue-600 text-white overflow-hidden">
                 <CardContent className="p-8 space-y-4">
                    <h3 className="text-lg font-black uppercase">{t('training.support.techTitle')}</h3>
                    <p className="text-white/80 text-xs leading-relaxed">
                       {t('training.support.techDesc')}
                    </p>
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 font-bold uppercase text-[10px] h-11 gap-2">
                       {t('training.support.wiki')} <ExternalLink className="h-3 w-3" />
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </main>
      </div>
    </div>
  );
}
