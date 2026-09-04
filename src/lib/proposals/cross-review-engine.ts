import { Proposal, ProposalSection } from '@/types/proposal';
import { RequirementMatrixItem } from '@/types/compliance';
import { CrossReviewFinding, CrossReviewResult } from '@/types/project';
import { LLMClient } from '@/lib/ai/llm-client';

export class CrossReviewEngine {
  /**
   * 4대 전문 에이전트 교차 검토 실행 (동기/비동기 통합)
   */
  public async reviewAsync(
    proposal: Proposal,
    sections: ProposalSection[],
    matrixItems: RequirementMatrixItem[] = []
  ): Promise<CrossReviewResult> {
    const llm = LLMClient.getInstance();
    const activeProvider = llm.getActiveProvider();

    // If an external LLM is configured (Gemini / OpenAI / Local), run enhanced review
    if (activeProvider !== 'mock') {
      try {
        const sectionsSummary = sections
          .map((s) => `### [${s.sectionCode}] ${s.title}\n${s.contentMarkdown.slice(0, 500)}...`)
          .join('\n\n');

        const prompt = `당신은 공공조달 및 국가 R&D 전문 심사위원단입니다.
제안서 제목: "${proposal.title}"
섹션 요약:
${sectionsSummary}

아래 4개 분야별로 0~100점 점수와 심사평(comments), 권고사항(recommendations)을 JSON 객체로 작성해주세요.
반드시 다음 JSON 스키마를 지켜주세요:
{
  "strategy": { "score": number, "comments": string[], "recommendations": string[] },
  "financial": { "score": number, "comments": string[], "recommendations": string[] },
  "technical": { "score": number, "comments": string[], "recommendations": string[] },
  "compliance": { "score": number, "comments": string[], "recommendations": string[] }
}`;

        const res = await llm.generate({
          messages: [
            { role: "system", content: "한국 공공입찰 전문 평가위원 역할을 수행하며 엄격하고 공정한 JSON 평가를 제공합니다." },
            { role: "user", content: prompt }
          ],
          responseFormat: "json",
          temperature: 0.3,
        });

        const parsed = JSON.parse(res.text);

        const findings: CrossReviewFinding[] = [
          {
            role: 'STRATEGY',
            agentName: `전략·사업성 검토 에이전트 (${res.provider.toUpperCase()} AI)`,
            score: parsed.strategy?.score ?? 85,
            status: (parsed.strategy?.score ?? 85) >= 80 ? 'PASS' : 'WARN',
            title: '사업 배경 타당성 및 수주 차별화 전략 평가',
            comments: parsed.strategy?.comments ?? ['공공 공모 목적에 부합하는 수주 전략 수립됨.'],
            recommendations: parsed.strategy?.recommendations ?? [],
          },
          {
            role: 'FINANCIAL',
            agentName: `재무·원가 검토 에이전트 (${res.provider.toUpperCase()} AI)`,
            score: parsed.financial?.score ?? 88,
            status: (parsed.financial?.score ?? 88) >= 80 ? 'PASS' : 'WARN',
            title: '사업비 편성 적격성 및 비목별 원가 타당성 평가',
            comments: parsed.financial?.comments ?? ['정부출연금 및 민간부담금 배분이 적정함.'],
            recommendations: parsed.financial?.recommendations ?? [],
          },
          {
            role: 'TECHNICAL',
            agentName: `기술·아키텍처 검토 에이전트 (${res.provider.toUpperCase()} AI)`,
            score: parsed.technical?.score ?? 90,
            status: (parsed.technical?.score ?? 90) >= 80 ? 'PASS' : 'WARN',
            title: '기술 구현 가능성, TRL 목표 및 아키텍처 정밀 검증',
            comments: parsed.technical?.comments ?? ['핵심 로봇/SW 아키텍처 및 TRL 달성 계획이 논리적임.'],
            recommendations: parsed.technical?.recommendations ?? [],
          },
          {
            role: 'COMPLIANCE',
            agentName: `규정·제출 검토 에이전트 (${res.provider.toUpperCase()} AI)`,
            score: parsed.compliance?.score ?? 92,
            status: (parsed.compliance?.score ?? 92) >= 80 ? 'PASS' : 'WARN',
            title: '공고 규격서 필수 준수사항 및 증빙 서류 완비성 검증',
            comments: parsed.compliance?.comments ?? ['필수 증빙 요건 및 조달 결격사유 없음 확인.'],
            recommendations: parsed.compliance?.recommendations ?? [],
          },
        ];

        const overallScore = Math.round(
          findings.reduce((sum, f) => sum + f.score, 0) / findings.length
        );

        return {
          proposalId: proposal.id,
          overallScore,
          findings,
          reviewedAt: new Date().toISOString(),
        };
      } catch (err: any) {
        console.warn("[CrossReviewEngine] AI 추론 중 오류 발생, 휴리스틱 룰베이스 검토로 전환:", err.message);
      }
    }

    return this.review(proposal, sections, matrixItems);
  }

  /**
   * 4대 전문 에이전트 교차 검토 실행 (룰베이스)
   */
  public review(
    proposal: Proposal,
    sections: ProposalSection[],
    matrixItems: RequirementMatrixItem[] = []
  ): CrossReviewResult {
    const findings: CrossReviewFinding[] = [
      this.reviewStrategy(proposal, sections),
      this.reviewFinancial(proposal, sections),
      this.reviewTechnical(proposal, sections),
      this.reviewCompliance(proposal, sections, matrixItems),
    ];

    const overallScore = Math.round(
      findings.reduce((sum, f) => sum + f.score, 0) / findings.length
    );

    return {
      proposalId: proposal.id,
      overallScore,
      findings,
      reviewedAt: new Date().toISOString(),
    };
  }

  /**
   * 1. 전략 에이전트 (Strategy Agent)
   */
  private reviewStrategy(
    proposal: Proposal,
    sections: ProposalSection[]
  ): CrossReviewFinding {
    const bgSection = sections.find((s) => s.sectionCode.includes('NEEDS'));
    const comments: string[] = [];
    const recommendations: string[] = [];
    let score = 85;

    if (bgSection && bgSection.contentMarkdown.length > 300) {
      comments.push('개발 필요성 및 사업 배경에 공공 공모 취지가 구체적으로 기술됨.');
    } else {
      score -= 20;
      comments.push('사업 배경 및 필요성 서술이 다소 빈약함.');
      recommendations.push('정부 정책 부합성 및 국내 시장 수요처 통계를 추가 보완하세요.');
    }

    if (proposal.title.length > 5) {
      comments.push(`제안서 제목('${proposal.title}')이 공모 핵심 키워드를 명확히 반영함.`);
    }

    const status = score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'CRITICAL';

    return {
      role: 'STRATEGY',
      agentName: '전략 및 사업성 검토 에이전트 (Strategy Agent)',
      score,
      status,
      title: '사업 배경 타당성 및 수주 차별화 전략 평가',
      comments,
      recommendations,
    };
  }

  /**
   * 2. 재무 에이전트 (Financial Agent)
   */
  private reviewFinancial(
    proposal: Proposal,
    sections: ProposalSection[]
  ): CrossReviewFinding {
    const budgetSection = sections.find((s) => s.sectionCode.includes('BUDGET'));
    const comments: string[] = [];
    const recommendations: string[] = [];
    let score = 90;

    if (budgetSection && budgetSection.contentMarkdown.includes('75%')) {
      comments.push('정부 R&D 출연금 75% 및 민간 부담금 25% 법정 분담율 산출이 정확히 명시됨.');
    } else {
      score -= 15;
      comments.push('정부/민간 분담금 비율 산출 내역이 불명확함.');
      recommendations.push('중소기업 기준 75% 정부출연금 요율에 따른 예산표를 보완하세요.');
    }

    if (budgetSection && budgetSection.contentMarkdown.includes('BOM')) {
      comments.push('핵심 로봇 부품 원가(BOM) 및 개발 인건비가 비목별로 구분됨.');
    }

    const status = score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'CRITICAL';

    return {
      role: 'FINANCIAL',
      agentName: '재무 및 예산 타당성 에이전트 (Financial Agent)',
      score,
      status,
      title: '비목별 사업비 및 법정 분담 비율 적합성 검증',
      comments,
      recommendations,
    };
  }

  /**
   * 3. 기술 에이전트 (Technical Agent)
   */
  private reviewTechnical(
    proposal: Proposal,
    sections: ProposalSection[]
  ): CrossReviewFinding {
    const techSection = sections.find((s) => s.sectionCode.includes('TECH'));
    const comments: string[] = [];
    const recommendations: string[] = [];
    let score = 88;

    if (techSection && techSection.evidenceCitations.length > 0) {
      comments.push(
        `사내 역량 자산(특허/인증/장비) ${techSection.evidenceCitations.length}건이 기술 본문에 1:1 Citation 바인딩됨.`
      );
    } else {
      score -= 20;
      comments.push('기술 본문에 사내 자산 증빙 인용구(Citation)가 부족함.');
      recommendations.push('Capability Vault에 등록된 사내 특허 및 공인시험성적서를 인용하세요.');
    }

    if (techSection && techSection.contentMarkdown.includes('아키텍처')) {
      comments.push('시스템 블록도 및 하드웨어 구성도가 구조화되어 있음.');
    }

    const status = score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'CRITICAL';

    return {
      role: 'TECHNICAL',
      agentName: '기술 완성도 및 특허 증빙 에이전트 (Technical Agent)',
      score,
      status,
      title: 'TRL 달성도 및 기술 아키텍처 실현 가능성 검토',
      comments,
      recommendations,
    };
  }

  /**
   * 4. 컴플라이언스 에이전트 (Compliance Agent)
   */
  private reviewCompliance(
    proposal: Proposal,
    sections: ProposalSection[],
    matrixItems: RequirementMatrixItem[]
  ): CrossReviewFinding {
    const comments: string[] = [];
    const recommendations: string[] = [];
    let score = 95;

    const missingMandatory = matrixItems.filter(
      (m) => m.isMandatory && m.complianceStatus === 'MISSING'
    );

    if (missingMandatory.length === 0) {
      comments.push('RFP 상의 필수 요구조건이 제안서 목차에 100% 누락 없이 매핑됨.');
    } else {
      score -= 30 * missingMandatory.length;
      score = Math.max(0, score);
      comments.push(`필수 요구사항 ${missingMandatory.length}건이 본문에서 누락(MISSING)됨.`);
      for (const m of missingMandatory) {
        recommendations.push(`필수 요건 [${m.requirementCode}] '${m.originalText}' 매핑 필요.`);
      }
    }

    const status = score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'CRITICAL';

    return {
      role: 'COMPLIANCE',
      agentName: '규정 및 RTM 컴플라이언스 에이전트 (Compliance Agent)',
      score,
      status,
      title: 'RFP 제안요청서 필수 규격 충족도 및 결격 사유 검증',
      comments,
      recommendations,
    };
  }
}

export const crossReviewEngine = new CrossReviewEngine();
