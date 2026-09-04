import zlib from "zlib";

export interface ZipEntry {
  fileName: string;
  isCompressed: boolean;
  uncompressedSize: number;
  data: Buffer;
}

export class MiniZip {
  /**
   * Safely unpacks standard PKZIP archive files (used by HWPX, DOCX, XLSX, and ZIP).
   */
  public static extractEntries(buffer: Buffer): Map<string, ZipEntry> {
    const entries = new Map<string, ZipEntry>();
    let offset = 0;

    while (offset < buffer.length - 30) {
      // Look for Local File Header Signature: 0x04034b50 (PK\x03\x04)
      const sig = buffer.readUInt32LE(offset);
      if (sig !== 0x04034b50) {
        // Stop if not a local file header (reached central directory or EOF)
        break;
      }

      const flags = buffer.readUInt16LE(offset + 6);
      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const uncompressedSize = buffer.readUInt32LE(offset + 22);
      const fileNameLen = buffer.readUInt16LE(offset + 26);
      const extraFieldLen = buffer.readUInt16LE(offset + 28);

      const headerSize = 30 + fileNameLen + extraFieldLen;
      const fileName = buffer.toString("utf8", offset + 30, offset + 30 + fileNameLen);
      const dataOffset = offset + headerSize;

      // Handle data descriptor flag (bit 3) if sizes are 0 in local header
      let dataBuffer: Buffer;
      if (compressedSize > 0 && dataOffset + compressedSize <= buffer.length) {
        const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
        if (compressionMethod === 8) {
          // Deflated
          try {
            dataBuffer = zlib.inflateRawSync(compressedData);
          } catch {
            dataBuffer = Buffer.alloc(0);
          }
        } else if (compressionMethod === 0) {
          // Stored
          dataBuffer = Buffer.from(compressedData);
        } else {
          dataBuffer = Buffer.alloc(0);
        }

        entries.set(fileName, {
          fileName,
          isCompressed: compressionMethod === 8,
          uncompressedSize,
          data: dataBuffer,
        });

        offset = dataOffset + compressedSize;
      } else {
        // Move to next possible header
        offset += headerSize;
      }
    }

    return entries;
  }
}
