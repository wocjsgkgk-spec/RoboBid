import {
  ProjectRecord,
  ConvertProjectInput,
  ProjectMilestone,
  ProjectWorkforce,
  ProjectSubcontract,
} from '@/types/project';

export class ProjectConversionService {
  private memoryProjects: Map<string, ProjectRecord> = new Map();

  /**
   * 최종 선정된 공모를 실행 프로젝트로 전환 (Post-Award Project Conversion)
   * ※ 불변식: 자동 계약 체결 및 자동 채용 배제 (초안 생성 후 인간 결재 필수)
   */
  public convertToProject(input: ConvertProjectInput): ProjectRecord {
    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    const totalBudget = input.totalBudget || 500_000_000;
    const governmentGrant = input.governmentGrant ?? Math.round(totalBudget * 0.75);
    const privateContribution = input.privateContribution ?? (totalBudget - governmentGrant);

    // 1. WBS 마일스톤 생성
    const milestones: ProjectMilestone[] = [
      {
        id: crypto.randomUUID(),
        projectId,
        milestoneName: '1차년도: 시스템 상세 설계 및 부품 수급',
        phaseNumber: 1,
        targetDate: input.startDate || '2026-10-31',
        deliverables: ['시스템 요구사항 명세서(SRS)', '기구/회로 상세 설계도면'],
        status: 'PENDING',
      },
      {
        id: crypto.randomUUID(),
        projectId,
        milestoneName: '2차년도: 시제품 제작 및 단위 제어 모듈 검증',
        phaseNumber: 2,
        targetDate: '2027-04-30',
        deliverables: ['로봇 기구부 1차 시제품', '임베디드 제어 펌웨어 v1.0'],
        status: 'PENDING',
      },
      {
        id: crypto.randomUUID(),
        projectId,
        milestoneName: '3차년도: 공인시험성적서 획득 및 현장 실증',
        phaseNumber: 3,
        targetDate: '2027-10-31',
        deliverables: ['KOLAS 공인시험성적서', '수요처 현장 적용 실증 평가서'],
        status: 'PENDING',
      },
      {
        id: crypto.randomUUID(),
        projectId,
        milestoneName: '4차년도: 최종 감리 및 상용화 사업화',
        phaseNumber: 4,
        targetDate: input.endDate || '2028-04-30',
        deliverables: ['최종 연구개발 보고서', '지식재산권(특허) 출원 증빙'],
        status: 'PENDING',
      },
    ];

    // 2. 인력 계획 및 채용공고 초안 생성
    const workforce: ProjectWorkforce[] = [
      {
        id: crypto.randomUUID(),
        projectId,
        roleTitle: '총괄 연구책임자 (PM)',
        participationRate: 40,
        isHiringNeeded: false,
      },
      {
        id: crypto.randomUUID(),
        projectId,
        roleTitle: '로봇 기구/전장 설계 선임연구원',
        participationRate: 100,
        isHiringNeeded: false,
      },
      {
        id: crypto.randomUUID(),
        projectId,
        roleTitle: '자율주행/제어 SW 개발 엔지니어 (신규 채용)',
        participationRate: 100,
        isHiringNeeded: true,
        jobPostDraft: `[채용공고 초안]\n- 담당업무: 특수목적 로봇 ROS2 기반 자율주행 및 모터 제어 알고리즘 개발\n- 자격요건: C++/Python 능숙자, 로봇 관련 학과 학사 이상 또는 2년 이상 경력자\n- 우대사항: 국책 R&D 프로젝트 참여 경험자\n- 급여 및 처우: 정부 R&D 인건비 기준 책정 (협의 가능)`,
      },
    ];

    // 3. 외주 용역 RFP 초안 및 업체 비교표 생성
    const subcontracts: ProjectSubcontract[] = [
      {
        id: crypto.randomUUID(),
        projectId,
        taskTitle: '로봇 프레임 정밀 5축 CNC 가공 및 아노다이징 표면처리',
        estimatedCost: Math.round(totalBudget * 0.12),
        rfpDraft: `[외주 용역 제안요청서(RFP) 초안]\n1. 용역명: ${input.name} 기구 프레임 정밀 가공\n2. 규격: AL6061-T6, 치수 공차 ±0.02mm 이내\n3. 납기: 발주 후 30일 이내\n4. 납품처: 당사 로봇 연구소\n5. 필수 제출서류: 3차원 측정 성적서, 원자재 밀시트`,
        vendorComparisonNotes: '후보업체 A사(납기 3주, 견적 적정), B사(단가 우수하나 공차 품질 확인 요망)',
      },
    ];

    const project: ProjectRecord = {
      id: projectId,
      organizationId: input.organizationId,
      opportunityId: input.opportunityId,
      proposalId: input.proposalId || null,
      name: input.name,
      status: 'PLANNING',
      totalBudget,
      governmentGrant,
      privateContribution,
      startDate: input.startDate || '2026-10-01',
      endDate: input.endDate || '2028-04-30',
      managingAgency: input.managingAgency || '전담기관',
      milestones,
      workforce,
      subcontracts,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryProjects.set(projectId, project);
    return project;
  }

  public getProject(id: string): ProjectRecord | null {
    return this.memoryProjects.get(id) || null;
  }

  public listProjects(organizationId: string): ProjectRecord[] {
    const list: ProjectRecord[] = [];
    for (const p of this.memoryProjects.values()) {
      if (p.organizationId === organizationId) {
        list.push(p);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public clearMemory(): void {
    this.memoryProjects.clear();
  }
}

export const projectConversionService = new ProjectConversionService();
