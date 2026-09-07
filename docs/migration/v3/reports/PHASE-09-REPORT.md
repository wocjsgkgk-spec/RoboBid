# Phase 9 Migration Report: Outsourcing & Expert Service v1

## 1. Overview
- **Phase**: 9
- **Status**: **PASS (GATE PASSED)**
- **Scope**:
  - 사내 역량(Vault) 대비 프로젝트 요구사항 갭(Gap) 분석:
    - Company Vault에 등록된 기술 특허, 인력, 장비 등의 역량 자산과 프로젝트 Master Spec 간 비교 분석.
    - 자체 수행 가능 영역(`INTERNAL_ASSIGN`)과 외부 조달/위탁 필수 영역(`EXTERNAL_OUTSOURCE`) 자동 식별 및 추천.
  - Master Spec 기반 외주 발주 패키지(Outsourcing Scope) 자동 추출:
    - 정밀 기구 가공(CNC), 전장/PCB SMT 실장, 펌웨어 임베디드, 클라우드/앱 개발, 공인 시험인증(KOLAS) 등 분야별 발주 과업 자동 분리.
    - 명확한 과업내역서(SOW), 수용 기준(Acceptance Criteria), 확정 산출물(Deliverables), 예산 한도(Budget Cap) 도출.
  - 내부 기밀 차단 및 사용자 승인 게이트 (Zero-Unauthorized-Export / Zero Auto-Contracting):
    - 원가 마진, 코어 알고리즘 등 핵심 영업기밀 블라인드 마스킹.
    - 검토자의 명시적 서명(`approvedBy`, `approvedAt`, `approvalNotes`) 없이는 파트너 공개 및 RFP 발주 불가.
  - 협력업체 풀 및 다면 견적 비교 평가 (Candidate Vendors & Multi-Axis Evaluation):
    - 기술성(40점), 가격 경쟁력(30점), 납기 신뢰도(20점), 관리 안정성(10점)의 4대 축 정량 평가표 기록.
    - AI 자의적 계약 체결 전면 금지 (`No Auto-Contracting` 불변식 준수). 인간 관리자의 최종 판단 보장.

---

## 2. Key Changes Implemented

### 2.1 Types & Domain Models
- **File**: `src/types/outsourcing.ts`, `src/types/index.ts`
- **Details**:
  - `OutsourcingTaskCategorySchema`: 8개 외주 과업 카테고리 (`MECHANICAL_FABRICATION`, `ELECTRONIC_CIRCUIT_PCB`, `EMBEDDED_FIRMWARE`, `CLOUD_SERVER_APP`, `TESTING_CERTIFICATION`, `DESIGN_MODELING`, `CONSULTING_COMPLIANCE`, `OTHER_SUBCONTRACT`).
  - `OutsourcingPackageStatusSchema`: 7단계 워크플로우 상태 (`GAP_IDENTIFIED`, `SCOPE_DEFINED`, `RFP_GENERATED`, `APPROVED`, `SOURCING`, `EVALUATION`, `CONTRACT_READY`).
  - `CapabilityGapItemSchema`, `CandidateVendorSchema`, `ReceivedQuoteSchema`, `QuoteEvaluationSchema`.
  - `OutsourcingPackageSchema` 및 CRUD/승인/평가 입력 인터페이스.

### 2.2 Outsourcing Store & Service
- **File**: `src/lib/outsourcing/outsourcing-service.ts`
- **Details**:
  - `OutsourcingStore`: 싱글톤 인메모리 맵 및 LocalStorage 영속화. 기본 정밀 가공 패키지 시드 탑재.
  - `OutsourcingService.analyzeCapabilityGaps`: Vault 자산(특허, 장비 등)과 프로젝트 요구사항을 비교 분석하여 Gap 및 권장 조치 도출.
  - `OutsourcingService.extractOutsourceScopes`: Master Spec 및 Gap 분석을 토대로 기구 가공, 공인인증 등의 SOW 패키지 자동 생성.
  - `OutsourcingService.approvePackage`: 검토자 성명 및 검토의견 필수 검증 승인 게이트.
  - `OutsourcingService.evaluateQuote`: 다면 역량 평가 점수 집계 및 기록.

### 2.3 API Endpoints
- **Files**:
  - `/api/outsourcing`: 외주 패키지 목록 조회, 수동 생성 및 Master Spec 기반 자동 추출 (`action: "EXTRACT"`)
  - `/api/outsourcing/gap-analysis`: 사내 역량 갭 분석 결과 조회
  - `/api/outsourcing/[id]`: 단일 패키지 조회, 사용자 승인 게이트 (`action: "APPROVE"`), 삭제
  - `/api/outsourcing/[id]/quote`: 신규 견적서 등록 및 다면 정량 평가표 제출

### 2.4 UI Integration
- **Files**:
  - `src/components/outsourcing/v3-outsourcing-workspace.tsx`: 외주·전문가 SOW 통합 워크스페이스 컴포넌트 (갭 분석 모달, 패키지 상세, SOW 열람, 승인 서명 게이트, 견적서 등록 및 4축 평가 폼, 공급업체 신뢰도 뱃지).
  - `src/app/(workspace)/outsourcing/page.tsx`: `/outsourcing` 라우트 페이지.
  - `src/components/layout/sidebar.tsx`: `POST_AWARD_ITEMS`에 "외주·전문가 (SOW)" 네비게이션 등록.

### 2.5 Unit & Regression Tests
- **File**: `tests/unit/v3-phase9-outsourcing-and-expert.test.ts`
- **Details**:
  - 1. Capability Gap Analysis (Vault vs Project Scope) 검증.
  - 2. Outsource Scope Extraction & SOW Generation 검증.
  - 3. Human Approval Gate 필수 승인자 유효성 및 승인 상태 전이 검증.
  - 4. OutsourcingStore CRUD 완결성 검증.
  - 5. Candidate Vendor & Quote Multi-Axis Evaluation (No Auto-Contracting) 검증.
  - 6개 테스트 전원 통과.

---

## 3. Verification & Gate Results

| Test Category | Target | Result | Status |
|---|---|---|---|
| Phase 9 Unit Tests | `v3-phase9-outsourcing-and-expert.test.ts` | 6 passed / 6 total | **PASS** |
| Full Test Suite | `npm test` | 64 suites passed / 236 tests passed | **PASS** |
| Type Safety | `npm run typecheck` | 0 errors | **PASS** |
| Production Build | `npm run build` | 48 routes compiled cleanly | **PASS** |
| Security Invariant | No Auto-Contracting & Human Approval | Verified | **PASS** |
| Data Integrity | Zero-Destructive DB/Auth | Preserved | **PASS** |

---

## 4. Phase 9 Conclusion
- Phase 9 (Outsourcing & Expert Service v1)의 전 영역이 안정적으로 구축되었으며, 모든 Gate 기준을 100% 충족하여 **GATE PASSED** 판정합니다.
- 다음 단계인 **Phase 10: Multi-source Intelligence, Early Signal, Portfolio Advisor & Today v3**로 안전하게 진입합니다.
