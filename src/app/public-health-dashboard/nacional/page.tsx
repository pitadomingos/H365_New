"use client";

import React from "react";
import { SyncStatusBar } from "../components/sync-status-bar";
import { KPIActionCard } from "../components/kpi-action-card";
import { computeIndicators, WHO_INDICATORS, getSubLocationIds } from "../lib/d2a-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Activity } from "lucide-react";

const NATIONAL_ID = "LOC-MZ";

export default function NationalDashboard() {
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Compute indicators for the entire nation
  const natLocIds = getSubLocationIds(NATIONAL_ID);
  const natKpis = computeIndicators(natLocIds);

  const historicalTrends = [
    { year: "2020", u5mr: 75, mmr: 120 },
    { year: "2021", u5mr: 70, mmr: 110 },
    { year: "2022", u5mr: 68, mmr: 95 },
    { year: "2023", u5mr: 64, mmr: 85 },
    { year: "2024", u5mr: 60, mmr: 78 },
    { year: "2025", u5mr: 56, mmr: 72 },
    { year: "2026", u5mr: 52, mmr: 68 },
  ];

  const handleExportPDF = () => {
    window.print(); // Utilises CSS @media print
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ministério da Saúde - Moçambique</h2>
          <p className="text-muted-foreground">Visão Executiva e Monitoria dos ODS 3</p>
        </div>
        <Button onClick={handleExportPDF} className="print:hidden">
          <Download className="mr-2 h-4 w-4" /> Exportar Relatório PDF
        </Button>
      </div>

      <div className="print:hidden">
        <SyncStatusBar 
          isOffline={false} 
          isSyncing={isSyncing} 
          queueLength={0} 
          lastSyncTime="Servidor Central" 
          onForceSync={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1000); }} 
        />
      </div>

      {/* Zone A: Headline SDG3 KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIActionCard
          title={WHO_INDICATORS.U5MR.name}
          value={natKpis.U5MR?.value || 52}
          target={WHO_INDICATORS.U5MR?.target || 25}
          unit={WHO_INDICATORS.U5MR?.unit || " p/1k"}
          trend="down"
          invertRAG={true}
          actionText="Revisão Estratégica"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.MMR.name}
          value={natKpis.MMR.value || 68}
          target={WHO_INDICATORS.MMR.target}
          unit={WHO_INDICATORS.MMR.unit}
          trend="down"
          invertRAG={true}
          actionText="Força-Tarefa Saúde Materna"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.OOP.name}
          value={natKpis.OOP?.value || 32}
          target={WHO_INDICATORS.OOP?.target || 20}
          unit={WHO_INDICATORS.OOP?.unit || "%"}
          trend="up"
          invertRAG={true}
          actionText="Rever Política Financiamento"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.CMAM_FILL.name}
          value={natKpis.CMAM_FILL?.value || 78}
          target={WHO_INDICATORS.CMAM_FILL?.target || 90}
          unit={WHO_INDICATORS.CMAM_FILL?.unit || "%"}
          trend="up"
          actionText="Alertar Logística CMAM"
          onActionClick={() => {}}
        />
      </div>

      {/* Zone B: Maps and Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Tendência Histórica de Mortalidade (2020-2026)</CardTitle>
              <CardDescription>Progresso em direção às metas dos ODS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="u5mr" name="TMM5 (por 1k)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="mmr" name="MMR (por 100k)" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <Card className="h-full flex flex-col justify-center items-center p-6 bg-secondary/10">
             <Activity className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
             <h3 className="text-xl font-semibold">Transformação Digital</h3>
             <p className="text-center text-muted-foreground mt-2 text-sm">
               Adoção Nacional de EHR (SESP) atual: 
             </p>
             <div className="text-6xl font-black text-emerald-500 mt-4">
               {natKpis.EHR_ADOPT?.value || 45}%
             </div>
             <p className="text-xs text-muted-foreground mt-2">Meta MISAU: 80% até 2030</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
