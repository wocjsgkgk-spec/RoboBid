# RoboBid AI v3.0 Migration — Phase 5 Completion Report

**Phase Name**: Funding Fit, Portfolio & Conflict Engine  
**Execution Date**: 2026-09-07  
**Gate Status**: **GATE PASSED**  
**Author**: Principal Product Engineer & Software Architect  

---

## 1. Executive Summary

Phase 5에서는 로봇 개발 프로젝트(Project Concept & Master Spec)에 필요한 실질적인 연구개발 예산과 지원사업(Opportunity)의 허용/불가 비목 및 지원 한도를 정밀 매칭하는 **Funding Fit Engine**, 한 프로젝트에 다수의 지원금을 체계적으로 조합·추적하는 **Funding Portfolio Engine**, 그리고 국가연구개발혁신법 및 전담기관 지침에 따른 중복수혜·중복계상 위험을 7개 영역으로 사전 진단하는 **Funding Conflict Checker**를 성공적으로 구축하였습니다.

기존 v2의 공공조달 입찰 파이프라인 및 경영진 대시보드는 100% 무손실 보존(In-place preservation)되었으며, `/pipeline` 페이지에서 신규 v3 Funding Portfolio 엔진이 기본 활성화되어 Target Cost 대비 실제 수령 확정액(Awarded)과 후보액(Candidate)을 엄격히 분리 집계합니다.

---

## 2. Key Deliverables & Technical Architecture

### 2.1 10대 개발 예산 비목 체계 (`src/types/funding.ts`)
정부 R&D, 시제품 제작지원, 로봇 실증사업 지침에 부합하는 10개 핵심 개발 비목 정의:
1. **인건비 (`LABOR`)**: 총 사업비 상한(통상 50%) 및 기존 인력 현물 / 신규 인력 현금 원칙
2. **재료비 (`MATERIALS`)**: 직접 재료비 실비 인정
3. **부품비 (`PARTS`)**: 로봇 모터, 감속기, 센서, 배터리 등 핵심 BOM 부품비 인정
4. **장비비 (`EQUIPMENT`)**: 범용 장비 불인정, 전용 시험·계측 장비에 한해 상한(30%) 적용
5. **외주비 (`OUTSOURCING`)**: 가공/임가공/전문 용역 40% 이내 상한
6. **실증비 (`VALIDATION`)**: 필드 테스트베드 PoC 운영비 인정
7. **SW/Server (`SW_SERVER`)**: ROS 시뮬레이션, 클라우드 서버, AI 전용 인프라 사용료
8. **마케팅 (`MARKETING`)**: 기술개발 R&D 불인정, 사업화 지원사업에 한해 선별 인정
9. **인증 (`CERTIFICATION`)**: KOLAS 시험성적서 및 KC/CE 로봇 안전인증 수수료
10. **기타 (`OTHER`)**: 간접비 및 연구운영비 (10% 상한)

### 2.2 Funding Fit Engine (`src/lib/funding/funding-fit-service.ts`)
- **입력**: `ProjectConcept` (또는 10개 비목 예산) + `OpportunityFundingTerms` (또는 `Opportunity`) + `MasterSpecification`
- **산출 출력**:
  - `project_cost`: 총 개발비 (원)
  - `grant_amount`: 정부지원금 가능액 (지원 인정액 × (1 - 자부담률) vs 공고 상한액 중 최소값)
  - `self_funding`: 민간부담금 의무 매칭액 (현금/현물)
  - `eligible_cost`: 10개 비목 중 지원 허용 및 상한 규정이 적용된 인정 사업비 총합
  - `coverage`: 프로젝트 총 개발비 대비 정부지원금 충당률 (%)
  - `coverage_by_category`: 10개 비목별 요청액, 허용여부, 인정액, 실지원 충당액, 비목 충당률, 비고
  - `unfunded_gap`: 정부지원금으로 충당되지 않는 잔여 부족액
  - `conditions`: 민간부담 비율, 장비 심의 요건 등 행정 조건 가이드

### 2.3 Funding Portfolio Store & Analytics (`src/lib/funding/funding-portfolio-store.ts`)
- 프로젝트별 다중 지원금의 7대 수명주기 상태 관리:
  - `CANDIDATE` (검토 후보)
  - `PLANNED` (지원 계획)
  - `APPLIED` (접수 완료)
  - `UNDER_REVIEW` (심사 평가 진행)
  - `AWARDED` (최종 선정·협약)
  - `REJECTED` (탈락)
  - `CANCELLED` (취소)
- **Target Cost vs Awarded 분리 집계**:
  - `Target Cost`: 프로젝트 목표 개발비
  - `Awarded`: **실제 수주·확보 완료된 금액** (Candidate는 절대 합산되지 않음)
  - `Under Review`: 심사 진행 중 금액
  - `Planned`: 계획 수립 금액
  - `Candidate`: 탐색 후보 금액
  - `Gap`: 목표 대비 미확보 잔여액 (`targetCost - awarded`)
  - `Coverage`: 목표 달성률 (`awarded / targetCost * 100`)

### 2.4 Funding Conflict Checker Engine (`src/lib/funding/funding-conflict-service.ts`)
국가연구개발혁신법 및 부처별 관리규정에 따른 7대 중복 위험 감지:
1. `SAME_PROJECT`: 동일 프로젝트/공고 중복 신청 (`PROHIBITED`)
2. `SAME_PERIOD`: 선정 완료 과제와 수행 기간 겹침 (`POTENTIAL_CONFLICT`)
3. `SAME_COST_CATEGORY`: 동일 비목 이중 집행 위험 (`POTENTIAL_CONFLICT`)
4. `SAME_ASSET`: 국비 지원 장비/자산 이중 구입 금지 (`PROHIBITED`)
5. `SAME_PART`: 동일 부품/BOM 제작비 중복 검토 (`REVIEW_REQUIRED`)
6. `SAME_LABOR`: 단일 과제 참여율 100% 초과(`PROHIBITED`) 및 다수 과제 동시 참여(`REVIEW_REQUIRED`)
7. `RESTRICTION_RULE`: 중기부 R&D 중복수혜 제한 및 3책 5공 규정 (`REVIEW_REQUIRED` / `POTENTIAL_CONFLICT`)
- **법적 고지 (Mandatory Advisory Disclaimer)**:
  > *"본 검토 결과는 AI 및 규정 기반 분석에 따른 사전 권고안이며, 법적 확정 판단이 아닙니다. 중복수혜 승인 여부와 비목 인정 범위는 각 전담기관 및 주관부처의 최신 공고 관리지침과 담당 간사의 최종 심의에 따라 결정되므로, 사업계획서 제출 전 전담기관에 사전 확인을 반드시 거치시기 바랍니다."*

### 2.5 UI Integration (`src/components/portfolio/v3-funding-portfolio-workspace.tsx` & `/pipeline`)
- `/pipeline` 페이지 상단에 **3단 뷰 모드 토글** 제공:
  - `v3 Funding Portfolio & Conflict` (기본값)
  - `경영진 수주 대시보드` (기존 v2 P1 Executive Dashboard)
  - `5단계 조달 퍼널` (기존 v2 Bid Funnel & Bid Room)
- 7개 핵심 경영 지표 카드 (Target Cost, Awarded, Under Review, Planned, Candidate, Gap, Coverage Gauge)
- 서브 탭 1: 포트폴리오 결합 관리 및 실시간 상태 변경/삭제/추가
- 서브 탭 2: 10대 비목 실시간 예산 매칭 시뮬레이터 (슬라이더 조작에 따른 즉시 재계산)
- 서브 탭 3: 7개 위험 영역 정밀 진단 레이더 및 대응 가이드

### 2.6 REST API Endpoints
- `GET /api/portfolio?projectId=...`: 포트폴리오 목록 및 7대 경영 통계 반환
- `POST /api/portfolio`: 신규 지원사업 포트폴리오 등록
- `PATCH /api/portfolio/[id]`: 상태 변경 (`CANDIDATE` ➔ `UNDER_REVIEW` ➔ `AWARDED` 등)
- `DELETE /api/portfolio/[id]`: 포트폴리오 항목 삭제
- `POST /api/portfolio/fit`: 10개 비목 매칭 및 Coverage/Gap 즉시 연산
- `POST /api/portfolio/conflict`: 7대 중복 충돌 검사 실행

---

## 3. Test & Build Verification

1. **Unit Test Suite (`tests/unit/v3-phase5-funding-fit-and-portfolio.test.ts`)**:
   - 10개 테스트 케이스 100% 통과 (소요시간 21ms)
   - 10대 비목 예산 계산 및 불인정/상한 규정 적용 검증 완료
   - Awarded vs Candidate 분리 집계 및 Gap 계산 검증 완료
   - 동일 프로젝트, 동일 장비, 참여율 100% 초과 시 PROHIBITED 차단 검증 완료
   - 법적 비확정성 고지문구(Disclaimer) 필수 포함 검증 완료

2. **Full Test Suite Regression Run**:
   - **60개 테스트 파일, 194개 유닛 테스트 100% PASS** (194/194 passed, 0 failures)
   - 기존 v2 조달/입찰/보안/규정 테스트 전건 정상 유지

3. **Static Typecheck & Next.js Production Build**:
   - `npm run typecheck`: **0 errors**
   - `npm run build`: **43개 전체 라우트 최적화 빌드 완료** (Static + Dynamic)

---

## 4. Gate Checklist

| 항목 | 요구사항 | 검증 결과 | 상태 |
| :--- | :--- | :--- | :---: |
| **Funding Fit 계산** | 10개 비목별 개발비, 정부지원금, 자부담금, Gap 계산 | `FundingFitService.calculateFit()` 정밀 계산 및 테스트 통과 | **PASS** |
| **비목별 Coverage** | 10개 전 비목의 요청액, 허용여부, 인정액, 충당비율 산출 | `coverage_by_category` 10개 비목 전수 제공 확인 | **PASS** |
| **여러 Funding 조합** | 하나의 프로젝트에 다수 지원금 결합 및 파이프라인 집계 | `FundingPortfolioStore` 다중 지원금 결합 및 CRUD 지원 | **PASS** |
| **Conflict Warning** | 7개 영역 중복 감지 (동일과제, 기간, 비목, 장비, 부품, 인력, 부처규정) | `FundingConflictService` 4단계 리스크 평가 및 권고안 제공 | **PASS** |
| **Award vs Candidate** | 실제 수령액(Awarded)과 후보(Candidate)의 엄격한 분리 | Candidate는 Awarded/Coverage에 합산되지 않고 별도 집계 | **PASS** |
| **Legal Disclaimer** | AI 법적 확정판단 지양 및 사용자 검토 안내 필수 고지 | 고지문구 전 영역 강제 노출 및 테스트 검증 | **PASS** |
| **Regression Zero** | 기존 v2 기능, 테스트, DB 무손실 유지 | 60개 테스트 파일 194개 테스트 전건 합격 | **PASS** |

---

## 5. Conclusion & Next Phase Approval

Phase 5의 모든 목표와 Gate 요구조건이 완벽히 충족되었습니다.  
➔ **Phase 6: Application Workspace, Proposal & Submission Migration** 단계로의 진입을 승인합니다.
