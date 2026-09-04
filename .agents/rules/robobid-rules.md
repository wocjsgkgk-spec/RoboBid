# RoboBid AI — Workspace Engineering Rules

본 프로젝트는 `docs/product/ROBOBID-AI-MASTER-PRD-v1.0.md`를 최상위 Product Source of Truth로 사용합니다.

## 1. 절대 금지 규칙
- DB reset, Auth reset, Storage reset, 운영 데이터 삭제, migration history 초기화 금지
- 운영 DB에 sample / fake opportunity 데이터 삽입 금지
- API key의 단순 존재만으로 Provider를 `CONNECTED` 상태로 표시 금지 (실제 헬스체크 성공 시에만)
- 기밀 회사자료(특허, 원가, 재무 등)를 승인되지 않은 무료 외부 AI에 전송 금지
- `Opportunity Score`를 "수주 확률(Win Probability)"로 표기하거나 혼동 유발 금지
- 자동 공모 제출 또는 자동 외부 계약 체결 금지
- 비인가 스크래핑, CAPTCHA 및 접근제어 우회 금지

## 2. 개발 및 Phase 진행 원칙
- 한 번에 하나의 승인된 Phase만 실행한다.
- 사용자의 명시적 승인 없이 다음 Phase를 자동으로 시작하지 않는다.
- 모든 기능은 실제 사용자 작업(Job)을 해결해야 하며, 정상 데이터 / 빈 상태(Empty) / 로딩(Loading) / 에러(Error) / 권한 거부(Permission Denied) 상태를 모두 지원해야 한다.
- "Build 통과" 또는 "화면 표시"만으로 완료 처리하지 않고, 정량적 Gate 검증을 거친다.
