# RoboBid AI — Phase 7 Completion Report

- 문서 버전: v1.0
- 작성일시: 2026-09-04
- 담당: Principal Product Engineer / Software Architect
- 대상 Phase: Phase 7 (Proposal Workspace + RAG Draft)

---

## 1. 개요 및 목적

본 문서는 `ROBOBID-AI-MASTER-PRD-v1.0.md` (Section 12, 13, 22) 및 `PHASE-07.md` 지침에 따라 GO 결정이 완료된 공모를 증빙 기반 제안서 워크스페이스로 전환하고 70~80% 수준의 초안을 생성하는 제안서 엔진(Proposal Workspace & RAG Drafting Engine)의 구현 및 검증 결과를 기록한다.

### 핵심 준수 원칙:
1. **RFP 근거 우선 & Company Evidence 우선**:
   - 사내 역량(TRL, 특허, 인증, 수행실적, 인력, 장비) 및 RFP 요구조건에 명시된 사실만 제안서 본문에 반영.
2. **Zero Hallucinated Company Results (절대 규칙)**:
   - 사내 저장소에 등록되지 않은 가짜 실적/특허 임의 날조(Hallucination) 절대 금지.
   - 자산 부재 시 날조 대신 `[TODO: Capability Vault에 ... 등록 요망]` 태그로 대체.
3. **근거 없는 수치 금지 및 추정치 분리**:
   - 정량적 수치는 등록된 사내 데이터 및 RFP 수치만 인용.
   - 확정되지 않은 추정치는 `[가정: ...]`, 미확인 내용은 `[TODO: ...]` 태그 의무 부착.
4. **Prompt Injection 방어**:
   - Untrusted RFP 텍스트 내 악의적 프롬프트 주입 공격("Ignore previous instructions", "SYSTEM OVERRIDE", XSS 스크립트) 감지 및 샌드박싱 살균(`[차단된 비인가 명령]`).
5. **Traceability & Versioning (버전 스냅샷)**:
   - 모든 핵심 문단마다 `[증빙: CAP-xxx]` 및 `[근거: REQ-yyy]` Citation 바인딩 유지.
   - 작성된 제안서 본문의 불변 버전 스냅샷(v1, v2) 및 변경 이력 감사 로그 보존.
6. **최종 제출은 사람 승인 (Human-in-the-Loop)**:
   - 자동 공모 제출 및 자동 외부 계약을 절대 금지하며, 작성자 및 검토자의 최종 승인 필수.

---

## 2. 구현 내역 상세

### 2.1 데이터베이스 스키마 확장
- `supabase/migrations/20260904050000_phase7_proposals.sql`:
  - Enums: `proposal_status` (`DRAFTING`, `REVIEWING`, `APPROVED`, `SUBMITTED`, `REJECTED`), `section_status` (`EMPTY`, `AI_GENERATED`, `EDITED`, `REVIEW_NEEDED`, `CONFIRMED`)
  - `proposals` 테이블: 공모 FK, 제안서 제목, 현재 버전, 목표 제출일, 총 예산, 메타데이터
  - `proposal_sections` 테이블: 목차 코드(`1.1_NEEDS_BACKGROUND`, `2.1_TECH_ARCHITECTURE` 등), 섹션 제목, 정렬 순서, 마크다운 본문, Evidence Citations JSONB, 상태, 버전
  - `proposal_versions` 테이블: 제안서 전체 스냅샷 JSONB, 버전 번호, 변경 요약(Change Summary), 작성자
  - Row Level Security (RLS): 조직별 완벽 격리

### 2.2 RAG 및 Hybrid Retrieval 엔진
- **`HybridRetriever` (`src/lib/rag/hybrid-retriever.ts`)**:
  - 다중 소스 통합: RFP 요구사항 후보(`RequirementCandidate[]`) + 사내 역량(`CapabilityRecord[]`)
  - 하이브리드 필터링: 기밀 등급(`RESTRICTED` 격리), 역량 카테고리 필터, 유효기간 만료(`EXPIRED`) 자산 배제
  - 텍스트 매칭 및 관련성 스코어링을 통해 최적의 `EvidenceCitation[]` 후보군 도출

### 2.3 제안서 초안 조립 엔진 (Proposal Drafting Engine)
- **`ProposalDraftingEngine` (`src/lib/proposals/drafting-engine.ts`)**:
  - 대한민국 정부 R&D 및 공공 조달 표준 제안서 7대 대목차(9개 세부 섹션) 템플릿 제공:
    - 1.1 개발 필요성 및 배경
    - 1.2 최종 목표 및 핵심 개발 내용
    - 2.1 시스템 아키텍처 및 기술 구현 방안 (블록도 텍스트 포함)
    - 2.2 차별화 핵심 기술 및 사내 보유 역량
    - 3.1 추진 일정 및 마일스톤 (WBS 4단계 표)
    - 3.2 정량적 목표 및 성능 평가 지표 (KPI 표)
    - 4.1 사업비 소요 내역 및 부품 원가 (BOM 및 75%/25% 재정 분담율 산출)
    - 5.1 사업 수행 체계 및 참여 인력 (조직도 및 PM/팀 구성)
    - 5.2 유사 사업 수행 실적 및 상용화 역량 (실제 실적만 인용)
  - `sanitizePromptInput()`: RFP 텍스트 내 프롬프트 인젝션 공격 사전 무력화

### 2.4 제안서 워크스페이스 서비스 및 API
- **`ProposalService` (`src/lib/proposals/proposal-service.ts`)**:
  - 제안서 워크스페이스 초기화 및 표준 목차 생성
  - RAG 기반 섹션 초안 일괄/단일 생성
  - 섹션 본문 수정 및 검토 상태 갱신
  - 버전 스냅샷 생성 및 이력 조회
- **API Endpoints**:
  - `GET, POST /api/proposals`: 제안서 목록 및 신규 생성
  - `GET, PATCH /api/proposals/[id]`: 제안서 상세 조회 및 섹션 본문 수정
  - `POST /api/proposals/[id]/draft`: RAG 기반 초안 생성 엔진 실행
  - `POST /api/proposals/[id]/versions`: 버전 스냅샷 저장

### 2.5 UI 컴포넌트
- **`ProposalWorkspaceView` (`src/components/proposal/proposal-workspace-view.tsx`)**:
  - 3컬럼 통합 워크스페이스:
    - 좌측: 표준 목차(TOC) 트리 네비게이션 및 상태 배지
    - 중앙: 마크다운 편집기, `AI 초안 생성` 버튼, `저장` 버튼, `[가정]`/`[TODO]` 검토 안내 배너
    - 우측: 증빙 인용구(Evidence Citations) 및 RFP 인용문구 실시간 브라우저
  - 버전 스냅샷 생성 모달
- **`ProposalsPage` (`src/app/(workspace)/proposals/page.tsx`)**:
  - 제안서 카드 목록, 제출 D-Day 표시, 새 제안서 생성 모달

---

## 3. 테스트 및 검증 결과

### 3.1 유닛 및 통합 테스트 (Vitest)
전체 23개 테스트 스위트, 68개 테스트 항목 **100% 통과**:
1. `tests/unit/proposal-drafting.test.ts` (4 tests):
   - 표준 목차(TOC) 9개 섹션 초기화 검증
   - RFP 요구사항 및 사내 역량 1:1 Citation 바인딩 검증
   - `[가정: ...]` 및 `[TODO: ...]` 태그 부착 검증
2. `tests/unit/zero-hallucinated-results.test.ts` (2 tests):
   - 사내 실적 부재 시 허위 실적 날조 방지 및 TODO 태그 대체 검증 (Zero Hallucination)
   - 만료된(`EXPIRED`) 인증서/특허 증빙 인용 자동 배제 검증
3. `tests/unit/prompt-injection-defense.test.ts` (3 tests):
   - 시스템 무력화("Ignore all previous instructions", "SYSTEM OVERRIDE", XSS) 살균 및 차단 플래그 검증
   - 악의적 제목이 포함된 공모로 초안 생성 시 공격 무력화 검증
4. `tests/unit/proposal-versioning.test.ts` (1 test):
   - 섹션 수정 후 버전 스냅샷(`v1 -> v2`) 생성 및 불변 데이터 보존 검증

### 3.2 빌드 및 정적 분석
- `npm run typecheck` (`tsc --noEmit`): 에러 0건 통과
- `npm run build` (`next build`): 24개 정적/동적 라우트 프로덕션 번들링 100% 성공

---

## 4. Phase 7 Gate 체크리스트

| 검증 항목 | 기준 | 결과 |
| :--- | :--- | :---: |
| **핵심 주장 Evidence 추적** | 사내 역량 및 RFP 요건 1:1 바인딩 및 Citation 칩 표시 | **PASS** |
| **Hallucinated 실적 0건** | 미등록 실적 날조 절대 금지, TODO 태그 대체 강제 | **PASS** |
| **Prompt Injection 방어** | RFP 원문 인젝션 공격 패턴 살균 및 차단 | **PASS** |
| **Version 저장 기반** | 제안서 불변 스냅샷 보존 및 버전 번호 추적 | **PASS** |
| **인간 최종 승인 원칙** | 자동 제출 금지, 작업자/검토자 승인 워크플로우 유지 | **PASS** |
| **타입 및 빌드 무결성** | TypeScript 에러 0, Next.js 프로덕션 빌드 성공 | **PASS** |

---

## 5. 결론 및 다음 단계

Phase 7 (Proposal Workspace + RAG Draft)의 모든 요구사항이 안정적으로 구현 및 검증되었습니다.
공통 실행 지침에 따라 작업을 정지(STOP)하며, 사용자 승인 후 **Phase 8 — Compliance & Red Team Engine** 단계로 진행합니다.
