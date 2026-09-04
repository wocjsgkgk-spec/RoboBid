import { ProviderAdapter } from "./types";
import { KonepsAdapter } from "./koneps-adapter";
import { KStartupAdapter } from "./k-startup-adapter";
import { BizinfoAdapter } from "./bizinfo-adapter";
import { SubsidyAdapter } from "./subsidy-adapter";
import { IrisAdapter } from "./iris-adapter";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private adapters: Map<string, ProviderAdapter> = new Map();

  private constructor() {
    this.register(new KonepsAdapter());
    this.register(new KStartupAdapter());
    this.register(new BizinfoAdapter());
    this.register(new SubsidyAdapter());
    this.register(new IrisAdapter());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public get(id: string): ProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAll(): ProviderAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export * from "./types";
export * from "./base-adapter";
export * from "./koneps-adapter";
export * from "./k-startup-adapter";
export * from "./bizinfo-adapter";
export * from "./subsidy-adapter";
export * from "./iris-adapter";
