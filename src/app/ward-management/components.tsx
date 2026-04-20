"use client";

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BedIcon, Users, Activity, LogOutIcon, ArrowRightLeft } from "lucide-react";

// --- Sub-components for Ward Management ---

/**
 * Renders a small ward summary card.
 * Memoized to prevent unnecessary re-renders when other wards update.
 */
export const WardSummaryCard = memo(({ 
  ward, 
  isSelected, 
  onSelect 
}: { 
  ward: any; 
  isSelected: boolean; 
  onSelect: (id: string) => void 
}) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "hover:bg-muted/30"
      )}
      onClick={() => onSelect(ward.id)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold truncate">{ward.name}</CardTitle>
          <Badge variant={ward.occupancyRate > 90 ? "destructive" : "secondary"} className="text-[10px] px-1 py-0 h-4">
            {ward.occupancyRate.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BedIcon className="h-3 w-3" />
            <span>{ward.occupiedBeds}/{ward.totalBeds} Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{ward.pendingDischarge} Pending Discharge</span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              ward.occupancyRate > 90 ? "bg-destructive" : "bg-primary"
            )} 
            style={{ width: `${ward.occupancyRate}%` }} 
          />
        </div>
      </CardContent>
    </Card>
  );
});

WardSummaryCard.displayName = "WardSummaryCard";

/**
 * Bed selector component for admission flow.
 */
export const BedGrid = memo(({ 
  beds, 
  selectedBedId, 
  onSelectBed 
}: { 
  beds: any[]; 
  selectedBedId: string; 
  onSelectBed: (id: string) => void 
}) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {beds.map((bed) => (
        <Button
          key={bed.id}
          variant={selectedBedId === bed.id ? "default" : bed.status === "Occupied" ? "secondary" : "outline"}
          className={cn(
            "h-10 text-[10px] p-1 flex flex-col items-center justify-center gap-0.5",
            bed.status === "Occupied" && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => bed.status === "Available" && onSelectBed(bed.id)}
          disabled={bed.status === "Occupied"}
        >
          <BedIcon className="h-3 w-3" />
          {bed.name.replace('Bed ', '')}
        </Button>
      ))}
    </div>
  );
});

BedGrid.displayName = "BedGrid";
