'use client';

import React, { useState } from 'react';
import {
  Users2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  DollarSign,
  Cpu,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { CrossReviewResult, SpecialistRole } from '@/types/project';

interface CrossReviewPanelProps {
  proposalId: string;
}

export const CrossReviewPanel: React.FC<CrossReviewPanelProps> = ({ proposalId }) => {
  const [reviewResult, setReviewResult] = useState<CrossReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/cross-review`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('교차 검토 실행에 실패했습니다.');
      }
      const data = await res.json();
      setReviewResult(data.review);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: SpecialistRole) => {
    switch (role) {
      case 'STRATEGY':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'FINANCIAL':
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'TECHNICAL':
        return <Cpu className="w-5 h-5 text-purple-500" />;
      case 'COMPLIANCE':
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: 'PASS' | 'WARN' | 'CRITICAL') => {
    switch (status) {
      case 'PASS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            적합 (PASS)
          </span>
        );
      case 'WARN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            보완 요망 (WARN)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            결격 위험 (CRITICAL)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 배너 */}
      <div className="p-4 border rounded-xl bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            4대 전문가 에이전트 교차 검토 (Specialist Cross-Review)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            전략, 재무, 기술, 규정 4개 분야 전문 검토자가 제안서 초안과 증빙, RTM 매트릭스를 다각도 분석하여 평가위원 관점의 개선점을 도출합니다.
          </p>
        </div>

        <button
          onClick={handleRunReview}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm flex items-center gap-2 shrink-0 shadow-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>검토 에이전트 실행 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>전문가 교차 검토 실행</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-xl text-sm">
          {error}
        </div>
      )}

      {!reviewResult && !loading && (
        <div className="p-12 text-center border rounded-xl bg-card text-muted-foreground">
          <Users2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
          <h4 className="font-semibold text-sm text-foreground">교차 검토 결과가 없습니다</h4>
          <p className="text-xs mt-1">
            상단의 '전문가 교차 검토 실행' 버튼을 눌러 4대 전문 에이전트의 종합 피드백을 확인하세요.
          </p>
        </div>
      )}

      {reviewResult && (
        <div className="space-y-6">
          {/* 종합 점수 카드 */}
          <div className="p-4 border rounded-xl bg-primary/5 border-primary/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-primary uppercase">
                Cross-Review Composite Score
              </div>
              <div className="text-2xl font-bold mt-1">
                {reviewResult.overallScore}점 / 100점
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                검토 완료 일시: {new Date(reviewResult.reviewedAt).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              {reviewResult.overallScore >= 80 ? (
                <span className="text-emerald-600 font-bold text-sm">
                  제출 권장 수준 (High Readiness)
                </span>
              ) : (
                <span className="text-amber-600 font-bold text-sm">
                  보완 권고사항 반영 요망
                </span>
              )}
            </div>
          </div>

          {/* 4대 에이전트 카드 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewResult.findings.map((finding, idx) => (
              <div
                key={idx}
                className="p-5 border rounded-xl bg-card shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-muted">
                      {getRoleIcon(finding.role)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{finding.agentName}</h4>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {finding.title}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(finding.status)}</div>
                </div>

                <div className="text-xs font-semibold flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">적합도 점수:</span>
                  <span className="text-foreground">{finding.score}점</span>
                </div>

                {/* 검토 코멘트 */}
                <div className="space-y-1.5 text-xs text-foreground/90">
                  <div className="font-semibold text-muted-foreground text-[11px]">
                    [검토 소견]
                  </div>
                  {finding.comments.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-primary">•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                {/* 권고사항 */}
                {finding.recommendations.length > 0 && (
                  <div className="space-y-1.5 text-xs p-3 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20">
                    <div className="font-semibold text-[11px] text-amber-700 dark:text-amber-300">
                      [개선 권고사항]
                    </div>
                    {finding.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span>→</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
