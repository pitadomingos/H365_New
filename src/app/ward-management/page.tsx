
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BedDouble, Users, LogOutIcon, CheckCircle2, ArrowRightLeft, FileText, Pill, MessageSquare, Loader2, Hospital, Activity, UserCheck, Bed, Edit, PlusCircle, Thermometer, Weight, Ruler, Sigma, Save, ActivityIcon as BloodPressureIcon, AlertTriangle as AlertTriangleIcon, Stethoscope, Layers, ClipboardCheck, History as HistoryIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils";
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
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import { MOCK_WARD_PATIENTS } from '@/lib/mock-data';
import { useBMI } from '@/hooks/use-bmi';
import { WardSummaryCard, BedGrid } from './components';

interface WardSummary {
  id: string;
  name: string;
}

interface BedData {
    id: string;
    bedNumber: string;
    status: "Available" | "Occupied" | "Cleaning";
    patientName?: string;
    patientId?: string;
}

interface PatientInWard {
  admissionId: string;
  patientId: string;
  name: string;
  bedNumber: string;
  admittedDate: string; 
  primaryDiagnosis?: string;
  keyAlerts?: string[];
}

interface VisitHistoryItem {
  id: string;
  date: string;
  facilityName: string;
  department: string;
  doctor: string;
  reason: string;
}

interface WardDetails {
  id: string;
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  patients: PatientInWard[];
  beds: BedData[];
  alerts: {
    criticalLabsPending: number;
    medicationsOverdue: number;
    vitalsChecksDue: number;
    newAdmissionOrders: number;
    pendingDischarges: number;
  };
}

interface MedicationScheduleItem {
  medicationItemId: string;
  medication: string;
  dosage: string;
  time: string;
  status: "Administered" | "Pending" | "Skipped";
  notes?: string;
}

interface DoctorNote {
  noteId: string;
  date: string;
  doctor: string;
  note: string;
}

interface VitalsData {
  bodyTemperature?: string;
  weightKg?: string;
  heightCm?: string;
  bloodPressure?: string;
  bmi?: string;
  bmiStatus?: string;
  bpStatus?: string;
}

interface AdmittedPatientFullDetails {
  admissionId: string;
  patientId: string;
  name: string;
  wardName: string;
  bedNumber: string;
  treatmentPlan: string;
  medicationSchedule: MedicationScheduleItem[];
  doctorNotes: DoctorNote[];
  vitals?: VitalsData;
  allergies?: string[];
  chronicConditions?: string[];
  codeStatus?: "Full Code" | "DNR" | "DNI" | "Limited";
  recentLabSummary?: string;
  recentImagingSummary?: string;
  visitHistory?: VisitHistoryItem[];
}

interface PendingAdmission {
  id: string;
  patientId: string;
  patientName: string;
  referringDepartment: string;
  reasonForAdmission: string;
}

const mockWardSummariesData: WardSummary[] = [
    { id: "W001", name: "General Medicine Ward A" },
    { id: "W002", name: "Surgical Ward B" },
    { id: "W003", name: "Pediatrics Ward C" },
    { id: "W004", name: "Maternity Ward D" },
];

const mockAdmittedPatientFullDetailsData: Record<string, AdmittedPatientFullDetails> = {
  "ADM001": {
    admissionId: "ADM001", patientId: "P001", name: "Eva Green", wardName: "General Medicine Ward A", bedNumber: "Bed 3",
    treatmentPlan: "IV Ceftriaxone 1g OD. Oxygen support PRN. Monitor vitals Q4H. Chest physiotherapy BID.",
    medicationSchedule: [
      { medicationItemId: "MEDSCH001-A-1", medication: "Ceftriaxone 1g IV", dosage: "1g", time: "08:00", status: "Administered", notes: "Given slowly over 30 mins." },
      { medicationItemId: "MEDSCH001-B-1", medication: "Paracetamol 500mg PO", dosage: "500mg", time: "12:00", status: "Pending" },
      { medicationItemId: "MEDSCH001-C-1", medication: "Salbutamol Neb", dosage: "2.5mg", time: "14:00", status: "Pending", notes: "Check O2 sats before/after." },
    ],
    doctorNotes: [{ noteId: "DN001-A-1", date: new Date(Date.now() - 86400000).toISOString(), doctor: "Dr. Smith", note: "Patient responding well. Continue plan." }, {noteId: "DN001-B-1", date: new Date().toISOString(), doctor: "Dr. House", note: "Reviewed chest X-ray, slight improvement in consolidation."}],
    vitals: { bodyTemperature: "37.2", weightKg: "65", heightCm: "168", bloodPressure: "120/80", bmi: "23.1", bpStatus: "Normal", bmiStatus: "Normal weight" },
    allergies: ["Penicillin"], chronicConditions: ["Asthma"], codeStatus: "Full Code",
    recentLabSummary: "WBC: 15.2 (High), CRP: 45 (High)", recentImagingSummary: "Chest X-Ray: Left lower lobe consolidation consistent with pneumonia.",
    visitHistory: [
        { id: "VH001", date: "2024-07-15", facilityName: "City Central Clinic", department: "Outpatient", doctor: "Dr. Primary", reason: "Routine Checkup" },
        { id: "VH002", date: "2024-06-20", facilityName: "HealthFlow Central Hospital", department: "Emergency", doctor: "Dr. ER Shift", reason: "Minor Fall" },
    ]
  },
   "ADM002": {
    admissionId: "ADM002", patientId: "P002", name: "Tom Hanks", wardName: "General Medicine Ward A", bedNumber: "Bed 5",
    treatmentPlan: "Furosemide 40mg IV BD. Fluid restriction 1.5L/day. Daily weights. Monitor electrolytes.",
    medicationSchedule: [{ medicationItemId: "MEDSCH002-A-1", medication: "Furosemide 40mg IV", dosage: "40mg", time: "09:00", status: "Administered" }],
    doctorNotes: [{ noteId: "DN002-A-1", date: new Date().toISOString(), doctor: "Dr. House", note: "Mild improvement in edema." }],
    vitals: { bodyTemperature: "36.8", weightKg: "80", heightCm: "175", bloodPressure: "135/85", bmi:"26.1", bpStatus: "Stage 1 HTN", bmiStatus: "Overweight" },
    allergies: ["Sulfa Drugs"], chronicConditions: ["Hypertension", "Type 2 Diabetes"], codeStatus: "Full Code",
    recentLabSummary: "K+: 3.2 (Low), Creatinine: 1.5 (High)", recentImagingSummary: "Echocardiogram: EF 35%.",
    visitHistory: [
        { id: "VH003", date: "2024-07-01", facilityName: "HealthFlow Central Hospital", department: "Cardiology", doctor: "Dr. Heart", reason: "Chest Pain Assessment" },
    ]
  },
  "ADM003": {
    admissionId: "ADM003", patientId: "P003", name: "Lucy Liu", wardName: "Surgical Ward B", bedNumber: "Bed 1",
    treatmentPlan: "Post-op day 1. Pain management with Tramadol 50mg PO Q6H PRN. Wound care. Encourage mobilization.",
    medicationSchedule: [{ medicationItemId: "MEDSCH003-A-1", medication: "Tramadol 50mg PO", dosage: "50mg", time: "PRN", status: "Pending" }],
    doctorNotes: [{ noteId: "DN003-A-1", date: new Date().toISOString(), doctor: "Dr. Grey", note: "Surgical site clean. Patient ambulating." }],
    vitals: { bodyTemperature: "37.0", weightKg: "55", heightCm: "160", bloodPressure: "110/70", bmi: "21.5", bpStatus: "Normal", bmiStatus: "Normal weight" },
    allergies: ["None Known"], chronicConditions: [], codeStatus: "Full Code",
    recentLabSummary: "Hgb: 11.8 (Stable)", recentImagingSummary: "N/A for this admission.",
    visitHistory: []
  },
};

const mockWardDetailsData: Record<string, WardDetails> = {
    "W001": {
        id: "W001", name: "General Medicine Ward A", totalBeds: 20, occupiedBeds: 2, availableBeds: 18, occupancyRate: 10,
        patients: [
            { admissionId: "ADM001", patientId: "P001", name: "Eva Green", bedNumber: "Bed 3", admittedDate: "2024-01-01", primaryDiagnosis: "Pneumonia", keyAlerts: ["Isolation", "Oxygen PRN"] },
            { admissionId: "ADM002", patientId: "P002", name: "Tom Hanks", bedNumber: "Bed 5", admittedDate: "2024-06-15", primaryDiagnosis: "Heart Failure Exacerbation", keyAlerts: ["Fluid Restriction", "Daily Weight"] },
        ],
        beds: [
            { id: "B001-A", bedNumber: "Bed 1", status: "Available" }, { id: "B002-A", bedNumber: "Bed 2", status: "Cleaning" },
            { id: "B003-A", bedNumber: "Bed 3", status: "Occupied", patientName: "Eva Green", patientId: "P001" },
            { id: "B004-A", bedNumber: "Bed 4", status: "Available" },
            { id: "B005-A", bedNumber: "Bed 5", status: "Occupied", patientName: "Tom Hanks", patientId: "P002" },
            ...Array.from({ length: 15 }, (_, i) => ({ id: `B${(i + 6).toString().padStart(3, '0')}-A`, bedNumber: `Bed ${i + 6}`, status: "Available" as "Available" }))
        ],
        alerts: { criticalLabsPending: 2, medicationsOverdue: 1, vitalsChecksDue: 3, newAdmissionOrders: 0, pendingDischarges: 1 }
    },
    "W002": {
        id: "W002", name: "Surgical Ward B", totalBeds: 15, occupiedBeds: 1, availableBeds: 14, occupancyRate: 6.7,
        patients: [
            { admissionId: "ADM003", patientId: "P003", name: "Lucy Liu", bedNumber: "Bed 1", admittedDate: "2023-10-01", primaryDiagnosis: "Post-Appendectomy", keyAlerts: ["NPO", "Pain Control"] },
        ],
        beds: [
            { id: "B001-B", bedNumber: "Bed 1", status: "Occupied", patientName: "Lucy Liu", patientId: "P003" },
            ...Array.from({ length: 14 }, (_, i) => ({ id: `B${(i + 2).toString().padStart(3, '0')}-B`, bedNumber: `Bed ${i + 2}`, status: "Available" as "Available" }))
        ],
        alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 1, newAdmissionOrders: 1, pendingDischarges: 0 }
    },
    "W003": {
        id: "W003", name: "Pediatrics Ward C", totalBeds: 10, occupiedBeds: 0, availableBeds: 10, occupancyRate: 0,
        patients: [],
        beds: Array.from({ length: 10 }, (_, i) => ({ id: `B${(i + 1).toString().padStart(3, '0')}-C`, bedNumber: `Bed ${i + 1}`, status: "Available" as "Available" })),
        alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 0, newAdmissionOrders: 0, pendingDischarges: 0 }
    },
    "W004": {
        id: "W004", name: "Maternity Ward D", totalBeds: 12, occupiedBeds: 0, availableBeds: 12, occupancyRate: 0,
        patients: [],
        beds: Array.from({ length: 12 }, (_, i) => ({ id: `B${(i + 1).toString().padStart(3, '0')}-D`, bedNumber: `Bed ${i + 1}`, status: "Available" as "Available" })),
        alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 0, newAdmissionOrders: 0, pendingDischarges: 0 }
    },
};

const mockHospitalPendingAdmissionsData: PendingAdmission[] = [
    { id: "PEND001", patientId: "P101", patientName: "Alice Smith", referringDepartment: "Emergency", reasonForAdmission: "Severe Pneumonia, requires inpatient care." },
    { id: "PEND002", patientId: "P102", patientName: "Robert Jones", referringDepartment: "Outpatient Clinic", reasonForAdmission: "Uncontrolled Diabetes, needs stabilization." },
];

const getBmiStatusAndColor = (bmi: number | null): { status: string; colorClass: string; textColorClass: string; } => {
  if (bmi === null || isNaN(bmi)) {
    return { status: "N/A", colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
  }
  if (bmi < 18.5) {
    return { status: "Underweight", colorClass: "bg-blue-100 dark:bg-blue-800/30", textColorClass: "text-blue-700 dark:text-blue-300" };
  } else if (bmi < 25) {
    return { status: "Normal weight", colorClass: "bg-green-100 dark:bg-green-800/30", textColorClass: "text-green-700 dark:text-green-300" };
  } else if (bmi < 30) {
    return { status: "Overweight", colorClass: "bg-yellow-100 dark:bg-yellow-800/30", textColorClass: "text-yellow-700 dark:text-yellow-300" };
  } else if (bmi < 35) {
    return { status: "Obese (Class I)", colorClass: "bg-orange-100 dark:bg-orange-800/30", textColorClass: "text-orange-700 dark:text-orange-300" };
  } else if (bmi < 40) {
    return { status: "Obese (Class II)", colorClass: "bg-red-100 dark:bg-red-800/30", textColorClass: "text-red-700 dark:text-red-300" };
  } else {
    return { status: "Obese (Class III)", colorClass: "bg-red-200 dark:bg-red-900/40", textColorClass: "text-red-800 dark:text-red-200" };
  }
};

const getBloodPressureStatus = (bp: string): { status: string; colorClass: string; textColorClass: string; } => {
  if (!bp || !bp.includes('/')) {
    return { status: "N/A", colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
  }
  const parts = bp.split('/');
  const systolic = parseInt(parts[0], 10);
  const diastolic = parseInt(parts[1], 10);

  if (isNaN(systolic) || isNaN(diastolic)) {
    return { status: "Invalid", colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
  }

  if (systolic < 90 || diastolic < 60) {
    return { status: "Hypotension", colorClass: "bg-blue-100 dark:bg-blue-800/30", textColorClass: "text-blue-700 dark:text-blue-300" };
  } else if (systolic < 120 && diastolic < 80) {
    return { status: "Normal", colorClass: "bg-green-100 dark:bg-green-800/30", textColorClass: "text-green-700 dark:text-green-300" };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return { status: "Elevated", colorClass: "bg-yellow-100 dark:bg-yellow-800/30", textColorClass: "text-yellow-700 dark:text-yellow-300" };
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { status: "Stage 1 HTN", colorClass: "bg-orange-100 dark:bg-orange-800/30", textColorClass: "text-orange-700 dark:text-orange-300" };
  } else if (systolic >= 140 || diastolic >= 90) {
    return { status: "Stage 2 HTN", colorClass: "bg-red-100 dark:bg-red-800/30", textColorClass: "text-red-700 dark:text-red-300" };
  } else if (systolic > 180 || diastolic > 120) {
    return { status: "Hypertensive Crisis", colorClass: "bg-red-200 dark:bg-red-900/40", textColorClass: "text-red-800 dark:text-red-200" };
  }
  return { status: "N/A", colorClass: "bg-gray-200 dark:bg-gray-700", textColorClass: "text-gray-800 dark:text-gray-200" };
};

const formatStayDuration = (admissionDateString: string): string => {
    if (!admissionDateString) return "N/A";
    const admissionDate = new Date(admissionDateString); 
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDaysTotal < 1) return "Today";
    if (diffDaysTotal === 1) return "1 day";
    
    const years = Math.floor(diffDaysTotal / 365);
    const months = Math.floor((diffDaysTotal % 365) / 30);
    const days = diffDaysTotal % 30;

    let parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    
    if (parts.length === 0 && diffDaysTotal > 1) return `${diffDaysTotal} days`; 
    
    return parts.join(', ') || "Today";
};


export default function WardManagementPage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [allWardsData, setAllWardsData] = useState<WardSummary[]>([]);
  const [isLoadingAllWards, setIsLoadingAllWards] = useState(true);

  const [selectedWardId, setSelectedWardId] = useState<string | undefined>();
  const [currentWardDetails, setCurrentWardDetails] = useState<WardDetails | null>(null);
  const [isLoadingCurrentWardDetails, setIsLoadingCurrentWardDetails] = useState(false);

  const [longestStayPatients, setLongestStayPatients] = useState<{ name: string; duration: string; admissionId: string; }[]>([]);

  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<PatientInWard | null>(null);
  const [currentAdmittedPatientFullDetails, setCurrentAdmittedPatientFullDetails] = useState<AdmittedPatientFullDetails | null>(null);
  const [isLoadingSelectedPatientDetails, setIsLoadingSelectedPatientDetails] = useState(false);
  
  const [newDoctorNote, setNewDoctorNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationScheduleInModal, setMedicationScheduleInModal] = useState<MedicationScheduleItem[]>([]);
  const [isSavingMedicationUpdates, setIsSavingMedicationUpdates] = useState(false);

  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("");
  const [newMedNotes, setNewMedNotes] = useState("");

  const [isDischarging, setIsDischarging] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<"internal_ward" | "external_hospital" | "">("");
  const [targetInternalWardId, setTargetInternalWardId] = useState("");
  const [externalHospitalName, setExternalHospitalName] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  const [hospitalPendingAdmissions, setHospitalPendingAdmissions] = useState<PendingAdmission[]>([]);
  const [isLoadingPendingAdmissions, setIsLoadingPendingAdmissions] = useState(true);
  const [selectedPendingPatientId, setSelectedPendingPatientId] = useState("");
  const [selectedAvailableBedId, setSelectedAvailableBedId] = useState("");
  const [admissionDoctor, setAdmissionDoctor] = useState("");
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState("");
  const [isAdmittingPatient, setIsAdmittingPatient] = useState(false);

  const [editableVitals, setEditableVitals] = useState<VitalsData>({});
  const [isSavingVitals, setIsSavingVitals] = useState(false);
  const { bmi: calculatedBmi, status: bmiDisplay } = useBMI(editableVitals.weightKg, editableVitals.heightCm);
  const [bpDisplay, setBpDisplay] = useState<{ status: string; colorClass: string, textColorClass: string; } | null>(null);

  useEffect(() => {
    const fetchInitialWardData = async () => {
      setIsLoadingAllWards(true);
      try {
        // Simulate API call: GET /api/v1/wards
        await new Promise(resolve => setTimeout(resolve, 500));
        setAllWardsData(mockWardSummariesData);
      } catch (error) {
        console.error("Error fetching wards:", error);
        toast({ variant: "destructive", title: t('wardManagement.toast.loadWardsError'), description: t('wardManagement.toast.loadWardsError') });
      } finally {
        setIsLoadingAllWards(false);
      }
    };

    const fetchInitialPendingAdmissions = async () => {
        setIsLoadingPendingAdmissions(true);
        try {
             // Simulate API call: GET /api/v1/admissions/pending
            await new Promise(resolve => setTimeout(resolve, 700));
            setHospitalPendingAdmissions(mockHospitalPendingAdmissionsData);
        } catch (error) {
            console.error("Error fetching pending admissions:", error);
            toast({ variant: "destructive", title: t('wardManagement.toast.loadPendingAdmissionsError'), description: t('wardManagement.toast.loadPendingAdmissionsError') });
        } finally {
            setIsLoadingPendingAdmissions(false);
        }
    };
    fetchInitialWardData();
    fetchInitialPendingAdmissions();
  }, [t]);

  useEffect(() => {
    if (selectedWardId) {
      setIsLoadingCurrentWardDetails(true);
      setCurrentWardDetails(null); 
      setSelectedPatientForDetails(null); 
      setCurrentAdmittedPatientFullDetails(null); 
      setLongestStayPatients([]);
      const fetchWardDetails = async () => {
        try {
            // Simulate API call: GET /api/v1/wards/{selectedWardId}/details
            await new Promise(resolve => setTimeout(resolve, 600));
            const details = mockWardDetailsData[selectedWardId]; 
            if (details) {
                // Bridge mock ward details with centralized MOCK_WARD_PATIENTS
                const patientsInThisWard = MOCK_WARD_PATIENTS
                  .filter(p => p.ward.includes(details.name.replace(' Ward', '')))
                  .map(p => ({
                    admissionId: p.id,
                    patientId: p.id,
                    name: p.name,
                    bedNumber: p.bed,
                    admittedDate: p.admissionDate,
                    primaryDiagnosis: p.diagnosis,
                    keyAlerts: []
                  }));

                const updatedDetails = {
                  ...details,
                  patients: patientsInThisWard.length > 0 ? patientsInThisWard : details.patients
                };

                const occupiedBeds = updatedDetails.patients.length;
                const availableBeds = details.totalBeds - occupiedBeds;
                const occupancyRate = details.totalBeds > 0 ? (occupiedBeds / details.totalBeds) * 100 : 0;
                
                const today = new Date();
                const stays = details.patients.map(p => {
                    const admittedDate = new Date(p.admittedDate);
                    const durationMs = today.getTime() - admittedDate.getTime();
                    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                    return { ...p, durationDays };
                }).sort((a, b) => b.durationDays - a.durationDays);

                setLongestStayPatients(
                    stays.slice(0, 5).map(p => ({
                        name: p.name,
                        duration: formatStayDuration(p.admittedDate),
                        admissionId: p.admissionId 
                    }))
                );
                setCurrentWardDetails({
                    ...details,
                    occupiedBeds,
                    availableBeds,
                    occupancyRate,
                });
            } else {
                setCurrentWardDetails(null);
                toast({variant: "destructive", title: t('wardManagement.toast.loadWardDetailsError'), description: t('wardManagement.toast.loadWardDetailsError.generic')});
            }
        } catch (error: any) {
             console.error(`Error fetching ward ${selectedWardId} details:`, error);
             toast({ variant: "destructive", title: t('wardManagement.toast.loadWardDetailsError'), description: error.message || t('wardManagement.toast.loadWardDetailsError.generic') });
             setCurrentWardDetails(null);
        } finally {
            setIsLoadingCurrentWardDetails(false);
        }
      };
      fetchWardDetails();
    } else {
      setCurrentWardDetails(null);
      setSelectedPatientForDetails(null);
      setCurrentAdmittedPatientFullDetails(null);
      setLongestStayPatients([]);
    }
  }, [selectedWardId, t]);

  useEffect(() => {
    if (selectedPatientForDetails) {
      setIsLoadingSelectedPatientDetails(true);
      setCurrentAdmittedPatientFullDetails(null);
      const fetchPatientFullDetails = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const fullDetails = mockAdmittedPatientFullDetailsData[selectedPatientForDetails.admissionId];
            setCurrentAdmittedPatientFullDetails(fullDetails || null);
            setEditableVitals(fullDetails?.vitals || {});
            if (fullDetails && fullDetails.vitals) {
              setBpDisplay(getBloodPressureStatus(fullDetails.vitals.bloodPressure || ""));
            } else {
              setBpDisplay(getBloodPressureStatus(""));
            }
            if (fullDetails) {
              setMedicationScheduleInModal(fullDetails.medicationSchedule.map(item => ({...item}))); 
            } else {
              setMedicationScheduleInModal([]);
            }
        } catch (error: any) {
             console.error(`Error fetching admission ${selectedPatientForDetails.admissionId} details:`, error);
             toast({ variant: "destructive", title: t('wardManagement.toast.loadPatientDetailsError'), description: t('wardManagement.toast.loadPatientDetailsError', {patientName: selectedPatientForDetails.name}) });
             setCurrentAdmittedPatientFullDetails(null);
        } finally {
            setIsLoadingSelectedPatientDetails(false);
        }
      };
      fetchPatientFullDetails();
    } else {
        setCurrentAdmittedPatientFullDetails(null);
        setEditableVitals({});
        setCalculatedBmi(null);
        setBmiDisplay(getBmiStatusAndColor(null));
        setBpDisplay(getBloodPressureStatus(""));
        setMedicationScheduleInModal([]);
    }
  }, [selectedPatientForDetails, t]);

  useEffect(() => {
    setBpDisplay(getBloodPressureStatus(editableVitals.bloodPressure || ""));
  }, [editableVitals.bloodPressure]);

  const handleEditableVitalsChange = (field: keyof VitalsData, value: string) => {
    setEditableVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveVitals = async () => {
    if (!currentAdmittedPatientFullDetails) return;
    setIsSavingVitals(true);
    const payload = { admissionId: currentAdmittedPatientFullDetails.admissionId, vitals: editableVitals };
    
    try {
        console.log("Saving vitals (mock):", payload);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const updatedVitalsWithCalculated = { ...editableVitals, bmi: calculatedBmi || undefined, bmiStatus: bmiDisplay?.status, bpStatus: bpDisplay?.status };
        
        setCurrentAdmittedPatientFullDetails(prev => prev ? ({ ...prev, vitals: updatedVitalsWithCalculated }) : null);
        
        if(mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId]){
            mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId].vitals = updatedVitalsWithCalculated;
        }
        toast({ title: t('wardManagement.toast.vitalsSave.success'), description: t('wardManagement.toast.vitalsSave.success.desc') });
    } catch (error: any) {
        toast({ variant: "destructive", title: t('wardManagement.toast.vitalsSave.error'), description: error.message || t('wardManagement.toast.vitalsSave.error.desc') });
    } finally {
        setIsSavingVitals(false);
    }
  };


  const handleAdmitPatientToWard = async () => {
    if (!selectedWardId || !selectedPendingPatientId || !selectedAvailableBedId || !admissionDoctor.trim() || !admissionDiagnosis.trim()) {
      toast({ variant: "destructive", title: t('wardManagement.toast.admit.missingInfo'), description: t('wardManagement.toast.admit.missingInfo.desc') });
      return;
    }
    setIsAdmittingPatient(true);

    const patientToAdmit = hospitalPendingAdmissions.find(p => p.id === selectedPendingPatientId);
    const bedToOccupy = currentWardDetails?.beds.find(b => b.id === selectedAvailableBedId);

    if (!patientToAdmit || !bedToOccupy || !currentWardDetails) {
        toast({ variant: "destructive", title: t('wardManagement.toast.admit.invalidSelection'), description: t('wardManagement.toast.admit.invalidSelection.desc') });
        setIsAdmittingPatient(false);
        return;
    }
    
    const newAdmissionId = `ADM${Date.now()}`;
    const payload = {
        patientId: patientToAdmit.patientId,
        wardId: selectedWardId,
        bedId: selectedAvailableBedId,
        admittingDoctor: admissionDoctor,
        primaryDiagnosis: admissionDiagnosis,
        admissionDate: new Date().toISOString(),
    };
    
    try {
        console.log("Admitting patient (mock):", payload);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newPatientInWard: PatientInWard = {
            admissionId: newAdmissionId, 
            patientId: patientToAdmit.patientId,
            name: patientToAdmit.patientName,
            bedNumber: bedToOccupy.bedNumber,
            admittedDate: new Date().toISOString().split('T')[0],
            primaryDiagnosis: admissionDiagnosis,
            keyAlerts: ["New Admission"] 
        };
        
        setCurrentWardDetails(prev => {
            if (!prev) return null;
            const updatedPatients = [...prev.patients, newPatientInWard];
            const updatedBeds = prev.beds.map(b => 
                b.id === selectedAvailableBedId ? { ...b, status: "Occupied" as "Occupied", patientId: patientToAdmit.patientId, patientName: patientToAdmit.patientName } : b
            );
            const occupiedBeds = updatedBeds.filter(b => b.status === "Occupied").length;
            return {
                ...prev,
                patients: updatedPatients,
                beds: updatedBeds,
                occupiedBeds: occupiedBeds,
                availableBeds: prev.totalBeds - occupiedBeds,
                occupancyRate: (occupiedBeds / prev.totalBeds) * 100,
                 alerts: { ...prev.alerts, newAdmissionOrders: prev.alerts.newAdmissionOrders + 1 }
            };
        });
        
        mockAdmittedPatientFullDetailsData[newAdmissionId] = {
            admissionId: newAdmissionId,
            patientId: patientToAdmit.patientId,
            name: patientToAdmit.patientName,
            wardName: currentWardDetails.name,
            bedNumber: bedToOccupy.bedNumber,
            treatmentPlan: `Initial plan for ${admissionDiagnosis}. Monitor vitals.`,
            medicationSchedule: [],
            doctorNotes: [{noteId: `DN-ADMIT-${Date.now()}`, date: new Date().toISOString(), doctor: admissionDoctor, note: `Admitted for ${admissionDiagnosis}.`}],
            vitals: {}, allergies: [], chronicConditions: [], codeStatus: "Full Code", visitHistory: []
        };

        setHospitalPendingAdmissions(prev => prev.filter(p => p.id !== selectedPendingPatientId));
        toast({ title: t('wardManagement.toast.admit.success'), description: t('wardManagement.toast.admit.success.desc', {patientName: patientToAdmit.patientName, wardName: currentWardDetails.name, bedNumber: bedToOccupy.bedNumber}) });

        setSelectedPendingPatientId("");
        setSelectedAvailableBedId("");
        setAdmissionDoctor("");
        setAdmissionDiagnosis("");
    } catch (error: any) {
         toast({ variant: "destructive", title: t('wardManagement.toast.admit.error'), description: error.message || t('wardManagement.toast.admit.error.desc') });
    } finally {
        setIsAdmittingPatient(false);
    }
  };


  const handleAddNote = async () => {
    if (!newDoctorNote.trim() || !currentAdmittedPatientFullDetails) return;
    setIsAddingNote(true);
    const payload = { admissionId: currentAdmittedPatientFullDetails.admissionId, doctorId: "doc-currentUser-mockId", note: newDoctorNote };
    
    try {
        console.log("Adding doctor note (mock):", payload);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const newNoteEntry: DoctorNote = { noteId: `DN${Date.now()}`, date: new Date().toISOString(), doctor: "Dr. Current User (Mock)", note: newDoctorNote };
        
        setCurrentAdmittedPatientFullDetails(prev => prev ? ({ ...prev, doctorNotes: [newNoteEntry, ...prev.doctorNotes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }) : null);
        
        if (currentAdmittedPatientFullDetails && mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId]) {
          mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId].doctorNotes = [newNoteEntry, ...mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId].doctorNotes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        toast({title: t('wardManagement.toast.noteAdd.success'), description: t('wardManagement.toast.noteAdd.success.desc')});
        setNewDoctorNote("");
    } catch (error: any) {
         toast({ variant: "destructive", title: t('wardManagement.toast.noteAdd.error'), description: error.message || t('wardManagement.toast.noteAdd.error.desc') });
    } finally {
        setIsAddingNote(false);
    }
  };

  const handleOpenMedicationModal = () => {
    if (!currentAdmittedPatientFullDetails) return;
    setMedicationScheduleInModal(JSON.parse(JSON.stringify(currentAdmittedPatientFullDetails.medicationSchedule))); 
    setNewMedName("");
    setNewMedDosage("");
    setNewMedTime("");
    setNewMedNotes("");
    setIsMedicationModalOpen(true);
  };

  const handleMedicationItemChangeInModal = (index: number, field: keyof MedicationScheduleItem, value: string) => {
    setMedicationScheduleInModal(prevSchedule =>
      prevSchedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleAddNewMedicationToModalSchedule = () => {
    if (!newMedName.trim() || !newMedDosage.trim() || !newMedTime.trim()) {
      toast({ variant: "destructive", title: t('wardManagement.toast.medication.addForm.missingInfo'), description: t('wardManagement.toast.medication.addForm.missingInfo.desc') });
      return;
    }
    const newMedItem: MedicationScheduleItem = {
      medicationItemId: `temp-${Date.now()}`, 
      medication: newMedName,
      dosage: newMedDosage,
      time: newMedTime,
      status: "Pending",
      notes: newMedNotes.trim() || undefined,
    };
    setMedicationScheduleInModal(prev => [...prev, newMedItem]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedTime("");
    setNewMedNotes("");
    toast({ title: t('wardManagement.toast.medication.addForm.success'), description: t('wardManagement.toast.medication.addForm.success.desc', {newMedName: newMedName}) });
  };

  const handleSaveMedicationUpdates = async () => {
    if (!currentAdmittedPatientFullDetails) return;
    setIsSavingMedicationUpdates(true);
    const payload = { admissionId: currentAdmittedPatientFullDetails.admissionId, updatedSchedule: medicationScheduleInModal };
     try {
        console.log("Saving medication log (mock):", payload);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        setCurrentAdmittedPatientFullDetails(prev => prev ? ({ ...prev, medicationSchedule: medicationScheduleInModal }) : null);
        
        if (currentAdmittedPatientFullDetails && mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId]) {
            mockAdmittedPatientFullDetailsData[currentAdmittedPatientFullDetails.admissionId].medicationSchedule = medicationScheduleInModal;
        }

        toast({title: t('wardManagement.toast.medication.save.success'), description: t('wardManagement.toast.medication.save.success.desc')});
        setIsMedicationModalOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: t('wardManagement.toast.medication.save.error'), description: error.message || t('wardManagement.toast.medication.save.error.desc') });
    } finally {
        setIsSavingMedicationUpdates(false);
    }
  };

  const handleDischarge = async () => {
    if (!currentAdmittedPatientFullDetails || !selectedWardId) return;
    setIsDischarging(true);
    const payload = { admissionId: currentAdmittedPatientFullDetails.admissionId, dischargeDate: new Date().toISOString(), dischargeSummary: "Patient stable for discharge.", dischargedBy: "doc-currentUser-mockId" };
    
    try {
        console.log("Discharging patient (mock):", payload);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        toast({ title: t('wardManagement.toast.discharge.success'), description: t('wardManagement.toast.discharge.success.desc', {patientName: currentAdmittedPatientFullDetails.name}) });
        
        const admissionIdToDischarge = currentAdmittedPatientFullDetails.admissionId;
        const patientIdToClearFromBed = currentAdmittedPatientFullDetails.patientId;
        
        setSelectedPatientForDetails(null); 
        setCurrentAdmittedPatientFullDetails(null);
        
        setCurrentWardDetails(prevDetails => {
            if (!prevDetails) return null;
            const updatedPatients = prevDetails.patients.filter(p => p.admissionId !== admissionIdToDischarge);
            const updatedBeds = prevDetails.beds.map(bed => 
                bed.patientId === patientIdToClearFromBed ? { ...bed, status: "Cleaning" as "Cleaning", patientId: undefined, patientName: undefined } : bed
            );
            const occupiedBeds = updatedBeds.filter(b => b.status === "Occupied").length;
            return { 
                ...prevDetails, 
                patients: updatedPatients, 
                beds: updatedBeds, 
                occupiedBeds: occupiedBeds, 
                availableBeds: prevDetails.totalBeds - occupiedBeds, 
                occupancyRate: (occupiedBeds / prevDetails.totalBeds) * 100,
                alerts: { ...prevDetails.alerts, pendingDischarges: Math.max(0, prevDetails.alerts.pendingDischarges -1) }
            };
        });
    } catch (error: any) {
        toast({ variant: "destructive", title: t('wardManagement.toast.discharge.error'), description: error.message || t('wardManagement.toast.discharge.error.desc') });
    } finally {
        setIsDischarging(false);
    }
  };
  
  const handleOpenTransferModal = () => {
    if (!currentAdmittedPatientFullDetails) return;
    setTransferType("");
    setTargetInternalWardId("");
    setExternalHospitalName("");
    setTransferReason("");
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!currentAdmittedPatientFullDetails || !selectedWardId || !transferType || !transferReason.trim()) {
        toast({ variant: "destructive", title: t('wardManagement.toast.transfer.missingInfo'), description: t('wardManagement.toast.transfer.missingInfo.desc') });
        return;
    }
    if (transferType === "internal_ward" && !targetInternalWardId) {
        toast({ variant: "destructive", title: t('wardManagement.toast.transfer.missingDestination.ward'), description: t('wardManagement.toast.transfer.missingDestination.ward.desc') });
        return;
    }
    if (transferType === "external_hospital" && !externalHospitalName.trim()) {
        toast({ variant: "destructive", title: t('wardManagement.toast.transfer.missingDestination.hospital'), description: t('wardManagement.toast.transfer.missingDestination.hospital.desc') });
        return;
    }

    setIsProcessingTransfer(true);
    const payload = { 
        admissionId: currentAdmittedPatientFullDetails.admissionId, 
        transferDate: new Date().toISOString(), 
        transferType: transferType,
        destinationWardId: transferType === "internal_ward" ? targetInternalWardId : undefined,
        destinationFacility: transferType === "external_hospital" ? externalHospitalName : undefined,
        transferReason: transferReason,
        transferredBy: "doc-currentUser-mockId" 
    };
    
    try {
        console.log("Transferring patient (mock):", payload);
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const destinationName = transferType === "internal_ward" 
            ? allWardsData.find(w => w.id === targetInternalWardId)?.name || t('wardManagement.selectedWard')
            : externalHospitalName;
        toast({ title: t('wardManagement.toast.transfer.success'), description: t('wardManagement.toast.transfer.success.desc', {patientName: currentAdmittedPatientFullDetails.name, destinationName: destinationName}) });
        
        const admissionIdToTransfer = currentAdmittedPatientFullDetails.admissionId;
        const patientIdToClearFromBed = currentAdmittedPatientFullDetails.patientId;
        
        setSelectedPatientForDetails(null); 
        setCurrentAdmittedPatientFullDetails(null);
        setCurrentWardDetails(prevDetails => {
            if (!prevDetails) return null;
            const updatedPatients = prevDetails.patients.filter(p => p.admissionId !== admissionIdToTransfer);
            const updatedBeds = prevDetails.beds.map(bed => 
                bed.patientId === patientIdToClearFromBed ? { ...bed, status: "Cleaning" as "Cleaning", patientId: undefined, patientName: undefined } : bed
            );
            const occupiedBeds = updatedBeds.filter(b => b.status === "Occupied").length;
            return { 
                ...prevDetails, 
                patients: updatedPatients, 
                beds: updatedBeds, 
                occupiedBeds: occupiedBeds, 
                availableBeds: prevDetails.totalBeds - occupiedBeds, 
                occupancyRate: (occupiedBeds / prevDetails.totalBeds) * 100 
            };
        });
        
        setIsTransferModalOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: t('wardManagement.toast.transfer.error'), description: error.message || t('wardManagement.toast.transfer.error.desc') });
    } finally {
        setIsProcessingTransfer(false);
    }
  };


  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BedDouble className="h-8 w-8" /> {t('wardManagement.pageTitle')}
          </h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hospital className="h-6 w-6 text-primary"/>{t('wardManagement.selectWardCard.title')}</CardTitle>
            <CardDescription>{t('wardManagement.selectWardCard.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-md">
              <Label htmlFor="selectWard">{t('wardManagement.selectWard.label')}</Label>
              <Select 
                value={selectedWardId} 
                onValueChange={setSelectedWardId}
                disabled={isLoadingAllWards || isLoadingCurrentWardDetails || isAdmittingPatient}
              >
                <SelectTrigger id="selectWard">
                  <SelectValue placeholder={t('wardManagement.selectWard.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAllWards && <SelectItem value="loading" disabled><Loader2 className="inline mr-2 h-4 w-4 animate-spin"/>{t('wardManagement.selectWard.loading')}</SelectItem>}
                  {!isLoadingAllWards && allWardsData.length === 0 && <SelectItem value="no-wards" disabled>{t('wardManagement.selectWard.noWards')}</SelectItem>}
                  {!isLoadingAllWards && allWardsData.map(ward => (
                    <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoadingCurrentWardDetails && selectedWardId && (
                 <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> {t('wardManagement.loadingWardDetails', {wardName: allWardsData.find(w => w.id === selectedWardId)?.name || t('wardManagement.selectedWard')})}...
                </div>
            )}

            {currentWardDetails && !isLoadingCurrentWardDetails && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-3">
                 <h3 className="text-lg font-semibold">{t('wardManagement.dashboard.title', {wardName: currentWardDetails.name})}</h3>
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    <div className="lg:w-3/5 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                        <div><strong>{t('wardManagement.dashboard.totalBeds')}</strong> {currentWardDetails.totalBeds}</div>
                        <div><strong>{t('wardManagement.dashboard.occupied')}</strong> {currentWardDetails.occupiedBeds}</div>
                        <div><strong>{t('wardManagement.dashboard.available')}</strong> {currentWardDetails.availableBeds}</div>
                        <div><strong>{t('wardManagement.dashboard.patientsInWard')}</strong> {currentWardDetails.patients.length}</div>
                        </div>
                        <div className="text-sm"><strong>{t('wardManagement.dashboard.occupancy')}</strong> {currentWardDetails.occupancyRate.toFixed(1)}%</div>
                        <Progress value={currentWardDetails.occupancyRate} className="h-3 mt-1" />
                    </div>
                     <div className="lg:w-2/5">
                        {longestStayPatients.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-1.5">{t('wardManagement.dashboard.longestStays')}</h4>
                            <ol className="list-decimal list-inside text-xs space-y-1 text-muted-foreground">
                            {longestStayPatients.map(p => (
                                <li key={p.admissionId}>{p.name} - {p.duration}</li>
                            ))}
                            </ol>
                        </div>
                        )}
                        {longestStayPatients.length === 0 && !isLoadingCurrentWardDetails && (
                        <p className="text-xs text-muted-foreground text-center py-2">{t('wardManagement.dashboard.noStayData')}</p>
                        )}
                    </div>
                </div>
              </div>
            )}
             {currentWardDetails && !isLoadingCurrentWardDetails && (
                 <Card className="shadow-sm mt-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-md"><AlertTriangleIcon className="h-5 w-5 text-orange-500"/> {t('wardManagement.alertsCard.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                        <div className="p-2.5 border rounded-md bg-background text-center shadow-xs">
                            <p className="font-semibold text-lg text-destructive">{currentWardDetails.alerts.criticalLabsPending}</p>
                            <p className="text-xs text-muted-foreground">{t('wardManagement.alerts.criticalLabs')}</p>
                        </div>
                        <div className="p-2.5 border rounded-md bg-background text-center shadow-xs">
                            <p className="font-semibold text-lg text-amber-600">{currentWardDetails.alerts.medicationsOverdue}</p>
                            <p className="text-xs text-muted-foreground">{t('wardManagement.alerts.medsOverdue')}</p>
                        </div>
                        <div className="p-2.5 border rounded-md bg-background text-center shadow-xs">
                            <p className="font-semibold text-lg text-blue-600">{currentWardDetails.alerts.vitalsChecksDue}</p>
                            <p className="text-xs text-muted-foreground">{t('wardManagement.alerts.vitalsDue')}</p>
                        </div>
                        <div className="p-2.5 border rounded-md bg-background text-center shadow-xs">
                            <p className="font-semibold text-lg text-green-600">{currentWardDetails.alerts.newAdmissionOrders}</p>
                            <p className="text-xs text-muted-foreground">{t('wardManagement.alerts.newOrders')}</p>
                        </div>
                         <div className="p-2.5 border rounded-md bg-background text-center shadow-xs">
                            <p className="font-semibold text-lg text-purple-600">{currentWardDetails.alerts.pendingDischarges}</p>
                            <p className="text-xs text-muted-foreground">{t('wardManagement.alerts.pendingDischarges')}</p>
                        </div>
                    </CardContent>
                </Card>
             )}
          </CardContent>
        </Card>

        {selectedWardId && currentWardDetails && !isLoadingCurrentWardDetails && (
          <>
            <Card className="shadow-sm mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary"/> {t('wardManagement.admitPatientCard.title', {wardName: currentWardDetails.name})}
                    </CardTitle>
                    <CardDescription>{t('wardManagement.admitPatientCard.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingPendingAdmissions ? (
                        <div className="flex items-center justify-center py-4 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('wardManagement.admitPatient.loadingPending')}
                        </div>
                    ) : hospitalPendingAdmissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">{t('wardManagement.admitPatient.noPending')}</p>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="selectPendingPatient">{t('wardManagement.admitPatient.selectPatient.label')}</Label>
                                <Select value={selectedPendingPatientId} onValueChange={setSelectedPendingPatientId} disabled={isAdmittingPatient}>
                                    <SelectTrigger id="selectPendingPatient">
                                        <SelectValue placeholder={t('wardManagement.admitPatient.selectPatient.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hospitalPendingAdmissions.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.patientName} (ID: {p.patientId}, From: {p.referringDepartment})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="selectAvailableBed">{t('wardManagement.admitPatient.selectBed.label')}</Label>
                                <Select value={selectedAvailableBedId} onValueChange={setSelectedAvailableBedId} disabled={isAdmittingPatient}>
                                    <SelectTrigger id="selectAvailableBed">
                                        <SelectValue placeholder={t('wardManagement.admitPatient.selectBed.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentWardDetails.beds.filter(b => b.status === "Available").map(bed => (
                                            <SelectItem key={bed.id} value={bed.id}>{bed.bedNumber}</SelectItem>
                                        ))}
                                        {currentWardDetails.beds.filter(b => b.status === "Available").length === 0 && (
                                            <SelectItem value="no-beds" disabled>{t('wardManagement.admitPatient.selectBed.noBeds')}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="admissionDoctor">{t('wardManagement.admitPatient.doctor.label')}</Label>
                                <Input id="admissionDoctor" value={admissionDoctor} onChange={(e) => setAdmissionDoctor(e.target.value)} placeholder={t('wardManagement.admitPatient.doctor.placeholder')} disabled={isAdmittingPatient}/>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="admissionDiagnosis">{t('wardManagement.admitPatient.diagnosis.label')}</Label>
                                <Textarea 
                                    id="admissionDiagnosis" 
                                    value={admissionDiagnosis} 
                                    onChange={(e) => setAdmissionDiagnosis(e.target.value)} 
                                    placeholder={t('wardManagement.admitPatient.diagnosis.placeholder')} 
                                    rows={2}
                                    disabled={isAdmittingPatient}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
                {hospitalPendingAdmissions.length > 0 && (
                    <CardFooter>
                        <Button 
                            onClick={handleAdmitPatientToWard} 
                            disabled={isAdmittingPatient || !selectedPendingPatientId || !selectedAvailableBedId || !admissionDoctor.trim() || !admissionDiagnosis.trim()}
                            className="w-full"
                        >
                            {isAdmittingPatient ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                            {isAdmittingPatient ? t('wardManagement.admitPatient.button.loading') : t('wardManagement.admitPatient.button')}
                        </Button>
                    </CardFooter>
                )}
            </Card>
            
            <div className="grid lg:grid-cols-3 gap-6 items-start mt-6">
                <Card className="shadow-sm lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>{t('wardManagement.patientsInWardCard.title', {wardName: currentWardDetails.name})}</CardTitle>
                        <CardDescription>{t('wardManagement.patientsInWardCard.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentWardDetails.patients.length > 0 ? (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>{t('wardManagement.patientsInWard.table.name')}</TableHead>
                                <TableHead>{t('wardManagement.patientsInWard.table.bed')}</TableHead>
                                <TableHead>{t('wardManagement.patientsInWard.table.stay')}</TableHead>
                                <TableHead>{t('wardManagement.patientsInWard.table.diagnosis')}</TableHead>
                                <TableHead>{t('wardManagement.patientsInWard.table.alerts')}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {currentWardDetails.patients.map((patient) => (
                                <TableRow 
                                key={patient.admissionId} 
                                onClick={() => setSelectedPatientForDetails(patient)}
                                className={cn(
                                    "cursor-pointer hover:bg-muted/60", 
                                    selectedPatientForDetails?.admissionId === patient.admissionId && "bg-accent/30 dark:bg-accent/20"
                                )}
                                >
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.bedNumber}</TableCell>
                                <TableCell className="text-xs">{formatStayDuration(patient.admittedDate)}</TableCell>
                                <TableCell className="text-xs">{patient.primaryDiagnosis || "N/A"}</TableCell>
                                <TableCell className="space-x-1">
                                    {patient.keyAlerts && patient.keyAlerts.map(alert => (
                                        <Badge key={alert} variant={alert === "Isolation" || alert === "DNR" ? "destructive" : "secondary"} className="text-xs">{alert}</Badge>
                                    ))}
                                    {(!patient.keyAlerts || patient.keyAlerts.length === 0) && <span className="text-xs text-muted-foreground">None</span>}
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        ) : (
                        <p className="text-center py-6 text-muted-foreground">{t('wardManagement.patientsInWard.empty')}</p>
                        )}
                    </CardContent>
                </Card>
                
                 <Card className="shadow-sm lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>{t('wardManagement.dashboard.longestStays')} in {currentWardDetails.name}</CardTitle>
                        <CardDescription>Top 5 patients with the longest current admission.</CardDescription>
                    </CardHeader>
                     <CardContent>
                         {longestStayPatients.length > 0 ? (
                            <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                                {longestStayPatients.map(p => (
                                    <li key={p.admissionId}>{p.name} - {p.duration}</li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">{t('wardManagement.dashboard.noStayData')}</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bed className="h-5 w-5 text-primary"/>{t('wardManagement.bedStatusCard.title', {wardName: currentWardDetails.name})}</CardTitle>
                        <CardDescription>{t('wardManagement.bedStatusCard.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
                        {currentWardDetails.beds.map(bed => (
                            <Badge 
                                key={bed.id} 
                                variant={
                                    bed.status === 'Occupied' ? 'destructive' : 
                                    bed.status === 'Cleaning' ? 'secondary' : 'default'
                                } 
                                className="h-16 w-full flex flex-col items-center justify-center p-1 text-center shadow-sm hover:shadow-md transition-shadow"
                                title={bed.status === 'Occupied' && bed.patientName ? `Occupied by: ${bed.patientName}` : bed.status}
                            >
                            <Bed className="h-5 w-5 mb-0.5" />
                            <span className="text-xs font-medium">{bed.bedNumber}</span>
                            {bed.status === 'Occupied' && bed.patientName && (
                                <span className="text-[9px] truncate w-full opacity-80">
                                    {bed.patientName.split(' ')[0]}
                                </span>
                            )}
                            {bed.status !== 'Occupied' && (
                                <span className="text-[9px] opacity-80">{bed.status}</span>
                            )}
                            </Badge>
                        ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
          </>
        )}

        {selectedPatientForDetails && (
          <Card className="lg:col-span-full shadow-sm mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck className="h-6 w-6 text-primary"/>{t('wardManagement.patientCareCard.title', {patientName: currentAdmittedPatientFullDetails?.name || selectedPatientForDetails.name})}</CardTitle>
                <CardDescription>{t('wardManagement.patientCareCard.description', {bedNumber: currentAdmittedPatientFullDetails?.bedNumber || selectedPatientForDetails.bedNumber, wardName: currentWardDetails?.name || ""})}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSelectedPatientDetails && (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> {t('wardManagement.patientCare.loading')}
                </div>
              )}
              {!isLoadingSelectedPatientDetails && currentAdmittedPatientFullDetails && (
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-1 space-y-4">
                    <h4 className="text-md font-semibold flex items-center"><HistoryIcon className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.visitHistory.title')}</h4>
                    {currentAdmittedPatientFullDetails.visitHistory && currentAdmittedPatientFullDetails.visitHistory.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 border rounded-md p-3 bg-muted/10">
                            {currentAdmittedPatientFullDetails.visitHistory.slice(0, 10).map(visit => (
                                <div key={visit.id} className="text-xs p-2 border rounded-md bg-background shadow-sm">
                                    <p className="font-medium">{new Date(visit.date).toLocaleDateString()} - {visit.facilityName}</p>
                                    <p className="text-muted-foreground">Dept: {visit.department} | Dr: {visit.doctor}</p>
                                    <p className="text-muted-foreground mt-0.5">Reason: {visit.reason}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">{t('wardManagement.patientCare.visitHistory.empty')}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <Card className="shadow-xs">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('wardManagement.patientCare.allergies.title')}</CardTitle></CardHeader>
                        <CardContent>
                            {currentAdmittedPatientFullDetails.allergies && currentAdmittedPatientFullDetails.allergies.length > 0 ? 
                            currentAdmittedPatientFullDetails.allergies.map(a => <Badge key={a} variant="destructive" className="mr-1 mb-1 text-xs">{a}</Badge>) : 
                            <p className="text-muted-foreground text-xs">{t('wardManagement.patientCare.allergies.none')}</p>}
                        </CardContent>
                        </Card>
                        <Card className="shadow-xs">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('wardManagement.patientCare.chronicConditions.title')}</CardTitle></CardHeader>
                        <CardContent>
                            {currentAdmittedPatientFullDetails.chronicConditions && currentAdmittedPatientFullDetails.chronicConditions.length > 0 ? 
                            currentAdmittedPatientFullDetails.chronicConditions.map(c => <Badge key={c} variant="outline" className="mr-1 mb-1 text-xs">{c}</Badge>) : 
                            <p className="text-muted-foreground text-xs">{t('wardManagement.patientCare.chronicConditions.none')}</p>}
                        </CardContent>
                        </Card>
                        <Card className="shadow-xs">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('wardManagement.patientCare.codeStatus.title')}</CardTitle></CardHeader>
                        <CardContent>
                            <Badge variant={currentAdmittedPatientFullDetails.codeStatus === "DNR" ? "destructive" : "secondary"} className="text-xs">
                                {currentAdmittedPatientFullDetails.codeStatus || "N/A"}
                            </Badge>
                        </CardContent>
                        </Card>
                    </div>
                    <Separator/>

                    <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                        <h4 className="text-md font-semibold mb-2 flex items-center"><Activity className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.vitals.title')}</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                            <div className="space-y-1">
                                <Label htmlFor="wardBodyTemperature" className="flex items-center text-xs"><Thermometer className="mr-1.5 h-3 w-3" />{t('wardManagement.patientCare.vitals.temp.label')}</Label>
                                <Input id="wardBodyTemperature" value={editableVitals.bodyTemperature || ""} onChange={(e) => handleEditableVitalsChange("bodyTemperature", e.target.value)} placeholder={t('wardManagement.patientCare.vitals.temp.placeholder')} disabled={isSavingVitals} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="wardWeight" className="flex items-center text-xs"><Weight className="mr-1.5 h-3 w-3" />{t('wardManagement.patientCare.vitals.weight.label')}</Label>
                                <Input id="wardWeight" value={editableVitals.weightKg || ""} onChange={(e) => handleEditableVitalsChange("weightKg", e.target.value)} placeholder={t('wardManagement.patientCare.vitals.weight.placeholder')} disabled={isSavingVitals} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="wardHeight" className="flex items-center text-xs"><Ruler className="mr-1.5 h-3 w-3" />{t('wardManagement.patientCare.vitals.height.label')}</Label>
                                <Input id="wardHeight" value={editableVitals.heightCm || ""} onChange={(e) => handleEditableVitalsChange("heightCm", e.target.value)} placeholder={t('wardManagement.patientCare.vitals.height.placeholder')} disabled={isSavingVitals} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="wardBloodPressure" className="flex items-center text-xs"><BloodPressureIcon className="mr-1.5 h-3 w-3" />{t('wardManagement.patientCare.vitals.bp.label')}</Label>
                                <Input id="wardBloodPressure" value={editableVitals.bloodPressure || ""} onChange={(e) => handleEditableVitalsChange("bloodPressure", e.target.value)} placeholder={t('wardManagement.patientCare.vitals.bp.placeholder')} disabled={isSavingVitals} />
                            </div>
                            <div className="space-y-1">
                                <Label className="flex items-center text-xs"><Sigma className="mr-1.5 h-3 w-3" />{t('wardManagement.patientCare.vitals.bmi.label')}</Label>
                                <div className="flex items-center gap-2 p-2 h-10 rounded-md border border-input bg-background min-w-[150px]">
                                    <span className="text-sm font-medium">{calculatedBmi || "N/A"}</span>
                                    {bmiDisplay && bmiDisplay.status !== "N/A" && (
                                        <Badge className={cn("border-transparent text-xs px-1.5 py-0.5", bmiDisplay.colorClass, bmiDisplay.textColorClass)}>{bmiDisplay.status}</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="flex items-center text-xs"><BloodPressureIcon className="mr-1.5 h-3 w-3" />{t('wardManagement.patientCare.vitals.bpStatus.label')}</Label>
                                <div className="flex items-center gap-2 p-2 h-10 rounded-md border border-input bg-background min-w-[150px]">
                                    {bpDisplay && bpDisplay.status !== "N/A" && bpDisplay.status !== "Invalid" && (
                                        <Badge className={cn("border-transparent text-xs px-1.5 py-0.5", bpDisplay.colorClass, bpDisplay.textColorClass)}>{bpDisplay.status}</Badge>
                                    )}
                                    {(bpDisplay?.status === "N/A" || bpDisplay?.status === "Invalid") && (
                                    <span className="text-sm font-medium">{bpDisplay.status}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button size="sm" onClick={handleSaveVitals} disabled={isSavingVitals || !currentAdmittedPatientFullDetails} className="mt-2">
                            {isSavingVitals ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            {t('wardManagement.patientCare.vitals.saveButton')}
                        </Button>
                    </div>
                    <Separator />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-md font-semibold mb-2 flex items-center"><ClipboardCheck className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.labSummary.title')}</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">{currentAdmittedPatientFullDetails.recentLabSummary || t('wardManagement.patientCare.labSummary.empty')}</p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-2 flex items-center"><Layers className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.imagingSummary.title')}</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">{currentAdmittedPatientFullDetails.recentImagingSummary || t('wardManagement.patientCare.imagingSummary.empty')}</p>
                        </div>
                    </div>
                    <Separator />

                    <div>
                        <h4 className="text-md font-semibold mb-2 flex items-center"><FileText className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.treatmentPlan.title')}</h4>
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{currentAdmittedPatientFullDetails.treatmentPlan}</p>
                    </div>
                    <Separator />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-md font-semibold flex items-center"><Pill className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.medication.title')}</h4>
                            <Dialog open={isMedicationModalOpen} onOpenChange={(open) => { if(!open) {setNewMedName(""); setNewMedDosage(""); setNewMedTime(""); setNewMedNotes("");} setIsMedicationModalOpen(open);}}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={handleOpenMedicationModal} disabled={isSavingMedicationUpdates || isDischarging || isProcessingTransfer || isAddingNote || isSavingVitals}>
                                    <Edit className="mr-2 h-3 w-3" /> {t('wardManagement.patientCare.medication.manageButton')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl"> 
                                    <DialogHeader>
                                    <DialogTitle>{t('wardManagement.patientCare.medicationModal.title', {patientName: currentAdmittedPatientFullDetails.name})}</DialogTitle>
                                    <DialogDescription>
                                        {t('wardManagement.patientCare.medicationModal.description')}
                                    </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {medicationScheduleInModal.map((med, index) => (
                                            <div key={med.medicationItemId} className="p-3 border rounded-md space-y-3 bg-background shadow-sm">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label htmlFor={`medName-${index}`} className="text-xs">{t('wardManagement.patientCare.medicationModal.medication.label')}</Label>
                                                        <Input id={`medName-${index}`} value={med.medication} onChange={(e) => handleMedicationItemChangeInModal(index, "medication", e.target.value)} disabled={isSavingMedicationUpdates} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label htmlFor={`medDosage-${index}`} className="text-xs">{t('wardManagement.patientCare.medicationModal.dosage.label')}</Label>
                                                        <Input id={`medDosage-${index}`} value={med.dosage} onChange={(e) => handleMedicationItemChangeInModal(index, "dosage", e.target.value)} disabled={isSavingMedicationUpdates} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"> 
                                                    <div className="space-y-1">
                                                        <Label htmlFor={`medTime-${index}`} className="text-xs">{t('wardManagement.patientCare.medicationModal.time.label')}</Label>
                                                        <Input id={`medTime-${index}`} value={med.time} onChange={(e) => handleMedicationItemChangeInModal(index, "time", e.target.value)} disabled={isSavingMedicationUpdates} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label htmlFor={`medStatus-${index}`} className="text-xs">{t('wardManagement.patientCare.medicationModal.status.label')}</Label>
                                                        <Select
                                                            value={med.status}
                                                            onValueChange={(value) => handleMedicationItemChangeInModal(index, "status", value as MedicationScheduleItem["status"])}
                                                            disabled={isSavingMedicationUpdates}
                                                        >
                                                            <SelectTrigger id={`medStatus-${index}`} className="h-10 text-sm">
                                                                <SelectValue placeholder={t('wardManagement.patientCare.medicationModal.status.placeholder')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Pending">{t('wardManagement.patientCare.medicationModal.status.pending')}</SelectItem>
                                                                <SelectItem value="Administered">{t('wardManagement.patientCare.medicationModal.status.administered')}</SelectItem>
                                                                <SelectItem value="Skipped">{t('wardManagement.patientCare.medicationModal.status.skipped')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor={`medNotes-${index}`} className="text-xs">{t('wardManagement.patientCare.medicationModal.notes.label')}</Label>
                                                    <Textarea id={`medNotes-${index}`} value={med.notes || ""} onChange={(e) => handleMedicationItemChangeInModal(index, "notes", e.target.value)} placeholder={t('wardManagement.patientCare.medicationModal.notes.placeholder')} rows={2} disabled={isSavingMedicationUpdates} />
                                                </div>
                                            </div>
                                        ))}
                                        {medicationScheduleInModal.length === 0 && <p className="text-sm text-muted-foreground text-center">{t('wardManagement.patientCare.medicationModal.empty')}</p>}
                                        
                                        <Separator className="my-4" />
                                        
                                        <div className="p-3 border rounded-md space-y-3 bg-muted/30">
                                            <h5 className="font-semibold text-md flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" />{t('wardManagement.patientCare.medicationModal.addNew.title')}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label htmlFor="newMedName" className="text-xs">{t('wardManagement.patientCare.medicationModal.addNew.name.label')} <span className="text-destructive">*</span></Label>
                                                    <Input id="newMedName" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder={t('wardManagement.patientCare.medicationModal.addNew.name.placeholder')} disabled={isSavingMedicationUpdates}/>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="newMedDosage" className="text-xs">{t('wardManagement.patientCare.medicationModal.addNew.dosage.label')} <span className="text-destructive">*</span></Label>
                                                    <Input id="newMedDosage" value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} placeholder={t('wardManagement.patientCare.medicationModal.addNew.dosage.placeholder')} disabled={isSavingMedicationUpdates}/>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="newMedTime" className="text-xs">{t('wardManagement.patientCare.medicationModal.addNew.time.label')} <span className="text-destructive">*</span></Label>
                                                <Input id="newMedTime" value={newMedTime} onChange={(e) => setNewMedTime(e.target.value)} placeholder={t('wardManagement.patientCare.medicationModal.addNew.time.placeholder')} disabled={isSavingMedicationUpdates}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="newMedNotes" className="text-xs">{t('wardManagement.patientCare.medicationModal.addNew.notes.label')}</Label>
                                                <Textarea id="newMedNotes" value={newMedNotes} onChange={(e) => setNewMedNotes(e.target.value)} placeholder={t('wardManagement.patientCare.medicationModal.addNew.notes.placeholder')} rows={2} disabled={isSavingMedicationUpdates}/>
                                            </div>
                                            <Button type="button" size="sm" variant="outline" onClick={handleAddNewMedicationToModalSchedule} disabled={isSavingMedicationUpdates || !newMedName.trim() || !newMedDosage.trim() || !newMedTime.trim()}>
                                                <PlusCircle className="mr-2 h-4 w-4"/> {t('wardManagement.patientCare.medicationModal.addNew.addButton')}
                                            </Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="outline" disabled={isSavingMedicationUpdates}>{t('patientRegistration.quickRegModal.cancelButton')}</Button></DialogClose>
                                    <Button onClick={handleSaveMedicationUpdates} disabled={isSavingMedicationUpdates}>
                                        {isSavingMedicationUpdates ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        {t('wardManagement.patientCare.medicationModal.saveButton')}
                                    </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {currentAdmittedPatientFullDetails.medicationSchedule.length > 0 ? (
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="text-xs">{t('wardManagement.patientCare.medication.table.medication')}</TableHead>
                                <TableHead className="text-xs">{t('wardManagement.patientCare.medication.table.time')}</TableHead>
                                <TableHead className="text-xs text-right">{t('wardManagement.patientCare.medication.table.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentAdmittedPatientFullDetails.medicationSchedule.map((med) => (
                                <TableRow key={med.medicationItemId}>
                                    <TableCell className="text-xs font-medium">{med.medication} <span className="text-muted-foreground">({med.dosage})</span></TableCell>
                                    <TableCell className="text-xs">{med.time}</TableCell>
                                    <TableCell className="text-xs text-right">
                                    <Badge variant={med.status === "Administered" ? "default" : med.status === "Pending" ? "secondary" : "outline"} className="text-xs">
                                        {med.status}
                                    </Badge>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">{t('wardManagement.patientCare.medication.empty')}</p>
                        )}
                    </div>
                    <Separator />
                    
                    <div>
                        <h4 className="text-md font-semibold mb-2 flex items-center"><MessageSquare className="mr-2 h-4 w-4 text-primary" /> {t('wardManagement.patientCare.doctorNotes.title')}</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {currentAdmittedPatientFullDetails.doctorNotes.length > 0 ? (
                            currentAdmittedPatientFullDetails.doctorNotes.map((note) => (
                                <div key={note.noteId} className="text-xs p-2 border rounded-md bg-muted/30">
                                <p className="font-medium">{note.doctor} - <span className="text-muted-foreground">{new Date(note.date).toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')} {new Date(note.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span></p>
                                <p className="mt-0.5 whitespace-pre-wrap">{note.note}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">{t('wardManagement.patientCare.doctorNotes.empty')}</p>
                        )}
                        </div>
                        <Textarea placeholder={t('wardManagement.patientCare.doctorNotes.placeholder')} className="mt-2 text-xs" rows={2} value={newDoctorNote} onChange={(e) => setNewDoctorNote(e.target.value)} disabled={isAddingNote}/>
                        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleAddNote} disabled={isAddingNote || !newDoctorNote.trim() || isDischarging || isProcessingTransfer || isSavingMedicationUpdates || isSavingVitals}>
                        {isAddingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        {isAddingNote ? t('wardManagement.patientCare.doctorNotes.addButton.loading') : t('wardManagement.patientCare.doctorNotes.addButton')}
                        </Button>
                    </div>
                  </div>
                </div>
              )}
              {!isLoadingSelectedPatientDetails && !currentAdmittedPatientFullDetails && selectedPatientForDetails && (
                 <p className="text-center py-6 text-muted-foreground">{t('wardManagement.patientCareCard.errorLoading')}</p>
              )}
            </CardContent>
            {currentAdmittedPatientFullDetails && (
                <CardFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleDischarge} disabled={isDischarging || isProcessingTransfer || isAddingNote || isSavingMedicationUpdates || isSavingVitals}>
                        {isDischarging ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOutIcon className="mr-2 h-4 w-4" />}
                        {isDischarging ? t('wardManagement.patientCare.dischargeButton.loading') : t('wardManagement.patientCare.dischargeButton', {patientName: currentAdmittedPatientFullDetails.name.split(' ')[0]})}
                    </Button>
                    
                    <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto" onClick={handleOpenTransferModal} disabled={isDischarging || isProcessingTransfer || isAddingNote || isSavingMedicationUpdates || isSavingVitals}>
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> {t('wardManagement.patientCare.transferButton', {patientName: currentAdmittedPatientFullDetails.name.split(' ')[0]})}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t('wardManagement.patientCare.transferModal.title', {patientName: currentAdmittedPatientFullDetails.name})}</DialogTitle>
                                <DialogDescription>{t('wardManagement.patientCare.transferModal.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t('wardManagement.patientCare.transferModal.type.label')} <span className="text-destructive">*</span></Label>
                                    <RadioGroup value={transferType} onValueChange={(value) => setTransferType(value as any)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="internal_ward" id="internal_ward" />
                                            <Label htmlFor="internal_ward" className="font-normal">{t('wardManagement.patientCare.transferModal.type.internal')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="external_hospital" id="external_hospital" />
                                            <Label htmlFor="external_hospital" className="font-normal">{t('wardManagement.patientCare.transferModal.type.external')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {transferType === "internal_ward" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="targetInternalWard">{t('wardManagement.patientCare.transferModal.destinationWard.label')} <span className="text-destructive">*</span></Label>
                                        <Select value={targetInternalWardId} onValueChange={setTargetInternalWardId} disabled={isLoadingAllWards || isProcessingTransfer}>
                                            <SelectTrigger id="targetInternalWard">
                                                <SelectValue placeholder={t('wardManagement.patientCare.transferModal.destinationWard.placeholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allWardsData.filter(ward => ward.id !== selectedWardId).map(ward => (
                                                    <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
                                                ))}
                                                {allWardsData.filter(ward => ward.id !== selectedWardId).length === 0 && <SelectItem value="no-other-wards" disabled>{t('wardManagement.patientCare.transferModal.destinationWard.noOther')}</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {transferType === "external_hospital" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="externalHospitalName">{t('wardManagement.patientCare.transferModal.externalHospital.label')} <span className="text-destructive">*</span></Label>
                                        <Input id="externalHospitalName" value={externalHospitalName} onChange={(e) => setExternalHospitalName(e.target.value)} placeholder={t('wardManagement.patientCare.transferModal.externalHospital.placeholder')} disabled={isProcessingTransfer}/>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="transferReason">{t('wardManagement.patientCare.transferModal.reason.label')} <span className="text-destructive">*</span></Label>
                                    <Textarea id="transferReason" value={transferReason} onChange={(e) => setTransferReason(e.target.value)} placeholder={t('wardManagement.patientCare.transferModal.reason.placeholder')} disabled={isProcessingTransfer}/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" disabled={isProcessingTransfer}>{t('patientRegistration.quickRegModal.cancelButton')}</Button></DialogClose>
                                <Button onClick={handleConfirmTransfer} disabled={isProcessingTransfer || !transferType || !transferReason.trim() || (transferType === 'internal_ward' && !targetInternalWardId) || (transferType === 'external_hospital' && !externalHospitalName.trim())}>
                                    {isProcessingTransfer ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    {t('wardManagement.patientCare.transferModal.confirmButton')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}
          </Card>
        )}

        {!selectedWardId && !isLoadingAllWards && allWardsData.length > 0 &&(
            <Card className="shadow-sm">
                <CardContent className="py-10">
                    <p className="text-center text-muted-foreground">{t('wardManagement.noWardSelected')}</p>
                </CardContent>
            </Card>
        )}
         {!isLoadingAllWards && allWardsData.length === 0 && ( 
            <Card className="shadow-sm">
                <CardContent className="py-10">
                    <p className="text-center text-muted-foreground">{t('wardManagement.noWardsAvailable')}</p>
                </CardContent>
            </Card>
        )}
      </div>
  );
}


    
