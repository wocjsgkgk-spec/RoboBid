import { DerivedDocument } from "@/types/derivation";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { DocumentDerivationService } from "./document-derivation-service";

declare global {
  // eslint-disable-next-line no-var
  var __derivationStore: DerivationStore | undefined;
}

export class DerivationStore {
  private static instance: DerivationStore;
  private documents: Map<string, DerivedDocument> = new Map();

  private constructor() {
    this.restoreFromStorage();
  }

  public static getInstance(): DerivationStore {
    if (typeof window !== "undefined") {
      if (!DerivationStore.instance) {
        DerivationStore.instance = new DerivationStore();
      }
      return DerivationStore.instance;
    }

    if (!global.__derivationStore) {
      global.__derivationStore = new DerivationStore();
    }
    return global.__derivationStore;
  }

  public seedInitialDerivations(): void {
    try {
      const conceptStore = ProjectConceptStore.getInstance();
      const amrConcept = conceptStore.getById("c001-amr-logistics-robot");
      const amrSpec = conceptStore.getMasterSpec("c001-amr-logistics-robot");

      if (amrConcept && amrSpec) {
        // 1. 외주 RFP 생성 및 승인 시드
        const rfpDoc = DocumentDerivationService.derive(amrConcept, amrSpec, {
          projectConceptId: amrConcept.id,
          category: "OUTSOURCING",
          documentType: "OUTSOURCING_RFP",
        });
        const approvedRfp = DocumentDerivationService.approve(rfpDoc, {
          approvedBy: "김수석 PM",
          approvalNotes: "외주 발주 배포를 위해 사내 직접비 및 원가 마스킹 검토 완료",
        });
        this.documents.set(approvedRfp.id, approvedRfp);

        // 2. 정부 R&D 계획서 시드
        const rndDoc = DocumentDerivationService.derive(amrConcept, amrSpec, {
          projectConceptId: amrConcept.id,
          category: "GOVERNMENT",
          documentType: "GOV_RND_PLAN",
        });
        this.documents.set(rndDoc.id, rndDoc);
      }
    } catch {
      // ignore in tests if conceptStore is not yet populated
    }
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const serialized = JSON.stringify(Array.from(this.documents.values()));
        window.localStorage.setItem("robobid_v3_derived_documents", serialized);
      } catch (err) {
        console.error("Failed to save derived documents to localStorage", err);
      }
    }
  }

  private restoreFromStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem("robobid_v3_derived_documents");
        if (raw) {
          const list: DerivedDocument[] = JSON.parse(raw);
          list.forEach((doc) => this.documents.set(doc.id, doc));
        }
      } catch (err) {
        console.error("Failed to restore derived documents from localStorage", err);
      }
    }
  }

  public getDocumentsByConcept(conceptId: string): DerivedDocument[] {
    return Array.from(this.documents.values())
      .filter((doc) => doc.projectConceptId === conceptId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getDocumentById(id: string): DerivedDocument | undefined {
    return this.documents.get(id);
  }

  public saveDocument(doc: DerivedDocument): DerivedDocument {
    this.documents.set(doc.id, doc);
    this.saveToStorage();
    return doc;
  }

  public deleteDocument(id: string): boolean {
    const deleted = this.documents.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  public clear(): void {
    this.documents.clear();
    this.saveToStorage();
  }
}
