import { Capability, CapabilityType } from "@/types/capability";

export interface CapabilityWithAlert extends Capability {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining?: number;
}

export class VaultManager {
  /**
   * Enriches capability records with expiration alert metadata.
   */
  public static enrichWithAlerts(
    capabilities: Capability[],
    currentDate: Date = new Date()
  ): CapabilityWithAlert[] {
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    return capabilities.map((cap) => {
      let isExpired = false;
      let isExpiringSoon = false;
      let daysRemaining: number | undefined;

      if (cap.validUntil) {
        const expiryDate = new Date(cap.validUntil);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        if (diffDays < 0) {
          isExpired = true;
        } else if (diffDays <= 30) {
          isExpiringSoon = true;
        }
      }

      return {
        ...cap,
        isExpired,
        isExpiringSoon,
        daysRemaining,
        verificationStatus: isExpired ? "EXPIRED" : cap.verificationStatus,
      };
    });
  }

  /**
   * Filter capabilities by specific asset type
   */
  public static filterByType(capabilities: Capability[], type: CapabilityType): Capability[] {
    return capabilities.filter((c) => c.type === type);
  }
}
