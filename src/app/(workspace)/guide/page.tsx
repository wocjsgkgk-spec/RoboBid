"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Key,
  Search,
  GitPullRequest,
  FileText,
  FileSpreadsheet,
  Calculator,
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  MousePointerClick,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GuideStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  targetUrl: string;
  icon: any;
  purpose: string;
  benefit: string;
  howTo: Array<{ step: string; desc: string }>;
  proTips: string[];
  mockup: {
    screenTitle: string;
    screenBadge: string;
    renderPreview: () => React.ReactNode;
  };
}

export default function GuidePage() {
  const [activeStepId, setActiveStepId] = useState<string>("step-1");

  const STEPS: GuideStep[] = [
    {
      id: "step-1",
      stepNumber: "STEP 01",
      title: "초기 설정 & 사내 역량 등록",
      subtitle: "API 연동 및 사내 특허/인증 등록으로 적격심사 +5.0점 만점 세팅",
      targetUrl: "/vault",
      icon: Key,
      purpose: "시스템에 공공데이터 API 키를 연결하고, 사내 보유 특허·인증·실적을 등록하여 AI가 제안서와 적격심사에 활용할 수 있도록 기초 지식을 구축합니다.",
      benefit: "조달청 및 정부 지원사업에서 요구하는 신인도 가점(최대 +5점)을 사전 확보하고, 제안서 작성 시 사내 증빙을 100% 사실 기반(Zero Hallucination)으로 자동 인용합니다.",
      howTo: [
        {
          step: "1. API 키 연동 확인 (/settings)",
          desc: "좌측 메뉴 [설정 & Admin]으로 이동하여 Google Gemini 무료 API 키 및 공공데이터포털(조달청), 기업마당 인증키가 입력되어 있는지 확인합니다.",
        },
        {
          step: "2. 사내 역량 자산 등록 (/vault)",
          desc: "[회사역량 볼트] 메뉴에서 [+ 신규 역량 등록] 버튼을 눌러 회사의 특허(등록번호), 이노비즈 인증서, 여성기업 확인서, 주요 납품실적을 등록합니다.",
        },
        {
          step: "3. 만료일 및 증빙 파일 관리",
          desc: "유효기간이 있는 인증서는 만료일을 입력해 두면 시스템이 30일/60일 전 갱신 필요 알림을 자동으로 전송합니다.",
        },
      ],
      proTips: [
        "조달청 적격심사 신인도 평가는 여성기업(+1.0), 이노비즈(+1.5), 특허(+0.5), 중소기업(+2.0) 등을 조합하면 손쉽게 상한선인 +5.0점 만점을 채울 수 있습니다.",
        "등록된 역량 자산은 제안서 작성 시 [근거: CAP-SEED-001] 형태로 자동 인용되어 심사위원에게 높은 신뢰도를 줍니다.",
      ],
      mockup: {
        screenTitle: "회사역량 볼트 (Capability Vault) 관리 화면",
        screenBadge: "사내 역량 자산 RAG 데이터베이스",
        renderPreview: () => (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">사내 등록 자산 (총 4건)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
                  신인도 가점 +5.0점 만점 충족
                </span>
              </div>
              <span className="text-[11px] text-primary font-semibold">+ 신규 역량 등록</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg border border-border bg-card/80 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-blue-600 font-bold">[인증서] 이노비즈(InnoBiz)</span>
                  <div className="text-xs font-semibold text-foreground mt-0.5">기술혁신형 중소기업 확인서</div>
                  <span className="text-[10px] text-muted-foreground">유효기간: 2027-12-31 (유효)</span>
                </div>
                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200">
                  +1.5점 가점
                </Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card/80 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-purple-600 font-bold">[특허] 지능형 로봇</span>
                  <div className="text-xs font-semibold text-foreground mt-0.5">SLAM 기반 자율주행 회피 제어</div>
                  <span className="text-[10px] text-muted-foreground">특허청 등록 (제10-2024호)</span>
                </div>
                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200">
                  +0.5점 가점
                </Badge>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-2",
      stepNumber: "STEP 02",
      title: "공모 탐색 & 실시간 공고 수집",
      subtitle: "나라장터·중기부 공고 1-Click 실시간 수집 및 AI 적합도(Fit Score) 진단",
      targetUrl: "/opportunities",
      icon: Search,
      purpose: "매일 쏟아지는 수천 건의 조달청 나라장터 입찰 및 중기부 기업마당 지원사업 중에서 우리 회사에 꼭 맞는 고수익 사업을 실시간 탐색합니다.",
      benefit: "단 한 번의 클릭으로 실시간 공고를 동기화하고, AI가 사내 기술 역량과 공고 요건을 대조하여 0~100점의 수주 적합도 점수와 핵심 요약을 제공합니다.",
      howTo: [
        {
          step: "1. 실시간 공고 동기화 클릭 (/opportunities)",
          desc: "[공모 탐색 & 360°] 화면 상단의 [실시간 공고 동기화 (KONEPS & 기업마당)] 버튼을 클릭합니다.",
        },
        {
          step: "2. AI 적합도 점수(Fit Score) 확인",
          desc: "수집된 공고 카드 상단에 표시되는 AI 적합도 점수(예: 94점 초록색 뱃지)와 배정 예산, 마감 D-Day를 확인합니다.",
        },
        {
          step: "3. 수주 파이프라인으로 이관",
          desc: "참여 가치가 높은 공고의 [수주 파이프라인 등록 (Bid Room 활성화)] 버튼을 누르면 검토 단계로 자동 이관됩니다.",
        },
      ],
      proTips: [
        "출근 직후 [오늘 & Action Center (/today)] 메뉴에 접속하면 오늘 마감 공고와 최근 등록된 추천 공고를 한눈에 브리핑받을 수 있습니다.",
        "외부에서 직접 입수한 비공개 공고나 민간 입찰은 [수동 공고 등록] 버튼을 통해 언제든 직접 추가할 수 있습니다.",
      ],
      mockup: {
        screenTitle: "공모 탐색 360° 워크스페이스",
        screenBadge: "나라장터 & 기업마당 실시간 연동",
        renderPreview: () => (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">수집 공고 목록</span>
                <span className="text-[10px] text-muted-foreground">조달청 일반용역 / 물품구매</span>
              </div>
              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-bold">
                1-Click 실시간 동기화
              </span>
            </div>
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  AI 적합도 94점 (강력 추천)
                </Badge>
                <span className="text-xs font-mono font-bold text-red-500">D-7일 남음</span>
              </div>
              <div className="text-xs font-bold text-foreground">
                [부산항만공사] 스마트 항만 물류 자율이동로봇(AGV) 3단계 구축 사업
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>🏛️ 발주처: 부산항만공사</span>
                <span>💰 예산: 850,000,000원</span>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-3",
      stepNumber: "STEP 03",
      title: "수주 파이프라인 & Go / No-Go 판정",
      subtitle: "칸반 보드 기반 수주 전략 수립 및 경영진 의사결정 확정",
      targetUrl: "/pipeline",
      icon: GitPullRequest,
      purpose: "발굴된 공고의 사업성, 기술 구현 난이도, 예상 마진을 다각도로 검토하여 실제 입찰에 참여할지(GO), 포기할지(NO-GO) 전략적 결정을 내립니다.",
      benefit: "불필요한 무리한 입찰 투입 리소스를 사전에 차단하고, 수주 확정(GO) 시 담당자들에게 텔레그램 알림 및 작업(Task)이 자동 분배됩니다.",
      howTo: [
        {
          step: "1. 칸반 보드 카드 확인 (/pipeline)",
          desc: "[수주 파이프라인] 화면에서 [발굴] ➔ [검토] 단계에 위치한 공고 카드를 클릭합니다.",
        },
        {
          step: "2. [의사결정 (Go/No-Go)] 버튼 클릭",
          desc: "카드 상세 패널에서 의사결정 팝업을 열고 수주 가능성과 조건부 승인 사항(예: 특정 협력사 컨소시엄 구성)을 기재합니다.",
        },
        {
          step: "3. GO 확정 및 Bid Room 진입",
          desc: "GO를 확정하면 공고가 [제안서 작성 준비] 컬럼으로 이동하며 제안서 작성 워크스페이스가 즉시 활성화됩니다.",
        },
      ],
      proTips: [
        "GO 판정 즉시 등록된 사내 텔레그램 봇(@robobid_mycompany_bot)으로 발주처, 예산, 마감일 정보가 실시간 알림으로 전송됩니다.",
        "경쟁사가 독점하고 있는 규격이거나 필수 면허가 부족한 경우 과감히 NO-GO로 분류하여 리소스를 절약하세요.",
      ],
      mockup: {
        screenTitle: "수주 파이프라인 (Bid Room) 칸반 보드",
        screenBadge: "5단계 수주 라이프사이클 관리",
        renderPreview: () => (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg border border-border bg-muted/30">
              <span className="font-bold text-muted-foreground block mb-2">1. 신규 발굴 (Inbox)</span>
              <div className="p-2 rounded bg-card border text-[11px] font-medium text-left">
                스마트 물류 AGV...
                <span className="block text-[9px] text-muted-foreground mt-1">예산: 8.5억원</span>
              </div>
            </div>
            <div className="p-2 rounded-lg border border-primary/40 bg-primary/5">
              <span className="font-bold text-primary block mb-2">2. 입찰 추진 확정 (GO)</span>
              <div className="p-2 rounded bg-card border border-primary/30 text-[11px] font-bold text-left text-primary">
                항만 자율주행 AGV
                <span className="block text-[9px] text-emerald-600 mt-1">✓ GO 승인 완료</span>
              </div>
            </div>
            <div className="p-2 rounded-lg border border-border bg-muted/30">
              <span className="font-bold text-muted-foreground block mb-2">3. 제안서 작성 중</span>
              <div className="p-2 rounded bg-card border text-[11px] font-medium text-left">
                초안 75% 완성
                <span className="block text-[9px] text-blue-500 mt-1">교차 검증 대기</span>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-4",
      stepNumber: "STEP 04",
      title: "RFP 제안요청서 심층 AI 분석",
      subtitle: "HWP·HWPX·PDF 공고문 업로드 및 치명적 독소조항·감점 리스크 진단",
      targetUrl: "/rfp",
      icon: FileText,
      purpose: "발주처가 배포한 수십~수백 페이지의 복잡한 제안요청서(RFP) 파일을 AI로 파싱하여 핵심 과업, 기술 요구조건, 평가 배점표를 자동 추출합니다.",
      benefit: "입찰 참가 자격 미달로 인한 즉시 실격(Disqualification) 위험과 과도한 지체상금·위약벌 등 독소조항을 10초 만에 완벽히 필터링합니다.",
      howTo: [
        {
          step: "1. RFP 파일 드래그 & 드롭 (/rfp)",
          desc: "[RFP & Compliance] 화면의 업로드 영역에 발주처에서 다운로드한 HWP, HWPX, PDF, DOCX 파일을 끌어다 놓습니다.",
        },
        {
          step: "2. AI 심층 분석 실행",
          desc: "파일 파싱과 동시에 Google Gemini AI가 핵심 과업 요약, 배점표, 위험 조항을 실시간 분석합니다.",
        },
        {
          step: "3. 컴플라이언스 매트릭스 확인",
          desc: "추출된 요구사항 표에서 필수 여부(Mandatory), 충족 상태, 담당자 지정 및 사내 증빙 매핑을 점검합니다.",
        },
      ],
      proTips: [
        "지체상금율(1일당 0.125%~0.25%)이 정부 표준 계약예규보다 과도하게 높게 책정된 공고는 계약 협상 시 특수조건 수정을 요구해야 합니다.",
        "직접생산확인증명서 세부품명번호 10자리가 공고문과 단 1자리라도 다르면 즉시 실격되므로 반드시 대조하세요.",
      ],
      mockup: {
        screenTitle: "RFP AI Compliance Auditor 진단 결과",
        screenBadge: "Google Gemini Flash 심층 분석",
        renderPreview: () => (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-700 dark:text-amber-300">독소조항 및 입찰 리스크 감지 (2건)</span>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200 mt-0.5">
                  • <strong>지체상금 특약</strong>: 1일당 0.2%(계약예규 표준 0.125% 대비 1.6배 높음)<br />
                  • <strong>필수 면허</strong>: 정보통신공사업 면허 및 로봇제조 직접생산증명 필수
                </p>
              </div>
            </div>
            <div className="p-2 rounded-lg border bg-card/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">추출된 핵심 기술요구조건: 18건</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600">
                100% 매핑 가능
              </Badge>
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-5",
      stepNumber: "STEP 05",
      title: "AI 제안서 작성 & 4대 심사위원 모의평가",
      subtitle: "조달청 7대 표준 목차 초안 자동 생성 및 4개 관점 교차 검증 (Quality Gate)",
      targetUrl: "/proposals",
      icon: FileSpreadsheet,
      purpose: "RFP 분석 결과와 사내 역량(Vault)을 결합하여 조달청 및 R&D 표준 목차의 제안서 초안을 80% 완성도로 자동 생성하고 전문 평가위원 시각으로 사전 심사합니다.",
      benefit: "밤샘 작성 없이 몇 분 만에 증빙 번호가 명시된 전문 제안서를 얻을 수 있으며, 전략·기술·재무·행정 4대 심사위원 교차평가로 평가위원 감점을 사전에 차단합니다.",
      howTo: [
        {
          step: "1. 제안서 생성 클릭 (/proposals)",
          desc: "[제안서 & Quality Gate] 메뉴에서 대상 공고를 선택하고 [RAG 기반 전체 초안 자동 생성] 버튼을 클릭합니다.",
        },
        {
          step: "2. 7대 표준 섹션 내용 검토 및 편집",
          desc: "1.1 사업 배경부터 4.2 유지보수 계획까지 작성된 본문을 읽고, 우리 회사만의 구체적 수치나 추가 장점을 보완합니다.",
        },
        {
          step: "3. 4대 전문 심사위원 교차검토 실행",
          desc: "[4대 심사위원 교차검토 실행] 버튼을 눌러 전략(Strategy), 기술(Tech), 행정(Admin), 재무(Finance) 평가 점수와 권고사항을 수신합니다.",
        },
      ],
      proTips: [
        "제안서 본문 및 발표자료에 회사 로고나 대표자명을 표기하면 '블라인드 정성평가 위반'으로 1~3점 감점되므로 익명화 검증을 필히 거치세요.",
        "AI가 작성한 본문 중 [가정: ...]이나 [TODO: ...]로 표시된 부분은 최종 투찰 전 실무자가 반드시 확정 수치로 채워넣어야 합니다.",
      ],
      mockup: {
        screenTitle: "제안서 워크스페이스 & 4대 심사위원 모의평가",
        screenBadge: "Evidence-First RAG & Quality Gate",
        renderPreview: () => (
          <div className="space-y-2.5">
            <div className="p-2 rounded border bg-card flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">2.1 시스템 아키텍처 (기술 부문)</span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                AI_GENERATED (v2)
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[9px] text-muted-foreground block">전략·사업성</span>
                <span className="text-xs font-bold font-mono text-emerald-600">88점 (PASS)</span>
              </div>
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[9px] text-muted-foreground block">기술 아키텍처</span>
                <span className="text-xs font-bold font-mono text-emerald-600">92점 (PASS)</span>
              </div>
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="text-[9px] text-muted-foreground block">행정 규정준수</span>
                <span className="text-xs font-bold font-mono text-amber-600">79점 (보완)</span>
              </div>
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[9px] text-muted-foreground block">예산·원가타당성</span>
                <span className="text-xs font-bold font-mono text-emerald-600">85점 (PASS)</span>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-6",
      stepNumber: "STEP 06",
      title: "조달청 A값 투찰 계산기 & 파이프라인 연동",
      subtitle: "국민연금 등 고정비 공제 공식 및 15개 복수예비가격 시뮬레이션",
      targetUrl: "/tools",
      icon: Calculator,
      purpose: "국가계약법상 복수예비가격(15개 중 4개 추첨) 원리와 A값 공제 산식을 시뮬레이션하여 낙찰하한선 미달 탈락을 원천 방지하고 최적 투찰가를 산출합니다.",
      benefit: "계산된 권장 투찰가를 1-Click으로 관리 중인 공모 파이프라인에 즉시 반영하여 최종 제출 금액으로 자동 바인딩합니다.",
      howTo: [
        {
          step: "1. 기초금액 및 A값 입력 (/tools)",
          desc: "[투찰 계산도구] 메뉴에서 공고문에 명시된 기초금액(예: 8.5억원)과 A값(국민연금, 건보료 등 고정비용, 예: 4,200만원)을 입력합니다.",
        },
        {
          step: "2. 15개 복수예비가격 난수 추첨 시뮬레이션",
          desc: "[예비가격 4개 랜덤 추첨] 버튼을 눌러 사정율 골든존(99.3% ~ 99.8%) 통계 구간의 최적 투찰가를 산출합니다.",
        },
        {
          step: "3. [파이프라인에 적용] 클릭",
          desc: "산출된 최종 권장 투찰 금액 우측의 [파이프라인에 적용] 버튼을 눌러 관리 중인 입찰 공고를 선택하고 확정 반영합니다.",
        },
      ],
      proTips: [
        "A값 공제 산식: 입찰가격 = (예정가격 - A) × 낙찰하한율 + A",
        "투찰금액 원단위 소수점 처리는 반드시 **절상(CEIL, 올림)**해야 합니다. 단 1원이라도 낙찰하한가에 미달하면 부적격으로 영구 탈락합니다.",
      ],
      mockup: {
        screenTitle: "KONEPS A값 공제 투찰 시뮬레이터",
        screenBadge: "국가계약법 집행기준 공식 산식",
        renderPreview: () => (
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-primary/40 bg-card flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold">최종 권장 투찰 금액 (A값 반영)</span>
                <div className="text-xl font-bold font-mono text-primary mt-0.5">752,999,600원</div>
                <span className="text-[10px] text-emerald-600 font-medium">낙찰하한율 87.995% · 원단위 절상(CEIL) 완료</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-bold text-center">
                  파이프라인에 적용 ✓
                </span>
                <span className="block text-[9px] text-muted-foreground text-center">공모 목표가 동기화</span>
              </div>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {[1, 4, 8, 12].map((idx) => (
                <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[10px] font-mono border">
                  #{idx}번 예가 추첨됨
                </span>
              ))}
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-7",
      stepNumber: "STEP 07",
      title: "제출 마감 점검 & 휴먼 인 더 루프 승인",
      subtitle: "나라장터 지문인증 및 12개 필수 항목 최종 점검 후 전자서명",
      targetUrl: "/submissions",
      icon: Send,
      purpose: "입찰 마감 1~2시간 전, 전자서명 인증서, 보증서 납부, 투찰금액 일치 여부를 점검하고 담당자의 최종 서명으로 실수를 방지하는 안전장치입니다.",
      benefit: "AI가 일방적으로 제출하지 않고, 담당자가 직접 점검하여 서명하는 '휴먼 인 더 루프(Human-in-the-loop)' 원칙으로 투찰 사고를 0%로 만듭니다.",
      howTo: [
        {
          step: "1. 마감 체크리스트 확인 (/submissions)",
          desc: "[제출·마감 점검] 메뉴에서 참여 공고를 열고 12개 검증 항목(인증서, 제안서 암호화, 가격서 대조 등)을 순서대로 체크합니다.",
        },
        {
          step: "2. 투찰금액 최종 대사",
          desc: "계산기에서 계산하여 연동된 금액(예: 752,999,600원)과 나라장터 입력 화면의 금액이 한글/숫자 단위까지 일치하는지 확인합니다.",
        },
        {
          step: "3. 담당자 서명 후 제출 완료 확정",
          desc: "작성자 서명란에 이름을 입력하고 [제출 완료 확정] 버튼을 누르면 이력이 영구 기록되고 성과 분석 단계로 진입합니다.",
        },
      ],
      proTips: [
        "마감 30분 전에는 나라장터 서버 접속 폭주로 시스템 지연이 빈번하게 발생하므로, 마감 최소 1시간 전 투찰을 완료하는 것이 원칙입니다.",
        "공동수급(컨소시엄)의 경우 협력사의 전자협정서 승인이 마감 전일까지 완료되어야만 대표사 입찰서 제출이 가능합니다.",
      ],
      mockup: {
        screenTitle: "제출 마감 사전점검 & 서명 데스크",
        screenBadge: "휴먼 인 더 루프 (Human-in-the-loop) 안전장치",
        renderPreview: () => (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-card border flex items-center justify-between">
              <span className="font-semibold text-foreground">12개 점검 항목 통과율</span>
              <span className="text-emerald-600 font-bold font-mono">12 / 12 (100% 완료)</span>
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>나라장터 공인인증서 및 지문보안토큰 인증 통과</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>투찰금액 한글/숫자 표기 정합성 일치 (A값 산출액과 동일)</span>
              </div>
            </div>
            <div className="text-center p-1.5 bg-primary/10 rounded text-[10px] text-primary font-bold">
              담당자 전자서명: 김수석 (사업개발팀) - 제출 승인 완료
            </div>
          </div>
        ),
      },
    },
    {
      id: "step-8",
      stepNumber: "STEP 08",
      title: "실시간 AI 코파일럿 활용법",
      subtitle: "Google Gemini Flash 실시간 질의 및 조달청 규정 딥링크 즉시 실행",
      targetUrl: "/ai",
      icon: Bot,
      purpose: "복잡한 국가계약법령, 조달청 적격심사 세부기준, 컨소시엄 지분율 규정 등을 질문하면 실시간 LLM이 사내 실적과 대조하여 즉시 전문적인 분석을 제공합니다.",
      benefit: "모르는 조달 규정이 나올 때마다 법령집을 뒤질 필요 없이, 신인도 가점 받는 법, 독소조항 피하는 법을 1초 만에 컨설팅받고 관련 도구로 바로 연결됩니다.",
      howTo: [
        {
          step: "1. AI 코파일럿 접속 (/ai)",
          desc: "좌측 메뉴 [RoboBid AI 코파일럿]으로 이동합니다. 상단 헤더에 'Google Gemini Flash (실시간 가동)' 녹색 배지를 확인합니다.",
        },
        {
          step: "2. 자연어 질문 입력 또는 추천 칩 클릭",
          desc: "'조달청 적격심사에서 신인도 가점을 최대로 받으려면?', 'A값 공제 투찰 공식 원리가 뭐야?' 등 궁금한 내용을 입력합니다.",
        },
        {
          step: "3. 딥링크 추천 액션 버튼 클릭",
          desc: "AI 답변 하단에 생성된 [투찰가 시뮬레이터 열기], [RFP 심층 분석기 실행] 등의 바로가기 버튼을 누르면 해당 워크스페이스로 즉시 이동합니다.",
        },
      ],
      proTips: [
        "질문 시 '우리 회사(RoboTech) 실적 기준으로 수주 가능해?'라고 물어보면 사내 볼트에 등록된 특허/인증을 RAG로 자동 대조하여 맞춤 답변을 줍니다.",
        "답변 복사 버튼을 누르면 경영진 보고용 마크다운 형식으로 클립보드에 깔끔하게 복사됩니다.",
      ],
      mockup: {
        screenTitle: "RoboBid BidOps Copilot 대화창",
        screenBadge: "Google Gemini Flash 실시간 엔진 연동",
        renderPreview: () => (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-muted text-right text-[11px] font-medium text-foreground">
              우리 회사 특허와 인증으로 적격심사 가점 만점 받을 수 있어?
            </div>
            <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5 text-left text-[11px]">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Sparkles className="h-3 w-3" />
                <span>Google Gemini Flash 전문 분석 의견:</span>
              </div>
              <p className="text-foreground leading-relaxed">
                현재 사내 <strong>Capability Vault</strong>에 등록된 중소기업확인서(+2.0), 이노비즈(+1.5), 특허(+0.5), 여성기업(+1.0)으로 <strong>합산 +5.0점 (법정 상한선 만점)</strong> 획득이 확정적입니다!
              </p>
              <div className="pt-1 flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] bg-background">
                  근거: 조달청 일반용역 적격심사 세부기준
                </Badge>
                <span className="text-[10px] text-primary font-bold ml-auto cursor-pointer">
                  [적격심사 계산기 열기 ➔]
                </span>
              </div>
            </div>
          </div>
        ),
      },
    },
  ];

  const currentStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              RoboBid AI 시스템 사용 가이드 & 업무 매뉴얼
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              실무자 공식 핸드북
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            대한민국 공공조달(나라장터 KONEPS) 및 중기부/산자부 R&D 지원사업 수주를 위한 8단계 표준 워크플로우를 사진과 함께 쉽게 설명합니다. 단계별 실행 가이드를 확인하고 실제 기능 화면으로 바로 이동해 보세요.
          </p>
        </div>
      </div>

      {/* 2. Step Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeStepId;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                  : "bg-card hover:bg-muted/50 border-border text-foreground"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-bold ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {step.stepNumber}
                </span>
                <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <div className="text-xs font-bold leading-tight line-clamp-2">
                {step.title.split("&")[0].trim()}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Step Detail Card */}
      <Card className="border-border shadow-sm overflow-hidden">
        {/* Step Header */}
        <div className="border-b border-border bg-muted/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              {React.createElement(currentStep.icon, { className: "h-5 w-5" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{currentStep.stepNumber}</span>
                <h2 className="text-lg font-bold text-foreground">{currentStep.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground">{currentStep.subtitle}</p>
            </div>
          </div>

          <Link href={currentStep.targetUrl}>
            <Button size="sm" className="gap-1.5 font-semibold text-xs shrink-0 cursor-pointer">
              <span>{currentStep.title} 화면 바로가기</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Visual Mockup Frame (Photos / Screen Preview Simulator) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                실제 시스템 화면 미리보기 (Visual Screen Preview)
              </span>
              <Badge variant="outline" className="text-[10px]">
                {currentStep.mockup.screenBadge}
              </Badge>
            </div>

            {/* Mock Browser Frame */}
            <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
              {/* Browser Address Bar */}
              <div className="bg-muted/40 px-3 py-2 border-b border-border flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 max-w-sm bg-background border rounded px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground truncate">
                  https://robobid.ai{currentStep.targetUrl}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                  {currentStep.mockup.screenTitle}
                </span>
              </div>

              {/* Rendered Live Screen Mockup */}
              <div className="p-4 sm:p-5 bg-background/50">
                {currentStep.mockup.renderPreview()}
              </div>
            </div>
          </div>

          {/* Purpose & Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>왜 이 단계가 필요한가요? (핵심 목적)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentStep.purpose}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>도입 기대 효과 (자동화 가치)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentStep.benefit}
              </p>
            </div>
          </div>

          {/* Step-by-Step Execution Guide */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <MousePointerClick className="h-4 w-4 text-primary" />
              3단계 따라하기 (How-To Execution Steps)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentStep.howTo.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                  <div className="text-xs font-bold text-foreground">{item.step}</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips / Practical Procurement Warnings */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>조달청 수주 실무자 핵심 꿀팁 & 유의사항</span>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {currentStep.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 4. Role-based Quick Workflow Summary */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          직무별 추천 사용 순서
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary">👔 사업개발 / 대표자</CardTitle>
              <CardDescription className="text-[11px]">수주 타겟 발굴 및 의사결정</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1.5">
              <p>1. <strong>오늘 브리핑 (/today)</strong>에서 신규 공고 확인</p>
              <p>2. <strong>공모 탐색 (/opportunities)</strong>에서 AI 적합도 높은 공고 선택</p>
              <p>3. <strong>파이프라인 (/pipeline)</strong>에서 GO 판정 및 텔레그램 알림 발송</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary">📝 제안서 PM / 연구원</CardTitle>
              <CardDescription className="text-[11px]">제안서 집필 및 품질 검증</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1.5">
              <p>1. <strong>RFP 분석기 (/rfp)</strong>로 필수 요구조건 및 독소조항 파악</p>
              <p>2. <strong>제안서 작성기 (/proposals)</strong>로 RAG 기반 7대 목차 자동 생성</p>
              <p>3. <strong>4대 심사위원 모의평가</strong>로 기술/행정 감점 요소 사전 보완</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary">💰 경영지원 / 입찰 행정</CardTitle>
              <CardDescription className="text-[11px]">투찰가 산정 및 최종 제출 점검</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1.5">
              <p>1. <strong>사내 역량 볼트 (/vault)</strong>에 최신 인증서/특허 관리</p>
              <p>2. <strong>투찰 계산기 (/tools)</strong>로 A값 공제 투찰가 산출 후 파이프라인 반영</p>
              <p>3. <strong>마감 점검 (/submissions)</strong>에서 12개 항목 체크 및 최종 서명</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
