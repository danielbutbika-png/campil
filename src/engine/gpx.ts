// GPX: import a track/route (from a hiking app or a trail site), simplify it for storage and sync, compute
// distance and climb, and export the trip (track + planned places) back to GPX.
// Values are computed from the file's points only; elevation figures exist only if the file has <ele>.
export interface GpxPoint { lat: number; lon: number; ele?: number }
export interface GpxTrack { name: string; points: GpxPoint[]; waypoints: { name: string; lat: number; lon: number }[]; km: number; gain?: number; loss?: number; source: string; importedAt: string; /** climb estimated from a terrain model, not measured in the file */ climbEst?: boolean }

const R = 6371;
export function distKm(a: GpxPoint, b: GpxPoint) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180, dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Douglas–Peucker in local metres; keeps the shape within `tolM` metres. */
export function simplify(pts: GpxPoint[], tolM = 8): GpxPoint[] {
  if (pts.length < 3) return pts;
  const lat0 = (pts[0].lat * Math.PI) / 180;
  const xy = pts.map(p => [p.lon * 111320 * Math.cos(lat0), p.lat * 110540]);
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!; let max = 0, idx = -1;
    const [ax, ay] = xy[a], [bx, by] = xy[b]; const dx = bx - ax, dy = by - ay; const len = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * xy[i][0] - dx * xy[i][1] + bx * ay - by * ax) / len; if (d > max) { max = d; idx = i; } }
    if (max > tolM && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

export function stats(pts: GpxPoint[]) {
  let km = 0, gain = 0, loss = 0; const hasEle = pts.length > 1 && pts.every(p => p.ele != null);
  for (let i = 1; i < pts.length; i++) {
    km += distKm(pts[i - 1], pts[i]);
    if (hasEle) { const d = pts[i].ele! - pts[i - 1].ele!; if (d > 0) gain += d; else loss -= d; }
  }
  return { km: Math.round(km * 100) / 100, gain: hasEle ? Math.round(gain) : undefined, loss: hasEle ? Math.round(loss) : undefined };
}

const num = (s: string | null) => (s == null || s === '' ? NaN : Number(s));
/** Parse GPX text (tracks, routes and waypoints). Throws a readable error for anything that isn't GPX. */
export function parseGpx(text: string, fileName = 'מסלול', now = new Date().toISOString()): GpxTrack {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length || doc.documentElement.localName !== 'gpx') throw new Error('הקובץ אינו קובץ GPX תקין');
  const pt = (el: Element): GpxPoint | null => {
    const lat = num(el.getAttribute('lat')), lon = num(el.getAttribute('lon'));
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    const e = num(el.getElementsByTagName('ele')[0]?.textContent ?? null);
    return isFinite(e) ? { lat, lon, ele: e } : { lat, lon };
  };
  const trk = [...doc.getElementsByTagName('trkpt')].map(pt).filter(Boolean) as GpxPoint[];
  const rte = [...doc.getElementsByTagName('rtept')].map(pt).filter(Boolean) as GpxPoint[];
  const raw = trk.length ? trk : rte;
  const waypoints = [...doc.getElementsByTagName('wpt')].map(el => { const p = pt(el); return p && { name: el.getElementsByTagName('name')[0]?.textContent?.trim() || 'נקודה', lat: p.lat, lon: p.lon }; }).filter(Boolean).slice(0, 100) as GpxTrack['waypoints'];
  if (raw.length < 2 && !waypoints.length) throw new Error('בקובץ אין מסלול או נקודות');
  const s = stats(raw); // from the full-resolution points
  let points = simplify(raw, 8); if (points.length > 1500) points = simplify(raw, 25);
  const name = doc.querySelector('trk > name, rte > name, metadata > name')?.textContent?.trim() || fileName.replace(/\.gpx$/i, '');
  return { name, points, waypoints, ...s, source: fileName, importedAt: now };
}

const esc = (s: string) => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
/** GPX 1.1 with the trip's planned places as waypoints and the imported track (if any). */
export function toGpx(name: string, places: { name: string; lat: number; lon: number }[], track?: GpxTrack | null, drive?: { name: string; coords: [number, number][] } | null): string {
  const w = places.map(p => `  <wpt lat="${p.lat}" lon="${p.lon}"><name>${esc(p.name)}</name></wpt>`).join('\n');
  const t = track?.points.length ? `  <trk><name>${esc(track.name)}</name><trkseg>\n${track.points.map(p => `    <trkpt lat="${p.lat}" lon="${p.lon}">${p.ele != null ? `<ele>${p.ele}</ele>` : ''}</trkpt>`).join('\n')}\n  </trkseg></trk>` : '';
  const d = drive?.coords.length ? `  <rte><name>${esc(drive.name)}</name>\n${drive.coords.map(([lon, lat]) => `    <rtept lat="${lat}" lon="${lon}"/>`).join('\n')}\n  </rte>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="CampIL" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${esc(name)}</name></metadata>\n${w}\n${d}\n${t}\n</gpx>\n`;
}
