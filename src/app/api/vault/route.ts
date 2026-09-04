import { NextRequest, NextResponse } from "next/server";
import { VaultManager } from "@/lib/vault/vault-manager";
import { Capability } from "@/types/capability";

// In-memory store for development/testing when Supabase is disconnected
let inMemoryCapabilities: Capability[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let list = inMemoryCapabilities;
  if (type) {
    list = list.filter((c) => c.type === type);
  }

  const enriched = VaultManager.enrichWithAlerts(list);

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryCapabilities.push(newCap);

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
