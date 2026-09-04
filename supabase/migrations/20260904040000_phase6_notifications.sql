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
