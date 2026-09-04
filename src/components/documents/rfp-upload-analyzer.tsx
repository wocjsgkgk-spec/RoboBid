"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Table,
  ListOrdered,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ParsedDocumentResult } from "@/types/document";
import { Opportunity } from "@/types";
import { toast } from "@/components/ui/sonner-toast";
import Link from "next/link";

interface RfpUploadAnalyzerProps {
  onOpportunityCreated?: (data: any) => void;
}

export function RfpUploadAnalyzer({ onOpportunityCreated }: RfpUploadAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedDocumentResult | null>(null);
  const [activeTab, setActiveTab] = useState<"requirements" | "tables" | "raw">("requirements");
  const [dragOver, setDragOver] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [createdProposalId, setCreatedProposalId] = useState<string | null>(null);

  const handleCreateProposalFromRfp = async () => {
    if (!parseResult) return;
    setCreatingProposal(true);
    try {
      const opp: Opportunity = {
        id: crypto.randomUUID(),
        organizationId: "b0000000-0000-0000-0000-000000000001",
        providerId: "RFP_PARSER",
        sourceId: `rfp-${Date.now()}`,
        title: `[공모 제안] ${parseResult.fileName.replace(/\.[^/.]+$/, "")}`,
        announcingAgency: "공공 발주기관 (RFP 분석 추출)",
        demandingAgency: null,
        bidType: "R_AND_D",
        primaryDomain: "ROBOT",
        status: "GO",
        allocatedBudget: 500000000,
        submissionDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        postedAt: new Date().toISOString(),
        contentHash: parseResult.contentHash || "hash-rfp",
        currentVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: opp,
          requirements: parseResult.requirementCandidates,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedProposalId(data.proposal?.id || "created");
        toast.success("제안서 워크스페이스 생성 완료", {
          description: "RFP 요구사항이 연결된 표준 7대 목차가 생성되었습니다.",
        });
        onOpportunityCreated?.(data.proposal);
      }
    } catch (err: any) {
      toast.error("제안서 생성 실패", { description: err.message });
    } finally {
      setCreatingProposal(false);
    }
  };

  // 로컬 샘플 RFP 시나리오 텍스트
  const loadSampleRfp = async (type: "KONEPS_ROBOT" | "TIPA_RD") => {
    setAnalyzing(true);
    let sampleText = "";
    let sampleName = "";

    if (type === "KONEPS_ROBOT") {
      sampleName = "2026_조달청_항만물류_무인자율주행AGV_구매규격서.hwpx";
      sampleText = `
[제안요청서 - 핵심 규격서]
공고명: 2026년도 항만 물류 무인 자율주행 AGV 로봇 4대 구매 및 통합 관제 소프트웨어 구축
발주처: 부산항만공사 / 조달청
배정예산: 850,000,000원 (부가가치세 포함)
납품기한: 계약 체결일로부터 180일 이내
낙찰자 결정방식: 협상에 의한 계약 (기술평가 80%, 가격평가 20%)

1. 과업 요구조건 (과업요구사항)
[필수-1] 자율주행 AGV 차체는 최대 적재하중 1,500kg 이상을 지원해야 하며 방수·방진 IP65 등급을 충족해야 함.
[필수-2] 실시간 3D LiDAR 센서 융합 기반의 SLAM 기술을 적용하여 측위 오차 ±20mm 이내를 보장해야 함.
[필수-3] 공인인증기관(한국로봇산업진흥원 등)의 신뢰성 시험성적서를 준공 검사 시 필수 제출해야 함.
[선택-4] 5G 특화망(이음5G) 보안 모듈 연동 및 웹 기반 원격 실시간 관제 대시보드를 제공할 것.

2. 입찰 참가 자격 및 제출 서류
- 사업자등록증 사본 1부
- 법인등기부등본 및 인감증명서 1부
- 신용평가등급확인서 (공공기관 제출용) 1부
- 최근 3개년 유사 자율주행 로봇 납품 실적증명원 각 1부
- 보안서약서 및 청렴계약이행서약서 각 1부

3. 평가 배점표
- 기술능력평가 (80점): 정량평가 20점(경영상태 10점, 수행실적 10점) + 정성평가 60점(기술이해도, 아키텍처, 사업관리)
- 입찰가격평가 (20점)
      `.trim();
    } else {
      sampleName = "2026_중기부_제조공정_AI협동로봇_공모지침.docx";
      sampleText = `
[사업 공고문]
과제명: 2026년도 중소기업 제조공정 고도화를 위한 AI 협동로봇 안전제어 솔루션 개발
주관기관: 중소기업기술정보진흥원 (TIPA)
지원규모: 총 정부지원금 420,000,000원 이내 (최대 12개월)
민간부담금: 총 사업비의 25% 이상 (현금 10% 이상)

1. 연구개발 목표
- 작업자-로봇 협업 공간 내 실시간 안전거리 감응형 충돌회피 지능 알고리즘 개발
- ISO 10218 및 ISO/TS 15066 협동로봇 국제 안전규격 만족 및 인증 획득
- 제조 현장 라인 1개소 이상 실증 적용 및 생산성 25% 이상 향상 검증

2. 우대 가점 기준 (최대 5.0점)
- 벤처기업 또는 이노비즈 인증 기업 (+1.0점)
- 여성기업 또는 청년창업기업 (+1.5점)
- 로봇/AI 관련 등록 특허 보유 기업 (+1.0점)

3. 필수 제출 서류
- 사업계획서 본문 및 요약서
- 중소기업확인서 및 사업자등록증
- 연구개발계획서 증빙서류 (특허등록증, 인증서 사본)
- 최근 2개년 재무제표증명원
      `.trim();
    }

    try {
      const res = await fetch("/api/documents/parse-rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: sampleText, fileName: sampleName }),
      });
      if (res.ok) {
        const data = await res.json();
        setParseResult(data.result);
      }
    } catch (err) {
      console.error("Failed to parse sample RFP:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/parse-rfp", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setParseResult(data.result);
      }
    } catch (err) {
      console.error("File parsing error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                RFP 공고문 심층 파서 (Document Intelligence)
              </CardTitle>
              <CardDescription className="text-xs">
                HWPX, DOCX, PDF 제안요청서 파일을 분석하여 핵심 요구사항 및 제출 서류 자동 추출
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Zero Hallucination 파서
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Upload Zone & Sample Buttons */}
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 bg-muted/10"
            }`}
          >
            <input
              type="file"
              id="rfp-file-input"
              accept=".hwpx,.hwp,.docx,.pdf,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="rfp-file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {analyzing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {analyzing ? "문서 구조 분해 및 요구사항 추출 중..." : "RFP 제안요청서 파일 업로드"}
              </p>
              <p className="text-xs text-muted-foreground">
                .hwpx, .docx, .pdf, .txt 파일 지원 (드래그 앤 드롭 또는 클릭)
              </p>
            </label>
          </div>

          {/* Quick Demo Pre-load buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/20 border border-border/70 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              보유하신 파일이 없으신가요? 실제 공공조달 샘플로 즉시 체험:
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleRfp("KONEPS_ROBOT")}
                disabled={analyzing}
                className="h-7 text-xs gap-1"
              >
                조달청 AGV 로봇 RFP 로드
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleRfp("TIPA_RD")}
                disabled={analyzing}
                className="h-7 text-xs gap-1"
              >
                중기부 AI협동로봇 공모문 로드
              </Button>
            </div>
          </div>
        </div>

        {/* Parsed Result Display */}
        {parseResult && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Header Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{parseResult.fileName}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    추출된 섹션 {parseResult.sections.length}개 · 표 {parseResult.tables.length}개 · 
                    요구사항 후보 {parseResult.requirementCandidates.length}건 감지됨
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-emerald-600 text-white text-xs">
                  분석 완료 (PARSED)
                </Badge>
                <Button
                  size="sm"
                  onClick={handleCreateProposalFromRfp}
                  disabled={creatingProposal}
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
                >
                  {creatingProposal ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  )}
                  <span>이 RFP로 새 제안서 작성</span>
                </Button>
              </div>
            </div>

            {/* Created Proposal Banner */}
            {createdProposalId && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  새 제안서 워크스페이스가 성공적으로 준비되었습니다!
                </span>
                <Link
                  href="/proposals"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>제안서 에디터로 이동하기</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border text-xs">
              <button
                onClick={() => setActiveTab("requirements")}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === "requirements"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                추출된 과업 요구사항 ({parseResult.requirementCandidates.length})
              </button>
              <button
                onClick={() => setActiveTab("tables")}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === "tables"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                추출된 표 데이터 ({parseResult.tables.length})
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === "raw"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                추출 원문 텍스트
              </button>
            </div>

            {/* Tab 1: Requirements Candidates */}
            {activeTab === "requirements" && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {parseResult.requirementCandidates.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    추출된 요구사항 후보가 없습니다.
                  </p>
                ) : (
                  parseResult.requirementCandidates.map((req, idx) => (
                    <div
                      key={req.reqCode || idx}
                      className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {req.title || req.reqCode || `요구조건 #${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={req.isMandatory ? "destructive" : "secondary"}
                            className="text-[10px] h-5"
                          >
                            {req.isMandatory ? "필수 요건" : "일반 요건"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {req.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {req.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Tables */}
            {activeTab === "tables" && (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {parseResult.tables.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    문서 내 표(Table)가 발견되지 않았습니다.
                  </p>
                ) : (
                  parseResult.tables.map((table, tIdx) => (
                    <div
                      key={table.id || tIdx}
                      className="rounded-xl border border-border overflow-hidden text-xs"
                    >
                      <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground">
                          <tr>
                            {table.headers.map((h, i) => (
                              <th key={i} className="py-2 px-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-muted/30">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-2 px-3 text-muted-foreground">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Raw Text */}
            {activeTab === "raw" && (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground leading-relaxed">
                  {parseResult.rawText}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
