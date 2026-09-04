# RoboBid AI — Phase 0: Baseline Audit

- 문서 버전: v1.0
- 작성일시: 2026-09-04
- 담당: Principal Product Engineer / Software Architect
- 대상 Phase: Phase 0 (Product / Technical Baseline & Source Verification)

---

## 1. 개요 및 목적

본 문서는 `ROBOBID-AI-MASTER-PRD-v1.0.md` 및 `PHASE-00.md` 지침에 따라, RoboBid AI 개발 착수 전 현재 저장소의 파일 구조, 개발 런타임, 도구 환경, 인프라 및 기존 자산을 객관적으로 진단하고 기록하는 Baseline Audit 결과이다.

---

## 2. Repository 현황 분석

### 2.1 디렉터리 및 파일 구조

현재 Workspace 루트 (`/mnt/d/RoboBid`)의 구조는 다음과 같다:

```text
/mnt/d/RoboBid/
├── ANTIGRAVITY-QUICK-START.md
└── docs/
    ├── phases/
    │   ├── ROBOBID-ANTIGRAVITY-PHASE-PROMPTS.md
    │   └── prompts/
    │       ├── PHASE-00.md
    │       ├── PHASE-01.md
    │       ├── PHASE-02.md
    │       ├── ...
    │       └── PHASE-11.md
    └── product/
        └── ROBOBID-AI-MASTER-PRD-v1.0.md
```

- **상태**: 신규 프로젝트 (Greenfield) 상태로, 제품 마스터 기획 문서(PRD) 및 각 Phase별 개발 실행 프롬프트가 정립되어 있음.
- **Git 상태**: Git 저장소 미초기화 (`fatal: not a git repository`).
- **코드 자산**: 프론트엔드/백엔드 소스 코드(`src/`, `app/` 등) 및 기존 레거시 코드는 일체 존재하지 않음.

---

## 3. 개발 런타임 및 도구 환경 진단

시스템 환경 진단 결과:

| 항목 | 버전 / 상태 | 평가 및 권장사항 |
| :--- | :--- | :--- |
| **OS** | Linux (WSL2 / Ubuntu x86_64) | 표준 Linux 환경으로 컨테이너 및 Node/Python 도구 구동에 최적 |
| **Node.js** | `v24.17.0` | 최신 짝수 LTS 계열. Next.js 14/15 호환성 양호 |
| **npm** | `12.0.2` | 기본 패키지 매니저로 즉시 사용 가능 |
| **pnpm / bun** | 미설치 (`command not found`) | 표준 npm을 우선 사용하거나 프로젝트 표준화 시 pnpm 도입 고려 |
| **Python** | `Python 3.14.4` | 최신 파이썬 런타임. Document Worker (HWP/PDF 파서) 구동 가능 |
| **Git** | 미초기화 | Phase 1 착수 전 `git init` 및 `.gitignore` 설정 필수 |

---

## 4. 기존 시스템 구성 요소 점검

### 4.1 Route / Page / Component
- **현황**: 전무 (Next.js 또는 UI 라이브러리 미설치 상태).
- **영향**: 깨끗한 그린필드 상태이므로 PRD v1.0 Section 8/9/10/40에 명시된 레이아웃 및 디자인 시스템을 충돌 없이 도입 가능.

### 4.2 Database / Auth / Storage
- **현황**: 전무 (Supabase 연결 및 DB Schema 미구성).
- **Phase 0 원칙 준수**: 본 Phase에서는 DB reset, Auth reset, Migration 초기화 등 데이터 관련 작업을 일체 수행하지 않음. Phase 1에서 정식 DDL 및 RLS를 설계할 예정.

### 4.3 Test / CI / CD
- **현황**: 테스트 러너(Jest, Vitest, Playwright) 및 GitHub Actions CI 워크플로우 미구성.
- **권장**: Phase 1에서 프로젝트 뼈대 생성 시 Vitest/Playwright 및 linter(ESLint, Prettier) 기본 구성 필요.

### 4.4 환경변수 (.env) 구조
- **현황**: `.env`, `.env.local` 파일 부재.
- **권장**: 외부 API 키(공공데이터포털, Telegram Bot, AI Provider) 및 Supabase 자격증명을 안전하게 관리할 수 있도록 `.env.example` 템플릿 설계 필요.

---

## 5. Audit 종합 결론

1. 현재 저장소는 PRD v1.0과 Phase 실행 프롬프트만 체계적으로 준비된 **완전한 Greenfield 환경**이다.
2. 불필요한 레거시 부채나 비호환 코드가 없으므로, PRD가 정의한 **Next.js + TypeScript + Tailwind CSS + Supabase + Python Worker** 기술 스택을 정확하고 표준적인 방식으로 적용할 수 있다.
3. Phase 0에서는 추가적인 코드 생성이나 데이터베이스 구축을 진행하지 않으며, 다음 산출물인 공공데이터 소스 검증 및 아키텍처/보안 기준 수립에 집중한다.
