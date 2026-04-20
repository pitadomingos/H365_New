
"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, FileText, Stethoscope, Pill, UserCircle, Search, Thermometer, Weight, Ruler, Sigma, Edit3, Send, Home, BedDouble, ArrowRightToLine, Users2, Skull, History, HeartPulse, ShieldAlert, FileClock, Briefcase, FlaskConical, RadioTower, Save, ActivityIcon as BloodPressureIcon } from "lucide-react";
import type { TreatmentRecommendationInput, TreatmentRecommendationOutput } from '@/ai/flows/treatment-recommendation';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/hooks/use-toast";
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { COMMON_ORDERABLE_LAB_TESTS, type OrderableLabTest } from '@/lib/constants';
import { ConsultationInitialData as SpecialistConsultationInitialData } from '@/app/treatment-recommendation/consultation-form'; 
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import { cn } from "@/lib/utils";


const FormSchema = z.object({
  nationalIdSearch: z.string().optional(),
  bodyTemperature: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  bloodPressure: z.string().optional(),
  symptoms: z.string().min(1, "Symptoms are required for AI recommendation.").optional(),
  labResultsSummary: z.string().optional(),
  imagingDataSummary: z.string().optional(),
  specialistComments: z.string().optional(),
  currentSpecialty: z.string().optional(),
}).refine(data => data.symptoms || data.labResultsSummary || data.imagingDataSummary, {
    message: "At least one of symptoms, lab results summary, or imaging data summary must be provided for AI recommendation.",
    path: ["symptoms"],
});

type FormValues = z.infer<typeof FormSchema>;

interface PatientData {
  nationalId: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  homeClinic: string;
  photoUrl: string;
  allergies: string[];
  chronicConditions: string[];
  referringDoctor?: string;
  referringDepartment?: string;
  reasonForReferral?: string;
  assignedSpecialty?: string;
}

interface VisitHistoryItem {
  id: string;
  date: string;
  department: string;
  doctor: string;
  reason: string;
}

const mockVisitHistory: VisitHistoryItem[] = [
  { id: "v1", date: "2024-05-10", department: "Outpatient", doctor: "Dr. Smith", reason: "Annual Checkup" },
  { id: "v2", date: "2024-03-22", department: "Emergency", doctor: "Dr. Jones", reason: "Minor Laceration, Referred to Ortho" },
  { id: "v3", date: "2023-11-05", department: "Cardiology", doctor: "Dr. Eve", reason: "Follow-up: Post MI" },
];

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

interface SpecialistConsultationFormProps {
  getRecommendationAction: (input: TreatmentRecommendationInput) => Promise<TreatmentRecommendationOutput | { error: string }>;
  initialData?: SpecialistConsultationInitialData | null;
}

export function SpecialistConsultationForm({ getRecommendationAction, initialData }: SpecialistConsultationFormProps) {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [isAiPending, startAiTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<TreatmentRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  
  const [bmi, setBmi] = useState<string | null>(null);
  const [bmiDisplay, setBmiDisplay] = useState<{ status: string; colorClass: string; textColorClass: string; } | null>(null);
  const [bpDisplay, setBpDisplay] = useState<{ status: string; colorClass: string, textColorClass: string; } | null>(null);
  
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  
  const [selectedLabTests, setSelectedLabTests] = useState<Record<string, boolean>>({});
  const [isSubmittingLabOrder, setIsSubmittingLabOrder] = useState(false);
  const [isSubmittingImagingOrder, setIsSubmittingImagingOrder] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false); 

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nationalIdSearch: initialData?.nationalIdSearch || "",
      bodyTemperature: initialData?.bodyTemperature || "",
      weight: initialData?.weight || "",
      height: initialData?.height || "",
      bloodPressure: initialData?.bloodPressure || "",
      symptoms: initialData?.symptoms || "",
      labResultsSummary: initialData?.labResultsSummary || "",
      imagingDataSummary: initialData?.imagingDataSummary || "",
      specialistComments: initialData?.specialistComments || "",
      currentSpecialty: initialData?.currentSpecialty || "Cardiology", 
    },
  });

  const { watch, setValue } = form;
  const weightKg = watch('weight');
  const heightCm = watch('height');
  const bloodPressureInput = watch('bloodPressure');

  useEffect(() => {
    if (initialData) {
      form.reset({
        nationalIdSearch: initialData.nationalIdSearch || patientData?.nationalId || "",
        bodyTemperature: initialData.bodyTemperature || "",
        weight: initialData.weight || "",
        height: initialData.height || "",
        bloodPressure: initialData.bloodPressure || "",
        symptoms: initialData.symptoms || "",
        labResultsSummary: initialData.labResultsSummary || "",
        imagingDataSummary: initialData.imagingDataSummary || "",
        specialistComments: initialData.specialistComments || "",
        currentSpecialty: initialData.currentSpecialty || patientData?.assignedSpecialty || "Cardiology"
      });
      setPatientData(initialData.patientData || null);
      setRecommendation(initialData.recommendation || null);
      setError(null); 
    }
  }, [initialData, form, patientData?.nationalId, patientData?.assignedSpecialty]);


  useEffect(() => {
    const w = parseFloat(weightKg || '0');
    const h = parseFloat(heightCm || '0');
    if (w > 0 && h > 0) {
      const hM = h / 100;
      const calculatedBmi = w / (hM * hM);
      setBmi(calculatedBmi.toFixed(2));
      setBmiDisplay(getBmiStatusAndColor(calculatedBmi, t));
    } else {
      setBmi(null);
      setBmiDisplay(getBmiStatusAndColor(null, t));
    }
  }, [weightKg, heightCm, t]);

  useEffect(() => {
    if (bloodPressureInput) {
      setBpDisplay(getBloodPressureStatus(bloodPressureInput, t));
    } else {
      setBpDisplay(getBloodPressureStatus("", t));
    }
  }, [bloodPressureInput, t]);


  const getAvatarHint = (gender?: "Male" | "Female" | "Other") => {
    if (gender === "Male") return "male avatar";
    if (gender === "Female") return "female avatar";
    return "patient avatar";
  };

  const handlePatientSearch = async () => {
    const nationalId = form.getValues("nationalIdSearch");
    if (!nationalId) {
      toast({ variant: "destructive", title: t('consultationForm.toast.error'), description: t('consultationForm.toast.search.missingId') });
      return;
    }
    setIsSearching(true);
    setPatientData(null);
    setRecommendation(null);
    setError(null);
    form.reset({
        nationalIdSearch: nationalId, 
        bodyTemperature: "",
        weight: "",
        height: "",
        bloodPressure: "",
        symptoms: "",
        labResultsSummary: "",
        imagingDataSummary: "",
        specialistComments: "",
        currentSpecialty: form.getValues("currentSpecialty"),
    });
    setBmi(null);
    setBmiDisplay(getBmiStatusAndColor(null, t));
    setBpDisplay(getBloodPressureStatus("", t));
    setSelectedLabTests({});

    await new Promise(resolve => setTimeout(resolve, 1000)); 
    if (nationalId === "123456789" || nationalId === "987654321") {
      const fetchedPatientData: PatientData = {
        nationalId: nationalId,
        fullName: nationalId === "123456789" ? "Demo Patient One" : "Jane Sample Doe",
        age: nationalId === "123456789" ? 34 : 45,
        gender: nationalId === "123456789" ? "Male" : "Female",
        address: "123 Health St, Wellness City",
        homeClinic: "City General Hospital",
        photoUrl: "https://placehold.co/120x120.png",
        allergies: nationalId === "123456789" ? ["Penicillin", "Dust Mites"] : ["None Reported"],
        chronicConditions: nationalId === "123456789" ? ["Asthma"] : ["Hypertension", "Type 2 Diabetes"],
        referringDoctor: nationalId === "123456789" ? "Dr. Primary Care" : "Dr. John GP",
        referringDepartment: nationalId === "123456789" ? "Outpatient Clinic A" : "General Practice Wing",
        reasonForReferral: nationalId === "123456789" ? "Persistent cough, rule out TB" : "Elevated blood pressure, needs specialist review",
        assignedSpecialty: form.getValues("currentSpecialty") || "Cardiology",
      };
      setPatientData(fetchedPatientData);
      toast({ title: t('consultationForm.toast.search.found'), description: t('consultationForm.toast.search.foundSpecialist.desc', {fullName: fetchedPatientData.fullName, specialty: fetchedPatientData.assignedSpecialty || ""})});
    } else {
      toast({ variant: "destructive", title: t('consultationForm.toast.search.notFound'), description: t('consultationForm.toast.search.notFound.desc') });
      setPatientData(null);
    }
    setIsSearching(false);
  };

  const onAiSubmit: SubmitHandler<FormValues> = (data) => {
    if (!patientData) {
      toast({ variant: "destructive", title: t('consultationForm.toast.error'), description: t('consultationForm.toast.ai.noPatient') });
      return;
    }
    setError(null);
    setRecommendation(null);
    startAiTransition(async () => {
      const visitHistoryString = mockVisitHistory.slice(0, 5).map(
        visit => `Date: ${visit.date}, Dept: ${visit.department}, Doctor: ${visit.doctor}, Reason: ${visit.reason}`
      ).join('\\n');

      const comprehensiveSymptoms = `
Patient Name: ${patientData.fullName}
Patient Age: ${patientData.age}
Patient Gender: ${patientData.gender}
Current Specialty: ${patientData.assignedSpecialty}
Referring Doctor: ${patientData.referringDoctor || 'N/A'}
Referring Department: ${patientData.referringDepartment || 'N/A'}
Reason for Referral: ${patientData.reasonForReferral || 'N/A'}

Vitals:
Body Temperature: ${data.bodyTemperature || 'N/A'}°C
Weight: ${data.weight || 'N/A'}kg
Height: ${data.height || 'N/A'}cm
BMI: ${bmi || 'N/A'} (${bmiDisplay?.status || 'N/A'})
Blood Pressure: ${data.bloodPressure || 'N/A'} (${bpDisplay?.status || 'N/A'})

Specialist Assessment / Symptoms:
${data.symptoms || "Not specified."}

Recent Visit History (Last 5):
${visitHistoryString || "No recent visit history available."}
`;

      const aiInput: TreatmentRecommendationInput = {
        symptoms: comprehensiveSymptoms,
        labResults: data.labResultsSummary || "Not provided",
        imagingData: data.imagingDataSummary || "Not provided",
      };
      
      const result = await getRecommendationAction(aiInput);
      if ('error' in result) {
        setError(result.error);
        toast({ variant: "destructive", title: t('consultationForm.toast.ai.error'), description: result.error });
      } else {
        setRecommendation(result);
        toast({ title: t('consultationForm.toast.ai.success'), description: t('consultationForm.toast.ai.success.desc') });
      }
    });
  };

  const handleOutcome = async (outcome: string) => {
    if (!patientData) {
      toast({ variant: "destructive", title: t('consultationForm.toast.error'), description: t('consultationForm.toast.outcome.noPatient') });
      return;
    }
    setIsSubmittingOutcome(true);
    
    const currentFormData = form.getValues();
    const payload = {
      patientId: patientData.nationalId,
      consultationDate: new Date().toISOString(),
      consultingDoctorId: "doc-specialist-mockId", 
      department: patientData.assignedSpecialty || currentFormData.currentSpecialty || "Specialist Consultation",
      referringDoctorId: patientData.referringDoctor, 
      reasonForReferral: patientData.reasonForReferral, 
      vitals: {
        bodyTemperatureCelsius: parseFloat(currentFormData.bodyTemperature || "0") || undefined,
        weightKg: parseFloat(currentFormData.weight || "0") || undefined,
        heightCm: parseFloat(currentFormData.height || "0") || undefined,
        bmi: parseFloat(bmi || "0") || undefined,
        bloodPressure: currentFormData.bloodPressure || undefined,
      },
      symptoms: currentFormData.symptoms,
      labResultsSummaryInput: currentFormData.labResultsSummary,
      imagingDataSummaryInput: currentFormData.imagingDataSummary,
      aiDiagnosis: recommendation?.diagnosis,
      aiPrescription: recommendation?.prescription,
      aiRecommendations: recommendation?.recommendations,
      doctorNotes: currentFormData.specialistComments, 
      finalDiagnosis: currentFormData.specialistComments ? `Diagnosis based on specialist notes: ${currentFormData.specialistComments.substring(0,50)}...` : "Diagnosis TBD",
      prescription: recommendation?.prescription ? `Prescription based on AI: ${recommendation.prescription}` : "Prescription TBD",
      outcome: outcome,
    };

    console.log("Submitting Specialist Consultation to /api/v1/consultations (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    toast({ title: t('consultationForm.toast.outcome.specialist.success'), description: t('consultationForm.toast.outcome.specialist.success.desc', {outcome: outcome, patientName: patientData.fullName}) });

    form.reset({
        nationalIdSearch: "",
        bodyTemperature: "",
        weight: "",
        height: "",
        bloodPressure: "",
        symptoms: "",
        labResultsSummary: "",
        imagingDataSummary: "",
        specialistComments: "",
        currentSpecialty: form.getValues("currentSpecialty"), 
    });
    setPatientData(null);
    setRecommendation(null);
    setError(null);
    setBmi(null);
    setBmiDisplay(getBmiStatusAndColor(null, t));
    setBpDisplay(getBloodPressureStatus("", t));
    setSelectedLabTests({});
    setIsOutcomeModalOpen(false);
    setIsSubmittingOutcome(false);
  };
  
  const handleSaveProgress = async () => {
    if (!patientData) {
      toast({ variant: "destructive", title: t('consultationForm.toast.saveDraft.noPatient'), description: t('consultationForm.toast.saveDraft.noPatient.desc') });
      return;
    }
    setIsSavingProgress(true);
    const currentFormData = form.getValues();

    const payload = {
      patientId: patientData.nationalId,
      consultingDoctorId: "doc-specialist-mockId", 
      department: patientData.assignedSpecialty || currentFormData.currentSpecialty || "Specialist Consultation",
      vitals: {
        bodyTemperatureCelsius: parseFloat(currentFormData.bodyTemperature || "0") || undefined,
        weightKg: parseFloat(currentFormData.weight || "0") || undefined,
        heightCm: parseFloat(currentFormData.height || "0") || undefined,
        bmi: parseFloat(bmi || "0") || undefined,
        bloodPressure: currentFormData.bloodPressure || undefined,
      },
      symptoms: currentFormData.symptoms,
      labResultsSummaryInput: currentFormData.labResultsSummary,
      imagingDataSummaryInput: currentFormData.imagingDataSummary,
      aiDiagnosis: recommendation?.diagnosis,
      aiPrescription: recommendation?.prescription,
      aiRecommendations: recommendation?.recommendations,
      doctorNotes: currentFormData.specialistComments, 
      status: "DRAFT"
    };
    
    console.log("Saving Specialist Draft to /api/v1/consultations/drafts (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: t('consultationForm.toast.saveDraft.specialist.success'), description: t('consultationForm.toast.saveDraft.specialist.success.desc') });
    setIsSavingProgress(false);
  };

  const handleSubmitLabOrder = async () => {
     if (!patientData) return;
     setIsSubmittingLabOrder(true);
     const orderedTestLabels = COMMON_ORDERABLE_LAB_TESTS
        .filter(test => selectedLabTests[test.id])
        .map(test => test.label);
     
    const payload = {
        patientId: patientData.nationalId, 
        consultationContext: patientData.assignedSpecialty || "Specialist Consultation", 
        testIds: Object.keys(selectedLabTests).filter(key => selectedLabTests[key]),
        clinicalNotes: (document.getElementById('specialistLabClinicalNotes') as HTMLTextAreaElement)?.value || ""
    };
    console.log("Submitting Lab Order to /api/v1/consultations/{consultationId}/lab-orders (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
        title: t('consultationForm.toast.labOrder.success'), 
        description: t('consultationForm.toast.labOrder.specialist.success.desc', {patientName: patientData.fullName, testLabels: (orderedTestLabels.length > 0 ? orderedTestLabels.join(', ') : t('consultationForm.noSpecificTests'))})
    });
    setSelectedLabTests({});
    const notesEl = document.getElementById('specialistLabClinicalNotes') as HTMLTextAreaElement;
    if (notesEl) notesEl.value = "";
    setIsSubmittingLabOrder(false);
  };

  const handleSubmitImagingOrder = async () => {
    if (!patientData) return;
    setIsSubmittingImagingOrder(true);
    const payload = {
        patientId: patientData.nationalId,
        consultationContext: patientData.assignedSpecialty || "Specialist Consultation", 
        imagingType: (document.getElementById('specialistImagingType') as HTMLSelectElement)?.value || "",
        regionDetails: (document.getElementById('specialistImagingRegionDetails') as HTMLTextAreaElement)?.value || "",
        clinicalNotes: (document.getElementById('specialistImagingClinicalNotes') as HTMLTextAreaElement)?.value || ""
    };
    console.log("Submitting Imaging Order to /api/v1/consultations/{consultationId}/imaging-orders (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({title: t('consultationForm.toast.imagingOrder.success'), description: t('consultationForm.toast.imagingOrder.specialist.success.desc', {patientName: patientData.fullName, imagingType: payload.imagingType, regionDetails: payload.regionDetails})});
    
    const typeEl = document.getElementById('specialistImagingType') as HTMLSelectElement;
    const regionEl = document.getElementById('specialistImagingRegionDetails') as HTMLTextAreaElement;
    const notesEl = document.getElementById('specialistImagingClinicalNotes') as HTMLTextAreaElement;
    if (typeEl) typeEl.value = "";
    if (regionEl) regionEl.value = "";
    if (notesEl) notesEl.value = "";
    setIsSubmittingImagingOrder(false);
  };
  
  const isActionDisabled = isSearching || isAiPending || isSubmittingOutcome || isSubmittingLabOrder || isSubmittingImagingOrder || isSavingProgress;

  const handleLabTestSelection = (testId: string, checked: boolean) => {
    setSelectedLabTests(prev => ({ ...prev, [testId]: checked }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('consultationForm.patientInfoCard.specialist.title')}</CardTitle>
            <CardDescription>{t('consultationForm.patientInfoCard.specialist.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="currentSpecialty">{t('consultationForm.currentSpecialty.label')}</Label>
                    <Select
                        value={form.watch("currentSpecialty")}
                        onValueChange={(value) => setValue("currentSpecialty", value)}
                        disabled={isActionDisabled}
                    >
                        <SelectTrigger id="currentSpecialty">
                        <SelectValue placeholder={t('consultationForm.currentSpecialty.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Cardiology">{t('consultationForm.currentSpecialty.cardiology')}</SelectItem>
                        <SelectItem value="Neurology">{t('consultationForm.currentSpecialty.neurology')}</SelectItem>
                        <SelectItem value="Orthopedics">{t('consultationForm.currentSpecialty.orthopedics')}</SelectItem>
                        <SelectItem value="Pediatrics">{t('consultationForm.currentSpecialty.pediatrics')}</SelectItem>
                        <SelectItem value="Oncology">{t('consultationForm.currentSpecialty.oncology')}</SelectItem>
                        <SelectItem value="Dermatology">{t('consultationForm.currentSpecialty.dermatology')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="nationalIdSearch">{t('consultationForm.nationalId.label')}</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="nationalIdSearch"
                            placeholder={t('consultationForm.nationalId.placeholder')}
                            {...form.register('nationalIdSearch')}
                            disabled={isActionDisabled}
                        />
                        <Button onClick={handlePatientSearch} disabled={isActionDisabled || !form.watch("nationalIdSearch")?.trim()}>
                            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            {isSearching ? t('consultationForm.searchButton.loading') : t('consultationForm.searchButton')}
                        </Button>
                    </div>
                </div>
            </div>


            {patientData && (
              <div className="mt-4 p-4 border rounded-md bg-muted/30 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
                    <Image
                      src={patientData.photoUrl}
                      alt={t('consultationForm.patientPhoto.alt')}
                      width={120}
                      height={120}
                      className="rounded-md border"
                      data-ai-hint={getAvatarHint(patientData.gender)}
                    />
                    <div className="space-y-1.5 text-sm">
                    <h3 className="text-xl font-semibold">{patientData.fullName}</h3>
                    <p><strong>{t('consultationForm.patientInfo.id')}:</strong> {patientData.nationalId}</p>
                    <p><strong>{t('consultationForm.patientInfo.age')}:</strong> {patientData.age} | <strong>{t('consultationForm.patientInfo.gender')}:</strong> {t(`patientRegistration.gender.${patientData.gender.toLowerCase()}` as any)}</p>
                    <p><strong>{t('consultationForm.patientInfo.specialty')}:</strong> {patientData.assignedSpecialty || "N/A"}</p>
                    </div>
                </div>
                <Separator/>
                 <div className="text-sm space-y-1">
                    <h4 className="font-medium text-md">{t('consultationForm.referralDetails.title')}:</h4>
                    <p><strong>{t('consultationForm.referralDetails.doctor')}:</strong> {patientData.referringDoctor || "N/A"}</p>
                    <p><strong>{t('consultationForm.referralDetails.department')}:</strong> {patientData.referringDepartment || "N/A"}</p>
                    <p><strong>{t('consultationForm.referralDetails.reason')}:</strong> {patientData.reasonForReferral || "N/A"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onAiSubmit)} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('consultationForm.vitalsCard.specialist.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="space-y-1">
                  <Label htmlFor="bodyTemperature" className="flex items-center"><Thermometer className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.temp.label')}</Label>
                  <Input id="bodyTemperature" placeholder={t('consultationForm.vitals.temp.placeholder')} {...form.register('bodyTemperature')} disabled={isActionDisabled || !patientData}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weight" className="flex items-center"><Weight className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.weight.label')}</Label>
                  <Input id="weight" placeholder={t('consultationForm.vitals.weight.placeholder')} {...form.register('weight')} disabled={isActionDisabled || !patientData}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height" className="flex items-center"><Ruler className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.height.label')}</Label>
                  <Input id="height" placeholder={t('consultationForm.vitals.height.placeholder')} {...form.register('height')} disabled={isActionDisabled || !patientData}/>
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="bloodPressure" className="flex items-center"><BloodPressureIcon className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.bp.label')}</Label>
                  <Input id="bloodPressure" placeholder={t('consultationForm.vitals.bp.placeholder')} {...form.register('bloodPressure')} disabled={isActionDisabled || !patientData}/>
                </div>
                 <div className="space-y-1">
                  <Label className="flex items-center"><Sigma className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.bmi.label')}</Label>
                  <div className="flex items-center gap-2 p-2 h-10 rounded-md border border-input bg-muted/50 min-w-[150px]">
                    <span className="text-sm font-medium">{bmi || "N/A"}</span>
                    {bmiDisplay && bmiDisplay.status !== t('consultationForm.vitals.bmiStatus.na') && (
                      <Badge className={cn("border-transparent text-xs px-1.5 py-0.5", bmiDisplay.colorClass, bmiDisplay.textColorClass)} >
                        {bmiDisplay.status}
                      </Badge>
                    )}
                  </div>
                </div>
                 <div className="space-y-1">
                  <Label className="flex items-center"><BloodPressureIcon className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.bpStatus.label')}</Label>
                  <div className="flex items-center gap-2 p-2 h-10 rounded-md border border-input bg-muted/50 min-w-[150px]">
                    {bpDisplay && bpDisplay.status !== t('consultationForm.vitals.bpStatus.na') && bpDisplay.status !== t('consultationForm.vitals.bpStatus.invalid') && (
                      <Badge className={cn("border-transparent text-xs px-1.5 py-0.5", bpDisplay.colorClass, bpDisplay.textColorClass)}>
                        {bpDisplay.status}
                      </Badge>
                    )}
                    {(bpDisplay?.status === t('consultationForm.vitals.bpStatus.na') || bpDisplay?.status === t('consultationForm.vitals.bpStatus.invalid')) && (
                       <span className="text-sm font-medium">{bpDisplay.status}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="symptoms">{t('consultationForm.symptoms.specialist.label')} <span className="text-destructive">*</span></Label>
                <Textarea
                  id="symptoms"
                  placeholder={t('consultationForm.symptoms.specialist.placeholder')}
                  {...form.register('symptoms')}
                  className="min-h-[100px]"
                  disabled={isActionDisabled || !patientData}
                />
                {form.formState.errors.symptoms && (
                  <p className="text-sm text-destructive">{form.formState.errors.symptoms.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {patientData && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('consultationForm.diagnosticOrders.title')}</CardTitle>
                <CardDescription>{t('consultationForm.diagnosticOrders.specialist.description', {patientName: patientData.fullName})}</CardDescription>
              </CardHeader>
               <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog onOpenChange={(open) => { 
                      if (!open) {
                          setSelectedLabTests({}); 
                          const notesEl = document.getElementById('specialistLabClinicalNotes') as HTMLTextAreaElement; 
                          if(notesEl) notesEl.value = ""; 
                      }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-shrink-0" disabled={isActionDisabled || !patientData}>
                          <FlaskConical className="mr-2 h-4 w-4" /> {t('consultationForm.diagnosticOrders.orderLabsButton')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('consultationForm.labModal.title', {patientName: patientData?.fullName || ""})}</DialogTitle>
                        <DialogDescription>{t('consultationForm.labModal.description')}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <Label className="text-base font-semibold">{t('consultationForm.labModal.commonTestsLabel')}:</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          {COMMON_ORDERABLE_LAB_TESTS.map((test) => ( 
                            <div key={test.id} className="flex items-center space-x-2">
                              <Checkbox 
                                  id={`specialist-test-${test.id}`} 
                                  checked={!!selectedLabTests[test.id]}
                                  onCheckedChange={(checked) => handleLabTestSelection(test.id, !!checked)}
                                  disabled={isSubmittingLabOrder}
                              />
                              <Label htmlFor={`specialist-test-${test.id}`} className="text-sm font-normal">
                                {test.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-2"/>
                        <div className="space-y-2">
                          <Label htmlFor="specialistLabClinicalNotes">{t('consultationForm.labModal.notes.label')}</Label>
                          <Textarea id="specialistLabClinicalNotes" placeholder={t('consultationForm.labModal.notes.specialist.placeholder')} disabled={isSubmittingLabOrder} />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingLabOrder}>{t('consultationForm.labModal.cancelButton')}</Button></DialogClose>
                        <Button type="button" onClick={handleSubmitLabOrder} disabled={isSubmittingLabOrder || Object.values(selectedLabTests).every(v => !v)}>
                          {isSubmittingLabOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                          {isSubmittingLabOrder ? t('consultationForm.labModal.submitButton.loading') : t('consultationForm.labModal.submitButton')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog onOpenChange={(open) => {
                       if (!open) {
                          const typeEl = document.getElementById('specialistImagingType') as HTMLSelectElement;
                          const regionEl = document.getElementById('specialistImagingRegionDetails') as HTMLTextAreaElement;
                          const notesEl = document.getElementById('specialistImagingClinicalNotes') as HTMLTextAreaElement;
                          if (typeEl) typeEl.value = "";
                          if (regionEl) regionEl.value = "";
                          if (notesEl) notesEl.value = "";
                      }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-shrink-0" disabled={isActionDisabled || !patientData}>
                          <RadioTower className="mr-2 h-4 w-4" /> {t('consultationForm.diagnosticOrders.orderImagingButton')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('consultationForm.imagingModal.title', {patientName: patientData?.fullName || ""})}</DialogTitle>
                        <DialogDescription>{t('consultationForm.imagingModal.description')}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="specialistImagingType">{t('consultationForm.imagingModal.type.label')}</Label>
                          <Select disabled={isSubmittingImagingOrder} name="specialistImagingType" defaultValue="" id="specialistImagingType">
                            <SelectTrigger>
                              <SelectValue placeholder={t('consultationForm.imagingModal.type.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ultrasound">{t('consultationForm.imagingModal.type.ultrasound')}</SelectItem>
                              <SelectItem value="xray">{t('consultationForm.imagingModal.type.xray')}</SelectItem>
                              <SelectItem value="mri">{t('consultationForm.imagingModal.type.mri')}</SelectItem>
                              <SelectItem value="ctscan">{t('consultationForm.imagingModal.type.ctscan')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialistImagingRegionDetails">{t('consultationForm.imagingModal.region.label')}</Label>
                          <Textarea id="specialistImagingRegionDetails" placeholder={t('consultationForm.imagingModal.region.specialist.placeholder')} disabled={isSubmittingImagingOrder}/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialistImagingClinicalNotes">{t('consultationForm.imagingModal.notes.label')}</Label>
                          <Textarea id="specialistImagingClinicalNotes" placeholder={t('consultationForm.imagingModal.notes.specialist.placeholder')} disabled={isSubmittingImagingOrder}/>
                        </div>
                      </div>
                      <DialogFooter>
                         <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingImagingOrder}>{t('consultationForm.imagingModal.cancelButton')}</Button></DialogClose>
                        <Button type="button" onClick={handleSubmitImagingOrder} disabled={isSubmittingImagingOrder}>
                          {isSubmittingImagingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                          {isSubmittingImagingOrder ? t('consultationForm.imagingModal.submitButton.loading') : t('consultationForm.imagingModal.submitButton')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                   <Button variant="outline" className="flex-shrink-0" onClick={handleSaveProgress} disabled={isActionDisabled || !patientData}>
                      {isSavingProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                      {isSavingProgress ? t('consultationForm.saveDraftButton.loading') : t('consultationForm.saveDraftButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('consultationForm.aiAnalysisCard.title')}</CardTitle>
              <CardDescription>{t('consultationForm.aiAnalysisCard.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="labResultsSummary">{t('consultationForm.labSummary.label')}</Label>
                <Textarea
                  id="labResultsSummary"
                  placeholder={t('consultationForm.labSummary.specialist.placeholder')}
                  {...form.register('labResultsSummary')}
                  className="min-h-[100px]"
                  disabled={isActionDisabled || !patientData}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="imagingDataSummary">{t('consultationForm.imagingSummary.label')}</Label>
                <Textarea
                  id="imagingDataSummary"
                  placeholder={t('consultationForm.imagingSummary.specialist.placeholder')}
                  {...form.register('imagingDataSummary')}
                  className="min-h-[100px]"
                  disabled={isActionDisabled || !patientData}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isActionDisabled || !patientData} className="w-full md:w-auto">
                {isAiPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isAiPending ? t('consultationForm.getAiButton.loading') : t('consultationForm.getAiButton')}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {error && !recommendation && (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>{t('consultationForm.aiError.title')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendation && patientData && (
          <div className="space-y-6 mt-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-6 w-6 text-primary" /> {t('consultationForm.aiInsights.title', {patientName: patientData.fullName, specialty: (patientData.assignedSpecialty || "")})}
                </CardTitle>
                <CardDescription>{t('consultationForm.aiInsights.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Stethoscope className="h-5 w-5" />{t('consultationForm.aiInsights.diagnosis.title')}</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{recommendation.diagnosis || t('consultationForm.aiInsights.diagnosis.none')}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Pill className="h-5 w-5" />{t('consultationForm.aiInsights.prescription.title')}</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{recommendation.prescription || t('consultationForm.aiInsights.prescription.none')}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FileText className="h-5 w-5" />{t('consultationForm.aiInsights.recommendations.title')}</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{recommendation.recommendations || t('consultationForm.aiInsights.recommendations.none')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Edit3 className="mr-1.5 h-5 w-5 text-primary"/>{t('consultationForm.specialistNotes.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        id="specialistComments"
                        placeholder={t('consultationForm.specialistNotes.placeholder')}
                        {...form.register('specialistComments')}
                        className="min-h-[100px]"
                        disabled={isActionDisabled}
                        />
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
                <Dialog open={isOutcomeModalOpen} onOpenChange={setIsOutcomeModalOpen}>
                    <DialogTrigger asChild>
                    <Button variant="default" disabled={isActionDisabled || !patientData} size="lg">
                        <Send className="mr-2 h-4 w-4" /> {t('consultationForm.finishButton.specialist')}
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('consultationForm.outcomeModal.specialist.title', {patientName: patientData?.fullName || ""})}</DialogTitle>
                        <DialogDescription>{t('consultationForm.outcomeModal.specialist.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                        {[
                          { label: t('consultationForm.outcomeModal.specialist.options.followUp'), value: "Schedule Specialist Follow-up", icon: FileClock },
                          { label: t('consultationForm.outcomeModal.specialist.options.returnToReferrer'), value: "Return to Referring Doctor", icon: ArrowRightToLine },
                          { label: t('consultationForm.outcomeModal.specialist.options.admit'), value: "Admit to Ward", icon: BedDouble },
                          { label: t('consultationForm.outcomeModal.specialist.options.referSubSpecialist'), value: "Refer to Sub-specialist", icon: Users2 },
                          { label: t('consultationForm.outcomeModal.specialist.options.dischargeSpecialist'), value: "Discharge from Specialist Care", icon: Home },
                        ].map(opt => (
                          <Button key={opt.value} variant="outline" onClick={() => handleOutcome(opt.value)} disabled={isSubmittingOutcome}>
                            {isSubmittingOutcome ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <opt.icon className="mr-2 h-4 w-4"/>}
                            {isSubmittingOutcome ? t('consultationForm.outcomeModal.processing') : opt.label}
                          </Button>
                        ))}
                        <DialogClose asChild>
                          <Button type="button" variant="ghost" disabled={isSubmittingOutcome}>{t('consultationForm.outcomeModal.cancelButton')}</Button>
                        </DialogClose>
                    </div>
                    </DialogContent>
                </Dialog>
            </div>
          </div>
        )}
      </div>

      {patientData && (
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[calc(theme(spacing.16)_+_theme(spacing.6))]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="h-6 w-6 text-primary" /> {t('consultationForm.patientSummary.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><strong>{t('consultationForm.patientSummary.name')}:</strong> {patientData.fullName}</div>
              <div><strong>{t('consultationForm.patientSummary.age')}:</strong> {patientData.age} | <strong>{t('consultationForm.patientSummary.gender')}:</strong> {t(`patientRegistration.gender.${patientData.gender.toLowerCase()}` as any)}</div>
              <div><strong>{t('consultationForm.patientSummary.id')}:</strong> {patientData.nationalId}</div>
              <Separator />
               <div>
                <h4 className="font-semibold mb-1 flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-indigo-500"/>{t('consultationForm.patientSummary.specialty')}:</h4>
                <p>{patientData.assignedSpecialty || "N/A"}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-1 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-destructive"/>{t('consultationForm.patientSummary.allergies')}:</h4>
                {patientData.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patientData.allergies.map(allergy => <Badge key={allergy} variant="destructive" className="text-xs">{allergy}</Badge>)}
                  </div>
                ) : <p className="text-muted-foreground">{t('consultationForm.patientSummary.noneReported')}</p>}
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-1 flex items-center gap-1.5"><HeartPulse className="h-4 w-4 text-blue-500"/>{t('consultationForm.patientSummary.chronicConditions')}:</h4>
                {patientData.chronicConditions.length > 0 ? (
                   <div className="flex flex-wrap gap-1">
                    {patientData.chronicConditions.map(condition => <Badge key={condition} variant="secondary" className="text-xs">{condition}</Badge>)}
                  </div>
                ) : <p className="text-muted-foreground">{t('consultationForm.patientSummary.noneReported')}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-6 w-6 text-primary" /> {t('consultationForm.visitHistory.title')}
              </CardTitle>
              <CardDescription>{t('consultationForm.visitHistory.description')}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              {mockVisitHistory.length > 0 ? (
                <ul className="space-y-4">
                  {mockVisitHistory.slice(0, 5).map((visit) => (
                    <li key={visit.id} className="p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold flex items-center gap-1.5"><FileClock className="h-4 w-4" />{visit.date}</p>
                        <Badge variant="outline" className="text-xs">{visit.department}</Badge>
                      </div>
                      <p className="text-xs"><strong>{t('consultationForm.visitHistory.doctor')}:</strong> {visit.doctor}</p>
                      <p className="text-xs mt-0.5"><strong>{t('consultationForm.visitHistory.reason')}:</strong> {visit.reason}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('consultationForm.visitHistory.empty')}</p>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="link" className="p-0 h-auto text-xs" disabled>{t('consultationForm.visitHistory.viewFull')}</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}


    
