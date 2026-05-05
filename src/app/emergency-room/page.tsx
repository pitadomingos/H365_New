"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Siren, 
  Clock, 
  UserPlus, 
  Stethoscope, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  Flame, 
  Bed, 
  Zap,
  TrendingDown,
  Monitor,
  HeartPulse,
  Syringe,
  ClipboardList,
  Search,
  Filter,
  MoreVertical,
  LifeBuoy
} from "lucide-react";
import { VitalsForm } from "@/components/clinical/vitals-form";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { toast } from "@/hooks/use-toast";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";

// --- Types ---
interface TriagePatient {
    id: string;
    name: string;
    age: number;
    gender: string;
    chiefComplaint: string;
    diagnosis?: string;
    triageLevel: "Critical" | "Urgent" | "Stable" | "Non-Urgent";
    arrivalType: "Ambulance" | "Walk-in";
    waitTime: string;
    vitals?: any;
}

interface ERBed {
  id: string;
  room: string;
  status: 'Occupied' | 'Available' | 'Cleaning' | 'Out of Order';
  patientId?: string;
  priority?: TriagePatient['triageLevel'];
}

// --- Mock Data ---
const MOCK_TRIAGE_QUEUE: TriagePatient[] = [
    { id: "ER-001", name: "John Smith", age: 45, gender: "Male", chiefComplaint: "Chest Pain / Shortness of Breath", triageLevel: "Critical", arrivalType: "Ambulance", waitTime: "2" },
    { id: "ER-002", name: "Maria Garcia", age: 32, gender: "Female", chiefComplaint: "Severe Abdominal Pain", triageLevel: "Urgent", arrivalType: "Walk-in", waitTime: "15" },
    { id: "ER-003", name: "David Wilson", age: 67, gender: "Male", chiefComplaint: "Possible Fracture (Left Leg)", triageLevel: "Stable", arrivalType: "Walk-in", waitTime: "40" },
    { id: "ER-004", name: "Ayesha Malik", age: 28, gender: "Female", chiefComplaint: "Allergic Reaction / Hives", triageLevel: "Urgent", arrivalType: "Walk-in", waitTime: "8" },
];

const MOCK_BEDS: ERBed[] = [
  { id: "B-101", room: "Resus-1", status: 'Occupied', patientId: "ER-001", priority: 'Critical' },
  { id: "B-102", room: "Resus-2", status: 'Available' },
  { id: "B-103", room: "Trauma-A", status: 'Occupied', patientId: "ER-002", priority: 'Urgent' },
  { id: "B-104", room: "Trauma-B", status: 'Cleaning' },
  { id: "B-105", room: "Observation-1", status: 'Available' },
  { id: "B-106", room: "Observation-2", status: 'Occupied', priority: 'Stable' },
  { id: "B-107", room: "Observation-3", status: 'Available' },
  { id: "B-108", room: "Fast Track-1", status: 'Available' },
];

export default function EmergencyRoomPage() {
    const { currentLocale } = useLocale();
    const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

    const [triageQueue, setTriageQueue] = useState<TriagePatient[]>(MOCK_TRIAGE_QUEUE);
    const [activeTriage, setActiveTriage] = useState<Partial<TriagePatient> | null>(null);
    const [vitalsData, setVitalsData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'queue' | 'beds'>('queue');

    const handleTriageSubmit = () => {
        if (!activeTriage?.name || !activeTriage?.chiefComplaint) {
            toast({ variant: "destructive", title: "Incomplete Triage", description: "Patient name and chief complaint are required." });
            return;
        }

        const newEntry: TriagePatient = {
            id: `ER-${Date.now()}`,
            name: activeTriage.name,
            age: parseInt(activeTriage.age?.toString() || "0"),
            gender: activeTriage.gender || "Unknown",
            chiefComplaint: activeTriage.chiefComplaint,
            diagnosis: activeTriage.diagnosis,
            triageLevel: vitalsData?.bpStatus === "Crisis" ? "Critical" : "Urgent",
            arrivalType: "Walk-in",
            waitTime: "0"
        };

        setTriageQueue([newEntry, ...triageQueue]);
        toast({ title: "Triage Completed", description: `${newEntry.name} added to ER queue.` });
        setActiveTriage(null);
        setVitalsData(null);
    };

    const stats = {
      waiting: triageQueue.length,
      occupancy: Math.round((MOCK_BEDS.filter(b => b.status === 'Occupied').length / MOCK_BEDS.length) * 100),
      criticalCount: triageQueue.filter(p => p.triageLevel === 'Critical').length + MOCK_BEDS.filter(b => b.priority === 'Critical').length,
      avgWait: "18m"
    };

    return (
        <div className="flex flex-col gap-6 p-1 md:p-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
                        <Siren className="h-8 w-8" /> {t('emergencyRoom.pageTitle')}
                    </h1>
                    <p className="text-muted-foreground italic flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Rapid assessment and life-saving intervention protocols.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" className="gap-2 hidden md:flex">
                        <Clock className="h-4 w-4" /> Shift Handover
                   </Button>
                   <Button className="bg-destructive hover:bg-destructive/90 gap-2 shadow-lg animate-pulse hover:animate-none" onClick={() => setActiveTriage({})}>
                        <UserPlus className="h-4 w-4" /> New Triage
                   </Button>
                </div>
            </header>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: t('emergencyRoom.triage.title'), value: stats.waiting, sub: t('emergencyRoom.triage.description'), icon: ClipboardList, color: "text-amber-600", trend: "Normal flow" },
                 { label: t('emergencyRoom.bedManagement.title'), value: `${stats.occupancy}%`, sub: `${MOCK_BEDS.filter(b => b.status === 'Available').length} beds available`, icon: Bed, color: "text-blue-600", trend: "+5% last hour" },
                 { label: "Critical Resuscitation", value: stats.criticalCount, sub: "Immediate attention required", icon: HeartPulse, color: "text-red-600", trend: "High Alert" },
                 { label: "Med Turnaround (TAT)", value: stats.avgWait, sub: "Door-to-doctor average", icon: TrendingDown, color: "text-green-600", trend: "-2m improved" },
               ].map((stat, idx) => (
                 <Card key={idx} className="border-l-4" style={{borderLeftColor: idx === 2 ? '#ef4444' : idx === 0 ? '#f59e0b' : '#3b82f6'}}>
                   <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                         </div>
                         <stat.icon className={cn("h-8 w-8 opacity-20", stat.color)} />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                         <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                         <Badge variant="outline" className="text-[10px] border-none bg-muted/50">{stat.trend}</Badge>
                      </div>
                   </CardContent>
                 </Card>
               ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Column: Queue & Map */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="shadow-md overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/30">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                               <div className="flex items-center gap-4">
                                  <button 
                                    onClick={() => setViewMode('queue')}
                                    className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${viewMode === 'queue' ? 'border-destructive text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                  >
                                    <ClipboardList className="h-4 w-4" /> Live Queue
                                  </button>
                                  <button 
                                    onClick={() => setViewMode('beds')}
                                    className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${viewMode === 'beds' ? 'border-destructive text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                  >
                                    <Bed className="h-4 w-4" /> Bed Management
                                  </button>
                               </div>
                               <div className="relative w-full md:w-64">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Search by name or ID..." 
                                    className="pl-8 h-9 text-xs" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                  />
                               </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <AnimatePresence mode="wait">
                            {viewMode === 'queue' ? (
                              <motion.div
                                key="queue"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="divide-y"
                              >
                                {triageQueue.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((patient) => (
                                  <div key={patient.id} className="p-4 hover:bg-muted/30 transition-all cursor-pointer group relative">
                                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex items-start gap-4">
                                           <div className={cn(
                                             "h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner",
                                             patient.triageLevel === "Critical" ? "bg-red-500 shadow-red-900/20" :
                                             patient.triageLevel === "Urgent" ? "bg-orange-500 shadow-orange-900/20" :
                                             patient.triageLevel === "Stable" ? "bg-blue-500 shadow-blue-900/20" : "bg-slate-400"
                                           )}>
                                             {patient.triageLevel[0]}
                                           </div>
                                           <div className="space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                 <h3 className="font-bold text-sm">{patient.name}</h3>
                                                 <Badge variant="outline" className="text-[10px] h-4">{patient.age}y / {patient.gender}</Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground italic">&quot;{patient.chiefComplaint}&quot;</p>
                                              <div className="flex items-center gap-3 mt-2">
                                                 <span className="text-[10px] flex items-center gap-1 text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                                                    <Clock className="h-3 w-3" /> Waiting: {patient.waitTime}m
                                                 </span>
                                                 <span className="text-[10px] flex items-center gap-1 text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold">
                                                    {patient.arrivalType}
                                                 </span>
                                              </div>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Button size="sm" variant="outline" className="h-8 text-xs">Vitals</Button>
                                           <Button size="sm" className={cn(
                                              "h-8 text-xs",
                                              patient.triageLevel === "Critical" ? "bg-red-600 hover:bg-red-700" : "bg-primary"
                                           )}>Assess</Button>
                                           <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                              <MoreVertical className="h-4 w-4" />
                                           </Button>
                                        </div>
                                     </div>
                                  </div>
                                ))}
                                {triageQueue.length === 0 && (
                                  <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                                     <ClipboardList className="h-12 w-12 opacity-20" />
                                     <p>No patients in triage queue</p>
                                  </div>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="beds"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                              >
                                {MOCK_BEDS.map((bed) => (
                                  <div 
                                    key={bed.id} 
                                    className={cn(
                                      "border-2 rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer relative overflow-hidden",
                                      bed.status === 'Available' ? "border-slate-100 bg-white hover:border-blue-400 hover:shadow-lg" : 
                                      bed.status === 'Occupied' ? (
                                        bed.priority === 'Critical' ? "border-red-200 bg-red-50/30" : "border-blue-100 bg-blue-50/20"
                                      ) : "border-slate-100 bg-slate-50 opacity-60"
                                    )}
                                  >
                                     <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{bed.room}</span>
                                        <div className={cn(
                                          "h-2 w-2 rounded-full",
                                          bed.status === 'Available' ? "bg-green-500" : 
                                          bed.status === 'Occupied' ? (bed.priority === 'Critical' ? "bg-red-600 animate-pulse" : "bg-blue-600") : "bg-slate-400"
                                        )} />
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Bed className={cn(
                                          "h-5 w-5",
                                          bed.status === 'Occupied' ? (bed.priority === 'Critical' ? "text-red-600" : "text-blue-600") : "text-slate-300"
                                        )} />
                                        <span className="font-bold text-sm tracking-tight">{bed.id}</span>
                                     </div>
                                     <div className="mt-1">
                                        {bed.status === 'Occupied' ? (
                                          <p className="text-[10px] font-medium text-foreground truncate">
                                            {bed.patientId ? `Patient: ${bed.patientId}` : "Patient Assigned"}
                                          </p>
                                        ) : (
                                          <p className="text-[10px] text-muted-foreground">{bed.status}</p>
                                        )}
                                     </div>
                                     {bed.status === 'Cleaning' && (
                                       <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center">
                                          <Clock className="h-6 w-6 text-slate-400 animate-spin-slow" />
                                       </div>
                                     )}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Resources & Protocols */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Card>
                          <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-blue-600" /> Equipment Readiness
                             </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             {[
                               { label: "Ventilators (ICU Class)", count: 2, total: 3, status: 'warning' },
                               { label: "Cardiac Defibrillators", count: 4, total: 4, status: 'ok' },
                               { label: "Portable Oxygen Cylinders", count: 12, total: 15, status: 'ok' },
                             ].map((equip, idx) => (
                               <div key={idx} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px]">
                                     <span className="font-medium">{equip.label}</span>
                                     <span className="text-muted-foreground">{equip.count}/{equip.total} Available</span>
                                  </div>
                                  <Progress 
                                    value={(equip.count / equip.total) * 100} 
                                    className={cn("h-1.5", equip.status === 'warning' ? "bg-amber-100 [&>div]:bg-amber-500" : "bg-blue-100 [&>div]:bg-blue-500")}
                                  />
                               </div>
                             ))}
                          </CardContent>
                       </Card>

                       <Card className="bg-slate-900 text-white border-none">
                          <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <LifeBuoy className="h-4 w-4 text-destructive" /> Emergency Protocols
                             </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                             <div className="grid grid-cols-2 divide-x divide-y divide-white/10">
                                {[
                                  { label: "ACS / CODE BLUE", icon: HeartPulse, color: "text-red-500" },
                                  { label: "SEPSIS BUNDLE", icon: Activity, color: "text-amber-500" },
                                  { label: "TRAUMA LEVEL 1", icon: Siren, color: "text-blue-500" },
                                  { label: "RAPID INTUBATION", icon: Zap, color: "text-purple-500" },
                                ].map((protocol, idx) => (
                                  <button key={idx} className="p-4 flex flex-col items-center gap-2 hover:bg-white/5 transition-colors group">
                                     <protocol.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", protocol.color)} />
                                     <span className="text-[10px] font-bold tracking-wider">{protocol.label}</span>
                                  </button>
                                ))}
                             </div>
                          </CardContent>
                       </Card>
                    </div>
                </div>

                {/* Right Column: Triage Workflow / Form */}
                <div className="lg:col-span-4 space-y-6">
                    {activeTriage ? (
                         <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                             <Card className="shadow-lg border-destructive/20 sticky top-20">
                                <CardHeader className="bg-destructive/10">
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <Stethoscope className="h-6 w-6" /> Triage Intake
                                    </CardTitle>
                                    <CardDescription className="text-destructive/70">Secure real-time entry. Fields are critical.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Patient Full Name / Unknown ID</Label>
                                            <Input 
                                                placeholder="Legal name or description" 
                                                value={activeTriage.name || ""} 
                                                onChange={(e) => setActiveTriage({...activeTriage, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                              <Label className="text-xs">Est. Age</Label>
                                              <Input 
                                                  type="number" 
                                                  value={activeTriage.age || ""} 
                                                  onChange={(e) => setActiveTriage({...activeTriage, age: parseInt(e.target.value)})}
                                              />
                                          </div>
                                          <div className="space-y-2">
                                              <Label className="text-xs">Gender</Label>
                                              <Select onValueChange={(val) => setActiveTriage({...activeTriage, gender: val})}>
                                                <SelectTrigger className="h-10">
                                                  <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="Male">Male</SelectItem>
                                                  <SelectItem value="Female">Female</SelectItem>
                                                  <SelectItem value="Other">Other</SelectItem>
                                                  <SelectItem value="Unknown">Unknown</SelectItem>
                                                </SelectContent>
                                              </Select>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Chief Complaint</Label>
                                            <Input 
                                                placeholder="e.g., Chest Pain, Trauma" 
                                                value={activeTriage.chiefComplaint || ""} 
                                                onChange={(e) => setActiveTriage({...activeTriage, chiefComplaint: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <VitalsForm 
                                        compact
                                        title="Rapid Vitals" 
                                        onVitalsChange={setVitalsData}
                                    />

                                    <AIAssistantPanel 
                                      condensed
                                      department="Emergency Room"
                                      patientData={{ ...activeTriage, vitals: vitalsData }}
                                      onAcceptSuggestion={(suggestion) => {
                                          setActiveTriage(prev => ({ ...prev, diagnosis: suggestion }));
                                          toast({ title: "AI Suggestion Accepted", description: "Triage impression updated." });
                                      }}
                                    />
                                </CardContent>
                                <CardFooter className="flex-col gap-2 border-t pt-4">
                                    <Button className="w-full bg-destructive hover:bg-destructive/90 h-11 text-md font-bold" onClick={handleTriageSubmit}>
                                        Assign Priority & Admit
                                    </Button>
                                    <Button variant="ghost" className="w-full text-xs h-8" onClick={() => setActiveTriage(null)}>Abort Intake</Button>
                                </CardFooter>
                             </Card>
                         </div>
                    ) : (
                        <div className="space-y-6">
                           <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
                              <CardContent className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                                 <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Flame className="h-10 w-10 text-destructive animate-bounce" />
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Awaiting Critical Intake</h3>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">Perform rapid triage for arriving emergencies.</p>
                                 </div>
                                 <Button 
                                    className="bg-destructive hover:bg-destructive/90 font-bold px-8 h-12 shadow-md hover:shadow-destructive/20 transition-all border-b-4 border-destructive/90 active:border-b-0 active:translate-y-1"
                                    onClick={() => setActiveTriage({})}
                                 >
                                    <AlertTriangle className="mr-2 h-5 w-5" /> START TRIAGE
                                 </Button>
                              </CardContent>
                           </Card>

                           <Card>
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    ER Notifications
                                    <Badge variant="outline" className="text-[10px]">3 New</Badge>
                                 </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                 {[
                                   { msg: "Ambulance ETA 4m: Trauma (MVA)", type: "critical" },
                                   { msg: "Lab Result Ready: Patient ER-001 (Troponin High)", type: "alert" },
                                   { msg: "Bed B-104 is now ready for admission.", type: "system" },
                                 ].map((notif, i) => (
                                   <div key={i} className={cn(
                                     "p-2.5 rounded border text-[11px] leading-tight flex items-start gap-2",
                                     notif.type === 'critical' ? "bg-red-50 border-red-200 text-red-900" :
                                     notif.type === 'alert' ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-blue-50 border-blue-200 text-blue-900"
                                   )}>
                                      <div className={cn(
                                        "h-1.5 w-1.5 rounded-full mt-1 shrink-0",
                                        notif.type === 'critical' ? "bg-red-600" : notif.type === 'alert' ? "bg-amber-600" : "bg-blue-600"
                                      )} />
                                      {notif.msg}
                                   </div>
                                 ))}
                              </CardContent>
                           </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper components for the ER
function Select({ children, onValueChange }: { children: React.ReactNode, onValueChange: (val: string) => void }) {
  return (
    <div className="relative">
      <select 
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
      >
        {children}
      </select>
    </div>
  );
}

function SelectTrigger({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}

function SelectValue({ placeholder }: { placeholder: string }) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SelectItem({ value, children }: { value: string, children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}
