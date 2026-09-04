-- ==============================================================================
-- RoboBid AI — Phase 4 Company Capability Vault & Eligibility Gate Schema
-- Migration: 20260904020000_phase4_vault_and_eligibility.sql
-- ==============================================================================

-- 1. Custom Types
DO $$ BEGIN
    CREATE TYPE capability_type AS ENUM (
        'COMPANY_PROFILE',
        'TECHNOLOGY',
        'PRODUCT',
        'PATENT',
        'CERTIFICATION',
        'PROJECT_HISTORY',
        'EMPLOYEE_SKILL',
        'EQUIPMENT',
        'FINANCIAL_PROFILE',
        'PARTNER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'VERIFIED',
        'UNVERIFIED',
        'EXPIRED',
        'PENDING_REVIEW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidentiality_level AS ENUM (
        'INTERNAL',
        'CONFIDENTIAL',
        'RESTRICTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE eligibility_status AS ENUM (
        'PASS',
        'FAIL',
        'REVIEW_REQUIRED',
        'UNKNOWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Capabilities Table (Company Capability Vault)
CREATE TABLE IF NOT EXISTS public.capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type capability_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured properties (e.g. established_date, reg_number, trl_level)
    valid_from DATE,
    valid_until DATE,
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    confidentiality confidentiality_level NOT NULL DEFAULT 'CONFIDENTIAL',
    evidence_storage_path TEXT, -- Link to file in 'company-evidence' Private Storage
    evidence_file_name VARCHAR(255),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capabilities_org_type ON public.capabilities(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_capabilities_valid_until ON public.capabilities(valid_until);

-- 3. Eligibility Checks Table (RFP vs Company Gate Results)
CREATE TABLE IF NOT EXISTS public.eligibility_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    rule_code VARCHAR(100) NOT NULL, -- e.g., "RULE-AGE", "RULE-REGION", "RULE-CERT"
    rule_name VARCHAR(200) NOT NULL,
    status eligibility_status NOT NULL DEFAULT 'UNKNOWN',
    rfp_requirement TEXT NOT NULL,
    rfp_citation_section VARCHAR(200),
    rfp_citation_quote TEXT,
    matched_capability_id UUID REFERENCES public.capabilities(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opp_eligibility_rule UNIQUE (opportunity_id, rule_code)
);

CREATE INDEX IF NOT EXISTS idx_eligibility_opp ON public.eligibility_checks(opportunity_id);

-- 4. Row Level Security (RLS) Policies

ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_checks ENABLE ROW LEVEL SECURITY;

-- 4.1 Capabilities Policies: Tenant Isolation & Confidential Separation
CREATE POLICY "Users can view capabilities of their organization"
    ON public.capabilities FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Admins and Bid Managers can insert/update capabilities"
    ON public.capabilities FOR ALL
    USING (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER', 'TECH_REVIEWER', 'BUSINESS_REVIEWER')
    );

-- 4.2 Eligibility Checks Policies: Tenant Isolation
CREATE POLICY "Users can view eligibility checks of their organization"
    ON public.eligibility_checks FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Managers and Reviewers can insert/update eligibility checks"
    ON public.eligibility_checks FOR ALL
    USING (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER', 'TECH_REVIEWER', 'BUSINESS_REVIEWER')
    );
