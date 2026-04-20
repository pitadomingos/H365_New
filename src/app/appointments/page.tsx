
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Bell, CalendarCheck2, PlusCircle, Video, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      const currentT = getTranslator(currentLocale); // Get t for this effect scope
      try {
        // console.log("Fetching appointments with /api/v1/appointments...");
        // const response = await fetch('/api/v1/appointments'); 
        // if (!response.ok) throw new Error(currentT('appointments.toast.loadAppointmentsError'));
        // const data = await response.json();
        // setAppointments(data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
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
        // console.log("Fetching notifications from /api/v1/notifications?context=appointments...");
        // const response = await fetch('/api/v1/notifications?context=appointments');
        // if (!response.ok) throw new Error(currentT('appointments.toast.loadNotificationsError'));
        // const data = await response.json();
        // setNotifications(data);
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
        const currentT = getTranslator(currentLocale); // Get t for this effect scope
        try {
            // console.log("Fetching doctors from /api/v1/doctors...");
            // const response = await fetch('/api/v1/doctors');
            // if (!response.ok) throw new Error(currentT('appointments.toast.loadDoctorsError'));
            // const data = await response.json();
            // setDoctors(data);
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

    const payload = {
        patientName: newPatientName,
        doctorId: newSelectedDoctorId,
        date: newAppointmentDate, 
        time: newAppointmentTime, 
        type: newAppointmentType,
    };

    try {
        // console.log("Scheduling new appointment with payload (to /api/v1/appointments):", payload);
        // const response = await fetch('/api/v1/appointments', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload),
        // });
        // if (!response.ok) {
        //     const errorData = await response.json().catch(() => ({ error: "Failed to schedule. API error."}));
        //     throw new Error(errorData.error || `API error: ${response.statusText}`);
        // }
        // const newApt: Appointment = await response.json();
        
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
                           {t(`appointments.scheduleModal.type.${apt.type.toLowerCase().replace('-', '')}` as any, apt.type)}
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
                <Button variant="outline" className="w-full mt-4" disabled>{t('appointments.notifications.viewAllButton')}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
    

      