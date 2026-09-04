import { z } from "zod";

export const KonepsOpeningResultSchema = z.object({
  bidNtceNo: z.string(), // 입찰공고번호
  bidNtceOrd: z.string().default("00"), // 공고차수
  bidNtceNm: z.string(), // 공고명
  opengDt: z.string(), // 개찰일시 (ISO)
  announcingAgency: z.string(), // 발주/공고기관명
  demandingAgency: z.string().optional(), // 수요기관명
  totPrtcptBsnmCnt: z.number().default(0), // 총 참가업체수
  bsisAmt: z.number().nullable().optional(), // 기초금액
  plnprc: z.number().nullable().optional(), // 예정가격
  
  // 1순위 (최저가/적격1순위) 업체 정보
  lwstBdrBsnmNm: z.string().nullable().optional(),
  lwstBdrBidAmt: z.number().nullable().optional(),
  lwstBdrBidRate: z.number().nullable().optional(), // 투찰율 (%)
  
  // 최종 낙찰 정보 (결정된 경우)
  sucsfBdrBsnmNm: z.string().nullable().optional(),
  sucsfBidAmt: z.number().nullable().optional(),
  sucsfBidRate: z.number().nullable().optional(),
  
  // 상태: "OPENED"(개찰완료), "SUCCESSFUL"(낙찰자결정), "REBID"(재입찰), "FAILED"(유찰)
  resultStatus: z.enum(["OPENED", "SUCCESSFUL", "REBID", "FAILED"]).default("OPENED"),
  
  // 투찰가 분석 통계
  estimatedPriceRate: z.number().nullable().optional(), // 예정가격/기초금액 사상률 (%)
  notes: z.string().optional(),
});

export type KonepsOpeningResult = z.infer<typeof KonepsOpeningResultSchema>;

export interface OpeningResultQueryOptions {
  bidNtceNo?: string;
  bidNtceNm?: string;
  startDate?: string;
  endDate?: string;
  pageNo?: number;
  numOfRows?: number;
}
