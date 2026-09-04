"use client";

import React from "react";
import { FileText, FileSpreadsheet, FileArchive, AlertCircle, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ParseStatus } from "@/types/document";

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes?: number;
  parseStatus: ParseStatus;
  parseErrorMessage?: string;
  sectionCount?: number;
  tableCount?: number;
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
  onParse?: (attachmentId: string) => void;
  isParsing?: boolean;
}

export function AttachmentList({
  attachments,
  onParse,
  isParsing = false,
}: AttachmentListProps) {
  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case "pdf":
      case "hwp":
      case "hwpx":
      case "docx":
        return <FileText className="h-5 w-5 text-primary" />;
      case "xlsx":
      case "xls":
      case "csv":
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
      case "zip":
        return <FileArchive className="h-5 w-5 text-amber-600" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ParseStatus) => {
    switch (status) {
      case "PARSED":
        return (
          <Badge variant="success" className="gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>분석 완료</span>
          </Badge>
        );
      case "PARSING":
        return (
          <Badge variant="outline" className="gap-1 text-[11px] animate-pulse">
            <Clock className="h-3 w-3" />
            <span>분석 중...</span>
          </Badge>
        );
      case "REVIEW_REQUIRED":
        return (
          <Badge variant="warning" className="gap-1 text-[11px]">
            <AlertCircle className="h-3 w-3" />
            <span>수동 검토/변환 권장</span>
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <AlertCircle className="h-3 w-3" />
            <span>파싱 오류</span>
          </Badge>
        );
      case "UNSUPPORTED":
        return (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <HelpCircle className="h-3 w-3" />
            <span>미지원 형식</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-[11px]">
            <Clock className="h-3 w-3" />
            <span>대기 중</span>
          </Badge>
        );
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border rounded-lg bg-muted/20">
        등록된 첨부파일이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-card shadow-sm">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getFileIcon(att.fileExtension)}</div>
            <div>
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>{att.fileName}</span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  ({att.fileExtension})
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                {att.fileSizeBytes && (
                  <span>{(att.fileSizeBytes / 1024).toFixed(1)} KB</span>
                )}
                {att.sectionCount !== undefined && att.sectionCount > 0 && (
                  <span>{att.sectionCount}개 섹션 추출</span>
                )}
                {att.tableCount !== undefined && att.tableCount > 0 && (
                  <span>{att.tableCount}개 표 감지</span>
                )}
                {att.parseErrorMessage && (
                  <span className="text-destructive font-normal">{att.parseErrorMessage}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {getStatusBadge(att.parseStatus)}
            {onParse && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onParse(att.id)}
                disabled={isParsing || att.parseStatus === "PARSING"}
                className="text-xs h-8"
              >
                RFP 분석
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
