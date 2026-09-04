import React from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

interface PermissionDeniedProps {
  requiredRole?: string;
  message?: string;
}

export function PermissionDenied({
  requiredRole,
  message = "해당 작업을 수행할 권한이 없습니다.",
}: PermissionDeniedProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">접근 권한 제한</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {message}
        {requiredRole && (
          <span className="block mt-1 font-mono text-xs text-destructive">
            (필요 권한: {requiredRole})
          </span>
        )}
      </p>
      <Link href="/today" className="mt-6">
        <Button variant="outline" size="sm">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
