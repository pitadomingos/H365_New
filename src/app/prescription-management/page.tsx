"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Pill, Search, Loader2, PlusCircle, Send, CheckCircle2 } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/hooks/use-toast";
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';

const MOCK_DRUGS = [
  { id: "d1", name: "Amoxicillin", strength: "500mg", form: "Capsule", stock: 1200 },
  { id: "d2", name: "Paracetamol", strength: "500mg", form: "Tablet", stock: 5000 },
  { id: "d3", name: "Artemether/Lumefantrine", strength: "20/120mg", form: "Tablet", stock: 450 },
  { id: "d4", name: "Ciprofloxacin", strength: "500mg", form: "Tablet", stock: 300 },
  { id: "d5", name: "Metformin", strength: "850mg", form: "Tablet", stock: 800 },
];

export default function PrescriptionManagementPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  const [selectedDrug, setSelectedDrug] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!searchId) return;
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const patient = MOCK_PATIENTS.find(p => p.nationalId === searchId);
    if (patient) {
      setPatientData(patient);
      setPrescriptionItems([]);
      toast({ title: "Patient Found", description: `Loaded profile for ${patient.fullName}` });
    } else {
      setPatientData(null);
      toast({ variant: "destructive", title: "Not Found", description: "No patient matches this National ID." });
    }
    setIsSearching(false);
  };

  const handleAddDrug = () => {
    if (!selectedDrug || !dosage || !frequency || !duration) {
      toast({ variant: "destructive", title: "Incomplete", description: "Please fill all prescription details." });
      return;
    }
    const drugInfo = MOCK_DRUGS.find(d => d.id === selectedDrug);
    setPrescriptionItems([...prescriptionItems, {
      id: Math.random().toString(),
      drugName: drugInfo?.name,
      strength: drugInfo?.strength,
      form: drugInfo?.form,
      dosage,
      frequency,
      duration
    }]);
    setSelectedDrug("");
    setDosage("");
    setFrequency("");
    setDuration("");
  };

  const handleSendPrescription = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Prescription Sent",
      description: "The digital prescription has been routed to the Pharmacy module successfully.",
    });
    setPrescriptionItems([]);
    setPatientData(null);
    setSearchId("");
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Pill className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Prescription Management</h1>
          <p className="text-muted-foreground">Create and route prescriptions directly to the pharmacy.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Patient Lookup</CardTitle>
          <CardDescription>Enter the patient's National ID to begin prescribing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input 
              placeholder="e.g., NID001" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              disabled={isSearching || isSubmitting}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchId || isSubmitting}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>

          {patientData && (
            <div className="mt-6 flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
              <Image 
                src={patientData.photoUrl || "https://placehold.co/120x120.png"} 
                alt="Patient Photo" 
                width={80} 
                height={80} 
                className="rounded-full"
              />
              <div>
                <h3 className="font-semibold text-lg">{patientData.fullName}</h3>
                <p className="text-sm text-muted-foreground">ID: {patientData.nationalId} | Age: {patientData.age} | {patientData.gender}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-xs text-red-600 bg-red-50 dark:bg-red-900/10">Allergies: {patientData.allergies?.join(', ') || 'None'}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {patientData && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Prescription Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-muted/20 p-4 rounded-lg border">
              <div className="space-y-1 md:col-span-1">
                <Label>Select Medication</Label>
                <Select value={selectedDrug} onValueChange={setSelectedDrug}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search drug..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DRUGS.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.strength} {d.form})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Dosage</Label>
                <Input placeholder="e.g., 1 tablet" value={dosage} onChange={(e) => setDosage(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Frequency</Label>
                <Input placeholder="e.g., 3 times daily" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Duration</Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g., 5 days" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  <Button variant="secondary" onClick={handleAddDrug}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {prescriptionItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptionItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.drugName} <span className="text-muted-foreground text-xs">{item.strength} {item.form}</span></TableCell>
                        <TableCell>{item.dosage}</TableCell>
                        <TableCell>{item.frequency}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setPrescriptionItems(prescriptionItems.filter(i => i.id !== item.id))}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setPrescriptionItems([])} disabled={isSubmitting || prescriptionItems.length === 0}>Clear All</Button>
            <Button onClick={handleSendPrescription} disabled={isSubmitting || prescriptionItems.length === 0} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Routing...' : 'Send to Pharmacy'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
