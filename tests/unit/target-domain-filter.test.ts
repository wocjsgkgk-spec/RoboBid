import { describe, it, expect } from "vitest";
import {
  isTargetRobotFundingOpportunity,
  filterTargetOpportunities,
  NON_GOAL_EXCLUDED_KEYWORDS,
} from "@/lib/funding/target-domain-filter";

describe("Target Domain & Goal Alignment Filter", () => {
  describe("Explicit User Goal Rejections (성과분석, 동향조사, 컨설팅, 용역 차단)", () => {
    it("strictly excludes '2026년 농업용 로봇 동향 및 성과분석' even though it contains '로봇'", () => {
      const opp = {
        title: "2026년 농업용 로봇 동향 및 성과분석",
        announcingAgency: "농촌진흥청",
        primaryDomain: "ROBOT",
      };
      expect(isTargetRobotFundingOpportunity(opp)).toBe(false);
    });

    it("strictly excludes spaced '농업용 로봇 동향 및 성과 분석 용역'", () => {
      const opp = {
        title: "농업용 로봇 동향 및 성과 분석 용역",
        announcingAgency: "농업기술진흥원",
        primaryDomain: "ROBOT",
      };
      expect(isTargetRobotFundingOpportunity(opp)).toBe(false);
    });

    it("excludes policy studies, feasibility surveys, and demand investigations", () => {
      const excludedTitles = [
        "지능형 로봇 산업 실태조사 및 통계 작성",
        "자율주행 모바일 로봇 보급 타당성 조사 연구",
        "스마트 로봇 도입 수요조사 및 만족도 평가",
        "로봇 융합 비즈니스 모델 컨설팅 지원사업",
        "로봇 관제센터 청소 및 경비 용역 입찰",
        "제조로봇 기술동향 분석 및 정책 수립 연구",
        "농업용 로봇 보급사업 성과평가 및 사후관리 방안 연구",
        "2026년 지능형 로봇 융합 인재양성 지원사업 공고",
        "로봇 자동화 현장교육 운영 위탁 사업",
        "스마트공장 제조로봇 재직자 직무교육 과정",
      ];

      for (const title of excludedTitles) {
        expect(isTargetRobotFundingOpportunity({ title })).toBe(false);
      }
    });

    it("strictly excludes '인재양성 지원사업' and '현장교육 운영'", () => {
      expect(isTargetRobotFundingOpportunity({ title: "2026년 첨단로봇 인재양성 지원사업" })).toBe(false);
      expect(isTargetRobotFundingOpportunity({ title: "스마트 제조로봇 현장교육 운영 용역" })).toBe(false);
    });
  });

  describe("Genuine Robot R&D and Hardware Grants (허용 대상)", () => {
    it("permits actual robot hardware R&D grants and prototype demonstrations", () => {
      const validOpps = [
        {
          title: "2026년 스마트 과수원용 자율주행 농업로봇 시제품 제작 및 실증 지원사업",
          announcingAgency: "중소벤처기업기술정보진흥원",
          primaryDomain: "ROBOT",
        },
        {
          title: "고중량 화물 이송용 무인 AMR 자율주행 로봇 핵심 제어기 기술개발",
          announcingAgency: "산업통상자원부",
          primaryDomain: "ROBOT",
        },
        {
          title: "정밀 조립용 6자유도 협동로봇 및 힘토크 센서 제어 솔루션 개발",
          announcingAgency: "한국산업기술기획평가원 (KEIT)",
          primaryDomain: "ROBOT",
        },
        {
          title: "인공지능 비전 LiDAR SLAM 기반 자율이동로봇 실증 보급사업",
          announcingAgency: "한국로봇산업진흥원 (KIRIA)",
          primaryDomain: "ROBOT",
        },
      ];

      for (const opp of validOpps) {
        expect(isTargetRobotFundingOpportunity(opp)).toBe(true);
      }
    });

    it("filters a mixed list correctly with filterTargetOpportunities", () => {
      const mixed = [
        { title: "2026년 농업용 로봇 동향 및 성과분석" },
        { title: "자율주행 농업로봇 시제품 개발 지원사업" },
        { title: "로봇 기업 해외수출 마케팅 컨설팅 지원" },
        { title: "물류센터 500kg급 AMR 로봇 실증 보급사업" },
      ];

      const filtered = filterTargetOpportunities(mixed);
      expect(filtered.length).toBe(2);
      expect(filtered[0].title).toBe("자율주행 농업로봇 시제품 개발 지원사업");
      expect(filtered[1].title).toBe("물류센터 500kg급 AMR 로봇 실증 보급사업");
    });
  });
});
