"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Search, Ruler, Weight, Loader2, Save, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle2, History, Scale, Activity, Flame, Milk } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalDB } from '@/lib/db';

interface AssessmentRecord {
  date: string;
  weight: number;
  muac: number;
  clinicalSigns: string;
  status: string;
}

interface RationLog {
  date: string;
  item: string;
  quantity: number;
  status: "Dispensed" | "Cancelled";
}

interface NutritionPatient {
  id: string;
  nationalId: string;
  fullName: string;
  ageInMonths: number;
  status: string;
  currentWeight: number;
  targetWeight: number;
  muac: number;
  rutfRation: string;
  history: AssessmentRecord[];
  rationLogs: RationLog[];
}

const DEFAULT_NUTRITION_PATIENTS: NutritionPatient[] = [
  {
    id: "NUT-001",
    nationalId: "NID-112233",
    fullName: "Liam Antonio",
    ageInMonths: 18,
    status: "Moderate Acute Malnutrition (MAM)",
    currentWeight: 8.5,
    targetWeight: 10.2,
    muac: 12.1,
    rutfRation: "2 sachets/day",
    history: [
      { date: "2026-05-01", weight: 8.5, muac: 12.1, clinicalSigns: "None reported", status: "Moderate Acute Malnutrition (MAM)" },
      { date: "2026-04-15", weight: 7.8, muac: 11.2, clinicalSigns: "Bilateral pitting edema (+)", status: "Severe Acute Malnutrition (SAM)" }
    ],
    rationLogs: [
      { date: "2026-05-01", item: "RUTF Plumpy'Nut (Sachets)", quantity: 28, status: "Dispensed" }
    ]
  }
];

export default function NutritionPage() {
  const [patientsList, setPatientsList] = useState<NutritionPatient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<NutritionPatient | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // New Assessment Inputs
  const [newMuac, setNewMuac] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newClinicalSigns, setNewClinicalSigns] = useState("");
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  // Stock Management State
  const [rutfStock, setRutfStock] = useState(320);

  // Inpatient milk feeding calculator
  const [milkType, setMilkType] = useState<"F-75" | "F-100">("F-75");
  const [numFeeds, setNumFeeds] = useState(8); // 8 feeds (every 3 hours) or 12 feeds (every 2 hours) or 6 feeds
  const [calcWeight, setCalcWeight] = useState("");
  const [calcDailyVolume, setCalcDailyVolume] = useState(0);
  const [calcFeedVolume, setCalcFeedVolume] = useState(0);

  const loadData = async () => {
    const list = await LocalDB.get<NutritionPatient[]>("nutrition_patients", DEFAULT_NUTRITION_PATIENTS);
    setPatientsList(list);

    // Load RUTF Stock from Pharmacy Stock
    const pharmacyStock = await LocalDB.get<any[]>("pharmacy_stock", []);
    const rutfItem = pharmacyStock.find(item => item.name === "RUTF Plumpy'Nut (Sachet)" || item.name.includes("RUTF"));
    if (rutfItem) {
      setRutfStock(rutfItem.stock);
    } else {
      // Seed default stock if missing
      const newRutfItem = { id: "DRG-909", name: "RUTF Plumpy'Nut (Sachet)", category: "Nutrition", stock: 350, unit: "Sachet", shelfLocation: "Shelf G-4" };
      await LocalDB.save("pharmacy_stock", [...pharmacyStock, newRutfItem]);
      setRutfStock(350);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const found = patientsList.find(p => p.nationalId === searchId || p.fullName.toLowerCase().includes(searchId.toLowerCase()) || p.id === searchId);
    if (found) {
      setSelectedPatient(found);
      setCalcWeight(found.currentWeight.toString());
      toast({ title: "Nutritional Card Found", description: `Loaded record for ${found.fullName}.` });
    } else {
      setSelectedPatient(null);
      toast({ variant: "destructive", title: "Not Found", description: "No nutrition patient file matches this ID." });
    }
    setIsLoadingSearch(false);
  };

  // Classify MUAC according to WHO standards
  const classifyMuac = (muacValue: number) => {
    if (muacValue < 11.5) return "Severe Acute Malnutrition (SAM)";
    if (muacValue < 12.5) return "Moderate Acute Malnutrition (MAM)";
    return "Well Nourished (Normal)";
  };

  const handleSaveAssessment = async () => {
    if (!selectedPatient || !newMuac || !newWeight) return;
    setIsSavingAssessment(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const muacVal = parseFloat(newMuac);
    const weightVal = parseFloat(newWeight);
    const status = classifyMuac(muacVal);

    const newRecord: AssessmentRecord = {
      date: new Date().toISOString().split('T')[0],
      weight: weightVal,
      muac: muacVal,
      clinicalSigns: newClinicalSigns || "None reported",
      status: status
    };

    // Update patient profile
    const updatedPatient: NutritionPatient = {
      ...selectedPatient,
      currentWeight: weightVal,
      muac: muacVal,
      status: status,
      rutfRation: status === "Severe Acute Malnutrition (SAM)" ? "3 sachets/day" : status === "Moderate Acute Malnutrition (MAM)" ? "2 sachets/day" : "None indicated",
      history: [newRecord, ...selectedPatient.history]
    };

    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("nutrition_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);
    setCalcWeight(weightVal.toString());

    toast({
      title: "Assessment Saved",
      description: `Classified as ${status}.`
    });

    setIsSavingAssessment(false);
    setNewMuac("");
    setNewWeight("");
    setNewClinicalSigns("");
  };

  const handleDispenseRation = async () => {
    if (!selectedPatient) return;
    
    // Dispensing logic: 14 days worth
    const rate = selectedPatient.status === "Severe Acute Malnutrition (SAM)" ? 3 : selectedPatient.status === "Moderate Acute Malnutrition (MAM)" ? 2 : 0;
    if (rate === 0) {
      toast({ variant: "destructive", title: "Dispensing Error", description: "This child does not require RUTF rations." });
      return;
    }

    const totalNeeded = rate * 14;
    if (rutfStock < totalNeeded) {
      toast({ variant: "destructive", title: "Insufficient Stock", description: `Only ${rutfStock} sachets available in pharmacy stock.` });
      return;
    }

    // Deduct stock
    const updatedStock = rutfStock - totalNeeded;
    setRutfStock(updatedStock);

    const pharmacyStock = await LocalDB.get<any[]>("pharmacy_stock", []);
    const updatedPharmacy = pharmacyStock.map(item => {
      if (item.name === "RUTF Plumpy'Nut (Sachet)" || item.name.includes("RUTF")) {
        return { ...item, stock: updatedStock };
      }
      return item;
    });
    await LocalDB.save("pharmacy_stock", updatedPharmacy);

    // Save distribution log
    const newLog: RationLog = {
      date: new Date().toISOString().split('T')[0],
      item: "RUTF Plumpy'Nut (Sachets)",
      quantity: totalNeeded,
      status: "Dispensed"
    };

    const updatedPatient: NutritionPatient = {
      ...selectedPatient,
      rationLogs: [newLog, ...selectedPatient.rationLogs]
    };

    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("nutrition_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({
      title: "RUTF Ration Dispensed",
      description: `Successfully deducted ${totalNeeded} sachets from pharmacy inventory.`
    });
  };

  // WHO F-75 / F-100 feeding calculation logic
  useEffect(() => {
    const wt = parseFloat(calcWeight);
    if (isNaN(wt) || wt <= 0) {
      setCalcDailyVolume(0);
      setCalcFeedVolume(0);
      return;
    }

    let dailyRatio = milkType === "F-75" ? 130 : 150; // ml per kg daily
    const daily = dailyRatio * wt;
    setCalcDailyVolume(Math.round(daily));
    setCalcFeedVolume(Math.round(daily / numFeeds));
  }, [milkType, numFeeds, calcWeight]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Utensils className="h-8 w-8 text-emerald-600" /> Nutrition & Dietetics
          </h1>
          <p className="text-muted-foreground text-sm">
            Integrated malnutrition classification (SAM/MAM), Plumpy&apos;Nut ration stock management, and inpatient milk calculators.
          </p>
        </div>
      </div>

      {/* Patient Search */}
      <Card className="shadow-sm border-emerald-100 bg-emerald-50/10 dark:bg-emerald-950/5 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Child Nutrition Registry</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Health Card or Child NID (Try: NID-112233)..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Profile"}
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
                    <p className="text-xs text-muted-foreground">Nutrition Status</p>
                    <p className="text-sm font-bold text-emerald-700 mt-2">{selectedPatient.status}</p>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-lg">
                    <Scale className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-indigo-50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950/50">
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Latest MUAC Tape</p>
                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 mt-1">{selectedPatient.muac} cm</p>
                  </div>
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-lg">
                    <Ruler className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-teal-50 dark:bg-teal-950/10 border-teal-100">
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Weight (Current/Target)</p>
                    <p className="text-lg font-black text-teal-700 dark:text-teal-400 mt-1">{selectedPatient.currentWeight}kg / {selectedPatient.targetWeight}kg</p>
                  </div>
                  <div className="p-2 bg-teal-100 dark:bg-teal-900 text-teal-600 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stepper Tabs */}
            <Tabs defaultValue="assessment" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assessment" className="gap-2"><Activity className="h-4 w-4" /> Child Growth & MUAC Log</TabsTrigger>
                <TabsTrigger value="therapeutic" className="gap-2"><ShoppingBag className="h-4 w-4" /> Plumpy&apos;Nut Distribution</TabsTrigger>
              </TabsList>

              {/* Assessment Form Tab */}
              <TabsContent value="assessment" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Nutritional Screening Intake</CardTitle>
                    <CardDescription>Input clinical variables. Status is computed dynamically on save.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">MUAC (Mid-Upper Arm Circumference) cm <span className="text-red-500">*</span></Label>
                        <Input type="number" step="0.1" placeholder="e.g. 11.2" value={newMuac} onChange={e => setNewMuac(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Weight (kg) <span className="text-red-500">*</span></Label>
                        <Input type="number" step="0.1" placeholder="e.g. 7.9" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Associated Clinical Signs (Edema, Dermatosis)</Label>
                      <Input placeholder="e.g. Grade 1 bilateral pitting edema..." value={newClinicalSigns} onChange={e => setNewClinicalSigns(e.target.value)} />
                    </div>

                    <Button onClick={handleSaveAssessment} disabled={isSavingAssessment || !newMuac || !newWeight} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mt-2">
                      {isSavingAssessment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Log Assessment & Calculate Rations
                    </Button>

                    <Separator className="my-6" />

                    <h4 className="font-bold text-sm">Longitudinal Nutrition Logs</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date Checked</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>MUAC Tape</TableHead>
                          <TableHead>Clinical Signs</TableHead>
                          <TableHead>Assigned Classification</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.history.map((h, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs">{h.date}</TableCell>
                            <TableCell className="font-semibold">{h.weight} kg</TableCell>
                            <TableCell>{h.muac} cm</TableCell>
                            <TableCell className="text-xs text-slate-500">{h.clinicalSigns}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={h.status.includes("SAM") ? "border-rose-200 text-rose-600 bg-rose-50" : h.status.includes("MAM") ? "border-amber-200 text-amber-600 bg-amber-50" : "border-emerald-200 text-emerald-600"}>
                                {h.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RUTF Plumpy'Nut Distribution Tab */}
              <TabsContent value="therapeutic" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">RUTF Plumpy&apos;Nut Ration Dispatch</CardTitle>
                        <CardDescription>Verify therapeutic stock and log distribution cycles.</CardDescription>
                      </div>
                      <Badge className="bg-indigo-600 text-white">Stock: {rutfStock} Sachets</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">Target Prescribed Intake:</span>
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">{selectedPatient.rutfRation}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Standard treatment cycles are 14 days. Dispatching this cycle requires dispensing <strong>
                          {selectedPatient.status.includes("SAM") ? 42 : selectedPatient.status.includes("MAM") ? 28 : 0}
                        </strong> sachets.
                      </p>
                      
                      <Button onClick={handleDispenseRation} disabled={selectedPatient.rutfRation.includes("None")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <ShoppingBag className="h-4 w-4" /> Dispatch 14-Day Stock
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm flex items-center gap-1.5"><History className="h-4 w-4" /> Dispatch History Logs</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date Logged</TableHead>
                            <TableHead>Therapeutic Food</TableHead>
                            <TableHead>Sachet Count</TableHead>
                            <TableHead>Dispatch Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPatient.rationLogs.map((log, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-xs">{log.date}</TableCell>
                              <TableCell className="font-medium text-xs">{log.item}</TableCell>
                              <TableCell>{log.quantity}</TableCell>
                              <TableCell>
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {log.status}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar - Inpatient Milk Feeding Calculator */}
          <div className="space-y-6">
            <Card className="shadow-sm border-t-4 border-t-emerald-600">
              <CardHeader className="bg-emerald-50/20 dark:bg-emerald-950/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Milk className="h-5 w-5 text-emerald-600" /> WHO Therapeutic Milk Calc
                </CardTitle>
                <CardDescription className="text-xs">Inpatient rehabilitation feeding dosages for severe acute malnutrition (SAM).</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                
                {/* Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant={milkType === "F-75" ? "default" : "outline"} onClick={() => setMilkType("F-75")} className={milkType === "F-75" ? "bg-emerald-600 hover:bg-emerald-700" : ""}>F-75 (Stabilization)</Button>
                  <Button size="sm" variant={milkType === "F-100" ? "default" : "outline"} onClick={() => setMilkType("F-100")} className={milkType === "F-100" ? "bg-emerald-600 hover:bg-emerald-700" : ""}>F-100 (Transition)</Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Target Feeds / Day</Label>
                  <select 
                    value={numFeeds} 
                    onChange={e => setNumFeeds(parseInt(e.target.value, 10))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value={12}>12 feeds (every 2 hours)</option>
                    <option value={8}>8 feeds (every 3 hours)</option>
                    <option value={6}>6 feeds (every 4 hours)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Child Current Weight (kg)</Label>
                  <Input type="number" step="0.1" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} placeholder="0.0" />
                </div>

                <Separator />

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl space-y-2 border border-emerald-100 dark:border-emerald-900 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Target Daily Volume:</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{calcDailyVolume} mL / day</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 border-dashed border-emerald-200">
                    <span>Volume Per Feed:</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{calcFeedVolume} mL / feed</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1 italic">
                    Based on WHO standards of {milkType === "F-75" ? "130mL/kg/day" : "150mL/kg/day"} administered via nasogastric tube or oral cup.
                  </p>
                </div>

                {selectedPatient.status.includes("SAM") && (
                  <div className="p-3 bg-rose-500/10 text-rose-800 dark:text-rose-400 rounded-lg flex gap-2 text-xs border border-rose-200">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Alert: Monitor closely for signs of refeeding syndrome and severe abdominal distension.</p>
                  </div>
                )}

              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Nutrition"
              patientData={selectedPatient}
              context="Severe malnutrition rehabilitation protocol check."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed rounded-2xl">
          <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
            <Utensils className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Nutritional Console</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Please enter a patient child health card ID (e.g. <strong>NUT-001</strong>) to compute therapeutic feedings and dispense RUTF sachets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
