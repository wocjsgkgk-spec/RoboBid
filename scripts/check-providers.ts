import { ProviderRegistry } from "../src/lib/providers";

async function main() {
  console.log("==================================================================");
  console.log("🔍 RoboBid AI — 공공데이터 Provider Live 동기화 & 헬스체크 진단");
  console.log("==================================================================\n");

  const registry = ProviderRegistry.getInstance();
  const providers = registry.getAll();

  console.log(`등록된 Provider 어댑터: 총 ${providers.length}개\n`);

  for (const provider of providers) {
    process.stdout.write(`[검사 중] ${provider.name} (${provider.id})... `);
    try {
      const health = await provider.checkHealth();
      const statusIcon =
        health.status === "CONNECTED"
          ? "✅ CONNECTED"
          : health.status === "KEY_MISSING"
          ? "⚠️  KEY_MISSING"
          : health.status === "RATE_LIMITED"
          ? "⏳ RATE_LIMITED"
          : health.status === "MANUAL_ONLY"
          ? "ℹ️  MANUAL_ONLY"
          : "❌ FAILED";

      console.log(`${statusIcon} (${health.latencyMs ?? 0}ms)`);
      if (health.message) {
        console.log(`   └─ 안내: ${health.message}`);
      }
    } catch (err: any) {
      console.log(`❌ ERROR: ${err.message}`);
    }
  }

  console.log("\n==================================================================");
  console.log("💡 안내: 키가 미설정된 Provider는 .env.local 파일에 키를 입력하시면");
  console.log("   즉시 실시간 수집 및 헬스체크가 활성화됩니다.");
  console.log("==================================================================");
}

main().catch(console.error);
