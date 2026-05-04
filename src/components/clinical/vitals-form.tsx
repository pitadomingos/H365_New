"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Weight, Ruler, Activity, Info } from "lucide-react";
import { useVitals } from "@/hooks/use-vitals";
import { cn } from "@/lib/utils";

interface VitalsFormProps {
  title?: string;
  description?: string;
  onVitalsChange?: (vitals: any) => void;
  initialValues?: {
    temp?: string;
    weight?: string;
    height?: string;
    bp?: string;
    pulse?: string;
    respRate?: string;
    spo2?: string;
  };
}

export function VitalsForm({ title, description, onVitalsChange, initialValues }: VitalsFormProps) {
  const [vitals, setVitals] = useState({
    temp: initialValues?.temp || "",
    weight: initialValues?.weight || "",
    height: initialValues?.height || "",
    bp: initialValues?.bp || "",
    pulse: initialValues?.pulse || "",
    respRate: initialValues?.respRate || "",
    spo2: initialValues?.spo2 || "",
  });

  const { calculateBmi, calculateBpStatus } = useVitals();

  const bmiData = calculateBmi(vitals.weight, vitals.height);
  const bpData = calculateBpStatus(vitals.bp);

  useEffect(() => {
    if (onVitalsChange) {
      onVitalsChange({
        ...vitals,
        bmi: bmiData.value,
        bmiStatus: bmiData.status,
        bpStatus: bpData.status
      });
    }
  }, [vitals, bmiData.value, bmiData.status, bpData.status, onVitalsChange]);

  const handleChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {title || "Patient Vitals"}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" /> Temp (°C)
            </Label>
            <Input 
              type="number" 
              placeholder="36.5" 
              value={vitals.temp} 
              onChange={(e) => handleChange('temp', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Weight className="h-4 w-4" /> Weight (kg)
            </Label>
            <Input 
              type="number" 
              placeholder="70" 
              value={vitals.weight} 
              onChange={(e) => handleChange('weight', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ruler className="h-4 w-4" /> Height (cm)
            </Label>
            <Input 
              type="number" 
              placeholder="170" 
              value={vitals.height} 
              onChange={(e) => handleChange('height', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> BP (Systolic/Diastolic)
            </Label>
            <Input 
              placeholder="120/80" 
              value={vitals.bp} 
              onChange={(e) => handleChange('bp', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {bmiData.value && (
            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md px-3 border shadow-sm">
              <span className="font-semibold">BMI:</span>
              <span>{bmiData.value}</span>
              <Badge variant="outline" className={cn("ml-1", bmiData.colorClass)}>
                {bmiData.status}
              </Badge>
            </div>
          )}
          {bpData.status !== "N/A" && (
            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md px-3 border shadow-sm">
              <span className="font-semibold">BP Status:</span>
              <Badge variant="outline" className={cn("ml-1", bpData.colorClass)}>
                {bpData.status}
              </Badge>
            </div>
          )}
          {!bmiData.value && !bpData.status && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic bg-muted/30 p-2 rounded w-full justify-center">
              <Info className="h-3 w-3" />
              Enter weight, height, and BP to see clinical interpretations.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
