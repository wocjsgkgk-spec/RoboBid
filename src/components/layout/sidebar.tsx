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
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav className="space-y-1 pt-4 border-t">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            인텔리전스 & 설정
          </div>
          {SECONDARY_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  item.highlight && !isActive && "text-primary hover:bg-primary/10",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
