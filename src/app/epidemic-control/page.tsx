
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Biohazard, 
  Map as MapIcon, 
  AlertTriangle, 
  Activity, 
  Users, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ChevronRight, 
  FileText, 
  Bell,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  BarChart3,
  Globe,
  Share2
} from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

// Mozambique Coordinates for Provinces
const MOZAMBIQUE_CENTER = { lat: -18.6657, lng: 35.5296 };
const MAP_ID = "h365_epidemic_surveillance";

// Mock Data for Epidemic Control
const MOCK_OUTBREAKS = [
  { id: 'ob-1', district: 'Maputo Cidade', condition: 'Cholera', cases: 24, status: 'critical', trend: 'up', lastUpdated: '2 hours ago' },
  { id: 'ob-2', district: 'Beira', condition: 'Malaria', cases: 156, status: 'investigating', trend: 'stable', lastUpdated: '5 hours ago' },
  { id: 'ob-3', district: 'Nampula', condition: 'COVID-19', cases: 12, status: 'managed', trend: 'down', lastUpdated: '1 day ago' },
  { id: 'ob-4', district: 'Tete', condition: 'Measles', cases: 45, status: 'critical', trend: 'up', lastUpdated: '3 hours ago' },
  { id: 'ob-5', district: 'Pemba', condition: 'Dengue', cases: 8, status: 'investigating', trend: 'up', lastUpdated: '8 hours ago' },
];

const MOCK_MAP_REGIONS = [
  { id: 'mz-mp', name: 'Maputo', risk: 'high', active: 34, lat: -25.9692, lng: 32.5732 },
  { id: 'mz-ga', name: 'Gaza', risk: 'medium', active: 12, lat: -24.3644, lng: 33.0294 },
  { id: 'mz-in', name: 'Inhambane', risk: 'low', active: 5, lat: -23.8650, lng: 35.3833 },
  { id: 'mz-so', name: 'Sofala', risk: 'high', active: 168, lat: -19.4667, lng: 34.0000 },
  { id: 'mz-ma', name: 'Manica', risk: 'low', active: 2, lat: -19.1167, lng: 33.4833 },
  { id: 'mz-te', name: 'Tete', risk: 'high', active: 52, lat: -16.1558, lng: 33.5878 },
  { id: 'mz-za', name: 'Zambezia', risk: 'medium', active: 28, lat: -16.8922, lng: 36.8872 },
  { id: 'mz-na', name: 'Nampula', risk: 'medium', active: 19, lat: -15.1167, lng: 39.2667 },
  { id: 'mz-ni', name: 'Niassa', risk: 'low', active: 4, lat: -13.2167, lng: 35.2500 },
  { id: 'mz-cd', name: 'Cabo Delgado', risk: 'medium', active: 15, lat: -12.9667, lng: 40.5500 },
];

export default function EpidemicControlPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [activeTab, setActiveTab] = useState('surveillance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredOutbreaks = MOCK_OUTBREAKS.filter(ob => 
    ob.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ob.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-1 md:p-0 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <Biohazard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t('epidemicControl.pageTitle')}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3 w-3" /> National Surveillance Center • Mozambique
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-2">
            <TabsList className="bg-muted/50 h-9 p-1">
              <TabsTrigger value="surveillance" className="text-[10px] uppercase font-bold h-7 px-3">
                Live Feed
              </TabsTrigger>
              <TabsTrigger value="public" className="text-[10px] uppercase font-bold h-7 px-3 flex gap-1.5 items-center">
                <Globe className="h-3 w-3" /> Public Dashboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-semibold uppercase tracking-wider bg-background">
            <Bell className="h-4 w-4" />
            Alerts
          </Button>
          <Button size="sm" className="h-9 gap-2 text-xs font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md">
            <Plus className="h-4 w-4" />
            {t('epidemicControl.report.button')}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'surveillance' ? (
          <motion.div
            key="surveillance-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-6"
          >
            {/* Surveillance Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t('epidemicControl.stats.activeOutbreaks'), value: '4', sub: '+1 this week', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
                { label: t('epidemicControl.stats.suspectedCases'), value: '289', sub: 'Last 24h: 32', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: t('epidemicControl.stats.highRiskAreas'), value: '3', sub: 'Central Zone', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: t('epidemicControl.stats.isolationCapacity'), value: '68%', sub: '42 Beds Available', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold">{stat.value}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{stat.sub}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Heatmap and Regional Risk */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                <Card className={cn(
                  "border-none shadow-sm bg-background transition-all duration-500 overflow-hidden",
                  isFullScreen ? "fixed inset-0 z-[100] rounded-none h-screen w-screen" : "relative"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <MapIcon className="h-5 w-5 text-primary" /> {t('epidemicControl.heatmap.title')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {t('epidemicControl.heatmap.description')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1 mr-4">
                          <Badge variant="outline" className="text-[9px] bg-red-100 text-red-800 border-red-200">Critical</Badge>
                          <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-800 border-amber-200">Alert</Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-muted" 
                          onClick={() => setIsFullScreen(!isFullScreen)}
                        >
                          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={cn("pt-4", isFullScreen ? "h-[calc(100vh-140px)]" : "relative aspect-[16/10]")}>
                    <div className="w-full h-full bg-slate-50 rounded-xl border border-dashed border-slate-200 overflow-hidden shadow-inner group relative">
                      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                          <Map
                            defaultCenter={MOZAMBIQUE_CENTER}
                            defaultZoom={isFullScreen ? 6 : 5}
                            mapId={MAP_ID}
                            gestureHandling={'greedy'}
                            disableDefaultUI={false}
                            className="w-full h-full"
                          >
                            {MOCK_MAP_REGIONS.map((region) => (
                              <AdvancedMarker
                                key={region.id}
                                position={{ lat: region.lat, lng: region.lng }}
                                onClick={() => setSelectedRegion(region.name)}
                              >
                                <Pin 
                                  background={region.risk === 'high' ? '#ef4444' : region.risk === 'medium' ? '#f59e0b' : '#10b981'} 
                                  borderColor={'#ffffff'} 
                                  glyphColor={'#ffffff'}
                                  scale={region.risk === 'high' ? 1.4 : 1.1}
                                />
                              </AdvancedMarker>
                            ))}

                            {selectedRegion && (() => {
                              const region = MOCK_MAP_REGIONS.find(r => r.name === selectedRegion);
                              if (!region) return null;
                              return (
                                <InfoWindow
                                  position={{ lat: region.lat, lng: region.lng }}
                                  onCloseClick={() => setSelectedRegion(null)}
                                >
                                  <div className="p-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Info className="h-4 w-4 text-primary" />
                                      <h3 className="text-sm font-bold uppercase">{region.name} Province</h3>
                                    </div>
                                    <div className="space-y-2.5 border-t pt-3">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Active Surveillance Cases</span>
                                        <span className="font-black text-red-600 text-sm">{region.active}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Health Facility Alert</span>
                                        <Badge className={cn(
                                          "h-5 text-[9px] font-bold px-2",
                                          region.risk === 'high' ? "bg-red-600" : region.risk === 'medium' ? "bg-amber-600" : "bg-green-600"
                                        )}>
                                          {region.risk.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Testing Capacity</span>
                                        <span className="font-bold">450/day</span>
                                      </div>
                                      <Button size="sm" className="w-full h-8 text-xs mt-2 font-bold bg-primary hover:bg-primary/90 shadow-md">
                                        Launch Field Intervention
                                      </Button>
                                    </div>
                                  </div>
                                </InfoWindow>
                              );
                            })()}
                          </Map>
                        </APIProvider>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                          <div className="p-4 bg-primary/5 rounded-full">
                            <MapIcon className="h-10 w-10 text-primary animate-pulse" />
                          </div>
                          <div className="max-w-xs">
                            <h3 className="font-bold text-sm text-foreground">Live Surveillance Map Pending</h3>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                              Google Maps API Key required for real-time national clusters. System currently operating in low-bandwidth local visualization mode.
                            </p>
                            <Badge variant="outline" className="mt-4 text-[9px] border-primary/20 text-primary">
                              Configure MAPS_API_KEY in Environment
                            </Badge>
                          </div>
                        </div>
                      )}

                      {isFullScreen && (
                        <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-md p-4 rounded-xl border shadow-2xl flex items-center gap-4">
                          <div className="flex items-center gap-2 pr-4 border-r">
                            <Biohazard className="h-6 w-6 text-red-600" />
                            <div className="leading-tight">
                              <h2 className="text-sm font-black uppercase tracking-tight">H365 Global Health</h2>
                              <p className="text-[10px] text-muted-foreground font-bold">Surveillance Engine Alpha v1.4</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {[
                              { l: 'Critical', v: '4', c: 'text-red-600' },
                              { l: 'Investigating', v: '12', c: 'text-amber-600' },
                              { l: 'Resolved', v: '189', c: 'text-green-600' }
                            ].map((s, i) => (
                              <div key={i} className="text-center">
                                <p className="text-[8px] uppercase font-bold text-muted-foreground">{s.l}</p>
                                <p className={cn("text-lg font-black leading-none", s.c)}>{s.v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className={cn(
                    "pt-2 flex justify-between text-[10px] text-muted-foreground border-t bg-slate-50/50",
                    isFullScreen ? "fixed bottom-0 left-0 right-0 z-[101] bg-white border-t p-4" : ""
                  )}>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last data sync: {isMounted ? new Date().toLocaleTimeString() : "--:--:--"}</span>
                    <span className="font-bold text-primary flex items-center gap-2">
                       <ShieldAlert className="h-3.5 w-3.5 animate-pulse" /> 
                       SITUATION LEVEL: {isFullScreen ? "NATIONAL SURVEILLANCE ACTIVE" : "MODERATE"}
                    </span>
                  </CardFooter>
                </Card>
              </div>

              {/* Right Column: Outbreak List and Action Center */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                <Card className="border-none shadow-sm h-full flex flex-col">
                  <CardHeader className="pb-3 border-b bg-slate-50/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">
                        {t('epidemicControl.outbreaks.title')}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{MOCK_OUTBREAKS.length} Active</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {t('epidemicControl.outbreaks.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 pt-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Filter by district or disease..."
                        className="pl-9 text-xs h-9 bg-muted/30 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                      <AnimatePresence mode="popLayout">
                        {filteredOutbreaks.map((ob) => (
                          <motion.div
                            key={ob.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group p-3 border rounded-xl hover:border-primary/50 transition-colors bg-background relative overflow-hidden"
                          >
                            {ob.status === 'critical' && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            )}
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                   <h4 className="text-sm font-bold leading-none">{ob.condition}</h4>
                                   <Badge 
                                     variant="outline" 
                                     className={cn(
                                       "text-[8px] uppercase px-1 h-4",
                                       ob.status === 'critical' ? "bg-red-50 text-red-700 border-red-200" :
                                       ob.status === 'investigating' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                       "bg-green-50 text-green-700 border-green-200"
                                     )}
                                   >
                                     {t(`epidemicControl.outbreaks.status.${ob.status}`)}
                                   </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                  <Navigation className="h-2 w-2" /> {ob.district}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-black leading-none">{ob.cases}</div>
                                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Verified Cases</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-dashed flex items-center justify-between">
                               <span className="text-[10px] text-muted-foreground">{ob.lastUpdated}</span>
                               <Button variant="ghost" size="sm" className="h-7 text-[10px] p-0 group-hover:text-primary transition-colors">
                                 View Cluster Analysis <ChevronRight className="h-3 w-3 ml-1" />
                               </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 border-t p-4 flex flex-col gap-3">
                     <Button className="w-full text-xs gap-2 py-5 shadow-sm" variant="default">
                       <FileText className="h-4 w-4" />
                       Generate Situation Report (SitRep)
                     </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Quick Action: Case Reporting Form */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-red-600 to-red-800 text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <AlertTriangle className="h-32 w-32 rotate-12" />
               </div>
               <CardContent className="p-6 md:p-10 relative z-10">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-widest mb-4">
                      <ShieldAlert className="h-3 w-3" /> Critical Action Required
                    </div>
                    <h2 className="text-3xl font-bold mb-3">
                      {t('epidemicControl.report.title')}
                    </h2>
                    <p className="text-white/80 text-sm md:text-md mb-8 leading-relaxed max-w-xl">
                      {t('epidemicControl.report.desc')} Rapid reports are instantly broadcast to the provincial health clusters and the National Operational Center.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input 
                        placeholder="Suspected Condition or Symptoms Cluster" 
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50 h-12 text-sm focus-visible:ring-white/50"
                      />
                      <Button className="bg-white text-red-700 hover:bg-white/90 h-12 px-10 font-bold text-sm uppercase tracking-widest shrink-0 shadow-xl">
                        {t('epidemicControl.report.button')}
                      </Button>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="public-view"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-6"
          >
            {/* Public Presentation Slide Setup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Infographic Dashboard Panel */}
              <Card className="lg:col-span-8 p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                   <svg viewBox="0 0 100 100" className="w-full h-full">
                     <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                       <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                     </pattern>
                     <rect width="100" height="100" fill="url(#grid)" />
                   </svg>
                </div>
                
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div className="space-y-2">
                       <Badge className="bg-white/10 text-white border-none uppercase tracking-widest text-[10px]">Ministry of Health Dashboard</Badge>
                       <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Public Health <br/>Situation Report</h2>
                       <p className="text-slate-400 font-medium">Daily Outbreak Surveillance & Resource Allocation Status</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[140px]">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">National Index</p>
                       <p className="text-3xl font-black text-amber-500">MODERATE</p>
                       <p className="text-[10px] text-slate-400 mt-1">Surveillance Level 3</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                     {[
                       { l: 'National Case Count', v: '1,284', Δ: '+4.2%', c: 'text-white' },
                       { l: 'Isolation Resources', v: '84%', Δ: 'STABLE', c: 'text-blue-400' },
                       { l: 'Field Staff Ready', v: '320', Δ: 'ACTIVE', c: 'text-green-400' }
                     ].map((k, i) => (
                       <div key={i} className="space-y-1">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{k.l}</p>
                         <div className="flex items-baseline gap-2">
                            <span className={cn("text-4xl font-black", k.c)}>{k.v}</span>
                            <span className="text-[10px] font-bold opacity-60">{k.Δ}</span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "70%" }}
                              className="h-full bg-blue-500"
                            />
                         </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-12 border-t border-white/10">
                     <div className="flex flex-wrap gap-12">
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold uppercase text-slate-500">Regional Awareness</h4>
                           <ul className="space-y-3">
                             {['Maputo Province: High Alert (Cholera)', 'Sofala District: Stabilization Underway', 'Nampula: Routine Monitoring'].map((txt, i) => (
                               <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                 {txt}
                               </li>
                             ))}
                           </ul>
                        </div>
                        <div className="space-y-4 flex-1">
                           <h4 className="text-xs font-bold uppercase text-slate-500">Infection Trends</h4>
                           <div className="h-24 w-full flex items-end gap-1.5">
                              {[30, 45, 60, 40, 50, 70, 85, 60, 55, 45, 30].map((h, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm"
                                />
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </Card>

              {/* Action Sidebar for Summary */}
              <div className="lg:col-span-4 space-y-6">
                 <Card className="p-6 border-none shadow-xl bg-background">
                    <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                       <Share2 className="h-4 w-4 text-primary" /> Present & Export
                    </h3>
                    <div className="space-y-3">
                       <Button className="w-full justify-between h-12 text-xs font-bold uppercase tracking-wider" variant="outline">
                         Download PDF Slide <FileText className="h-4 w-4" />
                       </Button>
                       <Button className="w-full justify-between h-12 text-xs font-bold uppercase tracking-wider" variant="outline">
                         Share to Public Portal <Globe className="h-4 w-4" />
                       </Button>
                       <Button className="w-full justify-between h-12 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800">
                         Copy Live Widget Link <Plus className="h-4 w-4" />
                       </Button>
                    </div>
                 </Card>

                 <Card className="p-6 border-none shadow-xl bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex gap-3">
                       <Info className="h-5 w-5 text-amber-600 shrink-0" />
                       <div>
                          <h4 className="text-xs font-black uppercase text-amber-900 mb-1">Public Health Note</h4>
                          <p className="text-[11px] text-amber-800/80 leading-relaxed font-medium">
                             This summary dashboard is designed for high-level government briefings and public transparency. Sensitive field data is abstracted into risk layers for security compliance.
                          </p>
                       </div>
                    </div>
                 </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
    
