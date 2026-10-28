// Explore: search places for a trip from open web sources (OpenStreetMap + Hebrew Wikipedia), see them on the map,
// read what's known, and add them to a trip. Everything is labelled with its source and "not verified".
import { lazy, Suspense, useMemo, useState } from 'react';
import { Search, MapPin, LocateFixed, Plus, ExternalLink, BookOpen, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { useGeolocation, tripPoint } from '../lib/hooks';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { searchByName, searchNearby, wikiSummary, CATEGORY_HE, type Category, type WebPlace, type WikiSummary } from '../services/places';
import { navApps } from '../services/fuel';
import { distKm } from '../engine/gpx';
import { todayISO } from '../lib/util';
import { Prov } from '../components/Provenance';
import { Button, Chip, Segmented, cx, toast } from '../components/ui';
import type { RegionId } from '../lib/types';

const IsraelMap = lazy(() => import('../components/IsraelMap').then(m => ({ default: m.IsraelMap })));

function Wiki({ p }: { p: WebPlace }) {
  const [s, setS] = useState<{ loading?: boolean; data?: WikiSummary | null; err?: boolean }>({});
  if (!s.loading && s.data === undefined && !s.err) return <button type="button" className="inline-flex items-center gap-1 text-sm font-bold text-moss" onClick={() => { setS({ loading: true }); wikiSummary(p).then(d => setS({ data: d }), () => setS({ err: true })); }}><BookOpen size={14} />מה כתוב בוויקיפדיה?</button>;
  if (s.loading) return <p className="text-sm text-muted">טוען…</p>;
  if (s.err) return <p className="text-sm text-muted">ויקיפדיה לא זמינה כרגע.</p>;
  if (!s.data) return <p className="text-sm text-muted">לא נמצא ערך בוויקיפדיה העברית למקום הזה.</p>;
  return (
    <div className="space-y-1 rounded-xl bg-raised/60 p-3 text-sm">
      <p className="line-clamp-5">{s.data.extract}</p>
      <a href={s.data.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-moss">מתוך הערך "{s.data.title}" בוויקיפדיה (CC BY-SA)<ExternalLink size={12} /></a>
    </div>
  );
}

function AddToTrip({ p }: { p: WebPlace }) {
  const trips = useStore(s => s.trips); const updateTrip = useStore(s => s.updateTrip);
  const upcoming = trips.filter(t => t.status === 'planning' && t.end >= todayISO());
  const added = upcoming.filter(t => t.places?.some(x => x.id === p.id));
  if (!upcoming.length) return null;
  const add = (tid: string) => {
    updateTrip(tid, t => ({ places: [...(t.places ?? []).filter(x => x.id !== p.id), { id: p.id, name: p.name, lat: p.lat, lon: p.lon, label: p.label, source: 'osm', url: p.osmUrl, website: p.tags.website, addedAt: new Date().toISOString() }] }));
    toast(`${p.name} נוסף לטיול`);
  };
  return upcoming.length === 1
    ? <Button size="sm" variant={added.length ? 'soft' : 'primary'} icon={added.length ? <Check size={15} /> : <Plus size={15} />} disabled={!!added.length} onClick={() => add(upcoming[0].id)}>{added.length ? 'בטיול' : `הוספה ל"${upcoming[0].name}"`}</Button>
    : <select aria-label={`הוספת ${p.name} לטיול`} className="field w-auto py-1.5 text-sm" value="" onChange={e => e.target.value && add(e.target.value)}><option value="">הוספה לטיול…</option>{upcoming.map(t => <option key={t.id} value={t.id}>{t.name}{added.includes(t) ? ' ✓' : ''}</option>)}</select>;
}

export default function Explore() {
  const { trips, settings } = useStore();
  const geo = useGeolocation();
  const [mode, setMode] = useState<'name' | 'near'>('near');
  const [q, setQ] = useState('');
  const [where, setWhere] = useState<string>(() => { const t = trips.find(x => x.status === 'planning' && x.end >= todayISO() && !x.example); return t ? `trip:${t.id}` : settings.home ? 'home' : 'region:center'; });
  const [km, setKm] = useState(10);
  const [cats, setCats] = useState<Category[]>(['viewpoint', 'water', 'nature']);
  const [res, setRes] = useState<{ loading?: boolean; err?: string; list?: WebPlace[]; at?: { lat: number; lon: number } }>({});
  const [sel, setSel] = useState<string | null>(null);

  const refPoint = (): { lat: number; lon: number } | null => {
    if (where === 'home') return settings.home ?? null;
    if (where === 'me') return geo.pos ?? null;
    if (where.startsWith('trip:')) { const t = trips.find(x => x.id === where.slice(5)); return t ? tripPoint(t) : null; }
    const r = REGION_BY_ID[where.slice(7) as RegionId]; return r ? { lat: r.lat, lon: r.lon } : null;
  };
  const run = async () => {
    setSel(null);
    if (mode === 'name') { if (!q.trim()) return toast('כתבו שם מקום'); setRes({ loading: true }); searchByName(q.trim()).then(list => setRes({ list }), e => setRes({ err: e.message })); return; }
    let at = refPoint();
    if (where === 'me' && !at) at = await geo.request();
    if (!at) return toast('בחרו נקודת חיפוש');
    if (!cats.length) return toast('בחרו לפחות סוג מקום אחד');
    setRes({ loading: true, at });
    searchNearby(at.lat, at.lon, km, cats).then(list => setRes({ list: list.sort((a, b) => distKm(at!, a) - distKm(at!, b)), at }), e => setRes({ err: e.message }));
  };
  const list = res.list ?? [];
  const pts = useMemo(() => list.map(p => ({ id: p.id, name: p.name, kind: 'viewpoint' as const, label: p.label, lat: p.lat, lon: p.lon, url: p.osmUrl })), [list]);
  const bbox = list.length ? [Math.min(...list.map(p => p.lon)) - 0.01, Math.min(...list.map(p => p.lat)) - 0.01, Math.max(...list.map(p => p.lon)) + 0.01, Math.max(...list.map(p => p.lat)) + 0.01] as [number, number, number, number] : null;
  const upcomingTrips = trips.filter(t => t.status === 'planning' && t.end >= todayISO());

  return (
    <div className="gutter mx-auto max-w-6xl space-y-5 py-6">
      <header className="space-y-1"><h1 className="font-display text-3xl">חיפוש מקומות לטיול</h1>
        <p className="text-muted">מקומות מ-OpenStreetMap ותיאורים מוויקיפדיה. זה מידע קהילתי — לפני שיוצאים בודקים אצל המפעיל שעות, הזמנות וסגירות.</p></header>
      <Segmented label="איך מחפשים" value={mode} onChange={v => { setMode(v); setRes({}); }} options={[{ v: 'near', label: 'מה יש בסביבה', icon: <MapPin size={16} /> }, { v: 'name', label: 'לפי שם', icon: <Search size={16} /> }]} />
      <form className="space-y-3 rounded-xl2 border border-line bg-surface p-4" onSubmit={e => { e.preventDefault(); run(); }}>
        {mode === 'name'
          ? <div><label className="label" htmlFor="pq">שם המקום</label><input id="pq" className="field" placeholder="למשל: עין עבדת, מצפה רמון, נחל כזיב" value={q} onChange={e => setQ(e.target.value)} /></div>
          : <>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div><label className="label" htmlFor="pw">ליד</label>
                <select id="pw" className="field" value={where} onChange={e => setWhere(e.target.value)}>
                  {upcomingTrips.map(t => <option key={t.id} value={`trip:${t.id}`}>היעד של "{t.name}"</option>)}
                  {settings.home && <option value="home">נקודת היציאה שלי</option>}
                  <option value="me">המיקום שלי עכשיו</option>
                  {REGIONS.map(r => <option key={r.id} value={`region:${r.id}`}>{r.name}</option>)}
                </select></div>
              <div><label className="label" htmlFor="pk">רדיוס</label><select id="pk" className="field" value={km} onChange={e => setKm(+e.target.value)}>{[3, 5, 10, 20, 30].map(k => <option key={k} value={k}>{k} ק״מ</option>)}</select></div>
            </div>
            {where === 'me' && <p className="flex items-center gap-1.5 text-xs text-muted"><LocateFixed size={13} />המיקום משמש רק לחיפוש הזה ולא נשמר.{geo.error ? ` ${geo.error}` : ''}</p>}
            <div className="flex flex-wrap gap-2" role="group" aria-label="סוגי מקומות">{(Object.keys(CATEGORY_HE) as Category[]).map(c => <Chip key={c} active={cats.includes(c)} onClick={() => setCats(cats.includes(c) ? cats.filter(x => x !== c) : [...cats, c])}>{CATEGORY_HE[c]}</Chip>)}</div>
          </>}
        <Button type="submit" icon={<Search size={16} />} disabled={res.loading}>{res.loading ? 'מחפשים…' : 'חיפוש'}</Button>
      </form>

      {res.err && <p className="rounded-xl2 border border-danger/40 bg-danger/5 p-3 text-sm" role="alert">{res.err}</p>}
      {res.list && <p className="text-sm text-muted" aria-live="polite">{list.length ? `נמצאו ${list.length} מקומות` : 'לא נמצאו מקומות — נסו רדיוס גדול יותר או סוגים נוספים.'}</p>}
      {list.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-xl2 bg-raised" />}><IsraelMap osm={pts as any} fitTo={bbox} className="h-72 overflow-hidden rounded-xl2 border border-line lg:sticky lg:top-4 lg:h-[70dvh]" /></Suspense>
          <ul className="space-y-3" aria-label="תוצאות">{list.map(p => {
            const open = sel === p.id;
            return (
              <li key={p.id} className={cx('space-y-2 rounded-xl2 border bg-surface p-4', open ? 'border-moss' : 'border-line')}>
                <button type="button" className="w-full text-right" aria-expanded={open} onClick={() => setSel(open ? null : p.id)}>
                  <span className="block font-bold">{p.name}</span>
                  <span className="block text-sm text-muted">{p.label}{res.at ? ` · ${distKm(res.at, p).toFixed(1)} ק״מ בקו אווירי` : ''}</span>
                </button>
                {open && <>
                  <Prov kind="community" source="OpenStreetMap — לא אומת" url={p.osmUrl} />
                  <ul className="flex flex-wrap gap-1.5 text-xs">
                    {p.tags.fee != null && <li className="rounded-full bg-raised px-2 py-0.5">{p.tags.fee ? 'בתשלום (לפי OSM)' : 'ללא תשלום (לפי OSM)'}</li>}
                    {p.tags.wheelchair && <li className="rounded-full bg-raised px-2 py-0.5">נגישות לכיסא גלגלים: {p.tags.wheelchair === 'yes' ? 'כן' : p.tags.wheelchair === 'limited' ? 'חלקית' : p.tags.wheelchair === 'no' ? 'לא' : p.tags.wheelchair} (לפי OSM)</li>}
                    {p.tags.dog && <li className="rounded-full bg-raised px-2 py-0.5">כלבים: {p.tags.dog === 'yes' || p.tags.dog === 'leashed' ? 'מותר' + (p.tags.dog === 'leashed' ? ' ברצועה' : '') : p.tags.dog === 'no' ? 'אסור' : p.tags.dog} (לפי OSM)</li>}
                    {p.tags.drinking_water != null && <li className="rounded-full bg-raised px-2 py-0.5">מי שתייה: {p.tags.drinking_water ? 'יש' : 'אין'} (לפי OSM)</li>}
                    {p.tags.operator && <li className="rounded-full bg-raised px-2 py-0.5">מפעיל: {p.tags.operator}</li>}
                  </ul>
                  <Wiki p={p} />
                  <div className="flex flex-wrap items-center gap-2">
                    <AddToTrip p={p} />
                    {p.tags.website && /^https?:\/\//.test(p.tags.website) && <a className="inline-flex items-center gap-1 text-sm font-bold text-moss" href={p.tags.website} target="_blank" rel="noreferrer">אתר המקום<ExternalLink size={13} /></a>}
                    {navApps(p.lat, p.lon).slice(0, 2).map(a => <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="rounded-full bg-raised px-3 py-1.5 text-sm font-bold hover:bg-sand">{a.name}</a>)}
                  </div>
                </>}
              </li>);
          })}</ul>
        </div>)}
      <p className="text-xs text-muted">© תורמי OpenStreetMap (ODbL) · ויקיפדיה (CC BY-SA). החיפוש לפי שם שולח את מה שהקלדתם ל-Nominatim; חיפוש בסביבה שולח רק את נקודת החיפוש.</p>
    </div>
  );
}
