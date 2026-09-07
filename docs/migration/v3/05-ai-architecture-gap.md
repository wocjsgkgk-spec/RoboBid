# 05. AI 아키텍처 갭 분석 (AI Architecture Gap)

> **문서 상태**: Final AI Architecture Gap  
> **기준일자**: 2026-09-07  
> **핵심 원칙**: 단일 RoboBid AI 통합 인터페이스 하에서 내부 10대 전문 역할(Roles) 모듈화, **Human Approval 필수 보장**, Multi-Agent 프레임워크는 배제하고 경량 고속 추론 유지.

---

## 1. 현재 v2.0 AI 아키텍처 점검

### 1.1 현재 구현 자산
- **Core Engine**: Google Gemini API (`@google/genai` 및 REST 호출 구조 완비, 무료 고속 15 RPM).
- **Multi-LLM Adapter**: `src/lib/ai/model-adapter.ts`에 OpenAI, Claude, Groq, Upstage Solar, 로컬 Ollama 호출 인터페이스 내장.
- **RAG 파이프라인**:
  - `src/lib/documents/rfp-analyzer.ts`: RFP 5대 영역 추출기.
  - `src/lib/rag/evidence-indexer.ts`: 사내 Vault 자산(특허, 실적, 인증) 키워드 인덱싱 및 프롬프트 인젝션 방어기.
  - `src/lib/proposals/proposal-generator.ts`: 정부 서식 기반 초안 생성기.
- **모의평가 시뮬레이션**:
  - `src/lib/proposals/specialist-reviewer.ts`: 4대 심사위원(행정/기술/사업화/재무) 관점 채점 및 코멘트 생성.
- **안전성 검증**:
  - `prompt-injection-defense.test.ts` (악의적 지시어 무력화 테스트 통과).
  - `no-premature-win-probability.test.ts` (승률 단정 금지).
  - `zero-hallucinated-results.test.ts` (없는 실적 허위 생성 차단).

---

## 2. v3.0 10대 AI 전문 역할(Internal Roles) 갭 분석

사용자는 하나의 **RoboBid AI**와 대화하지만, 백그라운드에서는 태스크별로 다음 10개 전문 프롬프트 역할로 분기합니다:

| 번호 | v3.0 전문 AI 역할 | 역할 정의 | 현재 구현 수준 | v3.0 고도화 필요 사항 |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Funding Scout** | 다채널 공모 및 Early Signal 탐색 | **부분 구현** | KONEPS/기업마당 외에 로봇 R&D/경진대회 사전예고 분석 프롬프트 추가 |
| **2** | **Project Analyst** | 로봇 아이디어를 기술/TRL/WBS로 구조화 | **신규 필요** | 한 줄 아이디어를 Master Specification으로 점진 구체화하는 대화형 프롬프트 |
| **3** | **Eligibility Analyst** | 지원자격 충족 및 결격사유 정밀 대사 | **부분 구현** | 기존 `evaluator.ts`에 Applicant Stage(창업 단계, 업력) 대사 로직 결합 |
| **4** | **Funding Fit Analyst** | 프로젝트 예산 vs 인정비목 충당률 계산 | **신규 필요** | 비목별 Coverage 매핑 및 자부담 산출 프롬프트 |
| **5** | **Proposal Strategist** | R&D/지원사업 표준 서식별 전략 수립 | **부분 구현** | 조달청 중심에서 범부처 R&D 및 중기부 서식 전략 템플릿 확충 |
| **6** | **Technical Planner** | 기술 아키텍처 및 과업범위 정합성 검토 | **부분 구현** | 과업지시서 기술요구조건 추출기 확장 |
| **7** | **Budget Analyst** | 비목별 원가, 현금/현물, 중복수혜 위험 검토 | **신규 필요** | Funding Conflict Checker와 연계된 비목 감사 프롬프트 |
| **8** | **Evaluation Reviewer** | 사업유형별 맞춤 모의 심사위원 평가 | **부분 구현** | 기존 4대 위원에서 R&D/창업/실증 맞춤형 심사위원 페르소나 세분화 |
| **9** | **Compliance Reviewer** | 제출 필수서류 완비 및 결격 방어 검토 | **기구현** | `compliance-matrix.ts` 및 제출 체크리스트 100% 재사용 |
| **10**| **Outsourcing Planner** | 기밀 블라인드 외주 RFP 및 사양서 생성 | **부분 구현** | `project_subcontracts.rfpDraft` 기반 내부 기밀 자동 마스킹 강화 |

---

## 3. 핵심 아키텍처 요구 항목별 기술 평가

### 3.1 Structured Output & Schema Validation
- 현재 JSON 반환 파싱 로직(`JSON.parse` 및 fallback)이 구축되어 있으나, Zod 기반 Schema Validation을 강화하여 14-Axis Evaluation 및 Funding Fit 결과를 엄격한 타입으로 검증해야 함.

### 3.2 Evidence Citation & Zero-Hallucination
- 현재 `[인용: 특허-001]` 형태의 인용 태그 생성 기능이 구현되어 있음.
- v3.0에서는 모든 추천 및 분석 결과에 대해 **[공고문 제O조 제O항]** 또는 **[사내 Master Spec 항목 O]**의 출처 표기를 필수로 강제함.

### 3.3 Prompt Versioning & AI Run Logging
- 현재 생성된 제안서는 `proposal_versions` 테이블에 버전 이력으로 보관됨.
- 향후 신규 AI 모델 호출 시 `ai_run_logs` (프롬프트 버전, 소요 시간, 사용 토큰, 결과 요약) 로깅 테이블을 추가하여 추적성을 극대화함.

### 3.4 Human Approval Guardrail (불변식)
AI는 다음 행위를 절대 자동으로 확정할 수 없으며, 반드시 인간의 명시적 승인을 거치도록 차단합니다:
1. `Project Concept` 내용 자동 변경 금지 (Diff 제시 ➔ 사용자 승인 후 저장)
2. `APPLY / PASS` 의사결정 자동 확정 금지 (추천만 제공, 사용자가 버튼 클릭)
3. 중복수혜 여부 법적 확정 금지 (주의 경고만 표시)
4. 최종 예산 및 제안서 외부 제출 금지 (Zero-Auto-Submit)
5. 외주 업체 계약 체결 금지 (Zero-Auto-Contract)
