import React from "react";
import { Settings, Shield, Server, Bell, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const PROVIDERS = [
    {
      id: "koneps",
      name: "조달청 나라장터 (KONEPS)",
      type: "공공데이터포털 공식 Open API",
      status: "KEY_MISSING",
      statusLabel: "키 등록 필요",
      variant: "outline" as const,
    },
    {
      id: "k_startup",
      name: "K-Startup (창업진흥원)",
      type: "공공데이터포털 공식 Open API",
      status: "KEY_MISSING",
      statusLabel: "키 등록 필요",
      variant: "outline" as const,
    },
    {
      id: "bizinfo",
      name: "기업마당 (중소벤처기업부)",
      type: "기업마당 / 공공데이터포털 Open API",
      status: "KEY_MISSING",
      statusLabel: "키 등록 필요",
      variant: "outline" as const,
    },
    {
      id: "iris",
      name: "범부처통합연구지원시스템 (IRIS)",
      type: "공개 웹 공고 정책준수 / 수동 등록",
      status: "MANUAL_ONLY",
      statusLabel: "수동 등록 모드",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          시스템 설정 (Settings & Administration)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          공공데이터 Provider 연결 상태, RBAC 권한 정책, 알림 채널 설정을 관리합니다.
        </p>
      </div>

      {/* Provider Health Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">공공데이터 수집 Provider 상태</CardTitle>
          </div>
          <CardDescription>
            PRD 원칙: API Key의 단순 존재만으로 정상 연결(CONNECTED)로 표시하지 않으며, 실제 통신 검증 결과를 투명하게 반영합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {provider.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {provider.type}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={provider.variant} className="text-xs font-mono">
                    {provider.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {provider.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RBAC & Role Information */}
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
