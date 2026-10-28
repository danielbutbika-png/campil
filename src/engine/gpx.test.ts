// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseGpx, toGpx, simplify, stats, distKm } from './gpx';

const track = (n: number) => `<?xml version="1.0"?><gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>נחל עמוד</name><trkseg>${
  Array.from({ length: n }, (_, i) => `<trkpt lat="${(32.9 + i * 0.0001).toFixed(6)}" lon="35.5"><ele>${100 + (i % 2 ? 5 : 0)}</ele></trkpt>`).join('')}</trkseg></trk><wpt lat="32.91" lon="35.51"><name>חניה</name></wpt></gpx>`;

describe('GPX', () => {
  it('reads a track: name, waypoints, distance and climb', () => {
    const g = parseGpx(track(101), 'x.gpx', '2026-10-28');
    expect(g.name).toBe('נחל עמוד');
    expect(g.waypoints).toEqual([{ name: 'חניה', lat: 32.91, lon: 35.51 }]);
    expect(g.km).toBeCloseTo(1.11, 1); // 100 × 0.0001° lat ≈ 1.11 km
    expect(g.gain).toBe(250); expect(g.loss).toBe(250);
  });
  it('simplifies a straight line to its ends but keeps distance from the original', () => {
    const g = parseGpx(track(500).replace(/<ele>\d+<\/ele>/g, ''));
    expect(g.points.length).toBeLessThan(10); expect(g.km).toBeGreaterThan(5);
    expect(g.gain).toBeUndefined(); // no elevation in the file → no climb figures
  });
  it('keeps corners when simplifying', () => {
    const pts = [{ lat: 0, lon: 0 }, { lat: 0, lon: 0.01 }, { lat: 0.01, lon: 0.01 }];
    expect(simplify(pts)).toHaveLength(3);
  });
  it('rejects files that are not GPX', () => {
    expect(() => parseGpx('<html></html>')).toThrow(/GPX/);
    expect(() => parseGpx('<gpx version="1.1"></gpx>')).toThrow(/אין מסלול/);
  });
  it('exports a valid GPX that reads back the same places and track', () => {
    const g = parseGpx(track(20));
    const out = toGpx('טיול & כיף', [{ name: 'חניון "א"', lat: 33, lon: 35.6 }], g);
    expect(out).toContain('טיול &amp; כיף');
    const back = parseGpx(out);
    expect(back.waypoints[0]).toEqual({ name: 'חניון "א"', lat: 33, lon: 35.6 });
    expect(back.points.length).toBe(g.points.length);
    expect(stats(back.points).km).toBeCloseTo(stats(g.points).km, 5);
    expect(distKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111.2, 0);
  });
});
