export const uid = (p = '') => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export const todayISO = () => toISO(new Date());
export function toISO(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export function parseISO(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(s: string, n: number) { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); }
export function diffDays(a: string, b: string) { return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000); }
export function tripLength(start: string, end: string) {
  const nights = Math.max(0, diffDays(start, end));
  return { days: nights + 1, nights };
}
export function datesBetween(start: string, end: string) { const out: string[] = []; for (let d = start; d <= end; d = addDays(d, 1)) out.push(d); return out; }

const DAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const MONTH = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
export const dayName = (s: string) => 'יום ' + DAY[parseISO(s).getDay()];
export const shortDay = (s: string) => DAY[parseISO(s).getDay()];
export function fmtDate(s: string, withDay = false) { const d = parseISO(s); return `${withDay ? dayName(s) + ', ' : ''}${d.getDate()} ב${MONTH[d.getMonth()]}`; }
export function fmtRange(a: string, b: string) {
  const A = parseISO(a), B = parseISO(b);
  if (a === b) return fmtDate(a);
  if (A.getMonth() === B.getMonth()) return `${A.getDate()}–${B.getDate()} ב${MONTH[B.getMonth()]}`;
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export function seasonOf(s: string): Season {
  const m = parseISO(s).getMonth() + 1;
  return m === 12 || m <= 2 ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? 'summer' : 'autumn';
}
export const SEASON_HE: Record<Season, string> = { winter: 'חורף', spring: 'אביב', summer: 'קיץ', autumn: 'סתיו' };

export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? 'לילה טוב' : h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : h < 21 ? 'ערב טוב' : 'לילה טוב';
}

export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export const plural = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);
