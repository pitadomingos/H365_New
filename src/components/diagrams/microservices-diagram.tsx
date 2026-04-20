
"use client";

import { cn } from "@/lib/utils";
import { ArrowDownIcon, DatabaseIcon, ServerIcon, ShieldCheckIcon, UsersIcon, GanttChartSquareIcon, CalendarCheckIcon, MicroscopeIcon, MonitorPlayIcon, PillIcon } from "lucide-react";
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

const HorizontalLine = () => (
  <div className="w-full h-px bg-muted-foreground/30 my-2 md:my-4" />
);

const ServiceAndDB: React.FC<{serviceTitle: string, serviceIcon: LucideIcon, dbTitle: string, dbIcon: LucideIcon}> = ({ serviceTitle, serviceIcon, dbTitle, dbIcon }) => (
  <div className="flex flex-col items-center space-y-1 md:space-y-2 w-full">
    <DiagramBox title={serviceTitle} icon={serviceIcon} className="w-full" />
    <Connector />
    <DiagramBox title={dbTitle} icon={dbIcon} className="w-full" bgColor="bg-muted/50" />
  </div>
);


export function MicroservicesDiagram() {
  return (
    <div className="my-8 p-4 md:p-6 border border-border rounded-lg bg-background/50 shadow-lg">
      <h4 className="text-lg font-semibold mb-6 text-center text-primary">
        H365 Microservices Architecture Example
      </h4>
      <div className="flex flex-col items-center space-y-3 md:space-y-4">
        {/* Tier 1: Client Application */}
        <DiagramBox
          title="H365 Frontend Client"
          subtitle="(Next.js, React, ShadCN)"
          icon={UsersIcon}
          className="w-full max-w-md"
          borderColor="border-primary"
        />
        <Connector />

        {/* Tier 2: API Gateway */}
        <DiagramBox
          title="API Gateway"
          subtitle="(Authentication, Routing, Rate Limiting)"
          icon={ShieldCheckIcon}
          className="w-full max-w-lg"
          borderColor="border-blue-500"
        />
        
        {/* Connector to services tier - represented by just vertical space and then the horizontal line */}
        <div className="w-full flex justify-center my-2 md:my-3">
            <div className="w-px h-6 md:h-8 bg-muted-foreground"></div>
        </div>
        <HorizontalLine />
         <div className="w-full flex justify-center mt-[-0.6rem] md:mt-[-0.8rem] mb-2 md:mb-3">
            <ArrowDownIcon className="h-5 w-5 text-muted-foreground" />
        </div>


        {/* Tier 3: Microservices */}
        <p className="text-sm text-muted-foreground mb-2 text-center">(Example Microservices)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl">
          <ServiceAndDB serviceTitle="Patient Service" serviceIcon={UsersIcon} dbTitle="Patient DB" dbIcon={DatabaseIcon} />
          <ServiceAndDB serviceTitle="Scheduling Service" serviceIcon={CalendarCheckIcon} dbTitle="Scheduling DB" dbIcon={DatabaseIcon} />
          <ServiceAndDB serviceTitle="Clinical Encounter Service" serviceIcon={GanttChartSquareIcon} dbTitle="Clinical DB" dbIcon={DatabaseIcon} />
          <ServiceAndDB serviceTitle="Laboratory Service" serviceIcon={MicroscopeIcon} dbTitle="Laboratory DB" dbIcon={DatabaseIcon} />
          {/* You can add more services here like:
          <ServiceAndDB serviceTitle="Imaging Service" serviceIcon={MonitorPlayIcon} dbTitle="Imaging DB" dbIcon={DatabaseIcon} />
          <ServiceAndDB serviceTitle="Pharmacy Service" serviceIcon={PillIcon} dbTitle="Pharmacy DB" dbIcon={DatabaseIcon} />
          */}
        </div>
      </div>
    </div>
  );
}
