# RoboBid AI — Production Operations Runbook

- 문서 버전: v1.0
- 최종 갱신일: 2026-09-04
- 대상: DevOps, Site Reliability Engineer, System Administrator

---

## 1. 시스템 아키텍처 개요

RoboBid AI는 로봇·특수목적 하드웨어 공공 R&D 및 조달 공모사업을 위한 반응형 PWA BidOps 플랫폼입니다.

- **Frontend & BFF**: Next.js 14 (App Router, Standalone PWA, Server Actions & Route Handlers)
- **Database**: Supabase PostgreSQL 15+ (Row Level Security 기반 멀티 테넌트 격리)
- **Storage**: Supabase Private S3 Storage (서명된 URL `createSignedUrl`로만 원문 첨부문서 접근)
- **Background Engine**: Next.js Cron / Task Worker (공공데이터 5대 Provider 동기화 및 HWPX/DOCX 파싱 파이프라인)

---

## 2. 헬스체크 및 모니터링

### 2.1 통합 헬스체크 엔드포인트
- **URL**: `GET /api/health`
- **응답 규격**:
  ```json
  {
    "status": "HEALTHY",
    "version": "1.0.0",
    "uptimeSeconds": 3600,
    "checks": {
      "database": { "status": "UP", "latencyMs": 12 },
      "memory": { "usedMb": 54, "status": "UP" },
      "providers": { "count": 5, "active": 5, "status": "UP" }
    }
  }
  ```
- **모니터링 알람 임계치**:
  - `status != "HEALTHY"`: P1 알람 즉시 발송
  - `latencyMs > 500`: DB 연결 경고
  - `usedMb > 1024`: 메모리 누수 점검

---

## 3. 보안 및 운영 불변식

1. **Zero Fake Data 원칙**:
   - 운영 DB에 테스트용 Fake/Mock 공모 또는 가짜 사내 역량 자산을 임의 주입하지 않는다.
2. **Zero Premature Win Probability**:
   - 기회 평가 점수(`Opportunity Score`)를 "수주 확률(Win Probability)"로 표기하거나 안내하지 않는다.
3. **Zero Auto-Submission**:
   - 나라장터 및 조달청 외부망으로의 자동 제출 API는 시스템에 존재하지 않으며, 오직 인간 담당자의 확인(`confirmSubmission`)으로만 접수 상태가 확정된다.
4. **Rate Limiting**:
   - `src/middleware.ts`에서 IP당 1분간 최대 100회 요청 제한(429 Too Many Requests 방어).

---

## 4. 백업 및 데이터 보존 (Backup & Retention)

1. **DB 자동 백업**:
   - Supabase Point-in-Time Recovery (PITR) 활성화 (보관주기: 30일).
   - 일 단위 Daily Dump를 S3 Cold Storage에 암호화 보관.
2. **첨부파일 스토리지 보존**:
   - 다운로드된 공모 제안요청서 원문(HWP, HWPX, PDF)은 SHA-256 해시 기반 무결성 보존.
