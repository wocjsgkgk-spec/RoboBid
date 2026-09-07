# RoboBid AI — MASTER PRD v3.0
## Robot Funding & Venture Intelligence Platform

- 문서 상태: Final Product Direction / Migration Target
- 기준일: 2026-09-07
- 제품명: RoboBid AI
- 기존 기준선: RoboBid AI PRD v2.0
- 개발 방식: 기존 v2.0 인플레이스 고도화
- 개발 도구: Google Antigravity CLI 중심
- 1차 제품 형태: Web App + Responsive Mobile + PWA
- 핵심 도메인: 모든 로봇 분야
- 주요 확장 도메인: AI, 센서, 자율주행, 스마트팜, 자동화, 피지컬 AI, 특수목적 하드웨어
- 핵심 목표: 로봇 개발을 위한 정부·지자체·공공기관 자금 및 사업기회 확보
- 후속 목표: 지원금 확보 후 개발 프로젝트 실행, 전문용역/외주, 시제품, 실증, 제품화, 판매사업 연계

---

# 1. Product Vision

RoboBid AI는 정부·지자체·공공기관·전문기관의 각종 지원사업, R&D, 실증, 창업지원, 시제품 제작지원, 사업화 지원, 경진대회, 공모전, 상금사업, 전시·판로·수출지원 및 공공조달 기회를 상시 탐색하고, 회사가 개발하고자 하는 로봇 프로젝트와 의미 기반으로 연결하여 자금 확보 가능성을 분석하고, 지원 준비부터 선정 후 실제 개발 실행까지 이어주는 **AI 기반 Robot Funding Operations Platform**이다.

RoboBid AI의 목적은 단순 공고 검색이나 입찰 자동화가 아니다.

최종적으로 다음 문제를 해결한다.

> “우리가 개발하고 싶은 로봇을 만들기 위해 어떤 정부·공공 자금을 언제, 어디서, 어떤 방식으로 확보할 수 있으며, 여러 자금을 어떻게 조합하고, 선정된 후 어떤 개발·외주·실증 과정을 거쳐 제품화할 것인가?”

---

# 2. Product Mission

RoboBid AI는 사용자가 다음 세 가지를 놓치지 않도록 한다.

## 2.1 Opportunity Never Missed
로봇 개발에 활용 가능한 지원사업·공모·대회·R&D·실증사업을 누락하지 않는다.

## 2.2 Funding Fit
단순히 “관련 있어 보이는 공고”를 보여주는 것이 아니라 해당 사업이 실제 개발아이템의 어떤 비용과 WBS를 지원할 수 있는지 분석한다.

## 2.3 Funding to Product
선정에서 끝나지 않고 지원금을 실제 개발비로 전환하여 WBS·예산·외주·실증·제품화로 연결한다.

---

# 3. Product Positioning

기존 제품 개념:

```text
Public BidOps Intelligence
```

v3.0 제품 개념:

```text
Robot Funding & Venture Intelligence
+
Funding Operations
+
Grant / R&D Application
+
Development Execution
```

RoboBid의 `Bid`는 좁은 의미의 조달 입찰만을 의미하지 않는다.

다음 모든 기회를 포괄한다.

```text
정부 R&D
지자체 R&D
창업지원
시제품 제작
실증사업
사업화
경진대회
공모전
상금사업
전시지원
판로지원
수출지원
공공조달
공공용역
```

---

# 4. Product Development Scope

## 4.1 1차 중심

```text
기회 탐색
→ 프로젝트 매칭
→ 지원자격 분석
→ Funding Fit
→ APPLY / HOLD / PASS
→ 지원서 작성
→ 제출
→ 선정
→ 지원금 확보
```

## 4.2 2차 중심

```text
지원금 확보
→ 개발 프로젝트 전환
→ WBS
→ 예산
→ 전문용역 RFP
→ 외주
→ 개발관리
```

## 4.3 최종

```text
시제품
→ 실증
→ 제품화
→ 판매 준비
→ 공공조달 / 민간판매 / 후속사업
```

---

# 5. Core User Workflow

```text
아이디어 등록
↓
Project Concept
↓
Master Specification
↓
Funding Intelligence Network
↓
Early Signal / Opportunity
↓
AI Project Match
↓
14-Axis Evaluation
↓
Funding Fit
↓
Funding Portfolio
↓
APPLY / HOLD / PASS
↓
Application Workspace
↓
Proposal / 사업계획서
↓
Compliance / Review
↓
Submission
↓
Award
↓
Funding Execution
↓
Development Project
↓
Outsourcing / Expert Services
↓
Prototype
↓
Validation
↓
Commercialization
```

---

# 6. Target Users

## Primary

### 대표 / 사업개발 PM
- 개발할 로봇 프로젝트 결정
- 지원사업 우선순위 결정
- APPLY / HOLD / PASS
- Funding Portfolio 관리
- 최종 신청 승인
- 선정 후 개발 프로젝트 전환

## Secondary

### 기획 / 사업계획 담당
- 지원사업 분석
- 사업계획서
- 지원금 예산 편성
- 제출서류
- 기관별 양식

### 기술 담당
- 기술구조
- TRL
- WBS
- 개발범위
- 기술 요구사항
- 외주 범위

### 재무 담당
- 자부담
- 지원금
- 비목
- 현금/현물
- 중복수혜 위험
- 개발비 Coverage

### 개발 / 외주 담당
- 선정 후 WBS
- 전문용역
- 외주 RFP
- 후보업체
- 검수

---

# 7. Applicant / Company Stage Model

지원사업별 신청대상 구분을 위해 회사 상태를 명확히 모델링한다.

```text
PRE_STARTUP
STARTUP_UNDER_3Y
STARTUP_UNDER_7Y
SME
VENTURE
INNOBIZ
CORPORATE_RESEARCH_CENTER
LOCAL_COMPANY
RESEARCH_ORG
CONSORTIUM
OTHER
```

사용자는 현재 상태와 과거/예정 상태를 등록할 수 있다.

RoboBid는 Opportunity별로 다음을 표시한다.

```text
현재 신청 가능
조건부 신청 가능
향후 신청 가능
신청 불가
확인 필요
```

---

# 8. Project Concept Vault

v3.0의 핵심 신규 Entity.

한 줄 아이디어부터 등록 가능하다.

예:

```text
농업용 원격조작 수확로봇
```

AI는 사용자의 승인 하에 점진적으로 다음 구조로 발전시킨다.

```text
Idea
→ Problem
→ Target User
→ Product Concept
→ Technical Concept
→ TRL
→ Architecture
→ Required Technology
→ KPI
→ WBS
→ Development Cost
→ BOM
→ Required Funding
→ Validation Plan
→ Partner / Outsourcing
→ Market
→ Sales Model
→ Master Specification
```

AI는 자동으로 Project Concept 원본을 덮어쓰지 않는다.

모든 변경은:

```text
AI Suggestion
→ Diff
→ User Approve
→ Version Save
```

형태로 적용한다.

---

# 9. Master Specification

각 개발아이템의 최상위 내부 문서.

포함:

```text
사업 배경
Problem Statement
제품개념
TRL
기술 Architecture
HW/SW
센서
통신
AI
운용환경
KPI
WBS
예산
BOM
R&R
보안정보
실증계획
외주계획
사업성
판매모델
```

Master Specification은 하나의 Source of Truth다.

---

# 10. Document Derivation Engine

Master Specification을 용도별 문서로 변환한다.

## Government Application

```text
사업계획서
연구개발계획서
실증계획서
창업사업계획서
기술개발계획서
```

## Outsourcing

```text
RFP
과업지시서
외주사양서
검수기준
납품물 명세
```

## Internal

```text
내부개발계획
WBS
예산
BOM
Risk
```

## Business / Sales

```text
제품소개
사업소개
시장성
ROI
판매전략
```

보안등급에 따라 내부정보를 자동 제외할 수 있어야 한다.

---

# 11. Funding Intelligence Network

기존 Provider 개념을 확장한다.

## Tier 1 — Core Funding Sources
- IRIS
- K-Startup
- 기업마당
- 한국로봇산업진흥원
- 주요 정부·지자체 사업
- 공공데이터포털

## Tier 2 — R&D / Industry
- 산업기술 R&D 전문기관
- AI/ICT 전문기관
- 스마트농업 전문기관
- 스마트제조 기관
- 연구개발특구
- 출연·전문기관

## Tier 3 — Regional
- 전국 테크노파크
- 광역지자체
- 기초지자체
- 창조경제혁신센터
- 지역산업진흥기관
- 지역 창업기관

## Tier 4 — Opportunity / Prize
- 로봇 경진대회
- 창업경진대회
- 공모전
- Challenge
- 상금사업
- 실증 Contest
- 전시지원
- 수출지원
- 판로지원

## Tier 5 — Sales / Procurement
- 나라장터
- 공공구매
- 혁신제품
- 시범구매
- 용역
- 구매입찰

---

# 12. Opportunity Taxonomy

모든 Opportunity에 `funding_type`을 부여한다.

```text
GOV_RND
LOCAL_RND
STARTUP_GRANT
PROTOTYPE_GRANT
VALIDATION_GRANT
COMMERCIALIZATION
COMPETITION
CONTEST
PRIZE
EXHIBITION
EXPORT
SALES_SUPPORT
PROCUREMENT
SERVICE_CONTRACT
OTHER
```

우선순위:

```text
P0 Funding: A~K
P1 Procurement / Service: L~M
```

---

# 13. Early Signal Engine

RoboBid는 정식 공고 이후에만 움직이지 않는다.

추적:

```text
사업시행계획
예산 발표
수요조사
사업사전안내
공모예고
사업설명회
RFP 사전예고
정식 공고
```

Opportunity 상태:

```text
SIGNAL
EXPECTED
PRE_ANNOUNCEMENT
ANNOUNCED
OPEN
CLOSING
CLOSED
```

예상 공고는 확정 공고와 구분한다.

---

# 14. Opportunity Calendar Forecast

과거 반복공고를 기반으로 예상 시기를 보여준다.

단 이는 참고기능이다.

예:

```text
예상 공고: 2027년 2~3월
Confidence: MEDIUM
근거: 최근 3년 유사시기 반복
```

절대 확정 공고처럼 표시하지 않는다.

---

# 15. Semantic Funding Match

키워드 기반을 넘어선다.

AI는 다음을 판단한다.

> 이 사업이 현재 Project Concept의 어느 개발항목을 지원할 수 있는가?

추천 시 반드시:

```text
추천 이유
Project 연결항목
공고 근거
Funding 활용 가능 영역
불확실성
```

을 표시한다.

---

# 16. 14-Axis Evaluation Engine

모든 Opportunity는 다음 14개 항목을 평가한다.

1. 신청자격 충족
2. 개발아이템 적합성
3. 지원금 규모
4. 자부담 규모
5. 개발비 Coverage
6. TRL 적합성
7. 개발기간 적합성
8. 인력/외주 확보 가능성
9. 가점 확보 가능성
10. 선정 난이도
11. 신청 준비도
12. 실증처/협력기관 필요성
13. 사업화/판매 연계성
14. 후속 정부사업 연결성

결과는 단일 숫자뿐 아니라 Profile로 제공한다.

---

# 17. Funding Fit Engine

지원금이 실제 개발예산을 얼마나 충당할 수 있는지 분석한다.

Project Budget:

```text
인건비
재료비
부품비
장비비
외주비
실증비
서버/SW
마케팅
인증
기타
```

Opportunity Allowable Cost:

```text
인건비
재료비
장비
전문용역
외주
실증
마케팅
간접비
```

RoboBid는 자동으로 매칭한다.

결과:

```text
총 개발비
지원 가능액
자부담
Coverage
비목별 Coverage
미지원 비용
```

---

# 18. Funding Portfolio

하나의 개발아이템에 여러 Funding을 조합한다.

상태:

```text
CANDIDATE
PLANNED
APPLIED
UNDER_REVIEW
AWARDED
REJECTED
CANCELLED
```

표시:

```text
Target Development Cost
Awarded
Under Review
Planned
Candidate
Funding Gap
Coverage
```

---

# 19. Funding Conflict Checker

중복수혜·중복계상 위험을 감지한다.

검사:

```text
동일 Project
동일 비용항목
동일 기간
동일 자산
동일 부품
동일 인건비
중복지원 제한
```

결과:

```text
SAFE
POTENTIAL_CONFLICT
REVIEW_REQUIRED
PROHIBITED
```

AI는 법적 확정판단을 내리지 않는다.

항상 사용자 검토가 필요하다.

---

# 20. Opportunity Decision

기존 Go/No-Go를 지원사업 목적에 맞게 재정의한다.

```text
APPLY
APPLY_WITH_CONDITIONS
HOLD
PASS
```

조달/용역에서는 기존:

```text
GO
HOLD
NO_GO
```

표현을 유지할 수 있다.

---

# 21. Acquisition Plan for Missing Capabilities

현재 없는 역량도 확보계획으로 평가할 수 있다.

상태:

```text
AVAILABLE
PLANNED
OUTSOURCE
PARTNER_REQUIRED
UNAVAILABLE
```

단 필수자격이 “신청 시점 보유”를 요구한다면 계획만으로 충족 처리하지 않는다.

---

# 22. Development Portfolio Advisor

여러 Project Concept을 비교한다.

평가:

```text
Funding Opportunity Count
Funding Amount Potential
Company Readiness
TRL
Technical Complexity
Market
Time to Prototype
Required Cash
Partner Dependency
```

AI는 참고 추천만 제공한다.

최종 경영 판단은 사용자에게 있다.

---

# 23. Application Workspace

APPLY 결정 후 생성된다.

```text
Opportunity
Funding Fit
Eligibility
Requirements
Evaluation Criteria
Proposal
Budget
KPI
WBS
Evidence
Tasks
Review
Submission
```

---

# 24. Proposal / Application AI

지원사업 유형별 Template을 사용한다.

```text
정부 R&D
지자체 R&D
창업지원
시제품
실증
사업화
공모전
경진대회
수출지원
조달
용역
Custom
```

AI 작성 규칙:

- 공고 근거
- Master Specification 근거
- Company Evidence 근거
- 숫자 임의생성 금지
- 실적 임의생성 금지
- 미확인값 TODO
- 가정 표시
- 사용자 승인

---

# 25. Evaluation Simulation

기존 Cross Review를 사업유형에 맞게 재구성한다.

예:

### R&D
- 기술전문가
- 사업화전문가
- 연구관리전문가
- 재무/예산

### 창업지원
- BM
- 시장성
- 팀
- 성장성

### 실증
- 기술성
- 현장성
- KPI
- 확산성

### 조달
- 행정
- 기술
- 가격
- 수행능력

---

# 26. Submission Management

기존 Zero-Auto-Submit 원칙을 유지한다.

RoboBid는:

```text
준비
검토
체크
알림
Sign-off
```

만 수행한다.

자동 제출은 하지 않는다.

---

# 27. Schedule Assistant

AI가 준비 일정을 제안한다.

단 일정은 가이드다.

사용자가 언제든 수정 가능하다.

Schedule Assistant가 Workflow를 강제하지 않는다.

---

# 28. Award Workspace

선정 후:

```text
Award Amount
Agreement
Project Period
Funding Rules
Budget
Milestones
Reporting
Required Deliverables
```

을 등록한다.

---

# 29. Funding Execution

선정 후 실제 개발예산과 연결한다.

```text
Award Budget
↓
Project Budget
↓
WBS Allocation
↓
Internal Work
↓
External Work
↓
Procurement
↓
Validation
```

---

# 30. Post-Award Development

1차:

```text
지원금
WBS
예산
외주 Scope
```

2차:

```text
외주 후보
견적
평가
개발진행
```

최종:

```text
계약
Milestone
검수
대금
```

---

# 31. Secure Outsourcing RFP Generator

Master Specification에서 외주용 정보만 추출한다.

Internal:

```text
전체 아키텍처
사업성
전체 예산
내부 원가
데이터 파이프라인
전략
```

External:

```text
필요 Scope
Interface
Deliverables
Acceptance Criteria
Schedule
Required Technical Information
```

민감정보 자동 블라인드 기능을 제공한다.

---

# 32. Outsourcing Expansion

## Phase A
- 외주 Scope
- RFP
- 과업지시서
- 검수기준

## Phase B
- 업체 Pool
- 견적
- 비교
- 평가

## Phase C
- 계약
- Milestone
- 검수
- 지급

---

# 33. Commercialization

장기 영역.

```text
Prototype
Validation
Certification
Pilot Customer
Pricing
Sales Material
Public Procurement
Private Sales
Export
```

---

# 34. Main Navigation

## Primary

```text
오늘
개발아이템
지원기회
Funding Portfolio
```

## Funding Operations

```text
지원준비
사업계획서
제출·심사
```

## Post-Award

```text
선정·개발
```

## Knowledge

```text
자료·역량
Intelligence
```

## Support

```text
RoboBid AI
알림
설정
```

기존 조달 계산도구는:

```text
Intelligence 또는 Tools > 조달
```

하위 기능으로 이동한다.

---

# 35. Today Workspace

첫 화면 우선순위:

1. 오늘 반드시 처리할 지원업무
2. 신규 고적합 Funding Opportunity
3. Early Signal
4. APPLY 결정대기
5. 제출 D-Day
6. Funding Portfolio Gap
7. Awarded Project 주요 일정
8. 증빙 만료
9. 중요 알림

---

# 36. Project Concept Workspace

```text
Overview
Master Specification
Funding
Technical
WBS
Budget
KPI
Partners
Outsourcing
Documents
History
```

---

# 37. Funding Opportunity Workspace

```text
Overview
Source
Eligibility
Project Match
14-Axis Evaluation
Funding Fit
Allowed Costs
Conflict
Requirements
AI Analysis
Decision
Documents
History
```

---

# 38. Funding Portfolio Workspace

Project별로:

```text
Target Cost
Awarded
Applied
Under Review
Planned
Candidate
Gap
Conflict
Timeline
```

을 보여준다.

---

# 39. Intelligence

```text
Funding Trends
Source Trends
Agency
Project Category
Award / Loss
Capability Gap
Funding Gap
Recurring Programs
Expected Programs
Procurement
```

---

# 40. Capability Vault

기존 기능을 유지·확장한다.

```text
Company
Patent
Certification
Technology
Product
Project History
People
Equipment
Financial
Partners
Evidence
```

추가 역량 상태:

```text
Current
Planned
Outsource
Partner
```

---

# 41. Data Origin

모든 데이터는 출처를 명시한다.

```text
API
WEB
MANUAL
UPLOAD
AI_DERIVED
SYSTEM
DEMO
```

DEMO 데이터는 실제 KPI와 분리한다.

---

# 42. Notification

구분:

```text
Critical
Action Required
Reminder
Opportunity
Funding Signal
System
```

초기:

- In-App
- Telegram
- Browser Push

향후:

- Kakao
- Email

---

# 43. AI Architecture

사용자는 하나의 RoboBid AI를 사용한다.

내부 Role:

```text
Funding Scout
Project Analyst
Eligibility Analyst
Funding Fit Analyst
Proposal Strategist
Technical Planner
Budget Analyst
Evaluation Reviewer
Compliance Reviewer
Outsourcing Planner
Commercialization Advisor
```

---

# 44. AI Guardrails

AI는 다음을 자동 확정하지 않는다.

- Project Concept 변경
- APPLY 결정
- Eligibility PASS 확정
- 중복수혜 합법 여부
- 최종 예산
- 최종 제출
- 외주업체 선정
- 계약
- 판매 결정

모든 핵심 결정은 Human Approval이다.

---

# 45. Existing v2.0 Feature Migration

## KEEP

- RFP Parser
- Proposal RAG
- Cross Review
- Vault
- Evidence
- Submission
- Tasks
- Telegram
- Supabase
- Auth/Security
- Audit
- KONEPS / Bizinfo integrations

## EXPAND

- Today
- Opportunities
- Pipeline
- Fit Score
- Learning
- Intelligence
- Settings

## MOVE

- 투찰가 계산기
- A값
- 개찰분석

→ `조달/판매` 보조영역

## NEW

- Project Concept Vault
- Master Specification
- Funding Intelligence Network
- Early Signal
- Semantic Project Match
- 14-Axis Evaluation
- Funding Fit
- Funding Portfolio
- Funding Conflict Checker
- Development Portfolio Advisor
- Award Workspace
- Funding Execution
- Secure Outsourcing RFP Generator

---

# 46. Fit Score Migration

기존 Fit Score는 유지하되 `Opportunity Fit`의 하위 구성요소가 된다.

기존:

```text
Technical
Performance
Qualification
Budget
```

신규 상위평가:

```text
Project Match
Funding Fit
Eligibility
Readiness
Strategic Value
Execution Feasibility
Commercialization
```

Win Probability로 부르지 않는다.

---

# 47. Success Metrics

## Opportunity
- 로봇 개발 관련 중요 Funding Opportunity 누락률
- Early Signal 확보건수
- 공고 발견까지 시간

## Decision
- Opportunity 검토시간
- APPLY 결정시간
- Eligibility 검토시간

## Funding
- 총 지원 신청액
- 총 선정 지원금
- 개발비 Coverage
- Project별 Funding Gap

## Proposal
- 초안 작성시간
- Evidence 재사용률
- Requirement 누락률

## Execution
- Award → Project 전환시간
- WBS 준비시간
- 외주 RFP 작성시간

## Business
- 지원금 확보율
- Prototype 완성
- 실증 완료
- 제품화
- 판매 전환

---

# 48. Non-Functional Requirements

- 기존 DB/Auth/Storage reset 금지
- 기존 테스트 baseline 보존
- Zero Fake
- Evidence Traceability
- Confidentiality
- Role Based Access
- Audit
- Responsive
- Light/Dark
- PWA
- Provider Failure 표시
- AI Prompt Injection 방어

---

# 49. Implementation Priority

## P0 — Product Reorientation

1. Navigation v3
2. Project Concept Vault
3. Funding Opportunity Taxonomy
4. Opportunity → Project Match
5. 14-Axis Evaluation
6. Funding Fit
7. APPLY/HOLD/PASS
8. Funding Portfolio
9. Today 재설계
10. 기존 Opportunity/Pipeline Migration

## P1 — Application Excellence

1. Master Specification
2. Document Derivation
3. 사업유형별 Proposal
4. Funding Conflict Checker
5. Early Signal
6. Schedule Assistant
7. Applicant Stage
8. Missing Capability Plan
9. Evaluation Simulation 고도화

## P2 — Award to Development

1. Award Workspace
2. Funding Execution
3. WBS/Budget
4. Secure Outsourcing RFP
5. External Scope
6. Acceptance Criteria

## P3 — Outsourcing

1. Vendor Pool
2. Quote
3. Evaluation
4. Contract
5. Milestones
6. Acceptance/Payment

## P4 — Commercialization

1. Validation
2. Certification
3. Productization
4. Sales
5. Procurement
6. Export

---

# 50. Migration Rules

RoboBid v2.0을 새로 만들지 않는다.

```text
v2 Current Baseline
↓
Audit
↓
Data Migration Map
↓
Feature Flag
↓
v3 Workspace
↓
Regression Test
↓
User Validation
↓
Old UI Deprecation
```

정상 기능을 먼저 삭제하지 않는다.

---

# 51. Antigravity Development Rules

Antigravity는:

1. 본 PRD를 Source of Truth로 읽는다.
2. 기존 v2.0을 Audit한다.
3. Phase 단위로 작업한다.
4. 한 Phase 완료 후 STOP한다.
5. 다음 Phase를 자동으로 구현하지 않는다.
6. DB/Auth/Storage reset을 하지 않는다.
7. 정상 기능을 승인 없이 삭제하지 않는다.
8. 샘플 데이터를 운영데이터처럼 만들지 않는다.
9. 외부 API를 임의 교체하지 않는다.
10. v2 테스트 baseline을 유지한다.

---

# 52. Definition of Done

기능은 다음을 충족해야 완료다.

```text
실제 사용자 Workflow
실데이터 / 명확한 Empty
Evidence
Loading
Error
Permission
Responsive
Auth
RLS
Audit
Tests
Browser Verification
Migration Safety
Production Compatibility
```

Build 통과만으로 완료 처리하지 않는다.

---

# 53. Final Product Statement

> **RoboBid AI는 회사가 개발하고자 하는 로봇 아이디어를 구체적인 개발 프로젝트로 발전시키고, 그 프로젝트에 활용 가능한 정부·지자체·공공기관의 R&D·창업·시제품·실증·사업화·경진·공모·판로·조달 기회를 상시 탐색하여, 지원 가능성과 개발비 충당 가능성을 분석하고, 여러 지원금을 조합해 자금을 확보한 뒤 실제 개발·외주·실증·제품화까지 연결하는 AI 기반 Robot Funding & Venture Intelligence Platform이다.**
