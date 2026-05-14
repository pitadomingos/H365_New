"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Search, CalendarPlus, FileText, Activity, ShieldAlert, Microscope, Ruler, Weight, Thermometer, Loader2, CalendarIcon, Save, HeartPulse, Pill, CheckCircle2, AlertCircle, Syringe } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
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
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  age: number;
  dob: string;
  motherName: string;
  motherId: string;
  vaccinations: Vaccination[];
  growthHistory: GrowthMetric[];
}

const MOCK_PEDIATRIC_PATIENTS: PediatricPatient[] = [
  {
    id: "PED001",
    nationalId: "P-88776655",
    fullName: "Liam Antonio",
    age: 0,
    dob: "2026-01-15",
    motherName: "Alice Mwamba",
    motherId: "1029384756",
    vaccinations: [
      { id: "v1", name: "BCG", dueDate: "2026-01-15", administeredDate: "2026-01-15", status: "Administered", batchNumber: "B123-X" },
      { id: "v2", name: "OPV 0", dueDate: "2026-01-15", administeredDate: "2026-01-15", status: "Administered", batchNumber: "O-998" },
      { id: "v3", name: "Hepatitis B", dueDate: "2026-01-15", administeredDate: "2026-01-15", status: "Administered", batchNumber: "H-445" },
      { id: "v4", name: "DTP-HepB-Hib 1", dueDate: "2026-02-26", status: "Due" },
      { id: "v5", name: "Rotavirus 1", dueDate: "2026-02-26", status: "Due" },
    ],
    growthHistory: [
      { id: "g1", date: "2026-01-15", ageInMonths: 0, weightKg: 3.2, heightCm: 50, muacCm: 10.5 },
    ]
  }
];

export default function PediatricsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

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
  const [isSavingGrowth, setIsSavingGrowth] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const found = MOCK_PEDIATRIC_PATIENTS.find(p => p.nationalId === searchId || p.motherId === searchId);
    if (found) {
      setSelectedPatient(found);
      toast({ title: "Patient Found", description: `Loaded record for ${found.fullName}` });
    } else {
      setSelectedPatient(null);
      toast({ variant: "destructive", title: "Not Found", description: "No pediatric record matches this ID." });
    }
    setIsLoadingSearch(false);
  };

  const handleAdministerVax = async () => {
    if (!selectedPatient || !selectedVax || !vaxBatch) return;
    setIsAdministering(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedVax = selectedPatient.vaccinations.map(v => 
      v.id === selectedVax.id ? { ...v, status: "Administered" as const, administeredDate: new Date().toISOString().split('T')[0], batchNumber: vaxBatch } : v
    );
    
    setSelectedPatient({ ...selectedPatient, vaccinations: updatedVax });
    toast({ title: "Vaccination Recorded", description: `${selectedVax.name} administered successfully.` });
    setIsAdministering(false);
    setIsVaxModalOpen(false);
    setSelectedVax(null);
    setVaxBatch("");
  };

  const handleSaveGrowth = async () => {
    if (!selectedPatient || !newWeight || !newHeight) return;
    setIsSavingGrowth(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newEntry: GrowthMetric = {
      id: `g${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ageInMonths: 2, // Simplified for demo
      weightKg: parseFloat(newWeight),
      heightCm: parseFloat(newHeight),
      muacCm: newMuac ? parseFloat(newMuac) : undefined
    };
    
    setSelectedPatient({ ...selectedPatient, growthHistory: [newEntry, ...selectedPatient.growthHistory] });
    toast({ title: "Growth Data Saved", description: "Weight and height have been updated." });
    setIsSavingGrowth(false);
    setNewWeight("");
    setNewHeight("");
    setNewMuac("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Baby className="h-8 w-8 text-primary" /> Pediatrics & Child Wellness (PAV)
        </h1>
        <p className="text-muted-foreground">
          Integrated vaccination tracking, growth monitoring, and pediatric decision support.
        </p>
      </div>

      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Child/Mother ID Search</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Child ID or Mother's National ID..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch}>
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Record"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="vaccinations" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vaccinations" className="gap-2"><Syringe className="h-4 w-4" /> Immunization (EPI)</TabsTrigger>
                <TabsTrigger value="growth" className="gap-2"><Activity className="h-4 w-4" /> Growth Monitoring</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vaccinations">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Vaccination Schedule</CardTitle>
                    <CardDescription>Comprehensive tracking for national immunization programs.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vaccine</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Administered</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.vaccinations.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell>{v.dueDate}</TableCell>
                            <TableCell>
                              <Badge variant={v.status === "Administered" ? "default" : v.status === "Overdue" ? "destructive" : "outline"}>
                                {v.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{v.administeredDate || "-"}</TableCell>
                            <TableCell className="text-right">
                              {v.status !== "Administered" && (
                                <Button size="sm" variant="outline" onClick={() => { setSelectedVax(v); setIsVaxModalOpen(true); }}>
                                  Record
                                </Button>
                              )}
                              {v.status === "Administered" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="growth">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Growth History</CardTitle>
                    <CardDescription>Monitoring weight, height, and MUAC for nutritional health.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border border-dashed">
                      <div className="space-y-1">
                        <Label>Weight (kg)</Label>
                        <Input type="number" placeholder="0.0" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Height (cm)</Label>
                        <Input type="number" placeholder="0.0" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>MUAC (cm)</Label>
                        <Input type="number" placeholder="Optional" value={newMuac} onChange={(e) => setNewMuac(e.target.value)} />
                      </div>
                      <Button className="col-span-3 mt-2" disabled={isSavingGrowth || !newWeight || !newHeight} onClick={handleSaveGrowth}>
                        {isSavingGrowth ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Metrics
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Age (Mo)</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Height</TableHead>
                          <TableHead>MUAC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.growthHistory.map((g) => (
                          <TableRow key={g.id}>
                            <TableCell>{g.date}</TableCell>
                            <TableCell>{g.ageInMonths}</TableCell>
                            <TableCell>{g.weightKg} kg</TableCell>
                            <TableCell>{g.heightCm} cm</TableCell>
                            <TableCell>{g.muacCm ? `${g.muacCm} cm` : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Child Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-semibold">{selectedPatient.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">DOB:</span>
                  <span>{selectedPatient.dob}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-bold text-primary">{selectedPatient.age} Months</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Mother:</span>
                  <span>{selectedPatient.motherName}</span>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs flex gap-2 items-start">
                  <ShieldAlert className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-blue-700 dark:text-blue-300">Next mandatory vaccine (Rotavirus 1) is due in 12 days.</p>
                </div>
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Pediatrics"
              patientData={selectedPatient}
              context="Early childhood development and immunization schedule audit."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            <Baby className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">No Patient Loaded</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Please enter a Child ID or Mother's National ID to access pediatric records and wellness charts.
            </p>
          </div>
        </div>
      )}

      {/* Vaccination Record Modal */}
      <Dialog open={isVaxModalOpen} onOpenChange={setIsVaxModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administer Vaccine</DialogTitle>
            <DialogDescription>
              Record the administration of {selectedVax?.name} for {selectedPatient?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Vaccine Batch Number</Label>
              <Input 
                id="batch" 
                placeholder="Enter batch/lot number..." 
                value={vaxBatch} 
                onChange={(e) => setVaxBatch(e.target.value)} 
              />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Ensure you have verified the expiry date on the vial before administration.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVaxModalOpen(false)}>Cancel</Button>
            <Button disabled={!vaxBatch || isAdministering} onClick={handleAdministerVax}>
              {isAdministering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Administration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
