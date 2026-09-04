# RoboBid AI — MASTER PRD v1.0
## 로봇·특수목적 하드웨어 공공 공모사업 End-to-End BidOps Intelligence Platform

- 문서 상태: Final Product Requirements Document
- 제품명: RoboBid AI (로보비드 AI)
- 제품 형태: Web App + Responsive Mobile + PWA
- 개발 환경: Google Antigravity CLI 중심
- 비용 정책: 무료·오픈소스·무료 티어 우선, 실제 회사 운영 안정성이 필요해지면 최소 유료 전환
- 보안 정책: 공개 공고 데이터와 회사 내부 기밀 데이터를 분리 처리
- Primary Domain: 로봇
- Secondary Domain: 자동화·스마트팜·AI/ICT·특수목적 하드웨어
- 기타 범위: 회사 Capability와 높은 적합성을 가진 기타 공공사업도 탐색

---

# 1. Product Vision

RoboBid AI는 정부·지자체·공공기관의 공모·R&D·실증·조달·용역·국비지원 사업을 자동으로 탐색하고,
회사의 실제 보유 역량과 비교하여 지원 가능성과 사업 적합성을 평가하며,
RFP 분석부터 GO/HOLD/NO-GO 의사결정, 사업계획서 작성, 요구사항 검증, 제출관리까지 연결하는
**AI 기반 공공사업 BidOps Intelligence Platform**이다.

RoboBid AI는 단순 공모 검색기나 알림 서비스가 아니다.

핵심 사이클:

```text
FIND
공모 발견

→ QUALIFY
지원자격 확인

→ SCORE
회사 적합도·기회가치 평가

→ DECIDE
GO / HOLD / NO-GO

→ PROPOSE
사업계획서 작성

→ VERIFY
RFP 요구조건 검증

→ SUBMIT
제출 준비

→ LEARN
선정·탈락 결과 축적

→ IMPROVE
추천·점수·제안 품질 개선
```

1차 제품은 **좋은 공모를 놓치지 않고 실제 수주 전 과정의 속도와 품질을 높이는 것**에 집중한다.
선정 이후의 인력계획·채용·외주 발주는 후순위 확장 영역이다.

---

# 2. North Star

## 2.1 One Place

공모 하나를 확인할 때 다음 정보가 한곳에 연결되어야 한다.

- 공고 원문
- RFP/과업지시서/첨부문서
- 사업비
- 신청기간
- 지원대상
- 필수자격
- 우대·가점
- 기술 요구사항
- TRL
- 제출서류
- 회사 보유기술
- 유사 수행실적
- 특허·인증
- 장비·인력역량
- 예상 리스크
- 내부 검토상태
- 사업계획서
- 제출상태
- 선정/탈락 결과

## 2.2 Trust

AI의 판단은 설명 가능해야 한다.

- 왜 이 공모를 추천했는가?
- 어떤 자격조건을 충족했는가?
- 어떤 요건이 미확인인가?
- 회사의 어떤 Capability와 매칭됐는가?
- 어떤 RFP 문장을 근거로 판단했는가?
- Opportunity Score는 어떤 기준으로 계산됐는가?
- 사업계획서 핵심 주장은 어떤 RFP/회사 Evidence에 근거하는가?

근거를 설명할 수 없는 AI 판단은 정상 의사결정 결과로 취급하지 않는다.

---

# 3. Target Users

## Primary User

회사 내부 사업개발·공모 담당자, 대표 또는 PM.

핵심 Job:

> 수많은 공모 중 우리 회사가 실제 지원할 가치가 높은 사업을 빠르게 찾아내고,
> 근거를 검토하여 지원 여부를 결정한 후 제한된 시간 안에 경쟁력 있는 제안서를 완성한다.

## Secondary Users

### 기술 검토자
- 로봇/ROS2
- Embedded/Firmware
- AI/Vision
- 기구설계
- 전장/제어/통신
- Web/Cloud
- 스마트팜/자동화

### 사업·재무 검토자
- 사업비
- 인건비
- BOM
- WBS
- KPI
- 자기부담금
- 현금/현물
- 일정

### 관리자
- 사용자
- Provider
- API Key
- Capability
- 권한
- Audit
- AI 정책
- 알림 정책

초기 Role:

```text
ADMIN
BID_MANAGER
TECH_REVIEWER
BUSINESS_REVIEWER
VIEWER
```

---

# 4. Domain Scope

## Priority A — 핵심
- 로봇
- 서비스 로봇
- 산업용 로봇
- 이동로봇
- AMR/AGV
- 특수목적 로봇
- 재난/안전 로봇
- 농업 로봇

## Priority B
- 자동화
- 스마트팩토리
- 스마트팜
- AI/ICT
- IoT
- Embedded
- Vision
- Edge AI
- 특수목적 하드웨어
- 기계·전기·전자 융복합 시스템

## Priority C
회사 Capability와 높은 적합성을 가진 기타 공공사업.

---

# 5. Bid Type Scope

모든 유형을 수집하되 명확히 구분한다.

```text
R&D
실증
보조금/지원사업
구매/조달
용역
지자체 공모
국비사업
민관협력
기타
```

사용자는 사업유형별 검색·필터를 할 수 있어야 한다.
유형별 Eligibility Rule과 Proposal Template을 다르게 적용할 수 있어야 한다.

---

# 6. Core User Workflow

## 6.1 Morning

```text
로그인
→ 오늘
→ 신규 추천 공모
→ 마감 임박
→ 검토 대기
→ GO/HOLD/NO-GO 대기
→ 작성 중 제안
→ 제출 누락
→ 오늘 업무 처리
```

## 6.2 Opportunity

```text
공모 수집
→ 중복 제거
→ 도메인/사업유형 분류
→ 첨부문서 파싱
→ Eligibility Gate
→ Company Capability Matching
→ Opportunity Score
→ AI 분석
→ GO / HOLD / NO-GO
→ GO 승인 시 Proposal Workspace
```

## 6.3 Proposal

```text
RFP Requirement 추출
→ 목차/양식
→ 회사 Evidence 추천
→ 섹션별 초안
→ 기술 Architecture
→ WBS
→ KPI
→ 예산/BOM
→ Compliance Matrix
→ 내부 검토
→ 제출 Checklist
→ 제출 완료 기록
```

## 6.4 Learning

```text
제출
→ 선정/탈락
→ 평가점수/심사의견
→ 성공·실패요인
→ Outcome Dataset
→ 추천·점수·제안 품질 개선
```

---

# 7. Product Priorities

## P0 — MVP Must Have

1. 멀티 Provider 공고 수집
2. 통합 Opportunity DB
3. 중복 제거
4. 로봇 중심 키워드/AI 관련성 필터
5. Telegram + In-App 알림
6. PDF/HWP/HWPX/DOCX 분석
7. Eligibility Gate
8. Company Capability Vault
9. RoboBid Opportunity Score
10. GO/HOLD/NO-GO
11. Opportunity Pipeline
12. Proposal Workspace
13. AI Proposal Draft
14. Evidence 연결
15. Compliance Checker
16. 마감/제출 Checklist
17. 로그인/RBAC
18. Audit Log
19. Provider Health/실패 상태

## P1 — Early Production

1. Browser Push
2. Kakao AlimTalk Adapter
3. 협업·댓글·담당자
4. Proposal Versioning
5. WBS Builder
6. KPI Builder
7. 예산/BOM Builder
8. 유사 공모/유사 제안 검색
9. 선정·탈락 Outcome 분석
10. RAG 고도화
11. 문서 Export
12. Provider Health Dashboard

## P2 — Growth

1. Win Probability Model
2. 자동 Ranking 학습
3. 심사피드백 학습
4. Multi-Agent Proposal Review
5. 파트너/컨소시엄 Capability
6. Post-Award Project Conversion
7. 인력계획
8. 전문가 채용
9. 외주 RFP
10. 업체·견적 비교

---

# 8. Main Navigation

MVP:

```text
오늘
공모
제안
자료·인텔리전스
성과·학습

──────────
RoboBid AI
알림
설정
```

후순위:

```text
프로젝트
인력·외주
```

---

# 9. HOME — 오늘

통계 대시보드가 아니라 오늘의 수주 업무 시작화면이다.

우선순위:

1. 반드시 처리할 업무
2. 신규 AI 추천 공모
3. GO/HOLD/NO-GO 검토대기
4. 마감 임박 Proposal
5. 제출서류 누락
6. 최근 선정/탈락 결과
7. Provider 장애

예:

```text
신규 AI 추천                 7
긴급 검토                    2
GO/HOLD/NO-GO                3
D-3 이하 Proposal            2
제출 미완료                   1

RoboBid AI 추천
1. 로봇 실증사업 / Opportunity 91 / PASS
2. 스마트팜 자동화 / Opportunity 86 / Review 1

오늘의 업무
□ A사업 GO 결정
□ B사업 기술검토
□ C사업 인증서 보완
```

KPI 카드 남발을 금지한다.

---

# 10. Opportunities Workspace

상태:

```text
신규
AI 추천
검토
GO
HOLD
NO-GO
제안 중
제출
선정
탈락
```

필터:

- 사업유형
- Provider
- 기관
- 분야
- 지역
- 사업비
- 마감 D-Day
- Eligibility
- Opportunity Score
- 키워드

공모 상세:

- 공고 기본정보
- RFP 핵심요약
- Eligibility
- Opportunity Score
- Capability Match
- AI 분석
- 요구사항
- 가점
- Risk
- 제출서류
- 첨부문서
- 유사 공모
- 내부 메모
- GO/HOLD/NO-GO

---

# 11. Provider Ingestion Architecture

사이트별 로직을 UI/비즈니스 로직에 직접 결합하지 않는다.

```text
Provider Adapter
→ Fetch
→ Normalize
→ Validate
→ Deduplicate
→ Persist
→ Parse Attachments
→ Classify
→ Notify
```

상태:

```text
CONNECTED
DEGRADED
KEY_MISSING
RATE_LIMITED
FAILED
MANUAL_ONLY
```

금지:
- API Key 존재만으로 CONNECTED 표시
- 실패를 성공처럼 표시
- 운영 DB에 Sample 공고 삽입

---

# 12. Public Data Strategy

우선순위:

```text
1. 공식 Open API
2. 공식 RSS/JSON Feed
3. 공식 공개 페이지
4. 사용자 URL 추가
5. 파일 직접 업로드
```

로그인/CAPTCHA/접근제어 우회를 하지 않는다.

핵심 Provider 후보:

### 조달청/나라장터
- 입찰공고
- 낙찰
- 계약
- 사전규격
- 공고변경
- 공공데이터포털 공식 Open API 우선

### K-Startup
- 창업·사업화·실증·지원사업 공고
- 공식 Open API 우선

### 기업마당
- 중앙부처·지자체·유관기관 지원사업
- 공식 지원사업정보 API 우선

### 국고보조금 공모사업
- 국고보조금 공모사업 Open API

### IRIS
- 사업사전안내
- 공모예고
- 사업공고
- 공식 API가 확정되면 API Adapter
- 그렇지 않으면 이용정책을 준수하는 공개페이지 Adapter 또는 사용자 URL/파일 입력

추가 Provider는 Adapter로 확장한다.

---

# 13. Near Real-Time Collection

Webhook이 없는 Provider는 Polling이다.

목표:

```text
핵심 Provider: 5~15분
일반 Provider: 30~60분
저우선 Provider: 2~6시간
```

Provider 정책/Rate Limit이 우선한다.

---

# 14. Scheduler

무료 우선 MVP:

```text
Supabase Cron
→ Edge Function Dispatcher
→ Provider Adapter
→ Opportunity DB
→ Classification
→ Notification
```

장기/무거운 작업은 별도 Worker로 분리한다.

---

# 15. Deduplication

우선순위:

```text
provider + source_id
→ official_notice_number
→ canonical_url
→ normalized title + agency + dates
→ content_hash
```

수정공고는 신규 공고가 아니라 Version/Change Event로 기록한다.

---

# 16. Document Ingestion

지원:

```text
PDF
HWP
HWPX
DOCX
XLSX
ZIP
```

파이프라인:

```text
Download/Upload
→ MIME Validation
→ Hash
→ Parse
→ Structure/Table Extraction
→ Requirement Extraction
→ Chunk
→ Embed
→ Evidence Index
```

HWP:
- HWPX: XML 파싱 우선
- Legacy HWP: 독립 Document Worker
- 실패 시 명확한 오류와 수동 변환 경로

---

# 17. Eligibility Gate

LLM보다 deterministic Rule Engine을 우선한다.

검사:

- 기업 유형
- 기업규모
- 업력
- 지역
- 매출/재무 조건
- 인증/특허
- 참여제한
- 컨소시엄
- 자기부담금
- 필수인력
- 유사실적
- TRL
- 신청기간

상태:

```text
PASS
FAIL
REVIEW_REQUIRED
UNKNOWN
```

UNKNOWN을 PASS로 변환하지 않는다.
모든 판단에는 RFP Evidence를 연결한다.

---

# 18. Company Capability Vault

핵심 자산:

```text
CompanyProfile
Technology
Product
Patent
Certification
ProjectHistory
Reference
EmployeeSkill
Equipment
FinancialProfile
Partner
PastProposal
AwardHistory
LossHistory
EvaluationFeedback
```

메타데이터:

```text
title
type
description
valid_from
valid_until
evidence_file
verification_status
owner
confidentiality
updated_at
```

만료 인증·재무자료 자동 경고.

---

# 19. Opportunity Score

MVP에서 “수주 확률”이라는 표현을 사용하지 않는다.

예시:

```text
Eligibility        Gate
Technical Fit      25
Strategic Fit      20
Capability Fit     20
Evidence Readiness 15
Financial Fit      10
Schedule Readiness 10
Risk Penalty        -
```

0~100 점수.
가중치는 관리자 조정 가능.

AI가 임의 숫자를 생성하지 않는다.
정량 Rule + Evidence 기반 LLM Classification을 결합한다.

예:

```text
Opportunity Score 84

강점
- 보유 이동로봇 기술과 요구기술 일치
- 유사 실증실적 보유

확인 필요
- 필수 인증 최신본
- 컨소시엄 조건
```

---

# 20. Win Probability — Future

실제 labeled Outcome 데이터가 축적된 뒤 별도 모델로 도입한다.

필수 데이터:

```text
opportunity
go_no_go
submitted
awarded/rejected
evaluation_score
evaluation_feedback
award_amount
competitor_count_if_public
```

Opportunity Score와 Win Probability를 혼동시키지 않는다.

---

# 21. GO / HOLD / NO-GO

예:

```text
Eligibility        PASS
Opportunity        86
Technical Fit      91
Capability         83
Evidence           72
Schedule Risk      HIGH

Recommendation
GO WITH CONDITIONS

1. 인증 최신본 확인
2. ROS2 수행역량 확인
3. D-10 이전 기술초안 완료

[GO] [HOLD] [NO-GO]
```

결정 사용자/시각/근거를 Audit Log에 기록한다.

---

# 22. Proposal Workspace

GO 승인 시 생성:

```text
공고/RFP
요구사항
목차
사업전략
기술개발내용
System Architecture
WBS
KPI
예산
BOM
추진체계
회사실적
Evidence
Compliance
Review
Export
```

---

# 23. Proposal AI

MVP 목표: 완성본 무인 작성이 아니라 70~80% 수준의 초안.

규칙:

1. RFP 요구사항 우선
2. 회사 Capability Evidence 우선
3. 근거 없는 실적 생성 금지
4. 근거 없는 수치 생성 금지
5. 추정은 가정으로 표시
6. 미확인은 TODO
7. 금액합계 검증
8. Requirement Traceability 유지
9. 최종 제출내용은 사람이 승인

---

# 24. Compliance Checker

Requirement Matrix:

```text
REQ-001
REQ-002
...
```

상태:

```text
SATISFIED
PARTIAL
MISSING
NOT_APPLICABLE
REVIEW_REQUIRED
```

Proposal Section/Evidence와 연결.
필수 Requirement가 MISSING이면 강한 제출 경고.

---

# 25. Submission Control

MVP에서 자동 제출하지 않는다.

```text
D-30 공고발견
D-21 GO
D-14 1차초안
D-10 기술검토
D-7 예산
D-5 증빙
D-3 최종검토
D-1 제출권고
```

Checklist:

- 필수서류
- 서명/날인
- 파일형식
- 파일크기
- 제출 URL
- 제출계정 담당자
- 마감시간
- 최종파일
- 제출완료 확인

---

# 26. Notifications

MVP:

### Telegram
- 신규 고적합 공모
- Critical 마감
- GO/HOLD 대기
- 제출 누락
- Provider 장애

### In-App
모든 업무 알림.

### Browser Push
PWA/브라우저 알림.

P1:
### Kakao AlimTalk
Notification Adapter로 추가하며 무료 핵심 인프라로 가정하지 않는다.

```text
NotificationService
 ├ TelegramAdapter
 ├ WebPushAdapter
 ├ KakaoAdapter
 └ FutureAdapter
```

---

# 27. RoboBid AI

사용자에게는 하나의 `RoboBid AI`.

내부 논리 역할:

- Opportunity Analyst
- Eligibility Analyst
- RFP Analyst
- Technical Planner
- Proposal Writer
- Financial Planner
- Compliance Reviewer
- Evidence Researcher

MVP에서는 복잡한 멀티에이전트보다 deterministic workflow + 역할별 prompt/tool을 우선한다.

---

# 28. RAG

소스:

```text
공모원문
RFP
첨부자료
회사 Capability
과거 제안
선정/탈락 자료
평가의견
기술자료
인증/특허
```

검색:

```text
Metadata Filter
+ PostgreSQL Full Text
+ Vector Similarity
```

Hybrid Retrieval.
문서명/페이지/섹션/Source ID를 유지한다.

---

# 29. AI Provider Strategy

특정 모델에 강결합하지 않는다.

```text
AIProvider
  generate()
  embed()
  classify()
  extractStructured()
```

예:
- Gemini
- OpenAI
- Anthropic
- Local/Ollama
- Future

공개 공고자료와 회사 기밀자료 정책을 분리한다.

---

# 30. Confidential AI Policy

기밀 데이터:

- 재무
- 원가/BOM
- 가격전략
- 미공개 기술
- 내부 인력정보
- 비공개 제안서
- 협력사 계약
- 내부 평가
- 기관 비공개정보

정책:

```text
PUBLIC RFP
→ 승인된 무료/저비용 AI 가능

CONFIDENTIAL COMPANY DATA
→ 개인정보/데이터 사용조건이 적합한 유료 API 또는 승인된 Local Model
```

무료 외부 AI로 내부 기밀을 무조건 보내지 않는다.

---

# 31. Free-First Technical Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod
- 필요 시 TanStack Table

## Mobile
- Responsive Web
- PWA
- Native iOS/Android는 MVP 제외

## Backend
- Supabase PostgreSQL
- Auth
- RLS
- Private Storage
- Edge Functions
- pgvector
- pg_trgm
- pg_cron/cron 기능

## Notifications
- Telegram Bot
- Web Push

## Document Worker
- Python 또는 Node Container Worker
- HWP/PDF/ZIP/표 처리
- Web 서버와 분리 가능하게 설계

---

# 32. Hosting Strategy

Prototype:
- Local Development
- GitHub
- Preview Deployment

Web App:
- Vercel 또는 호환 가능한 Next.js Hosting
- 특정 Hosting Vendor에 과도하게 Lock-in하지 않는다.

회사 핵심업무로 전환할 경우 Free plan의 안정성/이용조건을 재검토한다.

---

# 33. File Storage

Supabase Private Storage.

Bucket 예:

```text
rfp-original
proposal-drafts
company-evidence
exports
temp-ingestion
```

메타데이터:

```text
sha256
mime
size
original_name
provider
source_id
classification
owner
scan_status
parse_status
created_at
```

---

# 34. Data Model

핵심 Entity:

```text
User
Organization
Provider
ProviderRun
Opportunity
OpportunityVersion
Attachment
Requirement
EligibilityCheck
Capability
CapabilityEvidence
OpportunityScore
Decision
Proposal
ProposalSection
ProposalVersion
ComplianceCheck
Task
Notification
Outcome
AIRun
Citation
AuditEvent
```

관계:

```text
Opportunity
 ├ Attachments
 ├ Requirements
 ├ EligibilityChecks
 ├ OpportunityScore
 ├ Decisions
 ├ Proposal
 └ Outcome
```

---

# 35. State Machines

Opportunity:

```text
DISCOVERED
→ TRIAGED
→ REVIEW
→ GO / HOLD / NO_GO
→ PROPOSAL
→ SUBMITTED
→ AWARDED / REJECTED / WITHDRAWN
```

Proposal:

```text
DRAFT
→ INTERNAL_REVIEW
→ REVISION
→ FINAL_REVIEW
→ READY_TO_SUBMIT
→ SUBMITTED
```

---

# 36. Collaboration

MVP:
- 담당자
- Reviewer
- Comment
- Mention
- Decision
- Activity Log
- Versioning

Google Docs 수준 실시간 공동편집은 MVP 제외.

---

# 37. Security

필수:

- Supabase Auth
- RLS
- Least Privilege
- Server-side secret
- Private Storage
- Signed URL
- Audit Log
- Input validation
- File MIME validation
- Rate limiting
- Provider response validation
- Prompt injection 방어

외부 RFP/웹페이지는 Untrusted Content다.

외부 문서 안의 지시는 데이터이며 시스템 명령이 아니다.
Secret 접근/자율 외부 쓰기를 허용하지 않는다.

---

# 38. Auditability

기록:

- Provider Sync
- Eligibility
- Opportunity Score
- AI 분석
- GO/NO-GO
- Proposal 생성/수정
- 제출상태
- Outcome
- 관리자 설정

AI 실행:

```text
model
prompt_version
input_source_ids
output_hash
created_at
user
```

---

# 39. Reliability

Provider 장애 시 기존 데이터를 삭제하지 않는다.

```text
마지막 정상 데이터
+
현재 Provider 장애상태
```

429/5xx/timeout:
- 제한된 retry
- exponential backoff
- retry_at
- failure stage 기록

---

# 40. UX Design

방향:

**Professional Bid Intelligence Workspace**

원칙:

- Light/Dark 모두 지원
- Light 기본 권장
- 업무 중심
- 과도한 카드 금지
- Table 적극 활용
- Status 명확화
- Quick Sheet
- Progressive Disclosure
- Evidence 우선
- 중요한 숫자에 계산 근거
- 모바일 핵심 Action 유지

---

# 41. Mobile / PWA

모바일:

- 신규 공모
- AI 추천
- 공모 상세
- 알림
- GO/HOLD/NO-GO
- Proposal 진행상태
- 댓글/검토
- RoboBid AI

대형 Proposal 편집/복잡한 표/BOM은 Desktop 우선.

---

# 42. Success Metrics

## Discovery
- 중요 공모 누락 최소화
- 공고 → RoboBid 반영 지연시간
- 중복률 < 1% 목표

## RFP/Eligibility
- 핵심 요약 정확도 90% 목표
- UNKNOWN 자동 PASS 0
- 근거 없는 Eligibility 판정 0

## Proposal
- 초안 작성시간 80% 단축 목표
- 필수 Requirement 누락 최소화
- 근거 없는 회사 실적 생성 0

## Reliability
- Fake Connected 0
- Production Sample Opportunity 0
- Secret 노출 0

---

# 43. MVP Exit Criteria

1. 핵심 Provider 3개 이상 실데이터 수집
2. 중복 제거
3. 로봇 중심 추천
4. Telegram 알림
5. PDF/HWP 계열 문서 Ingestion
6. Eligibility PASS/FAIL/REVIEW
7. Capability Vault
8. Opportunity Score + 근거
9. GO/HOLD/NO-GO
10. Proposal 초안
11. Compliance Matrix
12. 제출 Checklist
13. Auth/RLS
14. 모바일 사용 가능
15. Provider 장애 표시
16. AI Evidence 표시
17. 운영 Sample 데이터 없음

---

# 44. Explicitly Out of MVP

- 자동 공모 제출
- 자동 계약
- 무인 가격결정
- 실제 Win Probability
- 대규모 Fine-Tuning
- Native iOS/Android
- 실시간 Google Docs급 편집
- 전문가 채용 자동화
- 외주업체 자동계약
- 전체 프로젝트 ERP
- 모든 지자체 사이트 동시 지원

---

# 45. Development Phases

```text
Phase 0 — Product/Technical Baseline & Source Verification
Phase 1 — App Foundation / Auth / Design System / Data Model
Phase 2 — Provider Ingestion + Opportunity DB
Phase 3 — Document Ingestion + RFP Parser
Phase 4 — Capability Vault + Eligibility
Phase 5 — Opportunity Score + GO/HOLD/NO-GO
Phase 6 — Notifications + Today Dashboard
Phase 7 — Proposal Workspace + RAG Draft
Phase 8 — Compliance + Submission Control
Phase 9 — Outcome Learning
Phase 10 — PWA + Security + Production Hardening
Phase 11 — Advanced AI / Win Probability / Post-Award Expansion
```

각 Phase 완료 후 자동으로 다음 Phase로 진행하지 않는다.

---

# 46. Antigravity CLI Development Contract

Repository 권장 구조:

```text
robobid-ai/
├ AGENTS.md
├ docs/
│  ├ product/
│  │  └ ROBOBID-AI-MASTER-PRD-v1.0.md
│  ├ architecture/
│  ├ decisions/
│  └ phases/
├ .agents/
│  ├ rules/
│  └ agents/
└ src/
```

Antigravity 작업 판단순서:

```text
1. 본 Master PRD
2. AGENTS.md 및 Workspace Rules
3. 승인된 Architecture Decision
4. 현재 Repository
5. Tests
```

개발 흐름:

```text
READ
→ AUDIT
→ PLAN
→ IMPLEMENT
→ TEST
→ VERIFY
→ REPORT
→ STOP
```

원칙:

- 한 번에 하나의 승인된 Phase만 수행한다.
- 다음 Phase를 자동으로 시작하지 않는다.
- 운영 데이터를 만들어내지 않는다.
- 공식 API 우선.
- Evidence 우선.
- Eligibility는 deterministic rule 우선.
- Opportunity Score를 Win Probability라고 부르지 않는다.
- 내부 기밀을 승인되지 않은 무료 외부 AI로 보내지 않는다.
- DB/Auth/Storage를 reset하지 않는다.
- 정상 기능을 승인 없이 삭제하지 않는다.
- Provider의 접근통제를 우회하지 않는다.

---

# 47. Cost Strategy

무료/오픈소스 우선:

- Next.js
- React
- TypeScript
- Tailwind
- shadcn/ui
- Supabase Free (개발/MVP)
- Telegram Bot
- 정부 Open API
- Open-source parser
- PWA
- Antigravity CLI

선택적 유료 우선순위:

1. 기밀자료용 AI
2. 안정적 DB/Backup
3. Storage
4. Document Worker
5. Kakao
6. Production Hosting

무료를 유지하기 위해 업무 안정성을 희생하지 않는다.

---

# 48. Locked Decisions

1. 로봇이 최우선 도메인이다.
2. 분야 자체는 완전히 제한하지 않는다.
3. 모든 공모 유형을 수집하되 분류한다.
4. Web + Responsive + PWA로 시작한다.
5. Capability Vault는 P0다.
6. 1차 목표는 수주 전 프로세스 최적화다.
7. 인력/외주는 후순위다.
8. Opportunity Score를 먼저 사용한다.
9. Win Probability는 실제 Outcome 데이터 이후 도입한다.
10. Telegram이 초기 핵심 알림 채널이다.
11. 공식 API가 최우선이다.
12. AI 판단은 Evidence와 연결한다.
13. 회사 기밀자료는 별도 AI 개인정보 정책을 적용한다.
14. Antigravity CLI에서 Phase 단위로 개발한다.

---

# 49. Definition of Done

기능은 다음을 충족해야 완료다.

- 실제 User Job 해결
- 실데이터 또는 정확한 Empty/Error 상태
- Loading
- Empty
- Error
- Permission
- Auth/RLS
- Audit
- Evidence
- Responsive
- Accessibility
- Test
- Security check
- Production compatibility

“화면이 보인다” 또는 “Build가 된다”만으로 완료 처리하지 않는다.

---

# 50. Final Product Statement

> **RoboBid AI는 로봇을 중심으로 정부·지자체·공공기관의 사업기회를 놓치지 않고 발견하고,
> 회사의 실제 역량과 RFP를 근거로 지원 가능성과 기회가치를 판단하며,
> GO/NO-GO부터 사업계획서·Compliance·제출관리까지 연결하여
> 공공사업 수주업무의 속도와 신뢰성을 동시에 높이는 AI BidOps Intelligence Platform이다.**

---

# 51. Official Reference Starting Points

- Google Antigravity CLI: https://antigravity.google/docs/cli/getting-started/
- Antigravity CLI Agents: https://antigravity.google/docs/cli/commands/agents/
- Antigravity Workspace Rules: https://antigravity.google/docs/ide/rules/
- 공공데이터포털: https://www.data.go.kr/
- K-Startup Open API: https://nidview.k-startup.go.kr/
- 기업마당 API: https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi
- IRIS: https://www.iris.go.kr/
- Telegram Bot API: https://core.telegram.org/bots/api
- Supabase: https://supabase.com/
