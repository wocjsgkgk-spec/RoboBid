-- ==============================================================================
-- RoboBid AI — Phase 1 Core Database Schema
-- Migration: 20260904000000_phase1_core_schema.sql
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'ADMIN',
        'BID_MANAGER',
        'TECH_REVIEWER',
        'BUSINESS_REVIEWER',
        'VIEWER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE provider_status AS ENUM (
        'CONNECTED',
        'DEGRADED',
        'KEY_MISSING',
        'RATE_LIMITED',
        'FAILED',
        'MANUAL_ONLY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_status AS ENUM (
        'DISCOVERED',
        'TRIAGED',
        'REVIEW',
        'GO',
        'HOLD',
        'NO_GO',
        'PROPOSAL',
        'SUBMITTED',
        'AWARDED',
        'REJECTED',
        'WITHDRAWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bid_type AS ENUM (
        'R_AND_D',
        'DEMONSTRATION',
        'SUBSIDY_SUPPORT',
        'PROCUREMENT',
        'SERVICE',
        'LOCAL_GOV',
        'NATIONAL_PROJECT',
        'PPP',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Core Tables

-- 3.1 Organizations (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'VIEWER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Providers (Public Data Ingestion Sources)
CREATE TABLE IF NOT EXISTS public.providers (
    id VARCHAR(50) PRIMARY KEY, -- 'koneps', 'k_startup', 'bizinfo', etc.
    name VARCHAR(100) NOT NULL,
    source_url TEXT NOT NULL,
    status provider_status NOT NULL DEFAULT 'KEY_MISSING',
    last_synced_at TIMESTAMPTZ,
    last_error_message TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Provider Runs (Audit History for Syncs)
CREATE TABLE IF NOT EXISTS public.provider_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id VARCHAR(50) NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    status provider_status NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    records_fetched INTEGER NOT NULL DEFAULT 0,
    records_upserted INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    error_detail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Opportunities (Unified Bid Announcements)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL REFERENCES public.providers(id),
    source_id VARCHAR(255) NOT NULL, -- Provider native notice ID
    title VARCHAR(500) NOT NULL,
    announcing_agency VARCHAR(255) NOT NULL,
    demanding_agency VARCHAR(255),
    bid_type bid_type NOT NULL DEFAULT 'OTHER',
    primary_domain VARCHAR(100) NOT NULL DEFAULT 'ROBOT',
    allocated_budget NUMERIC(15, 2),
    estimated_price NUMERIC(15, 2),
    posted_at TIMESTAMPTZ NOT NULL,
    submission_deadline TIMESTAMPTZ NOT NULL,
    canonical_url TEXT,
    status opportunity_status NOT NULL DEFAULT 'DISCOVERED',
    content_hash VARCHAR(64) NOT NULL,
    current_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opportunity_provider_source UNIQUE (provider_id, source_id)
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_org_status ON public.opportunities(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_title_trgm ON public.opportunities USING gin (title gin_trgm_ops);

-- 3.6 Opportunity Versions (Change Tracking for Amendments)
CREATE TABLE IF NOT EXISTS public.opportunity_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    raw_payload JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opportunity_version UNIQUE (opportunity_id, version_number)
);

-- 3.7 Attachments (RFP, Guidelines, Application Forms)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    original_file_name VARCHAR(500) NOT NULL,
    file_extension VARCHAR(20) NOT NULL, -- pdf, hwp, hwpx, docx, etc.
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    storage_path TEXT, -- Path in Supabase Private Storage
    download_url TEXT, -- Source download link
    content_hash VARCHAR(64),
    is_parsed BOOLEAN NOT NULL DEFAULT FALSE,
    parsed_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Audit Events (System & User Activity Log)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_org_created ON public.audit_events(organization_id, created_at DESC);

-- 4. Row Level Security (RLS) Policies

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_current_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 4.1 Profiles Policies
CREATE POLICY "Users can view members in the same organization"
    ON public.profiles FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- 4.2 Organizations Policies
CREATE POLICY "Users can view their own organization"
    ON public.organizations FOR SELECT
    USING (id = public.get_current_org_id());

-- 4.3 Providers Policies (Readable by authenticated users)
CREATE POLICY "Authenticated users can view providers"
    ON public.providers FOR SELECT
    TO authenticated
    USING (true);

-- 4.4 Opportunities Policies (Tenant Isolation)
CREATE POLICY "Users can view opportunities of their organization"
    ON public.opportunities FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Bid managers and admins can insert opportunities"
    ON public.opportunities FOR INSERT
    WITH CHECK (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER')
    );

CREATE POLICY "Bid managers and reviewers can update opportunities"
    ON public.opportunities FOR UPDATE
    USING (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER', 'TECH_REVIEWER', 'BUSINESS_REVIEWER')
    );

-- 4.5 Attachments Policies
CREATE POLICY "Users can view attachments linked to accessible opportunities"
    ON public.attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.opportunities o
            WHERE o.id = attachments.opportunity_id
            AND o.organization_id = public.get_current_org_id()
        )
    );

-- 4.6 Audit Events Policies
CREATE POLICY "Users can view audit events of their organization"
    ON public.audit_events FOR SELECT
    USING (
        organization_id = public.get_current_org_id()
        AND public.get_current_user_role() IN ('ADMIN', 'BID_MANAGER')
    );

-- 5. Storage Buckets (Private Buckets Definition)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('rfp-original', 'rfp-original', false, 104857600, NULL), -- 100MB limit, private
    ('proposal-drafts', 'proposal-drafts', false, 104857600, NULL),
    ('company-evidence', 'company-evidence', false, 104857600, NULL),
    ('exports', 'exports', false, 52428800, NULL),
    ('temp-ingestion', 'temp-ingestion', false, 104857600, NULL)
ON CONFLICT (id) DO NOTHING;
