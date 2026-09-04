"use client";

import React from "react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "secondary" | "outline";
  progress?: number; // 0 to 100
  trend?: {
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = "secondary",
  progress,
  trend,
  className,
  onClick,
}: MetricCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md border-border/60",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </span>
          {badgeText && (
            <Badge variant={badgeVariant} className="text-[10px] font-mono">
              {badgeText}
            </Badge>
          )}
        </div>

        {progress !== undefined && (
          <div className="space-y-1 pt-1">
            <ProgressBar value={progress} />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {(subtitle || trend) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={cn(
                  "font-medium text-[11px]",
                  trend.isPositive ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {trend.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
