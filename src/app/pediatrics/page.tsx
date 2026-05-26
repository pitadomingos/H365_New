"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Search, CalendarPlus, FileText, Activity, ShieldAlert, Microscope, Ruler, Weight, Thermometer, Loader2, CalendarIcon, Save, HeartPulse, Pill, CheckCircle2, AlertCircle, Syringe, TrendingUp, AlertTriangle } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LocalDB } from '@/lib/db';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, ComposedChart } from 'recharts';

interface Vaccination {
  id: string;
  name: string;
  dueDate: string;
  administeredDate?: string;
  status: "Due" | "Administered" | "Overdue";
  batchNumber?: string;
}

interface GrowthMetric {
  id: string;
  date: string;
  ageInMonths: number;
  weightKg: number;
  heightCm: number;
  muacCm?: number;
}

interface PediatricPatient {
  id: string;
  nationalId: string;
  fullName: string;
  age: number; // in months
  dob: string;
  motherName: string;
  motherId: string;
  vaccinations: Vaccination[];
  growthHistory: GrowthMetric[];
}

const DEFAULT_PEDIATRIC_PATIENTS: PediatricPatient[] = [
  {
    id: "PED001",
    nationalId: "P-88776655",
    fullName: "Liam Antonio",
    age: 3,
    dob: "2026-02-15",
    motherName: "Alice Mwamba",
    motherId: "1029384756",
    vaccinations: [
      { id: "v1", name: "BCG", dueDate: "2026-02-15", administeredDate: "2026-02-15", status: "Administered", batchNumber: "B123-X" },
      { id: "v2", name: "VPO 0", dueDate: "2026-02-15", administeredDate: "2026-02-15", status: "Administered", batchNumber: "O-998" },
      { id: "v3", name: "HepB", dueDate: "2026-02-15", administeredDate: "2026-02-15", status: "Administered", batchNumber: "H-445" },
      { id: "v4", name: "Penta 1", dueDate: "2026-03-29", status: "Due" },
      { id: "v5", name: "VPO 1", dueDate: "2026-03-29", status: "Due" },
      { id: "v6", name: "Rota 1", dueDate: "2026-03-29", status: "Due" },
      { id: "v7", name: "VPC 1", dueDate: "2026-03-29", status: "Due" },
      { id: "v8", name: "Penta 2", dueDate: "2026-04-26", status: "Due" },
      { id: "v9", name: "VPO 2", dueDate: "2026-04-26", status: "Due" },
      { id: "v10", name: "Rota 2", dueDate: "2026-04-26", status: "Due" },
      { id: "v11", name: "Penta 3", dueDate: "2026-05-24", status: "Due" },
      { id: "v12", name: "VPO 3", dueDate: "2026-05-24", status: "Due" },
      { id: "v13", name: "VPC 2", dueDate: "2026-05-24", status: "Due" },
      { id: "v14", name: "IPV", dueDate: "2026-05-24", status: "Due" },
      { id: "v15", name: "Malária 1", dueDate: "2026-06-15", status: "Due" },
      { id: "v16", name: "Malária 2", dueDate: "2026-07-15", status: "Due" },
      { id: "v17", name: "Malária 3", dueDate: "2026-08-15", status: "Due" },
      { id: "v18", name: "Sarampo/Rubéola 1", dueDate: "2026-11-15", status: "Due" },
      { id: "v19", name: "Febre Amarela", dueDate: "2026-11-15", status: "Due" },
      { id: "v20", name: "Malária 4", dueDate: "2027-02-15", status: "Due" },
      { id: "v21", name: "Sarampo/Rubéola 2", dueDate: "2027-05-15", status: "Due" },
      { id: "v22", name: "Reforço DTP", dueDate: "2027-08-15", status: "Due" },
    ],
    growthHistory: [
      { id: "g1", date: "2026-02-15", ageInMonths: 0, weightKg: 3.2, heightCm: 50, muacCm: 10.5 },
      { id: "g2", date: "2026-03-15", ageInMonths: 1, weightKg: 4.1, heightCm: 53, muacCm: 11.2 },
      { id: "g3", date: "2026-04-15", ageInMonths: 2, weightKg: 5.2, heightCm: 57, muacCm: 12.0 },
      { id: "g4", date: "2026-05-15", ageInMonths: 3, weightKg: 5.9, heightCm: 60, muacCm: 12.5 },
    ]
  },
  {
    id: "PED002",
    nationalId: "P-44556677",
    fullName: "Sofia Ndlovu",
    age: 14,
    dob: "2025-03-10",
    motherName: "Maria Ndlovu",
    motherId: "5566778899",
    vaccinations: [
      { id: "s1", name: "BCG", dueDate: "2025-03-10", administeredDate: "2025-03-10", status: "Administered", batchNumber: "B-778" },
      { id: "s2", name: "VPO 0", dueDate: "2025-03-10", administeredDate: "2025-03-10", status: "Administered", batchNumber: "O-221" },
      { id: "s3", name: "HepB", dueDate: "2025-03-10", administeredDate: "2025-03-10", status: "Administered", batchNumber: "H-990" },
      { id: "s4", name: "Penta 1", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "P1-33" },
      { id: "s5", name: "VPO 1", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "O1-44" },
      { id: "s6", name: "Rota 1", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "R1-55" },
      { id: "s7", name: "VPC 1", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "PC1-66" },
      { id: "s8", name: "Penta 2", dueDate: "2025-05-19", administeredDate: "2025-05-20", status: "Administered", batchNumber: "P2-77" },
      { id: "s9", name: "VPO 2", dueDate: "2025-05-19", administeredDate: "2025-05-20", status: "Administered", batchNumber: "O2-88" },
      { id: "s10", name: "Rota 2", dueDate: "2025-05-19", administeredDate: "2025-05-20", status: "Administered", batchNumber: "R2-99" },
      { id: "s11", name: "Penta 3", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "P3-11" },
      { id: "s12", name: "VPO 3", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "O3-22" },
      { id: "s13", name: "VPC 2", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "PC2-33" },
      { id: "s14", name: "IPV", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "IP-44" },
      { id: "s15", name: "Malária 1", dueDate: "2025-09-10", administeredDate: "2025-09-12", status: "Administered", batchNumber: "M1-55" },
      { id: "s16", name: "Malária 2", dueDate: "2025-10-10", administeredDate: "2025-10-12", status: "Administered", batchNumber: "M2-66" },
      { id: "s17", name: "Malária 3", dueDate: "2025-11-10", administeredDate: "2025-11-12", status: "Administered", batchNumber: "M3-77" },
      { id: "s18", name: "Sarampo/Rubéola 1", dueDate: "2025-12-10", status: "Administered" },
      { id: "s19", name: "Febre Amarela", dueDate: "2025-12-10", status: "Administered" },
      { id: "s20", name: "Malária 4", dueDate: "2026-03-10", status: "Overdue" },
    ],
    growthHistory: [
      { id: "sg1", date: "2025-03-10", ageInMonths: 0, weightKg: 3.0, heightCm: 49, muacCm: 10.2 },
      { id: "sg2", date: "2025-04-10", ageInMonths: 1, weightKg: 3.9, heightCm: 52, muacCm: 10.8 },
      { id: "sg3", date: "2025-05-10", ageInMonths: 2, weightKg: 4.8, heightCm: 56, muacCm: 11.5 },
      { id: "sg4", date: "2025-06-10", ageInMonths: 3, weightKg: 5.5, heightCm: 59, muacCm: 12.0 },
      { id: "sg5", date: "2025-09-10", ageInMonths: 6, weightKg: 7.2, heightCm: 65, muacCm: 13.0 },
      { id: "sg6", date: "2025-12-10", ageInMonths: 9, weightKg: 8.1, heightCm: 70, muacCm: 13.5 },
      { id: "sg7", date: "2026-03-10", ageInMonths: 12, weightKg: 8.8, heightCm: 74, muacCm: 14.0 },
    ]
  }
];

// WHO Median Weight & Height with ±2SD z-score bands (boys reference, 0-60 months)
const WHO_GROWTH_REFERENCE = [
  { age: 0, weightWho: 3.3, weightMinus2SD: 2.5, weightPlus2SD: 4.4, heightWho: 49.9, heightMinus2SD: 46.1, heightPlus2SD: 53.7 },
  { age: 1, weightWho: 4.5, weightMinus2SD: 3.4, weightPlus2SD: 5.8, heightWho: 54.7, heightMinus2SD: 50.8, heightPlus2SD: 58.6 },
  { age: 2, weightWho: 5.6, weightMinus2SD: 4.3, weightPlus2SD: 7.1, heightWho: 58.4, heightMinus2SD: 54.4, heightPlus2SD: 62.4 },
  { age: 3, weightWho: 6.4, weightMinus2SD: 5.0, weightPlus2SD: 8.0, heightWho: 61.4, heightMinus2SD: 57.3, heightPlus2SD: 65.5 },
  { age: 4, weightWho: 7.0, weightMinus2SD: 5.6, weightPlus2SD: 8.7, heightWho: 63.9, heightMinus2SD: 59.7, heightPlus2SD: 68.0 },
  { age: 5, weightWho: 7.5, weightMinus2SD: 6.0, weightPlus2SD: 9.3, heightWho: 65.9, heightMinus2SD: 61.7, heightPlus2SD: 70.1 },
  { age: 6, weightWho: 7.9, weightMinus2SD: 6.4, weightPlus2SD: 9.8, heightWho: 67.6, heightMinus2SD: 63.3, heightPlus2SD: 71.9 },
  { age: 9, weightWho: 8.9, weightMinus2SD: 7.1, weightPlus2SD: 11.0, heightWho: 72.0, heightMinus2SD: 67.5, heightPlus2SD: 76.5 },
  { age: 12, weightWho: 9.6, weightMinus2SD: 7.7, weightPlus2SD: 12.0, heightWho: 75.7, heightMinus2SD: 71.0, heightPlus2SD: 80.5 },
  { age: 15, weightWho: 10.3, weightMinus2SD: 8.3, weightPlus2SD: 12.8, heightWho: 79.1, heightMinus2SD: 74.1, heightPlus2SD: 84.2 },
  { age: 18, weightWho: 10.9, weightMinus2SD: 8.8, weightPlus2SD: 13.7, heightWho: 82.3, heightMinus2SD: 76.9, heightPlus2SD: 87.7 },
  { age: 24, weightWho: 12.2, weightMinus2SD: 9.7, weightPlus2SD: 15.3, heightWho: 87.8, heightMinus2SD: 81.7, heightPlus2SD: 93.9 },
  { age: 30, weightWho: 13.3, weightMinus2SD: 10.5, weightPlus2SD: 16.9, heightWho: 92.4, heightMinus2SD: 85.6, heightPlus2SD: 99.1 },
  { age: 36, weightWho: 14.3, weightMinus2SD: 11.3, weightPlus2SD: 18.3, heightWho: 96.1, heightMinus2SD: 88.7, heightPlus2SD: 103.5 },
  { age: 48, weightWho: 16.3, weightMinus2SD: 12.7, weightPlus2SD: 21.5, heightWho: 103.3, heightMinus2SD: 94.9, heightPlus2SD: 111.7 },
  { age: 60, weightWho: 18.3, weightMinus2SD: 14.1, weightPlus2SD: 24.2, heightWho: 110.0, heightMinus2SD: 100.7, heightPlus2SD: 119.2 },
];

export default function PediatricsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [patientsList, setPatientsList] = useState<PediatricPatient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PediatricPatient | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  
  const [isVaxModalOpen, setIsVaxModalOpen] = useState(false);
  const [selectedVax, setSelectedVax] = useState<Vaccination | null>(null);
  const [vaxBatch, setVaxBatch] = useState("");
  const [isAdministering, setIsAdministering] = useState(false);

  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState("");
  const [newMuac, setNewMuac] = useState("");
  const [newAgeMonths, setNewAgeMonths] = useState("");
  const [isSavingGrowth, setIsSavingGrowth] = useState(false);
  const [chartType, setChartType] = useState<"weight" | "height">("weight");

  const loadPatients = async () => {
    const list = await LocalDB.get<PediatricPatient[]>("pediatric_patients", DEFAULT_PEDIATRIC_PATIENTS);
    
    // Check vaccine overdue dates automatically against today's date
    const todayStr = new Date().toISOString().split('T')[0];
    const processedList = list.map(patient => {
      const updatedVaccinations = patient.vaccinations.map(vax => {
        if (vax.status === "Due" && vax.dueDate < todayStr) {
          return { ...vax, status: "Overdue" as const };
        }
        return vax;
      });
      return { ...patient, vaccinations: updatedVaccinations };
    });

    setPatientsList(processedList);
    await LocalDB.save("pediatric_patients", processedList);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const found = patientsList.find(p => p.nationalId === searchId || p.motherId === searchId || p.id === searchId);
    if (found) {
      setSelectedPatient(found);
      toast({ title: t('pediatrics.toast.found'), description: t('pediatrics.toast.foundDesc', { name: found.fullName }) });
    } else {
      setSelectedPatient(null);
      toast({ variant: "destructive", title: t('pediatrics.toast.notFound'), description: t('pediatrics.toast.notFoundDesc') });
    }
    setIsLoadingSearch(false);
  };

  const handleAdministerVax = async () => {
    if (!selectedPatient || !selectedVax || !vaxBatch) return;
    setIsAdministering(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedVax = selectedPatient.vaccinations.map(v => 
      v.id === selectedVax.id ? { ...v, status: "Administered" as const, administeredDate: new Date().toISOString().split('T')[0], batchNumber: vaxBatch } : v
    );
    
    const updatedPatient = { ...selectedPatient, vaccinations: updatedVax };
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);

    await LocalDB.save("pediatric_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    // Save system log
    const logs = await LocalDB.get<any[]>("system_activity_logs", []);
    const newLog = {
      id: `ACT-${Date.now()}`,
      action: "Administered Vaccine",
      details: `${selectedVax.name} batch ${vaxBatch} administered to ${selectedPatient.fullName}.`,
      user: "Pediatric Nurse",
      timestamp: new Date().toISOString()
    };
    await LocalDB.save("system_activity_logs", [newLog, ...logs]);

    toast({ title: t('pediatrics.toast.vaxSuccess'), description: t('pediatrics.toast.vaxSuccessDesc', { name: selectedVax.name }) });
    setIsAdministering(false);
    setIsVaxModalOpen(false);
    setSelectedVax(null);
    setVaxBatch("");
  };

  const handleSaveGrowth = async () => {
    if (!selectedPatient || !newWeight || !newHeight || !newAgeMonths) return;
    setIsSavingGrowth(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const weightVal = parseFloat(newWeight);
    const heightVal = parseFloat(newHeight);
    const muacVal = newMuac ? parseFloat(newMuac) : undefined;
    const ageVal = parseInt(newAgeMonths, 10);

    const newEntry: GrowthMetric = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ageInMonths: ageVal,
      weightKg: weightVal,
      heightCm: heightVal,
      muacCm: muacVal
    };
    
    // Sort growth history by age
    const updatedHistory = [...selectedPatient.growthHistory, newEntry].sort((a, b) => a.ageInMonths - b.ageInMonths);
    const updatedPatient = { ...selectedPatient, growthHistory: updatedHistory, age: ageVal };
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);

    await LocalDB.save("pediatric_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({ title: t('pediatrics.toast.growthSuccess'), description: t('pediatrics.toast.growthSuccessDesc') });
    setIsSavingGrowth(false);
    setNewWeight("");
    setNewHeight("");
    setNewMuac("");
    setNewAgeMonths("");
  };

  // Merge selected child's growth metrics with WHO reference guidelines and z-score bands for charting
  const getChartData = () => {
    if (!selectedPatient) return [];
    return WHO_GROWTH_REFERENCE.map(ref => {
      const match = selectedPatient.growthHistory.find(g => g.ageInMonths === ref.age);
      return {
        age: ref.age,
        weightWho: ref.weightWho,
        weightMinus2SD: ref.weightMinus2SD,
        weightPlus2SD: ref.weightPlus2SD,
        heightWho: ref.heightWho,
        heightMinus2SD: ref.heightMinus2SD,
        heightPlus2SD: ref.heightPlus2SD,
        weightChild: match ? match.weightKg : null,
        heightChild: match ? match.heightCm : null
      };
    });
  };

  const currentChartData = getChartData();
  const nextVax = selectedPatient?.vaccinations.find(v => v.status === "Due" || v.status === "Overdue");
  const overdueCount = selectedPatient?.vaccinations.filter(v => v.status === "Overdue").length || 0;

  // MUAC Severity Checker
  const getMuacStatus = (muac?: number) => {
    if (!muac) return null;
    if (muac < 11.5) return { label: t('pediatrics.nutrition.severe'), color: "text-red-500 border-red-200 bg-red-50 dark:bg-red-950/20" };
    if (muac < 12.5) return { label: t('pediatrics.nutrition.moderate'), color: "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/20" };
    return { label: t('pediatrics.nutrition.well'), color: "text-green-500 border-green-200 bg-green-50 dark:bg-green-950/20" };
  };

  const latestGrowth = selectedPatient?.growthHistory[selectedPatient.growthHistory.length - 1];
  const muacAlert = latestGrowth ? getMuacStatus(latestGrowth.muacCm) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Baby className="h-8 w-8 text-indigo-600" /> {t('pediatrics.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('pediatrics.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-indigo-100 bg-indigo-50/10 dark:bg-indigo-950/5 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">{t('pediatrics.finder.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('pediatrics.finder.placeholder')} 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : t('pediatrics.finder.button')}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="vaccinations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vaccinations" className="gap-2"><Syringe className="h-4 w-4" /> {t('pediatrics.tabs.immunization')}</TabsTrigger>
                <TabsTrigger value="growth" className="gap-2"><Activity className="h-4 w-4" /> {t('pediatrics.tabs.growth')}</TabsTrigger>
                <TabsTrigger value="charts" className="gap-2"><TrendingUp className="h-4 w-4" /> {t('pediatrics.tabs.charts')}</TabsTrigger>
              </TabsList>
              
              {/* Immunization Tab */}
              <TabsContent value="vaccinations" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('pediatrics.epi.title')}</CardTitle>
                    <CardDescription>{t('pediatrics.epi.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overdueCount > 0 && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('pediatrics.summary.nextAction')}</AlertTitle>
                        <AlertDescription>
                          {t('pediatrics.epi.delayAlert', { count: overdueCount })}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('pediatrics.epi.table.dose')}</TableHead>
                          <TableHead>{t('pediatrics.epi.table.dueDate')}</TableHead>
                          <TableHead>{t('pediatrics.epi.table.status')}</TableHead>
                          <TableHead>{t('pediatrics.epi.table.administeredDate')}</TableHead>
                          <TableHead>{t('pediatrics.epi.table.batch')}</TableHead>
                          <TableHead className="text-right font-bold text-slate-500">{t('pediatrics.epi.table.action')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.vaccinations.map((v) => (
                          <TableRow key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <TableCell className="font-semibold">{v.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{v.dueDate}</TableCell>
                            <TableCell>
                              <Badge variant={v.status === "Administered" ? "default" : v.status === "Overdue" ? "destructive" : "outline"} className={v.status === "Administered" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200" : ""}>
                                {v.status === "Administered" ? t('pediatrics.epi.table.status.administered') : v.status === "Overdue" ? t('pediatrics.epi.table.status.overdue') : t('pediatrics.epi.table.status.due')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{v.administeredDate || "-"}</TableCell>
                            <TableCell className="font-mono text-xs text-slate-500">{v.batchNumber || "-"}</TableCell>
                            <TableCell className="text-right">
                              {v.status !== "Administered" ? (
                                <Button size="sm" onClick={() => { setSelectedVax(v); setIsVaxModalOpen(true); }} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs">
                                  {t('pediatrics.epi.table.recordDose')}
                                </Button>
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Growth Metrics Table Input Tab */}
              <TabsContent value="growth" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('pediatrics.growth.title')}</CardTitle>
                    <CardDescription>{t('pediatrics.growth.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{t('pediatrics.growth.form.age')} <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="e.g. 4" value={newAgeMonths} onChange={(e) => setNewAgeMonths(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{t('pediatrics.growth.form.weight')} <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="0.0" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{t('pediatrics.growth.form.height')} <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="0.0" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{t('pediatrics.growth.form.muac')}</Label>
                        <Input type="number" placeholder="Optional" value={newMuac} onChange={(e) => setNewMuac(e.target.value)} />
                      </div>
                      <Button className="col-span-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white gap-2" disabled={isSavingGrowth || !newWeight || !newHeight || !newAgeMonths} onClick={handleSaveGrowth}>
                        {isSavingGrowth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t('pediatrics.growth.form.save')}
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('pediatrics.growth.table.checkDate')}</TableHead>
                          <TableHead>{t('pediatrics.growth.form.age')}</TableHead>
                          <TableHead>{t('pediatrics.growth.form.weight')}</TableHead>
                          <TableHead>{t('pediatrics.growth.form.height')}</TableHead>
                          <TableHead>{t('pediatrics.growth.form.muac')}</TableHead>
                          <TableHead>{t('pediatrics.growth.table.assessment')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.growthHistory.map((g) => {
                          const status = getMuacStatus(g.muacCm);
                          return (
                            <TableRow key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <TableCell className="text-xs">{g.date}</TableCell>
                              <TableCell className="font-semibold">{g.ageInMonths} mo</TableCell>
                              <TableCell>{g.weightKg} kg</TableCell>
                              <TableCell>{g.heightCm} cm</TableCell>
                              <TableCell>{g.muacCm ? `${g.muacCm} cm` : "-"}</TableCell>
                              <TableCell>
                                {status ? (
                                  <Badge variant="outline" className={`${status.color} py-0 px-2 text-[10px]`}>
                                    {status.label}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">N/A</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* WHO Growth Charts Tab */}
              <TabsContent value="charts" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <div>
                      <CardTitle className="text-lg">{t('pediatrics.charts.title')}</CardTitle>
                      <CardDescription>{t('pediatrics.charts.desc')}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={chartType === "weight" ? "default" : "outline"} onClick={() => setChartType("weight")} className={chartType === "weight" ? "bg-indigo-600 hover:bg-indigo-700" : ""}>{t('pediatrics.charts.weight')}</Button>
                      <Button size="sm" variant={chartType === "height" ? "default" : "outline"} onClick={() => setChartType("height")} className={chartType === "height" ? "bg-indigo-600 hover:bg-indigo-700" : ""}>{t('pediatrics.charts.height')}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[380px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentChartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="age" label={{ value: t('pediatrics.growth.form.age'), position: 'insideBottom', offset: -5 }} stroke="rgba(150, 150, 150, 0.8)" />
                        <YAxis label={{ value: chartType === "weight" ? t('pediatrics.growth.form.weight') : t('pediatrics.growth.form.height'), angle: -90, position: 'insideLeft' }} stroke="rgba(150, 150, 150, 0.8)" />
                        <Tooltip formatter={(value: number, name: string) => [value !== null ? value : 'N/A', name]} />
                        <Legend verticalAlign="top" height={36} />
                        {chartType === "weight" ? (
                          <>
                            <Area type="monotone" dataKey="weightPlus2SD" stackId="zband" stroke="none" fill="#e0e7ff" fillOpacity={0.4} name="+2 SD" />
                            <Area type="monotone" dataKey="weightMinus2SD" stackId="zband-low" stroke="none" fill="#fef3c7" fillOpacity={0.3} name={t('pediatrics.charts.underweight')} />
                            <Line type="monotone" dataKey="weightWho" name={t('pediatrics.charts.median')} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="weightChild" name={t('pediatrics.charts.patientWeight')} stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                          </>
                        ) : (
                          <>
                            <Area type="monotone" dataKey="heightPlus2SD" stackId="zband" stroke="none" fill="#fce7f3" fillOpacity={0.4} name="+2 SD" />
                            <Area type="monotone" dataKey="heightMinus2SD" stackId="zband-low" stroke="none" fill="#fef3c7" fillOpacity={0.3} name={t('pediatrics.charts.stunted')} />
                            <Line type="monotone" dataKey="heightWho" name={t('pediatrics.charts.median')} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="heightChild" name={t('pediatrics.charts.patientHeight')} stroke="#ec4899" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                          </>
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Child summary panel */}
          <div className="space-y-6">
            <Card className="shadow-sm overflow-hidden border-t-4 border-t-indigo-600">
              <CardHeader className="bg-indigo-50/20 dark:bg-indigo-950/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" /> {t('pediatrics.summary.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t('pediatrics.summary.name')}:</span>
                  <span className="font-semibold">{selectedPatient.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t('pediatrics.summary.dob')}:</span>
                  <span>{selectedPatient.dob}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t('pediatrics.summary.age')}:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{t('pediatrics.summary.ageMonths', { months: selectedPatient.age })}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t('pediatrics.summary.motherName')}:</span>
                  <span>{selectedPatient.motherName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{t('pediatrics.summary.motherId')}:</span>
                  <span className="font-mono text-xs">{selectedPatient.motherId}</span>
                </div>

                {muacAlert && (
                  <div className={`p-3 rounded-lg border text-xs flex gap-2 items-start ${muacAlert.color}`}>
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{t('pediatrics.summary.nutritionAdvisory')}</p>
                      <p>{t('pediatrics.summary.nutritionAlert', { label: muacAlert.label })}</p>
                    </div>
                  </div>
                )}

                {nextVax ? (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/15 rounded-lg text-xs flex gap-2 items-start border border-indigo-100 dark:border-indigo-950">
                    <Syringe className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-indigo-700 dark:text-indigo-400">{t('pediatrics.summary.nextAction')}</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {t('pediatrics.summary.nextVaxAlert', { vaxName: nextVax.name, date: nextVax.dueDate, status: nextVax.status === "Due" ? t('pediatrics.epi.table.status.due') : t('pediatrics.epi.table.status.overdue') })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex gap-2 items-center">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{t('pediatrics.summary.allCompleted')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Pediatrics"
              patientData={selectedPatient}
              context="Early childhood development, nutritional screening, and vaccine schedule audit."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed rounded-2xl">
          <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center">
            <Baby className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{t('pediatrics.summary.empty')}</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {t('pediatrics.summary.emptyDesc')}
            </p>
          </div>
        </div>
      )}

      {/* Vaccine Administration dialog */}
      <Dialog open={isVaxModalOpen} onOpenChange={setIsVaxModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('pediatrics.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('pediatrics.dialog.desc')}
            </DialogDescription>
          </DialogHeader>
          {selectedVax && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm">
                <p><strong>{t('pediatrics.dialog.vaccine')}:</strong> {selectedVax.name}</p>
                <p><strong>{t('pediatrics.dialog.scheduled')}:</strong> {selectedVax.dueDate}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch" className="font-semibold text-xs">{t('pediatrics.dialog.batch')} <span className="text-red-500">*</span></Label>
                <Input 
                  id="batch" 
                  placeholder="e.g. LOT-A3258-B" 
                  value={vaxBatch} 
                  onChange={(e) => setVaxBatch(e.target.value)} 
                />
              </div>
              
              <div className="p-3 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-lg flex gap-2 text-xs border border-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{t('pediatrics.dialog.warning')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVaxModalOpen(false)}>{t('pediatrics.dialog.cancel')}</Button>
            <Button onClick={handleAdministerVax} disabled={!vaxBatch || isAdministering} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isAdministering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('pediatrics.dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
