"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Activity } from "lucide-react";

/**
 * Module navigation card.
 * Memoized to prevent re-renders when other parts of dashboard change.
 */
export const DashboardModuleBtn = memo(({ 
  title, 
  icon: Icon, 
  href, 
  isActive,
  t
}: { 
  title: string; 
  icon: any; 
  href: string;
  isActive?: boolean;
  t: (key: string) => string;
}) => {
  return (
    <Link href={href}>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md group",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
      )}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("p-2 rounded-md", isActive ? "bg-primary-foreground/10" : "bg-primary/10")}>
            <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-primary")} />
          </div>
          <span className="font-medium text-sm flex-1">{title}</span>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    </Link>
  );
});

DashboardModuleBtn.displayName = "DashboardModuleBtn";

export const DashboardActivityItem = memo(({ activity }: { activity: any }) => (
  <div className="flex items-start text-sm">
    <Activity className="h-4 w-4 mr-3 mt-1 shrink-0 text-primary" />
    <div>
      <span className="font-medium">{activity.user}</span> {activity.action}
      <p className="text-xs text-muted-foreground">{activity.time}</p>
    </div>
  </div>
));

DashboardActivityItem.displayName = "DashboardActivityItem";
