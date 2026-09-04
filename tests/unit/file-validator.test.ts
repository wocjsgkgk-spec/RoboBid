import { describe, it, expect } from 'vitest';
import { FileValidator } from '@/lib/security/file-validator';

describe('Phase 10: Strict File Validator & Magic Bytes Inspection', () => {
  it('정상적인 PDF 매직 바이트(%PDF)는 통과해야 한다', () => {
    // %PDF 헤더 (0x25, 0x50, 0x44, 0x46)
    const pdfBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
    const result = FileValidator.validateFile('proposal.pdf', pdfBuffer);

    expect(result.valid).toBe(true);
    expect(result.detectedMimeType).toBe('application/pdf');
  });

  it('확장자만 .pdf이고 실제 내용이 텍스트인 위조 파일은 차단되어야 한다', () => {
    // plain text: "hello world"
    const fakeBuffer = new TextEncoder().encode('hello world evil script');
    const result = FileValidator.validateFile('proposal.pdf', fakeBuffer);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('바이너리 서명이 일치하지 않습니다');
  });

  it('경로 탈출 시도(../)가 포함된 파일명은 즉시 차단되어야 한다', () => {
    const dummyBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const result = FileValidator.validateFile('../../etc/passwd.pdf', dummyBuffer);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('경로 구분자나 상위 디렉토리 이동 문자');
  });

  it('최대 파일 크기(50MB)를 초과하는 파일은 차단되어야 한다', () => {
    const sizeCheck = FileValidator.validateSize(55 * 1024 * 1024, 50 * 1024 * 1024);
    expect(sizeCheck.valid).toBe(false);
    expect(sizeCheck.error).toContain('최대 제한(50MB)을 초과');
  });

  it('HWPX 및 DOCX (PK ZIP 헤더)는 올바른 MIME 타입으로 감지되어야 한다', () => {
    // PK\x03\x04 헤더
    const zipBuffer = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const hwpxRes = FileValidator.validateFile('rfp_spec.hwpx', zipBuffer);
    expect(hwpxRes.valid).toBe(true);
    expect(hwpxRes.detectedMimeType).toBe('application/hwp+zip');

    const docxRes = FileValidator.validateFile('requirements.docx', zipBuffer);
    expect(docxRes.valid).toBe(true);
    expect(docxRes.detectedMimeType).toContain('wordprocessingml');
  });
});
