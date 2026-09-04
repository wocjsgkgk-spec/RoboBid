"use client";

import React, { useState } from "react";
import { NotificationPreferenceConfig } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  Bell,
  Send,
  Sliders,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner-toast";

interface NotificationPreferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPreferenceModal({
  open,
  onOpenChange,
}: NotificationPreferenceModalProps) {
  const [config, setConfig] = useState<NotificationPreferenceConfig>(
    p1Store.getNotificationPreference()
  );

  if (!open) return null;

  const handleSave = () => {
    p1Store.updateNotificationPreference(config);
    toast.success("알림 수신 설정이 저장되었습니다.");
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card rounded-xl border shadow-2xl overflow-hidden animate-in fade-in-50 duration-200 my-auto">
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                수주 알림 수신 설정 (Notification Preferences)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              공모 발견, 마감 임박, 인증서 만료, 제안서 결재 알림 수신 기준을 맞춤 설정합니다.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* 1. Channel Toggles */}
          <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-primary" />
              알림 발송 채널
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">인앱 알림 센터 (App Header)</div>
                <div className="text-[11px] text-muted-foreground">화면 상단 벨 아이콘 실시간 알림</div>
              </div>
              <input
                type="checkbox"
                checked={config.inAppNotificationEnabled}
                onChange={(e) =>
                  setConfig({ ...config, inAppNotificationEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-2">
              <div>
                <div className="font-semibold text-foreground">텔레그램 봇 연동 (Telegram Push)</div>
                <div className="text-[11px] text-muted-foreground">등록된 봇 토큰 및 챗 ID로 모바일 전송</div>
              </div>
              <input
                type="checkbox"
                checked={config.telegramNotificationEnabled}
                onChange={(e) =>
                  setConfig({ ...config, telegramNotificationEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
              />
            </div>
          </div>

          {/* 2. Min Fit Score Threshold */}
          <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                신규 공모 추천 알림 임계 점수
              </h4>
              <span className="font-mono font-bold text-primary text-sm">
                {config.minOpportunityFitScore}점 이상
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              자사 역량 매칭 점수가 설정값 이상인 핵심 공모만 선별하여 알림을 수신합니다.
            </p>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={config.minOpportunityFitScore}
              onChange={(e) =>
                setConfig({ ...config, minOpportunityFitScore: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* 3. Deadline & Cert Thresholds */}
          <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              마감 임박 및 자산 만료 통보 시점
            </h4>
            <div className="flex items-center justify-between">
              <span>입찰 접수 마감 리마인더:</span>
              <span className="font-mono font-bold text-foreground">D-7, D-3, D-1일 전</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span>특허/인증서 만료 사전 경고:</span>
              <span className="font-mono font-bold text-foreground">{config.certExpirationNoticeDays}일 전</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 border-t bg-muted/20 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            취소
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs font-bold gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>설정 저장</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
