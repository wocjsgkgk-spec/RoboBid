# Phase 7 Migration Report: Document Derivation & Secure RFP Generation

## 1. Overview
- **Phase**: 7
- **Status**: **PASS (GATE PASSED)**
- **Scope**:
  - Purpose-Driven Document Derivation from single Master Specification across 4 core domains:
    1. **Government** (5종: 사업계획서, 연구개발계획서, 실증계획서, 창업사업계획서, 기술개발계획서)
    2. **Internal** (5종: 상세 개발계획서, WBS 공정표, 상세 실행예산서, BOM 명세서, 리스크 매트릭스)
    3. **Outsourcing** (5종: 용역 제안요청서(RFP), 과업지시서, 제작사양서, 검수기준서(Acceptance), 산출물 명세서)
    4. **Business** (4종: 솔루션 제품소개서, 시장성 분석, ROI 분석서, 사업화 및 판로전략서)
  - Security Redaction Engine:
    - 6대 민감 정보 분류 (`INTERNAL_STRATEGY`, `FULL_BUDGET`, `INTERNAL_COST`, `CONFIDENTIAL_PIPELINE`, `NON_PUBLIC_LOGIC`, `PROTECTED_ARCHITECTURE`).
    - 4단계 보안 등급 정책 (`L0_PUBLIC`, `L1_PARTNER`, `L2_CONFIDENTIAL`, `L3_SECRET_CORE`).
    - 외주 RFP 특화 BOM 단가 마스킹(`maskBomForOutsourcing`) 및 예산 구조 마스킹(`maskBudgetForOutsourcing`).
  - Master → Derived Doc Section-Level Traceability:
    - 모든 파생 섹션에 `sourceSectionCode`, `sourceSectionTitle`, `sourceField`를 영구 기록하여 추적성 확보.
  - Zero-Unauthorized-Export & Human Approval Gate:
    - 사용자 검토 및 서명 날인(`approvedBy`, `approvedAt`) 전까지 외부 내보내기 원천 차단.
  - Existing Proposal Export Invariant:
    - 기존 조달/지원사업 `ProposalExporter` 기능 및 포맷 100% 보존.

---

## 2. Key Changes Implemented

### 2.1 Types & Domain Models
- **File**: `src/types/derivation.ts`, `src/types/index.ts`
- **Details**:
  - `DerivationCategorySchema`, `DocumentDerivationTypeSchema` (19종 서식 정의).
  - `SecurityClassificationTierSchema` (L0_PUBLIC ~ L3_SECRET_CORE).
  - `SensitiveCategorySchema` (6대 기밀 정보 분류).
  - `DerivedSectionSchema` (원천 추적성 및 Redaction 필드 포함).
  - `DerivedDocumentSchema` (승인 게이트 및 요약 정보 포함).

### 2.2 Security Redaction Engine
- **File**: `src/lib/derivation/security-redaction-engine.ts`
- **Details**:
  - 정규식 및 패턴 기반 자동 민감 정보 검출.
  - 보안 등급 정책(`TIER_REDACTION_POLICY`)에 따른 맞춤형 텍스트 마스킹.
  - 외주 견적용 BOM 단위 원가 비공개 처리 및 파트너 공시용 예산 변환.

### 2.3 Master Specification Document Derivation Service
- **File**: `src/lib/derivation/document-derivation-service.ts`
- **Details**:
  - 19종 문서 유형별 섹션 생성기(Blueprint) 구현.
  - 파생 생성 시 보안 Redaction 자동 결합.
  - 인간 검토 및 승인(`approve`) 메서드 및 다중 포맷(Markdown, HTML, JSON) 내보내기(`exportToFormat`) 엔진.

### 2.4 Derivation Store
- **File**: `src/lib/derivation/derivation-store.ts`
- **Details**:
  - 메모리 맵 및 LocalStorage 연동 영속성 계층.
  - AMR 로봇 기본 시드 데이터(외주 RFP 승인본 및 정부 R&D 계획서) 탑재.

### 2.5 API Endpoints
- **Files**:
  - `/api/concepts/[id]/derive`: 파생 문서 목록 조회 및 신규 파생 생성
  - `/api/concepts/[id]/derive/[docId]`: 단일 파생 문서 조회, 승인(Approval PATCH), 삭제
  - `/api/concepts/[id]/derive/[docId]/export`: 승인 게이트 통과 검증 후 Markdown/HTML/JSON 다운로드

### 2.6 UI Integration
- **Files**:
  - `src/components/concepts/document-derivation-workspace.tsx`: 카테고리/서식 선택기, 파생 문서 목록, 보안 마스킹 뷰 대조, 섹션별 Master Spec 추적성 인스펙터, 서명 승인 바, 내보내기 컨트롤.
  - `src/app/(workspace)/projects/page.tsx`:
    - 프로젝트 카드에 [문서 파생 & 외주 RFP] 버튼 추가.
    - Master Spec 상세 모달에 [문서 파생 & 외주 RFP] 4번째 탭 추가.
    - 독립형 파생 워크스페이스 모달 연동.

---

## 3. Verification & Test Results
- **Unit Tests**:
  - `tests/unit/v3-phase7-document-derivation.test.ts`: 17/17 PASSED.
  - Full Test Suite (`npm test`): 62 test files, 223 tests **100% PASSED**.
- **Type Checking**:
  - `npm run typecheck`: 0 errors.
- **Production Build**:
  - `npm run build`: 43/43 routes successfully compiled.

---

## 4. Phase 7 Gate Checklist
- [x] Master → derived doc traceability
- [x] Source section tracking
- [x] Redaction preview
- [x] User approval gate
- [x] 기존 Proposal Export 손상 없음

**Result**: **GATE PASSED**
