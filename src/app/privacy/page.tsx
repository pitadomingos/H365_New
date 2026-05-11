'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  AlertTriangle, 
  FileSearch, 
  History,
  Info,
  ExternalLink,
  Table,
  CheckCircle2,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PrivacyDashboard() {
  const [privacyScore] = useState(98);
  
  // Mock data for privacy audit events
  const auditLogs = [
    { id: 1, type: 'REDACTION', event: 'Patient Name scrubbed from Upstream Batch', timestamp: '2 mins ago', severity: 'low' },
    { id: 2, type: 'SECURITY', event: 'Unidentified clinical indicator blocked from DHIS2 export', timestamp: '15 mins ago', severity: 'medium' },
    { id: 3, type: 'ANONYMIZATION', event: '84 new Hashed Patient IDs (HPID) generated', timestamp: '1 hour ago', severity: 'low' },
    { id: 4, type: 'ACCESS', event: 'DHIS2 Export triggered by admin: logix_system', timestamp: '2 hours ago', severity: 'low' },
    { id: 5, type: 'WARNING', event: 'Attempted export of unmapped ICD-10 code (Z99.9)', timestamp: '5 hours ago', severity: 'medium' },
  ];

  const complianceChecks = [
    { name: 'NDPR (Nigeria Data Protection)', status: 'Compliant', score: 100 },
    { name: 'WHO Digital Health Guidelines', status: 'Compliant', score: 95 },
    { name: 'GDPR (Global Standards)', status: 'High Alignment', score: 90 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy & Governance</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Facility Admin Mode
            </Badge>
          </div>
          <p className="text-slate-500 mt-1">Audit logs for PII scrubbing, anonymization, and data egress</p>
        </div>
        
        <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
          <FileSearch className="w-4 h-4" />
          Export Compliance Report
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Privacy Health Score */}
        <Card className="col-span-1 md:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Facility Privacy Score
              <Info className="w-3 h-3 text-slate-400 cursor-help" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <span className="text-6xl font-black text-teal-600 leading-none">{privacyScore}%</span>
              <div className="pb-1">
                <p className="text-sm font-bold text-teal-700">EXCELLENT</p>
                <p className="text-xs text-slate-500">Last audit: Today, 05:42 AM</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                <span className="text-slate-500">Clinical Isolation</span>
                <span className="text-slate-900">100/100</span>
              </div>
              <Progress value={privacyScore} className="h-2 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-slate-50/50 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Redactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <EyeOff className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-3xl font-bold text-slate-900">12,402</p>
                <p className="text-[10px] text-slate-500">PII Fields redacting during sync</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Invariants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-3xl font-bold text-slate-900">Active</p>
                <p className="text-[10px] text-slate-500">Zero-Trust LAN Gateway enforced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Audit Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Real-time Privacy Audit</CardTitle>
              <CardDescription>Streaming engine alerts from the LAN Sync Gateway</CardDescription>
            </div>
            <History className="w-5 h-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="group flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-none">
                  <div className={cn(
                    "mt-1 p-2 rounded-lg",
                    log.severity === 'medium' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {log.type === 'REDACTION' && <EyeOff className="w-4 h-4" />}
                    {log.type === 'SECURITY' && <AlertTriangle className="w-4 h-4" />}
                    {log.type === 'ANONYMIZATION' && <Fingerprint className="w-4 h-4" />}
                    {(log.type === 'ACCESS' || log.type === 'WARNING') && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{log.type}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{log.event}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-slate-500 text-xs gap-2">
              View All Transaction Logs
              <ArrowRight className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Compliance Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Frameworks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {complianceChecks.map((check, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{check.name}</span>
                    <Badge className="bg-green-100 text-green-700 border-none text-[10px]">
                      {check.status}
                    </Badge>
                  </div>
                  <Progress value={check.score} className="h-1 bg-slate-100" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-teal-600 text-white border-none overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-teal-200" />
                HPID Mapping Table
              </h3>
              <p className="text-teal-100 text-xs leading-relaxed">
                The local facility master-key is used to generate irreversible Hashed Patient IDs. 
                Even if the Central SaaS is compromised, patient identities remain cryptographically 
                isolated on this LAN server.
              </p>
              <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white border-none text-xs gap-2">
                <Table className="w-3 h-3" />
                Manage Mapping Secrets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
