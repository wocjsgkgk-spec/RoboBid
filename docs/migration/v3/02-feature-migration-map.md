# 02. 기존 v2.0 기능 마이그레이션 맵 (Feature Migration Map)

> **문서 상태**: Final Feature Migration Map  
> **기준일자**: 2026-09-07  
> **분류 기준**: `KEEP` / `EXPAND` / `MOVE` / `MERGE` / `REDESIGN` / `NEW` / `DEPRECATE_CANDIDATE` / `UNKNOWN`

---

## 1. 기존 v2.0 기능별 상세 마이그레이션 분류표

| 기존 v2.0 기능 모듈 | 마이그레이션 분류 | v3.0 목표 위치 및 역할 변경 상세 | 보호 및 호환성 조치 |
| :--- | :---: | :--- | :--- |
| **Today (일일 대시보드)** | **EXPAND** | • **위치**: 메인 대시보드 (`/today`)<br>• **변경**: 조달 입찰 마감 중심 ➔ **로봇 아이템별 신규 고적합 자금 기회, Early Signal, APPLY 결정 대기, 제출 D-Day, 포트폴리오 갭** 중심 재배치 | 기존 KONEPS 원클릭 수집 및 D-Day 카운트다운 유지 |
| **Opportunities (공모 관리)** | **EXPAND** | • **위치**: `지원기회` (`/opportunities`)<br>• **변경**: 입찰공고 중심 ➔ **R&D, 실증, 시제품, 창업지원, 경진대회 등 15대 Funding Taxonomy 분류 및 Project 매칭 뷰 추가** | 기존 실시간 수집, 검색, 수동 등록, CSV 배치 기능 100% 보존 |
| **RFP Analyzer (RFP 분석)** | **KEEP** | • **위치**: `지원준비 > RFP 분석` (`/rfp`)<br>• **역할**: HWPX/DOCX/PDF 5대 핵심 영역 자동 분석 및 실격 위험 필터링 | 기존 파싱 로직, 테이블 추출기, 실격 방어 규칙 100% 유지 |
| **Pipeline (수주 파이프라인)** | **MERGE / MOVE** | • **위치**: `Funding Portfolio` 및 `지원준비` 연계<br>• **변경**: 단순 5단계 수주 칸반 ➔ **로봇 개발 아이템별 자금 확보 단계(CANDIDATE ➔ PLANNED ➔ APPLIED ➔ AWARDED) 포트폴리오로 승격** | 기존 칸반 드래그 앤 드롭 UX 유지 |
| **Go / Hold / No-Go (의사결정)** | **EXPAND** | • **위치**: 공모 상세 및 파이프라인 내 의사결정<br>• **변경**: `APPLY` / `APPLY_WITH_CONDITIONS` / `HOLD` / `PASS` 체계 도입 (단, 조달공모는 GO/NO-GO 선택 유지) | 기존 의사결정 이력 DB 테이블(`bid_decisions`) 보존 |
| **Bid Room (입찰 룸)** | **MERGE** | • **위치**: `Application Workspace` (`/proposals` 또는 전용 워크스페이스)<br>• **변경**: 특정 공모별 제안서, WBS, 예산, 증빙, 작업을 통합 수행하는 작업장으로 흡수 | 공모별 협업 컨텍스트 유지 |
| **Proposal / RAG (제안서 엔진)** | **EXPAND** | • **위치**: `사업계획서` (`/proposals`)<br>• **변경**: 조달청 용역 서식 ➔ **정부 R&D 연구개발계획서, 중기부 사업계획서, 시제품/실증 계획서 템플릿 대폭 확충** | 기존 RAG 프롬프트, 목차 생성, 버전 관리 100% 유지 |
| **Cross Review (심사위원 평가)** | **EXPAND** | • **위치**: 제안서 상세 > 모의평가<br>• **변경**: 조달 중심 4대 위원 ➔ **R&D(기술/사업화/연구관리/재무), 창업지원(BM/시장성/팀/성장성), 실증(현장성/KPI) 등 사업유형별 심사위원 페르소나 자동 전환** | 기존 100점 만점 모의 채점 로직 및 피드백 유지 |
| **Vault (회사역량 볼트)** | **EXPAND** | • **위치**: `자료·역량 > 회사역량 볼트` (`/vault`)<br>• **변경**: 특허, 실적, 인증, 인력 관리 유지 + **Applicant Stage(창업 단계) 및 Missing Capability(부족 역량 확보 계획) 속성 추가** | 기존 클린 데이터 정책 및 만료일 알림 100% 보존 |
| **Evidence (증빙 라이브러리)** | **KEEP** | • **위치**: `자료·역량 > 증빙 라이브러리` (`/evidence`)<br>• **역할**: 필수 행정서류 및 실적 증빙 태그 관리, 제안서 1:1 대사 | 기존 파일 업로드 및 체크리스트 연동 유지 |
| **Submission (제출 점검)** | **KEEP** | • **위치**: `제출·심사` (`/submissions`)<br>• **역할**: Zero-Auto-Submit 원칙, 10대 제출 체크리스트, 담당자 최종 서명(Sign-off) | 자동 제출 방지 및 인간 승인 규칙 엄격 보존 |
| **Intelligence (수주 분석)** | **MOVE / EXPAND** | • **위치**: `Intelligence` (`/intelligence`)<br>• **변경**: 개찰 가격 중심 ➔ **지원사업 트렌드, 기관별 예산 동향, 반복 공고 주기(Calendar Forecast) 분석으로 확장** | 기존 개찰 통계 데이터 보존 |
| **Learning (사후 회고)** | **MERGE** | • **위치**: `Intelligence > 성과·학습` 하위 탭<br>• **역할**: 선정/탈락 원인 분석(Win-Loss Audit) 및 AI 제안서 피드백 루프 | 기존 회고 분석 로직 유지 |
| **Tasks (과업·일정 협업)** | **EXPAND** | • **위치**: 공모별 WBS 및 전체 업무 관리 (`/tasks`)<br>• **변경**: 제안 준비 일정 + **선정 후 개발 프로젝트 WBS 마일스톤 연계** | 기존 TaskStore 및 상태 전이 로직 유지 |
| **Tools (투찰가/A값 계산기)** | **MOVE** | • **위치**: `조달/판매 지원도구` (`/tools` 또는 `Intelligence > 조달도구`)<br>• **변경**: 메인 내비게이션에서 `조달/판매` 보조 도구로 이동하여 로봇 R&D/지원사업과의 시각적 혼선 해소 | A값 계산식, 복수예비가격 시뮬레이터 100% 보존 |
| **Settings (시스템 설정)** | **KEEP** | • **위치**: `설정` (`/settings`)<br>• **역할**: API 키 등록, 연결 테스트, 텔레그램 연동 관리 | 기존 설정 환경 100% 유지 |
| **Telegram (실시간 메신저)** | **KEEP / EXPAND** | • **역할**: 봇(`@robobid_mycompany_bot`) 실시간 푸시<br>• **확장**: 신규 공모/Go결정 외에 **Early Signal, Funding Portfolio Gap 경고, 마감 임박 알림 추가** | 기존 웹훅 및 발송 엔진 무중단 유지 |
| **KONEPS Integration** | **KEEP** | • **역할**: 조달청 나라장터 Open API 실시간 수집 및 개찰결과 대사 | 기존 10초 타임아웃 안정화 코드 유지 |
| **Bizinfo Integration** | **KEEP** | • **역할**: 중기부 기업마당 지원사업 실시간 수집 | 기존 연동 유지 |
| **Supabase Cloud & DB** | **KEEP / EXPAND**| • **역할**: PostgreSQL RLS 보안 데이터베이스 및 세션 저장소 | **Additive Migration만 허용 (DB Reset 절대 금지)** |
| **AI 추론 엔진 (Gemini 등)** | **KEEP / EXPAND**| • **역할**: 무료 고속 Gemini 2.5 Flash 기반 분석 및 멀티 LLM 지원 | 기존 에이전트 인터페이스 호환성 유지 |

---

## 2. v3.0 신규 도입 기능 목록 (`NEW`)

| 번호 | 신규 기능명 | 권장 라우트 / 위치 | 설명 |
| :---: | :--- | :--- | :--- |
| **N-1** | **Project Concept Vault** | `/projects` (개발아이템) | 회사가 개발하고자 하는 로봇 아이디어를 등록하고 기술개념, TRL, 목표 WBS로 점진적 구체화 |
| **N-2** | **Master Specification** | `/projects/[id]/master-spec` | 로봇 아이템별 단일 기준 명세서 (기술 아키텍처, BOM, 필요자금, 보안등급 정의) |
| **N-3** | **Funding Portfolio Manager**| `/portfolio` (Funding Portfolio) | 단일 로봇 프로젝트에 매칭된 여러 지원금의 조합 현황, 확보액, 펀딩 갭 시각화 |
| **N-4** | **14-Axis Evaluation & Fit** | `/opportunities/[id]` 내 탭 | 14개 축 다차원 평가 프로파일 및 비목별 개발비 충당률(Coverage) 산출 |
| **N-5** | **Funding Conflict Checker** | `/portfolio/conflicts` | 프로젝트 내 지원사업 간 동일 비목/동일 기간 중복계상 위험 감지 |
| **N-6** | **Early Signal Monitor** | `/opportunities/signals` | 사업시행계획, 수요조사, 사전예고 등 공고 전 단계 조기 신호 추적 |
| **N-7** | **Secure Outsourcing Generator**| `/projects/[id]/outsourcing` | Master Spec에서 내부 기밀을 자동 블라인드 처리하고 외주용 RFP/과업지시서 생성 |
| **N-8** | **Award Workspace** | `/awards` (선정·개발) | 선정 후 협약 금액, 프로젝트 기간, 전담기관 규정 등록 및 개발 프로젝트 착수 |

---

## 3. 폐기 대상 검토 (`DEPRECATE_CANDIDATE` & `UNKNOWN`)

- **폐기 대상 없음 (`No Deprecation`)**:
  - v2.0의 모든 기존 기능(RFP 파서, A값 계산기, 개찰 분석, 텔레그램 알림 등)은 단 하나도 폐기하지 않는다.
  - 조달 중심 도구는 삭제하는 것이 아니라, **v3.0의 P1 조달/판매 하위 도구로 안전하게 이동(MOVE)**시킨다.
- **불명확 항목 (`UNKNOWN`)**: 없음 (전체 18개 페이지, 31개 API 라우트, 55개 테스트 파일의 역할 및 마이그레이션 경로 100% 식별 완료).
