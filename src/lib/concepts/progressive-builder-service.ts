/**
 * RoboBid AI v3.0 — Progressive AI Builder Service
 * Idea → Problem → Product → Technical → TRL/KPI → WBS/Budget → BOM → Funding → Validation → Outsourcing → Market → Master Spec
 * 핵심 원칙: AI는 원본을 자동 덮어쓰지 않고 Suggestion → Diff → Approval → Version 워크플로우를 보장함.
 */

import {
  ProjectConcept,
  MasterSpecification,
  ProgressiveBuilderStep,
  BuilderStepSuggestion,
  FieldDiff,
} from "@/types";

export class ProgressiveBuilderService {
  /**
   * 단계별 AI 제안 및 변경사항(Diff) 생성
   */
  public static generateStepSuggestion(
    concept: ProjectConcept,
    currentSpec: MasterSpecification | undefined,
    step: ProgressiveBuilderStep
  ): BuilderStepSuggestion {
    const robotName = concept.name;

    switch (step) {
      case "PROBLEM":
        return {
          step: "PROBLEM",
          stepTitle: "1단계: 문제 정의 및 타깃 고객 구체화",
          summary: `${robotName} 도입을 통해 해결하고자 하는 핵심 산업 통증점과 목표 고객층을 정밀 정의합니다.`,
          diffs: [
            {
              field: "problemStatement",
              label: "해결하고자 하는 문제 (Problem)",
              current: concept.problemStatement || "(미입력)",
              suggested: `${robotName} 적용 분야의 숙련 인력 부족, 야간/위험 작업 환경의 안전사고 위험, 그리고 수작업 공정의 오차율 및 생산성 정체 문제 해소`,
              reasoning: "정부 R&D 및 정책자금 심사위원단이 요구하는 '기술개발의 시의성 및 당위성'을 충족하기 위한 정량적 통증점 정의입니다.",
            },
            {
              field: "targetUser",
              label: "타깃 고객 / 수요처 (Target User)",
              current: concept.targetUser || "(미입력)",
              suggested: "제조 중소·중견기업 공정 라인, 대형 물류 풀필먼트 센터 및 공공 인프라 시설 관리 부서",
              reasoning: "초기 도입처(Early Adopter)와 확장 시장(Scale-up Market)을 분리 제시하여 사업화 타당성을 입증합니다.",
            },
          ],
        };

      case "PRODUCT":
        return {
          step: "PRODUCT",
          stepTitle: "2단계: 제품 콘셉트 및 운용 환경 구체화",
          summary: "로봇의 폼팩터, 핵심 기능, 그리고 실제 투입될 물리적 환경 조건을 수립합니다.",
          diffs: [
            {
              field: "productConcept",
              label: "제품 콘셉트 (Product Concept)",
              current: concept.productConcept || "(미입력)",
              suggested: `비정형 복합 환경에서 자율 라우팅 및 정밀 객체 핸들링을 수행하는 차세대 지능형 ${robotName} 솔루션`,
              reasoning: "시장 기존 제품 대비 차별화 포인트(지능화, 협동, 안전성)를 부각하는 제품 정의입니다.",
            },
            {
              field: "targetEnvironment",
              label: "운용 환경 사양 (Target Environment)",
              current: currentSpec?.targetEnvironment || "실내외 자율주행 및 작업환경",
              suggested: "실내 공장 바닥(평탄도 ±5mm, 조도 50~1000 Lux), 0℃~40℃ 동작 범위, Wi-Fi 6 및 5G 프라이빗망 지원 환경",
              reasoning: "실증 평가 및 공인시험인증 규격(KOLAS, CE/KC)을 통과하기 위한 물리적 환경 경계조건 설정입니다.",
            },
          ],
        };

      case "TECHNICAL":
        return {
          step: "TECHNICAL",
          stepTitle: "3단계: 기술 아키텍처, AI 및 센서 통신 사양",
          summary: "하드웨어 및 임베디드 소프트웨어 스택, 비전 AI 모델, 센서 구성을 설계합니다.",
          diffs: [
            {
              field: "technicalConcept",
              label: "기술 콘셉트 (Technical Concept)",
              current: concept.technicalConcept || "(미입력)",
              suggested: "ROS2 기반 실시간 제어 분산 아키텍처, 멀티모달 센서 퓨전 SLAM, 엣지 AI 기반 3D 비전 객체 인식 및 고신뢰성 구동 제어",
              reasoning: "과제 신청서 작성 시 TRL 7~8 달성에 필요한 핵심 기술요소를 명확히 분별합니다.",
            },
            {
              field: "aiModelSpec",
              label: "AI 및 임베디드 알고리즘",
              current: currentSpec?.aiModelSpec || "(미설정)",
              suggested: "TensorRT 최적화 YOLO-v9 기반 엣지 객체 추론 (<15ms), EKF-SLAM 및 장애물 회피 강화학습 로컬 플래너",
              reasoning: "임베디드 GPU(Nvidia Jetson Orin급) 상에서 실시간 처리를 보장하는 최신 AI 파이프라인 제시입니다.",
            },
            {
              field: "sensorsAndComms",
              label: "센서 및 통신 인터페이스",
              current: (currentSpec?.sensorsAndComms || []).join(", ") || "(미설정)",
              suggested: "3D LiDAR (32ch), Depth Camera (RGB-D 2기), IMU 9축, 초음파 센서 8ch, 안전 범퍼, CAN FD, ROS2 DDS, Wi-Fi 6",
              reasoning: "ISO 3691-4 무인운반차 안전 규격 충족을 위한 세이프티 센서 및 고속 제어 버스 구성입니다.",
            },
          ],
        };

      case "TRL_KPI":
        return {
          step: "TRL_KPI",
          stepTitle: "4단계: TRL 목표 및 정량적 성능지표(KPI)",
          summary: "정부 및 벤처캐피털이 요구하는 공인인증 가능 정량적 KPI와 TRL 달성 로드맵을 설정합니다.",
          diffs: [
            {
              field: "targetTrl",
              label: "목표 TRL (기술성숙도)",
              current: String(concept.targetTrl || 4),
              suggested: "7",
              reasoning: "과제 종료 시점 '실제 환경에서의 시제품 성능 검증(TRL 7)'을 달성하여 즉각적인 양산/사업화로 전환하도록 설계합니다.",
            },
            {
              field: "kpis",
              label: "정량적 성능지표 (KPI 목표치 및 평가방법)",
              current: (currentSpec?.kpis || []).map((k) => `${k.metricName}: ${k.targetValue}`).join(", ") || "(미설정)",
              suggested: "위치인식 정밀도 (±10mm, 공인시험성적서), 최대주행속도 (1.8m/s, 공인시험성적서), 연속가동시간 (8시간 이상, 실환경 테스트), 장애물회피반응 (0.2초 이하, 시험성적서)",
              reasoning: "KOLAS 공인시험기관(KTL, KTR, 전자부품연구원 등)에서 공인성적서 발급이 가능한 신뢰성 지표로 구성합니다.",
            },
          ],
        };

      case "WBS_BUDGET":
        return {
          step: "WBS_BUDGET",
          stepTitle: "5단계: 개발 WBS 및 소요 예산 구조화",
          summary: "12~24개월 기준 마일스톤 WBS 및 정부지원금 규정에 부합하는 비목별 예산을 산출합니다.",
          diffs: [
            {
              field: "wbsSummary",
              label: "개발 마일스톤 (WBS Summary)",
              current: (currentSpec?.wbsSummary || []).join(" ➔ ") || "(미설정)",
              suggested: "M1: 시스템 요구사항 및 기구/전장 설계(1~3월) ➔ M2: 로봇 하드웨어 프로토타입 제작(4~7월) ➔ M3: SLAM/제어 SW 통합 및 가상 시뮬레이션(8~11월) ➔ M4: 실증 사이트 현장 PoC 및 공인인증(12~15월)",
              reasoning: "연구개발과제 및 바우처 사업의 분기별 진도점검 평가 기준에 최적화된 마일스톤입니다.",
            },
            {
              field: "budgetBreakdown",
              label: "비목별 예산 계획 (직접비/인건비/외주비/간접비)",
              current: JSON.stringify(currentSpec?.budgetBreakdown || {}),
              suggested: "총예산 5억원 기준 [인건비: 2.2억원 (44%), 연구시설/재료직접비: 1.5억원 (30%), 연구활동/위탁용역비: 0.8억원 (16%), 간접비: 0.5억원 (10%)]",
              reasoning: "국가연구개발혁신법 기준 비목 가이드라인 및 인건비/외주비 적정 비율을 준수합니다.",
            },
          ],
        };

      case "BOM":
        return {
          step: "BOM",
          stepTitle: "6단계: 하드웨어 BOM(부품명세서) 및 원가 추정",
          summary: "양산성 및 원가 절감을 고려한 핵심 기구/전장/센서 모듈 BOM을 구성합니다.",
          diffs: [
            {
              field: "bomEstimate",
              label: "핵심 BOM 내역",
              current: `${currentSpec?.bomEstimate?.length || 0}개 항목`,
              suggested: "1. 구동계 BLDC 모터+감속기 세트 (4개, 3,200,000원)\n2. 엣지 컴퓨팅 보드 Orin (1개, 2,500,000원)\n3. 3D LiDAR 센서 (1개, 1,800,000원)\n4. 리튬인산철 배터리팩 48V 60Ah (1개, 1,400,000원)\n5. 로봇 프레임 가공물 (1세트, 2,100,000원)",
              reasoning: "시제품 1대 기준 부품 원가 1,100만원 선 유지로 목표 마진율 40% 이상 확보 가능한 공급망 견적입니다.",
            },
          ],
        };

      case "FUNDING_NEED":
        return {
          step: "FUNDING_NEED",
          stepTitle: "7단계: 필요 자금 규모 및 최적 조달 전략",
          summary: "정부 R&D, 정책자금, 민간 투자 유치 등 다각도 자금 믹스를 산출합니다.",
          diffs: [
            {
              field: "requiredFunding",
              label: "목표 조달 자금 규모",
              current: `${((concept.requiredFunding || 0) / 100000000).toFixed(1)}억원`,
              suggested: "4.0억원 (정부지원금 3.5억원 + 민간 투자/대출 0.5억원)",
              reasoning: "시제품 제작, 지식재산권 확보 및 시험인증 완료 시점까지의 현금흐름 Runway를 18개월 이상 확보합니다.",
            },
            {
              field: "salesModel",
              label: "수익화 모델 (Sales Model)",
              current: concept.salesModel || "(미입력)",
              suggested: "로봇 하드웨어 직접 판매 + 원격 관제 및 유지보수 RaaS (Robot as a Service) 월 구독 결합형",
              reasoning: "초기 H/W 공급 마진과 지속적인 연간 반복 매출(ARR)을 동시에 창출하여 기업가치를 극대화합니다.",
            },
          ],
        };

      case "VALIDATION":
        return {
          step: "VALIDATION",
          stepTitle: "8단계: 공인시험 및 실증(PoC) 검증 계획",
          summary: "국내 공인인증기관 시험성적서 및 실제 고객사 테스트베드 검증 절차를 수립합니다.",
          diffs: [
            {
              field: "validationPlan",
              label: "실증 및 시험성적서 검증 계획",
              current: currentSpec?.validationPlan || "(미설정)",
              suggested: "한국로봇산업진흥원(KIRIA) 및 한국산업기술시험원(KTL)을 통한 전기안전(KC) 및 전자파(EMC) 적합등록, 협력 수요기업(제조공장 1개소) 3개월 무정지 현장 실증",
              reasoning: "공공조달 혁신제품 등록 및 양산 진입의 필수 선행조건인 신뢰성 시험성적서를 선제 확보합니다.",
            },
          ],
        };

      case "OUTSOURCING":
        return {
          step: "OUTSOURCING",
          stepTitle: "9단계: 외주 및 기술협력(RFP) 범위",
          summary: "사내 핵심 역량은 보호하고 전문 위탁 용역으로 시간/비용을 단축할 모듈을 분리합니다.",
          diffs: [
            {
              field: "outsourcingPlan",
              label: "외주 개발 및 위탁 용역 계획",
              current: currentSpec?.outsourcingPlan || "(미설정)",
              suggested: "1. 외주 위탁: 알루미늄 정밀 프레임 CNC 가공 및 메인 전장 하네스 제작\n2. 자체 개발: ROS2 SLAM 알고리즘, 비전 AI 모델 최적화, UI 관제 소프트웨어\n* 보완: 외주 파트너 계약 시 기술유출 방지 NDA 및 산출물 IP 양도 조항 의무화",
              reasoning: "핵심 소스코드 및 IP는 사내 보유하면서 고정비(가공 장비) 지출을 최소화하는 효율적 전략입니다.",
            },
          ],
        };

      case "MARKET":
        return {
          step: "MARKET",
          stepTitle: "10단계: 시장 분석 및 사업화 전략",
          summary: "국내외 시장 규모(TAM-SAM-SOM)와 진입 장벽, 경쟁사 대비 포지셔닝을 분석합니다.",
          diffs: [
            {
              field: "marketAnalysis",
              label: "시장 규모 및 분석",
              current: concept.marketAnalysis || "(미입력)",
              suggested: "국내 지능형 자율주행 서비스/물류 로봇 시장 연평균 26.4% 성장 중. 중소제조 및 물류창고 타깃 TAM 1.8조원, SOM 150억원 (점유율 3% 목표)",
              reasoning: "투자 심사역과 정책 평가위원이 신뢰할 수 있는 공인 협회 통계에 기반한 시장 규모 추정입니다.",
            },
            {
              field: "businessModel",
              label: "비즈니스 모델 및 스케일업",
              current: currentSpec?.businessModel || "(미설정)",
              suggested: "1차년도: 정부 R&D/혁신시제품 선정 ➔ 2차년도: SI 파트너십 구축 및 RaaS 구독 확대 ➔ 3차년도: 글로벌(동남아/일본) 시장 진출",
              reasoning: "정부 지원을 마중물로 삼아 민간 시장 및 해외 수출로 스케일업하는 3단계 로드맵입니다.",
            },
          ],
        };

      case "MASTER_SPEC":
      default:
        return {
          step: "MASTER_SPEC",
          stepTitle: "11단계: 종합 Master Specification 통합 및 최종 승인",
          summary: "구체화된 모든 하드웨어/소프트웨어/사업화 사양을 총괄 Master Specification v3.0으로 동기화합니다.",
          diffs: [
            {
              field: "technicalArchitecture",
              label: "시스템 기술 총괄 아키텍처",
              current: currentSpec?.technicalArchitecture || "(미설정)",
              suggested: `[${robotName} Master Architecture v3.0]\n- Core OS: Ubuntu 22.04 LTS + ROS2 Humble\n- Hardware Layer: Dual Brushless Motor Actuators, Battery Management System (CAN), Industrial I/O\n- Perception Layer: 3D LiDAR PointCloud Clustering + Stereo Depth Vision\n- Planning/Control: Behavior Tree + Nav2 Costmap Navigation\n- Cloud/Fleet: MQTT/WebRTC Fleet Management System`,
              reasoning: "과제 신청서 기술개발 내용, 외주 RFP 요구사항, 특허 명세서의 기본 토대가 되는 시스템 설계 문서입니다.",
            },
            {
              field: "securityClassification",
              label: "보안 등급 (Security Classification)",
              current: currentSpec?.securityClassification || "INTERNAL",
              suggested: "INTERNAL",
              reasoning: "사내 특허 출원 및 과제 접수 전까지 핵심 기술의 대외 유출을 방지하기 위한 사내 기밀 등급 유지입니다.",
            },
          ],
        };
    }
  }
}
