"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Search, FileText, Activity, Loader2, Save, Pill, HeartPulse, ClipboardList, TrendingUp, AlertTriangle, CheckCircle2, Plus, Calendar, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocalDB } from '@/lib/db';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DotsLog {
  day: number;
  status: "Observed" | "Self-Administered" | "Missed" | "Unlogged";
  provider?: string;
}

interface LabMarker {
  date: string;
  viralLoad: number;
  cd4: number;
}

interface SputumTest {
  date: string;
  method: "Sputum Smear" | "GeneXpert";
  result: "Positive" | "Negative";
}

interface ChronicPatient {
  id: string;
  nationalId: string;
  fullName: string;
  condition: string;
  regimen: string;
  adherenceRate: number; // percentage
  whoStage: 1 | 2 | 3 | 4;
  tbTreatmentOutcome?: "On Treatment" | "Cured" | "Treatment Completed" | "Treatment Failed" | "Died" | "Lost to Follow-up" | "Not Evaluated";
  tbSputumHistory?: SputumTest[];
  lastRefill: string;
  nextRefill: string;
  status: "Stable" | "At Risk" | "Lacking Adherence";
  artLineCode?: "1ª Linha" | "2ª Linha" | "3ª Linha";
  regimenCode?: string;
  regimenSwitchHistory?: Array<{ date: string; from: string; to: string; reason: string }>;
  iptStatus?: "Not Started" | "On IPT" | "Completed" | "Discontinued";
  pmtctOptionB?: boolean;  // GAP-08: PMTCT Option B+ flag for HIV+ pregnant women
  enrollmentDate?: string;
  labHistory: LabMarker[];
  dotsHistory: DotsLog[];
}

const DEFAULT_CHRONIC_PATIENTS: ChronicPatient[] = [
  {
    id: "ART-887722",
    nationalId: "ART-887722",
    fullName: "Josefa Lobo",
    condition: "HIV / TB Co-infection",
    regimen: "TLD + RHZE",
    artLineCode: "1ª Linha",
    regimenCode: "TDF+3TC+DTG",
    iptStatus: "Not Started",
    regimenSwitchHistory: [],
    adherenceRate: 93,
    whoStage: 3,
    tbTreatmentOutcome: "On Treatment",
    tbSputumHistory: [
      { date: "2026-01-10", method: "Sputum Smear", result: "Positive" },
      { date: "2026-03-15", method: "GeneXpert", result: "Positive" },
      { date: "2026-05-05", method: "Sputum Smear", result: "Negative" },
    ],
    lastRefill: "2026-05-02",
    nextRefill: "2026-06-02",
    status: "At Risk",
    labHistory: [
      { date: "2025-12", viralLoad: 450, cd4: 320 },
      { date: "2026-01", viralLoad: 300, cd4: 350 },
      { date: "2026-02", viralLoad: 120, cd4: 410 },
      { date: "2026-03", viralLoad: 40, cd4: 450 },
      { date: "2026-04", viralLoad: 18, cd4: 490 },
    ],
    dotsHistory: [
      { day: 1, status: "Observed", provider: "Nurse Mary" },
      { day: 2, status: "Observed", provider: "Nurse Mary" },
      { day: 3, status: "Self-Administered" },
      { day: 4, status: "Self-Administered" },
      { day: 5, status: "Observed", provider: "Nurse Mary" },
      { day: 6, status: "Missed" },
      { day: 7, status: "Observed", provider: "Nurse Mary" },
      { day: 8, status: "Self-Administered" },
      { day: 9, status: "Self-Administered" },
      { day: 10, status: "Observed", provider: "Nurse Mary" },
      { day: 11, status: "Observed", provider: "Nurse Mary" },
      { day: 12, status: "Missed" },
      { day: 13, status: "Observed", provider: "Nurse Mary" },
      { day: 14, status: "Self-Administered" },
      { day: 15, status: "Observed", provider: "Nurse Mary" },
      ...Array.from({ length: 15 }, (_, i) => ({ day: i + 16, status: "Unlogged" as const }))
    ]
  }
];

export default function ChronicCarePage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [patientsList, setPatientsList] = useState<ChronicPatient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<ChronicPatient | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // New Lab Log form state
  const [logDate, setLogDate] = useState("");
  const [logVL, setLogVL] = useState("");
  const [logCD4, setLogCD4] = useState("");
  const [logIcd10, setLogIcd10] = useState("");
  const [isSavingLab, setIsSavingLab] = useState(false);

  // New Sputum Log form state
  const [sputumDate, setSputumDate] = useState("");
  const [sputumMethod, setSputumMethod] = useState<"Sputum Smear" | "GeneXpert">("Sputum Smear");
  const [sputumResult, setSputumResult] = useState<"Positive" | "Negative">("Positive");
  const [isSavingSputum, setIsSavingSputum] = useState(false);

  const loadPatients = async () => {
    const list = await LocalDB.get<ChronicPatient[]>("chronic_patients", DEFAULT_CHRONIC_PATIENTS);
    setPatientsList(list);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const found = patientsList.find(p => p.nationalId === searchId || p.fullName.toLowerCase().includes(searchId.toLowerCase()) || p.id === searchId);
    if (found) {
      setSelectedPatient(found);
      toast({ title: "Patient Record Loaded", description: `Chronic clinical chart retrieved for ${found.fullName}.` });
    } else {
      setSelectedPatient(null);
      toast({ variant: "destructive", title: "Not Found", description: "No registered chronic patients found." });
    }
    setIsLoadingSearch(false);
  };

  // Recalculate adherence score based on observed and self-administered days in DOTS history
  const calculateAdherence = (dots: DotsLog[]) => {
    const loggedDays = dots.filter(d => d.status !== "Unlogged");
    if (loggedDays.length === 0) return 100;
    const takenDays = loggedDays.filter(d => d.status === "Observed" || d.status === "Self-Administered").length;
    return Math.round((takenDays / loggedDays.length) * 100);
  };

  const handleDotsClick = async (dayNumber: number) => {
    if (!selectedPatient) return;

    const statuses: DotsLog["status"][] = ["Observed", "Self-Administered", "Missed", "Unlogged"];
    const currentDayLog = selectedPatient.dotsHistory.find(d => d.day === dayNumber);
    const currentStatus = currentDayLog ? currentDayLog.status : "Unlogged";
    const nextStatusIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextStatusIndex];

    const updatedDots = selectedPatient.dotsHistory.map(d => {
      if (d.day === dayNumber) {
        return {
          ...d,
          status: nextStatus,
          provider: nextStatus === "Observed" ? "Shift Clinic Nurse" : undefined
        };
      }
      return d;
    });

    const newAdherence = calculateAdherence(updatedDots);
    const updatedPatient: ChronicPatient = {
      ...selectedPatient,
      dotsHistory: updatedDots,
      adherenceRate: newAdherence,
      status: newAdherence >= 95 ? "Stable" : newAdherence >= 85 ? "At Risk" : "Lacking Adherence"
    };

    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("chronic_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({
      title: `Day ${dayNumber} Log Updated`,
      description: `Medication status changed to ${nextStatus}.`
    });
  };

  const handleAddLabRecord = async () => {
    if (!selectedPatient || !logDate || !logVL || !logCD4) return;
    setIsSavingLab(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const newLab: LabMarker = {
      date: logDate,
      viralLoad: parseInt(logVL, 10),
      cd4: parseInt(logCD4, 10)
    };

    // Sort by date key
    const updatedLabs = [...selectedPatient.labHistory, newLab].sort((a, b) => a.date.localeCompare(b.date));
    const updatedPatient: ChronicPatient = {
      ...selectedPatient,
      labHistory: updatedLabs
    };

    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("chronic_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({ title: t('chronic.toast.saved'), description: t('chronic.toast.saved.desc', { date: logDate, icd10: logIcd10 || "N/A" }) });
    setIsSavingLab(false);
    setLogDate("");
    setLogVL("");
    setLogCD4("");
    setLogIcd10("");
  };

  const handleAddSputumRecord = async () => {
    if (!selectedPatient || !sputumDate) return;
    setIsSavingSputum(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const newSputum: SputumTest = {
      date: sputumDate,
      method: sputumMethod,
      result: sputumResult
    };

    const currentHistory = selectedPatient.tbSputumHistory || [];
    const updatedHistory = [...currentHistory, newSputum].sort((a, b) => b.date.localeCompare(a.date));

    const updatedPatient: ChronicPatient = {
      ...selectedPatient,
      tbSputumHistory: updatedHistory
    };

    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("chronic_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({
      title: "Sputum Record Logged",
      description: `TB diagnosis logs updated with ${sputumMethod} (${sputumResult}).`
    });

    setIsSavingSputum(false);
    setSputumDate("");
  };

  const handleUpdateWhoStage = async (newStage: 1 | 2 | 3 | 4) => {
    if (!selectedPatient) return;
    const updatedPatient: ChronicPatient = {
      ...selectedPatient,
      whoStage: newStage
    };
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("chronic_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);
    toast({
      title: "WHO Stage Updated",
      description: `Patient's HIV WHO Stage is now Set to Stage ${newStage}.`
    });
  };

  const handleUpdateTbOutcome = async (newOutcome: ChronicPatient["tbTreatmentOutcome"]) => {
    if (!selectedPatient) return;
    const updatedPatient: ChronicPatient = {
      ...selectedPatient,
      tbTreatmentOutcome: newOutcome
    };
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("chronic_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);
    toast({
      title: "TB Treatment Outcome Updated",
      description: `Patient's TB Treatment outcome is now: ${newOutcome || "None"}.`
    });
  };

  // DOTS cell backgrounds
  const getCellColor = (status: DotsLog["status"]) => {
    switch (status) {
      case "Observed": return "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600";
      case "Self-Administered": return "bg-sky-500 hover:bg-sky-600 text-white border-sky-600";
      case "Missed": return "bg-rose-500 hover:bg-rose-600 text-white border-rose-600";
      default: return "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-400 dark:hover:bg-slate-700";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8 text-indigo-600" /> Chronic Disease Management (ART/TB/NCD)
          </h1>
          <p className="text-muted-foreground text-sm">
            Long-term longitudinal logs, adherence trend curves, and DOTS (Directly Observed Treatment Short-Course) calendars.
          </p>
        </div>
      </div>

      {/* Search component */}
      <Card className="shadow-sm border-indigo-100 bg-indigo-50/10 dark:bg-indigo-950/5 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">ART / Chronic Patient Lookup</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Patient Name or ART Registry Number (Try: Josefa Lobo)..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Clinical Chart"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/50">
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Medication Adherence</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{selectedPatient.adherenceRate}%</p>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-indigo-50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950/50">
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Next Refill Due</p>
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mt-2">{selectedPatient.nextRefill}</p>
                  </div>
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-lg">
                    <Pill className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className={selectedPatient.status === "Lacking Adherence" ? "bg-rose-50 dark:bg-rose-950/10 border-rose-100" : selectedPatient.status === "At Risk" ? "bg-amber-50 dark:bg-amber-950/10 border-amber-100" : "bg-slate-50 dark:bg-slate-900/10 border-slate-100"}>
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Clinical Status</p>
                    <p className={`text-sm font-black mt-2 ${selectedPatient.status === "Lacking Adherence" ? "text-rose-600" : selectedPatient.status === "At Risk" ? "text-amber-600" : "text-slate-700 dark:text-slate-300"}`}>{selectedPatient.status}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stepper Tabs */}
            <Tabs defaultValue="clinical" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="clinical" className="gap-2"><Activity className="h-4 w-4" /> Lab Biomarkers (VL / CD4)</TabsTrigger>
                <TabsTrigger value="adherence" className="gap-2"><Calendar className="h-4 w-4" /> TB/ART DOTS Calendar</TabsTrigger>
                <TabsTrigger value="programmatic" className="gap-2"><ClipboardList className="h-4 w-4" /> HIV & TB Program Tracking</TabsTrigger>
              </TabsList>

              {/* Lab Biomarkers and Chart */}
              <TabsContent value="clinical" className="mt-4 space-y-6">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">CD4 & Viral Load Longitudinal Trends</CardTitle>
                    <CardDescription>Visual chart monitoring viral suppression progress vs immune system recovery.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedPatient.labHistory} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" stroke="rgba(150, 150, 150, 0.8)" />
                        <YAxis stroke="rgba(150, 150, 150, 0.8)" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="viralLoad" name="Viral Load (copies/mL)" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="cd4" name="CD4 Cell Count (cells/mm³)" stroke="#6366f1" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Log new value panel */}
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">{t('chronic.encounter.card.title')}</CardTitle>
                    <CardDescription>{t('chronic.encounter.card.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('chronic.encounter.form.date')}</Label>
                      <Input type="text" placeholder="2026-05" value={logDate} onChange={e => setLogDate(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('chronic.encounter.form.viralLoad')}</Label>
                      <Input type="number" placeholder="cp/mL" value={logVL} onChange={e => setLogVL(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('chronic.encounter.form.cd4')}</Label>
                      <Input type="number" placeholder="cells/mm³" value={logCD4} onChange={e => setLogCD4(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('clinical.icd10.label')}</Label>
                      <Input type="text" placeholder={t('clinical.icd10.placeholder.chronic')} value={logIcd10} onChange={e => setLogIcd10(e.target.value)} />
                    </div>
                    <Button onClick={handleAddLabRecord} disabled={isSavingLab || !logDate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full">
                      {isSavingLab ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {t('chronic.encounter.form.addButton')}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DOTS Interactive Grid Calendar */}
              <TabsContent value="adherence" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Directly Observed Treatment Adherence Calendar</CardTitle>
                    <CardDescription>Click on a day square to rotate intake status: Observed (Green) ➔ Self-Administered (Blue) ➔ Missed (Red) ➔ Unlogged (Gray).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Legend */}
                    <div className="flex gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 rounded bg-emerald-500 block"></span>
                        <span>Directly Observed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 rounded bg-sky-500 block"></span>
                        <span>Self-Administered</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 rounded bg-rose-500 block"></span>
                        <span>Missed Dose</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 rounded bg-slate-200 dark:bg-slate-800 block"></span>
                        <span>Not Logged</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3 max-w-lg mx-auto py-2">
                      {selectedPatient.dotsHistory.map((dayLog) => (
                        <button
                          key={dayLog.day}
                          onClick={() => handleDotsClick(dayLog.day)}
                          className={`aspect-square rounded-xl border flex flex-col items-center justify-center font-bold text-sm transition-all shadow-sm ${getCellColor(dayLog.status)}`}
                        >
                          <span>{dayLog.day}</span>
                          <span className="text-[9px] font-normal opacity-85">
                            {dayLog.status === "Observed" ? "DOTS" : dayLog.status === "Self-Administered" ? "SELF" : dayLog.status === "Missed" ? "MISS" : "-"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedPatient.adherenceRate < 95 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 rounded-lg flex gap-2 text-xs text-amber-800 dark:text-amber-300">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Adherence Alert</p>
                          <p>Patient adherence of {selectedPatient.adherenceRate}% is below the target threshold of 95%. Consider enrolling patient in peer-led support groups.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* HIV & TB Program Tracking Panel */}
              <TabsContent value="programmatic" className="mt-4 space-y-6">
                {/* HIV WHO Clinical Staging */}
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                       <ClipboardList className="h-5 w-5 text-indigo-600" />
                       WHO Clinical Staging (HIV Programmatic Tracking)
                    </CardTitle>
                    <CardDescription>
                       Assess and log patient's disease progression stage based on standardized clinical criteria.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {[
                        { stage: 1, title: "Stage 1", desc: "Asymptomatic, Persistent Generalized Lymphadenopathy" },
                        { stage: 2, title: "Stage 2", desc: "Mild Weight Loss, Recurrent URIs, Minor Mucocutaneous Symptoms" },
                        { stage: 3, title: "Stage 3", desc: "Severe Weight Loss, Chronic Diarrhea > 1 Month, Pulmonary TB" },
                        { stage: 4, title: "Stage 4", desc: "HIV Wasting Syndrome, Opportunistic Infections, Extrapulmonary TB" },
                      ].map((item) => {
                        const isActive = selectedPatient.whoStage === item.stage;
                        return (
                          <button
                            key={item.stage}
                            onClick={() => handleUpdateWhoStage(item.stage as 1 | 2 | 3 | 4)}
                            className={cn(
                              "p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between h-32 shadow-sm",
                              isActive 
                                ? "bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-600" 
                                : "bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground"
                            )}
                          >
                            <span className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-indigo-200" : "text-indigo-600 dark:text-indigo-400")}>
                              {item.title}
                            </span>
                            <span className="text-xs font-medium line-clamp-3 leading-relaxed mt-2 opacity-90">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* TB Treatment Status & Sputum Tracking */}
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Tuberculosis Treatment Registry & Diagnostics
                    </CardTitle>
                    <CardDescription>
                      Monitor DOTS outcome indicators, sputum smear, and GeneXpert diagnostic logs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Outcome dropdown and warning alerts */}
                    <div className="grid sm:grid-cols-2 gap-4 items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <Label htmlFor="tbOutcome" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">TB Treatment Outcome Status</Label>
                        <Select 
                          value={selectedPatient.tbTreatmentOutcome || "On Treatment"}
                          onValueChange={(val) => handleUpdateTbOutcome(val as any)}
                        >
                          <SelectTrigger id="tbOutcome" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select Outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="On Treatment">Active - On Treatment</SelectItem>
                            <SelectItem value="Cured">Cured (Sputum Negative)</SelectItem>
                            <SelectItem value="Treatment Completed">Treatment Completed</SelectItem>
                            <SelectItem value="Treatment Failed">Treatment Failed</SelectItem>
                            <SelectItem value="Died">Patient Deceased (Died)</SelectItem>
                            <SelectItem value="Lost to Follow-up">Lost to Follow-up (LTFU)</SelectItem>
                            <SelectItem value="Not Evaluated">Not Evaluated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-xs">
                        {selectedPatient.tbTreatmentOutcome === "Cured" || selectedPatient.tbTreatmentOutcome === "Treatment Completed" ? (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-lg flex gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-emerald-800 dark:text-emerald-300">Treatment Completed Successfully</p>
                              <p>TB program therapy finished. Patient can transition to post-TB respiratory wellness monitoring.</p>
                            </div>
                          </div>
                        ) : selectedPatient.tbTreatmentOutcome === "Treatment Failed" || selectedPatient.tbTreatmentOutcome === "Lost to Follow-up" ? (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-lg flex gap-2">
                            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <p className="font-bold text-rose-800 dark:text-rose-300 font-bold">Urgent Action Required</p>
                              <p>High clinical risk! Re-evaluate drug susceptibility patterns, initiate active community trace, or rule out MDR-TB.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-150 dark:border-indigo-950/30 text-indigo-800 dark:text-indigo-300 rounded-lg flex gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-indigo-800 dark:text-indigo-300">Therapy In Progress</p>
                              <p>Directly Observed Therapy Short-course is ongoing. Maintain adherence &gt; 95% threshold.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Sputum Smear Logs */}
                    <div className="space-y-4">
                      <Label className="font-bold text-sm">Sputum Smear & GeneXpert History</Label>
                      {selectedPatient.tbSputumHistory && selectedPatient.tbSputumHistory.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                                <TableHead className="py-2 text-xs">Date Analyzed</TableHead>
                                <TableHead className="py-2 text-xs">Test Method</TableHead>
                                <TableHead className="py-2 text-xs">Result</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedPatient.tbSputumHistory.map((log, index) => (
                                <TableRow key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                  <TableCell className="py-2 text-xs font-mono">{log.date}</TableCell>
                                  <TableCell className="py-2 text-xs font-medium">{log.method}</TableCell>
                                  <TableCell className="py-2 text-xs">
                                    <Badge 
                                      className="text-[10px] border-none font-bold px-2 py-0.5 justify-center"
                                      variant={log.result === "Positive" ? "destructive" : "default"}
                                    >
                                      {log.result}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-center py-6 text-muted-foreground text-xs italic">No diagnostic sputum history logged.</p>
                      )}
                    </div>

                    {/* Log Sputum test inline form */}
                    <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
                      <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Log New Diagnostic Sputum Test</p>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Date (YYYY-MM-DD)</Label>
                          <Input 
                            type="date" 
                            value={sputumDate} 
                            onChange={e => setSputumDate(e.target.value)} 
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Method</Label>
                          <Select 
                            value={sputumMethod} 
                            onValueChange={(val: any) => setSputumMethod(val)}
                          >
                            <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sputum Smear">Sputum Smear</SelectItem>
                              <SelectItem value="GeneXpert">GeneXpert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Result</Label>
                          <Select 
                            value={sputumResult} 
                            onValueChange={(val: any) => setSputumResult(val)}
                          >
                            <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Positive">Positive</SelectItem>
                              <SelectItem value="Negative">Negative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleAddSputumRecord} 
                          disabled={isSavingSputum || !sputumDate} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full font-semibold"
                        >
                          {isSavingSputum ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          Log Result
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm border-t-4 border-t-indigo-600">
              <CardHeader className="bg-indigo-50/20 dark:bg-indigo-950/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" /> Patient Regime Log
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Active Diagnoses:</p>
                  <p className="font-bold text-indigo-600 mt-1">{selectedPatient.condition}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">ARV/TB Medication Schedule:</p>
                  <p className="font-medium mt-1">{selectedPatient.regimen}</p>
                </div>
                <Separator />
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Pharmacist Refill:</span>
                    <span>{selectedPatient.lastRefill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Next Refill:</span>
                    <span className="font-semibold text-indigo-600">{selectedPatient.nextRefill}</span>
                  </div>
                </div>

                {selectedPatient.adherenceRate < 95 && (
                  <div className="p-3 bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-2 border border-rose-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Adherence counsel checklist recommended.</span>
                  </div>
                )}

                {(selectedPatient as any).pmtctOptionB && (
                  <div className="p-3 bg-pink-500/10 text-pink-700 dark:text-pink-300 rounded-lg text-xs font-semibold flex items-start gap-2 border border-pink-200 dark:border-pink-900">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{t('chronic.pmtct.active')}</p>
                      <p className="font-normal text-pink-600 dark:text-pink-400 mt-0.5">{t('chronic.pmtct.description')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Chronic Care"
              patientData={selectedPatient}
              context="Viral load failure assessment and drug adherence protocol lookup."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed rounded-2xl">
          <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center">
            <History className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">No Patient Chart Loaded</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Please enter an ART registry number (e.g. <strong>ART-887722</strong>) to access longitudinal logs, CD4 trendlines and DOTS records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
