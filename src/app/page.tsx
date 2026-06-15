
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, CalendarCheck, BedDouble, Siren, Briefcase, Microscope, Baby, TrendingUp, TrendingDown, HeartPulse, Pill as PillIcon, PieChart as PieChartIcon, BarChart3, Loader2, FileClock, Stethoscope, RefreshCw, ShieldCheck, AlertTriangle, Smartphone, LineChart as LineChartIcon } from "lucide-react";
import Link from "next/link";
import { useLocale } from '@/context/locale-context';
import { useUser } from '@/context/user-context';
import { getTranslator, type Locale, defaultLocale } from '@/lib/i18n';
import { PieChart, Pie, Cell, Legend as RechartsLegend, Tooltip as RechartsTooltip, ResponsiveContainer, Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { MOCK_RECENT_ACTIVITY, MOCK_DRAFTS } from '@/lib/mock-data';
import { DashboardModuleBtn, DashboardActivityItem } from '@/components/dashboard-components';
import { getAIQueue, syncQueue, type AIQueueItem } from '@/lib/clinical-ai-queue';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface SummaryCardData {
  id: string;
  titleKey: string;
  value: string | string[];
  valueSuffixKey?: string;
  iconName: "TrendingUp" | "CalendarCheck" | "BedDouble" | "Siren" | "Users" | "HeartPulse" | "PillIcon" | "FileClock" | "Stethoscope";
  color: string;
  descriptionKey: string;
  link?: string;
}

interface QuickActionData {
  labelKey: string;
  href: string;
  iconName: "Users" | "CalendarCheck" | "Briefcase" | "BedDouble" | "Microscope" | "Baby";
}

interface RecentActivityItem {
  user: string;
  action: string;
  time: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

interface DailyAttendanceItem {
    day: string;
    patients: number;
    fill?: string;
}

interface DraftedConsultationItem {
  id: string;
  patientName: string;
  specialtyOrReason: string;
  lastSavedTime: string;
}

const ICONS_MAP: { [key: string]: React.ElementType } = {
  TrendingUp, CalendarCheck, BedDouble, Siren, Users, HeartPulse, PillIcon, Briefcase, Microscope, Baby, FileClock, Stethoscope
};


export default function DashboardPage() {
  const { currentLocale } = useLocale();
  const { user } = useUser();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  // Helper functions for dynamic content translation
  const translateDisease = React.useCallback((name: string) => {
    const key = 'disease.' + name.toLowerCase();
    const trans = t(key);
    return trans === key ? name : trans;
  }, [t]);

  const translateFacility = React.useCallback((name: string) => {
    const camel = name.replace(/\s+/g, '').replace(/^[A-Z]/, c => c.toLowerCase());
    const key = 'facility.' + camel;
    const trans = t(key);
    return trans === key ? name : trans;
  }, [t]);

  const translateCampaign = React.useCallback((name: string) => {
    const camel = name.replace(/\s+/g, '').replace(/^[A-Z]/, c => c.toLowerCase());
    const key = 'campaign.' + camel;
    const trans = t(key);
    return trans === key ? name : trans;
  }, [t]);

  const translateRegion = React.useCallback((name: string) => {
    const camel = name.replace(/\s+/g, '').replace(/^[A-Z]/, c => c.toLowerCase());
    const key = 'region.' + camel;
    const trans = t(key);
    return trans === key ? name : trans;
  }, [t]);

  const translateAction = React.useCallback((name: string) => {
    const camel = name.replace(/\s+/g, '').replace(/^[A-Z]/, c => c.toLowerCase());
    const key = 'action.' + camel;
    const trans = t(key);
    return trans === key ? name : trans;
  }, [t]);

  const translateItem = React.useCallback((name: string) => {
    const camel = name.replace(/\s+/g, '').replace(/^[A-Z]/, c => c.toLowerCase());
    const key = 'item.' + camel;
    const trans = t(key);
    return trans === key ? name : trans;
  }, [t]);

  const [summaryCardsData, setSummaryCardsData] = useState<SummaryCardData[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [quickActionsData, setQuickActionsData] = useState<QuickActionData[]>([]);
  const [isLoadingQuickActions, setIsLoadingQuickActions] = useState(true);

  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const [patientEntryPointsData, setPatientEntryPointsData] = useState<ChartDataItem[]>([]);
  const [isLoadingEntryPoints, setIsLoadingEntryPoints] = useState(true);

  const [dailyAttendanceData, setDailyAttendanceData] = useState<DailyAttendanceItem[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  const [draftedConsultations, setDraftedConsultations] = useState<DraftedConsultationItem[]>([]);
  const [isLoadingDraftedConsultations, setIsLoadingDraftedConsultations] = useState(true);

  const [facilityPerformance, setFacilityPerformance] = useState<any[]>([]);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);

  type Period = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year';
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Week');
  const PERIODS: Period[] = ['Day', 'Week', 'Month', 'Quarter', 'Year'];

  const PERIOD_ATTENDANCE: Record<Period, DailyAttendanceItem[]> = {
    Day:     [{ day: '00:00', patients: 12 },{ day: '04:00', patients: 8 },{ day: '08:00', patients: 38 },{ day: '12:00', patients: 55 },{ day: '16:00', patients: 42 },{ day: '20:00', patients: 22 }].map(d=>({...d, fill:'hsl(var(--chart-4))'})),
    Week:    [{ day: 'Mon', patients: 120 },{ day: 'Tue', patients: 155 },{ day: 'Wed', patients: 130 },{ day: 'Thu', patients: 160 },{ day: 'Fri', patients: 140 },{ day: 'Sat', patients: 90 },{ day: 'Sun', patients: 75 }].map(d=>({...d, fill:'hsl(var(--chart-4))'})),
    Month:   ['W1','W2','W3','W4'].map((w,i)=>({ day: w, patients: [820,910,780,1050][i], fill:'hsl(var(--chart-4))' })),
    Quarter: ['Jan','Feb','Mar','Apr','May','Jun'].map((m,i)=>({ day: m, patients: [3200,2900,3800,4100,3600,4500][i], fill:'hsl(var(--chart-4))' })),
    Year:    ['2021','2022','2023','2024','2025','2026'].map((y,i)=>({ day: y, patients: [38000,41000,39500,44200,48000,52000][i], fill:'hsl(var(--chart-4))' })),
  };

  const PERIOD_PREV: Record<Period, number> = { Day: 176, Week: 870, Month: 3510, Quarter: 21700, Year: 48000 };
  const PERIOD_CURR: Record<Period, number> = { Day: 177, Week: 870, Month: 3560, Quarter: 22100, Year: 52000 };

  const periodDelta = useMemo(() => {
    const prev = PERIOD_PREV[selectedPeriod];
    const curr = PERIOD_CURR[selectedPeriod];
    const pct = prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : '0.0';
    return { pct, up: curr >= prev };
  }, [selectedPeriod]);

  const trendData = useMemo(() => [
    { label: 'Jan', thisYear: 3200, lastYear: 2800 },
    { label: 'Feb', thisYear: 2900, lastYear: 2600 },
    { label: 'Mar', thisYear: 3800, lastYear: 3200 },
    { label: 'Apr', thisYear: 4100, lastYear: 3500 },
    { label: 'May', thisYear: 3600, lastYear: 3100 },
    { label: 'Jun', thisYear: 4500, lastYear: 3800 },
    { label: 'Jul', thisYear: 4800, lastYear: 4100 },
    { label: 'Aug', thisYear: 4200, lastYear: 3700 },
    { label: 'Sep', thisYear: 5100, lastYear: 4400 },
    { label: 'Oct', thisYear: 4700, lastYear: 4000 },
    { label: 'Nov', thisYear: 5300, lastYear: 4600 },
    { label: 'Dec', thisYear: 5800, lastYear: 4900 },
  ], []);

  const isManagementView = user?.role !== 'FACILITY_ADMIN';


  useEffect(() => {
    setIsLoadingSummary(true);
    setTimeout(() => {
      let fetchedSummary: SummaryCardData[] = [];
      
      const role = user?.role || 'NATIONAL_ADMIN';

      if (role === 'NATIONAL_ADMIN' || role === 'PROVINCIAL_ADMIN' || role === 'DISTRICT_ADMIN') {
        // Management KPIs (Decision Support)
        fetchedSummary = [
          { id: "sc1", titleKey: "dashboard.management.avgLoad", value: "842", iconName: "Users", color: "text-blue-500", descriptionKey: "dashboard.card.totalPatients.description", link: "#" },
          { id: "sc2", titleKey: "dashboard.management.bedOccupancy", value: "72%", iconName: "BedDouble", color: "text-indigo-500", descriptionKey: "dashboard.management.bedOccupancyDesc", link: "#" },
          { id: "sc3", titleKey: "dashboard.management.resourceIndex", value: "88/100", iconName: "TrendingUp", color: "text-green-500", descriptionKey: "dashboard.management.resourceIndexDesc", link: "#" },
          { id: "sc4", titleKey: "dashboard.management.alerts", value: "3", valueSuffixKey: "common.active", iconName: "Siren", color: "text-red-500", descriptionKey: "dashboard.management.alertsDesc", link: "/epidemic-control" },
        ];
      } else {
        // Facility Operational KPIs (Immediate Ops)
        fetchedSummary = [
          { id: "sc1", titleKey: "dashboard.facility.queue", value: "42", iconName: "Users", color: "text-orange-500", descriptionKey: "dashboard.facility.queueDesc", link: "/patient-registration" },
          { id: "sc2", titleKey: "dashboard.facility.beds", value: "8", valueSuffixKey: "common.free", iconName: "BedDouble", color: "text-green-500", descriptionKey: "dashboard.facility.bedsDesc", link: "/ward-management" },
          { id: "sc3", titleKey: "dashboard.card.appointments.title", value: "12", iconName: "CalendarCheck", color: "text-sky-500", descriptionKey: "dashboard.card.appointments.description", link: "/appointments" },
          { id: "sc4", titleKey: "dashboard.facility.supplies", value: "2", valueSuffixKey: "common.status.low", iconName: "PillIcon", color: "text-red-500", descriptionKey: "dashboard.facility.suppliesDesc", link: "/drug-dispensing" },
        ];
      }

      setSummaryCardsData(fetchedSummary);
      setIsLoadingSummary(false);
    }, 1000);
  }, [user]);

  useEffect(() => {
    if (isManagementView) {
      setIsLoadingPerformance(true);
      // Directly using imported mock data if needed, but let's assume it's available in context or similar
      const { MOCK_FACILITY_PERFORMANCE } = require('@/lib/mock-data');
      setTimeout(() => {
        setFacilityPerformance(MOCK_FACILITY_PERFORMANCE);
        setIsLoadingPerformance(false);
      }, 1300);
    }
  }, [isManagementView]);

  useEffect(() => {
    setIsLoadingQuickActions(true);
    setTimeout(() => {
        const fetchedQuickActions: QuickActionData[] = [
            { labelKey: "dashboard.quickActions.registerPatient", href: "/patient-registration", iconName: "Users" },
            { labelKey: "dashboard.quickActions.scheduleAppointment", href: "/appointments", iconName: "CalendarCheck" },
            { labelKey: "dashboard.quickActions.getAiRecommendation", href: "/treatment-recommendation", iconName: "Briefcase" },
            { labelKey: "dashboard.quickActions.manageWards", href: "/ward-management", iconName: "BedDouble" },
            { labelKey: "dashboard.quickActions.labDashboard", href: "/laboratory-management", iconName: "Microscope" },
            { labelKey: "dashboard.quickActions.maternityRecords", href: "/maternity-care", iconName: "Baby" },
        ];
        setQuickActionsData(fetchedQuickActions);
        setIsLoadingQuickActions(false);
    }, 800);
  }, []); // Runs once on mount

  useEffect(() => {
    setIsLoadingActivity(true);
    setTimeout(() => {
        setRecentActivity(MOCK_RECENT_ACTIVITY);
        setIsLoadingActivity(false);
    }, 1200);
  }, []); // Runs once on mount

  useEffect(() => {
    setIsLoadingEntryPoints(true);
    const localT = getTranslator(currentLocale); // Get t specifically for this effect if needed for data
    setTimeout(() => {
        const fetchedEntryPoints: ChartDataItem[] = [
            { name: localT('dashboard.charts.entryPoints.outpatient'), value: 400, fill: "hsl(var(--chart-1))" },
            { name: localT('dashboard.charts.entryPoints.emergency'), value: 150, fill: "hsl(var(--chart-2))" },
            { name: localT('dashboard.charts.entryPoints.epidemic'), value: 25, fill: "hsl(var(--chart-3))" },
        ];
        setPatientEntryPointsData(fetchedEntryPoints);
        setIsLoadingEntryPoints(false);
    }, 1500);
  }, [currentLocale]); // Runs on mount and when currentLocale changes

  useEffect(() => {
    setIsLoadingAttendance(true);
    setTimeout(() => {
      setDailyAttendanceData(PERIOD_ATTENDANCE[selectedPeriod]);
      setIsLoadingAttendance(false);
    }, 400);
  }, [selectedPeriod]);

  useEffect(() => {
    setIsLoadingDraftedConsultations(true);
    setTimeout(() => {
      setDraftedConsultations(MOCK_DRAFTS.map(d => ({
        id: d.id,
        patientName: d.patientName,
        specialtyOrReason: d.specialtyOrReason,
        lastSavedTime: d.lastSavedTime
      })));
      setIsLoadingDraftedConsultations(false);
    }, 1400);
  }, []); // Runs once on mount

  const chartConfig = useMemo(() => ({
    outpatient: { label: t('dashboard.charts.entryPoints.outpatient'), color: "hsl(var(--chart-1))" },
    emergency: { label: t('dashboard.charts.entryPoints.emergency'), color: "hsl(var(--chart-2))" },
    epidemic: { label: t('dashboard.charts.entryPoints.epidemic'), color: "hsl(var(--chart-3))" },
    patients: { label: t('dashboard.charts.dailyAttendance.patients'), color: "hsl(var(--chart-4))" },
  }), [t]) satisfies ChartConfig;


  const displayPerformanceData = useMemo(() => facilityPerformance.map(item => ({ ...item, name: translateFacility(item.name) })), [facilityPerformance, translateFacility]);

  const displayAttendanceData = useMemo(() => dailyAttendanceData.map(item => {
    const isDayOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(item.day);
    const isMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].includes(item.day);
    let translatedDay = item.day;
    if (isDayOfWeek) {
      translatedDay = t('day.' + item.day);
    } else if (isMonth) {
      translatedDay = t('month.' + item.day);
    }
    return { ...item, day: translatedDay };
  }), [dailyAttendanceData, t]);

  const displayTrendData = useMemo(() => trendData.map(item => ({ ...item, label: t('month.' + item.label) })), [trendData, t]);

  return (
      <div className="flex flex-col gap-6">
        {/* Header with period selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('dashboard.welcomeMessage')} {user?.role === 'NATIONAL_ADMIN' ? `(${t('dashboard.public.level.national')})` : user?.jurisdiction.facility || user?.jurisdiction.district || user?.jurisdiction.province || ''}
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'NATIONAL_ADMIN' && t('dashboard.desc.national')}
              {user?.role === 'PROVINCIAL_ADMIN' && t('dashboard.desc.provincial', { province: user.jurisdiction.province || '' })}
              {user?.role === 'DISTRICT_ADMIN' && t('dashboard.desc.district', { district: user.jurisdiction.district || '' })}
              {user?.role === 'FACILITY_ADMIN' && t('dashboard.desc.facility', { facility: user.jurisdiction.facility || '' })}
              {!user && t('dashboard.tagline')}
            </p>
          </div>
          {/* Period Filter Pill */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1 self-start sm:self-auto">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPeriod === p
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >{t('period.' + p.toLowerCase())}</button>
            ))}
          </div>
        </div>

        {isLoadingSummary ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({length: 4}).map((_, index) => (
                    <Card key={`skl-sum-${index}`} className="shadow-sm">
                        <CardHeader className="pb-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></CardHeader>
                        <CardContent><div className="h-5 w-3/4 bg-muted rounded animate-pulse"/><div className="h-3 w-1/2 bg-muted rounded mt-1 animate-pulse"/></CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summaryCardsData.map((item, idx) => {
                const Icon = ICONS_MAP[item.iconName];
                const isTranslated = item.titleKey.includes('.');
                // Show delta badge on first card only
                const showDelta = idx === 0;

                return (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{isTranslated ? t(item.titleKey) : item.titleKey}</CardTitle>
                    {Icon && <Icon className={`h-5 w-5 ${item.color}`} />}
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-bold">
                        {Array.isArray(item.value) ? item.value.join(', ') : item.value}
                        {item.valueSuffixKey && ` ${t(item.valueSuffixKey)}`}
                      </div>
                      {showDelta && (
                        <span className={`flex items-center text-xs font-semibold mb-0.5 ${
                          periodDelta.up ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {periodDelta.up ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                          {periodDelta.pct}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">{isTranslated ? t(item.descriptionKey) : item.descriptionKey}</p>
                    {item.link && item.link !== "#" && (
                    <Button variant="link" asChild className="px-0 pt-2 h-auto text-sm">
                        <Link href={item.link}>{t('dashboard.card.viewDetails')}</Link>
                    </Button>
                    )}
                </CardContent>
                </Card>
            )})}
            </div>
        )}


        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity (Management & Ops) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('dashboard.recentActivity.title')}</CardTitle>
              <CardDescription>{t('dashboard.recentActivity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-3">
                    {Array.from({length: 5}).map((_,index) => (
                        <div key={`skl-act-${index}`} className="flex items-start text-sm">
                            <Activity className="h-4 w-4 mr-3 mt-1 shrink-0 text-muted-foreground" />
                            <div>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1"/>
                                <div className="h-3 w-40 bg-muted rounded animate-pulse"/>
                                <div className="h-2 w-12 bg-muted rounded animate-pulse mt-1"/>
                            </div>
                        </div>
                    ))}
                </div>
              ) : (
                <ul className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <DashboardActivityItem key={`${index}-${activity.user}`} activity={activity} />
                    ))}
                </ul>
              )}
               <Button variant="outline" className="mt-4 w-full" disabled={isLoadingActivity} asChild>
                  <Link href="/system-activity-log">{t('dashboard.recentActivity.viewAll')}</Link>
                </Button>
            </CardContent>
          </Card>

          {/* Quick Actions (Facility Only) or Higher-Level Overview */}
          {user?.role === 'FACILITY_ADMIN' ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
                <CardDescription>{t('dashboard.quickActions.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isLoadingQuickActions ? (
                  Array.from({length: 6}).map((_, index) => (
                      <div key={`skl-qa-${index}`} className="h-14 bg-muted rounded-lg animate-pulse" />
                  ))
                ) : (
                  quickActionsData.map((action) => {
                      const Icon = ICONS_MAP[action.iconName];
                      return(
                        <DashboardModuleBtn
                          key={action.href}
                          href={action.href}
                          title={t(action.labelKey)}
                          icon={Icon}
                          isActive={action.href === "/treatment-recommendation"}
                          t={t}
                        />
                  )})
                )}
              </CardContent>
            </Card>
          ) : (
            /* Management Action Center */
            <Card className="shadow-sm border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> {t('dashboard.management.decisionCenter')}
                </CardTitle>
                <CardDescription>{t('dashboard.management.decisionCenterDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs">
                       <TrendingUp className="h-5 w-5" /> {t('dashboard.management.action.analyzeTrends')}
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs">
                       <Users className="h-5 w-5" /> {t('dashboard.management.action.reallocateStaff')}
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs">
                       <Microscope className="h-5 w-5" /> {t('dashboard.management.action.labStats')}
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs" asChild>
                       <Link href="/epidemic-control">
                          <Siren className="h-5 w-5" /> {t('dashboard.management.action.manageOutbreaks')}
                       </Link>
                    </Button>
                 </div>
                 <div className="p-3 bg-white rounded-lg border border-primary/10">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">{t('dashboard.management.briefingTitle')}</p>
                    <p className="text-xs italic leading-snug">
                      &quot;{t('dashboard.management.briefingText')}&quot;
                    </p>
                 </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Management Strategic Overview (District+) */}
        {isManagementView && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {/* Recurring Infections */}
             <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-orange-500" /> {t('dashboard.management.recurringInfections')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {require('@/lib/mock-data').MOCK_RECURRING_INFECTIONS.map((inf: any) => (
                      <li key={inf.name} className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold">{translateDisease(inf.name)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {inf.facilities.map((fac: string) => translateFacility(fac)).join(', ')}
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold">{inf.cases} {t('common.cases')}</p>
                            <Badge variant="outline" className={`text-[9px] h-4 px-1 ${inf.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                               {t('common.status.' + inf.trend).toUpperCase()}
                            </Badge>
                         </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
             </Card>

             {/* Active Campaigns */}
             <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" /> {t('dashboard.management.healthCampaigns')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {require('@/lib/mock-data').MOCK_CAMPAIGNS.map((camp: any) => (
                     <div key={camp.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                           <span className="font-bold">{translateCampaign(camp.name)}</span>
                           <span className="text-muted-foreground">{camp.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary" {...{ style: { width: `${camp.progress}%` } }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {t('dashboard.management.campaignReach', { reach: camp.reach })}
                        </p>
                     </div>
                   ))}
                </CardContent>
             </Card>

             {/* Epidemic Alerts & Facility Stocks */}
             <div className="space-y-6">
                <Card className="shadow-sm border-red-100 bg-red-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" /> {t('dashboard.management.epidemicSurveillance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {require('@/lib/mock-data').MOCK_EPIDEMIC_ALERTS.map((alert: any) => (
                        <li key={alert.id} className="p-2 bg-white rounded border border-red-100">
                           <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-bold text-red-700">{translateDisease(alert.disease)}</p>
                              <Badge className="bg-red-600 text-[9px] h-4">{t('common.status.' + alert.risk.toLowerCase())}</Badge>
                           </div>
                           <p className="text-[10px] text-slate-600">
                             {translateRegion(alert.location)} • {translateAction(alert.action)}
                           </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-orange-100 bg-orange-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                      <PillIcon className="h-4 w-4" /> {t('dashboard.management.criticalStockAlerts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {require('@/lib/mock-data').MOCK_FACILITY_STOCKS.filter((s:any) => s.status === 'Critical').map((stock: any) => (
                        <div key={stock.facility} className="text-[10px]">
                           <p className="font-bold text-slate-800">{translateFacility(stock.facility)}</p>
                           <p className="text-orange-700 truncate">
                             {t('dashboard.management.criticalStockNeeds', { items: stock.lowItems.map((item: string) => translateItem(item)).join(', ') })}
                           </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {isManagementView ? (
              /* Management View: Facility Comparison Chart */
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" /> {t('dashboard.charts.facilityComparison.title')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.charts.facilityComparison.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoadingPerformance ? (
                    <div className="flex items-center justify-center h-full">
                       <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={displayPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis fontSize={10} />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="patients" name={t('dashboard.charts.labels.patientCount')} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="occupancy" name={t('dashboard.charts.labels.occupancyPct')} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Ops View: Entry Points */
              <Card className="shadow-sm">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <PieChartIcon className="h-6 w-6 text-primary" /> {t('dashboard.charts.entryPoints.title')}
                      </CardTitle>
                      <CardDescription>{t('dashboard.charts.entryPoints.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                      {isLoadingEntryPoints ? (
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      ) : (
                          <ChartContainer config={chartConfig} className="w-full max-w-md aspect-square">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart accessibilityLayer>
                                  <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                                  <Pie
                                      data={patientEntryPointsData}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={80}
                                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  >
                                      {patientEntryPointsData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                  </Pie>
                                  <RechartsLegend content={({ payload }) => {
                                      return (
                                      <div className="flex items-center justify-center gap-3 mt-4">
                                          {payload?.map((entry: any, index: number) => (
                                          <div key={`item-${entry.value}-${index}`} className="flex items-center space-x-1">
                                              <span className="h-2 w-2 rounded-full" {...{ style: { backgroundColor: entry.color } }} />
                                              <span className="text-xs text-muted-foreground">{entry.payload.name}</span>
                                          </div>
                                          ))}
                                      </div>
                                      )
                                  }} />
                                  </PieChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                      )}
                  </CardContent>
              </Card>
            )}
             <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" /> {t('dashboard.charts.dailyAttendance.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('dashboard.charts.dailyAttendance.subtitle', { period: t('period.' + selectedPeriod.toLowerCase()), total: PERIOD_CURR[selectedPeriod].toLocaleString() })}
                    </CardDescription>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    periodDelta.up ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {periodDelta.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {t('dashboard.charts.dailyAttendance.deltaDesc', { pct: periodDelta.pct })}
                  </span>
                </CardHeader>
                <CardContent className="h-[300px]">
                     {isLoadingAttendance ? (
                        <div className="flex items-center justify-center h-full">
                           <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={displayAttendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                    <Bar dataKey="patients" name={t('dashboard.charts.dailyAttendance.patients')} radius={[4, 4, 0, 0]}>
                                      {displayAttendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill || "hsl(var(--chart-4))"} />
                                      ))}
                                    </Bar>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Year-over-Year Trend Chart */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-6 w-6 text-primary" /> {t('dashboard.charts.patientVolumeTrend.title')}
              </CardTitle>
              <CardDescription>{t('dashboard.charts.patientVolumeTrend.desc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ChartContainer config={{ thisYear: { label: t('dashboard.charts.labels.thisYear'), color: 'hsl(var(--chart-1))' }, lastYear: { label: t('dashboard.charts.labels.lastYear'), color: 'hsl(var(--chart-2))' } }} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradThisYear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradLastYear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <RechartsLegend content={({ payload }) => (
                    <div className="flex items-center justify-center gap-4 mt-2">
                      {payload?.map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="h-2 w-4 rounded-sm" {...{ style: { backgroundColor: e.color } }} />
                          <span className="text-xs text-muted-foreground">{e.value === 'thisYear' ? t('dashboard.charts.labels.thisYear') : t('dashboard.charts.labels.lastYear')}</span>
                        </div>
                      ))}
                    </div>
                  )} />
                  <Area type="monotone" dataKey="lastYear" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#gradLastYear)" dot={false} />
                  <Area type="monotone" dataKey="thisYear" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gradThisYear)" dot={{ r: 3, fill: 'hsl(var(--chart-1))' }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
  );
}

    
