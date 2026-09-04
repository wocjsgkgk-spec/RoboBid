export interface FileValidationOptions {
  maxSizeBytes?: number; // 기본 50MB
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
}

export class FileValidator {
  public static readonly DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
  public static readonly ALLOWED_EXTENSIONS = ['.hwp', '.hwpx', '.pdf', '.docx', '.zip'];

  /**
   * 파일명 유효성 및 경로 탈출 검사
   */
  public static validateFilename(filename: string): { valid: boolean; error?: string } {
    if (!filename || filename.trim().length === 0) {
      return { valid: false, error: '파일명이 비어 있습니다.' };
    }

    // 경로 탈출 체크 (../ or ..\)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return { valid: false, error: '파일명에 비인가 경로 구분자나 상위 디렉토리 이동 문자가 포함되어 있습니다.' };
    }

    // 널 바이트 인젝션 방어
    if (filename.indexOf('\0') !== -1) {
      return { valid: false, error: '파일명에 널 바이트(Null Byte)가 포함되어 있습니다.' };
    }

    // 확장자 검사
    const lower = filename.toLowerCase();
    const hasValidExt = this.ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!hasValidExt) {
      return {
        valid: false,
        error: `허용되지 않은 파일 확장자입니다. (${this.ALLOWED_EXTENSIONS.join(', ')} 만 허용)`,
      };
    }

    return { valid: true };
  }

  /**
   * 파일 용량 검사
   */
  public static validateSize(
    sizeBytes: number,
    maxSize: number = this.DEFAULT_MAX_SIZE
  ): { valid: boolean; error?: string } {
    if (sizeBytes <= 0) {
      return { valid: false, error: '파일 크기가 0바이트입니다.' };
    }
    if (sizeBytes > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return { valid: false, error: `파일 크기가 최대 제한(${maxMb}MB)을 초과했습니다.` };
    }
    return { valid: true };
  }

  /**
   * 파일 바이너리 헤더(Magic Bytes) 검사
   */
  public static validateMagicBytes(
    filename: string,
    buffer: Uint8Array | Buffer
  ): FileValidationResult {
    const filenameRes = this.validateFilename(filename);
    if (!filenameRes.valid) {
      return { valid: false, error: filenameRes.error };
    }

    if (!buffer || buffer.length < 4) {
      return { valid: false, error: '파일 내용이 너무 짧아 유효성을 검증할 수 없습니다.' };
    }

    const lower = filename.toLowerCase();

    // 1. PDF Magic Bytes: %PDF (0x25, 0x50, 0x44, 0x46)
    if (lower.endsWith('.pdf')) {
      if (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      ) {
        return { valid: true, detectedMimeType: 'application/pdf' };
      }
      return { valid: false, error: 'PDF 파일의 바이너리 서명이 일치하지 않습니다.' };
    }

    // 2. ZIP / HWPX / DOCX Magic Bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    if (lower.endsWith('.zip') || lower.endsWith('.hwpx') || lower.endsWith('.docx')) {
      if (
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
        (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
      ) {
        const mime = lower.endsWith('.hwpx')
          ? 'application/hwp+zip'
          : lower.endsWith('.docx')
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/zip';
        return { valid: true, detectedMimeType: mime };
      }
      return { valid: false, error: '압축 컨테이너(HWPX/DOCX/ZIP)의 바이너리 서명이 일치하지 않습니다.' };
    }

    // 3. HWP (5.0 OLE CFB Magic Bytes: 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1)
    if (lower.endsWith('.hwp')) {
      if (
        buffer[0] === 0xd0 &&
        buffer[1] === 0xcf &&
        buffer[2] === 0x11 &&
        buffer[3] === 0xe0
      ) {
        return { valid: true, detectedMimeType: 'application/x-hwp' };
      }
      return { valid: false, error: '한글(HWP) 문서의 바이너리 서명이 일치하지 않습니다.' };
    }

    return { valid: false, error: '지원되지 않는 파일 형식입니다.' };
  }

  /**
   * 종합 파일 검증
   */
  public static validateFile(
    filename: string,
    buffer: Uint8Array | Buffer,
    maxSize: number = this.DEFAULT_MAX_SIZE
  ): FileValidationResult {
    const nameCheck = this.validateFilename(filename);
    if (!nameCheck.valid) return nameCheck;

    const sizeCheck = this.validateSize(buffer.length, maxSize);
    if (!sizeCheck.valid) return sizeCheck;

    return this.validateMagicBytes(filename, buffer);
  }
}
