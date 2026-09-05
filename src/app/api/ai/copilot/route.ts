import { NextRequest, NextResponse } from "next/server";
import { LLMClient, LLMMessage } from "@/lib/ai/llm-client";
import { vaultStore } from "@/lib/vault/vault-store";
import { OpportunityStore } from "@/lib/opportunities/opportunity-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const llm = LLMClient.getInstance();
  const provider = llm.getActiveProvider();
  return NextResponse.json({
    success: true,
    provider,
    model: provider === "gemini" ? "gemini-flash-lite-latest" : provider,
    isLive: provider !== "mock",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, history = [], opportunityId } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "질문 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const llm = LLMClient.getInstance();

    // 1. Context Assembly (RAG from Vault & Opportunities)
    const capabilities = vaultStore.getAll();
    const opportunityStore = OpportunityStore.getInstance();
    const allOpps = opportunityStore.getAll();
    const activeOpp = opportunityId
      ? opportunityStore.getById(opportunityId)
      : allOpps[0];

    // Build internal context strings
    let vaultContext = "등록된 사내 역량(특허/인증/실적): 없음 (신규 등록 필요)";
    if (capabilities.length > 0) {
      vaultContext = capabilities
        .map(
          (c) =>
            `- [${c.type}] ${c.title} (상태: ${c.verificationStatus}, 유효기간: ${c.validUntil || "상시/유효"})`
        )
        .join("\n");
    }

    let oppContext = "현재 선택된 공고 없음";
    if (activeOpp) {
      oppContext = `공고명: ${activeOpp.title}\n발주처: ${activeOpp.announcingAgency}\n배정예산: ${activeOpp.allocatedBudget ? activeOpp.allocatedBudget.toLocaleString() + "원" : "미정"}\n마감일: ${activeOpp.submissionDeadline}`;
    }

    // 2. System Instructions
    const systemPrompt = `당신은 대한민국 정부 공공조달 및 국가 R&D 사업 수주 전략 최고 전문가 'RoboBid BidOps Copilot'입니다.
한국 공공조달 실무(나라장터 KONEPS, 중기부 R&D, 지자체 계약, 공공기관 협상에 의한 계약, 적격심사, A값 공제 산식, 사정율 예측, 신인도 가감점)에 정통합니다.

[답변 작성 원칙]:
1. **실무 전문성 및 신뢰성**: 거짓된 정보를 날조하지 않고, 조달청 적격심사 세부기준, 국가계약법령, 지방계약법령의 공식 기준에 입각해 정확히 설명합니다.
2. **구조화된 가독성**: Markdown 형식(제목, 볼드, 불릿포인트, 번호 매기기)을 적극 활용하여 경영진이나 입찰 실무자가 즉시 실행할 수 있게 핵심만 명쾌하게 제시합니다.
3. **사내 데이터 및 공고 연계**: 아래 제공된 사내 역량(Capability Vault) 및 현재 공고 정보를 맥락에 맞게 유기적으로 인용하십시오.
4. **후속 실행 가이드 제안**: 투찰가 계산, RFP 분석, 제안서 작성, 사내 증빙 보강 등 시스템 내에서 이어서 수행할 작업을 안내하십시오.

[현재 사내 역량 자산(Vault)]:
${vaultContext}

[현재 활성 공고 정보]:
${oppContext}`;

    // 3. Build Conversation Messages
    const messages: LLMMessage[] = [{ role: "system", content: systemPrompt }];

    // Add recent history (up to 6 turns)
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        if (h.sender === "user" && h.content) {
          messages.push({ role: "user", content: h.content });
        } else if (h.sender === "assistant" && h.content) {
          messages.push({ role: "assistant", content: h.content });
        }
      }
    }

    messages.push({ role: "user", content: prompt.trim() });

    // 4. Generate with Live LLM
    const startTime = Date.now();
    const result = await llm.generate({
      messages,
      temperature: 0.4,
      maxTokens: 3000,
    });

    // 5. Intelligent Action & Citation Detection
    const citations: Array<{ label: string; url?: string }> = [];
    let suggestedAction: { type: string; label: string; href: string } | undefined = undefined;

    const lowerPrompt = prompt.toLowerCase();
    const lowerText = result.text.toLowerCase();

    if (
      lowerPrompt.includes("a값") ||
      lowerPrompt.includes("투찰") ||
      lowerPrompt.includes("사정율") ||
      lowerPrompt.includes("예가") ||
      lowerPrompt.includes("가격") ||
      lowerText.includes("투찰가")
    ) {
      citations.push({ label: "조달청 A값 공제 및 사정율 산식 기준" });
      suggestedAction = {
        type: "CALCULATOR",
        label: "투찰가 시뮬레이터 열기",
        href: "/tools",
      };
    }

    if (
      lowerPrompt.includes("rfp") ||
      lowerPrompt.includes("제안요청") ||
      lowerPrompt.includes("과업지시") ||
      lowerPrompt.includes("요구사항")
    ) {
      citations.push({ label: "RFP 요구사항 추출 매트릭스" });
      if (!suggestedAction) {
        suggestedAction = {
          type: "RFP",
          label: "RFP 심층 분석기 실행",
          href: "/rfp",
        };
      }
    }

    if (
      lowerPrompt.includes("제안서") ||
      lowerPrompt.includes("초안") ||
      lowerPrompt.includes("목차") ||
      lowerPrompt.includes("사업계획서")
    ) {
      citations.push({ label: "표준 조달 제안서 7대 목차 가이드" });
      if (!suggestedAction) {
        suggestedAction = {
          type: "PROPOSAL",
          label: "제안서 작성 워크스페이스 이동",
          href: "/proposals",
        };
      }
    }

    if (
      lowerPrompt.includes("실적") ||
      lowerPrompt.includes("특허") ||
      lowerPrompt.includes("인증") ||
      lowerPrompt.includes("신인도") ||
      lowerPrompt.includes("증빙")
    ) {
      citations.push({ label: "사내 역량(Capability Vault) 증빙" });
      if (!suggestedAction) {
        suggestedAction = {
          type: "VAULT",
          label: "사내 역량 저장소(Vault) 확인",
          href: "/vault",
        };
      }
    }

    if (citations.length === 0) {
      citations.push({ label: "국가계약법령 및 조달청 적격심사 집행기준" });
      citations.push({ label: "RoboBid BidOps 인텔리전스" });
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      provider: result.provider,
      model: result.model,
      latencyMs: result.latencyMs || Date.now() - startTime,
      citations,
      suggestedAction,
    });
  } catch (err: any) {
    console.error("[/api/ai/copilot] 오류:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "AI 코파일럿 응답 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
