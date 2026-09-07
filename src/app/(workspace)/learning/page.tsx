'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, RefreshCw, Layers, Award } from 'lucide-react';
import { OutcomeRecord, OutcomeAnalyticsSummary, BiasDiagnosisReport } from '@/types/outcome';
import { OutcomeDashboard } from '@/components/learning/outcome-dashboard';
import { OutcomeListView } from '@/components/learning/outcome-list-view';
import { OutcomeFormModal } from '@/components/learning/outcome-form-modal';
import { EmptyState } from '@/components/ui/empty-state';

export default function LearningPage() {
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [summary, setSummary] = useState<OutcomeAnalyticsSummary | null>(null);
  const [biasDiagnosis, setBiasDiagnosis] = useState<BiasDiagnosisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<OutcomeRecord | null>(null);

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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            공모 심사 성과 & 학습 분석 (Funding Outcome Analytics)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            정부 R&D 및 로봇 지원사업 공모의 서면평가·발표평가 점수와 심사위원 피드백을 축적하여 선정률 및 스코어링 모델의 정밀도를 향상합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            <span>공모 심사 결과 등록</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          <span>공모 성과 분석 데이터를 불러오는 중입니다...</span>
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
            title="축적된 공모 심사 결과 데이터가 없습니다"
            description="실제 사업계획서 제출 후 서면평가 또는 발표평가 결과(선정/탈락)를 등록하면, 심사위원 종합의견 및 가점 획득 요인 분석 보고서가 제공됩니다."
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>첫 공모 심사 결과 등록하기</span>
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
    </div>
  );
}
