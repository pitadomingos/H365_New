"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KPIActionCardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend?: "up" | "down" | "flat";
  invertRAG?: boolean; // If true, lower is better (e.g. MMR)
  actionText?: string;
  onActionClick?: () => void;
  description?: string;
}

export function KPIActionCard({
  title,
  value,
  target,
  unit,
  trend,
  invertRAG = false,
  actionText = "Ação Necessária",
  onActionClick,
  description
}: KPIActionCardProps) {
  
  const isHealthy = invertRAG ? value <= target : value >= target;
  
  return (
    <Card className="relative overflow-hidden flex flex-col h-full border-l-4 transition-all duration-300 hover:shadow-md"
      style={{
        borderLeftColor: isHealthy ? "hsl(var(--emerald-500))" : "hsl(var(--destructive))"
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-start">
          <span className="line-clamp-2">{title}</span>
          {isHealthy ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">
            {value}
            <span className="text-lg text-muted-foreground ml-1">{unit}</span>
          </span>
          {trend && (
            <span className={`flex items-center text-xs font-medium ${trend === "up" ? (invertRAG ? "text-destructive" : "text-emerald-500") : trend === "down" ? (invertRAG ? "text-emerald-500" : "text-destructive") : "text-muted-foreground"}`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Alvo: {target}{unit}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
            {description}
          </div>
        )}
      </CardContent>

      <AnimatePresence>
        {!isHealthy && onActionClick && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CardFooter className="pt-0 pb-3">
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full text-xs font-semibold"
                onClick={onActionClick}
              >
                {actionText}
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
