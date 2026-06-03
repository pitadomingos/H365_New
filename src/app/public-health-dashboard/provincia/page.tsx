"use client";

import React from "react";
import { SyncStatusBar } from "../components/sync-status-bar";
import { KPIActionCard } from "../components/kpi-action-card";
import { FacilityLeaderboard } from "../components/facility-leaderboard";
import { computeIndicators, WHO_INDICATORS, getSubLocationIds } from "../lib/d2a-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from "recharts";

const PROVINCE_ID = "LOC-GZ"; // Gaza

export default function ProvincialDashboard() {
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Compute indicators for the province
  const provLocIds = getSubLocationIds(PROVINCE_ID);
  const provKpis = computeIndicators(provLocIds);

  const mockDistricts = [
    { id: "LOC-CH", name: "Chibuto", mainKpiValue: 15, mainKpiTarget: 23, secondaryValue: "Falta crítica enfermeiros", isFlagged: true },
    { id: "LOC-XX", name: "Xai-Xai", mainKpiValue: 28, mainKpiTarget: 23, secondaryValue: "Adequado", isFlagged: false },
    { id: "LOC-MB", name: "Manjacaze", mainKpiValue: 12, mainKpiTarget: 23, secondaryValue: "Alerta vermelho", isFlagged: true },
    { id: "LOC-BL", name: "Bilene", mainKpiValue: 24, mainKpiTarget: 23, secondaryValue: "Adequado", isFlagged: false },
  ];

  const tbCohortData = [
    { name: "Q1", sucesso: 82, abandono: 12, obito: 6 },
    { name: "Q2", sucesso: 84, abandono: 10, obito: 6 },
    { name: "Q3", sucesso: 86, abandono: 9, obito: 5 },
    { name: "Q4", sucesso: 88, abandono: 8, obito: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Direcção Provincial de Saúde - Gaza</h2>
          <p className="text-muted-foreground">Supervisão Estratégica e Alocação de Recursos</p>
        </div>
      </div>

      <SyncStatusBar 
        isOffline={false} 
        isSyncing={isSyncing} 
        queueLength={0} 
        lastSyncTime="Hoje 11:45 (Automático)" 
        onForceSync={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1000); }} 
      />

      {/* Zone A: Executive Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIActionCard
          title={WHO_INDICATORS.BEDOCC.name}
          value={provKpis.BEDOCC?.value || 88}
          target={WHO_INDICATORS.BEDOCC?.target || 85}
          unit={WHO_INDICATORS.BEDOCC?.unit || "%"}
          trend="up"
          invertRAG={true}
          actionText="Activar Protocolo Descongestão"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.TBCUR.name}
          value={provKpis.TBCUR.value}
          target={WHO_INDICATORS.TBCUR.target}
          unit={WHO_INDICATORS.TBCUR.unit}
          trend="up"
          actionText="Revisão de Coorte TB"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title="Variância Execução Orçamental"
          value={18}
          target={20}
          unit="%"
          trend="down"
          invertRAG={true}
          actionText="Relatório de Desvio"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.ART.name}
          value={provKpis.ART.value}
          target={WHO_INDICATORS.ART.target}
          unit={WHO_INDICATORS.ART.unit}
          trend="flat"
          actionText="Avaliar Retenção Distrital"
          onActionClick={() => {}}
        />
      </div>

      {/* Zone B & C: Heatmaps & Cohort Trackers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Rastreio de Coorte TB (Taxa de Sucesso)</CardTitle>
              <CardDescription>Evolução trimestral por desfecho de tratamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tbCohortData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sucesso" name="Sucesso (%)" stackId="a" fill="hsl(var(--emerald-500))" />
                    <Bar dataKey="abandono" name="Abandono (%)" stackId="a" fill="hsl(var(--amber-500))" />
                    <Bar dataKey="obito" name="Óbito (%)" stackId="a" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <FacilityLeaderboard
            title="Densidade RH por Distrito"
            facilities={mockDistricts}
            kpiUnit=" p/ 10k"
          />
        </div>
      </div>
    </div>
  );
}
