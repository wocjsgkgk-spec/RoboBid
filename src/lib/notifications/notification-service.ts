import {
  NotificationChannel,
  NotificationDispatchResult,
  NotificationRecord,
  NotificationSettings,
  NotificationType,
  SendNotificationPayload,
} from '@/types/notification';
import { TelegramClient } from './telegram-client';

export class NotificationService {
  private telegramClient: TelegramClient;
  // 메모리 기반 폴백 저장소 (DB 연동 전 또는 테스트 환경용)
  private memoryNotifications: NotificationRecord[] = [];
  private memorySettings: Map<string, NotificationSettings> = new Map();

  constructor(telegramClient?: TelegramClient) {
    this.telegramClient = telegramClient || new TelegramClient();
  }

  /**
   * 중복 알림 방지를 위한 결정론적 이벤트 키 생성
   */
  public generateEventKey(
    type: NotificationType,
    targetId: string = 'global',
    channel: NotificationChannel,
    recipientId?: string | null
  ): string {
    const recipient = recipientId ? recipientId : 'all';
    return `${type}:${targetId}:${channel}:${recipient}`;
  }

  /**
   * 동일 이벤트 키에 대해 dedupe window 내 발송 이력이 있는지 검사
   */
  public isDuplicate(
    eventKey: string,
    dedupeWindowSeconds: number = 3600,
    referenceTime: Date = new Date()
  ): boolean {
    const existing = this.memoryNotifications
      .filter((n) => n.eventKey === eventKey && n.status === 'SENT' && n.sentAt)
      .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0];

    if (!existing || !existing.sentAt) {
      return false;
    }

    const lastSentTime = new Date(existing.sentAt).getTime();
    const currentTime = referenceTime.getTime();
    const diffSeconds = (currentTime - lastSentTime) / 1000;

    return diffSeconds < dedupeWindowSeconds;
  }

  /**
   * 다채널 알림 발송 및 중복 차단 실행
   */
  public async sendNotification(
    payload: SendNotificationPayload
  ): Promise<NotificationDispatchResult[]> {
    const results: NotificationDispatchResult[] = [];
    const windowSeconds = payload.dedupeWindowSeconds ?? 3600;

    for (const channel of payload.channels) {
      const eventKey = this.generateEventKey(
        payload.type,
        payload.targetId,
        channel,
        payload.recipientId
      );

      // 1. 중복 알림 방지 체크
      if (this.isDuplicate(eventKey, windowSeconds)) {
        results.push({
          channel,
          status: 'SKIPPED_DEDUPE',
        });
        continue;
      }

      // 2. 채널별 실제 발송 처리
      const notificationId = crypto.randomUUID();
      const now = new Date().toISOString();

      if (channel === 'IN_APP') {
        const record: NotificationRecord = {
          id: notificationId,
          organizationId: payload.organizationId,
          recipientId: payload.recipientId,
          type: payload.type,
          severity: payload.severity,
          channel: 'IN_APP',
          title: payload.title,
          message: payload.message,
          linkUrl: payload.linkUrl,
          targetId: payload.targetId,
          eventKey,
          dedupeWindowSeconds: windowSeconds,
          status: 'SENT',
          metadata: payload.metadata || {},
          sentAt: now,
          readAt: null,
          createdAt: now,
        };

        this.memoryNotifications.unshift(record);
        results.push({
          channel: 'IN_APP',
          status: 'SENT',
          notificationId,
        });
      } else if (channel === 'TELEGRAM') {
        const settings = this.getSettings(payload.organizationId);
        const botToken = settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || undefined;
        const chatId = settings?.telegramChatId || process.env.TELEGRAM_DEFAULT_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';
        const sendRes = await this.telegramClient.sendMessage({
          botToken,
          chatId,
          title: payload.title,
          message: payload.message,
          severity: payload.severity,
          type: payload.type,
          deepLinkUrl: payload.linkUrl,
          metadata: payload.metadata,
        });

        const record: NotificationRecord = {
          id: notificationId,
          organizationId: payload.organizationId,
          recipientId: payload.recipientId,
          type: payload.type,
          severity: payload.severity,
          channel: 'TELEGRAM',
          title: payload.title,
          message: payload.message,
          linkUrl: payload.linkUrl,
          targetId: payload.targetId,
          eventKey,
          dedupeWindowSeconds: windowSeconds,
          status: sendRes.success ? 'SENT' : 'FAILED',
          metadata: { ...(payload.metadata || {}), telegramResult: sendRes },
          sentAt: sendRes.success ? now : null,
          readAt: null,
          createdAt: now,
        };

        this.memoryNotifications.unshift(record);
        results.push({
          channel: 'TELEGRAM',
          status: sendRes.success ? 'SENT' : 'FAILED',
          notificationId,
          error: sendRes.error,
        });
      } else if (channel === 'WEB_PUSH') {
        // Web Push 채널 스텁 (MVP 범위 지원)
        const record: NotificationRecord = {
          id: notificationId,
          organizationId: payload.organizationId,
          recipientId: payload.recipientId,
          type: payload.type,
          severity: payload.severity,
          channel: 'WEB_PUSH',
          title: payload.title,
          message: payload.message,
          linkUrl: payload.linkUrl,
          targetId: payload.targetId,
          eventKey,
          dedupeWindowSeconds: windowSeconds,
          status: 'SENT',
          metadata: payload.metadata || {},
          sentAt: now,
          readAt: null,
          createdAt: now,
        };

        this.memoryNotifications.unshift(record);
        results.push({
          channel: 'WEB_PUSH',
          status: 'SENT',
          notificationId,
        });
      }
    }

    return results;
  }

  /**
   * 알림 목록 조회 (조직 및 수신자 필터링)
   */
  public getNotifications(
    organizationId: string,
    options: {
      recipientId?: string;
      unreadOnly?: boolean;
      channel?: NotificationChannel;
      limit?: number;
    } = {}
  ): NotificationRecord[] {
    let list = this.memoryNotifications.filter((n) => n.organizationId === organizationId);

    if (options.recipientId) {
      list = list.filter((n) => !n.recipientId || n.recipientId === options.recipientId);
    }
    if (options.channel) {
      list = list.filter((n) => n.channel === options.channel);
    }
    if (options.unreadOnly) {
      list = list.filter((n) => !n.readAt);
    }

    const limit = options.limit || 50;
    return list.slice(0, limit);
  }

  /**
   * 단일 알림 읽음 처리
   */
  public markAsRead(notificationId: string): boolean {
    const item = this.memoryNotifications.find((n) => n.id === notificationId);
    if (item) {
      item.readAt = new Date().toISOString();
      item.status = 'READ';
      return true;
    }
    return false;
  }

  /**
   * 전체 알림 읽음 처리
   */
  public markAllAsRead(organizationId: string, recipientId?: string): number {
    let count = 0;
    const now = new Date().toISOString();
    for (const item of this.memoryNotifications) {
      if (item.organizationId === organizationId) {
        if (!recipientId || !item.recipientId || item.recipientId === recipientId) {
          if (!item.readAt) {
            item.readAt = now;
            item.status = 'READ';
            count++;
          }
        }
      }
    }
    return count;
  }

  /**
   * 조직별 알림 설정 조회 및 갱신
   */
  public getSettings(organizationId: string): NotificationSettings {
    const found = this.memorySettings.get(organizationId);
    if (found) return found;

    const defaultSettings: NotificationSettings = {
      id: crypto.randomUUID(),
      organizationId,
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || null,
      telegramChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID || process.env.TELEGRAM_CHAT_ID || null,
      telegramEnabled: Boolean(
        process.env.TELEGRAM_BOT_TOKEN &&
          (process.env.TELEGRAM_DEFAULT_CHAT_ID || process.env.TELEGRAM_CHAT_ID)
      ),
      inAppEnabled: true,
      webPushEnabled: false,
      minFitScore: 75,
      notifyCriticalDeadline: true,
      notifyDecisionRequest: true,
      notifyMissingDocs: true,
      notifyProviderFailure: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memorySettings.set(organizationId, defaultSettings);
    return defaultSettings;
  }

  public updateSettings(
    organizationId: string,
    updates: Partial<NotificationSettings>
  ): NotificationSettings {
    const current = this.getSettings(organizationId);
    const updated: NotificationSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.memorySettings.set(organizationId, updated);
    return updated;
  }

  /**
   * 테스트 및 초기화용 메서드
   */
  public clearMemory(): void {
    this.memoryNotifications = [];
    this.memorySettings.clear();
  }
}

export const notificationService = new NotificationService();
