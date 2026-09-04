import { NextRequest, NextResponse } from 'next/server';
import { proposalService } from '@/lib/proposals/proposal-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = proposalService.getProposal(params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    return NextResponse.json({ proposal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { sectionCode, contentMarkdown, status } = body;

    if (!sectionCode || contentMarkdown === undefined) {
      return NextResponse.json(
        { error: 'sectionCode and contentMarkdown are required' },
        { status: 400 }
      );
    }

    const updatedSection = proposalService.updateSection(
      params.id,
      sectionCode,
      contentMarkdown,
      status
    );

    return NextResponse.json({ section: updatedSection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
