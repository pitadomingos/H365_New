"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  BarChartBig, 
  FileText, 
  Download, 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  Printer, 
  Mail, 
  FileSpreadsheet, 
  FileJson,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Users,
  Activity,
  Warehouse,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Mock Report Templates
const REPORT_TEMPLATES = [
  { id: "REP-001", title: "Daily Inpatient Census", category: "Clinical", desc: "Detailed breakdown of stay-in patients by ward.", format: ["PDF", "XLSX"], popularity: "High" },
  { id: "REP-002", title: "Monthly Disease Prevalence", category: "Public Health", desc: "Top 10 diseases diagnosed across all clinics.", format: ["PDF", "CSV"], popularity: "Medium" },
  { id: "REP-003", title: "Pharmacy Stock Level Alert", category: "Inventory", desc: "Items below safety stock thresholds.", format: ["XLSX"], popularity: "Critical" },
  { id: "REP-004", title: "Revenue Summary by Dept", category: "Financial", desc: "Aggregated billing data for administrative review.", format: ["PDF", "XLSX"], popularity: "High" },
  { id: "REP-005", title: "Doctor Workload Analytics", category: "Operational", desc: "Consultations performed vs. available hours.", format: ["PDF"], popularity: "Low" },
  { id: "REP-006", title: "Lab Turnaround Time", category: "Clinical", desc: "Time from request to validated result.", format: ["PDF", "CSV"], popularity: "Medium" },
  { id: "REP-007", title: "Maternal Health Outcome", category: "Clinical", desc: "National metrics for prenatal & postnatal care.", format: ["PDF"], popularity: "High" },
  { id: "REP-008", title: "Blood Bank Availability", category: "Inventory", desc: "Current units available by blood group and hub.", format: ["XLSX", "JSON"], popularity: "Critical" },
];

const RECENT_GENERATED = [
  { id: "EXP-881", name: "Weekly Operational Summary", date: "2024-05-03 14:20", status: "Completed", type: "PDF", size: "2.4 MB" },
  { id: "EXP-880", name: "EPI Vaccination Data Q1", date: "2024-05-02 09:15", status: "Completed", type: "XLSX", size: "15.8 MB" },
  { id: "EXP-879", name: "Malaria Outbreak Report", date: "2024-05-01 18:45", status: "Error", type: "PDF", size: "0 B" },
  { id: "EXP-878", name: "Staff Payroll Metadata", date: "2024-04-30 11:30", status: "Completed", type: "CSV", size: "840 KB" },
];

export default function ReportingPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredTemplates = REPORT_TEMPLATES.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tpl.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || tpl.category.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const categories = [
    { id: "all", label: "All Reports", icon: BarChartBig },
    { id: "clinical", label: "Clinical", icon: Stethoscope },
    { id: "operational", label: "Operational", icon: Activity },
    { id: "financial", label: "Financial", icon: CreditCard },
    { id: "inventory", label: "Inventory", icon: Warehouse }
  ];

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <BarChartBig className="h-8 w-8 text-indigo-600 shadow-sm" />
            </div>
            {t('reporting.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest pl-1">
            {t('reporting.overview.description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-background border-2">
            <Calendar className="mr-2 h-4 w-4" /> Schedule Automations
          </Button>
          <Button size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6">
            <Plus className="mr-2 h-4 w-4" /> Create Custom Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative group">
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-none text-[8px] font-black uppercase">LIVE SYSTEM</Badge>
            </div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Total Reports Generated (May)</p>
            <p className="text-3xl font-black mt-1">1,482</p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase">
               <ArrowUpRight className="h-3.5 w-3.5" /> +12% Efficiency Boost
            </div>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <BarChartBig className="h-32 w-32 rotate-12" />
          </div>
        </Card>

        <Card className="border-none shadow-sm relative group overflow-hidden">
          <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <Badge variant="outline" className="text-[8px] font-black uppercase">PROCESSING</Badge>
            </div>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Pending Scheduled Tasks</p>
            <p className="text-3xl font-black mt-1">24</p>
            <div className="mt-4 text-[10px] font-bold uppercase text-amber-600 flex items-center gap-1.5">
               <Activity className="h-3.5 w-3.5" /> Next: Daily Census (00:00)
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative group overflow-hidden">
          <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-[8px] font-black uppercase">STORAGE</Badge>
            </div>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Archived Report Volume</p>
            <p className="text-3xl font-black mt-1">4.2 TB</p>
            <div className="mt-4 text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
               <Warehouse className="h-3.5 w-3.5" /> Cloud Storage Active
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 flex gap-6 border-b rounded-none mb-6">
          <TabsTrigger 
            value="catalog" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-tight transition-all"
          >
            Report Catalog
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-tight transition-all"
          >
            Generation History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-3 rounded-2xl border border-border/50">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search report templates..." 
                className="pl-10 h-10 border-none bg-background/50 focus-visible:ring-indigo-600/20 text-xs shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
               {categories.map((cat) => (
                 <Badge 
                   key={cat.id}
                   variant="outline" 
                   className={cn(
                     "cursor-pointer px-4 py-1.5 text-[9px] uppercase font-black border-2 transition-all flex items-center gap-2", 
                     activeTab === cat.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-background hover:bg-muted border-border"
                   )}
                   onClick={() => setActiveTab(cat.id)}
                 >
                   <cat.icon className="h-3 w-3" />
                   {cat.label}
                 </Badge>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
             <AnimatePresence mode="popLayout">
               {filteredTemplates.map((tpl, i) => (
                 <motion.div
                   key={tpl.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                   layout
                 >
                   <Card className="h-full flex flex-col group hover:shadow-md hover:border-indigo-600/30 transition-all border-none shadow-sm overflow-hidden border border-transparent">
                     <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                           <Badge variant="outline" className="text-[8px] font-black uppercase text-indigo-600 border-indigo-600/20 py-0 px-1.5 h-4">
                              {tpl.category}
                           </Badge>
                           <span className={cn(
                             "text-[8px] font-black uppercase px-2 py-0 h-4 rounded-full flex items-center",
                             tpl.popularity === 'Critical' ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600"
                           )}>
                              {tpl.popularity}
                           </span>
                        </div>
                        <CardTitle className="text-base font-black tracking-tight mt-1 line-clamp-1">{tpl.title}</CardTitle>
                        <CardDescription className="text-[10px] font-medium leading-tight line-clamp-2 h-8">
                           {tpl.desc}
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="flex-grow py-2">
                        <div className="flex gap-2">
                           {tpl.format.map(fmt => (
                             <Badge key={fmt} variant="secondary" className="bg-slate-50 text-slate-500 text-[8px] font-bold px-1 py-0 border-none">
                               {fmt}
                             </Badge>
                           ))}
                        </div>
                     </CardContent>
                     <CardFooter className="pt-2 border-t mt-auto">
                        <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-indigo-600 h-9 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           Generate <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                     </CardFooter>
                   </Card>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="history" className="outline-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report ID</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report Name</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Format</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Generated At</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                   {RECENT_GENERATED.map((log) => (
                     <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="p-4 font-mono text-[10px] font-bold">{log.id}</td>
                       <td className="p-4">
                          <p className="text-xs font-black">{log.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{log.size}</p>
                       </td>
                       <td className="p-4 text-center">
                          <Badge variant="outline" className="text-[9px] font-black">{log.type}</Badge>
                       </td>
                       <td className="p-4 text-[11px] text-muted-foreground font-medium">{log.date}</td>
                       <td className="p-4">
                          <Badge className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 border-none flex items-center w-fit",
                            log.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                             {log.status === 'Completed' ? <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> : <AlertCircle className="h-2.5 w-2.5 mr-1" />}
                             {log.status}
                          </Badge>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                               <Printer className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                               <Mail className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50">
                               <Download className="h-4 w-4" />
                             </Button>
                          </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
            <CardFooter className="p-4 flex justify-between items-center bg-muted/10 border-t">
               <p className="text-[10px] text-muted-foreground font-black uppercase">Showing 4 of 248 entries</p>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase bg-white">Previous</Button>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase bg-white border-2 border-indigo-600 text-indigo-600">Next</Button>
               </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
    
