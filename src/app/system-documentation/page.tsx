"use client";

import React from 'react';
import Link from 'next/link';
import { getDocsList } from '@/lib/docs';
import { 
  Book, 
  FileText, 
  ChevronRight, 
  Settings, 
  ShieldCheck, 
  Network, 
  Zap,
  Globe,
  Database,
  Server
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";

export default function SystemDocumentationPage() {
  const { locale } = useLocale();
  const t = getTranslator(locale);
  const docs = getDocsList();

  const getIcon = (slug: string) => {
    if (slug.includes('security')) return <ShieldCheck className="w-5 h-5 text-red-500" />;
    if (slug.includes('interoperability')) return <Network className="w-5 h-5 text-blue-500" />;
    if (slug.includes('architecture') || slug.includes('blueprint') || slug.includes('deployment')) return <Settings className="w-5 h-5 text-slate-500" />;
    if (slug.includes('offline')) return <Zap className="w-5 h-5 text-amber-500" />;
    if (slug.includes('api')) return <Globe className="w-5 h-5 text-teal-500" />;
    if (slug.includes('installation') || slug.includes('container')) return <Server className="h-5 w-5 text-primary" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-teal-600 mb-2">
          <Book className="w-6 h-6" />
          <span className="font-bold tracking-widest uppercase text-xs">Documentation Center</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Technical Documentation</h1>
        <p className="text-slate-500 max-w-2xl text-sm">
          Comprehensive guides and architectural deep-dives for the HealthFlow Public Hospital Digital SaaS Platform.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docs.map((doc) => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`}>
            <Card className="hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group h-full border-border bg-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
                  {getIcon(doc.slug)}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-50 transition-colors" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors uppercase tracking-tight">
                  {doc.title}
                </CardTitle>
                <CardDescription className="mt-1 text-xs">
                  Technical specifications and deployment guidelines for {doc.slug.replace(/_/g, ' ')}.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="pt-8 border-t border-border">
        <h3 className="font-bold text-xl flex items-center gap-2 mb-6 text-foreground">
          <Server className="h-6 w-6 text-primary" /> Facility Installation & Containerization
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-6 rounded-2xl border border-border space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Settings className="h-4 w-4 text-primary" /> Required Infrastructure
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Docker Engine", version: "v24.0+", desc: "Isolated container execution" },
                { label: "Docker Compose", version: "v2.0+", desc: "Multi-container orchestration" },
                { label: "Node.js", version: "v20.x", desc: "Build & dependency management" },
                { label: "PostgreSQL", version: "v15+", desc: "Local persistent storage" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{item.label} <span className="text-[10px] text-muted-foreground ml-1">{item.version}</span></p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 dark:bg-black p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Database className="h-3 w-3" /> Deployment Commands
            </h4>
            <div className="space-y-4 font-mono text-[11px]">
              <div className="space-y-1">
                <p className="text-slate-500 italic"># 1. Build the production container</p>
                <p className="text-teal-400">docker build -t h365-facility-node .</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 italic"># 2. Launch the full facility stack</p>
                <p className="text-teal-400">docker-compose up -d</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-4 italic">
              Packages the Next.js standalone server for minimal footprint and maximum local stability.
            </p>
          </div>
        </div>
      </div>

      <footer className="pt-8 border-t border-border italic text-muted-foreground text-[10px] text-center uppercase tracking-widest font-medium">
        Authored by Ministry of Health Digital Transformation Office & Clinical Informatics Team
      </footer>
    </div>
  );
}