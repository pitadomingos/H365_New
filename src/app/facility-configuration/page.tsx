"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LocalDB } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { toast } from "@/hooks/use-toast";
import { Sliders, Building2, Bed, PlusCircle, Trash2, Edit2, Loader2, ShieldAlert, CheckCircle2, Activity, Pill, Globe } from 'lucide-react';

interface PharmacyThreshold {
  id: string;
  itemName: string;
  minStock: number;
  maxStock: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface WardSummary {
  id: string;
  name: string;
}

interface BedData {
  id: string;
  bedNumber: string;
  status: "Available" | "Occupied" | "Cleaning";
  patientName?: string;
  patientId?: string;
}

interface PatientInWard {
  admissionId: string;
  patientId: string;
  name: string;
  bedNumber: string;
  admittedDate: string;
  primaryDiagnosis?: string;
  keyAlerts?: string[];
}

interface WardDetails {
  id: string;
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  patients: PatientInWard[];
  beds: BedData[];
  alerts: {
    criticalLabsPending: number;
    medicationsOverdue: number;
    vitalsChecksDue: number;
    newAdmissionOrders: number;
    pendingDischarges: number;
  };
  departmentCode?: string;
}

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: "DEP001", name: "Medicine", code: "MED" },
  { id: "DEP002", name: "Surgery", code: "SURG" },
  { id: "DEP003", name: "Pediatrics", code: "PED" },
  { id: "DEP004", name: "Obstetrics & Gynecology", code: "OBGYN" },
];

const DEFAULT_WARD_SUMMARIES: WardSummary[] = [
  { id: "W001", name: "General Medicine Ward A" },
  { id: "W002", name: "Surgical Ward B" },
  { id: "W003", name: "Pediatrics Ward C" },
  { id: "W004", name: "Maternity Ward D" },
];

const DEFAULT_WARD_DETAILS: Record<string, WardDetails> = {
  "W001": {
    id: "W001", name: "General Medicine Ward A", totalBeds: 20, occupiedBeds: 2, availableBeds: 18, occupancyRate: 10,
    departmentCode: "MED",
    patients: [
      { admissionId: "ADM001", patientId: "P001", name: "Eva Green", bedNumber: "Bed 3", admittedDate: "2026-01-01", primaryDiagnosis: "Pneumonia", keyAlerts: ["Isolation", "Oxygen PRN"] },
      { admissionId: "ADM002", patientId: "P002", name: "Tom Hanks", bedNumber: "Bed 5", admittedDate: "2026-05-15", primaryDiagnosis: "Heart Failure Exacerbation", keyAlerts: ["Fluid Restriction", "Daily Weight"] },
    ],
    beds: [
      { id: "B001-A", bedNumber: "Bed 1", status: "Available" },
      { id: "B002-A", bedNumber: "Bed 2", status: "Cleaning" },
      { id: "B003-A", bedNumber: "Bed 3", status: "Occupied", patientName: "Eva Green", patientId: "P001" },
      { id: "B004-A", bedNumber: "Bed 4", status: "Available" },
      { id: "B005-A", bedNumber: "Bed 5", status: "Occupied", patientName: "Tom Hanks", patientId: "P002" },
      ...Array.from({ length: 15 }, (_, i) => ({ id: `B${(i + 6).toString().padStart(3, '0')}-A`, bedNumber: `Bed ${i + 6}`, status: "Available" as "Available" }))
    ],
    alerts: { criticalLabsPending: 2, medicationsOverdue: 1, vitalsChecksDue: 3, newAdmissionOrders: 0, pendingDischarges: 1 }
  },
  "W002": {
    id: "W002", name: "Surgical Ward B", totalBeds: 15, occupiedBeds: 1, availableBeds: 14, occupancyRate: 6.7,
    departmentCode: "SURG",
    patients: [
      { admissionId: "ADM003", patientId: "P003", name: "Lucy Liu", bedNumber: "Bed 1", admittedDate: "2025-10-01", primaryDiagnosis: "Post-Appendectomy", keyAlerts: ["NPO", "Pain Control"] },
    ],
    beds: [
      { id: "B001-B", bedNumber: "Bed 1", status: "Occupied", patientName: "Lucy Liu", patientId: "P003" },
      ...Array.from({ length: 14 }, (_, i) => ({ id: `B${(i + 2).toString().padStart(3, '0')}-B`, bedNumber: `Bed ${i + 2}`, status: "Available" as "Available" }))
    ],
    alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 1, newAdmissionOrders: 1, pendingDischarges: 0 }
  },
  "W003": {
    id: "W003", name: "Pediatrics Ward C", totalBeds: 10, occupiedBeds: 0, availableBeds: 10, occupancyRate: 0,
    departmentCode: "PED",
    patients: [],
    beds: Array.from({ length: 10 }, (_, i) => ({ id: `B${(i + 1).toString().padStart(3, '0')}-C`, bedNumber: `Bed ${i + 1}`, status: "Available" as "Available" })),
    alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 0, newAdmissionOrders: 0, pendingDischarges: 0 }
  },
  "W004": {
    id: "W004", name: "Maternity Ward D", totalBeds: 12, occupiedBeds: 0, availableBeds: 12, occupancyRate: 0,
    departmentCode: "OBGYN",
    patients: [],
    beds: Array.from({ length: 12 }, (_, i) => ({ id: `B${(i + 1).toString().padStart(3, '0')}-D`, bedNumber: `Bed ${i + 1}`, status: "Available" as "Available" })),
    alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 0, newAdmissionOrders: 0, pendingDischarges: 0 }
  },
};

export default function FacilityConfigurationPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [wardDetailsMap, setWardDetailsMap] = useState<Record<string, WardDetails>>({});
  const [pharmacyThresholds, setPharmacyThresholds] = useState<PharmacyThreshold[]>([]);

  // View Scope
  const [configLevel, setConfigLevel] = useState<"Facility" | "District" | "Provincial" | "National">("Facility");

  // Dialog State
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isWardDialogOpen, setIsWardDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingWard, setEditingWard] = useState<WardDetails | null>(null);

  // Form inputs
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [wardBedsCount, setWardBedsCount] = useState(10);
  const [wardDeptCode, setWardDeptCode] = useState("");

  useEffect(() => {
    const loadFacilityData = async () => {
      setIsLoading(true);
      try {
        const storedDepts = await LocalDB.get<Department[]>("facility_departments", []);
        const storedWards = await LocalDB.get<WardSummary[]>("facility_wards", []);
        const storedDetails = await LocalDB.get<Record<string, WardDetails>>("ward_details", {});
        const storedThresholds = await LocalDB.get<PharmacyThreshold[]>("pharmacy_thresholds", []);

        setPharmacyThresholds(storedThresholds.length ? storedThresholds : [
          { id: "PT001", itemName: "Amoxicillin 500mg", minStock: 1000, maxStock: 10000 },
          { id: "PT002", itemName: "Paracetamol 500mg", minStock: 2000, maxStock: 20000 },
          { id: "PT003", itemName: "Coartem 20/120mg", minStock: 500, maxStock: 5000 },
        ]);

        if (storedDepts.length === 0) {
          await LocalDB.save("facility_departments", DEFAULT_DEPARTMENTS);
          setDepartments(DEFAULT_DEPARTMENTS);
        } else {
          setDepartments(storedDepts);
        }

        if (storedWards.length === 0) {
          await LocalDB.save("facility_wards", DEFAULT_WARD_SUMMARIES);
          setWards(DEFAULT_WARD_SUMMARIES);
        } else {
          setWards(storedWards);
        }

        if (Object.keys(storedDetails).length === 0) {
          await LocalDB.save("ward_details", DEFAULT_WARD_DETAILS);
          setWardDetailsMap(DEFAULT_WARD_DETAILS);
        } else {
          setWardDetailsMap(storedDetails);
        }
      } catch (err) {
        console.error("Failed to load facility configuration data:", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to load facility configurations." });
      } finally {
        setIsLoading(false);
      }
    };
    loadFacilityData();
  }, []);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const totalWards = wards.length;
    let totalBeds = 0;
    let totalOccupied = 0;

    Object.values(wardDetailsMap).forEach(details => {
      totalBeds += details.totalBeds || 0;
      totalOccupied += details.patients?.length || 0;
    });

    const occupancyRate = totalBeds > 0 ? (totalOccupied / totalBeds) * 100 : 0;

    return { totalDepts, totalWards, totalBeds, totalOccupied, occupancyRate };
  }, [departments, wards, wardDetailsMap]);

  // Dept Operations
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName("");
    setDeptCode("");
    setIsDeptDialogOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setIsDeptDialogOpen(true);
  };

  const handleSaveDept = async () => {
    if (!deptName.trim() || !deptCode.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "All fields are required." });
      return;
    }

    const updatedDepts = [...departments];
    if (editingDept) {
      const idx = updatedDepts.findIndex(d => d.id === editingDept.id);
      if (idx !== -1) {
        updatedDepts[idx] = { ...editingDept, name: deptName, code: deptCode.toUpperCase() };
      }
    } else {
      updatedDepts.push({
        id: `DEP-${Date.now()}`,
        name: deptName,
        code: deptCode.toUpperCase()
      });
    }

    setDepartments(updatedDepts);
    await LocalDB.save("facility_departments", updatedDepts);
    setIsDeptDialogOpen(false);
    toast({ title: t('facilityConfig.toast.saved'), description: "Department saved successfully." });
  };

  const handleDeleteDept = async (id: string) => {
    const codeToDelete = departments.find(d => d.id === id)?.code;
    const activeWards = wards.filter(w => wardDetailsMap[w.id]?.departmentCode === codeToDelete);

    if (activeWards.length > 0) {
      toast({
        variant: "destructive",
        title: "Deletion Prevented",
        description: `This department cannot be deleted because it is linked to active wards: ${activeWards.map(w => w.name).join(', ')}.`
      });
      return;
    }

    const updatedDepts = departments.filter(d => d.id !== id);
    setDepartments(updatedDepts);
    await LocalDB.save("facility_departments", updatedDepts);
    toast({ title: "Department Deleted", description: "Department removed from configuration." });
  };

  // Ward Operations
  const handleOpenAddWard = () => {
    setEditingWard(null);
    setWardName("");
    setWardBedsCount(10);
    setWardDeptCode(departments[0]?.code || "");
    setIsWardDialogOpen(true);
  };

  const handleOpenEditWard = (wardId: string) => {
    const details = wardDetailsMap[wardId];
    if (!details) return;
    setEditingWard(details);
    setWardName(details.name);
    setWardBedsCount(details.totalBeds);
    setWardDeptCode(details.departmentCode || "");
    setIsWardDialogOpen(true);
  };

  const handleSaveWard = async () => {
    if (!wardName.trim() || !wardDeptCode) {
      toast({ variant: "destructive", title: "Validation Error", description: "Ward name and department are required." });
      return;
    }

    const updatedWards = [...wards];
    const updatedDetailsMap = { ...wardDetailsMap };

    if (editingWard) {
      // Validate bed reduction
      const currentOccupied = editingWard.patients?.length || 0;
      if (wardBedsCount < currentOccupied) {
        toast({
          variant: "destructive",
          title: "Invalid Bed Count",
          description: `Cannot reduce total beds to ${wardBedsCount}. There are currently ${currentOccupied} active patients in this ward.`
        });
        return;
      }

      // Rebuild or update beds array
      let beds = [...editingWard.beds];
      const diff = wardBedsCount - beds.length;

      if (diff > 0) {
        // Add new available beds
        for (let i = 0; i < diff; i++) {
          const nextBedNum = beds.length + 1;
          beds.push({
            id: `B${nextBedNum.toString().padStart(3, '0')}-${editingWard.id.replace('W', '')}`,
            bedNumber: `Bed ${nextBedNum}`,
            status: "Available"
          });
        }
      } else if (diff < 0) {
        // Truncate from the end, ensuring we don't drop occupied beds
        const bedsToRemove = Math.abs(diff);
        let removedCount = 0;
        // Search from end to start for available or cleaning beds to drop
        for (let idx = beds.length - 1; idx >= 0 && removedCount < bedsToRemove; idx--) {
          if (beds[idx].status !== "Occupied") {
            beds.splice(idx, 1);
            removedCount++;
          }
        }

        // Adjust bed numbers to be sequential again for non-occupied
        beds = beds.map((b, i) => ({
          ...b,
          bedNumber: b.status === "Occupied" ? b.bedNumber : `Bed ${i + 1}`
        }));
      }

      const updatedDetails: WardDetails = {
        ...editingWard,
        name: wardName,
        totalBeds: wardBedsCount,
        availableBeds: wardBedsCount - currentOccupied,
        occupancyRate: wardBedsCount > 0 ? (currentOccupied / wardBedsCount) * 100 : 0,
        beds,
        departmentCode: wardDeptCode
      };

      updatedDetailsMap[editingWard.id] = updatedDetails;

      const summaryIdx = updatedWards.findIndex(w => w.id === editingWard.id);
      if (summaryIdx !== -1) {
        updatedWards[summaryIdx] = { id: editingWard.id, name: wardName };
      }
    } else {
      // Add New Ward
      const newWardId = `W${(wards.length + 1).toString().padStart(3, '0')}`;
      const beds: BedData[] = Array.from({ length: wardBedsCount }, (_, i) => ({
        id: `B${(i + 1).toString().padStart(3, '0')}-${newWardId.replace('W', '')}`,
        bedNumber: `Bed ${i + 1}`,
        status: "Available"
      }));

      const newWardDetails: WardDetails = {
        id: newWardId,
        name: wardName,
        totalBeds: wardBedsCount,
        occupiedBeds: 0,
        availableBeds: wardBedsCount,
        occupancyRate: 0,
        patients: [],
        beds,
        alerts: { criticalLabsPending: 0, medicationsOverdue: 0, vitalsChecksDue: 0, newAdmissionOrders: 0, pendingDischarges: 0 },
        departmentCode: wardDeptCode
      };

      updatedWards.push({ id: newWardId, name: wardName });
      updatedDetailsMap[newWardId] = newWardDetails;
    }

    setWards(updatedWards);
    setWardDetailsMap(updatedDetailsMap);

    await LocalDB.save("facility_wards", updatedWards);
    await LocalDB.save("ward_details", updatedDetailsMap);
    setIsWardDialogOpen(false);
    toast({ title: t('facilityConfig.toast.saved'), description: "Ward configuration stored successfully." });
  };

  const handleDeleteWard = async (wardId: string) => {
    const details = wardDetailsMap[wardId];
    if (details && details.patients?.length > 0) {
      toast({
        variant: "destructive",
        title: "Deletion Prevented",
        description: "Cannot delete this ward as there are active patients admitted in it."
      });
      return;
    }

    const updatedWards = wards.filter(w => w.id !== wardId);
    const updatedDetailsMap = { ...wardDetailsMap };
    delete updatedDetailsMap[wardId];

    setWards(updatedWards);
    setWardDetailsMap(updatedDetailsMap);

    await LocalDB.save("facility_wards", updatedWards);
    await LocalDB.save("ward_details", updatedDetailsMap);
    toast({ title: "Ward Deleted", description: "Ward removed from configuration." });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading facility configurations...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Premium Gradient Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Sliders className="h-8 w-8" />
              {t('facilityConfig.pageTitle')}
            </h1>
            <p className="text-blue-100 mt-2 max-w-2xl text-sm md:text-base">
              Define the physical and logical blueprint of the health unit. Configure administrative codes, create clinical departments, define ward structures, and scale active bed capacities.
            </p>
          </div>
          <div className="flex items-center gap-4 self-start md:self-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/20">
            <div className="flex items-center gap-2 border-r border-white/20 pr-4">
              <Globe className="h-4 w-4 text-blue-200" />
              <Select value={configLevel} onValueChange={(val: any) => setConfigLevel(val)}>
                <SelectTrigger className="h-8 w-[130px] bg-transparent border-none text-white focus:ring-0 shadow-none">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facility">Facility Level</SelectItem>
                  <SelectItem value="District">District Level</SelectItem>
                  <SelectItem value="Provincial">Provincial Level</SelectItem>
                  <SelectItem value="National">National Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>LAN Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dashboard Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-blue-600 transition-all hover:translate-y-[-2px] hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Departments</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepts}</div>
            <p className="text-xs text-muted-foreground mt-1">Configured specialties & services</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-600 transition-all hover:translate-y-[-2px] hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Wards</CardTitle>
            <Bed className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWards}</div>
            <p className="text-xs text-muted-foreground mt-1">Active patient hosting blocks</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-teal-600 transition-all hover:translate-y-[-2px] hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Configured Beds</CardTitle>
            <Bed className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBeds}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalOccupied} Occupied / {stats.totalBeds - stats.totalOccupied} Available
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-600 transition-all hover:translate-y-[-2px] hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Average Occupancy</CardTitle>
            <Activity className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Active bed usage density</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="wards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="wards" className="flex items-center gap-2">
            <Bed className="h-4 w-4" /> Wards & Beds
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="pharmacy" className="flex items-center gap-2">
            <Pill className="h-4 w-4" /> Stock Thresholds
          </TabsTrigger>
          <TabsTrigger value="d2a" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> D2A & Alertas
          </TabsTrigger>
        </TabsList>

        {/* Wards Content */}
        <TabsContent value="wards" className="space-y-4 focus-visible:ring-0">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('facilityConfig.wardsCard.title')}</CardTitle>
                <CardDescription>{t('facilityConfig.wardsCard.description')}</CardDescription>
              </div>
              <Button onClick={handleOpenAddWard} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow">
                <PlusCircle className="h-4 w-4" /> {t('facilityConfig.addWardButton')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t('facilityConfig.wardName')}</TableHead>
                    <TableHead>{t('facilityConfig.associatedDept')}</TableHead>
                    <TableHead>{t('facilityConfig.totalBeds')}</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Occupancy Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No wards configured. Click Add Ward to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    wards.map(ward => {
                      const details = wardDetailsMap[ward.id];
                      const deptName = departments.find(d => d.code === details?.departmentCode)?.name || details?.departmentCode || 'N/A';
                      const occupied = details?.patients?.length || 0;
                      const occupancy = details?.totalBeds > 0 ? (occupied / details.totalBeds) * 100 : 0;

                      return (
                        <TableRow key={ward.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{ward.id}</TableCell>
                          <TableCell className="font-semibold text-foreground">{ward.name}</TableCell>
                          <TableCell>{deptName}</TableCell>
                          <TableCell>{details?.totalBeds || 0}</TableCell>
                          <TableCell>{occupied}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="w-10 text-xs font-mono">{occupancy.toFixed(0)}%</span>
                              <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-yellow-500' : 'bg-teal-500'}`}
                                  style={{ width: `${Math.min(occupancy, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="outline" size="icon" onClick={() => handleOpenEditWard(ward.id)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDeleteWard(ward.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Content */}
        <TabsContent value="departments" className="space-y-4 focus-visible:ring-0">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('facilityConfig.departmentsCard.title')}</CardTitle>
                <CardDescription>{t('facilityConfig.departmentsCard.description')}</CardDescription>
              </div>
              <Button onClick={handleOpenAddDept} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow">
                <PlusCircle className="h-4 w-4" /> {t('facilityConfig.addDeptButton')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t('facilityConfig.deptName')}</TableHead>
                    <TableHead>{t('facilityConfig.deptCode')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No departments configured. Click Add Department to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map(dept => (
                      <TableRow key={dept.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">{dept.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{dept.name}</TableCell>
                        <TableCell><span className="bg-muted px-2 py-0.5 rounded font-mono text-xs border">{dept.code}</span></TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="outline" size="icon" onClick={() => handleOpenEditDept(dept)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDeleteDept(dept.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacy Thresholds Content */}
        <TabsContent value="pharmacy" className="space-y-4 focus-visible:ring-0">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pharmacy Stock Thresholds</CardTitle>
                <CardDescription>Configure minimum warning limits and maximum stock capacity per item.</CardDescription>
              </div>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow" onClick={() => toast({ title: "Development Mode", description: "This feature is mock-only in the current build." })}>
                <PlusCircle className="h-4 w-4" /> Add Item Threshold
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Medication/Item Name</TableHead>
                    <TableHead>Minimum Stock (Alert)</TableHead>
                    <TableHead>Maximum Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacyThresholds.map(pt => (
                    <TableRow key={pt.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{pt.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{pt.itemName}</TableCell>
                      <TableCell><span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded text-xs font-mono">{pt.minStock} Units</span></TableCell>
                      <TableCell><span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded text-xs font-mono">{pt.maxStock} Units</span></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="outline" size="icon">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* D2A & Alertas Content */}
        <TabsContent value="d2a" className="space-y-4 focus-visible:ring-0">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Indicadores D2A & Alertas</CardTitle>
                <CardDescription>Configure os alvos WHO e limites de alerta para despoletar acções operacionais (Data-to-Action).</CardDescription>
              </div>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow" onClick={() => toast({ title: "Modo Desenvolvimento", description: "Configuração mock para o Protótipo D2A." })}>
                <CheckCircle2 className="h-4 w-4" /> Guardar Alvos
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Alvo WHO</TableHead>
                    <TableHead>Alerta Âmbar</TableHead>
                    <TableHead>Alerta Vermelho</TableHead>
                    <TableHead>Unidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold">ANC4 - Cobertura de CPN 4+</TableCell>
                    <TableCell><Input type="number" defaultValue={90} className="w-20 h-8" /></TableCell>
                    <TableCell><Input type="number" defaultValue={85} className="w-20 h-8 border-amber-500 text-amber-600" /></TableCell>
                    <TableCell><Input type="number" defaultValue={80} className="w-20 h-8 border-red-500 text-red-600" /></TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold">MALPOS - Positividade Malária</TableCell>
                    <TableCell><Input type="number" defaultValue={25} className="w-20 h-8" /></TableCell>
                    <TableCell><Input type="number" defaultValue={35} className="w-20 h-8 border-amber-500 text-amber-600" /></TableCell>
                    <TableCell><Input type="number" defaultValue={45} className="w-20 h-8 border-red-500 text-red-600" /></TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold">DTP3 - Cobertura Vacinal</TableCell>
                    <TableCell><Input type="number" defaultValue={90} className="w-20 h-8" /></TableCell>
                    <TableCell><Input type="number" defaultValue={80} className="w-20 h-8 border-amber-500 text-amber-600" /></TableCell>
                    <TableCell><Input type="number" defaultValue={70} className="w-20 h-8 border-red-500 text-red-600" /></TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DEPARTMENT MODAL */}
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>
              Provide a name and a unique uppercase code to identify the department in the clinical router.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deptName">{t('facilityConfig.deptName')}</Label>
              <Input
                id="deptName"
                placeholder="e.g. Intensive Care Unit"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deptCode">{t('facilityConfig.deptCode')}</Label>
              <Input
                id="deptCode"
                placeholder="e.g. ICU"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveDept}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WARD MODAL */}
      <Dialog open={isWardDialogOpen} onOpenChange={setIsWardDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingWard ? "Configure Ward" : "Create New Ward"}</DialogTitle>
            <DialogDescription>
              Assign the ward to a clinical department and specify target bed capacity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wardName">{t('facilityConfig.wardName')}</Label>
              <Input
                id="wardName"
                placeholder="e.g. High Dependency Unit"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wardDept">{t('facilityConfig.associatedDept')}</Label>
              <Select value={wardDeptCode} onValueChange={setWardDeptCode}>
                <SelectTrigger id="wardDept">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.code}>{d.name} ({d.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wardBeds">{t('facilityConfig.totalBeds')}</Label>
              <Input
                id="wardBeds"
                type="number"
                min="1"
                max="100"
                value={wardBedsCount}
                onChange={(e) => setWardBedsCount(parseInt(e.target.value, 10) || 0)}
              />
              {editingWard && (
                <div className="flex items-center gap-2 text-xs text-amber-600 mt-1">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Currently hosting {editingWard.patients?.length || 0} occupied beds.</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveWard}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
