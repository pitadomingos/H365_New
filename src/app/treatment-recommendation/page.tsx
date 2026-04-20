
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardEdit, ListChecks, Bell, Users, FileClock, Loader2, Star } from "lucide-react";
import { ConsultationForm, type ConsultationInitialData } from "./consultation-form";
import { getTreatmentRecommendationAction } from "./actions";
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

const MOCK_FULL_DRAFT_DETAILS: Record<string, ConsultationInitialData> = {
    "DRAFT001": {
        patientData: { nationalId: "DRF001_NID", fullName: "Edward Scissorhands", age: 30, gender: "Male", address: "1 Gothic Lane", homeClinic: "Suburbia Clinic", photoUrl: "https://placehold.co/120x120.png", allergies: ["Sunlight"], chronicConditions: ["Arthritis"] },
        nationalIdSearch: "DRF001_NID",
        bodyTemperature: "36.5",
        weight: "65",
        height: "170",
        bloodPressure: "110/70",
        symptoms: "Joint pain, difficulty holding objects. Patient expresses frustration with garden shears.",
        labResultsSummary: "Inflammatory markers slightly elevated.",
        imagingDataSummary: "X-rays show early signs of joint degradation.",
        doctorComments: "Advised NSAIDs and occupational therapy. Consider referral to rheumatology if no improvement.",
        recommendation: null,
    },
    "DRAFT002": {
        patientData: { nationalId: "DRF002_NID", fullName: "Fiona Gallagher", age: 28, gender: "Female", address: "South Side, Chicago", homeClinic: "County General", photoUrl: "https://placehold.co/120x120.png", allergies: ["Poverty"], chronicConditions: ["Resilience"] },
        nationalIdSearch: "DRF002_NID",
        bodyTemperature: "37.0",
        weight: "58",
        height: "165",
        bloodPressure: "120/80",
        symptoms: "Patient reports feeling overwhelmed, managing multiple family responsibilities. Expresses fatigue.",
        labResultsSummary: "All labs within normal limits.",
        imagingDataSummary: "Not applicable.",
        doctorComments: "Discussed coping mechanisms and stress management. Offered referral to social services.",
        recommendation: null,
    },
};

interface WaitingListInternalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  waitingList: MockListItem[];
  isLoading: boolean;
}

function WaitingListInternal({ t, waitingList, isLoading }: WaitingListInternalProps) {
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
              <li key={patient.id} className="p-2.5 border rounded-md shadow-sm bg-background hover:bg-muted/50 flex items-center gap-3">
                <Image
                  src={patient.photoUrl}
                  alt={patient.patientName}
                  width={32}
                  height={32}
                  className="rounded-full"
                  data-ai-hint={getAvatarHint(patient.gender)}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{patient.patientName}</p>
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
                <Image
                  src={notif.photoUrl}
                  alt={notif.patientName}
                  width={24}
                  height={24}
                  className="rounded-full mt-0.5"
                  data-ai-hint={getAvatarHint(notif.gender)}
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
                  <Image
                    src={consult.photoUrl}
                    alt={consult.patientName}
                    width={32}
                    height={32}
                    className="rounded-full"
                    data-ai-hint={getAvatarHint(consult.gender)}
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

  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null); // New state to hold the selected draft ID

  const dataToLoadInForm = useMemo(() => {
    if (selectedDraftId && MOCK_FULL_DRAFT_DETAILS[selectedDraftId]) {
      return MOCK_FULL_DRAFT_DETAILS[selectedDraftId];
    }
    return null;
  }, [selectedDraftId]); // dataToLoadInForm now only changes when selectedDraftId changes

  useEffect(() => {
    const fetchWaitingListData = async () => {
      setIsLoadingWaitingList(true);
      const localT = getTranslator(currentLocale); // Use locale-specific t for data generation
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWaitingList(MOCK_PATIENTS.map(p => ({
        id: p.id,
        patientName: p.fullName,
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
        { id: "NOTIF001", patientName: "Charlie Brown", gender: "Male", message: localT('consultationRoom.notifications.mock.resultsReady'), time: "5 mins ago", read: false, photoUrl: "https://placehold.co/32x32.png" },
        { id: "NOTIF002", patientName: "Diana Prince", gender: "Female", message: localT('consultationRoom.notifications.mock.imagingReady'), time: "15 mins ago", read: true, photoUrl: "https://placehold.co/32x32.png" },
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
      setSelectedDraftId(draftId); // Update selectedDraftId instead of dataToLoadInForm directly
      toast({ title: t('consultationRoom.toast.loadingDraft.title'), description: t('consultationRoom.toast.loadingDraft.description', { patientName: draftDetails.patientData?.fullName || "patient" }) });
    } else {
      toast({ variant: "destructive", title: t('consultationForm.toast.error'), description: t('consultationRoom.toast.loadingDraft.error') });
    }
  };

  return (
      <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr] gap-6 h-full items-start">
        {/* Left Panel */}
        <div className="lg:sticky lg:top-[calc(theme(spacing.16)_+_theme(spacing.6))] flex flex-col gap-6 max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12)_-_theme(spacing.2))] overflow-y-auto">
          <WaitingListInternal t={t} waitingList={waitingList} isLoading={isLoadingWaitingList} />
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
            initialData={dataToLoadInForm}
          />
        </div>
      </div>
  );
}

    