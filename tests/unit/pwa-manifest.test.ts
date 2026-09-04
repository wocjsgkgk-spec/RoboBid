import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 10: PWA Manifest & App Shell Integrity', () => {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');

  it('public/manifest.json 파일이 유효한 JSON 형식으로 존재해야 한다', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('RoboBid AI — BidOps Intelligence Platform');
    expect(manifest.short_name).toBe('RoboBid AI');
    expect(manifest.start_url).toBe('/today');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toHaveLength(2);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(1);
  });

  it('PWA 아이콘 파일들이 public/icons 디렉토리에 존재해야 한다', () => {
    const icon192 = path.join(process.cwd(), 'public', 'icons', 'icon-192.svg');
    const icon512 = path.join(process.cwd(), 'public', 'icons', 'icon-512.svg');

    expect(fs.existsSync(icon192)).toBe(true);
    expect(fs.existsSync(icon512)).toBe(true);
  });

  it('서비스 워커(sw.js) 및 오프라인 폴백(offline.html) 파일이 존재해야 한다', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    const offlinePath = path.join(process.cwd(), 'public', 'offline.html');

    expect(fs.existsSync(swPath)).toBe(true);
    expect(fs.existsSync(offlinePath)).toBe(true);
  });
});
