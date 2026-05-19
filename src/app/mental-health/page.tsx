"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Search, FileText, Loader2, Save, MessageCircle, Heart, AlertCircle, Calendar, UserPlus, ShieldAlert, ListChecks, CheckCircle2, UserCheck, Shield } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LocalDB } from '@/lib/db';

interface SessionRecord {
  date: string;
  type: string;
  notes: string;
  mseNotes?: string;
  suicidalIdeation: string;
  sleepPattern: string;
  moodLevel: number;
  provider: string;
}

interface SocialWorkReferral {
  id: string;
  patientId: string;
  patientName: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  notes: string;
  dateLogged: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
}

interface MentalHealthPatient {
  id: string;
  nationalId: string;
  fullName: string;
  age: number;
  diagnosis: string;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  nextSession: string;
  history: SessionRecord[];
  referrals: SocialWorkReferral[];
}

const DEFAULT_MENTAL_HEALTH_PATIENTS: MentalHealthPatient[] = [
  {
    id: "MH-4011",
    nationalId: "NID-990088",
    fullName: "Delfina Correia",
    age: 45,
    diagnosis: "Generalized Anxiety Disorder & Mild Depressive Episode",
    riskLevel: "Moderate",
    nextSession: "2026-05-25",
    history: [
      { 
        date: "2026-04-20", 
        type: "Psychotherapy Session", 
        notes: "Patient reported improved sleep patterns but experiences somatic chest tightness in stressful crowds.", 
        mseNotes: "Appearance neat. Speech normal rate and tone. Affect anxious but congruent. Thought process linear.",
        suicidalIdeation: "None Reported",
        sleepPattern: "Interrupted",
        moodLevel: 5,
        provider: "Dr. Chen, Psychiatrist" 
      },
      { 
        date: "2026-03-15", 
        type: "Initial Psychiatric Intake", 
        notes: "High levels of anxiety and cortisol-related stress. Symptoms initiated 6 months ago after career transition.",
        mseNotes: "Agitated movements, wringing hands. Speech pressured. Mood self-reported as 'extremely low'.",
        suicidalIdeation: "Ideation without intent",
        sleepPattern: "Insomnia",
        moodLevel: 3,
        provider: "Dr. Chen, Psychiatrist" 
      },
    ],
    referrals: [
      {
        id: "REF-001",
        patientId: "MH-4011",
        patientName: "Delfina Correia",
        category: "Psychosocial Support Groups",
        priority: "Medium",
        notes: "Referral for peer-led anxiety management community workshop.",
        dateLogged: "2026-04-20",
        status: "Completed"
      }
    ]
  }
];

export default function MentalHealthPage() {
  const [patientsList, setPatientsList] = useState<MentalHealthPatient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<MentalHealthPatient | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // New Consultation Note Form State
  const [subjectiveNote, setSubjectiveNote] = useState("");
  const [mseNote, setMseNote] = useState("");
  const [siRisk, setSiRisk] = useState("None Reported");
  const [sleepState, setSleepState] = useState("Normal");
  const [moodScale, setMoodScale] = useState(5);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Social Work Referral State
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [refCategory, setRefCategory] = useState("Psychosocial Support");
  const [refPriority, setRefPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [refNotes, setRefNotes] = useState("");
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  // Global Social Work Queue
  const [socialWorkQueue, setSocialWorkQueue] = useState<SocialWorkReferral[]>([]);

  const loadData = async () => {
    const list = await LocalDB.get<MentalHealthPatient[]>("mental_health_patients", DEFAULT_MENTAL_HEALTH_PATIENTS);
    setPatientsList(list);
    
    const globalQueue = await LocalDB.get<SocialWorkReferral[]>("social_work_queue", []);
    setSocialWorkQueue(globalQueue);
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
      toast({ title: "Patient Chart Opened", description: `Loaded mental health record for ${found.fullName}.` });
    } else {
      setSelectedPatient(null);
      toast({ variant: "destructive", title: "Not Found", description: "No registered psychiatric record matches this ID." });
    }
    setIsLoadingSearch(false);
  };

  const handleSaveNote = async () => {
    if (!selectedPatient || !subjectiveNote.trim()) return;
    setIsSavingNote(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newRecord: SessionRecord = {
      date: new Date().toISOString().split('T')[0],
      type: "Psychotherapy Follow-up",
      notes: subjectiveNote,
      mseNotes: mseNote,
      suicidalIdeation: siRisk,
      sleepPattern: sleepState,
      moodLevel: moodScale,
      provider: "Dr. Chen, Psychiatrist"
    };

    // Update risk level dynamically if SI intent is logged
    let updatedRisk = selectedPatient.riskLevel;
    if (siRisk === "High risk / Intent") updatedRisk = "Critical";
    else if (siRisk === "Ideation with plan") updatedRisk = "High";
    else if (siRisk === "Ideation without intent") updatedRisk = "Moderate";

    const updatedPatient: MentalHealthPatient = {
      ...selectedPatient,
      riskLevel: updatedRisk,
      history: [newRecord, ...selectedPatient.history]
    };

    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("mental_health_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({
      title: "Consultation Saved",
      description: "Mental State Examination and subjective findings logged."
    });

    setIsSavingNote(false);
    setSubjectiveNote("");
    setMseNote("");
    setSiRisk("None Reported");
    setSleepState("Normal");
    setMoodScale(5);
  };

  const handleCreateReferral = async () => {
    if (!selectedPatient || !refNotes.trim()) return;
    setIsSavingReferral(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newReferral: SocialWorkReferral = {
      id: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      category: refCategory,
      priority: refPriority,
      notes: refNotes,
      dateLogged: new Date().toISOString().split('T')[0],
      status: "Pending"
    };

    // Add referral to patient
    const updatedPatient: MentalHealthPatient = {
      ...selectedPatient,
      referrals: [newReferral, ...selectedPatient.referrals]
    };

    // Update global social work queue
    const updatedGlobalQueue = [newReferral, ...socialWorkQueue];
    await LocalDB.save("social_work_queue", updatedGlobalQueue);
    setSocialWorkQueue(updatedGlobalQueue);

    // Save patients
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);
    await LocalDB.save("mental_health_patients", updatedList);
    
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({
      title: "Social Work Referral Logged",
      description: `Routed to ${refCategory} dashboard.`
    });

    setIsSavingReferral(false);
    setRefNotes("");
    setIsReferralModalOpen(false);
  };

  const getRiskBadgeColor = (risk: MentalHealthPatient["riskLevel"]) => {
    switch (risk) {
      case "Critical": return "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400";
      case "High": return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400";
      case "Moderate": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-400";
      default: return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-indigo-600" /> Mental Health & Psychiatry
          </h1>
          <p className="text-muted-foreground text-sm">
            Holistic assessment, Mental State Examinations (MSE), suicidal ideation screening, and social support integration.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <Card className="shadow-sm border-indigo-100 bg-indigo-50/10 dark:bg-indigo-950/5 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Psychiatric Patient Finder</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Patient ID or National ID (Try: NID-990088)..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open Case File"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Panels */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-indigo-50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950/50">
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next Therapy Session</p>
                    <p className="text-lg font-extrabold">{selectedPatient.nextSession}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 dark:bg-slate-900/10 border-slate-100">
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Suicide Risk Classification</p>
                    <Badge variant="outline" className={`mt-1 font-bold ${getRiskBadgeColor(selectedPatient.riskLevel)}`}>
                      {selectedPatient.riskLevel} Risk
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stepper tabs */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes" className="gap-2"><FileText className="h-4 w-4" /> Consultation Note</TabsTrigger>
                <TabsTrigger value="history" className="gap-2"><MessageCircle className="h-4 w-4" /> Session Logs</TabsTrigger>
                <TabsTrigger value="social-work" className="gap-2"><UserPlus className="h-4 w-4" /> Social Referrals</TabsTrigger>
              </TabsList>

              {/* Consultation Note Tab */}
              <TabsContent value="notes" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Structured Psychosocial Consultation</CardTitle>
                    <CardDescription>Log patient self-reports, mental state indicators, and behavioral metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Subjective Cognitive Assessment</Label>
                      <Textarea 
                        placeholder="Log patient's reported mood swings, anxiety levels, coping skills, and emotional progress..." 
                        value={subjectiveNote}
                        onChange={e => setSubjectiveNote(e.target.value)}
                        className="min-h-[100px]" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Mental State Examination (MSE) Parameters</Label>
                      <Textarea 
                        placeholder="Assess appearance, cooperative behavior, speech speed, affect congruency, and thought content..." 
                        value={mseNote}
                        onChange={e => setMseNote(e.target.value)}
                        className="min-h-[90px]" 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Suicidal / Self-Harm Risk</Label>
                        <select 
                          value={siRisk} 
                          onChange={e => setSiRisk(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option>None Reported</option>
                          <option>Ideation without intent</option>
                          <option>Ideation with plan</option>
                          <option>High risk / Intent</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Sleep Pattern Quality</Label>
                        <select 
                          value={sleepState} 
                          onChange={e => setSleepState(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option>Normal</option>
                          <option>Insomnia</option>
                          <option>Hypersomnia</option>
                          <option>Interrupted</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-semibold">Self-Reported Mood Scale</Label>
                          <span className="text-xs font-extrabold text-indigo-600">{moodScale}/10</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={moodScale} 
                          onChange={e => setMoodScale(parseInt(e.target.value, 10))}
                          className="w-full mt-2 accent-indigo-600" 
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Depressed</span>
                          <span>Euthymic</span>
                          <span>Manic</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveNote} disabled={isSavingNote || !subjectiveNote.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                      {isSavingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Consultation & Update Risk Level
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Session History Tab */}
              <TabsContent value="history" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Case Session Logs</CardTitle>
                    <CardDescription>Review chronological history of psychiatric consultations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPatient.history.map((h, i) => (
                      <div key={i} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/10 space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{h.type}</Badge>
                            <span className="text-xs text-muted-foreground">{h.date}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{h.provider}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300"><strong>Subjective:</strong> {h.notes}</p>
                        {h.mseNotes && <p className="text-xs text-muted-foreground"><strong>MSE:</strong> {h.mseNotes}</p>}
                        
                        <div className="flex gap-4 text-xs pt-1 border-t border-dashed mt-2">
                          <span><strong>Mood level:</strong> {h.moodLevel}/10</span>
                          <span><strong>Sleep:</strong> {h.sleepPattern}</span>
                          <span><strong>SI Risk:</strong> {h.suicidalIdeation}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referrals list */}
              <TabsContent value="social-work" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-bold">Patient Social Referrals</CardTitle>
                      <CardDescription>Social work queue placements and integration logs.</CardDescription>
                    </div>
                    <Button onClick={() => setIsReferralModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                      <UserPlus className="h-4 w-4" /> Create Referral
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.referrals.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ref ID</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date Logged</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPatient.referrals.map((ref) => (
                            <TableRow key={ref.id}>
                              <TableCell className="font-mono text-xs text-slate-500 font-bold">{ref.id}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-sm">{ref.category}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ref.notes}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">{ref.dateLogged}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={ref.priority === "High" ? "border-rose-200 text-rose-600 bg-rose-50" : "border-slate-200"}>
                                  {ref.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={ref.status === "Completed" ? "default" : "outline"} className={ref.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                                  {ref.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">No social work referrals logged for this case.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Summary Side Panel */}
          <div className="space-y-6">
            <Card className="shadow-sm border-t-4 border-t-indigo-600">
              <CardHeader className="bg-indigo-50/20 dark:bg-indigo-950/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-indigo-600" /> Case Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Primary Diagnosis:</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{selectedPatient.diagnosis}</p>
                </div>
                <Separator />
                
                {selectedPatient.riskLevel === "Critical" || selectedPatient.riskLevel === "High" ? (
                  <div className="p-3 bg-rose-500/10 text-rose-800 dark:text-rose-400 rounded-lg border border-rose-200 flex gap-2 text-xs">
                    <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">CRISIS PROTOCOL ACTIVE</p>
                      <p>Ensure patient has 24/7 care provider contact details and schedule follow-up within 48 hours.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/10 rounded-lg border border-amber-200 flex gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Risk Management Alert</p>
                      <p>Monitor closely during medication dosage adjustments or regimen transition phases.</p>
                    </div>
                  </div>
                )}
                
                <Button onClick={() => setIsReferralModalOpen(true)} variant="outline" className="w-full gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  <UserPlus className="h-4 w-4" /> Place in Social Work Queue
                </Button>
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Mental Health"
              patientData={selectedPatient}
              context="Therapy counseling support, sentiment trend audit, and pharmacotherapy drug checks."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed rounded-2xl">
          <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center">
            <Brain className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Psychiatric Case File Unselected</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Please enter a patient ID or National ID number (e.g. <strong>NID-990088</strong>) to view psychosocial notes, MSE inputs, and refer to social services.
            </p>
          </div>
        </div>
      )}

      {/* Social Work Referral Modal Dialog */}
      <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refer to Social Work Department</DialogTitle>
            <DialogDescription>
              Log support referral requests to enroll patient in external housing, substance, or financial aid programs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-semibold">Social Program Category</Label>
              <select 
                id="category"
                value={refCategory} 
                onChange={e => setRefCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option>Psychosocial Support Groups</option>
                <option>Financial Assistance / Poverty Relief</option>
                <option>Housing Assistance & Safe-Houses</option>
                <option>Substance Abuse Rehabilitation Program</option>
                <option>Family Counseling & Integration</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="priority" className="text-xs font-semibold">Priority Level</Label>
              <select 
                id="priority"
                value={refPriority} 
                onChange={e => setRefPriority(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="refnotes" className="text-xs font-semibold">Referral Clinical Context <span className="text-red-500">*</span></Label>
              <Textarea 
                id="refnotes"
                placeholder="Describe why this referral is indicated and social determinants of health (SDOH) details..." 
                value={refNotes}
                onChange={e => setRefNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReferralModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateReferral} disabled={isSavingReferral || !refNotes.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSavingReferral && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Route to Social Work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
