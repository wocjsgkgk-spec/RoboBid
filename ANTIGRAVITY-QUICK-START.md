# RoboBid AI — Antigravity CLI Quick Start

## 1. Repository에 저장
아래 파일을 저장하세요.

```text
docs/product/ROBOBID-AI-MASTER-PRD-v1.0.md
docs/phases/prompts/PHASE-00.md
...
docs/phases/prompts/PHASE-11.md
```

## 2. 첫 실행
Antigravity CLI에서 먼저 `PHASE-00.md`의 프롬프트만 실행하세요.

## 3. 원칙
- PRD는 계속 저장소에 보관
- 한 번에 한 Phase
- Phase 완료 후 결과 검토
- 다음 Phase 자동진행 금지
- 데이터/DB/보안 변경은 Phase gate 기준

## 4. 권장
Workspace rules는 `.agents/rules/`에 배치할 수 있습니다.
Custom agents는 `.agents/agents/<name>/agent.md` 또는 관련 지원 위치를 사용할 수 있습니다.
