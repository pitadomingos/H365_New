"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FunnelData {
  stage: string;
  value: number;
  label: string;
}

interface DropoutFunnelProps {
  data: FunnelData[];
  title: string;
  description?: string;
  color?: string;
}

export function DropoutFunnel({ data, title, description, color = "hsl(var(--primary))" }: DropoutFunnelProps) {
  
  const calculateDropout = (index: number) => {
    if (index === 0) return 0;
    const prev = data[index - 1].value;
    const curr = data[index].value;
    if (prev === 0) return 0;
    return Math.round(((prev - curr) / prev) * 100);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 border rounded-lg shadow-xl">
                        <div className="font-semibold">{payload[0].payload.label}</div>
                        <div className="text-sm mt-1">
                          Count: <span className="font-bold">{payload[0].value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fillOpacity={1} 
                fill="url(#colorFunnel)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between px-2 text-xs text-muted-foreground">
          {data.map((item, i) => {
            const drop = calculateDropout(i);
            return (
              <div key={item.stage} className="flex flex-col items-center">
                {i > 0 && drop > 0 ? (
                  <span className="text-destructive font-medium bg-destructive/10 px-1.5 py-0.5 rounded">
                    -{drop}%
                  </span>
                ) : (
                  <span className="opacity-0">-</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
