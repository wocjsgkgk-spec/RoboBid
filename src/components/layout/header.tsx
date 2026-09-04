"use client";

import React from "react";
import { Sun, Moon, LogOut, Building2, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

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
    <header className="flex h-16 w-full items-center justify-between border-b bg-card px-6">
      {/* Organization Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs font-medium text-foreground">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{orgName}</span>
        </div>
      </div>

      {/* User Actions & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="h-9 w-9"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
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
