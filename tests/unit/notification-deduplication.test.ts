import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationService } from '@/lib/notifications/notification-service';

describe('Phase 6: Notification Deduplication Gate', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    service.clearMemory();
  });

  it('이벤트 키를 일관된 형식으로 생성해야 한다', () => {
    const key1 = service.generateEventKey('CRITICAL_DEADLINE', 'opp-001', 'TELEGRAM', 'user-123');
    expect(key1).toBe('CRITICAL_DEADLINE:opp-001:TELEGRAM:user-123');

    const key2 = service.generateEventKey('HIGH_FIT_OPPORTUNITY', 'opp-002', 'IN_APP');
    expect(key2).toBe('HIGH_FIT_OPPORTUNITY:opp-002:IN_APP:all');
  });

  it('동일 이벤트가 dedupe window 내 재발송되면 SKIPPED_DEDUPE 처리되어야 한다', async () => {
    const payload = {
      organizationId: 'org-test',
      type: 'CRITICAL_DEADLINE' as const,
      severity: 'CRITICAL' as const,
      channels: ['IN_APP'] as const,
      title: '마감 임박 공모',
      message: '3일 남았습니다.',
      targetId: 'opp-999',
      dedupeWindowSeconds: 3600, // 1 hour window
    };

    // 1차 발송 -> SENT
    const result1 = await service.sendNotification({
      ...payload,
      channels: ['IN_APP'],
    });
    expect(result1[0].status).toBe('SENT');

    // 즉시 동일 이벤트 2차 발송 -> SKIPPED_DEDUPE
    const result2 = await service.sendNotification({
      ...payload,
      channels: ['IN_APP'],
    });
    expect(result2[0].status).toBe('SKIPPED_DEDUPE');

    // 발송된 알림 목록에는 1건만 존재해야 함
    const list = service.getNotifications('org-test');
    expect(list.length).toBe(1);
  });

  it('채널이 다른 경우(IN_APP vs TELEGRAM) 각각 독립적으로 발송되어야 한다', async () => {
    const payload: {
      organizationId: string;
      type: 'HIGH_FIT_OPPORTUNITY';
      severity: 'NORMAL';
      channels: ('IN_APP' | 'TELEGRAM')[];
      title: string;
      message: string;
      targetId: string;
      dedupeWindowSeconds: number;
    } = {
      organizationId: 'org-test',
      type: 'HIGH_FIT_OPPORTUNITY',
      severity: 'NORMAL',
      channels: ['IN_APP', 'TELEGRAM'],
      title: '고적합 신규 공모',
      message: '새로운 공모가 등록되었습니다.',
      targetId: 'opp-888',
      dedupeWindowSeconds: 3600,
    };

    const results = await service.sendNotification(payload);
    expect(results.length).toBe(2);
    expect(results.find((r) => r.channel === 'IN_APP')?.status).toBe('SENT');
    expect(results.find((r) => r.channel === 'TELEGRAM')?.status).toBe('SENT');
  });

  it('dedupe window(만료 시간)가 지난 후에는 재발송이 허용되어야 한다', async () => {
    const eventKey = 'SYSTEM_NOTICE:global:IN_APP:all';
    const windowSeconds = 60; // 60초 윈도우

    // 100초 전 발송된 알림 가정
    const pastTime = new Date(Date.now() - 100 * 1000);
    const isDupExpired = service.isDuplicate(eventKey, windowSeconds, pastTime);
    expect(isDupExpired).toBe(false);

    // 10초 전 발송된 알림 가정
    await service.sendNotification({
      organizationId: 'org-test',
      type: 'SYSTEM_NOTICE',
      severity: 'INFO',
      channels: ['IN_APP'],
      title: '공지사항',
      message: '시스템 점검 예정',
      targetId: 'global',
      dedupeWindowSeconds: windowSeconds,
    });

    const isDupActive = service.isDuplicate(eventKey, windowSeconds, new Date());
    expect(isDupActive).toBe(true);
  });
});
