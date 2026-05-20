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
  RefreshCw,
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertOctagon,
  Eye,
  Info,
  Compass,
  Thermometer,
  Database,
  Calendar,
  Layers3,
  ListTodo
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Maximize2, Minimize2, ExternalLink, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// ==========================================================
// 1. FHIR-ALIGNED DATA MODEL & ARCHITECTURE
// ==========================================================

export interface FHIRLocation {
  resourceType: "Location";
  id: string;
  name: string;
  physicalType: "facility" | "district" | "province" | "national";
  partOf?: string; // Reference to parent Location ID
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  status: "final" | "amended" | "registered";
  category: "maternal" | "immunization" | "hiv" | "tb" | "malaria";
  code: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  subject: {
    reference: string; // Patient ID or population segment
    gender: "Male" | "Female";
    ageGroup: "<1y" | "1-4y" | "5-14y" | "15-49y" | "50y+";
  };
  effectiveDateTime: string; // YYYY-MM-DD format
  valueQuantity?: {
    value: number;
    unit: string;
  };
  // Numerator / Denominator component split for dynamic WHO calculations
  component?: Array<{
    code: { coding: Array<{ code: string; display: string }> };
    valueQuantity: { value: number; unit: string };
  }>;
  location: { reference: string }; // Reference to FHIRLocation id
}

// ==========================================================
// 2. MOCK STORES: FHIR LOCATIONS & OBSERVATIONS (MISAU GAZA & TETE)
// ==========================================================

const MOCK_LOCATIONS: FHIRLocation[] = [
  { resourceType: "Location", id: "LOC-MZ", name: "Moçambique", physicalType: "national" },
  { resourceType: "Location", id: "LOC-GZ", name: "Gaza", physicalType: "province", partOf: "LOC-MZ" },
  { resourceType: "Location", id: "LOC-TT", name: "Tete", physicalType: "province", partOf: "LOC-MZ" },
  { resourceType: "Location", id: "LOC-SO", name: "Sofala", physicalType: "province", partOf: "LOC-MZ" },
  { resourceType: "Location", id: "LOC-CH", name: "Chibuto", physicalType: "district", partOf: "LOC-GZ" },
  { resourceType: "Location", id: "LOC-XX", name: "Xai-Xai", physicalType: "district", partOf: "LOC-GZ" },
  { resourceType: "Location", id: "LOC-AN", name: "Angónia", physicalType: "district", partOf: "LOC-TT" },
  { resourceType: "Location", id: "LOC-CZ", name: "Chingodzi CS", physicalType: "facility", partOf: "LOC-TT" },
  { resourceType: "Location", id: "LOC-XX-CS", name: "Xai-Xai CS", physicalType: "facility", partOf: "LOC-XX" },
  { resourceType: "Location", id: "LOC-CH-CS", name: "Chibuto CS", physicalType: "facility", partOf: "LOC-CH" },
];

// Helper to construct FHIR observations easily
const createObservation = (
  id: string,
  category: "maternal" | "immunization" | "hiv" | "tb" | "malaria",
  indicatorCode: string,
  gender: "Male" | "Female",
  ageGroup: "<1y" | "1-4y" | "5-14y" | "15-49y" | "50y+",
  date: string,
  locationId: string,
  numVal: number,
  denVal: number
): FHIRObservation => ({
  resourceType: "Observation",
  id,
  status: "final",
  category,
  code: {
    coding: [{ system: "http://who.int/indicators", code: indicatorCode, display: indicatorCode }]
  },
  subject: {
    reference: `Group/${indicatorCode}-population`,
    gender,
    ageGroup
  },
  effectiveDateTime: date,
  location: { reference: locationId },
  component: [
    {
      code: { coding: [{ code: "NUMERATOR", display: "Numerator value" }] },
      valueQuantity: { value: numVal, unit: "count" }
    },
    {
      code: { coding: [{ code: "DENOMINATOR", display: "Denominator value" }] },
      valueQuantity: { value: denVal, unit: "count" }
    }
  ]
});

// Massive structured in-memory FHIR Observation base
const MOCK_OBSERVATIONS: FHIRObservation[] = [
  // --- maternal ---
  createObservation("obs-1", "maternal", "ANC1", "Female", "15-49y", "2026-05-10", "LOC-CZ", 120, 130),
  createObservation("obs-2", "maternal", "ANC4", "Female", "15-49y", "2026-05-11", "LOC-CZ", 80, 130),
  createObservation("obs-3", "maternal", "SBA", "Female", "15-49y", "2026-05-12", "LOC-CZ", 95, 110),
  createObservation("obs-4", "maternal", "MMR", "Female", "15-49y", "2026-05-15", "LOC-CZ", 1, 1000), // MMR expressed as ratio

  createObservation("obs-5", "maternal", "ANC1", "Female", "15-49y", "2026-05-10", "LOC-XX-CS", 200, 210),
  createObservation("obs-6", "maternal", "ANC4", "Female", "15-49y", "2026-05-11", "LOC-XX-CS", 140, 210),
  createObservation("obs-7", "maternal", "SBA", "Female", "15-49y", "2026-05-12", "LOC-XX-CS", 185, 200),
  createObservation("obs-8", "maternal", "MMR", "Female", "15-49y", "2026-05-15", "LOC-XX-CS", 0, 1500),

  createObservation("obs-9", "maternal", "ANC1", "Female", "15-49y", "2026-05-10", "LOC-CH-CS", 180, 190),
  createObservation("obs-10", "maternal", "ANC4", "Female", "15-49y", "2026-05-11", "LOC-CH-CS", 130, 190),
  createObservation("obs-11", "maternal", "SBA", "Female", "15-49y", "2026-05-12", "LOC-CH-CS", 170, 180),
  createObservation("obs-12", "maternal", "MMR", "Female", "15-49y", "2026-05-15", "LOC-CH-CS", 2, 1200),

  // Historical / Trends for Maternal (Apr, Mar, Feb, Jan 2026)
  createObservation("obs-tr-1", "maternal", "ANC4", "Female", "15-49y", "2026-04-10", "LOC-CZ", 75, 120),
  createObservation("obs-tr-2", "maternal", "ANC4", "Female", "15-49y", "2026-03-10", "LOC-CZ", 70, 125),
  createObservation("obs-tr-3", "maternal", "ANC4", "Female", "15-49y", "2026-02-10", "LOC-CZ", 60, 115),
  createObservation("obs-tr-4", "maternal", "ANC4", "Female", "15-49y", "2026-01-10", "LOC-CZ", 50, 110),

  // --- immunization ---
  createObservation("obs-13", "immunization", "DTP1", "Male", "<1y", "2026-05-01", "LOC-CZ", 98, 100),
  createObservation("obs-14", "immunization", "DTP3", "Male", "<1y", "2026-05-02", "LOC-CZ", 85, 100),
  createObservation("obs-15", "immunization", "MCV", "Male", "<1y", "2026-05-03", "LOC-CZ", 90, 100),

  createObservation("obs-16", "immunization", "DTP1", "Female", "<1y", "2026-05-01", "LOC-CZ", 102, 105),
  createObservation("obs-17", "immunization", "DTP3", "Female", "<1y", "2026-05-02", "LOC-CZ", 82, 105),
  createObservation("obs-18", "immunization", "MCV", "Female", "<1y", "2026-05-03", "LOC-CZ", 92, 105),

  // --- hiv ---
  createObservation("obs-23", "hiv", "ART", "Female", "15-49y", "2026-05-05", "LOC-CZ", 880, 950),
  createObservation("obs-24", "hiv", "VLS", "Female", "15-49y", "2026-05-06", "LOC-CZ", 810, 880),
  createObservation("obs-25", "hiv", "ART", "Male", "15-49y", "2026-05-05", "LOC-CZ", 540, 600),
  createObservation("obs-26", "hiv", "VLS", "Male", "15-49y", "2026-05-06", "LOC-CZ", 490, 540),

  // --- tb ---
  createObservation("obs-31", "tb", "TBDET", "Male", "15-49y", "2026-05-18", "LOC-CZ", 45, 50),
  createObservation("obs-32", "tb", "TBCUR", "Male", "15-49y", "2026-05-19", "LOC-CZ", 39, 45),

  // --- malaria ---
  createObservation("obs-37", "malaria", "MALINC", "Female", "1-4y", "2026-05-20", "LOC-CZ", 85, 1000), // Incidence rate per 1k
  createObservation("obs-38", "malaria", "MALPOS", "Female", "1-4y", "2026-05-20", "LOC-CZ", 192, 400), // 48% rate

  createObservation("obs-39", "malaria", "MALINC", "Female", "1-4y", "2026-05-20", "LOC-XX-CS", 110, 1000),
  createObservation("obs-40", "malaria", "MALPOS", "Female", "1-4y", "2026-05-20", "LOC-XX-CS", 160, 500), // 32%

  createObservation("obs-41", "malaria", "MALINC", "Female", "1-4y", "2026-05-20", "LOC-CH-CS", 140, 1000),
  createObservation("obs-42", "malaria", "MALPOS", "Female", "1-4y", "2026-05-20", "LOC-CH-CS", 294, 600), // 49%

  // Anomaly Detection: 6-Months Trailing Malaria positivity values (to calculate outlier threshold)
  createObservation("obs-mal-tr1", "malaria", "MALPOS", "Female", "1-4y", "2026-04-15", "LOC-CZ", 98, 400),  // 24.5%
  createObservation("obs-mal-tr2", "malaria", "MALPOS", "Female", "1-4y", "2026-03-15", "LOC-CZ", 104, 400), // 26%
  createObservation("obs-mal-tr3", "malaria", "MALPOS", "Female", "1-4y", "2026-02-15", "LOC-CZ", 88, 400),  // 22%
  createObservation("obs-mal-tr4", "malaria", "MALPOS", "Female", "1-4y", "2026-01-15", "LOC-CZ", 112, 400), // 28%
  createObservation("obs-mal-tr5", "malaria", "MALPOS", "Female", "1-4y", "2025-12-15", "LOC-CZ", 80, 400),  // 20%
  createObservation("obs-mal-tr6", "malaria", "MALPOS", "Female", "1-4y", "2025-11-15", "LOC-CZ", 92, 400),  // 23%
];

// ==========================================================
// 3. WHO-COMPLIANT INDICATORS CONFIGURATION
// ==========================================================

export interface WHOIndicator {
  id: string;
  code: string;
  name: string;
  category: "maternal" | "immunization" | "hiv" | "tb" | "malaria";
  numeratorDesc: string;
  denominatorDesc: string;
  target: number;
  unit: "%" | "por 1k" | "por 100k";
}

const WHO_INDICATORS: Record<string, WHOIndicator> = {
  ANC1: { id: "ANC1", code: "ANC1", name: "Cobertura de CPN 1ª Consulta", category: "maternal", numeratorDesc: "Mulheres com 1ª CPN", denominatorDesc: "Grávidas Esperadas", target: 95, unit: "%" },
  ANC4: { id: "ANC4", code: "ANC4", name: "Cobertura de CPN 4+ Consultas", category: "maternal", numeratorDesc: "Mulheres com 4+ CPN", denominatorDesc: "Grávidas Esperadas", target: 90, unit: "%" },
  SBA: { id: "SBA", code: "SBA", name: "Partos Assistidos por Pessoal Qualificado", category: "maternal", numeratorDesc: "Partos Institucionais", denominatorDesc: "Partos Esperados", target: 85, unit: "%" },
  MMR: { id: "MMR", code: "MMR", name: "Rácio de Mortalidade Materna", category: "maternal", numeratorDesc: "Óbitos Maternos", denominatorDesc: "Nascidos Vivos", target: 70, unit: "por 100k" },
  DTP1: { id: "DTP1", code: "DTP1", name: "Cobertura Vacinal Penta1", category: "immunization", numeratorDesc: "Crianças com 1ª Dose", denominatorDesc: "População Alvo <1a", target: 95, unit: "%" },
  DTP3: { id: "DTP3", code: "DTP3", name: "Cobertura Vacinal Penta3", category: "immunization", numeratorDesc: "Crianças com 3ª Dose", denominatorDesc: "População Alvo <1a", target: 90, unit: "%" },
  MCV: { id: "MCV", code: "MCV", name: "Cobertura de Sarampo MCV1", category: "immunization", numeratorDesc: "Crianças com Sarampo", denominatorDesc: "População Alvo <1a", target: 95, unit: "%" },
  ART: { id: "ART", code: "ART", name: "Cobertura TARV de 12 Meses", category: "hiv", numeratorDesc: "Pacientes em TARV 12M", denominatorDesc: "Pacientes Iniciados", target: 95, unit: "%" },
  VLS: { id: "VLS", code: "VLS", name: "Taxa de Supressão Viral", category: "hiv", numeratorDesc: "Pacientes Supressos", denominatorDesc: "Cargas Virais Testadas", target: 95, unit: "%" },
  TBDET: { id: "TBDET", code: "TBDET", name: "Taxa de Detecção de TB", category: "tb", numeratorDesc: "Casos Notificados", denominatorDesc: "Casos Estimados OMS", target: 90, unit: "%" },
  TBCUR: { id: "TBCUR", code: "TBCUR", name: "Taxa de Sucesso Terapêutico TB", category: "tb", numeratorDesc: "Curas Clínicas", denominatorDesc: "Pacientes Inscritos", target: 85, unit: "%" },
  MALINC: { id: "MALINC", code: "MALINC", name: "Taxa de Incidência de Malária", category: "malaria", numeratorDesc: "Casos Confirmados", denominatorDesc: "População sob Risco", target: 100, unit: "por 1k" },
  MALPOS: { id: "MALPOS", code: "MALPOS", name: "Taxa de Positividade de Malária", category: "malaria", numeratorDesc: "Testes TDR/Lâminas Positivas", denominatorDesc: "Total de Testes Realizados", target: 25, unit: "%" },
};

// ==========================================================
// 4. MAIN REVAMPED SAAS DASHBOARD
// ==========================================================

export default function PublicHealthDashboard() {
  const { currentLocale } = useLocale();
  const { user } = useUser();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const router = useRouter();

  // Dual tab state
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "intake">("dashboard");

  // Dynamic FHIR stores state
  const [observations, setObservations] = React.useState<FHIRObservation[]>(MOCK_OBSERVATIONS);
  const [pendingObservations, setPendingObservations] = React.useState<FHIRObservation[]>([]);

  // Hierarchical states
  const [level, setLevel] = React.useState<"facility" | "district" | "provincial" | "national">("national");
  const [selectedProvince, setSelectedProvince] = React.useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>("all");
  const [selectedFacility, setSelectedFacility] = React.useState<string>("all");

  // Disaggregation states
  const [selectedAge, setSelectedAge] = React.useState<string>("all");
  const [selectedGender, setSelectedGender] = React.useState<string>("all");
  const [selectedTimePeriod, setSelectedTimePeriod] = React.useState<string>("2026-05"); // default current month
  const [timeType, setTimeType] = React.useState<"month" | "quarter" | "year">("month");

  // Telemetry & Sync Simulations
  const [isMounted, setIsMounted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncQueueLength, setSyncQueueLength] = React.useState(0);
  const [lastSyncTime, setLastSyncTime] = React.useState("07:15");

  // Local state modifiers (Trigger CMAM supplies replenishment)
  const [alStockDays, setAlStockDays] = React.useState(3); // Under threshold trigger reorder
  const [isReorderingAL, setIsReorderingAL] = React.useState(false);

  // Campaign & Vaccination Input form states
  const [intakeType, setIntakeType] = React.useState<"facility" | "field">("facility");
  const [formProvince, setFormProvince] = React.useState<string>("gaza");
  const [formDistrict, setFormDistrict] = React.useState<string>("chibuto");
  const [formFacility, setFormFacility] = React.useState<string>("chibuto-cs");
  const [fieldSiteName, setFieldSiteName] = React.useState<string>("");
  const [vaccineType, setVaccineType] = React.useState<string>("DTP3");
  const [formGender, setFormGender] = React.useState<"Male" | "Female">("Female");
  const [formAge, setFormAge] = React.useState<"<1y" | "1-4y" | "5-14y" | "15-49y" | "50y+">("<1y");
  const [administeredDoses, setAdministeredDoses] = React.useState<string>("");
  const [targetPopulation, setTargetPopulation] = React.useState<string>("");

  // Cold Chain States for Field Portal
  const [coldChainSafeTemp, setColdChainSafeTemp] = React.useState<boolean>(true);
  const [coldChainIcePacks, setColdChainIcePacks] = React.useState<boolean>(true);
  const [vvmStatus, setVvmStatus] = React.useState<"stage1" | "stage2" | "stage3">("stage1");
  const [gpsCoordinates, setGpsCoordinates] = React.useState<string>("-24.6811, 33.5292");
  const [mobileTeamId, setMobileTeamId] = React.useState<string>("BRIGADA-MÓVEL-03");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Enforce logged-in MISAU user jurisdiction limits
  React.useEffect(() => {
    if (user) {
      if (user.role === "PROVINCIAL_ADMIN") {
        setLevel("provincial");
        setSelectedProvince(user.jurisdiction.province?.toLowerCase() || "gaza");
      } else if (user.role === "DISTRICT_ADMIN") {
        setLevel("district");
        setSelectedProvince(user.jurisdiction.province?.toLowerCase() || "gaza");
        setSelectedDistrict(user.jurisdiction.district?.toLowerCase() || "chibuto");
      } else if (user.role === "FACILITY_ADMIN") {
        setLevel("facility");
        setSelectedProvince(user.jurisdiction.province?.toLowerCase() || "tete");
        setSelectedDistrict(user.jurisdiction.district?.toLowerCase() || "angonia");
        setSelectedFacility(user.jurisdiction.facility?.toLowerCase() || "chingodzi");
      }
    }
  }, [user]);

  // Synchronise Telemetry Simulation
  const handleForceSync = () => {
    if (syncQueueLength === 0 && pendingObservations.length === 0) {
      toast({
        title: "SIS-MA Integrado",
        description: "Todos os relatórios epidemiológicos locais já foram integrados ao SIS-MA.",
      });
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Merge offline pending logs into main stateful store
      setObservations(prev => [...pendingObservations, ...prev]);
      setPendingObservations([]);
      setSyncQueueLength(0);
      const now = new Date();
      setLastSyncTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      toast({
        title: "Sincronização Concluída",
        description: `Sincronização concluída com sucesso. Todos os novos relatórios foram agregados ao painel.`,
      });
    }, 1200);
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

  // Helper: Retrieve all location IDs child boundaries
  const getSubLocationIds = (locId: string): string[] => {
    const direct = [locId];
    MOCK_LOCATIONS.forEach(l => {
      if (l.partOf === locId) {
        direct.push(l.id);
        MOCK_LOCATIONS.forEach(sl => {
          if (sl.partOf === l.id) {
            direct.push(sl.id);
            MOCK_LOCATIONS.forEach(ssl => {
              if (ssl.partOf === sl.id) direct.push(ssl.id);
            });
          }
        });
      }
    });
    return Array.from(new Set(direct));
  };

  // ==========================================================
  // 5. DYNAMIC indicator ENGINE (AGGREGATOR)
  // ==========================================================

  const computedIndicators = React.useMemo(() => {
    // 1. Determine active locations boundary list
    let targetLocIds: string[] = [];
    if (level === "facility") {
      if (selectedFacility !== "all") {
        const found = MOCK_LOCATIONS.find(l => l.name.toLowerCase().includes(selectedFacility.toLowerCase()) && l.physicalType === "facility");
        targetLocIds = found ? [found.id] : ["LOC-CZ"];
      } else {
        targetLocIds = ["LOC-CZ", "LOC-XX-CS", "LOC-CH-CS"];
      }
    } else if (level === "district") {
      const distName = selectedDistrict !== "all" ? selectedDistrict : "chibuto";
      const found = MOCK_LOCATIONS.find(l => l.name.toLowerCase().includes(distName.toLowerCase()) && l.physicalType === "district");
      targetLocIds = found ? getSubLocationIds(found.id) : getSubLocationIds("LOC-CH");
    } else if (level === "provincial") {
      const provName = selectedProvince !== "all" ? selectedProvince : "gaza";
      const found = MOCK_LOCATIONS.find(l => l.name.toLowerCase().includes(provName.toLowerCase()) && l.physicalType === "province");
      targetLocIds = found ? getSubLocationIds(found.id) : getSubLocationIds("LOC-GZ");
    } else {
      // National
      targetLocIds = getSubLocationIds("LOC-MZ");
    }

    // 2. Aggregate observations matching target boundary & disaggregation bands
    const result: Record<string, { numerator: number; denominator: number; value: number; gap: number; target: number; unit: string; name: string }> = {};

    Object.keys(WHO_INDICATORS).forEach(indKey => {
      const ind = WHO_INDICATORS[indKey];
      let sumNumerator = 0;
      let sumDenominator = 0;

      observations.forEach(obs => {
        // filter code
        if (obs.code.coding[0].code !== ind.code) return;
        // filter location
        if (!targetLocIds.includes(obs.location.reference)) return;
        // filter gender
        if (selectedGender !== "all" && obs.subject.gender !== selectedGender) return;
        // filter age
        if (selectedAge !== "all" && obs.subject.ageGroup !== selectedAge) return;

        // filter time range
        const obsDate = obs.effectiveDateTime; // YYYY-MM-DD
        if (timeType === "month") {
          if (!obsDate.startsWith(selectedTimePeriod)) return;
        } else if (timeType === "quarter") {
          const year = selectedTimePeriod.split("-")[0];
          const quarter = selectedTimePeriod.split("-")[1];
          const monthInt = parseInt(obsDate.split("-")[1]);
          if (obsDate.split("-")[0] !== year) return;
          if (quarter === "Q1" && (monthInt < 1 || monthInt > 3)) return;
          if (quarter === "Q2" && (monthInt < 4 || monthInt > 6)) return;
        } else {
          if (!obsDate.startsWith(selectedTimePeriod)) return;
        }

        const numComp = obs.component?.find(c => c.code.coding[0].code === "NUMERATOR");
        const denComp = obs.component?.find(c => c.code.coding[0].code === "DENOMINATOR");
        if (numComp && denComp) {
          sumNumerator += numComp.valueQuantity.value;
          sumDenominator += denComp.valueQuantity.value;
        }
      });

      // Default safe mock filler if bounds return empty for specific disaggregation
      if (sumDenominator === 0) {
        sumNumerator = Math.round(ind.target * 0.8);
        sumDenominator = 100;
      }

      const calculatedValue = sumDenominator > 0 
        ? (ind.unit === "por 100k" ? Math.round((sumNumerator / sumDenominator) * 100000 * 10) / 10 : Math.round((sumNumerator / sumDenominator) * 100))
        : 0;

      const gap = Math.round((calculatedValue - ind.target) * 10) / 10;

      result[indKey] = {
        numerator: sumNumerator,
        denominator: sumDenominator,
        value: calculatedValue,
        gap,
        target: ind.target,
        unit: ind.unit,
        name: ind.name
      };
    });

    return result;
  }, [level, selectedProvince, selectedDistrict, selectedFacility, selectedAge, selectedGender, selectedTimePeriod, timeType, observations]);

  // ==========================================================
  // 6. AI SURVEILLANCE & OUTBREAK ALERTS PANEL
  // ==========================================================

  const aiSurveillanceStatus = React.useMemo(() => {
    const malariaPos = computedIndicators["MALPOS"];
    const currentPositivity = malariaPos ? malariaPos.value : 48;
    
    const sixMonthAvg = 23.9;
    const threshold = Math.round(sixMonthAvg * 1.5 * 10) / 10;
    const isOutbreak = currentPositivity > threshold;

    return {
      isOutbreak,
      currentPositivity,
      threshold,
      average: sixMonthAvg,
      indicatorName: "Positividade de Malária (Chingodzi)"
    };
  }, [computedIndicators]);

  // ==========================================================
  // 7. DATA QUALITY & CLINICAL HYGIENE AUDIT PANEL
  // ==========================================================

  const dataQualityAudit = React.useMemo(() => {
    const anc1 = computedIndicators["ANC1"]?.numerator || 0;
    const anc4 = computedIndicators["ANC4"]?.numerator || 0;
    const sba = computedIndicators["SBA"]?.numerator || 0;

    const inconsistencies: string[] = [];
    if (anc4 > anc1) {
      inconsistencies.push("Inconsistência Gravidez: 4ª Consulta excede a 1ª Consulta CPN.");
    }
    if (sba > (anc1 * 1.2)) {
      inconsistencies.push("Inconsistência Partos: Partos assistidos excedem partos esperados.");
    }

    const completeness = selectedFacility !== "all" ? 95 : 88;
    const timeliness = selectedFacility !== "all" ? 92 : 85;

    return {
      completeness,
      timeliness,
      inconsistencies,
      hasIssues: inconsistencies.length > 0 || completeness < 90
    };
  }, [computedIndicators, selectedFacility]);

  // ==========================================================
  // 8. INTERACTIVE GEOGRAPHIC SVG MAP OF MOZAMBIQUE
  // ==========================================================

  const handleProvinceClick = (provKey: string) => {
    setSelectedProvince(provKey);
    setLevel("provincial");
    toast({
      title: `Região Seleccionada: ${provKey.toUpperCase()}`,
      description: `Dashboard filtrado para a agregação provincial de ${provKey.toUpperCase()}.`,
    });
  };

  const renderMozambiqueSVGMap = () => {
    const provinces = [
      { id: "niassa", name: "Niassa", path: "M 30,10 L 50,5 L 60,25 L 40,35 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "cabo_delgado", name: "Cabo Delgado", path: "M 52,5 L 75,12 L 70,30 L 62,25 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "tete", name: "Tete", path: "M 10,40 L 35,32 L 40,55 L 20,60 Z", color: selectedProvince === "tete" ? "fill-emerald-500/40 stroke-emerald-500" : "fill-indigo-950/20 stroke-indigo-900" },
      { id: "zambezia", name: "Zambézia", path: "M 42,37 L 65,33 L 55,62 L 38,55 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "nampula", name: "Nampula", path: "M 62,27 L 80,32 L 72,55 L 57,42 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "manica", name: "Manica", path: "M 22,62 L 35,58 L 32,85 L 18,80 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "sofala", name: "Sofala", path: "M 36,58 L 48,64 L 40,88 L 33,85 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "gaza", name: "Gaza", path: "M 12,85 L 30,88 L 22,115 L 10,110 Z", color: selectedProvince === "gaza" ? "fill-emerald-500/40 stroke-emerald-500" : "fill-indigo-950/20 stroke-indigo-900" },
      { id: "inhambane", name: "Inhambane", path: "M 32,88 L 45,95 L 35,118 L 24,115 Z", color: "fill-indigo-950/20 stroke-indigo-900" },
      { id: "maputo", name: "Maputo", path: "M 8,112 L 18,116 L 15,130 L 5,125 Z", color: "fill-indigo-950/20 stroke-indigo-900" }
    ];

    return (
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Mapa de Performance D2A (MISAU)
          </CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Clique nas províncias do sul ou norte para filtrar e focar dados</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px] relative">
          <svg viewBox="-10 -10 100 150" className="w-full max-w-[280px] h-auto drop-shadow-md select-none transition-all duration-300">
            {provinces.map(prov => (
              <g key={prov.id} className="group cursor-pointer" onClick={() => handleProvinceClick(prov.id)}>
                <path 
                  d={prov.path} 
                  className={cn(
                    "transition-all duration-300 stroke-[1.5] hover:fill-indigo-500/50", 
                    prov.color
                  )} 
                />
                <text 
                  x={prov.id === "tete" ? 22 : prov.id === "gaza" ? 20 : 45} 
                  y={prov.id === "tete" ? 48 : prov.id === "gaza" ? 100 : 30} 
                  className="font-black text-[5px] fill-slate-500 pointer-events-none group-hover:fill-slate-900 dark:group-hover:fill-white font-sans uppercase"
                >
                  {prov.name}
                </text>
              </g>
            ))}
          </svg>
          
          <div className="absolute bottom-2 left-2 text-[9px] bg-background/90 p-2 rounded-lg border flex flex-col gap-1.5 shadow-sm">
            <span className="font-bold uppercase text-muted-foreground block border-b pb-0.5">Indicadores do Mapa</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-emerald-500/40 border border-emerald-500 rounded-sm" />
              <span>Região Seleccionada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-indigo-950/20 border border-indigo-900 rounded-sm" />
              <span>Outras Províncias</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ==========================================================
  // 9. SMART WHO INDICATOR CARD COMPONENT
  // ==========================================================

  const renderSmartKPICard = (indKey: string) => {
    const data = computedIndicators[indKey];
    if (!data) return null;

    const isNegativeGap = data.gap < 0;
    const isTargetMet = data.gap >= 0;

    const borderClass = isTargetMet 
      ? "border-l-4 border-l-emerald-500" 
      : data.gap > -15 
        ? "border-l-4 border-l-amber-500" 
        : "border-l-4 border-l-rose-500";

    const badgeColor = isTargetMet 
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
      : data.gap > -15 
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" 
        : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";

    return (
      <Card key={indKey} className={cn("bg-card shadow-sm hover:shadow-md transition-all rounded-xl", borderClass)}>
        <CardContent className="p-3.5 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{indKey}</span>
              <h3 className="text-xs font-bold leading-tight line-clamp-2 text-slate-800 dark:text-slate-200">{data.name}</h3>
            </div>
            <Badge className={cn("border-none text-[9px] font-black uppercase rounded-md", badgeColor)}>
              {data.value}{data.unit}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-b py-1.5 border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold">Num / Den</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.numerator.toLocaleString()} / {data.denominator.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold">Meta OMS</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.target}{data.unit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-black">
            <span className="text-muted-foreground uppercase text-[9px]">Desvio da Meta:</span>
            <span className={cn(
              "flex items-center gap-0.5",
              isTargetMet ? "text-emerald-600" : isNegativeGap ? "text-rose-600" : "text-amber-600"
            )}>
              {isTargetMet ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isTargetMet ? `+${data.gap}` : data.gap}%
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ==========================================================
  // 10. INTAKE FORM SUBMISSION HANDLER
  // ==========================================================

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numDoses = parseInt(administeredDoses);
    const targetPop = parseInt(targetPopulation);

    if (isNaN(numDoses) || isNaN(targetPop) || numDoses <= 0 || targetPop <= 0) {
      toast({
        title: "Erro de Validação",
        description: "Doses administradas e população alvo devem ser valores numéricos maiores que zero.",
        variant: "destructive"
      });
      return;
    }

    if (numDoses > targetPop) {
      toast({
        title: "Aviso de Validação",
        description: "As doses administradas não devem exceder a população alvo esperada no registo básico.",
        variant: "destructive"
      });
      return;
    }

    // Determine FHIR location node based on forms
    const locationId = intakeType === "facility" ? "LOC-CH-CS" : "LOC-CH";
    const category = vaccineType === "MALPOS" ? "malaria" : "immunization";

    const uniqueId = `obs-field-${Date.now()}`;
    const newObservation = createObservation(
      uniqueId,
      category,
      vaccineType,
      formGender,
      formAge,
      new Date().toISOString().split('T')[0], // current date
      locationId,
      numDoses,
      targetPop
    );

    // Save report in local offline buffer
    setPendingObservations(prev => [newObservation, ...prev]);
    setSyncQueueLength(prev => prev + 1);

    toast({
      title: "Relatório Salvo Localmente",
      description: `Actividade de ${vaccineType} (${intakeType === 'facility' ? 'US' : 'Brigada'}) armazenada no buffer offline. Clique em Sincronizar para aplicar.`,
    });

    // Reset inputs
    setAdministeredDoses("");
    setTargetPopulation("");
    setFieldSiteName("");
  };

  if (!isMounted) return null;

  const canChangeLevel = user?.role === "NATIONAL_ADMIN" || !user;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden bg-background">
      
      {/* Presentation Header & Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-indigo-950 dark:text-indigo-100 flex items-center gap-3 uppercase">
             <LayoutGrid className="h-6 w-6 text-indigo-600" />
             Painel Nacional D2A & Entrada de Campo
          </h1>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
             <Badge className="bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider border-none px-2.5 py-0.5 rounded-md">
                Nível: {t(`publicDashboard.filter.level.${level}`)}
             </Badge>
             
             {level === 'provincial' && (
               <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                  Província: {selectedProvince.toUpperCase()}
               </Badge>
             )}
             {level === 'district' && (
               <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                  Distrito: {selectedDistrict.toUpperCase()}
               </Badge>
             )}
             {level === 'facility' && (
               <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                  US: Chingodzi (Tete)
               </Badge>
             )}
          </div>
        </div>
        
        {/* Offline sync telemetry bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl px-3.5 py-1.5 shadow-sm text-xs">
              <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      syncQueueLength > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    )} />
                    {syncQueueLength > 0 ? `${syncQueueLength} Relatório(s) Pendente(s)` : "Sincronizado com SIS-MA"}
                 </div>
                 <div className="text-[10px] text-muted-foreground font-mono">
                    Último Sync: {lastSyncTime} | Buffer Local: {syncQueueLength} logs
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
             <Select value={level} onValueChange={(val: any) => setLevel(val)} disabled={!canChangeLevel}>
               <SelectTrigger className="w-[160px] h-10 bg-white dark:bg-slate-900 border border-indigo-100 text-indigo-900 font-bold text-xs">
                 <SelectValue placeholder="Nível de Acesso" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="facility">{t('publicDashboard.filter.level.facility')}</SelectItem>
                 <SelectItem value="district">{t('publicDashboard.filter.level.district')}</SelectItem>
                 <SelectItem value="provincial">{t('publicDashboard.filter.level.provincial')}</SelectItem>
                 <SelectItem value="national">{t('publicDashboard.filter.level.national')}</SelectItem>
               </SelectContent>
             </Select>

             <div className="flex gap-1.5">
               <Button variant="outline" size="icon" className="h-10 w-10 shadow-sm" onClick={toggleFullscreen}>
                 <Maximize2 className="h-4 w-4" />
               </Button>
               <Button 
                  onClick={() => router.push("/")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-10 px-4 rounded-xl uppercase text-[10px] tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao H365
                </Button>
             </div>
           </div>
        </div>
      </div>

      {/* TOP NAVIGATION WORKSPACE SWITCHER TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0 gap-4">
         <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
               "py-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
               activeTab === "dashboard"
                  ? "border-b-indigo-600 text-indigo-600 font-black"
                  : "border-b-transparent text-slate-500 hover:text-slate-800 hover:border-b-slate-200"
            )}
         >
            <Layers3 className="h-4 w-4" />
            Painel Geral (D2A Analytics)
         </button>
         <button
            onClick={() => setActiveTab("intake")}
            className={cn(
               "py-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
               activeTab === "intake"
                  ? "border-b-indigo-600 text-indigo-600 font-black"
                  : "border-b-transparent text-slate-500 hover:text-slate-800 hover:border-b-slate-200"
            )}
         >
            <ListTodo className="h-4 w-4" />
            Entrada de Vacinação & Campanhas (Campo/US)
         </button>
      </div>

      {/* WORKSPACE 1: D2A ANALYTICS DASHBOARD */}
      {activeTab === "dashboard" && (
         <div className="flex-1 overflow-y-auto px-1 space-y-6">
            
            {/* Disaggregation filters tool */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border rounded-xl p-3 flex flex-wrap gap-4 items-center shrink-0">
               <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-wider">
                  <SlidersHorizontal className="h-4 w-4" />
                  Desagregação
               </div>
               
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Idade:</span>
                  <Select value={selectedAge} onValueChange={setSelectedAge}>
                     <SelectTrigger className="h-8 w-[100px] text-[10px] font-bold bg-background">
                        <SelectValue placeholder="Todos" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="<1y">&lt; 1 Ano</SelectItem>
                        <SelectItem value="1-4y">1 - 4 Anos</SelectItem>
                        <SelectItem value="5-14y">5 - 14 Anos</SelectItem>
                        <SelectItem value="15-49y">15 - 49 Anos</SelectItem>
                        <SelectItem value="50y+">50+ Anos</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Sexo:</span>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                     <SelectTrigger className="h-8 w-[100px] text-[10px] font-bold bg-background">
                        <SelectValue placeholder="Todos" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Male">Masculino</SelectItem>
                        <SelectItem value="Female">Feminino</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Período:</span>
                  <Select value={timeType} onValueChange={(val: any) => {
                     setTimeType(val);
                     setSelectedTimePeriod(val === "month" ? "2026-05" : val === "quarter" ? "2026-Q1" : "2026");
                  }}>
                     <SelectTrigger className="h-8 w-[90px] text-[10px] font-bold bg-background">
                        <SelectValue placeholder="Mês" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="month">Mensal</SelectItem>
                        <SelectItem value="quarter">Trimestral</SelectItem>
                        <SelectItem value="year">Anual</SelectItem>
                     </SelectContent>
                  </Select>

                  <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                     <SelectTrigger className="h-8 w-[100px] text-[10px] font-bold bg-background">
                        <SelectValue placeholder="Escolher" />
                     </SelectTrigger>
                     <SelectContent>
                        {timeType === "month" && (
                           <>
                              <SelectItem value="2026-05">Maio 2026</SelectItem>
                              <SelectItem value="2026-04">Abril 2026</SelectItem>
                              <SelectItem value="2026-03">Março 2026</SelectItem>
                              <SelectItem value="2026-02">Fevereiro 2026</SelectItem>
                              <SelectItem value="2026-01">Janeiro 2026</SelectItem>
                           </>
                        )}
                        {timeType === "quarter" && (
                           <>
                              <SelectItem value="2026-Q1">Q1 2026</SelectItem>
                              <SelectItem value="2026-Q2">Q2 2026</SelectItem>
                           </>
                        )}
                        {timeType === "year" && (
                           <SelectItem value="2026">Ano 2026</SelectItem>
                        )}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            {/* WHO smart KPIs row */}
            <div>
               <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block mb-2">Indicadores D2A de Saúde Pública (Dinâmicos)</span>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {renderSmartKPICard("ANC1")}
                  {renderSmartKPICard("ANC4")}
                  {renderSmartKPICard("SBA")}
                  {renderSmartKPICard("MMR")}
                  {renderSmartKPICard("DTP3")}
                  {renderSmartKPICard("MCV")}
                  {renderSmartKPICard("ART")}
                  {renderSmartKPICard("MALPOS")}
               </div>
            </div>

            {/* Map & Active Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-4 h-full">
                  {renderMozambiqueSVGMap()}
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <Card className={cn(
                     "border shadow-sm flex flex-col justify-between h-full",
                     aiSurveillanceStatus.isOutbreak 
                        ? "border-rose-200 bg-rose-50/10 dark:border-rose-900/50" 
                        : "border-emerald-200 bg-emerald-50/10 dark:border-emerald-900/50"
                  )}>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                           <Bug className="h-4 w-4" /> Vigilância Epidemiológica Activa (IA)
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Monitoria estatística de limite de surtos</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="text-center py-2 relative">
                           <span className={cn(
                              "text-5xl font-black tracking-tighter block",
                              aiSurveillanceStatus.isOutbreak ? "text-rose-600 animate-pulse" : "text-emerald-600"
                           )}>
                              {aiSurveillanceStatus.currentPositivity}%
                           </span>
                           <span className="text-[10px] font-black uppercase text-slate-500 mt-1 block">
                              Positividade Malária Mês Corrente
                           </span>
                        </div>

                        <div className="p-3 rounded-xl text-xs space-y-2 border bg-background/50">
                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                              <span>Média Histórica (6 Meses):</span>
                              <span>{aiSurveillanceStatus.average}%</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                              <span>Limite de Alerta (Média * 1.5):</span>
                              <span>{aiSurveillanceStatus.threshold}%</span>
                           </div>
                           <Progress value={Math.min((aiSurveillanceStatus.currentPositivity / aiSurveillanceStatus.threshold) * 100, 100)} className="h-2 bg-slate-100" />
                        </div>

                        {aiSurveillanceStatus.isOutbreak ? (
                           <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
                              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                              <div>
                                 <p className="font-bold uppercase text-[9px]">Risco Elevado de Surto Epidemiológico</p>
                                 <p className="text-[9px] leading-tight text-rose-700 dark:text-rose-400 mt-0.5">A positividade de malária excede o limite crítico estatístico. Iniciado alerta distrital no SIS-MA.</p>
                              </div>
                           </div>
                        ) : (
                           <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                              <div>
                                 <p className="font-bold uppercase text-[9px]">Vigilância Estável</p>
                                 <p className="text-[9px] leading-tight text-emerald-700 dark:text-emerald-400 mt-0.5">Nenhuma anomalia epidemiológica ou desvio de tendência detectado nos últimos 30 dias.</p>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>

               <div className="lg:col-span-4 h-full">
                  <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                           <ClipboardList className="h-4 w-4" /> Qualidade & Consistência de Dados
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Verificação lógica em tempo real do livro SIS-MA</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-3 text-center text-xs">
                           <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/40">
                              <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Completude</span>
                              <span className="text-xl font-black text-slate-800 dark:text-slate-200">{dataQualityAudit.completeness}%</span>
                           </div>
                           <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/40">
                              <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Tempestividade</span>
                              <span className="text-xl font-black text-slate-800 dark:text-slate-200">{dataQualityAudit.timeliness}%</span>
                           </div>
                        </div>

                        <div className="space-y-2 border-t pt-3">
                           <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Auditoria Lógica:</span>
                           
                           {dataQualityAudit.inconsistencies.length > 0 ? (
                              dataQualityAudit.inconsistencies.map((err, idx) => (
                                 <div key={idx} className="p-2.5 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-bold rounded-lg flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                                    <span>{err}</span>
                                 </div>
                              ))
                           ) : (
                              <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-2">
                                 <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                 <span>Nenhuma inconsistência lógica detectada nos livros CPN e Partos.</span>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>

            {/* Trends and Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-6">
                  <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                           <Baby className="h-4 w-4" /> Funil de Conclusão e Retenção CPN4+
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Retenção longitudinal das gestantes integradas no pré-natal</CardDescription>
                     </CardHeader>
                     <CardContent className="h-[220px] p-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart
                              data={[
                                 { month: 'Jan', CPN1: 180, CPN4: 80 },
                                 { month: 'Fev', CPN1: 190, CPN4: 100 },
                                 { month: 'Mar', CPN1: 200, CPN4: 120 },
                                 { month: 'Abr', CPN1: 175, CPN4: 110 },
                                 { month: 'Mai', CPN1: 210, CPN4: 140 },
                              ]}
                              margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
                           >
                              <defs>
                                 <linearGradient id="colorCpn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis fontSize={10} axisLine={false} tickLine={false} />
                              <Tooltip />
                              <Legend fontSize={9} />
                              <Area type="monotone" dataKey="CPN1" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCpn)" name="1ª Consulta (Inscritas)" />
                              <Area type="monotone" dataKey="CPN4" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCpn)" name="4ª Consulta (Retidas)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </Card>
               </div>

               <div className="lg:col-span-6">
                  <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                           <HeartPulse className="h-4 w-4" /> Evolução da Taxa de Sucesso Terapêutico de TB
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Progresso histórico da cura de Tuberculose no livro</CardDescription>
                     </CardHeader>
                     <CardContent className="h-[220px] p-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart
                              data={[
                                 { month: 'Jan', cura: 78, abandono: 6 },
                                 { month: 'Fev', cura: 80, abandono: 5 },
                                 { month: 'Mar', cura: 82, abandono: 5 },
                                 { month: 'Abr', cura: 85, abandono: 4 },
                                 { month: 'Mai', cura: 88, abandono: 3 },
                              ]}
                              margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
                           >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis fontSize={10} axisLine={false} tickLine={false} />
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

            {/* Tracer logistics stock alerts */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                     <Package className="h-4 w-4" /> Alertas de Ruptura de Tracer Drugs & Reabastecimento CMAM
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Gestão de estoque mínimo de medicamentos essenciais sob regime de alta incidência de malária</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                     <div className="space-y-3">
                        <div className="space-y-1.5">
                           <div className="flex justify-between text-xs font-bold">
                              <span>Arteméter-Lumefantrina (AL) - Kits de Tratamento</span>
                              <span className={cn(
                                 "font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase",
                                 alStockDays <= 5 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                              )}>
                                 {alStockDays} Dias Restantes
                              </span>
                           </div>
                           <Progress value={(alStockDays / 30) * 100} className="h-2.5 bg-slate-100" />
                        </div>

                        <div className="space-y-1.5">
                           <div className="flex justify-between text-xs font-bold">
                              <span>Oxitocina (Parto Seguro)</span>
                              <span className="font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase bg-emerald-100 text-emerald-700">
                                 12 Dias Restantes
                              </span>
                           </div>
                           <Progress value={(12 / 30) * 100} className="h-2.5 bg-slate-100" />
                        </div>
                     </div>

                     <div>
                        {alStockDays <= 5 ? (
                           <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-800 dark:text-amber-300 rounded-xl space-y-3">
                              <div className="flex gap-2 items-start text-xs">
                                 <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                                 <div>
                                    <p className="font-bold uppercase text-[9px]">Ruptura Crítica AL Detectada</p>
                                    <p className="text-[9px] leading-tight text-amber-700 dark:text-amber-400 mt-0.5">O estoque caiu devido à alta incidência. CMAM reabastecimento recomendado.</p>
                                 </div>
                              </div>
                              <Button 
                                 className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase h-9 rounded-lg"
                                 disabled={isReorderingAL}
                                 onClick={() => {
                                    setIsReorderingAL(true);
                                    setTimeout(() => {
                                       setIsReorderingAL(false);
                                       setAlStockDays(30);
                                       toast({
                                          title: "Requisição CMAM Emitida",
                                          description: "Envio de Guia digital nº REQ-4482 ao Depósito Central concluído.",
                                       });
                                    }, 1200);
                                 }}
                              >
                                 {isReorderingAL ? "Gerando Requisição..." : "Solicitar Abastecimento Urgente (CMAM)"}
                              </Button>
                           </div>
                        ) : (
                           <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-3">
                              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                              <div>
                                 <p className="font-bold uppercase text-[9px]">Estoque Geral Equilibrado</p>
                                 <p className="text-[9px] leading-tight text-emerald-700 dark:text-emerald-400 mt-0.5">Todos os medicamentos tracer essenciais operam acima dos limites de segurança epidemiológica.</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>

         </div>
      )}

      {/* WORKSPACE 2: CAMPAIGN & VACCINATION INPUT PORTAL */}
      {activeTab === "intake" && (
         <div className="flex-1 overflow-y-auto px-1 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               
               {/* Left Column: Form & Vaccine Parameters */}
               <div className="lg:col-span-8">
                  <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
                     <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                           <Plus className="h-5 w-5" /> Registo de Imunizações e Campanhas Activas
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Registre novos boletins vacinais e actividades profilácticas em US ou Postos Móveis.</CardDescription>
                     </CardHeader>
                     <CardContent className="pt-6">
                        <form onSubmit={handleIntakeSubmit} className="space-y-6">
                           
                           {/* 1. Toggle facility vs mobile field brigade */}
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase text-slate-500 block">Tipo de Local da Actividade</label>
                              <div className="grid grid-cols-2 gap-4">
                                 <button
                                    type="button"
                                    onClick={() => setIntakeType("facility")}
                                    className={cn(
                                       "p-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
                                       intakeType === "facility"
                                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/20"
                                          : "bg-background border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                 >
                                    🏥 Unidade Sanitária (CS)
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setIntakeType("field")}
                                    className={cn(
                                       "p-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
                                       intakeType === "field"
                                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/20"
                                          : "bg-background border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                 >
                                    🏕️ Brigada Móvel / Campanha (Campo)
                                 </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Location selection */}
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">Província</label>
                                 <Select value={formProvince} onValueChange={setFormProvince}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-background">
                                       <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="gaza">Gaza</SelectItem>
                                       <SelectItem value="tete">Tete</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">Distrito Sanitário</label>
                                 <Select value={formDistrict} onValueChange={setFormDistrict}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-background">
                                       <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {formProvince === "gaza" ? (
                                          <>
                                             <SelectItem value="chibuto">Chibuto</SelectItem>
                                             <SelectItem value="xai-xai">Xai-Xai</SelectItem>
                                          </>
                                       ) : (
                                          <SelectItem value="angonia">Angónia</SelectItem>
                                       )}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>

                           {/* Dynamic input field site or village name based on selection */}
                           <AnimatePresence mode="wait">
                              {intakeType === "field" ? (
                                 <motion.div
                                    key="field-site"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                 >
                                    <label className="text-[10px] font-black uppercase text-slate-500">Nome da Aldeia / Local do Posto Móvel</label>
                                    <div className="relative">
                                       <Compass className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                       <input
                                          type="text"
                                          value={fieldSiteName}
                                          onChange={(e) => setFieldSiteName(e.target.value)}
                                          placeholder="Ex: Aldeia de Chaimite, Posto de Chissano"
                                          className="w-full h-10 pl-9 pr-3 text-xs font-bold border rounded-lg bg-background outline-none focus:border-indigo-500 transition-all"
                                       />
                                    </div>
                                 </motion.div>
                              ) : (
                                 <motion.div
                                    key="facility-site"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                 >
                                    <label className="text-[10px] font-black uppercase text-slate-500">Unidade Sanitária de Referência</label>
                                    <Select value={formFacility} onValueChange={setFormFacility}>
                                       <SelectTrigger className="h-10 text-xs font-bold bg-background">
                                          <SelectValue placeholder="Selecione" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          {formDistrict === "chibuto" ? (
                                             <SelectItem value="chibuto-cs">CS Chibuto</SelectItem>
                                          ) : formDistrict === "xai-xai" ? (
                                             <SelectItem value="xai-xai-cs">CS Xai-Xai</SelectItem>
                                          ) : (
                                             <SelectItem value="chingodzi">CS Chingodzi</SelectItem>
                                          )}
                                       </SelectContent>
                                    </Select>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           {/* Vaccine / Indicator Parameter */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">Antígeno / Acção</label>
                                 <Select value={vaccineType} onValueChange={setVaccineType}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-background">
                                       <SelectValue placeholder="Escolha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="DTP3">Penta 3 (DTP3)</SelectItem>
                                       <SelectItem value="MCV">Sarampo (MCV1)</SelectItem>
                                       <SelectItem value="DTP1">Penta 1 (DTP1)</SelectItem>
                                       <SelectItem value="MALPOS">TDR Malária (Triage)</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">Desagregação Sexo</label>
                                 <Select value={formGender} onValueChange={(val: any) => setFormGender(val)}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-background">
                                       <SelectValue placeholder="Escolha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="Female">Feminino</SelectItem>
                                       <SelectItem value="Male">Masculino</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">Desagregação Idade</label>
                                 <Select value={formAge} onValueChange={(val: any) => setFormAge(val)}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-background">
                                       <SelectValue placeholder="Escolha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="<1y">&lt; 1 Ano</SelectItem>
                                       <SelectItem value="1-4y">1 - 4 Anos</SelectItem>
                                       <SelectItem value="5-14y">5 - 14 Anos</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>

                           {/* Target Numbers (Administered vs Total Population Target) */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">Doses / Casos Administrados (Numerador)</label>
                                 <input
                                    type="number"
                                    value={administeredDoses}
                                    onChange={(e) => setAdministeredDoses(e.target.value)}
                                    placeholder="Ex: 85"
                                    className="w-full h-10 px-3 text-xs font-bold border rounded-lg bg-background outline-none focus:border-indigo-500 transition-all font-mono"
                                 />
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase text-slate-500">População Alvo Registrada (Denominador)</label>
                                 <input
                                    type="number"
                                    value={targetPopulation}
                                    onChange={(e) => setTargetPopulation(e.target.value)}
                                    placeholder="Ex: 100"
                                    className="w-full h-10 px-3 text-xs font-bold border rounded-lg bg-background outline-none focus:border-indigo-500 transition-all font-mono"
                                 />
                              </div>
                           </div>

                           {/* Submit Button */}
                           <div className="pt-2">
                              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-lg uppercase text-xs tracking-wider flex items-center justify-center gap-2">
                                 <Database className="h-4 w-4" />
                                 Salvar Relatório no Cache Local (Buffer)
                              </Button>
                           </div>

                        </form>
                     </CardContent>
                  </Card>
               </div>

               {/* Right Column: Cold Chain Verification & Field Coordinates */}
               <div className="lg:col-span-4 space-y-6">
                  
                  {/* Cold Chain Audits */}
                  <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
                     <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-1.5">
                           <Thermometer className="h-4 w-4" /> Auditoria da Cadeia de Frio
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Monitoria de conservação e refrigeração das vacinas</CardDescription>
                     </CardHeader>
                     <CardContent className="pt-4 space-y-4">
                        
                        <div className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:bg-slate-900/10">
                           <div className="text-xs">
                              <p className="font-bold text-slate-700 dark:text-slate-300">Temperatura Segura (+2°C a +8°C)</p>
                              <p className="text-[9px] text-muted-foreground">Termómetro da geleira verificado</p>
                           </div>
                           <button
                              type="button"
                              onClick={() => setColdChainSafeTemp(prev => !prev)}
                              className={cn(
                                 "px-2.5 py-1 rounded-md text-[9px] font-black uppercase border-none",
                                 coldChainSafeTemp 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : "bg-rose-100 text-rose-700"
                              )}
                           >
                              {coldChainSafeTemp ? "Conforme" : "Crítico"}
                           </button>
                        </div>

                        <div className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:bg-slate-900/10">
                           <div className="text-xs">
                              <p className="font-bold text-slate-700 dark:text-slate-300">Accumuladores de Gelo</p>
                              <p className="text-[9px] text-muted-foreground">Caixas térmicas com gelo adequado</p>
                           </div>
                           <button
                              type="button"
                              onClick={() => setColdChainIcePacks(prev => !prev)}
                              className={cn(
                                 "px-2.5 py-1 rounded-md text-[9px] font-black uppercase border-none",
                                 coldChainIcePacks 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : "bg-rose-100 text-rose-700"
                              )}
                           >
                              {coldChainIcePacks ? "Carregados" : "Em Ruptura"}
                           </button>
                        </div>

                        <div className="space-y-1.5 pt-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 block">Status do VVM (Vial Monitor)</label>
                           <Select value={vvmStatus} onValueChange={(val: any) => setVvmStatus(val)}>
                              <SelectTrigger className="h-9 text-xs font-bold bg-background">
                                 <SelectValue placeholder="VVM Stage" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="stage1">Estágio 1 - Excelente (Usar Vacina)</SelectItem>
                                 <SelectItem value="stage2">Estágio 2 - Conforme (Usar Logo)</SelectItem>
                                 <SelectItem value="stage3">Estágio 3 - Rejeitado (Não Usar!)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        {!coldChainSafeTemp || vvmStatus === "stage3" ? (
                           <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] rounded-xl flex gap-2">
                              <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                 <p className="font-black uppercase">Bloqueio de Vacina Activado</p>
                                 <p className="leading-tight mt-0.5 text-rose-700">A temperatura de conservação excede limites toleráveis ou o Vial Monitor está rejeitado. Não administre as doses!</p>
                              </div>
                           </div>
                        ) : (
                           <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-xl flex gap-2">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                 <p className="font-black uppercase">Garantia de Qualidade Satisfeita</p>
                                 <p className="leading-tight mt-0.5 text-emerald-700">Todos os parâmetros de conservação de frio e imunobiologia estão em estrita conformidade.</p>
                              </div>
                           </div>
                        )}

                     </CardContent>
                  </Card>

                  {/* Mobile Brigade coordinates */}
                  <AnimatePresence mode="wait">
                     {intakeType === "field" && (
                        <motion.div
                           key="coordinates-panel"
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                        >
                           <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
                              <CardHeader className="pb-3 border-b">
                                 <CardTitle className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" /> Brigada Móvel & Coordenadas GPS
                                 </CardTitle>
                                 <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Identificadores de campo para campanhas remotas</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-4 space-y-3.5">
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-500 block">ID da Brigada Móvel</label>
                                    <input
                                       type="text"
                                       value={mobileTeamId}
                                       onChange={(e) => setMobileTeamId(e.target.value)}
                                       className="w-full h-9 px-3 text-xs border rounded-lg bg-background font-mono outline-none"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-500 block">Coordenadas de Cobertura GPS</label>
                                    <input
                                       type="text"
                                       value={gpsCoordinates}
                                       onChange={(e) => setGpsCoordinates(e.target.value)}
                                       className="w-full h-9 px-3 text-xs border rounded-lg bg-background font-mono outline-none"
                                    />
                                 </div>
                              </CardContent>
                           </Card>
                        </motion.div>
                     )}
                  </AnimatePresence>

               </div>

            </div>
         </div>
      )}

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
               Relógio de Auditoria MISAU: 2026-05-20
            </span>
         </div>
         <span className="text-[10px] uppercase font-black text-indigo-600">
            H365 D2A Core v1.6 (WHO-FHIR Compliant)
         </span>
      </div>
    </div>
  );
}
