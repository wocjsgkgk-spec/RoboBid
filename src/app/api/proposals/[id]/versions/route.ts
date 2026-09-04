import { NextRequest, NextResponse } from 'next/server';
import { proposalService } from '@/lib/proposals/proposal-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = proposalService.getVersions(params.id);
    return NextResponse.json({ versions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { changeSummary, userId } = body;

    const snapshot = proposalService.createVersionSnapshot(
      params.id,
      changeSummary || '수동 버전 스냅샷 생성',
      userId
    );

    return NextResponse.json({
      success: true,
      snapshot,
      message: `Version ${snapshot.versionNumber} snapshot created successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
