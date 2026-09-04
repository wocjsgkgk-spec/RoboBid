"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Phase 1: 실제 Supabase Auth 연동 핸들러
    // 세션 수립 후 /today로 리다이렉트
    window.location.href = "/today";
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Cpu className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            RoboBid AI
          </h1>
          <p className="text-xs text-muted-foreground">
            로봇·특수목적 하드웨어 공공사업 BidOps Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">로그인</CardTitle>
            <CardDescription className="text-xs">
              등록된 회사 계정으로 안전하게 로그인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">비밀번호</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                <span>{isLoading ? "인증 확인 중..." : "워크스페이스 입장"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                새 조직/계정 등록
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>RLS 기반 다중 테넌트 데이터 격리 및 감사 로그 보호</span>
        </div>
      </div>
    </div>
  );
}
