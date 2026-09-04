import { CapabilityRecord, RequirementCandidate } from '@/types';
import { EvidenceCitation } from '@/types/proposal';

export interface RetrievalQuery {
  keywords: string[];
  requiredCapabilityTypes?: string[];
  allowConfidential?: boolean;
  maxResults?: number;
}

export class HybridRetriever {
  /**
   * RFP 요건 및 사내 역량을 교차 검색하여 증빙 Citation 후보 추출
   */
  public retrieveEvidence(
    query: RetrievalQuery,
    capabilities: CapabilityRecord[],
    requirements: RequirementCandidate[]
  ): EvidenceCitation[] {
    const citations: EvidenceCitation[] = [];
    const maxResults = query.maxResults || 5;

    // 1. 사내 역량(Capability Vault) 매칭
    for (const cap of capabilities) {
      // 기밀 등급 필터링
      if (!query.allowConfidential && cap.confidentiality === 'RESTRICTED') {
        continue;
      }

      // 역량 유형 필터링
      if (
        query.requiredCapabilityTypes &&
        query.requiredCapabilityTypes.length > 0 &&
        !query.requiredCapabilityTypes.includes(cap.type)
      ) {
        continue;
      }

      // 만료된 인증서/특허는 증빙으로 인용 배제
      if (cap.verificationStatus === 'EXPIRED') {
        continue;
      }

      // 키워드 및 텍스트 매칭도 점수 산출
      const desc = cap.description || '';
      let matchScore = 0;
      const searchableText = `${cap.title} ${desc} ${JSON.stringify(cap.metadata || {})}`.toLowerCase();

      for (const kw of query.keywords) {
        const kwLower = kw.toLowerCase();
        if (searchableText.includes(kwLower)) {
          matchScore += 10;
        }
      }

      if (matchScore > 0) {
        citations.push({
          id: `cite-cap-${cap.id}`,
          sourceType: 'CAPABILITY',
          sourceId: cap.id,
          sourceTitle: `[사내역량:${cap.type}] ${cap.title}`,
          quoteSnippet: desc.slice(0, 150),
          relevanceReason: `사내 ${cap.type} 보유 자산 매칭 (신뢰도: ${matchScore}점)`,
          confidenceScore: Math.min(matchScore, 100),
        });
      }
    }

    // 2. RFP 요구사항(Phase 3) 매칭
    for (const req of requirements) {
      let matchScore = 0;
      const searchableText = `${req.title} ${req.description} ${req.citationQuote}`.toLowerCase();

      for (const kw of query.keywords) {
        const kwLower = kw.toLowerCase();
        if (searchableText.includes(kwLower)) {
          matchScore += 15;
        }
      }

      if (matchScore > 0) {
        citations.push({
          id: `cite-req-${req.reqCode}`,
          sourceType: 'RFP_REQUIREMENT',
          sourceId: req.reqCode,
          sourceTitle: `[RFP요구:${req.reqCode}] ${req.title}`,
          quoteSnippet: req.citationQuote ? req.citationQuote.slice(0, 150) : req.description.slice(0, 150),
          relevanceReason: `RFP 공고 요구조건 부합 (${req.isMandatory ? '필수요건' : '일반요건'})`,
          confidenceScore: Math.min(matchScore, 100),
        });
      }
    }

    // 신뢰도 점수 내림차순 정렬 후 상위 N개 반환
    citations.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    return citations.slice(0, maxResults);
  }
}

export const hybridRetriever = new HybridRetriever();
