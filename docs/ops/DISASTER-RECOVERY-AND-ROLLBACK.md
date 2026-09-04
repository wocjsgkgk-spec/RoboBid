# RoboBid AI — Disaster Recovery & Rollback Strategy

- 문서 버전: v1.0
- 최종 갱신일: 2026-09-04
- 대상: Production Engineering / SRE

---

## 1. 재해 복구 목표 (RTO / RPO)

- **RTO (Recovery Time Objective)**: 장애 발생 후 정상 서비스 재개까지 30분 이내.
- **RPO (Recovery Point Objective)**: 최대 데이터 유실 허용치 5분 이내 (WAL 스트리밍 기반).

---

## 2. 장애 유형별 대응 절차

### 2.1 공공데이터 Provider 장애 (KONEPS, IRIS, NTIS 등)
- **증상**: 외부 API 타임아웃 또는 HTTP 500/502 응답
- **대응 메커니즘**:
  1. `ResilienceService.executeWithRetry`에 의해 지수 백오프(Exponential Backoff with Jitter) 3회 자동 재시도.
  2. 최종 실패 시 `last-good-data` 캐시를 유지하여 UI 서비스 중단을 방지(Graceful Fallback).
  3. 에러 발생 시 Ingestion 로그에 기록하고 알림 발송.

### 2.2 배포 실패 및 롤백 절차 (Rollback SOP)
- **증상**: 신규 배포 후 빌드 에러, 런타임 크래시 또는 치명적 회귀 버그 발생
- **대응 순서**:
  1. 이전 Git 커밋 태그 확인:
     ```bash
     git log --oneline -n 5
     ```
  2. 무중단 롤백 배포 트리거:
     ```bash
     git revert <bad_commit_hash>
     # 또는 CI/CD 파이프라인에서 이전 릴리스 아티팩트 즉시 프로모션
     ```
  3. 마이그레이션 롤백 필요 시 (DDL 하위 호환성 유지 원칙에 따라 신규 컬럼은 Nullable 처리되어 롤백 시에도 구버전 서버 정상 가동).

### 2.3 데이터베이스 장애 복구 (PITR 복구)
- Supabase 대시보드 또는 CLI를 통한 시점 복구:
  ```bash
  supabase db restore --target-time "2026-09-04T10:00:00Z"
  ```
