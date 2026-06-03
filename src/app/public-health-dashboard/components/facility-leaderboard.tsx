"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export interface FacilityData {
  id: string;
  name: string;
  mainKpiValue: number;
  mainKpiTarget: number;
  secondaryValue?: string;
  isFlagged?: boolean;
}

export interface FacilityLeaderboardProps {
  title: string;
  facilities: FacilityData[];
  kpiUnit: string;
  invertRAG?: boolean;
}

export function FacilityLeaderboard({ title, facilities, kpiUnit, invertRAG = false }: FacilityLeaderboardProps) {
  // Sort facilities based on performance
  const sortedFacilities = [...facilities].sort((a, b) => {
    // If invertRAG is true, lower is better. Otherwise, higher is better.
    if (invertRAG) {
      return a.mainKpiValue - b.mainKpiValue;
    }
    return b.mainKpiValue - a.mainKpiValue;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {sortedFacilities.map((facility, index) => {
            const isHealthy = invertRAG ? facility.mainKpiValue <= facility.mainKpiTarget : facility.mainKpiValue >= facility.mainKpiTarget;
            
            return (
              <div key={facility.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`font-bold text-lg w-6 text-center ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{facility.name}</p>
                    {facility.secondaryValue && (
                      <p className="text-xs text-muted-foreground mt-1">{facility.secondaryValue}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isHealthy ? 'text-emerald-500' : 'text-destructive'}`}>
                      {facility.mainKpiValue}{kpiUnit}
                    </p>
                    <p className="text-xs text-muted-foreground">Alvo: {facility.mainKpiTarget}{kpiUnit}</p>
                  </div>
                  
                  <div className="w-6 flex justify-center">
                    {facility.isFlagged ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : isHealthy ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
