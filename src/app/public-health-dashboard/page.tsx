"use client";

import * as React from "react";
import { 
  Users, 
  Activity, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Baby, 
  Bug,
  LayoutGrid,
  Clock,
  Sparkles
} from "lucide-react";
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
  Legend
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLocale } from "@/context/locale-context";
import { useUser } from "@/context/user-context";
import { getTranslator } from "@/lib/i18n";
import { 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const MOCK_HISTORICAL_DATA = [
  { month: 'Jan', cases: 400, deaths: 12, vacc: 65 },
  { month: 'Feb', cases: 300, deaths: 10, vacc: 68 },
  { month: 'Mar', cases: 500, deaths: 15, vacc: 72 },
  { month: 'Apr', cases: 800, deaths: 22, vacc: 75 },
  { month: 'May', cases: 600, deaths: 18, vacc: 80 },
  { month: 'Jun', cases: 400, deaths: 8, vacc: 85 },
];

const PROVINCES = [
  { id: 'maputo_city', name: 'Maputo Cidade' },
  { id: 'maputo_prov', name: 'Maputo Província' },
  { id: 'gaza', name: 'Gaza' },
  { id: 'inhambane', name: 'Inhambane' },
  { id: 'sofala', name: 'Sofala' },
  { id: 'manica', name: 'Manica' },
  { id: 'tete', name: 'Tete' },
  { id: 'zambezia', name: 'Zambézia' },
  { id: 'nampula', name: 'Nampula' },
  { id: 'niassa', name: 'Niassa' },
  { id: 'cabo_delgado', name: 'Cabo Delgado' },
];

export default function PublicHealthDashboard() {
  const { currentLocale } = useLocale();
  const { user } = useUser();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [level, setLevel] = React.useState("national");
  const [selectedRegion, setSelectedRegion] = React.useState("all");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const slides = [
    { id: 'national', title: t('publicDashboard.slideshow.national'), type: 'metrics' },
    { id: 'analysis', title: t('publicDashboard.slideshow.analysis'), type: 'chart_trend' },
    { id: 'provincial', title: t('publicDashboard.slideshow.provincial'), type: 'chart_regional' },
    { id: 'alerts', title: t('publicDashboard.slideshow.alerts'), type: 'alerts' }
  ];

  // Initialize level based on user role
  React.useEffect(() => {
    if (user) {
      if (user.role === 'PROVINCIAL_ADMIN') {
        setLevel('provincial');
        setSelectedRegion(user.jurisdiction.province || 'all');
      } else if (user.role === 'DISTRICT_ADMIN') {
        setLevel('district');
        setSelectedRegion(user.jurisdiction.district || 'all');
      } else if (user.role === 'FACILITY_ADMIN') {
        setLevel('facility');
        setSelectedRegion(user.jurisdiction.facility || 'all');
      }
    }
  }, [user]);

  // Slideshow Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setProgress(0);
      }, 5000);

      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2)); // 5% every 100ms? No, 5000ms total. 2% every 100ms = 5000ms.
      }, 100);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isPlaying, slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const openNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const canChangeLevel = user?.role === 'NATIONAL_ADMIN';
  const canChangeRegion = user?.role === 'NATIONAL_ADMIN' || user?.role === 'PROVINCIAL_ADMIN';

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden bg-background">
      {/* Presentation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-3">
             <LayoutGrid className="h-6 w-6" />
            {t('publicDashboard.title')}
          </h1>
          <div className="flex items-center gap-4 mt-1">
             <Badge variant="outline" className="bg-background text-[10px] uppercase font-bold tracking-widest text-primary border-primary/20">
                {t(`publicDashboard.filter.level.${level}`)}
             </Badge>
             {level !== 'national' && (
               <Badge variant="outline" className="bg-background text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-muted-foreground/20">
                  {t(`publicDashboard.region.${selectedRegion}`)}
               </Badge>
             )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
           {/* Slideshow Status */}
           <div className="flex items-center gap-3 bg-background/50 border border-primary/10 rounded-full px-4 py-1.5 shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary hover:bg-primary/10" 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex flex-col w-32 gap-1">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-primary truncate max-w-[80px]">{slides[currentSlide].title}</span>
                    <span className="text-muted-foreground">{currentSlide + 1}/{slides.length}</span>
                 </div>
                 <Progress value={progress} className="h-1 bg-primary/10" />
              </div>
              <div className="flex gap-1 ml-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground" 
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground" 
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
           </div>

          <div className="flex gap-2">
            <Select value={level} onValueChange={setLevel} disabled={!canChangeLevel}>
              <SelectTrigger className="w-[140px] h-10 bg-background border shadow-sm">
                <SelectValue placeholder={t('publicDashboard.filter.level.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national">{t('publicDashboard.filter.level.national')}</SelectItem>
                <SelectItem value="provincial">{t('publicDashboard.filter.level.provincial')}</SelectItem>
                <SelectItem value="district">{t('publicDashboard.filter.level.district')}</SelectItem>
                <SelectItem value="facility">{t('publicDashboard.filter.level.facility')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-10 w-10 shadow-sm" onClick={openNewTab} title={t('publicDashboard.openNewTab')}>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-10 w-10 shadow-sm" onClick={toggleFullscreen} title={t('publicDashboard.fullscreen')}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Slide Container) */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {currentSlide === 0 && (
              <div className="h-full flex flex-col gap-6">
                 {/* Hero Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1 pb-1">
                    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          {t('publicDashboard.stats.diseaseIncidence')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">2,482</div>
                        <div className="mt-2 flex items-center text-[10px] gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                          <TrendingUp className="h-2.5 w-2.5" />
                          <span>{t('publicDashboard.stats.vsLastMonth', { value: '+12%' })}</span>
                        </div>
                        <Activity className="absolute -right-4 -bottom-4 h-16 w-16 opacity-10 rotate-12" />
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {t('publicDashboard.stats.vaccinationRate')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">84.2%</div>
                        <div className="mt-2 flex items-center text-[10px] gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                          <span>{t('publicDashboard.stats.target', { value: '90%' })}</span>
                        </div>
                        <Users className="absolute -right-4 -bottom-4 h-16 w-16 opacity-10 rotate-12" />
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative">
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                          <Baby className="h-4 w-4" />
                          {t('publicDashboard.stats.maternalHealth')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">42</div>
                        <div className="mt-2 flex items-center text-[10px] gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                          <TrendingUp className="h-2.5 w-2.5 rotate-180" />
                          <span>{t('publicDashboard.stats.vsLastQtr', { value: '-5%' })}</span>
                        </div>
                        <AlertTriangle className="absolute -right-4 -bottom-4 h-16 w-16 opacity-10 rotate-12" />
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden relative">
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                          <Bug className="h-4 w-4" />
                          {t('publicDashboard.stats.hospitalOccupancy')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">128.4</div>
                        <div className="mt-2 flex items-center text-[10px] gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                          <span>{t('publicDashboard.stats.per1000')}</span>
                        </div>
                        <LayoutGrid className="absolute -right-4 -bottom-4 h-16 w-16 opacity-10 rotate-12" />
                      </CardContent>
                    </Card>
                 </div>
                 
                 {/* Summary Visual */}
                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    <Card className="lg:col-span-2 shadow-md border-primary/5 flex flex-col">
                       <CardHeader className="p-4 pb-0">
                          <CardTitle className="text-md flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            {t('publicDashboard.charts.diseaseTrends.title')}
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="flex-1 p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_HISTORICAL_DATA}>
                              <defs>
                                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
                              <YAxis axisLine={false} tickLine={false} fontSize={10} />
                              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                              <Area 
                                type="monotone" 
                                dataKey="cases" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorCases)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                       </CardContent>
                    </Card>
                    <Card className="shadow-md border-primary/5 flex flex-col">
                       <CardHeader className="p-4">
                          <CardTitle className="text-md flex items-center gap-2 text-rose-600">
                             <AlertTriangle className="h-4 w-4" />
                             Latest Monitoring
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 rounded-lg border bg-rose-50 border-rose-100">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-bold uppercase text-rose-700">Epidemic Alert</span>
                                  <span className="text-[9px] text-rose-500">2 min ago</span>
                               </div>
                               <p className="text-[11px] text-rose-800 leading-tight">Increased malaria cases reported in Niassa region clusters.</p>
                            </div>
                          ))}
                       </CardContent>
                    </Card>
                 </div>
              </div>
            )}

            {currentSlide === 1 && (
              <div className="h-full flex flex-col gap-6">
                 <Card className="flex-1 shadow-lg border-primary/5 flex flex-col">
                    <CardHeader className="p-6">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <Activity className="h-6 w-6 text-primary" />
                        {t('publicDashboard.charts.diseaseTrends.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('publicDashboard.charts.diseaseTrends.desc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_HISTORICAL_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Legend verticalAlign="top" align="right" fontSize={12} />
                          <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Reported Cases" />
                          <Line type="monotone" dataKey="vacc" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" name="Vaccination Coverage (%)" />
                          <Line type="monotone" dataKey="deaths" stroke="#f43f5e" strokeWidth={2} name="Mortality Rate" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                 </Card>
              </div>
            )}

            {currentSlide === 2 && (
              <div className="h-full flex flex-col gap-6">
                 <Card className="flex-1 shadow-lg border-primary/5 flex flex-col">
                    <CardHeader className="p-6">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-primary" />
                        {t('publicDashboard.charts.provincial.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('publicDashboard.charts.provincial.desc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: 'Maputo Cidade', vacc: 88, health: 92, pop: 1.2 },
                            { name: 'Maputo Província', vacc: 82, health: 85, pop: 2.1 },
                            { name: 'Gaza', vacc: 72, health: 65, pop: 1.5 },
                            { name: 'Inhambane', vacc: 68, health: 70, pop: 1.4 },
                            { name: 'Sofala', vacc: 65, health: 58, pop: 2.3 },
                            { name: 'Manica', vacc: 60, health: 52, pop: 1.9 },
                            { name: 'Tete', vacc: 55, health: 42, pop: 2.6 },
                            { name: 'Zambézia', vacc: 52, health: 45, pop: 5.1 },
                          ]}
                          margin={{ left: 50, right: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                          <XAxis type="number" axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                          <Tooltip cursor={{ fill: 'transparent' }} />
                          <Legend verticalAlign="top" align="right" />
                          <Bar dataKey="vacc" fill="#3b82f6" radius={[0, 4, 4, 0]} name={t('publicDashboard.charts.provincial.vaccination')} barSize={20} />
                          <Bar dataKey="health" fill="#10b981" radius={[0, 4, 4, 0]} name={t('publicDashboard.charts.provincial.maternal')} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                 </Card>
              </div>
            )}

            {currentSlide === 3 && (
              <div className="h-full flex flex-col gap-6">
                 <Card className="flex-1 border-rose-500/20 bg-rose-500/5 shadow-xl flex flex-col">
                    <CardHeader className="p-8 pb-4">
                       <div className="flex items-center gap-4">
                          <div className="p-4 bg-rose-500 rounded-3xl text-white shadow-lg shadow-rose-500/30">
                            <AlertTriangle className="h-10 w-10 animate-pulse" />
                          </div>
                          <div>
                             <CardTitle className="text-3xl font-black text-rose-800 tracking-tight uppercase">
                               {t('publicDashboard.slideshow.alerts')}
                             </CardTitle>
                             <CardDescription className="text-rose-600 font-medium text-lg">
                               Real-time epidemiological monitoring & AI predictive interventions
                             </CardDescription>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                       <div className="space-y-6 overflow-y-auto pr-4">
                          <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-md">
                             <h3 className="text-xl font-bold text-rose-700 italic flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                {t('publicDashboard.alert.title', { location: 'Cabo Delgado District' })}
                             </h3>
                             <p className="text-rose-600 mt-3 text-md leading-relaxed">
                               {t('publicDashboard.alert.desc', { location: 'Montepuez', time: '14 minutes' })}
                             </p>
                             <div className="mt-6 flex gap-4">
                                <Button variant="outline" className="text-rose-700 border-rose-200 hover:bg-rose-100 h-12 px-6 font-bold rounded-xl">
                                  {t('publicDashboard.alert.viewResponse')}
                                </Button>
                                <Button className="bg-rose-600 hover:bg-rose-700 h-12 px-6 font-bold rounded-xl shadow-lg shadow-rose-600/20">
                                  {t('publicDashboard.alert.acknowledge')}
                                </Button>
                             </div>
                          </div>

                          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-md">
                             <h3 className="text-xl font-bold text-amber-700 italic">Pre-Crisis Prediction: Maputo City</h3>
                             <p className="text-amber-600 mt-2">AI models predict a 35% surge in respiratory infections within the next 48 hours based on climatic data and pharmacy sales telemetry.</p>
                             <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                PPE Stock levels verified: Adequate
                             </div>
                          </div>
                       </div>

                       <div className="rounded-3xl bg-rose-900 text-white p-8 relative overflow-hidden flex flex-col justify-center">
                          <h2 className="text-4xl font-black mb-4 relative z-10 leading-tight">PREVENTIVE ACTION REQUIRED</h2>
                          <p className="text-rose-200 text-lg mb-8 relative z-10">National coordination center has flagged these regions for immediate resource injection.</p>
                          <div className="grid grid-cols-2 gap-4 relative z-10">
                             <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                <div className="text-2xl font-bold">14</div>
                                <div className="text-[10px] uppercase font-bold text-rose-300">Rapid Teams Active</div>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                <div className="text-2xl font-bold">850k</div>
                                <div className="text-[10px] uppercase font-bold text-rose-300">Vaccines Dispatched</div>
                             </div>
                          </div>
                          <Activity className="absolute -right-20 -bottom-20 h-80 w-80 opacity-5" />
                       </div>
                    </CardContent>
                 </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Controls Hub */}
      <div className="h-10 shrink-0 flex items-center justify-between px-2 text-muted-foreground border-t border-primary/5 mt-2">
         <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
               <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
               National Health Grid: Online
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-[10px] flex items-center gap-1">
               <Clock className="h-3 w-3" />
               Last Sync: {new Date().toLocaleTimeString()}
            </span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
               {slides.map((s, i) => (
                  <button 
                    key={s.id}
                    onClick={() => { setCurrentSlide(i); setProgress(0); }}
                    className={cn(
                      "h-1.5 transition-all rounded-full",
                      currentSlide === i ? "w-6 bg-primary" : "w-1.5 bg-muted hover:bg-primary/50"
                    )}
                 />
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
