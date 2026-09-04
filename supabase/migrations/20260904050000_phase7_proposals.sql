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
