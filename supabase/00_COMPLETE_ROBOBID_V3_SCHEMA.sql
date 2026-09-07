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
-- ====================================================================
-- RoboBid AI: Phase 6 Database Migration
-- Notification Center, Telegram Integration & Notification Settings
-- ====================================================================

-- 1. Notification Types & Enums
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'HIGH_FIT_OPPORTUNITY',
        'CRITICAL_DEADLINE',
        'DECISION_REQUEST',
        'MISSING_DOCUMENTS',
        'PROVIDER_FAILURE',
        'SYSTEM_NOTICE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM (
        'IN_APP',
        'TELEGRAM',
        'WEB_PUSH'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_severity AS ENUM (
        'CRITICAL',
        'NORMAL',
        'INFO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM (
        'PENDING',
        'SENT',
        'FAILED',
        'READ'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL indicates organization-wide broadcast
    type notification_type NOT NULL,
    severity notification_severity NOT NULL DEFAULT 'NORMAL',
    channel notification_channel NOT NULL DEFAULT 'IN_APP',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT, -- Mobile deep link target (e.g. /opportunities/:id)
    target_id TEXT, -- Associated opportunity_id, provider_id, etc.
    event_key TEXT NOT NULL, -- Deduplication key: {type}:{target_id}:{channel}:{recipient_id or 'all'}
    dedupe_window_seconds INT NOT NULL DEFAULT 3600, -- 1 hour dedupe window by default
    status notification_status NOT NULL DEFAULT 'PENDING',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and deduplication lookup
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_dedupe ON notifications(event_key, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 3. Notification Settings Table (Org-level & User-level Telegram/Channel Preferences)
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    telegram_enabled BOOLEAN NOT NULL DEFAULT false,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    web_push_enabled BOOLEAN NOT NULL DEFAULT false,
    min_fit_score INT NOT NULL DEFAULT 75, -- Threshold for HIGH_FIT_OPPORTUNITY
    notify_critical_deadline BOOLEAN NOT NULL DEFAULT true,
    notify_decision_request BOOLEAN NOT NULL DEFAULT true,
    notify_missing_docs BOOLEAN NOT NULL DEFAULT true,
    notify_provider_failure BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Notifications
CREATE POLICY notifications_select_policy ON notifications
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
        AND (recipient_id IS NULL OR recipient_id = auth.uid())
    );

CREATE POLICY notifications_insert_policy ON notifications
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY notifications_update_policy ON notifications
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 6. RLS Policies: Notification Settings
CREATE POLICY notif_settings_select_policy ON notification_settings
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY notif_settings_admin_policy ON notification_settings
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('ADMIN', 'BID_MANAGER')
        )
    );
-- ====================================================================
-- RoboBid AI: Phase 7 Database Migration
-- Proposal Workspace, Sections, Evidence Citations & Version History
-- ====================================================================

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE proposal_status AS ENUM (
        'DRAFTING',
        'REVIEWING',
        'APPROVED',
        'SUBMITTED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE section_status AS ENUM (
        'EMPTY',
        'AI_GENERATED',
        'EDITED',
        'REVIEW_NEEDED',
        'CONFIRMED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status proposal_status NOT NULL DEFAULT 'DRAFTING',
    current_version INT NOT NULL DEFAULT 1,
    target_submission_date TIMESTAMPTZ,
    total_budget BIGINT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_org ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- 3. Proposal Sections Table
CREATE TABLE IF NOT EXISTS proposal_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    section_code TEXT NOT NULL, -- e.g. '1.1_NEEDS', '2.1_TECH_DEV', '2.2_ARCHITECTURE'
    title TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    content_markdown TEXT NOT NULL DEFAULT '',
    evidence_citations JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { capabilityId, rfpRequirementId, quote, reason }
    status section_status NOT NULL DEFAULT 'EMPTY',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (proposal_id, section_code)
);

CREATE INDEX IF NOT EXISTS idx_proposal_sections_proposal ON proposal_sections(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sections_order ON proposal_sections(proposal_id, order_index);

-- 4. Proposal Version Snapshots Table
CREATE TABLE IF NOT EXISTS proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    snapshot_data JSONB NOT NULL, -- Full proposal sections, titles and contents snapshot
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (proposal_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal ON proposal_versions(proposal_id, version_number DESC);

-- 5. Row Level Security (RLS)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposals_policy ON proposals
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY proposal_sections_policy ON proposal_sections
    FOR ALL
    USING (
        proposal_id IN (
            SELECT id FROM proposals WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY proposal_versions_policy ON proposal_versions
    FOR ALL
    USING (
        proposal_id IN (
            SELECT id FROM proposals WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
-- ====================================================================
-- RoboBid AI: Phase 8 Database Migration
-- Requirement Traceability Matrix (RTM) & Submission Control
-- ====================================================================

-- 1. Compliance Status Enum
DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM (
        'SATISFIED',
        'PARTIAL',
        'MISSING',
        'NOT_APPLICABLE',
        'REVIEW_REQUIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Compliance Matrix Table (RTM)
CREATE TABLE IF NOT EXISTS compliance_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    requirement_code TEXT NOT NULL,
    category TEXT NOT NULL,
    original_text TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    source_location TEXT,
    mapped_section_code TEXT,
    compliance_status compliance_status NOT NULL DEFAULT 'REVIEW_REQUIRED',
    matched_text_snippet TEXT,
    evidence_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (proposal_id, requirement_code)
);

CREATE INDEX IF NOT EXISTS idx_compliance_proposal ON compliance_matrix(proposal_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_matrix(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_mandatory ON compliance_matrix(proposal_id, is_mandatory);

-- 3. Submission Checklists Table (Human-in-the-Loop Pre-flight Checklist)
CREATE TABLE IF NOT EXISTS submission_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
    all_mandatory_satisfied BOOLEAN NOT NULL DEFAULT false,
    documents_ready BOOLEAN NOT NULL DEFAULT false,
    seal_and_signature_verified BOOLEAN NOT NULL DEFAULT false,
    format_and_size_verified BOOLEAN NOT NULL DEFAULT false,
    submission_url_verified BOOLEAN NOT NULL DEFAULT false,
    submitter_assigned BOOLEAN NOT NULL DEFAULT false,
    final_file_name TEXT,
    final_file_hash TEXT, -- SHA-256
    submission_url TEXT,
    submitter_name TEXT,
    confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    submission_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_proposal ON submission_checklists(proposal_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE compliance_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY compliance_matrix_policy ON compliance_matrix
    FOR ALL
    USING (
        proposal_id IN (
            SELECT id FROM proposals WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY submission_checklists_policy ON submission_checklists
    FOR ALL
    USING (
        proposal_id IN (
            SELECT id FROM proposals WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
-- ====================================================================
-- RoboBid AI: Phase 9 Database Migration
-- Outcome Learning, Analytics & Audit Trail
-- ====================================================================

-- 1. Outcome Status Enum
DO $$ BEGIN
    CREATE TYPE outcome_status AS ENUM (
        'SUBMITTED',
        'AWARDED',
        'REJECTED',
        'WITHDRAWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Outcomes Table
CREATE TABLE IF NOT EXISTS outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    status outcome_status NOT NULL DEFAULT 'SUBMITTED',
    evaluation_score NUMERIC(5, 2),
    evaluation_feedback TEXT,
    award_amount BIGINT,
    competitor_count INTEGER,
    internal_postmortem TEXT,
    success_reasons TEXT[] NOT NULL DEFAULT '{}',
    failure_reasons TEXT[] NOT NULL DEFAULT '{}',
    capability_gaps TEXT[] NOT NULL DEFAULT '{}',
    preparation_days INTEGER,
    submitted_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_outcomes_org ON outcomes(organization_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_opp ON outcomes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_proposal ON outcomes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_status ON outcomes(status);
CREATE INDEX IF NOT EXISTS idx_outcomes_score ON outcomes(evaluation_score);

-- 3. Outcome Audit Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS outcome_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outcome_id UUID NOT NULL REFERENCES outcomes(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE'
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    previous_data JSONB,
    new_data JSONB NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcome_audit_outcome ON outcome_audit_logs(outcome_id);
CREATE INDEX IF NOT EXISTS idx_outcome_audit_created ON outcome_audit_logs(created_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Organization isolation)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view outcomes in same org" ON outcomes;
    CREATE POLICY "Users can view outcomes in same org"
        ON outcomes FOR SELECT
        USING (organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ));

    DROP POLICY IF EXISTS "Users can insert outcomes in same org" ON outcomes;
    CREATE POLICY "Users can insert outcomes in same org"
        ON outcomes FOR INSERT
        WITH CHECK (organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ));

    DROP POLICY IF EXISTS "Users can update outcomes in same org" ON outcomes;
    CREATE POLICY "Users can update outcomes in same org"
        ON outcomes FOR UPDATE
        USING (organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ));

    DROP POLICY IF EXISTS "Users can view audit logs of org outcomes" ON outcome_audit_logs;
    CREATE POLICY "Users can view audit logs of org outcomes"
        ON outcome_audit_logs FOR SELECT
        USING (outcome_id IN (
            SELECT id FROM outcomes WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        ));
END $$;
-- ====================================================================
-- RoboBid AI: Phase 10 Database Migration
-- Web Push Subscriptions & Audit Persistence
-- ====================================================================

CREATE TABLE IF NOT EXISTS web_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_web_push_user ON web_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_web_push_org ON web_push_subscriptions(organization_id);

ALTER TABLE web_push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage their own web push subscriptions" ON web_push_subscriptions;
    CREATE POLICY "Users can manage their own web push subscriptions"
        ON web_push_subscriptions FOR ALL
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
END $$;
-- ====================================================================
-- RoboBid AI: Phase 11 Database Migration
-- Post-Award Project Conversion & Execution Planning
-- ====================================================================

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'PLANNING',
        'ACTIVE',
        'COMPLETED',
        'TERMINATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status project_status NOT NULL DEFAULT 'PLANNING',
    total_budget BIGINT NOT NULL DEFAULT 0,
    government_grant BIGINT NOT NULL DEFAULT 0,
    private_contribution BIGINT NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    managing_agency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_opp ON projects(opportunity_id);

-- 2. Project Milestones Table (WBS)
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    phase_number INTEGER NOT NULL DEFAULT 1,
    target_date DATE,
    deliverables TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_proj ON project_milestones(project_id);

-- 3. Project Workforce Table
CREATE TABLE IF NOT EXISTS project_workforce (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL,
    participation_rate INTEGER NOT NULL DEFAULT 100,
    is_hiring_needed BOOLEAN NOT NULL DEFAULT false,
    job_post_draft TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_workforce_proj ON project_workforce(project_id);

-- 4. Project Subcontracts Table
CREATE TABLE IF NOT EXISTS project_subcontracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    estimated_cost BIGINT NOT NULL DEFAULT 0,
    rfp_draft TEXT,
    vendor_comparison_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_subcontracts_proj ON project_subcontracts(project_id);

-- 5. RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_workforce ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_subcontracts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view org projects" ON projects;
    CREATE POLICY "Users can view org projects" ON projects FOR ALL
        USING (organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ));

    DROP POLICY IF EXISTS "Users can view org project milestones" ON project_milestones;
    CREATE POLICY "Users can view org project milestones" ON project_milestones FOR ALL
        USING (project_id IN (
            SELECT id FROM projects WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        ));

    DROP POLICY IF EXISTS "Users can view org project workforce" ON project_workforce;
    CREATE POLICY "Users can view org project workforce" ON project_workforce FOR ALL
        USING (project_id IN (
            SELECT id FROM projects WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        ));

    DROP POLICY IF EXISTS "Users can view org project subcontracts" ON project_subcontracts;
    CREATE POLICY "Users can view org project subcontracts" ON project_subcontracts FOR ALL
        USING (project_id IN (
            SELECT id FROM projects WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        ));
END $$;
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
