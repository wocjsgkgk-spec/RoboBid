import { NextRequest, NextResponse } from 'next/server';
import { TelegramClient } from '@/lib/notifications/telegram-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { botToken, chatId, testMessage } = body || {};
    const effectiveChatId = chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
    const effectiveToken = botToken || process.env.TELEGRAM_BOT_TOKEN;

    if (!effectiveChatId) {
      return NextResponse.json(
        { error: 'Telegram Chat ID is required for sending test message' },
        { status: 400 }
      );
    }

    const client = new TelegramClient(effectiveToken, effectiveChatId);
    const result = await client.sendMessage({
      chatId: effectiveChatId,
      botToken: effectiveToken,
      title: 'RoboBid AI 텔레그램 연동 테스트',
      message: testMessage || 'RoboBid AI 알림 봇 연동이 성공적으로 확인되었습니다. 중요 공모 및 마감 알림이 이 채널로 실시간 전송됩니다.',
      severity: 'NORMAL',
      type: 'SYSTEM_NOTICE',
      deepLinkUrl: 'https://robobid.ai/notifications',
      metadata: { testTriggeredAt: new Date().toISOString() },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, dryRun: result.dryRun },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      dryRun: result.dryRun,
      message: result.dryRun
        ? 'Telegram credentials not configured. Message simulated in dry-run mode.'
        : 'Telegram test message sent successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
