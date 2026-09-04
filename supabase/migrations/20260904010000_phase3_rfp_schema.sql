-- ==============================================================================
-- RoboBid AI — Phase 3 RFP Document Ingestion & Requirements Schema
-- Migration: 20260904010000_phase3_rfp_schema.sql
-- ==============================================================================

-- 1. Custom Types
DO $$ BEGIN
    CREATE TYPE parse_status AS ENUM (
        'PENDING',
        'PARSING',
        'PARSED',
        'FAILED',
        'UNSUPPORTED',
        'REVIEW_REQUIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE requirement_category AS ENUM (
        'TECHNICAL',
        'ELIGIBILITY',
        'FINANCIAL',
        'SUBMISSION',
        'SCHEDULE',
        'EVALUATION',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance attachments table with parse status & statistics
ALTER TABLE public.attachments 
    ADD COLUMN IF NOT EXISTS parse_status parse_status NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS section_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS table_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS parse_error_message TEXT,
    ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMPTZ;

-- 3. Requirements Table (Extracted RFP Requirement Items)
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    attachment_id UUID REFERENCES public.attachments(id) ON DELETE SET NULL,
    req_code VARCHAR(50) NOT NULL, -- e.g., "REQ-TEC-001", "REQ-ELG-002"
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    category requirement_category NOT NULL DEFAULT 'OTHER',
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    weight INTEGER DEFAULT 0, -- Score weight if defined in RFP
    citation_page INTEGER,
    citation_section VARCHAR(200),
    citation_quote TEXT, -- Exact text excerpt from the RFP document
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opportunity_req_code UNIQUE (opportunity_id, req_code)
);

CREATE INDEX IF NOT EXISTS idx_requirements_opp_category ON public.requirements(opportunity_id, category);

-- 4. Row Level Security (RLS) for requirements
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requirements of their organization"
    ON public.requirements FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Bid managers can insert/update requirements"
    ON public.requirements FOR ALL
    USING (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER', 'TECH_REVIEWER')
    );
