
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Bell, CalendarCheck2, PlusCircle, Video, Loader2, Users2, CheckCircle2, XCircle, Smartphone, Send, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LocalDB } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useLocale } from '@/context/locale-context';
import { getTranslator, type Locale } from '@/lib/i18n';
import { ptBR } from 'date-fns/locale'; 

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  date: string; 
}

interface NotificationItem {
  id: string | number;
  message: string;
  time: string;
  read: boolean;
}

interface Doctor {
    id: string;
    name: string;
}

const initialMockDoctors: Doctor[] = [
    { id: "dr-smith", name: "Dr. Smith" },
    { id: "dr-jones", name: "Dr. Jones" },
    { id: "dr-eve", name: "Dr. Eve" },
];

export default function AppointmentsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = React.useState(true);
  
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(true);

  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = React.useState(true);

  const [referrals, setReferrals] = React.useState<any[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = React.useState(true);
  const [isConfirmingReferral, setIsConfirmingReferral] = React.useState(false);
  const [selectedReferral, setSelectedReferral] = React.useState<any | null>(null);
  
  const [confirmationDate, setConfirmationDate] = React.useState("");
  const [confirmationTime, setConfirmationTime] = React.useState("");
  const [smsSentTo, setSmsSentTo] = React.useState<string | null>(null);

  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = React.useState(false);
  const [newPatientName, setNewPatientName] = React.useState("");
  const [newSelectedDoctorId, setNewSelectedDoctorId] = React.useState("");
  const [newAppointmentDate, setNewAppointmentDate] = React.useState("");
  const [newAppointmentTime, setNewAppointmentTime] = React.useState(""); 
  const [newAppointmentType, setNewAppointmentType] = React.useState("Consultation");
  const [isScheduling, setIsScheduling] = React.useState(false);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoadingAppointments(true);
      const currentT = getTranslator(currentLocale);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fetchedAppointments: Appointment[] = [
          { id: "APT001", patientName: "Alice Wonderland", doctorName: "Dr. Smith", date: "2024-08-15", time: "10:00 AM - 10:30 AM", type: "Consultation", status: "Confirmed" },
          { id: "APT002", patientName: "Bob The Builder", doctorName: "Dr. Jones", date: "2024-08-15", time: "11:00 AM - 11:45 AM", type: "Check-up", status: "Pending" },
        ];
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({ variant: "destructive", title: currentT('appointments.toast.loadError'), description: currentT('appointments.toast.loadAppointmentsError')});
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, [currentLocale]); 

  React.useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      const currentT = getTranslator(currentLocale); 
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const fetchedNotifications: NotificationItem[] = [
          { id: 1, message: currentT('appointments.notifications.mock.message1'), time: "2 hours ago", read: false },
        ];
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({ variant: "destructive", title: currentT('appointments.toast.loadError'), description: currentT('appointments.toast.loadNotificationsError')});
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, [currentLocale]); 

  React.useEffect(() => {
    const fetchDoctors = async () => {
        setIsLoadingDoctors(true);
        const currentT = getTranslator(currentLocale);
        try {
            await new Promise(resolve => setTimeout(resolve, 600)); 
            setDoctors(initialMockDoctors);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast({ variant: "destructive", title: currentT('appointments.toast.loadError'), description: currentT('appointments.toast.loadDoctorsError') });
        } finally {
            setIsLoadingDoctors(false);
        }
    };
    fetchDoctors();
  }, [currentLocale]); 

  React.useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoadingReferrals(true);
      try {
        const data = await LocalDB.get<any[]>("specialist_referrals", []);
        setReferrals(data);
      } catch (error) {
        console.error("Error fetching referrals:", error);
      } finally {
        setIsLoadingReferrals(false);
      }
    };
    fetchReferrals();
  }, []);

  const handleConfirmReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral || !confirmationDate || !confirmationTime) return;
    
    setIsConfirmingReferral(true);
    
    try {
      const updatedReferral = {
        ...selectedReferral,
        status: "CONFIRMED",
        confirmedDate: confirmationDate,
        confirmedTime: confirmationTime,
      };

      const existingReferrals = await LocalDB.get<any[]>("specialist_referrals", []);
      const newReferrals = existingReferrals.map(r => r.id === selectedReferral.id ? updatedReferral : r);
      await LocalDB.save("specialist_referrals", newReferrals);
      setReferrals(newReferrals);

      const newApt: Appointment = {
        id: `APT-REF-${selectedReferral.id}`,
        patientName: selectedReferral.patientName,
        doctorName: `Specialist at ${selectedReferral.facility}`,
        date: confirmationDate,
        time: confirmationTime,
        type: `Specialist (${selectedReferral.specialty})`,
        status: "Confirmed"
      };
      setAppointments(prev => [newApt, ...prev]);

      setSmsSentTo(selectedReferral.patientName);
      
      toast({
        title: "Referral Confirmed",
        description: `SMS sent to ${selectedReferral.patientName}. Details: ${selectedReferral.specialty} at ${selectedReferral.facility} on ${confirmationDate} at ${confirmationTime}.`
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      setSmsSentTo(null);
      setSelectedReferral(null);

    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsConfirmingReferral(false);
    }
  };

  const handleScheduleNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newSelectedDoctorId || !newAppointmentDate || !newAppointmentTime) {
      toast({
        variant: "destructive",
        title: t('appointments.toast.missingInfo'),
        description: t('appointments.toast.missingInfo.desc'),
      });
      return;
    }
    setIsScheduling(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const doctor = doctors.find(d => d.id === newSelectedDoctorId);
        const appointmentDateObj = new Date(newAppointmentDate + 'T' + newAppointmentTime);
        const endTime = new Date(appointmentDateObj.getTime() + 30 * 60000); 
        const formattedTime = `${newAppointmentTime} - ${endTime.toLocaleTimeString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', {hour: '2-digit', minute:'2-digit'})}`;
        
        const newApt: Appointment = {
            id: `APT${Date.now()}`,
            patientName: newPatientName,
            doctorName: doctor ? doctor.name : "Unknown Doctor",
            date: newAppointmentDate,
            time: formattedTime,
            type: newAppointmentType,
            status: "Pending"
        };

        setAppointments(prev => [newApt, ...prev].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
        toast({
          title: t('appointments.toast.scheduled'),
          description: t('appointments.toast.scheduled.desc', {patientName: newPatientName, doctorName: newApt.doctorName, date: newAppointmentDate, time: newAppointmentTime }),
        });
        
        setNewPatientName("");
        setNewSelectedDoctorId("");
        setNewAppointmentDate("");
        setNewAppointmentTime("");
        setNewAppointmentType("Consultation");
        setIsSchedulingDialogOpen(false);

    } catch (error: any) {
        console.error("Error scheduling appointment:", error);
        toast({ variant: "destructive", title: t('appointments.toast.scheduleError'), description: error.message || t('appointments.toast.scheduleError.desc') });
    } finally {
        setIsScheduling(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    selectedCalendarDate ? apt.date === selectedCalendarDate.toISOString().split('T')[0] : true
  );

  const selectedDateDisplayString = selectedCalendarDate 
    ? selectedCalendarDate.toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
    : t('appointments.allDates');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="h-8 w-8" /> {t('appointments.pageTitle')}
          </h1>
          <Dialog open={isSchedulingDialogOpen} onOpenChange={setIsSchedulingDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLoadingDoctors}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('appointments.scheduleNewButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleScheduleNewAppointment}>
                <DialogHeader>
                  <DialogTitle>{t('appointments.scheduleModal.title')}</DialogTitle>
                  <DialogDescription>
                    {t('appointments.scheduleModal.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">{t('appointments.scheduleModal.patientName.label')} <span className="text-destructive">*</span></Label>
                    <Input id="patientName" placeholder={t('appointments.scheduleModal.patientName.placeholder')} value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} required disabled={isScheduling}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">{t('appointments.scheduleModal.doctor.label')} <span className="text-destructive">*</span></Label>
                    <Select value={newSelectedDoctorId} onValueChange={setNewSelectedDoctorId} required disabled={isScheduling || isLoadingDoctors}>
                      <SelectTrigger id="doctorName">
                        <SelectValue placeholder={isLoadingDoctors ? t('appointments.scheduleModal.doctor.loading') : t('appointments.scheduleModal.doctor.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDoctors ? <SelectItem value="loading" disabled>{t('appointments.scheduleModal.doctor.loading')}</SelectItem> : 
                          doctors.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="appointmentDate">{t('appointments.scheduleModal.date.label')} <span className="text-destructive">*</span></Label>
                        <Input id="appointmentDate" type="date" value={newAppointmentDate} onChange={(e) => setNewAppointmentDate(e.target.value)} required disabled={isScheduling}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointmentTime">{t('appointments.scheduleModal.time.label')} <span className="text-destructive">*</span></Label>
                        <Input id="appointmentTime" type="time" value={newAppointmentTime} onChange={(e) => setNewAppointmentTime(e.target.value)} required disabled={isScheduling}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentType">{t('appointments.scheduleModal.type.label')}</Label>
                    <Select value={newAppointmentType} onValueChange={setNewAppointmentType} disabled={isScheduling}>
                      <SelectTrigger id="appointmentType">
                        <SelectValue placeholder={t('appointments.scheduleModal.type.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultation">{t('appointments.scheduleModal.type.consultation')}</SelectItem>
                        <SelectItem value="Check-up">{t('appointments.scheduleModal.type.checkup')}</SelectItem>
                        <SelectItem value="Follow-up">{t('appointments.scheduleModal.type.followup')}</SelectItem>
                        <SelectItem value="Telemedicine">{t('appointments.scheduleModal.type.telemedicine')}</SelectItem>
                        <SelectItem value="Procedure">{t('appointments.scheduleModal.type.procedure')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline" disabled={isScheduling}>{t('appointments.scheduleModal.cancelButton')}</Button></DialogClose>
                  <Button type="submit" disabled={isScheduling || isLoadingDoctors || !newSelectedDoctorId}>
                    {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isScheduling ? t('appointments.scheduleModal.submitButton.loading') : t('appointments.scheduleModal.submitButton')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="shadow-sm border-blue-200 bg-blue-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
              <Users2 className="h-6 w-6" /> Specialist Referrals Pending Confirmation
            </CardTitle>
            <CardDescription>Referrals sent from General Consultation awaiting specialist approval.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReferrals ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : referrals.filter(r => r.status === "PENDING_CONFIRMATION").length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Target Specialty</TableHead>
                    <TableHead>Target Facility</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.filter(r => r.status === "PENDING_CONFIRMATION").map((ref) => (
                    <TableRow key={ref.id} className="bg-white/40">
                      <TableCell className="font-bold">{ref.patientName}</TableCell>
                      <TableCell><Badge variant="outline">{ref.specialty}</Badge></TableCell>
                      <TableCell>{ref.facility}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(ref.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedReferral(ref)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Schedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <form onSubmit={handleConfirmReferral}>
                                <DialogHeader>
                                  <DialogTitle>Confirm Referral: {ref.patientName}</DialogTitle>
                                  <DialogDescription>
                                    Setting the consultation date and time will trigger an automatic SMS to the patient.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Appointment Date</Label>
                                      <Input type="date" required value={confirmationDate} onChange={e => setConfirmationDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Appointment Time</Label>
                                      <Input type="time" required value={confirmationTime} onChange={e => setConfirmationTime(e.target.value)} />
                                    </div>
                                  </div>
                                  <Alert className="bg-green-50 border-green-200">
                                    <Smartphone className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800 font-semibold">SMS Payload Preview</AlertTitle>
                                    <AlertDescription className="text-green-700 text-xs">
                                      Hi {ref.patientName}, your referral to {ref.specialty} at {ref.facility} is confirmed for {confirmationDate || '---'} at {confirmationTime || '---'}. Please reply YES to confirm or NO to reschedule.
                                    </AlertDescription>
                                  </Alert>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                  <Button type="submit" disabled={isConfirmingReferral || !confirmationDate || !confirmationTime}>
                                    {isConfirmingReferral ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Confirm & Send SMS
                                  </Button>
                                </DialogFooter>
                              </form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground italic border border-dashed rounded-lg">
                No pending specialist referrals at this time.
              </div>
            )}
          </CardContent>
        </Card>

        {smsSentTo && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
            <Card className="shadow-2xl border-green-500 bg-black text-white w-80">
              <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xs font-mono flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> SMS SENT
                  </CardTitle>
                  <Badge className="bg-green-500 text-black text-[8px] h-4">DELIVERED</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-3 bg-white/10 rounded-lg text-[11px] leading-snug">
                  Hi {smsSentTo}, your referral to {selectedReferral?.specialty} at {selectedReferral?.facility} is confirmed for {confirmationDate} at {confirmationTime}. Please reply YES to confirm or NO to reschedule.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>{t('appointments.upcoming.title')}</CardTitle>
              <CardDescription>{t('appointments.upcoming.description', {selectedDateString: selectedDateDisplayString})}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">{t('appointments.loadingAppointments')}</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('appointments.upcoming.table.patient')}</TableHead>
                      <TableHead>{t('appointments.upcoming.table.doctor')}</TableHead>
                      <TableHead>{t('appointments.upcoming.table.time')}</TableHead>
                      <TableHead>{t('appointments.upcoming.table.type')}</TableHead>
                      <TableHead className="text-right">{t('appointments.upcoming.table.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.patientName}</TableCell>
                        <TableCell>{apt.doctorName}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {apt.type === "Telemedicine" && <Video className="h-4 w-4 text-primary" />}
                           {apt.type}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={
                            apt.status === "Confirmed" ? "default" :
                            apt.status === "Pending" ? "secondary" :
                            apt.status === "Cancelled" ? "destructive" :
                            "outline"
                          }>
                            {t(`appointments.status.${apt.status.toLowerCase()}` as any, apt.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-10">
                    {t('appointments.upcoming.empty', {selectedDateString: selectedCalendarDate ? selectedCalendarDate.toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric' }) : t('appointments.thisDay')})}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>{t('appointments.calendar.title')}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={setSelectedCalendarDate}
                  className="rounded-md border"
                  disabled={isLoadingAppointments}
                  locale={currentLocale === 'pt' ? ptBR : undefined} 
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary" /> {t('appointments.notifications.title')}
                </CardTitle>
                <CardDescription>{t('appointments.notifications.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingNotifications ? (
                   <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground text-sm">{t('appointments.loadingNotifications')}</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <ul className="space-y-3">
                    {notifications.map((notif) => (
                      <li key={notif.id} className={`p-3 border rounded-md ${notif.read ? 'bg-muted/30' : 'bg-accent/20 dark:bg-accent/10 border-accent/50'}`}>
                        <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'font-medium'}`}>{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('appointments.notifications.empty')}</p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => toast({ title: "Notifications", description: "All notifications have been marked as read." })}
                >
                  {t('appointments.notifications.viewAllButton')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
