-- ==============================================================================
-- RoboBid AI: Phase 1 Migration (v3.0 Domain Foundation)
-- Migration: 20260907000000_phase1_v3_domain_foundation.sql
-- ==============================================================================
-- ※ 절대 원칙: Additive Migration Only (기존 테이블/데이터 보존)

-- 1. v3.0 지원사업 유형 Enum
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

-- 2. v3.0 지원 신청 의사결정 Enum
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

-- 3. Project Concepts 테이블 (로봇 아이디어/프로젝트 최상위 엔티티)
CREATE TABLE IF NOT EXISTS public.project_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    problem_statement TEXT,
    target_user TEXT,
    product_concept TEXT,
    technical_concept TEXT,
    target_trl INTEGER NOT NULL DEFAULT 4,
    required_technology TEXT[] DEFAULT '{}',
    estimated_budget BIGINT NOT NULL DEFAULT 0,
    required_funding BIGINT NOT NULL DEFAULT 0,
    market_analysis TEXT,
    sales_model TEXT,
    owner VARCHAR(100) NOT NULL DEFAULT '사업개발 PM',
    status VARCHAR(50) NOT NULL DEFAULT 'IDEA',
    current_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_concepts_org ON public.project_concepts(organization_id);

-- 4. 기존 opportunities 테이블에 v3.0 호환 컬럼 Additive 추가
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS funding_type VARCHAR(50) DEFAULT 'GOV_RND',
ADD COLUMN IF NOT EXISTS project_concept_id UUID REFERENCES public.project_concepts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_early_signal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS signal_stage VARCHAR(50) DEFAULT 'ANNOUNCED',
ADD COLUMN IF NOT EXISTS allowable_costs JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_opportunities_concept ON public.opportunities(project_concept_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_funding_type ON public.opportunities(funding_type);

-- 5. RLS 정책 활성화
ALTER TABLE public.project_concepts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view org project concepts" ON public.project_concepts;
    CREATE POLICY "Users can view org project concepts" ON public.project_concepts FOR ALL
        USING (organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ));
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
