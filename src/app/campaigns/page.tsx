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
  Megaphone, 
  Users, 
  Target, 
  Calendar, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  MessageSquare, 
  Filter, 
  Plus, 
  Search,
  Building2,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Mock Campaign Data
const MOCK_CAMPAIGNS = [
  {
    id: "camp-1",
    title: "National Vaccination Drive (Sabin)",
    type: "Vaccination",
    status: "active",
    target: 2500000,
    reached: 1850000,
    startDate: "2024-04-15",
    endDate: "2024-05-30",
    priority: "high",
    provinces: ["Maputo", "Gaza", "Inhambane", "Sofala", "Nampula"],
    lastUpdated: "5 mins ago",
    trend: "up"
  },
  {
    id: "camp-2",
    title: "Malaria Awareness & Prevention",
    type: "Awareness",
    status: "active",
    target: 1000000,
    reached: 420000,
    startDate: "2024-03-01",
    endDate: "2024-06-15",
    priority: "medium",
    provinces: ["Zambezia", "Tete", "Manica"],
    lastUpdated: "1 hour ago",
    trend: "stable"
  },
  {
    id: "camp-3",
    title: "Maternal Health Nutrition Program",
    type: "Nutrition",
    status: "planned",
    target: 500000,
    reached: 0,
    startDate: "2024-06-01",
    endDate: "2024-12-31",
    priority: "high",
    provinces: ["Cabo Delgado", "Niassa"],
    lastUpdated: "Yesterday",
    trend: "-"
  },
  {
    id: "camp-4",
    title: "Clean Water & Cholera Prevention",
    type: "WASH",
    status: "completed",
    target: 750000,
    reached: 785000,
    startDate: "2024-01-10",
    endDate: "2024-03-15",
    priority: "critical",
    provinces: ["Beira", "Maputo Province"],
    lastUpdated: "2 weeks ago",
    trend: "up"
  }
];

export default function CampaignsPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredCampaigns = MOCK_CAMPAIGNS.filter(camp => {
    const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          camp.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || camp.status === filterType;
    return matchesSearch && matchesType;
  });

  const stats = [
    { label: t('campaigns.active.title'), value: "2", icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t('campaigns.stats.reach'), value: "4.2M", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
    { label: t('campaigns.stats.target'), value: "74%", icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Field Staff Active", value: "1,420", icon: Building2, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  return (
    <div className="flex flex-col gap-8 p-1 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Megaphone className="h-8 w-8 text-primary shadow-sm" />
            </div>
            {t('campaigns.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest pl-1">
            {t('campaigns.overview.description')} • Public Health Surveillance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-background border-2">
            <Calendar className="mr-2 h-4 w-4" /> Schedule Program
          </Button>
          <Button size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 shadow-lg px-6">
            <Plus className="mr-2 h-4 w-4" /> Start New Campaign
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-default overflow-hidden group">
              <CardContent className="p-5 flex items-center gap-4 relative">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-300">
                  <stat.icon className="h-20 w-20 rotate-12" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Campaign Catalog */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-3 rounded-2xl border border-border/50">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search campaigns, types, or provinces..." 
                className="pl-10 h-10 border-none bg-background/50 focus-visible:ring-primary/20 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <Badge 
                variant="outline" 
                className={cn("cursor-pointer px-3 py-1 text-[9px] uppercase font-bold border-2", filterType === 'all' ? "bg-primary text-white border-primary" : "bg-background hover:bg-muted")}
                onClick={() => setFilterType('all')}
              >
                All
              </Badge>
              <Badge 
                variant="outline" 
                className={cn("cursor-pointer px-3 py-1 text-[9px] uppercase font-bold border-2", filterType === 'active' ? "bg-green-600 text-white border-green-600" : "bg-background hover:bg-muted")}
                onClick={() => setFilterType('active')}
              >
                Active
              </Badge>
              <Badge 
                variant="outline" 
                className={cn("cursor-pointer px-3 py-1 text-[9px] uppercase font-bold border-2", filterType === 'planned' ? "bg-blue-600 text-white border-blue-600" : "bg-background hover:bg-muted")}
                onClick={() => setFilterType('planned')}
              >
                Planned
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCampaigns.map((camp, idx) => (
                <motion.div
                  key={camp.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-lg transition-all border-l-4 group" style={{ borderLeftColor: camp.status === 'active' ? '#22c55e' : camp.status === 'planned' ? '#2563eb' : '#64748b' }}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="text-[8px] font-black uppercase bg-muted/50 px-1.5 py-0">
                               ID: {camp.id}
                             </Badge>
                             <Badge className={cn(
                               "text-[8px] font-black uppercase px-2",
                               camp.priority === 'high' ? "bg-red-500" : camp.priority === 'critical' ? "bg-orange-600" : "bg-blue-500"
                             )}>
                               {camp.priority}
                             </Badge>
                          </div>
                          <CardTitle className="text-lg font-black group-hover:text-primary transition-colors">{camp.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                             <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> {camp.type}</span>
                             <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {camp.startDate} - {camp.endDate}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-dashed text-center min-w-[120px]">
                           <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Reach Progress</p>
                           <p className="text-2xl font-black leading-tight">
                             {camp.target > 0 ? Math.round((camp.reached / camp.target) * 100) : 0}%
                           </p>
                           <div className="flex items-center justify-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                             <TrendingUp className="h-3 w-3" /> ON TRACK
                           </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                          <span>Target Population Reached</span>
                          <span className="text-foreground">{camp.reached.toLocaleString()} / {camp.target.toLocaleString()}</span>
                        </div>
                        <Progress value={camp.target > 0 ? (camp.reached / camp.target) * 100 : 0} className="h-2 bg-slate-100" />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {camp.provinces.map((prov, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/5 py-0 px-2 h-5">
                            <MapPin className="h-2 w-2 mr-1" /> {prov}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between items-center border-t border-dashed bg-slate-50/30">
                       <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                         <Clock className="h-3 w-3" /> Last Field Sync: {camp.lastUpdated}
                       </span>
                       <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all">
                         Campaign Analytics <ChevronRight className="ml-1 h-3 w-3" />
                       </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredCampaigns.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 rounded-3xl border border-dashed">
                <div className="p-4 bg-muted/20 rounded-full">
                  <Search className="h-10 w-10 text-muted-foreground opacity-30" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="font-bold text-lg">No Results Found</h3>
                  <p className="text-xs text-muted-foreground px-4">Adjust your search parameters or filters to find the health campaign you are looking for.</p>
                </div>
                <Button variant="outline" className="text-xs h-9" onClick={() => { setSearchQuery(""); setFilterType("all"); }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Activity & Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Resource Allocation Card */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white overflow-hidden relative">
             <div className="absolute -top-12 -right-12 p-8 opacity-20 pointer-events-none">
               <Target className="h-48 w-48 text-white rotate-12" />
             </div>
             <CardHeader className="relative z-10">
               <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Strategic Insight</CardTitle>
               <CardDescription className="text-white/60 text-xs">Resource allocation summary for Q2 2024 vaccination initiatives.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Budget Used</p>
                    <p className="text-xl font-black">68%</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Staff Utilization</p>
                    <p className="text-xl font-black">92%</p>
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                     <span>Vaccine Stock Level</span>
                     <span className="text-green-400">Stable</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        className="h-full bg-blue-500"
                      />
                   </div>
                </div>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest h-10">
                   Generate Logistics Report
                </Button>
             </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="border-none shadow-sm flex flex-col h-full bg-background overflow-hidden">
             <CardHeader className="pb-3 border-b bg-muted/10">
               <div className="flex items-center justify-between">
                 <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                   <Activity className="h-4 w-4 text-primary" /> Live Feed
                 </CardTitle>
                 <Badge variant="outline" className="text-[8px] bg-primary/5 text-primary border-primary/20">REAL-TIME</Badge>
               </div>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y max-h-[500px] overflow-y-auto">
                 {[
                   { user: "Dr. A. Matsinhe", action: "Completed immunization for block B-12", area: "Nampula City", time: "2 min ago", icon: CheckCircle2, iconColor: "text-green-500" },
                   { user: "Field Unit #42", action: "Arrived at destination for rural outreach", area: "Manica (Highlands)", time: "15 min ago", icon: MapPin, iconColor: "text-blue-500" },
                   { user: "Supply Chain", action: "Vaccine cold-storage alert resolved", area: "Beira Hub", time: "1 hour ago", icon: AlertCircle, iconColor: "text-amber-500" },
                   { user: "Regional Office", action: "Campaign status updated to Completed", area: "Maputo Province", time: "3 hours ago", icon: TrendingUp, iconColor: "text-teal-500" },
                   { user: "System Engine", action: "Daily goal for National Drive achieved", area: "National", time: "5 hours ago", icon: CheckCircle2, iconColor: "text-green-500" }
                 ].map((log, i) => (
                   <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex gap-4 items-start group">
                      <div className={cn("p-2 rounded-xl bg-background border shadow-sm group-hover:scale-110 transition-transform", log.iconColor)}>
                        <log.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black text-foreground">{log.user}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{log.action}</span>
                        </div>
                        <p className="text-[9px] font-bold text-primary uppercase tracking-tight">{log.area}</p>
                        <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-1 pt-0.5" title={isMounted ? new Date().toLocaleTimeString() : "" }>
                           <Clock className="h-2 w-2" /> {log.time}
                        </p>
                      </div>
                   </div>
                 ))}
               </div>
             </CardContent>
             <CardFooter className="bg-muted/10 border-t p-3">
               <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 hover:bg-white text-muted-foreground hover:text-primary">
                 View Full Operational Logs
               </Button>
             </CardFooter>
          </Card>

          {/* Quick Communication Tool */}
          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                   <MessageSquare className="h-4 w-4" /> Outreach Messenger
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  Broadcast mobilization alerts to field staff or target populations via SMS and e-mail protocols.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Compose broadcast..." className="h-9 text-xs bg-white/50 border-none" />
                  <Button size="icon" className="h-9 w-9 shrink-0 shadow-md">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest pt-1">
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Gateway: Online</span>
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> API: Secure</span>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
