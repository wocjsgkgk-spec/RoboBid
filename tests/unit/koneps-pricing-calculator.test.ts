import { describe, it, expect } from "vitest";
import { KonepsPricingCalculator } from "@/lib/bidding/koneps-pricing-calculator";

describe("KonepsPricingCalculator (조달청 투찰가격 & 사정율 시뮬레이터)", () => {
  it("A값이 없을 때 예정가격과 낙찰하한율(80.495%) 기준으로 올바른 투찰하한가를 계산해야 한다", () => {
    const basePrice = 100_000_000;
    const lowerLimitRate = 80.495;

    // 예정가격 = 100,000,000일 때
    const bidPrice = KonepsPricingCalculator.calculateBidPrice(
      basePrice,
      lowerLimitRate,
      0,
      "CEIL"
    );

    // 100,000,000 * 0.80495 = 80,495,000
    expect(bidPrice).toBe(80_495_000);
  });

  it("A값(비투찰 고정원가)이 포함된 경우 공제 산식을 엄격히 적용해야 한다: (예정가격 - A) * 하한율 + A", () => {
    const estimatedPrice = 100_000_000;
    const lowerLimitRate = 87.995;
    const aValue = 10_000_000; // 국민연금, 건보료 등

    const bidPrice = KonepsPricingCalculator.calculateBidPrice(
      estimatedPrice,
      lowerLimitRate,
      aValue,
      "CEIL"
    );

    // (100,000,000 - 10,000,000) * 0.87995 + 10,000,000
    // = 90,000,000 * 0.87995 + 10,000,000
    // = 79,195,500 + 10,000,000 = 89,195,500
    expect(bidPrice).toBe(89_195_500);
  });

  it("15개 복수예비가격 생성 시 97% ~ 103% 범위 내 균등 분포해야 한다", () => {
    const basePrice = 500_000_000;
    const preliminary = KonepsPricingCalculator.generate15PreliminaryPrices(basePrice, 97.0, 103.0);

    expect(preliminary.length).toBe(15);
    expect(preliminary[0].rate).toBe(97.0);
    expect(preliminary[14].rate).toBe(103.0);
    expect(preliminary[0].price).toBe(Math.round(500_000_000 * 0.97));
    expect(preliminary[14].price).toBe(Math.round(500_000_000 * 1.03));
  });

  it("지정된 4개 예비가격 추첨 시 정확한 산술평균과 실질 사정율을 산출해야 한다", () => {
    const basePrice = 100_000_000;
    const preliminary = KonepsPricingCalculator.generate15PreliminaryPrices(basePrice, 97.0, 103.0);

    // 1번(97%), 5번(98.7143%), 10번(100.8571%), 15번(103%) 선택
    const drawn = KonepsPricingCalculator.drawFourPrices(preliminary, [1, 5, 10, 15]);

    expect(drawn.drawnIndices).toEqual([1, 5, 10, 15]);
    expect(drawn.estimatedPrice).toBeGreaterThan(basePrice * 0.97);
    expect(drawn.estimatedPrice).toBeLessThan(basePrice * 1.03);
    expect(drawn.effectiveRate).toBeCloseTo(99.8928, 2);
  });

  it("전체 시뮬레이션 실행 시 매트릭스와 추첨 결과가 완전한 구조로 반환되어야 한다", () => {
    const result = KonepsPricingCalculator.simulate({
      basePrice: 300_000_000,
      lowerLimitRate: 84.245,
      aValue: 15_000_000,
    });

    expect(result.basePrice).toBe(300_000_000);
    expect(result.drawnIndices.length).toBe(4);
    expect(result.drawnEstimatedPrice).toBeGreaterThan(0);
    expect(result.drawnMinBidPrice).toBeGreaterThan(0);
    expect(result.rateMatrix.length).toBeGreaterThan(10);
    // 모든 매트릭스 항목에 투찰가 존재
    for (const row of result.rateMatrix) {
      expect(row.bidPrice).toBeGreaterThan(0);
      expect(row.bidRatioToBase).toBeGreaterThan(70);
    }
  });
});
