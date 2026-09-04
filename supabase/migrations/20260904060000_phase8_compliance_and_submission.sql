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
