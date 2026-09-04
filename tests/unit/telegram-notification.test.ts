import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelegramClient } from '@/lib/notifications/telegram-client';

describe('Phase 6: Telegram Notification & Mobile Deep Link', () => {
  let client: TelegramClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new TelegramClient('mock-bot-token-12345', 'mock-chat-id-999', 'https://mock-telegram.org');
  });

  it('HTML 특수문자를 올바르게 이스케이프해야 한다', () => {
    const raw = '로봇 공모 <사업> & "첨부" > 1건';
    const escaped = client.escapeHtml(raw);
    expect(escaped).toBe('로봇 공모 &lt;사업&gt; &amp; "첨부" &gt; 1건');
  });

  it('CRITICAL 심각도와 NORMAL 심각도의 헤더를 명확히 구분해야 한다', () => {
    const criticalMsg = client.formatHtmlMessage({
      title: '긴급 마감',
      message: 'D-1일 전입니다.',
      severity: 'CRITICAL',
      type: 'CRITICAL_DEADLINE',
    });

    const normalMsg = client.formatHtmlMessage({
      title: '신규 추천',
      message: '새로운 공고가 있습니다.',
      severity: 'NORMAL',
      type: 'HIGH_FIT_OPPORTUNITY',
    });

    expect(criticalMsg).toContain('🚨 <b>[CRITICAL 긴급알림]</b>');
    expect(criticalMsg).toContain('⏳ <i>마감 임박 (D-3 이하)</i>');

    expect(normalMsg).toContain('📢 <b>[RoboBid AI 알림]</b>');
    expect(normalMsg).toContain('🎯 <i>고적합 신규 공모 발견</i>');
  });

  it('메타데이터에 적합도 점수와 잔여 일수가 안전하게 렌더링되어야 한다', () => {
    const formatted = client.formatHtmlMessage({
      title: '로봇 자율주행 사업',
      message: '적합도 평가가 완료되었습니다.',
      severity: 'NORMAL',
      type: 'HIGH_FIT_OPPORTUNITY',
      metadata: {
        score: 88,
        daysRemaining: 15,
        agency: '한국로봇산업진흥원',
      },
    });

    expect(formatted).toContain('88점');
    expect(formatted).toContain('수주확률 아님');
    expect(formatted).toContain('D-15');
    expect(formatted).toContain('한국로봇산업진흥원');
  });

  it('모바일 Deep Link URL이 제공되면 fetch 호출 시 inline_keyboard가 포함되어야 한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 777 } }),
    });
    global.fetch = mockFetch;

    const result = await client.sendMessage({
      chatId: 'mock-chat-id-999',
      botToken: 'mock-bot-token-12345',
      title: '공모 상세 확인',
      message: '세부 내역을 확인하세요.',
      severity: 'NORMAL',
      type: 'HIGH_FIT_OPPORTUNITY',
      deepLinkUrl: 'https://robobid.ai/opportunities/opp-1234',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe(777);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    expect(body.chat_id).toBe('mock-chat-id-999');
    expect(body.reply_markup).toBeDefined();
    expect(body.reply_markup.inline_keyboard[0][0].url).toBe('https://robobid.ai/opportunities/opp-1234');
    expect(body.reply_markup.inline_keyboard[0][0].text).toContain('모바일로 확인하기');
  });

  it('토큰이 설정되지 않은 경우 DryRun 모드로 안전하게 폴백되어야 한다', async () => {
    const emptyClient = new TelegramClient('', '');
    const result = await emptyClient.sendMessage({
      chatId: '',
      title: '무인 알림',
      message: '토큰 없음',
      severity: 'NORMAL',
      type: 'SYSTEM_NOTICE',
    });

    expect(result.success).toBe(true);
    expect(result.dryRun).toBe(true);
  });
});
