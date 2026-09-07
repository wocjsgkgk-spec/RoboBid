# 03. 데이터 모델 마이그레이션 계획 (Data Model Migration Plan)

> **문서 상태**: Final Data Model Migration Plan  
> **기준일자**: 2026-09-07  
> **절대 원칙**: **Additive Migration Only (추가적 마이그레이션만 허용)**  
> ⚠️ **절대 금지**: DB Reset, Supabase 초기화, 기존 테이블 Drop, 기존 컬럼 삭제, 사용자 데이터 삭제.

---

## 1. 현재 v2.0 DB 스키마 vs v3.0 요구 엔티티 비교 분석

| v3.0 요구 엔티티 | 기존 매핑 테이블 / 상태 | 마이그레이션 전략 분류 | 상세 조치 및 스키마 설계안 |
| :--- | :--- | :---: | :--- |
| **`ProjectConcept`** | 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `project_concepts`<br>• 속성: `id`, `organization_id`, `name`, `summary`, `problem_statement`, `product_concept`, `technical_concept`, `target_trl`, `kpi`, `estimated_budget`, `status`, `created_at`, `updated_at` |
| **`MasterSpecification`**| 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `master_specifications`<br>• 속성: `id`, `project_concept_id`, `version`, `architecture_json`, `hw_sw_spec_json`, `bom_json`, `wbs_json`, `security_level`, `is_current` |
| **`FundingOpportunity`** | 기존 `opportunities` | **Column 확장 가능**<br>(Extend Columns) | • 기존 `opportunities` 테이블 100% 보존<br>• 신규 컬럼 추가:<br>  - `funding_type VARCHAR(50)` (15대 Taxonomy)<br>  - `is_early_signal BOOLEAN DEFAULT false`<br>  - `signal_stage VARCHAR(50)` (SIGNAL, EXPECTED, ANNOUNCED 등)<br>  - `forecast_period VARCHAR(50)`<br>  - `allowable_costs_json JSONB` (인건비/장비/외주 등 인정비목) |
| **`FundingSignal`** | 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `funding_signals`<br>• 속성: `id`, `title`, `source_agency`, `signal_type` (수요조사/사업시행계획/사전예고), `confidence_level`, `expected_date`, `opportunity_id` (연계 시) |
| **`FundingSource`** | 기존 `providers` | **Column 확장 가능**<br>(Extend Columns) | • 기존 `providers` 테이블에 `tier VARCHAR(20)` (Tier 1~5), `category VARCHAR(50)` (R&D, 창업, TP, 조달 등) 컬럼 추가 |
| **`FundingMatch`** | 신규 필요 (M:N) | **Join Table 필요**<br>(Join Table) | • 테이블명: `project_funding_matches`<br>• `project_concept_id` ↔ `opportunity_id` 간 매칭 관계 및 매칭 사유, AI 신뢰도 저장 |
| **`FundingEvaluation`** | 기존 `evaluations` | **새 Table / 확장**<br>(Extend or New) | • 14-Axis 평가 프로파일 저장을 위한 `fourteen_axis_evaluations` 테이블 신설 (`opportunity_id`, `project_concept_id`, `scores_json`, `radar_data_json`) |
| **`FundingFit`** | 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `funding_fits`<br>• 프로젝트 예산 대비 지원금 충당률(`coverage_ratio`), `matched_budget`, `uncovered_budget`, `cost_breakdown_json` |
| **`FundingPortfolio`** | 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `funding_portfolios`<br>• 프로젝트별 자금 바스켓 (`project_concept_id`, `target_development_cost`, `total_awarded`, `total_applied`, `funding_gap`) |
| **`FundingAllocation`** | 신규 필요 | **Join Table 필요**<br>(Join Table) | • 테이블명: `portfolio_allocations`<br>• 포트폴리오 내 개별 공모 배정 상태 (`CANDIDATE`, `PLANNED`, `APPLIED`, `AWARDED`) |
| **`FundingConflict`** | 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `funding_conflicts`<br>• `project_concept_id`, `opp_id_a`, `opp_id_b`, `conflict_type` (동일비목/동일기간), `risk_level`, `details` |
| **`ApplicantProfile`** | 기존 `vault_records` | **Column 확장 가능**<br>(Extend Columns) | • 기존 회사 프로필에 `applicant_stage` (`PRE_STARTUP`, `STARTUP_UNDER_3Y`, `SME`, `INNOBIZ` 등) 및 인증 이력 컬럼 추가 |
| **`CapabilityPlan`** | 신규 필요 | **새 Table 필요**<br>(New Table) | • 테이블명: `capability_acquisition_plans`<br>• 부족 역량별 확보 방안 (`status`: `AVAILABLE`, `PLANNED`, `OUTSOURCE`, `PARTNER_REQUIRED`) |
| **`Application`** | 기존 `proposals` | **현재 Entity 재사용**<br>(Reuse & Alias) | • 기존 `proposals` 테이블 구조 100% 재사용<br>• `funding_type`, `application_workspace_status` 컬럼 추가 |
| **`Award`** | 기존 `projects` | **현재 Entity 재사용**<br>(Reuse & Extend) | • Phase 11 마이그레이션 `projects` 테이블 그대로 활용<br>• `agreement_doc_url`, `award_amount`, `managing_agency` 매핑 |
| **`DevelopmentProject`**| 기존 `projects` | **현재 Entity 재사용**<br>(Reuse Existing) | • `projects`, `project_milestones`(WBS), `project_workforce`(인력) 기구현 테이블 100% 재사용 |
| **`OutsourcingScope`** | 기존 `project_subcontracts` | **현재 Entity 재사용**<br>(Reuse & Extend) | • Phase 11 `project_subcontracts` 테이블 그대로 활용<br>• `blind_rfp_draft`, `acceptance_criteria` 컬럼 확장 |

---

## 2. 안전한 Additive Migration DDL 설계 (Phase별 점진 적용안)

### Step 1: Enum 및 기본 엔티티 추가 (Phase 1)
```sql
-- 1. v3.0 지원사업 분류 Enum 추가
DO $$ BEGIN
    CREATE TYPE funding_type AS ENUM (
        'GOV_RND',
        'LOCAL_RND',
        'STARTUP_GRANT',
        'PROTOTYPE_GRANT',
        'VALIDATION_GRANT',
        'COMMERCIALIZATION',
        'COMPETITION',
        'CONTEST',
        'PRIZE',
        'EXHIBITION',
        'EXPORT',
        'SALES_SUPPORT',
        'PROCUREMENT',
        'SERVICE_CONTRACT',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 지원 신청 상태 Enum 추가
DO $$ BEGIN
    CREATE TYPE application_decision AS ENUM (
        'APPLY',
        'APPLY_WITH_CONDITIONS',
        'HOLD',
        'PASS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Project Concepts 테이블 신설 (최상위 로봇 아이템)
CREATE TABLE IF NOT EXISTS public.project_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    primary_domain VARCHAR(100) DEFAULT 'ROBOT',
    target_trl INTEGER DEFAULT 4,
    estimated_budget BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'CONCEPT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 기존 opportunities 테이블에 호환 컬럼 안전 추가 (기존 데이터 유지)
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS funding_type VARCHAR(50) DEFAULT 'GOV_RND',
ADD COLUMN IF NOT EXISTS is_early_signal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS signal_stage VARCHAR(50) DEFAULT 'ANNOUNCED',
ADD COLUMN IF NOT EXISTS allowable_costs JSONB DEFAULT '{}';
```

---

## 3. 클라이언트 In-Memory & LocalStorage 동기화 호환성 보장

- **이중 저장소 동기화 패턴**:
  - `ProjectConceptStore`를 신설하되, 기존 `OpportunityStore`의 구조와 동일하게 `globalThis` 싱글톤 및 브라우저 `localStorage` 자동 백업을 적용합니다.
  - 기존 `Opportunity`에 `projectConceptId?: string` 선택적 필드를 추가하여, 특정 로봇 아이템에 연결된 공모와 독립 공모가 공존할 수 있도록 설계합니다.
  - 로컬 메모리 초기화나 강제 리셋 없이, 기존 저장된 공모 목록은 `funding_type: 'PROCUREMENT'` 또는 `'GOV_RND'`의 기본값을 부여받아 100% 보존됩니다.
