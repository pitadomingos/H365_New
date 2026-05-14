"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Search, Loader2, Save, PlusCircle, History } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

export default function ClinicalNotesPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  // SOAP form state
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = async () => {
    if (!searchId) return;
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const patient = MOCK_PATIENTS.find(p => p.nationalId === searchId);
    if (patient) {
      setPatientData(patient);
      toast({ title: "Patient Record Found", description: `Loaded history for ${patient.fullName}` });
    } else {
      setPatientData(null);
      toast({ variant: "destructive", title: "Not Found", description: "No patient matches this National ID." });
    }
    setIsSearching(false);
  };

  const handleSaveNote = async () => {
    if (!subjective && !objective && !assessment && !plan) {
      toast({ variant: "destructive", title: "Empty Note", description: "Please enter some notes before saving." });
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Note Saved",
      description: "Consultation note has been added to the patient's medical record.",
    });
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Notes & History</h1>
          <p className="text-muted-foreground">Formal documentation and comprehensive medical history.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Patient Lookup</CardTitle>
          <CardDescription>Retrieve the patient record by National ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input 
              placeholder="e.g., NID001" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              disabled={isSearching || isSaving}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchId || isSaving}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {patientData && (
        <Tabs defaultValue="soap" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none px-0 h-auto bg-transparent">
            <TabsTrigger value="soap" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3">Consultation Note (SOAP)</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3">Medical History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="soap" className="mt-4">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>New Consultation Note</CardTitle>
                <CardDescription>Patient: {patientData.fullName} ({patientData.nationalId})</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-blue-700 dark:text-blue-400">Subjective (S)</Label>
                  <p className="text-xs text-muted-foreground">Patient's chief complaint, history of present illness, symptoms as described by patient.</p>
                  <Textarea placeholder="e.g., Patient reports a 3-day history of sharp chest pain..." className="min-h-[100px]" value={subjective} onChange={e => setSubjective(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-green-700 dark:text-green-400">Objective (O)</Label>
                  <p className="text-xs text-muted-foreground">Vital signs, physical examination findings, lab/imaging results.</p>
                  <Textarea placeholder="e.g., BP 130/80, HR 88, Lungs clear to auscultation..." className="min-h-[100px]" value={objective} onChange={e => setObjective(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-orange-700 dark:text-orange-400">Assessment (A)</Label>
                  <p className="text-xs text-muted-foreground">Medical diagnosis, differential diagnosis, clinical impression.</p>
                  <Textarea placeholder="e.g., Acute bronchitis, rule out pneumonia..." className="min-h-[100px]" value={assessment} onChange={e => setAssessment(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-purple-700 dark:text-purple-400">Plan (P)</Label>
                  <p className="text-xs text-muted-foreground">Treatment, medications, referrals, follow-up instructions.</p>
                  <Textarea placeholder="e.g., Prescribed Amoxicillin 500mg, chest X-ray ordered, return in 5 days..." className="min-h-[100px]" value={plan} onChange={e => setPlan(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => {setSubjective(""); setObjective(""); setAssessment(""); setPlan("");}}>Clear Note</Button>
                <Button onClick={handleSaveNote} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Sign & Save Note
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Comprehensive History</CardTitle>
                <CardDescription>Review and update {patientData.fullName}'s long-term medical history.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                      <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center justify-between">Allergies <Button variant="ghost" size="sm" className="h-6"><PlusCircle className="h-4 w-4 mr-1"/> Add</Button></h3>
                      <div className="flex flex-wrap gap-2">
                        {patientData.allergies?.map((a: string) => <Badge key={a} variant="outline" className="border-red-200 bg-white dark:bg-transparent">{a}</Badge>) || <span className="text-sm text-muted-foreground">No known allergies</span>}
                      </div>
                    </div>
                    
                    <div className="border p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center justify-between">Chronic Conditions <Button variant="ghost" size="sm" className="h-6"><PlusCircle className="h-4 w-4 mr-1"/> Add</Button></h3>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {patientData.chronicConditions?.map((c: string) => <li key={c}>{c}</li>) || <li className="text-muted-foreground">None reported</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center justify-between">Past Surgeries / Procedures <Button variant="ghost" size="sm" className="h-6"><PlusCircle className="h-4 w-4 mr-1"/> Add</Button></h3>
                      <p className="text-sm text-muted-foreground">Appendectomy (2015)</p>
                    </div>

                    <div className="border p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center justify-between">Family History <Button variant="ghost" size="sm" className="h-6"><PlusCircle className="h-4 w-4 mr-1"/> Edit</Button></h3>
                      <p className="text-sm text-muted-foreground">Father: Type 2 Diabetes<br/>Mother: Hypertension</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
