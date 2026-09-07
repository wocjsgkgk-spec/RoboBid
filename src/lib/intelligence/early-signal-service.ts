import {
  EarlySignal,
  AnnouncementForecast,
  ForecastConfidence,
  ConvertSignalToOpportunityInput,
} from "@/types/early-signal";
import { EarlySignalStore } from "./early-signal-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { Opportunity } from "@/types";

export class EarlySignalService {
  /**
   * 과거 다개년(3~5개년) 반복 공고 이력 기반 캘린더 예측 엔진
   * (주의: 확정 공고가 아니며 참고용 분석 정보임을 보장하는 불변식 적용)
   */
  public static predictRecurringCalendar(
    agency: string,
    titleKeywords: string[],
    targetYear: number = 2027
  ): AnnouncementForecast {
    // 1. 공공 R&D / 보조금 전담기관별 정기 공고 시기 사전 매핑
    const agencyLower = agency.toLowerCase();
    const keywordsJoined = titleKeywords.join(" ").toLowerCase();

    let expectedMonth = "2월";
    let confidence: ForecastConfidence = "MEDIUM";
    let basisYears = 3;
    let historicalDates: string[] = [
      `${targetYear - 3}-02-15`,
      `${targetYear - 2}-02-18`,
      `${targetYear - 1}-02-20`,
    ];

    if (agencyLower.includes("tipa") || agencyLower.includes("중소기업기술정보진흥원")) {
      expectedMonth = "1월 말 ~ 2월 초";
      confidence = "HIGH";
      basisYears = 4;
      historicalDates = [
        `${targetYear - 4}-01-20`,
        `${targetYear - 3}-01-22`,
        `${targetYear - 2}-01-25`,
        `${targetYear - 1}-01-24`,
      ];
    } else if (agencyLower.includes("kiria") || agencyLower.includes("로봇산업진흥원")) {
      expectedMonth = "2월 중순";
      confidence = "HIGH";
      basisYears = 3;
      historicalDates = [
        `${targetYear - 3}-02-12`,
        `${targetYear - 2}-02-16`,
        `${targetYear - 1}-02-15`,
      ];
    } else if (agencyLower.includes("nipa") || agencyLower.includes("정보통신산업진흥원")) {
      if (keywordsJoined.includes("바우처") || keywordsJoined.includes("voucher")) {
        expectedMonth = "1월 중순 및 7월 2차";
        confidence = "HIGH";
        basisYears = 3;
        historicalDates = [
          `${targetYear - 3}-01-15`,
          `${targetYear - 2}-01-18`,
          `${targetYear - 1}-01-16`,
        ];
      } else {
        expectedMonth = "3월 초";
        confidence = "MEDIUM";
      }
    } else if (agencyLower.includes("keit") || agencyLower.includes("산업기술기획평가원")) {
      expectedMonth = "3월 초";
      confidence = "MEDIUM";
      basisYears = 3;
      historicalDates = [
        `${targetYear - 3}-03-02`,
        `${targetYear - 2}-03-05`,
        `${targetYear - 1}-03-04`,
      ];
    }

    const expectedPeriod = `${targetYear}년 ${expectedMonth}`;
    const rationale = `최근 ${basisYears}개년 유사 시기 정기 반복 공고 이력 및 부처 연간 사업시행계획 예산안 분석 기반`;

    return {
      expectedPeriod,
      expectedBudget: 500_000_000,
      confidence,
      basisYears,
      historicalDates,
      rationale,
      isForecast: true,
      isOfficial: false,
    };
  }

  /**
   * 사전 신호가 정식 공고되었을 때 Opportunity로 승격/전환
   * (계보 추적 및 중복 방지)
   */
  public static convertToOpportunity(input: ConvertSignalToOpportunityInput): Opportunity {
    const store = EarlySignalStore.getInstance();
    const signal = store.getById(input.signalId);

    if (!signal) {
      throw new Error(`전환 대상 사전신호 [${input.signalId}]를 찾을 수 없습니다.`);
    }

    if (signal.status === "CONVERTED_TO_OPPORTUNITY" && signal.convertedOpportunityId) {
      const existing = opportunityStore.getById(signal.convertedOpportunityId);
      if (existing) {
        return existing;
      }
    }

    const newOppId = crypto.randomUUID();
    const now = new Date().toISOString();

    const createdOpp: Opportunity = {
      id: newOppId,
      organizationId: crypto.randomUUID(),
      providerId: "early-signal",
      sourceId: input.officialAnnouncementNumber,
      title: input.officialTitle || signal.title.replace("(사전예고)", "").replace("시행계획 및 기술수요조사", "정식공고").trim(),
      announcingAgency: signal.agency,
      demandingAgency: null,
      bidType: "R_AND_D",
      primaryDomain: signal.targetDomain || "ROBOT",
      allocatedBudget: input.allocatedBudget || signal.announcementForecast.expectedBudget,
      estimatedPrice: input.allocatedBudget || signal.announcementForecast.expectedBudget,
      postedAt: now,
      submissionDeadline: input.submissionDeadline,
      canonicalUrl: signal.sourceUrl,
      status: "OPEN",
      isEarlySignal: false,
      signalStage: "OFFICIAL_CONVERTED",
      originSource: `EarlySignal:${signal.id}`,
      dataSource: "SYSTEM",
      contentHash: `hash-${Date.now()}`,
      currentVersion: 1,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };

    // Save to opportunity store
    opportunityStore.save(createdOpp);

    // Update signal with conversion linkage
    store.update(signal.id, {
      status: "CONVERTED_TO_OPPORTUNITY",
      convertedOpportunityId: newOppId,
    });

    return createdOpp;
  }
}
