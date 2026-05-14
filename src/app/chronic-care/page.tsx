"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Search, FileText, Activity, Loader2, Save, Pill, HeartPulse, ClipboardList, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MOCK_CHRONIC_DATA = [
  { date: "2025-10", viralLoad: 450, cd4: 320 },
  { date: "2025-11", viralLoad: 300, cd4: 350 },
  { date: "2025-12", viralLoad: 50, cd4: 410 },
  { date: "2026-01", viralLoad: 20, cd4: 450 },
  { date: "2026-02", viralLoad: 10, cd4: 480 },
];

export default function ChronicCarePage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulating a chronic patient
    setSelectedPatient({
      id: "C001",
      nationalId: searchId,
      fullName: "Josefa Lobo",
      condition: "HIV / ART",
      regimen: "TLD (Tenofovir/Lamivudine/Dolutegravir)",
      adherence: "98%",
      lastRefill: "2026-04-10",
      nextRefill: "2026-05-10",
      status: "Stable",
      dotsHistory: [
        { date: "2026-05-12", status: "Observed", provider: "Nurse Mary" },
        { date: "2026-05-11", status: "Observed", provider: "Nurse Mary" },
        { date: "2026-05-10", status: "Missed", provider: "-" },
      ]
    });
    toast({ title: "Patient Record Loaded", description: "Longitudinal chronic care data retrieved." });
    setIsLoadingSearch(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8 text-primary" /> Chronic Disease Management
        </h1>
        <p className="text-muted-foreground">
          Longitudinal tracking for ART, TB, and non-communicable disease (NCD) clinics.
        </p>
      </div>

      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Patient Search</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by National ID or ART Number..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch}>
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Data"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-200">Optimal</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Adherence</p>
                    <p className="text-2xl font-bold text-green-700">{selectedPatient.adherence}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Next Refill</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedPatient.nextRefill}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Viral Load</p>
                    <p className="text-2xl font-bold text-amber-700">Undetectable</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="clinical" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="clinical" className="gap-2"><Activity className="h-4 w-4" /> Clinical Trends</TabsTrigger>
                <TabsTrigger value="adherence" className="gap-2"><ClipboardList className="h-4 w-4" /> Adherence (DOTS)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="clinical">
                <Card>
                  <CardHeader>
                    <CardTitle>Viral Load & CD4 Trends</CardTitle>
                    <CardDescription>Historical clinical markers over the last 6 months.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_CHRONIC_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="viralLoad" stroke="hsl(var(--destructive))" name="Viral Load" strokeWidth={2} />
                        <Line type="monotone" dataKey="cd4" stroke="hsl(var(--primary))" name="CD4 Count" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="adherence">
                <Card>
                  <CardHeader>
                    <CardTitle>DOTS Log (Directly Observed Treatment)</CardTitle>
                    <CardDescription>Daily medication intake tracking for TB/ART patients.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.dotsHistory.map((h: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{h.date}</TableCell>
                            <TableCell>
                              <Badge variant={h.status === "Observed" ? "default" : "destructive"}>
                                {h.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{h.provider}</TableCell>
                            <TableCell className="text-right">
                              {h.status === "Missed" && <Button size="sm" variant="ghost">Report Issue</Button>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button className="w-full mt-4 gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Log Observed Intake (Today)
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">Patient Regimen</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Current Condition:</p>
                  <p className="font-bold text-primary text-lg">{selectedPatient.condition}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground">Drug Regimen:</p>
                  <p className="font-medium">{selectedPatient.regimen}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-amber-700 dark:text-amber-300">Last refill was 3 days late. Reinforce adherence counseling.</p>
                </div>
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Chronic Care"
              patientData={selectedPatient}
              context="ART Adherence audit and drug-drug interaction check."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            <History className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">No Patient Data</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Search for a patient to view their longitudinal health trends and adherence logs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
