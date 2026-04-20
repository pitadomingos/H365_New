
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Pill, ClipboardList, AlertTriangle, CheckCircle2, PackageCheck, FileText, RefreshCw, BellDot, Loader2, ListOrdered, Layers } from "lucide-react";
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
import { useLocale } from '@/context/locale-context';
import { getTranslator, defaultLocale } from '@/lib/i18n';

interface Prescription {
  id: string;
  patientName: string;
  medication: string;
  quantity: number;
  doctor: string;
  status: "Waiting" | "Dispensed" | "Partial";
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

const initialPrescriptionsData: Prescription[] = [
  { id: "RX001", patientName: "Alice Wonderland", medication: "Amoxicillin 250mg", quantity: 20, doctor: "Dr. Smith", status: "Waiting" },
  { id: "RX002", patientName: "Bob The Builder", medication: "Paracetamol 500mg", quantity: 30, doctor: "Dr. Jones", status: "Waiting" },
  { id: "RX003", patientName: "Charlie Brown", medication: "Atorvastatin 10mg", quantity: 60, doctor: "Dr. Eve", status: "Dispensed" },
  { id: "RX004", patientName: "Diana Prince", medication: "Lisinopril 5mg", quantity: 30, doctor: "Dr. Smith", status: "Waiting" },
];

const initialStockLevelsData: StockItem[] = [
  { id: "MED001", name: "Amoxicillin 250mg", currentStock: 50, threshold: 100, unit: "capsules" },
  { id: "MED002", name: "Paracetamol 500mg", currentStock: 200, threshold: 150, unit: "tablets" },
  { id: "MED003", name: "Atorvastatin 10mg", currentStock: 150, threshold: 50, unit: "tablets" },
  { id: "MED004", name: "Lisinopril 5mg", currentStock: 25, threshold: 30, unit: "tablets" },
  { id: "MED005", name: "Salbutamol Inhaler", currentStock: 10, threshold: 20, unit: "inhalers" },
];

const initialDailySummaryData = {
  prescriptionsDispensedToday: 1,
  prescriptionsPending: 3,
  lowStockItemsCount: 2,
};

const initialRequisitionLogData: RequisitionLogItem[] = [
    { id: "REQ20240730-001", requestedItemsSummary: "Lisinopril 5mg (35 units)", dateSubmitted: new Date(Date.now() - 86400000 * 2).toISOString(), submittedBy: "Pharmacist Jane", status: "Fulfilled"},
    { id: "REQ20240731-001", requestedItemsSummary: "Salbutamol Inhaler (30 units)", dateSubmitted: new Date(Date.now() - 86400000).toISOString(), submittedBy: "Pharmacist John", status: "Pending"},
];


export default function DrugDispensingPage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
  const [stockLevels, setStockLevels] = useState<StockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [dailySummary, setDailySummary] = useState(initialDailySummaryData);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [requisitionLog, setRequisitionLog] = useState<RequisitionLogItem[]>([]);
  const [isLoadingRequisitionLog, setIsLoadingRequisitionLog] = useState(true);
  
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [isDispensingId, setIsDispensingId] = useState<string | null>(null);
  const [isRequisitioningItemId, setIsRequisitioningItemId] = useState<string | null>(null);
  const [isRequisitioningAll, setIsRequisitioningAll] = useState(false);

  const [clientTime, setClientTime] = useState<Date | null>(null);

  useEffect(() => {
    setClientTime(new Date());
    const timer = setInterval(() => setClientTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = async () => {
    setIsLoadingPrescriptions(true);
    setIsLoadingStock(true);
    setIsLoadingSummary(true);
    setIsLoadingRequisitionLog(true);

    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setPrescriptions(initialPrescriptionsData);
    setIsLoadingPrescriptions(false);

    setStockLevels(initialStockLevelsData);
    setIsLoadingStock(false);
    
    setRequisitionLog(initialRequisitionLogData);
    setIsLoadingRequisitionLog(false);

    const dispensedCount = initialPrescriptionsData.filter(p => p.status === "Dispensed").length;
    const pendingCount = initialPrescriptionsData.filter(p => p.status === "Waiting").length;
    const lowStockCount = initialStockLevelsData.filter(item => item.currentStock < item.threshold).length;
    setDailySummary({
        prescriptionsDispensedToday: dispensedCount,
        prescriptionsPending: pendingCount,
        lowStockItemsCount: lowStockCount
    });
    setIsLoadingSummary(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const isItemPendingRequisition = (itemId: string): boolean => {
    return requisitionLog.some(log => 
      log.status === "Pending" && 
      log.requestedItemsSummary.includes(stockLevels.find(s => s.id === itemId)?.name || '###') 
    );
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    await fetchAllData(); 
    toast({ title: t('pharmacy.toast.dataRefreshed'), description: t('pharmacy.toast.dataRefreshed.desc') });
    setIsRefreshingAll(false);
  };

  const handleDispense = async (prescription: Prescription) => {
    setIsDispensingId(prescription.id);
    const payload = { dispensedQuantity: prescription.quantity, pharmacistId: "pharm001" };
    console.log("Dispensing payload (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPrescriptions(prev =>
      prev.map(p => (p.id === prescription.id ? { ...p, status: "Dispensed" } : p))
    );
    const dispensedItem = stockLevels.find(item => item.name === prescription.medication);
    if (dispensedItem) {
        setStockLevels(prevStock => prevStock.map(item => 
            item.id === dispensedItem.id ? {...item, currentStock: Math.max(0, item.currentStock - prescription.quantity)} : item
        ));
    }
    
    toast({
      title: t('pharmacy.toast.dispensed'),
      description: t('pharmacy.toast.dispensed.desc', {medicationName: prescription.medication, patientName: prescription.patientName }),
    });
    setIsDispensingId(null);
    setDailySummary(prev => ({
        ...prev,
        prescriptionsDispensedToday: prev.prescriptionsDispensedToday + 1,
        prescriptionsPending: prev.prescriptionsPending - 1,
    }));
  };

  const handleRequisitionStock = async (item: StockItem) => {
    if (isItemPendingRequisition(item.id)) {
      toast({ variant: "default", title: t('pharmacy.toast.requisition.alreadyPending'), description: t('pharmacy.toast.requisition.alreadyPending.desc', {itemName: item.name}) });
      return;
    }
    setIsRequisitioningItemId(item.id);
    const requestedQuantity = Math.max(0, item.threshold * 2 - item.currentStock); 
    if (requestedQuantity === 0) {
        toast({variant: "default", title: t('pharmacy.toast.requisition.sufficientStock'), description: t('pharmacy.toast.requisition.sufficientStock.desc', {itemName: item.name})});
        setIsRequisitioningItemId(null);
        return;
    }

    const payload = {
      requestingFacilityId: "HOSPITAL_PHARM_001", 
      items: [{ itemId: item.id, itemName: item.name, requestedQuantity, currentStockAtFacility: item.currentStock }],
      notes: `Low stock for ${item.name}. Requisition from individual item action.`
    };
    console.log("Submitting requisition (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newLogEntry: RequisitionLogItem = {
      id: `REQ${Date.now()}-${item.id.substring(0,3)}`,
      requestedItemsSummary: `${item.name} (${requestedQuantity} ${item.unit})`,
      dateSubmitted: new Date().toISOString(),
      submittedBy: "Current Pharmacist (Mock)",
      status: "Pending"
    };
    setRequisitionLog(prev => [newLogEntry, ...prev]);
    toast({
      variant: "default",
      title: t('pharmacy.toast.requisition.submitted'),
      description: t('pharmacy.toast.requisition.submitted.desc', {itemName: item.name}),
    });
    setIsRequisitioningItemId(null);
  };

  const handleRequisitionAllLowStock = async () => {
    setIsRequisitioningAll(true);
    const itemsToRequisition = stockLevels.filter(item => 
        item.currentStock < item.threshold && 
        !isItemPendingRequisition(item.id) &&
        (item.threshold * 2 - item.currentStock) > 0 
    );

    if (itemsToRequisition.length === 0) {
      toast({ title: t('pharmacy.toast.requisition.bulk.none'), description: t('pharmacy.toast.requisition.bulk.none.desc') });
      setIsRequisitioningAll(false);
      return;
    }

    const requisitionItemsPayload = itemsToRequisition.map(item => ({
      itemId: item.id,
      itemName: item.name,
      requestedQuantity: Math.max(0, item.threshold * 2 - item.currentStock),
      currentStockAtFacility: item.currentStock
    }));

    const payload = {
      requestingFacilityId: "HOSPITAL_PHARM_001",
      items: requisitionItemsPayload,
      notes: `Bulk requisition for all eligible low stock items.`
    };
    console.log("Submitting bulk requisition (mock):", payload);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const summary = itemsToRequisition.length > 1 ? `${itemsToRequisition.length} low stock items` : `${itemsToRequisition[0].name}`;
    const newLogEntry: RequisitionLogItem = {
      id: `REQBULK${Date.now()}`,
      requestedItemsSummary: `Bulk: ${summary} (${itemsToRequisition.map(i => i.name).join(', ')})`,
      dateSubmitted: new Date().toISOString(),
      submittedBy: "Current Pharmacist (Mock)",
      status: "Pending"
    };
    setRequisitionLog(prev => [newLogEntry, ...prev]);

    toast({
      variant: "default",
      title: t('pharmacy.toast.requisition.bulk.submitted'),
      description: t('pharmacy.toast.requisition.bulk.submitted.desc', {count: itemsToRequisition.length.toString()}),
    });
    setIsRequisitioningAll(false);
  };
  
  const eligibleLowStockItemsCount = stockLevels.filter(item => 
    item.currentStock < item.threshold && 
    !isItemPendingRequisition(item.id) &&
    (item.threshold * 2 - item.currentStock) > 0
  ).length;

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Pill className="h-8 w-8" /> {t('pharmacy.pageTitle')}
          </h1>
          <div className="text-sm text-muted-foreground">
            {clientTime ? (
              `${clientTime.toLocaleDateString(currentLocale === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${clientTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ) : (
              t('pharmacy.currentTime.loading')
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" /> {t('pharmacy.prescriptions.title')}
              </CardTitle>
              <CardDescription>{t('pharmacy.prescriptions.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPrescriptions ? (
                 <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">{t('pharmacy.prescriptions.loading')}</p>
                </div>
              ) : prescriptions.filter(p => p.status === "Waiting").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pharmacy.prescriptions.table.patient')}</TableHead>
                      <TableHead>{t('pharmacy.prescriptions.table.medication')}</TableHead>
                      <TableHead>{t('pharmacy.prescriptions.table.qty')}</TableHead>
                      <TableHead>{t('pharmacy.prescriptions.table.doctor')}</TableHead>
                      <TableHead>{t('pharmacy.prescriptions.table.status')}</TableHead>
                      <TableHead className="text-right">{t('pharmacy.prescriptions.table.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.filter(p => p.status === "Waiting").map((rx) => (
                      <TableRow key={rx.id}>
                        <TableCell className="font-medium">{rx.patientName}</TableCell>
                        <TableCell>{rx.medication}</TableCell>
                        <TableCell>{rx.quantity}</TableCell>
                        <TableCell>{rx.doctor}</TableCell>
                        <TableCell>
                          <Badge variant={rx.status === "Dispensed" ? "secondary" : rx.status === "Waiting" ? "default" : "outline"}>
                            {t(`pharmacy.prescriptions.status.${rx.status.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {rx.status === "Waiting" ? (
                            <Button size="sm" onClick={() => handleDispense(rx)} disabled={isDispensingId === rx.id}>
                              {isDispensingId === rx.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PackageCheck className="mr-2 h-4 w-4" />}
                              {isDispensingId === rx.id ? t('pharmacy.prescriptions.actions.dispensing') : t('pharmacy.prescriptions.actions.dispense')}
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> {t('pharmacy.prescriptions.actions.dispensed')}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-center py-10 text-muted-foreground">{t('pharmacy.prescriptions.empty')}</p>
              )}
            </CardContent>
            <CardFooter className="flex-col sm:flex-row items-start sm:items-center gap-2">
                <Button variant="outline" onClick={handleRefreshAll} disabled={isRefreshingAll || isLoadingPrescriptions}>
                    {isRefreshingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                    {isRefreshingAll ? t('pharmacy.refreshButton.loading') : t('pharmacy.refreshButton')}
                </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/> {t('pharmacy.dailyReport.title')}
                </CardTitle>
                 <CardDescription>{t('pharmacy.dailyReport.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                 {isLoadingSummary ? (
                   <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2"/> {t('pharmacy.dailyReport.loading')}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="text-sm font-medium">{t('pharmacy.dailyReport.dispensedToday')}</span>
                        <Badge variant="secondary" className="text-base">{dailySummary.prescriptionsDispensedToday}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="text-sm font-medium">{t('pharmacy.dailyReport.pending')}</span>
                        <Badge className="text-base">{dailySummary.prescriptionsPending}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="text-sm font-medium">{t('pharmacy.dailyReport.lowStock')}</span>
                        <Badge variant={dailySummary.lowStockItemsCount > 0 ? "destructive": "default"} className="text-base">{dailySummary.lowStockItemsCount}</Badge>
                    </div>
                    <Button className="w-full mt-2" variant="outline" disabled>{t('pharmacy.dailyReport.viewFullButton')}</Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-6 w-6 text-primary" /> {t('pharmacy.stock.title')}
                </CardTitle>
                <CardDescription>{t('pharmacy.stock.description')}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto pr-1">
                {isLoadingStock ? (
                   <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2"/> {t('pharmacy.stock.loading')}
                  </div>
                ) : stockLevels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pharmacy.stock.table.medication')}</TableHead>
                      <TableHead>{t('pharmacy.stock.table.stock')}</TableHead>
                      <TableHead className="text-right">{t('pharmacy.stock.table.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLevels.map((item) => {
                      const isLowStock = item.currentStock < item.threshold;
                      const alreadyPending = isItemPendingRequisition(item.id);
                      const canRequisition = isLowStock && !alreadyPending && (item.threshold * 2 - item.currentStock) > 0;

                      return (
                        <TableRow key={item.id} className={isLowStock ? "bg-destructive/10 dark:bg-destructive/20" : ""}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {item.currentStock} <span className="text-xs text-muted-foreground">({item.unit})</span>
                            {isLowStock && <Badge variant="destructive" className="ml-2 text-xs">{t('pharmacy.stock.lowStockBadge')}</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            {isLowStock && (
                              <Button 
                                size="sm" 
                                variant={alreadyPending ? "secondary" : "outline"} 
                                onClick={() => !alreadyPending && handleRequisitionStock(item)} 
                                disabled={isRequisitioningItemId === item.id || isRequisitioningAll || alreadyPending}
                                title={alreadyPending ? t('pharmacy.toast.requisition.alreadyPending.desc', {itemName: item.name}) : t('pharmacy.stock.requisitionButton')}
                              >
                                {isRequisitioningItemId === item.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin"/> : <BellDot className="mr-1 h-3 w-3"/>}
                                {isRequisitioningItemId === item.id ? t('pharmacy.stock.requisitionButton.loading') : (alreadyPending ? t('pharmacy.stock.requisitionButton.pending') : t('pharmacy.stock.requisitionButton'))}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">{t('pharmacy.stock.empty')}</p>
                )}
              </CardContent>
               <CardFooter className="pt-4 flex-col gap-2 items-stretch">
                <Button 
                    onClick={handleRequisitionAllLowStock} 
                    disabled={isLoadingStock || isRequisitioningAll || eligibleLowStockItemsCount === 0}
                    title={eligibleLowStockItemsCount === 0 ? t('pharmacy.toast.requisition.bulk.none.desc') : t('pharmacy.stock.requisitionAllButton', {count: eligibleLowStockItemsCount.toString()}) }
                >
                    {isRequisitioningAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellDot className="mr-2 h-4 w-4" />}
                    {isRequisitioningAll ? t('pharmacy.stock.requisitionAllButton.loading') : t('pharmacy.stock.requisitionAllButton', {count: eligibleLowStockItemsCount.toString()}) }
                </Button>
                 <Alert variant="default" className="border-primary/50 mt-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm">{t('pharmacy.stock.systemNote.title')}</AlertTitle>
                    <AlertDescription className="text-xs">
                        {t('pharmacy.stock.systemNote.description')}
                    </AlertDescription>
                </Alert>
               </CardFooter>
            </Card>
          </div>
        </div>

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListOrdered className="h-6 w-6 text-primary"/> {t('pharmacy.requisitionHistory.title')}
                </CardTitle>
                <CardDescription>{t('pharmacy.requisitionHistory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingRequisitionLog ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2 text-muted-foreground">{t('pharmacy.requisitionHistory.loading')}</p>
                    </div>
                ) : requisitionLog.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('pharmacy.requisitionHistory.table.id')}</TableHead>
                                <TableHead>{t('pharmacy.requisitionHistory.table.items')}</TableHead>
                                <TableHead>{t('pharmacy.requisitionHistory.table.date')}</TableHead>
                                <TableHead>{t('pharmacy.requisitionHistory.table.by')}</TableHead>
                                <TableHead>{t('pharmacy.requisitionHistory.table.status')}</TableHead>
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
                    <p className="text-center py-10 text-muted-foreground">{t('pharmacy.requisitionHistory.empty')}</p>
                )}
            </CardContent>
        </Card>

      </div>
  );
}

    
