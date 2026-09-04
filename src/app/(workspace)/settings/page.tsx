"use client";

import React, { useEffect, useState } from "react";
import { Settings, Shield, Server, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

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
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            시스템 설정 (Settings & Administration)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            공공데이터 Provider 연동 상태, 헬스체크 및 RBAC 접근 제어를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStatuses()}
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

      {/* Quick Setup Guidance */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              로컬 환경 공공데이터 API 키 설정 가이드 (.env.local)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            루트 디렉토리의 <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code> 파일에 발급받으신 공공데이터포털 일반 인증키를 등록하시면 조달청, K-Startup, 중기부 공모 실시간 수집 및 헬스체크가 즉시 <Badge variant="success" className="text-[10px] py-0">CONNECTED</Badge>로 활성화됩니다. 터미널에서는 <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">npm run check:providers</code> 명령어로 실시간 통신을 점검할 수 있습니다.
          </p>
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
