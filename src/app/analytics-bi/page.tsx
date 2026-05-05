"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  Target, 
  ShieldAlert, 
  Sparkles, 
  Calendar,
  Filter,
  Download,
  Share2,
  Maximize2,
  AlertCircle
} from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";

// Mock Analytics Data
const ADMISSION_TRENDS = [
  { month: "Jan", admissions: 4200, outpatient: 12400 },
  { month: "Feb", admissions: 3800, outpatient: 11800 },
  { month: "Mar", admissions: 5100, outpatient: 14200 },
  { month: "Apr", admissions: 4600, outpatient: 13100 },
  { month: "May", admissions: 5800, outpatient: 15600 },
  { month: "Jun", admissions: 6200, outpatient: 16800 },
];

const DEPT_PERFORMANCE = [
  { name: "Emergency", value: 85, color: "#ef4444" },
  { name: "Pediatrics", value: 92, color: "#3b82f6" },
  { name: "Maternity", value: 78, color: "#ec4899" },
  { name: "Surgery", value: 64, color: "#8b5cf6" },
  { name: "Radiology", value: 95, color: "#10b981" },
];

const PREDICTIVE_DATA = [
  { date: "May 04", actual: 120, forecast: 120 },
  { date: "May 05", actual: 125, forecast: 128 },
  { date: "May 06", actual: 118, forecast: 124 },
  { date: "May 07", actual: null, forecast: 135 },
  { date: "May 08", actual: null, forecast: 142 },
  { date: "May 09", actual: null, forecast: 138 },
  { date: "May 10", actual: null, forecast: 130 },
];

export default function AnalyticsBIPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const kpis = [
    { label: t('analyticsBi.stats.activeLoad'), value: "8,420", trend: "+5.2%", status: "up", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t('analyticsBi.stats.resourceUsage'), value: "92%", trend: "+2.1%", status: "up", icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    { label: t('analyticsBi.stats.avgDisposition'), value: "42 min", trend: "-8%", status: "down", icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
    { label: t('analyticsBi.stats.safetyScore'), value: "94.8", trend: "+0.4", status: "up", icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50" }
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <BrainCircuit className="h-8 w-8 text-indigo-600 shadow-sm" />
            </div>
            {t('analyticsBi.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest pl-1">
            {t('analyticsBi.overview.description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-background border-2">
            <Filter className="mr-2 h-4 w-4" /> Dimension Filter
          </Button>
          <Button size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6">
            <Share2 className="mr-2 h-4 w-4" /> Share Insight
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
               <CardContent className="p-5 flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                     <div className={cn("p-2.5 rounded-2xl", kpi.bg, kpi.color)}>
                        <kpi.icon className="h-5 w-5" />
                     </div>
                     <Badge variant="outline" className={cn(
                       "text-[9px] font-black uppercase border-none px-2",
                       kpi.status === 'up' && kpi.color.includes('red') ? "bg-red-100 text-red-600" :
                       kpi.status === 'up' ? "bg-green-100 text-green-600" : "bg-teal-100 text-teal-600"
                     )}>
                       {kpi.status === 'up' ? <TrendingUp className="h-2.5 w-2.5 mr-1" /> : <TrendingDown className="h-2.5 w-2.5 mr-1" />}
                       {kpi.trend}
                     </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none">{kpi.label}</p>
                    <p className="text-2xl font-black">{kpi.value}</p>
                  </div>
                  <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300">
                    <kpi.icon className="h-20 w-20 rotate-12" />
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trend Chart */}
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-1">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Healthcare Service Volume</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Historical trend analysis of inpatient vs outpatient load</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-[8px] font-black uppercase">Outpatient</Badge>
               <Badge variant="secondary" className="bg-indigo-600 text-white text-[8px] font-black uppercase">Inpatient</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={ADMISSION_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorInpatient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis 
                   dataKey="month" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                   dy={10}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                 />
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                 />
                 <Area type="monotone" dataKey="admissions" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorInpatient)" name="Inpatient" />
                 <Area type="monotone" dataKey="outpatient" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOutpatient)" name="Outpatient" />
               </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t py-3 justify-between">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Target Sync: 100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Data Confidence: High</span>
                </div>
             </div>
             <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase tracking-widest px-2">
               Download Dataset <Download className="ml-1.5 h-3 w-3" />
             </Button>
          </CardFooter>
        </Card>

        {/* Small Bar Chart Card */}
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600">Department Velocity</CardTitle>
             <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Functional efficiency by core unit</CardDescription>
           </CardHeader>
           <CardContent className="h-[300px] p-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={DEPT_PERFORMANCE} layout="vertical" margin={{ left: -20 }}>
                 <XAxis type="number" hide />
                 <YAxis 
                   dataKey="name" 
                   type="category" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 9, fontWeight: 800, fill: '#475569' }}
                 />
                 <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '9px' }} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {DEPT_PERFORMANCE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
           <CardFooter className="flex flex-col items-start gap-4 pt-0">
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground">
                   <span>Avg. Performance</span>
                   <span>82.8%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 w-[82.8%]" />
                </div>
              </div>
              <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest h-9 border-2 border-slate-100">
                Detailed Unit Audit
              </Button>
           </CardFooter>
        </Card>

        {/* Predictive Insights Section */}
        <Card className="lg:col-span-6 border-none shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
             <Sparkles className="h-48 w-48 text-white rotate-12" />
           </div>
           <CardHeader className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/20 text-[8px] font-black uppercase px-2">AI-POWERED INSIGHT</Badge>
                <Maximize2 className="h-4 w-4 text-white/40 cursor-pointer hover:text-white transition-colors" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                Predictive Load Forecasting
              </CardTitle>
              <CardDescription className="text-white/60 text-xs font-medium uppercase tracking-wider">Estimated patient arrivals for the coming week (HMM Model)</CardDescription>
           </CardHeader>
           <CardContent className="h-[250px] relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={PREDICTIVE_DATA}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                 <XAxis 
                   dataKey="date" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 9, fontWeight: 700, fill: 'rgba(255,255,255,0.4)' }}
                 />
                 <YAxis hide />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '9px', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="actual" 
                   stroke="#818cf8" 
                   strokeWidth={4} 
                   dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }} 
                   name="Observational Data"
                 />
                 <Line 
                   type="monotone" 
                   dataKey="forecast" 
                   stroke="#fbbf24" 
                   strokeWidth={3} 
                   strokeDasharray="5 5" 
                   dot={{ r: 3, fill: '#fbbf24' }} 
                   name="Forecaster Prediction"
                 />
               </LineChart>
             </ResponsiveContainer>
           </CardContent>
           <div className="p-4 bg-black/20 border-t border-white/5 relative z-10">
             <div className="flex items-start gap-4">
               <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
                 <AlertCircle className="h-5 w-5" />
               </div>
               <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Early Alert System</p>
                 <p className="text-xs font-medium leading-relaxed text-white/80">
                   Forecast indicates a <span className="text-amber-400 font-black">15.2% surge</span> in admissions by May 8th. Recommendation: Pre-allocate 4 additional nurses to Triage from the general ward pool.
                 </p>
               </div>
             </div>
           </div>
        </Card>

        {/* Operational Efficiency Grid (Heatmap Mock) */}
        <Card className="lg:col-span-6 border-none shadow-sm flex flex-col">
           <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Ward Capacity Heatmap</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Real-time resource saturation across national hubs</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow">
              <div className="grid grid-cols-5 gap-2">
                 {Array.from({ length: 20 }).map((_, i) => {
                   const level = Math.random() * 100;
                   return (
                     <div 
                       key={i} 
                       className={cn(
                         "aspect-square rounded-lg transition-transform hover:scale-105 cursor-help flex items-center justify-center text-[10px] font-black text-white/40",
                         level > 85 ? "bg-red-500" : level > 60 ? "bg-amber-400" : "bg-emerald-400"
                       )}
                       title={`Section ${i+1}: ${Math.floor(level)}% Capacity`}
                     >
                       {Math.floor(level)}%
                     </div>
                   );
                 })}
              </div>
           </CardContent>
           <CardFooter className="pt-2 border-t mt-auto flex justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[8px] font-black text-muted-foreground">OPTIMAL</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[8px] font-black text-muted-foreground">TENSION</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[8px] font-black text-muted-foreground">CRITICAL</span>
                 </div>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase">Update: 2s ago</p>
           </CardFooter>
        </Card>
      </div>

      {/* Action Prompt */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Activity className="h-40 w-40 text-white" />
        </div>
        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-black tracking-tight italic">Unlock Deeper System Insights</h3>
          <p className="text-indigo-100 max-w-xl text-sm leading-relaxed opacity-80">
            Current data is processed through the primary national data hub. For specialized cross-sectional studies or custom longitudinal analysis, access the raw data sandbox with your supervisor credentials.
          </p>
        </div>
        <div className="flex shrink-0 gap-3 relative z-10 w-full md:w-auto">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-[10px] font-black uppercase tracking-widest h-12 px-8 flex-1 md:flex-none">
             Access Sandbox
          </Button>
          <Button className="bg-white text-indigo-600 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest h-12 px-8 flex-1 md:flex-none shadow-lg">
             Request Deep Audit
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

    
