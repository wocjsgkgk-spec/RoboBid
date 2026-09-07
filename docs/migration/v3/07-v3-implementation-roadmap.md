# 07. RoboBid AI v3.0 점진적 구현 로드맵 (Implementation Roadmap)

> **문서 상태**: Final Implementation Roadmap  
> **기준일자**: 2026-09-07  
> **개발 방식**: Phase별 점진적 인플레이스 고도화 및 각 Phase 종료 시 사용자 검증 후 정지 (STOP).

---

## 1. 전체 마이그레이션 로드맵 개요 (12개 Phase 체계)

```text
[Phase 0: Baseline & Audit] ─── (현재 완료)
       │
       ▼
[Phase 1: Navigation v3 & Core Domain Foundation] ─── (차기 착수 대상)
       │
       ▼
[Phase 2: Project Concept Vault (로봇 아이디어 기획)]
       │
       ▼
[Phase 3: Funding Opportunity Model & 15대 Taxonomy]
       │
       ▼
[Phase 4: Semantic Project Match & 14-Axis Evaluation]
       │
       ▼
[Phase 5: Funding Fit & Funding Portfolio Engine]
       │
       ▼
[Phase 6: Application Workflow & Proposal RAG 고도화]
       │
       ▼
[Phase 7: Master Specification & Document Derivation]
       │
       ▼
[Phase 8: Award Workspace & Development Transition]
       │
       ▼
[Phase 9: Secure Outsourcing RFP Generator]
       │
       ▼
[Phase 10: Early Signal & Recurring Forecast Intelligence]
       │
       ▼
[Phase 11: Security, PWA, UX & Production Hardening]
```

---

## 2. 각 Phase별 상세 범위 및 산출물

### Phase 0: Baseline & Migration Audit (완료)
- **범위**: 18개 페이지, 31개 API 라우트, 55개 테스트 스위트 전수 코드 감사 및 9대 마이그레이션 전략 문서 완성.
- **결과**: 현재 시스템 기준선 확립, 164개 테스트 100% 통과 확인.

### Phase 1: Product Navigation & Core Domain Foundation (차기 실행 목표)
- **범위**:
  - 사이드바 내비게이션을 v3.0 구조(오늘, 개발아이템, 지원기회, Funding Portfolio 등)로 개편.
  - 조달 전용 도구(투찰계산기, A값)를 `조달/판매 지원도구`로 안전 이동.
  - Core Type 확충 (`FundingType`, `ProjectConceptInput`, `ApplicationDecision`).
  - DB Additive 마이그레이션 (`project_concepts` 테이블 생성, `opportunities` 호환 컬럼 추가).
- **성공 기준**: 기존 164개 테스트 100% 무중단 통과, 신규 메뉴 클릭 시 안전한 라우팅 동작.

### Phase 2: Project Concept Vault
- **범위**: 회사가 개발하고자 하는 로봇 아이디어를 등록하고 기술개념, 목표 TRL, 개략 예산을 기록하는 `/projects` 워크스페이스 구축.
- **성공 기준**: 아이디어 등록/수정/버전 이력 관리, AI 점진 구체화 제안 및 사용자 승인(Diff) 플로우.

### Phase 3: Funding Opportunity Model & Taxonomy
- **범위**: 공모 관리 시스템(`/opportunities`)에 15대 지원사업 Taxonomy(R&D, 실증, 시제품, 창업, 경진대회 등) 태그 및 다채널 필터 도입.
- **성공 기준**: KONEPS/기업마당 실시간 수집 공모가 지원사업 유형별로 정밀 분류되어 렌더링.

### Phase 4: Semantic Project Match & 14-Axis Evaluation
- **범위**: 등록된 로봇 Project Concept와 수집된 공모 간 의미 기반 매칭 점수 산출 및 14개 축 다차원 평가 레이더 차트 제공.
- **성공 기준**: "왜 이 지원사업이 우리 로봇 프로젝트에 적합한가?"에 대한 정량 근거와 공고문 인용 출처 표시.

### Phase 5: Funding Fit & Funding Portfolio
- **범위**: 공모의 인정비목과 로봇 프로젝트 개발예산(인건비, 부품비, 외주비)을 대조하여 Coverage 산출, 여러 지원금을 조합하는 포트폴리오 갭 대시보드 구축.
- **성공 기준**: 총 개발비 대비 확보액 및 미지원 비용(Funding Gap) 실시간 집계.

### Phase 6: Application Workflow & Proposal RAG
- **범위**: APPLY 확정 후 사업계획서/제안서 자동 생성 워크스페이스 연계. 정부 R&D 표준 연구개발계획서 서식 추가.
- **성공 기준**: 사내 역량(Vault)과 Project Concept가 결합된 표준 사업계획서 초안 생성 및 4대 심사위원 모의평가.

### Phase 7: Master Specification & Document Derivation
- **범위**: 프로젝트의 단일 최상위 기준 명세서(Master Spec) 구축 및 외주용/내부용/제출용 문서 자동 파생 엔진.
- **성공 기준**: 보안등급별 민감정보 자동 분리 및 일관된 기술 사양 동기화.

### Phase 8: Award Workspace & Development Transition
- **범위**: 선정 등록 후 지원금을 실제 개발 프로젝트로 전환하고 WBS 마일스톤 및 인력 투입 계획 생성 (`src/lib/projects` 기구현 코드 완벽 연동).
- **성공 기준**: 선정 공모 ➔ 개발 프로젝트 원클릭 전환 및 4개년 WBS 로드맵 생성.

### Phase 9: Secure Outsourcing RFP Generator
- **범위**: Master Spec에서 내부 기밀(원가, 핵심특허)을 자동 블라인드 처리하고 외주 가공/SW 개발용 제안요청서(RFP) 및 검수기준서 생성.
- **성공 기준**: 외부 업체 배포용 블라인드 RFP 다운로드.

### Phase 10: Early Signal & Recurring Forecast Intelligence
- **범위**: 사업시행계획, 수요조사, 사전예고 등 공고 전 단계 신호 추적 및 과거 3개년 공고 주기 기반 캘린더 예측.
- **성공 기준**: "예상 공고: 2027년 2월, 신뢰도: MEDIUM" 형태의 참고 피드 제공.

### Phase 11: Security, PWA, UX & Production Hardening
- **범위**: 전 모듈 반응형 UI 최적화, PWA 오프라인 캐싱, 텔레그램 실시간 알림 종합 연동, 최종 프로덕션 감사.
- **성공 기준**: 전체 E2E 테스트 통과 및 Zero-Defect 프로덕션 릴리스.
