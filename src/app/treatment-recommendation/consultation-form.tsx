
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
import { Loader2, Sparkles, FileText, Stethoscope, Pill, UserCircle, Search, Thermometer, Weight, Ruler, Sigma, Edit3, Send, Home, BedDouble, ArrowRightToLine, Users2, Skull, History, HeartPulse, ShieldAlert, FileClock, FlaskConical, RadioTower, Save, Smartphone, MapPin, ActivityIcon as BloodPressureIcon, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import type { TreatmentRecommendationInput, TreatmentRecommendationOutput } from '@/ai/flows/treatment-recommendation';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/hooks/use-toast";
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { LocalDB } from '@/lib/db';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_ORDERABLE_LAB_TESTS, type OrderableLabTest } from '@/lib/constants';
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
  doctorComments: z.string().optional(),
  physicalExamNotes: z.string().optional(),
  finalDiagnosis: z.string().optional(),
  icd10Code: z.string().optional(),
  finalPrescription: z.string().optional(),
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
  { id: "v2", date: "2024-03-22", department: "Emergency", doctor: "Dr. Jones", reason: "Minor Laceration" },
  { id: "v3", date: "2023-11-05", department: "Specialist", doctor: "Dr. Eve", reason: "Cardiology Consult" },
  { id: "v4", date: "2023-08-15", department: "Laboratory", doctor: "N/A", reason: "Routine Blood Work" },
  { id: "v5", date: "2023-01-30", department: "Outpatient", doctor: "Dr. Smith", reason: "Flu Symptoms" },
];

const MOCK_DRUGS = [
  { id: "d1", name: "Amoxicillin", strength: "500mg", form: "Capsule", stock: 1200 },
  { id: "d2", name: "Paracetamol", strength: "500mg", form: "Tablet", stock: 5000 },
  { id: "d3", name: "Artemether/Lumefantrine (Coartem)", strength: "20/120mg", form: "Tablet", stock: 450 },
  { id: "d4", name: "Ciprofloxacin", strength: "500mg", form: "Tablet", stock: 300 },
  { id: "d5", name: "Metformin", strength: "850mg", form: "Tablet", stock: 800 },
  { id: "d6", name: "Salbutamol", strength: "100mcg", form: "Inhaler", stock: 50 },
  { id: "d7", name: "ORS Sachet", strength: "N/A", form: "Powder", stock: 1000 },
];

export interface ConsultationInitialData extends Partial<FormValues> {
  patientData?: PatientData | null;
  recommendation?: TreatmentRecommendationOutput | null;
  specialistComments?: string;
  currentSpecialty?: string;
}

interface ConsultationFormProps {
  getRecommendationAction: (input: TreatmentRecommendationInput) => Promise<TreatmentRecommendationOutput | { error: string }>;
  getPatientContextAction: (nationalId: string) => Promise<any | null>;
  initialData?: ConsultationInitialData | null;
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


export function ConsultationForm({ getRecommendationAction, getPatientContextAction, initialData }: ConsultationFormProps) {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [isAiPending, startAiTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<TreatmentRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  
  const [bmi, setBmi] = useState<string | null>(null);
  const [bmiDisplay, setBmiDisplay] = useState<{ status: string; colorClass: string, textColorClass: string; } | null>(null);
  const [bpDisplay, setBpDisplay] = useState<{ status: string; colorClass: string, textColorClass: string; } | null>(null);

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  
  const [selectedLabTests, setSelectedLabTests] = useState<Record<string, boolean>>({});
  const [isSubmittingLabOrder, setIsSubmittingLabOrder] = useState(false);
  const [isSubmittingImagingOrder, setIsSubmittingImagingOrder] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  
  const [prescribedDrugs, setPrescribedDrugs] = useState<any[]>([]);
  const [drugSearchQuery, setDrugSearchQuery] = useState("");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const STEP_LABELS = [
    { num: 1, label: 'Intake & Vitals' },
    { num: 2, label: 'Clinical Notes (SOAP)' },
    { num: 3, label: 'AI Assist & Diagnostics' },
    { num: 4, label: 'Prescriptions & Finalize' },
  ];


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
      doctorComments: initialData?.doctorComments || "",
      finalDiagnosis: initialData?.finalDiagnosis || "",
      finalPrescription: initialData?.finalPrescription || "",
    },
  });

  const { watch, setValue } = form;
  const weightKg = watch('weight');
  const heightCm = watch('height');
  const bloodPressureInput = watch('bloodPressure');

  useEffect(() => {
    if (initialData) {
      form.reset({
        nationalIdSearch: initialData.nationalIdSearch || initialData.patientData?.nationalId || "",
        bodyTemperature: initialData.bodyTemperature || "",
        weight: initialData.weight || "",
        height: initialData.height || "",
        bloodPressure: initialData.bloodPressure || "",
        symptoms: initialData.symptoms || "",
        labResultsSummary: initialData.labResultsSummary || "",
        imagingDataSummary: initialData.imagingDataSummary || "",
        doctorComments: initialData.doctorComments || "",
        finalDiagnosis: initialData.finalDiagnosis || "",
        finalPrescription: initialData.finalPrescription || "",
      });
      setPatientData(initialData.patientData || null);
      setRecommendation(initialData.recommendation || null);
      setError(null); 
    }
  }, [initialData, form]);

  useEffect(() => {
    // Auto-trigger search if nationalIdSearch is provided from parent and we don't have patient data yet
    if (initialData?.nationalIdSearch && !patientData && !isSearching) {
        handlePatientSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.nationalIdSearch, patientData, isSearching]);


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

  const FallbackAvatar = ({ name, photoUrl, gender, className, size = 32 }: { name: string; photoUrl: string; gender?: "Male" | "Female" | "Other"; className?: string; size?: number }) => {
    const isPlaceholder = !photoUrl || photoUrl.includes("placehold.co");

    if (!isPlaceholder) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          width={size}
          height={size}
          className={cn("rounded-full object-cover", className)}
          data-ai-hint={gender ? (gender === "Male" ? "male avatar" : gender === "Female" ? "female avatar" : "patient avatar") : undefined}
        />
      );
    }

    const initials = name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : '?';

    const gradients = [
      'from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white',
      'from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 text-white',
      'from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700 text-white',
      'from-amber-500 to-rose-600 dark:from-amber-600 dark:to-rose-700 text-white',
      'from-violet-500 to-fuchsia-600 dark:from-violet-600 dark:to-fuchsia-700 text-white',
      'from-emerald-500 to-cyan-600 dark:from-emerald-600 dark:to-cyan-700 text-white'
    ];

    const charCodeSum = name ? name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
    const gradientClass = gradients[charCodeSum % gradients.length];

    return (
      <div 
        className={cn("rounded-full flex items-center justify-center font-bold shrink-0 select-none bg-gradient-to-br shadow-sm border border-black/10 dark:border-white/10", gradientClass, className)}
        style={{ width: size, height: size, fontSize: size > 24 ? '0.75rem' : '0.65rem' }}
      >
        {initials}
      </div>
    );
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
        doctorComments: "",
    });
    setBmi(null);
    setBmiDisplay(getBmiStatusAndColor(null, t));
    setBpDisplay(getBloodPressureStatus("", t));
    setSelectedLabTests({});

    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const foundPatient = MOCK_PATIENTS.find(p => p.nationalId === nationalId);
    if (foundPatient) {
      const fetchedPatientData: PatientData = {
        nationalId: foundPatient.nationalId,
        fullName: foundPatient.fullName,
        age: foundPatient.age,
        gender: foundPatient.gender as any,
        address: `${foundPatient.district}, ${foundPatient.province}`,
        homeClinic: "District Hospital",
        photoUrl: foundPatient.photoUrl,
        allergies: foundPatient.allergies || ["None Reported"],
        chronicConditions: foundPatient.chronicConditions || ["None Reported"],
      };
      setPatientData(fetchedPatientData);
      
      // Fetch Clinical Context
      const context = await getPatientContextAction(nationalId);
      if (context) {
        form.setValue("labResultsSummary", context.recentLabs);
        form.setValue("imagingDataSummary", context.recentImaging);
        toast({ title: t('consultationForm.toast.search.found'), description: t('consultationRoom.toast.loadingDraft.description', {patientName: fetchedPatientData.fullName}) });
      } else {
        toast({ title: t('consultationForm.toast.search.found'), description: t('consultationForm.toast.search.found.desc', {fullName: fetchedPatientData.fullName}) });
      }
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

Vitals:
Body Temperature: ${data.bodyTemperature || 'N/A'}°C
Weight: ${data.weight || 'N/A'}kg
Height: ${data.height || 'N/A'}cm
BMI: ${bmi || 'N/A'} (${bmiDisplay?.status || 'N/A'})
Blood Pressure: ${data.bloodPressure || 'N/A'} (${bpDisplay?.status || 'N/A'})

Chief Complaint/Symptoms:
${data.symptoms || "Not specified."}

Recent Visit History (Last 5):
${visitHistoryString || "No recent visit history available."}
`;

      const aiInput: TreatmentRecommendationInput = {
        symptoms: comprehensiveSymptoms,
        labResults: data.labResultsSummary || "Not provided",
        imagingData: data.imagingDataSummary || "Not provided",
        patientId: patientData.nationalId,
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

    if (outcome === "Refer to Specialist") {
      setIsReferralModalOpen(true);
      return;
    }

    setIsSubmittingOutcome(true);
    
    const currentFormData = form.getValues();
    const payload = {
      patientId: patientData.nationalId,
      consultationDate: new Date().toISOString(),
      consultingDoctorId: "doc-currentUser-mockId", 
      department: "General Consultation", 
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
      doctorNotes: currentFormData.doctorComments,
      finalDiagnosis: currentFormData.finalDiagnosis,
      icd10Code: currentFormData.icd10Code,
      prescription: currentFormData.finalPrescription,
      structuredPrescription: prescribedDrugs,
      outcome: outcome,
    };

    console.log("Submitting to /api/v1/consultations (mock):", payload);

    try {
      // 1. Process Send to Pharmacy Outcome
      if (outcome === "Send to Pharmacy") {
        const currentPrescriptions = await LocalDB.get<any[]>("pharmacy_prescriptions", []);
        const items = prescribedDrugs.length > 0 
          ? prescribedDrugs.map((drug, idx) => ({
              id: drug.id || `rx-item-${idx}-${Date.now()}`,
              drugName: drug.name || drug.drugName || "Prescribed Medication",
              strength: drug.strength || "",
              form: drug.form || "",
              dosage: drug.dosage || "1x1",
              frequency: drug.frequency || "Daily",
              duration: drug.duration || "5 days",
              quantity: 10
            }))
          : [
              {
                id: `rx-item-fallback-${Date.now()}`,
                drugName: currentFormData.finalPrescription || "Prescribed Medication",
                strength: "",
                form: "",
                dosage: "1x1",
                frequency: "Daily",
                duration: "5 days",
                quantity: 10
              }
            ];

        const newPrescription = {
          id: `RX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          patientId: patientData.nationalId,
          patientName: patientData.fullName,
          doctor: "Dr. Current User",
          date: new Date().toISOString(),
          items,
          status: "Waiting" as const
        };
        await LocalDB.save("pharmacy_prescriptions", [...currentPrescriptions, newPrescription]);
      }

      // 2. Process Send to Inpatient (Ward) Outcome
      if (outcome === "Send to Inpatient (Ward)") {
        const currentAdmissions = await LocalDB.get<any[]>("pending_ward_admissions", []);
        const newAdmission = {
          id: `PEND-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          patientId: patientData.nationalId,
          patientName: patientData.fullName,
          referringDepartment: "Outpatient General Consultation",
          reasonForAdmission: currentFormData.finalDiagnosis || "Requires inpatient monitoring and management."
        };
        await LocalDB.save("pending_ward_admissions", [...currentAdmissions, newAdmission]);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); 

      toast({ title: t('consultationForm.toast.outcome.success'), description: t('consultationForm.toast.outcome.success.desc', {outcome: outcome, patientName: patientData.fullName}) });
      
      form.reset();
      setPatientData(null);
      setRecommendation(null);
      setError(null);
      setBmi(null);
      setBmiDisplay(getBmiStatusAndColor(null, t));
      setBpDisplay(getBloodPressureStatus("", t));
      setSelectedLabTests({});
      setIsOutcomeModalOpen(false);
      setIsSubmittingOutcome(false);
      setPrescribedDrugs([]);
    } catch (err) {
      console.error("Failed to submit outcome:", err);
      toast({ variant: "destructive", title: "Outcome routing failed", description: "Could not save consultation outcome to local DB." });
      setIsSubmittingOutcome(false);
    }
  };

  const addDrugToPrescription = (drug: any) => {
    if (prescribedDrugs.find(p => p.id === drug.id)) return;
    setPrescribedDrugs([...prescribedDrugs, { ...drug, dosage: "1x1", frequency: "Daily", duration: "5 days" }]);
    setDrugSearchQuery("");
  };

  const removeDrug = (drugId: string) => {
    setPrescribedDrugs(prescribedDrugs.filter(p => p.id !== drugId));
  };

  const handleCreateReferral = async () => {
    if (!patientData || !selectedSpecialty || !selectedFacility) {
      toast({ variant: "destructive", title: "Incomplete Referral", description: "Please select both a specialty and a facility." });
      return;
    }
    
    setIsSubmittingOutcome(true);
    
    const referralData = {
      id: `REF-${Math.random().toString(36).substr(2, 9)}`,
      patientId: patientData.nationalId,
      patientName: patientData.fullName,
      specialty: selectedSpecialty,
      facility: selectedFacility,
      referredBy: "Dr. Current User",
      date: new Date().toISOString(),
      status: "PENDING_CONFIRMATION", // Specialist needs to confirm
    };

    // Save to LocalDB (Simulating back-end persistence)
    const existingReferrals = await LocalDB.get<any[]>("specialist_referrals", []);
    await LocalDB.save("specialist_referrals", [...existingReferrals, referralData]);

    console.log("[Referral] Created:", referralData);
    await new Promise(resolve => setTimeout(resolve, 1200));

    toast({ 
      title: "Referral Created", 
      description: `Patient ${patientData.fullName} has been referred to ${selectedSpecialty} at ${selectedFacility}. Waiting for confirmation.` 
    });

    // Cleanup and close
    setIsReferralModalOpen(false);
    setIsOutcomeModalOpen(false);
    handleOutcome("Referral Sent"); // Finalize the consultation record
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
      consultingDoctorId: "doc-currentUser-mockId", 
      department: "General Consultation", 
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
      doctorNotes: currentFormData.doctorComments,
      finalDiagnosis: currentFormData.finalDiagnosis,
      icd10Code: currentFormData.icd10Code,
      finalPrescription: currentFormData.finalPrescription,
      status: "DRAFT"
    };

    console.log("Saving Draft to /api/v1/consultations/drafts (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: t('consultationForm.toast.saveDraft.success'), description: t('consultationForm.toast.saveDraft.success.desc') });
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
        consultationContext: "General Consultation", 
        testIds: Object.keys(selectedLabTests).filter(key => selectedLabTests[key]),
        clinicalNotes: (document.getElementById('consultLabClinicalNotes') as HTMLTextAreaElement)?.value || ""
    };
    console.log("Submitting Lab Order to /api/v1/consultations/{consultationId}/lab-orders (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
        title: t('consultationForm.toast.labOrder.success'), 
        description: t('consultationForm.toast.labOrder.success.desc', {patientName: patientData.fullName, testLabels: (orderedTestLabels.length > 0 ? orderedTestLabels.join(', ') : t('consultationForm.noSpecificTests'))})
    });
    setSelectedLabTests({}); 
    const notesEl = document.getElementById('consultLabClinicalNotes') as HTMLTextAreaElement;
    if (notesEl) notesEl.value = "";
    setIsSubmittingLabOrder(false);
  };

  const handleSubmitImagingOrder = async () => {
    if (!patientData) return;
    setIsSubmittingImagingOrder(true);
    const payload = {
        patientId: patientData.nationalId,
        consultationContext: "General Consultation",
        imagingType: (document.getElementById('consultImagingType') as HTMLSelectElement)?.value || "",
        regionDetails: (document.getElementById('consultImagingRegionDetails') as HTMLTextAreaElement)?.value || "",
        clinicalNotes: (document.getElementById('consultImagingClinicalNotes') as HTMLTextAreaElement)?.value || ""
    };
    console.log("Submitting Imaging Order to /api/v1/consultations/{consultationId}/imaging-orders (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({title: t('consultationForm.toast.imagingOrder.success'), description: t('consultationForm.toast.imagingOrder.success.desc', {patientName: patientData.fullName, imagingType: payload.imagingType, regionDetails: payload.regionDetails})});
    
    const typeEl = document.getElementById('consultImagingType') as HTMLSelectElement;
    const regionEl = document.getElementById('consultImagingRegionDetails') as HTMLTextAreaElement;
    const notesEl = document.getElementById('consultImagingClinicalNotes') as HTMLTextAreaElement;
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
    <div className={cn("grid gap-6 items-start", patientData ? "xl:grid-cols-[1fr_350px]" : "grid-cols-1")}>
      <div className="flex flex-col gap-6">
      {/* Patient Search - Always visible */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('consultationForm.patientInfoCard.title')}</CardTitle>
          <CardDescription>{t('consultationForm.patientInfoCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input id="nationalIdSearch" placeholder={t('consultationForm.nationalId.placeholder')} {...form.register('nationalIdSearch')} className="max-w-xs" disabled={isActionDisabled} />
            <Button onClick={handlePatientSearch} disabled={isActionDisabled || !form.watch("nationalIdSearch")?.trim()}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isSearching ? t('consultationForm.searchButton.loading') : t('consultationForm.searchButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Moved Patient Context to Right Panel */}

      {/* Stepper Progress Bar */}
      {patientData && (
        <div className="flex items-center justify-between bg-background border rounded-lg p-3 shadow-sm">
          {STEP_LABELS.map((step, idx) => (
            <React.Fragment key={step.num}>
              <button type="button" onClick={() => setCurrentStep(step.num)} className={cn("flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium", currentStep === step.num ? "bg-primary text-primary-foreground shadow-md" : currentStep > step.num ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold border-2", currentStep === step.num ? "border-primary-foreground bg-primary-foreground/20" : currentStep > step.num ? "border-primary bg-primary/10" : "border-muted-foreground/30")}>
                  {currentStep > step.num ? <CheckCircle2 className="h-4 w-4" /> : step.num}
                </span>
                <span className="hidden md:inline">{step.label}</span>
              </button>
              {idx < STEP_LABELS.length - 1 && <div className={cn("flex-1 h-0.5 mx-2", currentStep > step.num ? "bg-primary" : "bg-muted")} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Phase Content */}
      <form onSubmit={form.handleSubmit(onAiSubmit)} className="space-y-6">

        {/* === PHASE 1: Intake & Vitals === */}
        {patientData && currentStep === 1 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('consultationForm.vitalsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="space-y-1">
                  <Label htmlFor="bodyTemperature" className="flex items-center"><Thermometer className="mr-1.5 h-4 w-4 text-primary" />{t('consultationForm.vitals.temp.label')}</Label>
                  <Input id="bodyTemperature" placeholder={t('consultationForm.vitals.temp.placeholder')} {...form.register('bodyTemperature')} disabled={isActionDisabled || !patientData} />
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
            </CardContent>
          </Card>
        )}

        {/* === PHASE 2: Clinical Notes (SOAP) === */}
        {patientData && currentStep === 2 && (
          <Card className="shadow-sm border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" /> Clinical Notes (SOAP Format)</CardTitle>
              <CardDescription>Structured documentation following the SOAP clinical standard.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-base font-semibold text-blue-700 dark:text-blue-400">Subjective (S)</Label>
                  <p className="text-xs text-muted-foreground">Chief complaint, history of present illness, symptoms as described by the patient.</p>
                  <Textarea id="symptoms" placeholder="e.g., Patient reports a 3-day history of sharp chest pain..." {...form.register('symptoms')} className="min-h-[100px]" disabled={isActionDisabled} />
                  {form.formState.errors.symptoms && <p className="text-sm text-destructive">{form.formState.errors.symptoms.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physicalExamNotes" className="text-base font-semibold text-green-700 dark:text-green-400">Objective (O)</Label>
                  <p className="text-xs text-muted-foreground">Vital signs, physical examination findings, observable clinical data.</p>
                  <Textarea id="physicalExamNotes" placeholder="e.g., BP 130/80, HR 88, Lungs clear to auscultation..." {...form.register('physicalExamNotes')} className="min-h-[120px]" disabled={isActionDisabled} />
                </div>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="doctorComments" className="text-base font-semibold text-orange-700 dark:text-orange-400">Assessment (A)</Label>
                  <p className="text-xs text-muted-foreground">Clinical impression, differential diagnosis, assessment of findings.</p>
                  <Textarea id="doctorComments" placeholder="e.g., Acute bronchitis, rule out pneumonia..." {...form.register('doctorComments')} className="min-h-[100px]" disabled={isActionDisabled} />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-purple-700 dark:text-purple-400">Plan (P)</Label>
                  <p className="text-xs text-muted-foreground">Treatment plan, follow-up. Detailed prescriptions and orders are in Phase 3 & 4.</p>
                  <Textarea placeholder="e.g., Order chest X-ray, start antibiotics, return in 5 days..." className="min-h-[100px]" disabled={isActionDisabled} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* === PHASE 3: AI Assist & Diagnostics === */}
        {patientData && currentStep === 3 && (<>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('consultationForm.diagnosticOrders.title')}</CardTitle>
                <CardDescription>{t('consultationForm.diagnosticOrders.description', {patientName: patientData.fullName})}</CardDescription>
              </CardHeader>
               <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog onOpenChange={(open) => { 
                      if (!open) {
                          setSelectedLabTests({}); 
                          const notesEl = document.getElementById('consultLabClinicalNotes') as HTMLTextAreaElement; 
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
                                id={`consult-test-${test.id}`} 
                                checked={!!selectedLabTests[test.id]}
                                onCheckedChange={(checked) => handleLabTestSelection(test.id, !!checked)}
                                disabled={isSubmittingLabOrder}
                                />
                                <Label htmlFor={`consult-test-${test.id}`} className="text-sm font-normal">
                                {test.label}
                                </Label>
                            </div>
                            ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-2">
                            <Label htmlFor="consultLabClinicalNotes">{t('consultationForm.labModal.notes.label')}</Label>
                            <Textarea id="consultLabClinicalNotes" placeholder={t('consultationForm.labModal.notes.placeholder')} disabled={isSubmittingLabOrder} />
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
                            const typeEl = document.getElementById('consultImagingType') as HTMLSelectElement;
                            const regionEl = document.getElementById('consultImagingRegionDetails') as HTMLTextAreaElement;
                            const notesEl = document.getElementById('consultImagingClinicalNotes') as HTMLTextAreaElement;
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
                            <Label htmlFor="consultImagingType">{t('consultationForm.imagingModal.type.label')}</Label>
                            <Select disabled={isSubmittingImagingOrder} name="consultImagingType" defaultValue="">
                            <SelectTrigger id="consultImagingType">
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
                            <Label htmlFor="consultImagingRegionDetails">{t('consultationForm.imagingModal.region.label')}</Label>
                            <Textarea id="consultImagingRegionDetails" placeholder={t('consultationForm.imagingModal.region.placeholder')} disabled={isSubmittingImagingOrder}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="consultImagingClinicalNotes">{t('consultationForm.imagingModal.notes.label')}</Label>
                            <Textarea id="consultImagingClinicalNotes" placeholder={t('consultationForm.imagingModal.notes.placeholder')} disabled={isSubmittingImagingOrder}/>
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


            <Card className="shadow-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Pill className="h-6 w-6 text-primary" /> Digital Prescription</CardTitle>
                <CardDescription>Link medications directly to the Pharmacy module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search inventory (e.g. Amoxicillin...)" 
                    className="pl-9"
                    value={drugSearchQuery}
                    onChange={(e) => setDrugSearchQuery(e.target.value)}
                  />
                  {drugSearchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                      {MOCK_DRUGS.filter(d => d.name.toLowerCase().includes(drugSearchQuery.toLowerCase())).map(drug => (
                        <div 
                          key={drug.id} 
                          className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center text-sm"
                          onClick={() => addDrugToPrescription(drug)}
                        >
                          <span>{drug.name} ({drug.strength}) - {drug.form}</span>
                          <Badge variant="outline" className="text-[10px]">Stock: {drug.stock}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {prescribedDrugs.length > 0 ? (
                    prescribedDrugs.map((drug) => (
                      <div key={drug.id} className="p-3 border rounded-md bg-muted/30 relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1 h-6 w-6 text-destructive"
                          onClick={() => removeDrug(drug.id)}
                        >
                          <Skull className="h-3 w-3" />
                        </Button>
                        <h4 className="font-bold text-sm">{drug.name} {drug.strength}</h4>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Dosage</Label>
                            <Input 
                              value={drug.dosage} 
                              className="h-8 text-xs" 
                              onChange={(e) => {
                                setPrescribedDrugs(prescribedDrugs.map(p => p.id === drug.id ? { ...p, dosage: e.target.value } : p));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Freq</Label>
                            <Input 
                              value={drug.frequency} 
                              className="h-8 text-xs" 
                              onChange={(e) => {
                                setPrescribedDrugs(prescribedDrugs.map(p => p.id === drug.id ? { ...p, frequency: e.target.value } : p));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Dur</Label>
                            <Input 
                              value={drug.duration} 
                              className="h-8 text-xs" 
                              onChange={(e) => {
                                setPrescribedDrugs(prescribedDrugs.map(p => p.id === drug.id ? { ...p, duration: e.target.value } : p));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-md text-muted-foreground text-sm">
                      No medications added yet. Use the search bar above.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-primary/5 p-4 rounded-b-md">
                <p className="text-[10px] text-muted-foreground italic">
                  * Prescriptions created here are instantly visible to Pharmacy staff upon checkout.
                </p>
              </CardFooter>
            </Card>


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
                  placeholder={t('consultationForm.labSummary.placeholder')}
                  {...form.register('labResultsSummary')}
                  className="min-h-[100px]"
                  disabled={isActionDisabled || !patientData}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="imagingDataSummary">{t('consultationForm.imagingSummary.label')}</Label>
                <Textarea
                  id="imagingDataSummary"
                  placeholder={t('consultationForm.imagingSummary.placeholder')}
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
        </>)}

        {/* === PHASE 4: Prescriptions & Finalize === */}
        {patientData && currentStep === 4 && (<>


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
                  <Sparkles className="h-6 w-6 text-primary" /> {t('consultationForm.aiInsights.title', {patientName: patientData.fullName})}
                </CardTitle>
                <CardDescription>{t('consultationForm.aiInsights.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Stethoscope className="h-5 w-5" />{t('consultationForm.aiInsights.diagnosis.title')}</h3>
                    {recommendation.diagnosis && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setValue('finalDiagnosis', recommendation.diagnosis)}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" /> Use AI Diagnosis
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{recommendation.diagnosis || t('consultationForm.aiInsights.diagnosis.none')}</p>
                </div>
                <Separator />
                <div>
                   <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Pill className="h-5 w-5" />{t('consultationForm.aiInsights.prescription.title')}</h3>
                    {recommendation.prescription && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setValue('finalPrescription', recommendation.prescription)}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" /> Use AI Prescription
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{recommendation.prescription || t('consultationForm.aiInsights.prescription.none')}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FileText className="h-5 w-5" />{t('consultationForm.aiInsights.recommendations.title')}</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{recommendation.recommendations || t('consultationForm.aiInsights.recommendations.none')}</p>
                </div>
              </CardContent>
            </Card>


            <Card className="shadow-sm border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                      <Edit3 className="h-5 w-5"/> Clinician&apos;s Verified Record
                    </CardTitle>
                    <CardDescription>Final diagnosis and prescription for the electronic health record.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="finalDiagnosis" className="font-bold">Final Clinical Diagnosis <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="finalDiagnosis"
                            placeholder="Type the final confirmed diagnosis here..."
                            {...form.register('finalDiagnosis')}
                            className="min-h-[100px] bg-background"
                            disabled={isActionDisabled}
                        />
                        {form.formState.errors.finalDiagnosis && (
                            <p className="text-xs text-destructive">{form.formState.errors.finalDiagnosis.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icd10Code" className="font-bold">{t('clinical.icd10.label')}</Label>
                        <Input
                            id="icd10Code"
                            placeholder={t('clinical.icd10.placeholder.default')}
                            {...form.register('icd10Code')}
                            disabled={isActionDisabled}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="finalPrescription" className="font-bold">Final Prescription <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="finalPrescription"
                            placeholder="Type the final confirmed prescription here..."
                            {...form.register('finalPrescription')}
                            className="min-h-[100px] bg-background"
                            disabled={isActionDisabled}
                        />
                        {form.formState.errors.finalPrescription && (
                            <p className="text-xs text-destructive">{form.formState.errors.finalPrescription.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
                <Dialog open={isOutcomeModalOpen} onOpenChange={setIsOutcomeModalOpen}>
                    <DialogTrigger asChild>
                    <Button variant="default" disabled={isActionDisabled || !patientData} size="lg">
                        <Send className="mr-2 h-4 w-4" /> {t('consultationForm.finishButton.general')}
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('consultationForm.outcomeModal.title', {patientName: patientData?.fullName || ""})}</DialogTitle>
                        <DialogDescription>{t('consultationForm.outcomeModal.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                        {[
                          { label: t('consultationForm.outcomeModal.options.sendHome'), value: "Send Home", icon: Home },
                          { label: t('consultationForm.outcomeModal.options.sendToPharmacy'), value: "Send to Pharmacy", icon: ArrowRightToLine },
                          { label: t('consultationForm.outcomeModal.options.admit'), value: "Send to Inpatient (Ward)", icon: BedDouble },
                          { label: t('consultationForm.outcomeModal.options.referSpecialist'), value: "Refer to Specialist", icon: Users2 },
                          { label: t('consultationForm.outcomeModal.options.deceased'), value: "Deceased", icon: Skull }
                        ].map(opt => (
                           <Button 
                            key={opt.value} 
                            variant="outline" 
                            onClick={() => handleOutcome(opt.value)} 
                            disabled={isSubmittingOutcome}
                          >
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

                {/* Specialist Referral Dialog */}
                <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Users2 className="h-5 w-5 text-primary" /> Specialist Referral
                      </DialogTitle>
                      <DialogDescription>
                        Direct {patientData?.fullName} to a specialist facility.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Target Specialty</Label>
                        <Select onValueChange={setSelectedSpecialty} value={selectedSpecialty}>
                          <SelectTrigger id="specialty">
                            <SelectValue placeholder="Select Specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="Oncology">Oncology</SelectItem>
                            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="Neurology">Neurology</SelectItem>
                            <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facility">Target Facility</Label>
                        <Select onValueChange={setSelectedFacility} value={selectedFacility}>
                          <SelectTrigger id="facility">
                            <SelectValue placeholder="Select Facility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Central Hospital (Maputo)">Central Hospital (Maputo)</SelectItem>
                            <SelectItem value="Specialist Center B">Specialist Center B</SelectItem>
                            <SelectItem value="Provincial Health Hub">Provincial Health Hub</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Alert className="bg-primary/5 border-primary/20">
                        <Smartphone className="h-4 w-4" />
                        <AlertTitle className="text-xs font-semibold">Automatic SMS Trigger</AlertTitle>
                        <AlertDescription className="text-xs">
                          Upon specialist confirmation, the patient will receive a scheduling SMS.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReferralModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateReferral} disabled={!selectedSpecialty || !selectedFacility}>
                        {isSubmittingOutcome ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Referral
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
          </div>
        )}
        </>)}
      </form>

      {/* Navigation Buttons */}
      {patientData && (
        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1 || isActionDisabled}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <span className="text-sm text-muted-foreground font-medium">Step {currentStep} of 4</span>
          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} disabled={isActionDisabled}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="default" disabled={isActionDisabled} size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => setIsOutcomeModalOpen(true)}>
                <Send className="mr-2 h-4 w-4" /> Finalize Consultation
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Moved Visit History to Right Panel */}
      </div>

      {/* Right Panel: Patient Summary & Visit History */}
      {patientData && (
        <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(theme(spacing.16)_+_theme(spacing.6))] max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12)_-_theme(spacing.2))] overflow-y-auto">
          {/* Patient Quick Summary */}
          <Card className="shadow-sm border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
               <CardTitle className="text-lg flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary"/> Patient Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex items-center gap-3">
                <FallbackAvatar
                  name={patientData.fullName}
                  photoUrl={patientData.photoUrl}
                  gender={patientData.gender}
                  size={50}
                  className="border-2 border-primary/30"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-bold truncate">{patientData.fullName}</h3>
                  <p className="text-xs text-muted-foreground">{patientData.nationalId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-background p-2 rounded-md border">
                   <p className="text-xs text-muted-foreground">Age / Gender</p>
                   <p className="font-medium">{patientData.age}y | {patientData.gender}</p>
                </div>
                <div className="bg-background p-2 rounded-md border">
                   <p className="text-xs text-muted-foreground">Specialty</p>
                   <p className="font-medium">{patientData.assignedSpecialty || "General"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Allergies</p>
                <div className="flex gap-1.5 flex-wrap">
                  {patientData.allergies?.map((a: string) => <Badge key={a} variant="destructive" className="text-[10px]">{a}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Chronic Conditions</p>
                <div className="flex gap-1.5 flex-wrap">
                  {patientData.chronicConditions?.map((c: string) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                </div>
              </div>
              {/* Compact Vitals Strip */}
              {(bmi || form.watch('bloodPressure') || form.watch('bodyTemperature')) && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-primary/10 flex-wrap">
                  {form.watch('bodyTemperature') && <Badge variant="outline" className="text-xs">🌡️ {form.watch('bodyTemperature')}°C</Badge>}
                  {form.watch('bloodPressure') && <Badge variant="outline" className="text-xs">💓 {form.watch('bloodPressure')}</Badge>}
                  {bmi && <Badge variant="outline" className="text-xs">⚖️ BMI: {bmi}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visit History Panel */}
          <Card className="shadow-sm flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-md">
                <History className="h-5 w-5 text-primary" /> {t('consultationForm.visitHistory.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockVisitHistory.length > 0 ? (
                mockVisitHistory.slice(0, 5).map((visit) => (
                  <div key={visit.id} className="p-2.5 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-semibold flex items-center gap-1.5"><FileClock className="h-3.5 w-3.5" />{visit.date}</p>
                      <Badge variant="outline" className="text-[10px]">{visit.department}</Badge>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground truncate"><strong className="text-foreground">{t('consultationForm.visitHistory.doctor')}:</strong> {visit.doctor}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground line-clamp-2"><strong className="text-foreground">{t('consultationForm.visitHistory.reason')}:</strong> {visit.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('consultationForm.visitHistory.empty')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
