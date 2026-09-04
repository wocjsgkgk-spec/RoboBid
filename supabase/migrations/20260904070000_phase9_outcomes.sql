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
