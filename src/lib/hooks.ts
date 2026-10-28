import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchForecast, fetchClimate, cacheForecast, cachedForecast, availability, type Forecast, type DayWx } from '../services/weather';
import { flagsFor, type WxFlags } from '../engine/weatherRules';
import type { Trip } from './types';
import { REGION_BY_ID } from '../data/regions';
import { SITE_BY_ID } from '../data/sites';

export function useOnline() {
  const [on, set] = useState(navigator.onLine);
  useEffect(() => { const a = () => set(true), b = () => set(false); addEventListener('online', a); addEventListener('offline', b); return () => { removeEventListener('online', a); removeEventListener('offline', b); }; }, []);
  return on;
}

export function useForecast(lat?: number, lon?: number) {
  return useQuery<Forecast & { stale?: boolean }>({
    queryKey: ['fc', lat?.toFixed(2), lon?.toFixed(2)], enabled: lat != null && lon != null, staleTime: 30 * 60e3, retry: 1,
    queryFn: async () => {
      try { const f = await fetchForecast(lat!, lon!); cacheForecast(f); return f; }
      catch (e) { const c = cachedForecast(lat!, lon!); if (c) return { ...c, stale: true }; throw e; }
    },
  });
}

export function useClimate(lat?: number, lon?: number, start?: string, end?: string, enabled = true) {
  return useQuery({ queryKey: ['cl', lat?.toFixed(2), lon?.toFixed(2), start, end], enabled: enabled && lat != null && !!start, staleTime: 24 * 3600e3, retry: 1,
    queryFn: () => fetchClimate(lat!, lon!, start!, end!) });
}

export function tripPoint(t: Pick<Trip, 'dest' | 'siteIds' | 'regionId'>) {
  if (t.dest) return t.dest;
  const s = t.siteIds.map(id => SITE_BY_ID[id]).find(x => x?.lodging) ?? SITE_BY_ID[t.siteIds[0]];
  if (s) return { lat: s.lat, lon: s.lon, label: s.name };
  if (t.regionId) { const r = REGION_BY_ID[t.regionId]; return { lat: r.lat, lon: r.lon, label: r.name }; }
  return null;
}

export type TripWx = { status: 'loading' | 'error' | 'ready' | 'none'; avail: ReturnType<typeof availability>; days: DayWx[]; flags: WxFlags; source: 'forecast' | 'climate' | 'season'; forecast?: Forecast & { stale?: boolean }; climate?: Awaited<ReturnType<typeof fetchClimate>>; point: ReturnType<typeof tripPoint>; error?: string; refetch: () => void };

export function useTripWeather(t: Trip): TripWx {
  const point = tripPoint(t);
  const avail = availability(t.start, t.end);
  const fc = useForecast(point?.lat, point?.lon);
  const cl = useClimate(point?.lat, point?.lon, t.start, t.end, avail === 'too_far');
  return useMemo(() => {
    const base = { avail, point, refetch: () => { fc.refetch(); cl.refetch(); } };
    if (!point) return { ...base, status: 'none', days: [], flags: flagsFor([]), source: 'season' } as TripWx;
    if (avail === 'too_far') {
      if (cl.data) {
        const days: DayWx[] = cl.data.days.map(d => ({ date: d.date, tMax: d.tMax, tMin: d.tMin, precip: d.precip, wind: 0, gusts: d.gusts, code: 0 }));
        return { ...base, status: 'ready', days: [], flags: flagsFor(days), source: 'climate', climate: cl.data } as TripWx;
      }
      return { ...base, status: cl.isError ? 'error' : 'loading', days: [], flags: flagsFor([]), source: 'season', error: (cl.error as Error)?.message } as TripWx;
    }
    if (fc.data) {
      const days = fc.data.days.filter(d => d.date >= t.start && d.date <= t.end);
      return { ...base, status: 'ready', days, flags: flagsFor(days), source: days.length ? 'forecast' : 'season', forecast: fc.data } as TripWx;
    }
    return { ...base, status: fc.isError ? 'error' : 'loading', days: [], flags: flagsFor([]), source: 'season', error: (fc.error as Error)?.message } as TripWx;
  }, [fc.data, fc.isError, cl.data, cl.isError, t.start, t.end, point?.lat, point?.lon]);
}

export function useGeolocation() {
  const [state, set] = useState<{ loading: boolean; error?: string; pos?: { lat: number; lon: number } }>({ loading: false });
  const request = () => new Promise<{ lat: number; lon: number } | null>(res => {
    if (!navigator.geolocation) { set({ loading: false, error: 'הדפדפן לא תומך באיתור מיקום' }); return res(null); }
    set({ loading: true });
    navigator.geolocation.getCurrentPosition(p => { const pos = { lat: p.coords.latitude, lon: p.coords.longitude }; set({ loading: false, pos }); res(pos); },
      e => { set({ loading: false, error: e.code === 1 ? 'לא ניתנה הרשאת מיקום' : 'לא הצלחנו לאתר מיקום' }); res(null); }, { timeout: 10000, maximumAge: 600000 });
  });
  return { ...state, request };
}
