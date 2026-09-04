import { z } from 'zod';

export type NotificationType =
  | 'HIGH_FIT_OPPORTUNITY'
  | 'CRITICAL_DEADLINE'
  | 'DECISION_REQUEST'
  | 'MISSING_DOCUMENTS'
  | 'PROVIDER_FAILURE'
  | 'SYSTEM_NOTICE';

export type NotificationChannel = 'IN_APP' | 'TELEGRAM' | 'WEB_PUSH';

export type NotificationSeverity = 'CRITICAL' | 'NORMAL' | 'INFO';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';

export interface NotificationRecord {
  id: string;
  organizationId: string;
  recipientId?: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  channel: NotificationChannel;
  title: string;
  message: string;
  linkUrl?: string | null;
  targetId?: string | null;
  eventKey: string;
  dedupeWindowSeconds: number;
  status: NotificationStatus;
  metadata?: Record<string, any>;
  sentAt?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationSettings {
  id: string;
  organizationId: string;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  telegramEnabled: boolean;
  inAppEnabled: boolean;
  webPushEnabled: boolean;
  minFitScore: number;
  notifyCriticalDeadline: boolean;
  notifyDecisionRequest: boolean;
  notifyMissingDocs: boolean;
  notifyProviderFailure: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationPayload {
  organizationId: string;
  recipientId?: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  title: string;
  message: string;
  linkUrl?: string;
  targetId?: string;
  dedupeWindowSeconds?: number;
  metadata?: Record<string, any>;
}

export interface NotificationDispatchResult {
  channel: NotificationChannel;
  status: 'SENT' | 'SKIPPED_DEDUPE' | 'FAILED';
  notificationId?: string;
  error?: string;
}

export const notificationSettingsSchema = z.object({
  telegramBotToken: z.string().optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
  telegramEnabled: z.boolean().default(false),
  inAppEnabled: z.boolean().default(true),
  webPushEnabled: z.boolean().default(false),
  minFitScore: z.number().min(0).max(100).default(75),
  notifyCriticalDeadline: z.boolean().default(true),
  notifyDecisionRequest: z.boolean().default(true),
  notifyMissingDocs: z.boolean().default(true),
  notifyProviderFailure: z.boolean().default(true),
});
