# 00. RoboBid AI v2.0 현재 구현 상태 전수 감사 (Current Baseline Audit)

> **문서 상태**: Final Current Baseline Audit  
> **감사 일자**: 2026-09-07  
> **감사 담당**: Principal Product Engineer & Software Architect  
> **기준 저장소**: `RoboBid` (Git Branch: `master`, Commit: `9c40cf3`)

---

## 1. 개요 및 감사 목적

본 감사는 **RoboBid AI v2.0의 실제 소스 코드, 파일 시스템, 데이터 모델, API 엔드포인트, 테스트 스위트, 외부 서비스 연동 상태**를 전수 조사하여, 향후 **RoboBid AI v3.0 (Robot Funding & Venture Intelligence Platform)**으로의 안전한 인플레이스(In-place) 마이그레이션을 위한 기술적 기준선(Technical Baseline)을 확립하는 것을 목적으로 한다.

문서상 기록과 실제 코드베이스 간의 불일치를 식별하고, 보존해야 할 핵심 자산과 전환 대상을 명확히 정의한다.

---

## 2. 실제 코드베이스 아키텍처 및 현황

### 2.1 디렉토리 및 프레임워크 구조
- **Framework**: Next.js 14.2.35 (App Router 기반, Node.js 24 런타임)
- **Language & Types**: TypeScript (Strict Mode 활성화, `tsc --noEmit` 무오류 통과)
- **Styling & UI**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Tremor/shadcn 스타일 패턴
- **State & Storage**:
  - `globalThis` 싱글톤 캐시 기반 인메모리 스토어 (서버 사이드)
  - 브라우저 `localStorage` 자동 동기화 엔진 (클라이언트 사이드 세션 유지)
  - Supabase Cloud PostgreSQL (클라우드 DB 이중화 및 RLS 보안)
- **AI 추론 엔진**:
  - Google Gemini 2.5 Flash / Pro (기본 가동 중, 15 RPM 무료 티어 활용)
  - 멀티 LLM 어댑터 (OpenAI GPT-4o, Claude 3.5 Sonnet, Groq, Upstage Solar, Ollama 지원 구조 내장)

---

## 3. App Router 라우트 및 페이지 감사 (18개 Pages)

| 구분 | 실제 경로 | 현재 라우트명 / 기능 | 상태 | v3.0 전환 방향 |
| :--- | :--- | :--- | :---: | :--- |
| **인증** | `/login` | 로그인 페이지 | 정상 | KEEP |
| **인증** | `/register` | 회원가입 페이지 | 정상 | KEEP |
| **대시보드** | `/today` | 일일 수주 지휘본부 & Action Center | 정상 | EXPAND (Funding Action 중심) |
| **공모** | `/opportunities` | 공모 탐색 & 360° 워크스페이스 | 정상 | EXPAND (Funding Opportunity 개편) |
| **파이프라인**| `/pipeline` | 수주 파이프라인 (Bid Room 연계) | 정상 | MOVE / MERGE (Funding Portfolio) |
| **업무** | `/tasks` | 제안/수주 관련 WBS 업무 협업 | 정상 | EXPAND (Project WBS 연계) |
| **RFP** | `/rfp` | RFP 다차원 분석 & 실격 위험 감지 | 정상 | KEEP / EXPAND |
| **제안서** | `/proposals` | AI 제안서 작성 & 심사위원 교차검증 | 정상 | EXPAND (R&D/지원사업 표준 서식) |
| **제출** | `/submissions` | 제출 체크리스트 (Zero-Auto-Submit) | 정상 | KEEP (Human Sign-off 유지) |
| **자산** | `/vault` | 사내 역량 자산 볼트 | 정상 | EXPAND (Project Concept 분리) |
| **증빙** | `/evidence` | 공공 증빙자료 라이브러리 | 정상 | KEEP |
| **분석** | `/intelligence` | 개찰 분석 & 수주 인텔리전스 | 정상 | MOVE (조달/판로 보조도구로 이동) |
| **회고** | `/learning` | Win/Loss 회고 및 자가학습 | 정상 | MERGE (Intelligence 하위) |
| **도구** | `/tools` | 복수예비가격 및 A값 투찰 계산기 | 정상 | MOVE (조달/판매 지원도구) |
| **AI** | `/ai` | RoboBid AI 코파일럿 대화창 | 정상 | EXPAND (Funding Scout AI) |
| **알림** | `/notifications`| 텔레그램 및 인앱 알림 센터 | 정상 | KEEP / EXPAND |
| **설정** | `/settings` | API 키 및 시스템 환경설정 | 정상 | EXPAND |
| **루트** | `/` | 랜딩 및 대시보드 리다이렉트 | 정상 | KEEP |

---

## 4. 백엔드 API 라우트 전수 감사 (31개 API Routes)

| 영역 | 엔드포인트 | 메서드 | 현재 역할 | v3.0 지속 여부 |
| :--- | :--- | :---: | :--- | :---: |
| **AI** | `/api/ai/copilot` | POST | 공모 및 사내 역량 기반 AI 문답 | KEEP / EXPAND |
| **문서** | `/api/documents/parse` | POST | HWPX/DOCX/PDF 텍스트 파싱 | KEEP |
| **문서** | `/api/documents/parse-rfp` | POST | RFP 5대 핵심 영역 자동 구조화 | KEEP |
| **자격** | `/api/eligibility/evaluate` | POST | 참가자격 및 결격사유 평가 | EXPAND (Applicant Stage) |
| **시스템** | `/api/health` | GET | 서비스 헬스 체크 | KEEP |
| **수집** | `/api/ingestion/status` | GET | Provider별 연결 상태 조회 | KEEP |
| **수집** | `/api/ingestion/sync` | POST | KONEPS/기업마당 실시간 공모 수집 | EXPAND (Funding Source) |
| **개찰** | `/api/koneps/opening-results`| GET | 조달청 개찰결과 대사 | MOVE (조달 보조) |
| **알림** | `/api/notifications` | GET/POST | 인앱 알림 조회 및 생성 | KEEP |
| **알림** | `/api/notifications/push` | POST | Web Push 알림 발송 | KEEP |
| **알림** | `/api/notifications/telegram/test` | POST | 텔레그램 연동 테스트 | KEEP |
| **공모** | `/api/opportunities` | GET/POST | 공모 목록 조회, 등록, 의사결정 | EXPAND (Funding Model) |
| **공모** | `/api/opportunities/[id]/decision` | POST | Go/No-Go 의사결정 기록 | EXPAND (Apply/Pass) |
| **공모** | `/api/opportunities/[id]/score` | GET/POST | Fit Score 산출 및 조회 | EXPAND (14-Axis) |
| **성과** | `/api/outcomes` | GET/POST | 개찰 결과 및 수주/탈락 등록 | MOVE |
| **성과** | `/api/outcomes/[id]` | GET/PUT | 특정 성과 상세 관리 | MOVE |
| **성과** | `/api/outcomes/analytics` | GET | 수주 분석 지표 집계 | MOVE |
| **프로젝트**| `/api/projects` | GET/POST | 선정 후 개발 프로젝트 전환 | EXPAND (Post-Award) |
| **제안서** | `/api/proposals` | GET/POST | 제안서 목록 조회 및 생성 | EXPAND (Application) |
| **제안서** | `/api/proposals/[id]` | GET/PUT | 제안서 본문 및 섹션 수정 | EXPAND |
| **제안서** | `/api/proposals/[id]/compliance` | POST | RFP 요구조건 대사 검증 | KEEP |
| **제안서** | `/api/proposals/[id]/cross-review`| POST | 4대 심사위원 모의평가 | EXPAND (사업유형별) |
| **제안서** | `/api/proposals/[id]/draft` | POST | RAG 기반 제안서 초안 생성 | EXPAND |
| **제안서** | `/api/proposals/[id]/submission` | POST | 제출 준비 상태 검증 | KEEP |
| **제안서** | `/api/proposals/[id]/submission/confirm`| POST| 최종 제출 확인 서명(Sign-off) | KEEP |
| **제안서** | `/api/proposals/[id]/versions` | GET/POST | 제안서 버전 이력 관리 | KEEP |
| **제안서** | `/api/proposals/agency-templates` | GET | 기관별 표준 서식 목차 제공 | EXPAND (R&D/지원사업) |
| **준비도** | `/api/readiness` | GET | AI 신뢰도 및 모델 게이트 평가 | KEEP |
| **설정** | `/api/settings/keys` | GET/POST | API 키 등록 및 상태 관리 | KEEP |
| **대시보드**| `/api/today` | GET | Today 워크스페이스 종합 데이터 | EXPAND |
| **볼트** | `/api/vault` | GET/POST | 사내 특허/실적/인증 관리 | EXPAND |

---

## 5. 데이터베이스 및 스토리지 현황 (Supabase & In-Memory)

### 5.1 Supabase 마이그레이션 이력 (10개 SQL 파일)
1. `20260904000000_phase1_core_schema.sql` (조직, 사용자, 프로바이더, 공모 코어)
2. `20260904010000_phase3_rfp_schema.sql` (RFP 분석결과, 요구조건 매트릭스)
3. `20260904020000_phase4_vault_and_eligibility.sql` (역량 볼트, 자격 검증 규칙)
4. `20260904030000_phase5_scoring_and_decisions.sql` (Fit Score, Go/No-Go 결정 이력)
5. `20260904040000_phase6_notifications.sql` (인앱/텔레그램 알림 큐 및 이력)
6. `20260904050000_phase7_proposals.sql` (제안서, 섹션, 버전, 심사위원 모의평가)
7. `20260904060000_phase8_compliance_and_submission.sql` (제출 체크리스트, 서명)
8. `20260904070000_phase9_outcomes.sql` (개찰 결과, 성과 분석, 회고)
9. `20260904080000_phase10_web_push.sql` (웹 푸시 구독 정보)
10. `20260904090000_phase11_post_award.sql` (선정 프로젝트, WBS 마일스톤, 인력, 외주RFP)

### 5.2 영속성 전략 평가
- **Supabase Cloud**: PostgreSQL 기반 완전한 스키마와 RLS(Row Level Security) 정책이 확립되어 있음.
- **In-Memory & LocalStorage Dual Layer**:
  - `OpportunityStore`, `VaultStore`, `TaskStore` 등은 `globalThis`를 통해 Next.js API 리로드 간 상태가 유지되며, 브라우저 `localStorage`와 자동 양방향 동기화됨.
  - 이 구조 덕분에 외부 DB 일시 장애 시에도 클라이언트는 무단 중단 없이 100% 가동됨.

---

## 6. 테스트 스위트 및 빌드 기준선 (Baseline Metrics)

### 6.1 테스트 통과 현황 (전수 검증 완료)
- **테스트 러너**: Vitest v1.6.0
- **테스트 파일 수**: **55개 파일 (55 passed / 100%)**
- **단위 테스트 수**: **164개 테스트 (164 passed / 100%)**
- **소요 시간**: ~19.9초
- **주요 테스트 영역**:
  - A값 투찰 계산 및 사정율 산정 로직 검증
  - Zero-Auto-Submission 및 Zero-Auto-Contract 불변식 검증
  - 승률(Win Probability) 성급한 단정 금지 원칙 검증
  - 프롬프트 인젝션 방어 및 문서 파싱 검증
  - HWPX/DOCX 파서 및 테이블 추출 검증
  - KONEPS/기업마당 Open API 어댑터 인입 및 중복제거 검증
  - RBAC 권한 분리 및 Vault 만료일 사전 감지 검증

### 6.2 컴파일 및 프로덕션 빌드 현황
- **TypeScript 타입 체크 (`npm run typecheck`)**: **0 Errors (PASS)**
- **Next.js 프로덕션 빌드 (`npm run build`)**: **39개 라우트 정상 생성 (PASS)**
- **Lint 검사 (`npm run lint`)**: PASS

---

## 7. 문서 vs 실제 코드베이스 차이점 분석 (Discrepancy Report)

| 항목 | 문서 기록 (PRD v2.0) | 실제 코드베이스 현황 | 분석 및 판단 |
| :--- | :--- | :--- | :--- |
| **Post-Award 프로젝트 전환** | PRD v2.0에서는 후순위 확장 기능으로 기술 | `src/lib/projects/project-conversion-service.ts` 및 DB Phase 11 마이그레이션에 **이미 WBS, 인력계획, 외주용역 RFP 초안 생성 로직이 기구현**되어 있음. | **v3.0 Post-Award 개발 전환에 즉시 재사용 가능한 강력한 자산**으로 확인됨. |
| **포트폴리오 대시보드** | v2.0에서는 단일 공모 중심 서술 | `src/components/portfolio/portfolio-executive-dashboard.tsx`가 이미 존재함. | v3.0의 `Funding Portfolio` 기능으로 직결 확장 가능. |
| **KONEPS 타임아웃** | 기존 4초 기준 기록 | 실시간 수집 안정성을 위해 **10초로 확대 완료**되어 있음 (`koneps-adapter.ts`). | v3.0 안정성 기준 만족. |
| **공모 저장소 영속화** | 인메모리 위주로만 기록 | `globalThis` 및 `localStorage` 자동 백업 이중화가 구현 완료되어 있음. | v3.0에서도 클라이언트 데이터 유실 방지에 그대로 활용. |

---

## 8. 감사 결론

현재 RoboBid AI v2.0은 공공조달 및 일부 지원사업을 수집·분석·작성·제출·회고하는 견고한 기반(164개 전수 테스트 통과, 31개 API 라우트, 완전한 DB 스키마)을 갖추고 있다.

따라서 v3.0으로의 전환은 시스템을 처음부터 재작성하는 것이 아니라, **이미 검증된 핵심 파서, RAG, 보안 규칙, 외주/WBS 전환 엔진을 그대로 보존하면서 도메인의 무게중심을 '조달 입찰'에서 '로봇 개발 프로젝트 자금 확보(Funding Intelligence)'로 전환하는 인플레이스 고도화**로 안전하게 수행할 수 있다.
