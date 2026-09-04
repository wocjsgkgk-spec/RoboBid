"use client";

import React, { useState } from "react";
import { RequirementCandidate, RequirementCategory } from "@/types/document";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Quote, Search, CheckCircle, AlertCircle } from "lucide-react";

interface RfpRequirementsViewProps {
  requirements: RequirementCandidate[];
}

export function RfpRequirementsView({ requirements }: RfpRequirementsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterQuery, setFilterQuery] = useState("");

  const getCategoryBadge = (cat: RequirementCategory) => {
    switch (cat) {
      case "TECHNICAL":
        return <Badge variant="default" className="text-[10px]">기술/과업</Badge>;
      case "ELIGIBILITY":
        return <Badge variant="warning" className="text-[10px]">신청자격</Badge>;
      case "FINANCIAL":
        return <Badge variant="outline" className="text-[10px] border-emerald-600 text-emerald-600">사업비/예산</Badge>;
      case "SUBMISSION":
        return <Badge variant="secondary" className="text-[10px]">제출서류</Badge>;
      case "SCHEDULE":
        return <Badge variant="outline" className="text-[10px]">추진일정</Badge>;
      case "EVALUATION":
        return <Badge variant="outline" className="text-[10px] border-purple-600 text-purple-600">평가배점</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">기타</Badge>;
    }
  };

  const filtered = requirements.filter((req) => {
    if (selectedCategory !== "ALL" && req.category !== selectedCategory) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return (
        req.title.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.reqCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">
              RFP 요구사항 추출 내역 (Requirement Traceability)
            </CardTitle>
            <CardDescription className="text-xs">
              공고 첨부문서에서 자동 감지된 핵심 요구조건이며, 원문 인용문구(Citation)와 직접 연결됩니다.
            </CardDescription>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            총 {requirements.length}개 요구사항 감지
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t">
          {["ALL", "TECHNICAL", "ELIGIBILITY", "FINANCIAL", "SUBMISSION", "SCHEDULE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat === "ALL" ? "전체" : cat}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-md">
            조건에 부합하는 추출 요구사항이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div
                key={req.reqCode}
                className="p-3.5 rounded-lg border bg-background hover:border-primary/40 transition-colors space-y-2"
              >
                {/* Header Line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {req.reqCode}
                    </span>
                    {getCategoryBadge(req.category)}
                    {req.isMandatory ? (
                      <span className="text-[10px] font-semibold text-destructive uppercase px-1.5 py-0.5 rounded bg-destructive/10">
                        필수 요건
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        우대/선택
                      </span>
                    )}
                  </div>
                  {req.citationSection && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                      출처: {req.citationSection}
                    </span>
                  )}
                </div>

                {/* Requirement Title/Description */}
                <div className="text-xs font-medium text-foreground leading-relaxed">
                  {req.description}
                </div>

                {/* Evidence Citation Quote */}
                {req.citationQuote && (
                  <div className="flex items-start gap-2 p-2 rounded bg-muted/40 border border-muted text-[11px] text-muted-foreground italic">
                    <Quote className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                    <span>"{req.citationQuote}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
