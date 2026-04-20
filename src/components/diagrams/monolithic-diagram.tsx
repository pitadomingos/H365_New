
"use client";

import { cn } from "@/lib/utils";
import { ArrowDownIcon, DatabaseIcon, ServerIcon, UsersIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DiagramBoxProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

const DiagramBox: React.FC<DiagramBoxProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  className,
  bgColor = "bg-card",
  textColor = "text-card-foreground",
  borderColor = "border-foreground/30"
}) => (
  <div
    className={cn(
      "border-2 border-dashed rounded-lg p-3 text-center shadow-md min-h-[80px] flex flex-col justify-center items-center",
      bgColor,
      textColor,
      borderColor,
      className
    )}
  >
    {Icon && <Icon className="h-6 w-6 mb-1 opacity-80" />}
    <p className="font-semibold text-sm leading-tight">{title}</p>
    {subtitle && <p className="text-xs opacity-70 mt-0.5 leading-tight">{subtitle}</p>}
  </div>
);

const Connector = () => (
  <div className="flex justify-center items-center my-1 md:my-2">
    <ArrowDownIcon className="h-5 w-5 text-muted-foreground" />
  </div>
);

export function MonolithicDiagram() {
  return (
    <div className="my-8 p-4 md:p-6 border border-border rounded-lg bg-background/50 shadow-lg">
      <h4 className="text-lg font-semibold mb-6 text-center text-primary">
        H365 Monolithic Architecture Example
      </h4>
      <div className="flex flex-col items-center space-y-3 md:space-y-4">
        {/* Tier 1: Client Application */}
        <DiagramBox
          title="H365 Frontend Client"
          subtitle="(Next.js, React, ShadCN)"
          icon={UsersIcon}
          className="w-full max-w-sm"
          borderColor="border-primary"
        />
        <Connector />

        {/* Tier 2: Monolithic Backend Application */}
        <DiagramBox
          title="H365 Monolithic Backend"
          subtitle="(Node.js/Express - All Modules Combined)"
          icon={ServerIcon}
          className="w-full max-w-md"
          borderColor="border-blue-500"
        />
        <Connector />

        {/* Tier 3: Single Database */}
        <DiagramBox
          title="Centralized Database"
          subtitle="(MySQL on Aiven)"
          icon={DatabaseIcon}
          className="w-full max-w-xs"
          bgColor="bg-muted/50"
        />
      </div>
    </div>
  );
}
