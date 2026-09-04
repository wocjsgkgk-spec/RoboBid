# RoboBid AI — Phase 0: Provider Source Matrix

- 문서 버전: v1.0
- 작성일시: 2026-09-04
- 담당: Principal Product Engineer / Software Architect
- 대상 Phase: Phase 0 (Product / Technical Baseline & Source Verification)

---

## 1. 목적 및 원칙

`ROBOBID-AI-MASTER-PRD-v1.0.md` Section 11, 12에 정의된 공공데이터 수집 원칙을 바탕으로, 주요 공공 공모·입찰 소스의 공식 API 연동 가능성, 데이터 품질, 인증 및 제약사항을 실증적으로 조사하여 매트릭스로 정리한다.

### 핵심 준수 원칙:
1. **공식 Open API 우선**: 비인가 스크래핑이나 로그인/CAPTCHA 우회 금지.
2. **Fake Connected 금지**: API Key의 단순 존재만으로 정상 상태로 표시하지 않음. 실제 통신 및 스키마 유효성 검증 필수.
3. **무료 티어 우선 활용**: 공공데이터포털(data.go.kr) 기반 무료 제공 서비스 중심.
4. **Fallback 필수**: API 장애 또는 미개방 필드 대비 전략 수립.

---

## 2. 핵심 5대 Provider 상세 조사 매트릭스

| 항목 | 1. 조달청 / 나라장터 (KONEPS) | 2. K-Startup (창업진흥원) | 3. 기업마당 (중소벤처기업부) | 4. 국고보조금 공모사업 (e나라도움) | 5. IRIS (범부처연구지원) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Official Source** | 공공데이터포털 (data.go.kr)<br>조달청_나라장터 입찰공고정보서비스 | 공공데이터포털 (data.go.kr)<br>창업진흥원_K-Startup 사업공고 조회서비스 | 공공데이터포털 / bizinfo.go.kr<br>중소벤처기업부_기업마당 지원사업정보 | 공공데이터포털 / bojo.go.kr<br>기획재정부 국고보조금 공모사업 정보 | 범부처통합연구지원시스템 (iris.go.kr) |
| **Access Method** | REST API (GET)<br>Response: JSON / XML | REST API (GET)<br>Response: JSON / XML | REST API (GET)<br>Response: JSON / XML | REST API (GET)<br>Response: JSON / XML | 웹 공고 / 기관 연계 API<br>(대외 오픈API 미전면 개방) |
| **Auth / Key** | 공공데이터포털 공용 ServiceKey<br>(일반 인증키 Encoding/Decoding) | 공공데이터포털 공용 ServiceKey<br>(일반 인증키 Encoding/Decoding) | 공공데이터포털 공용 ServiceKey 또는 기업마당 오픈API 인증키 | 공공데이터포털 공용 ServiceKey | 사이트 회원 세션 / 향후 공식 API 신청 |
| **주요 제공 필드** | 공고번호, 차수, 공고명, 공고기관, 수요기관, 계약방법, 입찰마감일시, 배정예산, 추정가격, 공고URL, 상세링크 | 공고ID, 사업명, 지원분야, 주관기관, 신청시작/마감일시, 지원대상(업력/연령), 지원규모, 공고상세URL | 지원사업ID, 사업명, 소관기관, 수행기관, 신청기간, 지원대상, 지원분야, 지원내용, 상세URL | 공모사업ID, 사업명, 소관부처, 보조사업자, 공모접수기간, 국고보조금액, 자부담비율, 상세URL | 사업공고명, 전문기관, 공고일자, 접수마감일자, 총사업비, RFP 첨부파일 등 |
| **Attachment 지원** | 첨부파일 다운로드 URL 제공<br>(규격서, 제안요청서 등 첨부 링크) | 공고 상세 웹페이지 링크 제공<br>(첨부파일은 상세페이지 다운로드 링크 연계) | 공고 상세 웹페이지 링크 제공<br>(첨부파일은 웹페이지 내 링크 연계) | 공모요강 문서 첨부 URL 또는 상세페이지 링크 | 첨부파일(HWP, PDF) 웹 다운로드 제공 |
| **Rate Limits** | 기본 일 10,000건<br>(활용목적에 따라 증량 신청 가능) | 기본 일 10,000건 | 기본 일 1,000~10,000건 | 기본 일 1,000~10,000건 | N/A (공식 공모 OpenAPI 부재) |
| **Update Frequency** | 준실시간 (10~30분 주기 동기화) | 일 1~2회 갱신 (오전/오후) | 일 1~2회 갱신 | 수시 (일 1회 이상) | 수시 (R&D 공고 시즌 집중) |
| **Terms / Robots** | 공공누리 제1유형 (출처표시 시 상업적/비상업적 자유이용) | 공공누리 제1유형 (자유이용 가능) | 공공누리 제1유형 (자유이용 가능) | 공공누리 제1유형 (자유이용 가능) | robots.txt 준수 필수.<br>비인가 무단 대량 크롤링 금지 |
| **MVP 적합도** | **P0 (필수 - 최우선 연동)**<br>로봇 조달·용역·물품·실증 사업 대다수 포함 | **P0 (필수 - 최우선 연동)**<br>하드웨어/로봇 스타트업 창업·사업화 지원사업 | **P0 (필수 - 최우선 연동)**<br>중기부/지자체 로봇·스마트팩토리 보조금 지원사업 | **P1 (초기 확장 연동)**<br>국비 대규모 보조금 공모사업 모니터링 | **P1~P2 (수동/선별 연동)**<br>R&D 원천기술 공고 수동/RSS 모니터링 |
| **Fallback Strategy** | API 장애 시 지수 백오프 재시도 및 나라장터 RSS/공개 웹 링크 확인 알림 | API 미응답 시 캐시 데이터 유지 및 공지 화면 안내 | 지자체별 공고 직접 수집 Adapter 또는 사용자 URL 등록 | 보조금통합포털(bojo.go.kr) 웹 공고 수동 등록 | 공식 API 개방 전까지 "사용자 URL/파일 직접 등록" 및 정책 준수 파서 적용 |

---

## 3. 핵심 Provider 상세 연동 명세

### 3.1 조달청 나라장터 (P0 - 최우선)
- **공식 명칭**: `조달청_나라장터 입찰공고정보서비스`
- **베이스 URL**: `http://apis.data.go.kr/1230000/PubDataOpnStdBidPblancInfo` 또는 `BidPublicInfoService04`
- **핵심 오퍼레이션**:
  - `getDataSetOpnStdBidPblancInfo`: 입찰공고 목록 및 상세 정보 조회 (용역/물품/공사)
  - `getBidPblancListInfoServcPPSSrch`: 용역 입찰공고 상세 검색 (조달청 및 자체조달)
- **필수 검색 조건**:
  - `inqryBgnDt` / `inqryEndDt` (조회 기간: YYYYMMDDHHMM)
  - `numOfRows` (페이지당 건수: 100건 권장)
- **로봇/특수목적 하드웨어 키워드 필터링**:
  - API 레벨 1차 키워드 쿼리 (`bidNtceNm`: "로봇", "자동화", "무인이동체", "AMR", "AGV", "스마트팜", "특수목적")
  - 애플리케이션 레벨 2차 도메인 분류 엔진 연동

### 3.2 K-Startup 창업진흥원 (P0 - 최우선)
- **공식 명칭**: `창업진흥원_K-Startup 사업공고 조회서비스`
- **베이스 URL**: `http://apis.data.go.kr/B552735/k-startup-service/`
- **특징**:
  - 초기/도약기 로봇 하드웨어 스타트업 대상 시제품 제작비, 기술실증, 해외진출 국비지원 사업 다수 포함.
  - 지원대상 연령, 업력(예: 3년 미만, 7년 미만) 필드가 명확하여 Eligibility Gate 자동 필터링에 최적.

### 3.3 중소벤처기업부 기업마당 (P0 - 최우선)
- **공식 명칭**: `중소벤처기업부_기업마당 지원사업정보`
- **베이스 URL**: `http://apis.data.go.kr/1360000/BizInfoService/` 및 `https://www.bizinfo.go.kr/uss/openapi/`
- **특징**:
  - 560여 개 지자체 및 유관기관(테크노파크, 로봇진흥원, 진흥협회 등)의 지원사업을 취합하여 제공.
  - 지역(서울, 경기, 대전 등) 및 기업규모(중소, 소상공인, 중견) 메타데이터가 잘 구조화되어 있음.

### 3.4 e나라도움 / 보조금통합포털 (P1)
- **특징**:
  - 지자체 및 중앙부처의 대규모 국고보조금 공모사업 포괄.
  - 민간 자부담금 비율 및 총사업비가 명시되어 재무 적격성 평가(Financial Fit)에 유용.

### 3.5 IRIS 범부처통합연구지원시스템 (P1~P2)
- **특징**:
  - 과기부/산업부/중기부 등 국가 R&D 과제의 통합 창구.
  - 현재 전면적인 대외 공개 오픈API는 개발 중/제한 연계 상태임.
  - **정책 준수 조치**: PRD 12항 및 46항에 의거, 비인가 우회 스크래핑을 절대 시도하지 않으며, "공식 지원 전까지는 담당자가 IRIS 공고 URL 또는 RFP 파일(HWP/HWPX/PDF)을 직접 업로드"하는 파이프라인으로 처리.

---

## 4. Provider Ingestion 아키텍처 및 상태 모델 준수 계획

PRD Section 11에 명시된 Adapter 인터페이스 규격:

```typescript
export interface ProviderAdapter {
  providerId: string;
  name: string;
  checkHealth(): Promise<ProviderHealthStatus>;
  fetchOpportunities(since: Date): Promise<RawOpportunityPayload[]>;
  normalize(raw: RawOpportunityPayload): NormalizedOpportunity;
}
```

### 상태 전이 기준 (Fake Connected 방지):
- `CONNECTED`: 실제 Ping 또는 최근 1회 이상 정상 데이터 Fetch 성공
- `KEY_MISSING`: 환경변수에 API Key가 주입되지 않음
- `RATE_LIMITED`: HTTP 429 수신 시 지수 백오프 전환
- `DEGRADED`: 응답 지연 또는 일부 필드 파싱 실패
- `FAILED`: 연속 3회 이상 HTTP 5xx 또는 통신 장애
- `MANUAL_ONLY`: IRIS 등 공식 API 부재 소스 (수동 업로드 전용)

---

## 5. 결론 및 Phase 1/2 반영사항

1. **검증 통과**: P0 대상 3개 Provider(**나라장터, K-Startup, 기업마당**)는 모두 공공데이터포털 공식 Open API로 즉시 수집 가능함을 확인하였다.
2. **Phase 1 준비사항**: DB 스키마에 `providers`, `provider_runs` 테이블을 설계하고 상태 모델(`CONNECTED`, `FAILED` 등)을 enum으로 엄격하게 바인딩한다.
3. **Phase 2 구현계획**: 검증된 3개 Provider의 Adapter를 순차적으로 구현하고 중복 제거(deduplication) 알고리즘을 연결한다.
