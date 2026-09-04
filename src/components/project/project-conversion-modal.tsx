'use client';

import React, { useState } from 'react';
import { X, Briefcase, Calendar, DollarSign, CheckCircle2, AlertTriangle, Layers, Users, FileText } from 'lucide-react';
import { ProjectRecord } from '@/types/project';

interface ProjectConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  proposalId?: string;
  opportunityTitle: string;
  budget?: number;
  agency?: string;
  onSuccess?: (project: ProjectRecord) => void;
}

export const ProjectConversionModal: React.FC<ProjectConversionModalProps> = ({
  isOpen,
  onClose,
  opportunityId,
  proposalId,
  opportunityTitle,
  budget = 500_000_000,
  agency = '전담기관',
  onSuccess,
}) => {
  const [name, setName] = useState(opportunityTitle);
  const [totalBudget, setTotalBudget] = useState(budget.toString());
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2028-10-31');
  const [managingAgency, setManagingAgency] = useState(agency);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedProject, setConvertedProject] = useState<ProjectRecord | null>(null);

  if (!isOpen) return null;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          proposalId,
          name,
          totalBudget: parseInt(totalBudget, 10),
          startDate,
          endDate,
          managingAgency,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '프로젝트 전환에 실패했습니다.');
      }

      const data = await res.json();
      setConvertedProject(data.project);
      if (onSuccess) {
        onSuccess(data.project);
      }
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

        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <h3 className="font-bold text-lg">
            선정 공모 프로젝트 전환 (Post-Award Project Conversion)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          최종 선정된 공모 제안서를 실행 프로젝트로 전환하고, 4단계 WBS 마일스톤, 인력 배분 계획 및 외주 용역 RFP 초안을 수립합니다.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!convertedProject ? (
          <form onSubmit={handleConvert} className="space-y-4 text-sm">
            <div>
              <label className="block font-medium mb-1">프로젝트(과제)명 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-background font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">총 사업비 (원) *</label>
                <input
                  type="number"
                  required
                  step="1000000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  정부출연 75% : 민간부담 25% 비율 자동 반영
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">전담 기관 *</label>
                <input
                  type="text"
                  required
                  value={managingAgency}
                  onChange={(e) => setManagingAgency(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">사업 시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">사업 종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                전환 시 법적 자동 계약/자동 채용은 실행되지 않으며, 사내 결재를 위한 WBS 및 외주/채용 초안 문서가 생성됩니다.
              </span>
            </div>

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
                {loading ? '생성 중...' : '프로젝트 전환 확정'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>프로젝트 전환이 완료되었습니다. (Status: PLANNING)</span>
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <Layers className="w-4 h-4 text-primary" />
                WBS 마일스톤 (4단계)
              </h4>
              <div className="divide-y text-muted-foreground">
                {convertedProject.milestones.map((m) => (
                  <div key={m.id} className="py-1.5 flex justify-between">
                    <span>{m.milestoneName}</span>
                    <span className="font-mono text-foreground">{m.targetDate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-primary" />
                인력 배분 및 신규 채용 계획
              </h4>
              <div className="space-y-1 text-muted-foreground">
                {convertedProject.workforce.map((w) => (
                  <div key={w.id} className="p-2 rounded bg-muted/40 flex justify-between items-center">
                    <span>{w.roleTitle} (참여율 {w.participationRate}%)</span>
                    {w.isHiringNeeded && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">
                        채용공고 초안 생성됨
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                외주 용역 RFP 초안 및 업체 비교표
              </h4>
              <div className="text-muted-foreground">
                {convertedProject.subcontracts.map((s) => (
                  <div key={s.id} className="p-2 rounded bg-muted/40 space-y-1">
                    <div className="font-semibold text-foreground">{s.taskTitle}</div>
                    <div className="text-[11px]">{s.vendorComparisonNotes}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
