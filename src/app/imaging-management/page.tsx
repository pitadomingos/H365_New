
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MonitorPlay, ClipboardList, ScanSearch, AlertTriangle as AlertTriangleIcon, CheckCircle2, PlusCircle, Users, RefreshCw, FileText, Edit3, Loader2, Wrench } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';

interface ImagingRequest {
  id: string;
  patientName: string;
  nationalId: string;
  studyRequested: string;
  orderingDoctor: string;
  requestDate: string;
  status: "Scheduled" | "Pending Scan" | "Scan Complete - Awaiting Report" | "Report Ready" | "Cancelled";
  report?: string; 
  impression?: string;
}

interface ImagingInstrument {
  id: string;
  assetNumber: string;
  name: string;
}

const MOCK_IMAGING_INSTRUMENTS: ImagingInstrument[] = [
    { id: "II001", assetNumber: "IMG-XRAY-001", name: "X-Ray Unit Philips" },
    { id: "II002", assetNumber: "IMG-MRI-001", name: "MRI Scanner Siemens 1.5T" },
    { id: "II003", assetNumber: "IMG-CT-001", name: "CT Scanner GE Revolution" },
    { id: "II004", assetNumber: "IMG-US-002", name: "Ultrasound Machine GE Voluson" },
];

const initialImagingRequests: ImagingRequest[] = [
  { id: "IMG001", patientName: "Eva Green", nationalId: "NID004", studyRequested: "Chest X-Ray (PA View)", orderingDoctor: "Dr. Smith", requestDate: "2024-07-30", status: "Scheduled" },
  { id: "IMG002", patientName: "Tom Hanks", nationalId: "NID005", studyRequested: "MRI Brain with Contrast", orderingDoctor: "Dr. Jones", requestDate: "2024-07-30", status: "Scan Complete - Awaiting Report" },
  { id: "IMG003", patientName: "Lucy Liu", nationalId: "NID006", studyRequested: "Ultrasound Abdomen", orderingDoctor: "Dr. Eve", requestDate: "2024-07-29", status: "Report Ready", report:"Liver and spleen appear normal. No focal lesions identified. Gallbladder is unremarkable.", impression: "Normal abdominal ultrasound." },
];

export default function ImagingManagementPage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [imagingRequests, setImagingRequests] = useState<ImagingRequest[]>([]);
  const [isLoadingImagingRequests, setIsLoadingImagingRequests] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState<ImagingRequest | null>(null);
  const [reportInput, setReportInput] = useState("");
  const [impressionInput, setImpressionInput] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  
  const [clientTime, setClientTime] = useState<Date | null>(null);

  const [isMalfunctionModalOpen, setIsMalfunctionModalOpen] = useState(false);
  const [malfunctionAssetNumber, setMalfunctionAssetNumber] = useState("");
  const [malfunctionInstrumentName, setMalfunctionInstrumentName] = useState("");
  const [malfunctionProblemDescription, setMalfunctionProblemDescription] = useState("");
  const [isSubmittingMalfunction, setIsSubmittingMalfunction] = useState(false);
  const [imagingInstruments, setImagingInstruments] = useState<ImagingInstrument[]>(MOCK_IMAGING_INSTRUMENTS);


  useEffect(() => {
    setClientTime(new Date());
    const timer = setInterval(() => setClientTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoadingImagingRequests(true);
    setTimeout(() => {
      setImagingRequests(initialImagingRequests);
      setIsLoadingImagingRequests(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    if (malfunctionAssetNumber) {
      const foundInstrument = imagingInstruments.find(inst => inst.assetNumber.toLowerCase() === malfunctionAssetNumber.toLowerCase());
      setMalfunctionInstrumentName(foundInstrument ? foundInstrument.name : t('imagingManagement.equipment.modal.instrumentName.notFound'));
    } else {
      setMalfunctionInstrumentName("");
    }
  }, [malfunctionAssetNumber, imagingInstruments, t]);

  const fetchImagingRequests = async () => {
    setIsRefreshingList(true);
    setIsLoadingImagingRequests(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setImagingRequests([...initialImagingRequests].sort(() => 0.5 - Math.random())); 
    toast({ title: t('imagingManagement.toast.listRefreshed'), description: t('imagingManagement.toast.listRefreshed.desc') });
    setIsLoadingImagingRequests(false);
    setIsRefreshingList(false);
  };

  const scansPerformedToday = imagingRequests.filter(r => r.status === "Report Ready" || r.status === "Scan Complete - Awaiting Report").length;
  const pendingReports = imagingRequests.filter(r => r.status === "Scan Complete - Awaiting Report").length;

  const handleUpdateStatus = async (requestId: string, newStatus: ImagingRequest["status"]) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setImagingRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
    toast({ title: t('imagingManagement.toast.statusUpdated'), description: t('imagingManagement.toast.statusUpdated.desc', {requestId: requestId, newStatus: newStatus})});
  };

  const handleOpenReportModal = (request: ImagingRequest) => {
    setSelectedRequest(request);
    setReportInput(request.report || "");
    setImpressionInput(request.impression || "");
    setIsReportModalOpen(true);
  };

  const handleSaveReport = async () => {
    if (selectedRequest) {
      setIsSavingReport(true);
      const payload = {
        requestId: selectedRequest.id,
        reportContent: reportInput,
        impression: impressionInput
      };
      console.log("Saving report (mock):", payload);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setImagingRequests(prev => prev.map(req => 
        req.id === selectedRequest.id ? { ...req, report: reportInput, impression: impressionInput, status: "Report Ready" } : req
      ));
      toast({ title: t('imagingManagement.toast.reportSaved'), description: t('imagingManagement.toast.reportSaved.desc', {patientName: selectedRequest.patientName, requestId: selectedRequest.id}) });
      setIsReportModalOpen(false);
      setSelectedRequest(null);
      setReportInput("");
      setImpressionInput("");
      setIsSavingReport(false);
    }
  };

  const handleReportImagingMalfunctionSubmit = async () => {
    if (!malfunctionAssetNumber.trim() || !malfunctionProblemDescription.trim()) {
      toast({ variant: "destructive", title: t('imagingManagement.toast.malfunction.missingInfo'), description: t('imagingManagement.toast.malfunction.missingInfo.desc') });
      return;
    }
    setIsSubmittingMalfunction(true);
    const payload = {
      assetNumber: malfunctionAssetNumber,
      instrumentName: malfunctionInstrumentName,
      problemDescription: malfunctionProblemDescription,
      reportedBy: "Current Imaging Tech (Mock)",
      reportDateTime: new Date().toISOString(),
      department: "Imaging/Radiology"
    };
    console.log("Submitting Imaging Equipment Malfunction Report (Mock):", payload);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: t('imagingManagement.toast.malfunction.reported'), description: t('imagingManagement.toast.malfunction.reported.desc', {instrumentName: (malfunctionInstrumentName || malfunctionAssetNumber)})});
    setIsMalfunctionModalOpen(false);
    setMalfunctionAssetNumber("");
    setMalfunctionInstrumentName("");
    setMalfunctionProblemDescription("");
    setIsSubmittingMalfunction(false);
  };
  
  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MonitorPlay className="h-8 w-8" /> {t('imagingManagement.pageTitle')}
          </h1>
           <div className="text-sm text-muted-foreground">
            {clientTime ? (
              `${clientTime.toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${clientTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ) : (
              t('imagingManagement.currentTime.loading')
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" /> {t('imagingManagement.requests.title')}
              </CardTitle>
              <CardDescription>{t('imagingManagement.requests.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingImagingRequests ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">{t('imagingManagement.requests.loading')}</p>
                </div>
              ) : imagingRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('imagingManagement.requests.table.patient')}</TableHead>
                      <TableHead>{t('imagingManagement.requests.table.study')}</TableHead>
                      <TableHead>{t('imagingManagement.requests.table.doctor')}</TableHead>
                      <TableHead>{t('imagingManagement.requests.table.date')}</TableHead>
                      <TableHead>{t('imagingManagement.requests.table.status')}</TableHead>
                      <TableHead className="text-right">{t('imagingManagement.requests.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imagingRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">
                          {req.patientName} <br/> 
                          <span className="text-xs text-muted-foreground">{req.nationalId}</span>
                        </TableCell>
                        <TableCell className="text-xs">{req.studyRequested}</TableCell>
                        <TableCell>{req.orderingDoctor}</TableCell>
                        <TableCell>{new Date(req.requestDate + 'T00:00:00').toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')}</TableCell>
                        <TableCell>
                          <Select 
                              value={req.status} 
                              onValueChange={(value) => handleUpdateStatus(req.id, value as ImagingRequest["status"])}
                              disabled={isSavingReport || isSubmittingMalfunction}
                          >
                              <SelectTrigger className="h-8 text-xs w-[180px]">
                                  <SelectValue placeholder={t('imagingManagement.requests.status.placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Scheduled">{t('imagingManagement.requests.status.scheduled')}</SelectItem>
                                  <SelectItem value="Pending Scan">{t('imagingManagement.requests.status.pendingScan')}</SelectItem>
                                  <SelectItem value="Scan Complete - Awaiting Report">{t('imagingManagement.requests.status.scanComplete')}</SelectItem>
                                  <SelectItem value="Report Ready">{t('imagingManagement.requests.status.reportReady')}</SelectItem>
                                  <SelectItem value="Cancelled">{t('imagingManagement.requests.status.cancelled')}</SelectItem>
                              </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleOpenReportModal(req)} disabled={isSavingReport || isSubmittingMalfunction}>
                            <Edit3 className="mr-1 h-3 w-3" /> {req.status === "Report Ready" ? t('imagingManagement.requests.actions.viewEditReport') : t('imagingManagement.requests.actions.enterReport')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-10 text-muted-foreground">{t('imagingManagement.requests.empty')}</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" onClick={fetchImagingRequests} disabled={isRefreshingList || isLoadingImagingRequests || isSubmittingMalfunction}>
                    {isRefreshingList ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                    {isRefreshingList ? t('imagingManagement.requests.refreshButton.loading') : t('imagingManagement.requests.refreshButton')}
                </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/> {t('imagingManagement.dailySummary.title')}
                </CardTitle>
                 <CardDescription>{t('imagingManagement.dailySummary.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingImagingRequests ? (
                   <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2"/> {t('imagingManagement.dailySummary.loading')}
                  </div>
                ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{t('imagingManagement.dailySummary.scansPerformed')}</span>
                      <Badge variant="secondary" className="text-base">{scansPerformedToday}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{t('imagingManagement.dailySummary.pendingReports')}</span>
                      <Badge className="text-base">{pendingReports}</Badge>
                  </div>
                  <Button className="w-full mt-2" variant="outline" disabled>{t('imagingManagement.dailySummary.viewFullButton')}</Button>
                </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanSearch className="h-6 w-6 text-primary" /> {t('imagingManagement.equipment.title')}
                </CardTitle>
                <CardDescription>{t('imagingManagement.equipment.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="default" className="border-primary/50">
                    <AlertTriangleIcon className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm">{t('imagingManagement.equipment.systemNote.title')}</AlertTitle>
                    <AlertDescription className="text-xs">
                        {t('imagingManagement.equipment.systemNote.description')}
                    </AlertDescription>
                </Alert>
                 <Dialog open={isMalfunctionModalOpen} onOpenChange={(open) => {
                        if (!open) {
                            setMalfunctionAssetNumber("");
                            setMalfunctionInstrumentName("");
                            setMalfunctionProblemDescription("");
                        }
                        setIsMalfunctionModalOpen(open);
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Wrench className="mr-2 h-4 w-4"/> {t('imagingManagement.equipment.reportButton')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t('imagingManagement.equipment.modal.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('imagingManagement.equipment.modal.description')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <Label htmlFor="imgMalfunctionAssetNumber">{t('imagingManagement.equipment.modal.assetNumber.label')} <span className="text-destructive">*</span></Label>
                                    <Input id="imgMalfunctionAssetNumber" value={malfunctionAssetNumber} onChange={(e) => setMalfunctionAssetNumber(e.target.value)} placeholder={t('imagingManagement.equipment.modal.assetNumber.placeholder')} disabled={isSubmittingMalfunction}/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="imgMalfunctionInstrumentName">{t('imagingManagement.equipment.modal.instrumentName.label')}</Label>
                                    <Input id="imgMalfunctionInstrumentName" value={malfunctionInstrumentName} readOnly disabled placeholder={t('imagingManagement.equipment.modal.instrumentName.placeholder')}/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="imgMalfunctionProblemDescription">{t('imagingManagement.equipment.modal.problem.label')} <span className="text-destructive">*</span></Label>
                                    <Textarea id="imgMalfunctionProblemDescription" value={malfunctionProblemDescription} onChange={(e) => setMalfunctionProblemDescription(e.target.value)} placeholder={t('imagingManagement.equipment.modal.problem.placeholder')} rows={3} disabled={isSubmittingMalfunction}/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingMalfunction}>{t('imagingManagement.equipment.modal.cancelButton')}</Button></DialogClose>
                                <Button onClick={handleReportImagingMalfunctionSubmit} disabled={isSubmittingMalfunction || !malfunctionAssetNumber.trim() || !malfunctionProblemDescription.trim()}>
                                    {isSubmittingMalfunction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    {isSubmittingMalfunction ? t('imagingManagement.equipment.modal.submitButton.loading') : t('imagingManagement.equipment.modal.submitButton')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('imagingManagement.reportModal.title', {patientName: selectedRequest?.patientName || ""})}</DialogTitle>
              <DialogDescription>
                {t('imagingManagement.reportModal.description', {requestId: selectedRequest?.id || "", studyRequested: selectedRequest?.studyRequested || ""})}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reportInput">{t('imagingManagement.reportModal.radiologistReport.label')}</Label>
                <Textarea
                  id="reportInput"
                  value={reportInput}
                  onChange={(e) => setReportInput(e.target.value)}
                  placeholder={t('imagingManagement.reportModal.radiologistReport.placeholder')}
                  className="min-h-[250px]"
                  disabled={isSavingReport}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="impressionInput">{t('imagingManagement.reportModal.keyFindings.label')}</Label>
                <Textarea
                  id="impressionInput"
                  value={impressionInput}
                  onChange={(e) => setImpressionInput(e.target.value)}
                  placeholder={t('imagingManagement.reportModal.keyFindings.placeholder')}
                  className="min-h-[80px]"
                  disabled={isSavingReport}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSavingReport}>{t('imagingManagement.reportModal.cancelButton')}</Button></DialogClose>
              <Button type="button" onClick={handleSaveReport} disabled={isSavingReport || !reportInput.trim()}>
                {isSavingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSavingReport ? t('imagingManagement.reportModal.saveButton.loading') : t('imagingManagement.reportModal.saveButton')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
  );
}

    
