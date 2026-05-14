"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Search, Ruler, Weight, Loader2, Save, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle2, History, Scale, Activity } from "lucide-react";
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

export default function NutritionPage() {
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSelectedPatient({
      id: "NUT001",
      nationalId: searchId,
      fullName: "Liam Antonio",
      ageInMonths: 18,
      status: "Moderate Malnutrition (MAM)",
      currentWeight: 8.5,
      targetWeight: 10.2,
      muac: 12.1,
      rutfRation: "2 sachets/day",
      history: [
        { date: "2026-05-01", weight: 8.2, muac: 11.8, notes: "Transitioning from SAM to MAM." },
        { date: "2026-04-15", weight: 7.8, muac: 11.2, notes: "Admission for Severe Malnutrition." },
      ]
    });
    toast({ title: "Nutritional File Loaded", description: "Assessment history retrieved." });
    setIsLoadingSearch(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Utensils className="h-8 w-8 text-primary" /> Nutrition & Dietetics
        </h1>
        <p className="text-muted-foreground">
          Malnutrition screening (SAM/MAM), therapeutic food distribution, and inpatient dietetics.
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
              placeholder="Search by National ID or Child Health Card ID..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch}>
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open Record"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <Scale className="h-5 w-5 text-amber-600" />
                    <Badge variant="outline" className="text-amber-600 border-amber-200">MAM</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className="text-lg font-bold text-amber-700">{selectedPatient.status}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <Ruler className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Latest MUAC</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedPatient.muac} cm</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Weight Gain</p>
                    <p className="text-2xl font-bold text-green-700">+0.3kg/wk</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="assessment" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assessment" className="gap-2"><Activity className="h-4 w-4" /> Assessment</TabsTrigger>
                <TabsTrigger value="therapeutic" className="gap-2"><ShoppingBag className="h-4 w-4" /> Therapeutic Food</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assessment">
                <Card>
                  <CardHeader>
                    <CardTitle>Nutritional Assessment</CardTitle>
                    <CardDescription>Input new MUAC, weight, and clinical signs of malnutrition.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>MUAC (Mid-Upper Arm Circumference) cm</Label>
                        <Input type="number" step="0.1" placeholder="0.0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input type="number" step="0.1" placeholder="0.0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Clinical Signs (Edema, Dermatosis, etc.)</Label>
                      <Input placeholder="Describe clinical findings..." />
                    </div>
                    <Button className="w-full gap-2">
                      <Save className="h-4 w-4" /> Save Assessment
                    </Button>
                    <Separator />
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>MUAC</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.history.map((h: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{h.date}</TableCell>
                            <TableCell>{h.weight} kg</TableCell>
                            <TableCell>{h.muac} cm</TableCell>
                            <TableCell className="text-xs">{h.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="therapeutic">
                <Card>
                  <CardHeader>
                    <CardTitle>Therapeutic Food Distribution</CardTitle>
                    <CardDescription>Manage RUTF (Ready-to-Use Therapeutic Food) and supplement logs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 border rounded-xl bg-muted/30 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Plumpy'Nut® Ration</span>
                        <Badge variant="default">{selectedPatient.rutfRation}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Prescribed for 14 days. Total sachets to dispense: 28.</p>
                      <Button className="w-full">Dispense Ration</Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" /> Distribution Log
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>2026-05-01</TableCell>
                            <TableCell>RUTF Sachet</TableCell>
                            <TableCell>28</TableCell>
                            <TableCell><CheckCircle2 className="h-4 w-4 text-green-500" /></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-t-4 border-t-green-500">
              <CardHeader className="bg-green-50 dark:bg-green-950/20">
                <CardTitle className="text-lg">Inpatient Diet Planning</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground italic">Current Diet Plan:</p>
                  <p className="font-bold">F-100 Therapeutic Milk (Transition Phase)</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-red-700 dark:text-red-300">Warning: Risk of Re-feeding Syndrome. Monitor electrolytes closely.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Request Dietitian Consult</Button>
              </CardFooter>
            </Card>

            <AIAssistantPanel 
              department="Nutrition"
              patientData={selectedPatient}
              context="Nutritional recovery rate calculation and WHO SAM protocol compliance check."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            <Utensils className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Nutritional Console</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Open a child health record or register a malnutrition case to start monitoring.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
