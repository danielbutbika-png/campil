// The trip's main location (where you sleep / the destination): weather, distances, the day plan and navigation
// all start from it. Pick from the place database as you type, or search the web (OpenStreetMap) on submit.
import { useEffect, useState } from 'react';
import { MapPin, Search, Globe, Loader2, X, Crosshair } from 'lucide-react';
import type { Trip, RegionId } from '../lib/types';
import { loadPlaces, searchPlaces, CAT_HE, type PlaceDb } from '../services/placesDb';
import { searchByName, type WebPlace } from '../services/places';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { haversineKm } from '../lib/util';
import { tripPoint } from '../lib/hooks';
import { toast } from './ui';

const nearestRegion = (lat: number, lon: number): RegionId => REGIONS.reduce((a, r) => (haversineKm({ lat, lon }, r) < haversineKm({ lat, lon }, a) ? r : a)).id;

export function LocationPicker({ t, onChange }: { t: Trip; onChange: (p: Partial<Trip>) => void }) {
  const [db, setDb] = useState<PlaceDb | null>(null);
  useEffect(() => { loadPlaces().then(setDb, () => setDb(null)); }, []);
  const [q, setQ] = useState(''); const [web, setWeb] = useState<WebPlace[] | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const cur = tripPoint(t);
  const local = db && q.trim().length >= 2 ? searchPlaces(db, q, 8) : [];
  const pick = (lat: number, lon: number, label: string, region?: RegionId) => {
    const r = region ?? nearestRegion(lat, lon);
    onChange({ dest: { lat, lon, label }, regionId: r });
    toast(`מיקום הטיול: ${label}${r !== t.regionId ? ` · האזור עודכן ל${REGION_BY_ID[r].name}` : ''}`);
    setQ(''); setWeb(null);
  };
  const searchWeb = async () => {
    if (q.trim().length < 2) return toast('כתבו לפחות 2 אותיות');
    setBusy(true); setErr('');
    try { setWeb(await searchByName(q.trim())); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const here = () => navigator.geolocation?.getCurrentPosition(p => pick(p.coords.latitude, p.coords.longitude, 'המיקום שלי'), () => toast('אין הרשאה למיקום'), { timeout: 10000 });
  return (
    <div className="space-y-2" aria-label="מיקום הטיול" role="group">
      <div className="flex flex-wrap items-center gap-2 rounded-xl2 border border-line bg-raised/40 p-3">
        <MapPin size={18} className="shrink-0 text-moss" />
        <span className="min-w-0 flex-1"><span className="block text-xs text-muted">מיקום נוכחי</span><span className="block font-bold">{cur ? cur.label : 'לא נקבע'}</span>
          {!t.dest && cur && <span className="block text-xs text-muted">{t.siteIds.length ? 'לפי אתר הלינה בתוכנית' : 'מרכז האזור — כדאי לבחור מקום מדויק'}</span>}</span>
        {t.dest && <button type="button" className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold text-muted hover:text-ink" onClick={() => onChange({ dest: undefined })} aria-label="ניקוי המיקום"><X size={15} />ניקוי</button>}
      </div>
      <form role="search" className="flex gap-2" onSubmit={e => { e.preventDefault(); searchWeb(); }}>
        <div className="relative flex-1"><Search size={17} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted" aria-hidden />
          <input type="search" className="field ps-10" value={q} placeholder="חניון, יישוב או אתר — למשל: חניון לילה הר גחר" aria-label="חיפוש מיקום חדש לטיול" onChange={e => { setQ(e.target.value); setWeb(null); setErr(''); }} /></div>
        <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest px-4 font-bold text-onforest disabled:opacity-60" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}חיפוש</button>
      </form>
      <button type="button" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-moss" onClick={here}><Crosshair size={15} />המיקום הנוכחי שלי</button>
      {local.length > 0 && <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface" aria-label="מיקומים מהמאגר">{local.map(p => (
        <li key={p.id}><button type="button" onClick={() => pick(p.lat, p.lon, p.he, p.r)} className="flex w-full items-center gap-2 p-3 text-right hover:bg-raised">
          <MapPin size={16} className="shrink-0 text-muted" aria-hidden /><span className="min-w-0 flex-1"><span className="block font-bold">{p.he}</span><span className="block text-xs text-muted">{REGION_BY_ID[p.r].name} · {CAT_HE[p.c[0]]}</span></span>
          <span className="shrink-0 text-sm font-bold text-moss">בחירה</span></button></li>))}</ul>}
      {err && <p className="text-sm font-semibold text-danger" role="alert">{err}</p>}
      {web && (web.length ? <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface" aria-label="מיקומים מהרשת">{web.slice(0, 8).map(p => (
        <li key={p.id}><button type="button" onClick={() => pick(p.lat, p.lon, p.name)} className="flex w-full items-center gap-2 p-3 text-right hover:bg-raised">
          <Globe size={16} className="shrink-0 text-muted" aria-hidden /><span className="min-w-0 flex-1"><span className="block font-bold">{p.name}</span><span className="block text-xs text-muted">{p.label} · OpenStreetMap</span></span>
          <span className="shrink-0 text-sm font-bold text-moss">בחירה</span></button></li>))}</ul> : <p className="text-sm text-muted">לא נמצאו תוצאות ברשת.</p>)}
      <p className="text-xs text-muted">התחזית, המרחקים, ההצעות לכל יום והניווט מחושבים מהמיקום הזה. שינוי שלו לא מוחק דבר מהתוכנית.</p>
    </div>
  );
}
