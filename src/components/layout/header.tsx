"use client";

import React from "react";
import Link from "next/link";
import { Sun, Moon, LogOut, Building2, User, Bell, Radio, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userEmail?: string;
  userRole?: string;
  orgName?: string;
  onLogout?: () => void;
}

export function Header({
  userEmail = "demo@robobid.ai",
  userRole = "BID_MANAGER",
  orgName = "RoboTech Inc.",
  onLogout,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-card/80 backdrop-blur-md px-6 z-20">
      {/* Left: Organization & Live Status Indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold">{orgName}</span>
        </div>

        {/* Live Provider & Port Badges */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] gap-1.5 py-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>공공망 연동 가동중</span>
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-mono py-0.5 text-muted-foreground">
            port:3005
          </Badge>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Link */}
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            aria-label="알림 센터"
            className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </Link>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
          )}
        </Button>

        {/* User Info & Role Badge */}
        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-foreground">{userEmail}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{userRole}</span>
          </div>
        </div>

        {/* Logout */}
        {onLogout && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="로그아웃"
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
