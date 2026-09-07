# 04. 내비게이션 및 UI 마이그레이션 계획 (Navigation Migration Plan)

> **문서 상태**: Final Navigation Migration Plan  
> **기준일자**: 2026-09-07  
> **핵심 목표**: 조달 중심 사이드바 구조를 **로봇 개발 및 Funding Operations 흐름에 부합하도록 재구성**하되, 기존 기능 링크의 호환성을 유지함.

---

## 1. 현재 사이드바 vs v3.0 목표 사이드바 구조 대조표

```text
[현재 v2.0 사이드바 구조]                      [v3.0 목표 사이드바 구조]
------------------------------------          ------------------------------------
1. 운영 (Operations)                           1. 메인 (Primary)
  • /today (오늘 & Action Center)               • /today (오늘)
  • /opportunities (공모 탐색 & 360°)           • /projects (개발아이템) [NEW]
  • /pipeline (수주 파이프라인)                  • /opportunities (지원기회) [EXPAND]
  • /tasks (과업 & 업무 협업)                    • /portfolio (Funding Portfolio) [NEW]

2. 분석·제안 (Analysis & Proposals)            2. 자금 지원 운영 (Funding Operations)
  • /rfp (RFP & Compliance)                     • /rfp (지원준비 / RFP) [RENAME]
  • /proposals (제안서 & Quality Gate)          • /proposals (사업계획서) [RENAME]
  • /submissions (제출·마감 점검)                • /submissions (제출·심사) [RENAME]

3. 지식·자산 (Knowledge & Assets)              3. 사후 실행 (Post-Award)
  • /vault (회사역량 볼트)                       • /awards (선정·개발) [NEW/EXPAND]
  • /evidence (자료·증빙 라이브러리)
  • /intelligence (수주 인텔리전스)              4. 지식·인텔리전스 (Knowledge)
  • /learning (성과·학습)                        • /vault (자료·역량) [MERGE: Vault+Evidence]
                                                • /intelligence (Intelligence) [MERGE: Intel+Learn]
4. 지원 & 설정 (Support & Settings)
  • /tools (계산도구 & 산식·규정)               5. 지원 & 시스템 (Support & System)
  • /ai (RoboBid AI 코파일럿)                    • /ai (RoboBid AI)
  • /notifications (알림 센터)                  • /notifications (알림)
  • /settings (설정 & Admin)                    • /settings (설정)
                                                • (/tools -> 조달/판매 지원도구로 하위 이동)
```

---

## 2. 세부 메뉴별 마이그레이션 규칙 (Mapping Table)

| 목표 v3.0 메뉴명 | 라우트 경로 | 기존 v2.0 소스 메뉴 | 변경 분류 | 상세 조치 및 UX 가이드 |
| :--- | :--- | :--- | :---: | :--- |
| **오늘** | `/today` | `/today` (오늘 & Action Center) | **EXPAND** | 이름 단순화 ("오늘"), 로봇 프로젝트별 고적합 자금 추천 및 D-Day 피드 반영 |
| **개발아이템** | `/projects` | 신규 라우트 | **NEW** | 회사가 개발할 로봇 아이디어 등록 및 Master Spec 관리 워크스페이스 신설 |
| **지원기회** | `/opportunities`| `/opportunities` (공모 탐색) | **EXPAND** | 이름 변경 ("지원기회"), 지원사업 15대 분류 필터 및 프로젝트 매칭 컬럼 추가 |
| **Funding Portfolio**| `/portfolio` | `/pipeline` 및 포트폴리오 대시보드 | **NEW / MERGE**| 단일 로봇 프로젝트에 매칭된 여러 자금의 조합 현황, 확보액, 펀딩 갭 시각화 |
| **지원준비** | `/rfp` | `/rfp` (RFP & Compliance) | **RENAME** | 공모 자격요건, 과업내용 분석 및 실격 방어 중심 화면으로 라벨링 개선 |
| **사업계획서** | `/proposals` | `/proposals` (제안서) | **RENAME** | 정부 R&D, 중기부 지원사업 표준 서식 템플릿 중심 작성 워크스페이스로 확장 |
| **제출·심사** | `/submissions` | `/submissions` (제출·마감) | **RENAME** | Zero-Auto-Submit 및 담당자 최종 서명, 제출 후 심사일정 추적 화면 |
| **선정·개발** | `/awards` | `src/lib/projects` (기존 코드 연동)| **NEW / REUSE**| 지원금 선정 등록 ➔ WBS/예산 집행 ➔ 외주 용역 RFP 초안 생성 워크스페이스 |
| **자료·역량** | `/vault` | `/vault` + `/evidence` | **MERGE** | 회사 역량(특허, 실적, 인증)과 공공 증빙자료를 탭 형태로 통합 관리 |
| **Intelligence**| `/intelligence`| `/intelligence` + `/learning` | **MERGE / EXPAND**| 지원사업 예산 동향, 주기성 분석, Win-Loss 회고 통합 |
| **RoboBid AI** | `/ai` | `/ai` (AI 코파일럿) | **KEEP / EXPAND**| 로봇 프로젝트 및 자금 매칭 전담 AI 어드바이저 |
| **알림** | `/notifications`| `/notifications` (알림 센터) | **KEEP** | 텔레그램 및 인앱 알림 통합 허브 |
| **설정** | `/settings` | `/settings` (설정 & Admin) | **KEEP** | API 키 관리 및 시스템 환경설정 |

---

## 3. 조달 전용 도구(투찰계산기, A값)의 안전한 이동 (MOVE)

### 문제점
- v2.0에서는 사이드바 메인 4번에 `/tools (계산도구 & 산식·규정, A값 백서)`가 직접 노출되어, "로봇 R&D 및 지원사업 플랫폼"을 기대하는 사용자에게 "조달 입찰 전용 프로그램"이라는 오해를 유발함.

### 해결 방안 (Safe Relocation)
1. **기능 100% 보존**: 기존의 정밀한 A값 계산기, 복수예비가격 시뮬레이터, 산식 백서는 전혀 삭제하지 않습니다.
2. **이동 위치**:
   - `Intelligence > [조달/판매 지원도구]` 탭 또는
   - 공모 상세 워크스페이스에서 해당 공모의 유형이 `PROCUREMENT` 또는 `SERVICE`일 때 나타나는 전문 툴킷 모달로 연결.
   - 기존 URL인 `/tools`로 직접 접근 시에도 정상 작동하며, "조달/구매 및 판매사업 지원도구"로 리브랜딩하여 제공.
3. 이로써 메인 내비게이션은 **로봇 개발 및 자금 확보(R&D, 지원사업)**에 집중되고, 조달 투찰 도구는 후속 판로 지원 기능으로 자연스럽게 위상 재정립.
