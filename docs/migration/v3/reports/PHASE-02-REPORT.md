# PHASE 02 REPORT — Project Concept Vault & Master Specification

> **Phase**: PHASE 02  
> **Status**: **PASS (Gate Approved)**  
> **Date**: 2026-09-07  
> **Auditor/Engineer**: Principal Product Engineer & Software Architect  

---

## 1. Phase Goal & Summary
회사가 개발하고자 하는 로봇을 3초 한 줄 아이디어(Quick Single-Line Idea)부터 체계적으로 등록하고, **Progressive AI Builder**를 통해 11개 단계로 점진적 구체화(Problem ➔ Product ➔ Technical ➔ TRL/KPI ➔ WBS/Budget ➔ BOM ➔ Funding Need ➔ Validation ➔ Outsourcing ➔ Market ➔ Master Spec)하며, **Human-in-the-loop 거버넌스(Suggestion ➔ Diff ➔ Approval ➔ Version)** 및 **과거 버전 롤백 복원(Version Restore)**, **사내 자산(Company Vault) 연계**를 완벽히 구현함.

---

## 2. Core Implementations & Deliverables

### 2.1 Domain Schema & Types Extension (`src/types/concept.ts`)
- **MasterSpecification 확장**:
  - `technicalArchitecture`, `sensorsAndComms`, `aiModelSpec`, `targetEnvironment`
  - `kpis` (성능지표, 목표치, 공인시험성적서 평가방법)
  - `wbsSummary`, `bomEstimate` (부품명, 단가, 수량, 공급업체)
  - `budgetBreakdown` (인건비, 연구시설/재료직접비, 위탁연구/외주비, 간접비)
  - `rolesAndResponsibilities` (R&R), `validationPlan`, `outsourcingPlan`
  - `businessModel`, `salesStrategy`, `securityClassification` (PUBLIC, INTERNAL, CONFIDENTIAL)
- **버전 거버넌스 엔터티 (`MasterSpecVersionRecord`)**:
  - `id`, `projectConceptId`, `version` (v1.0, v1.1...), `changeSummary`, `spec`, `approvedBy`, `approvedAt`, `createdAt`
- **Progressive Builder & Diff 스키마**:
  - `ProgressiveBuilderStep` (11단계)
  - `FieldDiff` (`field`, `label`, `current`, `suggested`, `reasoning`)
  - `BuilderStepSuggestion` (`step`, `stepTitle`, `diffs`, `summary`)
- **Company Vault 연계 필드**:
  - `linkedVaultAssetIds` (특허, 시험인증서, 인력 역량 연동)

### 2.2 Progressive AI Builder Service (`src/lib/concepts/progressive-builder-service.ts`)
- 11단계 로봇 도메인 지식 기반 추천 엔진 구현:
  1. `PROBLEM`: 현장 안전사고 및 숙련공 부족 등 정량적 통증점과 타깃 수요처
  2. `PRODUCT`: 폼팩터, 가반하중 및 환경 경계조건
  3. `TECHNICAL`: ROS2 아키텍처, 3D LiDAR/비전 SLAM, 엣지 AI 추론 파이프라인
  4. `TRL_KPI`: TRL 로드맵 및 KOLAS 공인시험성적서 발급 가능 정량 지표
  5. `WBS_BUDGET`: 국가연구개발혁신법 비목 비율(인건비/직접비/외주비) 및 분기별 WBS
  6. `BOM`: 양산성을 고려한 기구/전장/센서 부품명세서 및 원가 추정
  7. `FUNDING_NEED`: 목표 조달 자금 규모 및 RaaS 구독 비즈니스 모델
  8. `VALIDATION`: 한국로봇산업진흥원(KIRIA)/KTL 시험성적서 및 현장 PoC 실증
  9. `OUTSOURCING`: 핵심 소스코드 사내 보유 및 기구 가공 외주 RFP 분리
  10. `MARKET`: TAM-SAM-SOM 시장 규모 및 3단계 스케일업 전략
  11. `MASTER_SPEC`: 종합 Master Specification 동기화 및 보안 등급 지정
- **무조건적 덮어쓰기 방지 원칙**: AI는 직접 데이터를 수정하지 않고 구조화된 `diffs` 배열만 반환.

### 2.3 Store & Versioning Logic (`src/lib/concepts/concept-store.ts`)
- `createQuickIdea(name, summary)`: 한 줄 아이디어 즉시 등록 및 v1.0 초기 명세서/버전 레코드 자동 생성
- `applyApprovedDiff(...)`: 사용자가 선택하여 승인한 필드만 선별 반영하고 변경 이력을 새 버전으로 기록
- `saveMasterSpec(...)`: Master Spec 수정 및 신규 버전 태그 자동 증가
- `restoreSpecVersion(...)`: 지정한 과거 버전 스냅샷으로 롤백 복원하고 롤백 감사 이력 생성
- `linkVaultAssets(...)`: `/vault`에 등록된 사내 자산 ID 중복 없이 연계
- 기본 샘플 로봇 프로젝트 2종(500kg 자율주행 AMR, AI 3D 비전 협동로봇 조립 셀)에 풀 스펙 및 v1.0 버전 레코드 시딩

### 2.4 REST API Endpoints
- `GET/POST /api/concepts`: 프로젝트 목록 조회 및 1줄 빠른 등록 (`isQuickIdea: true`) 지원
- `GET/PUT/DELETE /api/concepts/[id]`: 단일 프로젝트 조회/수정/삭제 및 Vault 자산 연계
- `POST /api/concepts/[id]/builder`: AI Progressive Builder 단계별 Diff 제안 생성
- `GET/POST /api/concepts/[id]/spec`: Master Spec 조회 및 사용자 승인 Diff/직접 수정 반영
- `POST /api/concepts/[id]/restore`: 과거 특정 버전으로의 안전한 롤백 복원

### 2.5 User Interface (`src/app/(workspace)/projects/page.tsx`)
- **3초 로봇 아이디어 등록 바**: 상단 전용 인풋으로 원클릭 즉시 아이디어 등록
- **프로젝트 요약 대시보드**: 총 개발아이템, 구체화(Spec) 단계, 자금지원 준비완료 건수 및 총 소요 예산 현황
- **Progressive AI Builder 모달**:
  - 11단계 탭 네비게이션
  - 현재값(Current) vs 제안값(Suggested) **Side-by-Side Diff 비교 뷰**
  - 변경 항목별 개별 체크박스 선택 기능
  - AI 제안 근거(Reasoning) 및 **[승인 및 Master Spec 반영]** 버튼
- **Master Specification & 버전 관리 모달**:
  - 명세서 상세 뷰: 아키텍처, 센서, AI, KPI 테이블, BOM 명세서, 예산 비목, R&R, 외주 계획
  - 버전 이력 탭: 모든 버전 태그(`v1.0`, `v2.0`...), 변경 요약, 승인자, 타임스탬프 및 **[이 버전으로 복원]** 원클릭 롤백
  - 사내 역량(Vault) 연계 탭: 특허, 인증서, 연구인력 체크박스 토글 연동

---

## 3. Verification & Quality Gates

| 검증 항목 | 기준 | 결과 | 비고 |
|:---|:---|:---:|:---|
| TypeScript Typecheck | 0 Errors | **PASS** | `npm run typecheck` 에러 없음 |
| Vitest Unit Tests | 100% Pass | **PASS** | 57개 파일, **174/174 Tests 전수 통과** |
| Phase 2 전용 단위 테스트 | 신규 5개 케이스 통과 | **PASS** | `v3-phase2-concept-vault.test.ts` |
| 기존 기능 Regression | 0 건 | **PASS** | 기존 169개 테스트 무결성 100% 유지 |
| Data Loss / Destructive Changes | 0 건 | **PASS** | 무손실 인플레이스 고도화 유지 |
| Next.js Production Build | 40/40 Routes 성공 | **PASS** | 정적 페이지 최적화 및 신규 라우트 5개 정상 번들링 |

---

## 4. Phase 2 Gate Sign-off

- [x] **아이디어 한 줄 등록 가능**: 3초 빠른 등록 바 및 API `isQuickIdea: true` 구현 완료
- [x] **단계적 구체화**: 11단계 Progressive AI Builder 엔진 및 파이프라인 구현 완료
- [x] **User Approval**: AI 자동 덮어쓰기 금지, Side-by-Side Diff 뷰 및 승인 워크플로우 구현 완료
- [x] **Version Restore**: 버전 이력 저장 및 과거 특정 버전으로의 안전한 롤백 복원 구현 완료
- [x] **Project Concept와 기존 Vault 관계 명확**: 사내 자산(특허/인증/역량) 연계 및 가산점 매핑 기반 확립

**Gate Decision: [PASS]**  
➔ **Phase 3 (Funding Opportunity Taxonomy & Funding Intelligence Model)** 진행을 승인합니다.
