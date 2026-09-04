# RoboBid AI — Phase 5 Completion Report

- 문서 버전: v1.0
- 작성일시: 2026-09-04
- 담당: Principal Product Engineer / Software Architect
- 대상 Phase: Phase 5 (Opportunity Scoring & GO / NO-GO Decision Workflow)

---

## 1. 개요 및 목적

본 문서는 `ROBOBID-AI-MASTER-PRD-v1.0.md` (Section 19, 20) 및 `PHASE-05.md` 지침에 따라 구현된 공모 기회 다차원 정량 스코어링 엔진(Opportunity Scorer) 및 인간 의사결정 워크플로우(Decision Service)의 구현 및 검증 결과를 기록한다.

### 핵심 준수 원칙 및 Locked Decisions:
1. **Zero Hallucinated Numbers & Deterministic Weights**: PRD Section 19에 명시된 6대 영역 가중치(기술 25%, 전략 20%, 역량 20%, 증빙 15%, 재무 10%, 일정 10%)를 엄격히 적용하며, 임의 가중치 조작이나 모호한 점수 주입을 배제.
2. **Opportunity Score != Win Probability (절대 잠금 원칙)**:
   - 본 지표는 **"사업 적합도 및 내부 준비도 점수"**이며 결코 **"수주 확률(Win Probability)"이 아님**.
   - 실제 수주 결과(Outcome)가 누적되기 전까지 확률 표현을 엄격히 금지하며, UI 및 시스템 Rationale에 경고 배너와 고지 문구를 강제.
3. **Eligibility Gate Penalty Integration**:
   - 지원자격(Phase 4) 심사 결과가 `FAIL`인 경우 기회 점수에 30점의 강력한 감점(`riskPenalty`)을 부과하고 최종 추천을 즉시 `NO_GO`로 수렴.
4. **인간 중심 GO / HOLD / NO-GO 의사결정 (Audit Trail)**:
   - 시스템은 추천(`recommendedDecision`)과 점수 분석만 제시하며, 실제 공모 추진 여부는 권한을 가진 인간 검토자가 조건(Conditions) 및 승인 사유를 첨부하여 최종 확정.
   - 단일 공모에 대한 의사결정 변경 이력은 누적 감사 로그로 추적.

---

## 2. 구현 내역 상세

### 2.1 데이터베이스 스키마 확장
- `supabase/migrations/20260904030000_phase5_scoring_and_decisions.sql`:
  - Enums: `decision_type` (`GO`, `GO_WITH_CONDITIONS`, `HOLD`, `NO_GO`)
  - `opportunity_scores` 테이블:
    - 6대 영역 점수 (`tech_fit`, `strategic_value`, `capability_match`, `evidence_readiness`, `financial_fit`, `schedule_feasibility`)
    - 가중 종합 점수 (`total_score`), 리스크 감점 (`risk_penalty`), 지원자격 패널티 반영 여부
    - 시스템 추천 판정 (`recommended_decision`), AI 분석 근거 및 강점/리스크 요약 JSONB
  - `decisions` 테이블:
    - 최종 결정(`decision`), 결정자(`decided_by`), 결정 사유(`rationale`), 부대 조건 배열(`conditions` TEXT[])
    - 의사결정 시점의 점수 스냅샷(`score_snapshot_id`) FK 연동
  - `score_weights` 테이블: 조직별 맞춤형 가중치 구성 및 기본 6대 표준 가중치 시드
  - Row Level Security (RLS): 조직별 격리 및 `TECH_REVIEWER`, `BUSINESS_REVIEWER`, `BID_MANAGER`, `ADMIN` 권한 분립

### 2.2 기회 스코어링 엔진 (Opportunity Scorer)
- **`OpportunityScorer` (`src/lib/scoring/opportunity-scorer.ts`)**:
  - **기술 적합도 (25%)**: 공모 분야(기술 키워드)와 사내 TRL 수준, 보유 기술 자산 매칭도
  - **전략적 가치 (20%)**: 사업 규모, 전략적 키워드 부합도, 사업 방향성 정합도
  - **수행 역량 (20%)**: 필요 직무 인력 보유 수, 유사 사업 수행 실적 건수
  - **증빙 준비도 (15%)**: 필수 특허 및 인증서의 유효성 검사 (만료된 `EXPIRED` 자산 감점 배제)
  - **재무 적격성 (10%)**: 공모 지원 한도 및 자본 건전성 정합성
  - **일정 타당성 (10%)**: 제출 마감일까지의 잔여 D-Day (30일 이상 만점, 14일 이상 양호, 7일 미만 급격 감점)
  - **리스크 패널티**: 지원자격 `FAIL` 시 -30점 감산, `REVIEW_REQUIRED` 시 -10점 감산
  - **추천 알고리즘**:
    - `totalScore >= 75` && 자격 `PASS`: `GO`
    - `totalScore >= 60`: `GO_WITH_CONDITIONS`
    - 자격 `FAIL` 또는 `totalScore < 45`: `NO_GO`
    - 기타: `HOLD`

### 2.3 의사결정 서비스 (Decision Service)
- **`DecisionService` (`src/lib/decision/decision-service.ts`)**:
  - `recordDecision()`: 인간 검토자의 최종 결정, 조건 항목, 사유 저장
  - 공모 상태 자동 동기화: `GO` -> `PREPARING`, `NO_GO` -> `ARCHIVED`, `HOLD` -> `ANALYZING`
  - 기회별 점수 및 의사결정 이력 조회, 통계 집계 기능 제공

### 2.4 API 및 UI 컴포넌트
- **API Endpoints**:
  - `POST /api/opportunities/[id]/score`: 기회 점수 계산 및 갱신
  - `GET /api/opportunities/[id]/score`: 저장된 점수 및 6대 breakdown 조회
  - `POST /api/opportunities/[id]/decision`: 인간 의사결정 확정 및 조건 등록
  - `GET /api/opportunities/[id]/decision`: 의사결정 이력 및 최신 결정 조회
- **UI Components**:
  - `src/components/scoring/opportunity-score-card.tsx`:
    - 종합 점수 및 6대 축 프로그레스 바 차트
    - "수주 확률(Win Probability)이 아님"을 강조하는 안내 뱃지
    - 강점 및 리스크 요약 칩
  - `src/components/decision/decision-control-panel.tsx`:
    - GO, 조건부 GO, HOLD, NO-GO 선택 버튼
    - 부대조건(Conditions) 동적 추가/삭제 입력 폼
    - 결정 사유(Rationale) 필수 작성 및 감사 추적 안내

---

## 3. 테스트 및 검증 결과

### 3.1 유닛 및 통합 테스트 (Vitest)
전체 16개 테스트 스위트, 45개 테스트 항목 100% 통과:
1. `scoring-engine.test.ts`: 6대 영역 가중치 합산, 마감일 D-Day 감점, 지원자격 FAIL 시 30점 감산 및 NO_GO 추천 정상 동작 검증
2. `score-not-win-probability.test.ts`: UI 안내문 및 Rationale에 "수주 확률(Win Probability)" 용어 사용 금지 및 적합도 정의 준수 검증
3. `decision-workflow.test.ts`: GO/HOLD/NO-GO 의사결정 기록, 다중 조건(Conditions) 배열 저장, 공모 상태 전이 검증

### 3.2 빌드 및 정적 분석
- `npm run typecheck` (`tsc --noEmit`): 에러 0건 통과
- `npm run build` (`next build`): 20개 정적/동적 라우트 프로덕션 번들링 100% 성공

---

## 4. Phase 5 완료 확인 및 Gate 체크리스트

| 검증 항목 | 기준 | 결과 |
| :--- | :--- | :---: |
| 6대 영역 가중치 적용 | 기술 25, 전략 20, 역량 20, 증빙 15, 재무 10, 일정 10 정량 산출 | **PASS** |
| 수주 확률 표기 배제 | Score != Win Probability 고지 및 적합도 표기 강제 | **PASS** |
| 자격 판정 연동 패널티 | 자격 FAIL 시 리스크 감점(-30점) 및 NO_GO 수렴 | **PASS** |
| 의사결정 워크플로우 | GO/HOLD/NO-GO 선택, 조건 목록 첨부, 공모 상태 동기화 | **PASS** |
| 제로 페이크 데이터 | 임의 샘플 주입 없이 실제 역량 및 공모 데이터 기반 산출 | **PASS** |
| 타입 및 빌드 무결성 | TypeScript 에러 0, Next.js 프로덕션 빌드 성공 | **PASS** |

---

## 5. 결론 및 다음 단계

Phase 5 (Opportunity Scoring & Decision Workflow)의 모든 요구사항이 안정적으로 구현 및 검증되었습니다.
공통 실행 지침에 따라 작업을 정지(STOP)하며, 사용자 승인 후 **Phase 6 — Notifications (Telegram & In-App) + Today Workspace** 단계로 진행합니다.
