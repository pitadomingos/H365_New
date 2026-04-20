
"use client";

import { cn } from "@/lib/utils";
import { UserIcon, RouterIcon, LayersIcon, ComponentIcon, PaletteIcon, Share2Icon, BrainCircuitIcon, DatabaseZapIcon, ServerIcon, MousePointerClickIcon, FolderKanbanIcon, LayoutPanelLeftIcon, LibraryIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DiagramBoxProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  items?: string[];
}

const DiagramBox: React.FC<DiagramBoxProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  className,
  bgColor = "bg-card",
  textColor = "text-card-foreground",
  borderColor = "border-primary/30",
  items
}) => (
  <div
    className={cn(
      "border-2 border-dashed rounded-lg p-3 text-center shadow-md flex flex-col justify-center items-center",
      bgColor,
      textColor,
      borderColor,
      className
    )}
  >
    {Icon && <Icon className="h-5 w-5 mb-1 opacity-70" />}
    <p className="font-semibold text-xs md:text-sm leading-tight">{title}</p>
    {subtitle && <p className="text-xs opacity-70 mt-0.5 leading-tight">{subtitle}</p>}
    {items && items.length > 0 && (
        <ul className="text-left text-xs opacity-80 mt-1.5 space-y-0.5 list-disc list-inside">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    )}
  </div>
);

const Arrow = ({ direction = "down", className }: { direction?: "down" | "right" | "left" | "up", className?: string }) => {
  let iconClass = "h-4 w-4 text-muted-foreground";
  if (direction === "right") iconClass += " rotate-[-90deg]";
  if (direction === "left") iconClass += " rotate-90";
  if (direction === "up") iconClass += " rotate-180";
  
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <MousePointerClickIcon className={iconClass} /> {/* Using a more generic interaction icon */}
    </div>
  );
};


export function FrontendArchitectureDiagram() {
  return (
    <div className="my-6 p-4 border border-border rounded-lg bg-background/50 shadow-lg">
      <h4 className="text-md font-semibold mb-4 text-center text-primary">
        H365 Frontend Architecture Overview
      </h4>
      <div className="flex flex-col items-center space-y-2">
        <DiagramBox title="User / Browser" icon={UserIcon} className="w-full max-w-xs" bgColor="bg-primary/10" />
        <Arrow />
        
        <DiagramBox title="Next.js App Router" icon={RouterIcon} className="w-full max-w-sm" bgColor="bg-blue-500/10" borderColor="border-blue-500/50">
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <DiagramBox title="Server Components" subtitle="(Default)" bgColor="bg-blue-600/10" borderColor="border-blue-600/30" className="p-2"/>
                <DiagramBox title="Client Components" subtitle="('use client')" bgColor="bg-sky-500/10" borderColor="border-sky-500/30" className="p-2"/>
            </div>
        </DiagramBox>
        <Arrow />

        <DiagramBox title="React Components" icon={LayersIcon} className="w-full max-w-md" bgColor="bg-green-500/10" borderColor="border-green-500/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full">
                <DiagramBox title="Root Layout" subtitle="layout.tsx" icon={FolderKanbanIcon} bgColor="bg-green-600/10" borderColor="border-green-600/30" className="p-2 text-xs"/>
                <DiagramBox title="App Shell" subtitle="app-shell.tsx" icon={LayoutPanelLeftIcon} bgColor="bg-green-600/10" borderColor="border-green-600/30" className="p-2 text-xs"/>
                <DiagramBox title="Page Components" subtitle="e.g., /dashboard/page.tsx" icon={ComponentIcon} bgColor="bg-green-600/10" borderColor="border-green-600/30" className="p-2 text-xs"/>
                <DiagramBox title="UI Components" subtitle="@/components/ui (ShadCN)" icon={LibraryIcon} bgColor="bg-green-600/10" borderColor="border-green-600/30" className="p-2 text-xs"/>
            </div>
        </DiagramBox>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl mt-3">
            <div className="flex flex-col items-center space-y-1">
                <Arrow />
                <DiagramBox title="Styling" icon={PaletteIcon} subtitle="Tailwind CSS, globals.css (Theme Vars)" className="w-full" bgColor="bg-purple-500/10" borderColor="border-purple-500/50"/>
            </div>
            <div className="flex flex-col items-center space-y-1">
                <Arrow />
                <DiagramBox title="State Management" icon={Share2Icon} subtitle="React Context, Component State" className="w-full" bgColor="bg-yellow-500/10" borderColor="border-yellow-500/50"/>
            </div>
             <div className="flex flex-col items-center space-y-1">
                <Arrow />
                <DiagramBox title="AI Integration" icon={BrainCircuitIcon} subtitle="Genkit Flows, Server Actions" className="w-full" bgColor="bg-teal-500/10" borderColor="border-teal-500/50"/>
            </div>
        </div>
         <Arrow className="my-2"/>
        <DiagramBox title="Data Layer (Prototype)" icon={DatabaseZapIcon} subtitle="Local Mock Data, Simulated API Calls" className="w-full max-w-xs" bgColor="bg-orange-500/10" borderColor="border-orange-500/50"/>

      </div>
    </div>
  );
}

