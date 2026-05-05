"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Fingerprint, 
  Search, 
  Users, 
  Merge, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  GitBranch, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_MATCH_GROUPS = [
  { 
    id: "MG-101", 
    confidence: 94, 
    reason: "Name/DOB/NID Match", 
    records: [
      { name: "Joana Maria dos Santos", dob: "1985-04-12", nid: "542.112.XX", facility: "Hosp. Central" },
      { name: "Joana M. Santos", dob: "1985-04-12", nid: "542.112.XX", facility: "Rural Clinic B" }
    ]
  },
  { 
    id: "MG-102", 
    confidence: 82, 
    reason: "Phone/Address Match", 
    records: [
      { name: "Carlos Eduardo Silva", dob: "1972-09-30", nid: "888.112.YY", facility: "ER Unit" },
      { name: "Carlos E. Silva", dob: "1972-10-01", nid: "Unknown", facility: "Hosp. Central" }
    ]
  }
];

export default function MPIPage() {
  const { locale } = useLocale();
  const t = getTranslator(locale);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const stats = [
    { label: t('mpi.stats.entities'), value: "1.42M", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: t('mpi.stats.duplicates'), value: "482", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: t('mpi.stats.reconciled'), value: "124", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: t('mpi.stats.certainty'), value: "99.2%", icon: Fingerprint, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <Fingerprint className="h-8 w-8 text-indigo-600 shadow-sm" />
            </div>
            {t('mpi.title')}
          </h1>
          <p className="text-muted-foreground text-sm pl-1">
            {t('mpi.desc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 shadow-sm">
            <RefreshCw className="h-4 w-4" />
            Sync with National Registry
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200">
            <UserPlus className="h-4 w-4" />
            Resolve Bulk Queue
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
               <CardContent className="p-0">
                  <div className="p-6 flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <Tabs defaultValue="matches" className="w-full">
              <CardHeader className="border-b bg-slate-50/30">
                <TabsList className="bg-white border">
                  <TabsTrigger value="matches" className="gap-2">
                    <Merge className="h-4 w-4" />
                    {t('mpi.tabs.matches')}
                    <Badge variant="secondary" className="ml-1 bg-red-100 text-red-600 border-none h-4 px-1.5 min-w-[20px] justify-center">12</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unlinked" className="gap-2">
                    <GitBranch className="h-4 w-4" />
                    {t('mpi.tabs.unlinked')}
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <TabsContent value="matches" className="m-0 p-6 space-y-6">
                {MOCK_MATCH_GROUPS.map((group) => (
                  <div key={group.id} className="border rounded-2xl overflow-hidden shadow-sm hover:border-indigo-400 transition-colors">
                    <div className="bg-slate-50 border-b p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600">{group.confidence}% Confidence</Badge>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{group.reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 text-xs">{t('mpi.action.ignore')}</Button>
                        <Button size="sm" className="bg-indigo-600 text-white h-8 text-xs gap-1">
                          <Merge className="h-3 w-3" />
                          {t('mpi.action.merge')}
                        </Button>
                      </div>
                    </div>
                    <div className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50 pointer-events-none">
                            <TableHead className="text-[10px] uppercase font-bold tracking-tighter w-1/3">Patient Name</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-tighter">DOB</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-tighter">National ID</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-tighter text-right">Source Facility</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.records.map((rec, ri) => (
                            <TableRow key={ri} className="group hover:bg-slate-50/30">
                              <TableCell className="font-bold text-sm">{rec.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{rec.dob}</TableCell>
                              <TableCell className="text-xs font-mono">{rec.nid}</TableCell>
                              <TableCell className="text-right text-xs">
                                <Badge variant="secondary" className="font-normal">{rec.facility}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="unlinked" className="p-12 text-center space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-slate-100 rounded-full">
                    <ShieldCheck className="h-12 w-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold">All Facility Records Linked</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    All currently synchronized facility records carry a verified National Health Identity (NID).
                  </p>
                  <Button variant="outline" className="mt-4 shadow-sm border-slate-200">
                    Run Connectivity Check
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-lg border-2 border-indigo-100">
            <CardHeader className="bg-indigo-50/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-indigo-700">
                <Info className="h-4 w-4" /> AI Deduplication Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our probabilistic matching engine uses <strong>Jaro-Winkler</strong> string similarity and phonetic indexing to identify duplicates across disparate facility databases.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border">
                   <span className="text-xs font-semibold">Probabilistic Threshold</span>
                   <span className="text-xs font-bold text-indigo-600">85%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border">
                   <span className="text-xs font-semibold">Auto-Link Eligible</span>
                   <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MPI Nodes in Sync</h4>
                 <div className="grid grid-cols-2 gap-2">
                    {["Central MPI", "MOH Cloud", "District A", "Private Lab X"].map((n, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                         {n}
                      </div>
                    ))}
                 </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 p-4 border-t text-[10px] text-muted-foreground text-center">
              Governance: All identity merges are cryptographically signed and auditable.
            </CardFooter>
          </Card>

          <Card className="shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Historical Trends</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 pt-2">
                <div className="text-center py-6 border-2 border-dashed rounded-xl border-slate-100">
                   <p className="text-xs text-muted-foreground mb-3">Duplicate reduction over 12 months</p>
                   <div className="h-24 flex items-end justify-center gap-1.5">
                      {[20, 35, 42, 38, 45, 55, 62, 58, 65, 75, 82, 94].map((h, i) => (
                        <div key={i} title={`${h}% reduction`} className="w-2.5 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                   </div>
                </div>
                <Button variant="link" className="w-full text-xs text-indigo-600 gap-1">
                  View Full Audit Report <ExternalLink className="h-3 w-3" />
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
