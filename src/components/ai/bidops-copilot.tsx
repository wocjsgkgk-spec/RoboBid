"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Calculator,
  Award,
  FileCheck,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KonepsPricingModal } from "@/components/bidding/koneps-pricing-modal";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Array<{ label: string; url?: string }>;
  suggestedAction?: {
    type: "CALCULATOR" | "QUALIFICATION" | "PROPOSALS";
    label: string;
  };
}

const PROMPT_CHIPS = [
  {
    category: "투찰전략",
    prompt: "8.5억원 규모 조달청 로봇 사업의 A값 공제 산식과 최적 투찰가 도출 원리를 설명해줘.",
  },
  {
    category: "적격심사",
    prompt: "현재 우리 회사(RoboTech)의 특허와 인증으로 받을 수 있는 조달청 적격심사 신인도 가점은 몇 점이야?",
  },
  {
    category: "컨소시엄",
    prompt: "실적 점수가 부족할 때 공동수급체(70:30 지분율)를 구성하면 어떻게 점수가 합산돼?",
  },
  {
    category: "RFP 분석",
    prompt: "RFP 공고문 분석 시 감점 또는 실격(Disqualification) 처리되는 3대 치명적 리스크는?",
  },
];

const PREDEFINED_KNOWLEDGE: Record<string, { answer: string; citations: Array<{ label: string; url?: string }>; action?: { type: "CALCULATOR" | "QUALIFICATION" | "PROPOSALS"; label: string } }> = {
  "8.5억원 규모 조달청 로봇 사업의 A값 공제 산식과 최적 투찰가 도출 원리를 설명해줘.": {
    answer: `### 8.5억원 조달청 로봇 사업 A값 공제 투찰가 산출 보고

국가계약법 및 기획재정부 계약예규에 따른 **A값 공제 투찰금액 공식**은 다음과 같습니다:

$$\\text{입찰가격} = (\\text{예정가격} - A) \\times \\text{낙찰하한율} + A$$

#### 1. A값 반영 시 시뮬레이션 (기초금액 8.5억원 기준)
- **A값 미반영(일반계산)**: $850,000,000 \\times 87.995\\% = \\mathbf{747,957,500\\text{원}}$
- **A값 4,200만원 반영**: $(850,000,000 - 42,000,000) \\times 87.995\\% + 42,000,000 = \\mathbf{752,999,600\\text{원}}$
- **실질 보호 효과**: 비투찰 고정비(국민연금, 건강보험, 노인장기요양보험 등)에 낙찰하한율이 곱해지지 않아 투찰금액이 약 **504만원 상승**하며 하한선 미달 탈락을 원천 차단합니다.

#### 2. 원단위 단수 처리 주의사항 (중요)
- 산출 결과 소수점 발생 시 반드시 **절상(CEIL, 올림)** 처리해야 합니다. 1원이라도 하한선 미달 시 적격심사 대상에서 영구 탈락합니다.
- 복수예비가격 15개 중 4개 추첨 통계상 사정율은 **99.3% ~ 99.8% (골든존)** 에 48% 이상 집중됩니다.`,
    citations: [
      { label: "기획재정부 계약예규 제10조 (예정가격 작성 및 투찰기준)" },
      { label: "조달청 물품·용역 적격심사 세부기준 제5조" },
      { label: "부산항만공사 AGV 구매 RFP 공고문 (A값 명시)" },
    ],
    action: { type: "CALCULATOR", label: "투찰가 시뮬레이터로 15개 예가 뽑아보기" },
  },

  "현재 우리 회사(RoboTech)의 특허와 인증으로 받을 수 있는 조달청 적격심사 신인도 가점은 몇 점이야?": {
    answer: `### RoboTech Inc. 사내 역량 기반 적격심사 신인도 가점 분석

사내 **Capability Vault**에 등록·검증된 역량 자산을 조달청 기준표와 1:1 대조 분석한 결과입니다:

#### 1. 획득 가능 신인도 가점 내역 (최대 한도 +5.0점)
| 인증/특허 자산 | 증빙 ID | 조달청 인정 배점 | 충족 여부 |
| :--- | :--- | :---: | :---: |
| **중소기업확인서 (중소벤처기업부)** | \`CAP-SEED-001\` | +2.0점 | ✅ 유효 |
| **이노비즈(InnoBiz) 기술혁신형 인증** | \`CAP-SEED-004\` | +1.5점 | ✅ 유효 |
| **여성기업 인증서** | \`CAP-SEED-002\` | +1.0점 | ✅ 유효 |
| **AGV 자율주행 회피 특허 (제10-2024-0012345호)** | \`CAP-SEED-003\` | +0.5점 | ✅ 유효 (등록) |

- **합산 점수**: 2.0 + 1.5 + 1.0 + 0.5 = **+5.0점 (신인도 법정 상한선 만점 달성)**
- **진단 결과**: 경영상태(신용평가 BB+ 이상) 및 수행실적(동일분야 실적 1건) 충족 시 **적격심사 종합점수 100.0점 만점 통과가 확정적**입니다.`,
    citations: [
      { label: "조달청 일반용역 적격심사 세부기준 [별표 1] 신인도 평가기준" },
      { label: "중소기업기본법 제2조 및 여성기업지원에 관한 법률" },
      { label: "사내 역량 금고 (Capability Vault) 8건 증빙" },
    ],
    action: { type: "QUALIFICATION", label: "적격심사 100점 모의 진단기 열기" },
  },

  "실적 점수가 부족할 때 공동수급체(70:30 지분율)를 구성하면 어떻게 점수가 합산돼?": {
    answer: `### 공동수급체(공동이행방식) 실적 및 적격심사 점수 합산 가이드

조달청 및 지자체 적격심사에서 단독 실적이 당해 사업 규모(예: 8.5억원) 대비 부족한 경우, **공동이행방식 컨소시엄**으로 만점을 확보할 수 있습니다.

#### 1. 수행실적 합산 공식
$$\\text{실적 합산액} = (A사\\text{ 실적} \\times 70\\%) + (B사\\text{ 실적} \\times 30\\%)$$

- **가정 예시**: 당해 목표 실적 8.5억원 기준
  - 당사(A사, 대표사 70%): 최근 3년 실적 6억원 보유 $\\rightarrow 6억 \\times 0.7 = 4.2억원$
  - 협력사(B사, 공동수급 30%): 최근 3년 실적 15억원 보유 $\\rightarrow 15억 \\times 0.3 = 4.5억원$
  - **합산 인정 실적**: $4.2억 + 4.5억 = \\mathbf{8.7억원}$ (목표 8.5억 초과로 **실적 배점 만점 70점** 획득)

#### 2. 주의해야 할 필수 행정 요건
1. **공동수급표준협정서(공동이행방식)** 를 입찰서 제출 마감 전일까지 나라장터를 통해 전자 승인해야 합니다.
2. 대표사의 출자 비율은 **50% 이상**이어야 합니다.
3. 구성원 전원이 입찰 참가자격(사업자등록, 직접생산확인 등)을 개별 보유해야 합니다.`,
    citations: [
      { label: "기획재정부 계약예규 [공동계약운용요령] 제9조" },
      { label: "조달청 시설·용역 적격심사 세부기준 공동수급체 평가요령" },
    ],
    action: { type: "QUALIFICATION", label: "공동수급 지분율 슬라이더 모의 진단" },
  },

  "RFP 공고문 분석 시 감점 또는 실격(Disqualification) 처리되는 3대 치명적 리스크는?": {
    answer: `### RFP 공고문 분석 시 반드시 걸러내야 할 3대 실격·감점 리스크

RoboBid AI의 RFP 규정 준수 감사(Compliance Matrix) 엔진이 점검하는 핵심 3대 항목입니다:

#### 1. 투찰가격 하한선 미달 (0.001원 미달 즉시 실격)
- 예정가격 대비 낙찰하한율 미달 시 예외 없이 **부적격 실격** 처리됩니다.
- **방지책**: 단수 발생 시 무조건 절상(CEIL) 적용 및 A값 공제 산식 사전 점검.

#### 2. 직접생산확인증명서 및 필수 면허 누락
- 물품구매(제조) 입찰 시 개찰일 전일까지 발급된 '직접생산확인증명서(세부품명번호 10자리 일치)'가 없으면 입찰 무효가 됩니다.
- **방지책**: 중소기업유통센터(SMPP) 증명서 유효기간 사전 대조.

#### 3. 제안서 암기/특정 표시 금지 위반 (정성평가 블라인드 위반)
- 제안서 본문 및 발표자료에 회사명, 대표자명, 로고 등 특정 식별 정보를 표기할 경우 평가위원회의 규정에 따라 **1~3점 감점** 또는 심사 제외됩니다.
- **방지책**: 제안서 익명화 검증 모듈로 블라인드 규정 준수.`,
    citations: [
      { label: "국가계약법 시행규칙 제44조 (입찰무효 사유)" },
      { label: "중소기업제품 구매촉진 및 판로지원에 관한 법률 제9조" },
    ],
    action: { type: "PROPOSALS", label: "제안서 워크스페이스에서 필수요건 점검" },
  },
};

export function BidOpsCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      content: `안녕하세요! **RoboBid AI 조달 전용 어시스턴트(BidOps Copilot)** 입니다.

국가계약법·지방계약법 집행기준, 나라장터 사정율 투찰법, 적격심사 100점 가점 전략, RFP 필수요건 점검에 대해 질문해 주세요.
사내 **Capability Vault(특허, TRL, 인증)** 와 실시간 연동되어 허위 없는 정밀한 근거를 인용(Citation)하여 답변합니다.`,
      timestamp: "방금 전",
      citations: [
        { label: "국가계약법 & 지방계약법 집행기준" },
        { label: "RoboTech Inc. 사내 역량 자산 연동" },
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsThinking(true);

    // AI 질의응답 시뮬레이션
    setTimeout(() => {
      const match = PREDEFINED_KNOWLEDGE[prompt];

      let replyContent = "";
      let replyCitations: Array<{ label: string; url?: string }> = [];
      let suggestedAction: any = undefined;

      if (match) {
        replyContent = match.answer;
        replyCitations = match.citations;
        suggestedAction = match.action;
      } else {
        // 일반 질의에 대한 조달 전문가 답변 생성
        replyContent = `### "${prompt}" 분석 의견

입력하신 질문에 대해 공공조달 실무 및 당사(RoboTech) 역량 기준 분석 결과입니다:

1. **조달 규정 관점**:
   - 관련 사업은 공공기관 계약예규 상 경쟁입찰 원칙이 적용되며, 사정율 98%~102% 구간의 예정가격 산정 및 낙찰하한율 기준 준수가 필수적입니다.
2. **사내 역량 연동 관점**:
   - 현재 사내 Capability Vault에 등록된 **자율주행 제어 특허** 및 **이노비즈 인증**을 증빙으로 매핑하면 기술 제안서(2.2 장)와 적격심사 신인도 평가에서 최대 우위를 점할 수 있습니다.
3. **권장 후속 조치**:
   - 공고문 세부 RFP를 파싱하여 필수 제출 서류 누락 여부를 확인하고, 사정율 시뮬레이터로 최적 투찰가 범위를 확정하십시오.`;

        replyCitations = [
          { label: "국가계약법 집행기준" },
          { label: "RoboTech 사내 역량 저장소 증빙" },
        ];
        suggestedAction = { type: "CALCULATOR", label: "투찰가 시뮬레이터 열기" };
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        citations: replyCitations,
        suggestedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        sender: "assistant",
        content: `대화가 초기화되었습니다. 공공조달 입찰 전략 및 조달청 규정에 대해 무엇이든 질문해 주세요.`,
        timestamp: "방금 전",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[580px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">RoboBid BidOps Copilot</h2>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Evidence-First Engine
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                지식베이스 연동 가동중
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              국가계약법 집행기준 · 조달청 세부심사기준 · 사내 역량(Vault) 실시간 인용
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetChat}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>대화 초기화</span>
        </Button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isAi = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold ${
                  isAi
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {isAi ? <Bot className="h-4 w-4" /> : "나"}
              </div>

              <div
                className={`flex flex-col max-w-[85%] space-y-2 ${
                  isAi ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3.5 text-xs leading-relaxed shadow-2xs ${
                    isAi
                      ? "bg-muted/40 border border-border/80 text-foreground"
                      : "bg-primary text-primary-foreground font-medium"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>
                </div>

                {/* AI Citations & Actions */}
                {isAi && (
                  <div className="space-y-2 w-full pl-1">
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-primary" />
                          근거 인용(Citation):
                        </span>
                        {msg.citations.map((c, i) => (
                          <span
                            key={i}
                            className="bg-muted px-2 py-0.5 rounded text-[10px] font-mono border border-border"
                          >
                            {c.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.suggestedAction && (
                      <div className="pt-1">
                        {msg.suggestedAction.type === "CALCULATOR" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPricingModalOpen(true)}
                            className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Calculator className="h-3.5 w-3.5" />
                            <span>{msg.suggestedAction.label}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                        {msg.suggestedAction.type === "QUALIFICATION" && (
                          <Link href="/opportunities?tab=qualification">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                            >
                              <Award className="h-3.5 w-3.5" />
                              <span>{msg.suggestedAction.label}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                        {msg.suggestedAction.type === "PROPOSALS" && (
                          <Link href="/proposals">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              <FileCheck className="h-3.5 w-3.5" />
                              <span>{msg.suggestedAction.label}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                      <span>{msg.timestamp}</span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-foreground flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>답변 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3.5 items-center text-xs text-muted-foreground animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <span>조달 규정 및 사내 역량 자산 매핑 분석 중...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          추천 질문:
        </span>
        {PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip.prompt)}
            disabled={isThinking}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-border bg-card hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <strong className="text-primary mr-1">[{chip.category}]</strong>
            {chip.prompt.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="border-t border-border bg-card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isThinking}
            placeholder="조달청 투찰가 산식, 적격심사 가점, 컨소시엄 규정에 대해 질문하세요..."
            className="flex-1 bg-muted/40 border border-input rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputPrompt.trim() || isThinking}
            className="gap-1.5 h-10 px-4 rounded-xl shrink-0 font-semibold cursor-pointer"
          >
            <span>전송</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* Pricing Modal */}
      <KonepsPricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        initialBasePrice={850000000}
        initialTitle="부산항만공사 항만 AGV 8.5억원 투찰가 정밀 시뮬레이션"
      />
    </div>
  );
}
