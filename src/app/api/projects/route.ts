import { NextRequest, NextResponse } from 'next/server';
import { projectConversionService } from '@/lib/projects/project-conversion-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') || 'org-robobid-default';

  try {
    const projects = projectConversionService.listProjects(orgId);
    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId = 'org-robobid-default',
      opportunityId,
      proposalId,
      name,
      totalBudget,
      governmentGrant,
      privateContribution,
      startDate,
      endDate,
      managingAgency,
    } = body;

    if (!opportunityId || !name) {
      return NextResponse.json(
        { error: 'opportunityId and name are required to convert to project' },
        { status: 400 }
      );
    }

    const project = projectConversionService.convertToProject({
      organizationId,
      opportunityId,
      proposalId,
      name,
      totalBudget: totalBudget || 500_000_000,
      governmentGrant,
      privateContribution,
      startDate,
      endDate,
      managingAgency,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
