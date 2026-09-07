# PHASE 04 REPORT — Semantic Project Match & 14-Axis Evaluation

> **Phase**: PHASE 04  
> **Status**: **PASS (Gate Approved)**  
> **Date**: 2026-09-07  
> **Auditor/Engineer**: Principal Product Engineer & Software Architect  

---

## 1. Phase Goal & Summary
공고 제목의 단순 로봇 키워드 검색을 넘어 **“이 지원금을 우리 로봇의 어디에(어떤 부품/비목에) 활용할 수 있는가?”**를 판단하는 **Semantic Project Match 엔진** 및 **14대 다각도 적합성 평가 프로파일(14-Axis Evaluation Profile)**, **부족 역량(Missing Capability) 및 필수 자격 거버넌스**를 성공적으로 구축하고 기존 v2 Fit Score와의 완벽한 공존 및 연동을 검증함.

---

## 2. Core Implementations & Deliverables

### 2.1 Domain & Types Modeling (`src/types/evaluation.ts`)
- **14대 평가 축 (14-Axis Evaluation Profile)**:
  1. `신청자격 충족` (Eligibility - Deterministic Rule)
  2. `개발아이템 적합성` (Item Fit - Semantic AI)
  3. `지원금 규모` (Grant Size - Deterministic Rule)
  4. `자부담 규모` (Self Funding - Deterministic Rule)
  5. `개발비 Coverage` (Budget Coverage - Deterministic Rule)
  6. `TRL 적합성` (TRL Alignment - Deterministic Rule)
  7. `개발기간 적합성` (Duration Fit - Deterministic Rule)
  8. `인력/외주 확보 가능성` (Workforce & Outsourcing - Semantic AI)
  9. `가점 확보 가능성` (Bonus Score Potential - Deterministic Rule)
  10. `선정 난이도 (경쟁률)` (Competition Difficulty - Semantic AI)
  11. `신청 준비도` (Readiness - Deterministic Rule)
  12. `실증처/협력기관 필요성` (Testbed / Partner Need - Semantic AI)
  13. `사업화/판매 연계성` (Commercialization & Sales - Semantic AI)
  14. `후속 정부사업 연결성` (Follow-up Funding - Semantic AI)
- **부족 역량(Missing Capability) 5대 상태 정의**:
  - `AVAILABLE` (기보유)
  - `PLANNED` (과제 중 확보 계획)
  - `OUTSOURCE` (전문 외주 용역 조달)
  - `PARTNER_REQUIRED` (수요처/연구소 컨소시엄 필수)
  - `UNAVAILABLE` (확보 불가 결격 사유)
  - **핵심 거버넌스 룰**: 필수 신청시점 자격(`isMandatoryForSubmission`)은 계획(`PLANNED`)이나 파트너 미확보(`PARTNER_REQUIRED`)만으로는 절대 합격(`PASS`) 처리되지 않으며 `passMandatoryEligibility: false`로 엄격 판정.

### 2.2 Semantic Matcher Service (`src/lib/matching/semantic-matcher-service.ts`)
- **구체적 로봇 활용처 도출**:
  - `matchedProjectComponents`: LiDAR 센서, AI 보드, 구동 서보모터, Nav2 자율주행 SW 등 공고 지원금으로 개발/구매할 로봇 모듈 특정
  - `usableFundingAreas`: 인건비(44%), 시제품 재료비(30%), 위탁외주비(16%), 공인시험인증 수수료 등 허용 비목별 산출
- **엄격한 근거(Evidence) 및 불확실성(Uncertainty) 반환**:
  - `evidence`: 공고 지원금 규모, 목표 TRL, 요구 기술, 신청 자격에 대한 구체적 근거 문구 포함
  - `uncertainty`: 위탁비 20% 한도 규정, 민간 자부담금 현금 잔고 등 투명한 사전 위험 공시
- **기존 v2 Fit Score 계승 (Sub-signal)**:
  - `OpportunityScorer.calculate()`를 `subFitScore`로 호출하여 14축 상위 평가 하위에 온전히 보존 및 표출.

### 2.3 Evaluation API & UI Components
- `POST /api/match/evaluate`: Project Concept, Master Spec, Opportunity, Vault 사내 자산을 결합하여 14축 평가 및 Semantic Match 결과 산출
- `src/components/evaluation/fourteen-axis-profile-card.tsx`:
  - 14축 세부 평가 프로파일 (진행 바, 점수, 정량/AI 배지, 근거 인용)
  - 지원금 활용 로봇 핵심 부품 및 비목별 활용 영역 카드
  - 부족 역량(Capability Gap) 상태 배지 및 필수 자격 경고창
  - 투명한 불확실성/사전 위험 점검 박스
- `src/components/opportunities/opportunity-360-workspace.tsx`:
  - [회사 적합도 (Fit)] 탭에 `FourteenAxisProfileCard` 연동 완료

---

## 3. Verification & Quality Gates

| 검증 항목 | 기준 | 결과 | 비고 |
|:---|:---|:---:|:---|
| TypeScript Typecheck | 0 Errors | **PASS** | `npm run typecheck` 통과 |
| Vitest Unit Tests | 100% Pass | **PASS** | 59개 파일, **184/184 Tests 전수 통과** |
| Phase 4 전용 단위 테스트 | 신규 5개 케이스 통과 | **PASS** | `v3-phase4-semantic-match-and-14axis.test.ts` |
| 기존 기능 Regression | 0 건 | **PASS** | 기존 179개 테스트 전체 무결성 유지 |
| 근거 없는 추천 방지 | 증빙 인용 100% 필수 | **PASS** | `evidence` 및 컴포넌트/비목 산출 검증 |
| Deterministic vs AI 구분 | 전 축 분류 및 태깅 | **PASS** | 8개 정량 산출축 vs 6개 AI 추론축 명확 분리 |
| 필수자격 계획만으로 PASS 금지 | 거버넌스 엄격 적용 | **PASS** | `PARTNER_REQUIRED`/`PLANNED` 시 불합격 검증 |
| 기존 v2 Fit Score 호환 | 하위 신호로 보존 | **PASS** | `subFitScore` 무결성 검증 |

---

## 4. Phase 4 Gate Sign-off

- [x] **근거 없는 추천 없음**: 매칭 결과에 구체적 로봇 컴포넌트, 비목, 증빙 문구 포함 완료
- [x] **Deterministic rule 영역과 AI 영역 구분**: 정량 계산 축과 AI 추론 축 분리 및 태깅 완료
- [x] **동일 입력에 점수의 설명 가능성**: 14개 축별 점수 산출 근거 및 프로파일 제공 완료
- [x] **기존 Fit Score와 충돌 없음**: v2 `OpportunityScorer` 결과를 `subFitScore`로 계승 완료
- [x] **필수 신청자격 거버넌스**: 계획(PLANNED)만으로 필수자격 통과 불가 룰 적용 완료

**Gate Decision: [PASS]**  
➔ **Phase 5 (Funding Fit, Portfolio & Conflict Engine)** 진행을 승인합니다.
