import React from "react";
import { Bell, Send } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            알림 센터 (Notifications)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            신규 고적합 공모 발견, 긴급 마감 임박(D-3), GO/NO-GO 의사결정 요청 알림 내역입니다.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <EmptyState
          icon={Bell}
          title="새로운 알림이 없습니다"
          description="중요 공모 발견 및 마감 알림은 인앱 화면뿐만 아니라 Telegram 봇을 통해서도 실시간 수신할 수 있습니다."
        />
      </div>
    </div>
  );
}
