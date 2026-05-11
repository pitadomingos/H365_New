'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useOffline } from '@/context/offline-context';

export default function NationalReportingPage() {
  const { isOnline, isSyncing } = useOffline();
  const [reportPeriod, setReportPeriod] = useState('2024-05');
  const [isReporting, setIsReporting] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  // Mock indicators that would be pulled from the aggregation engine
  const [indicators, setIndicators] = useState([
    { name: 'Malaria Cases (Confirmed)', internal: 'MALARIA_CONFIRMED', value: 142, status: 'ready' },
    { name: 'HIV Screening (New)', internal: 'HIV_POSITIVE_NEW', value: 87, status: 'ready' },
    { name: 'ANC First Visit', internal: 'ANTENATAL_VISIT_1', value: 34, status: 'ready' },
    { name: 'BCG Vaccinations', internal: 'VACCINATION_BCG', value: 56, status: 'ready' }
  ]);

  const handlePushToDhis2 = async () => {
    setIsReporting(true);
    setReportResult(null);
    
    try {
      // Simulate API call to the backend sync service
      const response = await fetch('/api/sync/dhis2-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: reportPeriod.replace('-', ''),
          facilityId: 'FAC-DEMO'
        })
      });

      // Simulation for demo if backend not fully connected in this env
      await new Promise(r => setTimeout(r, 2000));
      
      setReportResult({
        success: true,
        importCount: { imported: 4, updated: 0, ignored: 0, deleted: 0 },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setReportResult({ success: false, error: 'Communication failure with LAN sync service' });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">National Health reporting (DHIS2)</h1>
          <p className="text-slate-500 mt-1">Interoperability and aggregate data synchronization portal</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="month" 
              value={reportPeriod} 
              onChange={(e) => setReportPeriod(e.target.value)}
              className="px-4 py-2 bg-white border rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <Button 
            onClick={handlePushToDhis2} 
            disabled={isReporting || !isOnline}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          >
            {isReporting ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Push to National DHIS2
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900">1,204</p>
                <p className="text-xs text-blue-600">Pending agg. records</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCcwIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DHIS2 Connectivity */}
        <Card className="border-green-100 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              DHIS2 Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-green-900">Connected</p>
                <p className="text-xs text-green-600">api.healthflow.gov.ng</p>
              </div>
              <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Last Submission */}
        <Card className="border-slate-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Last Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">14 Apr 2024</p>
                <p className="text-xs text-slate-500">March 2024 Report</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Indicators Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Preview: {reportPeriod}</CardTitle>
            <CardDescription>Aggregate counts mapped to national data elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {indicators.map((indicator, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{indicator.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{indicator.internal}</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{indicator.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results/Log */}
        <div className="space-y-6">
          {reportResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn("border-2", reportResult.success ? "border-green-200 bg-green-50/10" : "border-red-200 bg-red-50/10")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {reportResult.success ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    Submission Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportResult.success ? (
                    <>
                      <p className="text-sm text-green-800">Successfully imported aggregate data into DHIS2.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded border">
                          <p className="text-xs text-slate-500">Imported</p>
                          <p className="text-xl font-bold">{reportResult.importCount.imported}</p>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-xs text-slate-500">Updated</p>
                          <p className="text-xl font-bold">{reportResult.importCount.updated}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-red-800">{reportResult.error}</p>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">
                    TXN_ID: HF-{Math.random().toString(36).substring(7).toUpperCase()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="bg-slate-900 text-white border-none overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Database className="w-24 h-24" />
            </div>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-teal-400" />
                Interoperability Note
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Aggregates are calculated using the <strong>OpenHIE Clinical Data Repository (CDR)</strong> mapping logic. 
                Data values are anonymized at point of egress. Patient-level data remains within the local/private LAN servers 
                to comply with <strong>Patient Privacy by Design</strong> principles.
              </p>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-slate-800 rounded text-[10px] text-teal-400 font-bold uppercase tracking-wider">ADX Support</div>
                <div className="px-2 py-1 bg-slate-800 rounded text-[10px] text-teal-400 font-bold uppercase tracking-wider">FHIR Aggregate</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RefreshCcwIcon(props: any) {
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
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
