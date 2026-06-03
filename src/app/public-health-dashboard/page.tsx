"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { Loader2 } from "lucide-react";

import FacilityDashboard from "./unidade-sanitaria/page";
import DistrictDashboard from "./distrito/page";
import ProvincialDashboard from "./provincia/page";
import NationalDashboard from "./nacional/page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PublicHealthDashboardRouter() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [manualOverride, setManualOverride] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine current role based on user context or manual override for demo
  const currentRole = manualOverride || user?.role || "NATIONAL_ADMIN";

  return (
    <div className="p-4 md:p-8 pt-6">
      {/* Dev/Demo Role Switcher */}
      <Card className="mb-6 border-dashed bg-secondary/10 print:hidden">
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground mr-2">Simular Visão D2A:</span>
          <Button 
            variant={currentRole === "FACILITY_ADMIN" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setManualOverride("FACILITY_ADMIN")}
          >
            Tier 1: Unidade Sanitária
          </Button>
          <Button 
            variant={currentRole === "DISTRICT_ADMIN" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setManualOverride("DISTRICT_ADMIN")}
          >
            Tier 2: Distrito
          </Button>
          <Button 
            variant={currentRole === "PROVINCIAL_ADMIN" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setManualOverride("PROVINCIAL_ADMIN")}
          >
            Tier 3: Província
          </Button>
          <Button 
            variant={currentRole === "NATIONAL_ADMIN" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setManualOverride("NATIONAL_ADMIN")}
          >
            Tier 4: Nacional
          </Button>
        </CardContent>
      </Card>

      {/* Render the appropriate tier dashboard */}
      {currentRole === "FACILITY_ADMIN" && <FacilityDashboard />}
      {currentRole === "DISTRICT_ADMIN" && <DistrictDashboard />}
      {currentRole === "PROVINCIAL_ADMIN" && <ProvincialDashboard />}
      {currentRole === "NATIONAL_ADMIN" && <NationalDashboard />}
    </div>
  );
}
