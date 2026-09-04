'use client';

import React, { useState } from 'react';
import {
  Award,
  XCircle,
  Clock,
  Edit,
  History,
  FileText,
  Building2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { OutcomeRecord, OutcomeStatus, OutcomeAuditLog } from '@/types/outcome';

interface OutcomeListViewProps {
  outcomes: OutcomeRecord[];
  onEdit: (outcome: OutcomeRecord) => void;
  onRefresh: () => void;
}

export const OutcomeListView: React.FC<OutcomeListViewProps> = ({
  outcomes,
  onEdit,
}) => {
  const [selectedAuditLog, setSelectedAuditLog] = useState<{
    outcomeTitle: string;
    logs: OutcomeAuditLog[];
  } | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const getStatusBadge = (status: OutcomeStatus) => {
    switch (status) {
      case 'AWARDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Award className="w-3 h-3" />
            선정 (수주)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            탈락 (미선정)
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
            지원 철회
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            제출완료 (심사중)
          </span>
        );
    }
  };

  const handleViewAudit = async (outcome: OutcomeRecord) => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/outcomes/${outcome.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAuditLog({
          outcomeTitle: outcome.opportunityTitle || '공모 지원 결과',
          logs: data.auditLogs || [],
        });
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="font-semibold text-base">지원 결과 및 심사 이력 데이터셋 ({outcomes.length}건)</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b">
            <tr>
              <th className="py-3 px-4 font-semibold">공모명 / 발주기관</th>
              <th className="py-3 px-4 font-semibold text-center">도메인</th>
              <th className="py-3 px-4 font-semibold text-center">Score / 결정</th>
              <th className="py-3 px-4 font-semibold text-center">상태</th>
              <th className="py-3 px-4 font-semibold text-center">평가점수</th>
              <th className="py-3 px-4 font-semibold text-right">수주금액</th>
              <th className="py-3 px-4 font-semibold text-center">경쟁률 / 소요일</th>
              <th className="py-3 px-4 font-semibold text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y text-xs">
            {outcomes.map((o) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="py-3 px-4">
                  <div className="font-medium text-foreground">
                    {o.opportunityTitle || o.opportunityId}
                  </div>
                  <div className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    <span>{o.agencyName || '발주기관 미지정'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-muted rounded text-[11px] font-medium">
                    {o.category || '기타'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="font-semibold">
                    {o.opportunityScore ? `${o.opportunityScore}점` : '-'}
                  </div>
                  {o.decision && (
                    <span className="text-[10px] text-muted-foreground">
                      ({o.decision})
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">{getStatusBadge(o.status)}</td>
                <td className="py-3 px-4 text-center font-bold">
                  {o.evaluationScore !== null && o.evaluationScore !== undefined
                    ? `${o.evaluationScore}점`
                    : '-'}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  {o.awardAmount
                    ? `${(o.awardAmount / 100_000_000).toFixed(1)}억원`
                    : '-'}
                </td>
                <td className="py-3 px-4 text-center text-muted-foreground">
                  <div>{o.competitorCount ? `${o.competitorCount}:1` : '-'}</div>
                  <div className="text-[10px]">{o.preparationDays ? `${o.preparationDays}일 소요` : ''}</div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(o)}
                      className="p-1.5 border rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="결과 및 심사의견 수정"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleViewAudit(o)}
                      className="p-1.5 border rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="감사 이력 보기"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {outcomes.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  등록된 지원 결과 데이터가 없습니다. 상단의 &apos;지원 결과 등록&apos; 버튼으로 추가해 주세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 감사 로그 모달 */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card border rounded-xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">
                Outcome 감사 로그 (Audit Trail)
              </h3>
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              {selectedAuditLog.outcomeTitle}
            </div>

            <div className="space-y-4">
              {selectedAuditLog.logs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg bg-muted/20 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    담당자: <span className="text-foreground font-medium">{log.changedBy || 'user'}</span>
                  </div>
                  {log.reason && (
                    <div className="mt-1 text-muted-foreground">
                      사유: <span className="text-foreground">{log.reason}</span>
                    </div>
                  )}

                  {log.previousData && (
                    <div className="mt-2 p-2 bg-background border rounded text-[11px] font-mono">
                      <div className="text-rose-500 font-semibold mb-1">[변경 전]</div>
                      <div>상태: {log.previousData.status}</div>
                      <div>점수: {log.previousData.evaluationScore ?? '없음'}</div>
                      <div>수주액: {log.previousData.awardAmount ?? '없음'}</div>
                    </div>
                  )}

                  <div className="mt-2 p-2 bg-background border rounded text-[11px] font-mono">
                    <div className="text-emerald-500 font-semibold mb-1">
                      {log.previousData ? '[변경 후]' : '[등록 내용]'}
                    </div>
                    <div>상태: {log.newData.status}</div>
                    <div>점수: {log.newData.evaluationScore ?? '없음'}</div>
                    <div>수주액: {log.newData.awardAmount ?? '없음'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
