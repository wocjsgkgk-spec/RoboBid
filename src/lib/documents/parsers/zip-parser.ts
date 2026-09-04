import { MiniZip } from "../unzipper";

export interface ZipArchiveSummary {
  totalFiles: number;
  files: Array<{
    fileName: string;
    sizeBytes: number;
    extension: string;
  }>;
}

export class ZipParser {
  /**
   * Unpacks a ZIP archive and indexes internal RFP document files.
   */
  public static parse(buffer: Buffer): ZipArchiveSummary {
    const entries = MiniZip.extractEntries(buffer);
    const files: Array<{ fileName: string; sizeBytes: number; extension: string }> = [];

    for (const [name, entry] of entries.entries()) {
      if (name.endsWith("/")) continue; // directory
      const ext = name.split(".").pop()?.toLowerCase() || "";
      files.push({
        fileName: name,
        sizeBytes: entry.uncompressedSize,
        extension: ext,
      });
    }

    return {
      totalFiles: files.length,
      files,
    };
  }
}
