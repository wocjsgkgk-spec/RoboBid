"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Search,
  FileSpreadsheet,
  Database,
  Award,
  TrendingUp,
  Bot,
  Bell,
  Settings,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_NAV_ITEMS = [
  { href: "/today", label: "오늘", icon: CalendarCheck },
  { href: "/opportunities", label: "공모", icon: Search },
  { href: "/proposals", label: "제안", icon: FileSpreadsheet },
  { href: "/vault", label: "역량 금고 (Vault)", icon: Award },
  { href: "/intelligence", label: "자료·인텔리전스", icon: Database },
  { href: "/learning", label: "성과·학습", icon: TrendingUp },
];

const SECONDARY_NAV_ITEMS = [
  { href: "/ai", label: "RoboBid AI", icon: Bot, highlight: true },
  { href: "/notifications", label: "알림", icon: Bell },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card shrink-0">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Cpu className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-foreground">
            RoboBid AI
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            BidOps Intelligence
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
        <nav className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            워크스페이스
          </div>
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3">
          <nav className="space-y-1 pt-3 border-t border-border/60">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              인텔리전스 & 도구
            </div>
            {SECONDARY_NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                    item.highlight && !isActive && "text-primary font-semibold hover:bg-primary/10",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Enterprise Status Footer */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-[11px] space-y-1 text-muted-foreground">
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-foreground">RoboBid Ops</span>
              <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-bold">v1.2 Live</span>
            </div>
            <p className="text-[10px] leading-tight">
              KONEPS / IRIS / TIPA 공공 연계 엔진
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
