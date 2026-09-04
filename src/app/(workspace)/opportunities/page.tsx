"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Layers, ExternalLink, RefreshCw, Calendar, Building, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/sonner-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OpportunityItem {
  id: string;
  sourceId: string;
  providerId: string;
  title: string;
  announcingAgency: string;
  demandingAgency?: string;
  bidType: string;
  primaryDomain: string;
  allocatedBudget?: number;
  submissionDeadline: string;
  canonicalUrl?: string;
  status: string;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedProvider !== "ALL") params.set("provider", selectedProvider);
      if (selectedType !== "ALL") params.set("bidType", selectedType);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedProvider, selectedType]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/ingestion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("공공데이터 수집 완료", {
          description: "새로운 공모 파이프라인 목록이 업데이트되었습니다.",
        });
      } else {
        toast.info("수집 안내", {
          description: data.result?.errorMessage || "동기화가 완료되었습니다.",
        });
      }
      fetchOpportunities();
    } catch (err: any) {
      toast.error("동기화 실패", { description: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            공모 파이프라인 (Opportunities)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            나라장터, K-Startup, 기업마당 등 공식 공공데이터 포털에서 수집된 공모를 통합 탐색합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "수집 동기화 중..." : "공공데이터 수집 동기화"}</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOpportunities()}
            placeholder="공고명, 수요기관, 키워드(로봇, 자율주행, 스마트팜 등) 검색 후 엔터..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Provider Filter */}
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="text-xs bg-background border rounded-md px-3 py-2 w-full md:w-auto"
        >
          <option value="ALL">전체 Provider</option>
          <option value="koneps">조달청 나라장터</option>
          <option value="k_startup">K-Startup</option>
          <option value="bizinfo">기업마당</option>
          <option value="subsidy">국고보조금</option>
          <option value="iris">IRIS (R&D)</option>
        </select>

        {/* Bid Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs bg-background border rounded-md px-3 py-2 w-full md:w-auto"
        >
          <option value="ALL">전체 사업유형</option>
          <option value="PROCUREMENT">구매/조달</option>
          <option value="SERVICE">용역</option>
          <option value="SUBSIDY_SUPPORT">지원사업/보조금</option>
          <option value="DEMONSTRATION">실증</option>
          <option value="R_AND_D">R&D</option>
        </select>

        <Button size="sm" onClick={fetchOpportunities} className="shrink-0 w-full md:w-auto">
          검색
        </Button>
      </div>

      {/* Opportunities List or Empty State */}
      {opportunities.length === 0 ? (
        <div className="rounded-lg border bg-card shadow-sm p-6">
          <EmptyState
            icon={Layers}
            title="조건에 부합하는 공모가 없습니다"
            description="공공데이터포털 API Key 등록 후 [공공데이터 수집 동기화]를 실행하면 실제 공고가 자동으로 수집되어 표시됩니다. (임의 샘플 데이터 생성 없음)"
            actionLabel={isSyncing ? "동기화 중..." : "지금 공공데이터 수집 실행"}
            onAction={handleManualSync}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b">
                <tr>
                  <th className="px-4 py-3">공고명 / 기관</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">사업유형</th>
                  <th className="px-4 py-3">도메인</th>
                  <th className="px-4 py-3">예산/추정가격</th>
                  <th className="px-4 py-3">마감일시</th>
                  <th className="px-4 py-3 text-center">원문</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{opp.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Building className="h-3 w-3" />
                        <span>{opp.announcingAgency}</span>
                        {opp.demandingAgency && opp.demandingAgency !== opp.announcingAgency && (
                          <span>({opp.demandingAgency})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {opp.providerId}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">{opp.bidType}</td>
                    <td className="px-4 py-3">
                      <Badge variant={opp.primaryDomain === "ROBOT" ? "default" : "secondary"} className="text-xs">
                        {opp.primaryDomain}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {formatCurrency(opp.allocatedBudget)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(opp.submissionDeadline)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {opp.canonicalUrl && (
                        <a
                          href={opp.canonicalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
