
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, CalendarCheck, BedDouble, Siren, Briefcase, Microscope, Baby, TrendingUp, HeartPulse, Pill as PillIcon, PieChart as PieChartIcon, BarChart3, Loader2, FileClock, Stethoscope, RefreshCw, ShieldCheck, AlertTriangle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useLocale } from '@/context/locale-context';
import { useUser } from '@/context/user-context';
import { getTranslator, type Locale, defaultLocale } from '@/lib/i18n';
import { PieChart, Pie, Cell, Legend as RechartsLegend, Tooltip as RechartsTooltip, ResponsiveContainer, Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
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

  const isManagementView = user?.role !== 'FACILITY_ADMIN';


  useEffect(() => {
    setIsLoadingSummary(true);
    setTimeout(() => {
      let fetchedSummary: SummaryCardData[] = [];
      
      const role = user?.role || 'NATIONAL_ADMIN';

      if (role === 'NATIONAL_ADMIN' || role === 'PROVINCIAL_ADMIN' || role === 'DISTRICT_ADMIN') {
        // Management KPIs (Decision Support)
        fetchedSummary = [
          { id: "sc1", titleKey: "Avg. Patient Load / Facility", value: "842", iconName: "Users", color: "text-blue-500", descriptionKey: "dashboard.card.totalPatients.description", link: "#" },
          { id: "sc2", titleKey: "Regional Bed Occupancy", value: "72%", iconName: "BedDouble", color: "text-indigo-500", descriptionKey: "Weighted average across units", link: "#" },
          { id: "sc3", titleKey: "Resource Health Index", value: "88/100", iconName: "TrendingUp", color: "text-green-500", descriptionKey: "Staffing & Supply availability", link: "#" },
          { id: "sc4", titleKey: "Epidemiological Alerts", value: "3 Active", iconName: "Siren", color: "text-red-500", descriptionKey: "Clusters requiring intervention", link: "/epidemic-control" },
        ];
      } else {
        // Facility Operational KPIs (Immediate Ops)
        fetchedSummary = [
          { id: "sc1", titleKey: "Current Patient Queue", value: "42", iconName: "Users", color: "text-orange-500", descriptionKey: "Patients waiting for triage", link: "/patient-registration" },
          { id: "sc2", titleKey: "Ward Bed Availability", value: "8 Free", iconName: "BedDouble", color: "text-green-500", descriptionKey: "Real-time bed tracking", link: "/ward-management" },
          { id: "sc3", titleKey: "Today's Appointments", value: "12", iconName: "CalendarCheck", color: "text-sky-500", descriptionKey: "dashboard.card.appointments.description", link: "/appointments" },
          { id: "sc4", titleKey: "Critical Supply Alerts", value: "2 Low", iconName: "PillIcon", color: "text-red-500", descriptionKey: "Oxygen & Essential Meds", link: "/drug-dispensing" },
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
        const fetchedAttendanceData: DailyAttendanceItem[] = [
            { day: "Mon", patients: 120, fill: "hsl(var(--chart-4))" },
            { day: "Tue", patients: 155, fill: "hsl(var(--chart-4))" },
            { day: "Wed", patients: 130, fill: "hsl(var(--chart-4))" },
            { day: "Thu", patients: 160, fill: "hsl(var(--chart-4))" },
            { day: "Fri", patients: 140, fill: "hsl(var(--chart-4))" },
            { day: "Sat", patients: 90, fill: "hsl(var(--chart-4))" },
            { day: "Sun", patients: 75, fill: "hsl(var(--chart-4))" },
        ];
        setDailyAttendanceData(fetchedAttendanceData);
        setIsLoadingAttendance(false);
    }, 1600);
  }, []); // Runs once on mount

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


  return (
      <div className="flex flex-col gap-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.welcomeMessage')} {user?.role === 'NATIONAL_ADMIN' ? '(National)' : user?.jurisdiction.facility || user?.jurisdiction.district || user?.jurisdiction.province || ''}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'NATIONAL_ADMIN' && "Consolidated nationwide healthcare metrics and surveillance."}
            {user?.role === 'PROVINCIAL_ADMIN' && `Provincial healthcare overview for ${user.jurisdiction.province}.`}
            {user?.role === 'DISTRICT_ADMIN' && `District healthcare performance for ${user.jurisdiction.district}.`}
            {user?.role === 'FACILITY_ADMIN' && `Operational dashboard for ${user.jurisdiction.facility}.`}
            {!user && t('dashboard.tagline')}
          </p>
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
            {summaryCardsData.map((item) => {
                const Icon = ICONS_MAP[item.iconName];
                const isTranslated = item.titleKey.includes('.');

                return (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{isTranslated ? t(item.titleKey) : item.titleKey}</CardTitle>
                    {Icon && <Icon className={`h-5 w-5 ${item.color}`} />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Array.isArray(item.value) ? item.value.join(', ') : item.value}</div>
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
                  <ShieldCheck className="h-5 w-5" /> Decision Support Center
                </CardTitle>
                <CardDescription>Strategic actions and resource distribution tools.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs">
                       <TrendingUp className="h-5 w-5" /> Analyze Trends
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs">
                       <Users className="h-5 w-5" /> Reallocate Staff
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs">
                       <Microscope className="h-5 w-5" /> Regional Lab Stats
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs" asChild>
                       <Link href="/epidemic-control">
                         <Siren className="h-5 w-5" /> Manage Outbreaks
                       </Link>
                    </Button>
                 </div>
                 <div className="p-3 bg-white rounded-lg border border-primary/10">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Management Briefing (AI)</p>
                    <p className="text-xs italic leading-snug">
                      &quot;Bed occupancy in the South District has spiked by 15% due to seasonal influenza. Recommend shifting oxygen reserves from Central General to District Hospital A.&quot;
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
                    <HeartPulse className="h-4 w-4 text-orange-500" /> Recurring Infections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {require('@/lib/mock-data').MOCK_RECURRING_INFECTIONS.map((inf: any) => (
                      <li key={inf.name} className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold">{inf.name}</p>
                            <p className="text-[10px] text-muted-foreground">{inf.facilities.join(', ')}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold">{inf.cases} cases</p>
                            <Badge variant="outline" className={`text-[9px] h-4 px-1 ${inf.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                               {inf.trend.toUpperCase()}
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
                    <CalendarCheck className="h-4 w-4 text-primary" /> Health Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {require('@/lib/mock-data').MOCK_CAMPAIGNS.map((camp: any) => (
                     <div key={camp.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                           <span className="font-bold">{camp.name}</span>
                           <span className="text-muted-foreground">{camp.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: `${camp.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Reach: {camp.reach} targets</p>
                     </div>
                   ))}
                </CardContent>
             </Card>

             {/* Epidemic Alerts & Facility Stocks */}
             <div className="space-y-6">
                <Card className="shadow-sm border-red-100 bg-red-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" /> Epidemic Surveillance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {require('@/lib/mock-data').MOCK_EPIDEMIC_ALERTS.map((alert: any) => (
                        <li key={alert.id} className="p-2 bg-white rounded border border-red-100">
                           <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-bold text-red-700">{alert.disease}</p>
                              <Badge className="bg-red-600 text-[9px] h-4">{alert.risk}</Badge>
                           </div>
                           <p className="text-[10px] text-slate-600">{alert.location} • {alert.action}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-orange-100 bg-orange-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                      <PillIcon className="h-4 w-4" /> Critical Stock Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {require('@/lib/mock-data').MOCK_FACILITY_STOCKS.filter((s:any) => s.status === 'Critical').map((stock: any) => (
                        <div key={stock.facility} className="text-[10px]">
                           <p className="font-bold text-slate-800">{stock.facility}</p>
                           <p className="text-orange-700 truncate">Needs: {stock.lowItems.join(', ')}</p>
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
                    <BarChart3 className="h-6 w-6 text-primary" /> Facility Performance Comparison
                  </CardTitle>
                  <CardDescription>Comparing patient load and occupancy % across units.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoadingPerformance ? (
                    <div className="flex items-center justify-center h-full">
                       <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={facilityPerformance}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis fontSize={10} />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="patients" name="Patient Count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="occupancy" name="Occupancy %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
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
                                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" /> {t('dashboard.charts.dailyAttendance.title')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.charts.dailyAttendance.description')}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                     {isLoadingAttendance ? (
                        <div className="flex items-center justify-center h-full">
                           <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={dailyAttendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" hideLabel />}
                                    />
                                    <RechartsLegend
                                        content={({ payload }) => (
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                            {payload?.map((entry: any, index: number) => ( // Added index for key
                                                <div key={`item-${entry.value}-${index}`} className="flex items-center space-x-1"> {/* Added index to key */}
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <span className="text-xs text-muted-foreground">{entry.value}</span>
                                                </div>
                                            ))}
                                            </div>
                                        )}
                                        />
                                    <Bar dataKey="patients" name={t('dashboard.charts.dailyAttendance.patients')} radius={[4, 4, 0, 0]}>
                                      {dailyAttendanceData.map((entry, index) => (
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
      </div>
  );
}

    
