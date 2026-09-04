"use client";

import React, { useState } from "react";
import { BidTemplate, TemplateCategory } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  Building2,
  Tag,
  ArrowRight,
  Plus,
  BookmarkCheck,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TemplateLibraryProps {
  onSelectTemplate?: (template: BidTemplate) => void;
}

export function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<BidTemplate[]>(p1Store.getTemplates());
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTpl, setSelectedTpl] = useState<BidTemplate | null>(templates[0] || null);

  const filtered = templates.filter((tpl) => {
    if (selectedCategory !== "ALL" && tpl.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.targetAgency.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground ml-1" />
          <input
            type="text"
            placeholder="서식명, 발주기관, 키워드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "R_AND_D", "DEMONSTRATION", "PROCUREMENT", "EVALUATION_SHEET"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="h-7 text-xs px-2.5"
            >
              {cat === "ALL"
                ? "전체 서식"
                : cat === "R_AND_D"
                ? "R&D 사업계획서"
                : cat === "DEMONSTRATION"
                ? "실증 제안서"
                : cat === "PROCUREMENT"
                ? "조달 규격서"
                : "GO/NO-GO 심의"}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid: List on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Template Cards */}
        <div className="lg:col-span-5 space-y-2.5">
          {filtered.map((tpl) => {
            const isSelected = selectedTpl?.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTpl(tpl)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {tpl.targetAgency}
                    </Badge>
                    {tpl.isStandard && (
                      <Badge className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-[9px] border border-indigo-500/20">
                        공식 표준
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {tpl.sections.length}개 대목차
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1 leading-snug">
                  {tpl.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Template Detail & TOC Breakdown */}
        <div className="lg:col-span-7">
          {selectedTpl ? (
            <Card className="border shadow-sm bg-card h-full flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <CardTitle className="text-base font-bold">
                        {selectedTpl.name}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {selectedTpl.targetAgency}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {selectedTpl.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      포함된 표준 목차 구조 ({selectedTpl.sections.length}개)
                    </h5>
                    <div className="space-y-2">
                      {selectedTpl.sections.map((sec, i) => (
                        <div
                          key={sec.code}
                          className="p-2.5 rounded-lg border bg-muted/30 text-xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {sec.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              권장 {sec.recommendedWords}자
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {sec.description}
                          </p>
                          {sec.requiredEvidenceTypes.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[9px] text-slate-400">필수 증빙:</span>
                              {sec.requiredEvidenceTypes.map((ev) => (
                                <Badge key={ev} variant="outline" className="text-[9px] px-1 py-0">
                                  {ev}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  AI 작성 시 해당 목차 규격에 최적화된 프롬프트가 주입됩니다.
                </span>
                <Button
                  size="sm"
                  onClick={() => onSelectTemplate && onSelectTemplate(selectedTpl)}
                  className="gap-1.5 text-xs font-bold shadow-md shadow-primary/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>이 서식으로 제안서 시작</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground border rounded-xl p-8">
              서식을 선택하면 상세 목차와 권장 가이드를 미리 볼 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
