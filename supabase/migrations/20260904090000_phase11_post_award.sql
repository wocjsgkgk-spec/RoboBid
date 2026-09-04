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
