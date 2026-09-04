import { NextRequest, NextResponse } from "next/server";
import { AGENCY_TEMPLATES, PublicAgencyType } from "@/lib/proposals/agency-templates";
import { AgencyEvaluationService } from "@/lib/scoring/agency-evaluation-criteria";
import { vaultStore } from "@/lib/vault/vault-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agency = searchParams.get("agency") as PublicAgencyType | null;

  const capabilities = vaultStore.getAll();

  if (agency && AGENCY_TEMPLATES[agency]) {
    const template = AGENCY_TEMPLATES[agency];
    const evaluation = AgencyEvaluationService.evaluateAgencyBonus(agency, capabilities);
    return NextResponse.json({
      template,
      evaluation,
    });
  }

  // Return all templates summary with evaluation
  const allTemplates = Object.values(AGENCY_TEMPLATES).map((tmpl) => {
    const evalResult = AgencyEvaluationService.evaluateAgencyBonus(tmpl.agencyType, capabilities);
    return {
      ...tmpl,
      evaluation: evalResult,
    };
  });

  return NextResponse.json({
    templates: allTemplates,
  });
}
