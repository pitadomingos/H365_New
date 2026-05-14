
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Microscope, ClipboardList, FlaskConical, AlertTriangle as AlertTriangleIcon, CheckCircle2, PlusCircle, Users, RefreshCw, FileText, Edit3, Loader2, ListOrdered, BellDot, Layers, Wrench, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';
import { MOCK_LAB_REQUESTS } from '@/lib/mock-data';

// --- Data Structures ---
interface TestDetail {
  id: string;
  name: string;
  unit: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
  normalRangeDisplay: string; 
  interpretRanges?: { 
    veryLow?: number; 
    low?: number;     
    high?: number;    
    veryHigh?: number;
  };
  isNumeric: boolean;
}

interface ResultInputItem {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  normalRangeDisplay: string;
  interpretation: string;
  isNumeric: boolean;
}

interface LabRequest {
  id: string;
  patientName: string;
  nationalId: string;
  testsRequested: string[]; 
  orderingDoctor: string;
  requestDate: string;
  status: "Sample Pending" | "Sample Collected" | "Processing" | "Pending Approval" | "Results Ready" | "Cancelled";
  results?: ResultInputItem[] | string; 
  technicianId?: string;
  verifiedBy?: string;
}

interface Reagent {
  id: string;
  name: string;
  currentStock: number;
  threshold: number;
  unit: string;
  supplier?: string;
  lastOrdered?: string;
}

interface LabRequisitionLogItem {
  id: string;
  requestedItemsSummary: string;
  dateSubmitted: string;
  submittedBy: string;
  status: "Pending" | "Partially Fulfilled" | "Fulfilled" | "Cancelled";
}

interface LabInstrument {
  id: string;
  assetNumber: string;
  name: string;
}

// --- Mock Data ---
const MOCK_TEST_DEFINITIONS: Record<string, TestDetail> = {
  "glucose_random": { id: "glucose_random", name: "Glucose, Random", unit: "mg/dL", normalRangeMin: 70, normalRangeMax: 140, normalRangeDisplay: "70-140", isNumeric: true, interpretRanges: { low: 70, high: 140, veryHigh: 200 } },
  "hemoglobin": { id: "hemoglobin", name: "Hemoglobin (Hgb)", unit: "g/dL", normalRangeMin: 12, normalRangeMax: 16, normalRangeDisplay: "12-16 (Female), 14-18 (Male)", isNumeric: true, interpretRanges: { veryLow: 7, low: 10, high: 18 } },
  "wbc_count": { id: "wbc_count", name: "White Blood Cell Count (WBC)", unit: "x10^9/L", normalRangeMin: 4.0, normalRangeMax: 11.0, normalRangeDisplay: "4.0-11.0", isNumeric: true, interpretRanges: { low: 3.0, high: 12.0, veryHigh: 20.0 } },
  "platelet_count": {id: "platelet_count", name: "Platelet Count", unit: "x10^9/L", normalRangeMin: 150, normalRangeMax: 450, normalRangeDisplay: "150-450", isNumeric: true, interpretRanges: {low: 100, veryLow: 50, high: 500, veryHigh: 600 } },
  "tsh": { id: "tsh", name: "TSH", unit: "mIU/L", normalRangeMin: 0.4, normalRangeMax: 4.0, normalRangeDisplay: "0.4-4.0", isNumeric: true, interpretRanges: { low: 0.1, high: 5.0, veryHigh: 10.0 } },
  "free_t4": { id: "free_t4", name: "Free T4", unit: "ng/dL", normalRangeMin: 0.8, normalRangeMax: 1.8, normalRangeDisplay: "0.8-1.8", isNumeric: true, interpretRanges: { low: 0.6, high: 2.0 } },
  "creatinine_serum": { id: "creatinine_serum", name: "Creatinine, Serum", unit: "mg/dL", normalRangeMin: 0.6, normalRangeMax: 1.2, normalRangeDisplay: "0.6-1.2", isNumeric: true, interpretRanges: { high: 1.5, veryHigh: 2.5 } },
  "sodium": { id: "sodium", name: "Sodium (Na)", unit: "mEq/L", normalRangeMin: 135, normalRangeMax: 145, normalRangeDisplay: "135-145", isNumeric: true, interpretRanges: {low: 130, veryLow: 125, high: 150, veryHigh: 155}},
  "potassium": { id: "potassium", name: "Potassium (K)", unit: "mEq/L", normalRangeMin: 3.5, normalRangeMax: 5.0, normalRangeDisplay: "3.5-5.0", isNumeric: true, interpretRanges: {low: 3.0, veryLow: 2.5, high: 5.5, veryHigh: 6.0}},
  "cholesterol_total": { id: "cholesterol_total", name: "Cholesterol, Total", unit: "mg/dL", normalRangeMax: 200, normalRangeDisplay: "<200 Desirable", isNumeric: true, interpretRanges: { high: 200, veryHigh: 240 } },
  "hiv_screen": { id: "hiv_screen", name: "HIV 1/2 Antibody/Antigen Screen", unit: "", normalRangeDisplay: "Non-Reactive", isNumeric: false},
  "urinalysis_re": { id: "urinalysis_re", name: "Urinalysis, Routine & Microscopy", unit: "", normalRangeDisplay: "Refer to report", isNumeric: false},
};

const MOCK_LAB_INSTRUMENTS: LabInstrument[] = [
    { id: "LI001", assetNumber: "LAB-CENT-001", name: "Centrifuge Model X" },
    { id: "LI002", assetNumber: "LAB-MICR-005", name: "Microscope Olympus BH2" },
    { id: "LI003", assetNumber: "LAB-HEMA-002", name: "Hematology Analyzer Sysmex-XN" },
    { id: "LI004", assetNumber: "LAB-CHEM-007", name: "Chemistry Analyzer Roche Cobas" },
];

const initialLabRequestsData: LabRequest[] = [
    { id: "LR001", patientName: "Alice Wonderland", nationalId: "NID001", testsRequested: ["hemoglobin", "glucose_random", "urinalysis_re"], orderingDoctor: "Dr. Smith", requestDate: "2024-07-30", status: "Sample Pending" },
    { id: "LR002", patientName: "Bob The Builder", nationalId: "NID002", testsRequested: ["wbc_count", "platelet_count", "creatinine_serum"], orderingDoctor: "Dr. Jones", requestDate: "2024-07-30", status: "Processing" },
    { id: "LR003", patientName: "Charlie Brown", nationalId: "NID003", testsRequested: ["tsh", "free_t4"], orderingDoctor: "Dr. Eve", requestDate: "2024-07-29", status: "Results Ready", results: [{testId: "tsh", testName:"TSH", value: "2.5", unit: "mIU/L", normalRangeDisplay: "0.4-4.0", interpretation: "Normal", isNumeric:true}, {testId: "free_t4", testName:"Free T4", value:"1.2", unit:"ng/dL", normalRangeDisplay: "0.8-1.8", interpretation: "Normal", isNumeric:true}]},
];

const initialReagentsData: Reagent[] = [
    { id: "RG001", name: "Hematology Reagent Pack", currentStock: 50, threshold: 20, unit: "packs" },
    { id: "RG002", name: "Glucose Test Strips", currentStock: 150, threshold: 100, unit: "strips (box of 50)" },
    { id: "RG003", name: "Microscope Slides", currentStock: 80, threshold: 50, unit: "boxes (100/box)" },
    { id: "RG004", name: "Saline Solution", currentStock: 5, threshold: 10, unit: "liters" },
];

const initialLabRequisitionLogData: LabRequisitionLogItem[] = [
    { id: "LREQ20240730-001", requestedItemsSummary: "Saline Solution (15 liters)", dateSubmitted: new Date(Date.now() - 86400000 * 2).toISOString(), submittedBy: "Lab Tech Alice", status: "Fulfilled"},
    { id: "LREQ20240731-001", requestedItemsSummary: "Hematology Reagent Pack (5 packs)", dateSubmitted: new Date(Date.now() - 86400000).toISOString(), submittedBy: "Lab Tech Bob", status: "Pending"},
];


export default function LaboratoryManagementPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [isLoadingLabRequests, setIsLoadingLabRequests] = useState(true);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [isLoadingReagents, setIsLoadingReagents] = useState(true);
  
  const [requisitionLog, setRequisitionLog] = useState<LabRequisitionLogItem[]>([]);
  const [isLoadingRequisitionLog, setIsLoadingRequisitionLog] = useState(true);

  const [selectedRequestForResults, setSelectedRequestForResults] = useState<LabRequest | null>(null);
  const [currentResultInputs, setCurrentResultInputs] = useState<ResultInputItem[]>([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSavingResults, setIsSavingResults] = useState(false);
  
  const [isRequisitioningReagentId, setIsRequisitioningReagentId] = useState<string | null>(null);
  const [isRequisitioningAllReagents, setIsRequisitioningAllReagents] = useState(false);
  const [isRefreshingList, setIsRefreshingList] = useState(false);

  const [clientTime, setClientTime] = useState<Date | null>(null);

  const [isMalfunctionModalOpen, setIsMalfunctionModalOpen] = useState(false);
  const [malfunctionAssetNumber, setMalfunctionAssetNumber] = useState("");
  const [malfunctionInstrumentName, setMalfunctionInstrumentName] = useState("");
  const [malfunctionProblemDescription, setMalfunctionProblemDescription] = useState("");
  const [isSubmittingMalfunction, setIsSubmittingMalfunction] = useState(false);
  const [labInstruments, setLabInstruments] = useState<LabInstrument[]>(MOCK_LAB_INSTRUMENTS); 

  useEffect(() => {
    setClientTime(new Date()); 
    const timerId = setInterval(() => {
      setClientTime(new Date()); 
    }, 60000);
    return () => {
      clearInterval(timerId); 
    };
  }, []); 

  useEffect(() => {
    if (malfunctionAssetNumber) {
      const foundInstrument = labInstruments.find(inst => inst.assetNumber.toLowerCase() === malfunctionAssetNumber.toLowerCase());
      setMalfunctionInstrumentName(foundInstrument ? foundInstrument.name : t('labManagement.equipment.modal.instrumentName.notFound'));
    } else {
      setMalfunctionInstrumentName("");
    }
  }, [malfunctionAssetNumber, labInstruments, t]);


  const fetchAllLabData = async () => {
    setIsLoadingLabRequests(true);
    setIsLoadingReagents(true);
    setIsLoadingRequisitionLog(true);
    
    // Simulate fetching lab requests
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLabRequests(MOCK_LAB_REQUESTS as LabRequest[]);
    setIsLoadingLabRequests(false);

    // Simulate fetching reagents
    await new Promise(resolve => setTimeout(resolve, 500));
    setReagents(initialReagentsData);
    setIsLoadingReagents(false);

    // Simulate fetching requisition log
    await new Promise(resolve => setTimeout(resolve, 300));
    setRequisitionLog(initialLabRequisitionLogData);
    setIsLoadingRequisitionLog(false);
  };

  useEffect(() => {
    fetchAllLabData();
  }, []);
  
  const handleRefreshAll = async () => {
    setIsRefreshingList(true);
    await fetchAllLabData();
    toast({ title: t('labManagement.toast.dataRefreshed'), description: t('labManagement.toast.dataRefreshed.desc') });
    setIsRefreshingList(false);
  };

  const samplesProcessedToday = labRequests.filter(r => r.status === "Results Ready").length;
  const pendingResults = labRequests.filter(r => r.status === "Processing" || r.status === "Sample Collected").length;
  const criticalReagentAlerts = reagents.filter(r => r.currentStock < r.threshold).length;

  const handleUpdateStatus = async (requestId: string, newStatus: LabRequest["status"]) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setLabRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
    toast({ title: t('labManagement.toast.statusUpdated'), description: t('labManagement.toast.statusUpdated.desc', {requestId: requestId, newStatus: newStatus}) });
  };

  const interpretNumericResult = (valueStr: string, testDef: TestDetail): string => {
    if (!testDef.isNumeric || valueStr === "") return t('labManagement.interpretation.na');
    const value = parseFloat(valueStr);
    if (isNaN(value)) return t('labManagement.interpretation.invalid');

    const { normalRangeMin, normalRangeMax, interpretRanges } = testDef;

    if (interpretRanges) {
        if (interpretRanges.veryLow !== undefined && value < interpretRanges.veryLow) return t('labManagement.interpretation.veryLow');
        if (interpretRanges.low !== undefined && value < (interpretRanges.low ?? normalRangeMin ?? -Infinity)) return t('labManagement.interpretation.low');
        if (interpretRanges.veryHigh !== undefined && value > interpretRanges.veryHigh) return t('labManagement.interpretation.veryHigh');
        if (interpretRanges.high !== undefined && value > (interpretRanges.high ?? normalRangeMax ?? Infinity)) return t('labManagement.interpretation.high');
    } else { 
        if (normalRangeMin !== undefined && value < normalRangeMin) return t('labManagement.interpretation.low');
        if (normalRangeMax !== undefined && value > normalRangeMax) return t('labManagement.interpretation.high');
    }
    return t('labManagement.interpretation.normal');
  };

  const handleOpenResultModal = (request: LabRequest) => {
    setSelectedRequestForResults(request);
    const initialInputs: ResultInputItem[] = request.testsRequested.map(testIdOrName => {
      const testDef = MOCK_TEST_DEFINITIONS[testIdOrName] || 
                      Object.values(MOCK_TEST_DEFINITIONS).find(def => def.name === testIdOrName);
      
      let existingResultValue = "";
      let existingInterpretation = t('labManagement.interpretation.na');

      if (Array.isArray(request.results)) {
        const foundResult = request.results.find(r => r.testId === testIdOrName || r.testName === testIdOrName);
        if (foundResult) {
            existingResultValue = foundResult.value;
            existingInterpretation = foundResult.interpretation;
        }
      } else if (typeof request.results === 'string' && !testDef) { 
        existingResultValue = request.results; 
      }

      if (testDef) {
        return {
          testId: testDef.id,
          testName: testDef.name,
          value: existingResultValue,
          unit: testDef.unit,
          normalRangeDisplay: testDef.normalRangeDisplay,
          interpretation: existingResultValue && testDef.isNumeric ? interpretNumericResult(existingResultValue, testDef) : existingInterpretation,
          isNumeric: testDef.isNumeric,
        };
      }
      return {
        testId: testIdOrName,
        testName: testIdOrName, 
        value: existingResultValue,
        unit: "",
        normalRangeDisplay: t('labManagement.interpretation.na'),
        interpretation: t('labManagement.interpretation.na'),
        isNumeric: false, 
      };
    });
    setCurrentResultInputs(initialInputs);
    setIsResultModalOpen(true);
  };
  
  const handleResultInputChange = (index: number, newValue: string) => {
    setCurrentResultInputs(prevInputs => 
      prevInputs.map((input, i) => {
        if (i === index) {
          const testDef = MOCK_TEST_DEFINITIONS[input.testId];
          const interpretation = testDef && testDef.isNumeric 
            ? interpretNumericResult(newValue, testDef) 
            : (input.isNumeric ? t('labManagement.interpretation.na') : t('labManagement.interpretation.seeReport')); 
          return { ...input, value: newValue, interpretation };
        }
        return input;
      })
    );
  };

  const handleSaveResults = async () => {
    if (!selectedRequestForResults) return;
    setIsSavingResults(true);
    const payload = {
        requestId: selectedRequestForResults.id,
        results: currentResultInputs,
        labTechnicianComments: (document.getElementById('labTechComments') as HTMLTextAreaElement)?.value || ""
    };
    console.log("Saving lab results (mock):", payload);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLabRequests(prevReqs => prevReqs.map(req => 
      req.id === selectedRequestForResults.id 
        ? { ...req, results: currentResultInputs, status: "Pending Approval" as LabRequest["status"], technicianId: "TECH-CURRENT" } 
        : req
    ));

    let tempReagents = [...reagents];
    const reagentConsumptionMap: Record<string, { reagentName: string, amount: number }> = {
        "glucose_random": { reagentName: "Glucose Test Strips", amount: 1 },
        "hemoglobin": { reagentName: "Hematology Reagent Pack", amount: 0.1 },
        "wbc_count": { reagentName: "Hematology Reagent Pack", amount: 0.1 },
        "platelet_count": { reagentName: "Hematology Reagent Pack", amount: 0.1 },
    };
    selectedRequestForResults.testsRequested.forEach(testId => {
        const consumption = reagentConsumptionMap[testId];
        if (consumption) {
            const reagentIndex = tempReagents.findIndex(r => r.name === consumption.reagentName);
            if (reagentIndex !== -1) {
                tempReagents[reagentIndex] = {
                    ...tempReagents[reagentIndex],
                    currentStock: Math.max(0, tempReagents[reagentIndex].currentStock - consumption.amount)
                };
            }
        }
    });
    setReagents(tempReagents);
    
    toast({ title: "Results Submitted", description: "Results have been sent for verification by a pathologist." });
    setIsResultModalOpen(false);
    setSelectedRequestForResults(null);
    setCurrentResultInputs([]);
    setIsSavingResults(false);
  };

  const handleApproveResults = async (requestId: string) => {
    setIsSavingResults(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLabRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: "Results Ready", verifiedBy: "PATH-001" } : req));
    toast({ title: "Results Approved", description: `Request ${requestId} has been verified and released to the clinician.` });
    setIsSavingResults(false);
  };
  
  const isReagentPendingRequisition = (reagentId: string): boolean => {
    return requisitionLog.some(log => 
      log.status === "Pending" && 
      log.requestedItemsSummary.includes(reagents.find(r => r.id === reagentId)?.name || '###') 
    );
  };

  const handleRequisitionReagent = async (reagent: Reagent) => {
    if (isReagentPendingRequisition(reagent.id)) {
      toast({ variant: "default", title: t('labManagement.toast.requisition.alreadyPending'), description: t('labManagement.toast.requisition.alreadyPending.desc', {reagentName: reagent.name}) });
      return;
    }
    setIsRequisitioningReagentId(reagent.id);
    const requestedQuantity = Math.max(0, reagent.threshold * 2 - reagent.currentStock);
     if (requestedQuantity === 0) {
        toast({variant: "default", title: t('labManagement.toast.requisition.sufficientStock'), description: t('labManagement.toast.requisition.sufficientStock.desc', {reagentName: reagent.name})});
        setIsRequisitioningReagentId(null);
        return;
    }
    const payload = {
      requestingLabId: "LAB_MAIN_001",
      items: [{ reagentId: reagent.id, reagentName: reagent.name, requestedQuantity, currentStockAtLab: reagent.currentStock }],
      notes: `Low stock for ${reagent.name}. Automatic requisition.`
    };
    console.log("Submitting reagent requisition (mock):", payload);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newLogEntry: LabRequisitionLogItem = {
        id: `LREQ${Date.now()}-${reagent.id.substring(0,3)}`,
        requestedItemsSummary: `${reagent.name} (${requestedQuantity} ${reagent.unit})`,
        dateSubmitted: new Date().toISOString(),
        submittedBy: "Current Lab Tech (Mock)",
        status: "Pending"
    };
    setRequisitionLog(prev => [newLogEntry, ...prev]);
    toast({title: t('labManagement.toast.requisition.submitted'), description: t('labManagement.toast.requisition.submitted.desc', {reagentName: reagent.name})});
    setIsRequisitioningReagentId(null);
  };

  const handleRequisitionAllLowStockReagents = async () => {
    setIsRequisitioningAllReagents(true);
    const reagentsToRequisition = reagents.filter(r => 
        r.currentStock < r.threshold && 
        !isReagentPendingRequisition(r.id) &&
        (r.threshold * 2 - r.currentStock) > 0
    );

    if (reagentsToRequisition.length === 0) {
      toast({ title: t('labManagement.toast.requisition.bulk.none'), description: t('labManagement.toast.requisition.bulk.none.desc') });
      setIsRequisitioningAllReagents(false);
      return;
    }

    const requisitionItemsPayload = reagentsToRequisition.map(r => ({
      reagentId: r.id,
      reagentName: r.name,
      requestedQuantity: Math.max(0, r.threshold * 2 - r.currentStock),
      currentStockAtLab: r.currentStock
    }));

    const payload = {
      requestingLabId: "LAB_MAIN_001",
      items: requisitionItemsPayload,
      notes: `Bulk requisition for all eligible low stock reagents.`
    };
    console.log("Submitting bulk reagent requisition (mock):", payload);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const summary = reagentsToRequisition.length > 1 ? `${reagentsToRequisition.length} low stock reagents` : `${reagentsToRequisition[0].name}`;
    const newLogEntry: LabRequisitionLogItem = {
      id: `LREQBULK${Date.now()}`,
      requestedItemsSummary: `Bulk: ${summary} (${reagentsToRequisition.map(r => r.name).join(', ')})`,
      dateSubmitted: new Date().toISOString(),
      submittedBy: "Current Lab Tech (Mock)",
      status: "Pending"
    };
    setRequisitionLog(prev => [newLogEntry, ...prev]);

    toast({
      variant: "default",
      title: t('labManagement.toast.requisition.bulk.submitted'),
      description: t('labManagement.toast.requisition.bulk.submitted.desc', {count: reagentsToRequisition.length.toString()}),
    });
    setIsRequisitioningAllReagents(false);
  };
  
  const eligibleLowStockReagentsCount = reagents.filter(r => 
    r.currentStock < r.threshold && 
    !isReagentPendingRequisition(r.id) &&
    (r.threshold * 2 - r.currentStock) > 0
  ).length;

  const handleReportLabMalfunctionSubmit = async () => {
    if (!malfunctionAssetNumber.trim() || !malfunctionProblemDescription.trim()) {
      toast({ variant: "destructive", title: t('labManagement.toast.malfunction.missingInfo'), description: t('labManagement.toast.malfunction.missingInfo.desc') });
      return;
    }
    setIsSubmittingMalfunction(true);
    const payload = {
      assetNumber: malfunctionAssetNumber,
      instrumentName: malfunctionInstrumentName,
      problemDescription: malfunctionProblemDescription,
      reportedBy: "Current Lab Tech (Mock)",
      reportDateTime: new Date().toISOString(),
      department: "Laboratory"
    };
    console.log("Submitting Lab Equipment Malfunction Report (Mock):", payload);

    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: t('labManagement.toast.malfunction.reported'), description: t('labManagement.toast.malfunction.reported.desc', {instrumentName: (malfunctionInstrumentName || malfunctionAssetNumber)})});
    setIsMalfunctionModalOpen(false);
    setMalfunctionAssetNumber("");
    setMalfunctionInstrumentName("");
    setMalfunctionProblemDescription("");
    setIsSubmittingMalfunction(false);
  };


  const renderLabRequestsTable = (requests: LabRequest[]) => {
    if (requests.length === 0) {
      return <p className="text-center py-10 text-muted-foreground">{t('labManagement.requests.empty')}</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('labManagement.requests.table.patient')}</TableHead>
            <TableHead>{t('labManagement.requests.table.tests')}</TableHead>
            <TableHead>{t('labManagement.requests.table.doctor')}</TableHead>
            <TableHead>{t('labManagement.requests.table.date')}</TableHead>
            <TableHead>{t('labManagement.requests.table.status')}</TableHead>
            <TableHead className="text-right">{t('labManagement.requests.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">
                {req.patientName} <br/> 
                <span className="text-xs text-muted-foreground">{req.nationalId}</span>
              </TableCell>
              <TableCell className="text-xs">
                {req.testsRequested.map(testId => MOCK_TEST_DEFINITIONS[testId]?.name || testId).join(', ')}
              </TableCell>
              <TableCell>{req.orderingDoctor}</TableCell>
              <TableCell>{new Date(req.requestDate + 'T00:00:00').toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')}</TableCell>
              <TableCell>
                <Select 
                    value={req.status} 
                    onValueChange={(value) => handleUpdateStatus(req.id, value as LabRequest["status"])}
                    disabled={isSavingResults}
                >
                    <SelectTrigger className="h-8 text-xs w-[150px]">
                        <SelectValue placeholder={t('labManagement.requests.status.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sample Pending">{t('labManagement.requests.status.samplePending')}</SelectItem>
                        <SelectItem value="Sample Collected">{t('labManagement.requests.status.sampleCollected')}</SelectItem>
                        <SelectItem value="Processing">{t('labManagement.requests.status.processing')}</SelectItem>
                        <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                        <SelectItem value="Results Ready">{t('labManagement.requests.status.resultsReady')}</SelectItem>
                        <SelectItem value="Cancelled">{t('labManagement.requests.status.cancelled')}</SelectItem>
                    </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                {req.status === "Pending Approval" ? (
                   <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleApproveResults(req.id)} disabled={isSavingResults}>
                     <ShieldCheck className="mr-1 h-3 w-3" /> Verify
                   </Button>
                 ) : (
                   <Button size="sm" variant="outline" onClick={() => handleOpenResultModal(req)} disabled={isSavingResults}>
                     <Edit3 className="mr-1 h-3 w-3" /> {req.status === "Results Ready" ? t('labManagement.requests.actions.viewEditResults') : t('labManagement.requests.actions.enterResults')}
                   </Button>
                 )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Microscope className="h-8 w-8" /> {t('labManagement.pageTitle')}
          </h1>
           <div className="text-sm text-muted-foreground">
            {clientTime ? (
              `${clientTime.toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${clientTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ) : (
              t('labManagement.currentTime.loading')
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" /> {t('labManagement.requests.title')}
              </CardTitle>
              <CardDescription>{t('labManagement.requests.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLabRequests ? (
                 <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">{t('labManagement.requests.loading')}</p>
                  </div>
              ) : (
                <Tabs defaultValue="technician" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="technician">Result Entry (Tech)</TabsTrigger>
                    <TabsTrigger value="pathologist">Review/Approve (Pathologist)</TabsTrigger>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                  </TabsList>
                  <TabsContent value="technician">
                    {renderLabRequestsTable(labRequests.filter(req => req.status === "Sample Collected" || req.status === "Processing" || req.status === "Sample Pending" || req.status === "Results Ready"))}
                  </TabsContent>
                  <TabsContent value="pathologist">
                    {renderLabRequestsTable(labRequests.filter(req => req.status === "Pending Approval" || req.status === "Results Ready"))}
                  </TabsContent>
                  <TabsContent value="all">
                    {renderLabRequestsTable(labRequests)}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" onClick={handleRefreshAll} disabled={isRefreshingList || isLoadingLabRequests || isLoadingReagents || isLoadingRequisitionLog}>
                    {isRefreshingList ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                    {isRefreshingList ? t('labManagement.requests.refreshButton.loading') : t('labManagement.requests.refreshButton')}
                </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/> {t('labManagement.dailyReport.title')}
                </CardTitle>
                 <CardDescription>{t('labManagement.dailyReport.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
               {isLoadingLabRequests || isLoadingReagents ? (
                 <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2"/> {t('labManagement.dailyReport.loading')}
                  </div>
               ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{t('labManagement.dailyReport.samplesProcessed')}</span>
                      <Badge variant="secondary" className="text-base">{samplesProcessedToday}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{t('labManagement.dailyReport.pendingResults')}</span>
                      <Badge className="text-base">{pendingResults}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{t('labManagement.dailyReport.criticalAlerts')}</span>
                      <Badge variant={criticalReagentAlerts > 0 ? "destructive" : "default"} className="text-base">{criticalReagentAlerts}</Badge>
                  </div>
                  <Button className="w-full mt-2" variant="outline" disabled>{t('labManagement.dailyReport.viewFullButton')}</Button>
                </>
               )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-6 w-6 text-primary" /> {t('labManagement.reagents.title')}
                </CardTitle>
                <CardDescription>{t('labManagement.reagents.description')}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto pr-1">
                {isLoadingReagents ? (
                  <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2"/> {t('labManagement.reagents.loading')}
                  </div>
                ) : reagents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('labManagement.reagents.table.name')}</TableHead>
                        <TableHead>{t('labManagement.reagents.table.stock')}</TableHead>
                        <TableHead className="text-right">{t('labManagement.reagents.table.action')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reagents.map((item) => {
                        const isLowStock = item.currentStock < item.threshold;
                        const alreadyPending = isReagentPendingRequisition(item.id);
                        const canRequisition = isLowStock && !alreadyPending && (item.threshold * 2 - item.currentStock) > 0;

                        return (
                          <TableRow key={item.id} className={isLowStock ? "bg-destructive/10 dark:bg-destructive/20" : ""}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              {item.currentStock} <span className="text-xs text-muted-foreground">({item.unit})</span>
                              {isLowStock && <Badge variant="destructive" className="ml-2 text-xs">{t('labManagement.reagents.lowStockBadge')}</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                              {isLowStock && (
                                <Button 
                                  size="sm" 
                                  variant={alreadyPending ? "secondary" : "outline"} 
                                  onClick={() => !alreadyPending && handleRequisitionReagent(item)}
                                  disabled={isRequisitioningReagentId === item.id || isRequisitioningAllReagents || alreadyPending}
                                  title={alreadyPending ? t('labManagement.toast.requisition.alreadyPending.desc', {reagentName: item.name}) : t('labManagement.reagents.requisitionButton')}
                                >
                                  {isRequisitioningReagentId === item.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin"/> : <BellDot className="mr-1 h-3 w-3"/>}
                                  {isRequisitioningReagentId === item.id ? t('labManagement.reagents.requisitionButton.loading') : (alreadyPending ? t('labManagement.reagents.requisitionButton.pending') : t('labManagement.reagents.requisitionButton'))}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                   <p className="text-center py-6 text-muted-foreground">{t('labManagement.reagents.empty')}</p>
                )}
              </CardContent>
               <CardFooter className="pt-4 flex-col gap-2 items-stretch">
                 <Button 
                    onClick={handleRequisitionAllLowStockReagents} 
                    disabled={isLoadingReagents || isRequisitioningAllReagents || eligibleLowStockReagentsCount === 0}
                    title={eligibleLowStockReagentsCount === 0 ? t('labManagement.toast.requisition.bulk.none.desc') : t('labManagement.reagents.requisitionAllButton', {count: eligibleLowStockReagentsCount.toString()})}
                >
                    {isRequisitioningAllReagents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellDot className="mr-2 h-4 w-4" />}
                    {isRequisitioningAllReagents ? t('labManagement.reagents.requisitionAllButton.loading') : t('labManagement.reagents.requisitionAllButton', {count: eligibleLowStockReagentsCount.toString()})}
                </Button>
                 <Alert variant="default" className="border-primary/50 mt-2">
                    <AlertTriangleIcon className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm">{t('labManagement.reagents.systemNote.title')}</AlertTitle>
                    <AlertDescription className="text-xs">
                        {t('labManagement.reagents.systemNote.description')}
                    </AlertDescription>
                </Alert>
               </CardFooter>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary"/> {t('labManagement.equipment.title')}
                    </CardTitle>
                    <CardDescription className="text-xs">{t('labManagement.equipment.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isMalfunctionModalOpen} onOpenChange={(open) => {
                        if (!open) {
                            setMalfunctionAssetNumber("");
                            setMalfunctionInstrumentName("");
                            setMalfunctionProblemDescription("");
                        }
                        setIsMalfunctionModalOpen(open);
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <AlertTriangleIcon className="mr-2 h-4 w-4"/> {t('labManagement.equipment.reportButton')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t('labManagement.equipment.modal.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('labManagement.equipment.modal.description')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <Label htmlFor="malfunctionAssetNumber">{t('labManagement.equipment.modal.assetNumber.label')} <span className="text-destructive">*</span></Label>
                                    <Input id="malfunctionAssetNumber" value={malfunctionAssetNumber} onChange={(e) => setMalfunctionAssetNumber(e.target.value)} placeholder={t('labManagement.equipment.modal.assetNumber.placeholder')} disabled={isSubmittingMalfunction}/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="malfunctionInstrumentName">{t('labManagement.equipment.modal.instrumentName.label')}</Label>
                                    <Input id="malfunctionInstrumentName" value={malfunctionInstrumentName} readOnly disabled placeholder={t('labManagement.equipment.modal.instrumentName.placeholder')}/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="malfunctionProblemDescription">{t('labManagement.equipment.modal.problem.label')} <span className="text-destructive">*</span></Label>
                                    <Textarea id="malfunctionProblemDescription" value={malfunctionProblemDescription} onChange={(e) => setMalfunctionProblemDescription(e.target.value)} placeholder={t('labManagement.equipment.modal.problem.placeholder')} rows={3} disabled={isSubmittingMalfunction}/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingMalfunction}>{t('labManagement.equipment.modal.cancelButton')}</Button></DialogClose>
                                <Button onClick={handleReportLabMalfunctionSubmit} disabled={isSubmittingMalfunction || !malfunctionAssetNumber.trim() || !malfunctionProblemDescription.trim()}>
                                    {isSubmittingMalfunction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    {isSubmittingMalfunction ? t('labManagement.equipment.modal.submitButton.loading') : t('labManagement.equipment.modal.submitButton')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

          </div>
        </div>
        
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListOrdered className="h-6 w-6 text-primary"/> {t('labManagement.requisitionHistory.title')}
                </CardTitle>
                <CardDescription>{t('labManagement.requisitionHistory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingRequisitionLog ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2 text-muted-foreground">{t('labManagement.requisitionHistory.loading')}</p>
                    </div>
                ) : requisitionLog.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('labManagement.requisitionHistory.table.id')}</TableHead>
                                <TableHead>{t('labManagement.requisitionHistory.table.items')}</TableHead>
                                <TableHead>{t('labManagement.requisitionHistory.table.date')}</TableHead>
                                <TableHead>{t('labManagement.requisitionHistory.table.by')}</TableHead>
                                <TableHead>{t('labManagement.requisitionHistory.table.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requisitionLog.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">{log.id}</TableCell>
                                    <TableCell className="text-xs">{log.requestedItemsSummary}</TableCell>
                                    <TableCell className="text-xs">{new Date(log.dateSubmitted).toLocaleString(currentLocale === 'pt' ? 'pt-BR' : 'en-US')}</TableCell>
                                    <TableCell className="text-xs">{log.submittedBy}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            log.status === "Fulfilled" ? "default" :
                                            log.status === "Pending" ? "secondary" :
                                            log.status === "Cancelled" ? "destructive" : "outline"
                                        } className="text-xs">
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center py-10 text-muted-foreground">{t('labManagement.requisitionHistory.empty')}</p>
                )}
            </CardContent>
        </Card>

        <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
            <DialogContent className="sm:max-w-2xl"> 
                <DialogHeader>
                    <DialogTitle>{t('labManagement.resultsModal.title', {patientName: selectedRequestForResults?.patientName || ""})}</DialogTitle>
                    <DialogDescription>
                        {t('labManagement.resultsModal.description', {requestId: selectedRequestForResults?.id || "", tests: selectedRequestForResults?.testsRequested.map(testId => MOCK_TEST_DEFINITIONS[testId]?.name || testId).join(", ") || ""})}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {currentResultInputs.map((inputItem, index) => (
                        <div key={inputItem.testId || index} className="p-3 border rounded-md space-y-2 bg-muted/20">
                            <Label htmlFor={`result-${inputItem.testId}`} className="font-semibold">{inputItem.testName}</Label>
                            {inputItem.isNumeric ? (
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                                    <Input
                                        id={`result-${inputItem.testId}`}
                                        type="number"
                                        step="any"
                                        value={inputItem.value}
                                        onChange={(e) => handleResultInputChange(index, e.target.value)}
                                        placeholder={t('labManagement.resultsModal.value.placeholder')}
                                        className="sm:col-span-1"
                                        disabled={isSavingResults}
                                    />
                                    <span className="text-xs text-muted-foreground sm:col-span-1">{inputItem.unit}</span>
                                    <span className="text-xs text-muted-foreground sm:col-span-1">
                                        {t('labManagement.resultsModal.range.label')} {inputItem.normalRangeDisplay}
                                    </span>
                                     <Badge 
                                        variant={
                                            inputItem.interpretation === t('labManagement.interpretation.normal') ? "default" : 
                                            inputItem.interpretation === t('labManagement.interpretation.na') || inputItem.interpretation === t('labManagement.interpretation.invalid') ? "outline" :
                                            "secondary" 
                                        }
                                        className={cn("text-xs sm:col-span-1 justify-center", {
                                            "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300": inputItem.interpretation === t('labManagement.interpretation.normal'),
                                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300": inputItem.interpretation === t('labManagement.interpretation.low') || inputItem.interpretation === t('labManagement.interpretation.high'),
                                            "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300": inputItem.interpretation === t('labManagement.interpretation.veryLow') || inputItem.interpretation === t('labManagement.interpretation.veryHigh'),
                                        })}
                                    >
                                        {inputItem.interpretation}
                                    </Badge>
                                </div>
                            ) : (
                                <Textarea
                                    id={`result-${inputItem.testId}`}
                                    value={inputItem.value}
                                    onChange={(e) => handleResultInputChange(index, e.target.value)}
                                    placeholder={t('labManagement.resultsModal.qualitative.placeholder')}
                                    className="min-h-[60px]"
                                    disabled={isSavingResults}
                                />
                            )}
                        </div>
                    ))}
                    <Separator className="my-3"/>
                    <div className="space-y-2">
                        <Label htmlFor="labTechComments">{t('labManagement.resultsModal.comments.label')}</Label>
                        <Textarea
                        id="labTechComments"
                        placeholder={t('labManagement.resultsModal.comments.placeholder')}
                        className="min-h-[80px]"
                        disabled={isSavingResults}
                        />
                    </div>
                </div>
                <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isSavingResults}>{t('labManagement.resultsModal.cancelButton')}</Button></DialogClose>
                <Button type="button" onClick={handleSaveResults} disabled={isSavingResults || currentResultInputs.some(input => input.value.trim() === '')}>
                    {isSavingResults ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSavingResults ? t('labManagement.resultsModal.saveButton.loading') : t('labManagement.resultsModal.saveButton')}
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
  );
}

    
