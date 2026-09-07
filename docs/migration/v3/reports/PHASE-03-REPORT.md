# PHASE 03 REPORT — Funding Opportunity Taxonomy & Funding Intelligence Model

> **Phase**: PHASE 03  
> **Status**: **PASS (Gate Approved)**  
> **Date**: 2026-09-07  
> **Auditor/Engineer**: Principal Product Engineer & Software Architect  

---

## 1. Phase Goal & Summary
기존 단일 공공조달 입찰 중심의 Opportunity 모델을 RoboBid AI v3.0의 **15대 Funding Type, 11대 Applicant Stage, 7단계 Early Signal 및 2대 대분류(정부지원사업 vs 공공조달)**를 포괄하는 Funding Intelligence Taxonomy로 성공적으로 확장하고, 기존 KONEPS/Bizinfo 데이터와의 100% 무손실 하위호환성을 확보함.

---

## 2. Core Implementations & Deliverables

### 2.1 Funding Taxonomy Service (`src/lib/funding/funding-taxonomy-service.ts`)
- **15대 Funding Type 자동 매핑 규칙 구현**:
  - `GOV_RND`, `LOCAL_RND`, `STARTUP_GRANT`, `PROTOTYPE_GRANT`, `VALIDATION_GRANT`, `COMMERCIALIZATION`, `COMPETITION`, `CONTEST`, `PRIZE`, `EXHIBITION`, `EXPORT`, `SALES_SUPPORT`, `PROCUREMENT`, `SERVICE_CONTRACT`, `OTHER`
  - 우선순위: R&D, 창업, 시제품, 실증, 사업화, 경진/상금, 판로/수출 지원사업(P0) 중심
- **11대 지원 대상 기업 단계 (ApplicantStage)**:
  - `PRE_STARTUP`, `STARTUP_UNDER_3Y`, `STARTUP_UNDER_7Y`, `SME`, `VENTURE`, `INNOBIZ`, `CORPORATE_RESEARCH_CENTER`, `LOCAL_COMPANY`, `RESEARCH_ORG`, `CONSORTIUM`, `OTHER`
- **7단계 Early Signal 감지**:
  - `SIGNAL` (시행계획/신호) ➔ `EXPECTED` (공고 예상) ➔ `PRE_ANNOUNCEMENT` (사전예고) ➔ `ANNOUNCED` (공고게시) ➔ `OPEN` (접수개시) ➔ `CLOSING` (마감 7일 이내 임박) ➔ `CLOSED` (접수마감)
- **조달 / 지원사업 2대 대분류 분리**:
  - `PROCUREMENT` (공공조달 구매/용역) vs `GOV_FUNDING` (정부 R&D/보조금/지원사업)
- **출처 (Origin Source) 판별**:
  - `KONEPS`, `BIZINFO`, `TIPA`, `IRIS`, `MANUAL`

### 2.2 OpportunityStore 자동 보강 (Enrichment)
- `OpportunityStore.getAll()` 및 `getById()` 호출 시 레거시 Opportunity 레코드에 v3 Taxonomy를 동적으로 자동 주입(`enrichOpportunity`)
- 기존 DB/스토리지 레코드의 스키마 변경 없이 무손실 100% 하위호환성 유지
- `createManual` 시 FundingType 및 ApplicantStages 수동 선택 지원

### 2.3 Opportunity Workspace UI 고도화 (`src/app/(workspace)/opportunities/page.tsx`)
- **조달 / 지원사업 탭 분리**:
  - 상단에 [전체 보기], [정부지원사업 · R&D (P0)], [공공조달 · 납품/용역] 탭을 배치하여 사용자가 지원사업과 입찰용역을 직관적으로 분리 탐색 가능 (혼동 원천 차단)
- **4대 상세 필터 바 추가**:
  - FundingType (15종 전체 지원유형 드롭다운)
  - ApplicantStage (11종 대상 단계 드롭다운)
  - OriginSource (Bizinfo, KONEPS, TIPA, IRIS, MANUAL 드롭다운)
  - Status & BidType 필터 연동 유지
- **공모 목록 시각적 뱃지 체계화**:
  - 카테고리 배지 (`정부지원금` 초록 vs `공공조달` 파랑)
  - 지원유형 배지 (`정부 R&D`, `시제품제작지원`, `창업지원금` 등)
  - 조기신호 배지 (`정책 신호`, `사전 예고`, `접수 중`, `마감 임박 D-7`)
  - 출처 배지 (`BIZINFO`, `KONEPS`, `TIPA`, `MANUAL`)
  - 지원대상 태그 (`SME`, `벤처`, `3년 미만` 등)

---

## 3. Verification & Quality Gates

| 검증 항목 | 기준 | 결과 | 비고 |
|:---|:---|:---:|:---|
| TypeScript Typecheck | 0 Errors | **PASS** | `npm run typecheck` 통과 |
| Vitest Unit Tests | 100% Pass | **PASS** | 58개 파일, **179/179 Tests 전수 통과** |
| Phase 3 전용 단위 테스트 | 신규 5개 케이스 통과 | **PASS** | `v3-phase3-funding-taxonomy.test.ts` |
| 기존 기능 Regression | 0 건 | **PASS** | 174개 기존 테스트 전체 무결성 유지 |
| KONEPS/Bizinfo 호환성 | 100% 보존 | **PASS** | 출처별 정상 매핑 및 기존 예산/일정 데이터 보존 |
| 조달/지원사업 혼동 방지 | UI 및 로직 분리 | **PASS** | 2대 대분류 필터 및 전용 배지 적용 |

---

## 4. Phase 3 Gate Sign-off

- [x] **Funding Type filter**: 15대 지원유형 정의 및 `/opportunities` 필터 연동 완료
- [x] **Applicant stage**: 11대 기업단계 정의 및 공고 메타데이터 기반 자동 매핑 완료
- [x] **Opportunity source/origin**: KONEPS, Bizinfo, TIPA, IRIS, MANUAL 식별 및 필터 완료
- [x] **기존 KONEPS/Bizinfo 데이터 호환**: 레거시 공고 필드 무손실 및 동적 Enrichment 완료
- [x] **조달/지원사업 혼동 없음**: 대분류 탭 및 전용 색상 배지(`정부지원금` vs `공공조달`) 적용 완료

**Gate Decision: [PASS]**  
➔ **Phase 4 (Semantic Project Match & 14-Axis Evaluation)** 진행을 승인합니다.
