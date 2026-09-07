# 06. 회귀 위험 레지스터 및 완화 전략 (Regression Risk Register)

> **문서 상태**: Final Regression Risk Register  
> **기준일자**: 2026-09-07  
> **분류 체계**: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`  
> **핵심 목적**: v2.0 ➔ v3.0 인플레이스 마이그레이션 과정에서 발생 가능한 모든 기술적·비즈니스적 위험을 식별하고 사전 차단책 수립.

---

## 1. 회귀 위험 식별 및 완화 매트릭스

| ID | 위험 항목 | 위험도 | 위험 상세 내용 | 완화 전략 및 사전 방어책 |
| :---: | :--- | :---: | :--- | :--- |
| **R-01** | **기존 Opportunity 상태와 신규 Funding 상태 충돌** | **HIGH** | v2.0의 `DISCOVERED`, `REVIEW`, `GO`, `HOLD`, `NO_GO`, `PROPOSAL` 상태와 v3.0의 `APPLY`, `PASS`, `CANDIDATE`, `AWARDED` 상태 간 충돌 | • 기존 `opportunity_status` Enum을 제거하지 않고 그대로 유지.<br>• 신규 `application_decision` 필드를 별도로 추가하거나 상위 호환 매핑 계층(`GO ➔ APPLY`, `NO_GO ➔ PASS`)을 어댑터 패턴으로 브릿지. |
| **R-02** | **Go/No-Go ➔ APPLY/HOLD/PASS 전환 시 기존 이력 손실** | **MEDIUM** | 기존 `bid_decisions` 테이블에 저장된 GO/NO-GO 의사결정 레코드와의 정합성 훼손 위험 | • `bid_decisions` 테이블 유지.<br>• UI 표시 시 공모 유형이 조달(`PROCUREMENT`)일 때는 "GO/NO-GO"로, R&D/지원사업일 때는 "APPLY/PASS"로 상황에 맞게 렌더링. |
| **R-03** | **기존 Fit Score와 신규 14-Axis 평가엔진 충돌** | **MEDIUM** | 기존 40/25/20/15 가중치 기반 Fit Score를 사용하는 기존 테스트(Vitest) 및 화면 깨짐 위험 | • 기존 `FitScore` 산출 함수 및 엔드포인트(`/api/opportunities/[id]/score`) 100% 보존.<br>• 14-Axis 다차원 평가는 별도의 확장 객체(`fourteenAxisEvaluation`)로 병렬 제공. |
| **R-04** | **Proposal vs Application 엔티티 혼선** | **LOW** | 기존 제안서(`proposals`) 테이블과 신규 사업계획서(`applications`) 명칭 충돌 | • 기존 `proposals` DB 테이블 및 API를 100% 재사용.<br>• TypeScript 타입에서 `export type Application = Proposal;` 에일리어스를 적용하여 무중단 호환. |
| **R-05** | **Vault와 Project Concept의 영역 혼선** | **MEDIUM** | 사내 역량(특허, 실적, 인증)과 로봇 개발 아이디어(Project Concept) 간 데이터 경계 불명확 | • `vault_records`는 순수 "회사 보유 자산"만 관리.<br>• `project_concepts`는 "우리가 만들고자 하는 로봇 아이템"으로 명확히 테이블 및 스토어 분리. |
| **R-06** | **Tasks 모듈과의 외래키 연결** | **LOW** | 기존 `tasks` 테이블이 공모 ID(`opportunity_id`)에 바인딩되어 있어 프로젝트 ID 연계 부재 | • `tasks` 테이블에 `project_id UUID NULL` 컬럼을 Additive 추가하여 공모 단위 업무와 프로젝트 단위 업무 모두 지원. |
| **R-07** | **Submission 모듈의 Zero-Auto-Submit 훼손** | **CRITICAL** | 자동화 고도화 중 AI가 인간의 서명 없이 외부 API로 제안서를 자동 제출해 버리는 위험 | • `no-auto-submission.test.ts` 불변식 테스트를 상시 유지.<br>• 담당자 실명 입력 및 체크리스트 전수 확인 없이는 API 호출이 구조적으로 불가능하도록 하드 가드레일 유지. |
| **R-08** | **Intelligence & Tools 이동에 따른 404 라우트 에러** | **LOW** | 조달 도구 이동으로 인해 기존 `/tools`, `/intelligence` 북마크 또는 테스트 실패 위험 | • 기존 URL 경로(`/tools`, `/intelligence`, `/learning`)를 삭제하지 않고 유지.<br>• 사이드바 내 메뉴 그룹 및 라벨만 안전하게 재배치. |
| **R-09** | **localStorage / In-Memory / Supabase 간 동기화 불일치** | **HIGH** | 서버 메모리와 클라이언트 로컬스토리지 간 스키마 변경 시 구버전 캐시 데이터 파싱 오류 | • `localStorage` 데이터 읽기 시 버전 번호(`robobid_version: 3`) 검사 로직 추가.<br>• 스키마 변경 시 자동 Fallback 및 안전 병합(Migration on Read) 처리. |
| **R-10** | **기존 164개 단위 테스트 깨짐 (Regression)** | **CRITICAL** | 공모 모델이나 사이드바 수정 시 기존 55개 테스트 파일 중 일부가 깨질 위험 | • 테스트가 검증하는 기존 시그니처와 불변식을 절대 변경하지 않음.<br>• v3.0 신규 기능은 신규 테스트 파일(`tests/unit/v3-*.test.ts`)로 점진 추가하여 기존 164개 테스트 100% 통과 유지. |

---

## 2. 절대적 마이그레이션 불변식 (Non-Negotiable Invariants)

```text
[불변식 1] Database Reset 절대 금지 (Additive Column & Table만 허용)
[불변식 2] 기존 164개 테스트 통과율 100% 지속 보장
[불변식 3] Zero-Auto-Submit 및 Zero-Auto-Contract 원칙 유지
[불변식 4] 기존 수집된 KONEPS/기업마당 공고 데이터 보존
[불변식 5] 조달청 A값 투찰 계산 기능 삭제 금지 (보조 도구로 유지)
```
