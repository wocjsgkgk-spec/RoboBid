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
    type: string;
    label: string;
    href?: string;
  };
}

const PROMPT_CHIPS = [
  {
    category: "투찰전략",
    prompt: "8.5억원 규모 조달청 사업의 A값 공제 산식과 최적 투찰가 도출 원리를 설명해줘.",
  },
  {
    category: "적격심사",
    prompt: "조달청 적격심사에서 신인도 가점을 최대로 받기 위한 필수 인증과 팁을 알려줘.",
  },
  {
    category: "컨소시엄",
    prompt: "실적 점수가 부족할 때 공동수급체(70:30 지분율)를 구성하면 어떻게 점수가 합산돼?",
  },
  {
    category: "RFP 분석",
    prompt: "공공조달 RFP 공고문 분석 시 감점 또는 실격(Disqualification) 처리되는 치명적 리스크는?",
  },
  {
    category: "사내 실적",
    prompt: "현재 우리 회사(RoboTech)의 특허와 인증으로 수주 확률을 극대화할 수 있는 전략은?",
  },
];

export function BidOpsCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      content: `안녕하세요! **RoboBid AI 조달 전용 어시스턴트(BidOps Copilot)** 입니다.

Google Gemini Flash 실시간 LLM 및 한국 공공조달 지식베이스와 연동되어 작동합니다.
국가계약법·지방계약법 집행기준, 나라장터 사정율 투찰법, 적격심사 100점 가점 전략, RFP 필수요건 점검 등 공공조달 실무에 대해 무엇이든 질문해 주세요!`,
      timestamp: "방금 전",
      citations: [
        { label: "국가계약법 & 지방계약법 집행기준" },
        { label: "조달청 적격심사 세부기준" },
        { label: "RoboBid 인텔리전스 (Google Gemini Flash)" },
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ provider: string; model: string; isLive: boolean }>({
    provider: "gemini",
    model: "Google Gemini Flash",
    isLive: true,
  });
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch AI engine status on mount
  useEffect(() => {
    fetch("/api/ai/copilot")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setModelInfo({
            provider: data.provider || "gemini",
            model: data.provider === "gemini" ? "Google Gemini Flash" : data.model || "AI Engine",
            isLive: !!data.isLive,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
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

    try {
      // 실시간 LLM 백엔드 호출
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI 답변 생성 중 오류가 발생했습니다.");
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        citations: data.citations || [],
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("[BidOpsCopilot] Error:", err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "assistant",
        content: `⚠️ AI 응답 생성에 실패했습니다 (${err.message}). 잠시 후 다시 시도해 주세요.`,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-foreground">RoboBid BidOps Copilot</h2>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {modelInfo.model}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Evidence-First RAG
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              대한민국 공공조달 실무 · 국가계약법령 · 조달청 세부기준 · 사내 역량(Vault) 실시간 심층 분석
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
                      <div className="pt-1 flex flex-wrap gap-2">
                        {msg.suggestedAction.type === "CALCULATOR" ? (
                          <div className="flex items-center gap-2">
                            <Link href="/tools">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Calculator className="h-3.5 w-3.5" />
                                <span>{msg.suggestedAction.label}</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPricingModalOpen(true)}
                              className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                              모달로 계산하기
                            </Button>
                          </div>
                        ) : msg.suggestedAction.type === "RFP" ? (
                          <Link href="/rfp">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                            >
                              <FileCheck className="h-3.5 w-3.5" />
                              <span>{msg.suggestedAction.label}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        ) : msg.suggestedAction.type === "VAULT" ? (
                          <Link href="/vault">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>{msg.suggestedAction.label}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        ) : msg.suggestedAction.type === "QUALIFICATION" ? (
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
                        ) : (
                          <Link href={msg.suggestedAction.href || "/proposals"}>
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
