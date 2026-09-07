# 01. RoboBid AI v2.0 → v3.0 갭 분석 (Gap Analysis)

> **문서 상태**: Final Gap Analysis  
> **기준일자**: 2026-09-07  
> **목적**: v2.0 현재 구현 상태와 v3.0 Master PRD의 요구사항 간 기능적·기술적 격차를 체계적으로 분석하여 마이그레이션 우선순위 도출.

---

## 1. 패러다임 전환 (Core Paradigm Shift)

| 비교 항목 | RoboBid AI v2.0 (Current) | RoboBid AI v3.0 (Target) |
| :--- | :--- | :--- |
| **제품 정체성** | 공공조달 입찰 수주 중심 (Public BidOps) | 로봇 개발 자금 및 벤처 인텔리전스 (Funding Operations) |
| **시작점 (Entry Point)** | 외부에서 공고된 입찰 공모문 탐색 | **사내에서 만들고자 하는 "로봇 아이디어 (Project Concept)"** |
| **핵심 목적** | 공공 입찰 참여 및 낙찰률 제고 | **로봇 개발에 필요한 다각적 자금(R&D, 지원사업, 실증, 상금) 확보** |
| **의사결정 축** | Go / Hold / No-Go (입찰 참가 여부) | **APPLY / HOLD / PASS (자금 신청 여부) & Funding Fit** |
| **평가 메커니즘** | 4개 영역 정량 Fit Score (0~100점) | **14-Axis 다차원 평가 + 개발비 Coverage 매칭** |
| **포트폴리오 개념** | 입찰 파이프라인 칸반 단계 관리 | **단일 로봇 프로젝트에 여러 자금을 조합하는 Funding Portfolio** |
| **선정 후 연계** | 개찰 결과 대사 및 사후 회고 중심 | **지원금 집행 ➔ 개발 프로젝트 ➔ WBS/예산 ➔ 외주 용역 RFP** |
| **기존 조달 도구** | 메인 기능 (투찰계산기, A값, 사정율) | **조달/판로 보조 도구로 재배치 (Knowledge/Tools 하위)** |

---

## 2. 17대 핵심 v3.0 신규 기능 갭 매트릭스 (Feature Gap Matrix)

v3.0에서 요구하는 17개 핵심 기능 블록에 대한 구현 상태 및 재사용 가능성 분석:

| 번호 | v3.0 신규 요구 기능 | 현재 상태 분류 | 재사용 가능 자산 / 분석 상세 | 구현 방향 |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Project Concept Vault**<br>(로봇 아이디어/프로젝트 저장소) | **부분 구현** | • `src/lib/vault` (회사 역량 저장소)<br>• `src/lib/projects` (프로젝트 레코드)<br>• 현재는 역량(자격/특허)과 수주 후 프로젝트만 존재하며, 기획 단계의 '로봇 아이디어' 엔티티 미분리 | **새로운 구현 필요**<br>(아이디어 등록 및 단계별 구체화 워크스페이스 구축) |
| **2** | **Master Specification**<br>(단일 개발 기준 명세서) | **미구현** | • `src/lib/documents/rfp-analyzer.ts` (RFP 요구조건 파싱 로직 재사용 가능)<br>• Master Spec 엔티티 및 스키마는 신규 정의 필요 | **새로운 구현 필요**<br>(개발 아이템별 최상위 기술/WBS 명세서 구축) |
| **3** | **Funding Intelligence Network**<br>(지원사업 다채널 수집망) | **부분 구현** | • `src/lib/providers/koneps-adapter.ts` (조달청)<br>• `src/lib/providers/bizinfo-adapter.ts` (기업마당)<br>• `src/lib/ingestion/sync-engine.ts` (동기화 엔진 완비)<br>• IRIS, K-Startup, 로봇산업진흥원 어댑터 슬롯 대기 중 | **기존 기능 확장**<br>(Tier 1~5 소스 분류 체계 및 어댑터 확장) |
| **4** | **Early Signal Engine**<br>(사전공고/수요조사 추적) | **미구현** | • 현재 공고는 '정식 공고' 위주 처리<br>• 상태값 `SIGNAL`, `EXPECTED`, `PRE_ANNOUNCEMENT` 확장 필요 | **새로운 구현 필요**<br>(공고 전 단계 신호 수집 및 신뢰도 모델) |
| **5** | **Funding Opportunity Taxonomy**<br>(지원사업 15대 분류 체계) | **부분 구현** | • `BidType` (`R_AND_D`, `DEMONSTRATION`, `SUBSIDY_SUPPORT` 등 9종 기구현)<br>• `funding_type` (경진대회, 상금, 바우처 등 15종 세분화 필요) | **기존 기능 확장**<br>(`FundingType` enum 추가 및 P0/P1 우선순위화) |
| **6** | **Semantic Project Match**<br>(아이디어-공모 의미적 매칭) | **부분 구현** | • `src/app/api/ai/copilot` (RAG 문답)<br>• `src/lib/scoring/scoring-engine.ts` (키워드/도메인 매칭)<br>• 로봇 프로젝트 WBS와 공모 과업 간 의미적 정밀 매칭 고도화 필요 | **기존 기능 확장**<br>(Project Concept 매칭 임베딩/프롬프트 고도화) |
| **7** | **14-Axis Evaluation Engine**<br>(14개 축 다차원 정밀 평가) | **부분 구현** | • `src/lib/eligibility/evaluator.ts` (자격/결격 검토)<br>• `src/lib/scoring/scoring-engine.ts` (기술/실적/자격/예산)<br>• 14개 축(자부담, Coverage, TRL, WBS, 가점 등) 프로파일화 필요 | **새로운 구현 필요**<br>(14축 평가 결과 객체 및 레이더 차트) |
| **8** | **Funding Fit Engine**<br>(비목별 개발비 충당율 계산) | **미구현** | • 프로젝트 예산(인건비/부품/장비/외주) vs 공모 인정비목 매칭 산식 신규 필요 | **새로운 구현 필요**<br>(비목별 Coverage 매핑 및 미지원 비용 도출) |
| **9** | **Funding Portfolio**<br>(아이템별 자금 조합 관리) | **부분 구현** | • `src/components/portfolio/portfolio-executive-dashboard.tsx` (기초 레이아웃 보유)<br>• 단일 프로젝트 다중 자금 조합 로직 및 갭 계산 필요 | **새로운 구현 필요**<br>(프로젝트별 Target Cost vs Awarded 시각화) |
| **10**| **Funding Conflict Checker**<br>(중복수혜/중복계상 위험 감지) | **미구현** | • 동일 프로젝트/동일 비목/동일 기간 중복수혜 감지 알고리즘 필요 | **새로운 구현 필요**<br>(규정 기반 리스크 판정 엔진 구축) |
| **11**| **Applicant Stage Model**<br>(11단계 기업/신청자 단계) | **부분 구현** | • `src/lib/vault`에 중소기업, 벤처기업 플래그 존재<br>• `PRE_STARTUP`, `STARTUP_UNDER_3Y`, `INNOBIZ` 등 정형화 모델 필요 | **기존 기능 확장**<br>(ApplicantProfile 엔티티 및 자격 대사 엔진) |
| **12**| **Missing Capability Acquisition**<br>(부족 역량 확보계획) | **부분 구현** | • `src/lib/readiness/readiness-evaluator.ts` (부족 데이터 축적 계획)<br>• 외주/파트너십을 통한 역량 확보 계획 연계 필요 | **기존 기능 확장**<br>(`PLANNED`, `OUTSOURCE` 상태 반영) |
| **13**| **Development Portfolio Advisor**<br>(프로젝트 간 우선순위 추천) | **미구현** | • 여러 로봇 아이템 중 자금 확보 가능성 및 자부담 기준 최적 포트폴리오 추천 | **새로운 구현 필요**<br>(AI 의사결정 보조 매트릭스) |
| **14**| **Application Workspace**<br>(APPLY 확정 후 지원 준비 작업장) | **부분 구현** | • `src/app/(workspace)/proposals` (제안서 작성 환경 완비)<br>• `src/components/opportunities/opportunity-360-workspace.tsx`<br>• 지원사업 전용 워크스페이스 형태로 통합 필요 | **기존 기능 재사용 & 통합**<br>(Proposal + RFP + Tasks + Evidence 융합) |
| **15**| **Award Workspace**<br>(선정 후 협약 및 사업비 관리) | **부분 구현** | • `src/lib/projects/project-conversion-service.ts` (WBS 및 인력/외주 기구현)<br>• 협약 금액, 전담기관, 사업기간 관리 UI 필요 | **기존 기능 확장**<br>(선정 등록 및 조건부 관리 화면) |
| **16**| **Funding Execution**<br>(지원금 ➔ 실제 개발비 집행 연계) | **부분 구현** | • `ProjectRecord`의 `governmentGrant` 및 `privateContribution`<br>• WBS 비목별 집행 매핑 | **기존 기능 확장** |
| **17**| **Secure Outsourcing RFP Generator**<br>(기밀 블라인드 외주 제안요청서) | **부분 구현** | • `ProjectConversionService` 내 `project_subcontracts.rfpDraft` 기구현<br>• 사내 원가/핵심특허 블라인드 및 과업사양서 자동 분리 기능 고도화 | **기존 기능 확장**<br>(RFP 추출기 + 민감정보 마스킹 결합) |

---

## 3. 핵심 갭 요약

1. **상위 도메인 레이어의 부재**:
   - 현재는 `Opportunity`가 최상위 엔티티입니다. v3.0에서는 `ProjectConcept`가 최상위에 위치하고, 하나의 `ProjectConcept`에 여러 `FundingOpportunity`가 매칭되어 `FundingPortfolio`를 형성해야 합니다.
2. **평가 기준의 다변화**:
   - v2.0의 `Fit Score`는 조달 수주 적합도에 편중되어 있습니다. v3.0에서는 지원금 규모, 자부담 비율, 개발비 Coverage, TRL 적합도를 포괄하는 **14-Axis Evaluation & Funding Fit**으로 고도화되어야 합니다.
3. **이미 구축된 강력한 사후 자산**:
   - 다행스럽게도 `Post-Award Project Conversion`, `WBS 마일스톤`, `인력 계획`, `외주 RFP 초안`(`src/lib/projects`)이 이미 코드베이스와 DB(Phase 11)에 존재하므로, v3.0의 P2(선정 후 개발 전환) 영역은 바닥부터 만드는 것이 아니라 기존 코드를 연결하여 완성할 수 있습니다.
