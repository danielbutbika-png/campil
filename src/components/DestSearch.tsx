// "Where are you going?" — find a destination by name and add it to the trip's route.
// Our catalog is searched as you type (offline); the web (OpenStreetMap / Nominatim) only when the user presses "search".
import { useState } from 'react';
import { Search, MapPin, X, Globe, Loader2 } from 'lucide-react';
import type { Trip, RegionId, TripPlace } from '../lib/types';
import { SITES, SITE_BY_ID } from '../data/sites';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { searchByName, type WebPlace } from '../services/places';
import { haversineKm } from '../lib/util';
import { Prov } from './Provenance';
import { cx, toast } from './ui';

const nearestRegion = (lat: number, lon: number): RegionId => REGIONS.reduce((a, r) => (haversineKm({ lat, lon }, r) < haversineKm({ lat, lon }, a) ? r : a)).id;
const norm = (s: string) => s.replace(/["״׳'\-–]/g, '').replace(/\s+/g, ' ').trim();

export function DestSearch({ t, onChange }: { t: Trip; onChange: (p: Partial<Trip>) => void }) {
  const [q, setQ] = useState('');
  const [web, setWeb] = useState<WebPlace[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const nq = norm(q);
  const local = nq.length >= 2 ? SITES.filter(s => norm(s.name).includes(nq) || norm(REGION_BY_ID[s.region].name).includes(nq)).slice(0, 6) : [];
  const places = t.places ?? [];

  const addSite = (id: string) => {
    if (t.siteIds.includes(id)) return;
    const s = SITE_BY_ID[id];
    onChange({ siteIds: [...t.siteIds, id], regionId: t.regionId ?? s.region });
    toast(`${s.name} נוסף למסלול`); setQ(''); setWeb(null);
  };
  const addWeb = (p: WebPlace) => {
    if (places.some(x => x.id === p.id)) return;
    const tp: TripPlace = { id: p.id, name: p.name, lat: p.lat, lon: p.lon, label: p.label, source: 'osm', url: p.osmUrl, website: p.tags.website, addedAt: new Date().toISOString() };
    onChange({ places: [...places, tp], regionId: t.regionId ?? nearestRegion(p.lat, p.lon), dest: t.dest ?? { lat: p.lat, lon: p.lon, label: p.name } });
    toast(`${p.name} נוסף למסלול`); setQ(''); setWeb(null);
  };
  const removeSite = (id: string) => onChange({ siteIds: t.siteIds.filter(x => x !== id) });
  const removeWeb = (p: TripPlace) => onChange({ places: places.filter(x => x.id !== p.id), ...(t.dest && t.dest.lat === p.lat && t.dest.lon === p.lon ? { dest: undefined } : {}) });
  const searchWeb = async () => {
    if (nq.length < 2) return toast('כתבו לפחות 2 אותיות');
    setBusy(true); setErr('');
    try { setWeb(await searchByName(q.trim())); } catch (e) { setErr((e as Error).message); setWeb(null); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <form role="search" className="flex gap-2" onSubmit={e => { e.preventDefault(); searchWeb(); }}>
        <label className="sr-only" htmlFor="dest-q">לאן נוסעים?</label>
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted" aria-hidden />
          <input id="dest-q" type="search" className="field ps-10" placeholder="למשל: עין גדי, נחל עמוד, הר תבור" value={q} autoComplete="off"
            onChange={e => { setQ(e.target.value); setWeb(null); setErr(''); }} />
        </div>
        <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest px-4 font-bold text-onforest disabled:opacity-60" disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}חיפוש
        </button>
      </form>

      {local.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface" aria-label="מהקטלוג של CampIL">
          {local.map(s => (
            <li key={s.id}><button type="button" onClick={() => addSite(s.id)} disabled={t.siteIds.includes(s.id)} className="flex w-full items-center gap-2 p-3 text-right hover:bg-raised disabled:opacity-60">
              <MapPin size={16} className="shrink-0 text-moss" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block font-bold">{s.name}</span><span className="block text-xs text-muted">{REGION_BY_ID[s.region].name}</span></span>
              <span className="shrink-0 text-sm font-bold text-moss">{t.siteIds.includes(s.id) ? 'במסלול' : '+ הוספה'}</span>
            </button></li>))}
        </ul>)}
      {nq.length >= 2 && !web && !busy && !err && <p className="text-xs text-muted">{local.length ? 'לא מצאתם? ' : 'לא נמצא בקטלוג. '}לחצו "חיפוש" כדי לחפש ב-OpenStreetMap.</p>}
      {err && <p className="text-sm font-semibold text-danger" role="alert">{err}</p>}
      {web && (
        <div className="space-y-1.5">
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted"><Prov kind="community" source="OpenStreetMap" />{web.length ? 'תוצאות מהרשת' : 'לא נמצאו תוצאות ברשת'}</p>
          {web.length > 0 && <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface" aria-label="תוצאות מהרשת">
            {web.slice(0, 8).map(p => (
              <li key={p.id}><button type="button" onClick={() => addWeb(p)} className="flex w-full items-center gap-2 p-3 text-right hover:bg-raised">
                <Globe size={16} className="shrink-0 text-muted" aria-hidden />
                <span className="min-w-0 flex-1"><span className="block font-bold">{p.name}</span><span className="block text-xs text-muted">{p.label}</span></span>
                <span className="shrink-0 text-sm font-bold text-moss">+ הוספה</span>
              </button></li>))}
          </ul>}
        </div>)}

      {(t.siteIds.length > 0 || places.length > 0) && (
        <div className="space-y-1.5">
          <p className="text-sm font-bold">במסלול ({t.siteIds.length + places.length})</p>
          <ul className="flex flex-wrap gap-2" aria-label="יעדים במסלול">
            {t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean).map(s => (
              <li key={s.id} className="inline-flex items-center gap-1 rounded-full bg-forest/10 py-1 pe-1 ps-3 text-sm font-bold text-forest">{s.name}
                <button type="button" aria-label={`הסרת ${s.name}`} onClick={() => removeSite(s.id)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-forest/15"><X size={14} /></button></li>))}
            {places.map(p => (
              <li key={p.id} className={cx('inline-flex items-center gap-1 rounded-full bg-raised py-1 pe-1 ps-3 text-sm font-bold')}>{p.name}
                <button type="button" aria-label={`הסרת ${p.name}`} onClick={() => removeWeb(p)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-sand"><X size={14} /></button></li>))}
          </ul>
          {places.length > 0 && <p className="text-xs text-muted">מקומות מהרשת מגיעים מ-OpenStreetMap ולא נבדקו — שעות, מחירים וגישה לבדוק באתר המפעיל.</p>}
        </div>)}
    </div>
  );
}
