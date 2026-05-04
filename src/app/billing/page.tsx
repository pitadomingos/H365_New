
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
  CreditCard, 
  Receipt, 
  Wallet, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Plus, 
  Search, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Landmark,
  FileText,
  Filter
} from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

// Mock Financial Data
const REVENUE_DATA = [
  { day: "Mon", revenue: 45000, insurance: 30000, cash: 15000 },
  { day: "Tue", revenue: 52000, insurance: 35000, cash: 17000 },
  { day: "Wed", revenue: 48000, insurance: 32000, cash: 16000 },
  { day: "Thu", revenue: 61000, insurance: 40000, cash: 21000 },
  { day: "Fri", revenue: 55000, insurance: 38000, cash: 17000 },
  { day: "Sat", revenue: 32000, insurance: 20000, cash: 12000 },
  { day: "Sun", revenue: 28000, insurance: 18000, cash: 10000 },
];

const PAYMENT_METHODS = [
  { name: "Insurance", value: 55, color: "#4f46e5" },
  { name: "Mobile Money", value: 25, color: "#10b981" },
  { name: "Cash", value: 15, color: "#f59e0b" },
  { name: "Bank Card", value: 5, color: "#ef4444" },
];

const RECENT_INVOICES = [
  { id: "INV-2024-001", patient: "Mussa Alberto", amount: "4,500 MT", status: "Paid", method: "M-Pesa", date: "2024-05-04 09:12" },
  { id: "INV-2024-002", patient: "Elena Chilaule", amount: "12,800 MT", status: "Pending", method: "Insurance", date: "2024-05-04 10:05" },
  { id: "INV-2024-003", patient: "Ricardo Gomis", amount: "2,100 MT", status: "Paid", method: "Cash", date: "2024-05-04 11:30" },
  { id: "INV-2024-004", patient: "Sara Mondlane", amount: "8,400 MT", status: "Overdue", method: "Bank Card", date: "2024-05-03 14:50" },
  { id: "INV-2024-005", patient: "Tito Langa", amount: "5,600 MT", status: "Paid", method: "E-Mola", date: "2024-05-03 16:20" },
];

const INSURANCE_CLAIMS = [
  { provider: "MDS - Medis", pending: 15, value: "450,000 MT", days: 12 },
  { provider: "Sim - Saúde", pending: 8, value: "210,000 MT", days: 5 },
  { provider: "MCS - Medicare", pending: 22, value: "780,000 MT", days: 18 },
];

export default function BillingPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);
  
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const quickStats = [
    { label: "Daily Revenue", value: "321,450 MT", trend: "+12.4%", status: "up", icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Accounts Receivable", value: "1.2M MT", trend: "-5.2%", status: "down", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Insurance Claims", value: "1,440K MT", trend: "+2.1%", status: "up", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Mobile Transactions", value: "482K MT", trend: "+18%", status: "up", icon: Smartphone, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <CreditCard className="h-8 w-8 text-indigo-600 shadow-sm" />
            </div>
            {t('billing.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest pl-1">
            {t('billing.overview.description')} • Q2 Fiscal Year 2024
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-background border-2">
            <Landmark className="mr-2 h-4 w-4" /> Reconciliation
          </Button>
          <Button size="sm" className="h-10 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6">
            <Plus className="mr-2 h-4 w-4" /> Create New Invoice
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4 relative">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none">{stat.label}</p>
                  <p className="text-xl font-black tracking-tight">{stat.value}</p>
                  <div className={cn(
                    "text-[9px] font-black uppercase flex items-center gap-0.5",
                    stat.status === 'up' ? "text-green-600" : "text-red-500"
                  )}>
                    {stat.status === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend} week
                  </div>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300">
                  <stat.icon className="h-20 w-20 rotate-12" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Financial Section */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex gap-6 border-b rounded-none mb-6">
              <TabsTrigger 
                value="invoices" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-tight transition-all"
              >
                Recent Invoices
              </TabsTrigger>
              <TabsTrigger 
                value="revenue" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-tight transition-all"
              >
                Revenue Trends
              </TabsTrigger>
              <TabsTrigger 
                value="claims" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-tight transition-all"
              >
                Insurance Claims
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="outline-none space-y-6">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-3 rounded-2xl border border-border/50">
                  <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search invoices by patient or ID..." 
                      className="pl-10 h-10 border-none bg-background/50 text-xs shadow-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest bg-background">
                       <Filter className="mr-2 h-3 w-3" /> Status
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest bg-background">
                       <Download className="mr-2 h-3 w-3" /> Export
                    </Button>
                  </div>
               </div>

               <Card className="border-none shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                       <thead className="bg-muted/30 border-b">
                          <tr>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice ID</th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Patient Name</th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Amount</th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right px-6">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {RECENT_INVOICES.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                               <td className="p-4 font-mono text-[10px] font-bold text-indigo-600">{inv.id}</td>
                               <td className="p-4">
                                  <p className="text-xs font-black">{inv.patient}</p>
                                  <p className="text-[9px] text-muted-foreground font-medium">{inv.date}</p>
                               </td>
                               <td className="p-4 text-xs font-black tracking-tight">{inv.amount}</td>
                               <td className="p-4">
                                  <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-white">
                                     {inv.method}
                                  </Badge>
                               </td>
                               <td className="p-4">
                                  <Badge className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5",
                                    inv.status === 'Paid' ? "bg-green-100 text-green-700 border-none" :
                                    inv.status === 'Pending' ? "bg-amber-100 text-amber-700 border-none" : "bg-red-100 text-red-700 border-none"
                                  )}>
                                     {inv.status}
                                  </Badge>
                               </td>
                               <td className="p-4 text-right px-6">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-indigo-600">
                                     <MoreVertical className="h-4 w-4" />
                                  </Button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                    <p className="text-[10px] text-muted-foreground font-black uppercase">Recent Transaction Log</p>
                    <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                       View All Invoices <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                 </CardFooter>
               </Card>
            </TabsContent>

            <TabsContent value="revenue" className="outline-none">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                   <CardTitle className="text-sm font-black uppercase tracking-widest">Revenue Attribution</CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase">Weekly financial flow categorized by payment source</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                         dataKey="day" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                         dy={10}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                       />
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Total Revenue" />
                       <Area type="monotone" dataKey="insurance" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} name="Insurance Component" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claims" className="outline-none space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {INSURANCE_CLAIMS.map((claim, i) => (
                    <Card key={i} className="border-none shadow-sm relative overflow-hidden group">
                       <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                             <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                <ShieldCheck className="h-5 w-5" />
                             </div>
                             <Badge variant="outline" className="text-[8px] font-black uppercase text-blue-600 border-blue-100">{claim.pending} PENDING</Badge>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none">{claim.provider}</p>
                             <p className="text-xl font-black">{claim.value}</p>
                          </div>
                          <div className="space-y-1.5 pt-2">
                             <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
                                <span>Avg. Processing Time</span>
                                <span className={claim.days > 15 ? "text-red-500" : "text-green-600"}>{claim.days} Days</span>
                             </div>
                             <Progress value={80 - (claim.days * 2)} className="h-1 bg-slate-100" />
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>

               <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden">
                  <CardContent className="p-0">
                     <div className="flex flex-col md:flex-row items-center">
                        <div className="p-8 md:p-12 space-y-4 md:w-2/3">
                           <Badge className="bg-white/20 text-white border-none text-[8px] font-black uppercase px-2">ADMIN INSIGHT</Badge>
                           <h3 className="text-2xl font-black tracking-tighter leading-tight italic">Improve Claim Velocity</h3>
                           <p className="text-indigo-100 text-sm leading-relaxed opacity-80">
                             Analysis of Q1 data shows a bottleneck with MCS-Medicare due to missing ICD-10 encoding in 24% of claims. Applying the auto-encoder suggestor could reduce processing time by 4.2 days.
                           </p>
                           <Button className="bg-white text-indigo-600 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest h-10 px-8 mt-2">
                              Configure Encoding AI
                           </Button>
                        </div>
                        <div className="bg-white/10 w-full md:w-1/3 flex items-center justify-center p-8">
                           <TrendingUp className="h-32 w-32 opacity-20 rotate-12" />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Financial Health & Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue Mix Chart */}
          <Card className="border-none shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600">Payment Channel Mix</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Distribution by transaction modality</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PAYMENT_METHODS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PAYMENT_METHODS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '9px', fontWeight: 'bold' }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                 <p className="text-2xl font-black leading-none">82%</p>
                 <p className="text-[8px] font-black text-muted-foreground uppercase">Digital</p>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex flex-col gap-2">
               <div className="grid grid-cols-2 gap-3 w-full">
                  {PAYMENT_METHODS.map((m) => (
                    <div key={m.name} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                       <p className="text-[9px] font-bold uppercase tracking-tight text-slate-600">{m.name}</p>
                       <span className="text-[9px] font-black ml-auto">{m.value}%</span>
                    </div>
                  ))}
               </div>
               <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest h-9 mt-4 border-2">
                  Channel Audit Report
               </Button>
            </CardFooter>
          </Card>

          {/* Accounts Receivable Card */}
          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <AlertCircle className="h-32 w-32 text-white -rotate-12" />
             </div>
             <CardHeader className="relative z-10 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-400">Aging Receivables</CardTitle>
                <CardDescription className="text-slate-400 text-[10px] uppercase font-bold">Outstanding amounts by duration</CardDescription>
             </CardHeader>
             <CardContent className="space-y-5 relative z-10">
                {[
                  { range: "0 - 30 Days", value: "840,000 MT", progress: 65, color: "bg-indigo-500" },
                  { range: "31 - 60 Days", value: "250,000 MT", progress: 20, color: "bg-amber-500" },
                  { range: "61 - 90 Days", value: "110,000 MT", progress: 10, color: "bg-orange-500" },
                  { range: "90+ Days", value: "45,000 MT", progress: 5, color: "bg-red-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase italic">
                       <span className="text-slate-400">{item.range}</span>
                       <span>{item.value}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.progress}%` }}
                         className={cn("h-full", item.color)}
                       />
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest h-10 mt-2">
                   Open Collection Manager
                </Button>
             </CardContent>
          </Card>

          {/* Quick Tariff Tool */}
          <Card className="border-none shadow-sm bg-background border-2 border-dashed">
             <CardHeader className="pb-3 border-b border-dashed">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" /> Tariff Explorer
                   </CardTitle>
                   <Badge variant="secondary" className="text-[8px] bg-indigo-50 text-indigo-600 border-none px-1.5 py-0 h-4 uppercase">v2.4 Active</Badge>
                </div>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  Real-time look up and validation for National Health Tariff (Tabela Geral de Atos Médicos).
                </p>
                <div className="flex gap-2">
                   <Input placeholder="Search code or service..." className="h-9 text-xs bg-muted/30 border-none shadow-none" />
                   <Button size="icon" className="h-9 w-9 shrink-0 shadow-lg bg-indigo-600 hover:bg-indigo-700">
                      <Search className="h-4 w-4" />
                   </Button>
                </div>
                <div className="divide-y divide-dashed">
                   {[
                     { desc: "General Consultation", code: "CO-101", price: "450 MT" },
                     { desc: "Complete Blood Count", code: "LB-404", price: "1,200 MT" },
                     { desc: "Chest X-Ray (A/P)", code: "IM-802", price: "2,800 MT" },
                   ].map((t, idx) => (
                     <div key={idx} className="flex items-center justify-between py-2 text-[10px] group cursor-pointer hover:bg-slate-50 transition-colors px-1 rounded">
                        <div className="space-y-0.5">
                           <p className="font-black text-foreground group-hover:text-indigo-600">{t.desc}</p>
                           <p className="text-muted-foreground opacity-60 uppercase font-bold text-[8px]">{t.code}</p>
                        </div>
                        <span className="font-black text-slate-400">{t.price}</span>
                     </div>
                   ))}
                </div>
             </CardContent>
             <CardFooter className="bg-muted/10 border-t border-dashed p-3">
               <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 text-muted-foreground hover:text-indigo-600">
                 Manage Full Catalog
               </Button>
             </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

    
