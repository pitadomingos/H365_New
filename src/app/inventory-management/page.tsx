"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Clock,
  ClipboardList,
  History,
  ShoppingCart,
  Boxes,
  Truck,
  Layers,
  ArrowDownToLine,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_STOCK = [
  { id: "SKU-001", name: "Surgical Gloves (Size 7.5)", category: "Consumables", qty: 450, unit: "Pair", min: 100, status: "Healthy" },
  { id: "SKU-042", name: "N95 Masks", category: "PPE", qty: 25, unit: "Box", min: 50, status: "Critical" },
  { id: "SKU-112", name: "IV Giving Sets", category: "Surgical", qty: 1200, unit: "Unit", min: 200, status: "Healthy" },
  { id: "SKU-005", name: "Disposable Syringes 5ml", category: "Consumables", qty: 85, unit: "Unit", min: 500, status: "Low Stock" },
  { id: "SKU-021", name: "Cotton Wool (500g)", category: "General", qty: 42, unit: "Roll", min: 20, status: "Healthy" },
];

const MOCK_REQUISITIONS = [
  { id: "REQ-901", unit: "Emergency Room", items: 4, date: "2026-05-04", status: "Pending" },
  { id: "REQ-902", unit: "Ward A1", items: 12, date: "2026-05-04", status: "Approved" },
  { id: "REQ-903", unit: "Maternity", items: 8, date: "2026-05-03", status: "Fulfilled" },
];

export default function InventoryManagementPage() {
  const { locale } = useLocale();
  const t = getTranslator(locale);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const stats = [
    { label: t('inventory.stats.totalValue'), value: "1.2M MT", icon: Boxes, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t('inventory.stats.lowStock'), value: "8 Items", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: t('inventory.stats.expiring'), value: "3 Batches", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: t('inventory.stats.consumption'), value: "48% ↑", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <Package className="h-8 w-8 text-indigo-600 shadow-sm" />
            </div>
            {t('inventory.title')}
          </h1>
          <p className="text-muted-foreground text-sm pl-1">
            {t('inventory.desc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 shadow-sm border-slate-200">
            <ArrowDownToLine className="h-4 w-4" />
            {t('inventory.action.addStock')}
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus className="h-4 w-4" />
            {t('inventory.action.requisition')}
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm h-full bg-white dark:bg-slate-900">
               <CardContent className="p-6 flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-black">{stat.value}</p>
                 </div>
                 <div className={cn("p-3 rounded-full", stat.bg)}>
                   <stat.icon className={cn("h-5 w-5", stat.color)} />
                 </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <Tabs defaultValue="stock" className="w-full">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <TabsList className="bg-white dark:bg-slate-900 border">
                    <TabsTrigger value="stock" className="gap-2">
                       <Boxes className="h-4 w-4" />
                       {t('inventory.tabs.stock')}
                    </TabsTrigger>
                    <TabsTrigger value="requisitions" className="gap-2">
                       <ShoppingCart className="h-4 w-4" />
                       {t('inventory.tabs.requisitions')}
                    </TabsTrigger>
                    <TabsTrigger value="procurement" className="gap-2 hidden md:flex">
                       <Truck className="h-4 w-4" />
                       {t('inventory.tabs.procurement')}
                    </TabsTrigger>
                  </TabsList>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items, SKU..."
                      className="pl-9 h-9 border-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <TabsContent value="stock" className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 pointer-events-none">
                      <TableHead className="text-xs uppercase tracking-wider">{t('inventory.table.item')}</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">{t('inventory.table.category')}</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">{t('inventory.table.quantity')}</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">{t('inventory.table.minLevel')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_STOCK.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{item.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal text-[10px] uppercase">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              item.status === "Critical" ? "text-red-600" : 
                              item.status === "Low Stock" ? "text-amber-600" : ""
                            )}>
                              {item.qty} {item.unit}s
                            </span>
                            {item.status !== "Healthy" && (
                              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">{item.min}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="requisitions" className="p-6">
                 <div className="grid gap-4">
                   {MOCK_REQUISITIONS.map((req) => (
                     <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-xl hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-50 transition-colors">
                              <ClipboardList className="h-5 w-5 text-indigo-600" />
                           </div>
                           <div>
                              <h4 className="font-bold text-sm">{req.unit}</h4>
                              <p className="text-xs text-muted-foreground">Request ID: {req.id} • {req.items} line items</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Badge className={cn(
                             req.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                             req.status === "Approved" ? "bg-blue-100 text-blue-700 border-blue-200" :
                             "bg-green-100 text-green-700 border-green-200"
                           )} variant="outline">
                             {req.status}
                           </Badge>
                           <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                     </div>
                   ))}
                 </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar / Predictive insights */}
        <div className="space-y-6">
          <Card className="bg-indigo-900 text-white shadow-xl border-none">
             <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-indigo-200">
                  <TrendingUp className="h-4 w-4" /> Usage Analytics
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div>
                   <div className="flex justify-between text-xs mb-1.5 text-indigo-100">
                      <span>Oxygen Cylinder Reserve</span>
                      <span className="font-bold">62%</span>
                   </div>
                   <div className="h-1.5 w-full bg-indigo-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 w-[62%]" />
                   </div>
                </div>
                
                <div className="bg-white/10 p-4 rounded-xl space-y-2">
                   <h4 className="text-xs font-bold flex items-center gap-2">
                     <AlertTriangle className="h-3 w-3 text-amber-400" />
                     Smart Stock Insight
                   </h4>
                   <p className="text-[11px] text-indigo-100 leading-relaxed">
                     Based on last month&apos;s Emergency Room trauma surge, you are likely to run out of &quot;Suture Kits Type A&quot; in 12 days. Suggest increasing reorder quantity.
                   </p>
                </div>

                <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 text-xs gap-2 font-bold h-9">
                  Auto-Restock Plan <ArrowRight className="h-3 w-3" />
                </Button>
             </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" /> Storage Nodes
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
               {[
                 { node: "Central Store", usage: "82%" },
                 { node: "OT Sub-store", usage: "45%" },
                 { node: "Disaster Cache", usage: "12%" },
               ].map((n, i) => (
                 <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span>{n.node}</span>
                      <span className="text-muted-foreground">{n.usage} capacity</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full">
                       <div className="h-full bg-indigo-600" style={{ width: n.usage }} />
                    </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
