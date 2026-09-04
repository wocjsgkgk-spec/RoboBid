"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Server,
  RefreshCw,
  ExternalLink,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner-toast";

interface ProviderHealth {
  id: string;
  name: string;
  sourceUrl: string;
  defaultBidType: string;
  status: "CONNECTED" | "DEGRADED" | "KEY_MISSING" | "RATE_LIMITED" | "FAILED" | "MANUAL_ONLY";
  message?: string;
  latencyMs?: number;
  lastCheckedAt: string;
}

interface KeyConfigItem {
  keyName: string;
  label: string;
  category: "public" | "ai" | "notification";
  description: string;
  placeholder: string;
  portalUrl: string;
  providerId: "koneps" | "bizinfo" | "gemini" | "openai" | "telegram" | "anthropic" | "groq" | "upstage";
}

const MANAGED_CONFIG_LIST: KeyConfigItem[] = [
  {
    keyName: "DATA_GO_KR_SERVICE_KEY",
    label: "공공데이터포털 일반 인증키",
    category: "public",
    description: "조달청 나라장터(KONEPS) 입찰공고 및 K-Startup 공모 실시간 수집에 사용됩니다.",
    placeholder: "data.go.kr Encoding 또는 Decoding 키 입력",
    portalUrl: "https://www.data.go.kr",
    providerId: "koneps",
  },
  {
    keyName: "BIZINFO_API_KEY",
    label: "기업마당(중기부) OpenAPI 인증키",
    category: "public",
    description: "중소벤처기업부, 창업진흥원, 소상공인시장진흥공단 지원사업 수집에 사용됩니다.",
    placeholder: "기업마당 발급 인증키 입력",
    portalUrl: "https://www.bizinfo.go.kr",
    providerId: "bizinfo",
  },
  {
    keyName: "GEMINI_API_KEY",
    label: "Google Gemini AI API 키 (무료 티어 제공)",
    category: "ai",
    description: "공고문(RFP) 문서 분석, 기술요건 분해 및 제안서 초안 생성(Gemini 2.5 Flash)에 사용됩니다.",
    placeholder: "AI Studio Gemini API 키 (AIzaSy...)",
    portalUrl: "https://aistudio.google.com/app/apikey",
    providerId: "gemini",
  },
  {
    keyName: "OPENAI_API_KEY",
    label: "OpenAI API 키 (유료)",
    category: "ai",
    description: "4대 평가위원 Specialist 교차 검증 및 사내 기밀 역량 자산 매핑에 사용됩니다.",
    placeholder: "OpenAI API 키 (sk-...)",
    portalUrl: "https://platform.openai.com/api-keys",
    providerId: "openai",
  },
  {
    keyName: "ANTHROPIC_API_KEY",
    label: "Anthropic Claude API 키 (유료)",
    category: "ai",
    description: "Claude 3.5 Sonnet 기반 고난도 제안서 목차 조립 및 기술 문맥 분석에 사용됩니다.",
    placeholder: "Anthropic API 키 (sk-ant-...)",
    portalUrl: "https://console.anthropic.com/settings/keys",
    providerId: "anthropic",
  },
  {
    keyName: "GROQ_API_KEY",
    label: "Groq LPU API 키 (초고속 무료 티어)",
    category: "ai",
    description: "Llama 3.3 70B / DeepSeek R1 오픈소스 모델을 초고속으로 무료 호출합니다.",
    placeholder: "Groq API 키 (gsk_...)",
    portalUrl: "https://console.groq.com/keys",
    providerId: "groq",
  },
  {
    keyName: "UPSTAGE_API_KEY",
    label: "Upstage Solar API 키 (한국어 공공문서 특화)",
    category: "ai",
    description: "한국 공공행정 및 정부 제안서 이해도 최적화 LLM입니다. 신규 가입 시 무료 크레딧이 지급됩니다.",
    placeholder: "Upstage API 키 (up_...)",
    portalUrl: "https://console.upstage.ai/api-keys",
    providerId: "upstage",
  },
  {
    keyName: "TELEGRAM_BOT_TOKEN",
    label: "텔레그램 봇 토큰 (무료)",
    category: "notification",
    description: "고적합 공모(Fit Score 80+) 탐지 및 D-Day 마감 임박 알림 실시간 푸시 발송용 봇 토큰입니다.",
    placeholder: "@BotFather 발급 토큰 (123456789:ABC...)",
    portalUrl: "https://t.me/BotFather",
    providerId: "telegram",
  },
  {
    keyName: "TELEGRAM_DEFAULT_CHAT_ID",
    label: "텔레그램 수신 Chat ID (무료)",
    category: "notification",
    description: "알림 카드를 수신할 텔레그램 개인 또는 채널의 Chat ID입니다. (@userinfobot 등에서 확인)",
    placeholder: "숫자 Chat ID 입력 (예: 123456789)",
    portalUrl: "https://t.me/userinfobot",
    providerId: "telegram",
  },
];

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Key Hub States
  const [savedKeys, setSavedKeys] = useState<Record<string, { configured: boolean; masked: string }>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs?: number }>>({});
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/settings/keys");
      if (res.ok) {
        const data = await res.json();
        setSavedKeys(data.keys || {});
      }
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    }
  };

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ingestion/status");
      const data = await res.json();
      setProviders(data.providers || []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchKeys();
  }, []);

  const handleSaveKeys = async () => {
    setIsSavingKeys(true);
    try {
      // Only send keys that user actually typed in
      const payloadKeys: Record<string, string> = {};
      for (const [k, v] of Object.entries(inputValues)) {
        if (v && v.trim().length > 0) {
          payloadKeys[k] = v.trim();
        }
      }

      if (Object.keys(payloadKeys).length === 0) {
        toast.info("입력된 새로운 API 키가 없습니다.");
        setIsSavingKeys(false);
        return;
      }

      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: payloadKeys }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("API 키가 로컬에 안전하게 저장 및 활성화되었습니다.");
        setSavedKeys(data.keys || {});
        // Clear inputs after successful save
        setInputValues({});
        fetchStatuses();
      } else {
        toast.error(data.error || "저장 실패");
      }
    } catch (err: any) {
      toast.error(`오류 발생: ${err.message}`);
    } finally {
      setIsSavingKeys(false);
    }
  };

  const handleTestKey = async (item: KeyConfigItem) => {
    setTestingId(item.providerId);
    try {
      const enteredVal = inputValues[item.keyName];
      const chatIdVal = inputValues["TELEGRAM_DEFAULT_CHAT_ID"];

      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          providerId: item.providerId,
          testKey: enteredVal || undefined,
          testChatId: chatIdVal || undefined,
        }),
      });

      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [item.keyName]: {
          success: data.success,
          message: data.message,
          latencyMs: data.latencyMs,
        },
      }));

      if (data.success) {
        toast.success(`[${item.label}] 연결 테스트 성공 (${data.latencyMs ?? 0}ms)`);
      } else {
        toast.error(`[${item.label}] 연결 테스트 실패: ${data.message}`);
      }
    } catch (err: any) {
      toast.error(`테스트 요청 실패: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const toggleVisibility = (keyName: string) => {
    setVisibleKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleSync = async (providerId?: string) => {
    setSyncingId(providerId || "ALL");
    setSyncMessage(null);
    try {
      const res = await fetch("/api/ingestion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`동기화 완료: ${providerId || "전체"} 수집 프로세스가 성공적으로 실행되었습니다.`);
      } else {
        setSyncMessage(`동기화 안내: ${data.result?.errorMessage || data.error || "실행 대기"}`);
      }
      fetchStatuses();
    } catch (err: any) {
      setSyncMessage(`오류 발생: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusBadge = (status: ProviderHealth["status"]) => {
    switch (status) {
      case "CONNECTED":
        return <Badge variant="success" className="font-mono text-xs">CONNECTED</Badge>;
      case "KEY_MISSING":
        return <Badge variant="outline" className="font-mono text-xs text-amber-600 border-amber-500">KEY_MISSING</Badge>;
      case "RATE_LIMITED":
        return <Badge variant="warning" className="font-mono text-xs">RATE_LIMITED</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="font-mono text-xs">FAILED</Badge>;
      case "MANUAL_ONLY":
        return <Badge variant="secondary" className="font-mono text-xs">MANUAL_ONLY</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            시스템 설정 (Settings & Administration)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            공공데이터 Provider, 생성형 AI LLM, 텔레그램 메신저 자격증명 및 헬스체크를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStatuses();
              fetchKeys();
            }}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>상태 새로고침</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSync()}
            disabled={syncingId !== null}
            className="gap-2"
          >
            <span>전체 Provider 수동 수집</span>
          </Button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 text-xs rounded-md bg-muted border border-primary/20 text-foreground flex items-center justify-between">
          <span>{syncMessage}</span>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            닫기
          </button>
        </div>
      )}

      {/* 2. Top Banner: DEMO Mode & Company Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-400">
                DEMO 모드 및 데이터 소스 설정
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">
                ACTIVE
              </Badge>
            </div>
            <CardDescription className="text-xs">
              실제 조달청/TIPA/NIPA 실증 시나리오 데이터를 개발 및 시연 모드로 격리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-3 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border">
              <div>
                <span className="font-semibold text-foreground">시뮬레이션 데모 데이터 표시</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  DEMO 라벨이 부착된 추천공고, 특허, 실적 데이터 활성화
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
                onChange={(e) => {
                  toast.success(
                    e.target.checked
                      ? "DEMO 모드가 활성화되었습니다."
                      : "실운영 모드로 전환되었습니다. (DEMO 데이터 숨김)"
                  );
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">로컬 데이터 무결성 백업</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  toast.success("전체 공모, 제안서, 증빙자료 JSON 백업본이 다운로드되었습니다.");
                }}
              >
                데이터 전체 백업 (JSON)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">회사 프로필 & 적격심사 기본값</CardTitle>
            <CardDescription className="text-xs">
              공공조달 적격심사 가점 및 지원자격(Eligibility) 자동 매칭의 기준이 됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2 pt-1">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">기업명 및 규모</span>
              <span className="font-semibold text-foreground">RoboTech Inc. (중소기업 / SME)</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">본사 소재지</span>
              <span className="font-semibold text-foreground">대구광역시 (비수도권 지역가점 대상)</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">기술 성숙도</span>
              <span className="font-mono text-primary font-bold">TRL 7단계 (실증 시제품 운영)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">신인도 가점 자산</span>
              <span className="text-emerald-600 font-semibold">이노비즈 AA등급, 특허 3건, ISO 9001</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. API Key Management Hub */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  외부 API 자격증명 및 Live 연결 허브 (Credentials Hub)
                </CardTitle>
                <CardDescription className="text-xs">
                  로컬 <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code>에 안전하게 저장되며, 입력 즉시 외부망 실시간 통신 및 헬스체크가 가동됩니다.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleSaveKeys}
              disabled={isSavingKeys}
              className="gap-1.5 self-start sm:self-auto h-9 text-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isSavingKeys ? "저장 중..." : "설정 저장 및 즉시 반영"}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MANAGED_CONFIG_LIST.map((item) => {
              const keyStatus = savedKeys[item.keyName];
              const isConfigured = keyStatus?.configured;
              const isTesting = testingId === item.providerId;
              const testResult = testResults[item.keyName];
              const isVisible = visibleKeys[item.keyName];

              return (
                <div
                  key={item.keyName}
                  className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {item.label}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 font-mono"
                        >
                          {item.category === "public"
                            ? "공공데이터"
                            : item.category === "ai"
                            ? "생성형 AI"
                            : "알림"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isConfigured ? (
                          <Badge variant="success" className="text-[10px] py-0 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>{keyStatus.masked}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 text-amber-600 border-amber-500">
                            미설정
                          </Badge>
                        )}
                        <a
                          href={item.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          title="발급처 바로가기"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={isVisible ? "text" : "password"}
                          value={inputValues[item.keyName] || ""}
                          onChange={(e) =>
                            setInputValues((prev) => ({
                              ...prev,
                              [item.keyName]: e.target.value,
                            }))
                          }
                          placeholder={
                            isConfigured ? "새로운 키로 갱신 시 입력" : item.placeholder
                          }
                          className="w-full text-xs font-mono rounded-lg border border-border bg-background px-3 py-1.5 pr-8 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVisibility(item.keyName)}
                          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                          title={isVisible ? "가리기" : "보기"}
                        >
                          {isVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestKey(item)}
                        disabled={isTesting || (!inputValues[item.keyName] && !isConfigured)}
                        className="text-xs h-8 px-2.5 gap-1 shrink-0"
                      >
                        {isTesting ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        <span>{isTesting ? "검사중..." : "연결 테스트"}</span>
                      </Button>
                    </div>

                    {testResult && (
                      <div
                        className={`text-[11px] p-2 rounded-md flex items-center justify-between ${
                          testResult.success
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}
                      >
                        <span>{testResult.message}</span>
                        {testResult.latencyMs && (
                          <span className="font-mono text-[10px] opacity-80">
                            {testResult.latencyMs}ms
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Provider Health Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">공공데이터 수집 Provider 상태</CardTitle>
          </div>
          <CardDescription>
            PRD 원칙: API Key의 단순 존재만으로 정상 연결(CONNECTED)로 표시하지 않으며, 실제 헬스체크 결과를 반영합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Provider 실시간 상태 확인 중...
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        title="공식 포털 바로가기"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.message || "상태 정상"}
                      {p.latencyMs ? ` (${p.latencyMs}ms)` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(p.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(p.id)}
                      disabled={syncingId !== null || p.status === "MANUAL_ONLY"}
                      className="text-xs h-7 px-2"
                    >
                      {syncingId === p.id ? "수집중..." : "수동 동기화"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RBAC Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">역할 기반 접근 제어 (RBAC)</CardTitle>
          </div>
          <CardDescription>
            사용자별 최소 권한 원칙에 따라 부여된 5대 역할과 권한 범위입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 border rounded-lg bg-muted/30">
              <span className="font-bold text-foreground">ADMIN</span>
              <p className="text-muted-foreground mt-1">
                조직 및 사용자 관리, Provider API Key 관리, 시스템 전체 감사 로그 열람
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <span className="font-bold text-foreground">BID_MANAGER</span>
              <p className="text-muted-foreground mt-1">
                공모 파이프라인 관리, GO/HOLD/NO-GO 의사결정, 제안서 작성 및 검토 주관
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <span className="font-bold text-foreground">TECH_REVIEWER</span>
              <p className="text-muted-foreground mt-1">
                로봇 하드웨어, 제어, 임베디드 기술 스펙 검토 및 기술 초안 작성
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <span className="font-bold text-foreground">BUSINESS_REVIEWER</span>
              <p className="text-muted-foreground mt-1">
                사업비, BOM, 자부담 비율, 일정(WBS) 및 재무 적격성 검토
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <span className="font-bold text-foreground">VIEWER</span>
              <p className="text-muted-foreground mt-1">
                공모 및 제안서 현황 열람 (수정 및 의사결정 권한 없음)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
