'use client';

import React, { useState } from 'react';
import { X, Award, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { OutcomeRecord, OutcomeStatus } from '@/types/outcome';

interface OutcomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome?: OutcomeRecord | null;
  onSuccess: () => void;
}

export const OutcomeFormModal: React.FC<OutcomeFormModalProps> = ({
  isOpen,
  onClose,
  outcome,
  onSuccess,
}) => {
  const isEdit = !!outcome;

  const [opportunityId, setOpportunityId] = useState(outcome?.opportunityId || '');
  const [opportunityTitle, setOpportunityTitle] = useState(outcome?.opportunityTitle || '');
  const [agencyName, setAgencyName] = useState(outcome?.agencyName || '');
  const [category, setCategory] = useState(outcome?.category || 'ROBOT');
  const [status, setStatus] = useState<OutcomeStatus>(outcome?.status || 'AWARDED');
  const [evaluationScore, setEvaluationScore] = useState<string>(
    outcome?.evaluationScore?.toString() || ''
  );
  const [awardAmount, setAwardAmount] = useState<string>(
    outcome?.awardAmount?.toString() || ''
  );
  const [competitorCount, setCompetitorCount] = useState<string>(
    outcome?.competitorCount?.toString() || ''
  );
  const [preparationDays, setPreparationDays] = useState<string>(
    outcome?.preparationDays?.toString() || ''
  );
  const [evaluationFeedback, setEvaluationFeedback] = useState(
    outcome?.evaluationFeedback || ''
  );
  const [internalPostmortem, setInternalPostmortem] = useState(
    outcome?.internalPostmortem || ''
  );
  const [successReasonsStr, setSuccessReasonsStr] = useState(
    (outcome?.successReasons || []).join(', ')
  );
  const [failureReasonsStr, setFailureReasonsStr] = useState(
    (outcome?.failureReasons || []).join(', ')
  );
  const [capabilityGapsStr, setCapabilityGapsStr] = useState(
    (outcome?.capabilityGaps || []).join(', ')
  );
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const successReasons = successReasonsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const failureReasons = failureReasonsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const capabilityGaps = capabilityGapsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isEdit && outcome) {
        const res = await fetch(`/api/outcomes/${outcome.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              status,
              evaluationScore: evaluationScore ? parseFloat(evaluationScore) : null,
              awardAmount: awardAmount ? parseInt(awardAmount, 10) : null,
              competitorCount: competitorCount ? parseInt(competitorCount, 10) : null,
              preparationDays: preparationDays ? parseInt(preparationDays, 10) : null,
              evaluationFeedback,
              internalPostmortem,
              successReasons,
              failureReasons,
              capabilityGaps,
              decidedAt: status !== 'SUBMITTED' ? new Date().toISOString() : null,
            },
            reason: reason || '담당자에 의한 결과 정보 갱신',
            userId: 'user-analyst',
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || '수정에 실패했습니다.');
        }
      } else {
        const res = await fetch('/api/outcomes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opportunityId,
            opportunityTitle,
            agencyName,
            category,
            status,
            evaluationScore: evaluationScore ? parseFloat(evaluationScore) : null,
            awardAmount: awardAmount ? parseInt(awardAmount, 10) : null,
            competitorCount: competitorCount ? parseInt(competitorCount, 10) : null,
            preparationDays: preparationDays ? parseInt(preparationDays, 10) : null,
            evaluationFeedback,
            internalPostmortem,
            successReasons,
            failureReasons,
            capabilityGaps,
            submittedAt: new Date().toISOString(),
            decidedAt: status !== 'SUBMITTED' ? new Date().toISOString() : null,
            userId: 'user-analyst',
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || '등록에 실패했습니다.');
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-card border rounded-xl shadow-2xl p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">
            {isEdit ? '지원 결과 및 심사 피드백 수정' : '신규 공모 지원 결과 등록'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {!isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">공모 ID *</label>
                <input
                  type="text"
                  required
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  placeholder="opp-xxx 또는 UUID"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">공모명 *</label>
                <input
                  type="text"
                  required
                  value={opportunityTitle}
                  onChange={(e) => setOpportunityTitle(e.target.value)}
                  placeholder="과제/공모 공고명"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">발주/전담 기관 *</label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="한국로봇산업진흥원 등"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">도메인 분야</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                >
                  <option value="ROBOT">ROBOT (로봇/자동화)</option>
                  <option value="AI_DATA">AI_DATA (인공지능/SW)</option>
                  <option value="MANUFACTURING">MANUFACTURING (제조혁신)</option>
                  <option value="DEFENSE">DEFENSE (국방/원자력)</option>
                  <option value="ENERGY">ENERGY (에너지/환경)</option>
                  <option value="OTHER">OTHER (기타)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">최종 결과 상태 *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OutcomeStatus)}
                className="w-full border rounded-lg px-3 py-2 bg-background font-semibold"
              >
                <option value="SUBMITTED">제출 완료 (심사중)</option>
                <option value="AWARDED">최종 선정 (협약 체결)</option>
                <option value="REJECTED">탈락 (미선정)</option>
                <option value="WITHDRAWN">철회 (지원 취소)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">심사위원 종합점수</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={evaluationScore}
                onChange={(e) => setEvaluationScore(e.target.value)}
                placeholder="예: 89.5"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">확정 지원금 (원)</label>
              <input
                type="number"
                step="1000000"
                min="0"
                value={awardAmount}
                onChange={(e) => setAwardAmount(e.target.value)}
                placeholder="선정 시 최종 협약 지원금"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">경쟁사 수 (공모 신청기업 수)</label>
              <input
                type="number"
                min="1"
                value={competitorCount}
                onChange={(e) => setCompetitorCount(e.target.value)}
                placeholder="예: 5"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">제안 준비기간 (일)</label>
              <input
                type="number"
                min="1"
                value={preparationDays}
                onChange={(e) => setPreparationDays(e.target.value)}
                placeholder="예: 14"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">심사위원 총평 및 평가 피드백</label>
            <textarea
              rows={2}
              value={evaluationFeedback}
              onChange={(e) => setEvaluationFeedback(e.target.value)}
              placeholder="심사위원회의 기술개발 타당성, 사업화 가능성, 비목 산정 관련 주요 지적 또는 칭찬 내용"
              className="w-full border rounded-lg px-3 py-2 bg-background"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">사내 사후 회고 (Postmortem)</label>
            <textarea
              rows={2}
              value={internalPostmortem}
              onChange={(e) => setInternalPostmortem(e.target.value)}
              placeholder="이번 공모 신청서 작성 및 발표평가 과정에서의 교훈, 차기 공모 개선사항"
              className="w-full border rounded-lg px-3 py-2 bg-background"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">성공 요인 (쉼표 구분)</label>
              <input
                type="text"
                value={successReasonsStr}
                onChange={(e) => setSuccessReasonsStr(e.target.value)}
                placeholder="기술성 우수, 수요기업 확약, 정책 가점 등"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">탈락 요인 (쉼표 구분)</label>
              <input
                type="text"
                value={failureReasonsStr}
                onChange={(e) => setFailureReasonsStr(e.target.value)}
                placeholder="실적 부족, 비목 근거 미흡, 연구인력 참여율 등"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">역량 격차 (쉼표 구분)</label>
              <input
                type="text"
                value={capabilityGapsStr}
                onChange={(e) => setCapabilityGapsStr(e.target.value)}
                placeholder="공인시험인증, 전담인력 부족 등"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block font-medium mb-1 flex items-center gap-1 text-primary">
                <History className="w-4 h-4" />
                수정 사유 (감사 로그에 기록됨) *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예: 최종 공문 접수에 따른 심사점수 반영"
                className="w-full border rounded-lg px-3 py-2 bg-background"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-muted font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2"
            >
              {loading ? (
                <span>저장 중...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? '결과 갱신 (Audit)' : '결과 등록'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
