"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Siren, Clock, UserPlus, Stethoscope, AlertTriangle, ChevronRight, Activity, Flame } from "lucide-react";
import { VitalsForm } from "@/components/clinical/vitals-form";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { toast } from "@/hooks/use-toast";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { cn } from "@/lib/utils";

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
}

const mockTriageQueue: TriagePatient[] = [
    { id: "ER-001", name: "John Smith", age: 45, gender: "Male", chiefComplaint: "Chest Pain / Shortness of Breath", triageLevel: "Critical", arrivalType: "Ambulance", waitTime: "2 mins" },
    { id: "ER-002", name: "Maria Garcia", age: 32, gender: "Female", chiefComplaint: "Severe Abdominal Pain", triageLevel: "Urgent", arrivalType: "Walk-in", waitTime: "15 mins" },
    { id: "ER-003", name: "David Wilson", age: 67, gender: "Male", chiefComplaint: "Possible Fracture (Left Leg)", triageLevel: "Stable", arrivalType: "Walk-in", waitTime: "40 mins" },
];

export default function EmergencyRoomPage() {
    const { currentLocale } = useLocale();
    const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

    const [triageQueue, setTriageQueue] = useState<TriagePatient[]>(mockTriageQueue);
    const [activeTriage, setActiveTriage] = useState<Partial<TriagePatient> | null>(null);
    const [vitalsData, setVitalsData] = useState<any>(null);

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
            waitTime: "0 mins"
        };

        setTriageQueue([newEntry, ...triageQueue]);
        toast({ title: "Triage Completed", description: `${newEntry.name} added to ER queue.` });
        setActiveTriage(null);
        setVitalsData(null);
    };

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
                        <Siren className="h-8 w-8" /> {t('emergencyRoom.pageTitle')}
                    </h1>
                    <p className="text-muted-foreground italic">Rapid assessment and life-saving intervention protocols.</p>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" className="gap-2">
                        <Clock className="h-4 w-4" /> Shift Handover
                   </Button>
                   <Button className="bg-destructive hover:bg-destructive/90 gap-2" onClick={() => setActiveTriage({})}>
                        <UserPlus className="h-4 w-4" /> New Triage
                   </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Triage Queue */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-md border-t-4 border-t-destructive">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                Live Triage Queue
                                <Badge variant="secondary">{triageQueue.length} Active</Badge>
                            </CardTitle>
                            <CardDescription>Patients awaiting assessment</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="max-h-[600px] overflow-y-auto px-6 space-y-3">
                                {triageQueue.map((patient) => (
                                    <div key={patient.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm bg-background border-l-4" style={{ borderLeftColor: patient.triageLevel === "Critical" ? "#ef4444" : patient.triageLevel === "Urgent" ? "#f97316" : "#3b82f6" }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge className={cn(
                                                "text-[10px] uppercase",
                                                patient.triageLevel === "Critical" ? "bg-red-500 hover:bg-red-600" :
                                                patient.triageLevel === "Urgent" ? "bg-orange-500 hover:bg-orange-600" :
                                                "bg-blue-500 hover:bg-blue-600"
                                            )}>
                                                {patient.triageLevel}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono">{patient.waitTime} ago</span>
                                        </div>
                                        <h3 className="font-bold text-sm">{patient.name} ({patient.age}y, {patient.gender})</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 italic">
                                            &quot;{patient.chiefComplaint}&quot;
                                        </p>
                                        <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] uppercase font-bold text-primary">Assess Patient</span>
                                            <ChevronRight className="h-3 w-3 text-primary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Triage Workflow / Active Form */}
                <div className="lg:col-span-8 space-y-6">
                    {activeTriage ? (
                         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <Card className="shadow-lg border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-6 w-6 text-primary" /> Initial Triage Assessment
                                    </CardTitle>
                                    <CardDescription>Rapid intake protocol for arriving patients.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-4 border-b pb-6">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input 
                                                placeholder="Legal ID Name" 
                                                value={activeTriage.name || ""} 
                                                onChange={(e) => setActiveTriage({...activeTriage, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Estimated Age</Label>
                                            <Input 
                                                type="number" 
                                                value={activeTriage.age || ""} 
                                                onChange={(e) => setActiveTriage({...activeTriage, age: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Chief Complaint</Label>
                                            <Input 
                                                placeholder="e.g., Chest Pain, Trauma" 
                                                value={activeTriage.chiefComplaint || ""} 
                                                onChange={(e) => setActiveTriage({...activeTriage, chiefComplaint: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-dashed">
                                        <Label className="font-bold flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary"/> Clinical Triage Diagnosis / Impression</Label>
                                        <Input 
                                            placeholder="Suspected condition (e.g. Myocardial Infarction)" 
                                            value={activeTriage.diagnosis || ""} 
                                            onChange={(e) => setActiveTriage({...activeTriage, diagnosis: e.target.value})}
                                            className="bg-background"
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">Provide a preliminary diagnosis based on initial assessment and vitals.</p>
                                    </div>

                                    <VitalsForm 
                                        title="Initial Triage Vitals" 
                                        description="Required for priority sorting (ESI Level Calculation)"
                                        onVitalsChange={setVitalsData}
                                    />
                                </CardContent>
                                <CardFooter className="justify-between border-t py-4">
                                    <Button variant="ghost" onClick={() => setActiveTriage(null)}>Discard</Button>
                                    <Button className="bg-destructive hover:bg-destructive/90" onClick={handleTriageSubmit}>
                                        Complete Triage Entry
                                    </Button>
                                </CardFooter>
                             </Card>

                             <AIAssistantPanel 
                                department="Emergency Room"
                                patientData={{ ...activeTriage, vitals: vitalsData }}
                                onAcceptSuggestion={(suggestion) => {
                                    setActiveTriage(prev => ({ ...prev, diagnosis: suggestion }));
                                    toast({ title: "AI Suggestion Accepted", description: "Diagnosis updated with AI recommendation." });
                                }}
                             />
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-muted/30 border-2 border-dashed rounded-2xl gap-5">
                            <div className="p-8 bg-background rounded-full shadow-md ring-1 ring-border relative">
                                <Activity className="h-14 w-14 text-muted-foreground animate-pulse" />
                                <div className="absolute -top-1 -right-1">
                                    <Flame className="h-6 w-6 text-destructive animate-bounce" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">Waiting for Triage</h2>
                                <p className="text-muted-foreground max-w-sm">
                                    Assess incoming patients immediately to ensure critical cases are prioritized.
                                </p>
                            </div>
                            <Button size="lg" className="mt-4 bg-destructive hover:bg-destructive/90 px-8 h-12 text-md transition-transform active:scale-95" onClick={() => setActiveTriage({})}>
                                <AlertTriangle className="mr-2 h-5 w-5" /> Urgent Admission
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
