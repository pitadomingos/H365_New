"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Pill, Search, Loader2, CheckCircle2, AlertTriangle, RefreshCw, Layers, ListOrdered, ClipboardList, PackageCheck, Send, ShoppingBag } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocalDB } from '@/lib/db';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface PrescriptionItem {
  id?: string;
  drugName?: string;
  name?: string;
  strength?: string;
  form?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctor?: string;
  orderingDoctor?: string;
  date?: string;
  consultationDate?: string;
  items?: PrescriptionItem[];
  structuredPrescription?: PrescriptionItem[];
  status: "Waiting" | "Dispensed" | "Cancelled";
}

interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  threshold: number;
  unit: string;
}

interface RequisitionLogItem {
  id: string;
  requestedItemsSummary: string;
  dateSubmitted: string;
  submittedBy: string;
  status: "Pending" | "Partially Fulfilled" | "Fulfilled" | "Cancelled";
}

const DEFAULT_DRUG_STOCK: StockItem[] = [
  { id: "MED001", name: "Amoxicillin", currentStock: 250, threshold: 100, unit: "capsules" },
  { id: "MED002", name: "Paracetamol", currentStock: 500, threshold: 150, unit: "tablets" },
  { id: "MED003", name: "Artemether/Lumefantrine", currentStock: 120, threshold: 50, unit: "tablets" },
  { id: "MED004", name: "Ciprofloxacin", currentStock: 80, threshold: 60, unit: "tablets" },
  { id: "MED005", name: "Metformin", currentStock: 300, threshold: 80, unit: "tablets" },
  { id: "MED006", name: "Lisinopril", currentStock: 45, threshold: 50, unit: "tablets" },
];

export default function PharmacyPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [stockLevels, setStockLevels] = useState<StockItem[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false);
  const [isSubmittingDispense, setIsSubmittingDispense] = useState(false);
  const [verifiedPatientId, setVerifiedPatientId] = useState("");
  const [isCancellingRx, setIsCancellingRx] = useState<string | null>(null);
  
  const [isRequisitioning, setIsRequisitioning] = useState<string | null>(null);
  const [isBulkRequisitioning, setIsBulkRequisitioning] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    // Fetch prescriptions (either written by doctors or fall back to default mock list)
    const localRx = await LocalDB.get<Prescription[]>("pharmacy_prescriptions", []);
    
    // Add default initial prescriptions if empty
    if (localRx.length === 0) {
      const defaultRx: Prescription[] = [
        {
          id: "RX-9901",
          patientId: "NID001",
          patientName: "Josefa Lobo",
          doctor: "Dr. Mutale",
          date: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { id: "1", drugName: "Amoxicillin", strength: "500mg", form: "Capsule", dosage: "1x3", frequency: "Daily", duration: "7 days", quantity: 21 }
          ],
          status: "Waiting"
        },
        {
          id: "RX-9902",
          patientId: "NID002",
          patientName: "Liam Antonio",
          doctor: "Dr. Santos",
          date: new Date(Date.now() - 7200000).toISOString(),
          items: [
            { id: "2", drugName: "Paracetamol", strength: "500mg", form: "Tablet", dosage: "1x2", frequency: "As needed", duration: "3 days", quantity: 6 }
          ],
          status: "Waiting"
        }
      ];
      await LocalDB.save("pharmacy_prescriptions", defaultRx);
      setPrescriptions(defaultRx);
    } else {
      setPrescriptions(localRx);
    }

    // Fetch stock
    const localStock = await LocalDB.get<StockItem[]>("pharmacy_stock", []);
    if (localStock.length === 0) {
      await LocalDB.save("pharmacy_stock", DEFAULT_DRUG_STOCK);
      setStockLevels(DEFAULT_DRUG_STOCK);
    } else {
      setStockLevels(localStock);
    }

    // Fetch requisitions
    const localReqs = await LocalDB.get<RequisitionLogItem[]>("pharmacy_requisitions", []);
    setRequisitions(localReqs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispenseClick = (rx: Prescription) => {
    setSelectedRx(rx);
    setVerifiedPatientId("");
    setIsDispenseDialogOpen(true);
  };

  const confirmDispense = async () => {
    if (!selectedRx) return;
    setIsSubmittingDispense(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Deduct stock levels for each drug in the prescription
    const currentStock = await LocalDB.get<StockItem[]>("pharmacy_stock", DEFAULT_DRUG_STOCK);
    const rxItems = selectedRx.items || selectedRx.structuredPrescription || [];

    const updatedStock = currentStock.map(stockItem => {
      const matchedPrescribedItem = rxItems.find(item => {
        const itemDrugName = (item.drugName || item.name || "").toLowerCase();
        return stockItem.name.toLowerCase().includes(itemDrugName) || itemDrugName.includes(stockItem.name.toLowerCase());
      });

      if (matchedPrescribedItem) {
        // Estimate quantity if not specified (e.g. default to 10 tablets)
        const qtyToDeduct = matchedPrescribedItem.quantity || 10;
        return {
          ...stockItem,
          currentStock: Math.max(0, stockItem.currentStock - qtyToDeduct)
        };
      }
      return stockItem;
    });

    await LocalDB.save("pharmacy_stock", updatedStock);
    setStockLevels(updatedStock);

    // Update prescription status
    const allRx = await LocalDB.get<Prescription[]>("pharmacy_prescriptions", []);
    const updatedRx = allRx.map(rx => rx.id === selectedRx.id ? { ...rx, status: "Dispensed" as const } : rx);
    await LocalDB.save("pharmacy_prescriptions", updatedRx);
    setPrescriptions(updatedRx);

    // Write system activity log entry
    const currentActivity = await LocalDB.get<any[]>("system_activity_logs", []);
    const newLog = {
      id: `ACT-${Date.now()}`,
      action: "Dispensed Prescription",
      details: `Prescription ${selectedRx.id} for patient ${selectedRx.patientName} was dispensed.`,
      user: "Current Pharmacist",
      timestamp: new Date().toISOString()
    };
    await LocalDB.save("system_activity_logs", [newLog, ...currentActivity]);

    toast({
      title: "Prescription Dispensed",
      description: `Successfully dispensed drugs for ${selectedRx.patientName}.`
    });

    setIsDispenseDialogOpen(false);
    setSelectedRx(null);
    setVerifiedPatientId("");
    setIsSubmittingDispense(false);
  };

  const handleCancelRx = async (rxId: string) => {
    setIsCancellingRx(rxId);
    await new Promise(resolve => setTimeout(resolve, 600));
    const allRx = await LocalDB.get<Prescription[]>("pharmacy_prescriptions", []);
    const updated = allRx.map(rx => rx.id === rxId ? { ...rx, status: "Cancelled" as const } : rx);
    await LocalDB.save("pharmacy_prescriptions", updated);
    setPrescriptions(updated);
    toast({ title: "Prescription Cancelled", description: `Rx ${rxId} has been voided.` });
    setIsCancellingRx(null);
  };

  const handleRequisitionSingle = async (item: StockItem) => {
    setIsRequisitioning(item.id);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const qty = Math.max(0, item.threshold * 2 - item.currentStock);
    const newReq: RequisitionLogItem = {
      id: `REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      requestedItemsSummary: `${item.name} (${qty} ${item.unit})`,
      dateSubmitted: new Date().toISOString(),
      submittedBy: "Head Pharmacist",
      status: "Pending"
    };

    const currentReqs = await LocalDB.get<RequisitionLogItem[]>("pharmacy_requisitions", []);
    const updatedReqs = [newReq, ...currentReqs];
    await LocalDB.save("pharmacy_requisitions", updatedReqs);
    setRequisitions(updatedReqs);

    toast({
      title: "Requisition Submitted",
      description: `Requisition for ${item.name} has been logged.`
    });
    setIsRequisitioning(null);
  };

  const handleBulkRequisition = async () => {
    setIsBulkRequisitioning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowStockItems = stockLevels.filter(item => item.currentStock < item.threshold);
    if (lowStockItems.length === 0) {
      toast({
        title: "No Action Needed",
        description: "All stock levels are above threshold limits."
      });
      setIsBulkRequisitioning(false);
      return;
    }

    const itemsSummary = lowStockItems.map(item => `${item.name} (${Math.max(0, item.threshold * 2 - item.currentStock)} ${item.unit})`).join(", ");
    const newReq: RequisitionLogItem = {
      id: `REQ-BULK-${Date.now()}`,
      requestedItemsSummary: itemsSummary,
      dateSubmitted: new Date().toISOString(),
      submittedBy: "Head Pharmacist",
      status: "Pending"
    };

    const currentReqs = await LocalDB.get<RequisitionLogItem[]>("pharmacy_requisitions", []);
    const updatedReqs = [newReq, ...currentReqs];
    await LocalDB.save("pharmacy_requisitions", updatedReqs);
    setRequisitions(updatedReqs);

    toast({
      title: "Bulk Requisition Logged",
      description: `Logged order for ${lowStockItems.length} low stock medicines.`
    });
    setIsBulkRequisitioning(false);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const query = searchQuery.toLowerCase();
    return p.patientName.toLowerCase().includes(query) || 
           p.patientId.toLowerCase().includes(query) || 
           p.id.toLowerCase().includes(query);
  });

  const waitingRx = filteredPrescriptions.filter(p => p.status === "Waiting");
  const dispensedRx = filteredPrescriptions.filter(p => p.status === "Dispensed");
  
  const lowStockCount = stockLevels.filter(item => item.currentStock < item.threshold).length;

  // Chart data: frequency of dispensed medications
  const chartData = stockLevels.map(item => ({
    name: item.name,
    stock: item.currentStock,
    threshold: item.threshold
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Pill className="h-8 w-8 text-indigo-600" /> Pharmacy Operations Console
          </h1>
          <p className="text-muted-foreground text-sm pl-1">
            Dispense digital prescriptions and monitor hospital pharmacy drug supplies.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Reload Data
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending Dispensation</p>
                <h3 className="text-3xl font-black text-indigo-700 dark:text-indigo-400 mt-1">{prescriptions.filter(p => p.status === "Waiting").length}</h3>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-300">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Dispensed Today</p>
                <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{prescriptions.filter(p => p.status === "Dispensed").length}</h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50" : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-100"}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Warnings</p>
                <h3 className={`text-3xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-400'}`}>{lowStockCount}</h3>
              </div>
              <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dispensing Queue panel */}
        <Card className="lg:col-span-2 shadow-sm border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-indigo-600" /> Prescriptions Queue
            </CardTitle>
            <CardDescription>Select waiting patient to verify and dispense medication.</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, ID, or prescription no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-muted-foreground">Loading queue...</span>
              </div>
            ) : waitingRx.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rx ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Prescribing Doctor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingRx.map((rx) => {
                    const items = rx.items || rx.structuredPrescription || [];
                    return (
                      <TableRow key={rx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <TableCell className="font-mono text-xs font-bold text-slate-500">{rx.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold">{rx.patientName}</div>
                          <div className="text-xs text-muted-foreground">ID: {rx.patientId}</div>
                        </TableCell>
                        <TableCell>{rx.doctor || rx.orderingDoctor || "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {items.map((it, idx) => (
                            <Badge key={idx} variant="outline" className="mr-1 mb-1">
                              {it.drugName || it.name}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" onClick={() => handleDispenseClick(rx)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Verify & Dispense
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleCancelRx(rx.id)} disabled={isCancellingRx === rx.id}>
                            {isCancellingRx === rx.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground border rounded-xl border-dashed">
                <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                No pending prescriptions found.
              </div>
            )}

            {dispensedRx.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-3 text-slate-500">Recently Dispensed</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication Summary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispensedRx.map((rx) => {
                      const items = rx.items || rx.structuredPrescription || [];
                      return (
                        <TableRow key={rx.id} className="opacity-70">
                          <TableCell className="py-2">
                            <span className="font-medium text-sm">{rx.patientName}</span>
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            {items.map(it => `${it.drugName || it.name} ${it.strength || ''}`).join(', ')}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                              Dispensed
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock management panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" /> Current Drug Stock
              </CardTitle>
              <CardDescription>Monitor stock status and trigger replenishments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {stockLevels.map((item) => {
                const isLow = item.currentStock < item.threshold;
                return (
                  <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border text-sm ${isLow ? 'bg-amber-500/5 border-amber-200' : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800'}`}>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.currentStock} {item.unit}</p>
                    </div>
                    <div>
                      {isLow ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleRequisitionSingle(item)}
                          disabled={isRequisitioning === item.id || isBulkRequisitioning}
                          className="text-xs border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50"
                        >
                          {isRequisitioning === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reorder"}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10 dark:text-emerald-400">Healthy</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleBulkRequisition} 
                disabled={isBulkRequisitioning || lowStockCount === 0} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {isBulkRequisitioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                Reorder All Low Stock ({lowStockCount})
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-sm border-slate-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-indigo-600" /> Recent Requisitions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[200px] overflow-y-auto">
              {requisitions.length > 0 ? (
                requisitions.map((req) => (
                  <div key={req.id} className="text-xs p-2 border rounded bg-slate-50/30 dark:bg-slate-900/5 space-y-1">
                    <div className="flex justify-between font-mono font-bold text-slate-500">
                      <span>{req.id}</span>
                      <Badge variant="outline" className="h-4 py-0 text-[10px]">{req.status}</Badge>
                    </div>
                    <p className="text-muted-foreground truncate">{req.requestedItemsSummary}</p>
                    <p className="text-[10px] text-muted-foreground/60">{new Date(req.dateSubmitted).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No requisitions logged.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recharts Stock Capacity Bar Chart */}
      <Card className="shadow-sm border-slate-100 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Drug Inventory Capacity</CardTitle>
          <CardDescription>Comparison of current stock levels vs safety threshold limits.</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" fontSize={11} stroke="rgba(150, 150, 150, 0.8)" />
              <YAxis fontSize={11} stroke="rgba(150, 150, 150, 0.8)" />
              <Tooltip cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
              <Bar dataKey="stock" name="Current Stock" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.stock < entry.threshold ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                ))}
              </Bar>
              <Bar dataKey="threshold" name="Min Threshold" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dispense verification dialog */}
      <Dialog open={isDispenseDialogOpen} onOpenChange={setIsDispenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Prescription Items</DialogTitle>
            <DialogDescription>
              Double check the dosage and drug matches prior to dispensing.
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm space-y-1">
                <p><strong>Patient:</strong> {selectedRx.patientName}</p>
                <p><strong>National ID:</strong> {selectedRx.patientId}</p>
                <p><strong>Doctor:</strong> {selectedRx.doctor || selectedRx.orderingDoctor || "N/A"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patient ID Verification</p>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Enter patient&apos;s National ID to confirm identity before dispensing.</p>
                    <Input
                      placeholder={`Expected: ${selectedRx?.patientId}`}
                      value={verifiedPatientId}
                      onChange={e => setVerifiedPatientId(e.target.value)}
                      className={`text-sm h-8 ${verifiedPatientId === selectedRx?.patientId ? 'border-emerald-400 focus-visible:ring-emerald-400' : ''}`}
                    />
                  </div>
                  {verifiedPatientId === selectedRx?.patientId && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prescribed Items</p>
                {(selectedRx.items || selectedRx.structuredPrescription || []).map((item, idx) => {
                  const drugStock = stockLevels.find(s => s.name.toLowerCase().includes((item.drugName || item.name || "").toLowerCase()));
                  const stockAlert = drugStock && drugStock.currentStock < (item.quantity || 10);
                  
                  return (
                    <div key={idx} className="p-3 border rounded-lg flex justify-between items-center text-sm bg-white dark:bg-transparent">
                      <div>
                        <p className="font-semibold">{item.drugName || item.name} <span className="text-xs text-muted-foreground">{item.strength} {item.form}</span></p>
                        <p className="text-xs text-muted-foreground">{item.dosage} | {item.frequency} | {item.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity || 10}</p>
                        {stockAlert ? (
                          <span className="text-[10px] text-red-500 font-bold">Low Stock Warning</span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold">In Stock</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsDispenseDialogOpen(false)} disabled={isSubmittingDispense}>Cancel</Button>
            <Button
              onClick={confirmDispense}
              disabled={isSubmittingDispense || verifiedPatientId !== selectedRx?.patientId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmittingDispense ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {verifiedPatientId !== selectedRx?.patientId ? 'Confirm Patient ID First' : 'Dispense & Deduct Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
