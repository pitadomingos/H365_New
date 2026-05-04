"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Phone, MessageSquare, User, Activity, Sparkles, Plus, Mic, VideoOff, MicOff, MoreVertical, Stethoscope } from "lucide-react";
import { VitalsForm } from "@/components/clinical/vitals-form";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function TelemedicinePage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [activeSession, setActiveSession] = useState<{ name: string; age: string, complaint: string, diagnosis: string, prescription: string } | null>({
    name: "John Doe",
    age: "45",
    complaint: "Persistent cough and low-grade fever for 3 days.",
    diagnosis: "",
    prescription: ""
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" /> {t('telemedicine.pageTitle')}
          </h1>
          <p className="text-muted-foreground italic">Remote consultation and digital patient monitoring platform.</p>
        </div>
        <Button className="gap-2">
            <Plus className="h-4 w-4" /> Start New Consult
        </Button>
      </header>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="bg-black/90 dark:bg-black aspect-video relative overflow-hidden group shadow-2xl rounded-2xl border-none">
              {isVideoOn ? (
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/doctor/1280/720')] bg-cover bg-center opacity-60 flex items-center justify-center">
                    <p className="text-white/50 text-sm italic">Encrypted Video Feed Active</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-10 bg-muted/20 rounded-full">
                        <VideoOff className="h-20 w-20 text-white/20" />
                    </div>
                </div>
              )}

              {/* Smaller self-view */}
              <div className="absolute top-4 right-4 w-48 aspect-video bg-muted border border-white/10 rounded-lg overflow-hidden shadow-lg shadow-black/50 overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/patient/320/180')] bg-cover bg-center shrink-0" />
              </div>

              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 transition-transform hover:scale-105 duration-300">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("rounded-full h-12 w-12 text-white hover:bg-white/10", !isMicOn && "bg-destructive hover:bg-destructive/90")}
                    onClick={() => setIsMicOn(!isMicOn)}
                 >
                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                 </Button>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("rounded-full h-12 w-12 text-white hover:bg-white/10", !isVideoOn && "bg-destructive hover:bg-destructive/90")}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                 >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                 </Button>
                 <Button variant="destructive" className="rounded-full px-6 h-12 font-bold uppercase tracking-wider shadow-lg shadow-destructive/20">
                    End Call
                 </Button>
                 <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 text-white hover:bg-white/10">
                    <MoreVertical className="h-5 w-5" />
                 </Button>
              </div>

              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                 <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 backdrop-blur-md">
                    <Activity className="h-3 w-3 mr-1 animate-pulse" /> Live connection
                 </Badge>
              </div>
           </Card>

           <div className="grid md:grid-cols-2 gap-6">
              <VitalsForm 
                title="Remote Vitals (Patient Reported/Verified)"
                description="Assisting triage decisions from distance."
              />
              <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" /> Consult Chat
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[150px] overflow-y-auto space-y-3 mb-4 text-sm bg-muted/30 p-3 rounded-lg border border-dashed">
                        <div className="flex gap-2">
                            <span className="font-bold shrink-0 text-primary uppercase text-[10px]">MD:</span>
                            <p>Good morning John, how can I help you today?</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold shrink-0 text-muted-foreground uppercase text-[10px]">PT:</span>
                            <p>I&apos;ve been feeling short of breath lately, especially at night.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Type message..." className="bg-background" />
                        <Button size="icon"><MessageSquare className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
              </Card>
           </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-md">
                        <User className="h-5 w-5 text-primary" /> Patient Metadata
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{activeSession?.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Age:</span>
                        <span className="font-semibold">{activeSession?.age}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Reason for Consultation:</span>
                        <p className="italic bg-muted/50 p-2 rounded border border-dashed text-xs">
                          {activeSession?.complaint}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full text-xs">Access Full Electronic History</Button>
                </CardFooter>
            </Card>

            <AIAssistantPanel 
                department="Telemedicine"
                patientData={activeSession}
                context="Remote analysis of patient reported symptoms and live vitals."
                onAcceptSuggestion={(suggestion) => {
                    setActiveSession(prev => prev ? ({ ...prev, diagnosis: suggestion }) : null);
                    toast({ title: "AI Suggestion Accepted", description: "Diagnosis updated for this session." });
                }}
            />

            <Card className="shadow-sm border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-md">
                        <Stethoscope className="h-5 w-5 text-primary" /> clinical Outcome
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="tele-diagnosis" className="text-xs font-bold">Formal Diagnosis <span className="text-destructive">*</span></Label>
                        <Textarea 
                            id="tele-diagnosis" 
                            placeholder="Enter formal diagnosis..." 
                            className="text-xs bg-background"
                            value={activeSession?.diagnosis || ""}
                            onChange={(e) => setActiveSession(prev => prev ? ({...prev, diagnosis: e.target.value}) : null)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tele-prescription" className="text-xs font-bold">Prescription / Orders <span className="text-destructive">*</span></Label>
                        <Textarea 
                            id="tele-prescription" 
                            placeholder="Dosage, instructions..." 
                            className="text-xs bg-background"
                            value={activeSession?.prescription || ""}
                            onChange={(e) => setActiveSession(prev => prev ? ({...prev, prescription: e.target.value}) : null)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={!activeSession?.diagnosis || !activeSession?.prescription}>
                        Finalize & Sign Consult
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                         <Sparkles className="h-4 w-4" /> Tele-Specialist Network
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-xs text-blue-800/70 dark:text-blue-300/70 leading-relaxed">
                        Need a second opinion? You can invite a cardiologist or specialist from the national network to this call.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-xs text-blue-700 font-bold border-b border-blue-700 border-dotted">
                        Invite Consultant
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
