"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Search,
  GitPullRequest,
  FileText,
  FileSpreadsheet,
  Send,
  Award,
  FileCheck2,
  Calculator,
  TrendingUp,
  Bot,
  CheckSquare,
  Bell,
  Settings,
  Cpu,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Command,
  Database,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

// 1. 운영 (Operations)
const OPERATIONS_ITEMS: NavItem[] = [
  { href: "/today", label: "오늘 & Action Center", icon: CalendarCheck, badge: "긴급 2" },
  { href: "/opportunities", label: "공모 탐색 & 360°", icon: Search },
  { href: "/pipeline", label: "수주 파이프라인 (Bid Room)", icon: GitPullRequest, badge: "GO 3" },
  { href: "/tasks", label: "과업 & 업무 협업", icon: CheckSquare, badge: "5" },
];

// 2. 분석·제안 (Analysis & Proposals)
const PROPOSAL_ITEMS: NavItem[] = [
  { href: "/rfp", label: "RFP & Compliance", icon: FileText },
  { href: "/proposals", label: "제안서 & Quality Gate", icon: FileSpreadsheet, badge: "작성중" },
  { href: "/submissions", label: "제출·마감 점검", icon: Send, badge: "D-2" },
];

// 3. 지식·자산 (Knowledge & Assets)
const KNOWLEDGE_ITEMS: NavItem[] = [
  { href: "/vault", label: "회사역량 볼트", icon: Award },
  { href: "/evidence", label: "자료·증빙 라이브러리", icon: FileCheck2 },
  { href: "/intelligence", label: "수주 인텔리전스", icon: TrendingUp },
  { href: "/learning", label: "성과·학습 (Win/Loss)", icon: ShieldCheck },
];

// 4. 지원 & 설정 (Support & Settings)
const SUPPORT_ITEMS: NavItem[] = [
  { href: "/tools", label: "투찰 계산도구", icon: Calculator },
  { href: "/ai", label: "RoboBid AI 코파일럿", icon: Bot, highlight: true },
  { href: "/notifications", label: "알림 센터", icon: Bell },
  { href: "/settings", label: "설정 & Admin", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showOnlyRealData, setShowOnlyRealData] = useState(false);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderNavGroup = (title: string, items: NavItem[], groupId: string) => {
    const isCollapsed = Boolean(collapsedGroups[groupId]);

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup(groupId)}
          className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 hover:text-slate-200 transition-colors"
        >
          <span>{title}</span>
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-slate-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-slate-500" />
          )}
        </button>

        {!isCollapsed && (
          <div className="space-y-0.5">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98]",
                    item.highlight && !isActive && "text-blue-400 font-semibold hover:bg-blue-950/40 hover:text-blue-300",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-white/10"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-300 border border-slate-700/60"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-900 text-slate-200 dark:bg-[#080d18] dark:border-slate-800/80 shrink-0 h-screen sticky top-0 shadow-xl z-30">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              RoboBid AI
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded font-mono">v3.0</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Bid Operations System
            </span>
          </div>
        </div>

        {/* Command Search Shortcut Indicator */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/90 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700/60 font-mono">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Nav List with 4 Distinct Logical Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {renderNavGroup("운영 (Operations)", OPERATIONS_ITEMS, "operations")}
        <div className="pt-2 border-t border-slate-800/80">
          {renderNavGroup("분석·제안 (Proposals)", PROPOSAL_ITEMS, "proposals")}
        </div>
        <div className="pt-2 border-t border-slate-800/80">
          {renderNavGroup("지식·자산 (Knowledge)", KNOWLEDGE_ITEMS, "knowledge")}
        </div>
        <div className="pt-2 border-t border-slate-800/80">
          {renderNavGroup("지원 & 설정 (Support)", SUPPORT_ITEMS, "support")}
        </div>
      </div>

      {/* Footer: Data Origin Toggle (DEMO vs REAL) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Database className="w-3 h-3" />
            데이터 필터 모드
          </span>
          <button
            onClick={() => setShowOnlyRealData(!showOnlyRealData)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all border ${
              showOnlyRealData
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {showOnlyRealData ? "실제 데이터만 보기" : "데모 포함 모드"}
          </button>
        </div>
        <div className="text-[9px] text-slate-500 leading-tight">
          {showOnlyRealData
            ? "✓ DEMO 시뮬레이션 데이터를 제외한 실제 실적/공고만 집계됩니다."
            : "시연용 샘플 데이터 및 실공고가 통합 표시 중입니다."}
        </div>
      </div>
    </aside>
  );
}
