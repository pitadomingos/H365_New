"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Search, CalendarPlus, FileText, Activity, ShieldAlert, Microscope, Ruler, Weight, Thermometer, Loader2, CalendarIcon, Save, HeartPulse, Pill, CheckCircle2, AlertCircle, Syringe, TrendingUp, AlertTriangle } from "lucide-react";
import { AIAssistantPanel } from "@/components/clinical/ai-assistant-panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LocalDB } from '@/lib/db';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, ComposedChart } from 'recharts';

interface Vaccination {
  id: string;
  name: string;
  dueDate: string;
  administeredDate?: string;
  status: "Due" | "Administered" | "Overdue";
  batchNumber?: string;
}

interface GrowthMetric {
  id: string;
  date: string;
  ageInMonths: number;
  weightKg: number;
  heightCm: number;
  muacCm?: number;
}

interface PediatricPatient {
  id: string;
  nationalId: string;
  fullName: string;
  age: number; // in months
  dob: string;
  motherName: string;
  motherId: string;
  vaccinations: Vaccination[];
  growthHistory: GrowthMetric[];
}

const DEFAULT_PEDIATRIC_PATIENTS: PediatricPatient[] = [
  {
    id: "PED001",
    nationalId: "P-88776655",
    fullName: "Liam Antonio",
    age: 3,
    dob: "2026-02-15",
    motherName: "Alice Mwamba",
    motherId: "1029384756",
    vaccinations: [
      // Birth doses (0 weeks)
      { id: "v1", name: "BCG (Tuberculosis)", dueDate: "2026-02-15", administeredDate: "2026-02-15", status: "Administered", batchNumber: "B123-X" },
      { id: "v2", name: "OPV 0 (Birth Polio)", dueDate: "2026-02-15", administeredDate: "2026-02-15", status: "Administered", batchNumber: "O-998" },
      { id: "v3", name: "Hepatitis B (Birth Dose)", dueDate: "2026-02-15", administeredDate: "2026-02-15", status: "Administered", batchNumber: "H-445" },
      // 6 weeks
      { id: "v4", name: "DTP-HepB-Hib 1 (Pentavalent 1)", dueDate: "2026-03-29", status: "Due" },
      { id: "v5", name: "OPV 1", dueDate: "2026-03-29", status: "Due" },
      { id: "v6", name: "Rotavirus 1", dueDate: "2026-03-29", status: "Due" },
      { id: "v7", name: "PCV 1 (Pneumococcal 1)", dueDate: "2026-03-29", status: "Due" },
      // 10 weeks
      { id: "v8", name: "DTP-HepB-Hib 2 (Pentavalent 2)", dueDate: "2026-04-26", status: "Due" },
      { id: "v9", name: "OPV 2", dueDate: "2026-04-26", status: "Due" },
      { id: "v10", name: "Rotavirus 2", dueDate: "2026-04-26", status: "Due" },
      { id: "v10a", name: "PCV 2 (Pneumococcal 2)", dueDate: "2026-04-26", status: "Due" },
      // 14 weeks
      { id: "v11", name: "DTP-HepB-Hib 3 (Pentavalent 3)", dueDate: "2026-05-24", status: "Due" },
      { id: "v12", name: "OPV 3", dueDate: "2026-05-24", status: "Due" },
      { id: "v13", name: "PCV 3 (Pneumococcal 3)", dueDate: "2026-05-24", status: "Due" },
      { id: "v14", name: "IPV (Inactivated Polio)", dueDate: "2026-05-24", status: "Due" },
      // 6 months
      { id: "v15", name: "Vitamin A (1st dose)", dueDate: "2026-08-15", status: "Due" },
      { id: "v15a", name: "Influenza 1", dueDate: "2026-08-15", status: "Due" },
      // 7 months
      { id: "v15b", name: "Influenza 2", dueDate: "2026-09-15", status: "Due" },
      // 9 months
      { id: "v16", name: "Measles-Rubella 1 (MR1)", dueDate: "2026-11-15", status: "Due" },
      { id: "v16a", name: "Yellow Fever", dueDate: "2026-11-15", status: "Due" },
      { id: "v17", name: "Typhoid Conjugate Vaccine", dueDate: "2026-11-15", status: "Due" },
      // 12 months
      { id: "v18", name: "Vitamin A (2nd dose)", dueDate: "2027-02-15", status: "Due" },
      { id: "v19", name: "Deworming (Mebendazole 1st dose)", dueDate: "2027-02-15", status: "Due" },
      { id: "v19a", name: "PCV Booster", dueDate: "2027-02-15", status: "Due" },
      // 15 months
      { id: "v20", name: "Measles-Rubella 2 (MR2)", dueDate: "2027-05-15", status: "Due" },
      // 18 months
      { id: "v21", name: "DTP Booster 1", dueDate: "2027-08-15", status: "Due" },
      { id: "v22", name: "OPV Booster 1", dueDate: "2027-08-15", status: "Due" },
      { id: "v22a", name: "Vitamin A (3rd dose)", dueDate: "2027-08-15", status: "Due" },
      { id: "v22b", name: "Deworming (Mebendazole 2nd dose)", dueDate: "2027-08-15", status: "Due" },
      // 2 years (24 months)
      { id: "v23", name: "Vitamin A (4th dose)", dueDate: "2028-02-15", status: "Due" },
      { id: "v23a", name: "Deworming (Mebendazole 3rd dose)", dueDate: "2028-02-15", status: "Due" },
      { id: "v23b", name: "Meningococcal A", dueDate: "2028-02-15", status: "Due" },
      // 30 months
      { id: "v24", name: "Vitamin A (5th dose)", dueDate: "2028-08-15", status: "Due" },
      { id: "v24a", name: "Deworming (Mebendazole 4th dose)", dueDate: "2028-08-15", status: "Due" },
      // 3 years (36 months)
      { id: "v25", name: "Vitamin A (6th dose)", dueDate: "2029-02-15", status: "Due" },
      { id: "v25a", name: "Deworming (Mebendazole 5th dose)", dueDate: "2029-02-15", status: "Due" },
      // 4 years (48 months)
      { id: "v26", name: "Vitamin A (8th dose)", dueDate: "2030-02-15", status: "Due" },
      { id: "v26a", name: "Deworming (Mebendazole 7th dose)", dueDate: "2030-02-15", status: "Due" },
      // 5 years (60 months)
      { id: "v27", name: "DTP Booster 2", dueDate: "2031-02-15", status: "Due" },
      { id: "v27a", name: "OPV Booster 2", dueDate: "2031-02-15", status: "Due" },
      { id: "v27b", name: "Measles-Rubella 3", dueDate: "2031-02-15", status: "Due" },
      { id: "v28", name: "Vitamin A (10th dose)", dueDate: "2031-02-15", status: "Due" },
      { id: "v28a", name: "Deworming (Mebendazole 9th dose)", dueDate: "2031-02-15", status: "Due" },
    ],
    growthHistory: [
      { id: "g1", date: "2026-02-15", ageInMonths: 0, weightKg: 3.2, heightCm: 50, muacCm: 10.5 },
      { id: "g2", date: "2026-03-15", ageInMonths: 1, weightKg: 4.1, heightCm: 53, muacCm: 11.2 },
      { id: "g3", date: "2026-04-15", ageInMonths: 2, weightKg: 5.2, heightCm: 57, muacCm: 12.0 },
      { id: "g4", date: "2026-05-15", ageInMonths: 3, weightKg: 5.9, heightCm: 60, muacCm: 12.5 },
    ]
  },
  {
    id: "PED002",
    nationalId: "P-44556677",
    fullName: "Sofia Ndlovu",
    age: 14,
    dob: "2025-03-10",
    motherName: "Maria Ndlovu",
    motherId: "5566778899",
    vaccinations: [
      // Birth doses (0 weeks)
      { id: "s1", name: "BCG (Tuberculosis)", dueDate: "2025-03-10", administeredDate: "2025-03-10", status: "Administered", batchNumber: "B-778" },
      { id: "s2", name: "OPV 0 (Birth Polio)", dueDate: "2025-03-10", administeredDate: "2025-03-10", status: "Administered", batchNumber: "O-221" },
      { id: "s3", name: "Hepatitis B (Birth Dose)", dueDate: "2025-03-10", administeredDate: "2025-03-10", status: "Administered", batchNumber: "H-990" },
      // 6 weeks
      { id: "s4", name: "DTP-HepB-Hib 1 (Pentavalent 1)", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "P1-33" },
      { id: "s5", name: "OPV 1", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "O1-44" },
      { id: "s6", name: "Rotavirus 1", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "R1-55" },
      { id: "s7", name: "PCV 1 (Pneumococcal 1)", dueDate: "2025-04-21", administeredDate: "2025-04-22", status: "Administered", batchNumber: "PC1-66" },
      // 10 weeks
      { id: "s8", name: "DTP-HepB-Hib 2 (Pentavalent 2)", dueDate: "2025-05-19", administeredDate: "2025-05-20", status: "Administered", batchNumber: "P2-77" },
      { id: "s9", name: "OPV 2", dueDate: "2025-05-19", administeredDate: "2025-05-20", status: "Administered", batchNumber: "O2-88" },
      { id: "s10", name: "Rotavirus 2", dueDate: "2025-05-19", administeredDate: "2025-05-20", status: "Administered", batchNumber: "R2-99" },
      // 14 weeks
      { id: "s11", name: "DTP-HepB-Hib 3 (Pentavalent 3)", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "P3-11" },
      { id: "s12", name: "OPV 3", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "O3-22" },
      { id: "s13", name: "PCV 2 (Pneumococcal 2)", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "PC2-33" },
      { id: "s14", name: "IPV (Inactivated Polio)", dueDate: "2025-06-16", administeredDate: "2025-06-18", status: "Administered", batchNumber: "IP-44" },
      // 6 months
      { id: "s15", name: "Vitamin A (1st dose)", dueDate: "2025-09-10", administeredDate: "2025-09-12", status: "Administered", batchNumber: "VA1-55" },
      // 9 months
      { id: "s16", name: "Measles-Rubella 1 (MR1)", dueDate: "2025-12-10", administeredDate: "2025-12-12", status: "Administered", batchNumber: "MR1-66" },
      { id: "s17", name: "PCV 3 (Pneumococcal 3)", dueDate: "2025-12-10", administeredDate: "2025-12-12", status: "Administered", batchNumber: "PC3-77" },
      // 12 months
      { id: "s18", name: "Vitamin A (2nd dose)", dueDate: "2026-03-10", status: "Overdue" },
      { id: "s19", name: "Deworming (Mebendazole 1st dose)", dueDate: "2026-03-10", status: "Overdue" },
      // 15 months (Due shortly)
      { id: "s20", name: "Measles-Rubella 2 (MR2)", dueDate: "2026-06-10", status: "Due" },
      // 18 months
      { id: "s21", name: "DTP Booster 1", dueDate: "2026-09-10", status: "Due" },
      { id: "s22", name: "OPV Booster 1", dueDate: "2026-09-10", status: "Due" },
      { id: "s22a", name: "Vitamin A (3rd dose)", dueDate: "2026-09-10", status: "Due" },
      { id: "s22b", name: "Deworming (Mebendazole 2nd dose)", dueDate: "2026-09-10", status: "Due" },
      // 2 years (24 months)
      { id: "s23", name: "Vitamin A (4th dose)", dueDate: "2027-03-10", status: "Due" },
      { id: "s23a", name: "Deworming (Mebendazole 3rd dose)", dueDate: "2027-03-10", status: "Due" },
      { id: "s23b", name: "Meningococcal A", dueDate: "2027-03-10", status: "Due" },
      // 30 months
      { id: "s24", name: "Vitamin A (5th dose)", dueDate: "2027-09-10", status: "Due" },
      { id: "s24a", name: "Deworming (Mebendazole 4th dose)", dueDate: "2027-09-10", status: "Due" },
      // 3 years (36 months)
      { id: "s25", name: "Vitamin A (6th dose)", dueDate: "2028-03-10", status: "Due" },
      { id: "s25a", name: "Deworming (Mebendazole 5th dose)", dueDate: "2028-03-10", status: "Due" },
      // 4 years (48 months)
      { id: "s26", name: "Vitamin A (8th dose)", dueDate: "2029-03-10", status: "Due" },
      { id: "s26a", name: "Deworming (Mebendazole 7th dose)", dueDate: "2029-03-10", status: "Due" },
      // 5 years (60 months)
      { id: "s27", name: "DTP Booster 2", dueDate: "2030-03-10", status: "Due" },
      { id: "s27a", name: "OPV Booster 2", dueDate: "2030-03-10", status: "Due" },
      { id: "s27b", name: "Measles-Rubella 3", dueDate: "2030-03-10", status: "Due" },
      { id: "s28", name: "Vitamin A (10th dose)", dueDate: "2030-03-10", status: "Due" },
      { id: "s28a", name: "Deworming (Mebendazole 9th dose)", dueDate: "2030-03-10", status: "Due" },
    ],
    growthHistory: [
      { id: "sg1", date: "2025-03-10", ageInMonths: 0, weightKg: 3.0, heightCm: 49, muacCm: 10.2 },
      { id: "sg2", date: "2025-04-10", ageInMonths: 1, weightKg: 3.9, heightCm: 52, muacCm: 10.8 },
      { id: "sg3", date: "2025-05-10", ageInMonths: 2, weightKg: 4.8, heightCm: 56, muacCm: 11.5 },
      { id: "sg4", date: "2025-06-10", ageInMonths: 3, weightKg: 5.5, heightCm: 59, muacCm: 12.0 },
      { id: "sg5", date: "2025-09-10", ageInMonths: 6, weightKg: 7.2, heightCm: 65, muacCm: 13.0 },
      { id: "sg6", date: "2025-12-10", ageInMonths: 9, weightKg: 8.1, heightCm: 70, muacCm: 13.5 },
      { id: "sg7", date: "2026-03-10", ageInMonths: 12, weightKg: 8.8, heightCm: 74, muacCm: 14.0 },
    ]
  }
];

// WHO Median Weight & Height with ±2SD z-score bands (boys reference, 0-60 months)
const WHO_GROWTH_REFERENCE = [
  { age: 0, weightWho: 3.3, weightMinus2SD: 2.5, weightPlus2SD: 4.4, heightWho: 49.9, heightMinus2SD: 46.1, heightPlus2SD: 53.7 },
  { age: 1, weightWho: 4.5, weightMinus2SD: 3.4, weightPlus2SD: 5.8, heightWho: 54.7, heightMinus2SD: 50.8, heightPlus2SD: 58.6 },
  { age: 2, weightWho: 5.6, weightMinus2SD: 4.3, weightPlus2SD: 7.1, heightWho: 58.4, heightMinus2SD: 54.4, heightPlus2SD: 62.4 },
  { age: 3, weightWho: 6.4, weightMinus2SD: 5.0, weightPlus2SD: 8.0, heightWho: 61.4, heightMinus2SD: 57.3, heightPlus2SD: 65.5 },
  { age: 4, weightWho: 7.0, weightMinus2SD: 5.6, weightPlus2SD: 8.7, heightWho: 63.9, heightMinus2SD: 59.7, heightPlus2SD: 68.0 },
  { age: 5, weightWho: 7.5, weightMinus2SD: 6.0, weightPlus2SD: 9.3, heightWho: 65.9, heightMinus2SD: 61.7, heightPlus2SD: 70.1 },
  { age: 6, weightWho: 7.9, weightMinus2SD: 6.4, weightPlus2SD: 9.8, heightWho: 67.6, heightMinus2SD: 63.3, heightPlus2SD: 71.9 },
  { age: 9, weightWho: 8.9, weightMinus2SD: 7.1, weightPlus2SD: 11.0, heightWho: 72.0, heightMinus2SD: 67.5, heightPlus2SD: 76.5 },
  { age: 12, weightWho: 9.6, weightMinus2SD: 7.7, weightPlus2SD: 12.0, heightWho: 75.7, heightMinus2SD: 71.0, heightPlus2SD: 80.5 },
  { age: 15, weightWho: 10.3, weightMinus2SD: 8.3, weightPlus2SD: 12.8, heightWho: 79.1, heightMinus2SD: 74.1, heightPlus2SD: 84.2 },
  { age: 18, weightWho: 10.9, weightMinus2SD: 8.8, weightPlus2SD: 13.7, heightWho: 82.3, heightMinus2SD: 76.9, heightPlus2SD: 87.7 },
  { age: 24, weightWho: 12.2, weightMinus2SD: 9.7, weightPlus2SD: 15.3, heightWho: 87.8, heightMinus2SD: 81.7, heightPlus2SD: 93.9 },
  { age: 30, weightWho: 13.3, weightMinus2SD: 10.5, weightPlus2SD: 16.9, heightWho: 92.4, heightMinus2SD: 85.6, heightPlus2SD: 99.1 },
  { age: 36, weightWho: 14.3, weightMinus2SD: 11.3, weightPlus2SD: 18.3, heightWho: 96.1, heightMinus2SD: 88.7, heightPlus2SD: 103.5 },
  { age: 48, weightWho: 16.3, weightMinus2SD: 12.7, weightPlus2SD: 21.5, heightWho: 103.3, heightMinus2SD: 94.9, heightPlus2SD: 111.7 },
  { age: 60, weightWho: 18.3, weightMinus2SD: 14.1, weightPlus2SD: 24.2, heightWho: 110.0, heightMinus2SD: 100.7, heightPlus2SD: 119.2 },
];

export default function PediatricsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [patientsList, setPatientsList] = useState<PediatricPatient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PediatricPatient | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  
  const [isVaxModalOpen, setIsVaxModalOpen] = useState(false);
  const [selectedVax, setSelectedVax] = useState<Vaccination | null>(null);
  const [vaxBatch, setVaxBatch] = useState("");
  const [isAdministering, setIsAdministering] = useState(false);

  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState("");
  const [newMuac, setNewMuac] = useState("");
  const [newAgeMonths, setNewAgeMonths] = useState("");
  const [isSavingGrowth, setIsSavingGrowth] = useState(false);
  const [chartType, setChartType] = useState<"weight" | "height">("weight");

  const loadPatients = async () => {
    const list = await LocalDB.get<PediatricPatient[]>("pediatric_patients", DEFAULT_PEDIATRIC_PATIENTS);
    
    // Check vaccine overdue dates automatically against today's date
    const todayStr = new Date().toISOString().split('T')[0];
    const processedList = list.map(patient => {
      const updatedVaccinations = patient.vaccinations.map(vax => {
        if (vax.status === "Due" && vax.dueDate < todayStr) {
          return { ...vax, status: "Overdue" as const };
        }
        return vax;
      });
      return { ...patient, vaccinations: updatedVaccinations };
    });

    setPatientsList(processedList);
    await LocalDB.save("pediatric_patients", processedList);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsLoadingSearch(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const found = patientsList.find(p => p.nationalId === searchId || p.motherId === searchId || p.id === searchId);
    if (found) {
      setSelectedPatient(found);
      toast({ title: "Patient Found", description: `Loaded record for ${found.fullName}` });
    } else {
      setSelectedPatient(null);
      toast({ variant: "destructive", title: "Not Found", description: "No pediatric record matches this ID." });
    }
    setIsLoadingSearch(false);
  };

  const handleAdministerVax = async () => {
    if (!selectedPatient || !selectedVax || !vaxBatch) return;
    setIsAdministering(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedVax = selectedPatient.vaccinations.map(v => 
      v.id === selectedVax.id ? { ...v, status: "Administered" as const, administeredDate: new Date().toISOString().split('T')[0], batchNumber: vaxBatch } : v
    );
    
    const updatedPatient = { ...selectedPatient, vaccinations: updatedVax };
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);

    await LocalDB.save("pediatric_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    // Save system log
    const logs = await LocalDB.get<any[]>("system_activity_logs", []);
    const newLog = {
      id: `ACT-${Date.now()}`,
      action: "Administered Vaccine",
      details: `${selectedVax.name} batch ${vaxBatch} administered to ${selectedPatient.fullName}.`,
      user: "Pediatric Nurse",
      timestamp: new Date().toISOString()
    };
    await LocalDB.save("system_activity_logs", [newLog, ...logs]);

    toast({ title: "Vaccination Recorded", description: `${selectedVax.name} administered successfully.` });
    setIsAdministering(false);
    setIsVaxModalOpen(false);
    setSelectedVax(null);
    setVaxBatch("");
  };

  const handleSaveGrowth = async () => {
    if (!selectedPatient || !newWeight || !newHeight || !newAgeMonths) return;
    setIsSavingGrowth(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const weightVal = parseFloat(newWeight);
    const heightVal = parseFloat(newHeight);
    const muacVal = newMuac ? parseFloat(newMuac) : undefined;
    const ageVal = parseInt(newAgeMonths, 10);

    const newEntry: GrowthMetric = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ageInMonths: ageVal,
      weightKg: weightVal,
      heightCm: heightVal,
      muacCm: muacVal
    };
    
    // Sort growth history by age
    const updatedHistory = [...selectedPatient.growthHistory, newEntry].sort((a, b) => a.ageInMonths - b.ageInMonths);
    const updatedPatient = { ...selectedPatient, growthHistory: updatedHistory, age: ageVal };
    const updatedList = patientsList.map(p => p.id === selectedPatient.id ? updatedPatient : p);

    await LocalDB.save("pediatric_patients", updatedList);
    setPatientsList(updatedList);
    setSelectedPatient(updatedPatient);

    toast({ title: "Growth Data Saved", description: "Weight, height and age records updated successfully." });
    setIsSavingGrowth(false);
    setNewWeight("");
    setNewHeight("");
    setNewMuac("");
    setNewAgeMonths("");
  };

  // Merge selected child's growth metrics with WHO reference guidelines and z-score bands for charting
  const getChartData = () => {
    if (!selectedPatient) return [];
    return WHO_GROWTH_REFERENCE.map(ref => {
      const match = selectedPatient.growthHistory.find(g => g.ageInMonths === ref.age);
      return {
        age: ref.age,
        weightWho: ref.weightWho,
        weightMinus2SD: ref.weightMinus2SD,
        weightPlus2SD: ref.weightPlus2SD,
        heightWho: ref.heightWho,
        heightMinus2SD: ref.heightMinus2SD,
        heightPlus2SD: ref.heightPlus2SD,
        weightChild: match ? match.weightKg : null,
        heightChild: match ? match.heightCm : null
      };
    });
  };

  const currentChartData = getChartData();
  const nextVax = selectedPatient?.vaccinations.find(v => v.status === "Due" || v.status === "Overdue");
  const overdueCount = selectedPatient?.vaccinations.filter(v => v.status === "Overdue").length || 0;

  // MUAC Severity Checker
  const getMuacStatus = (muac?: number) => {
    if (!muac) return null;
    if (muac < 11.5) return { label: "Severe Malnutrition (SAM)", color: "text-red-500 border-red-200 bg-red-50 dark:bg-red-950/20" };
    if (muac < 12.5) return { label: "Moderate Malnutrition (MAM)", color: "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/20" };
    return { label: "Well Nourished", color: "text-green-500 border-green-200 bg-green-50 dark:bg-green-950/20" };
  };

  const latestGrowth = selectedPatient?.growthHistory[selectedPatient.growthHistory.length - 1];
  const muacAlert = latestGrowth ? getMuacStatus(latestGrowth.muacCm) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Baby className="h-8 w-8 text-indigo-600" /> Pediatrics & Child Wellness (PAV)
          </h1>
          <p className="text-muted-foreground text-sm">
            Integrated Expanded Program on Immunization (EPI), WHO growth standards reference, and developmental metrics.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-indigo-100 bg-indigo-50/10 dark:bg-indigo-950/5 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Child Record Finder</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Mother's ID or Child ID (Try: P-88776655)..." 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoadingSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Child Profile"}
          </Button>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="vaccinations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vaccinations" className="gap-2"><Syringe className="h-4 w-4" /> Immunization (EPI)</TabsTrigger>
                <TabsTrigger value="growth" className="gap-2"><Activity className="h-4 w-4" /> Growth Monitoring</TabsTrigger>
                <TabsTrigger value="charts" className="gap-2"><TrendingUp className="h-4 w-4" /> Percentile Charts</TabsTrigger>
              </TabsList>
              
              {/* Immunization Tab */}
              <TabsContent value="vaccinations" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Expanded Program on Immunization (EPI)</CardTitle>
                    <CardDescription>Verify completed doses and record administered pediatric vaccines.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overdueCount > 0 && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Vaccination Delay</AlertTitle>
                        <AlertDescription>
                          This child has {overdueCount} overdue vaccine dose(s) that need immediate administration.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vaccine Dose</TableHead>
                          <TableHead>Target Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Administered Date</TableHead>
                          <TableHead>Batch Lot</TableHead>
                          <TableHead className="text-right font-bold text-slate-500">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.vaccinations.map((v) => (
                          <TableRow key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <TableCell className="font-semibold">{v.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{v.dueDate}</TableCell>
                            <TableCell>
                              <Badge variant={v.status === "Administered" ? "default" : v.status === "Overdue" ? "destructive" : "outline"} className={v.status === "Administered" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200" : ""}>
                                {v.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{v.administeredDate || "-"}</TableCell>
                            <TableCell className="font-mono text-xs text-slate-500">{v.batchNumber || "-"}</TableCell>
                            <TableCell className="text-right">
                              {v.status !== "Administered" ? (
                                <Button size="sm" onClick={() => { setSelectedVax(v); setIsVaxModalOpen(true); }} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs">
                                  Record Dose
                                </Button>
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Growth Metrics Table Input Tab */}
              <TabsContent value="growth" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Tracking History</CardTitle>
                    <CardDescription>Log physical metrics to audit development and flag childhood malnutrition levels.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Age (Months) <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="e.g. 4" value={newAgeMonths} onChange={(e) => setNewAgeMonths(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Weight (kg) <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="0.0" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Height (cm) <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="0.0" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">MUAC (cm)</Label>
                        <Input type="number" placeholder="Optional" value={newMuac} onChange={(e) => setNewMuac(e.target.value)} />
                      </div>
                      <Button className="col-span-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white gap-2" disabled={isSavingGrowth || !newWeight || !newHeight || !newAgeMonths} onClick={handleSaveGrowth}>
                        {isSavingGrowth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Child Growth Metrics
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Check date</TableHead>
                          <TableHead>Age (Months)</TableHead>
                          <TableHead>Weight (kg)</TableHead>
                          <TableHead>Height (cm)</TableHead>
                          <TableHead>MUAC (cm)</TableHead>
                          <TableHead>Nutritional Assessment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.growthHistory.map((g) => {
                          const status = getMuacStatus(g.muacCm);
                          return (
                            <TableRow key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <TableCell className="text-xs">{g.date}</TableCell>
                              <TableCell className="font-semibold">{g.ageInMonths} mo</TableCell>
                              <TableCell>{g.weightKg} kg</TableCell>
                              <TableCell>{g.heightCm} cm</TableCell>
                              <TableCell>{g.muacCm ? `${g.muacCm} cm` : "-"}</TableCell>
                              <TableCell>
                                {status ? (
                                  <Badge variant="outline" className={`${status.color} py-0 px-2 text-[10px]`}>
                                    {status.label}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">N/A</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* WHO Growth Charts Tab */}
              <TabsContent value="charts" className="mt-4">
                <Card className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <div>
                      <CardTitle className="text-lg">Child Development vs WHO Medians</CardTitle>
                      <CardDescription>Visual growth curves comparing patient stats against standard pediatric standards.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={chartType === "weight" ? "default" : "outline"} onClick={() => setChartType("weight")} className={chartType === "weight" ? "bg-indigo-600 hover:bg-indigo-700" : ""}>Weight</Button>
                      <Button size="sm" variant={chartType === "height" ? "default" : "outline"} onClick={() => setChartType("height")} className={chartType === "height" ? "bg-indigo-600 hover:bg-indigo-700" : ""}>Height</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[380px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentChartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="age" label={{ value: 'Age (Months)', position: 'insideBottom', offset: -5 }} stroke="rgba(150, 150, 150, 0.8)" />
                        <YAxis label={{ value: chartType === "weight" ? 'Weight (kg)' : 'Height (cm)', angle: -90, position: 'insideLeft' }} stroke="rgba(150, 150, 150, 0.8)" />
                        <Tooltip formatter={(value: number, name: string) => [value !== null ? value : 'N/A', name]} />
                        <Legend verticalAlign="top" height={36} />
                        {chartType === "weight" ? (
                          <>
                            <Area type="monotone" dataKey="weightPlus2SD" stackId="zband" stroke="none" fill="#e0e7ff" fillOpacity={0.4} name="+2 SD" />
                            <Area type="monotone" dataKey="weightMinus2SD" stackId="zband-low" stroke="none" fill="#fef3c7" fillOpacity={0.3} name="-2 SD (Underweight)" />
                            <Line type="monotone" dataKey="weightWho" name="WHO Median" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="weightChild" name="Patient Weight (kg)" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                          </>
                        ) : (
                          <>
                            <Area type="monotone" dataKey="heightPlus2SD" stackId="zband" stroke="none" fill="#fce7f3" fillOpacity={0.4} name="+2 SD" />
                            <Area type="monotone" dataKey="heightMinus2SD" stackId="zband-low" stroke="none" fill="#fef3c7" fillOpacity={0.3} name="-2 SD (Stunted)" />
                            <Line type="monotone" dataKey="heightWho" name="WHO Median" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="heightChild" name="Patient Height (cm)" stroke="#ec4899" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                          </>
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Child summary panel */}
          <div className="space-y-6">
            <Card className="shadow-sm overflow-hidden border-t-4 border-t-indigo-600">
              <CardHeader className="bg-indigo-50/20 dark:bg-indigo-950/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" /> Child Wellness Record
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-semibold">{selectedPatient.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">DOB:</span>
                  <span>{selectedPatient.dob}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedPatient.age} Months</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Mother Name:</span>
                  <span>{selectedPatient.motherName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Mother NID:</span>
                  <span className="font-mono text-xs">{selectedPatient.motherId}</span>
                </div>

                {muacAlert && (
                  <div className={`p-3 rounded-lg border text-xs flex gap-2 items-start ${muacAlert.color}`}>
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Nutrition Advisory</p>
                      <p>{muacAlert.label} based on latest MUAC tape measurement.</p>
                    </div>
                  </div>
                )}

                {nextVax ? (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/15 rounded-lg text-xs flex gap-2 items-start border border-indigo-100 dark:border-indigo-950">
                    <Syringe className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-indigo-700 dark:text-indigo-400">Next Action Required</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {nextVax.name} dose is target scheduled for <strong>{nextVax.dueDate}</strong> ({nextVax.status}).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex gap-2 items-center">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <p className="font-medium">All immunization guidelines fully completed for current schedule.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <AIAssistantPanel 
              department="Pediatrics"
              patientData={selectedPatient}
              context="Early childhood development, nutritional screening, and vaccine schedule audit."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed rounded-2xl">
          <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center">
            <Baby className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">No Pediatric Record Loaded</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Search by Child ID (e.g. <strong>PED001</strong>) or Mother's ID to check immunization schedules, weight metrics and WHO percentiles.
            </p>
          </div>
        </div>
      )}

      {/* Vaccine Administration dialog */}
      <Dialog open={isVaxModalOpen} onOpenChange={setIsVaxModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Administer Pediatric Vaccine</DialogTitle>
            <DialogDescription>
              Submit the dose administration logs to record vaccine inventory details.
            </DialogDescription>
          </DialogHeader>
          {selectedVax && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm">
                <p><strong>Vaccine:</strong> {selectedVax.name}</p>
                <p><strong>Scheduled target:</strong> {selectedVax.dueDate}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch" className="font-semibold text-xs">Vial Batch Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="batch" 
                  placeholder="e.g. LOT-A3258-B" 
                  value={vaxBatch} 
                  onChange={(e) => setVaxBatch(e.target.value)} 
                />
              </div>
              
              <div className="p-3 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-lg flex gap-2 text-xs border border-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>Ensure expiration date and storage temperature logs are verified before patient administration.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVaxModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdministerVax} disabled={!vaxBatch || isAdministering} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isAdministering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Dose Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
