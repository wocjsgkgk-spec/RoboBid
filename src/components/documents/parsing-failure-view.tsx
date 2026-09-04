import React from "react";
import { AlertTriangle, FileWarning, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParsingFailureViewProps {
  fileName: string;
  errorMessage?: string;
  isLegacyHwp?: boolean;
  onRetry?: () => void;
  onUploadReplacement?: () => void;
}

export function ParsingFailureView({
  fileName,
  errorMessage = "문서 파싱 중 오류가 발생했습니다.",
  isLegacyHwp = false,
  onRetry,
  onUploadReplacement,
}: ParsingFailureViewProps) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mx-auto">
        {isLegacyHwp ? <FileWarning className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h4 className="text-sm font-semibold text-foreground">
          {isLegacyHwp ? "레거시 HWP 문서 검토/변환 권장" : "문서 분석 실패"}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isLegacyHwp
            ? `[${fileName}] 문서는 구형 HWP 5.0 바이너리 형식입니다. 웹 서버 안정성을 위해 C 네이티브 모듈 직접 실행을 제한하고 있으니, 공고 포털에서 HWPX(표준 한글 XML) 또는 PDF 파일을 다운로드하여 업로드해 주세요.`
            : `[${fileName}]: ${errorMessage}`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>재시도</span>
          </Button>
        )}
        {onUploadReplacement && (
          <Button size="sm" onClick={onUploadReplacement} className="gap-2 text-xs">
            <UploadCloud className="h-3.5 w-3.5" />
            <span>대체 파일(PDF/HWPX) 업로드</span>
          </Button>
        )}
      </div>
    </div>
  );
}
