
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardEdit, ListChecks, Bell, Users, FileClock, Loader2, Star } from "lucide-react";
import { ConsultationForm, type ConsultationInitialData } from "./consultation-form";
import { getTreatmentRecommendationAction, getPatientContextAction } from "./actions";
import Image from "next/image";
import { useLocale } from '@/context/locale-context';
import { getTranslator, type Locale } from '@/lib/i18n';
import { MOCK_PATIENTS, MOCK_DRAFTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface MockListItem {
  id: string;
  patientName: string;
  nationalId: string;
  timeAdded?: string;
  location?: string;
  status?: string;
  message?: string;
  time?: string;
  read?: boolean;
  photoUrl: string;
  gender?: "Male" | "Female" | "Other";
}

interface DraftedConsultationItem extends MockListItem {
  reasonForDraft: string;
  lastSavedTime: string;
  specialty?: string;
}

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

const MOCK_FULL_DRAFT_DETAILS: Record<string, ConsultationInitialData> = {
    "D1": {
        patientData: {
            nationalId: "1029384756",
            fullName: "Li-Rieal Antonio Pita Domingos",
            age: 28,
            gender: "Female",
            address: "Tete, Tete",
            homeClinic: "District Hospital",
            photoUrl: "https://placehold.co/120x120.png?text=LA",
            allergies: ["None Reported"],
            chronicConditions: ["None Reported"],
        },
        nationalIdSearch: "1029384756",
        bodyTemperature: "36.8",
        weight: "62",
        height: "165",
        bloodPressure: "118/76",
        symptoms: "Patient reports chest discomfort and shortness of breath on exertion for 3 days. Awaiting cardiology lab panel.",
        labResultsSummary: "Awaiting results: Troponin, BNP, CBC.",
        imagingDataSummary: "Chest X-Ray ordered — results pending.",
        doctorComments: "Monitor vitals. Cardiology referral considered if labs confirm elevated troponin.",
        recommendation: null,
    },
    "D2": {
        patientData: {
            nationalId: "5647382910",
            fullName: "Delfina Correia Domingos",
            age: 45,
            gender: "Female",
            address: "Tete, Tete",
            homeClinic: "District Hospital",
            photoUrl: "https://placehold.co/120x120.png?text=DC",
            allergies: ["Penicillin"],
            chronicConditions: ["Hypertension"],
        },
        nationalIdSearch: "5647382910",
        bodyTemperature: "37.1",
        weight: "70",
        height: "160",
        bloodPressure: "145/92",
        symptoms: "Persistent headaches and visual disturbances. MRI Brain ordered.",
        labResultsSummary: "CBC within normal limits. Electrolytes pending.",
        imagingDataSummary: "MRI Brain ordered — neurology review pending.",
        doctorComments: "BP elevated. Adjusted antihypertensive dose. Awaiting MRI report.",
        recommendation: null,
    },
    "D3": {
        patientData: {
            nationalId: "9988776655",
            fullName: "Graciela Tembanne",
            age: 32,
            gender: "Female",
            address: "Angonia, Tete",
            homeClinic: "District Hospital",
            photoUrl: "https://placehold.co/120x120.png?text=GT",
            allergies: ["None Reported"],
            chronicConditions: ["None Reported"],
        },
        nationalIdSearch: "9988776655",
        bodyTemperature: "36.5",
        weight: "58",
        height: "162",
        bloodPressure: "112/72",
        symptoms: "Post-appendectomy Day 2. Surgical prep notes and wound management documented.",
        labResultsSummary: "WBC slightly elevated post-op — expected. Repeat CBC in 24h.",
        imagingDataSummary: "Abdominal ultrasound completed — normal.",
        doctorComments: "Recovery progressing well. Continue IV antibiotics. Discharge planned if afebrile for 24h.",
        recommendation: null,
    },
};


interface WaitingListInternalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  waitingList: MockListItem[];
  isLoading: boolean;
  onSelectPatient: (nationalId: string) => void;
}

function WaitingListInternal({ t, waitingList, isLoading, onSelectPatient }: WaitingListInternalProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListChecks className="h-5 w-5 text-primary" /> {t('consultationRoom.waitingList.title')}
        </CardTitle>
        <CardDescription className="text-xs">{t('consultationRoom.waitingList.description')}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            {t('consultationRoom.waitingList.loading')}
          </div>
        ) : waitingList.length > 0 ? (
          <ul className="space-y-3">
            {waitingList.map((patient) => (
              <li 
                key={patient.id} 
                className="p-2.5 border rounded-md shadow-sm bg-background hover:bg-muted/50 flex items-center gap-3 cursor-pointer transition-all hover:border-primary/50 group"
                onClick={() => onSelectPatient(patient.nationalId)}
              >
                <FallbackAvatar
                  name={patient.patientName}
                  photoUrl={patient.photoUrl}
                  gender={patient.gender}
                  size={32}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{patient.patientName}</p>
                  <p className="text-xs text-muted-foreground">{patient.location} - {patient.status}</p>
                  <p className="text-xs text-muted-foreground">{t('appointments.upcoming.table.time')}: {patient.timeAdded}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="mx-auto h-10 w-10 mb-1" />
            <p className="text-sm">{t('consultationRoom.waitingList.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LabNotificationsInternalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  labNotifications: MockListItem[];
  isLoading: boolean;
}
function LabNotificationsInternal({ t, labNotifications, isLoading }: LabNotificationsInternalProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" /> {t('consultationRoom.notifications.title')}
        </CardTitle>
        <CardDescription className="text-xs">{t('consultationRoom.notifications.description')}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            {t('consultationRoom.notifications.loading')}
          </div>
        ) : labNotifications.length > 0 ? (
          <ul className="space-y-2.5">
            {labNotifications.map((notif) => (
              <li key={notif.id} className={cn("p-2.5 border rounded-md text-xs flex items-start gap-2", notif.read ? 'bg-muted/40' : 'bg-accent/20 dark:bg-accent/10 border-accent/50')}>
                <FallbackAvatar
                  name={notif.patientName}
                  photoUrl={notif.photoUrl}
                  gender={notif.gender}
                  size={24}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={cn(notif.read ? 'text-muted-foreground' : 'font-medium')}>
                    <strong>{notif.patientName}:</strong> {notif.message}
                  </p>
                  <p className={cn("text-xs mt-0.5", notif.read ? 'text-muted-foreground/80' : 'text-muted-foreground' )}>{notif.time}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="mx-auto h-10 w-10 mb-1" />
            <p className="text-sm">{t('consultationRoom.notifications.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface IncompleteConsultationsInternalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  draftedConsultations: DraftedConsultationItem[];
  isLoading: boolean;
  onResume: (draftId: string) => void;
}

function IncompleteConsultationsInternal({ t, draftedConsultations, isLoading, onResume }: IncompleteConsultationsInternalProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileClock className="h-5 w-5 text-primary" /> {t('consultationRoom.drafts.title')}
        </CardTitle>
        <CardDescription className="text-xs">{t('consultationRoom.drafts.description')}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            {t('consultationRoom.drafts.loading')}
          </div>
        ) : draftedConsultations.length > 0 ? (
          <ul className="space-y-3">
            {draftedConsultations.map((consult) => (
              <li key={consult.id} className="p-2.5 border rounded-md shadow-sm bg-background hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FallbackAvatar
                    name={consult.patientName}
                    photoUrl={consult.photoUrl}
                    gender={consult.gender}
                    size={32}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{consult.patientName}</p>
                    <p className="text-xs text-muted-foreground">{t('specializations.drafts.reason')}: {consult.reasonForDraft}</p>
                    <p className="text-xs text-muted-foreground">{t('consultationRoom.drafts.saved')}: {consult.lastSavedTime}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => onResume(consult.id)}>
                  {t('consultationRoom.drafts.resumeButton')}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FileClock className="mx-auto h-10 w-10 mb-1" />
            <p className="text-sm">{t('consultationRoom.drafts.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function ConsultationRoomPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [waitingList, setWaitingList] = useState<MockListItem[]>([]);
  const [isLoadingWaitingList, setIsLoadingWaitingList] = useState(true);

  const [labNotificationsState, setLabNotificationsState] = useState<MockListItem[]>([]);
  const [isLoadingLabNotifications, setIsLoadingLabNotifications] = useState(true);

  const [draftedConsultations, setDraftedConsultations] = useState<DraftedConsultationItem[]>([]);
  const [isLoadingDraftedConsultations, setIsLoadingDraftedConsultations] = useState(true);

  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null); 
  const [manualSearchId, setManualSearchId] = useState<string | null>(null);

  const dataToLoadInForm = useMemo(() => {
    if (manualSearchId) {
        return { nationalIdSearch: manualSearchId };
    }
    if (selectedDraftId && MOCK_FULL_DRAFT_DETAILS[selectedDraftId]) {
      return MOCK_FULL_DRAFT_DETAILS[selectedDraftId];
    }
    return null;
  }, [selectedDraftId, manualSearchId]); 

  useEffect(() => {
    const fetchWaitingListData = async () => {
      setIsLoadingWaitingList(true);
      const localT = getTranslator(currentLocale); // Use locale-specific t for data generation
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWaitingList(MOCK_PATIENTS.map(p => ({
        id: p.id,
        patientName: p.fullName,
        nationalId: p.nationalId,
        gender: p.gender,
        timeAdded: p.timeAdded || "08:00 AM",
        location: p.location || "Outpatient",
        status: p.status || "Waiting",
        photoUrl: p.photoUrl
      })));
      setIsLoadingWaitingList(false);
    };
    fetchWaitingListData();
  }, [currentLocale]);

  useEffect(() => {
    const fetchNotificationsData = async () => {
      setIsLoadingLabNotifications(true);
      const localT = getTranslator(currentLocale); // Use locale-specific t for data generation
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      const initialMockLabNotificationsData: MockListItem[] = [
        { id: "NOTIF001", patientName: "Charlie Brown", nationalId: "NOTIF001_NID", gender: "Male", message: localT('consultationRoom.notifications.mock.resultsReady'), time: "5 mins ago", read: false, photoUrl: "https://placehold.co/32x32.png" },
        { id: "NOTIF002", patientName: "Diana Prince", nationalId: "NOTIF002_NID", gender: "Female", message: localT('consultationRoom.notifications.mock.imagingReady'), time: "15 mins ago", read: true, photoUrl: "https://placehold.co/32x32.png" },
      ];
      setLabNotificationsState(initialMockLabNotificationsData);
      setIsLoadingLabNotifications(false);
    };
    fetchNotificationsData();
  }, [currentLocale]);

  useEffect(() => {
    const fetchDraftsData = async () => {
      setIsLoadingDraftedConsultations(true);
      const localT = getTranslator(currentLocale); // Use locale-specific t for data generation
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDraftedConsultations(MOCK_DRAFTS.map(d => ({
        id: d.id,
        patientName: d.patientName,
        nationalId: d.id === "D1" ? "1029384756" : d.id === "D2" ? "5647382910" : "9988776655",
        reasonForDraft: d.specialtyOrReason,
        lastSavedTime: d.lastSavedTime,
        photoUrl: "https://placehold.co/32x32.png",
        gender: "Female"
      })));
      setIsLoadingDraftedConsultations(false);
    };
    fetchDraftsData();
  }, [currentLocale]);


  const handleResumeConsultation = (draftId: string) => {
    const draftDetails = MOCK_FULL_DRAFT_DETAILS[draftId];
    if (draftDetails) {
      setManualSearchId(null);
      setSelectedDraftId(draftId); // Update selectedDraftId instead of dataToLoadInForm directly
      toast({ title: t('consultationRoom.toast.loadingDraft.title'), description: t('consultationRoom.toast.loadingDraft.description', { patientName: draftDetails.patientData?.fullName || "patient" }) });
    } else {
      toast({ variant: "destructive", title: t('consultationForm.toast.error'), description: t('consultationRoom.toast.loadingDraft.error') });
    }
  };

  const handleSelectPatient = (nationalId: string) => {
    setSelectedDraftId(null);
    // Use a small trick to ensure the memo updates if the same ID is clicked again
    setManualSearchId(null);
    setTimeout(() => {
        setManualSearchId(nationalId);
        toast({ title: t('consultationForm.toast.search.found'), description: `Selected patient with ID: ${nationalId}` });
    }, 10);
  };

  return (
      <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr] gap-6 h-full items-start">
        {/* Left Panel */}
        <div className="lg:sticky lg:top-[calc(theme(spacing.16)_+_theme(spacing.6))] flex flex-col gap-6 max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12)_-_theme(spacing.2))] overflow-y-auto">
          <WaitingListInternal t={t} waitingList={waitingList} isLoading={isLoadingWaitingList} onSelectPatient={handleSelectPatient} />
          <LabNotificationsInternal t={t} labNotifications={labNotificationsState} isLoading={isLoadingLabNotifications} />
          <IncompleteConsultationsInternal t={t} draftedConsultations={draftedConsultations} isLoading={isLoadingDraftedConsultations} onResume={handleResumeConsultation} />
        </div>

        {/* Center Panel */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardEdit className="h-8 w-8" /> {t('consultationRoom.pageTitle')}
            </h1>
          </div>
          <ConsultationForm
            getRecommendationAction={getTreatmentRecommendationAction}
            getPatientContextAction={getPatientContextAction}
            initialData={dataToLoadInForm}
          />
        </div>
      </div>
  );
}

    