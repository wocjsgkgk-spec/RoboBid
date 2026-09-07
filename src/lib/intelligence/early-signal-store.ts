import { EarlySignal, CreateEarlySignalInput } from "@/types/early-signal";

declare global {
  // eslint-disable-next-line no-var
  var __earlySignalStore: EarlySignalStore | undefined;
}

export class EarlySignalStore {
  private static instance: EarlySignalStore;
  private signals: Map<string, EarlySignal> = new Map();

  private constructor() {
    this.restoreFromStorage();
    if (this.signals.size === 0) {
      this.seedDefaultSignals();
    }
  }

  public static getInstance(): EarlySignalStore {
    if (typeof window !== "undefined") {
      if (!EarlySignalStore.instance) {
        EarlySignalStore.instance = new EarlySignalStore();
      }
      return EarlySignalStore.instance;
    }

    if (!global.__earlySignalStore) {
      global.__earlySignalStore = new EarlySignalStore();
    }
    return global.__earlySignalStore;
  }

  private seedDefaultSignals(): void {
    const seeds: EarlySignal[] = [
      {
        id: "sig-2027-kiria-robot-demo",
        title: "2027년도 유망 서비스로봇 실증 및 사업화 지원사업 (사전예고)",
        agency: "한국로봇산업진흥원 (KIRIA)",
        sourceType: "PRE_NOTICE",
        status: "PRE_ANNOUNCEMENT",
        announcementForecast: {
          expectedPeriod: "2027년 2월 2~3주차",
          expectedBudget: 500_000_000,
          confidence: "HIGH",
          basisYears: 3,
          historicalDates: ["2024-02-14", "2025-02-17", "2026-02-19"],
          rationale: "최근 3개년 2월 중순 반복 공고 이력 및 산업부 2027 로봇 로드맵 예산 반영 확인",
          isForecast: true,
          isOfficial: false,
        },
        targetDomain: "ROBOT",
        matchingConceptIds: ["c001-amr-logistics-robot"],
        keyRequirementsSnippet: "물류/제조 현장 100시간 무중단 실증 레퍼런스 및 수요기업 확약서 필요",
        sourceUrl: "https://www.kiria.org/notice/preview/2027-01",
        detectedAt: "2026-09-01T09:00:00Z",
        convertedOpportunityId: null,
        notes: "사내 AMR 로봇 실증 패키지와 적합도 극상",
      },
      {
        id: "sig-2027-tipa-rnd-plan",
        title: "2027년도 중소기업 기술혁신개발사업(수출지향형) 시행계획 및 기술수요조사",
        agency: "중소기업기술정보진흥원 (TIPA)",
        sourceType: "DEMAND_SURVEY",
        status: "EXPECTED",
        announcementForecast: {
          expectedPeriod: "2027년 1월 말 ~ 2월 초",
          expectedBudget: 800_000_000,
          confidence: "HIGH",
          basisYears: 4,
          historicalDates: ["2023-01-20", "2024-01-25", "2025-01-22", "2026-01-28"],
          rationale: "중기부 연례 R&D 통합공고 연계 일정으로 매년 1월 하순 공고 고정",
          isForecast: true,
          isOfficial: false,
        },
        targetDomain: "ROBOT",
        matchingConceptIds: ["c001-amr-logistics-robot"],
        keyRequirementsSnippet: "직전년도 수출액 100만불 이상 또는 혁신형 중소기업(이노비즈) 자격",
        sourceUrl: "https://www.smtech.go.kr/front/survey/noticeList.do",
        detectedAt: "2026-08-25T11:30:00Z",
        convertedOpportunityId: null,
        notes: "수출형 AMR 모델 제안서 기획 사전 착수 권장",
      },
      {
        id: "sig-2026-nipa-ai-voucher",
        title: "2026년 하반기 AI 바우처 지원사업 2차 추경 수요 사전조사",
        agency: "정보통신산업진흥원 (NIPA)",
        sourceType: "DEMAND_SURVEY",
        status: "SIGNAL",
        announcementForecast: {
          expectedPeriod: "2026년 10월 중순",
          expectedBudget: 200_000_000,
          confidence: "MEDIUM",
          basisYears: 2,
          historicalDates: ["2024-10-11", "2025-10-15"],
          rationale: "하반기 디지털 전환 추경 집행 계획 언론보도 및 전담기관 설문 진행",
          isForecast: true,
          isOfficial: false,
        },
        targetDomain: "AI",
        matchingConceptIds: [],
        keyRequirementsSnippet: "공급기업 등록 필수 및 솔루션 패키징 규격 제출",
        sourceUrl: "https://www.nipa.kr/main/selectBbsNttView.do",
        detectedAt: "2026-09-05T14:00:00Z",
        convertedOpportunityId: null,
      },
      {
        id: "sig-2027-keit-autonomous-mfg",
        title: "2027년도 자율제조(Autonomous Manufacturing) 로봇 선도과제 RFP 사전의견수렴",
        agency: "한국산업기술기획평가원 (KEIT)",
        sourceType: "RFP_PRE_NOTICE",
        status: "PRE_ANNOUNCEMENT",
        announcementForecast: {
          expectedPeriod: "2027년 3월 초",
          expectedBudget: 1_200_000_000,
          confidence: "MEDIUM",
          basisYears: 2,
          historicalDates: ["2025-03-05", "2026-03-08"],
          rationale: "스마트제조 3.0 로드맵 산자부 대형과제 기획안",
          isForecast: true,
          isOfficial: false,
        },
        targetDomain: "ROBOT",
        matchingConceptIds: ["c001-amr-logistics-robot"],
        keyRequirementsSnippet: "컨소시엄 구성(수요 대기업 1개사 + 공급 로봇기업 2개사 필수 참여)",
        sourceUrl: "https://itech.keit.re.kr",
        detectedAt: "2026-09-06T16:00:00Z",
        convertedOpportunityId: null,
      },
    ];

    seeds.forEach((s) => this.signals.set(s.id, s));
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const serialized = JSON.stringify(Array.from(this.signals.values()));
        window.localStorage.setItem("robobid_v3_early_signals", serialized);
      } catch (err) {
        console.error("Failed to save early signals", err);
      }
    }
  }

  private restoreFromStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem("robobid_v3_early_signals");
        if (raw) {
          const list: EarlySignal[] = JSON.parse(raw);
          list.forEach((s) => this.signals.set(s.id, s));
        }
      } catch (err) {
        console.error("Failed to restore early signals", err);
      }
    }
  }

  public getAll(): EarlySignal[] {
    return Array.from(this.signals.values()).sort(
      (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
  }

  public getById(id: string): EarlySignal | undefined {
    return this.signals.get(id);
  }

  public getActiveSignals(): EarlySignal[] {
    return this.getAll().filter(
      (s) => s.status === "SIGNAL" || s.status === "EXPECTED" || s.status === "PRE_ANNOUNCEMENT"
    );
  }

  public getByDomain(domain: string): EarlySignal[] {
    return this.getAll().filter((s) => s.targetDomain.toLowerCase() === domain.toLowerCase());
  }

  public create(input: CreateEarlySignalInput): EarlySignal {
    const now = new Date().toISOString();
    const newSignal: EarlySignal = {
      id: crypto.randomUUID(),
      title: input.title,
      agency: input.agency,
      sourceType: input.sourceType,
      status: "SIGNAL",
      announcementForecast: {
        expectedPeriod: input.expectedPeriod,
        expectedBudget: input.expectedBudget || 0,
        confidence: input.confidence || "MEDIUM",
        basisYears: input.basisYears || 3,
        historicalDates: input.historicalDates || [],
        rationale: input.rationale || "과거 정기 공고 주기 및 부처 사업시행계획 분석",
        isForecast: true,
        isOfficial: false,
      },
      targetDomain: input.targetDomain || "ROBOT",
      matchingConceptIds: input.matchingConceptIds || [],
      keyRequirementsSnippet: input.keyRequirementsSnippet || "",
      sourceUrl: input.sourceUrl || "",
      detectedAt: now,
      convertedOpportunityId: null,
      notes: input.notes,
    };
    return this.save(newSignal);
  }

  public update(id: string, updates: Partial<EarlySignal>): EarlySignal | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const updated: EarlySignal = {
      ...existing,
      ...updates,
    };
    return this.save(updated);
  }

  public save(signal: EarlySignal): EarlySignal {
    this.signals.set(signal.id, signal);
    this.saveToStorage();
    return signal;
  }

  public delete(id: string): boolean {
    const deleted = this.signals.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  public clear(): void {
    this.signals.clear();
    this.saveToStorage();
  }
}
