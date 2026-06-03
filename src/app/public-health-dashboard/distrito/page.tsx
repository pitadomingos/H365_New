"use client";

import React from "react";
import { SyncStatusBar } from "../components/sync-status-bar";
import { KPIActionCard } from "../components/kpi-action-card";
import { FacilityLeaderboard } from "../components/facility-leaderboard";
import { computeIndicators, WHO_INDICATORS, getSubLocationIds } from "../lib/d2a-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle } from "lucide-react";

const DISTRICT_ID = "LOC-CH"; // Chibuto

export default function DistrictDashboard() {
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Compute indicators for the district and its facilities
  const districtLocIds = getSubLocationIds(DISTRICT_ID);
  const districtKpis = computeIndicators(districtLocIds);

  const mockFacilities = [
    { id: "LOC-CH-CS", name: "Chibuto CS", mainKpiValue: 95, mainKpiTarget: 90, secondaryValue: "98% completude", isFlagged: false },
    { id: "LOC-CH-CS2", name: "Malehice CS", mainKpiValue: 72, mainKpiTarget: 90, secondaryValue: "85% completude", isFlagged: true },
    { id: "LOC-CH-CS3", name: "Changanine CS", mainKpiValue: 88, mainKpiTarget: 90, secondaryValue: "100% completude", isFlagged: false },
    { id: "LOC-CH-CS4", name: "Alto Changane CS", mainKpiValue: 65, mainKpiTarget: 90, secondaryValue: "70% completude", isFlagged: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Distrito de Chibuto</h2>
          <p className="text-muted-foreground">Supervisão Distrital e Gestão de Clínicas</p>
        </div>
      </div>

      <SyncStatusBar 
        isOffline={false} 
        isSyncing={isSyncing} 
        queueLength={0} 
        lastSyncTime="Hoje 09:30" 
        onForceSync={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1000); }} 
      />

      {/* Zone A: District KPI Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIActionCard
          title={WHO_INDICATORS.DTP3.name}
          value={districtKpis.DTP3.value}
          target={WHO_INDICATORS.DTP3.target}
          unit={WHO_INDICATORS.DTP3.unit}
          trend="flat"
          actionText="Agendar Supervisão de Campo"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.MMR.name}
          value={districtKpis.MMR.value}
          target={WHO_INDICATORS.MMR.target}
          unit={WHO_INDICATORS.MMR.unit}
          trend="up"
          invertRAG={true}
          actionText="Convocar Revisão de Óbito"
          onActionClick={() => {}}
        />
        <KPIActionCard
          title={WHO_INDICATORS.SISC_REF.name}
          value={districtKpis.SISC_REF?.value || 75}
          target={WHO_INDICATORS.SISC_REF?.target || 85}
          unit={WHO_INDICATORS.SISC_REF?.unit || "%"}
          trend="down"
          actionText="Revisar Protocolo APE"
          onActionClick={() => {}}
        />
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Tempo de Resposta a Surto
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">52 <span className="text-lg">horas</span></div>
            <p className="text-xs text-muted-foreground mt-1">Alvo: &lt; 48 horas</p>
            <Button variant="outline" size="sm" className="w-full mt-4 text-xs">
              Escalar para DPS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zone B: Leaderboards and Maps */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="h-full min-h-[400px] flex items-center justify-center bg-secondary/20">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">[Mapa Interativo SVG do Distrito de Chibuto com pins de US]</p>
              <p className="text-xs text-muted-foreground mt-2">Funcionalidade Placeholder para visualização GeoJSON futura</p>
            </div>
          </Card>
        </div>
        <div className="col-span-3">
          <FacilityLeaderboard
            title="Ranking de Cobertura Penta3 por US"
            facilities={mockFacilities}
            kpiUnit="%"
          />
        </div>
      </div>
    </div>
  );
}
