"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Droplets, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  ArrowUpRight, 
  Clock, 
  Activity,
  Heart,
  ExternalLink,
  ShieldAlert,
  BrainCircuit
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { getTranslator } from '@/lib/i18n';
import { useLocale } from "@/context/locale-context";
import { toast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- Types ---
interface BloodUnit {
  id: string;
  bloodType: string;
  volume: number; // in ml
  collectedDate: string;
  expiryDate: string;
  status: 'Available' | 'Reserved' | 'In Cross-match' | 'Expiring Soon' | 'Transfused';
  donorName: string;
  donorId: string;
}

interface TransfusionRequest {
  id: string;
  patientName: string;
  patientId: string;
  bloodType: string;
  unitsRequested: number;
  priority: 'Urgent' | 'Routine' | 'Emergency';
  reason: string;
  status: 'Pending' | 'Cross-matched' | 'Dispensable' | 'Completed' | 'Rejected';
  requestTime: string;
}

// --- Mock Data ---
const MOCK_INVENTORY: BloodUnit[] = [
  { id: "BU-001", bloodType: "A+", volume: 450, collectedDate: "2024-05-01", expiryDate: "2024-06-12", status: 'Available', donorName: "John Doe", donorId: "P-1290" },
  { id: "BU-002", bloodType: "O-", volume: 450, collectedDate: "2024-04-28", expiryDate: "2024-05-15", status: 'Expiring Soon', donorName: "Jane Smith", donorId: "P-1291" },
  { id: "BU-003", bloodType: "B+", volume: 400, collectedDate: "2024-05-02", expiryDate: "2024-06-13", status: 'Available', donorName: "Robert Brown", donorId: "P-1292" },
  { id: "BU-004", bloodType: "AB+", volume: 450, collectedDate: "2024-05-01", expiryDate: "2024-06-12", status: 'Reserved', donorName: "Alice Green", donorId: "P-1293" },
  { id: "BU-005", bloodType: "O+", volume: 450, collectedDate: "2024-05-03", expiryDate: "2024-06-14", status: 'Available', donorName: "Charlie Black", donorId: "P-1294" },
  { id: "BU-006", bloodType: "A-", volume: 450, collectedDate: "2024-05-01", expiryDate: "2024-06-12", status: 'In Cross-match', donorName: "David White", donorId: "P-1295" },
];

const MOCK_REQUESTS: TransfusionRequest[] = [
  { id: "TR-001", patientName: "Aisha Mohammed", patientId: "P-10023", bloodType: "O-", unitsRequested: 2, priority: 'Urgent', reason: "Maternity Hemorrhage", status: 'Pending', requestTime: "2024-05-04T10:15:00" },
  { id: "TR-002", patientName: "Carlos Menem", patientId: "P-10045", bloodType: "A+", unitsRequested: 1, priority: 'Routine', reason: "Post-op Anemia", status: 'Cross-matched', requestTime: "2024-05-04T08:30:00" },
  { id: "TR-003", patientName: "Unknown Patient", patientId: "ER-991", bloodType: "O-", unitsRequested: 4, priority: 'Emergency', reason: "Active Trauma", status: 'Dispensable', requestTime: "2024-05-04T11:05:00" },
];

const STOCK_LEVELS = [
  { type: "O+", count: 12, capacity: 20 },
  { type: "O-", count: 3, capacity: 10 },
  { type: "A+", count: 15, capacity: 20 },
  { type: "A-", count: 4, capacity: 10 },
  { type: "B+", count: 8, capacity: 20 },
  { type: "B-", count: 2, capacity: 10 },
  { type: "AB+", count: 5, capacity: 10 },
  { type: "AB-", count: 1, capacity: 5 },
];

const CHART_DATA = STOCK_LEVELS.map(s => ({ name: s.type, value: s.count, full: s.capacity }));

export default function BloodBankPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'donations'>('inventory');
  
  // States for modals
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isCrossmatchModalOpen, setIsCrossmatchModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransfusionRequest | null>(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredInventory = MOCK_INVENTORY.filter(unit => 
    unit.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUnits: STOCK_LEVELS.reduce((acc, curr) => acc + curr.count, 0),
    expiringSoon: MOCK_INVENTORY.filter(u => u.status === 'Expiring Soon').length,
    urgentRequests: MOCK_REQUESTS.filter(r => r.priority === 'Emergency' || r.priority === 'Urgent').length,
    todayDonations: 4
  };

  const handleDispense = (requestId: string) => {
    toast({
      title: "Dispense Initiated",
      description: `Request ${requestId} is being processed for dispensing.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Droplets className="h-12 w-12 text-red-500 fill-red-500" />
        </motion.div>
        <p className="text-muted-foreground animate-pulse">Syncing Blood Bank Inventory...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Droplets className="h-8 w-8 text-red-600" /> {t('bloodBank.pageTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('bloodBank.overview.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" /> New Donation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register Blood Donation</DialogTitle>
                <DialogDescription>
                  Enter donor details and collection information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Donor ID</label>
                  <Input placeholder="P-XXXX" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Blood Type</label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_LEVELS.map(s => (
                        <SelectItem key={s.type} value={s.type}>{s.type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Volume (ml)</label>
                  <Input type="number" defaultValue="450" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Hb Level</label>
                  <Input placeholder="g/dL" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDonationModalOpen(false)}>Cancel</Button>
                <Button className="bg-red-600" onClick={() => {
                  toast({ title: "Donation Logged", description: "Donor health screening passed. Unit collection initiated." });
                  setIsDonationModalOpen(false);
                }}>Log Donation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t('bloodBank.inventory.title'), value: stats.totalUnits, subtext: "Units in cold storage", icon: Droplets, color: "text-red-600", trend: "+2 today" },
          { title: t('bloodBank.requests.title'), value: stats.urgentRequests, subtext: "Awaiting cross-match", icon: AlertTriangle, color: "text-amber-500", trend: "High Priority" },
          { title: t('bloodBank.stats.donationsMonth'), value: stats.todayDonations, subtext: "Units collected", icon: Heart, color: "text-green-600", trend: "On Target" },
          { title: t('bloodBank.stats.expiringSoon'), value: stats.expiringSoon, subtext: "Expire within 48h", icon: ShieldAlert, color: "text-purple-600", trend: "Immediate Action" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-default group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 font-medium ${stat.color}`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inventory & Requests */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-red-600 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Inventory
                  </button>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'requests' ? 'border-red-600 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Transfusion Requests
                  </button>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={activeTab === 'inventory' ? "Search unist..." : "Search patients..."} 
                    className="pl-8 h-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {activeTab === 'inventory' ? (
                  <motion.div
                    key="inventory"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="overflow-x-auto"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unit ID</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Volume</TableHead>
                          <TableHead>Collected</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-mono text-xs">{unit.id}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-bold border-red-200 text-red-700">
                                {unit.bloodType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{unit.volume}ml</TableCell>
                            <TableCell className="text-xs">{unit.collectedDate}</TableCell>
                            <TableCell className="text-xs">
                              <span className={unit.status === 'Expiring Soon' ? 'text-red-600 font-bold' : ''}>
                                {unit.expiryDate}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  unit.status === 'Available' ? 'outline' : 
                                  unit.status === 'Expiring Soon' ? 'destructive' : 
                                  'secondary'
                                }
                                className="text-[10px]"
                              >
                                {unit.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                ) : (
                  <motion.div
                    key="requests"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="overflow-x-auto"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_REQUESTS.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="text-sm">{request.patientName}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{request.reason}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-bold">
                                {request.bloodType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{request.unitsRequested}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${
                                  request.priority === 'Emergency' ? 'bg-red-600' :
                                  request.priority === 'Urgent' ? 'bg-amber-500' : 'bg-blue-400'
                                }`} />
                                <span className="text-xs">{request.priority}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">
                              {format(new Date(request.requestTime), 'HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Badge className="text-[10px]" variant={request.status === 'Pending' ? 'outline' : 'secondary'}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              {request.status === 'Pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-[10px]"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsCrossmatchModalOpen(true);
                                  }}
                                >
                                  Cross-match
                                </Button>
                              )}
                              {request.status === 'Dispensable' && (
                                <Button 
                                  size="sm" 
                                  className="h-7 text-[10px] bg-green-600 hover:bg-green-700"
                                  onClick={() => handleDispense(request.id)}
                                >
                                  Dispense
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t p-3">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <p>Showing {activeTab === 'inventory' ? filteredInventory.length : MOCK_REQUESTS.length} records</p>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="h-7 text-[10px]">Previous</Button>
                   <Button variant="ghost" size="sm" className="h-7 text-[10px]">Next</Button>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* AI Predictive Panel */}
          <Card className="border-red-100 bg-red-50/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <BrainCircuit className="h-12 w-12 text-red-100" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">AI INSIGHT</Badge>
                <CardTitle className="text-lg">Predictive Inventory Optimization</CardTitle>
              </div>
              <CardDescription>Based on upcoming theater schedule and historical seasonal trends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 p-3 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> O- Deficiency Warning
                    </span>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">Probability: 84%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A surge in &quot;O Negative&quot; demand is forecast for the next 72 hours due to 3 high-risk maternity admissions and a scheduled orthopedic revision. 
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs text-red-600 mt-2">Identify eligible O- donors &rarr;</Button>
                </div>
                <div className="bg-white/60 p-3 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Smart Redistribution
                    </span>
                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">Efficiency Gain: 12%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Predicted surplus of A+ units at District Hospital (12km away). AI recommends requesting transfer of 5 units to avoid expiry at current location.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs text-red-600 mt-2">Initiate inter-facility request &rarr;</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualizer & Alerts */}
        <div className="space-y-6">
          {/* Level Visualizer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-600" /> Stock Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value < entry.full * 0.3 ? '#ef4444' : '#fee2e2'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                 {STOCK_LEVELS.filter(s => s.count / s.capacity < 0.4).map((s, i) => (
                   <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                         <span className="font-bold">{s.type} (Low)</span>
                         <span className="text-muted-foreground">{s.count}/{s.capacity} units</span>
                      </div>
                      <Progress value={(s.count / s.capacity) * 100} className="h-1 bg-slate-100" />
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> System Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 relative group">
                <p className="text-[11px] font-bold text-amber-900 mb-1">Cold Chain Warning</p>
                <p className="text-[10px] text-amber-700 leading-tight">
                  Fridge-B sensor reported variance. Check temperature logs immediately.
                </p>
                <Button size="sm" variant="outline" className="h-6 text-[10px] mt-2 border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400">
                   Verify Temp
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                 <Button variant="outline" className="w-full justify-start text-xs h-9 bg-slate-50 border-slate-200">
                    <History className="mr-2 h-3.5 w-3.5" /> Recent Transfusions
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-xs h-9 bg-slate-50 border-slate-200">
                    <Heart className="mr-2 h-3.5 w-3.5" /> Donor Call-up List
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-xs h-9 bg-slate-50 border-slate-200">
                    <Plus className="mr-2 h-3.5 w-3.5" /> External Facility Inquiry
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fridge Monitoring Card */}
          <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
             <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Cold Chain Status</CardTitle>
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
             </CardHeader>
             <CardContent className="pt-4 pb-6">
                <div className="flex items-end gap-2">
                   <div className="text-4xl font-bold">3.8</div>
                   <div className="text-lg text-slate-400 pb-1">°C</div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                   <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last Handshake: 1m ago
                   </div>
                   <div className="text-green-500">OPTIMAL</div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals --- Cross-match Modal */}
      <Dialog open={isCrossmatchModalOpen} onOpenChange={setIsCrossmatchModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blood Compatibility & Cross-match</DialogTitle>
            <DialogDescription>
              Patient: {selectedRequest?.patientName} ({selectedRequest?.bloodType})
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Compatible Units in Inventory</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {MOCK_INVENTORY.filter(u => u.status === 'Available' && (u.bloodType === selectedRequest?.bloodType || selectedRequest?.bloodType === 'AB+' || u.bloodType === 'O-')).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 border rounded-md text-sm hover:bg-muted cursor-pointer transition-colors border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-700">
                        {u.bloodType}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{u.id}</span>
                        <span className="text-[10px] text-muted-foreground">Vol: {u.volume}ml | Exp: {u.expiryDate}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-600">Select</Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Cross-match Protocol</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">1</div>
                  <span className="text-xs">Major Cross-match (Donor Cells + Patient Serum)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">2</div>
                  <span className="text-xs">Minor Cross-match (Donor Serum + Patient Cells)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">3</div>
                  <span className="text-xs">Indirect Antiglobulin Test (IAT)</span>
                </div>
                <div className="pt-4 border-t">
                  <label className="text-xs font-medium block mb-2">Final Physical Impression (Agglutination?)</label>
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compatible">Compatible (No Agglutination)</SelectItem>
                      <SelectItem value="incompatible">Incompatible (Agglutination present)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCrossmatchModalOpen(false)}>Close</Button>
            <Button className="bg-red-600" onClick={() => {
              toast({ title: "Cross-match Completed", description: "Compatibility confirmed. Unit moved to Dispensable state."});
              setIsCrossmatchModalOpen(false);
            }}>Confirm & Reserve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
