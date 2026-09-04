import { NextResponse } from "next/server";
import { ProviderRegistry } from "@/lib/providers";

export async function GET() {
  const registry = ProviderRegistry.getInstance();
  const providers = registry.getAll();

  const statuses = await Promise.all(
    providers.map(async (adapter) => {
      const health = await adapter.checkHealth();
      return {
        id: adapter.id,
        name: adapter.name,
        sourceUrl: adapter.sourceUrl,
        defaultBidType: adapter.defaultBidType,
        status: health.status,
        message: health.message,
        latencyMs: health.latencyMs,
        lastCheckedAt: health.lastCheckedAt,
      };
    })
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    providers: statuses,
  });
}
