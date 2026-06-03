"use client";

import React from "react";
import { SyncStatusBar } from "../components/sync-status-bar";
import { KPIActionCard } from "../components/kpi-action-card";
import { DropoutFunnel } from "../components/dropout-funnel";
import { computeIndicators, WHO_INDICATORS } from "../lib/d2a-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Package, Stethoscope, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// MOCK values for facility
const FACILITY_ID = "LOC-CZ"; // Chingodzi CS
const AL_STOCK_DAYS = 5;
const OXY_STOCK_DAYS = 14;

export default function FacilityDashboard() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [queue, setQueue] = React.useState(3); // Mock queue length

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setQueue(0);
      toast({
        title: "Sincronização Concluída",
        description: "Todos os registos offline foram enviados para o SIS-MA.",
      });
    }, 2000);
  };

  const handleStockAlert = (item: string) => {
    toast({
      title: "Requisição Urgente",
      description: `Formulário de emergência para ${item} enviado ao CMAM Distrital.`,
      variant: "destructive"
    });
  };

  const handleEpidemiologicalAlert = () => {
    toast({
      title: "Alerta Epidemiológico",
      description: "Notificação de surto submetida à equipa de resposta rápida.",
      variant: "destructive"
    });
  };

  // Compute indicators for this facility
  const kpis = computeIndicators([FACILITY_ID]);

  const funnelData = [
    { stage: "ANC1", value: kpis.ANC1.numerator, label: "1ª CPN" },
    { stage: "ANC4", value: kpis.ANC4.numerator, label: "4+ CPN" },
    { stage: "SBA", value: kpis.SBA.numerator, label: "Parto Inst." }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centro de Saúde de Chingodzi</h2>
          <p className="text-muted-foreground">Painel Operacional da Unidade Sanitária</p>
        </div>
      </div>

      <SyncStatusBar 
        isOffline={true} 
        isSyncing={isSyncing} 
        queueLength={queue} 
        lastSyncTime="Hoje 07:15" 
        onForceSync={handleForceSync} 
      />

      {/* Zone A: Critical Alerts / KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIActionCard
          title={WHO_INDICATORS.MALPOS.name}
          value={kpis.MALPOS.value}
          target={WHO_INDICATORS.MALPOS.target}
          unit={WHO_INDICATORS.MALPOS.unit}
          trend="up"
          invertRAG={true}
          actionText="Iniciar Alerta Epidemiológico"
          onActionClick={handleEpidemiologicalAlert}
        />
        <KPIActionCard
          title={WHO_INDICATORS.ART.name}
          value={kpis.ART.value}
          target={WHO_INDICATORS.ART.target}
          unit={WHO_INDICATORS.ART.unit}
          trend="down"
          actionText="Ver Lista de Abandonos"
          onActionClick={() => {}}
        />
        <Card className={AL_STOCK_DAYS <= 7 ? "border-l-4 border-l-destructive" : "border-l-4 border-l-emerald-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Arteméter-Lumefantrina (AL)
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{AL_STOCK_DAYS} <span className="text-lg">dias</span></div>
            <p className="text-xs text-muted-foreground mt-1">Stock Alerta: 7 dias</p>
            {AL_STOCK_DAYS <= 7 && (
              <Button variant="destructive" size="sm" className="w-full mt-4 text-xs" onClick={() => handleStockAlert("AL")}>
                Solicitar Abastecimento (CMAM)
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className={OXY_STOCK_DAYS <= 7 ? "border-l-4 border-l-destructive" : "border-l-4 border-l-emerald-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Oxitocina
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{OXY_STOCK_DAYS} <span className="text-lg">dias</span></div>
            <p className="text-xs text-muted-foreground mt-1">Stock Alerta: 7 dias</p>
            {OXY_STOCK_DAYS <= 7 && (
              <Button variant="destructive" size="sm" className="w-full mt-4 text-xs" onClick={() => handleStockAlert("Oxitocina")}>
                Solicitar Abastecimento (CMAM)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zone B: Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DropoutFunnel 
            title="Funil de Retenção Materno-Infantil" 
            description="Acompanhamento desde a 1ª consulta até ao parto institucional"
            data={funnelData}
            color="hsl(var(--primary))"
          />
        </div>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Activity className="h-5 w-5 mr-2 text-muted-foreground" />
              Completude SIS-MA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-bold text-amber-500">82%</div>
            <p className="text-sm text-muted-foreground mt-2">18 relatórios pendentes</p>
            <Button variant="outline" className="mt-6 w-full">
              Abrir Formulário de Reporte Pendente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
