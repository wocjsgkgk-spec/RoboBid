'use client';

import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  XCircle,
  FileCheck,
  DollarSign,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  Building2,
  PieChart,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { OutcomeAnalyticsSummary, BiasDiagnosisReport } from '@/types/outcome';

interface OutcomeDashboardProps {
  summary: OutcomeAnalyticsSummary;
  biasDiagnosis: BiasDiagnosisReport;
}

export const OutcomeDashboard: React.FC<OutcomeDashboardProps> = ({
  summary,
  biasDiagnosis,
}) => {
  const [activeTab, setActiveTab] = useState<
    'agencies' | 'scores' | 'categories' | 'gaps'
  >('scores');

  const formatCurrency = (amount: number) => {
    if (amount >= 100_000_000) {
      return `${(amount / 100_000_000).toFixed(1)}억원`;
    }
    if (amount >= 10_000) {
      return `${(amount / 10_000).toLocaleString()}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 핵심 KPI 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>총 지원 건수</span>
            <FileCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">{summary.totalCount}건</div>
          <div className="text-xs text-muted-foreground mt-1">
            심사중 {summary.submittedCount}건
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card shadow-sm border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span>최종 선정 (협약)</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.awardedCount}건
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            공모 선정률 {summary.winRate}%
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between text-rose-500 text-xs font-medium">
            <span>탈락 / 미선정</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {summary.rejectedCount}건
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            철회 {summary.withdrawnCount}건
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>누적 협약 지원금</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {formatCurrency(summary.totalAwardAmount)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            선정 과제 총 정부지원금
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>평균 심사점수</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {summary.avgEvaluationScore > 0 ? `${summary.avgEvaluationScore}점` : '-'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            평가위원회 평점
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>평균 준비기간</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {summary.avgPreparationDays > 0 ? `${summary.avgPreparationDays}일` : '-'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            경쟁률 {summary.avgCompetitorCount > 0 ? `${summary.avgCompetitorCount}:1` : '-'}
          </div>
        </div>
      </div>

      {/* 2. 데이터 누락 및 표본 편향 진단 보고 배너 */}
      {biasDiagnosis.warnings.length > 0 && (
        <div className="p-4 border rounded-xl bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>데이터 신뢰도 및 표본 편향 진단 리포트 (Data Bias & Missingness Report)</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
            {biasDiagnosis.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-amber-800 dark:text-amber-300">
            <span>표본 수: {biasDiagnosis.sampleSize}건</span>
            <span>평가점수 결측률: {biasDiagnosis.missingScoreRate}%</span>
            <span>피드백 결측률: {biasDiagnosis.missingFeedbackRate}%</span>
            {biasDiagnosis.dominantAgency && (
              <span>주요 편향 기관: {biasDiagnosis.dominantAgency}</span>
            )}
          </div>
        </div>
      )}

      {/* 3. 다차원 분석 탭 네비게이션 */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="flex border-b bg-muted/40 px-4">
          <button
            onClick={() => setActiveTab('scores')}
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
              activeTab === 'scores'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>스코어 구간별 대조 (Score vs Outcome)</span>
          </button>
          <button
            onClick={() => setActiveTab('agencies')}
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
              activeTab === 'agencies'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>발주기관별 분석 ({summary.byAgency.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>분야 및 금액대별 분석</span>
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
              activeTab === 'gaps'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>성공 요인 & 역량 격차 (Gap Analysis)</span>
          </button>
        </div>

        {/* 탭 1: 스코어 구간별 대조 */}
        {activeTab === 'scores' && (
          <div className="p-5 space-y-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>
                초기 추천 시 산정된 <strong>Opportunity Score</strong>와 실제 심사 결과(선정/탈락)를 대조하여,
                스코어링 알고리즘의 유효성을 실증 분석합니다. (PRD: 조기 Win 모델 노출 금지, 사후 검증용)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Opportunity Score 구간</th>
                    <th className="py-2.5 px-4 font-semibold text-center">지원 건수</th>
                    <th className="py-2.5 px-4 font-semibold text-center">최종 선정</th>
                    <th className="py-2.5 px-4 font-semibold text-center">탈락</th>
                    <th className="py-2.5 px-4 font-semibold text-center">실제 수주율 (Win Rate)</th>
                    <th className="py-2.5 px-4 font-semibold text-center">평균 심사점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {summary.byScoreBracket.map((bracket, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{bracket.key}</td>
                      <td className="py-3 px-4 text-center">{bracket.total}건</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                        {bracket.awarded}건
                      </td>
                      <td className="py-3 px-4 text-center text-rose-500">{bracket.rejected}건</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${bracket.winRate}%` }}
                            />
                          </div>
                          <span className="font-semibold text-foreground">{bracket.winRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {bracket.avgScore ? `${bracket.avgScore}점` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GO 의사결정 타당성 대조 */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold text-sm mb-3">GO / HOLD / NO-GO 의사결정 대조 성과</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {summary.byDecision.map((dec, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-card/50 text-xs">
                    <div className="font-semibold flex items-center justify-between">
                      <span>결정: {dec.key}</span>
                      <span className="text-muted-foreground">{dec.total}건</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">선정 / 탈락:</span>
                      <span className="font-medium text-emerald-600">
                        {dec.awarded}선정 / {dec.rejected}탈락
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-muted-foreground">실제 승률:</span>
                      <span className="font-bold text-foreground">{dec.winRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 발주기관별 분석 */}
        {activeTab === 'agencies' && (
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">발주 / 전담 기관명</th>
                    <th className="py-2.5 px-4 font-semibold text-center">지원 건수</th>
                    <th className="py-2.5 px-4 font-semibold text-center">선정 건수</th>
                    <th className="py-2.5 px-4 font-semibold text-center">탈락 건수</th>
                    <th className="py-2.5 px-4 font-semibold text-center">승률</th>
                    <th className="py-2.5 px-4 font-semibold text-right">총 수주금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {summary.byAgency.map((agency, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{agency.key}</span>
                      </td>
                      <td className="py-3 px-4 text-center">{agency.total}건</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                        {agency.awarded}건
                      </td>
                      <td className="py-3 px-4 text-center text-rose-500">{agency.rejected}건</td>
                      <td className="py-3 px-4 text-center font-semibold">{agency.winRate}%</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(agency.totalAwardAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 탭 3: 분야 및 금액대별 */}
        {activeTab === 'categories' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">도메인 분야별 성과</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-2.5">분야</th>
                      <th className="p-2.5 text-center">지원</th>
                      <th className="p-2.5 text-center">선정</th>
                      <th className="p-2.5 text-center">승률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.byCategory.map((cat, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium">{cat.key}</td>
                        <td className="p-2.5 text-center">{cat.total}</td>
                        <td className="p-2.5 text-center text-emerald-600 font-semibold">
                          {cat.awarded}
                        </td>
                        <td className="p-2.5 text-center font-bold">{cat.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">사업 예산 규모대별 성과</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-2.5">예산 구간</th>
                      <th className="p-2.5 text-center">지원</th>
                      <th className="p-2.5 text-center">선정</th>
                      <th className="p-2.5 text-center">승률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.byBudgetRange.map((bg, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium">{bg.key}</td>
                        <td className="p-2.5 text-center">{bg.total}</td>
                        <td className="p-2.5 text-center text-emerald-600 font-semibold">
                          {bg.awarded}
                        </td>
                        <td className="p-2.5 text-center font-bold">{bg.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 탭 4: 성공 요인 & 역량 격차 */}
        {activeTab === 'gaps' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="border rounded-xl p-4 bg-emerald-500/5 border-emerald-500/20">
              <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                핵심 성공 요인 (TOP 5)
              </h4>
              <div className="space-y-2">
                {summary.commonSuccessReasons.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-card border"
                  >
                    <span>{item.reason}</span>
                    <span className="font-bold text-emerald-600">{item.count}회</span>
                  </div>
                ))}
                {summary.commonSuccessReasons.length === 0 && (
                  <div className="text-muted-foreground">기록된 성공 요인이 없습니다.</div>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-rose-500/5 border-rose-500/20">
              <h4 className="font-bold text-sm text-rose-700 dark:text-rose-300 mb-3 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                주요 탈락 원인 (TOP 5)
              </h4>
              <div className="space-y-2">
                {summary.commonFailureReasons.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-card border"
                  >
                    <span>{item.reason}</span>
                    <span className="font-bold text-rose-600">{item.count}회</span>
                  </div>
                ))}
                {summary.commonFailureReasons.length === 0 && (
                  <div className="text-muted-foreground">기록된 실패 요인이 없습니다.</div>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-amber-500/5 border-amber-500/20">
              <h4 className="font-bold text-sm text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                사내 역량 격차 (Capability Gaps)
              </h4>
              <div className="space-y-2">
                {summary.topCapabilityGaps.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-card border"
                  >
                    <span>{item.gap}</span>
                    <span className="font-bold text-amber-600">{item.count}건</span>
                  </div>
                ))}
                {summary.topCapabilityGaps.length === 0 && (
                  <div className="text-muted-foreground">식별된 역량 격차가 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
