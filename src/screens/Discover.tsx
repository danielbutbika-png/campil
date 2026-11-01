// "מגלים בסביבה" — CampIL Discover for one trip: coffee carts, food, trails, views, attractions around the destination
// and along the drive, ranked for this family and this day's weather/warnings, on a map and in cards; "build my day"
// turns a selection into a timed plan that goes into the schedule only after approval.
import { useEffect, useMemo, useState } from 'react';
import { Coffee, Utensils, Footprints, Mountain, Sparkles, Heart, Navigation, Plus, Check, MapPin, Loader2, ChevronUp, ChevronDown, Trash2, CalendarPlus, Info, Route as RouteIcon, ExternalLink } from 'lucide-react';
import type { Trip, TripPlace, ScheduleItem } from '../lib/types';
import { useStore } from '../lib/store';
import { useForecast, tripPoint } from '../lib/hooks';
import { searchAround, searchAlong, DISC_HE, FOOD, type DiscPlace, type DiscCat } from '../services/discover';
import { detours, type Detour } from '../services/detour';
import { discFit, discCtxFor, type DiscFit } from '../intel/discoverRank';
import { orderStops, timeline, STAY_MIN, type DayStop } from '../intel/dayBuilder';
import { useAlertCtx } from '../services/officialAlerts';
import { driveRoute } from '../services/routing';
import { navApps } from '../services/fuel';
import { IsraelMap } from '../components/IsraelMap';
import { DayStrip } from '../components/Weather';
import { LiveAlerts } from '../components/Field';
import { Button, Chip, Sheet, cx, toast } from '../components/ui';
import { href, go } from '../lib/router';
import { addDays, fmtDate, fmtRange, shortDay, tripLength, uid } from '../lib/util';
import { openAt } from '../lib/openingHours';
import { tripRegions, AREAS_OF } from '../services/officialAlerts';

type Mode = 'near' | 'way' | 'back';
type Tab = 'all' | 'carts' | 'food' | 'trails' | 'attractions' | 'nature' | 'route' | 'fav';
const TABS: { id: Tab; label: string; I: any; cats: DiscCat[] }[] = [
  { id: 'all', label: 'הכל', I: Sparkles, cats: ['cart', 'cafe', 'breakfast', 'restaurant', 'trail', 'view', 'water', 'picnic', 'family', 'visitor', 'heritage'] },
  { id: 'carts', label: 'עגלות קפה', I: Coffee, cats: ['cart'] },
  { id: 'food', label: 'מסעדות וקפה', I: Utensils, cats: ['restaurant', 'cafe', 'breakfast', 'cart'] },
  { id: 'trails', label: 'מסלולי טיול', I: Footprints, cats: ['trail'] },
  { id: 'attractions', label: 'אטרקציות', I: Sparkles, cats: ['family', 'visitor', 'heritage'] },
  { id: 'nature', label: 'תצפיות וטבע', I: Mountain, cats: ['view', 'water', 'picnic'] },
  { id: 'route', label: 'עצירות בדרך', I: RouteIcon, cats: ['cart', 'cafe', 'breakfast', 'restaurant', 'view', 'picnic', 'family', 'visitor', 'heritage', 'trail'] },
  { id: 'fav', label: 'המועדפים שלי', I: Heart, cats: [] },
];
const RADII = [5, 10, 20, 30, 50];
const DETOURS = [0, 5, 10, 20, 30];
const FAVKEY = 'campil-disc-fav';
const readFav = (): Record<string, DiscPlace> => { try { return JSON.parse(localStorage.getItem(FAVKEY) ?? '{}'); } catch { return {}; } };

export default function Discover({ id }: { id: string }) {
  const t = useStore(s => s.trips.find(x => x.id === id));
  if (!t) return <p className="gutter py-16 text-center">הטיול לא נמצא. <a className="font-bold text-moss" href={href('/trips')}>לטיולים</a></p>;
  return <DiscoverTrip t={t} />;
}

function DiscoverTrip({ t }: { t: Trip }) {
  const home = useStore(s => s.settings.home);
  const base = tripPoint(t);
  const { days } = tripLength(t.start, t.end);
  const [mode, setMode] = useState<Mode>('near');
  const [tab, setTab] = useState<Tab>('all');
  const [radius, setRadius] = useState(10);
  const [maxDetour, setMaxDetour] = useState(10);
  const [dayIdx, setDayIdx] = useState(0);
  const [foodF, setFoodF] = useState<string[]>([]);
  const [list, setList] = useState<DiscPlace[] | null>(null);
  const [det, setDet] = useState<Map<string, Detour | null> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [n, setN] = useState(20);
  const [picked, setPicked] = useState<DiscPlace[]>([]);
  const [fav, setFav] = useState(readFav);
  const fc = useForecast(base?.lat, base?.lon);
  const date = addDays(t.start, dayIdx);
  const wxDay = fc.data?.days.find(d => d.date === date);
  const al = useAlertCtx();
  // warnings in force for this trip's areas (IMS north/center/south + country-wide)
  const areas = useMemo(() => new Set<string>(['country', ...tripRegions(t).flatMap(r => AREAS_OF[r])]), [t.regionId, t.siteIds.join(), (t.places ?? []).length]);
  const ctx = useMemo(() => discCtxFor(t, base, wxDay, al.alerts.filter(a => areas.has(a.area))), [t, base?.lat, wxDay, al, areas]);
  const routeMode = mode !== 'near' || tab === 'route';
  const from = mode === 'back' ? base : home, to = mode === 'back' ? home : base;
  const cats = TABS.find(x => x.id === tab)!.cats;

  // search: around the destination, or along the drive (home ↔ destination)
  useEffect(() => {
    if (tab === 'fav' || !base) return;
    let off = false; setBusy(true); setErr(null); setN(20);
    const run = async () => {
      if (routeMode) {
        if (!from || !to) { setList([]); setErr('כדי לחפש עצירות בדרך צריך נקודת יציאה — הגדירו אותה בהגדרות (נקודת יציאה).'); return; }
        const r = await driveRoute([from, to]).catch(() => null);
        if (!r) { setErr('שירות חישוב המסלול לא זמין כרגע — מוצגים מקומות ליד היעד בלבד.'); setList(await searchAround(base, radius, cats)); setDet(null); return; }
        const found = await searchAlong(r.coords, 3, cats);
        if (off) return; setList(found);
        const d = await detours(from, to, found.slice(0, 60)); if (off) return;
        setDet(d ? new Map(found.slice(0, 60).map((p, i) => [p.id, d[i]])) : null);
      } else { setList(await searchAround(base, radius, cats)); setDet(null); }
    };
    run().catch(e => { if (!off) { setErr(e.message); setList([]); } }).finally(() => { if (!off) setBusy(false); });
    return () => { off = true; };
  }, [tab, mode, radius, base?.lat, base?.lon, from?.lat, to?.lat]);

  const ranked = useMemo(() => {
    const src = tab === 'fav' ? Object.values(fav) : (list ?? []);
    return src.map(p => ({ p, fit: discFit(p, ctx, det?.get(p.id)) }))
      .filter(x => !routeMode || !det || (x.fit.detour?.extraMin ?? 99) <= maxDetour || (maxDetour === 0 && (x.fit.detour?.extraMin ?? 99) <= 2))
      .filter(x => tab !== 'food' || !foodF.length || foodF.every(f => f === 'kosher' ? x.p.kosher === 'yes' || x.p.kosher === 'only' : f === 'veg' ? !!(x.p.vegetarian === 'yes' || x.p.vegetarian === 'only' || x.p.vegan === 'yes' || x.p.vegan === 'only') : f === 'outdoor' ? x.p.outdoor : f === 'breakfast' ? x.p.cat === 'breakfast' || x.p.cat === 'cafe' : true))
      .sort((a, b) => (b.fit.score ?? -1) - (a.fit.score ?? -1));
  }, [list, ctx, det, maxDetour, foodF, tab, fav, routeMode]);
  const toggleFav = (p: DiscPlace) => { const f = { ...fav }; if (f[p.id]) delete f[p.id]; else f[p.id] = p; setFav(f); try { localStorage.setItem(FAVKEY, JSON.stringify(f)); } catch { /* quota */ } toast(f[p.id] ? 'נשמר במועדפים' : 'הוסר מהמועדפים'); };
  const togglePick = (p: DiscPlace) => setPicked(x => (x.some(y => y.id === p.id) ? x.filter(y => y.id !== p.id) : [...x, p]));
  const shown = ranked.slice(0, n);

  if (!base) return <div className="gutter py-12 text-center"><p className="font-display text-2xl">קודם בוחרים יעד</p><p className="text-muted">בעריכת הטיול — "מיקום הטיול".</p><Button onClick={() => go(`/trip/${t.id}`)}>לטיול</Button></div>;
  return (
    <div className="gutter mx-auto max-w-6xl space-y-4 py-5 pb-28">
      <header className="space-y-1">
        <a href={href(`/trip/${t.id}`)} className="text-sm font-bold text-moss">← {t.name || 'הטיול'}</a>
        <h1 className="font-display text-3xl">מגלים בסביבה</h1>
        <p className="flex flex-wrap items-center gap-x-3 text-muted"><span className="flex items-center gap-1"><MapPin size={15} />{base.label}</span><span>{fmtRange(t.start, t.end)}</span></p>
      </header>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="איפה מחפשים">{([['near', 'בסביבת היעד'], ['way', 'בדרך ליעד'], ['back', 'בדרך חזרה']] as const).map(([v, l]) => <Chip key={v} role="radio" aria-checked={mode === v} active={mode === v} onClick={() => { setMode(v); if (v !== 'near' && tab === 'route') setTab('all'); }}>{l}</Chip>)}</div>
        {routeMode ? <div className="flex flex-wrap items-center gap-2" role="group" aria-label="סטייה מהמסלול"><span className="text-sm">סטייה מהמסלול:</span>{DETOURS.map(d => <Chip key={d} active={maxDetour === d} onClick={() => setMaxDetour(d)}>{d === 0 ? 'בלי סטייה' : `עד ${d} דק׳`}</Chip>)}</div>
          : <div className="flex flex-wrap items-center gap-2" role="group" aria-label="טווח חיפוש"><span className="text-sm">טווח:</span>{RADII.map(r => <Chip key={r} active={radius === r} onClick={() => setRadius(r)}>{r} ק״מ</Chip>)}</div>}
        {days > 1 && <label className="flex items-center gap-2 text-sm">יום:<select className="field !h-10 w-auto" value={dayIdx} onChange={e => setDayIdx(+e.target.value)}>{Array.from({ length: days }, (_, i) => <option key={i} value={i}>יום {i + 1} · {shortDay(addDays(t.start, i))} {fmtDate(addDays(t.start, i))}</option>)}</select></label>}
      </div>

      {fc.data && <section aria-label="תחזית" className="space-y-1 rounded-xl2 border border-line bg-surface p-3"><DayStrip days={fc.data.days.filter(d => d.date >= t.start && d.date <= t.end).slice(0, 7)} compact />{!wxDay && <p className="text-sm font-bold">עדיין אין תחזית אמינה לתאריך זה — ההמלצות לא מתחשבות במזג האוויר.</p>}</section>}
      <LiveAlerts regions={tripRegions(t)} />

      <div role="tablist" aria-label="קטגוריות" className="scroll-x -mx-4 flex gap-1 px-4">{TABS.filter(x => x.id !== 'route' || mode === 'near').map(x => <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)} className={cx('inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-bold', tab === x.id ? 'bg-forest text-onforest' : 'text-muted hover:bg-raised')}><x.I size={15} />{x.label}</button>)}</div>
      {tab === 'food' && <div className="flex flex-wrap gap-2" role="group" aria-label="סינון אוכל">{([['kosher', 'מסומן כשר'], ['veg', 'צמחוני / טבעוני'], ['outdoor', 'ישיבה בחוץ'], ['breakfast', 'קפה וארוחת בוקר']] as const).map(([v, l]) => <Chip key={v} active={foodF.includes(v)} onClick={() => setFoodF(f => (f.includes(v) ? f.filter(x => x !== v) : [...f, v]))}>{l}</Chip>)}</div>}

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="order-2 space-y-2 lg:order-1" aria-live="polite">
          {busy && <p className="flex items-center gap-2 text-muted"><Loader2 size={16} className="animate-spin" />מחפשים {routeMode ? 'לאורך הדרך' : 'בסביבה'}…</p>}
          {err && <p className="rounded-xl bg-warn/10 p-3 text-sm" role="alert">{err}</p>}
          {!busy && list && tab !== 'fav' && <p className="text-sm text-muted">{ranked.length} מקומות{routeMode ? (det ? ' · מסודרים לפי התאמה; הסטייה מחושבת בזמן נסיעה' : ' · אין חישוב סטייה — מוצג מרחק בקו אווירי') : ' · מרחק בקו אווירי מהיעד'}</p>}
          {!busy && list && !ranked.length && tab !== 'fav' && <p className="rounded-xl2 border border-line bg-surface p-4">{tab === 'carts' ? 'לא נמצאו עגלות קפה מזוהות בטווח הזה. עגלות קפה לא תמיד מסומנות במפה — נסו טווח גדול יותר, או את בתי הקפה בלשונית "מסעדות וקפה".' : 'לא נמצאו מקומות בטווח הזה. נסו טווח גדול יותר.'}</p>}
          {tab === 'fav' && !ranked.length && <p className="rounded-xl2 border border-line bg-surface p-4 text-sm">עוד אין מועדפים. לחצו על הלב בכרטיס כדי לשמור.</p>}
          <ul className="space-y-2">{shown.map(({ p, fit }) => <PlaceCard key={p.id} t={t} p={p} fit={fit} routeMode={routeMode} fav={!!fav[p.id]} picked={picked.some(x => x.id === p.id)} onFav={() => toggleFav(p)} onPick={() => togglePick(p)} />)}</ul>
          {ranked.length > n && <Button variant="soft" onClick={() => setN(n + 20)}>עוד {Math.min(20, ranked.length - n)}</Button>}
          <p className="text-xs text-muted">מקורות: OpenStreetMap (© OpenStreetMap contributors) ומאגר המקומות של CampIL. אין דירוגים וביקורות במקור הפתוח, ולכן הם לא מוצגים. שעות, כשרות ומחירים — לבדוק מול העסק.</p>
        </div>
        <div className="order-1 h-[40vh] overflow-hidden rounded-xl2 border border-line lg:sticky lg:top-4 lg:order-2 lg:h-[70vh]">
          <IsraelMap selected={null} fitTo={fitBox(shown.map(x => x.p), base)} osm={shown.map(({ p }) => ({ id: p.id, name: p.name, lat: p.lat, lon: p.lon, kind: 'camp_site', label: p.label ?? DISC_HE[p.cat], url: p.place ? `#/place/${encodeURIComponent(p.place.id)}` : p.osmUrl }) as any)} className="h-full w-full" />
        </div>
      </div>
      {picked.length > 0 && <BuildDay t={t} base={base} picked={picked} setPicked={setPicked} dayIdx={dayIdx} />}
    </div>
  );
}

function PlaceCard({ t, p, fit, routeMode, fav, picked, onFav, onPick }: { t: Trip; p: DiscPlace; fit: DiscFit; routeMode: boolean; fav: boolean; picked: boolean; onFav: () => void; onPick: () => void }) {
  const [open, setOpen] = useState(false); const [nav, setNav] = useState(false);
  const up = useStore(s => s.updateTrip);
  const inTrip = (t.places ?? []).some(x => x.id === p.id);
  const add = () => { const tp: TripPlace = { id: p.id, name: p.name, lat: p.lat, lon: p.lon, label: DISC_HE[p.cat], source: p.place ? (p.place.src.includes('wd') ? 'wd' : 'osm') : 'osm', url: p.osmUrl ?? '', website: p.website, addedAt: new Date().toISOString() }; up(t.id, x => ({ places: [...(x.places ?? []).filter(y => y.id !== p.id), tp] })); toast(`${p.name} נוסף לטיול`); };
  const d = fit.detour;
  return (
    <li className={cx('rounded-xl2 border bg-surface p-3', picked ? 'border-forest ring-2 ring-forest/30' : 'border-line')} data-disc={p.cat}>
      <div className="flex gap-3">
        {p.image ? <img src={p.image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl bg-raised object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-raised" aria-hidden>{p.cat === 'cart' || p.cat === 'cafe' ? <Coffee className="text-moss" /> : FOOD.includes(p.cat) ? <Utensils className="text-moss" /> : <MapPin className="text-moss" />}</span>}
        <div className="min-w-0 flex-1">
          <p className="flex items-start justify-between gap-2"><span className="font-bold leading-tight">{p.name}</span>{fit.score != null ? <span className="num shrink-0 rounded-full bg-raised px-2 text-xs font-bold" title="ציון התאמה לטיול — לא דירוג ולא ציון בטיחות">{fit.score}</span> : <span className="shrink-0 rounded-full bg-danger/10 px-2 text-xs font-bold text-danger">לא היום</span>}</p>
          <p className="text-xs text-muted">{p.label ?? DISC_HE[p.cat]}{p.catWhy ? ` · ${p.catWhy}` : ''}</p>
          <p className="text-xs">{routeMode && d ? <>סטייה: <span className="num font-bold">{d.extraMin}</span> דק׳ ({d.extraKm} ק״מ) · {d.toStopMin} דק׳ מהיציאה</> : fit.km != null ? <><span className="num">{fit.km < 10 ? fit.km.toFixed(1) : Math.round(fit.km)}</span> ק״מ בקו אווירי</> : null}{p.hours ? <> · שעות (OSM): <bdi dir="ltr">{p.hours}</bdi></> : FOOD.includes(p.cat) ? ' · שעות: לא ידוע' : ''}</p>
          {fit.excluded ? <p className="text-xs font-bold text-danger">{fit.excluded}</p> : fit.why.length > 0 && <p className="text-xs"><span className="font-bold">למה? </span>{fit.why.slice(0, 3).join(' · ')}</p>}
        </div>
      </div>
      {open && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl bg-raised/50 p-2.5 text-sm">
          {p.addr && <><dt className="text-muted">כתובת</dt><dd>{p.addr}</dd></>}
          {p.cuisine?.length ? <><dt className="text-muted">מטבח</dt><dd>{p.cuisine.join(', ')} (OSM)</dd></> : null}
          {FOOD.includes(p.cat) && <><dt className="text-muted">כשרות</dt><dd>{p.kosher === 'yes' || p.kosher === 'only' ? 'מסומן כשר במפה — יש לבדוק תעודה מול העסק' : p.kosher === 'no' ? 'מסומן לא כשר (OSM)' : 'לא ידוע — יש לבדוק מול העסק'}</dd></>}
          {p.outdoor != null && <><dt className="text-muted">ישיבה בחוץ</dt><dd>{p.outdoor ? 'יש (OSM)' : 'אין (OSM)'}</dd></>}
          {p.wheelchair && <><dt className="text-muted">נגישות</dt><dd>{p.wheelchair === 'yes' ? 'נגיש' : p.wheelchair === 'limited' ? 'נגיש חלקית' : 'לא נגיש'} (OSM)</dd></>}
          {p.phone && <><dt className="text-muted">טלפון</dt><dd><a className="font-bold text-moss" href={`tel:${p.phone}`} dir="ltr">{p.phone}</a></dd></>}
          {p.website && <><dt className="text-muted">אתר / עמוד</dt><dd><a className="inline-flex items-center gap-1 font-bold text-moss" href={p.website} target="_blank" rel="noreferrer">פתיחה<ExternalLink size={12} /></a></dd></>}
          <dt className="text-muted">דירוג</dt><dd className="text-muted">אין דירוגים במקור הפתוח</dd>
          {fit.check.length > 0 && <><dt className="text-muted">לבדוק</dt><dd><ul className="list-inside list-disc">{fit.check.map(c => <li key={c}>{c}</li>)}</ul></dd></>}
          <dt className="text-muted">מקור</dt><dd>{p.source === 'campil' ? <a className="font-bold text-moss" href={href(`/place/${encodeURIComponent(p.place!.id)}`)}>מאגר CampIL — לעמוד המקום</a> : <a className="underline" href={p.osmUrl} target="_blank" rel="noreferrer">OpenStreetMap</a>}</dd>
        </dl>)}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className="inline-flex min-h-10 items-center gap-1 rounded-full bg-raised px-3 text-sm font-bold" aria-expanded={open} onClick={() => setOpen(!open)}><Info size={14} />פרטים</button>
        <button type="button" className="inline-flex min-h-10 items-center gap-1 rounded-full bg-raised px-3 text-sm font-bold" onClick={() => setNav(true)}><Navigation size={14} />ניווט</button>
        <button type="button" disabled={inTrip} className="inline-flex min-h-10 items-center gap-1 rounded-full bg-raised px-3 text-sm font-bold disabled:opacity-60" onClick={add}>{inTrip ? <><Check size={14} />בטיול</> : <><Plus size={14} />הוסף לטיול</>}</button>
        <button type="button" className="inline-flex min-h-10 items-center gap-1 rounded-full bg-raised px-3 text-sm font-bold" aria-pressed={fav} onClick={onFav}><Heart size={14} className={fav ? 'fill-current text-sunset' : ''} />{fav ? 'שמור' : 'שמירה'}</button>
        <button type="button" className={cx('inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-bold', picked ? 'bg-forest text-onforest' : 'bg-raised')} aria-pressed={picked} onClick={onPick}><CalendarPlus size={14} />{picked ? 'ביום הטיול' : 'ליום טיול'}</button>
      </div>
      <Sheet open={nav} onClose={() => setNav(false)} title={`ניווט ל${p.name}`}><div className="flex flex-wrap gap-2">{navApps(p.lat, p.lon).map(a => <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="min-h-11 rounded-full bg-raised px-4 py-2.5 font-bold">{a.name}</a>)}</div></Sheet>
    </li>
  );
}

/** "Build my day": order, times, drive legs (OSRM, or estimates), reorder/delete/stay, then add to the schedule with approval. */
function BuildDay({ t, base, picked, setPicked, dayIdx }: { t: Trip; base: { lat: number; lon: number; label: string }; picked: DiscPlace[]; setPicked: (f: (x: DiscPlace[]) => DiscPlace[]) => void; dayIdx: number }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState('09:00');
  const [stops, setStops] = useState<DayStop[]>([]);
  const [legs, setLegs] = useState<number[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const up = useStore(s => s.updateTrip);
  const build = () => { setStops(orderStops(base, picked.map(p => ({ p, stay: STAY_MIN[p.cat] })), start)); setOpen(true); };
  useEffect(() => { if (!open || !stops.length) return; setLegs(null); driveRoute([{ ...base, name: base.label }, ...stops.map(s => ({ lat: s.p.lat, lon: s.p.lon, name: s.p.name })), { ...base, name: base.label }]).then(r => setLegs(r.legs.map(l => l.minutes)), () => setLegs(null)); }, [open, stops.map(s => s.p.id).join()]);
  const rows = timeline(stops, base, start, legs);
  const move = (i: number, d: number) => setStops(s => { const x = [...s]; const j = i + d; if (j < 0 || j >= x.length) return s; [x[i], x[j]] = [x[j], x[i]]; return x; });
  const apply = () => {
    const items: ScheduleItem[] = rows.filter(r => r.kind === 'stop').map(r => ({ id: uid('s'), day: dayIdx, time: r.at, title: r.stop!.p.name, kind: FOOD.includes(r.stop!.p.cat) ? 'meal' : 'activity', note: `${DISC_HE[r.stop!.p.cat]} · עד ${r.ends} · ${r.drive} דק׳ נסיעה${r.driveEstimated ? ' (הערכה)' : ''} · לבדוק שעות פעילות לפני` }));
    const back = rows.at(-1)!;
    items.push({ id: uid('s'), day: dayIdx, time: back.at, title: `חזרה ל${base.label}`, kind: 'drive' });
    up(t.id, x => ({ schedule: [...x.schedule, ...items] })); toast(`נוספו ${items.length} פריטים ללו״ז`); setConfirm(false); setOpen(false); setPicked(() => []);
  };
  return (
    <>
      <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-4"><Button icon={<CalendarPlus size={17} />} onClick={build}>בנה לי יום ({picked.length})</Button></div>
      <Sheet open={open} onClose={() => setOpen(false)} title="יום הטיול שלי" wide footer={<><Button onClick={() => setConfirm(true)} disabled={!stops.length}>הוספה ללו״ז — יום {dayIdx + 1}</Button><Button variant="ghost" onClick={() => setOpen(false)}>סגירה</Button></>}>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">יוצאים ב-<input type="time" className="field !h-10 w-auto" value={start} onChange={e => setStart(e.target.value)} /></label>
          {!legs && <p className="text-xs text-muted">זמני הנסיעה מוערכים לפי מרחק — מחשבים מסלול…</p>}
          <ol className="space-y-1.5" aria-label="תוכנית היום">{rows.map((r, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-line p-2">
              <span className="num w-12 shrink-0 font-bold">{r.at}</span>
              <span className="min-w-0 flex-1">{r.kind === 'leave' ? <>יציאה מ{base.label}</> : r.kind === 'return' ? <>חזרה ל{base.label} <span className="text-xs text-muted">· {r.drive} דק׳ נסיעה{r.driveEstimated ? ' (הערכה)' : ''}</span></> : <>
                <span className="block font-bold">{r.stop!.p.name}</span>
                <span className="block text-xs text-muted">{DISC_HE[r.stop!.p.cat]} · {r.drive} דק׳ נסיעה{r.driveEstimated ? ' (הערכה)' : ''} · עד {r.ends}</span>
                <label className="mt-0.5 flex items-center gap-1 text-xs">משך: <input type="number" min={10} step={5} className="field !h-8 w-20 !px-2" value={r.stop!.stay} onChange={e => { const v = Math.max(5, +e.target.value || 0); setStops(s => s.map(x => (x.p.id === r.stop!.p.id ? { ...x, stay: v } : x))); }} aria-label={`משך הביקור ב${r.stop!.p.name}`} /> דק׳</label>
                {r.stop!.p.hours && (() => { const o = openAt(r.stop!.p.hours, addDays(t.start, dayIdx), r.at); return <span className={cx('block text-xs', o === false ? 'font-bold text-danger' : o ? 'text-ok' : 'text-warn')}>{o === false ? `לפי OSM סגור ביום ובשעה האלה (${r.at})` : o ? `לפי OSM פתוח ב-${r.at} — כדאי לוודא` : `לבדוק שפתוח ב-${r.at}`} · <bdi className="whitespace-nowrap" dir="ltr">{r.stop!.p.hours}</bdi></span>; })()}</>}</span>
              {r.kind === 'stop' && (() => { const j = stops.findIndex(s => s.p.id === r.stop!.p.id); return <span className="flex shrink-0 flex-col">
                <button type="button" className="grid h-8 w-8 place-items-center" aria-label="להקדים" onClick={() => move(j, -1)}><ChevronUp size={16} /></button>
                <button type="button" className="grid h-8 w-8 place-items-center" aria-label="לאחר" onClick={() => move(j, 1)}><ChevronDown size={16} /></button></span>; })()}
              {r.kind === 'stop' && <button type="button" className="grid h-10 w-10 shrink-0 place-items-center text-muted" aria-label={`הסרת ${r.stop!.p.name}`} onClick={() => { setStops(s => s.filter(x => x.p.id !== r.stop!.p.id)); setPicked(x => x.filter(y => y.id !== r.stop!.p.id)); }}><Trash2 size={16} /></button>}
              {r.kind === 'stop' && <a className="grid h-10 w-10 shrink-0 place-items-center text-moss" href={navApps(r.stop!.p.lat, r.stop!.p.lon)[0].url} target="_blank" rel="noreferrer" aria-label={`ניווט ל${r.stop!.p.name}`}><Navigation size={16} /></a>}
            </li>))}</ol>
          <p className="text-xs text-muted">הסדר מוצע: קפה בבוקר, ארוחה סביב הצהריים, השאר לפי קרבה. אפשר להזיז, למחוק ולשנות משך. שעות הפעילות לא מאומתות — לבדוק לפני היציאה.</p>
        </div>
      </Sheet>
      <Sheet open={confirm} onClose={() => setConfirm(false)} title={`להוסיף ללו״ז של יום ${dayIdx + 1}?`} footer={<><Button onClick={apply}>אישור</Button><Button variant="ghost" onClick={() => setConfirm(false)}>ביטול</Button></>}>
        <ul className="list-inside list-disc space-y-1 text-sm">{rows.filter(r => r.kind !== 'leave').map((r, i) => <li key={i}>{r.at} — {r.kind === 'return' ? `חזרה ל${base.label}` : r.stop!.p.name}</li>)}</ul>
        <p className="mt-2 text-sm text-muted">הפריטים יתווספו ללו״ז הקיים. שום דבר אחר בתוכנית לא משתנה.</p>
      </Sheet>
    </>
  );
}

/** Map bounds around the shown places and the destination: [west, south, east, north]. */
function fitBox(ps: { lat: number; lon: number }[], base: { lat: number; lon: number }): [number, number, number, number] {
  const all = [...ps, base]; const lats = all.map(p => p.lat), lons = all.map(p => p.lon); const pad = 0.02;
  return [Math.min(...lons) - pad, Math.min(...lats) - pad, Math.max(...lons) + pad, Math.max(...lats) + pad];
}
