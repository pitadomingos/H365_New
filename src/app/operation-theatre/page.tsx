"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Calendar, Clock, User, AlertCircle, CheckCircle2, ShieldCheck, Loader2, ClipboardCheck, Thermometer, Activity, History as HistoryIcon, Siren } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

const MOCK_SURGERIES = [
  { 
    id: "SURG-001", 
    patientName: "Graciela Tembanne", 
    procedure: "Laparoscopic Appendectomy", 
    surgeon: "Dr. Mutale", 
    anesthetist: "Dr. Phiri",
    time: "09:00 AM", 
    status: "In Progress", 
    progress: 65,
    room: "OT 1"
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
    room: "OT 2"
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
    room: "OT 1"
  }
];

export default function OperationTheatrePage() {
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);
  
  const handleStartChecklist = () => {
    toast({
      title: "Surgical Safety Checklist",
      description: "WHO Checklist initialized for the current procedure.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" /> Operation Theatre (OT)
          </h1>
          <p className="text-muted-foreground">
            Surgical scheduling, perioperative flow, and safety compliance tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" /> Schedule Surgery
          </Button>
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Siren className="h-4 w-4" /> Emergency OT Call
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Surgical List</CardTitle>
                <CardDescription>Managed view of upcoming and active procedures.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5">3 Procedures Today</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time / Room</TableHead>
                    <TableHead>Patient / Procedure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SURGERIES.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSurgery(s)}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> {s.time}</span>
                          <span className="text-xs text-muted-foreground">{s.room}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{s.patientName}</span>
                          <span className="text-xs text-primary">{s.procedure}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={s.status === "In Progress" ? "default" : s.status === "Pre-Op Prep" ? "outline" : "secondary"}>
                            {s.status}
                          </Badge>
                          {s.progress > 0 && <Progress value={s.progress} className="h-1" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedSurgery && (
            <Tabs defaultValue="safety" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="safety" className="gap-2"><ShieldCheck className="h-4 w-4" /> WHO Safety</TabsTrigger>
                <TabsTrigger value="anesthesia" className="gap-2"><Activity className="h-4 w-4" /> Anesthesia</TabsTrigger>
                <TabsTrigger value="recovery" className="gap-2"><HistoryIcon className="h-4 w-4" /> Recovery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="safety">
                <Card>
                  <CardHeader>
                    <CardTitle>WHO Surgical Safety Checklist</CardTitle>
                    <CardDescription>Patient: {selectedSurgery.patientName} | ID: {selectedSurgery.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                        <h4 className="font-bold text-sm uppercase text-primary">Before Induction (SIGN IN)</h4>
                        <div className="grid gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            Confirmed identity, site, procedure, and consent?
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            Site marked?
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            Anesthesia safety check completed?
                          </label>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg border space-y-2 opacity-50">
                        <h4 className="font-bold text-sm uppercase">Before Incision (TIME OUT)</h4>
                        <p className="text-xs italic text-muted-foreground">Locked until Sign-In is complete.</p>
                      </div>

                      <div className="p-3 bg-muted rounded-lg border space-y-2 opacity-50">
                        <h4 className="font-bold text-sm uppercase">Before Exit (SIGN OUT)</h4>
                        <p className="text-xs italic text-muted-foreground">Locked until Time-Out is complete.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleStartChecklist} className="w-full">Initialize Digital Audit Trail</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="anesthesia">
                <Card>
                  <CardHeader>
                    <CardTitle>Anesthesia Record</CardTitle>
                    <CardDescription>Intra-operative monitoring log.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Induction Type</p>
                        <p className="font-medium">General Anesthesia</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Intubation</p>
                        <p className="font-medium">Grade 1 (Cormack-Lehane)</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                      <div className="flex flex-col items-center">
                        <HeartPulse className="h-6 w-6 text-red-500 animate-pulse" />
                        <span className="text-xs font-bold">HR</span>
                        <span className="text-xl font-black">78</span>
                      </div>
                      <div className="flex flex-col items-center border-x px-8">
                        <Activity className="h-6 w-6 text-blue-500" />
                        <span className="text-xs font-bold">SpO2</span>
                        <span className="text-xl font-black">99%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Thermometer className="h-6 w-6 text-orange-500" />
                        <span className="text-xs font-bold">Temp</span>
                        <span className="text-xl font-black">36.8°C</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">OT Resource Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-primary-foreground/20 pb-2">
                <span>OT 1 (Main)</span>
                <Badge className="bg-red-500 text-white">Occupied</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-primary-foreground/20 pb-2">
                <span>OT 2 (Maternity)</span>
                <Badge className="bg-amber-500 text-white">Pre-Op</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-primary-foreground/20 pb-2">
                <span>OT 3 (Minor)</span>
                <Badge className="bg-green-500 text-white">Available</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Oxygen Supply</span>
                <span className="font-bold">94% Capacity</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Surgical Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">DM</div>
                <div className="text-xs">
                  <p className="font-bold">Dr. Mutale</p>
                  <p className="text-muted-foreground">Lead Surgeon (OT 1)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">PP</div>
                <div className="text-xs">
                  <p className="font-bold">Dr. Phiri</p>
                  <p className="text-muted-foreground">Anesthetist (OT 1)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
