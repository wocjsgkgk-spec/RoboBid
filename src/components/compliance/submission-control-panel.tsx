"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Send,
  Lock,
  ExternalLink,
  Clock,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ComplianceAuditSummary,
  SubmissionChecklist,
  SubmissionConfirmationPayload,
} from "@/types/compliance";
import { Proposal } from "@/types/proposal";

interface SubmissionControlPanelProps {
  proposal: Proposal;
  checklist: SubmissionChecklist;
  summary: ComplianceAuditSummary;
  onUpdateChecklist: (updates: Partial<SubmissionChecklist>) => Promise<void>;
  onConfirmSubmission: (payload: SubmissionConfirmationPayload) => Promise<void>;
}

export function SubmissionControlPanel({
  proposal,
  checklist,
  summary,
  onUpdateChecklist,
  onConfirmSubmission,
}: SubmissionControlPanelProps) {
  const [submitterName, setSubmitterName] = useState(checklist.submitterName || "");
  const [submissionUrl, setSubmissionUrl] = useState(checklist.submissionUrl || "");
  const [finalFileName, setFinalFileName] = useState(checklist.finalFileName || "");
  const [finalFileHash, setFinalFileHash] = useState(checklist.finalFileHash || "");
  const [notes, setNotes] = useState(checklist.submissionNotes || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleItem = async (key: keyof SubmissionChecklist) => {
    const nextVal = !checklist[key];
    await onUpdateChecklist({ [key]: nextVal });
  };

  const handleConfirmSubmit = async () => {
    if (!submitterName.trim() || !finalFileName.trim() || !finalFileHash.trim()) {
      setErrorMsg("담당자 성명, 최종 파일명 및 파일 해시(SHA-256)를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirmSubmission({
        proposalId: proposal.id,
        submitterName,
        submissionUrl,
        finalFileName,
        finalFileHash,
        submissionNotes: notes,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "제출 확정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 모든 필수 요건 충족 및 체크리스트 완료 여부
  const isReady =
    summary.canSubmit &&
    checklist.documentsReady &&
    checklist.sealAndSignatureVerified &&
    checklist.formatAndSizeVerified &&
    checklist.submissionUrlVerified &&
    checklist.submitterAssigned;

  const isAlreadySubmitted = proposal.status === "SUBMITTED";

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Auto-Submission Prohibition Notice (PRD Section 14, 21) */}
      <div className="rounded-lg border bg-muted/40 p-4 space-y-2 border-l-4 border-l-primary">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Lock className="h-4 w-4 text-primary" />
          <span>Zero Auto-Submission 원칙 (안전 제출 통제)</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          RoboBid AI는 허가되지 않은 자동 공모 제출 및 자동 외부 계약을 절대 수행하지 않습니다.
          제안서 최종 제출은 인간 담당자가 공식 시스템(나라장터, IRIS, K-Startup 등)에 수동 접수한 후 본 화면에서 감사 로그로 확정합니다.
        </p>
      </div>

      {/* 2. D-Day Deadline Banner */}
      <div className="rounded-lg border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">
              최종 제출 마감일: {proposal.targetSubmissionDate || "미정"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            제출 당일 네트워크 폭주 및 인증서 오류를 방지하기 위해 마감 4시간 전 최종 접수를 권장합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isAlreadySubmitted ? "default" : summary.canSubmit ? "secondary" : "destructive"}
            className="text-xs py-1 px-3"
          >
            {isAlreadySubmitted
              ? "✓ 공식 제출 완료"
              : summary.canSubmit
              ? "사전 심사 통과"
              : "필수 요건 미충족"}
          </Badge>
        </div>
      </div>

      {/* 3. 7대 사전 제출 체크리스트 */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">
            7대 사전 제출 체크리스트 (Pre-flight Checklist)
          </CardTitle>
          <CardDescription className="text-xs">
            제출 전 누락 및 형식상 결격 사유를 방지하기 위해 모든 검증 항목을 체크하십시오.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Item 1: RTM Mandatory Satisfied */}
          <div className="flex items-start gap-3 p-2.5 rounded-md border bg-muted/20">
            <div className="mt-0.5">
              {summary.canSubmit ? (
                <CheckSquare className="h-4 w-4 text-emerald-600" />
              ) : (
                <Square className="h-4 w-4 text-destructive" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                <span>1. RFP 필수 요구조건 100% 충족 여부</span>
                <Badge
                  variant={summary.canSubmit ? "outline" : "destructive"}
                  className="text-[10px]"
                >
                  {summary.mandatoryMissingCount === 0 ? "충족 완료" : `${summary.mandatoryMissingCount}건 누락`}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                RTM 매트릭스에서 모든 필수 요건이 SATISFIED 또는 NOT_APPLICABLE 상태여야 합니다.
              </p>
            </div>
          </div>

          {/* Item 2: Required Documents */}
          <div
            onClick={() => !isAlreadySubmitted && toggleItem("documentsReady")}
            className="flex items-start gap-3 p-2.5 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="mt-0.5">
              {checklist.documentsReady ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">
                2. 필수 첨부 서류 구비 확인
              </div>
              <p className="text-[11px] text-muted-foreground">
                사업자등록증, 최근 3개년 재무제표, 4대보험 완납증명서, 신용평가등급확인서 등
              </p>
            </div>
          </div>

          {/* Item 3: Seal & Signature */}
          <div
            onClick={() => !isAlreadySubmitted && toggleItem("sealAndSignatureVerified")}
            className="flex items-start gap-3 p-2.5 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="mt-0.5">
              {checklist.sealAndSignatureVerified ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">
                3. 법인 인감 날인 및 대표자 서명 확인
              </div>
              <p className="text-[11px] text-muted-foreground">
                제안서 표지, 청렴계약이행서약서, 개인정보동의서 상의 인감 날인 유효성 검증
              </p>
            </div>
          </div>

          {/* Item 4: Format & Size */}
          <div
            onClick={() => !isAlreadySubmitted && toggleItem("formatAndSizeVerified")}
            className="flex items-start gap-3 p-2.5 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="mt-0.5">
              {checklist.formatAndSizeVerified ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">
                4. 파일 포맷(PDF/HWP) 및 용량 규격(100MB 이하) 검증
              </div>
              <p className="text-[11px] text-muted-foreground">
                공고 지정 양식 준수 여부 및 제출 시스템 업로드 제한 용량 초과 방지
              </p>
            </div>
          </div>

          {/* Item 5: Submission URL */}
          <div
            onClick={() => !isAlreadySubmitted && toggleItem("submissionUrlVerified")}
            className="flex items-start gap-3 p-2.5 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="mt-0.5">
              {checklist.submissionUrlVerified ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">
                5. 공식 공모 접수 URL 및 전자접수 시스템 확인
              </div>
              <p className="text-[11px] text-muted-foreground">
                나라장터(G2B), 범부처통합연구지원시스템(IRIS), K-Startup 등 접수처 일치 확인
              </p>
            </div>
          </div>

          {/* Item 6: Submitter Assigned */}
          <div
            onClick={() => !isAlreadySubmitted && toggleItem("submitterAssigned")}
            className="flex items-start gap-3 p-2.5 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="mt-0.5">
              {checklist.submitterAssigned ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">
                6. 입찰 대리인/제출 담당자(Submitter) 실명 지정
              </div>
              <p className="text-[11px] text-muted-foreground">
                공인인증서 보유 및 지문보안토큰 로그인 권한이 있는 담당자 지정 완료
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Human Confirmation Panel */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">
              제출 완료 사용자 최종 확정 (Human Confirmation)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            공식 접수처에 제출을 마친 후 파일 무결성 해시와 접수 정보를 기록하여 제안서를 최종 확정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">제출 담당자 성명 (필수)</label>
              <Input
                placeholder="예: 홍길동 책임연구원"
                value={submitterName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubmitterName(e.target.value)}
                disabled={isAlreadySubmitted}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">제출 시스템 접수 URL</label>
              <Input
                placeholder="예: https://www.iris.go.kr (범부처통합연구지원시스템) 또는 공모 접수처 URL"
                value={submissionUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubmissionUrl(e.target.value)}
                disabled={isAlreadySubmitted}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">최종 제출 파일명 (필수)</label>
              <Input
                placeholder={`예: ${proposal.title ? proposal.title.replace(/[\s/]/g, "_") : "제안서"}_최종제출본.pdf`}
                value={finalFileName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinalFileName(e.target.value)}
                disabled={isAlreadySubmitted}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">파일 무결성 해시 (SHA-256 필수)</label>
              <Input
                placeholder="예: sha256 해시값 (직접 입력 또는 서명 생성)"
                value={finalFileHash}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinalFileHash(e.target.value)}
                disabled={isAlreadySubmitted}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">접수 확인 비고 (접수번호 등)</label>
            <Input
              placeholder="예: 범부처통합연구지원시스템(IRIS) 또는 과제 접수번호 입력"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              disabled={isAlreadySubmitted}
              className="text-xs"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {isAlreadySubmitted ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ {checklist.submittedAt ? new Date(checklist.submittedAt).toLocaleString("ko-KR") : ""} 제출 확정됨
                </span>
              ) : isReady ? (
                <span className="text-primary font-medium">모든 체크포인트가 검증되었습니다.</span>
              ) : (
                <span className="text-destructive font-medium">
                  사전 체크리스트 항목을 먼저 완료해야 합니다.
                </span>
              )}
            </div>

            {!isAlreadySubmitted && (
              <Button
                onClick={handleConfirmSubmit}
                disabled={submitting || !isReady}
                size="sm"
                className="gap-2"
              >
                <FileCheck className="h-4 w-4" />
                <span>{submitting ? "확정 기록 중..." : "제출 완료 최종 확정"}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
