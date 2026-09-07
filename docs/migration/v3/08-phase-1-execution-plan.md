# 08. Phase 1 상세 실행 계획서 (Phase 1 Execution Plan)

> **문서 상태**: Final Execution Plan for Phase 1  
> **기준일자**: 2026-09-07  
> **실행 전제**: 본 문서는 계획서이며, **사용자의 최종 검토 및 실행 승인(Proceed) 후에만 실제 코드 작업에 착수**함.

---

## 1. Phase 1 목표 및 핵심 산출물

**Phase 1의 목표**:
RoboBid AI의 기존 정상 기능과 164개 테스트를 100% 보존한 상태에서, 제품의 외관과 기본 도메인을 **"조달 입찰"에서 "로봇 개발 자금 및 벤처 인텔리전스(v3.0)" 구조로 안전하게 전환**한다.

**핵심 산출물**:
1. **v3.0 신규 사이드바 내비게이션 적용**:
   - `오늘`, `개발아이템`, `지원기회`, `Funding Portfolio`, `지원준비`, `사업계획서`, `제출·심사`, `선정·개발`, `자료·역량`, `Intelligence`, `RoboBid AI`, `알림`, `설정`.
   - 기존 조달 도구(`/tools`)를 `조달/판매 지원도구`로 안전 이동.
2. **v3.0 Core Domain Types 확충**:
   - `FundingType` (15대 지원사업 Taxonomy), `ProjectConcept`, `ApplicationDecision` (`APPLY`, `HOLD`, `PASS`).
3. **Additive DB 마이그레이션**:
   - `project_concepts` 테이블 생성 및 `opportunities` 호환 컬럼 추가 (기존 데이터 완벽 보존).
4. **ProjectConceptStore 기초 구축**:
   - `globalThis` 싱글톤 및 브라우저 `localStorage` 자동 백업을 적용한 기본 저장소.
5. **Phase 1 단위 테스트 추가**:
   - 기존 164개 테스트 100% 통과 유지 + Phase 1 도메인 모델 검증 테스트.

---

## 2. 파일 변경 및 생성 상세 명세 (File Change Specification)

### 2.1 신규 생성 대상 파일 (`NEW`)
1. `src/types/concept.ts`: `ProjectConcept`, `MasterSpecificationMeta`, `ConceptStatus` 정의.
2. `src/types/funding.ts`: `FundingType`, `FundingSignalStage`, `ApplicationDecision` 정의.
3. `src/lib/concepts/concept-store.ts`: 로봇 아이디어 인메모리 & 로컬스토리지 싱글톤 스토어.
4. `supabase/migrations/20260907000000_phase1_v3_domain_foundation.sql`: Additive DDL 스크립트.
5. `src/app/(workspace)/projects/page.tsx`: 로봇 개발아이템 목록 및 아이디어 등록 기초 화면.
6. `tests/unit/v3-phase1-navigation-and-domain.test.ts`: Phase 1 회귀 방지 단위 테스트.

### 2.2 기존 수정 대상 파일 (`MODIFY - Safe Extension`)
1. `src/components/layout/sidebar.tsx`:
   - v3.0 목표 5개 내비게이션 그룹 및 메뉴 라벨 적용.
   - 기존 `/tools`를 `조달/판매 지원도구`로 배치.
2. `src/types/index.ts`:
   - 신규 `concept.ts` 및 `funding.ts` 타입 export 추가.
   - 기존 `Opportunity` 인터페이스에 `fundingType?: FundingType; projectConceptId?: string;` 추가.
3. `src/lib/opportunities/opportunity-store.ts`:
   - 신규 공모 추가 시 `fundingType` 기본값(`GOV_RND` 또는 `PROCUREMENT`) 매핑 지원.

---

## 3. 회귀 검증 및 테스트 계획 (Test Verification Plan)

Phase 1 완료 후 반드시 다음 4단계 검증을 통과해야 합니다:
1. **타입스크립트 정적 검사**:
   ```bash
   npm run typecheck
   # 목표: 0 Errors
   ```
2. **단위 테스트 스위트 전수 실행**:
   ```bash
   npm test
   # 목표: 기존 164개 테스트 100% PASS + Phase 1 신규 테스트 PASS (총 170+개)
   ```
3. **프로덕션 빌드 검사**:
   ```bash
   npm run build
   # 목표: 39개 이상 전 라우트 정상 컴파일 (Exit code 0)
   ```
4. **브라우저 라우팅 및 UI 무결성 수동 확인**:
   - 사이드바 신규 메뉴 클릭 시 404 없이 정상 전환되는지 확인.
   - `/opportunities` 실시간 수집 및 기존 공모 데이터가 그대로 유지되는지 확인.
   - `/tools` 접근 시 기존 A값 계산기가 정상 노출되는지 확인.

---

## 4. Phase 1 완료 후 종료 조건

- Phase 1 코드 작업 완료 및 테스트 100% 통과 확인 후, **Phase 2를 자동으로 착수하지 않고 즉시 작업을 멈추고(STOP) 사용자에게 결과를 보고**합니다.
