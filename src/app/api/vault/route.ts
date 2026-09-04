import { NextRequest, NextResponse } from "next/server";
import { vaultStore } from "@/lib/vault/vault-store";
import { Capability } from "@/types/capability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let enriched = vaultStore.getAllEnriched();
  if (type) {
    enriched = enriched.filter((c) => c.type === type);
  }

  return NextResponse.json({
    capabilities: enriched,
    totalCount: enriched.length,
    expiringCount: enriched.filter((c) => c.isExpiringSoon).length,
    expiredCount: enriched.filter((c) => c.isExpired).length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a seed request
    if (body.action === "SEED_DEFAULT") {
      vaultStore.seedDefault();
      const enriched = vaultStore.getAllEnriched();
      return NextResponse.json({
        success: true,
        message: "표준 사내 역량 자산(13건)이 성공적으로 적재되었습니다.",
        capabilities: enriched,
      });
    }

    const newCap: Capability = {
      id: body.id || `cap-${Date.now()}`,
      organizationId: body.organizationId || "123e4567-e89b-12d3-a456-426614174000",
      type: body.type,
      title: body.title,
      description: body.description,
      metadata: body.metadata || {},
      validFrom: body.validFrom,
      validUntil: body.validUntil,
      verificationStatus: body.verificationStatus || "VERIFIED",
      confidentiality: body.confidentiality || "CONFIDENTIAL",
      evidenceStoragePath: body.evidenceStoragePath,
      evidenceFileName: body.evidenceFileName,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vaultStore.save(newCap);

    return NextResponse.json({
      success: true,
      capability: newCap,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "삭제할 역량 ID가 필요합니다." },
      { status: 400 }
    );
  }

  const success = vaultStore.delete(id);
  return NextResponse.json({ success, deletedId: id });
}
