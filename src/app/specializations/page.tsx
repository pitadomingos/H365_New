
"use client"; 

import React, { useState, useEffect } from 'react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Briefcase, Users, Loader2, Star, FileClock } from "lucide-react"; 
import { SpecialistConsultationForm } from "./specialist-consultation-form";
import { getTreatmentRecommendationAction } from "../treatment-recommendation/actions";
import Image from "next/image";
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import { ConsultationInitialData } from '@/app/treatment-recommendation/consultation-form';
import { toast } from "@/hooks/use-toast";


interface MockListItem {
  id: string;
  patientName: string;
  referringDoctor?: string; 
  reason?: string; 
  specialty?: string; 
  timeReferred?: string;
  message?: string; 
  time?: string;
  read?: boolean; 
  photoUrl: string;
  gender?: "Male" | "Female" | "Other";
}

interface DraftedConsultationItem extends MockListItem {
  reasonForDraft: string;
  lastSavedTime: string;
}

const getAvatarHint = (gender?: "Male" | "Female" | "Other") => {
  if (gender === "Male") return "male avatar";
  if (gender === "Female") return "female avatar";
  return "patient avatar";
};

// Mock data for full draft details, similar to the one in ConsultationRoomPage
const MOCK_SPECIALIST_FULL_DRAFT_DETAILS: Record<string, ConsultationInitialData> = {
    "DRAFT_SPEC001": {
        patientData: { 
            nationalId: "SPEC_DRF001_NID", 
            fullName: "Walter White", 
            age: 52, 
            gender: "Male", 
            address: "308 Negra Arroyo Lane, Albuquerque, NM", 
            homeClinic: "Local Clinic", 
            photoUrl: "https://placehold.co/120x120.png", 
            allergies: ["None"], 
            chronicConditions: ["Lung Cancer (suspected)"],
            referringDoctor: "Dr. Saul Goodman",
            referringDepartment: "General Practice",
            reasonForReferral: "Persistent cough, weight loss. Chest X-ray shows suspicious nodule.",
            assignedSpecialty: "Oncology"
        },
        nationalIdSearch: "SPEC_DRF001_NID",
        currentSpecialty: "Oncology",
        bodyTemperature: "37.1",
        weight: "70", // Initial weight
        height: "180",
        bloodPressure: "130/85",
        symptoms: "Patient presents with a persistent cough for the past 3 months, hemoptysis noted twice. Significant weight loss of 10kg over 2 months. Denies fever. Smoker for 30 years, 1 pack/day.",
        labResultsSummary: "CBC: WNL. LDH slightly elevated.",
        imagingDataSummary: "Chest X-ray: 3cm spiculated mass in right upper lobe. CT Chest ordered.",
        specialistComments: "Findings highly suspicious for malignancy. Staging CT and biopsy required. Discussed prognosis and initial treatment options if confirmed.",
        recommendation: null,
    },
    "DRAFT_SPEC002": {
        patientData: { 
            nationalId: "SPEC_DRF002_NID", 
            fullName: "Skyler White", 
            age: 45, 
            gender: "Female", 
            address: "308 Negra Arroyo Lane, Albuquerque, NM", 
            homeClinic: "Local Clinic", 
            photoUrl: "https://placehold.co/120x120.png", 
            allergies: [], 
            chronicConditions: ["Anxiety"],
            referringDoctor: "Dr. Marie Schrader",
            referringDepartment: "Psychiatry",
            reasonForReferral: "New onset seizures.",
            assignedSpecialty: "Neurology"
        },
        nationalIdSearch: "SPEC_DRF002_NID",
        currentSpecialty: "Neurology",
        symptoms: "Patient reports two episodes of generalized tonic-clonic seizures in the past month. No prior history. Currently on sertraline for anxiety.",
        labResultsSummary: "Electrolytes WNL. Prolactin normal post-episode.",
        imagingDataSummary: "MRI Brain pending.",
        specialistComments: "EEG ordered. Start Keppra 500mg BID. Advise driving restrictions.",
        recommendation: null,
    },
};


export default function SpecializationsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [referralList, setReferralList] = useState<MockListItem[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [specialistNotifications, setSpecialistNotifications] = useState<MockListItem[]>([]);
  const [isLoadingSpecialistNotifications, setIsLoadingSpecialistNotifications] = useState(true);
  const [draftedConsultations, setDraftedConsultations] = useState<DraftedConsultationItem[]>([]);
  const [isLoadingDraftedConsultations, setIsLoadingDraftedConsultations] = useState(true);
  const [dataToLoadInForm, setDataToLoadInForm] = useState<ConsultationInitialData | null>(null);


  useEffect(() => {
    setIsLoadingReferrals(true);
    setTimeout(() => {
      const mockReferralListData: MockListItem[] = [
        { id: "REF001", patientName: "Walter White", gender: "Male", referringDoctor: "Dr. Primary", reason: "Lung Cancer Assessment", timeReferred: "09:00 AM", specialty: "Oncology", photoUrl: "https://placehold.co/32x32.png" },
        { id: "REF002", patientName: "Skyler White", gender: "Female", referringDoctor: "Dr. GP", reason: "New Onset Seizures", timeReferred: "09:30 AM", specialty: "Neurology", photoUrl: "https://placehold.co/32x32.png" },
      ];
      setReferralList(mockReferralListData);
      setIsLoadingReferrals(false);
    }, 1200);

    setIsLoadingSpecialistNotifications(true);
    setTimeout(() => {
      const mockSpecialistNotificationsData: MockListItem[] = [
        { id: "SNOTIF001", patientName: "Walter White", gender: "Male", message: "CT Chest results available.", time: "10 mins ago", read: false, photoUrl: "https://placehold.co/32x32.png" },
        { id: "SNOTIF002", patientName: "Skyler White", gender: "Female", message: "EEG scheduled for tomorrow.", time: "25 mins ago", read: true, photoUrl: "https://placehold.co/32x32.png" },
      ];
      setSpecialistNotifications(mockSpecialistNotificationsData);
      setIsLoadingSpecialistNotifications(false);
    }, 1500);

    setIsLoadingDraftedConsultations(true);
    setTimeout(() => {
      const mockDraftedData: DraftedConsultationItem[] = [
        { id: "DRAFT_SPEC001", patientName: "Walter White", gender: "Male", reasonForDraft: "Awaiting Lung Function Tests", lastSavedTime: "Yesterday 02:10 PM", photoUrl: "https://placehold.co/32x32.png", specialty: "Oncology" },
        { id: "DRAFT_SPEC002", patientName: "Skyler White", gender: "Female", reasonForDraft: "Pending EEG results", lastSavedTime: "Today 10:00 AM", photoUrl: "https://placehold.co/32x32.png", specialty: "Neurology" },
      ];
      setDraftedConsultations(mockDraftedData);
      setIsLoadingDraftedConsultations(false);
    }, 1700);
  }, []);

  const handleResumeConsultation = (draftId: string) => {
    const draftDetails = MOCK_SPECIALIST_FULL_DRAFT_DETAILS[draftId];
    if (draftDetails) {
      setDataToLoadInForm(draftDetails);
      toast({title: t('consultationRoom.toast.loadingDraft.title'), description: t('consultationRoom.toast.loadingDraft.description', { patientName: draftDetails.patientData?.fullName || "patient" })});
    } else {
      toast({variant: "destructive", title: t('consultationForm.toast.error'), description: t('consultationRoom.toast.loadingDraft.error')});
    }
  };


  return (
      <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr] gap-6 h-full items-start">
        {/* Left Panel */}
        <div className="lg:sticky lg:top-[calc(theme(spacing.16)_+_theme(spacing.6))] flex flex-col gap-6 max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12)_-_theme(spacing.2))] overflow-y-auto">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" /> {t('specializations.referralList.title')}
              </CardTitle>
              <CardDescription className="text-xs">{t('specializations.referralList.description')}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {isLoadingReferrals ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  {t('specializations.referralList.loading')}
                </div>
              ) : referralList.length > 0 ? (
                <ul className="space-y-3">
                  {referralList.map((patient) => (
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
                        <p className="text-xs text-muted-foreground">{t('specializations.referralList.to')}: {patient.specialty}</p>
                        <p className="text-xs text-muted-foreground">{t('specializations.referralList.from')}: {patient.referringDoctor} | {patient.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="mx-auto h-10 w-10 mb-1" />
                  <p className="text-sm">{t('specializations.referralList.empty')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" /> {t('specializations.notifications.title')}
              </CardTitle>
               <CardDescription className="text-xs">{t('specializations.notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {isLoadingSpecialistNotifications ? (
                 <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  {t('specializations.notifications.loading')}
                </div>
              ) : specialistNotifications.length > 0 ? (
                <ul className="space-y-2.5">
                  {specialistNotifications.map((notif) => (
                     <li key={notif.id} className={`p-2.5 border rounded-md text-xs ${notif.read ? 'bg-muted/40' : 'bg-accent/20 dark:bg-accent/10 border-accent/50'} flex items-start gap-2`}>
                        <Image
                          src={notif.photoUrl}
                          alt={notif.patientName}
                          width={24}
                          height={24}
                          className="rounded-full mt-0.5"
                           data-ai-hint={getAvatarHint(notif.gender)}
                        />
                        <div className="flex-1">
                            <p className={`${notif.read ? 'text-muted-foreground' : 'font-medium'}`}>
                              <strong>{notif.patientName}:</strong> {notif.message}
                            </p>
                            <p className={`text-xs ${notif.read ? 'text-muted-foreground/80' : 'text-muted-foreground' } mt-0.5`}>{notif.time}</p>
                        </div>
                      </li>
                  ))}
                </ul>
              ) : (
                 <div className="text-center py-6 text-muted-foreground">
                  <Bell className="mx-auto h-10 w-10 mb-1" />
                  <p className="text-sm">{t('specializations.notifications.empty')}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileClock className="h-5 w-5 text-primary" /> {t('specializations.drafts.title')}
                </CardTitle>
                <CardDescription className="text-xs">{t('specializations.drafts.description')}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto">
                {isLoadingDraftedConsultations ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        {t('specializations.drafts.loading')}
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
                                        <p className="text-xs text-muted-foreground">{t('specializations.drafts.specialty')}: {consult.specialty}</p>
                                        <p className="text-xs text-muted-foreground">{t('specializations.drafts.saved')}: {consult.lastSavedTime}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => handleResumeConsultation(consult.id)}>
                                    {t('specializations.drafts.resumeButton')}
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <FileClock className="mx-auto h-10 w-10 mb-1" />
                        <p className="text-sm">{t('specializations.drafts.empty')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
        </div>

        {/* Center Panel */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Star className="h-8 w-8" /> {t('specializations.pageTitle')}
            </h1>
          </div>
          <SpecialistConsultationForm 
            getRecommendationAction={getTreatmentRecommendationAction} 
            initialData={dataToLoadInForm}
            />
        </div>

      </div>
  );
}

    
