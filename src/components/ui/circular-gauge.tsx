"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CircularGaugeProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: "primary" | "emerald" | "amber" | "rose" | "indigo";
  className?: string;
}

export function CircularGauge({
  value,
  size = 110,
  strokeWidth = 9,
  label,
  sublabel,
  color = "primary",
  className,
}: CircularGaugeProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const colorMap = {
    primary: "text-primary stroke-primary",
    emerald: "text-emerald-500 stroke-emerald-500",
    amber: "text-amber-500 stroke-amber-500",
    rose: "text-rose-500 stroke-rose-500",
    indigo: "text-indigo-600 stroke-indigo-600",
  };

  return (
    <div className={cn("inline-flex flex-col items-center justify-center relative", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/40 stroke-muted/40"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={cn("transition-all duration-700 ease-out", colorMap[color])}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold tracking-tight font-mono text-foreground">
          {Math.round(clamped)}%
        </span>
        {label && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
      {sublabel && (
        <span className="text-xs text-muted-foreground mt-2 font-medium">
          {sublabel}
        </span>
      )}
    </div>
  );
}
