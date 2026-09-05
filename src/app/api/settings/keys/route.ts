import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ProviderRegistry } from "@/lib/providers";
import { TelegramClient } from "@/lib/notifications/telegram-client";

const ENV_PATH = path.join(process.cwd(), ".env.local");

const MANAGED_KEYS = [
  "DATA_GO_KR_SERVICE_KEY",
  "BIZINFO_API_KEY",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GROQ_API_KEY",
  "UPSTAGE_API_KEY",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_DEFAULT_CHAT_ID",
] as const;

type ManagedKey = (typeof MANAGED_KEYS)[number];

function maskKey(val?: string): string {
  if (!val || val.trim().length === 0) return "";
  const trimmed = val.trim();
  if (trimmed.length <= 6) return "***";
  return `${trimmed.slice(0, 3)}••••••••${trimmed.slice(-3)}`;
}

export async function GET() {
  const keysStatus: Record<string, { configured: boolean; masked: string }> = {};

  for (const key of MANAGED_KEYS) {
    const val = process.env[key];
    keysStatus[key] = {
      configured: Boolean(val && val.trim().length > 0),
      masked: maskKey(val),
    };
  }

  return NextResponse.json({
    success: true,
    keys: keysStatus,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Live Ping/Test Action
    if (body.action === "test") {
      const { providerId, testKey, testChatId } = body;
      return await handleLiveTest(providerId, testKey, testChatId);
    }

    // 2. Save Keys to .env.local and process.env
    const updates: Partial<Record<ManagedKey, string>> = body.keys || {};

    let envFileSaved = false;
    try {
      let envContent = "";
      if (fs.existsSync(ENV_PATH)) {
        envContent = fs.readFileSync(ENV_PATH, "utf-8");
      }

      const lines = envContent.split("\n");
      const updatedKeySet = new Set<string>();

      const newLines = lines.map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("#") || !trimmed.includes("=")) {
          return line;
        }
        const [k] = trimmed.split("=");
        const keyName = k.trim() as ManagedKey;
        if (updates[keyName] !== undefined) {
          updatedKeySet.add(keyName);
          const newVal = updates[keyName]!.trim();
          process.env[keyName] = newVal;
          return `${keyName}=${newVal}`;
        }
        return line;
      });

      for (const [k, v] of Object.entries(updates)) {
        const keyName = k as ManagedKey;
        if (!updatedKeySet.has(keyName) && v !== undefined) {
          const newVal = v.trim();
          process.env[keyName] = newVal;
          newLines.push(`${keyName}=${newVal}`);
        }
      }

      fs.writeFileSync(ENV_PATH, newLines.join("\n"), "utf-8");
      envFileSaved = true;
    } catch {
      // In serverless environments like Vercel, the local filesystem is read-only.
      // process.env is still updated in runtime memory for this instance.
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) {
          process.env[k] = v.trim();
        }
      }
    }

    // Re-read masked status
    const keysStatus: Record<string, { configured: boolean; masked: string }> = {};
    for (const key of MANAGED_KEYS) {
      const val = process.env[key];
      keysStatus[key] = {
        configured: Boolean(val && val.trim().length > 0),
        masked: maskKey(val),
      };
    }

    return NextResponse.json({
      success: true,
      message: envFileSaved
        ? "API 키 설정이 성공적으로 저장 및 활성화되었습니다."
        : "API 키가 현재 세션 메모리에 활성화되었습니다. (영구 보관을 위해 Vercel 환경 변수 등록 권장)",
      keys: keysStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "설정 저장 실패" },
      { status: 500 }
    );
  }
}

async function handleLiveTest(
  providerId: string,
  testKey?: string,
  testChatId?: string
) {
  const startTime = Date.now();

  try {
    switch (providerId) {
      case "koneps": {
        const key = testKey || process.env.DATA_GO_KR_SERVICE_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "공공데이터포털 서비스키가 입력되지 않았습니다.",
          });
        }
        // Test call to KONEPS open data ping
        const koneps = ProviderRegistry.getInstance().get("koneps");
        if (koneps) {
          // Temporarily set process.env for the check
          const orig = process.env.DATA_GO_KR_SERVICE_KEY;
          process.env.DATA_GO_KR_SERVICE_KEY = key;
          const health = await koneps.checkHealth();
          process.env.DATA_GO_KR_SERVICE_KEY = orig;

          return NextResponse.json({
            success: health.status === "CONNECTED",
            status: health.status,
            latencyMs: health.latencyMs || Date.now() - startTime,
            message: health.message,
          });
        }
        break;
      }

      case "bizinfo": {
        const key = testKey || process.env.BIZINFO_API_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "기업마당 인증키가 입력되지 않았습니다.",
          });
        }
        const bizinfo = ProviderRegistry.getInstance().get("bizinfo");
        if (bizinfo) {
          const orig = process.env.BIZINFO_API_KEY;
          process.env.BIZINFO_API_KEY = key;
          const health = await bizinfo.checkHealth();
          process.env.BIZINFO_API_KEY = orig;

          return NextResponse.json({
            success: health.status === "CONNECTED",
            status: health.status,
            latencyMs: health.latencyMs || Date.now() - startTime,
            message: health.message,
          });
        }
        break;
      }

      case "gemini": {
        const key = testKey || process.env.GEMINI_API_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "Google Gemini API 키가 입력되지 않았습니다.",
          });
        }
        // Test call to latest Gemini Flash model endpoint
        const targetModel = process.env.GEMINI_MODEL || "gemini-flash-latest";
        let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`;
        let res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });

        // Fallback to gemini-3.6-flash if specific alias is not found
        if (!res.ok && res.status === 404 && targetModel !== "gemini-3.6-flash") {
          endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
          res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Hello" }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
          });
        }

        const latencyMs = Date.now() - startTime;
        if (res.ok) {
          return NextResponse.json({
            success: true,
            status: "CONNECTED",
            latencyMs,
            message: `Google Gemini AI 모델 연결 성공 (${targetModel})`,
          });
        } else {
          const errData = await res.json().catch(() => null);
          return NextResponse.json({
            success: false,
            status: "FAILED",
            latencyMs,
            message: errData?.error?.message || `HTTP ${res.status} 오류`,
          });
        }
      }

      case "openai": {
        const key = testKey || process.env.OPENAI_API_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "OpenAI API 키가 입력되지 않았습니다.",
          });
        }
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        const latencyMs = Date.now() - startTime;
        if (res.ok) {
          return NextResponse.json({
            success: true,
            status: "CONNECTED",
            latencyMs,
            message: "OpenAI API 엔드포인트 연결 성공",
          });
        } else {
          const errData = await res.json().catch(() => null);
          return NextResponse.json({
            success: false,
            status: "FAILED",
            latencyMs,
            message: errData?.error?.message || `HTTP ${res.status} 오류`,
          });
        }
        break;
      }

      case "anthropic": {
        const key = testKey || process.env.ANTHROPIC_API_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "Anthropic API 키가 입력되지 않았습니다.",
          });
        }
        const res = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
        });
        const latencyMs = Date.now() - startTime;
        if (res.ok) {
          return NextResponse.json({
            success: true,
            status: "CONNECTED",
            latencyMs,
            message: "Anthropic API 엔드포인트 연결 성공 (Claude 3.5)",
          });
        } else {
          const errData = await res.json().catch(() => null);
          return NextResponse.json({
            success: false,
            status: "FAILED",
            latencyMs,
            message: errData?.error?.message || `HTTP ${res.status} 오류`,
          });
        }
      }

      case "groq": {
        const key = testKey || process.env.GROQ_API_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "Groq API 키가 입력되지 않았습니다.",
          });
        }
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        const latencyMs = Date.now() - startTime;
        if (res.ok) {
          return NextResponse.json({
            success: true,
            status: "CONNECTED",
            latencyMs,
            message: "Groq LPU 초고속 추론 엔진 연결 성공",
          });
        } else {
          const errData = await res.json().catch(() => null);
          return NextResponse.json({
            success: false,
            status: "FAILED",
            latencyMs,
            message: errData?.error?.message || `HTTP ${res.status} 오류`,
          });
        }
      }

      case "upstage": {
        const key = testKey || process.env.UPSTAGE_API_KEY;
        if (!key) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "Upstage API 키가 입력되지 않았습니다.",
          });
        }
        const res = await fetch("https://api.upstage.ai/v1/solar/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        const latencyMs = Date.now() - startTime;
        if (res.ok) {
          return NextResponse.json({
            success: true,
            status: "CONNECTED",
            latencyMs,
            message: "Upstage Solar 한국어 특화 모델 연결 성공",
          });
        } else {
          const errData = await res.json().catch(() => null);
          return NextResponse.json({
            success: false,
            status: "FAILED",
            latencyMs,
            message: errData?.error?.message || `HTTP ${res.status} 오류`,
          });
        }
      }

      case "telegram": {
        const token = testKey || process.env.TELEGRAM_BOT_TOKEN;
        const chatId =
          testChatId ||
          process.env.TELEGRAM_DEFAULT_CHAT_ID ||
          process.env.TELEGRAM_CHAT_ID;
        if (!token) {
          return NextResponse.json({
            success: false,
            status: "KEY_MISSING",
            message: "Telegram 봇 토큰이 입력되지 않았습니다.",
          });
        }
        // Test getMe
        const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const latencyMs = Date.now() - startTime;
        const data = await res.json();
        if (data.ok) {
          const botUsername = data.result?.username;
          // If chatId also present, attempt test message
          if (chatId) {
            const client = new TelegramClient(token, chatId);
            await client.sendMessage({
              chatId,
              title: "RoboBid AI 텔레그램 연동 성공",
              message: `RoboBid AI 시스템과 정상적으로 연결되었습니다.\n봇: @${botUsername}`,
              severity: "INFO",
              type: "SYSTEM_NOTICE",
            });
          }
          return NextResponse.json({
            success: true,
            status: "CONNECTED",
            latencyMs,
            message: `텔레그램 봇 연결 성공: @${botUsername}${
              chatId ? " (테스트 메시지 발송 완료)" : " (Chat ID 설정 대기)"
            }`,
          });
        } else {
          return NextResponse.json({
            success: false,
            status: "FAILED",
            latencyMs,
            message: data.description || "토큰 인증 실패",
          });
        }
      }

      default:
        return NextResponse.json(
          { success: false, message: "알 수 없는 Provider입니다." },
          { status: 400 }
        );
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      status: "FAILED",
      latencyMs: Date.now() - startTime,
      message: err.message || "연결 테스트 실패",
    });
  }

  return NextResponse.json({ success: false, message: "처리 불가" }, { status: 400 });
}
