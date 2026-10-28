import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { exifDate, pick, videoLength } from '../lib/album';

describe('album', () => {
  it('reads the date a photo was taken from EXIF', async () => {
    const b = new Blob([readFileSync(new URL('./__fixtures__/exif.jpg', import.meta.url))]);
    expect(await exifDate(b)).toBe(new Date(2026, 10, 6, 12, 30, 0).getTime());
    expect(await exifDate(new Blob([new Uint8Array([1, 2, 3])]))).toBeNull();
  });
  it('picks photos spread over the whole trip, keeping first and last', () => {
    const l = Array.from({ length: 100 }, (_, i) => i);
    const p = pick(l, 5); expect(p).toEqual([0, 25, 50, 74, 99]);
    expect(pick([1, 2], 5)).toEqual([1, 2]);
  });
  it('video length = intro + photos × seconds + ending', () => {
    expect(videoLength(10, { perPhoto: 3, max: 40 })).toBe(37);
    expect(videoLength(100, { perPhoto: 2, max: 20 })).toBe(47);
  });
});
