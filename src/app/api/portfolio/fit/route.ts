import { NextRequest, NextResponse } from "next/server";
import { FundingFitService } from "@/lib/funding/funding-fit-service";
import { conceptStore } from "@/lib/concepts/concept-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectConceptId, customBudget, opportunityId, customTerms } = body;

    let budgetInput = customBudget;
    let spec = null;

    if (projectConceptId) {
      const concept = conceptStore.getById(projectConceptId);
      if (concept) {
        spec = conceptStore.getMasterSpec(projectConceptId) || null;
        if (!budgetInput) {
          budgetInput = concept;
        }
      }
    }

    if (!budgetInput) {
      // Default fallback budget
      budgetInput = {
        LABOR: 320_000_000,
        MATERIALS: 64_000_000,
        PARTS: 144_000_000,
        EQUIPMENT: 64_000_000,
        OUTSOURCING: 96_000_000,
        VALIDATION: 32_000_000,
        SW_SERVER: 24_000_000,
        MARKETING: 16_000_000,
        CERTIFICATION: 16_000_000,
        OTHER: 24_000_000,
      };
    }

    let termsInput = customTerms;
    if (opportunityId && !termsInput) {
      const opp = opportunityStore.getById(opportunityId);
      if (opp) {
        termsInput = opp;
      }
    }

    if (!termsInput) {
      termsInput = FundingFitService.getDefaultFundingTerms();
    }

    const fitResult = FundingFitService.calculateFit(budgetInput, termsInput, spec);

    return NextResponse.json({
      success: true,
      fitResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate funding fit" },
      { status: 500 }
    );
  }
}
