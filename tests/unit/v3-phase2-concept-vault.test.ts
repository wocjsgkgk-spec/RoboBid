import { describe, it, expect, beforeEach } from "vitest";
import { projectConceptStore } from "@/lib/concepts/concept-store";
import { ProgressiveBuilderService } from "@/lib/concepts/progressive-builder-service";
import { ProgressiveBuilderStep } from "@/types";

describe("RoboBid AI v3.0 — Phase 2 Project Concept Vault & Master Specification", () => {
  beforeEach(() => {
    projectConceptStore.clearAll();
  });

  // 1. 아이디어 한 줄 빠른 등록 검증
  it("아이디어 한 줄(Quick Idea) 등록 시 IDEA 상태 및 v1.0 초기 명세서가 자동 생성된다", () => {
    const quickConcept = projectConceptStore.createQuickIdea("농업용 자율 수확 로봇");

    expect(quickConcept.id).toBeDefined();
    expect(quickConcept.name).toBe("농업용 자율 수확 로봇");
    expect(quickConcept.status).toBe("IDEA");
    expect(quickConcept.targetTrl).toBe(3);

    const spec = projectConceptStore.getMasterSpec(quickConcept.id);
    expect(spec).toBeDefined();
    expect(spec?.version).toBe("v1.0");

    const versions = projectConceptStore.getSpecVersions(quickConcept.id);
    expect(versions.length).toBe(1);
    expect(versions[0].version).toBe("v1.0");
    expect(versions[0].changeSummary).toContain("한 줄 아이디어 최초 등록");
  });

  // 2. 단계적 구체화 (Progressive AI Builder) 검증
  it("ProgressiveBuilderService가 11개 전 단계에서 구조화된 Diff 제안을 생성한다", () => {
    const concept = projectConceptStore.createQuickIdea("웨어러블 재활 보행 로봇");
    const currentSpec = projectConceptStore.getMasterSpec(concept.id);

    const steps: ProgressiveBuilderStep[] = [
      "PROBLEM",
      "PRODUCT",
      "TECHNICAL",
      "TRL_KPI",
      "WBS_BUDGET",
      "BOM",
      "FUNDING_NEED",
      "VALIDATION",
      "OUTSOURCING",
      "MARKET",
      "MASTER_SPEC",
    ];

    for (const step of steps) {
      const suggestion = ProgressiveBuilderService.generateStepSuggestion(concept, currentSpec, step);

      expect(suggestion.step).toBe(step);
      expect(suggestion.stepTitle).toBeDefined();
      expect(suggestion.diffs.length).toBeGreaterThan(0);

      // Diff 구조 검증 (field, current, suggested, reasoning)
      for (const diff of suggestion.diffs) {
        expect(diff.field).toBeDefined();
        expect(diff.label).toBeDefined();
        expect(diff.current).toBeDefined();
        expect(diff.suggested.length).toBeGreaterThan(0);
        expect(diff.reasoning.length).toBeGreaterThan(0);
      }
    }
  });

  // 3. User Approval & Diff 반영 거버넌스 검증 (AI는 원본을 자동 덮어쓰지 않음)
  it("AI 제안 생성만으로는 원본이 변하지 않으며, 사용자 승인(applyApprovedDiff) 시에만 반영된다", () => {
    const concept = projectConceptStore.createQuickIdea("배관 비파괴 탐사 로봇");
    const initialSpec = projectConceptStore.getMasterSpec(concept.id)!;

    // AI 제안 생성 (원본에 영향 없어야 함)
    const suggestion = ProgressiveBuilderService.generateStepSuggestion(concept, initialSpec, "PROBLEM");
    const unchangedConcept = projectConceptStore.getById(concept.id)!;
    expect(unchangedConcept.problemStatement).toBeNull();

    // 사용자 승인 및 반영
    const approvedDiffs = {
      problemStatement: suggestion.diffs[0].suggested,
      targetUser: suggestion.diffs[1].suggested,
      productConcept: "초소형 자주식 배관 탐사 로봇",
    };

    const result = projectConceptStore.applyApprovedDiff(
      concept.id,
      approvedDiffs,
      "1단계 문제정의 및 제품 승인",
      "사업개발팀 김수석"
    );

    expect(result.concept.problemStatement).toBe(suggestion.diffs[0].suggested);
    expect(result.concept.targetUser).toBe(suggestion.diffs[1].suggested);
    // 제품 정의 추가 시 IDEA -> CONCEPT 상태 자동 진전
    expect(result.concept.status).toBe("CONCEPT");

    // 버전 이력 확인
    const versions = projectConceptStore.getSpecVersions(concept.id);
    expect(versions.length).toBe(2);
    expect(versions[0].changeSummary).toBe("1단계 문제정의 및 제품 승인");
    expect(versions[0].approvedBy).toBe("사업개발팀 김수석");
  });

  // 4. Versioning 및 Version Restore (롤백 복원) 검증
  it("Master Specification의 과거 버전으로 안전하게 롤백 복원할 수 있다", () => {
    const concept = projectConceptStore.createQuickIdea("방역 소독 소방 로봇");

    // 버전 1: 초기 상태
    const v1Spec = projectConceptStore.getMasterSpec(concept.id)!;

    // 버전 2: 아키텍처 및 KPI 승인 반영
    projectConceptStore.saveMasterSpec(
      concept.id,
      {
        technicalArchitecture: "ROS2 기반 화재 센서 제어기",
        kpis: [{ metricName: "방수압력", targetValue: "10 bar", evaluationMethod: "공인시험" }],
      },
      "2차 아키텍처 확정"
    );

    // 버전 3: 잘못된 수정 발생
    projectConceptStore.saveMasterSpec(
      concept.id,
      {
        technicalArchitecture: "잘못 수정된 아키텍처",
      },
      "오류 수정 시도"
    );

    let currentSpec = projectConceptStore.getMasterSpec(concept.id)!;
    expect(currentSpec.technicalArchitecture).toBe("잘못 수정된 아키텍처");

    const versions = projectConceptStore.getSpecVersions(concept.id);
    expect(versions.length).toBe(3);

    // 버전 2의 ID 찾기
    const targetV2 = versions.find((v) => v.changeSummary === "2차 아키텍처 확정")!;
    expect(targetV2).toBeDefined();

    // 버전 2로 복원 실행
    const restoredSpec = projectConceptStore.restoreSpecVersion(concept.id, targetV2.id, "품질관리팀장");

    expect(restoredSpec.technicalArchitecture).toBe("ROS2 기반 화재 센서 제어기");
    expect(restoredSpec.kpis[0].metricName).toBe("방수압력");

    // 복원 후 새 버전 레코드가 감사 추적에 기록되었는지 확인
    const updatedVersions = projectConceptStore.getSpecVersions(concept.id);
    expect(updatedVersions.length).toBe(4);
    expect(updatedVersions[0].changeSummary).toContain("롤백 복원");
  });

  // 5. Project Concept와 Company Vault(사내 역량) 연계 검증
  it("Project Concept에 사내 보유 특허, 인증, 역량 자산(Vault Asset)을 중복 없이 연계한다", () => {
    const concept = projectConceptStore.createQuickIdea("협동로봇 용접 자동화 시스템");
    expect(concept.linkedVaultAssetIds).toEqual([]);

    // 자산 2건 연계
    const updated1 = projectConceptStore.linkVaultAssets(concept.id, ["vault-patent-001", "vault-cert-002"]);
    expect(updated1.linkedVaultAssetIds).toEqual(["vault-patent-001", "vault-cert-002"]);

    // 중복 포함 추가 연계 시 중복 제거 확인
    const updated2 = projectConceptStore.linkVaultAssets(concept.id, ["vault-cert-002", "vault-track-003"]);
    expect(updated2.linkedVaultAssetIds).toEqual([
      "vault-patent-001",
      "vault-cert-002",
      "vault-track-003",
    ]);
  });
});
