# RoboBid AI — Phase 0: Architecture Recommendation

- 문서 버전: v1.0
- 작성일시: 2026-09-04
- 담당: Principal Product Engineer / Software Architect
- 대상 Phase: Phase 0 (Product / Technical Baseline & Source Verification)

---

## 1. 아키텍처 비전 및 원칙

RoboBid AI의 아키텍처는 PRD Section 31~34에 명시된 **Free-First Technical Stack** 및 **Security/Confidential Separation** 원칙을 핵심으로 한다.

1. **단순성과 확장성**: MVP 단계에서는 모놀리식 Next.js + Supabase BaaS로 최소 비용과 빠른 출시를 달성하고, 무거운 문서 처리(HWP/PDF 파싱)만 독립 Worker로 격리한다.
2. **기밀 데이터 격리**: 공공 공고 데이터(Public)와 회사 내부 역량/제안서/재무 데이터(Confidential)의 저장 및 AI 처리 파이프라인을 엄격히 분리한다.
3. **공급자 추상화 (Decoupling)**: 공공데이터 Provider 및 LLM Provider를 어댑터 패턴으로 추상화하여 특정 벤더 종속성을 배제한다.
4. **결정론적 규칙 우선**: 자격 심사(Eligibility Gate) 및 기회 점수(Opportunity Score) 산출 시 LLM 할루시네이션을 방지하고 정량적 룰 엔진을 1차 기준으로 적용한다.

---

## 2. 권장 기술 스택 및 선정 근거

### 2.1 Frontend & Web Application
- **Next.js (App Router, React 18/19, TypeScript)**:
  - *선정 근거*: SSR/SSG/ISR 하이브리드 렌더링 지원으로 공고 상세 페이지의 SEO 및 초기 로딩 속도 최적화, Server Actions를 통한 안전한 서버 연동, API Route를 통한 가벼운 백엔드 엔드포인트 제공.
- **Tailwind CSS + shadcn/ui**:
  - *선정 근거*: Radix UI 기반의 높은 접근성(A11y), 복사-붙여넣기 방식의 무의존성 디자인 시스템, 반응형 데스크톱 및 모바일 최적화 용이.
- **PWA (Progressive Web App - @ducanh2912/next-pwa)**:
  - *선정 근거*: PRD Section 41의 요구사항에 따라, 네이티브 앱 개발 비용 없이 모바일 홈 화면 설치 및 푸시 알림 수신 환경 제공.

### 2.2 Backend & Data Infrastructure (Supabase)
- **Supabase PostgreSQL**:
  - *선정 근거*: 오픈소스 RDBMS의 표준. 고성능 쿼리 및 트랜잭션 보장.
  - **pgvector**: 공고 RFP 및 회사 Capability 문서 임베딩 벡터 검색 (RAG 파이프라인).
  - **pg_trgm**: 한국어 공고명, 기관명, 요구사항 전문(Full-Text) 유사도 검색.
  - **Row Level Security (RLS)**: 테넌트/조직/사용자별 데이터 접근 통제 강제.
  - **pg_cron**: Edge Function을 호출하여 주기적 공고 Ingestion 스케줄링.
- **Supabase Auth**:
  - *선정 근거*: 이메일/비밀번호 및 OAuth 지원, JWT 기반 세션 관리, RLS와 1:1 결합.
- **Supabase Private Storage**:
  - *선정 근거*: Signed URL 기반의 엄격한 파일 접근 통제 (`rfp-original`, `company-evidence`, `proposal-drafts`).

### 2.3 Notifications
- **Telegram Bot API (MVP 핵심)**:
  - *선정 근거*: 설정 비용 0원, 즉각적인 모바일 푸시 알림, Webhook 기반 양방향 상호작용 지원.
- **Web Push API (MVP)**:
  - *선정 근거*: 브라우저 표준 푸시 지원.
- **Kakao AlimTalk (P1 확장)**:
  - *선정 근거*: 비즈니스 알림톡 어댑터로 확장 가능하도록 인터페이스 사전 설계.

### 2.4 Document Parsing Worker (격리 모듈)
- **Node.js / Python 분리형 Worker**:
  - *선정 근거*: 공공 공고의 주류 파일 포맷인 **HWP(한글 5.0 레거시)**, **HWPX(한글 표준 XML)**, **PDF**, **DOCX** 처리는 메모리 점유율이 높고 C/Rust 네이티브 라이브러리가 필요할 수 있음.
  - Next.js 웹 서버 프로세스와 분리하여 웹 응답성을 보장하고, 샌드박스 환경에서 파싱 수행.

### 2.5 AI Provider Abstraction
- **추상화 인터페이스**:
  ```typescript
  export interface AIProvider {
    generateText(prompt: string, options?: GenOptions): Promise<string>;
    extractStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;
    generateEmbedding(text: string): Promise<number[]>;
  }
  ```
- **Tier 1 (공개 공고 분석)**: Google Gemini 1.5 Flash / Flash-Lite (빠른 속도, 긴 컨텍스트 윈도우, 무료 티어 및 초저비용).
- **Tier 2 (회사 기밀 및 제안서 작성)**: 데이터 학습 금지 조항이 명시된 Commercial Enterprise API 또는 자체 호스팅 Local LLM (Ollama 등).

---

## 3. 전체 시스템 아키텍처 다이어그램

```text
[ External Sources ]
 ├─ data.go.kr (나라장터, K-Startup, 기업마당)
 ├─ e나라도움 / IRIS (공식/수동)
 └─ 사용자 파일/URL 업로드
        │
        ▼ (HTTPS REST / Polling)
[ RoboBid Ingestion Pipeline ]
 ├─ Provider Adapter (Fetch -> Normalize -> Validate)
 ├─ Deduplicator (Hash / Notice Number / Agency)
 └─ Document Worker (HWP / HWPX / PDF -> Text / Tables)
        │
        ▼
[ Supabase PostgreSQL + Private Storage ]
 ├─ Opportunities & Attachments
 ├─ Company Capability Vault (Encrypted)
 ├─ Eligibility & Score Rule Engine
 └─ Proposals & Compliance Matrix
        ▲
        │ (Server Actions & RLS Protected API)
[ Next.js 14+ Application Layer ]
 ├─ Web Workspace (Desktop BidOps Dashboard)
 ├─ PWA Mobile UI (Quick GO/NO-GO Review)
 ├─ RoboBid AI Engine (Eligibility -> Scoring -> Proposal Draft)
 └─ Notification Service (Telegram Bot / Web Push)
```

---

## 4. 저장소 권장 디렉터리 구조 (Phase 1 대상)

```text
/mnt/d/RoboBid/
├── .agents/
│   └── rules/               # Antigravity CLI 워크스페이스 룰
├── docs/
│   ├── product/             # PRD 마스터 문서
│   └── phases/              # Phase별 기획 및 결과 문서
├── src/
│   ├── app/                 # Next.js App Router (오늘, 공모, 제안, 자료, 설정)
│   │   ├── (auth)/          # 로그인, 회원가입
│   │   ├── (workspace)/     # 메인 업무 영역
│   │   │   ├── today/       # 오늘 대시보드
│   │   │   ├── opportunities/ # 공모 파이프라인
│   │   │   ├── proposals/   # 제안서 워크스페이스
│   │   │   ├── vault/       # 회사 역량 저장소
│   │   │   └── settings/    # 설정 및 Provider 관리
│   │   └── api/             # Webhooks, Ingestion Cron API
│   ├── components/          # 공통 UI 및 shadcn 컴포넌트
│   ├── lib/
│   │   ├── ai/              # AI Provider 추상화 및 프롬프트
│   │   ├── db/              # Supabase 클라이언트 및 쿼리
│   │   ├── providers/       # 공공데이터 Adapter (나라장터, K-Startup 등)
│   │   ├── scoring/         # Opportunity Score 정량 엔진
│   │   └── notifications/   # Telegram, Web Push 어댑터
│   ├── types/               # 공통 도메인 TypeScript 타입 (Zod 스키마 연계)
│   └── workers/             # 문서 파서 (HWP, PDF 파서 스크립트)
├── supabase/
│   ├── migrations/          # DDL, RLS 마이그레이션 파일
│   └── functions/           # Supabase Edge Functions (선택)
├── package.json
└── tsconfig.json
```

---

## 5. 아키텍처 적합성 종합 평가

- **PRD v1.0 100% 충족**: 제안된 Next.js + Supabase + Telegram + 독립 Worker 구조는 PRD의 P0 및 P1 요구사항을 가장 경제적이면서도 안정적으로 충족한다.
- **Zero Lock-in & 비용 효율성**: 초기 인프라 비용 0원으로 MVP를 기동할 수 있으며, 기업 규모 확장 시 Vercel/AWS 및 전용 DB로 매끄럽게 승격 가능하다.
- **Phase 1 진행 승인 권고**: 본 아키텍처 구조를 Phase 1(App Foundation / Auth / Design System / Data Model)의 공식 기준으로 채택한다.
