import { NextRequest, NextResponse } from 'next/server';
import { submissionService } from '@/lib/compliance/submission-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { submitterName, finalFileName, finalFileHash, submissionUrl, submissionNotes } = body;

    if (!submitterName || !finalFileName || !finalFileHash) {
      return NextResponse.json(
        { error: 'submitterName, finalFileName, and finalFileHash are required for confirmation' },
        { status: 400 }
      );
    }

    const result = submissionService.confirmSubmission({
      proposalId: params.id,
      submitterName,
      finalFileName,
      finalFileHash,
      submissionUrl,
      submissionNotes,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      submittedAt: result.submittedAt,
      message: 'Human-in-the-loop: Official proposal submission successfully confirmed and logged.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
