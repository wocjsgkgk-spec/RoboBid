-- ==============================================================================
-- RoboBid AI — Phase 5 Opportunity Scoring & GO/HOLD/NO-GO Decision Schema
-- Migration: 20260904030000_phase5_scoring_and_decisions.sql
-- ==============================================================================

-- 1. Custom Types
DO $$ BEGIN
    CREATE TYPE decision_type AS ENUM (
        'GO',
        'GO_WITH_CONDITIONS',
        'HOLD',
        'NO_GO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Opportunity Scores Table
CREATE TABLE IF NOT EXISTS public.opportunity_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    technical_fit NUMERIC(5, 2) NOT NULL,
    strategic_fit NUMERIC(5, 2) NOT NULL,
    capability_fit NUMERIC(5, 2) NOT NULL,
    evidence_readiness NUMERIC(5, 2) NOT NULL,
    financial_fit NUMERIC(5, 2) NOT NULL,
    schedule_readiness NUMERIC(5, 2) NOT NULL,
    risk_penalty NUMERIC(5, 2) NOT NULL DEFAULT 0,
    recommendation VARCHAR(50) NOT NULL, -- 'GO', 'GO_WITH_CONDITIONS', 'HOLD', 'NO_GO'
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    rationale TEXT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opportunity_score UNIQUE (opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_total ON public.opportunity_scores(total_score DESC);

-- 3. Decisions Table (GO / HOLD / NO-GO Audit History)
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    decision decision_type NOT NULL,
    reason TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of conditional strings (e.g. "D-10 이전 기술초안 완료")
    score_at_decision INTEGER NOT NULL,
    evidence_snapshot JSONB, -- Frozen snapshot of capabilities and eligibility at decision time
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_opp ON public.decisions(opportunity_id, created_at DESC);

-- 4. Score Weights Configuration Table
CREATE TABLE IF NOT EXISTS public.score_weights (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    technical_weight INTEGER NOT NULL DEFAULT 25,
    strategic_weight INTEGER NOT NULL DEFAULT 20,
    capability_weight INTEGER NOT NULL DEFAULT 20,
    evidence_weight INTEGER NOT NULL DEFAULT 15,
    financial_weight INTEGER NOT NULL DEFAULT 10,
    schedule_weight INTEGER NOT NULL DEFAULT 10,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.opportunity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view opportunity scores of their organization"
    ON public.opportunity_scores FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Managers can insert/update opportunity scores"
    ON public.opportunity_scores FOR ALL
    USING (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER', 'TECH_REVIEWER', 'BUSINESS_REVIEWER')
    );

CREATE POLICY "Users can view decisions of their organization"
    ON public.decisions FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Managers and Admins can record decisions"
    ON public.decisions FOR INSERT
    WITH CHECK (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER')
    );
