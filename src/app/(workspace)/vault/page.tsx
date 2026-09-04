"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Plus,
  RefreshCw,
  Trash2,
  FileCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CapabilityType } from "@/types/capability";

interface CapabilityItem {
  id: string;
  type: CapabilityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, any>;
  validFrom?: string | null;
  validUntil?: string | null;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "EXPIRED" | "PENDING_REVIEW";
  confidentiality: "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  evidenceFileName?: string | null;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  daysRemaining?: number;
}

const TYPE_FILTERS: { label: string; value: string }[] = [
  { label: "전체 자산", value: "ALL" },
  { label: "특허·지식재산 (PATENT)", value: "PATENT" },
  { label: "기업인증 (CERTIFICATION)", value: "CERTIFICATION" },
  { label: "핵심기술·TRL (TECHNOLOGY)", value: "TECHNOLOGY" },
  { label: "사업·납품실적 (PROJECT)", value: "PROJECT_HISTORY" },
  { label: "재무제표 (FINANCIAL)", value: "FINANCIAL_PROFILE" },
  { label: "기업프로필 (PROFILE)", value: "COMPANY_PROFILE" },
];

export default function CapabilityVaultPage() {
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // New capability simple modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<CapabilityType>("PATENT");
  const [newDesc, setNewDesc] = useState("");
  const [newValidUntil, setNewValidUntil] = useState("");
  const [newEvidence, setNewEvidence] = useState("");

  const fetchCapabilities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/vault");
      const data = await res.json();
      setCapabilities(data.capabilities || []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const handleSeedDefault = async () => {
    setIsSeeding(true);
    setActionMsg(null);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEED_DEFAULT" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("대한민국 첨단 로봇·AI 표준 실데이터 자산(13건)이 성공적으로 적재되었습니다.");
        fetchCapabilities();
      }
    } catch (err: any) {
      setActionMsg(`적재 실패: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 역량 자산을 금고에서 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/vault?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`'${title}' 자산이 삭제되었습니다.`);
        fetchCapabilities();
      }
    } catch (err: any) {
      setActionMsg(`삭제 오류: ${err.message}`);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          validUntil: newValidUntil || undefined,
          evidenceFileName: newEvidence.trim() || undefined,
          verificationStatus: "VERIFIED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDesc("");
        setNewValidUntil("");
        setNewEvidence("");
        setActionMsg("신규 역량 자산이 등록되었습니다.");
        fetchCapabilities();
      }
    } catch (err: any) {
      alert(`등록 실패: ${err.message}`);
    }
  };

  const filteredItems = capabilities.filter((cap) => {
    if (selectedFilter === "ALL") return true;
    return cap.type === selectedFilter;
  });

  const totalCount = capabilities.length;
  const expiringSoonCount = capabilities.filter((c) => c.isExpiringSoon).length;
  const verifiedCount = capabilities.filter((c) => c.verificationStatus === "VERIFIED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            사내 역량 금고 (Capability Vault)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            특허, 기업인증, TRL 기술자산, 납품실적, 재무제표 등 공모 제안서 RAG 인용과 가점 평가의 원천 근거를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefault}
            disabled={isSeeding}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            {isSeeding ? "적재 중..." : "표준 실데이터 세트 적재"}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            신규 역량 등록
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 text-sm bg-primary/10 text-primary border border-primary/20 rounded-md flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs underline ml-4">
            닫기
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardDescription className="text-xs">보유 역량 자산 총계</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalCount}건</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            특허, 인증, 기술, 실적, 재무 전 영역
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription className="text-xs">검증 완료 (Verified) 자산</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {verifiedCount}건 ({totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            공식 증빙 서류 대조 완료 자산
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription className="text-xs">만료 임박 (30일 이내) 경보</CardDescription>
            <CardTitle className={`text-2xl font-bold ${expiringSoonCount > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
              {expiringSoonCount}건
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            갱신 또는 재발급 필요 자산
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        {TYPE_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={selectedFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(f.value)}
            className="text-xs h-8"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List / Table */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            역량 자산 목록을 불러오는 중입니다...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Layers className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">등록된 역량 자산이 없습니다.</p>
              <p className="text-xs text-muted-foreground">
                우측 상단의 &apos;표준 실데이터 세트 적재&apos; 버튼을 누르면 즉시 대한민국 표준 강소기업 데이터(13건)가 로드됩니다.
              </p>
              <Button size="sm" variant="outline" onClick={handleSeedDefault}>
                표준 실데이터 적재하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => {
              return (
                <Card key={item.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.type}
                        </Badge>
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {item.title}
                        </h3>
                        {item.verificationStatus === "VERIFIED" && (
                          <Badge variant="success" className="text-[10px] gap-1 py-0 h-5">
                            <ShieldCheck className="h-3 w-3" />
                            VERIFIED
                          </Badge>
                        )}
                        {item.isExpiringSoon && (
                          <Badge variant="warning" className="text-[10px] gap-1 py-0 h-5 animate-pulse">
                            <Clock className="h-3 w-3" />
                            D-{item.daysRemaining} 만료 임박
                          </Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                        {item.evidenceFileName && (
                          <span className="flex items-center gap-1 text-primary">
                            <FileCheck className="h-3.5 w-3.5" />
                            증빙: {item.evidenceFileName}
                          </span>
                        )}
                        {item.validUntil && (
                          <span>
                            유효기한: {item.validUntil}
                          </span>
                        )}
                        {item.metadata?.contractAmountKrw && (
                          <span className="font-semibold text-foreground">
                            실적금액: {(item.metadata.contractAmountKrw / 100000000).toFixed(1)}억원
                          </span>
                        )}
                        {item.metadata?.patentNumber && (
                          <span className="font-mono">
                            등록번호: {item.metadata.patentNumber}
                          </span>
                        )}
                        {item.metadata?.trlLevel && (
                          <span className="text-blue-600 font-semibold">
                            TRL {item.metadata.trlLevel}단계
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">신규 사내 역량 자산 등록</CardTitle>
              <CardDescription className="text-xs">
                제안서 RAG 인용 및 자격 심사(Eligibility)에 활용될 사내 증빙 자산을 등록합니다.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddSubmit}>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium text-xs mb-1">자산 구분 (Type)</label>
                  <select
                    className="w-full p-2 text-xs border rounded-md bg-background"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CapabilityType)}
                  >
                    <option value="PATENT">특허 및 지식재산권 (PATENT)</option>
                    <option value="CERTIFICATION">기업 및 기술 인증서 (CERTIFICATION)</option>
                    <option value="TECHNOLOGY">핵심 기술 및 TRL (TECHNOLOGY)</option>
                    <option value="PROJECT_HISTORY">사업 및 납품 실적 (PROJECT_HISTORY)</option>
                    <option value="FINANCIAL_PROFILE">재무제표 및 결산 (FINANCIAL_PROFILE)</option>
                    <option value="COMPANY_PROFILE">회사 일반 프로필 (COMPANY_PROFILE)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-xs mb-1">자산명 / 실적명 / 특허명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 6축 협동로봇 안전제어 특허"
                    className="w-full p-2 text-xs border rounded-md bg-background"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-xs mb-1">상세 설명 / 기술 사양</label>
                  <textarea
                    rows={2}
                    placeholder="공모 제안서 RAG 인용에 반영될 주요 특징 및 실적 내용"
                    className="w-full p-2 text-xs border rounded-md bg-background"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-xs mb-1">유효 만료일</label>
                    <input
                      type="date"
                      className="w-full p-2 text-xs border rounded-md bg-background"
                      value={newValidUntil}
                      onChange={(e) => setNewValidUntil(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-xs mb-1">증빙 파일명</label>
                    <input
                      type="text"
                      placeholder="예: 특허등록원부.pdf"
                      className="w-full p-2 text-xs border rounded-md bg-background"
                      value={newEvidence}
                      onChange={(e) => setNewEvidence(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  취소
                </Button>
                <Button type="submit" size="sm">
                  등록 완료
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
