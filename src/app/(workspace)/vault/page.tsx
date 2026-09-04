"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  FileCheck,
  Clock,
  ShieldCheck,
  Layers,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner-toast";
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

  // Radix Dialog modal state
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
    } catch (err: any) {
      toast.error("역량 자산 로드 실패", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const handleSeedDefault = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEED_DEFAULT" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("표준 실데이터 적재 완료", {
          description: "대한민국 첨단 로봇·AI 표준 자산 13건이 등록되었습니다.",
        });
        fetchCapabilities();
      }
    } catch (err: any) {
      toast.error("적재 실패", { description: err.message });
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
        toast.success("역량 자산 삭제 완료", { description: `'${title}' 자산이 삭제되었습니다.` });
        fetchCapabilities();
      }
    } catch (err: any) {
      toast.error("삭제 실패", { description: err.message });
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
        toast.success("신규 역량 등록 완료", { description: `'${newTitle}' 자산이 등록되었습니다.` });
        fetchCapabilities();
      }
    } catch (err: any) {
      toast.error("등록 실패", { description: err.message });
    }
  };

  const filteredItems = capabilities.filter((cap) => {
    if (selectedFilter === "ALL") return true;
    return cap.type === selectedFilter;
  });

  const totalCount = capabilities.length;
  const expiringSoonCount = capabilities.filter((c) => c.isExpiringSoon).length;
  const verifiedCount = capabilities.filter((c) => c.verificationStatus === "VERIFIED").length;
  const verifiedPercent = totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            사내 역량 금고 (Capability Vault)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            특허, 인증서, TRL 기술자산, 납품실적, 결산 재무제표 등 공모 제안서 RAG 인용과 가점 평가의 원천 근거를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefault}
            disabled={isSeeding}
            className="gap-2 text-xs h-9"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            {isSeeding ? "적재 중..." : "표준 실데이터 세트 적재"}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-2 text-xs h-9 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            신규 역량 등록
          </Button>
        </div>
      </div>

      {/* KPI Cards (Tremor Style MetricCards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="보유 역량 자산 총계"
          value={`${totalCount}건`}
          subtitle="특허, 인증, 기술, 실적, 재무 전 영역"
          icon={Layers}
          badgeText="ALL ASSETS"
        />
        <MetricCard
          title="공식 검증 (Verified) 자산"
          value={`${verifiedCount}건`}
          subtitle="공식 증빙 서류 대조 완료 자산"
          icon={ShieldCheck}
          badgeText={`${verifiedPercent}% COMPLIANT`}
          badgeVariant="success"
          progress={verifiedPercent}
        />
        <MetricCard
          title="만료 임박 (30일 이내) 경보"
          value={`${expiringSoonCount}건`}
          subtitle="유효기한 갱신 필요 자산"
          icon={Clock}
          badgeText={expiringSoonCount > 0 ? "RENEWAL REQUIRED" : "SAFE"}
          badgeVariant={expiringSoonCount > 0 ? "warning" : "secondary"}
          className={expiringSoonCount > 0 ? "border-l-4 border-l-amber-500" : ""}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border/50">
        {TYPE_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={selectedFilter === f.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedFilter(f.value)}
            className="text-xs h-7 px-2.5 rounded-md"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List / Cards */}
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
                <Card key={item.id} className="card-hover-effect border-border/60">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {item.type}
                        </Badge>
                        <h3 className="text-sm font-bold text-foreground truncate">
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
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <FileCheck className="h-3.5 w-3.5" />
                            증빙: {item.evidenceFileName}
                          </span>
                        )}
                        {item.validUntil && (
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3.5 w-3.5" />
                            유효기한: {item.validUntil}
                          </span>
                        )}
                        {item.metadata?.contractAmountKrw && (
                          <span className="font-semibold text-foreground font-mono">
                            실적금액: {(item.metadata.contractAmountKrw / 100000000).toFixed(1)}억원
                          </span>
                        )}
                        {item.metadata?.patentNumber && (
                          <span className="font-mono">
                            등록번호: {item.metadata.patentNumber}
                          </span>
                        )}
                        {item.metadata?.trlLevel && (
                          <span className="text-primary font-semibold font-mono">
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
                        title="자산 삭제"
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

      {/* Radix Dialog Component for Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>신규 사내 역량 자산 등록</DialogTitle>
            <DialogDescription>
              제안서 RAG 인용 및 공공기관 가점 평가에 반영될 사내 증빙 자산을 등록합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1">자산 구분 (Type)</label>
              <select
                className="w-full p-2 text-xs border rounded-lg bg-background"
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
              <label className="block text-xs font-semibold mb-1">자산명 / 실적명 / 특허명 *</label>
              <input
                type="text"
                required
                placeholder="예: 다중 센서 융합 협동로봇 안전제어 특허"
                className="w-full p-2 text-xs border rounded-lg bg-background"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">상세 설명 / 기술 사양</label>
              <textarea
                rows={2}
                placeholder="공모 제안서 초안 작성 시 인용될 핵심 특징 및 스펙"
                className="w-full p-2 text-xs border rounded-lg bg-background"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">유효 만료일</label>
                <input
                  type="date"
                  className="w-full p-2 text-xs border rounded-lg bg-background"
                  value={newValidUntil}
                  onChange={(e) => setNewValidUntil(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">증빙 파일명</label>
                <input
                  type="text"
                  placeholder="예: 특허등록원부.pdf"
                  className="w-full p-2 text-xs border rounded-lg bg-background"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
