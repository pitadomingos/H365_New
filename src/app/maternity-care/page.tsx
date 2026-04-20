
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Baby, Search, CalendarPlus, FileText, ShieldAlert, Microscope, ScanSearch, FlaskConical, RadioTower, Loader2, CalendarIcon, Save, UserPlus, Info, Thermometer, Weight, Ruler, Sigma, Activity, ActivityIcon as BloodPressureIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addWeeks, addDays } from "date-fns";
import { ptBR } from 'date-fns/locale'; // Import ptBR locale
import { cn } from "@/lib/utils";
import { COMMON_ORDERABLE_LAB_TESTS, type OrderableLabTest } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import { MOCK_MATERNITY_PATIENTS } from '@/lib/mock-data';


interface AntenatalVisit {
  id: string;
  date: string;
  gestationalAge: string; 
  weightKg: string;
  bp: string; 
  fhrBpm: string; 
  fundalHeightCm: string;
  notes: string;
  nextAppointment?: string;
  bodyTemperature?: string;
  heightCm?: string;
  bmi?: string;
  bmiStatus?: string;
  bpStatus?: string;
}

interface MaternityPatient {
  id: string;
  nationalId: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  photoUrl: string;
  lmp?: string; 
  edd: string; 
  gestationalAge: string;
  gravida: string; 
  para: string;    
  bloodGroup: string;
  rhFactor: string;
  allergies: string[];
  chronicConditions: string[]; 
  riskFactors: string[];
  antenatalVisits: AntenatalVisit[];
}

const mockPatientsList: MaternityPatient[] = [
  {
    id: "MP001",
    nationalId: "112233445",
    fullName: "Aisha Sharma",
    age: 28,
    gender: "Female",
    photoUrl: "https://placehold.co/100x100.png",
    lmp: "2024-03-01",
    edd: "2024-12-06", 
    gestationalAge: "24w 5d", 
    gravida: "1",
    para: "0",
    bloodGroup: "O+",
    rhFactor: "Positive",
    allergies: ["Penicillin"],
    chronicConditions: ["Mild Asthma"],
    riskFactors: ["None Identified"],
    antenatalVisits: [
      { id: "AV001", date: "2024-05-10", gestationalAge: "10w 1d", weightKg: "60", bp: "110/70", fhrBpm: "150", fundalHeightCm: "N/A", notes: "First visit, all good.", nextAppointment: "2024-06-10", bodyTemperature: "36.8", heightCm: "165", bmi: "22.0", bmiStatus: "Normal weight", bpStatus: "Normal" },
      { id: "AV002", date: "2024-06-12", gestationalAge: "14w 3d", weightKg: "62", bp: "115/75", fhrBpm: "155", fundalHeightCm: "15", notes: "Routine checkup, anomaly scan advised.", nextAppointment: "2024-07-12", bodyTemperature: "37.0", heightCm: "165", bmi: "22.7", bmiStatus: "Normal weight", bpStatus: "Normal" },
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  },
   {
    id: "MP002",
    nationalId: "556677889",
    fullName: "Maria Rodriguez",
    age: 32,
    gender: "Female",
    photoUrl: "https://placehold.co/100x100.png",
    lmp: "2024-05-15",
    edd: "2025-02-19",
    gestationalAge: "13w 2d",
    gravida: "2",
    para: "1",
    bloodGroup: "A-",
    rhFactor: "Negative",
    allergies: [],
    chronicConditions: ["Gestational Diabetes (Previous Pregnancy)"], 
    riskFactors: ["Advanced Maternal Age", "History of GDM"],
    antenatalVisits: [
      { id: "AV003", date: "2024-07-20", gestationalAge: "9w 2d", weightKg: "70", bp: "120/80", fhrBpm: "160", fundalHeightCm: "N/A", notes: "Booking visit. GTT scheduled.", nextAppointment: "2024-08-20", bodyTemperature: "37.1", heightCm: "160", bmi: "27.3", bmiStatus: "Overweight", bpStatus: "Elevated"},
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  }
];

interface NewVisitFormState {
  visitDate?: Date;
  gestationalAge: string;
  weightKg: string;
  bp: string;
  fhrBpm: string;
  fundalHeightCm: string;
  notes: string;
  nextAppointmentDate?: Date;
  bodyTemperature?: string;
  heightCm?: string;
}

interface MaternityIntakeFormState {
    nationalId: string;
    fullName: string;
    dob?: Date;
    gender: "Male" | "Female" | "Other" | "";
    lmp?: Date;
    edd?: Date; 
    gravida: string;
    para: string;
    bloodGroup: string;
    rhFactor: string;
    allergies: string; 
    chronicConditions: string; 
}

const getBmiStatusAndColor = (bmi: number | null, t: (key: string) => string): { status: string; colorClass: string; textColorClass: string; } => {
  if (bmi === null || isNaN(bmi)) {
    return { status: t('consultationForm.vitals.bmiStatus.na'), colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
  }
  if (bmi < 18.5) {
    return { status: t('consultationForm.vitals.bmiStatus.underweight'), colorClass: "bg-blue-100 dark:bg-blue-800/30", textColorClass: "text-blue-700 dark:text-blue-300" };
  } else if (bmi < 25) {
    return { status: t('consultationForm.vitals.bmiStatus.normal'), colorClass: "bg-green-100 dark:bg-green-800/30", textColorClass: "text-green-700 dark:text-green-300" };
  } else if (bmi < 30) {
    return { status: t('consultationForm.vitals.bmiStatus.overweight'), colorClass: "bg-yellow-100 dark:bg-yellow-800/30", textColorClass: "text-yellow-700 dark:text-yellow-300" };
  } else if (bmi < 35) {
    return { status: t('consultationForm.vitals.bmiStatus.obese1'), colorClass: "bg-orange-100 dark:bg-orange-800/30", textColorClass: "text-orange-700 dark:text-orange-300" };
  } else if (bmi < 40) {
    return { status: t('consultationForm.vitals.bmiStatus.obese2'), colorClass: "bg-red-100 dark:bg-red-800/30", textColorClass: "text-red-700 dark:text-red-300" };
  } else {
    return { status: t('consultationForm.vitals.bmiStatus.obese3'), colorClass: "bg-red-200 dark:bg-red-900/40", textColorClass: "text-red-800 dark:text-red-200" };
  }
};

const getBloodPressureStatus = (bp: string, t: (key: string) => string): { status: string; colorClass: string; textColorClass: string; } => {
  if (!bp || !bp.includes('/')) {
    return { status: t('consultationForm.vitals.bpStatus.na'), colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
  }
  const parts = bp.split('/');
  const systolic = parseInt(parts[0], 10);
  const diastolic = parseInt(parts[1], 10);

  if (isNaN(systolic) || isNaN(diastolic)) {
    return { status: t('consultationForm.vitals.bpStatus.invalid'), colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
  }

  if (systolic < 90 || diastolic < 60) {
    return { status: t('consultationForm.vitals.bpStatus.hypotension'), colorClass: "bg-blue-100 dark:bg-blue-800/30", textColorClass: "text-blue-700 dark:text-blue-300" };
  } else if (systolic < 120 && diastolic < 80) {
    return { status: t('consultationForm.vitals.bpStatus.normal'), colorClass: "bg-green-100 dark:bg-green-800/30", textColorClass: "text-green-700 dark:text-green-300" };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return { status: t('consultationForm.vitals.bpStatus.elevated'), colorClass: "bg-yellow-100 dark:bg-yellow-800/30", textColorClass: "text-yellow-700 dark:text-yellow-300" };
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { status: t('consultationForm.vitals.bpStatus.stage1'), colorClass: "bg-orange-100 dark:bg-orange-800/30", textColorClass: "text-orange-700 dark:text-orange-300" };
  } else if (systolic >= 140 || diastolic >= 90) {
    return { status: t('consultationForm.vitals.bpStatus.stage2'), colorClass: "bg-red-100 dark:bg-red-800/30", textColorClass: "text-red-700 dark:text-red-300" };
  } else if (systolic > 180 || diastolic > 120) {
    return { status: t('consultationForm.vitals.bpStatus.crisis'), colorClass: "bg-red-200 dark:bg-red-900/40", textColorClass: "text-red-800 dark:text-red-200" };
  }
  return { status: t('consultationForm.vitals.bpStatus.na'), colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
};


export default function MaternityCarePage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [searchNationalId, setSearchNationalId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<MaternityPatient | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [patientNotFound, setPatientNotFound] = useState(false);

  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [isLoggingVisit, setIsLoggingVisit] = useState(false);
  const [newVisitForm, setNewVisitForm] = useState<NewVisitFormState>({
    gestationalAge: "", weightKg: "", bp: "", fhrBpm: "", fundalHeightCm: "", notes: "", bodyTemperature: "", heightCm: ""
  });
  const [newVisitBmi, setNewVisitBmi] = useState<string | null>(null);
  const [newVisitBmiDisplay, setNewVisitBmiDisplay] = useState<{ status: string; colorClass: string; textColorClass: string; } | null>(null);
  const [newVisitBpDisplay, setNewVisitBpDisplay] = useState<{ status: string; colorClass: string, textColorClass: string; } | null>(null);


  const [selectedLabTests, setSelectedLabTests] = useState<Record<string, boolean>>({});
  const [isOrderingLabs, setIsOrderingLabs] = useState(false);
  const [isOrderingImaging, setIsOrderingImaging] = useState(false);
  
  const [isScheduleNextVisitModalOpen, setIsScheduleNextVisitModalOpen] = useState(false);
  const [isSchedulingNextVisit, setIsSchedulingNextVisit] = useState(false);
  const [nextScheduledDate, setNextScheduledDate] = useState<Date | undefined>();
  const [nextScheduledNotes, setNextScheduledNotes] = useState("");

  const [isMaternityIntakeModalOpen, setIsMaternityIntakeModalOpen] = useState(false);
  const [maternityIntakeForm, setMaternityIntakeForm] = useState<MaternityIntakeFormState>({
    nationalId: "", fullName: "", gender: "", gravida: "", para: "", bloodGroup: "", rhFactor: "", allergies: "", chronicConditions: "" 
  });
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  const [allMaternityPatients, setAllMaternityPatients] = useState<MaternityPatient[]>(MOCK_MATERNITY_PATIENTS as MaternityPatient[]);


  const calculateEdd = (lmp: Date | undefined): Date | undefined => {
    if (!lmp) return undefined;
    return addDays(addWeeks(lmp, 40), 0); 
  };
  
  useEffect(() => {
    if (maternityIntakeForm.lmp) {
      const calculated = calculateEdd(maternityIntakeForm.lmp);
      if (calculated) {
        setMaternityIntakeForm(prev => ({ ...prev, edd: calculated }));
      }
    }
  }, [maternityIntakeForm.lmp]);

  useEffect(() => {
    const w = parseFloat(newVisitForm.weightKg || '0');
    const h = parseFloat(newVisitForm.heightCm || '0');
    if (w > 0 && h > 0) {
      const hM = h / 100;
      const calculatedBmi = w / (hM * hM);
      setNewVisitBmi(calculatedBmi.toFixed(2));
      setNewVisitBmiDisplay(getBmiStatusAndColor(calculatedBmi, t));
    } else {
      setNewVisitBmi(null);
      setNewVisitBmiDisplay(getBmiStatusAndColor(null, t));
    }
  }, [newVisitForm.weightKg, newVisitForm.heightCm, t]);

  useEffect(() => {
    setNewVisitBpDisplay(getBloodPressureStatus(newVisitForm.bp || "", t));
  }, [newVisitForm.bp, t]);

  const getAvatarHint = (gender?: "Male" | "Female" | "Other") => {
    if (gender === "Male") return "male avatar";
    if (gender === "Female") return "female avatar";
    return "patient avatar";
  };

  const handleSearch = async () => {
    if (!searchNationalId) {
      toast({ variant: "destructive", title: t('maternity.generalError'), description: t('maternity.toast.search.error') });
      return;
    }
    setIsLoadingSearch(true);
    setSelectedPatient(null);
    setPatientNotFound(false);
    
    console.log(`Mock searching for maternity patient with ID: ${searchNationalId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const found = allMaternityPatients.find(p => p.nationalId === searchNationalId);
    if (found) {
      setSelectedPatient(found);
      toast({ title: t('maternity.toast.search.found'), description: t('maternity.toast.search.found.desc', {fullName: found.fullName}) });
    } else {
      setPatientNotFound(true);
      toast({ variant: "default", title: t('maternity.toast.search.notFound'), description: t('maternity.toast.search.notFound.desc', {searchNationalId: searchNationalId})});
    }
    setIsLoadingSearch(false);
  };

  const handleLabTestSelection = (testId: string, checked: boolean) => {
    setSelectedLabTests(prev => ({ ...prev, [testId]: checked }));
  };

  const handleSubmitLabOrder = async () => {
    if (!selectedPatient) return;
    setIsOrderingLabs(true);
    const orderedTests = COMMON_ORDERABLE_LAB_TESTS.filter(test => selectedLabTests[test.id]);
    const orderedTestIds = orderedTests.map(test => test.id);
    const orderedTestLabels = orderedTests.map(test => test.label);

    const payload = {
      patientId: selectedPatient.nationalId, 
      maternityContext: true, 
      testIds: orderedTestIds,
      clinicalNotes: (document.getElementById('maternityLabClinicalNotes') as HTMLTextAreaElement)?.value || ""
    };

    console.log("Submitting Maternity Lab Order (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: t('maternity.toast.labOrder.submitted'), 
      description:t('maternity.toast.labOrder.submitted.desc', {patientName: selectedPatient.fullName, testLabels: (orderedTestLabels.length > 0 ? orderedTestLabels.join(', ') : t('maternity.noSpecificTests')) })
    });
    setSelectedLabTests({});
    const notesEl = document.getElementById('maternityLabClinicalNotes') as HTMLTextAreaElement;
    if (notesEl) notesEl.value = "";
    setIsOrderingLabs(false);
  }

  const handleSubmitImagingOrder = async () => {
     if (!selectedPatient) return;
    setIsOrderingImaging(true);

    const payload = {
        patientId: selectedPatient.nationalId,
        maternityContext: true, 
        imagingType: (document.getElementById('maternityImagingType') as HTMLSelectElement)?.value || "",
        regionDetails: (document.getElementById('maternityImagingRegionDetails') as HTMLTextAreaElement)?.value || "",
        clinicalNotes: (document.getElementById('maternityImagingClinicalNotes') as HTMLTextAreaElement)?.value || ""
    };
    console.log("Submitting Maternity Imaging Order (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({title: t('maternity.toast.imagingOrder.submitted'), description:t('maternity.toast.imagingOrder.submitted.desc', {patientName: selectedPatient.fullName, imagingType: payload.imagingType, regionDetails: payload.regionDetails})});
    
    const typeEl = document.getElementById('maternityImagingType') as HTMLSelectElement;
    const regionEl = document.getElementById('maternityImagingRegionDetails') as HTMLTextAreaElement;
    const notesEl = document.getElementById('maternityImagingClinicalNotes') as HTMLTextAreaElement;
    if (typeEl) typeEl.value = "";
    if (regionEl) regionEl.value = "";
    if (notesEl) notesEl.value = "";
    setIsOrderingImaging(false);
  }

  const handleNewVisitFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewVisitForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogNewVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newVisitForm.visitDate) {
        toast({ variant: "destructive", title: t('maternity.toast.newVisit.missingInfo'), description: t('maternity.toast.newVisit.missingInfo.desc') });
        return;
    }
    setIsLoggingVisit(true);

    const payload = {
        patientId: selectedPatient.id,
        visitDate: format(newVisitForm.visitDate, "yyyy-MM-dd"),
        gestationalAge: newVisitForm.gestationalAge,
        weightKg: newVisitForm.weightKg,
        bp: newVisitForm.bp,
        fhrBpm: newVisitForm.fhrBpm,
        fundalHeightCm: newVisitForm.fundalHeightCm,
        notes: newVisitForm.notes,
        nextAppointmentDate: newVisitForm.nextAppointmentDate ? format(newVisitForm.nextAppointmentDate, "yyyy-MM-dd") : undefined,
        bodyTemperature: newVisitForm.bodyTemperature,
        heightCm: newVisitForm.heightCm,
        bmi: newVisitBmi,
        bmiStatus: newVisitBmiDisplay?.status || undefined,
        bpStatus: newVisitBpDisplay?.status || undefined,
    };
    console.log("Submitting new antenatal visit (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const savedVisit: AntenatalVisit = { 
        id: `AV${Date.now()}`,
        ...payload,
        bmiStatus: payload.bmiStatus || "N/A", // Ensure these have default values
        bpStatus: payload.bpStatus || "N/A",   // Ensure these have default values
    };

    setSelectedPatient(prev => prev ? ({ ...prev, antenatalVisits: [savedVisit, ...prev.antenatalVisits].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }) : null);
    setAllMaternityPatients(prevPatients => prevPatients.map(p => p.id === selectedPatient.id ? {...p, antenatalVisits: [savedVisit, ...(p.antenatalVisits || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())} : p));


    toast({ title: t('maternity.toast.newVisit.logged'), description: t('maternity.toast.newVisit.logged.desc', {date: savedVisit.date, patientName: selectedPatient.fullName})});
    setIsNewVisitModalOpen(false);
    setNewVisitForm({ visitDate: undefined, gestationalAge: "", weightKg: "", bp: "", fhrBpm: "", fundalHeightCm: "", notes: "", bodyTemperature: "", heightCm: "", nextAppointmentDate: undefined }); 
    setNewVisitBmi(null);
    setNewVisitBmiDisplay(null);
    setNewVisitBpDisplay(null);
    setIsLoggingVisit(false);
  };
  
  const handleScheduleNextVisitSubmit = async () => {
    if (!selectedPatient || !nextScheduledDate) {
        toast({ variant: "destructive", title: t('maternity.toast.scheduleNextVisit.missingDate'), description: t('maternity.toast.scheduleNextVisit.missingDate.desc') });
        return;
    }
    setIsSchedulingNextVisit(true);
    const payload = {
        patientId: selectedPatient.id,
        nextVisitDate: format(nextScheduledDate, "yyyy-MM-dd"),
        notes: nextScheduledNotes,
    };
    console.log("Scheduling next ANC visit (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: t('maternity.toast.scheduleNextVisit.success'), description: t('maternity.toast.scheduleNextVisit.success.desc', {patientName: selectedPatient.fullName, date: format(nextScheduledDate, "PPP"), notes: nextScheduledNotes})});
    setIsScheduleNextVisitModalOpen(false);
    setNextScheduledDate(undefined);
    setNextScheduledNotes("");
    setIsSchedulingNextVisit(false);
  };

  const handleIntakeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMaternityIntakeForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMaternityIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nationalId, fullName, dob, gender, lmp, edd, gravida, para } = maternityIntakeForm;
    if (!nationalId || !fullName || !dob || !gender || !lmp || !edd || !gravida || !para) {
        toast({ variant: "destructive", title: t('maternity.toast.intake.missingInfo'), description: t('maternity.toast.intake.missingInfo.desc') });
        return;
    }
    setIsSubmittingIntake(true);
    console.log("Submitting maternity intake (mock):", maternityIntakeForm);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newMaternityPatient: MaternityPatient = {
        id: `MP${Date.now()}`,
        nationalId,
        fullName,
        age: new Date().getFullYear() - new Date(dob).getFullYear(), 
        gender: gender as MaternityPatient["gender"],
        photoUrl: "https://placehold.co/100x100.png", 
        lmp: format(lmp, "yyyy-MM-dd"),
        edd: format(edd, "yyyy-MM-dd"),
        gestationalAge: "0w 0d", 
        gravida: gravida,
        para: para,
        bloodGroup: maternityIntakeForm.bloodGroup,
        rhFactor: maternityIntakeForm.rhFactor,
        allergies: maternityIntakeForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: maternityIntakeForm.chronicConditions.split(',').map(s => s.trim()).filter(Boolean), 
        riskFactors: [], 
        antenatalVisits: [], 
    };

    setAllMaternityPatients(prev => [...prev, newMaternityPatient]);
    setSelectedPatient(newMaternityPatient); 
    toast({ title: t('maternity.toast.intake.success'), description: t('maternity.toast.intake.success.desc', {fullName: newMaternityPatient.fullName}) });
    setIsMaternityIntakeModalOpen(false);
    setMaternityIntakeForm({ nationalId: "", fullName: "", gender: "", gravida: "", para: "", bloodGroup: "", rhFactor: "", allergies: "", chronicConditions: "" }); 
    setPatientNotFound(false); 
    setSearchNationalId(newMaternityPatient.nationalId); 
    setIsSubmittingIntake(false);
  };

  const latestVisitVitals = selectedPatient?.antenatalVisits?.[0];


  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Baby className="h-8 w-8" /> {t('maternity.pageTitle')}
          </h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('maternity.searchCard.title')}</CardTitle>
            <CardDescription>{t('maternity.searchCard.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Input
                id="searchNationalId"
                placeholder={t('maternity.search.placeholder')}
                value={searchNationalId}
                onChange={(e) => setSearchNationalId(e.target.value)}
                className="max-w-xs"
                disabled={isLoadingSearch}
              />
              <Button onClick={handleSearch} disabled={isLoadingSearch || !searchNationalId.trim()}>
                {isLoadingSearch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {isLoadingSearch ? t('maternity.search.button.loading') : t('maternity.search.button')}
              </Button>
               <Dialog open={isMaternityIntakeModalOpen} onOpenChange={(open) => {
                    if (!open) {
                        setMaternityIntakeForm({ nationalId: searchNationalId || "", fullName: "", gender: "", gravida: "", para: "", bloodGroup: "", rhFactor: "", allergies: "", chronicConditions: "" }); 
                    } else {
                        setMaternityIntakeForm(prev => ({ ...prev, nationalId: searchNationalId || ""}));
                    }
                    setIsMaternityIntakeModalOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button variant="default" className="mt-2 sm:mt-0 w-full sm:w-auto">
                            <UserPlus className="mr-2 h-4 w-4"/> {t('maternity.registerButton')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <form onSubmit={handleMaternityIntakeSubmit}>
                            <DialogHeader>
                                <DialogTitle>{t('maternity.intakeModal.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('maternity.intakeModal.description')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <Separator/>
                                <h3 className="font-semibold text-md">{t('maternity.intakeModal.demographics.title')}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeNationalId">{t('maternity.intakeModal.nationalId.label')} <span className="text-destructive">*</span></Label>
                                        <Input id="intakeNationalId" name="nationalId" value={maternityIntakeForm.nationalId} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.nationalId.placeholder')} required disabled={isSubmittingIntake}/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeFullName">{t('maternity.intakeModal.fullName.label')} <span className="text-destructive">*</span></Label>
                                        <Input id="intakeFullName" name="fullName" value={maternityIntakeForm.fullName} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.fullName.placeholder')} required disabled={isSubmittingIntake}/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeDob">{t('maternity.intakeModal.dob.label')} <span className="text-destructive">*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !maternityIntakeForm.dob && "text-muted-foreground")} disabled={isSubmittingIntake}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {maternityIntakeForm.dob ? format(maternityIntakeForm.dob, "PPP") : <span>{t('maternity.intakeModal.dob.placeholder')}</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar locale={currentLocale === 'pt' ? ptBR : undefined} mode="single" selected={maternityIntakeForm.dob} onSelect={(date) => setMaternityIntakeForm(prev => ({...prev, dob: date}))} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeGender">{t('maternity.intakeModal.gender.label')} <span className="text-destructive">*</span></Label>
                                        <Select name="gender" value={maternityIntakeForm.gender} onValueChange={(val) => setMaternityIntakeForm(prev => ({...prev, gender: val as MaternityIntakeFormState["gender"]}))} required disabled={isSubmittingIntake}>
                                            <SelectTrigger id="intakeGender"><SelectValue placeholder={t('maternity.intakeModal.gender.placeholder')} /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Female">{t('patientRegistration.gender.female')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator/>
                                <h3 className="font-semibold text-md">{t('maternity.intakeModal.maternityInfo.title')}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeLmp">{t('maternity.intakeModal.lmp.label')} <span className="text-destructive">*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !maternityIntakeForm.lmp && "text-muted-foreground")} disabled={isSubmittingIntake}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {maternityIntakeForm.lmp ? format(maternityIntakeForm.lmp, "PPP") : <span>{t('maternity.intakeModal.lmp.placeholder')}</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar locale={currentLocale === 'pt' ? ptBR : undefined} mode="single" selected={maternityIntakeForm.lmp} onSelect={(date) => setMaternityIntakeForm(prev => ({...prev, lmp: date}))} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeEdd">{t('maternity.intakeModal.edd.label')}</Label>
                                        <Input id="intakeEdd" value={maternityIntakeForm.edd ? format(maternityIntakeForm.edd, "PPP") : t('maternity.intakeModal.edd.autoCalculated')} readOnly disabled className="bg-muted/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeGravida">{t('maternity.intakeModal.gravida.label')} <span className="text-destructive">*</span></Label>
                                        <Input id="intakeGravida" name="gravida" type="number" value={maternityIntakeForm.gravida} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.gravida.placeholder')} required disabled={isSubmittingIntake}/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakePara">{t('maternity.intakeModal.para.label')} <span className="text-destructive">*</span></Label>
                                        <Input id="intakePara" name="para" type="number" value={maternityIntakeForm.para} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.para.placeholder')} required disabled={isSubmittingIntake}/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeBloodGroup">{t('maternity.intakeModal.bloodGroup.label')}</Label>
                                        <Input id="intakeBloodGroup" name="bloodGroup" value={maternityIntakeForm.bloodGroup} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.bloodGroup.placeholder')} disabled={isSubmittingIntake}/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="intakeRhFactor">{t('maternity.intakeModal.rhFactor.label')}</Label>
                                        <Input id="intakeRhFactor" name="rhFactor" value={maternityIntakeForm.rhFactor} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.rhFactor.placeholder')} disabled={isSubmittingIntake}/>
                                    </div>
                                </div>
                                <Separator/>
                                <h3 className="font-semibold text-md">{t('maternity.intakeModal.medicalHistory.title')}</h3>
                                <div className="space-y-1">
                                    <Label htmlFor="intakeAllergies">{t('maternity.intakeModal.allergies.label')}</Label>
                                    <Textarea id="intakeAllergies" name="allergies" value={maternityIntakeForm.allergies} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.allergies.placeholder')} disabled={isSubmittingIntake}/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="intakeChronicConditions">{t('maternity.intakeModal.chronicConditions.label')}</Label>
                                    <Textarea id="intakeChronicConditions" name="chronicConditions" value={maternityIntakeForm.chronicConditions} onChange={handleIntakeFormChange} placeholder={t('maternity.intakeModal.chronicConditions.placeholder')} disabled={isSubmittingIntake}/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingIntake}>{t('maternity.intakeModal.cancelButton')}</Button></DialogClose>
                                <Button type="submit" disabled={isSubmittingIntake}>
                                    {isSubmittingIntake ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    {isSubmittingIntake ? t('maternity.intakeModal.submitButton.loading') : t('maternity.intakeModal.submitButton')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            {patientNotFound && (
                 <Alert variant="default" className="border-primary/50">
                    <Info className="h-5 w-5 text-primary" />
                    <AlertTitle>{t('maternity.patientNotFound.title')}</AlertTitle>
                    <AlertDescription>
                    {t('maternity.patientNotFound.description', {searchNationalId: searchNationalId})}
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>

        {selectedPatient && (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[calc(theme(spacing.16)_+_theme(spacing.6))]">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Image
                        src={selectedPatient.photoUrl}
                        alt={selectedPatient.fullName}
                        width={80}
                        height={80}
                        className="rounded-md border"
                        data-ai-hint={getAvatarHint(selectedPatient.gender)}
                    />
                    <div className="flex-1">
                        <CardTitle>{selectedPatient.fullName}</CardTitle>
                        <CardDescription>ID: {selectedPatient.nationalId} | {t('consultationForm.patientInfo.age')}: {selectedPatient.age} | {t('consultationForm.patientInfo.gender')}: {t(`patientRegistration.gender.${selectedPatient.gender.toLowerCase()}` as any)}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p><strong>{t('maternity.patientOverview.lmp')}</strong> {selectedPatient.lmp ? new Date(selectedPatient.lmp + "T00:00:00").toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US') : "N/A"}</p>
                  <p><strong>{t('maternity.patientOverview.edd')}</strong> {new Date(selectedPatient.edd + "T00:00:00").toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')} ({selectedPatient.gestationalAge})</p>
                  <p><strong>{t('maternity.patientOverview.gravidaPara')}</strong> G{selectedPatient.gravida} P{selectedPatient.para}</p>
                  <p><strong>{t('maternity.patientOverview.bloodGroup')}</strong> {selectedPatient.bloodGroup} ({selectedPatient.rhFactor})</p>
                   {latestVisitVitals && (
                    <>
                        <Separator className="my-2"/>
                        <h4 className="font-medium flex items-center gap-1"><Activity className="mr-1.5 h-4 w-4 text-primary"/>{t('maternity.patientOverview.latestVitals.title', {date: new Date(latestVisitVitals.date+"T00:00:00").toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')})}:</h4>
                        <p>{t('maternity.patientOverview.latestVitals.temp')} {latestVisitVitals.bodyTemperature || 'N/A'}°C | {t('maternity.patientOverview.latestVitals.bp')} {latestVisitVitals.bp || 'N/A'} {latestVisitVitals.bpStatus && <Badge variant="outline" className={cn("ml-1 text-xs", getBloodPressureStatus(latestVisitVitals.bp || "", t).colorClass, getBloodPressureStatus(latestVisitVitals.bp || "", t).textColorClass )}>{latestVisitVitals.bpStatus}</Badge>}</p>
                        <p>{t('maternity.patientOverview.latestVitals.wt')} {latestVisitVitals.weightKg || 'N/A'}kg | {t('maternity.patientOverview.latestVitals.ht')} {latestVisitVitals.heightCm || 'N/A'}cm | {t('maternity.patientOverview.latestVitals.bmi')} {latestVisitVitals.bmi || 'N/A'} {latestVisitVitals.bmiStatus && <Badge variant="outline" className={cn("ml-1 text-xs", getBmiStatusAndColor(parseFloat(latestVisitVitals.bmi || "0"), t).colorClass, getBmiStatusAndColor(parseFloat(latestVisitVitals.bmi || "0"), t).textColorClass )}>{latestVisitVitals.bmiStatus}</Badge>}</p>
                    </>
                  )}
                  <Separator className="my-2"/>
                  <div>
                    <h4 className="font-medium">{t('maternity.patientOverview.allergies.title')}</h4>
                    {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(', ') : <span className="text-muted-foreground">{t('maternity.patientOverview.allergies.none')}</span>}
                  </div>
                   <div>
                    <h4 className="font-medium">{t('maternity.patientOverview.chronicConditions.title')}</h4>
                    {selectedPatient.chronicConditions.length > 0 ? selectedPatient.chronicConditions.join(', ') : <span className="text-muted-foreground">{t('maternity.patientOverview.chronicConditions.none')}</span>}
                  </div>
                  <Separator />
                   <div>
                     <h4 className="font-medium flex items-center gap-1"><ShieldAlert className="h-4 w-4 text-destructive" /> {t('maternity.patientOverview.riskFactors.title')}</h4>
                    {selectedPatient.riskFactors.length > 0 ? (
                        <ul className="list-disc list-inside text-destructive">
                            {selectedPatient.riskFactors.map(risk => <li key={risk}>{risk}</li>)}
                        </ul>
                    ): <span className="text-muted-foreground">{t('maternity.patientOverview.riskFactors.none')}</span>}
                  </div>
                </CardContent>
                 <CardFooter className="flex-col items-start gap-2">
                    <Dialog open={isScheduleNextVisitModalOpen} onOpenChange={setIsScheduleNextVisitModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={!selectedPatient || isSchedulingNextVisit}>
                                {isSchedulingNextVisit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CalendarPlus className="mr-2 h-4 w-4"/>}
                                {isSchedulingNextVisit ? t('maternity.patientOverview.scheduleNextVisitButton.loading') : t('maternity.patientOverview.scheduleNextVisitButton')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('maternity.scheduleNextVisitModal.title', {patientName: selectedPatient.fullName})}</DialogTitle>
                                <DialogDescription>{t('maternity.scheduleNextVisitModal.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nextScheduledDate">{t('maternity.scheduleNextVisitModal.date.label')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal",!nextScheduledDate && "text-muted-foreground")}
                                            disabled={isSchedulingNextVisit}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {nextScheduledDate ? format(nextScheduledDate, "PPP") : <span>{t('maternity.scheduleNextVisitModal.date.placeholder')}</span>}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                        <Calendar locale={currentLocale === 'pt' ? ptBR : undefined} mode="single" selected={nextScheduledDate} onSelect={setNextScheduledDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nextScheduledNotes">{t('maternity.scheduleNextVisitModal.notes.label')}</Label>
                                    <Textarea id="nextScheduledNotes" value={nextScheduledNotes} onChange={(e) => setNextScheduledNotes(e.target.value)} placeholder={t('maternity.scheduleNextVisitModal.notes.placeholder')} disabled={isSchedulingNextVisit}/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" disabled={isSchedulingNextVisit}>{t('maternity.scheduleNextVisitModal.cancelButton')}</Button></DialogClose>
                                <Button onClick={handleScheduleNextVisitSubmit} disabled={isSchedulingNextVisit || !nextScheduledDate}>
                                    {isSchedulingNextVisit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    {isSchedulingNextVisit ? t('maternity.scheduleNextVisitModal.submitButton.loading') : t('maternity.scheduleNextVisitModal.submitButton')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                 </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t('maternity.antenatalLog.title')}</CardTitle>
                  <CardDescription>{t('maternity.antenatalLog.description', {patientName: selectedPatient.fullName})}</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedPatient.antenatalVisits.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('maternity.antenatalLog.table.date')}</TableHead>
                          <TableHead>{t('maternity.antenatalLog.table.ga')}</TableHead>
                          <TableHead>{t('maternity.antenatalLog.table.wt')}</TableHead>
                          <TableHead>{t('maternity.antenatalLog.table.bp')}</TableHead>
                          <TableHead>{t('maternity.antenatalLog.table.fhr')}</TableHead>
                          <TableHead>{t('maternity.antenatalLog.table.notes')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.antenatalVisits.map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell>{new Date(visit.date + "T00:00:00").toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')}</TableCell>
                            <TableCell>{visit.gestationalAge}</TableCell>
                            <TableCell>{visit.weightKg}</TableCell>
                            <TableCell>{visit.bp}</TableCell>
                            <TableCell>{visit.fhrBpm} bpm</TableCell>
                            <TableCell className="text-xs max-w-xs truncate" title={visit.notes}>{visit.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">{t('maternity.antenatalLog.empty')}</p>
                  )}
                </CardContent>
                <CardFooter>
                    <Dialog open={isNewVisitModalOpen} onOpenChange={(open) => { if(!open) { setNewVisitForm({ visitDate: undefined, gestationalAge: "", weightKg: "", bp: "", fhrBpm: "", fundalHeightCm: "", notes: "", bodyTemperature: "", heightCm: "", nextAppointmentDate: undefined }); setNewVisitBmi(null); setNewVisitBmiDisplay(null); setNewVisitBpDisplay(null); } setIsNewVisitModalOpen(open);}}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedPatient || isLoggingVisit}>
                                {isLoggingVisit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CalendarPlus className="mr-2 h-4 w-4" />}
                                {isLoggingVisit ? t('maternity.antenatalLog.logNewVisitButton.loading') : t('maternity.antenatalLog.logNewVisitButton')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl"> 
                            <form onSubmit={handleLogNewVisitSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{t('maternity.newVisitModal.title', {patientName: selectedPatient.fullName})}</DialogTitle>
                                    <DialogDescription>{t('maternity.newVisitModal.description')}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="visitDate">{t('maternity.newVisitModal.visitDate.label')} <span className="text-destructive">*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!newVisitForm.visitDate && "text-muted-foreground")} disabled={isLoggingVisit}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newVisitForm.visitDate ? format(newVisitForm.visitDate, "PPP") : <span>{t('patientRegistration.dob.placeholder')}</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar locale={currentLocale === 'pt' ? ptBR : undefined} mode="single" selected={newVisitForm.visitDate} onSelect={(date) => setNewVisitForm(prev => ({...prev, visitDate: date}))} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gestationalAge">{t('maternity.newVisitModal.ga.label')}</Label>
                                            <Input id="gestationalAge" name="gestationalAge" value={newVisitForm.gestationalAge} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.ga.placeholder')} disabled={isLoggingVisit}/>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="bodyTemperature" className="flex items-center"><Thermometer className="mr-1.5 h-4 w-4 text-primary" />{t('maternity.newVisitModal.temp.label')}</Label>
                                            <Input id="bodyTemperature" name="bodyTemperature" value={newVisitForm.bodyTemperature || ""} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.temp.placeholder')} disabled={isLoggingVisit}/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="weightKg" className="flex items-center"><Weight className="mr-1.5 h-4 w-4 text-primary" />{t('maternity.newVisitModal.weight.label')}</Label>
                                            <Input id="weightKg" name="weightKg" type="number" step="0.1" value={newVisitForm.weightKg} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.weight.placeholder')} disabled={isLoggingVisit}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="heightCm" className="flex items-center"><Ruler className="mr-1.5 h-4 w-4 text-primary" />{t('maternity.newVisitModal.height.label')}</Label>
                                            <Input id="heightCm" name="heightCm" type="number" value={newVisitForm.heightCm || ""} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.height.placeholder')} disabled={isLoggingVisit}/>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-2 gap-4 items-center">
                                        <div className="space-y-1">
                                            <Label className="flex items-center text-xs"><Sigma className="mr-1.5 h-3 w-3" />{t('maternity.newVisitModal.bmi.label')}</Label>
                                            <div className="flex items-center gap-2 p-2 h-10 rounded-md border border-input bg-muted/50 min-w-[150px]">
                                                <span className="text-sm font-medium">{newVisitBmi || "N/A"}</span>
                                                {newVisitBmiDisplay && newVisitBmiDisplay.status !== t('consultationForm.vitals.bmiStatus.na') && (
                                                    <Badge className={cn("border-transparent text-xs px-1.5 py-0.5", newVisitBmiDisplay.colorClass, newVisitBmiDisplay.textColorClass)}>{newVisitBmiDisplay.status}</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="flex items-center text-xs"><BloodPressureIcon className="mr-1.5 h-3 w-3" />{t('maternity.newVisitModal.bpStatus.label')}</Label>
                                            <div className="flex items-center gap-2 p-2 h-10 rounded-md border border-input bg-muted/50 min-w-[150px]">
                                                {newVisitBpDisplay && newVisitBpDisplay.status !== t('consultationForm.vitals.bpStatus.na') && newVisitBpDisplay.status !== t('consultationForm.vitals.bpStatus.invalid') && (
                                                    <Badge className={cn("border-transparent text-xs px-1.5 py-0.5", newVisitBpDisplay.colorClass, newVisitBpDisplay.textColorClass)}>{newVisitBpDisplay.status}</Badge>
                                                )}
                                                {(newVisitBpDisplay?.status === t('consultationForm.vitals.bpStatus.na') || newVisitBpDisplay?.status === t('consultationForm.vitals.bpStatus.invalid')) && (
                                                <span className="text-sm font-medium">{newVisitBpDisplay.status}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bp" className="flex items-center"><BloodPressureIcon className="mr-1.5 h-4 w-4 text-primary" />{t('maternity.newVisitModal.bp.label')}</Label>
                                            <Input id="bp" name="bp" value={newVisitForm.bp} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.bp.placeholder')} disabled={isLoggingVisit}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fhrBpm">{t('maternity.newVisitModal.fhr.label')}</Label>
                                            <Input id="fhrBpm" name="fhrBpm" type="number" value={newVisitForm.fhrBpm} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.fhr.placeholder')} disabled={isLoggingVisit}/>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fundalHeightCm">{t('maternity.newVisitModal.fundalHeight.label')}</Label>
                                        <Input id="fundalHeightCm" name="fundalHeightCm" type="number" value={newVisitForm.fundalHeightCm} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.fundalHeight.placeholder')} disabled={isLoggingVisit}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">{t('maternity.newVisitModal.notes.label')}</Label>
                                        <Textarea id="notes" name="notes" value={newVisitForm.notes} onChange={handleNewVisitFormChange} placeholder={t('maternity.newVisitModal.notes.placeholder')} disabled={isLoggingVisit}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nextAppointmentDate">{t('maternity.newVisitModal.nextAppointment.label')}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full justify-start text-left font-normal",!newVisitForm.nextAppointmentDate && "text-muted-foreground")}
                                                disabled={isLoggingVisit}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newVisitForm.nextAppointmentDate ? format(newVisitForm.nextAppointmentDate, "PPP") : <span>{t('patientRegistration.dob.placeholder')}</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar locale={currentLocale === 'pt' ? ptBR : undefined} mode="single" selected={newVisitForm.nextAppointmentDate} onSelect={(date) => setNewVisitForm(prev => ({...prev, nextAppointmentDate: date}))} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="outline" disabled={isLoggingVisit}>{t('maternity.newVisitModal.cancelButton')}</Button></DialogClose>
                                    <Button type="submit" disabled={isLoggingVisit || !newVisitForm.visitDate}>
                                        {isLoggingVisit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        {isLoggingVisit ? t('maternity.newVisitModal.submitButton.loading') : t('maternity.newVisitModal.submitButton')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>{t('maternity.resultsSummary.title')}</CardTitle>
                    <CardDescription>{t('maternity.resultsSummary.description', {patientName: selectedPatient.fullName})}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label className="flex items-center gap-1.5"><ScanSearch className="h-4 w-4 text-primary"/>{t('maternity.resultsSummary.ultrasound.label')}</Label>
                        <Textarea readOnly defaultValue={t('maternity.resultsSummary.ultrasound.mockValue')} className="text-sm bg-muted/50"/>
                    </div>
                     <div className="space-y-1">
                        <Label className="flex items-center gap-1.5"><Microscope className="h-4 w-4 text-primary"/>{t('maternity.resultsSummary.lab.label')}</Label>
                        <Textarea readOnly defaultValue={t('maternity.resultsSummary.lab.mockValue')} className="text-sm bg-muted/50"/>
                    </div>
                </CardContent>
                 <CardFooter className="gap-2">
                    <Dialog onOpenChange={(open) => { if (!open) {setSelectedLabTests({}); const notesEl = document.getElementById('maternityLabClinicalNotes') as HTMLTextAreaElement; if(notesEl) notesEl.value = ""; }}}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={!selectedPatient || isOrderingLabs}>
                            {isOrderingLabs ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FlaskConical className="mr-2 h-4 w-4"/>}
                            {isOrderingLabs ? t('maternity.resultsSummary.orderLabsButton.loading') : t('maternity.resultsSummary.orderLabsButton')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t('maternity.orderLabsModal.title', {patientName: selectedPatient?.fullName || ""})}</DialogTitle>
                          <DialogDescription>{t('maternity.orderLabsModal.description')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                          <Label className="text-base font-semibold">{t('maternity.orderLabsModal.commonTests.label')}</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            {COMMON_ORDERABLE_LAB_TESTS.map((test) => ( 
                              <div key={test.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`maternity-test-${test.id}`} 
                                    checked={!!selectedLabTests[test.id]}
                                    onCheckedChange={(checked) => handleLabTestSelection(test.id, !!checked)}
                                    disabled={isOrderingLabs}
                                />
                                <Label htmlFor={`maternity-test-${test.id}`} className="text-sm font-normal">
                                  {test.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <Separator className="my-2"/>
                          <div className="space-y-2">
                            <Label htmlFor="maternityLabClinicalNotes">{t('maternity.orderLabsModal.notes.label')}</Label>
                            <Textarea id="maternityLabClinicalNotes" placeholder={t('maternity.orderLabsModal.notes.placeholder')} disabled={isOrderingLabs} />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="outline" disabled={isOrderingLabs}>{t('maternity.orderLabsModal.cancelButton')}</Button></DialogClose>
                          <Button type="button" onClick={handleSubmitLabOrder} disabled={isOrderingLabs || Object.values(selectedLabTests).every(v => !v)}>
                            {isOrderingLabs ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            {isOrderingLabs ? t('maternity.orderLabsModal.submitButton.loading') : t('maternity.orderLabsModal.submitButton')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog onOpenChange={(open) => {
                         if (!open) {
                            const typeEl = document.getElementById('maternityImagingType') as HTMLSelectElement;
                            const regionEl = document.getElementById('maternityImagingRegionDetails') as HTMLTextAreaElement;
                            const notesEl = document.getElementById('maternityImagingClinicalNotes') as HTMLTextAreaElement;
                            if (typeEl) typeEl.value = "";
                            if (regionEl) regionEl.value = "";
                            if (notesEl) notesEl.value = "";
                        }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={!selectedPatient || isOrderingImaging}>
                            {isOrderingImaging ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RadioTower className="mr-2 h-4 w-4"/>}
                            {isOrderingImaging ? t('maternity.resultsSummary.orderImagingButton.loading') : t('maternity.resultsSummary.orderImagingButton')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t('maternity.orderImagingModal.title', {patientName: selectedPatient?.fullName || ""})}</DialogTitle>
                          <DialogDescription>{t('maternity.orderImagingModal.description')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="maternityImagingType">{t('maternity.orderImagingModal.type.label')}</Label>
                            <Select disabled={isOrderingImaging} name="maternityImagingType" defaultValue="" id="maternityImagingType">
                              <SelectTrigger>
                                <SelectValue placeholder={t('maternity.orderImagingModal.type.placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ultrasound">{t('maternity.orderImagingModal.type.ultrasound')}</SelectItem>
                                <SelectItem value="xray">{t('maternity.orderImagingModal.type.xray')}</SelectItem>
                                <SelectItem value="mri">{t('maternity.orderImagingModal.type.mri')}</SelectItem>
                                <SelectItem value="ctscan">{t('maternity.orderImagingModal.type.ctscan')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maternityImagingRegionDetails">{t('maternity.orderImagingModal.region.label')}</Label>
                            <Textarea id="maternityImagingRegionDetails" placeholder={t('maternity.orderImagingModal.region.placeholder')} disabled={isOrderingImaging} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maternityImagingClinicalNotes">{t('maternity.orderImagingModal.notes.label')}</Label>
                            <Textarea id="maternityImagingClinicalNotes" placeholder={t('maternity.orderImagingModal.notes.placeholder')} disabled={isOrderingImaging}/>
                          </div>
                        </div>
                        <DialogFooter>
                           <DialogClose asChild><Button type="button" variant="outline" disabled={isOrderingImaging}>{t('maternity.orderImagingModal.cancelButton')}</Button></DialogClose>
                          <Button type="button" onClick={handleSubmitImagingOrder} disabled={isOrderingImaging}>
                            {isOrderingImaging ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            {isOrderingImaging ? t('maternity.orderImagingModal.submitButton.loading') : t('maternity.orderImagingModal.submitButton')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                 </CardFooter>
              </Card>

               <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>{t('maternity.birthPlan.title')}</CardTitle>
                    <CardDescription>{t('maternity.birthPlan.description', {patientName: selectedPatient.fullName})}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder={t('maternity.birthPlan.placeholder')} className="min-h-[100px]"/>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => toast({title: t('maternity.toast.birthPlanSaved'), description:t('maternity.toast.birthPlanSaved.desc')})}>{t('maternity.birthPlan.saveButton')}</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
  );
}
