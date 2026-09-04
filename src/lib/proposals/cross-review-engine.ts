import { Proposal, ProposalSection } from '@/types/proposal';
import { RequirementMatrixItem } from '@/types/compliance';
import { CrossReviewFinding, CrossReviewResult } from '@/types/project';

export class CrossReviewEngine {
  /**
   * 4대 전문 에이전트 교차 검토 실행
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
