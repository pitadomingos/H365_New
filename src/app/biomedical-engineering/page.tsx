"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ClipboardList,
  History,
  Activity,
  Cpu,
  BarChart3,
  Calendar as CalendarIcon,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_ASSETS = [
  { id: "BME-RAD-001", name: "MRI Scanner", dept: "Radiology", status: "Functional", lastMaint: "2026-03-15", nextCalib: "2026-09-15", criticality: "High", riskScore: 12 },
  { id: "BME-ER-042", name: "Patient Monitor", dept: "Emergency", status: "In Repair", lastMaint: "2026-04-20", nextCalib: "2026-10-20", criticality: "High", riskScore: 85 },
  { id: "BME-LAB-012", name: "Hematology Analyzer", dept: "Laboratory", status: "Functional", lastMaint: "2026-02-10", nextCalib: "2026-05-10", criticality: "Medium", riskScore: 45 },
  { id: "BME-OPD-005", name: "Digital ECG", dept: "Outpatient", status: "Due for Calib", lastMaint: "2025-11-05", nextCalib: "2026-05-05", criticality: "Low", riskScore: 68 },
  { id: "BME-ICU-021", name: "Ventilator V12", dept: "ICU", status: "Functional", lastMaint: "2026-04-01", nextCalib: "2026-10-01", criticality: "Critical", riskScore: 15 },
];

const MOCK_SPARE_PARTS = [
  { id: "PART-001", name: "Oxymetry Sensor", stock: 12, minStock: 5, unit: "pcs", critical: true },
  { id: "PART-012", name: "MRI Helium Level Sensor", stock: 1, minStock: 2, unit: "kit", critical: true },
  { id: "PART-045", name: "Ventilator Filter Kit", stock: 45, minStock: 20, unit: "box", critical: false },
  { id: "PART-099", name: "ECG Lead Gel", stock: 8, minStock: 10, unit: "bottle", critical: false },
];

const MOCK_CONTRACTS = [
  { id: "SC-2026-01", provider: "GE Healthcare", asset: "MRI & Radiology Suite", expiry: "2027-12-31", type: "Full Comprehensive" },
  { id: "SC-2026-05", provider: "Philips Med", asset: "Patient Monitoring System", expiry: "2026-08-15", type: "Labor Only" },
];

const MOCK_WORK_ORDERS = [
  { id: "WO-1029", asset: "Patient Monitor", type: "Repair", priority: "High", status: "Pending", assigned: "Tech John" },
  { id: "WO-1030", asset: "MRI Scanner", type: "Preventive", priority: "Medium", status: "In Progress", assigned: "Tech Maria" },
  { id: "WO-1031", asset: "Digital Scale", type: "Calibration", priority: "Low", status: "Completed", assigned: "System" },
];

export default function BiomedicalEngineeringPage() {
  const { locale } = useLocale();
  const t = getTranslator(locale);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const stats = [
    { label: t('biomedical.stats.total'), value: "482", icon: Cpu, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t('biomedical.stats.functional'), value: "442", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: t('biomedical.stats.repair'), value: "14", icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
    { label: t('biomedical.stats.calibLimit'), value: "26", icon: Clock, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-xl">
              <Settings className="h-8 w-8 text-blue-600 shadow-sm" />
            </div>
            {t('biomedical.title')}
          </h1>
          <p className="text-muted-foreground text-sm pl-1">
            {t('biomedical.desc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 shadow-sm border-slate-200">
            <History className="h-4 w-4" />
            {t('biomedical.action.maintenanceLog')}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
            <Plus className="h-4 w-4" />
            {t('biomedical.action.add')}
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
               <CardContent className="p-0">
                 <div className={cn("h-1.5 w-full", stat.bg.replace('bg-', 'bg-').split('-')[0] === 'bg' ? stat.bg : stat.bg)} />
                 <div className="p-5 flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                     <p className="text-2xl font-bold">{stat.value}</p>
                   </div>
                   <div className={cn("p-3 rounded-xl", stat.bg)}>
                     <stat.icon className={cn("h-6 w-6", stat.color)} />
                   </div>
                 </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <Tabs defaultValue="inventory" className="w-full">
              <CardHeader className="border-b pb-0 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <TabsList className="bg-white dark:bg-slate-900 border">
                    <TabsTrigger value="inventory" className="gap-2">
                       <ClipboardList className="h-4 w-4" />
                       {t('biomedical.tabs.inventory')}
                    </TabsTrigger>
                    <TabsTrigger value="workorders" className="gap-2">
                       <Wrench className="h-4 w-4" />
                       {t('biomedical.tabs.workOrders')}
                    </TabsTrigger>
                    <TabsTrigger value="parts" className="gap-2">
                       <Settings className="h-4 w-4" />
                       {t('biomedical.tabs.spareParts')}
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="gap-2">
                       <FileText className="h-4 w-4" />
                       {t('biomedical.tabs.contracts')}
                    </TabsTrigger>
                  </TabsList>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      className="pl-9 h-9 border-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <TabsContent value="inventory" className="m-0">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                    <TableRow>
                      <TableHead className="w-[120px]">{t('biomedical.table.assetId')}</TableHead>
                      <TableHead>{t('biomedical.table.resource')}</TableHead>
                      <TableHead>{t('biomedical.table.criticality')}</TableHead>
                      <TableHead>{t('biomedical.table.status')}</TableHead>
                      <TableHead className="text-right text-xs">{t('biomedical.table.riskScore')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ASSETS.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase())).map((asset) => (
                      <TableRow key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-mono text-xs text-blue-600 font-semibold">{asset.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{asset.dept}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "font-bold text-[9px] uppercase",
                            asset.criticality === 'Critical' ? "border-red-500 text-red-600 bg-red-50" :
                            asset.criticality === 'High' ? "border-orange-500 text-orange-600 bg-orange-50" :
                            "border-slate-200"
                          )}>
                            {t(`biomedical.criticality.${asset.criticality.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "font-medium h-5",
                              asset.status === "Functional" ? "bg-green-50 text-green-700 border-green-100" :
                              asset.status === "In Repair" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-red-50 text-red-700 border-red-100"
                            )}
                          >
                            {t(`biomedical.status.${asset.status === 'Functional' ? 'functional' : asset.status === 'In Repair' ? 'inRepair' : 'dueForCalib'}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                             <span className={cn(
                               "text-xs font-black",
                               asset.riskScore > 70 ? "text-red-600" : asset.riskScore > 30 ? "text-amber-600" : "text-green-600"
                             )}>{asset.riskScore}</span>
                             <Progress value={asset.riskScore} className="w-12 h-1" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="workorders" className="m-0 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Active Technical Tasks
                    <Badge className="bg-blue-600">{MOCK_WORK_ORDERS.length}</Badge>
                  </h3>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Filter className="h-3 w-3" /> Filter
                  </Button>
                </div>
                <div className="grid gap-4">
                   {MOCK_WORK_ORDERS.map((wo) => (
                     <div key={wo.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-2 rounded-lg",
                            wo.priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {wo.type === "Repair" ? <Wrench className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm">{wo.asset}</h4>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{wo.id}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Assigned to {wo.assigned} • Priority: {wo.priority}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn(
                            wo.status === "Completed" ? "bg-green-600" : "bg-blue-600"
                          )}>
                            {wo.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 px-2">
                            Update <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                     </div>
                   ))}
                </div>
              </TabsContent>
              <TabsContent value="parts" className="m-0">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                    <TableRow>
                      <TableHead>{t('biomedical.table.partName')}</TableHead>
                      <TableHead>{t('biomedical.table.inStock')}</TableHead>
                      <TableHead>{t('biomedical.table.threshold')}</TableHead>
                      <TableHead>{t('biomedical.table.status')}</TableHead>
                      <TableHead className="text-right">{t('common.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_SPARE_PARTS.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell>
                          <div className="font-bold">{part.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{part.id}</div>
                        </TableCell>
                        <TableCell className="font-black text-lg">{part.stock} {part.unit}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Min: {part.minStock}</TableCell>
                        <TableCell>
                          {part.stock <= part.minStock ? (
                            <Badge className="bg-red-600 animate-pulse">Critical Low</Badge>
                          ) : (
                            <Badge className="bg-emerald-600">Stable</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-8">Reorder</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="contracts" className="m-0 space-y-4 p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_CONTRACTS.map((contract) => (
                      <Card key={contract.id} className="border-slate-200 shadow-none hover:border-primary/40 transition-colors">
                        <CardHeader className="pb-3">
                           <div className="flex justify-between items-start">
                              <Badge className="bg-blue-100 text-blue-700 border-none text-[8px] uppercase">{contract.id}</Badge>
                              <Badge variant="outline" className="text-[8px]">{contract.type}</Badge>
                           </div>
                           <CardTitle className="text-sm mt-3">{contract.asset}</CardTitle>
                           <CardDescription className="text-xs">{contract.provider}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0 flex justify-between text-[10px]">
                            <span className="flex items-center gap-1 text-muted-foreground font-medium">
                               <Clock className="h-3 w-3" /> {t('biomedical.table.nextCalib')}: {contract.expiry}
                            </span>
                            <Button variant="link" className="h-auto p-0 text-primary text-[10px] font-bold">{t('biomedical.action.viewTerms')} &rarr;</Button>
                        </CardFooter>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar / AI Insights */}
        <div className="space-y-6">
          <Card className="shadow-lg border-2 border-primary/10 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
               <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-widest text-primary/80">
                 <Activity className="h-4 w-4" /> {t('biomedical.sidebar.reliability')}
               </h3>
               <Badge className="bg-green-600 animate-pulse">Live</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">{t('biomedical.sidebar.uptime')}</span>
                   <span className="font-bold">96.8%</span>
                 </div>
                 <Progress value={96.8} className="h-2" />
               </div>

               <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">{t('biomedical.sidebar.alert')}</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Hematology Analyzer (BME-LAB-012) next calibration is in 6 days. Recommended to schedule technician today to avoid downtime.
                  </p>
                  <Button className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                    {t('biomedical.action.schedule')}
                  </Button>
               </div>

               <div className="space-y-3">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">{t('biomedical.sidebar.upcoming')}</h4>
                 {[
                   { date: "May 10", item: "Lab Analyzer", type: "Calibration" },
                   { date: "May 15", item: "Autoclave Sterilizer", type: "Annual Review" },
                   { date: "June 02", item: "X-Ray Generator", type: "Parts Upgrade" },
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-3 w-3 text-blue-600" />
                        <span className="font-semibold">{s.item}</span>
                      </div>
                      <span className="text-muted-foreground">{s.date}</span>
                   </div>
                 ))}
               </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t">
              <Button variant="outline" className="w-full text-xs gap-2">
                Download Annual Compliance Report
                <ArrowRight className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> {t('biomedical.sidebar.forecast')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed text-center">
                 <p className="text-[10px] text-muted-foreground">Equipment replacement forecast based on MTBF (Mean Time Between Failures) models.</p>
                 <Button variant="link" className="text-blue-600 h-auto p-0 mt-1 text-xs">View Forecast &rarr;</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
