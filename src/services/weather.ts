// Open-Meteo client (https://open-meteo.com — free, no API key, CORS enabled).
// Forecast horizon is 16 days. Beyond it we never fabricate a forecast: we offer clearly-labelled
// historical observations for the same calendar dates in previous years (ERA5 archive API).
import { addDays, diffDays, todayISO } from '../lib/util';

export interface DayWx {
  date: string; tMax: number; tMin: number; feelsMax?: number; precip: number; precipProb?: number;
  wind: number; gusts: number; uv?: number; code: number; sunrise?: string; sunset?: string; humidity?: number;
}
export interface HourWx { time: string; t: number; rh: number; pp: number; wind: number; gust: number; code: number }
export interface Forecast { kind: 'forecast'; fetchedAt: string; lat: number; lon: number; days: DayWx[]; hours: HourWx[]; current?: { t: number; rh: number; code: number; wind: number } }
export interface Climate { kind: 'climate'; fetchedAt: string; years: number[]; days: { date: string; tMax: number; tMin: number; precip: number; gusts: number; rainYears: number }[] }

export const FORECAST_HORIZON = 15; // last date index available in a 16-day forecast

const F = 'https://api.open-meteo.com/v1/forecast';
const A = 'https://archive-api.open-meteo.com/v1/archive';

async function getJSON(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`שירות מזג האוויר החזיר שגיאה (${r.status})`);
  return r.json();
}

export async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
  const q = new URLSearchParams({
    latitude: lat.toFixed(3), longitude: lon.toFixed(3), timezone: 'Asia/Jerusalem', forecast_days: '16', wind_speed_unit: 'kmh',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset,relative_humidity_2m_mean',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,wind_gusts_10m,weather_code',
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
  });
  const j = await getJSON(`${F}?${q}`);
  const d = j.daily;
  const days: DayWx[] = d.time.map((date: string, i: number) => ({
    date, tMax: d.temperature_2m_max[i], tMin: d.temperature_2m_min[i], feelsMax: d.apparent_temperature_max?.[i],
    precip: d.precipitation_sum[i] ?? 0, precipProb: d.precipitation_probability_max?.[i] ?? undefined,
    wind: d.wind_speed_10m_max[i], gusts: d.wind_gusts_10m_max[i], uv: d.uv_index_max?.[i] ?? undefined, code: d.weather_code[i],
    sunrise: d.sunrise?.[i]?.slice(11), sunset: d.sunset?.[i]?.slice(11), humidity: d.relative_humidity_2m_mean?.[i] ?? undefined,
  }));
  const h = j.hourly;
  const hours: HourWx[] = h.time.map((time: string, i: number) => ({ time, t: h.temperature_2m[i], rh: h.relative_humidity_2m[i], pp: h.precipitation_probability[i] ?? 0, wind: h.wind_speed_10m[i], gust: h.wind_gusts_10m[i], code: h.weather_code[i] }));
  const c = j.current;
  return { kind: 'forecast', fetchedAt: new Date().toISOString(), lat, lon, days, hours, current: c ? { t: c.temperature_2m, rh: c.relative_humidity_2m, code: c.weather_code, wind: c.wind_speed_10m } : undefined };
}

/** Same calendar dates over the last `n` complete years, averaged. Labelled as history, never as forecast. */
export async function fetchClimate(lat: number, lon: number, start: string, end: string, n = 5): Promise<Climate> {
  const thisYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = thisYear - 1; years.length < n; y--) years.push(y);
  const len = diffDays(start, end);
  const runs = await Promise.all(years.map(y => {
    const s = `${y}${start.slice(4)}`, e = addDays(s, len);
    const q = new URLSearchParams({ latitude: lat.toFixed(3), longitude: lon.toFixed(3), start_date: s, end_date: e, timezone: 'Asia/Jerusalem', daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max' });
    return getJSON(`${A}?${q}`).then(j => j.daily).catch(() => null);
  }));
  const ok = runs.filter(Boolean);
  if (!ok.length) throw new Error('נתוני העבר אינם זמינים כרגע');
  const days = Array.from({ length: len + 1 }, (_, i) => {
    const avg = (k: string) => { const v = ok.map((r: any) => r[k][i]).filter((x: any) => x != null); return v.length ? v.reduce((a: number, b: number) => a + b, 0) / v.length : NaN; };
    return { date: addDays(start, i), tMax: avg('temperature_2m_max'), tMin: avg('temperature_2m_min'), precip: avg('precipitation_sum'), gusts: avg('wind_gusts_10m_max'), rainYears: ok.filter((r: any) => (r.precipitation_sum[i] ?? 0) >= 1).length };
  });
  return { kind: 'climate', fetchedAt: new Date().toISOString(), years: years.slice(0, ok.length), days };
}

export type WxAvailability = 'forecast' | 'partial' | 'too_far' | 'past';
export function availability(start: string, end: string, today = todayISO()): WxAvailability {
  if (end < today) return 'past';
  const last = addDays(today, FORECAST_HORIZON);
  if (start > last) return 'too_far';
  if (end > last) return 'partial';
  return 'forecast';
}

// Offline fallback: keep the last good response per point.
const KEY = (lat: number, lon: number) => `campil-wx-${lat.toFixed(2)},${lon.toFixed(2)}`;
export function cacheForecast(f: Forecast) { try { localStorage.setItem(KEY(f.lat, f.lon), JSON.stringify(f)); } catch { /* quota */ } }
export function cachedForecast(lat: number, lon: number): Forecast | null { try { const s = localStorage.getItem(KEY(lat, lon)); return s ? JSON.parse(s) : null; } catch { return null; } }

export const WMO: Record<number, [string, string]> = {
  0: ['בהיר', 'sun'], 1: ['בהיר ברובו', 'sun'], 2: ['מעונן חלקית', 'cloud-sun'], 3: ['מעונן', 'cloud'],
  45: ['ערפל', 'fog'], 48: ['ערפל קופא', 'fog'], 51: ['טפטוף קל', 'drizzle'], 53: ['טפטוף', 'drizzle'], 55: ['טפטוף חזק', 'drizzle'],
  61: ['גשם קל', 'rain'], 63: ['גשם', 'rain'], 65: ['גשם חזק', 'rain'], 66: ['גשם קופא', 'rain'], 67: ['גשם קופא', 'rain'],
  71: ['שלג קל', 'snow'], 73: ['שלג', 'snow'], 75: ['שלג כבד', 'snow'], 77: ['פתיתי שלג', 'snow'],
  80: ['ממטרים', 'rain'], 81: ['ממטרים', 'rain'], 82: ['ממטרים עזים', 'rain'], 85: ['ממטרי שלג', 'snow'], 86: ['ממטרי שלג', 'snow'],
  95: ['סופת רעמים', 'storm'], 96: ['סופת רעמים וברד', 'storm'], 99: ['סופת רעמים וברד', 'storm'],
};
export const wmoText = (c: number) => WMO[c]?.[0] ?? 'לא ידוע';
export const wmoIcon = (c: number) => WMO[c]?.[1] ?? 'cloud';
