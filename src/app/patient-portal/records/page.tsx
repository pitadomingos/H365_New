'use client';

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Beaker, 
  Image as ImageIcon, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';

import { useToast } from '@/hooks/use-toast';

export default function PatientRecordsPage() {
  const { toast } = useToast();
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const [searchQuery, setSearchQuery] = useState('');

  const visitHistory = [
    { id: 1, date: '2026-05-02', dept: 'Internal Medicine', reason: 'HTN Follow-up', doctor: 'Dr. Santos', facility: 'Central General' },
    { id: 2, date: '2026-03-15', dept: 'Cardiology', reason: 'Initial Assessment', doctor: 'Dr. Martins', facility: 'Regional Specialty' },
    { id: 3, date: '2026-02-10', dept: 'Laboratory', reason: 'Routine CBC/Lipids', facility: 'Main Lab' },
    { id: 4, date: '2025-12-20', dept: 'General Practice', reason: 'Flu Symptoms', doctor: 'Dr. Silva', facility: 'District Clinic' },
  ];

  const labResults = [
    { id: 1, test: 'Complete Blood Count (CBC)', date: '2026-02-12', status: 'Normal', results: 'Hb: 14.2 g/dL, WBC: 6.5 x10^9/L' },
    { id: 2, test: 'Lipid Profile', date: '2026-02-12', status: 'Elevated', results: 'Total Chol: 210 mg/dL, LDL: 135 mg/dL' },
    { id: 3, test: 'Glucose (Fasting)', date: '2025-06-10', status: 'Normal', results: '92 mg/dL' },
  ];

  const filteredVisits = visitHistory.filter(v => 
    v.dept.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabs = labResults.filter(l => 
    l.test.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('patientPortal.records.title')}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-slate-500"
          onClick={() => toast({ title: "Filters", description: "Advanced filtering will be available after the next L-LAN sync." })}
        >
           <Filter className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search visits, labs, or reports..." 
          className="pl-10 h-11 bg-white border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-slate-100 p-1 h-12">
          <TabsTrigger value="visits" className="text-xs font-bold uppercase tracking-wider h-10 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Visits
          </TabsTrigger>
          <TabsTrigger value="labs" className="text-xs font-bold uppercase tracking-wider h-10 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <Beaker className="h-3.5 w-3.5 mr-1.5" /> Labs
          </TabsTrigger>
          <TabsTrigger value="imaging" className="text-xs font-bold uppercase tracking-wider h-10 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" /> Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="space-y-3">
             {filteredVisits.map((visit) => (
               <Card 
                 key={visit.id} 
                 className="shadow-sm border-slate-100 hover:border-primary/20 transition-all group active:scale-[0.98] cursor-pointer"
                 onClick={() => toast({ title: "Visit Summary", description: `Consultation with ${visit.doctor || 'Provider'} at ${visit.facility}. Record ID: ${visit.id}` })}
               >
                 <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                       <div className="flex items-center justify-between">
                         <p className="text-xs font-bold text-slate-400 tracking-wider">
                           {new Date(visit.date).toLocaleDateString(currentLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                         </p>
                         <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600">Verified</Badge>
                       </div>
                       <p className="text-sm font-bold text-slate-800">{visit.dept}</p>
                       <p className="text-xs text-slate-500 italic">&quot;Reason: {visit.reason}&quot;</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>

        <TabsContent value="labs" className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="space-y-3">
             {filteredLabs.map((lab) => (
               <Card key={lab.id} className="shadow-sm border-slate-100 overflow-hidden">
                 <div className={cn("h-1 w-full", lab.status === 'Elevated' ? "bg-orange-500" : "bg-green-500")} />
                 <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800">{lab.test}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">{lab.date}</p>
                       </div>
                       <Badge className={cn(
                          "text-[10px] font-bold",
                          lab.status === 'Normal' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                       )}>
                         {lab.status}
                       </Badge>
                    </div>
                    <div className="p-2 rounded bg-slate-50 text-[11px] font-mono whitespace-pre-wrap text-slate-600 border border-slate-100">
                       {lab.results}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[10px] uppercase font-bold text-primary h-8 hover:bg-primary/5"
                      onClick={() => toast({ title: "Downloading Report", description: `Lab_${lab.id}_Results.pdf is being prepared.` })}
                    >
                        <Download className="h-3 w-3 mr-1.5" /> Full Lab Report
                    </Button>
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>

        <TabsContent value="imaging" className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
                 <ImageIcon className="h-8 w-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-bold text-slate-800">No Imaging Reports Found</p>
                 <p className="text-xs text-slate-500 px-4">Imaging data usually takes 2-5 business days to be verified and uploaded here.</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs font-bold border-slate-200">Check Sync Status</Button>
           </div>
        </TabsContent>
      </Tabs>

      {/* Safety Banner */}
      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 shadow-inner">
         <Clock className="h-5 w-5 text-orange-500 shrink-0" />
         <div className="space-y-1">
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Deferred Sync Notice</p>
            <p className="text-[11px] text-orange-600 leading-relaxed">
              New records from remote clinics might take up to 24 hours to appear here due to satellite/L-LAN sync cycles.
            </p>
         </div>
      </div>
      
      <div className="h-4" />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
