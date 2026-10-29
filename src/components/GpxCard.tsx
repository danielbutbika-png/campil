// Route from a GPX file (hiking apps, trail sites): import, show on the map with distance and climb, export the trip.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Route as RouteI, Upload, Download, Trash2, Car, Footprints, Loader2, RefreshCw, Search } from 'lucide-react';
import { driveRoute, trailsNear, climbOf, trailToTrack, colourHe, type Trail } from '../services/routing';
import type { Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { parseGpx, toGpx } from '../engine/gpx';
import { SITE_BY_ID } from '../data/sites';
import { download } from '../lib/share';
import { Prov } from './Provenance';
import { Button, toast } from './ui';
import { href } from '../lib/router';

const IsraelMap = lazy(() => import('./IsraelMap').then(m => ({ default: m.IsraelMap })));

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} שע׳${m % 60 ? ` ו-${m % 60} דק׳` : ''}` : `${m} דק׳`);
const bboxOf = (coords: [number, number][]) => coords.length ? [Math.min(...coords.map(c => c[0])), Math.min(...coords.map(c => c[1])), Math.max(...coords.map(c => c[0])), Math.max(...coords.map(c => c[1]))] as [number, number, number, number] : null;
const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;

/** The trip's stops in plan order: catalog sites, then places added from the search. */
export function tripStops(t: Trip) {
  return [...t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean).map(s => ({ name: s.name, lat: s.lat, lon: s.lon })), ...(t.places ?? []).map(p => ({ name: p.name, lat: p.lat, lon: p.lon }))];
}

/** Driving route home → stops → home. Computed automatically once per set of stops, kept for use without signal. */
function DriveSection({ t }: { t: Trip }) {
  const { updateTrip, settings } = useStore();
  const home = settings.home;
  const stops = tripStops(t);
  const pts = [...(home ? [{ ...home, name: 'הבית' }] : []), ...stops, ...(home ? [{ ...home, name: 'הבית' }] : [])];
  const sig = JSON.stringify(pts.map(p => [p.lat.toFixed(4), p.lon.toFixed(4)]));
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const tried = useRef('');
  const d = t.drive && t.drive.sig === sig ? t.drive : null;
  const run = async () => {
    setBusy(true); setErr('');
    try { const r = await driveRoute(pts); updateTrip(t.id, { drive: { ...r, sig } }); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  useEffect(() => { if (pts.length >= 2 && !d && tried.current !== sig && online()) { tried.current = sig; run(); } }, [sig]);
  if (pts.length < 2) return <p className="text-sm text-muted">{stops.length ? 'הגדירו נקודת יציאה (עוד ← הגדרות) כדי לחשב את מסלול הנסיעה מהבית.' : 'הוסיפו יעדים לטיול — מסלול הנסיעה יחושב אוטומטית.'}</p>;
  const bbox = d ? bboxOf(d.coords) : null;
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 font-bold"><Car size={17} className="text-moss" />מסלול נסיעה</h3>
      {d ? <>
        <p className="num"><b>{d.km} ק״מ</b> · כ-{fmtMin(d.minutes)} נהיגה{home ? ' (הלוך וחזור)' : ''}</p>
        <Prov kind="estimate" source="OSRM, כבישים מ-OpenStreetMap — בלי עומסי תנועה" />
        <ol className="space-y-1 text-sm" aria-label="קטעי הנסיעה">{d.legs.map((l, i) => <li key={i} className="num flex justify-between gap-2"><span>{l.from} ← {l.to}</span><span className="shrink-0 text-muted">{l.km} ק״מ · {fmtMin(l.minutes)}</span></li>)}</ol>
        {bbox && <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-raised" />}><IsraelMap route={d.coords} fitTo={bbox} className="h-56 overflow-hidden rounded-xl border border-line" interactive={false} /></Suspense>}
        {!home && <p className="text-xs text-muted">המסלול מתחיל ביעד הראשון. להוספת הנסיעה מהבית — הגדירו נקודת יציאה בהגדרות.</p>}
      </> : busy ? <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={15} className="animate-spin" />מחשבים מסלול נסיעה…</p>
        : <p className="text-sm text-muted">{err || (t.drive ? 'היעדים השתנו — צריך לחשב מחדש.' : 'עוד לא חושב (צריך חיבור לאינטרנט).')}</p>}
      <Button size="sm" variant="ghost" icon={<RefreshCw size={15} />} onClick={run} disabled={busy}>{d ? 'חישוב מחדש' : 'חישוב מסלול נסיעה'}</Button>
    </div>
  );
}

/** Marked walking trails near each stop (OpenStreetMap). Looked up automatically while the trip has no track. */
function TrailSection({ t }: { t: Trip }) {
  const updateTrip = useStore(s => s.updateTrip);
  const stops = tripStops(t).slice(0, 4);
  const sig = JSON.stringify(stops.map(s => [s.lat.toFixed(3), s.lon.toFixed(3)]));
  const [res, setRes] = useState<{ stop: string; trails: Trail[]; err?: string }[] | null>(null);
  const [busy, setBusy] = useState(false); const [picking, setPicking] = useState('');
  const run = async () => {
    setBusy(true); const out: { stop: string; trails: Trail[]; err?: string }[] = [];
    for (const s of stops) { try { out.push({ stop: s.name, trails: (await trailsNear(s)).slice(0, 3) }); } catch (e) { out.push({ stop: s.name, trails: [], err: (e as Error).message }); } }
    setRes(out); setBusy(false);
  };
  useEffect(() => { setRes(null); if (stops.length && !t.gpx && online()) run(); }, [sig]);
  const pick = async (tr: Trail) => {
    setPicking(tr.id);
    const climb = await climbOf(tr.points);
    updateTrip(t.id, { gpx: trailToTrack(tr, climb) }); setPicking('');
    toast(`המסלול נבחר: ${tr.name} · ${tr.km} ק״מ`);
  };
  if (!stops.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 font-bold"><Footprints size={17} className="text-moss" />שבילים מסומנים ליד היעדים</h3>
      {busy && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={15} className="animate-spin" />מחפשים שבילים ב-OpenStreetMap…</p>}
      {res && <div className="space-y-3">{res.map(r => (
        <div key={r.stop} className="space-y-1">
          <p className="text-sm font-semibold">ליד {r.stop}</p>
          {r.err ? <p className="text-sm text-danger">{r.err}</p> : !r.trails.length ? <p className="text-sm text-muted">לא נמצא שביל מסומן ממופה בטווח 2 ק״מ.</p> :
            <ul className="divide-y divide-line rounded-xl border border-line" aria-label={`שבילים ליד ${r.stop}`}>{r.trails.map(tr => (
              <li key={tr.id} className="flex flex-wrap items-center gap-2 p-2.5">
                <span className="min-w-0 flex-1"><span className="block font-semibold">{tr.name}</span>
                  <span className="num block text-xs text-muted">{[colourHe(tr.colour) && `סימון ${colourHe(tr.colour)}`, `${tr.km} ק״מ`, tr.fromKm > 0.1 ? `${tr.fromKm} ק״מ מהיעד` : 'עובר ביעד'].filter(Boolean).join(' · ')}</span></span>
                <a href={tr.osmUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-muted underline">במפה</a>
                <Button size="sm" variant="soft" onClick={() => pick(tr)} disabled={!!picking}>{picking === tr.id ? <Loader2 size={14} className="animate-spin" /> : null}{t.gpx?.source.endsWith(tr.osmUrl) ? 'נבחר' : 'בחירה'}</Button>
              </li>))}</ul>}
        </div>))}
        <Prov kind="community" source="OpenStreetMap — לא אומת" />
        <p className="text-xs text-muted">שבילים כפי שמופו בקהילה: האורך הוא של כל השביל הממופה, וייתכן שתלכו רק חלק ממנו. סימון בשטח, פתיחה, מים וצל — לבדוק אצל רט״ג / המפעיל לפני היציאה.</p>
      </div>}
      {!busy && <Button size="sm" variant="ghost" icon={<Search size={15} />} onClick={run}>{res ? 'חיפוש מחדש' : 'חיפוש שבילים'}</Button>}
    </div>
  );
}

export function GpxCard({ t }: { t: Trip }) {
  const updateTrip = useStore(s => s.updateTrip);
  const file = useRef<HTMLInputElement>(null);
  const g = t.gpx;
  const load = async (f?: File) => {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) return toast('הקובץ גדול מדי (מעל 15MB)');
    try { const track = parseGpx(await f.text(), f.name); updateTrip(t.id, { gpx: track }); toast(`נטען: ${track.name} · ${track.km} ק״מ`); }
    catch (e: any) { toast(e.message); }
    if (file.current) file.current.value = '';
  };
  const places = tripStops(t);
  const exportGpx = () => { download(`CampIL-${t.start}.gpx`, toGpx(t.name, places, g, t.drive ? { name: `נסיעה — ${t.name}`, coords: t.drive.coords } : null), 'application/gpx+xml'); toast('קובץ GPX נשמר — אפשר לפתוח באפליקציית ניווט'); };
  const coords = g?.points.map(p => [p.lon, p.lat] as [number, number]) ?? [];
  const bbox = bboxOf(coords);
  const fromOsm = g?.source.startsWith('OpenStreetMap');
  return (
    <section aria-labelledby="gpx-h" className="space-y-4 rounded-xl2 border border-line bg-surface p-4">
      <h2 id="gpx-h" className="flex items-center gap-2 font-bold"><RouteI size={18} className="text-moss" />מסלול</h2>
      <DriveSection t={t} />
      <div className="space-y-2 border-t border-line pt-4">
        <h3 className="flex items-center gap-2 font-bold"><Footprints size={17} className="text-moss" />מסלול הליכה</h3>
        {g ? <>
          <p className="num"><b>{g.name}</b> · {g.km} ק״מ{g.gain != null ? ` · עלייה מצטברת ${g.gain} מ׳ · ירידה ${g.loss} מ׳` : ''}{g.waypoints.length ? ` · ${g.waypoints.length} נקודות` : ''}</p>
          {fromOsm ? <div className="flex flex-wrap gap-2"><Prov kind="community" source="השביל מ-OpenStreetMap — לא אומת" />{g.gain != null && <Prov kind="estimate" source="עלייה וירידה ממודל גובה (Open-Meteo, ~90 מ׳)" />}</div>
            : <Prov kind="auto" source={`מחושב מהקובץ ${g.source}${g.gain == null ? ' (בקובץ אין נתוני גובה)' : ''}`} />}
          {bbox && <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-raised" />}><IsraelMap route={coords} fitTo={bbox} className="h-64 overflow-hidden rounded-xl border border-line" interactive={false} /></Suspense>}
          <p className="text-xs text-muted">המסלול לא נבדק מול השטח — ודאו שהוא מסומן, פתוח ומתאים לכם. ניווט באפליקציה אינו תחליף לבדיקת המסלול.</p>
        </> : <p className="text-sm text-muted">בחרו שביל מההצעות למטה, או טענו קובץ GPX (מאפליקציית ניווט או מאתר מסלולים).</p>}
        <div className="flex flex-wrap gap-2">
          <input ref={file} type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" className="sr-only" aria-label="קובץ GPX" onChange={e => load(e.target.files?.[0])} />
          <Button size="sm" variant="soft" icon={<Upload size={15} />} onClick={() => file.current?.click()}>{g ? 'החלפה בקובץ GPX' : 'טעינת קובץ GPX'}</Button>
          {(g || places.length > 0) && <Button size="sm" variant="soft" icon={<Download size={15} />} onClick={exportGpx}>יצוא GPX</Button>}
          {g && <Button size="sm" variant="ghost" icon={<Trash2 size={15} />} onClick={() => updateTrip(t.id, { gpx: null })}>הסרה</Button>}
        </div>
      </div>
      <div className="border-t border-line pt-4"><TrailSection t={t} /></div>
    </section>
  );
}

/** Places added to the trip from the web search — community data, with remove and navigation. */
export function TripPlaces({ t }: { t: Trip }) {
  const updateTrip = useStore(s => s.updateTrip);
  if (!t.places?.length) return null;
  return (
    <section aria-labelledby="tp-places-h" className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
      <h2 id="tp-places-h" className="font-bold">מקומות שהוספתם מהחיפוש</h2>
      <ul className="divide-y divide-line">{t.places.map(p => (
        <li key={p.id} className="flex flex-wrap items-center gap-2 py-2">
          <span className="min-w-0 flex-1"><span className="block font-semibold">{p.name}</span><span className="block text-xs text-muted">{p.label}</span></span>
          <Prov kind="community" source="OSM — לא אומת" url={p.url} />
          <a href={`https://waze.com/ul?ll=${p.lat},${p.lon}&navigate=yes`} target="_blank" rel="noreferrer" className="rounded-full bg-raised px-3 py-1 text-xs font-bold">Waze</a>
          <button type="button" aria-label={`הסרת ${p.name}`} className="text-muted hover:text-danger" onClick={() => updateTrip(t.id, x => ({ places: (x.places ?? []).filter(y => y.id !== p.id) }))}><Trash2 size={16} /></button>
        </li>))}</ul>
      <p className="text-xs text-muted">לפני היציאה: לבדוק אצל המפעיל שעות, הזמנה וסגירות. <a className="font-bold text-moss" href={href('/explore')}>חיפוש מקומות נוספים</a></p>
    </section>
  );
}
