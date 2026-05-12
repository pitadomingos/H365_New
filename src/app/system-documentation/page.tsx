
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Loader2, Database, ShieldCheck, Globe } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";

export default function SystemDocumentationPage() {
  const { locale } = useLocale();
  const t = getTranslator(locale);

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" /> {t('nav.systemDocumentation')}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-500" /> Clinical Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Assistive AI logic with 100% human-in-the-loop validation for all prescriptions and diagnoses.</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" /> Interoperability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Aligned with OpenHIE standards for national data exchange and DHIS2 reporting.</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" /> Local Resilience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Edge computing nodes ensure facility-level operation during national network outages.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('sysdocs.capabilities.title')}</CardTitle>
            <CardDescription>{t('sysdocs.capabilities.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'sysdocs.item.vitals',
                'sysdocs.item.ai',
                'sysdocs.item.offline',
                'sysdocs.item.multitenant',
                'sysdocs.item.blood',
                'sysdocs.item.epidemiology',
                'sysdocs.item.imaging'
              ].map((key) => (
                <div key={key} className="p-3 border rounded-lg bg-muted/20 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium">{t(key)}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" /> {t('sysdocs.docs.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <a href="/technical-overview" className="block p-4 border rounded-xl hover:bg-muted/50 transition-colors group">
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{t('sysdocs.docs.overview')}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Platform architecture, tech stack, and design guidelines.</p>
                </a>
                <a href="/backend-schema-roadmap" className="block p-4 border rounded-xl hover:bg-muted/50 transition-colors group">
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{t('sysdocs.docs.backend')}</h4>
                  <p className="text-xs text-muted-foreground mt-1">MySQL schema, API phases, and data governance strategy.</p>
                </a>
                <a href="/architecture-options" className="block p-4 border rounded-xl hover:bg-muted/50 transition-colors group">
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{t('sysdocs.docs.deployment')}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Monolith vs Microservices and Edge Node deployment.</p>
                </a>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-primary" /> Facility Installation & Containerization
              </h3>
              <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Required Libraries & Infrastructure
                  </h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 ml-2">
                    <li><strong>Docker Engine (v24.0+):</strong> For isolated container execution.</li>
                    <li><strong>Docker Compose (v2.0+):</strong> For multi-container orchestration (App + Local DB).</li>
                    <li><strong>Node.js (v20.x):</strong> Required for initial build and local dependency management.</li>
                    <li><strong>PostgreSQL (v15+):</strong> Local persistent storage for offline resilience.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" /> Creation of the Container
                  </h4>
                  <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[10px] space-y-1 overflow-x-auto">
                    <p className="text-slate-500"># Step 1: Build the production container</p>
                    <p>docker build -t h365-facility-node .</p>
                    <p className="text-slate-500 mt-2"># Step 2: Launch the full facility stack</p>
                    <p>docker-compose up -d</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This process packages the Next.js standalone server, ensuring the facility node can run with minimal resources.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" /> {t('sysdocs.docs.title')} (Work in Progress)
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3 text-sm px-2">
                <li>Full Clinical SOPs (Standard Operating Procedures).</li>
                <li>National Data Aggregation & Epidemic Response Flow.</li>
                <li>Biomedical Equipment Integration (HL7/DICOM).</li>
                <li>Public-sector Secure Procurement & Rollout Strategy.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
      