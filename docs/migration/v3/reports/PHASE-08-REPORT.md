# Phase 8 Migration Report: Award Workspace & Development Transition

## 1. Overview
- **Phase**: 8
- **Status**: **PASS (GATE PASSED)**
- **Scope**:
  - Award Workspace & Post-Award Execution:
    - 선정 통보(Award)를 실제 개발 프로젝트(DevelopmentProject)로 매끄럽게 1-Click 연계.
    - 확정 정부지원금, 총 사업비, 민간부담금(현금 20% + 현물 80%) 자동 산출.
    - 공식 협약 정보(협약번호, 전담기관, 수행기간, 중간/최종 평가일, 정산 기한) 연동.
  - 지원금 비목별 예산 배정 (Funding & Cost Category Allocation):
    - 10대 비용 비목(인건비, 재료비, 부품비, 장비비, 외주용역비, 실증비, 클라우드/SW, 특허/인증비 등) 배정 및 실시간 집행 추적.
    - 비목별 집행 시 잔액 자동 차감 및 간접비 상한선(15%) 준수.
  - WBS 실무 4분할 분장 (Work Breakdown Structure):
    - `자체 수행 (INTERNAL_WORK)`: 시스템 아키텍처 및 코어 제어 SW 개발
    - `외주 용역 (EXTERNAL_WORK)`: 기구 가공 및 전장 배선 조립 외주
    - `부품 구매 (PROCUREMENT)`: 3D LiDAR, 서보모터 등 핵심 하드웨어 구매
    - `인증 실증 (VALIDATION)`: KOLAS 시험성적서 및 수요처 현장 부하 실증
  - Proposal & Master Specification WBS/BOM/KPI 재사용:
    - Concept의 Master Spec에 정의된 `wbsSummary`, `kpis`, `outsourcingPlan`, `bomEstimate`를 개발 프로젝트에 즉시 승계.
  - 외주 과업 범위 (Outsourcing Scope):
    - Phase 7에서 생성된 외주 RFP 및 요구 규격, 수용 기준(Acceptance Criteria), 외주 예산 한도 연계.
  - 단계별 마일스톤, 정기 보고 일정(착수/중간/최종/정산), 확정 산출물(Deliverables) 추적.
  - 제출 단계(Pre-Award)와 개발 단계(Post-Award)의 명확한 상태 분리 (Zero-Confusion).

---

## 2. Key Changes Implemented

### 2.1 Types & Domain Models
- **File**: `src/types/award.ts`, `src/types/index.ts`
- **Details**:
  - `DevelopmentProjectStatusSchema` (`AWARDED`, `AGREEMENT_SIGNED`, `DEVELOPMENT_ACTIVE`, `MIDTERM_REVIEW`, `FINAL_EVALUATION`, `COMPLETED`, `CLOSED`).
  - `DevelopmentWorkCategorySchema` (`INTERNAL_WORK`, `EXTERNAL_WORK`, `PROCUREMENT`, `VALIDATION`).
  - `AwardAgreementSchema`, `AwardFundingAllocationSchema`, `CategoryBudgetAllocationSchema`.
  - `DevelopmentMilestoneSchema`, `DevelopmentWorkItemSchema`, `DevelopmentOutsourcingScopeSchema`, `DevelopmentReportingSchema`, `DevelopmentDeliverableSchema`.
  - `DevelopmentProjectSchema` 및 `AwardTransitionInput`.

### 2.2 Award Transition Engine
- **File**: `src/lib/award/award-transition-service.ts`
- **Details**:
  - `transitionToDevelopmentProject`: 공고/제안서/Master Spec 정보를 통합하여 개발 프로젝트 객체 생성.
  - 정부출연금 비율 및 민간 자부담금(현금/현물) 자동 계산.
  - 10대 비목별 예산 배정표 초기화.
  - Master Spec WBS 및 KPI 기반 마일스톤 및 산출물 자동 생성.
  - `recordExpense`: 실시간 비목별 집행액 기록 및 잔액 자동 갱신.

### 2.3 Award Store
- **File**: `src/lib/award/award-store.ts`
- **Details**:
  - 싱글톤 인메모리 맵 및 LocalStorage 동기화 영속성 계층.
  - 물류창고 고중량 AMR 로봇 실증 개발 기본 시드 데이터 탑재.

### 2.4 API Endpoints
- **Files**:
  - `/api/awards`: 선정 개발 프로젝트 목록 조회 및 신규 전환 생성 (POST)
  - `/api/awards/[id]`: 단일 개발 프로젝트 상세 조회, 상태/협약/WBS 수정 (PATCH), 삭제 (DELETE)
  - `/api/awards/[id]/expense`: 비목별 실시간 사업비 집행 처리 및 잔액 차감 (POST)

### 2.5 UI Integration
- **Files**:
  - `src/components/award/v3-award-workspace.tsx`:
    - 상단 Executive Metric 카드 (확정 지원금, 총 사업비, 자부담, 집행률/잔액).
    - 6대 탭: 비목별 배정 및 집행 등록 / WBS 4분할 실무 분장 / 외주 과업 Scope / 마일스톤 & 정기보고 / 확정 산출물 추적 / 협약 및 규정 안내.
  - `src/app/(workspace)/awards/page.tsx`: 전용 `/awards` 라우트 페이지 신설.
  - `src/components/layout/sidebar.tsx`: [선정·개발 (Award)] 사이드바 메뉴 연동.

---

## 3. Verification & Test Results
- **Unit Tests**:
  - `tests/unit/v3-phase8-award-and-transition.test.ts`: 7/7 PASSED.
  - Full Test Suite (`npm test`): 63 test files, 230 tests **100% PASSED**.
- **Type Checking**:
  - `npm run typecheck`: 0 errors.
- **Production Build**:
  - `npm run build`: 45/45 routes successfully compiled.

---

## 4. Phase 8 Gate Checklist
- [x] Award → DevelopmentProject 전환
- [x] 지원금 예산 추적 (비목별 실시간 집행 및 잔액 관리)
- [x] Proposal/WBS 재사용
- [x] 제출 단계와 개발 단계 혼동 없음
- [x] 불필요한 ERP 복잡도 배제 (간결한 실무 중심 구조)

**Result**: **GATE PASSED**
