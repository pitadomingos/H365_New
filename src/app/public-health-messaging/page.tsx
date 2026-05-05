"use client";

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone, 
  History, 
  ShieldAlert, 
  Users2, 
  Loader2,
  RefreshCcw,
  BellRing,
  Check,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { LocalDB } from "@/lib/db";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";

interface CommunicationLog {
  id: string;
  type: 'REFERRAL' | 'ADHERENCE_CHECK' | 'REMINDER' | 'ALERT' | 'OTHER';
  patientName: string;
  recipient: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'REPLIED_YES' | 'REPLIED_NO' | 'CONFIRMED';
  timestamp: string;
}

interface AdherenceTarget {
  id: string;
  name: string;
  condition: 'HIV' | 'TB' | 'Hypertension' | 'Diabetes';
  regimen: string;
  lastCheck: string | null;
  status: 'ADHERENT' | 'NON_ADHERENT' | 'PENDING';
}

export default function PublicHealthMessagingPage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [adherencePatients, setAdherencePatients] = useState<AdherenceTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load Adherence Targets (Standard clinical programs)
      const MOCK_ADHERENCE: AdherenceTarget[] = [
        { id: "P-101", name: "Alice Mozambique", condition: "HIV", regimen: "TLD Daily (PM)", lastCheck: "2024-08-14", status: "ADHERENT" },
        { id: "P-102", name: "Bob Zambezia", condition: "TB", regimen: "RHZE Phase 1", lastCheck: "2024-08-13", status: "NON_ADHERENT" },
        { id: "P-103", name: "Charlie Tete", condition: "HIV", regimen: "TLD Daily (AM)", lastCheck: null, status: "PENDING" },
        { id: "P-104", name: "Duarte Gaza", condition: "Hypertension", regimen: "Amlodipine 5mg", lastCheck: "2024-08-12", status: "ADHERENT" },
      ];
      setAdherencePatients(MOCK_ADHERENCE);

      // 2. Load Global Logs including Referrals & Automated Checks
      const referralLogs = await LocalDB.get<any[]>("specialist_referrals", []);
      const formattedReferralLogs: CommunicationLog[] = referralLogs.map(r => ({
        id: `LOG-REF-${r.id}`,
        type: 'REFERRAL' as const,
        patientName: r.patientName,
        recipient: "+258 84 XXX XXXX",
        content: `Ref confirmed: ${r.specialty} @ ${r.facility}. Please reply YES to confirm attendance on ${new Date(r.date).toLocaleDateString()}.`,
        status: r.status === 'CONFIRMED' ? 'CONFIRMED' : 'DELIVERED',
        timestamp: r.date
      }));

      const storedLogs = await LocalDB.get<CommunicationLog[]>("global_comm_logs", []);
      
      // Auto-generate some adherence logs if empty to show functionality
      const adherenceLogs: CommunicationLog[] = [
        {
          id: "LOG-AUTO-1",
          type: "ADHERENCE_CHECK",
          patientName: "Alice Mozambique",
          recipient: "+258 84 123 4567",
          content: "Did you take your HIV medication today? Reply YES or NO.",
          status: "REPLIED_YES",
          timestamp: "2024-08-14T08:00:00Z"
        },
        {
          id: "LOG-AUTO-2",
          type: "ADHERENCE_CHECK",
          patientName: "Bob Zambezia",
          recipient: "+258 84 765 4321",
          content: "Did you take your TB medication today? Reply YES or NO.",
          status: "REPLIED_NO",
          timestamp: "2024-08-13T08:00:00Z"
        }
      ];

      setLogs([...formattedReferralLogs, ...storedLogs, ...adherenceLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAdherenceCheck = async (patient: AdherenceTarget) => {
    setIsProcessing(patient.id);
    
    try {
      const newLog: CommunicationLog = {
        id: `LOG-ADH-${Math.random().toString(36).substr(2,9)}`,
        type: 'ADHERENCE_CHECK',
        patientName: patient.name,
        recipient: "+258 84 XXX XXXX",
        content: `Hi ${patient.name}, have you taken your ${patient.condition} medication today? Please reply YES or NO.`,
        status: 'DELIVERED',
        timestamp: new Date().toISOString()
      };

      // Update local storage
      const existingLogs = await LocalDB.get<CommunicationLog[]>("global_comm_logs", []);
      await LocalDB.save("global_comm_logs", [newLog, ...existingLogs]);
      
      setLogs(prev => [newLog, ...prev]);
      
      toast({
        title: "Adherence Check Sent",
        description: `SMS sent to ${patient.name}. Waiting for system simulation of reply.`
      });

      // Simulate a reply after 5 seconds
      setTimeout(async () => {
        const replyType = Math.random() > 0.3 ? 'REPLIED_YES' : 'REPLIED_NO';
        const updatedLog = { ...newLog, status: replyType as any };
        
        const freshLogs = await LocalDB.get<CommunicationLog[]>("global_comm_logs", []);
        const replacedLogs = freshLogs.map(l => l.id === newLog.id ? updatedLog : l);
        await LocalDB.save("global_comm_logs", replacedLogs);
        
        setLogs(prev => prev.map(l => l.id === newLog.id ? updatedLog : l));
        
        toast({
          title: `Reply Received: ${patient.name}`,
          description: `Patient replied: ${replyType === 'REPLIED_YES' ? 'YES (Adherent)' : 'NO (Action Required)'}`,
          variant: replyType === 'REPLIED_YES' ? 'default' : 'destructive'
        });
      }, 5000);

    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Public Health Messaging Hub</h1>
          <p className="text-muted-foreground">Centralized communication for patient adherence and specialist coordination.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Hub
          </Button>
          <Button size="sm">
            <BellRing className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Program Snapshot</CardTitle>
            <CardDescription>Active monitoring metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">HIV Adherence Rate</p>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">84.2%</h2>
              <p className="text-[10px] text-green-600 dark:text-green-500">+1.2% from last month</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">TB Defaulter Risk</p>
              <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">12 Patients</h2>
              <p className="text-[10px] text-amber-600 dark:text-amber-500">Requires follow-up calls</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">SMS Volume (MTD)</p>
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">1,240</h2>
              <p className="text-[10px] text-blue-600 dark:text-blue-500">Budget utilization: 42%</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="adherence">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="adherence">Medication Adherence Monitoring</TabsTrigger>
              <TabsTrigger value="logs">Global Communication Log</TabsTrigger>
            </TabsList>

            <TabsContent value="adherence" className="mt-4">
              <Card className="shadow-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" /> Active Chronic Care Monitoring
                  </CardTitle>
                  <CardDescription>HIV and TB patients requiring daily adherence confirmation via SMS.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Current Regimen</TableHead>
                        <TableHead>Last Sync/Response</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adherencePatients.map((pt) => (
                        <TableRow key={pt.id}>
                          <TableCell className="font-medium">{pt.name}</TableCell>
                          <TableCell>
                            <Badge variant={pt.condition === 'HIV' ? 'default' : 'outline'}>
                              {pt.condition}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{pt.regimen}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {pt.lastCheck ? new Date(pt.lastCheck).toLocaleDateString() : 'Never checked'}
                          </TableCell>
                          <TableCell>
                            {pt.status === 'ADHERENT' && <Badge className="bg-green-500">Adherent</Badge>}
                            {pt.status === 'NON_ADHERENT' && <Badge variant="destructive">Defaulter Risk</Badge>}
                            {pt.status === 'PENDING' && <Badge variant="secondary">Pending</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={() => triggerAdherenceCheck(pt)}
                              disabled={isProcessing === pt.id}
                            >
                              {isProcessing === pt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Smartphone className="mr-2 h-3 w-3" />}
                              Trigger Check
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Global Message Audit Log
                      </CardTitle>
                      <CardDescription>Comprehensive record of all automated and manual patient communications.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search logs..." className="pl-8 w-64 h-9" />
                      </div>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Content Preview</TableHead>
                        <TableHead>Delivery Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.length > 0 ? logs.map((log) => (
                        <TableRow key={log.id} className="text-xs">
                          <TableCell className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {log.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{log.patientName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.content}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {log.status === 'DELIVERED' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                              {log.status === 'SENT' && <Clock className="h-3.5 w-3.5 text-blue-500" />}
                              {log.status === 'REPLIED_YES' && (
                                <Badge className="bg-green-600 text-white flex gap-1 h-5">
                                  <Check className="h-3 w-3" /> YES
                                </Badge>
                              )}
                              {log.status === 'REPLIED_NO' && (
                                <Badge variant="destructive" className="flex gap-1 h-5">
                                  <XCircle className="h-3 w-3" /> NO
                                </Badge>
                              )}
                              <span className="text-[10px] items-center capitalize">{log.status.toLocaleLowerCase().replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                            No communication records found. Try sending an adherence check or confirming a referral.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle>SMS Gateway Integration Note</AlertTitle>
            <AlertDescription className="text-xs">
              In a national production environment, this module connects to the Ministry of Health unified SMS gateway. 
              Costs are billed at bulk public sector rates. Patient replies (YES/NO) are parsed via short-code response listeners.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
