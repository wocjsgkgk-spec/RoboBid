import { DevelopmentProject, AwardTransitionInput } from "@/types/award";
import { AwardTransitionService } from "./award-transition-service";

declare global {
  // eslint-disable-next-line no-var
  var __awardStore: AwardStore | undefined;
}

export class AwardStore {
  private static instance: AwardStore;
  private projects: Map<string, DevelopmentProject> = new Map();

  private constructor() {
    this.restoreFromStorage();
    if (this.projects.size === 0) {
      this.seedInitialAwardedProjects();
    }
  }

  public static getInstance(): AwardStore {
    if (typeof window !== "undefined") {
      if (!AwardStore.instance) {
        AwardStore.instance = new AwardStore();
      }
      return AwardStore.instance;
    }

    if (!global.__awardStore) {
      global.__awardStore = new AwardStore();
    }
    return global.__awardStore;
  }

  private seedInitialAwardedProjects(): void {
    try {
      const defaultAward = AwardTransitionService.transitionToDevelopmentProject({
        opportunityId: "opp-amr-tipa-2026",
        projectConceptId: "c001-amr-logistics-robot",
        name: "물류창고용 고중량 500kg 자율주행 협동 AMR 로봇 실증 개발",
        awardAmount: 600_000_000,
        totalBudget: 800_000_000,
        managingAgency: "중소기업기술정보진흥원 (TIPA)",
      });
      this.projects.set(defaultAward.id, defaultAward);
    } catch {
      // ignore during initialization if concept store is not ready
    }
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const serialized = JSON.stringify(Array.from(this.projects.values()));
        window.localStorage.setItem("robobid_v3_awarded_projects", serialized);
      } catch (err) {
        console.error("Failed to save awarded projects to localStorage", err);
      }
    }
  }

  private restoreFromStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem("robobid_v3_awarded_projects");
        if (raw) {
          const list: DevelopmentProject[] = JSON.parse(raw);
          list.forEach((p) => this.projects.set(p.id, p));
        }
      } catch (err) {
        console.error("Failed to restore awarded projects from localStorage", err);
      }
    }
  }

  public getAll(): DevelopmentProject[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): DevelopmentProject | undefined {
    return this.projects.get(id);
  }

  public getByOpportunityId(oppId: string): DevelopmentProject | undefined {
    return Array.from(this.projects.values()).find((p) => p.opportunityId === oppId);
  }

  public save(project: DevelopmentProject): DevelopmentProject {
    this.projects.set(project.id, project);
    this.saveToStorage();
    return project;
  }

  public delete(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  public clear(): void {
    this.projects.clear();
    this.saveToStorage();
  }
}
