import { Capability, CapabilityType } from "@/types/capability";
import { STANDARD_CAPABILITIES_SEED } from "./standard-capabilities-seed";
import { VaultManager, CapabilityWithAlert } from "./vault-manager";

class VaultStore {
  private static instance: VaultStore;
  private capabilities: Map<string, Capability> = new Map();

  private constructor() {
    // Initialize with standard capability seed data
    this.seedDefault();
  }

  public static getInstance(): VaultStore {
    if (!VaultStore.instance) {
      VaultStore.instance = new VaultStore();
    }
    return VaultStore.instance;
  }

  public seedDefault(): void {
    this.capabilities.clear();
    for (const cap of STANDARD_CAPABILITIES_SEED) {
      this.capabilities.set(cap.id, { ...cap });
    }
  }

  public getAll(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  public getAllEnriched(currentDate?: Date): CapabilityWithAlert[] {
    return VaultManager.enrichWithAlerts(this.getAll(), currentDate);
  }

  public getById(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  public getByType(type: CapabilityType): Capability[] {
    return this.getAll().filter((c) => c.type === type);
  }

  public save(cap: Capability): Capability {
    const updated: Capability = {
      ...cap,
      updatedAt: new Date().toISOString(),
    };
    this.capabilities.set(updated.id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    return this.capabilities.delete(id);
  }

  public count(): number {
    return this.capabilities.size;
  }
}

export const vaultStore = VaultStore.getInstance();
