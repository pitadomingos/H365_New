
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";

export default function SystemDocumentationPage() {
  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" /> System Documentation
          </h1>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>H365 System Manuals & Guides</CardTitle>
            <CardDescription>Comprehensive documentation for national and local deployments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Realized Capabilities
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="p-3 border rounded-lg bg-muted/20">
                  <h4 className="font-medium text-sm">Deployment Guide</h4>
                  <p className="text-xs text-muted-foreground mt-1">Detailed steps for Cloud and Local LAN node setup using Docker.</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <h4 className="font-medium text-sm">Offline Operations</h4>
                  <p className="text-xs text-muted-foreground mt-1">How PWA and LocalDB handle patient registration during blackouts.</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <h4 className="font-medium text-sm">Sync & Reconciliation</h4>
                  <p className="text-xs text-muted-foreground mt-1">Managing the sync queue and data integrity between facility and cloud.</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <h4 className="font-medium text-sm">User Role Guide</h4>
                  <p className="text-xs text-muted-foreground mt-1">Workflows for Receptionists, Doctors, and Lab Technicians.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" /> Planned Documentation
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 text-sm">
                <li>Full Clinical SOPs (Standard Operating Procedures).</li>
                <li>National Data Aggregation & Epidemic Response Flow.</li>
                <li>Biomedical Equipment Integration (HL7/DICOM).</li>
                <li>API Reference for Public-Private Interoperability.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
      