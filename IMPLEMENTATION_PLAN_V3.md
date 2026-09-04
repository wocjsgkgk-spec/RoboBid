# RoboBid AI — 3차 제품가치·업무완성도 고도화 실행 계획서 (v3.0)

> **상태**: 사용자 승인 대기 중 (Draft Plan for Review)  
> **목표**: 외부 API 추가 없이, 기존 v2.0 기반의 분절된 기능들을 **"공공사업 수주 운영체계(Bid Operations System)"**로 통합 연결하고, 실무 업무 흐름(Workflow)을 단순화하며 판단 근거를 극대화하는 Internal Product Expansion & UX Integration 완료.

---

## 1. Goal Description & Scope

현재 RoboBid AI는 39개 라우트, 54개 테스트 스위트(156개 테스트 케이스 100% 통과), Google Gemini AI, 중기부 기업마당, 텔레그램 실시간 알림 등 핵심 기능들이 정상 동작하고 있습니다.  
그러나 사용자가 공모를 검토하고, 제안서를 작성하고, 제출을 관리할 때 **각 메뉴를 오가며 정보를 직접 조합해야 하는 분절점**이 존재합니다.

이번 3차 고도화의 핵심 목표:
1. **Opportunity 360° Workspace**: 공모 상세 하나에서 요약, 자격, RFP, 적합도, GO결정, 제안서, 증빙, 태스크, 제출 상태를 원스톱으로 파악.
2. **Action Center**: 단순 알림(Notification)과 구분하여 사용자가 즉시 처리해야 하는 일(Action)을 `CRITICAL / HIGH / NORMAL`로 자동 도출.
3. **Compliance Matrix**: 모든 RFP 요구사항을 구조화(`SATISFIED / PARTIAL / MISSING / REVIEW_REQUIRED / NOT_APPLICABLE`)하고 필수 누락 시 제출 차단.
4. **Bid Room**: GO 결정된 사업마다 제안서, 태스크, 증빙, 담당자, 타임라인을 묶는 전용 프로젝트 공간 생성.
5. **Proposal Quality Gate**: 4대 심사위원 평가와 연계하여 10개 평가 축 기준 `READY` 여부 및 Blocker 판정.
6. **Data Origin / DEMO 분리**: `DEMO`, `USER`, `IMPORT`, `API`, `SYSTEM` 출처 구분 및 실제 회사 KPI 왜곡 방지.
7. **Global Search & Command Palette (Ctrl+K)**: 공모, 제안서, 증빙, 태스크 즉시 검색 및 바로가기 액션.
8. **Navigation 4대 그룹 재구성**: `운영`, `분석·제안`, `지식·자산`, `지원`의 논리적 접이식 사이드바.

---

## 2. STEP 1 — 현재 시스템 Audit (기능 분류)

기존 정상 기능의 파괴 없이 다음 기준으로 분류합니다:
* `KEEP`: 현재 완성도가 높고 그대로 유지
* `EXPAND`: 실무 가치와 데이터 필드를 보강
* `CONNECT`: 다른 메뉴/데이터와 양방향 연결
* `MERGE`: 중복 또는 분절된 뷰를 통합
* `REDESIGN`: UX 및 업무 중심 화면으로 재설계
* `NEW`: 3차 신규 도입 컴포넌트
* `FUTURE`: 외부 API 및 장기 Phase로 분류 (이번 작업 제외)

| 기존 메뉴 / 라우트 | 현 상태 | 3차 분류 | 고도화 조치 및 연결 계획 |
| :--- | :---: | :---: | :--- |
| **`/today`** | 활성 | **EXPAND & CONNECT** | 상단에 **Action Center (`CRITICAL / HIGH / NORMAL`)** 배치, 1-클릭 즉시 처리 연결 |
| **`/opportunities`** | 활성 | **REDESIGN & CONNECT** | 공모 클릭 시 **Opportunity 360° Workspace** (헤더 상태바 7종 + 10대 탭) 전면 탑재 |
| **`/pipeline`** | 활성 | **CONNECT** | GO 결정 시 자동으로 **Bid Room** 활성화 및 Opportunity 360과 상태 동기화 |
| **`/rfp`** | 활성 | **EXPAND & CONNECT** | **Compliance Matrix** 구조화 테이블 및 5대 영역 파싱 결과와 제안서 목차 매핑 |
| **`/proposals`** | 활성 | **EXPAND & CONNECT** | **Proposal Quality Gate** (0~100점, BLOCKER / HIGH 판정) 및 Cross-Review 연동 |
| **`/submissions`** | 활성 | **CONNECT** | Compliance Matrix의 필수 누락(`MISSING`) 및 Quality Gate 미달 시 **제출 차단 배너** 연동 |
| **`/vault`** | 활성 | **EXPAND** | 자산별 `origin: "DEMO" \| "USER"` 적용 및 인증서 D-Day 만료 경고를 Action Center에 전달 |
| **`/evidence`** | 활성 | **CONNECT** | Proposal Section 및 Compliance Matrix 증빙 인용과 1:1 양방향 링크 |
| **`/tasks`** | 활성 | **CONNECT** | 공모, RFP 요구사항, 제안서 섹션, 제출 체크리스트에서 **Contextual Task 생성** 지원 |
| **`/learning` & `/intelligence`** | 활성 | **EXPAND** | 탈락 원인 ➔ 개선 Action ➔ 제안서 피드백 루프 연결 (경쟁사 외부 수집은 FUTURE) |
| **`/tools`** | 활성 | **KEEP** | 투찰 하한가, 사정율 추정기 유지 |
| **`/settings`** | 활성 | **EXPAND** | DEMO Mode 토글 (`[실제 데이터만 보기]` vs `[데모 포함]`), Data Origin 관리 |
| **Global Search** | 활성 | **EXPAND & MERGE** | Ctrl+K 단축키 연동, Command Palette로 공모/태스크/제안서 즉시 실행 |
| **Sidebar Navigation** | 활성 | **REDESIGN** | 4대 그룹(운영, 분석·제안, 지식·자산, 지원) 접이식 UI 및 Progressive Disclosure |

---

## 3. 10대 P0 핵심 구현 과제 (이번 스프린트 범위)

1. **P0-1. Opportunity 360° Workspace**:
   * 상단 핵심 지표 바: `Eligibility` / `Opportunity Score` / `Decision` / `Proposal Progress` / `Compliance` / `Submission Readiness` / `D-Day`
   * 10대 통합 탭: `[요약]` `[Eligibility]` `[RFP]` `[회사 적합도]` `[GO/NO-GO]` `[Proposal]` `[Evidence]` `[Tasks]` `[Submission]` `[History]`
2. **P0-2. Action Center**:
   * `/today` 최상단에 `CRITICAL` / `HIGH` / `NORMAL` 우선순위 액션 카드 및 1-클릭 조치 버튼 연동
3. **P0-3. Compliance Matrix**:
   * 요구사항별 `SATISFIED / PARTIAL / MISSING / REVIEW_REQUIRED / NOT_APPLICABLE` 상태표, 통계 배너, 필수 누락 추적
4. **P0-4. Bid Room Workspace**:
   * GO 결정된 공모 대상 협업 룸 (요구조건, 제안서, 증빙, 태스크, 팀 담당자, 타임라인 통합)
5. **P0-5. Global Search & Command Center (Ctrl+K)**:
   * 공모/제안서/증빙/태스크 통합 검색 및 단축키 팔레트
6. **P0-6. Proposal Quality Gate**:
   * 10대 평가 축 기반 Readiness Score (0~100점), BLOCKER 및 구체적 개선 Action 제시
7. **P0-7. Data Origin / DEMO 분리**:
   * `DEMO`, `USER`, `IMPORT`, `API`, `SYSTEM` 태깅 및 실제 KPI 집계 제외 토글
8. **P0-8. Submission 연계 강화**:
   * Compliance Blocker 및 Quality Gate 미달 시 제출 방지, 휴먼 서명 확인
9. **P0-9. Contextual Task 생성 연계**:
   * 공모, RFP, 제안서, 체크리스트에서 컨텍스트가 유지된 Task 생성
10. **P0-10. Navigation 4대 그룹 재구성**:
    * 4대 그룹 접이식 사이드바 및 고대비 반응형 레이아웃 완성

---

## 4. 검증 계획 (Verification Plan)

1. **Automated Tests**:
   - `npm run typecheck` (0 Type Errors 유지)
   - `npm test` (기존 156개 테스트 및 신규 P0 테스트 100% Pass)
   - `npm run build` (39개 라우트 프로덕션 빌드 성공)
2. **Browser UX 검증 (Responsive & Interactions)**:
   - 390px, 768px, 1440px, 1920px 화면에서 깨짐 및 가로 스크롤 발생 여부 검사
   - Opportunity 360 탭 전환, Action Center 1-클릭 조치, Compliance Blocker 연동 테스트
