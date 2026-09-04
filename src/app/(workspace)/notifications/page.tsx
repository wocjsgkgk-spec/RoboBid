"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Send,
  CheckCheck,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Radio,
  Settings,
  RefreshCw,
  Clock,
  Sparkles,
  CalendarCheck,
  FileWarning,
  Sliders,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { NotificationRecord, NotificationSettings } from "@/types/notification";
import { NotificationPreferenceModal } from "@/components/notifications/notification-preference-modal";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"FEED" | "SETTINGS">("FEED");
  const [filterUnread, setFilterUnread] = useState(false);
  const [prefModalOpen, setPrefModalOpen] = useState(false);

  // Telegram Test State
  const [testBotToken, setTestBotToken] = useState("");
  const [testChatId, setTestChatId] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    dryRun?: boolean;
  } | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?unreadOnly=${filterUnread}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        if (data.settings) {
          setSettings(data.settings);
          setTestBotToken(data.settings.telegramBotToken || "");
          setTestChatId(data.settings.telegramChatId || "");
        }
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [filterUnread]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, status: "READ", readAt: new Date().toISOString() } : n
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, organizationId: "org-robobid-default" }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "READ", readAt: new Date().toISOString() }))
        );
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleSendTelegramTest = async () => {
    if (!testChatId) {
      setTestResult({ error: "Telegram Chat ID를 입력해주세요." });
      return;
    }
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/notifications/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: testBotToken || undefined,
          chatId: testChatId,
          testMessage: "RoboBid AI 알림 테스트가 성공적으로 전달되었습니다. 공모 마감 및 신규 추천이 실시간 전송됩니다.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message,
          dryRun: data.dryRun,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || "전송에 실패했습니다.",
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HIGH_FIT_OPPORTUNITY":
        return <Sparkles className="h-4 w-4 text-primary" />;
      case "CRITICAL_DEADLINE":
        return <Clock className="h-4 w-4 text-destructive" />;
      case "DECISION_REQUEST":
        return <CalendarCheck className="h-4 w-4 text-amber-500" />;
      case "MISSING_DOCUMENTS":
        return <FileWarning className="h-4 w-4 text-orange-500" />;
      case "PROVIDER_FAILURE":
        return <Radio className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              알림 센터 (Notifications)
            </h1>
            <Badge variant="outline" className="text-xs">
              다채널 전파 (In-App / Telegram)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            신규 고적합 공모, 긴급 마감(D-3), GO/HOLD 심의 요청 및 시스템 장애 알림을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "FEED" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("FEED")}
            className="gap-1.5"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>알림 피드</span>
          </Button>
          <Button
            variant={activeTab === "SETTINGS" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("SETTINGS")}
            className="gap-1.5"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Telegram 연동 설정</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrefModalOpen(true)}
            className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>알림 상세 정책 (P1)</span>
          </Button>
        </div>
      </div>

      {activeTab === "FEED" ? (
        <div className="space-y-4">
          {/* Feed Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={!filterUnread ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterUnread(false)}
                className="text-xs h-7 px-2"
              >
                전체
              </Button>
              <Button
                variant={filterUnread ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterUnread(true)}
                className="text-xs h-7 px-2"
              >
                읽지 않음
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs gap-1"
                disabled={notifications.length === 0}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>모두 읽음 표시</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchNotifications}
                disabled={loading}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notif.readAt ? "bg-card/60 opacity-85" : "bg-card border-primary/30 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-md bg-muted/50 shrink-0">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {notif.title}
                          </span>
                          <Badge
                            variant={notif.severity === "CRITICAL" ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {notif.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {notif.channel}
                          </Badge>
                          {!notif.readAt && (
                            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-4">
                          <span>{new Date(notif.createdAt).toLocaleString("ko-KR")}</span>
                          {notif.linkUrl && (
                            <Link
                              href={notif.linkUrl}
                              className="text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>모바일 상세 보기</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.readAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs shrink-0"
                      >
                        읽음
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-6">
              <EmptyState
                icon={Bell}
                title="알림 내역이 없습니다"
                description="고적합 공모가 감지되거나 중요한 마감 일정이 도래하면 이 화면과 텔레그램으로 즉시 알림이 발송됩니다."
              />
            </div>
          )}
        </div>
      ) : (
        /* Settings Tab: Telegram Bot Integration */
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Telegram 봇 알림 연동</CardTitle>
              </div>
              <CardDescription className="text-xs">
                긴급 공모 마감(D-3) 및 고적합 공모 발견 시 담당자 텔레그램으로 모바일 딥링크와 함께 즉시 푸시 알림을 전송합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Telegram Bot Token
                </label>
                <Input
                  type="password"
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                  value={testBotToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestBotToken(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  BotFather에서 생성한 Telegram Bot API 토큰입니다. (미입력 시 환경변수 <code>TELEGRAM_BOT_TOKEN</code> 사용)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Telegram Chat ID
                </label>
                <Input
                  placeholder="@your_channel_or_chat_id 또는 12345678"
                  value={testChatId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestChatId(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  알림을 수신할 개인 Chat ID 또는 그룹/채널의 Chat ID를 입력합니다.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-md text-xs ${
                    testResult.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 border border-destructive/30 text-destructive"
                  }`}
                >
                  <div className="font-semibold">
                    {testResult.success ? "✓ 테스트 전송 성공" : "✕ 테스트 전송 실패"}
                  </div>
                  <div className="mt-0.5">
                    {testResult.message || testResult.error}
                    {testResult.dryRun && (
                      <div className="mt-1 text-[11px] opacity-85">
                        (※ 테스트 환경: Dry-run 시뮬레이션 모드로 무결성 확인 완료)
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Button
                  onClick={handleSendTelegramTest}
                  disabled={testSending}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{testSending ? "전송 중..." : "테스트 알림 전송"}</span>
                </Button>
                <span className="text-xs text-muted-foreground">
                  실시간 Telegram API 전송 및 모바일 Deep Link 버튼 검증
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* P1 Notification Preference Modal */}
      <NotificationPreferenceModal
        open={prefModalOpen}
        onOpenChange={setPrefModalOpen}
      />
    </div>
  );
}
