"use client";

import React, { useState } from "react";
import { SmartReuseItem } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  Sparkles,
  Copy,
  Check,
  Award,
  ArrowRight,
  Search,
  BookOpen,
  X,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SmartReuseDrawerProps {
  currentSectionCode?: string;
  onApplyContent: (content: string, sourceInfo: string) => void;
  onClose?: () => void;
}

export function SmartReuseDrawer({
  currentSectionCode,
  onApplyContent,
  onClose,
}: SmartReuseDrawerProps) {
  const [items, setItems] = useState<SmartReuseItem[]>(p1Store.getSmartReuseRecommendations());
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.sectionTitle.toLowerCase().includes(q) ||
        item.contentSnippet.toLowerCase().includes(q) ||
        item.reuseReason.toLowerCase().includes(q) ||
        item.matchedKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApply = (item: SmartReuseItem) => {
    const formatted = `\n\n> [스마트 재사용 인용 - 출처: ${item.sourceProposalTitle}]:\n${item.contentSnippet}\n`;
    onApplyContent(formatted, item.sourceProposalTitle);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border shadow-lg overflow-hidden animate-in fade-in-50 duration-150">
      {/* Drawer Header */}
      <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-foreground">
              스마트 자산 재사용 (Smart Reuse)
            </h3>
            <Badge className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-[10px] border border-indigo-500/20">
              과거 선정작 RAG
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            과거 수주에 성공한 제안서 문안 및 검증된 핵심 단락을 유사도와 함께 인용합니다.
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b bg-muted/20">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-background text-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="키워드 검색 (예: SLAM, SIL2, WMS 연동, 유지보수 SLA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg">
            일치하는 과거 재사용 문안이 없습니다.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border bg-card hover:border-indigo-500/40 transition-all space-y-2.5 shadow-sm"
            >
              {/* Top Row: Similarity & Origin */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px] font-bold">
                    유사도 {item.similarityScore}%
                  </Badge>
                  {item.awardStatus === "WON" && (
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 gap-1">
                      <Award className="w-3 h-3 text-amber-500" />
                      최종 선정작
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApply(item)}
                  className="h-7 text-xs gap-1 font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>삽입 완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>초안에 삽입</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Title & Origin */}
              <div>
                <h4 className="font-bold text-xs text-foreground">
                  {item.sectionTitle}
                </h4>
                <span className="text-[10px] text-muted-foreground">
                  출처: {item.sourceProposalTitle}
                </span>
              </div>

              {/* "Why Similar" Rationale Box */}
              <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold mr-1">추천 사유:</span>
                  <span>{item.reuseReason}</span>
                </div>
              </div>

              {/* Content Preview */}
              <p className="text-xs text-muted-foreground p-2.5 rounded bg-muted/40 font-mono leading-relaxed border border-border/40">
                {item.contentSnippet}
              </p>

              {/* Matched Keywords */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {item.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
