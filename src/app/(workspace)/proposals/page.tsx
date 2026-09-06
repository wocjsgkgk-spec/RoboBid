"use client";

import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Proposal, SectionStatus } from "@/types/proposal";
import { ProposalWorkspaceView } from "@/components/proposal/proposal-workspace-view";
import { Opportunity } from "@/types";
import { SAMPLE_OPPORTUNITIES } from "@/lib/today/sample-scenarios";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAgency, setNewAgency] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [creating, setCreating] = useState(false);
  const [rfpHandoff, setRfpHandoff] = useState<any | null>(null);

  const fetchProposals = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/proposals");
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    try {
      const saved = localStorage.getItem("robobid_rfp_handoff");
      if (saved) {
        setRfpHandoff(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse RFP handoff:", e);
    }
  }, []);

  const handleCreateFromRfpHandoff = async () => {
    if (!rfpHandoff) return;
    setCreating(true);
    const opp: Partial<Opportunity> = {
      id: rfpHandoff.opportunityId || crypto.randomUUID(),
      organizationId: "org-robobid-default",
      providerId: "RFP_TRANSFER",
      sourceId: `rfp-${Date.now()}`,
      title: rfpHandoff.title,
      announcingAgency: rfpHandoff.announcingAgency,
      bidType: rfpHandoff.bidType || "R_AND_D",
      allocatedBudget: rfpHandoff.allocatedBudget,
      submissionDeadline: rfpHandoff.submissionDeadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      primaryDomain: "ROBOT",
      status: "GO",
      postedAt: new Date().toISOString(),
      contentHash: `hash-rfp-${Date.now()}`,
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp, requirements: rfpHandoff.requirements }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals((prev) => [data.proposal, ...prev]);
        setSelectedProposal(data.proposal);
        localStorage.removeItem("robobid_rfp_handoff");
        setRfpHandoff(null);
      }
    } catch (err) {
      console.error("Failed to create proposal from RFP handoff:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);

    const mockOpp: Partial<Opportunity> = {
      id: crypto.randomUUID(),
      organizationId: "org-robobid-default",
      providerId: "MANUAL",
      sourceId: `manual-${Date.now()}`,
      title: newTitle,
      announcingAgency: newAgency || "정부 주관기관",
      bidType: "R_AND_D",
      primaryDomain: "ROBOT",
      status: "GO",
      submissionDeadline: newDeadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      postedAt: new Date().toISOString(),
      contentHash: "hash-manual",
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: mockOpp }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals((prev) => [data.proposal, ...prev]);
        setSelectedProposal(data.proposal);
        setShowCreateModal(false);
        setNewTitle("");
        setNewAgency("");
        setNewDeadline("");
      }
    } catch (err) {
      console.error("Failed to create proposal:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromSample = async (index: number = 0) => {
    const opp = SAMPLE_OPPORTUNITIES[index] || SAMPLE_OPPORTUNITIES[0];
    setCreating(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals((prev) => [data.proposal, ...prev]);
        setSelectedProposal(data.proposal);
      }
    } catch (err) {
      console.error("Failed to create proposal from sample:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveSection = async (
    sectionCode: string,
    content: string,
    status: SectionStatus
  ) => {
    if (!selectedProposal) return;
    try {
      const res = await fetch(`/api/proposals/${selectedProposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionCode, contentMarkdown: content, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProposal((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            sections: prev.sections?.map((s) =>
              s.sectionCode === sectionCode ? data.section : s
            ),
          };
        });
      }
    } catch (err) {
      console.error("Failed to save section:", err);
    }
  };

  const handleGenerateDraft = async (sectionCode?: string) => {
    if (!selectedProposal) return;
    try {
      const oppPayload: Partial<Opportunity> = {
        id: selectedProposal.opportunityId,
        title: selectedProposal.title.replace("[제안서] ", ""),
        announcingAgency: selectedProposal.metadata?.announcingAgency || "주관기관",
        organizationId: selectedProposal.organizationId,
        providerId: "MANUAL",
        sourceId: "src",
        bidType: "R_AND_D",
        primaryDomain: "ROBOT",
        status: "GO",
        submissionDeadline: selectedProposal.targetSubmissionDate || new Date().toISOString(),
        postedAt: new Date().toISOString(),
        contentHash: "hash",
        currentVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 사내 역량 자산(Vault) 실시간 로드하여 RAG 프롬프트에 주입
      let vaultCaps: any[] = [];
      try {
        const vRes = await fetch("/api/vault");
        if (vRes.ok) {
          const vData = await vRes.json();
          vaultCaps = vData.capabilities || [];
        }
      } catch {
        // fallback to server store
      }

      const res = await fetch(`/api/proposals/${selectedProposal.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: oppPayload,
          capabilities: vaultCaps,
          requirements: (selectedProposal.metadata as any)?.parsedRequirements || [],
          sectionCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedProposal((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            sections: data.sections,
          };
        });
      }
    } catch (err) {
      console.error("Failed to generate draft:", err);
    }
  };

  const handleCreateVersionSnapshot = async (summary: string) => {
    if (!selectedProposal) return;
    try {
      const res = await fetch(`/api/proposals/${selectedProposal.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeSummary: summary }),
      });
      if (res.ok) {
        setSelectedProposal((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentVersion: prev.currentVersion + 1,
          };
        });
      }
    } catch (err) {
      console.error("Failed to create snapshot:", err);
    }
  };

  // 상세 워크스페이스 뷰 진입
  if (selectedProposal) {
    return (
      <ProposalWorkspaceView
        proposal={selectedProposal}
        onBack={() => {
          setSelectedProposal(null);
          fetchProposals();
        }}
        onSaveSection={handleSaveSection}
        onGenerateDraft={handleGenerateDraft}
        onCreateVersionSnapshot={handleCreateVersionSnapshot}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              제안서 워크스페이스 (Proposals)
            </h1>
            <Badge variant="outline" className="text-xs">
              Evidence 기반 RAG 초안 엔진
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            GO 결정이 완료된 공모의 70~80% 수준 사업계획서 초안을 사내 증빙 기반으로 조립하고 검토합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProposals}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>새로고침</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCreateFromSample(0)}
            disabled={creating}
            className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>실습용 AGV 로봇 제안서 즉시 생성</span>
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>새 제안서 작성</span>
          </Button>
        </div>
      </div>

      {/* RFP Requirements Handoff Banner */}
      {rfpHandoff && (
        <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  RFP 분석에서 요구사항 데이터가 전달되었습니다
                </span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  요구사항 {rfpHandoff.requirements?.length || 0}건
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                [{rfpHandoff.announcingAgency}] {rfpHandoff.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-8"
              onClick={() => {
                localStorage.removeItem("robobid_rfp_handoff");
                setRfpHandoff(null);
              }}
            >
              닫기
            </Button>
            <Button
              size="sm"
              onClick={handleCreateFromRfpHandoff}
              disabled={creating}
              className="text-xs font-bold gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{creating ? "생성 중..." : "인계 데이터로 제안서 생성"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* 2. Proposal List */}
      {proposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((prop) => (
            <Card
              key={prop.id}
              className="hover:border-primary/50 transition-colors cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedProposal(prop)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    v{prop.currentVersion}
                  </Badge>
                  <Badge
                    variant={prop.status === "APPROVED" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {prop.status}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 line-clamp-2">
                  {prop.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {prop.metadata?.announcingAgency || "주관기관"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 border-t mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>제출 목표: {prop.targetSubmissionDate ? prop.targetSubmissionDate.slice(0, 10) : "미정"}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary">
                  <span>작성하기</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <EmptyState
            icon={FileSpreadsheet}
            title="작성 중인 제안서가 없습니다"
            description="API Key 없이도 [실습용 AGV 로봇 제안서 즉시 생성] 버튼을 누르면 실제 조달청 물품구매 공고 기반 표준 7대 목차 워크스페이스가 즉시 활성화됩니다."
            actionLabel={creating ? "생성 중..." : "실습용 AGV 로봇 제안서 즉시 생성하기"}
            onAction={() => handleCreateFromSample(0)}
          />
        </div>
      )}

      {/* 3. New Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-lg max-w-md w-full p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                새 제안서 워크스페이스 생성
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              공모 정보를 입력하면 표준 7대 대목차(TOC)와 사내 역량 RAG 바인딩 구조가 자동 초기화됩니다.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">공모 사업명 (필수)</label>
                <input
                  type="text"
                  placeholder="예: 지능형 물류 배송 로봇 상용화 실증 과제"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">발주 공공기관</label>
                <input
                  type="text"
                  placeholder="예: 중소벤처기업부, 한국로봇산업진흥원"
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">최종 제출 마감일</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleCreateProposal}
                disabled={creating || !newTitle.trim()}
              >
                {creating ? "생성 중..." : "제안서 워크스페이스 생성"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
