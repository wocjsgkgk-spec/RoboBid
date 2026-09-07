import { describe, it, expect, beforeEach } from "vitest";
import {
  ProjectConcept,
  MasterSpecification,
} from "@/types/concept";
import {
  SecurityClassificationTier,
  SensitiveCategory,
  CreateDerivationInput,
} from "@/types/derivation";
import { DocumentDerivationService } from "@/lib/derivation/document-derivation-service";
import { SecurityRedactionEngine } from "@/lib/derivation/security-redaction-engine";
import { DerivationStore } from "@/lib/derivation/derivation-store";
import { ProposalExporter } from "@/lib/proposals/proposal-exporter";
import { Proposal, ProposalSection } from "@/types/proposal";

describe("Phase 7 — Document Derivation & Secure RFP Generation", () => {
  let mockConcept: ProjectConcept;
  let mockSpec: MasterSpecification;

  beforeEach(() => {
    mockConcept = {
      id: "c001-amr-test",
      organizationId: "org-001",
      name: "항만 물류 고중량 500kg 자율주행 협동 AMR 로봇",
      summary: "제조 및 풀필먼트 센터의 중량물 팔레트 이송을 완전 자동화하는 듀얼 SLAM 기반 AMR 시스템",
      problemStatement: "인력 운반 시 근골격계 안전사고 다발 및 심야 시간대 운송 인력 구인난 극심",
      targetUser: "중대형 스마트 물류센터 및 제조공장",
      productConcept: "저상형 500kg 가반하중 듀얼 3D LiDAR 기반 비정형 장애물 회피 AMR",
      technicalConcept: "ROS2 기반 실시간 궤적 제어, Multi-Sensor Fusion SLAM, Dynamic Costmap 주행",
      targetTrl: 6,
      requiredTechnology: ["ROS2", "3D-LiDAR SLAM", "CAN-FD", "FMS 관제"],
      estimatedBudget: 800_000_000,
      requiredFunding: 600_000_000,
      marketAnalysis: "국내 물류 로봇 시장 연 28% 성장세",
      salesModel: "초기 H/W 공급 + Fleet Manager 관제 S/W 연간 구독 라이선스 (RaaS)",
      owner: "로봇연구소 김수석",
      status: "SPECIFICATION",
      currentVersion: 1,
      linkedVaultAssetIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSpec = {
      id: "spec-001",
      projectConceptId: "c001-amr-test",
      version: "v1.0",
      architectureSummary: "ROS2 Humble 기반 분산 노드 아키텍처 및 안전 PLC 통합 제어",
      technicalArchitecture: "ROS2 Humble 마이크로 서비스 아키텍처\n보호된 전장 회로도 및 모터 드라이버 내부 FET 회로 설계\n내부 DB 접속: postgres://admin:secret@192.168.1.100:5432/robodb\n독점 알고리즘 수식: Loss = alpha * TRL + beta * costmap",
      hwSwSpecifications: {
        payloadKg: 500,
        maxSpeedMs: 1.8,
        runTimeHours: 8,
      },
      sensorsAndComms: ["SICK Safety LiDAR", "Ouster 32ch 3D LiDAR", "RealSense RGB-D"],
      aiModelSpec: "YOLOv8 기반 파렛트 정밀 세그멘테이션 독점 알고리즘 수식 탑재",
      targetEnvironment: "에폭시 바닥, 0~45도, 100~800 Lux",
      kpis: [
        { metricName: "위치 정지 정밀도", targetValue: "±10mm 이하", evaluationMethod: "KOLAS 공인시험성적서" },
        { metricName: "최대 주행 속도", targetValue: "1.8 m/s", evaluationMethod: "시험장 실측" },
      ],
      wbsSummary: [
        "WBS 1: 시스템 요구사항 및 기구 섀시 설계 (M1~M3)",
        "WBS 2: 듀얼 드라이브 전장 제어기 제작 (M4~M6)",
      ],
      bomEstimate: [
        { partName: "750W BLDC 서보모터", unitCost: 1_800_000, quantity: 2, vendor: "정밀모터" },
        { partName: "Ouster OS1-32", unitCost: 4_500_000, quantity: 1, vendor: "Ouster" },
      ],
      budgetBreakdown: {
        directCost: 280_000_000,
        laborCost: 320_000_000,
        outsourcingCost: 120_000_000,
        indirectCost: 80_000_000,
      },
      rolesAndResponsibilities: [
        { role: "시스템 총괄 PM", responsibility: "WBS 마일스톤 총괄", headCount: 1 },
      ],
      validationPlan: "KIRIA 공인 시험 및 스마트 물류센터 2개월 현장 실증",
      outsourcingPlan: "알루미늄 섀시 가공 및 전장 하네스 배선 외주 제작",
      businessModel: "로봇 단품 납품 4,500만원 + 관제 구독 월 35만원",
      salesStrategy: "정부 스마트공장 보급사업 수혜기업 대상 매칭 사내 영업 전략 및 비공개 로드맵",
      securityClassification: "INTERNAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  describe("1. Master Spec → Derived Document Traceability", () => {
    it("should preserve sourceSectionCode, sourceSectionTitle, and sourceField across all sections", () => {
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });

      expect(derived.sections.length).toBeGreaterThan(0);
      for (const section of derived.sections) {
        expect(section.sourceSectionCode).toBeTruthy();
        expect(section.sourceSectionTitle).toBeTruthy();
        expect(section.sourceField).toBeTruthy();
        expect(["productConcept", "technicalArchitecture", "kpis", "wbsSummary", "budgetBreakdown"]).toContain(
          section.sourceField
        );
      }
    });

    it("should link derived document back to projectConceptId and masterSpecVersion", () => {
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "GOVERNMENT",
        documentType: "GOV_RND_PLAN",
      });

      expect(derived.projectConceptId).toBe(mockConcept.id);
      expect(derived.masterSpecVersion).toBe("v1.0");
      expect(derived.category).toBe("GOVERNMENT");
      expect(derived.documentType).toBe("GOV_RND_PLAN");
    });
  });

  describe("2. Derivation across 4 Categories & Document Subtypes", () => {
    it("should derive Government documents (GOV_RND_PLAN, GOV_BUSINESS_PLAN, etc.)", () => {
      const rndPlan = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "GOVERNMENT",
        documentType: "GOV_RND_PLAN",
      });
      expect(rndPlan.sections.length).toBe(5);
      expect(rndPlan.sections[0].title).toContain("연구개발의 개요 및 필요성");
      expect(rndPlan.targetClassification).toBe("L2_CONFIDENTIAL");

      const bizPlan = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "GOVERNMENT",
        documentType: "GOV_BUSINESS_PLAN",
      });
      expect(bizPlan.sections.length).toBe(3);
    });

    it("should derive Internal documents (INTERNAL_DEV_PLAN, INTERNAL_WBS, INTERNAL_BOM)", () => {
      const bomDoc = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "INTERNAL",
        documentType: "INTERNAL_BOM",
      });
      expect(bomDoc.targetClassification).toBe("L3_SECRET_CORE");
      // Internal BOM retains unit costs
      expect(bomDoc.sections[0].rawContent).toContain("1,800,000");
    });

    it("should derive Outsourcing documents (OUTSOURCING_RFP, OUTSOURCING_TASK_SPEC)", () => {
      const rfp = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });
      expect(rfp.targetClassification).toBe("L1_PARTNER");
      expect(rfp.sections.some((s) => s.sectionCode === "RFP_01_OVERVIEW")).toBe(true);
      expect(rfp.sections.some((s) => s.sectionCode === "RFP_05_BUDGET_SCOPE")).toBe(true);
    });

    it("should derive Business documents (BUSINESS_PRODUCT_INTRO, BUSINESS_ROI)", () => {
      const intro = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "BUSINESS",
        documentType: "BUSINESS_PRODUCT_INTRO",
      });
      expect(intro.targetClassification).toBe("L0_PUBLIC");
      expect(intro.sections[0].title).toContain("제품 컨셉");
    });
  });

  describe("3. Security Redaction Engine", () => {
    it("should detect sensitive categories in technical text", () => {
      const sampleText = "사내 영업 전략 및 총 사업비 : 800,000,000원, unitCost: 1,800,000, postgres://admin@192.168.1.5/db";
      const detected = SecurityRedactionEngine.detectSensitiveCategories(sampleText);

      expect(detected).toContain("INTERNAL_STRATEGY");
      expect(detected).toContain("FULL_BUDGET");
      expect(detected).toContain("INTERNAL_COST");
      expect(detected).toContain("CONFIDENTIAL_PIPELINE");
    });

    it("should mask sensitive items when target tier is L1_PARTNER (Outsourcing)", () => {
      const rawText = "보호된 전장 회로도 구성 및 독점 알고리즘 수식 적용. postgres://internal-db:5432/secrets";
      const result = SecurityRedactionEngine.redactText(rawText, "L1_PARTNER");

      expect(result.isRedacted).toBe(true);
      expect(result.redactedText).toContain("[REDACTED: PROTECTED_ARCHITECTURE");
      expect(result.redactedText).toContain("[REDACTED: NON_PUBLIC_LOGIC");
      expect(result.redactedText).toContain("[REDACTED: CONFIDENTIAL_PIPELINE");
      expect(result.redactedText).not.toContain("postgres://");
    });

    it("should preserve original text when target tier is L3_SECRET_CORE", () => {
      const rawText = "사내 극비 원천 정보: postgres://admin@192.168.1.1/db 및 독점 알고리즘 수식";
      const result = SecurityRedactionEngine.redactText(rawText, "L3_SECRET_CORE");

      expect(result.isRedacted).toBe(false);
      expect(result.redactedText).toBe(rawText);
    });

    it("should mask individual unit costs in BOM for outsourcing", () => {
      const bom = [
        { partName: "서보모터", unitCost: 1800000, quantity: 2, vendor: "비밀거래처" },
      ];
      const masked = SecurityRedactionEngine.maskBomForOutsourcing(bom, "L1_PARTNER");

      expect(masked.redactedMarkdown).toContain("[내부원가 비공개]");
      expect(masked.redactedMarkdown).not.toContain("1,800,000");
      expect(masked.maskedBom[0].partName).toBe("서보모터");
      expect(masked.maskedBom[0].quantity).toBe(2);
    });

    it("should mask internal labor and margins in Budget for outsourcing", () => {
      const budget = {
        directCost: 280_000_000,
        laborCost: 320_000_000,
        outsourcingCost: 120_000_000,
        indirectCost: 80_000_000,
      };
      const masked = SecurityRedactionEngine.maskBudgetForOutsourcing(budget, "L1_PARTNER");

      expect(masked.redactedMarkdown).toContain("120,000,000 원");
      expect(masked.redactedMarkdown).toContain("사내 직접비, 사내 인건비 및 내부 원가 구조는 대외비(CONFIDENTIAL)로 비공개");
      expect(masked.redactedMarkdown).not.toContain("320,000,000");
    });
  });

  describe("4. Zero-Unauthorized-Export & User Approval Gate", () => {
    it("should initialize with isApproved: false", () => {
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });

      expect(derived.isApproved).toBe(false);
      expect(derived.approvedBy).toBeNull();
      expect(derived.approvedAt).toBeNull();
    });

    it("should throw error if attempting to export an unapproved document", () => {
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });

      expect(() => {
        DocumentDerivationService.exportToFormat(derived, "markdown");
      }).toThrow(/보안 규정 위반: 사용자 검토 및 승인/);
    });

    it("should require a valid approvedBy name to approve document", () => {
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });

      expect(() => {
        DocumentDerivationService.approve(derived, { approvedBy: "" });
      }).toThrow("승인자(검토자) 성명은 필수 입력 사항입니다.");
    });

    it("should successfully approve and allow export once signed off", () => {
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });

      const approved = DocumentDerivationService.approve(derived, {
        approvedBy: "김수석 PM",
        approvalNotes: "외주 발주 배포 승인",
      });

      expect(approved.isApproved).toBe(true);
      expect(approved.approvedBy).toBe("김수석 PM");
      expect(approved.approvedAt).toBeTruthy();

      const exportedMarkdown = DocumentDerivationService.exportToFormat(approved, "markdown", true);
      expect(exportedMarkdown).toContain("# [외주 발주]");
      expect(exportedMarkdown).toContain("김수석 PM");
      expect(exportedMarkdown).toContain("<!-- [추적성 정보]");

      const exportedJson = DocumentDerivationService.exportToFormat(approved, "json");
      expect(JSON.parse(exportedJson).id).toBe(derived.id);
    });
  });

  describe("5. Derivation Store & Local Persistence", () => {
    it("should store and retrieve derived documents by conceptId", () => {
      const store = DerivationStore.getInstance();
      const derived = DocumentDerivationService.derive(mockConcept, mockSpec, {
        projectConceptId: mockConcept.id,
        category: "OUTSOURCING",
        documentType: "OUTSOURCING_RFP",
      });

      store.saveDocument(derived);
      const retrieved = store.getDocumentById(derived.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(derived.id);

      const list = store.getDocumentsByConcept(mockConcept.id);
      expect(list.some((d) => d.id === derived.id)).toBe(true);
    });
  });

  describe("6. ProposalExporter Invariant (Zero Regression)", () => {
    it("should maintain existing ProposalExporter functionality with zero degradation", () => {
      const mockProposal: Proposal = {
        id: "prop-999",
        organizationId: "org-1",
        opportunityId: "opp-1",
        title: "기존 제안서 내보내기 보존 검증",
        status: "DRAFTING",
        currentVersion: 1,
        targetSubmissionDate: "2026-10-15T00:00:00Z",
        totalBudget: 500000000,
        createdBy: "user-1",
        metadata: {
          announcingAgency: "조달청 / 정부 주관기관",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockSections: ProposalSection[] = [
        {
          id: "sec-1",
          proposalId: "prop-999",
          sectionCode: "1.1_OVERVIEW",
          title: "1.1 과제 개요",
          orderIndex: 0,
          contentMarkdown: "기존 제안서 본문 내용",
          evidenceCitations: [],
          status: "EDITED",
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const md = ProposalExporter.toMarkdown(mockProposal, mockSections, {
        includeTableOfContents: true,
      });

      expect(md).toContain("# 기존 제안서 내보내기 보존 검증");
      expect(md).toContain("기존 제안서 본문 내용");
      expect(md).toContain("RoboBid AI Verified");
    });
  });
});
