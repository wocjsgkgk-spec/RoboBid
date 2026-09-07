"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Application360Workspace } from "@/components/applications/application-360-workspace";
import { Opportunity, ProjectConcept, MasterSpecification } from "@/types";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { conceptStore } from "@/lib/concepts/concept-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ApplicationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [concept, setConcept] = useState<ProjectConcept | null>(null);
  const [spec, setSpec] = useState<MasterSpecification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        // 1. Opportunity
        let opp = opportunityStore.getById(id);
        if (!opp) {
          const res = await fetch(`/api/opportunities`);
          if (res.ok) {
            const data = await res.json();
            opp = (data.opportunities || []).find((o: Opportunity) => o.id === id);
          }
        }

        if (opp) {
          setOpportunity(opp);
          // 2. Project Concept (linked or default AMR)
          const conceptId = opp.projectConceptId || "c001-amr-logistics-robot";
          const matchedConcept = conceptStore.getById(conceptId) || conceptStore.getAll()[0];
          if (matchedConcept) {
            setConcept(matchedConcept);
            const masterSpec = conceptStore.getMasterSpec(matchedConcept.id) || null;
            setSpec(masterSpec);
          }
        }
      } catch (e) {
        console.error("Failed to load application workspace data:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Application Workspace 로딩 중...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">해당 공고 또는 지원사업을 찾을 수 없습니다.</h3>
        <p className="text-xs text-muted-foreground">ID: {id}</p>
        <Button size="sm" onClick={() => router.push("/opportunities")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          지원기회 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <Application360Workspace
        opportunity={opportunity}
        concept={concept}
        spec={spec}
        onBack={() => router.back()}
      />
    </div>
  );
}
