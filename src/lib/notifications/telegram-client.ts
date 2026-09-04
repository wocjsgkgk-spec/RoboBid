import { NotificationSeverity, NotificationType } from '@/types/notification';

export interface TelegramSendOptions {
  botToken?: string;
  chatId: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  type: NotificationType;
  deepLinkUrl?: string;
  metadata?: Record<string, any>;
}

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  error?: string;
  dryRun?: boolean;
}

export class TelegramClient {
  private defaultBotToken?: string;
  private defaultChatId?: string;
  private baseUrl: string;

  constructor(botToken?: string, chatId?: string, baseUrl = 'https://api.telegram.org') {
    this.defaultBotToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
    this.defaultChatId = chatId || process.env.TELEGRAM_CHAT_ID;
    this.baseUrl = baseUrl;
  }

  /**
   * Telegram HTML 형식에 맞게 특수문자를 이스케이프
   */
  public escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * 알림 유형 및 심각도에 따른 헤더 이모지 및 라벨 반환
   */
  private getHeaderBadge(severity: NotificationSeverity, type: NotificationType): string {
    const isCritical = severity === 'CRITICAL';
    const prefix = isCritical ? '🚨 <b>[CRITICAL 긴급알림]</b>' : '📢 <b>[RoboBid AI 알림]</b>';

    let typeLabel = '';
    switch (type) {
      case 'HIGH_FIT_OPPORTUNITY':
        typeLabel = '🎯 <i>고적합 신규 공모 발견</i>';
        break;
      case 'CRITICAL_DEADLINE':
        typeLabel = '⏳ <i>마감 임박 (D-3 이하)</i>';
        break;
      case 'DECISION_REQUEST':
        typeLabel = '⚖️ <i>GO/HOLD 검토 대기</i>';
        break;
      case 'MISSING_DOCUMENTS':
        typeLabel = '📑 <i>필수 제출서류 누락</i>';
        break;
      case 'PROVIDER_FAILURE':
        typeLabel = '⚠️ <i>공공데이터 Provider 장애</i>';
        break;
      default:
        typeLabel = 'ℹ️ <i>시스템 안내</i>';
        break;
    }

    return `${prefix}\n${typeLabel}`;
  }

  /**
   * Telegram 메시지 포맷팅 (HTML 모드)
   */
  public formatHtmlMessage(options: {
    title: string;
    message: string;
    severity: NotificationSeverity;
    type: NotificationType;
    deepLinkUrl?: string;
    metadata?: Record<string, any>;
  }): string {
    const header = this.getHeaderBadge(options.severity, options.type);
    const titleEscaped = this.escapeHtml(options.title);
    const messageEscaped = this.escapeHtml(options.message);

    let formatted = `${header}\n\n<b>${titleEscaped}</b>\n\n${messageEscaped}`;

    // 부가 메타데이터가 있는 경우 추가 정보 렌더링
    if (options.metadata) {
      if (options.metadata.score !== undefined) {
        formatted += `\n\n📊 <b>적합도 점수:</b> ${options.metadata.score}점 (※ 수주확률 아님)`;
      }
      if (options.metadata.daysRemaining !== undefined) {
        formatted += `\n⏰ <b>잔여 일수:</b> D-${options.metadata.daysRemaining}`;
      }
      if (options.metadata.agency) {
        formatted += `\n🏛️ <b>발주 기관:</b> ${this.escapeHtml(String(options.metadata.agency))}`;
      }
    }

    return formatted;
  }

  /**
   * Telegram으로 메시지 발송
   */
  public async sendMessage(options: TelegramSendOptions): Promise<TelegramSendResult> {
    const token = options.botToken || this.defaultBotToken;
    const chatId = options.chatId || this.defaultChatId;

    if (!token || !chatId) {
      // Token이나 Chat ID가 설정되지 않은 경우 (개발/테스트 환경)
      // 시스템 무결성을 위해 DryRun 형태로 기록
      return {
        success: true,
        dryRun: true,
        error: 'Telegram token or chat_id not configured. Message simulated in dry-run mode.',
      };
    }

    const htmlText = this.formatHtmlMessage({
      title: options.title,
      message: options.message,
      severity: options.severity,
      type: options.type,
      deepLinkUrl: options.deepLinkUrl,
      metadata: options.metadata,
    });

    const payload: Record<string, any> = {
      chat_id: chatId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    };

    // 모바일 딥링크를 위한 Inline Keyboard 버튼 첨부
    if (options.deepLinkUrl) {
      payload.reply_markup = {
        inline_keyboard: [
          [
            {
              text: '📱 공모 상세 모바일로 확인하기',
              url: options.deepLinkUrl,
            },
          ],
        ],
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        return {
          success: false,
          error: data.description || `Telegram API responded with status ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.result?.message_id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error while calling Telegram API',
      };
    }
  }
}
