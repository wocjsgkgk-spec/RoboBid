import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { SAMPLE_OPPORTUNITIES } from "../today/sample-scenarios";

export class TaskStore {
  private static instance: TaskStore;
  private tasks: Map<string, Task> = new Map();

  private constructor() {
    this.seedDefault();
  }

  public static getInstance(): TaskStore {
    if (!TaskStore.instance) {
      TaskStore.instance = new TaskStore();
    }
    return TaskStore.instance;
  }

  public seedDefault(): void {
    this.tasks.clear();
    const defaults: Task[] = [
      {
        id: "task-01",
        title: "중소기업확인서 및 이노비즈 인증서 갱신본 발급 확인",
        description: "조달청 적격심사 신인도 가점(+1.5점) 제출용 최신본 출력",
        opportunityId: SAMPLE_OPPORTUNITIES[0]?.id || "opp-koneps-agv-001",
        opportunityTitle: "2026 공공 물류창고 자율이동로봇(AGV) 도입 실증사업",
        assignee: "김수석 (사업개발팀)",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        priority: "URGENT",
        status: "TODO",
        category: "EVIDENCE_SUBMISSION",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "task-02",
        title: "스마트공장 R&D 주관-참여기관 간 역할분담 및 WBS 3.1 작성",
        description: "로봇연구소 TRL 7단계 실증 데이터 기반 시스템 블록도 완성",
        opportunityId: SAMPLE_OPPORTUNITIES[1]?.id || "opp-tipa-rnd-002",
        opportunityTitle: "2026 스마트공장 자율제어 AGV 로봇 고도화 R&D",
        assignee: "이책임 (로봇연구소)",
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
        priority: "HIGH",
        status: "IN_PROGRESS",
        category: "PROPOSAL_DRAFT",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "task-03",
        title: "나라장터 사전규격 공개의견 검토 및 실격 리스크 크로스체크",
        description: "특정 제조사 규격 의존 여부 및 필수 인증 규격 사전 검토",
        opportunityId: SAMPLE_OPPORTUNITIES[0]?.id || "opp-koneps-agv-001",
        opportunityTitle: "2026 공공 물류창고 자율이동로봇(AGV) 도입 실증사업",
        assignee: "최법무 (규정준수팀)",
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        priority: "HIGH",
        status: "REVIEW",
        category: "RFP_REVIEW",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "task-04",
        title: "수요기업 매칭 협약서 초안 법인인감 날인 확인",
        description: "NIPA AI 바우처 사업 공급-수요기업 협약 확약서 서명",
        opportunityId: SAMPLE_OPPORTUNITIES[2]?.id || "opp-nipa-ai-003",
        opportunityTitle: "2026년도 AI 바우처 지원사업(로봇 AI 솔루션 공급)",
        assignee: "박선임 (전략기획팀)",
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        priority: "MEDIUM",
        status: "TODO",
        category: "LEGAL_SIGN",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "task-05",
        title: "신용평가등급확인서(조달청 제출용) 공공기관 전송 확인",
        description: "나이스디앤비 기업신용평가 BBB+ 조달청 나라장터 연계 완료",
        opportunityId: SAMPLE_OPPORTUNITIES[0]?.id || "opp-koneps-agv-001",
        opportunityTitle: "2026 공공 물류창고 자율이동로봇(AGV) 도입 실증사업",
        assignee: "정재무 (재무관리팀)",
        dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
        priority: "URGENT",
        status: "DONE",
        category: "ELIGIBILITY",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const t of defaults) {
      this.tasks.set(t.id, t);
    }
  }

  public getAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public getByOpportunityId(opportunityId: string): Task[] {
    return this.getAll().filter((t) => t.opportunityId === opportunityId);
  }

  public updateStatus(id: string, status: TaskStatus): Task {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    task.status = status;
    task.updatedAt = new Date().toISOString();
    this.tasks.set(id, task);
    return task;
  }

  public create(taskInput: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  public delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}

export const taskStore = TaskStore.getInstance();
