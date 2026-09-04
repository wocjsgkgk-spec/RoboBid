# RoboBid AI — Vercel 배포 가이드 (Vercel Deployment Guide)

본 문서는 **RoboBid AI**를 클라우드 호스팅 플랫폼인 **Vercel**에 안정적으로 배포하고 운영하기 위한 실전 가이드입니다.

---

## 1. 배포 전 점검 완료 현황 (Pre-deployment Audit)

현재 RoboBid AI 코드베이스는 Vercel 배포를 위한 모든 기술적 검증을 통과했습니다.

- **린트(Lint)**: `npm run lint` 통과 (0 errors, 0 warnings)
- **타입체크(TypeCheck)**: `npm run typecheck` 통과 (TypeScript 5.7+ 0 errors)
- **단위/통합 테스트**: `npm test` 통과 (55개 테스트 파일, 164/164 통과)
- **프로덕션 빌드**: `npm run build` 통과 (39개 App Router 정적/동적 라우트 정상 컴파일)
- **배포 설정 파일**: `vercel.json` 및 `.env.example` 최신화 완료

---

## 2. 배포 절차 (Step-by-Step Deployment)

### Step 1. Git 저장소 준비 및 푸시 (GitHub Repository)
1. 현재 작업 내용을 Git에 커밋하고 GitHub 저장소의 `main` (또는 `master`) 브랜치로 푸시합니다.
   ```bash
   git add .
   git commit -m "feat: complete Phase P0/P1 and prepare Vercel deployment"
   git push origin main
   ```

### Step 2. Vercel 프로젝트 생성 및 연동
1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인합니다.
2. 우측 상단의 **[Add New...]** > **[Project]** 버튼을 클릭합니다.
3. **Import Git Repository**에서 방금 푸시한 `RoboBid` 저장소를 찾아 **[Import]**를 클릭합니다.

### Step 3. 프로젝트 빌드 설정 확인
Vercel이 Next.js 프레임워크를 자동으로 감지하므로 기본 설정을 그대로 유지합니다:
- **Framework Preset**: `Next.js`
- **Root Directory**: `./`
- **Build Command**: `next build` (또는 `npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## 3. 환경 변수(Environment Variables) 등록

Vercel 배포 시 **[Environment Variables]** 섹션에 아래 키값들을 입력해야 합니다.

> 💡 **참고**: 모든 환경 변수는 `Production`, `Preview`, `Development` 3개 환경 모두 체크하여 추가하는 것을 권장합니다.

| 환경 변수 키 (Key) | 구분 | 권장 설정값 / 발급처 | 설명 |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **필수** | `https://robobid-ai.vercel.app` (또는 본인 커스텀 도메인) | 배포 완료 후 발급되는 Vercel 도메인으로 설정 |
| `NEXT_PUBLIC_SUPABASE_URL` | **필수** | Supabase Project Settings > API > Project URL | 데이터베이스 및 스토리지 연동 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **필수** | Supabase Project Settings > API > anon/public key | 클라이언트 접근 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **필수** | Supabase Project Settings > API > service_role key | 서버 사이드 백엔드 권한 키 |
| `GEMINI_API_KEY` | **필수** | [Google AI Studio](https://aistudio.google.com/app/apikey) | 제미나이 AI 제안서 분석 및 자동 생성 |
| `BIZINFO_API_KEY` | **필수** | [기업마당 OpenAPI](https://www.bizinfo.go.kr) | 중소벤처기업부 기업마당 지원사업 실시간 수집 |
| `DATA_GO_KR_SERVICE_KEY` | 선택 | [공공데이터포털](https://www.data.go.kr) | 조달청 나라장터 공공입찰 공고 수집 |
| `TELEGRAM_BOT_TOKEN` | **필수** | Telegram @BotFather | 텔레그램 실시간 알림 봇 토큰 |
| `TELEGRAM_CHAT_ID` | **필수** | Telegram @userinfobot (사용자/단톡방 Chat ID) | 알림을 수신할 텔레그램 채팅방 ID |
| `TELEGRAM_DEFAULT_CHAT_ID`| **필수** | `TELEGRAM_CHAT_ID`와 동일값 입력 | 텔레그램 호환성 보장용 |
| `OPENAI_API_KEY` | 선택 | OpenAI Platform API Key (사용 시) | GPT-4o 멀티모델 교차 검증용 |
| `ANTHROPIC_API_KEY` | 선택 | Anthropic Console Key (사용 시) | Claude 3.5 Sonnet 연동용 |

---

## 4. 최종 배포(Deploy) 및 도메인 동기화

1. 환경 변수 입력 후 하단의 **[Deploy]** 버튼을 클릭합니다.
2. 약 1~2분 후 빌드가 완료되고 축하 화면과 함께 Vercel 고유 도메인(`https://<프로젝트명>.vercel.app`)이 발급됩니다.
3. **중요: `NEXT_PUBLIC_APP_URL` 동기화**
   - 발급받은 도메인이 예를 들어 `https://robobid-ai.vercel.app`라면,
   - Vercel 대시보드 > **Settings** > **Environment Variables**로 이동하여
   - `NEXT_PUBLIC_APP_URL` 값을 방금 발급된 도메인(`https://robobid-ai.vercel.app`)으로 수정한 뒤 **Redeploy**를 1회 실행합니다.
   - *이 작업이 완료되어야 텔레그램 알림 메시지 내의 '📱 공모 상세 모바일로 확인하기' 인라인 버튼이 클라우드 서비스로 정상 연결됩니다.*

---

## 5. 배포 후 실시간 기능 검증 체크리스트

배포된 사이트에 접속하여 다음 항목들이 정상 동작하는지 점검합니다:

1. **대시보드 (`/today`)**: 오늘의 수주 업무 브리핑 카드가 정상 렌더링되는지 확인
2. **공고 수집 및 텔레그램 자동 전송**:
   - `/opportunities` 페이지 접속 후 **[기업마당/나라장터 동기화]** 버튼 클릭
   - 본인의 텔레그램 메신저로 신규 공고 알림 카드가 실시간 도착하는지 확인
3. **RFP 업로드 및 AI 분석기 (`/rfp`)**:
   - 제안요청서 샘플 PDF/텍스트 업로드 후 AI 요구사항 및 리스크 추출 동작 확인
4. **제안서 작성 워크스페이스 (`/proposals`)**:
   - 신규 제안서 템플릿 생성, AI 드래프트 생성 및 4개 전문위원 Cross-Review 확인
5. **학습 및 개찰 결과 (`/learning`)**:
   - 개찰 결과 조회 및 복기 데이터 입력 정상 저장 확인
