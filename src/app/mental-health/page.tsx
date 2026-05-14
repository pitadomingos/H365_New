"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Search, FileText, Loader2, Save, MessageCircle, Heart, AlertCircle, Calendar, UserPlus, ShieldAlert } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export default function MentalHealthPage() {
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSelectedPatient({
      id: "MH001",
      nationalId: searchId,
      fullName: "Delfina Correia",
      age: 45,
      diagnosis: "Generalized Anxiety Disorder",
      riskLevel: "Low",
      nextSession: "2026-05-15",
      history: [
        { date: "2026-04-20", type: "Psychotherapy", notes: "Patient reported improved sleep patterns.", provider: "Dr. Chen" },
        { date: "2026-03-15", type: "Initial Assessment", notes: "High levels of cortisol-related stress symptoms.", provider: "Dr. Chen" },
      ]
    });
    toast({ title: "Patient Record Loaded", description: "Mental health history retrieved." });
    setIsLoadingSearch(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" /> Mental Health & Psychiatry
        </h1>
        <p className="text-muted-foreground">
          Holistic support integration for psychiatric consultations and psychological care.
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
              placeholder="Search by National ID..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch}>
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open File"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100">
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next Session</p>
                    <p className="text-lg font-bold">{selectedPatient.nextSession}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-100">
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Risk Level</p>
                    <p className="text-lg font-bold">{selectedPatient.riskLevel}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes" className="gap-2"><FileText className="h-4 w-4" /> Consultation Notes</TabsTrigger>
                <TabsTrigger value="history" className="gap-2"><MessageCircle className="h-4 w-4" /> Session History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>New Consultation Entry</CardTitle>
                    <CardDescription>Record clinical findings and psychosocial assessments.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subjective Assessment</Label>
                      <Textarea placeholder="Patient's reported feelings, mood, and concerns..." className="min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mental State Examination (MSE)</Label>
                      <Textarea placeholder="Appearance, behavior, speech, thought content..." className="min-h-[100px]" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Suicidal Ideation</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option>None Reported</option>
                          <option>Ideation without intent</option>
                          <option>Ideation with plan</option>
                          <option>High risk / Intent</option>
                        </select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Sleep Pattern</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option>Normal</option>
                          <option>Insomnia</option>
                          <option>Hypersomnia</option>
                          <option>Interrupted</option>
                        </select>
                      </div>
                    </div>
                    <Button className="w-full gap-2">
                      <Save className="h-4 w-4" /> Save Clinical Note
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Summary</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.history.map((h: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="whitespace-nowrap">{h.date}</TableCell>
                            <TableCell><Badge variant="outline">{h.type}</Badge></TableCell>
                            <TableCell>{h.provider}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{h.notes}</TableCell>
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
            <Card className="shadow-sm border-t-4 border-t-pink-500">
              <CardHeader className="bg-pink-50 dark:bg-pink-950/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" /> Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-xl font-bold">{selectedPatient.diagnosis}</p>
                <Separator />
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Crisis alert: Patient has history of panic attacks during medication transitions.
                  </p>
                </div>
                <Button variant="outline" className="w-full gap-2 text-pink-600 border-pink-200">
                  <UserPlus className="h-4 w-4" /> Referral to Social Work
                </Button>
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Mental Health"
              patientData={selectedPatient}
              context="Sentiment analysis and behavioral pattern recognition support."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            <Brain className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Psychiatry Console</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Access holistic patient records for psychiatric and psychological support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
