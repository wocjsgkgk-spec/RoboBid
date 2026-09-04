'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { OutcomeRecord, OutcomeAnalyticsSummary, BiasDiagnosisReport } from '@/types/outcome';
import { OutcomeDashboard } from '@/components/learning/outcome-dashboard';
import { OutcomeListView } from '@/components/learning/outcome-list-view';
import { OutcomeFormModal } from '@/components/learning/outcome-form-modal';
import { KonepsOpeningModal } from '@/components/learning/koneps-opening-modal';
import { KonepsOpeningResult } from '@/types/koneps-opening';
import { EmptyState } from '@/components/ui/empty-state';

export default function LearningPage() {
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [summary, setSummary] = useState<OutcomeAnalyticsSummary | null>(null);
  const [biasDiagnosis, setBiasDiagnosis] = useState<BiasDiagnosisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<OutcomeRecord | null>(null);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [outcomesRes, analyticsRes] = await Promise.all([
        fetch('/api/outcomes'),
        fetch('/api/outcomes/analytics'),
      ]);

      if (!outcomesRes.ok || !analyticsRes.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const outcomesData = await outcomesRes.json();
      const analyticsData = await analyticsRes.json();

      setOutcomes(outcomesData.outcomes || []);
      setSummary(analyticsData.summary || null);
      setBiasDiagnosis(analyticsData.biasDiagnosis || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingOutcome(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (outcome: OutcomeRecord) => {
    setEditingOutcome(outcome);
    setIsModalOpen(true);
  };

  const handleSelectOpeningResult = (result: KonepsOpeningResult, ourBidPrice?: number) => {
    const isWin = result.resultStatus === 'SUCCESSFUL' && ourBidPrice && result.sucsfBidAmt && Math.abs(ourBidPrice - result.sucsfBidAmt) < 1000;
    const prefilled: any = {
      id: `outcome-koneps-${Date.now()}`,
      opportunityId: result.bidNtceNo,
      opportunityTitle: result.bidNtceNm,
      agencyName: result.announcingAgency,
      category: 'ROBOT',
      status: isWin ? 'AWARDED' : 'REJECTED',
      awardAmount: result.sucsfBidAmt || result.lwstBdrBidAmt || undefined,
      competitorCount: result.totPrtcptBsnmCnt,
      evaluationFeedback: `나라장터 개찰결과: 1순위 낙찰사 [${result.sucsfBdrBsnmNm || result.lwstBdrBsnmNm || '미정'}], 투찰률: ${result.sucsfBidRate || result.lwstBdrBidRate || '-'}%`,
      internalPostmortem: ourBidPrice
        ? `자사 투찰가: ${ourBidPrice.toLocaleString()}원 vs 1순위 투찰가: ${(result.sucsfBidAmt || 0).toLocaleString()}원 (오차: ${((ourBidPrice - (result.sucsfBidAmt || 0))).toLocaleString()}원)`
        : '나라장터 개찰결과 데이터 연동',
      successReasons: isWin ? ['투찰 하한선 및 A값 사상률 정밀 적중'] : [],
      failureReasons: !isWin ? ['투찰가 편차 발생 (예가 사상률 오차)'] : [],
      capabilityGaps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingOutcome(prefilled);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            성과·학습 (Outcome Learning & Analytics)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            제출된 공모의 최종 선정/탈락 결과와 심사위원 피드백을 축적하여 스코어링 모델의 신뢰도를 실증 검증합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsOpeningModalOpen(true)}
            className="px-3.5 py-2 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium flex items-center gap-1.5 text-sm shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>나라장터 개찰결과 조회</span>
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>지원 결과 등록</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          <span>성과 분석 데이터를 불러오는 중입니다...</span>
        </div>
      )}

      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-xl text-sm">
          {error}
        </div>
      )}

      {!loading && !error && outcomes.length === 0 && (
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <EmptyState
            icon={TrendingUp}
            title="축적된 입찰 결과 데이터가 없습니다"
            description="실제 사업계획서 제출 및 선정/탈락 결과가 기록된 이후, 통계적 승률 및 심사위원 피드백 분석 보고서가 제공됩니다."
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>첫 지원 결과 등록하기</span>
            </button>
          </div>
        </div>
      )}

      {!loading && !error && outcomes.length > 0 && summary && biasDiagnosis && (
        <>
          {/* 다차원 분석 대시보드 */}
          <OutcomeDashboard summary={summary} biasDiagnosis={biasDiagnosis} />

          {/* Outcome 레코드 목록 */}
          <OutcomeListView
            outcomes={outcomes}
            onEdit={handleOpenEdit}
            onRefresh={fetchData}
          />
        </>
      )}

      {/* 모달 */}
      <OutcomeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        outcome={editingOutcome}
        onSuccess={fetchData}
      />

      <KonepsOpeningModal
        open={isOpeningModalOpen}
        onOpenChange={setIsOpeningModalOpen}
        onSelectResult={handleSelectOpeningResult}
      />
    </div>
  );
}
