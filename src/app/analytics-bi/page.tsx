"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import {
  BrainCircuit, TrendingUp, TrendingDown, Users, Activity,
  Clock, ShieldAlert, Sparkles, Download, Share2,
  Stethoscope, HardHat, Beaker, Truck, Flame,
  Building2, Pill, FlaskConical, CalendarCheck, UserCheck,
  HeartPulse, Globe2, BarChart3, Laptop, Tablet
} from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area, LineChart, Line, RadialBarChart, RadialBar
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'chaem' | 'h365' | 'portal';

interface AnalyticsSummary {
  h365: {
    total: number;
    genderCounts: Record<string, number>;
    provinceData: { province: string; count: number }[];
    ageBuckets: { label: string; count: number }[];
    statusCounts: Record<string, number>;
    monthlyRegistrations: { month: string; count: number }[];
    topConditions: { condition: string; count: number }[];
  };
  portal: {
    totalMeds: number;
    totalConfirmed: number;
    totalVisits: number;
    totalLabs: number;
    adherenceRate: number;
    labStatus: Record<string, number>;
    medFreqCounts: Record<string, number>;
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'chaem',  label: 'CHAEM — Saúde Ocupacional', icon: HardHat,   color: 'text-teal-600',   bg: 'bg-teal-600' },
  { id: 'h365',   label: 'H365 SaaS — Plataforma',    icon: Laptop,    color: 'text-indigo-600', bg: 'bg-indigo-600' },
  { id: 'portal', label: 'Portal do Paciente',         icon: Tablet,    color: 'text-violet-600', bg: 'bg-violet-600' },
];

const STATUS_COLORS: Record<string, string> = {
  'Apto':                '#10b981',
  'Apto com Restrições': '#f59e0b',
  'Inapto Temporário':   '#f97316',
  'Inapto':              '#ef4444',
};

const STATIC_MONTHLY_CHAEM = [
  { month: 'Jan', Admissional: 32, Periódico: 18, Demissional: 6 },
  { month: 'Fev', Admissional: 28, Periódico: 22, Demissional: 4 },
  { month: 'Mar', Admissional: 41, Periódico: 19, Demissional: 9 },
  { month: 'Abr', Admissional: 38, Periódico: 27, Demissional: 7 },
  { month: 'Mai', Admissional: 47, Periódico: 31, Demissional: 11 },
  { month: 'Jun', Admissional: 55, Periódico: 34, Demissional: 13 },
];

const PROVINCE_COLORS = [
  '#6366f1','#0d9488','#f59e0b','#ef4444','#8b5cf6','#0891b2','#f97316','#10b981'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-xs min-w-[150px]">
      <p className="font-black text-slate-700 mb-2 uppercase tracking-wide">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bi-swatch" style={{ '--seg-color': entry.color } as React.CSSProperties} />
            {entry.name}
          </span>
          <span className="font-black text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Reusable KPI Card ────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, trendUp, icon: Icon, color, bg, delay = 0 }: {
  label: string; value: string; sub: string; trend: string; trendUp: boolean;
  icon: React.ElementType; color: string; bg: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 relative">
          <div className="flex justify-between items-start">
            <div className={cn("p-2.5 rounded-2xl", bg + '/10', color)}>
              <Icon className="h-5 w-5" />
            </div>
            <Badge variant="outline" className={cn(
              "text-[9px] font-black uppercase border-none px-2",
              trendUp ? "bg-green-100 text-green-600" : "bg-rose-100 text-rose-600"
            )}>
              {trendUp ? <TrendingUp className="h-2.5 w-2.5 mr-1" /> : <TrendingDown className="h-2.5 w-2.5 mr-1" />}
              {trend}
            </Badge>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{label}</p>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[9px] text-muted-foreground/50">{sub}</p>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Icon className="h-20 w-20 rotate-12" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── TAB: CHAEM ───────────────────────────────────────────────────────────────
function ChaemTab({ chaemExams }: { chaemExams: any[] }) {
  const hasRealData = chaemExams.length > 0;
  const totalExams = chaemExams.length;
  const totApto    = chaemExams.filter(e => e.status === 'Apto').length;
  const criticalCount = chaemExams.filter(e => e.status === 'Inapto').length;
  const aptidaoRate = totalExams > 0 ? ((totApto / totalExams) * 100).toFixed(1) : '—';

  const sectorData = useMemo(() => {
    const sectors = [
      { key: 'mining',       label: '⛏️ Mineração',      color: '#f97316' },
      { key: 'healthcare',   label: '🏥 Saúde',           color: '#0d9488' },
      { key: 'construction', label: '🏗️ Construção',     color: '#2563eb' },
      { key: 'chemical',     label: '⚗️ Química',         color: '#7c3aed' },
      { key: 'logistics',    label: '🚛 Logística',       color: '#0891b2' },
      { key: 'oil_gas',      label: '🛢️ Petróleo & Gás', color: '#dc2626' },
    ];
    return sectors.map(s => {
      const sx = chaemExams.filter(e => e.sector === s.key);
      return {
        sector: s.label, color: s.color, total: sx.length,
        Apto:             sx.filter(e => e.status === 'Apto').length,
        'Apto c/ Rest.':  sx.filter(e => e.status === 'Apto com Restrições').length,
        'Inapto Temp.':   sx.filter(e => e.status === 'Inapto Temporário').length,
        Inapto:           sx.filter(e => e.status === 'Inapto').length,
      };
    }).filter(s => s.total > 0);
  }, [chaemExams]);

  const aptitudePie = useMemo(() => {
    if (!hasRealData) return [
      { name: 'Apto', value: 60, color: '#10b981' },
      { name: 'Apto c/ Restrições', value: 20, color: '#f59e0b' },
      { name: 'Inapto Temporário', value: 12, color: '#f97316' },
      { name: 'Inapto', value: 8, color: '#ef4444' },
    ];
    const counts: Record<string, number> = {};
    chaemExams.forEach(e => { counts[e.status] = (counts[e.status] || 0) + 1; });
    return Object.entries(STATUS_COLORS).map(([name, color]) => ({ name, color, value: counts[name] || 0 })).filter(s => s.value > 0);
  }, [chaemExams, hasRealData]);

  const typePie = useMemo(() => {
    if (!hasRealData) return [
      { name: 'Admissional', value: 55, color: '#3b82f6' },
      { name: 'Periódico', value: 35, color: '#0d9488' },
      { name: 'Demissional', value: 10, color: '#7c3aed' },
    ];
    const c: Record<string, number> = {};
    chaemExams.forEach(e => { c[e.examType] = (c[e.examType] || 0) + 1; });
    return [
      { name: 'Admissional', value: c['Admissional'] || 0, color: '#3b82f6' },
      { name: 'Periódico',   value: c['Periódico']   || 0, color: '#0d9488' },
      { name: 'Demissional', value: c['Demissional'] || 0, color: '#7c3aed' },
    ].filter(s => s.value > 0);
  }, [chaemExams, hasRealData]);

  const monthlyTrend = useMemo(() => {
    if (!hasRealData) return STATIC_MONTHLY_CHAEM;
    const now = new Date();
    const shortMonths = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const months: Record<string, any> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[`${d.getFullYear()}-${d.getMonth()}`] = { month: shortMonths[d.getMonth()], Admissional: 0, Periódico: 0, Demissional: 0 };
    }
    chaemExams.forEach(e => {
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key]) months[key][e.examType] = (months[key][e.examType] || 0) + 1;
    });
    return Object.values(months);
  }, [chaemExams, hasRealData]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Exames Registados" value={hasRealData ? String(totalExams) : '8,420'} sub="CHAEM L-LAN" trend="+5.2%" trendUp icon={Users} color="text-teal-600" bg="bg-teal-600" delay={0} />
        <KpiCard label="Taxa de Aptidão" value={hasRealData ? `${aptidaoRate}%` : '92%'} sub="Apto pleno s/ restrições" trend="+2.1%" trendUp icon={Activity} color="text-emerald-600" bg="bg-emerald-600" delay={0.07} />
        <KpiCard label="Tempo Médio de Exame" value="34 min" sub="Admissão → AMA emitido" trend="-8%" trendUp={false} icon={Clock} color="text-violet-600" bg="bg-violet-600" delay={0.14} />
        <KpiCard label="Alertas Inapto" value={hasRealData ? String(criticalCount) : '12'} sub="Requerem acção imediata" trend={criticalCount > 0 ? `${criticalCount} activos` : 'Nenhum'} trendUp={criticalCount > 0} icon={ShieldAlert} color="text-rose-600" bg="bg-rose-600" delay={0.21} />
      </div>

      {/* Sector + Type charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-none shadow-sm flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Exames por Sector Industrial</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">
              {hasRealData ? `${totalExams} exames reais — CHAEM L-LAN` : 'Dados de demonstração'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={sectorData.length > 0 ? sectorData : [
                { sector: '⛏️ Mineração', Apto: 18, 'Apto c/ Rest.': 5, 'Inapto Temp.': 2, Inapto: 1 },
                { sector: '🏥 Saúde', Apto: 14, 'Apto c/ Rest.': 3, 'Inapto Temp.': 1, Inapto: 0 },
                { sector: '🏗️ Construção', Apto: 11, 'Apto c/ Rest.': 4, 'Inapto Temp.': 2, Inapto: 2 },
                { sector: '⚗️ Química', Apto: 9, 'Apto c/ Rest.': 2, 'Inapto Temp.': 1, Inapto: 1 },
                { sector: '🚛 Logística', Apto: 8, 'Apto c/ Rest.': 3, 'Inapto Temp.': 1, Inapto: 0 },
              ]} margin={{ left: 0, right: 20 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <YAxis dataKey="sector" type="category" axisLine={false} tickLine={false} width={110} tick={{ fontSize: 9, fontWeight: 800, fill: '#475569' }} />
                <CartesianGrid strokeDasharray="3 3" vertical horizontal={false} stroke="#f1f5f9" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Apto" stackId="a" fill="#10b981" barSize={20} />
                <Bar dataKey="Apto c/ Rest." stackId="a" fill="#f59e0b" barSize={20} />
                <Bar dataKey="Inapto Temp." stackId="a" fill="#f97316" barSize={20} />
                <Bar dataKey="Inapto" stackId="a" fill="#ef4444" radius={[0,4,4,0]} barSize={20} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: '800', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-teal-600">Aptidão Global</CardTitle>
            <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Distribuição por decisão médica</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center gap-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={aptitudePie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {aptitudePie.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={hasRealData ? 0.92 : 0.3} />)}
                </Pie>
                <Tooltip formatter={(v: any, name: string) => [`${v}${hasRealData ? ' exam.' : '%'}`, name]} contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 px-2">
              {aptitudePie.map(d => {
                const total = aptitudePie.reduce((a, b) => a + b.value, 0) || 1;
                return (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm shrink-0 bi-swatch" style={{ '--seg-color': d.color } as React.CSSProperties} />
                    <span className="text-[9px] font-bold text-slate-600 flex-1 truncate">{d.name}</span>
                    <span className="text-[9px] font-black text-slate-800">{((d.value / total) * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly area trend */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-widest">Tendência Mensal — Últimos 6 Meses</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">
            {hasRealData ? 'Dados reais CHAEM' : 'Projecção histórica de referência'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 8, right: 20, left: -20, bottom: 0 }}>
              <defs>
                {[['gA','#3b82f6'],['gP','#0d9488'],['gD','#7c3aed']].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Admissional" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gA)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="Periódico"   stroke="#0d9488" strokeWidth={2.5} fill="url(#gP)" dot={{ r: 3, fill: '#0d9488', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="Demissional" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gD)" dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: '800', paddingTop: '8px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentinel Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-700 via-teal-700 to-indigo-900 rounded-3xl p-7 text-white flex flex-col md:flex-row items-start justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Sparkles className="h-40 w-40 text-white rotate-12" /></div>
        <div className="space-y-2 relative z-10 flex-1">
          <Badge className="bg-white/15 text-white border-white/20 text-[8px] font-black uppercase px-2">ALERTA SENTINELA CHAEM → H365</Badge>
          <h3 className="text-xl font-black tracking-tight">
            {hasRealData && criticalCount > 0 ? `${criticalCount} caso${criticalCount !== 1 ? 's' : ''} de Inapto detectado${criticalCount !== 1 ? 's' : ''}` : 'Vigilância Epidemiológica Ocupacional Activa'}
          </h3>
          <p className="text-teal-100 text-sm leading-relaxed opacity-85 max-w-xl">
            Casos críticos detectados pelo CHAEM são automaticamente escalados para a Vigilância Epidemiológica do H365 nos níveis DDS e DPS.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-[10px] font-black uppercase h-11 px-5 flex-1 md:flex-none">Registos CHAEM</Button>
          <Button className="bg-white text-teal-700 hover:bg-teal-50 text-[10px] font-black uppercase h-11 px-5 flex-1 md:flex-none shadow-lg">Relatório MISAU</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── TAB: H365 SaaS ───────────────────────────────────────────────────────────
function H365Tab({ data }: { data: AnalyticsSummary['h365'] | null }) {
  const total = data?.total ?? 0;
  const genderPie = data ? [
    { name: 'Masculino', value: data.genderCounts['Male']   || 0, color: '#3b82f6' },
    { name: 'Feminino',  value: data.genderCounts['Female'] || 0, color: '#ec4899' },
    { name: 'Outro',     value: data.genderCounts['Other']  || 0, color: '#94a3b8' },
  ].filter(s => s.value > 0) : [];

  const statusPie = data ? Object.entries(data.statusCounts).map(([name, value], i) => ({
    name, value, color: ['#10b981','#f59e0b','#3b82f6','#94a3b8','#ef4444'][i % 5]
  })) : [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pacientes Registados" value={total > 0 ? total.toLocaleString() : '—'} sub="Base de dados H365" trend="+12.4%" trendUp icon={Users} color="text-indigo-600" bg="bg-indigo-600" delay={0} />
        <KpiCard label="Condições Crónicas" value={data?.topConditions?.[0]?.condition ?? '—'} sub={`${data?.topConditions?.[0]?.count ?? '—'} casos mais frequentes`} trend="Hipertensão #1" trendUp={false} icon={HeartPulse} color="text-rose-600" bg="bg-rose-600" delay={0.07} />
        <KpiCard label="Províncias Cobertas" value={String(data?.provinceData?.length ?? '—')} sub="Cobertura geográfica nacional" trend="+2 novas" trendUp icon={Globe2} color="text-teal-600" bg="bg-teal-600" delay={0.14} />
        <KpiCard label="Pacientes Activos" value={data ? String(data.statusCounts['Active'] || data.statusCounts['Registered'] || total) : '—'} sub="Em acompanhamento activo" trend="+3.8%" trendUp icon={UserCheck} color="text-emerald-600" bg="bg-emerald-600" delay={0.21} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Province horizontal bar */}
        <Card className="lg:col-span-8 border-none shadow-sm flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Pacientes por Província</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Distribuição geográfica nacional — H365 SaaS</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical"
                data={data?.provinceData?.length ? data.provinceData : [
                  { province: 'Maputo Cidade', count: 48 },
                  { province: 'Maputo Prov.', count: 32 },
                  { province: 'Sofala', count: 21 },
                  { province: 'Nampula', count: 18 },
                  { province: 'Zambézia', count: 15 },
                  { province: 'Gaza', count: 12 },
                  { province: 'Inhambane', count: 9 },
                  { province: 'Tete', count: 7 },
                ]}
                margin={{ left: 0, right: 20 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <YAxis dataKey="province" type="category" axisLine={false} tickLine={false} width={105} tick={{ fontSize: 9, fontWeight: 800, fill: '#475569' }} />
                <CartesianGrid strokeDasharray="3 3" vertical horizontal={false} stroke="#f1f5f9" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" name="Pacientes" radius={[0,6,6,0]} barSize={20}>
                  {(data?.provinceData?.length ? data.provinceData : Array(8).fill(null)).map((_: any, i: number) => (
                    <Cell key={i} fill={PROVINCE_COLORS[i % PROVINCE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender + Status pies */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600">Género</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4 pb-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={genderPie.length ? genderPie : [
                    { name: 'Masculino', value: 54, color: '#3b82f6' },
                    { name: 'Feminino', value: 46, color: '#ec4899' },
                  ]} cx="50%" cy="50%" innerRadius={30} outerRadius={48} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {(genderPie.length ? genderPie : [{color:'#3b82f6'},{color:'#ec4899'}]).map((e: any, i: number) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {(genderPie.length ? genderPie : [
                  { name: 'Masculino', value: 54, color: '#3b82f6' },
                  { name: 'Feminino', value: 46, color: '#ec4899' },
                ]).map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bi-swatch shrink-0" style={{ '--seg-color': d.color } as React.CSSProperties} />
                    <span className="text-[9px] font-bold text-slate-600 flex-1">{d.name}</span>
                    <span className="text-[9px] font-black text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600">Estado dos Pacientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {(statusPie.length ? statusPie : [
                { name: 'Registered', value: 62, color: '#10b981' },
                { name: 'Active', value: 28, color: '#3b82f6' },
                { name: 'Inactive', value: 10, color: '#94a3b8' },
              ]).map(d => {
                const t = statusPie.length ? statusPie.reduce((a, b) => a + b.value, 1) : 100;
                const pct = Math.round((d.value / t) * 100);
                return (
                  <div key={d.name}>
                    <div className="flex justify-between text-[9px] font-bold mb-0.5">
                      <span className="text-slate-600">{d.name}</span>
                      <span className="text-slate-800">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full chaem-bar" style={{ '--bar-w': `${pct}%`, '--seg-color': d.color } as React.CSSProperties}
                        // The bg color comes from the segment color via a data attribute
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Age distribution + Chronic conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Distribuição Etária</CardTitle>
            <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Pirâmide de idades dos pacientes registados</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ageBuckets?.length ? data.ageBuckets : [
                { label: '0–17', count: 12 },
                { label: '18–34', count: 31 },
                { label: '35–49', count: 28 },
                { label: '50–64', count: 19 },
                { label: '65+', count: 10 },
              ]} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" name="Pacientes" radius={[6,6,0,0]} barSize={36}>
                  {[0,1,2,3,4].map(i => <Cell key={i} fill={PROVINCE_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Top 5 Condições Crónicas</CardTitle>
            <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Comorbilidades mais prevalentes na base H365</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {(data?.topConditions?.length ? data.topConditions : [
              { condition: 'Hipertensão', count: 38 },
              { condition: 'Diabetes Tipo 2', count: 24 },
              { condition: 'Asma', count: 16 },
              { condition: 'VIH/SIDA', count: 11 },
              { condition: 'Tuberculose', count: 8 },
            ]).map((c, i) => {
              const max = (data?.topConditions?.[0]?.count ?? 38) || 38;
              const pct = Math.round((c.count / max) * 100);
              return (
                <div key={c.condition} className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold text-slate-400 w-4 text-center shrink-0">#{i+1}</span>
                  <span className="text-[10px] font-bold text-slate-700 w-32 shrink-0 truncate">{c.condition}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full chaem-bar" style={{ '--bar-w': `${pct}%`, background: PROVINCE_COLORS[i] } as React.CSSProperties} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 w-6 text-right shrink-0">{c.count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Monthly registrations trend */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-widest">Tendência de Registos Mensais</CardTitle>
          <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Últimas consultas/visitas registadas na plataforma H365</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyRegistrations?.length ? data.monthlyRegistrations : [
              { month: 'Jan', count: 24 }, { month: 'Fev', count: 31 }, { month: 'Mar', count: 28 },
              { month: 'Abr', count: 38 }, { month: 'Mai', count: 42 }, { month: 'Jun', count: 47 },
            ]} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Registos" stroke="#6366f1" strokeWidth={2.5} fill="url(#gReg)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB: Patient Portal ──────────────────────────────────────────────────────
function PortalTab({ data }: { data: AnalyticsSummary['portal'] | null }) {
  const adherenceRate = data?.adherenceRate ?? 0;
  const totalMeds = data?.totalMeds ?? 0;
  const totalConfirmed = data?.totalConfirmed ?? 0;
  const totalVisits = data?.totalVisits ?? 0;
  const totalLabs = data?.totalLabs ?? 0;

  const labPie = data ? Object.entries(data.labStatus).map(([name, value], i) => ({
    name, value, color: ['#10b981','#f59e0b','#ef4444','#94a3b8'][i % 4]
  })) : [];

  const medFreqData = data ? Object.entries(data.medFreqCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.split('(')[0].trim(), count }))
    : [];

  const adherenceData = [
    { subject: 'Taxa de Adesão', value: adherenceRate || 72, fill: '#10b981' },
    { subject: 'Pendente', value: 100 - (adherenceRate || 72), fill: '#f1f5f9' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Medicamentos Activos" value={totalMeds > 0 ? String(totalMeds) : '—'} sub="Total prescrições na plataforma" trend="+4.2%" trendUp icon={Pill} color="text-violet-600" bg="bg-violet-600" delay={0} />
        <KpiCard label="Taxa de Adesão" value={totalMeds > 0 ? `${adherenceRate}%` : '72%'} sub="Confirmações de toma registadas" trend="+1.8%" trendUp icon={CalendarCheck} color="text-emerald-600" bg="bg-emerald-600" delay={0.07} />
        <KpiCard label="Visitas Registadas" value={totalVisits > 0 ? String(totalVisits) : '—'} sub="Consultas e episódios" trend="+6.3%" trendUp icon={Stethoscope} color="text-teal-600" bg="bg-teal-600" delay={0.14} />
        <KpiCard label="Resultados de Lab." value={totalLabs > 0 ? String(totalLabs) : '—'} sub="Análises e exames laboratoriais" trend="+2.1%" trendUp icon={FlaskConical} color="text-indigo-600" bg="bg-indigo-600" delay={0.21} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Medication Adherence Gauge */}
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col items-center">
          <CardHeader className="pb-2 w-full">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-violet-600">Adesão à Medicação</CardTitle>
            <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Confirmações registadas no Portal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 gap-4 pb-4 w-full">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270} data={[{ value: adherenceRate || 72, fill: '#8b5cf6' }]}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{adherenceRate || 72}%</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Adesão</span>
              </div>
            </div>
            <div className="w-full space-y-2 px-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">Confirmadas</span>
                <span className="text-emerald-600 font-black">{totalConfirmed || '—'}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">Total prescrições</span>
                <span className="text-slate-800 font-black">{totalMeds || '—'}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">Taxa de adesão</span>
                <span className="text-violet-600 font-black">{adherenceRate || 72}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Results Status + Med Frequency */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Estado dos Resultados de Laboratório</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Distribuição por classificação clínica</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6 pb-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={labPie.length ? labPie : [
                    { name: 'Normal', value: 58, color: '#10b981' },
                    { name: 'Elevated', value: 28, color: '#f59e0b' },
                    { name: 'Critical', value: 14, color: '#ef4444' },
                  ]} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {(labPie.length ? labPie : [{color:'#10b981'},{color:'#f59e0b'},{color:'#ef4444'}]).map((e: any, i: number) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, name: string) => [`${v} result.`, name]} contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {(labPie.length ? labPie : [
                  { name: 'Normal', value: 58, color: '#10b981' },
                  { name: 'Elevated', value: 28, color: '#f59e0b' },
                  { name: 'Critical', value: 14, color: '#ef4444' },
                ]).map(d => {
                  const entries = (labPie.length ? labPie : [{ name: 'Normal', value: 58, color: '#10b981' }, { name: 'Elevated', value: 28, color: '#f59e0b' }, { name: 'Critical', value: 14, color: '#ef4444' }]);
                  const t = entries.reduce((a: number, b: { value: number }) => a + b.value, 0) || 1;
                  const pct = Math.round((d.value / t) * 100);
                  return (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0 bi-swatch" style={{ '--seg-color': d.color } as React.CSSProperties} />
                      <span className="text-[10px] font-bold text-slate-600 flex-1">{d.name}</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full chaem-bar" style={{ '--bar-w': `${pct}%`, background: d.color } as React.CSSProperties} />
                      </div>
                      <span className="text-[10px] font-black text-slate-800 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Frequência de Medicação</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Padrões de posologia mais prescritos</CardDescription>
            </CardHeader>
            <CardContent className="h-[160px] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medFreqData.length ? medFreqData : [
                  { name: 'Uma vez/dia', count: 42 },
                  { name: 'Duas vezes/dia', count: 31 },
                  { name: 'Três vezes/dia', count: 18 },
                  { name: 'Semanal', count: 12 },
                  { name: 'Conforme nec.', count: 8 },
                ]} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" name="Medicamentos" radius={[4,4,0,0]} barSize={28} fill="#8b5cf6" fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portal usage banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-900 rounded-3xl p-7 text-white flex flex-col md:flex-row items-start justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Tablet className="h-40 w-40 text-white rotate-12" /></div>
        <div className="space-y-2 relative z-10 flex-1">
          <Badge className="bg-white/15 text-white border-white/20 text-[8px] font-black uppercase px-2">PORTAL DO PACIENTE H365</Badge>
          <h3 className="text-xl font-black tracking-tight">Gestão da Saúde na Palma da Mão</h3>
          <p className="text-violet-100 text-sm leading-relaxed opacity-85 max-w-xl">
            O Portal permite que os pacientes consultem resultados, confirmem a toma de medicação, e acedam ao seu historial clínico completo — integrado em tempo real com o H365 SaaS.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-[10px] font-black uppercase h-11 px-5 flex-1 md:flex-none">Ver Pacientes</Button>
          <Button className="bg-white text-violet-700 hover:bg-violet-50 text-[10px] font-black uppercase h-11 px-5 flex-1 md:flex-none shadow-lg">Relatório Portal</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsBIPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [activeTab, setActiveTab] = useState<TabId>('chaem');
  const [isMounted, setIsMounted] = useState(false);
  const [chaemExams, setChaemExams] = useState<any[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    // Fetch CHAEM exams from the shared API hub (survives server restarts, works cross-device)
    const fetchChaemExams = () =>
      fetch('/api/chaem/exams')
        .then(r => r.ok ? r.json() : { exams: [] })
        .then(d => setChaemExams(d.exams || []))
        .catch(() => {
          // Offline fallback: read from localStorage
          try {
            const stored = localStorage.getItem('h365_occupational_exams');
            if (stored) setChaemExams(JSON.parse(stored));
          } catch { /* ignore */ }
        });

    fetchChaemExams();

    // Also listen for storage changes from same-origin CHAEM app tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'h365_occupational_exams') fetchChaemExams();
    };
    window.addEventListener('storage', onStorage);

    // Fetch H365 + Portal analytics from API
    fetch('/api/analytics/summary')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSummary(d); })
      .catch(() => {})
      .finally(() => setLoadingData(false));

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <BrainCircuit className="h-8 w-8 text-indigo-600" />
            </div>
            {t('analyticsBi.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest pl-1">
            CHAEM · H365 SaaS · Portal do Paciente · MISAU Moçambique
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-background border-2">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6">
            <Share2 className="mr-2 h-4 w-4" /> Partilhar
          </Button>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 rounded-2xl w-fit">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200",
                active
                  ? `${tab.bg} text-white shadow-lg shadow-current/20 scale-[1.02]`
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
              )}>
              <tab.icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split('—')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'chaem'  && <ChaemTab  chaemExams={chaemExams} />}
        {activeTab === 'h365'   && <H365Tab   data={summary?.h365   ?? null} />}
        {activeTab === 'portal' && <PortalTab data={summary?.portal ?? null} />}
      </motion.div>

    </div>
  );
}
