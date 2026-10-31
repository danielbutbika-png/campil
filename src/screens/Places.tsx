// Regional discovery: the place database by region and category, near where you sleep, ranked for your trip.
// Map + list, filters, sort, season, weather, and adding several places to a trip at once (with confirmation).
import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, MapPin, Plus, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { loadPlaces, searchPlaces, nearby, richness, CAT_HE, CAT_GROUPS, wikidataUrl, osmUrl, type Place, type PlaceDb } from '../services/placesDb';
import { fitScore, fitContextFor, type Fit } from '../intel/placeFit';
import { useAlertCtx } from '../services/officialAlerts';
import { useStore, nextTrip } from '../lib/store';
import { useForecast, tripPoint } from '../lib/hooks';
import { availability } from '../services/weather';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { IsraelMap } from '../components/IsraelMap';
import { DayStrip } from '../components/Weather';
import { Button, Chip, Sheet, toast } from '../components/ui';
import { href, go } from '../lib/router';
import { seasonOf, SEASON_HE, todayISO, haversineKm } from '../lib/util';
import type { RegionId, TripPlace } from '../lib/types';

type Sort = 'fit' | 'distance' | 'info' | 'name';
const SORT_HE: Record<Sort, string> = { fit: 'התאמה לטיול', distance: 'מרחק', info: 'הכי הרבה מידע', name: 'שם' };

export default function Places({ region }: { region?: RegionId }) {
  const [db, setDb] = useState<PlaceDb | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadPlaces().then(setDb, e => setErr(e.message)); }, []);
  const trips = useStore(s => s.trips);
  const t = nextTrip(trips);
  const base = t ? tripPoint(t) : null;
  const [mode, setMode] = useState<'region' | 'near'>(region ? 'region' : base ? 'near' : 'region');
  const [reg, setReg] = useState<RegionId>(region ?? t?.regionId ?? 'golan');
  const [radius, setRadius] = useState(20);
  const [g, setG] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>(t ? 'fit' : 'info');
  const [q, setQ] = useState(''); const [qRes, setQRes] = useState<Place[] | null>(null);
  const [pick, setPick] = useState<string[]>([]); const [confirm, setConfirm] = useState(false);
  const [n, setN] = useState(30);
  const fc = useForecast(base?.lat ?? REGION_BY_ID[reg].lat, base?.lon ?? REGION_BY_ID[reg].lon);
  const al = useAlertCtx();
  const ctx = useMemo(() => (t ? { ...fitContextFor(t, fc.data?.days ?? [], availability(t.start, t.end), base), ...al } : null), [t, fc.data, base, al]);
  const cats = g ? CAT_GROUPS.find(x => x.id === g)!.cats : undefined;

  const rows = useMemo(() => {
    if (!db) return [];
    const pool = mode === 'near' && base ? nearby(db, base, radius, cats).map(x => x.p) : db.places.filter(p => p.r === reg && (!cats || p.c.some(c => cats.includes(c))));
    const withFit = pool.map(p => ({ p, km: base ? haversineKm(base, p) : undefined, fit: ctx ? fitScore(p, ctx) : null as Fit | null }));
    const by: Record<Sort, (a: typeof withFit[0], b: typeof withFit[0]) => number> = {
      fit: (a, b) => (b.fit?.score ?? -1) - (a.fit?.score ?? -1) || richness(b.p) - richness(a.p),
      distance: (a, b) => (a.km ?? 1e9) - (b.km ?? 1e9), info: (a, b) => richness(b.p) - richness(a.p), name: (a, b) => a.p.he.localeCompare(b.p.he, 'he'),
    };
    return withFit.sort(by[sort]);
  }, [db, mode, base, radius, reg, cats, ctx, sort]);
  useEffect(() => setN(30), [mode, reg, radius, g, sort]);

  if (err) return <p role="alert" className="gutter py-16 text-center text-muted">{err}</p>;
  const season = seasonOf(todayISO());
  const seasonal = REGIONS.filter(r => r.bestSeasons[0] === season).map(r => r.id);
  const shown = rows.slice(0, n);
  return (
    <div className="gutter mx-auto max-w-6xl space-y-5 py-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">מקומות לטייל</h1>
        <p className="text-muted">{db ? `${db.count.toLocaleString('he-IL')} מקומות אמיתיים` : 'טוענים…'} משמורות, גנים לאומיים, מעיינות, חופים, חניונים ותצפיות — כל אחד עם המקור שלו.</p>
      </header>

      <form role="search" className="flex gap-2" onSubmit={e => { e.preventDefault(); if (db) setQRes(searchPlaces(db, q, 20)); }}>
        <input className="field flex-1" value={q} onChange={e => { setQ(e.target.value); if (!e.target.value) setQRes(null); }} placeholder="חיפוש לפי שם: עין גדי, נחל עמוד, חוף דור…" aria-label="חיפוש מקום לפי שם" />
        <Button type="submit" icon={<Search size={17} />}>חיפוש</Button>
      </form>
      {qRes && <section aria-label="תוצאות חיפוש" className="space-y-2">
        <p className="text-sm text-muted">{qRes.length ? `${qRes.length} תוצאות — אם יש כמה מקומות באותו שם, בחרו לפי האזור והסוג:` : 'לא נמצאו מקומות בשם הזה במאגר.'}</p>
        <ul className="grid gap-2 sm:grid-cols-2">{qRes.map(p => <li key={p.id}><a href={href(`/place/${encodeURIComponent(p.id)}`)} className="flex items-center gap-3 rounded-xl2 border border-line bg-surface p-3 hover:border-moss"><MapPin size={18} className="shrink-0 text-moss" /><span className="min-w-0"><span className="block truncate font-bold">{p.he}</span><span className="block truncate text-xs text-muted">{REGION_BY_ID[p.r].name} · {p.c.map(c => CAT_HE[c]).join(', ')}</span></span></a></li>)}</ul>
      </section>}

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="איך לחפש">
          {base && <Chip role="radio" aria-checked={mode === 'near'} active={mode === 'near'} onClick={() => setMode('near')}>ליד {base.label}</Chip>}
          <Chip role="radio" aria-checked={mode === 'region'} active={mode === 'region'} onClick={() => setMode('region')}>לפי אזור</Chip>
        </div>
        {mode === 'region' ? (
          <div className="scroll-x -mx-4 flex gap-2 px-4" role="group" aria-label="אזור">{REGIONS.map(r => <Chip key={r.id} active={reg === r.id} onClick={() => setReg(r.id)}>{r.short}{seasonal.includes(r.id) ? ' ✦' : ''}</Chip>)}</div>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label="רדיוס">{[5, 10, 20, 50].map(x => <Chip key={x} active={radius === x} onClick={() => setRadius(x)}>עד {x} ק״מ</Chip>)}</div>
        )}
        {mode === 'region' && <p className="text-xs text-muted">✦ אזורים שמומלצים במיוחד ב{SEASON_HE[season]}. {REGION_BY_ID[reg].climateNote}</p>}
        <div className="scroll-x -mx-4 flex gap-2 px-4" role="group" aria-label="סוג מקום"><Chip active={!g} onClick={() => setG(null)}>הכול</Chip>{CAT_GROUPS.map(x => <Chip key={x.id} active={g === x.id} onClick={() => setG(x.id)}>{x.label}</Chip>)}</div>
        <label className="flex items-center gap-2 text-sm">מיון:<select className="field !h-10 w-auto" value={sort} onChange={e => setSort(e.target.value as Sort)}>{(Object.keys(SORT_HE) as Sort[]).filter(s => (s !== 'fit' || t) && (s !== 'distance' || base)).map(s => <option key={s} value={s}>{SORT_HE[s]}</option>)}</select></label>
      </div>

      {fc.data && <section aria-label="תחזית" className="space-y-1 rounded-xl2 border border-line bg-surface p-3"><p className="text-sm font-bold">התחזית {mode === 'near' && base ? `ליד ${base.label}` : `ב${REGION_BY_ID[reg].name}`}</p><DayStrip days={fc.data.days.slice(0, 7)} compact /></section>}

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="order-2 space-y-2 lg:order-1">
          {!db ? <p className="flex items-center gap-2 text-muted"><Loader2 size={16} className="animate-spin" />טוענים את המאגר…</p> : <p className="text-sm text-muted">{rows.length} מקומות{base && mode === 'near' ? ' · מרחקים בקו אווירי' : ''}{t ? ` · התאמה ל${t.name || 'הטיול הקרוב'}` : ''}</p>}
          <ul className="space-y-2">{shown.map(({ p, km, fit }) => {
            const on = pick.includes(p.id); const warn = fit?.conditions.find(c => c.level === 'danger') ?? fit?.conditions[0];
            return (
              <li key={p.id} className="flex gap-3 rounded-xl2 border border-line bg-surface p-2.5" data-place={p.id}>
                {p.img ? <img src={p.img.thumb} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl bg-raised object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-raised" aria-hidden><ImageIcon size={20} className="text-muted" /></span>}
                <a href={href(`/place/${encodeURIComponent(p.id)}`)} className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2"><span className="font-bold leading-tight">{p.he}</span>{fit && (fit.score != null ? <span className="num shrink-0 rounded-full bg-raised px-2 text-xs font-bold" title="ציון התאמה לטיול — לא ציון בטיחות">{fit.score}</span> : <span className="shrink-0 rounded-full bg-danger/10 px-2 text-xs font-bold text-danger">לא בתנאים</span>)}</span>
                  <span className="block truncate text-xs text-muted">{CAT_HE[p.c[0]]}{mode === 'near' ? ` · ${REGION_BY_ID[p.r].short}` : ''}{km != null ? ` · ${km < 10 ? km.toFixed(1) : Math.round(km)} ק״מ בקו אווירי` : ''}</span>
                  {fit?.excluded ? <span className="block text-xs font-bold text-danger">{fit.excluded.slice(0, 90)}…</span> : warn ? <span className="flex items-center gap-1 text-xs text-warn"><AlertTriangle size={12} />{warn.text.slice(0, 70)}…</span> : fit ? <span className="line-clamp-2 text-xs">{fit.summary}</span> : null}
                </a>
                {t && <label className="flex shrink-0 cursor-pointer flex-col items-center justify-center gap-1 px-1 text-[11px] text-muted"><input type="checkbox" className="h-5 w-5" checked={on} onChange={() => setPick(x => (on ? x.filter(i => i !== p.id) : [...x, p.id]))} aria-label={`לבחור את ${p.he}`} />בחירה</label>}
              </li>);
          })}</ul>
          {rows.length > n && <Button variant="soft" onClick={() => setN(n + 30)}>עוד {Math.min(30, rows.length - n)}</Button>}
        </div>
        <div className="order-1 h-[42vh] overflow-hidden rounded-xl2 border border-line lg:sticky lg:top-4 lg:order-2 lg:h-[70vh]">
          <IsraelMap selected={mode === 'region' ? reg : null} onSelect={r => { setMode('region'); setReg(r); }} osm={shown.map(({ p }) => ({ id: p.id, name: p.he, lat: p.lat, lon: p.lon, kind: 'camp_site', label: CAT_HE[p.c[0]], url: `#/place/${encodeURIComponent(p.id)}` }) as any)} className="h-full w-full" />
        </div>
      </div>

      {pick.length > 0 && t && <div className="sticky bottom-20 z-30 flex justify-center"><Button icon={<Plus size={17} />} onClick={() => setConfirm(true)}>הוספת {pick.length} מקומות לטיול</Button></div>}
      {confirm && t && db && <Sheet open onClose={() => setConfirm(false)} title={`להוסיף ל${t.name || 'הטיול'}?`} footer={<><Button onClick={() => {
        const add: TripPlace[] = pick.map(id => db.places.find(p => p.id === id)!).filter(p => !(t.places ?? []).some(x => x.id === p.id)).map(p => ({ id: p.id, name: p.he, lat: p.lat, lon: p.lon, label: CAT_HE[p.c[0]], source: p.src.includes('wd') ? 'wd' : 'osm', url: p.qid ? wikidataUrl(p.qid) : osmUrl(p.osm!), website: p.web, addedAt: new Date().toISOString() }));
        useStore.getState().updateTrip(t.id, { places: [...(t.places ?? []), ...add] }); toast(`נוספו ${add.length} מקומות`); setPick([]); setConfirm(false); go(`/trip/${t.id}`);
      }}>אישור והוספה</Button><Button variant="ghost" onClick={() => setConfirm(false)}>ביטול</Button></>}>
        <ul className="list-inside list-disc space-y-1">{pick.map(id => <li key={id}>{db.places.find(p => p.id === id)?.he}</li>)}</ul>
        <p className="mt-2 text-sm text-muted">המקומות יתווספו לרשימת המקומות של הטיול. שום דבר אחר בתוכנית לא משתנה.</p>
      </Sheet>}
      <p className="text-sm"><a className="font-bold text-moss" href={href('/explore')}>חיפוש חי במפה הפתוחה (OpenStreetMap)</a> · <a className="font-bold text-moss" href={href('/camps')}>חיפוש חניוני לינה</a></p>
      <p className="text-xs text-muted">{db?.attribution}. מידע לא מאומת מול המפעילים — שעות, מחירים וסגירות באתרים הרשמיים.</p>
    </div>
  );
}
