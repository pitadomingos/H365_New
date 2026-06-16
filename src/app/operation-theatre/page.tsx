"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Calendar, Clock, User, AlertCircle, CheckCircle2, ShieldCheck, Loader2, ClipboardCheck, Thermometer, Activity, History as HistoryIcon, Siren, Users, Plus, CheckSquare, Square, HeartPulse } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LocalDB } from '@/lib/db';

interface WhoChecklist {
  signIn: {
    identityConfirmed: boolean;
    siteMarked: boolean;
    anesthesiaCheck: boolean;
    pulseOximeter: boolean;
  };
  timeOut: {
    teamIntroduced: boolean;
    verbalConfirmation: boolean;
    criticalEventsReviewed: boolean;
    antibioticsGiven: boolean;
  };
  signOut: {
    procedureRecorded: boolean;
    countsCorrect: boolean;
    specimenLabeled: boolean;
    equipmentChecked: boolean;
    recoveryReviewed: boolean;
  };
  isFinalized: boolean;
}

interface SurgeryRecord {
  id: string;
  patientName: string;
  procedure: string;
  surgeon: string;
  anesthetist: string;
  time: string;
  status: "Scheduled" | "Pre-Op Prep" | "In Progress" | "Completed";
  progress: number;
  room: string;
  checklist: WhoChecklist;
}

const DEFAULT_SURGERIES: SurgeryRecord[] = [
  { 
    id: "SURG-001", 
    patientName: "Graciela Tembanne", 
    procedure: "Laparoscopic Appendectomy", 
    surgeon: "Dr. Mutale", 
    anesthetist: "Dr. Phiri",
    time: "09:00 AM", 
    status: "In Progress", 
    progress: 65,
    room: "OT 1",
    checklist: {
      signIn: { identityConfirmed: true, siteMarked: true, anesthesiaCheck: true, pulseOximeter: true },
      timeOut: { teamIntroduced: true, verbalConfirmation: true, criticalEventsReviewed: false, antibioticsGiven: true },
      signOut: { procedureRecorded: false, countsCorrect: false, specimenLabeled: false, equipmentChecked: false, recoveryReviewed: false },
      isFinalized: false
    }
  },
  { 
    id: "SURG-002", 
    patientName: "Alice Mwamba", 
    procedure: "C-Section (Emergency)", 
    surgeon: "Dr. Santos", 
    anesthetist: "Dr. Phiri",
    time: "10:30 AM", 
    status: "Pre-Op Prep", 
    progress: 15,
    room: "OT 2",
    checklist: {
      signIn: { identityConfirmed: true, siteMarked: true, anesthesiaCheck: false, pulseOximeter: false },
      timeOut: { teamIntroduced: false, verbalConfirmation: false, criticalEventsReviewed: false, antibioticsGiven: false },
      signOut: { procedureRecorded: false, countsCorrect: false, specimenLabeled: false, equipmentChecked: false, recoveryReviewed: false },
      isFinalized: false
    }
  },
  { 
    id: "SURG-003", 
    patientName: "Emmanuel Phiri", 
    procedure: "Hernia Repair", 
    surgeon: "Dr. Mutale", 
    anesthetist: "Dr. Langa",
    time: "01:00 PM", 
    status: "Scheduled", 
    progress: 0,
    room: "OT 1",
    checklist: {
      signIn: { identityConfirmed: false, siteMarked: false, anesthesiaCheck: false, pulseOximeter: false },
      timeOut: { teamIntroduced: false, verbalConfirmation: false, criticalEventsReviewed: false, antibioticsGiven: false },
      signOut: { procedureRecorded: false, countsCorrect: false, specimenLabeled: false, equipmentChecked: false, recoveryReviewed: false },
      isFinalized: false
    }
  }
];

export default function OperationTheatrePage() {
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryRecord | null>(null);

  // Scheduling Form State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedName, setSchedName] = useState("");
  const [schedProcedure, setSchedProcedure] = useState("");
  const [schedSurgeon, setSchedSurgeon] = useState("");
  const [schedAnesthetist, setSchedAnesthetist] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedRoom, setSchedRoom] = useState("OT 1");
  const [isScheduling, setIsScheduling] = useState(false);

  const loadData = async () => {
    const list = await LocalDB.get<SurgeryRecord[]>("scheduled_surgeries", DEFAULT_SURGERIES);
    setSurgeries(list);
    if (list.length > 0) {
      setSelectedSurgery(list[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleSurgery = async () => {
    if (!schedName || !schedProcedure || !schedSurgeon || !schedTime) return;
    setIsScheduling(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSurgery: SurgeryRecord = {
      id: `SURG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      patientName: schedName,
      procedure: schedProcedure,
      surgeon: schedSurgeon,
      anesthetist: schedAnesthetist || "Dr. TBD",
      time: schedTime,
      status: "Scheduled",
      progress: 0,
      room: schedRoom,
      checklist: {
        signIn: { identityConfirmed: false, siteMarked: false, anesthesiaCheck: false, pulseOximeter: false },
        timeOut: { teamIntroduced: false, verbalConfirmation: false, criticalEventsReviewed: false, antibioticsGiven: false },
        signOut: { procedureRecorded: false, countsCorrect: false, specimenLabeled: false, equipmentChecked: false, recoveryReviewed: false },
        isFinalized: false
      }
    };

    const updatedList = [...surgeries, newSurgery];
    await LocalDB.save("scheduled_surgeries", updatedList);
    setSurgeries(updatedList);
    setSelectedSurgery(newSurgery);

    toast({
      title: "Surgery Scheduled",
      description: `Lined up ${schedProcedure} for ${schedName} successfully.`
    });

    setIsScheduling(false);
    setIsScheduleModalOpen(false);
    setSchedName("");
    setSchedProcedure("");
    setSchedSurgeon("");
    setSchedAnesthetist("");
    setSchedTime("");
  };

  const updateChecklistItem = async (
    phase: "signIn" | "timeOut" | "signOut",
    key: string,
    value: boolean
  ) => {
    if (!selectedSurgery) return;

    // Deep clone the checklist and mutate value
    const updatedChecklist = { ...selectedSurgery.checklist };
    (updatedChecklist[phase] as any)[key] = value;

    // Check if everything is done to finalize
    const allSignInChecked = Object.values(updatedChecklist.signIn).every(Boolean);
    const allTimeOutChecked = Object.values(updatedChecklist.timeOut).every(Boolean);
    const allSignOutChecked = Object.values(updatedChecklist.signOut).every(Boolean);

    updatedChecklist.isFinalized = allSignInChecked && allTimeOutChecked && allSignOutChecked;

    // Dynamic progress bar calculation
    let progress = 0;
    if (updatedChecklist.isFinalized) progress = 100;
    else if (allTimeOutChecked) progress = 85;
    else if (allSignInChecked) progress = 40;
    else progress = 15;

    const updatedSurgery: SurgeryRecord = {
      ...selectedSurgery,
      progress,
      status: updatedChecklist.isFinalized ? "Completed" : progress >= 85 ? "In Progress" : "Pre-Op Prep",
      checklist: updatedChecklist
    };

    const updatedList = surgeries.map(s => s.id === selectedSurgery.id ? updatedSurgery : s);
    await LocalDB.save("scheduled_surgeries", updatedList);
    setSurgeries(updatedList);
    setSelectedSurgery(updatedSurgery);
  };

  const isSignInCompleted = selectedSurgery
    ? Object.values(selectedSurgery.checklist.signIn).every(Boolean)
    : false;

  const isTimeOutCompleted = selectedSurgery
    ? Object.values(selectedSurgery.checklist.timeOut).every(Boolean)
    : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Scissors className="h-8 w-8 text-indigo-600 animate-pulse" /> Operation Theatre (OT) Console
          </h1>
          <p className="text-muted-foreground text-sm">
            Digital perioperative planning board, active surgical scheduling, and WHO safety checklists.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Schedule Procedure
          </Button>
          <Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
            <Siren className="h-4 w-4 animate-bounce" /> Emergency OT Override
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Surgical Schedule list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-100 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Today&apos;s Surgery Board</CardTitle>
                <CardDescription>Visual list of scheduled and active operating procedures.</CardDescription>
              </div>
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                {surgeries.length} Procedures Boarded
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time / Room</TableHead>
                    <TableHead>Patient / Procedure</TableHead>
                    <TableHead>Surgical Team</TableHead>
                    <TableHead>Checklist Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surgeries.map((s) => (
                    <TableRow 
                      key={s.id} 
                      className={`cursor-pointer transition-colors ${selectedSurgery?.id === s.id ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/10'}`} 
                      onClick={() => setSelectedSurgery(s)}
                    >
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-bold flex items-center gap-1"><Clock className="h-3 w-3 text-indigo-600" /> {s.time}</span>
                          <span className="text-xs text-muted-foreground font-semibold">{s.room}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold">{s.patientName}</span>
                          <span className="text-xs text-indigo-600 font-bold">{s.procedure}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>Surg: {s.surgeon}</div>
                        <div>Anes: {s.anesthetist}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 max-w-[120px]">
                          <Badge variant={s.status === "Completed" ? "default" : s.status === "In Progress" ? "default" : "outline"} className={s.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : s.status === "In Progress" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}>
                            {s.status}
                          </Badge>
                          {s.progress > 0 && <Progress value={s.progress} className="h-1.5" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Active Surgery Details & WHO safety checks */}
          {selectedSurgery && (
            <Tabs defaultValue="safety" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="safety" className="gap-2"><ShieldCheck className="h-4 w-4" /> WHO Surgical Safety Checklist</TabsTrigger>
                <TabsTrigger value="vitals" className="gap-2"><Activity className="h-4 w-4" /> Perioperative Vitals</TabsTrigger>
              </TabsList>

              <TabsContent value="safety" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">WHO Safety Audit Trail</CardTitle>
                        <CardDescription>Surgical Verification for: <strong>{selectedSurgery.patientName}</strong> ({selectedSurgery.procedure})</CardDescription>
                      </div>
                      {selectedSurgery.checklist.isFinalized ? (
                        <Badge className="bg-emerald-500 text-white flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Safety Signed Out</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Checklist Incomplete</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Phase 1: SIGN IN */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600">Phase 1: SIGN IN (Before Induction)</h4>
                        {isSignInCompleted && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Sign-in Complete</span>}
                      </div>
                      <div className="grid gap-2 text-sm">
                        {[
                          { key: "identityConfirmed", label: "Identity, surgical site, procedure, and consent verified with patient?" },
                          { key: "siteMarked", label: "Surgical site marked appropriately?" },
                          { key: "anesthesiaCheck", label: "Anesthesia system, drugs, and monitors checked?" },
                          { key: "pulseOximeter", label: "Pulse oximeter on patient and actively functioning?" }
                        ].map((chk) => (
                          <button
                            key={chk.key}
                            onClick={() => updateChecklistItem("signIn", chk.key, !(selectedSurgery.checklist.signIn as any)[chk.key])}
                            className="flex items-center gap-3 text-left py-1 hover:text-indigo-600"
                          >
                            {(selectedSurgery.checklist.signIn as any)[chk.key] ? (
                              <CheckSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400 shrink-0" />
                            )}
                            <span>{chk.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Phase 2: TIME OUT */}
                    <div className={`p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border space-y-3 transition-opacity ${isSignInCompleted ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600">Phase 2: TIME OUT (Before Skin Incision)</h4>
                        {isTimeOutCompleted && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Time-out Complete</span>}
                      </div>
                      {!isSignInCompleted && <p className="text-[10px] text-amber-600 font-bold">Requires completion of Sign In phase above.</p>}
                      <div className="grid gap-2 text-sm">
                        {[
                          { key: "teamIntroduced", label: "Confirm all team members introduced themselves by name and role?" },
                          { key: "verbalConfirmation", label: "Surgeon, anesthetist and nurse verbally confirm patient, site, and procedure?" },
                          { key: "criticalEventsReviewed", label: "Anticipated critical steps, blood loss, and anesthesia concerns reviewed?" },
                          { key: "antibioticsGiven", label: "Antibiotic prophylaxis administered in the last 60 minutes?" }
                        ].map((chk) => (
                          <button
                            key={chk.key}
                            disabled={!isSignInCompleted}
                            onClick={() => updateChecklistItem("timeOut", chk.key, !(selectedSurgery.checklist.timeOut as any)[chk.key])}
                            className="flex items-center gap-3 text-left py-1 hover:text-indigo-600"
                          >
                            {(selectedSurgery.checklist.timeOut as any)[chk.key] ? (
                              <CheckSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400 shrink-0" />
                            )}
                            <span>{chk.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Phase 3: SIGN OUT */}
                    <div className={`p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border space-y-3 transition-opacity ${isTimeOutCompleted ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600">Phase 3: SIGN OUT (Before Patient Leaves Room)</h4>
                      {!isTimeOutCompleted && <p className="text-[10px] text-amber-600 font-bold">Requires completion of Time Out phase above.</p>}
                      <div className="grid gap-2 text-sm">
                        {[
                          { key: "procedureRecorded", label: "Name of the procedure recorded?" },
                          { key: "countsCorrect", label: "Instrument, sponge, and needle counts are confirmed correct?" },
                          { key: "specimenLabeled", label: "Surgical specimens labeled correctly (including patient identifier)?" },
                          { key: "equipmentChecked", label: "Any equipment problems logged and flagged to biomedical engineering?" },
                          { key: "recoveryReviewed", label: "Surgeon, anesthetist and nurse review key concerns for recovery and management?" }
                        ].map((chk) => (
                          <button
                            key={chk.key}
                            disabled={!isTimeOutCompleted}
                            onClick={() => updateChecklistItem("signOut", chk.key, !(selectedSurgery.checklist.signOut as any)[chk.key])}
                            className="flex items-center gap-3 text-left py-1 hover:text-indigo-600"
                          >
                            {(selectedSurgery.checklist.signOut as any)[chk.key] ? (
                              <CheckSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400 shrink-0" />
                            )}
                            <span>{chk.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Perioperative Vitals Tab */}
              <TabsContent value="vitals" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Realtime Intramural Vitals Feed</CardTitle>
                    <CardDescription>Live stats from theater monitoring devices.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-6 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex flex-col items-center">
                        <HeartPulse className="h-8 w-8 text-rose-500 animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground mt-2">Heart Rate</span>
                        <span className="text-2xl font-black mt-1">82 bpm</span>
                      </div>
                      <div className="flex flex-col items-center border-x px-12">
                        <Activity className="h-8 w-8 text-sky-500" />
                        <span className="text-xs font-bold text-muted-foreground mt-2">SpO2 Sat</span>
                        <span className="text-2xl font-black mt-1">98%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Thermometer className="h-8 w-8 text-amber-500" />
                        <span className="text-xs font-bold text-muted-foreground mt-2">Core Temp</span>
                        <span className="text-2xl font-black mt-1">36.7 °C</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* OT Resource Status and Active Staff panels */}
        <div className="space-y-6">
          <Card className="bg-indigo-900 text-indigo-50 shadow-sm border-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-indigo-200" /> OT Resource Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
                <span>OT 1 (General Main)</span>
                <Badge className="bg-rose-500 text-white border-none">Occupied</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
                <span>OT 2 (Maternity / Obstetrics)</span>
                <Badge className="bg-amber-500 text-white border-none">Pre-Op Prep</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
                <span>OT 3 (Minor Ambulatory)</span>
                <Badge className="bg-emerald-500 text-white border-none">Available</Badge>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-indigo-200">Main Oxygen Storage</span>
                <span className="font-bold">96% Capacity</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" /> On-Call Surgical Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Dr. Mutale", role: "Chief General Surgeon", OT: "OT 1" },
                { name: "Dr. Santos", role: "Obstetrics Specialist", OT: "OT 2" },
                { name: "Dr. Phiri", role: "Senior Anesthesiologist", OT: "OT 1 & 2" }
              ].map((staff, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{staff.name}</p>
                    <p className="text-muted-foreground">{staff.role}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{staff.OT}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Surgery Scheduling Modal Dialog */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Operating Procedure</DialogTitle>
            <DialogDescription>
              Assign surgical resources, rooms, and clinical teams to the operating board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="space-y-1">
              <Label htmlFor="patient" className="text-xs font-semibold">Patient Name <span className="text-red-500">*</span></Label>
              <Input 
                id="patient" 
                placeholder="Enter patient full name..." 
                value={schedName} 
                onChange={e => setSchedName(e.target.value)} 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="procedure" className="text-xs font-semibold">Surgical Procedure <span className="text-red-500">*</span></Label>
              <Input 
                id="procedure" 
                placeholder="e.g. Open Cholecystectomy" 
                value={schedProcedure} 
                onChange={e => setSchedProcedure(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="surgeon" className="text-xs font-semibold">Lead Surgeon <span className="text-red-500">*</span></Label>
                <Input 
                  id="surgeon" 
                  placeholder="e.g. Dr. Mutale" 
                  value={schedSurgeon} 
                  onChange={e => setSchedSurgeon(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="anesthetist" className="text-xs font-semibold">Anesthetist</Label>
                <Input 
                  id="anesthetist" 
                  placeholder="e.g. Dr. Phiri" 
                  value={schedAnesthetist} 
                  onChange={e => setSchedAnesthetist(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="time" className="text-xs font-semibold">Scheduled Time <span className="text-red-500">*</span></Label>
                <Input 
                  id="time" 
                  placeholder="e.g. 02:30 PM" 
                  value={schedTime} 
                  onChange={e => setSchedTime(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="room" className="text-xs font-semibold">Operating Theater Room</Label>
                <select 
                  id="room"
                  value={schedRoom} 
                  onChange={e => setSchedRoom(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option>OT 1</option>
                  <option>OT 2</option>
                  <option>OT 3 (Minor)</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleSurgery} disabled={isScheduling || !schedName || !schedProcedure || !schedSurgeon || !schedTime} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isScheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Room & Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
