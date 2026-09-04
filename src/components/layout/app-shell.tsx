"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { RouteProgressBar } from "./route-progress-bar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-slate-100/70 dark:bg-[#0b0f19]">
      {/* Route Navigation Instant Progress Bar */}
      <RouteProgressBar />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 bg-slate-100/60 dark:bg-[#0c101c]">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
