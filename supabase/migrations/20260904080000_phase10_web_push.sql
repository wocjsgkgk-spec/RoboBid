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
