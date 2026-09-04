"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Search,
  GitPullRequest,
  FileSpreadsheet,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { href: "/today", label: "오늘", icon: CalendarCheck },
  { href: "/opportunities", label: "공모", icon: Search },
  { href: "/pipeline", label: "파이프라인", icon: GitPullRequest },
  { href: "/proposals", label: "제안", icon: FileSpreadsheet },
  { href: "/tasks", label: "업무", icon: CheckSquare },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-2 md:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-md transition-all active:scale-95",
              isActive ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] leading-tight font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
