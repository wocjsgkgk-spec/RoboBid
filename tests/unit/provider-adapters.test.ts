import { describe, it, expect } from "vitest";
import { KonepsAdapter } from "@/lib/providers/koneps-adapter";
import { KStartupAdapter } from "@/lib/providers/k-startup-adapter";
import { BizinfoAdapter } from "@/lib/providers/bizinfo-adapter";
import { IrisAdapter } from "@/lib/providers/iris-adapter";

describe("Provider Adapters Verification", () => {
  it("KonepsAdapter should correctly classify domains and normalize fields", () => {
    const adapter = new KonepsAdapter();

    // Priority A: Robot
    expect(adapter.classifyDomain("물류창고용 AMR 자율주행로봇 구매")).toBe("ROBOT");
    expect(adapter.classifyDomain("특수목적 소방 재난로봇 도입 용역")).toBe("ROBOT");

    // Priority B: Automation & Hardware
    expect(adapter.classifyDomain("스마트팜 센서 및 온실 제어 자동화 시스템")).toBe("AUTOMATION_HARDWARE");

    // Priority B: AI/ICT
    expect(adapter.classifyDomain("AI 기반 공공 빅데이터 분석 플랫폼 구축")).toBe("AI_ICT");

    // Normalization test
    const rawKoneps = {
      bidNtceNo: "20260901001",
      bidNtceOrd: "01",
      bidNtceNm: "2026년 첨단 이동로봇 실증 테스트베드 용역",
      ntceInsttNm: "조달청",
      dminsttNm: "한국로봇산업진흥원",
      asignBdgtAmt: "300000000",
      presmptPrce: "270000000",
      bidNtceDt: "202609010900",
      bidClseDt: "202609201800",
      srvceDivNm: "용역",
      ntceSpecDocUrl1: "https://g2b.go.kr/spec.pdf",
      ntceSpecDocNm1: "과업지시서.pdf",
    };

    const normalized = adapter.normalize(rawKoneps);
    expect(normalized.sourceId).toBe("20260901001-01");
    expect(normalized.title).toBe("2026년 첨단 이동로봇 실증 테스트베드 용역");
    expect(normalized.primaryDomain).toBe("ROBOT");
    expect(normalized.bidType).toBe("SERVICE");
    expect(normalized.allocatedBudget).toBe(300000000);
    expect(normalized.attachments.length).toBe(1);
    expect(normalized.attachments[0].fileName).toBe("과업지시서.pdf");
  });

  it("KStartupAdapter should correctly normalize startup announcements", () => {
    const adapter = new KStartupAdapter();
    const rawKStartup = {
      post_sn: 12345,
      biz_pbanc_nm: "2026년 로봇 하드웨어 스타트업 시제품 제작 지원사업",
      pbanc_ntce_instt_nm: "창업진흥원",
      supt_biz_instt_nm: "경기창조경제혁신센터",
      supt_scale: "50000000",
      pbanc_rcpt_bgng_dt: "20260901",
      pbanc_rcpt_end_dt: "20260930",
      detl_pg_url: "https://k-startup.go.kr/detail/12345",
    };

    const normalized = adapter.normalize(rawKStartup);
    expect(normalized.sourceId).toBe("12345");
    expect(normalized.bidType).toBe("SUBSIDY_SUPPORT");
    expect(normalized.primaryDomain).toBe("ROBOT");
    expect(normalized.allocatedBudget).toBe(50000000);
  });

  it("IrisAdapter should adhere to PRD rules and stay in MANUAL_ONLY status", async () => {
    const adapter = new IrisAdapter();
    const health = await adapter.checkHealth();
    expect(health.status).toBe("MANUAL_ONLY");

    const rawFetch = await adapter.fetchRaw();
    expect(rawFetch.items.length).toBe(0); // Scraper completely disabled
  });

  it("Health check should strictly return KEY_MISSING when API key is missing (No Fake Connected)", async () => {
    delete process.env.DATA_GO_KR_SERVICE_KEY;
    delete process.env.BIZINFO_API_KEY;

    const koneps = new KonepsAdapter();
    const kStartup = new KStartupAdapter();
    const bizinfo = new BizinfoAdapter();

    const h1 = await koneps.checkHealth();
    const h2 = await kStartup.checkHealth();
    const h3 = await bizinfo.checkHealth();

    expect(h1.status).toBe("KEY_MISSING");
    expect(h2.status).toBe("KEY_MISSING");
    expect(h3.status).toBe("KEY_MISSING");
  });
});
