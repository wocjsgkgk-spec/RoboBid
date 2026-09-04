"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Upload,
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  Download,
  Trash2,
  Clock,
  Shield,
  FileText,
  Building,
  Award,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { evidenceStore } from "@/lib/evidence/evidence-store";
import { EvidenceItem, EvidenceCategory } from "@/types/evidence";
import { toast } from "sonner";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "ALL", label: "전체 서류" },
  { key: "CORPORATE", label: "법인·사업자" },
  { key: "PATENT", label: "특허등록증" },
  { key: "CERTIFICATE", label: "인증·확인서" },
  { key: "PERFORMANCE", label: "납품실적증명" },
  { key: "FINANCIAL", label: "재무·세무" },
];

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New item form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<EvidenceCategory>("CORPORATE");
  const [newAssignee, setNewAssignee] = useState("경영지원팀");

  const loadData = () => {
    setItems(evidenceStore.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    evidenceStore.create({
      name: newName,
      category: newCategory,
      fileExtension: "pdf",
      fileSizeBytes: 350000,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: "2027-12-31",
      isExpired: false,
      securityLevel: "INTERNAL",
      assignee: newAssignee,
      tags: ["신규등록", newCategory],
      linkedOpportunityIds: [],
      linkedProposalIds: [],
      reusableScore: 90,
    });

    toast.success("증빙자료가 성공적으로 라이브러리에 등록되었습니다.");
    setNewName("");
    setUploadModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck2 className="h-6 w-6 text-primary" />
              자료·증빙 라이브러리 (Evidence Library)
            </h1>
            <Badge variant="outline" className="text-xs">
              재사용 자산고
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            사업자등록증, 특허등록증, 납품실적증명, 재무제표 원본 서류를 관리하고 다음 공모에 자동 추천·재사용합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setUploadModalOpen(true)} size="sm" className="gap-1.5">
            <Upload className="h-4 w-4" />
            <span>새 증빙 서류 등록</span>
          </Button>
        </div>
      </div>

      {/* 2. Reusable Recommendation Banner */}
      <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-foreground">AI 스마트 증빙 재사용 추천 가동 중</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              최근 3년 이내 등록된 10대 실증 데이터 및 특허 등록증이 신규 공모 제안서에 원클릭 인용될 수 있도록 맵핑되었습니다.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs self-start sm:self-auto font-mono">
          재사용률 94.2%
        </Badge>
      </div>

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="서류명, 태그 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border rounded-md text-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Evidence Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isD30 = item.expiryDate && item.expiryDate.startsWith("2026-03");

          return (
            <Card key={item.id} className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {isD30 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-destructive/10 text-destructive border border-destructive/20">
                        D-27 만료임박
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      {item.fileExtension.toUpperCase()}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-sm font-bold mt-2 leading-snug line-clamp-1">
                  {item.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1 mt-0.5">
                  {item.description || "공공조달 적격심사 및 제안서 증빙"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-2.5">
                <div className="space-y-1 text-[11px] text-muted-foreground border-t pt-2">
                  <div className="flex justify-between">
                    <span>담당 관리자</span>
                    <span className="text-foreground font-medium">{item.assignee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>유효 기간</span>
                    <span className="font-mono">{item.expiryDate || "상시 유효"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>재사용 적합도</span>
                    <span className="font-mono text-primary font-bold">{item.reusableScore}점</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    연계 공모 {item.linkedOpportunityIds.length}건
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10">
                    <Download className="h-3 w-3" /> 다운로드
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                새 증빙 서류 등록
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">서류명</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 2026년도 기업부설연구소 인정서"
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">카테고리</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EvidenceCategory)}
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                >
                  <option value="CORPORATE">법인·사업자 (CORPORATE)</option>
                  <option value="PATENT">특허등록증 (PATENT)</option>
                  <option value="CERTIFICATE">인증·확인서 (CERTIFICATE)</option>
                  <option value="PERFORMANCE">납품실적증명 (PERFORMANCE)</option>
                  <option value="FINANCIAL">재무·세무 (FINANCIAL)</option>
                  <option value="PRODUCT_TECH">제품·기술자료 (PRODUCT_TECH)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">담당 부서</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" size="sm">
                  등록 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
