
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, CalendarIcon, Camera, UserCircle, Trash2, ArrowRightCircle, MapPin, Activity, UploadCloud, Download, Info, Loader2, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from "next/link";
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import { ptBR } from 'date-fns/locale';
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { LocalDB } from "@/lib/db";

interface WaitingListItem {
  id: number | string;
  name: string;
  timeAdded: string;
  location: string;
  status: string;
  photoUrl: string;
  gender?: "Male" | "Female" | "Other";
}

const patientFormSchema = z.object({
  nationalId: z.string().min(1, "National ID is required."),
  fullName: z.string().min(1, "Full name is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required."}),
  gender: z.string().min(1, "Gender is required."),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  contactNumber: z.string().min(1, "Contact number is required."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  address: z.string().min(1, "Address is required."),
  district: z.string().min(1, "District is required."),
  province: z.string().min(1, "Province is required."),
  homeHospital: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinNumber: z.string().optional(),
  nextOfKinAddress: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;


export default function PatientRegistrationPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);


  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nationalId: "",
      fullName: "",
      dateOfBirth: undefined,
      gender: "",
      allergies: "",
      chronicConditions: "",
      contactNumber: "",
      email: "",
      address: "",
      district: "",
      province: "",
      homeHospital: "",
      nextOfKinName: "",
      nextOfKinNumber: "",
      nextOfKinAddress: "",
    }
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const hospitalName = "HealthFlow Central Hospital"; 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
  const [isWaitingListLoading, setIsWaitingListLoading] = useState(true);

 useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, [currentLocale]);


  useEffect(() => {
    const fetchWaitingList = async () => {
      setIsWaitingListLoading(true);
      try {
        console.log("Fetching waiting list for Patient Registration page...");
        // const response = await fetch('/api/v1/visits/waiting-list');
        // if (!response.ok) throw new Error("Failed to fetch waiting list");
        // const data = await response.json();
        // setWaitingList(data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setWaitingList(MOCK_PATIENTS.map(p => ({
          id: p.id,
          name: p.fullName,
          gender: p.gender,
          timeAdded: p.timeAdded || "08:00 AM",
          location: p.location || "Outpatient",
          status: p.status || "Waiting",
          photoUrl: p.photoUrl
        })));
      } catch (error) {
        console.error("Error fetching waiting list:", error);
        toast({ variant: "destructive", title: t('patientRegistration.toast.loadError'), description: t('patientRegistration.loadingWaitingList') });
      } finally {
        setIsWaitingListLoading(false);
      }
    };
    fetchWaitingList();
  }, [t]);

  const enableCamera = useCallback(async () => {
    if (hasCameraPermission === false && !stream) {
      setHasCameraPermission(null); 
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 385 } });
        setHasCameraPermission(true);
        setStream(mediaStream);
        setCapturedImage(null); 
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        setStream(null);
        toast({
          variant: "destructive",
          title: t('patientRegistration.toast.cameraDenied.title'),
          description: t('patientRegistration.toast.cameraDenied.description'),
        });
      }
    } else {
      setHasCameraPermission(false);
      setStream(null);
      toast({
        variant: "destructive",
        title: t('patientRegistration.toast.cameraNotSupported.title'),
        description: t('patientRegistration.toast.cameraNotSupported.description'),
      });
    }
  }, [hasCameraPermission, stream, t]);

  useEffect(() => {
    if (videoRef.current && stream && !capturedImage) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(error => {
           console.error('Error attempting to play video:', error);
           toast({ variant: "destructive", title: t('patientRegistration.photoCapture.cameraError'), description: "Could not start video preview." });
        });
      };
    }
    return () => {
      if (stream && !capturedImage) { 
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, capturedImage, t]);


  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const targetWidth = 240; 
      const targetHeight = 308; 
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');
      if (context) {
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const targetAspectRatio = targetWidth / targetHeight;
        
        let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

        if (videoAspectRatio > targetAspectRatio) { 
            sWidth = video.videoHeight * targetAspectRatio;
            sx = (video.videoWidth - sWidth) / 2;
        } else { 
            sHeight = video.videoWidth / targetAspectRatio;
            sy = (video.videoHeight - sHeight) / 2;
        }
        
        context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stream.getTracks().forEach(track => track.stop()); 
        setStream(null); 
      }
    }
  };

  const discardPhoto = () => {
    setCapturedImage(null);
    // Automatically try to re-enable camera if permission was not denied
    // if (hasCameraPermission !== false) { enableCamera(); } // Commented out for now to give user explicit control
  };

  const downloadCSVTemplate = () => {
    const headers = [
      "NationalID", "FullName", "DateOfBirth (YYYY-MM-DD)", "Gender", 
      "Allergies", "ChronicConditions",
      "ContactNumber", "EmailAddress", "Address", "District", "Province",
      "HomeHospital", "NextOfKinName", "NextOfKinNumber", "NextOfKinAddress"
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "patient_registration_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t('patientRegistration.toast.templateDownloaded.title'), description: t('patientRegistration.toast.templateDownloaded.description') });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        console.log("Uploading bulk patient file (mock):", selectedFile.name);
        // const response = await fetch('/api/v1/patients/bulk', {
        //   method: 'POST',
        //   body: formData, 
        // });
        // if (!response.ok) {
        //   const errorData = await response.json().catch(() => ({ error: "Bulk upload failed" }));
        //   throw new Error(errorData.error || `API error: ${response.status}`);
        // }
        // const result = await response.json();
        // toast({ title: "Bulk Registration Started", description: `${result.message}. Successful: ${result.results.successful}, Failed: ${result.results.failed}` });
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        toast({
          title: t('patientRegistration.toast.fileUploadMock.title'),
          description: t('patientRegistration.toast.fileUploadMock.description', { fileName: selectedFile.name }),
        });
        setSelectedFile(null);
        const fileInput = document.getElementById('bulkPatientFile') as HTMLInputElement;
        if (fileInput) fileInput.value = ""; 
      } catch (error: any) {
        console.error("Bulk upload error:", error);
        toast({
          variant: "destructive",
          title: t('patientRegistration.toast.regFailed.title'),
          description: error.message || "An unexpected error occurred during bulk upload.",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: t('patientRegistration.toast.noFileSelected.title'),
        description: t('patientRegistration.toast.noFileSelected.description'),
      });
    }
  };

  const onSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    setIsSubmitting(true);

    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: t('patientRegistration.toast.photoRequired.title'),
        description: t('patientRegistration.toast.photoRequired.description'),
      });
      setIsSubmitting(false);
      return;
    }

    const patientId = `P-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newPatient = {
      id: patientId,
      nationalId: data.nationalId,
      fullName: data.fullName,
      gender: data.gender,
      age: data.dateOfBirth ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : 0,
      dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : "",
      photoUrl: capturedImage,
      district: data.district,
      province: data.province,
      lastVisit: format(new Date(), "yyyy-MM-dd"),
      status: "Registered - Offline",
      location: "Outpatient",
      timeAdded: format(new Date(), "hh:mm a"),
    };

    try {
      // Offline-First: Save to LocalDB immediately
      const currentPatients = await LocalDB.get("patients", MOCK_PATIENTS);
      await LocalDB.save("patients", [newPatient, ...currentPatients]);

      // Attempt to sync (Simulated API call)
      console.log("Syncing with cloud...");
      
      // We simulate a fetch that might fail if offline
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        // Mock successful sync
        await new Promise(r => setTimeout(r, 1000));
        console.log("Cloud Sync Successful");
      } else {
        console.warn(t('patientRegistration.toast.syncQueued'));
      }

      const age = data.dateOfBirth ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : 'N/A';
      const allergiesDisplay = (data.allergies || "").split(',').map(s => s.trim()).filter(Boolean).join(', ') || 'None';
      const chronicConditionsDisplay = (data.chronicConditions || "").split(',').map(s => s.trim()).filter(Boolean).join(', ') || 'None';
      
      toast({ 
        title: isOnline ? t('patientRegistration.toast.regSuccess.title') : t('patientRegistration.toast.offlineSaved'), 
        description: t('patientRegistration.toast.regSuccess.description', { 
            fullName: newPatient.fullName, 
            nationalId: newPatient.nationalId, 
            age: newPatient.age.toString(), 
            gender: newPatient.gender,
            allergies: allergiesDisplay,
            chronicConditions: chronicConditionsDisplay
        })
      });
      form.reset();
      setCapturedImage(null);
      setHasCameraPermission(null); 
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: t('patientRegistration.toast.regFailed.title'),
        description: "Failed to save data. Please check your local storage.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarHint = (gender?: "Male" | "Female" | "Other") : string => {
    if (gender === "Male") return "male avatar";
    if (gender === "Female") return "female avatar";
    return "patient avatar";
  };

  return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-8 w-8" /> {t('patientRegistration.pageTitle')}
          </h1>
          <Button variant="outline" asChild>
            <Link href="/visiting-patients">
              <ArrowRightCircle className="mr-2 h-4 w-4" />
              {t('patientRegistration.goToVisitingPatients')}
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <form onSubmit={form.handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('patientRegistration.newPatientDetails.title')}</CardTitle>
                <CardDescription>{t('patientRegistration.newPatientDetails.description')}</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="grid lg:grid-cols-[240px_1fr] gap-x-6 gap-y-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="relative w-[240px] h-[308px] bg-muted rounded-md flex items-center justify-center overflow-hidden border border-dashed border-primary/50">
                       {!capturedImage && (
                          <video
                              ref={videoRef}
                              className={cn("w-full h-full object-cover", (!stream || !hasCameraPermission) && "bg-muted/50")}
                              muted
                              playsInline
                              autoPlay={false} 
                          />
                       )}
                       {capturedImage ? (
                          <Image 
                            src={capturedImage} 
                            alt="Captured patient photo" 
                            width={240} 
                            height={308} 
                            className="w-full h-full object-cover rounded-md" 
                            data-ai-hint={getAvatarHint(form.watch("gender") as PatientFormValues["gender"])}
                          />
                        ) : !(stream && hasCameraPermission) && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-2">
                                <UserCircle className="w-24 h-24 opacity-50" />
                                {hasCameraPermission === null && <p className="text-xs mt-2 text-center">{t('patientRegistration.photoCapture.enablePrompt')}</p>}
                                {hasCameraPermission === false && <p className="text-xs mt-2 text-center">{t('patientRegistration.photoCapture.cameraDenied.description')}</p>}
                             </div>
                        )}
                    </div>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold border-b pb-1">{t('patientRegistration.personalInfo.title')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">{t('patientRegistration.nationalId.label')} <span className="text-destructive">*</span></Label>
                        <Input id="nationalId" placeholder={t('patientRegistration.nationalId.placeholder')} {...form.register("nationalId")} />
                        {form.formState.errors.nationalId && <p className="text-xs text-destructive">{form.formState.errors.nationalId.message}</p>}
                        <p className="text-xs text-muted-foreground">{t('patientRegistration.nationalId.description')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t('patientRegistration.fullName.label')} <span className="text-destructive">*</span></Label>
                        <Input id="fullName" placeholder={t('patientRegistration.fullName.placeholder')} {...form.register("fullName")} />
                        {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dob">{t('patientRegistration.dob.label')} <span className="text-destructive">*</span></Label>
                        <Controller
                          control={form.control}
                          name="dateOfBirth"
                          rules={{ required: "Date of birth is required."}}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP", { locale: currentLocale === 'pt' ? ptBR : undefined }) : <span>{t('patientRegistration.dob.placeholder')}</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar locale={currentLocale === 'pt' ? ptBR : undefined} mode="single" selected={field.value} onSelect={field.onChange} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {form.formState.errors.dateOfBirth && <p className="text-xs text-destructive">{form.formState.errors.dateOfBirth.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">{t('patientRegistration.gender.label')} <span className="text-destructive">*</span></Label>
                        <Controller
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} >
                              <SelectTrigger id="gender">
                                <SelectValue placeholder={t('patientRegistration.gender.placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">{t('patientRegistration.gender.male')}</SelectItem>
                                <SelectItem value="Female">{t('patientRegistration.gender.female')}</SelectItem>
                                <SelectItem value="Other">{t('patientRegistration.gender.other')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {form.formState.errors.gender && <p className="text-xs text-destructive">{form.formState.errors.gender.message}</p>}
                      </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="allergies">{t('patientRegistration.allergies.label')}</Label>
                        <Textarea id="allergies" placeholder={t('patientRegistration.allergies.placeholder')} {...form.register("allergies")} />
                        {form.formState.errors.allergies && <p className="text-xs text-destructive">{form.formState.errors.allergies.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="chronicConditions">{t('patientRegistration.chronicConditions.label')}</Label>
                        <Textarea id="chronicConditions" placeholder={t('patientRegistration.chronicConditions.placeholder')} {...form.register("chronicConditions")} />
                        {form.formState.errors.chronicConditions && <p className="text-xs text-destructive">{form.formState.errors.chronicConditions.message}</p>}
                    </div>
                    
                    <div className="pt-2 mt-4 border-t">
                        <h3 className="text-md font-semibold flex items-center gap-2 border-b pb-1">
                            <Camera className="h-5 w-5" /> {t('patientRegistration.photoCapture.title')} <span className="text-destructive">*</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">{t('patientRegistration.photoCapture.description')}</p>
                        <div className="flex gap-2 mt-2">
                        {!stream && !capturedImage && (
                            <Button type="button" onClick={enableCamera} variant="outline">
                            <Camera className="mr-2 h-4 w-4" /> {t('patientRegistration.photoCapture.enableCamera')}
                            </Button>
                        )}
                        {stream && hasCameraPermission && !capturedImage && (
                            <Button type="button" onClick={capturePhoto}>
                            <Camera className="mr-2 h-4 w-4" /> {t('patientRegistration.photoCapture.capturePhoto')}
                            </Button>
                        )}
                        {capturedImage && (
                            <Button type="button" onClick={discardPhoto} variant="destructive" className="flex items-center">
                            <Trash2 className="mr-2 h-4 w-4" /> {t('patientRegistration.photoCapture.discardPhoto')}
                            </Button>
                        )}
                        </div>
                         {hasCameraPermission === false && (
                            <Alert variant="destructive" className="w-full mt-2">
                                <AlertTitle>{t('patientRegistration.photoCapture.cameraDenied.title')}</AlertTitle>
                                <AlertDescription>
                                {t('patientRegistration.photoCapture.cameraDenied.description')}
                                <Button onClick={enableCamera} variant="link" className="p-0 h-auto ml-1">{t('patientRegistration.photoCapture.cameraDenied.retry')}</Button>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold border-b pb-1">{t('patientRegistration.contactInfo.title')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">{t('patientRegistration.phone.label')} <span className="text-destructive">*</span></Label>
                        <Input id="contactNumber" type="tel" placeholder={t('patientRegistration.phone.placeholder')} {...form.register("contactNumber")} />
                        {form.formState.errors.contactNumber && <p className="text-xs text-destructive">{form.formState.errors.contactNumber.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('patientRegistration.email.label')}</Label>
                        <Input id="email" type="email" placeholder={t('patientRegistration.email.placeholder')} {...form.register("email")} />
                         {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t('patientRegistration.address.label')} <span className="text-destructive">*</span></Label>
                      <Textarea id="address" placeholder={t('patientRegistration.address.placeholder')} {...form.register("address")} />
                       {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-semibold border-b pb-1">{t('patientRegistration.locationOrigin.title')}</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district">{t('patientRegistration.district.label')} <span className="text-destructive">*</span></Label>
                        <Input id="district" placeholder={t('patientRegistration.district.placeholder')} {...form.register("district")}/>
                         {form.formState.errors.district && <p className="text-xs text-destructive">{form.formState.errors.district.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">{t('patientRegistration.province.label')} <span className="text-destructive">*</span></Label>
                        <Input id="province" placeholder={t('patientRegistration.province.placeholder')} {...form.register("province")}/>
                        {form.formState.errors.province && <p className="text-xs text-destructive">{form.formState.errors.province.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeHospital">{t('patientRegistration.homeHospital.label')}</Label>
                        <Input id="homeHospital" placeholder={t('patientRegistration.homeHospital.placeholder')} {...form.register("homeHospital")} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-semibold border-b pb-1">{t('patientRegistration.nextOfKin.title')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="nextOfKinName">{t('patientRegistration.nextOfKin.fullName.label')}</Label>
                        <Input id="nextOfKinName" placeholder={t('patientRegistration.nextOfKin.fullName.placeholder')} {...form.register("nextOfKinName")}/>
                         {form.formState.errors.nextOfKinName && <p className="text-xs text-destructive">{form.formState.errors.nextOfKinName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nextOfKinNumber">{t('patientRegistration.nextOfKin.contact.label')}</Label>
                        <Input id="nextOfKinNumber" type="tel" placeholder={t('patientRegistration.nextOfKin.contact.placeholder')} {...form.register("nextOfKinNumber")}/>
                        {form.formState.errors.nextOfKinNumber && <p className="text-xs text-destructive">{form.formState.errors.nextOfKinNumber.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinAddress">{t('patientRegistration.nextOfKin.address.label')}</Label>
                      <Textarea id="nextOfKinAddress" placeholder={t('patientRegistration.nextOfKin.address.placeholder')} {...form.register("nextOfKinAddress")}/>
                       {form.formState.errors.nextOfKinAddress && <p className="text-xs text-destructive">{form.formState.errors.nextOfKinAddress.message}</p>}
                    </div>
                  </div>
                   <div className="space-y-4 pt-4 border-t">
                     <h3 className="text-md font-semibold flex items-center gap-2">
                        <UploadCloud className="h-6 w-6" /> {t('patientRegistration.bulkReg.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('patientRegistration.bulkReg.description')}
                    </p>
                    <Button type="button" onClick={downloadCSVTemplate} variant="outline" className="w-full md:w-auto">
                      <Download className="mr-2 h-4 w-4" /> {t('patientRegistration.bulkReg.downloadTemplate')}
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="bulkPatientFile">{t('patientRegistration.bulkReg.uploadFile.label')}</Label>
                      <Input
                        id="bulkPatientFile"
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      {selectedFile && <p className="text-xs text-muted-foreground">{t('patientRegistration.bulkReg.uploadFile.selected')}: {selectedFile.name}</p>}
                    </div>
                    <Button type="button" onClick={handleFileUpload} className="w-full md:w-auto" disabled={!selectedFile || isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      {isUploading ? t('patientRegistration.bulkReg.uploading') : t('patientRegistration.bulkReg.uploadProcess')}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex-col items-start gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? t('patientRegistration.registeringButton') : t('patientRegistration.registerButton')}
                </Button>
              </CardFooter>
            </Card>
          </form>

          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-base">
                  {currentDate === null ?
                    `${t('patientRegistration.waitingList.titleBasePart')} ${hospitalName}` :
                    t('patientRegistration.waitingList.title', { currentDate: currentDate, hospitalName: hospitalName })
                  }
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('patientRegistration.waitingList.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isWaitingListLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">{t('patientRegistration.loadingWaitingList')}</p>
                  </div>
                ) : waitingList.length > 0 ? (
                  <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {waitingList.map((patient) => (
                      <li key={patient.id} className="p-3 border rounded-md shadow-sm bg-background hover:bg-muted/50 flex items-start gap-3">
                        <Image
                            src={patient.photoUrl}
                            alt={patient.name}
                            width={40}
                            height={40}
                            className="rounded-full mt-1"
                            data-ai-hint={getAvatarHint(patient.gender)}
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold">{patient.name}</p>
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full whitespace-nowrap">{patient.timeAdded}</span>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                            {t('patientRegistration.waitingList.location')}: {patient.location}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center mt-0.5">
                            <Activity className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                            {t('patientRegistration.waitingList.status')}: {patient.status}
                            </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-2" />
                    <p>{t('patientRegistration.waitingList.empty')}</p>
                  </div>
                )}
                 <Button type="button" variant="outline" className="w-full mt-6" onClick={async () => {
                    setIsWaitingListLoading(true); 
                    try {
                        // const response = await fetch('/api/v1/visits/waiting-list');
                        // if (!response.ok) throw new Error("Failed to refresh");
                        // const data = await response.json();
                        // setWaitingList(data);
                        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
                        const mockData: WaitingListItem[] = [
                            { id: Date.now(), name: "Refreshed Patient Alpha", gender: "Male", timeAdded: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}), location: "Outpatient", status: "Waiting", photoUrl: "https://placehold.co/40x40.png" },
                            ...waitingList.slice(0,2).map(p => ({...p, timeAdded: new Date(Date.now() - Math.random()*100000).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})})),
                        ].sort(() => 0.5 - Math.random());
                        setWaitingList(mockData);
                        toast({title: t('visitingPatients.toast.listRefreshed')})
                    } catch(err) {
                        toast({variant: "destructive", title: t('visitingPatients.toast.loadError'), description: t('visitingPatients.toast.refreshError.desc')})
                    } finally {
                        setIsWaitingListLoading(false);
                    }
                    }} disabled={isWaitingListLoading}>
                    {isWaitingListLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    {t('patientRegistration.waitingList.refresh')}
                 </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-5 w-5 text-primary" />
                  {t('patientRegistration.quickTips.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>{t('patientRegistration.quickTips.item1')}</p>
                <p>{t('patientRegistration.quickTips.item2')}</p>
                <p>{t('patientRegistration.quickTips.item3')}</p>
                <p>{t('patientRegistration.quickTips.item4')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}

    
