"use client";

import React, { useState } from "react";
import {
  Calculator,
  Scale,
  FileText,
  ShieldCheck,
  Percent,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Award,
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BidopsFormulaGuide() {
  const [activeCategory, setActiveCategory] = useState<"FIT_SCORE" | "RFP" | "ELIGIBILITY" | "A_VALUE">("FIT_SCORE");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyFormula = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("계산식이 클립보드에 복사되었습니다.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  공공입찰 산식·근거·법정규정 백서 (BidOps Standards)
                </h2>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  국가계약법 준수
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                RoboBid AI가 공모를 정량 평가하고, 요구조건을 추출하며, A값 투찰가를 산출하는 <strong>수학적 계산 공식과 법적 근거</strong>를 투명하게 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("FIT_SCORE")}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeCategory === "FIT_SCORE"
              ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
              : "border-border/70 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <Award className="h-4 w-4 shrink-0" />
          <div>
            <div className="text-xs font-semibold">1. Fit Score 적합도</div>
            <div className="text-[10px] opacity-70 font-normal">6대 정량 지표 산식</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("RFP")}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeCategory === "RFP"
              ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
              : "border-border/70 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" />
          <div>
            <div className="text-xs font-semibold">2. RFP 요구조건 추출</div>
            <div className="text-[10px] opacity-70 font-normal">원문 추적 및 6대 분류</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("ELIGIBILITY")}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeCategory === "ELIGIBILITY"
              ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
              : "border-border/70 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <div>
            <div className="text-xs font-semibold">3. 지원자격 & 수주적합률</div>
            <div className="text-[10px] opacity-70 font-normal">5대 Gate & 적격률 산식</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("A_VALUE")}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeCategory === "A_VALUE"
              ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
              : "border-border/70 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <TrendingDown className="h-4 w-4 shrink-0" />
          <div>
            <div className="text-xs font-semibold">4. A값 & 투찰하한금액</div>
            <div className="text-[10px] opacity-70 font-normal">예가 사정율 및 법정 산식</div>
          </div>
        </button>
      </div>

      {/* 3. Detailed Category Content */}
      {activeCategory === "FIT_SCORE" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Fit Score (기회 적합도 점수) 핵심 산출 공식
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] font-mono">100점 만점 기준</Badge>
              </div>
              <CardDescription className="text-xs">
                AI의 임의 추측(환각)을 원천 차단하고, 6대 객관적 지표와 위험 감점을 결합한 100% 결정론적(Deterministic) 산식입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formula Box */}
              <div className="rounded-lg bg-muted/60 border p-4 font-mono text-xs space-y-2 relative">
                <div className="text-muted-foreground text-[11px] font-sans font-medium">기본 산식 (Formula):</div>
                <div className="text-primary font-bold text-sm tracking-wide overflow-x-auto py-1">
                  Total Score = max(0, min(100, [기술(25) + 전략(20) + 역량(20) + 증빙(15) + 재무(10) + 일정(10)] - 리스크감점))
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 h-7 px-2 text-xs gap-1"
                  onClick={() =>
                    copyFormula(
                      "Total Score = max(0, min(100, (Tech + Strategic + Capability + Evidence + Financial + Schedule) - RiskPenalty))",
                      "fit-formula"
                    )
                  }
                >
                  {copiedIndex === "fit-formula" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedIndex === "fit-formula" ? "복사됨" : "산식 복사"}</span>
                </Button>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">1. 기술 적합도 (Technical Fit)</span>
                    <span className="font-mono text-xs text-primary font-semibold">최대 25점</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    공고문 및 제안요청서의 핵심 기술 키워드와 사내 등록 기술(TECHNOLOGY)의 일치 건수에 따라 차등 부여됩니다.
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/90 bg-muted/30 p-1.5 rounded">
                    • 2건 이상 일치: 25점 | • 1건 일치: 20점 | • 보유기술 있으나 매칭 미흡: 15점 | • 미보유: 7.5점
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">2. 전략적 적합도 (Strategic Fit)</span>
                    <span className="font-mono text-xs text-primary font-semibold">최대 20점</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    우리 기업의 1순위 핵심 도메인과의 일치도를 판정하여 사업 추진의 전략적 우선순위를 평가합니다.
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/90 bg-muted/30 p-1.5 rounded">
                    • 로봇(ROBOT): 20점 | • 자동화/HW: 17점 | • AI/ICT: 14점 | • 일반 공모: 8점
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">3. 역량 보유도 (Capability Fit)</span>
                    <span className="font-mono text-xs text-primary font-semibold">최대 20점</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    공공조달 적격심사 신인도 가점 및 기술능력평가 배점 기준에 따라 사내 유효 자산을 합산합니다.
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/90 bg-muted/30 p-1.5 rounded">
                    • 특허(건당 2.5점, 최대 5점) + 인증(건당 2.5점, 최대 5점) + 실적(건당 5.0점, 최대 10점)
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">4. 증빙 준비도 (Evidence Readiness)</span>
                    <span className="font-mono text-xs text-primary font-semibold">최대 15점</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    등록된 사내 자산 중 실제 원본 증빙 파일(특허등록증, 실적증명원 등)이 첨부되어 검증 가능한 비율입니다.
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/90 bg-muted/30 p-1.5 rounded">
                    • 산식: (첨부 증빙 보유 자산 수 / 전체 등록 자산 수) × 15점
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">5. 예산/재무 적합도 (Financial Fit)</span>
                    <span className="font-mono text-xs text-primary font-semibold">최대 10점</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    공고된 배정예산 규모를 기준으로 투입 대비 기대 매출 및 사업 규모 적합성을 평가합니다.
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/90 bg-muted/30 p-1.5 rounded">
                    • 3억원 이상: 10점 | • 1억 ~ 3억원: 8점 | • 1억원 미만: 6점 | • 미공시: 5점
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">6. 일정 준비도 (Schedule Readiness)</span>
                    <span className="font-mono text-xs text-primary font-semibold">최대 10점</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    제출 마감일까지의 잔여 일수(D-Day)를 기반으로 고품질 제안서 작성 가능성을 판정합니다.
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground/90 bg-muted/30 p-1.5 rounded">
                    • D-14일 이상: 10점 | • D-7 ~ D-13일: 7점 | • D-3 ~ D-6일: 4점 | • D-3일 미만: 1점
                  </div>
                </div>
              </div>

              {/* Risk Penalty & Final Decision */}
              <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  리스크 감점(Penalty) 및 추천 의사결정 판정 기준
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">• 자격 미달(FAIL) 항목 발견 시:</span> -30점 즉시 감점
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">• 미확인(UNKNOWN) 항목 존재 시:</span> -10점 감점
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">• 마감 D-5일 이내 임박:</span> -5점 감점
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">• 수주 확률(Win Rate) 여부:</span> 본 점수는 확률이 아닌 <strong>적격성 지표</strong>임
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 flex flex-wrap gap-2 text-[11px]">
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">80점 이상 & 자격 통과: GO (적극 참여)</Badge>
                  <Badge className="bg-blue-600 text-white hover:bg-blue-600">65~79점: GO_WITH_CONDITIONS (조건부/컨소시엄)</Badge>
                  <Badge className="bg-amber-600 text-white hover:bg-amber-600">50~64점: HOLD (보류/재검토)</Badge>
                  <Badge className="bg-rose-600 text-white hover:bg-rose-600">50점 미만 또는 FAIL: NO_GO (포기 권고)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeCategory === "RFP" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  RFP 제안요청서 자동 분석 기준 및 6대 영역 분류 규정
                </CardTitle>
                <Badge variant="secondary" className="text-[11px]">100% 원문 추적성 보장</Badge>
              </div>
              <CardDescription className="text-xs">
                공공입찰 공고문, 과업지시서, 제안요청서(HWPX, PDF, DOCX)의 목차 구조와 표 데이터를 안전 분석하여 요구조건을 추출합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">1. ELIGIBILITY</Badge>
                  <div className="text-xs font-bold text-foreground">신청·참가자격 요건</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    창업 업력, 본사 소재지(지역제한), 중소기업 확인, 면허 등록, 부정당업자 제재 여부를 추출합니다.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">2. TECHNICAL</Badge>
                  <div className="text-xs font-bold text-foreground">과업·기술규격 요건</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    하드웨어 사양, 소프트웨어 스택, ROS2/센서 인터페이스, 보안 적합성 등 필수 개발 과업을 추출합니다.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">3. FINANCIAL</Badge>
                  <div className="text-xs font-bold text-foreground">사업비 & 예산 편성</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    배정예산, 추정가격, 정부지원금 한도, 기업부담금(현금/현물) 매칭 비율, 부가세 포함 여부를 판정합니다.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30">4. SUBMISSION</Badge>
                  <div className="text-xs font-bold text-foreground">제출 구비서류 목록</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    사업계획서 서식, 법인인감증명서, 신용평가서, 실적증명원 등 제출 필수 목록 체크리스트를 자동 생성합니다.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">5. SCHEDULE</Badge>
                  <div className="text-xs font-bold text-foreground">추진 일정 & 마일스톤</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    착수일, 착수보고서 제출, 중간점검, 시제품 실증 기간, 최종 납품 기한을 타임라인으로 추출합니다.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/30">6. EVALUATION</Badge>
                  <div className="text-xs font-bold text-foreground">평가배점 & 우대 가점</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    기술평가(80~90%)와 가격평가(10~20%) 배점 비율, 신인도 가점(이노비즈, 여성기업 등) 항목을 식별합니다.
                  </p>
                </div>
              </div>

              {/* Legal Invariant Box */}
              <div className="p-4 rounded-lg bg-muted/40 border space-y-2 text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-primary" />
                  RFP 분석 3대 원칙 (Extraction Invariants)
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                  <li><strong>원문 1:1 인용 필수:</strong> AI가 요약 문장을 만들어내지 않고, 반드시 원문의 해당 장·절(Section)과 원문 문장(Quote)을 증빙합니다.</li>
                  <li><strong>법적 의무성 자동 식별:</strong> 문장 내 `~하여야 한다`, `필수`, `제한된다`, `제출하여야 함`을 감지하여 미이행 시 실격 처리되는 필수 요건을 분리합니다.</li>
                  <li><strong>제안서 자동 매핑:</strong> 추출된 각 요구조건(`REQ-TEC-001` 등)은 제안서 목차 트리(1장~5장)에 1:1로 자동 대응되어 미작성 누락을 차단합니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeCategory === "ELIGIBILITY" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  적합도(Eligibility Gate) 검사 및 수주적합률 산식
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] font-mono">사전 실격 방지 게이트</Badge>
              </div>
              <CardDescription className="text-xs">
                국가계약법 시행령 제12조(경쟁입찰의 참가자격) 및 공고문 참가자격에 근거하여 탈락 위험을 사전 차단합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formula Box */}
              <div className="rounded-lg bg-muted/60 border p-4 font-mono text-xs space-y-2 relative">
                <div className="text-muted-foreground text-[11px] font-sans font-medium">수주 적합률 & 적격률 산식 (Mathematical Rates):</div>
                <div className="text-primary font-bold text-sm tracking-wide py-1">
                  수주적합률 (Fit Rate, %) = (총 획득 점수 / 100점) × 100
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  자격 통과율 (Pass Rate, %) = (PASS 검사 항목 수 / 전체 필수 검사 항목 수) × 100
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 h-7 px-2 text-xs gap-1"
                  onClick={() =>
                    copyFormula(
                      "수주적합률(%) = (총획득점수 / 100) * 100\n자격통과율(%) = (PASS항목수 / 전체필수항목수) * 100",
                      "elig-formula"
                    )
                  }
                >
                  {copiedIndex === "elig-formula" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedIndex === "elig-formula" ? "복사됨" : "산식 복사"}</span>
                </Button>
              </div>

              {/* 5 Rules Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="p-2.5">검사 코드</th>
                      <th className="p-2.5">규정 항목</th>
                      <th className="p-2.5">법령 및 공고 기준</th>
                      <th className="p-2.5">판정 논리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[11px]">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">RULE-AGE</td>
                      <td className="p-2.5 font-semibold">업력 제한</td>
                      <td className="p-2.5 text-muted-foreground">중소기업창업지원법상 3년(초기)/7년(도약기) 이내</td>
                      <td className="p-2.5">공고일 기준 (평가일 - 법인설립일) ≤ 3년 또는 7년</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">RULE-REGION</td>
                      <td className="p-2.5 font-semibold">지역 제한</td>
                      <td className="p-2.5 text-muted-foreground">국가계약법 시행령 제21조(지역제한경쟁)</td>
                      <td className="p-2.5">사업자등록증 본사/지사/연구소 관할 특별시·광역시·도 일치</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">RULE-SCALE</td>
                      <td className="p-2.5 font-semibold">기업 규모</td>
                      <td className="p-2.5 text-muted-foreground">중소기업기본법 제2조(중소기업자의 범위)</td>
                      <td className="p-2.5">중소기업확인서 유효기간 내 중기업/소기업/소상공인 해당 여부</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">RULE-CERT</td>
                      <td className="p-2.5 font-semibold">인증·면허</td>
                      <td className="p-2.5 text-muted-foreground">소프트웨어산업진흥법, 정보통신공사업법 등</td>
                      <td className="p-2.5">공고 요구 전문 면허/인증 등록 여부 및 유효기간 검증</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">RULE-FINANCIAL</td>
                      <td className="p-2.5 font-semibold">재무·신용</td>
                      <td className="p-2.5 text-muted-foreground">조달청 물품·용역 적격심사 세부기준</td>
                      <td className="p-2.5">완전자본잠식 여부, 부채비율, 회사채/기업어음 신용평가등급(B- 이상)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invariant Warning */}
              <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs space-y-1">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  RoboBid 핵심 철칙: UNKNOWN의 자동 PASS 변환 금지
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  사내 증빙 볼트에 법인설립일이나 사업자등록증이 등록되지 않아 확인 불가능한 상태(UNKNOWN)인 경우, 
                  <strong> 절대로 자동으로 PASS로 간주하지 않습니다.</strong> 반드시 사용자가 사내 프로필을 보완하거나 수동 검토를 완료해야 투찰 승인으로 전환됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeCategory === "A_VALUE" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  A값 공제 투찰하한금액 및 사정율 산정 법정 계산식
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] font-mono">기획재정부 계약예규 준수</Badge>
              </div>
              <CardDescription className="text-xs">
                조달청 나라장터 및 국가계약법령에 따른 비투찰 국민연금·건강보험료 등 고정원가 공제 공식입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formula Box */}
              <div className="rounded-lg bg-muted/60 border p-4 font-mono text-xs space-y-3 relative">
                <div className="text-muted-foreground text-[11px] font-sans font-medium">1. A값이 적용된 공모의 법정 투찰하한금액 산식 (A &gt; 0):</div>
                <div className="text-primary font-bold text-sm tracking-wide overflow-x-auto py-1">
                  투찰하한금액 = ⌈(예정가격 - A) × 낙찰하한율⌉ + A
                </div>
                <div className="text-muted-foreground text-[11px] font-sans font-medium pt-1">2. A값이 없는 일반 공모 산식 (A = 0):</div>
                <div className="text-foreground font-bold text-xs tracking-wide overflow-x-auto">
                  투찰하한금액 = ⌈예정가격 × 낙찰하한율⌉
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 h-7 px-2 text-xs gap-1"
                  onClick={() =>
                    copyFormula(
                      "투찰하한금액 = Math.ceil((예정가격 - A) * (낙찰하한율 / 100)) + A",
                      "avalue-formula"
                    )
                  }
                >
                  {copiedIndex === "avalue-formula" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedIndex === "avalue-formula" ? "복사됨" : "산식 복사"}</span>
                </Button>
              </div>

              {/* Calculation Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border bg-card space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-primary" />
                    A값(사후정산 고정비용)의 법적 정의
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    국가계약법 및 계약예규에 따라, 건설·용역·물품 제조 시 투찰율을 곱해 깎아서는 안 되는 
                    <strong> 법정 사후정산 항목의 합계액</strong>입니다.
                  </p>
                  <ul className="text-[10px] text-muted-foreground/90 space-y-1 bg-muted/40 p-2 rounded">
                    <li>• 국민건강보험료, 노인장기요양보험료, 국민연금보험료</li>
                    <li>• 퇴직공제부금비, 산업안전보건관리비, 안전관리비, 품질관리비</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg border bg-card space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    원단위 절상(Ceil) 처리가 필수인 이유
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    조달청 적격심사 규정상 산출된 투찰하한금액에서 <strong>단 1원이라도 미달할 경우 즉시 실격(탈락)</strong> 처리됩니다.
                  </p>
                  <div className="text-[10px] text-muted-foreground/90 bg-muted/40 p-2 rounded">
                    소수점 이하가 발생하면 무조건 올림(`Math.ceil`) 처리하여 하한가 미달로 인한 입찰 무효를 기술적으로 원천 방지합니다.
                  </div>
                </div>
              </div>

              {/* 15 Preliminary Prices */}
              <div className="p-3.5 rounded-lg border bg-card space-y-2 text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-primary" />
                  15개 복수예비가격 및 예정가격 산정 원리
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  나라장터는 공고 시 기초금액을 기준으로 ±2% ~ ±3% (통상 97% ~ 103%) 범위 내에서 15개의 복수예비가격을 난수로 생성합니다. 
                  모든 입찰 참가업체가 2개씩 추첨하여 <strong>가장 많이 선택된 최빈 4개 예비가격의 산술평균</strong>으로 최종 예정가격이 결정됩니다.
                </p>
                <div className="rounded bg-muted/40 p-2 font-mono text-[11px] text-foreground">
                  예정가격 = (선택된 예비가격1 + 예비가격2 + 예비가격3 + 예비가격4) / 4
                </div>
              </div>

              {/* Numerical Example Card */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2 text-xs">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  실제 수치 시뮬레이션 예시
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="text-muted-foreground block text-[10px]">기초금액</span>
                    <span className="font-mono font-bold text-foreground">500,000,000원</span>
                  </div>
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="text-muted-foreground block text-[10px]">A값 (고정비)</span>
                    <span className="font-mono font-bold text-primary">25,000,000원</span>
                  </div>
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="text-muted-foreground block text-[10px]">낙찰하한율</span>
                    <span className="font-mono font-bold text-foreground">87.995%</span>
                  </div>
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="text-muted-foreground block text-[10px]">예정가격(사정율 99.8%)</span>
                    <span className="font-mono font-bold text-foreground">499,000,000원</span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono bg-background/90 p-2.5 rounded border border-border/80">
                  계산: ⌈(499,000,000 - 25,000,000) × 0.87995⌉ + 25,000,000 = <strong className="text-primary text-xs">442,096,300원 (최종 투찰하한선)</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
