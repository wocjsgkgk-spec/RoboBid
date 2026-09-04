/**
 * RoboBid AI — KONEPS 입찰가격 & 사정율 시뮬레이터 (KonepsPricingCalculator)
 * 대한민국 국가계약법 및 조달청 적격심사/협상에 의한 계약 투찰가격 산출 기준
 */

export interface BiddingPriceInput {
  basePrice: number;             // 기초금액 (원)
  lowerLimitRate: number;        // 낙찰하한율 (%) e.g., 87.995, 80.495
  aValue?: number;               // A값 (국민연금, 건강보험, 산재 등 비투찰 고정원가 합계, 기본 0)
  assessmentRateRange?: {
    min: number;                 // 사정율 하한 (%) 기본 97.0
    max: number;                 // 사정율 상한 (%) 기본 103.0
  };
  roundingMethod?: "CEIL" | "ROUND" | "FLOOR"; // 원단위 처리 (기본: 하한선 미달 방지를 위한 CEIL)
}

export interface PreliminaryPrice {
  index: number;                 // 1 ~ 15
  rate: number;                  // 해당 예비가격 사정율 (%)
  price: number;                 // 예비가격 금액 (원)
  selected?: boolean;            // 추첨 여부
}

export interface AssessmentRateRow {
  rate: number;                  // 사정율 (예: 99.500%)
  estimatedPrice: number;        // 예정가격
  bidPrice: number;              // 권장 투찰금액
  bidRatioToBase: number;        // 기초금액 대비 투찰율 (%)
  isUnderLimitRisk: boolean;     // 하한율 미달 위험 여부
}

export interface BiddingPriceSimulationResult {
  basePrice: number;
  aValue: number;
  lowerLimitRate: number;
  preliminaryPrices: PreliminaryPrice[];
  drawnIndices: number[];
  drawnEstimatedPrice: number;   // 추첨된 4개 예비가격의 산술평균
  drawnMinBidPrice: number;      // 추첨 결과에 따른 최종 투찰하한금액
  effectiveAssessmentRate: number; // 산출된 실질 사정율 (%)
  rateMatrix: AssessmentRateRow[]; // 사정율 구간별 투찰가 매트릭스
}

export class KonepsPricingCalculator {
  /**
   * 단일 예정가격 및 A값 기준 투찰하한금액 계산
   */
  public static calculateBidPrice(
    estimatedPrice: number,
    lowerLimitRate: number,
    aValue: number = 0,
    rounding: "CEIL" | "ROUND" | "FLOOR" = "CEIL"
  ): number {
    const rateDecimal = lowerLimitRate / 100;
    let rawBid: number;

    if (aValue > 0) {
      // A값 적용 공식: (예정가격 - A) * 낙찰하한율 + A
      rawBid = (estimatedPrice - aValue) * rateDecimal + aValue;
    } else {
      // 일반 공식: 예정가격 * 낙찰하한율
      rawBid = estimatedPrice * rateDecimal;
    }

    switch (rounding) {
      case "FLOOR":
        return Math.floor(rawBid);
      case "ROUND":
        return Math.round(rawBid);
      case "CEIL":
      default:
        return Math.ceil(rawBid);
    }
  }

  /**
   * 15개 복수예비가격 생성 (기초금액 기준 min ~ max 구간 균등 분포)
   */
  public static generate15PreliminaryPrices(
    basePrice: number,
    minRate: number = 97.0,
    maxRate: number = 103.0
  ): PreliminaryPrice[] {
    const prices: PreliminaryPrice[] = [];
    const step = (maxRate - minRate) / 14;

    for (let i = 0; i < 15; i++) {
      // 정밀도 0.001% 단위 사정율 생성
      const targetRate = Number((minRate + step * i).toFixed(4));
      const price = Math.round(basePrice * (targetRate / 100));
      prices.push({
        index: i + 1,
        rate: targetRate,
        price,
        selected: false,
      });
    }

    return prices;
  }

  /**
   * 15개 복수예비가격 중 무작위 4개 추첨 및 예정가격(산술평균) 산정
   */
  public static drawFourPrices(
    preliminaryPrices: PreliminaryPrice[],
    customIndices?: number[]
  ): {
    drawnIndices: number[];
    estimatedPrice: number;
    effectiveRate: number;
  } {
    let chosenIndices: number[] = [];

    if (customIndices && customIndices.length === 4) {
      chosenIndices = customIndices;
    } else {
      // 무작위 4개 선택
      const allIndices = preliminaryPrices.map((p) => p.index);
      const shuffled = [...allIndices].sort(() => 0.5 - Math.random());
      chosenIndices = shuffled.slice(0, 4).sort((a, b) => a - b);
    }

    const selected = preliminaryPrices.filter((p) => chosenIndices.includes(p.index));
    const totalPrice = selected.reduce((sum, item) => sum + item.price, 0);
    const estimatedPrice = Math.round(totalPrice / 4);
    const totalRate = selected.reduce((sum, item) => sum + item.rate, 0);
    const effectiveRate = Number((totalRate / 4).toFixed(4));

    return {
      drawnIndices: chosenIndices,
      estimatedPrice,
      effectiveRate,
    };
  }

  /**
   * 종합 입찰가격 및 사정율 시뮬레이션 수행
   */
  public static simulate(input: BiddingPriceInput, customDrawnIndices?: number[]): BiddingPriceSimulationResult {
    const basePrice = input.basePrice;
    const lowerLimitRate = input.lowerLimitRate;
    const aValue = input.aValue || 0;
    const minRate = input.assessmentRateRange?.min || 97.0;
    const maxRate = input.assessmentRateRange?.max || 103.0;
    const rounding = input.roundingMethod || "CEIL";

    // 1. 15개 복수예비가격 생성
    const preliminaryPrices = this.generate15PreliminaryPrices(basePrice, minRate, maxRate);

    // 2. 4개 추첨
    const { drawnIndices, estimatedPrice, effectiveRate } = this.drawFourPrices(
      preliminaryPrices,
      customDrawnIndices
    );

    // 3. 추첨된 예정가격 기준 투찰하한금액 계산
    const drawnMinBidPrice = this.calculateBidPrice(
      estimatedPrice,
      lowerLimitRate,
      aValue,
      rounding
    );

    // 4. 사정율 밴드 매트릭스 생성 (97.5%부터 102.5%까지 0.25% 스텝)
    const rateMatrix: AssessmentRateRow[] = [];
    const matrixMin = Math.max(minRate, 97.0);
    const matrixMax = Math.min(maxRate, 103.0);
    const step = 0.25;

    for (let r = matrixMin; r <= matrixMax + 0.001; r += step) {
      const rate = Number(r.toFixed(3));
      const estPrice = Math.round(basePrice * (rate / 100));
      const bid = this.calculateBidPrice(estPrice, lowerLimitRate, aValue, rounding);
      const ratio = Number(((bid / basePrice) * 100).toFixed(4));

      rateMatrix.push({
        rate,
        estimatedPrice: estPrice,
        bidPrice: bid,
        bidRatioToBase: ratio,
        isUnderLimitRisk: bid < drawnMinBidPrice && rate < effectiveRate,
      });
    }

    return {
      basePrice,
      aValue,
      lowerLimitRate,
      preliminaryPrices,
      drawnIndices,
      drawnEstimatedPrice: estimatedPrice,
      drawnMinBidPrice,
      effectiveAssessmentRate: effectiveRate,
      rateMatrix,
    };
  }
}
