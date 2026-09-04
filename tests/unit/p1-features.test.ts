import { describe, it, expect, beforeEach } from 'vitest';
import { p1Store } from '@/lib/p1/p1-store';

describe('Phase P1 Features - Advanced Workflow & Intelligence Suite', () => {
  beforeEach(() => {
    // p1Store is an in-memory singleton pre-seeded with enterprise domain data
  });

  // P1-1: Template Library (표준 및 커스텀 서식)
  it('P1-1: provides standard Korean public bid proposal templates with sections and guidance', () => {
    const templates = p1Store.getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(4);
    expect(templates.some((t) => t.category === 'R_AND_D')).toBe(true);
    expect(templates.some((t) => t.category === 'DEMONSTRATION')).toBe(true);
    expect(templates.some((t) => t.category === 'PROCUREMENT')).toBe(true);
    expect(templates.every((t) => t.sections.length > 0)).toBe(true);
  });

  // P1-2: Smart Reuse (과거 선정 제안서 및 실적 RAG)
  it('P1-2: searches past winning proposal blocks and capability evidence via Smart Reuse', () => {
    const allItems = p1Store.getSmartReuseRecommendations();
    expect(allItems.length).toBeGreaterThanOrEqual(3);

    const filtered = p1Store.getSmartReuseRecommendations('SLAM');
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered[0].contentSnippet).toContain('SLAM');
    expect(filtered[0].similarityScore).toBeGreaterThanOrEqual(80);
  });

  // P1-5: Agency Intelligence (TIPA, 조달청 등)
  it('P1-5: provides agency intelligence including win rates, evaluation focus, and tips', () => {
    const agencies = p1Store.getAgencyIntelligenceList();
    expect(agencies.length).toBeGreaterThanOrEqual(2);
    const tipa = agencies.find((a) => a.id === 'agency-tipa');
    expect(tipa).toBeDefined();
    expect(tipa?.winRatePercent).toBe(62.5);
    expect(tipa?.evaluationFocusPatterns.length).toBeGreaterThan(0);
  });

  // P1-6: Capability Gap Analysis (20건 전수 진단 기반 미보유 자격/인증 갭 분석)
  it('P1-6: analyzes capability gaps across active bid announcements with severity and solutions', () => {
    const summary = p1Store.getCapabilityGapSummary();
    expect(summary.totalEvaluatedOpportunities).toBe(20);
    expect(summary.gaps.length).toBeGreaterThanOrEqual(3);
    expect(summary.gaps.some((g) => g.impactLevel === 'FATAL_DISQUALIFICATION')).toBe(true);
    expect(summary.gaps.every((g) => g.recommendedAction.length > 0)).toBe(true);
  });

  // P1-7: Executive Portfolio (42.5억 수주 파이프라인 퍼널 및 부서 리소스)
  it('P1-7: aggregates executive portfolio statistics with 42.5B KRW pipeline and manager workload', () => {
    const portfolio = p1Store.getExecutivePortfolio();
    expect(portfolio.totalPipelineBudget).toBe(4250000000);
    expect(portfolio.activeBidsCount).toBe(8);
    expect(portfolio.managerWorkloads.length).toBe(3);
    expect(portfolio.pipelineBreakdown.DISCOVERY).toBe(3);
  });

  // P1-8: Partner / Consortium Pool Manager
  it('P1-8: manages consortium partner directory with capability matching and rating', () => {
    const partners = p1Store.getPartners();
    expect(partners.length).toBeGreaterThanOrEqual(3);
    const initialCount = partners.length;

    const newPartner = p1Store.savePartner({
      id: 'partner-04',
      companyName: '새롬정보통신(주)',
      businessNumber: '110-86-99999',
      region: '인천 연수',
      specialtyDomain: '네트워크 인프라 및 보안관제',
      coreCapabilities: ['네트워크 인프라', '보안관제'],
      certifications: ['정보통신공사업', 'ISO27001'],
      pastCollaborationCount: 2,
      ratingScore: 4.6,
      contactPerson: '정민수 부장',
      contactEmail: 'contact@serom.co.kr',
      contactPhone: '032-888-7777',
      status: 'ACTIVE',
      notes: '수도권 공공 인프라 전문 협력사',
    });

    expect(p1Store.getPartners().length).toBe(initialCount + 1);
    expect(newPartner.id).toBe('partner-04');
  });

  // P1-9: Review / Approval Workflow (4단계 결재 승인/반려 엔진)
  it('P1-9: runs 4-step approval workflow with transition and approval state updates', () => {
    const workflow = p1Store.getProposalApproval('prop-001');
    expect(workflow).toBeDefined();
    expect(workflow.currentStepIndex).toBe(1); // 1: 기술검토 단계 대기

    const updated = p1Store.approveStep('prop-001', 1, 'SLAM 군집제어 및 TRL 7단계 성능 성적서 대조 승인 완료');
    expect(updated.currentStepIndex).toBe(2);
    expect(updated.steps[1].status).toBe('APPROVED');
    expect(updated.steps[2].status).toBe('IN_REVIEW');
  });

  // P1-10: Notification Preference (알림 상세 설정)
  it('P1-10: updates multi-channel notification preferences and thresholds', () => {
    const original = p1Store.getNotificationPreference();
    expect(original.minOpportunityFitScore).toBe(80);

    const updated = p1Store.updateNotificationPreference({
      minOpportunityFitScore: 75,
      inAppNotificationEnabled: true,
      telegramNotificationEnabled: true,
    });

    expect(updated.minOpportunityFitScore).toBe(75);
  });
});
