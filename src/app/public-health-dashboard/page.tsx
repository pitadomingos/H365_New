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
  Sparkles,
  HeartPulse,
  TrendingDown,
  ClipboardList,
  DollarSign,
  Layers,
  ArrowUpRight,
  Shield,
  Smartphone,
  Check,
  AlertCircle,
  Package,
  Plus,
  RefreshCw
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from "@/lib/utils";
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
  ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// ==========================================
// MOCK DATA SETS FOR THE 4 TIERS (MISAU)
// ==========================================

const MOCK_PEDIATRIC_IMMUNIZATION = [
  { name: 'Xai-Xai CS', coverage: 94, drop: 3 },
  { name: 'Chókwè CS', coverage: 82, drop: 7 },
  { name: 'Chibuto CS', coverage: 78, drop: 9 },
  { name: 'Manjacaze CS', coverage: 65, drop: 14 },
  { name: 'Bilene CS', coverage: 59, drop: 16 },
  { name: 'Mabalane CS', coverage: 42, drop: 22 },
];

const MOCK_MATERNAL_MORTALITY_CAUSES = [
  { name: 'Hemorragia Pós-Parto (HPP)', value: 45, color: '#f43f5e' },
  { name: 'Atraso na Referência/Transporte', value: 25, color: '#eab308' },
  { name: 'Sepsis Puerperal', value: 15, color: '#3b82f6' },
  { name: 'Eclâmpsia/Hipertensão', value: 15, color: '#a855f7' },
];

const MOCK_TB_COHORT_SUCCESS = [
  { month: 'Jan', cura: 82, abandono: 6 },
  { month: 'Fev', cura: 84, abandono: 5 },
  { month: 'Mar', cura: 85, abandono: 5 },
  { month: 'Abr', cura: 88, abandono: 4 },
  { month: 'Mai', cura: 89, abandono: 3 },
  { month: 'Jun', cura: 91, abandono: 2 },
];

const MOCK_PROVINCIAL_BUDGET = [
  { name: 'Saúde Materna', Orcado: 12000000, Executado: 10800000 },
  { name: 'Combate à Malária', Orcado: 18000000, Executado: 17500000 },
  { name: 'Vacinação Infantil', Orcado: 8500000, Executado: 8100000 },
  { name: 'Infraestrutura/Equip.', Orcado: 15000000, Executado: 9200000 },
];

const MOCK_SDG3_HISTORICAL = [
  { year: '2022', u5mr: 72, mmr: 285 },
  { year: '2023', u5mr: 68, mmr: 260 },
  { year: '2024', u5mr: 62, mmr: 242 },
  { year: '2025', u5mr: 59, mmr: 230 },
  { year: '2026', u5mr: 54, mmr: 218 },
];

export default function PublicHealthDashboard() {
  const { currentLocale } = useLocale();
  const { user } = useUser();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  
  // Dashboard Level & Region Filters
  const [level, setLevel] = React.useState("facility");
  const [selectedProvince, setSelectedProvince] = React.useState("gaza");
  const [selectedDistrict, setSelectedDistrict] = React.useState("chibuto");
  const [selectedFacility, setSelectedFacility] = React.useState("chingodzi");
  
  // App States & Connectivity Telemetry simulation
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncQueueLength, setSyncQueueLength] = React.useState(7);
  const [lastSyncTime, setLastSyncTime] = React.useState("09:42");

  // Dynamic state actions
  const [alStock, setAlStock] = React.useState(3); // 3 Days stock (Triggers alert)
  const [oxytocinStock, setOxytocinStock] = React.useState(12);
  const [malariaPositivityRate, setMalariaPositivityRate] = React.useState(48);
  const [malariaAlertTriggered, setMalariaAlertTriggered] = React.useState(false);
  const [isReorderingAL, setIsReorderingAL] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize level based on logged user profile
  React.useEffect(() => {
    if (user) {
      if (user.role === 'PROVINCIAL_ADMIN') {
        setLevel('provincial');
        setSelectedProvince(user.jurisdiction.province?.toLowerCase() || 'gaza');
      } else if (user.role === 'DISTRICT_ADMIN') {
        setLevel('district');
        setSelectedDistrict(user.jurisdiction.district?.toLowerCase() || 'chibuto');
      } else if (user.role === 'FACILITY_ADMIN') {
        setLevel('facility');
        setSelectedFacility(user.jurisdiction.facility?.toLowerCase() || 'chingodzi');
      }
    }
  }, [user]);

  // Synchronise Telemetry Simulation
  const handleForceSync = () => {
    if (syncQueueLength === 0) {
      toast({
        title: "Sincronizado",
        description: "Todos os dados locais já estão integrados ao SIS-MA.",
      });
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncQueueLength(0);
      const now = new Date();
      setLastSyncTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      toast({
        title: "Sincronização Concluída",
        description: "7 formulários epidemiológicos enviados com sucesso para o SIS-MA (DHIS2).",
      });
    }, 1500);
  };

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

  const canChangeLevel = user?.role === 'NATIONAL_ADMIN' || !user;

  // ==========================================
  // RENDER LEVEL 1: FACILITY DASHBOARD
  // ==========================================
  const renderFacilityDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Service Delivery & Dropout Funnel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ANC Dropout Funnel */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                  <Baby className="h-4 w-4" /> Funil de Abandono CPN (Consulta Pré-Natal)
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Retenção de consultas 1ª a 4ª CPN (US Chingodzi)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="space-y-2.5">
                  {/* Step 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>CPN 1 (Primeira Consulta)</span>
                      <span>1,200 Mulheres (100%)</span>
                    </div>
                    <Progress value={100} className="h-2 bg-indigo-100" />
                  </div>
                  {/* Step 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>CPN 2</span>
                      <span>984 Mulheres (82%)</span>
                    </div>
                    <Progress value={82} className="h-2 bg-indigo-100" />
                  </div>
                  {/* Step 3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>CPN 3</span>
                      <span>732 Mulheres (61%)</span>
                    </div>
                    <Progress value={61} className="h-2 bg-indigo-100" />
                  </div>
                  {/* Step 4 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black text-rose-600 dark:text-rose-400">
                      <span>CPN 4 (Meta Conclusão)</span>
                      <span>480 Mulheres (40%)</span>
                    </div>
                    <Progress value={40} className="h-2 bg-rose-500" />
                  </div>
                </div>
                
                {/* Action Box */}
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">Alta Taxa de Abandono (60%)</p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 leading-tight">40% de retenção na 4ª CPN compromete a meta nacional da OMS.</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase h-8 rounded-lg"
                    onClick={() => toast({
                      title: "Busca Activa Iniciada",
                      description: "Listagem de CPN abandonadas enviada aos APEs para visita comunitária.",
                    })}
                  >
                    Notificar APEs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Malaria posistivity dynamic card */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase text-teal-600 tracking-wider flex items-center gap-1.5">
                  <Bug className="h-4 w-4" /> Taxa de Positividade de Malária (TDR/Microscopia)
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Positividade nos testes de triagem laboratorial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="text-center py-2 relative">
                  <span className={cn(
                    "text-6xl font-black tracking-tighter transition-all duration-300",
                    malariaPositivityRate > 40 ? "text-rose-600 animate-pulse" : "text-teal-600"
                  )}>
                    {malariaPositivityRate}%
                  </span>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {malariaPositivityRate > 40 ? "Limite de Alerta Epidemiológico Excedido" : "Taxa de Positividade Estável"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center border-t border-b py-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">TDR Positivos</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">142 Casos</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Microscopia</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">48 Casos</span>
                  </div>
                </div>

                {/* Epidemiological Surge Alert Panel */}
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 shrink-0 text-indigo-600" />
                    <p className="text-[10px] font-medium leading-tight">Positividade elevada em 12% nas últimas 72 horas nos blocos da US.</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={malariaAlertTriggered ? "outline" : "default"}
                    className={cn(
                      "font-bold text-[10px] uppercase h-8 rounded-lg",
                      malariaAlertTriggered ? "border-indigo-300 text-indigo-600" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                    onClick={() => {
                      setMalariaAlertTriggered(true);
                      toast({
                        title: "Alerta de Surto Emitido",
                        description: "Ficha de Alerta epidemiológica enviada ao Distrito (SDSGC) com sucesso.",
                      });
                    }}
                  >
                    {malariaAlertTriggered ? "Alerta Enviado" : "Activar Alerta"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* HIV cohort card */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4" /> Taxa de Retenção TARV de 12 Meses
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Retenção de doentes integrados no tratamento há 12 meses (Meta Nacional: 90%)</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { month: 'Jan', retencao: 88, meta: 90 },
                    { month: 'Fev', retencao: 89, meta: 90 },
                    { month: 'Mar', retencao: 91, meta: 90 },
                    { month: 'Abr', retencao: 90, meta: 90 },
                    { month: 'Mai', retencao: 92, meta: 90 },
                    { month: 'Jun', retencao: 93, meta: 90 },
                  ]}
                  margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} domain={[80, 100]} />
                  <Tooltip />
                  <Legend fontSize={10} verticalAlign="top" align="right" />
                  <Area type="monotone" dataKey="retencao" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRet)" name="Taxa de Retenção (%)" />
                  <Line type="monotone" dataKey="meta" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Meta MISAU (90%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Operational Logistics & Data Hygiene */}
        <div className="lg:col-span-4 space-y-6">
          {/* Logistics Stock Alert panel */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                <Package className="h-4 w-4" /> Alerta de Ruptura de Tracer Drugs
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Dias de estoque disponível de medicamentos essenciais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AL Stock */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Arteméter-Lumefantrina (AL)</span>
                  <span className={cn(
                    "font-black px-2 py-0.5 rounded-full text-[10px]",
                    alStock <= 5 ? "bg-rose-100 text-rose-700" : "bg-teal-100 text-teal-700"
                  )}>
                    {alStock} Dias de Stock (Crítico)
                  </span>
                </div>
                <Progress value={(alStock / 30) * 100} className="h-2.5 bg-slate-100" />
              </div>

              {/* Oxytocin Stock */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Oxitocina (Parto Seguro)</span>
                  <span className="font-black px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-700">
                    {oxytocinStock} Dias de Stock
                  </span>
                </div>
                <Progress value={(oxytocinStock / 30) * 100} className="h-2.5 bg-slate-100" />
              </div>

              {/* Action trigger reorder */}
              {alStock <= 5 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-800 dark:text-amber-300 rounded-xl space-y-2">
                  <div className="flex gap-2 items-start text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Estoque abaixo do limite mínimo (5 dias)</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">Risco severo de rutura de tratamento de malária em caso de surto.</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase h-9 rounded-lg"
                    disabled={isReorderingAL}
                    onClick={() => {
                      setIsReorderingAL(true);
                      setTimeout(() => {
                        setIsReorderingAL(false);
                        setAlStock(30);
                        toast({
                          title: "Requisição CMAM Criada",
                          description: "Guia de reabastecimento nº REQ-4491 enviada ao Depósito Provincial.",
                        });
                      }, 1500);
                    }}
                  >
                    {isReorderingAL ? "A Processar..." : "Solicitar Reabastecimento CMAM"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Completeness checklist */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" /> Qualidade e Higiene de Dados SIS-MA
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Monitoria de Completude & Tempestividade (Mês Corrente)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/55 dark:bg-slate-900/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Completude do Livro CPN</p>
                    <p className="text-[10px] text-muted-foreground">Ficha mensal preenchida</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold text-[9px] uppercase px-2 py-0.5">100%</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/55 dark:bg-slate-900/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Resumo Semanal BES/Surto</p>
                    <p className="text-[10px] text-muted-foreground">Semanas 18, 19, 20 sincronizadas</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold text-[9px] uppercase px-2 py-0.5">100%</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-rose-100 bg-rose-50/20 dark:bg-rose-950/5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-rose-800 dark:text-rose-300">Completude Registo de TARV</p>
                    <p className="text-[10px] text-rose-700 dark:text-rose-400">8 fichas clínicas sem desfecho anotado</p>
                  </div>
                </div>
                <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none font-bold text-[9px] uppercase px-2 py-0.5">85%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER LEVEL 2: DISTRICT DASHBOARD
  // ==========================================
  const renderDistrictDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Columns: Penta3 & Maternal Mortality */}
        <div className="lg:col-span-8 space-y-6">
          {/* Penta3 Cobertura */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Shield className="h-4 w-4" /> Cobertura Vacinal Penta3 / DTP3 por Unidade Sanitária
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Cobertura vacinal acumulada em crianças menores de 1 ano (Distrito de Chibuto)</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_PEDIATRIC_IMMUNIZATION} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} unit="%" />
                  <Tooltip />
                  <Bar dataKey="coverage" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cobertura Vacinal (%)">
                    {MOCK_PEDIATRIC_IMMUNIZATION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.coverage < 70 ? '#ef4444' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Maternal Mortality Analysis */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Rácio de Mortalidade Materna Institucional & Causas de Óbito
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Rácio calculado por 100,000 nascidos vivos e distribuição etiológica distrital</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Ratio Box */}
              <div className="md:col-span-4 text-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 flex flex-col justify-center h-full">
                <span className="text-[10px] uppercase font-black text-slate-500 block">Rácio Institucional</span>
                <span className="text-4xl font-black text-rose-600 tracking-tight block my-2">128.4</span>
                <span className="text-[9px] text-muted-foreground leading-tight">Por 100,000 Nascidos Vivos no Distrito</span>
                <Button 
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] uppercase tracking-wider h-8 rounded-lg mt-3 w-full"
                  onClick={() => toast({
                    title: "Comissão de Auditoria",
                    description: "Convocada comissão distrital de auditoria de óbitos maternos para análise do último caso.",
                  })}
                >
                  Auditar Óbitos
                </Button>
              </div>

              {/* Causes Chart */}
              <div className="md:col-span-8 flex flex-col md:flex-row items-center gap-4">
                <div className="w-[180px] h-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_MATERNAL_MORTALITY_CAUSES}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {MOCK_MATERNAL_MORTALITY_CAUSES.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 w-full text-xs">
                  {MOCK_MATERNAL_MORTALITY_CAUSES.map((cause, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cause.color }} />
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{cause.name}</span>
                      </div>
                      <span className="font-black text-slate-800 dark:text-slate-200">{cause.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Surveillance Response & SIS-C referral */}
        <div className="lg:col-span-4 space-y-6">
          {/* Surveillance clock */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Tempo de Resposta a Surtos Distrital
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Velocidade de investigação a partir do primeiro alerta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 rounded-2xl">
                <span className="text-[10px] uppercase font-black text-slate-500 block">Tempo Médio de Resposta</span>
                <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight block my-2">18.4 Horas</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Meta MISAU Satisfeita (&lt; 24H)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-600 dark:text-slate-400">Alertas Activos em Investigação:</p>
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-black block">Chibuto Sede</span>
                    <span className="font-medium">1 caso suspeito de Cólera</span>
                  </div>
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[9px] uppercase border-none px-2 py-0.5">Em Curso</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* APE integration referals */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-teal-600 tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Conversão de Referências SIS-C (APEs)
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Pacientes referenciados por Agentes de Saúde integrados na US</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/40">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Enviados APE</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200">350 Doentes</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/40">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Chegaram à US</span>
                  <span className="text-xl font-black text-teal-600">287 Doentes</span>
                </div>
              </div>

              {/* Progress and Conversion rate */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Taxa de Sucesso de Referência</span>
                  <span className="text-teal-600 font-black">82% Sucesso</span>
                </div>
                <Progress value={82} className="h-2 bg-slate-100" />
                <p className="text-[10px] text-muted-foreground leading-tight text-center mt-1">Ótimo nível de conversão. Fortalece o elo comunitário de saúde primária no Chibuto.</p>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    );
  };

  // ==========================================
  // RENDER LEVEL 3: PROVINCIAL DASHBOARD
  // ==========================================
  const renderProvincialDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Resource Heatmaps and Budgets */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bed occupancy comparison */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Taxa de Ocupação de Leitos por Hospital Regional
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Taxa acumulada de internamentos gerais e intensivos (Província de Gaza)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Hospital Provincial de Xai-Xai", rate: 94, total: 320, alert: true },
                { name: "Hospital Geral de Chókwè", rate: 68, total: 180, alert: false },
                { name: "Hospital Distrital de Chibuto", rate: 71, total: 120, alert: false },
                { name: "Hospital Distrital de Manjacaze", rate: 45, total: 90, alert: false },
              ].map((h, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{h.name} ({h.total} Leitos)</span>
                    <span className={cn("font-black", h.alert ? "text-rose-600" : "text-slate-700 dark:text-slate-300")}>
                      {h.rate}% {h.alert ? "Sobrecarregado" : ""}
                    </span>
                  </div>
                  <Progress value={h.rate} className={cn("h-2", h.alert ? "bg-rose-100" : "bg-indigo-50")} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget Variance planned vs actual */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> Execução Orçamental Provincial por Programa de Saúde
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Comparativo de Orçamento Planeado vs Gasto Executado (Meticais MT)</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_PROVINCIAL_BUDGET} margin={{ left: 15, right: 15, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} MT`} />
                  <Legend fontSize={10} verticalAlign="top" align="right" />
                  <Bar dataKey="Orcado" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Orçamento Planeado" />
                  <Bar dataKey="Executado" fill="#6366f1" radius={[4, 4, 0, 0]} name="Despesa Executada" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Right Columns: HR Staff Density & TB Success */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* HR Density Widget */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Densidade de Profissionais de Saúde
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Profissionais alocados por 10,000 habitantes (Gaza)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl grid grid-cols-2 gap-3 text-center text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-indigo-600 block mb-1">Enfermeiros/10k</span>
                  <span className="text-2xl font-black text-indigo-950">4.2</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-indigo-600 block mb-1">Médicos/10k</span>
                  <span className="text-2xl font-black text-rose-600">0.8</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Desiquilíbrio Crítico de Médicos</p>
                  <p className="text-[10px] text-rose-700 leading-tight">Média provincial de 0.8 médicos por 10,000 habitantes está abaixo do limiar básico da OMS (2.3).</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TB Success Rate Cohort */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4" /> Taxa de Cura / Sucesso de TB
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Sucesso de tratamento e abandono de coorte de Tuberculose</CardDescription>
            </CardHeader>
            <CardContent className="h-[180px] p-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TB_COHORT_SUCCESS} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip />
                  <Legend fontSize={9} />
                  <Line type="monotone" dataKey="cura" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Sucesso de Cura (%)" />
                  <Line type="monotone" dataKey="abandono" stroke="#f43f5e" strokeWidth={2} name="Taxa Abandono (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

      </div>
    );
  };

  // ==========================================
  // RENDER LEVEL 4: NATIONAL (MISAU)
  // ==========================================
  const renderNationalDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Columns: SDG3 Macro Health and UHC Spending */}
        <div className="lg:col-span-8 space-y-6">
          {/* SDG3 Mortality Trends */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Indicador ODS 3: Tendência de Mortalidade Materna e Infantil (5 Anos)
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Mortalidade de menores de 5 anos (u5mr por 1,000) vs Mortalidade Materna (mmr por 100k nascidos vivos)</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_SDG3_HISTORICAL} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip />
                  <Legend fontSize={10} verticalAlign="top" align="right" />
                  <Line type="monotone" dataKey="u5mr" stroke="#3b82f6" strokeWidth={3} name="Mortalidade Infantil &lt; 5 Anos (por 1k)" />
                  <Line type="monotone" dataKey="mmr" stroke="#ef4444" strokeWidth={3} name="Mortalidade Materna (por 100k N.V)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Macro Budget execution variance */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> Financiamento UHC: Despesa Out-of-Pocket vs Subsidização Estatal
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Representatividade dos gastos do cidadão (Out-of-Pocket) contra financiamento público de saúde</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase block">Despesa Out-of-Pocket do Cidadão</span>
                <span className="text-4xl font-black text-teal-600 block">12.4%</span>
                <span className="text-[10px] text-emerald-600 font-bold block">✓ Dentro do limite recomendado pela OMS (&lt; 20%)</span>
              </div>

              <div className="text-xs space-y-3">
                <p className="font-bold text-slate-600 dark:text-slate-400">Composição Financeira Geral do Sector:</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Financiamento por Parceiros / Doadores</span>
                    <span>46%</span>
                  </div>
                  <Progress value={46} className="h-2 bg-slate-100" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Orçamento Geral do Estado (OGE)</span>
                    <span>54%</span>
                  </div>
                  <Progress value={54} className="h-2 bg-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Macro supply chain CMS fill rate & EHR adoption */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CMAM fill rate */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Package className="h-4 w-4" /> CMAM: Fill Rate de Medicamentos Nacional
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Taxa de atendimento de requisições enviadas ao Depósito Central de Medicamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 rounded-2xl">
                <span className="text-[10px] uppercase font-black text-slate-500 block">Fill Rate de Distribuição Geral</span>
                <span className="text-5xl font-black text-teal-600 tracking-tight block my-2">89.4%</span>
                <span className="text-[10px] font-bold text-slate-500 leading-tight block">Satisfação de Linhas CMAM</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Alerta de Abastecimento Regional</p>
                  <p className="text-[10px] text-rose-700 leading-tight">Zambézia regista atraso crónico de 14 dias no fornecimento de kits de AL.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EHR Adoption rates */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Smartphone className="h-4 w-4" /> Taxa de Adopção de EHR e Ficha Electrónica
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Integração de Unidades Sanitárias em plataforma digital interoperável</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>US com Ficha Electrónica Activa</span>
                  <span className="text-indigo-600 font-black">420 / 1,200 US (35%)</span>
                </div>
                <Progress value={35} className="h-2.5 bg-slate-100" />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] rounded-xl flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                <div>
                  <p className="font-bold">Interoperabilidade FHIR/HL7 Activa</p>
                  <p className="text-indigo-700 leading-tight">API de sincronização em tempo real de dados agregados com o sistema nacional SIS-MA em pleno funcionamento.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    );
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden bg-background">
      
      {/* Presentation / Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-indigo-950 dark:text-indigo-100 flex items-center gap-3 uppercase">
             <LayoutGrid className="h-6 w-6 text-indigo-600" />
             {t('publicDashboard.title')}
          </h1>
          <div className="flex items-center gap-2.5 mt-1.5">
             <Badge className="bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider border-none px-2.5 py-0.5 rounded-md">
                Nível: {t(`publicDashboard.filter.level.${level}`)}
             </Badge>
             
             {level === 'provincial' && (
               <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                  Gaza
               </Badge>
             )}
             {level === 'district' && (
               <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                  Gaza ➔ Chibuto
               </Badge>
             )}
             {level === 'facility' && (
               <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                  Chingodzi (Tete)
               </Badge>
             )}
          </div>
        </div>
        
        {/* Actions & Filters Hub */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
           
           {/* High fidelity sync queue telemetry bar */}
           <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl px-3.5 py-1.5 shadow-sm text-xs">
              <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      syncQueueLength > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    )} />
                    {syncQueueLength > 0 ? "Buffer Pendente" : "SIS-MA Sincronizado"}
                 </div>
                 <div className="text-[10px] text-muted-foreground font-mono">
                    Último Sync: {lastSyncTime} | {syncQueueLength} Fichas
                 </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                disabled={isSyncing}
                onClick={handleForceSync}
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing ? "animate-spin" : "")} />
              </Button>
           </div>

           <div className="flex gap-2">
             <Select value={level} onValueChange={setLevel} disabled={!canChangeLevel}>
               <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-slate-900 border border-indigo-100 text-indigo-900 font-bold text-xs">
                 <SelectValue placeholder={t('publicDashboard.filter.level.placeholder')} />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="facility">{t('publicDashboard.filter.level.facility')}</SelectItem>
                 <SelectItem value="district">{t('publicDashboard.filter.level.district')}</SelectItem>
                 <SelectItem value="provincial">{t('publicDashboard.filter.level.provincial')}</SelectItem>
                 <SelectItem value="national">{t('publicDashboard.filter.level.national')}</SelectItem>
               </SelectContent>
             </Select>

             <div className="flex gap-1.5">
               <Button variant="outline" size="icon" className="h-10 w-10 shadow-sm" onClick={openNewTab} title={t('publicDashboard.openNewTab')}>
                 <ExternalLink className="h-4 w-4" />
               </Button>
               <Button variant="secondary" size="icon" className="h-10 w-10 shadow-sm" onClick={toggleFullscreen} title={t('publicDashboard.fullscreen')}>
                 <Maximize2 className="h-4 w-4" />
               </Button>
             </div>
           </div>
        </div>
      </div>

      {/* Primary Dashboard Panel */}
      <div className="flex-1 overflow-y-auto px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {level === 'facility' && renderFacilityDashboard()}
            {level === 'district' && renderDistrictDashboard()}
            {level === 'provincial' && renderProvincialDashboard()}
            {level === 'national' && renderNationalDashboard()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Grid Status footer */}
      <div className="h-10 shrink-0 flex items-center justify-between px-2 text-muted-foreground border-t border-primary/5 mt-4">
         <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Servidor Local de US: Ligado (Rede Interna)
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-[10px] flex items-center gap-1 font-mono">
               <Clock className="h-3 w-3" />
               Relógio de Auditoria MISAU: 2026-05-19
            </span>
         </div>
         <span className="text-[10px] uppercase font-black text-indigo-600">
            H365 D2A Core v1.4
         </span>
      </div>
    </div>
  );
}
