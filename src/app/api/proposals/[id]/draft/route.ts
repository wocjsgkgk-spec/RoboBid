import { NextRequest, NextResponse } from 'next/server';
import { proposalService } from '@/lib/proposals/proposal-service';
import { vaultStore } from '@/lib/vault/vault-store';
import { CapabilityRecord, Opportunity, RequirementCandidate } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { opportunity, capabilities, requirements, sectionCode } = body;

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity data is required for RAG drafting' },
        { status: 400 }
      );
    }

    const caps =
      capabilities && capabilities.length > 0
        ? (capabilities as CapabilityRecord[])
        : vaultStore.getAll();

    const sections = proposalService.generateDraft(
      params.id,
      opportunity as Opportunity,
      caps,
      (requirements || []) as RequirementCandidate[],
      sectionCode
    );

    return NextResponse.json({
      success: true,
      sections,
      message: 'Draft generated successfully with Evidence citations.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
