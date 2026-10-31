// Destination details: everything CampIL knows about one place, each fact with its source, and what is unknown
// said plainly. Tabs: overview · around · trails · facilities · weather & warnings · sleeping · recommendations.
// Data: the place database (Wikidata + OpenStreetMap), Wikipedia (live), OpenStreetMap amenities (live),
// Open-Meteo forecast, the curated catalogue. Nothing here is generated; scores come from intel/placeFit.
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation, Heart, Plus, ExternalLink, AlertTriangle, Loader2, Info, Check, X, HelpCircle, Car, Tent, Footprints, Sparkles } from 'lucide-react';
import { loadPlaces, searchPlaces, nearby, sameNameCount, wikiExtract, amenitiesNear, wikiUrl, osmUrl, wikidataUrl, CAT_HE, CAT_GROUPS, AMENITY_HE, type Place, type PlaceDb, type Amenity, type PlaceCat } from '../services/placesDb';
import { fitScore, fitContextFor, placeConditions, type Fit } from '../intel/placeFit';
import { useAlertCtx } from '../services/officialAlerts';
import { useStore, nextTrip } from '../lib/store';
import { useForecast, tripPoint } from '../lib/hooks';
import { availability } from '../services/weather';
import { REGION_BY_ID } from '../data/regions';
import { SITE_BY_ID } from '../data/sites';
import { navApps, fetchRoute } from '../services/fuel';
import { DayStrip, SourceLine } from '../components/Weather';
import { OfficialAlerts } from '../components/Field';
import { Scene } from '../components/Scene';
import { Badge, Button, Chip, Sheet, cx, toast } from '../components/ui';
import { href, go } from '../lib/router';
import { SEASON_HE } from '../lib/util';
import type { Trip, TripPlace } from '../lib/types';

type Tab = 'overview' | 'around' | 'trails' | 'facilities' | 'weather' | 'sleep' | 'recs';
const TABS: [Tab, string][] = [['overview', 'סקירה'], ['around', 'מה בסביבה'], ['trails', 'מסלולים'], ['facilities', 'מתקנים'], ['weather', 'מזג אוויר ואזהרות'], ['sleep', 'לינה וקמפינג'], ['recs', 'המלצות']];
const km1 = (k: number) => (k < 10 ? k.toFixed(1) : String(Math.round(k)));
const SLEEP: PlaceCat[] = ['campsite', 'caravan'];
const TRAIL: PlaceCat[] = ['trail', 'bicycle'];

export default function Destination({ id }: { id: string }) {
  const [db, setDb] = useState<PlaceDb | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  useEffect(() => { loadPlaces().then(setDb, e => setErr(e.message)); }, []);
  useEffect(() => { setTab('overview'); window.scrollTo(0, 0); }, [id]);
  const p = useMemo(() => db?.places.find(x => x.id === decodeURIComponent(id)) ?? null, [db, id]);
  if (err) return <p role="alert" className="gutter py-16 text-center text-muted">{err}</p>;
  if (!db) return <p className="gutter flex items-center justify-center gap-2 py-16 text-muted"><Loader2 className="animate-spin" size={18} />טוענים את פרטי המקום…</p>;
  if (!p) return <div className="gutter py-16 text-center"><p className="font-display text-2xl">המקום לא נמצא</p><a className="font-bold text-moss" href={href('/places')}>לחיפוש מקומות</a></div>;
  return <PlaceView db={db} p={p} tab={tab} setTab={setTab} />;
}

function PlaceView({ db, p, tab, setTab }: { db: PlaceDb; p: Place; tab: Tab; setTab: (t: Tab) => void }) {
  const { favorites, toggleFavorite, trips } = useStore();
  const fav = favorites.includes(p.id);
  const reg = REGION_BY_ID[p.r];
  const site = p.site ? SITE_BY_ID[p.site] : undefined;
  const twins = sameNameCount(db, p);
  const [adding, setAdding] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  return (
    <article className="pb-12" aria-labelledby="place-h">
      <header className="relative isolate overflow-hidden bg-forest text-white">
        {p.img ? <img src={p.img.thumb} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" loading="eager" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <Scene kind={reg.scene} seed={p.he.length} className="absolute inset-0 -z-10 h-full w-full" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="gutter mx-auto max-w-4xl space-y-2 pb-5 pt-[max(4.5rem,env(safe-area-inset-top))]">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90"><MapPin size={15} />{reg.name}{p.c.slice(0, 3).map(c => <span key={c} className="rounded-full bg-black/35 px-2 py-0.5 text-xs backdrop-blur">{CAT_HE[c]}</span>)}</p>
          <h1 id="place-h" className="font-display text-3xl leading-tight drop-shadow md:text-5xl">{p.he}</h1>
          {p.en && <p className="text-white/85" dir="ltr" lang="en">{p.en}</p>}
          {p.img && <p className="text-[11px] text-white/75">תמונה: <a className="underline" href={p.img.page} target="_blank" rel="noreferrer">{p.img.author || 'Wikimedia Commons'}</a> · {p.img.license}</p>}
        </div>
      </header>
      <div className="gutter mx-auto max-w-4xl space-y-4 pt-4">
        <div className="flex flex-wrap gap-2">
          <Button icon={<Plus size={17} />} onClick={() => setAdding(true)}>הוספה לטיול</Button>
          <Button variant="soft" icon={<Navigation size={17} />} onClick={() => setNavOpen(true)}>ניווט</Button>
          <Button variant="soft" icon={<Footprints size={17} />} onClick={() => setTab('trails')}>מסלולים בסביבה</Button>
          <Button variant="soft" icon={<Info size={17} />} onClick={() => setTab('facilities')}>מתקנים</Button>
          <Button variant="ghost" icon={<Heart size={17} className={fav ? 'fill-current text-sunset' : ''} />} aria-pressed={fav} onClick={() => { toggleFavorite(p.id); toast(fav ? 'הוסר מהמועדפים' : 'נשמר במועדפים'); }}>{fav ? 'במועדפים' : 'שמירה למועדפים'}</Button>
          <Button variant="ghost" icon={<HelpCircle size={17} />} onClick={() => setTab('recs')}>שאלו את CampIL</Button>
        </div>
        {twins > 0 && <SameName db={db} p={p} />}
        <div role="tablist" aria-label="פרטי המקום" className="scroll-x -mx-4 flex gap-1 px-4">
          {TABS.map(([k, l]) => <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)} className={cx('min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-bold', tab === k ? 'bg-forest text-onforest' : 'text-muted hover:bg-raised')}>{l}</button>)}
        </div>
        <div role="tabpanel" aria-label={TABS.find(x => x[0] === tab)![1]} className="space-y-4">
          {tab === 'overview' && <Overview p={p} site={site} db={db} />}
          {tab === 'around' && <Around db={db} p={p} />}
          {tab === 'trails' && <Trails db={db} p={p} />}
          {tab === 'facilities' && <Facilities p={p} />}
          {tab === 'weather' && <WeatherTab p={p} />}
          {tab === 'sleep' && <Sleep db={db} p={p} />}
          {tab === 'recs' && <Recs db={db} p={p} />}
        </div>
        <Sources p={p} db={db} />
      </div>
      {adding && <AddToTrip p={p} trips={trips} onClose={() => setAdding(false)} />}
      <Sheet open={navOpen} onClose={() => setNavOpen(false)} title={`ניווט ל${p.he}`}>
        <div className="space-y-3"><div className="flex flex-wrap gap-2">{navApps(p.lat, p.lon).map(a => <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="min-h-11 rounded-full bg-raised px-4 py-2.5 font-bold hover:bg-sand">{a.name}</a>)}</div>
          <p className="text-sm text-muted">הניווט מוביל לנקודת המקום במפה{p.src.includes('wd') ? ' (לפי Wikidata)' : ' (לפי OpenStreetMap)'}. כניסה וחניה — לפי השילוט והאתר הרשמי.</p></div>
      </Sheet>
    </article>
  );
}

/** Several places share this name: show them all, with region and type, so the user can pick the right one. */
function SameName({ db, p }: { db: PlaceDb; p: Place }) {
  const twins = searchPlaces(db, p.he, 12).filter(x => x.id !== p.id && x.he.replace(/\s/g, '') === p.he.replace(/\s/g, ''));
  return (
    <div role="note" className="space-y-1.5 rounded-xl2 border border-warn/50 bg-warn/10 p-3 text-sm">
      <p className="font-bold">יש עוד {twins.length} מקומות בשם "{p.he}" — ודאו שזה המקום הנכון:</p>
      <ul className="flex flex-wrap gap-2">{twins.map(x => <li key={x.id}><a href={href(`/place/${encodeURIComponent(x.id)}`)} className="inline-flex min-h-9 items-center rounded-full bg-surface px-3 font-bold text-moss">{REGION_BY_ID[x.r].short} · {CAT_HE[x.c[0]]}</a></li>)}</ul>
    </div>
  );
}

const Unknown = ({ children }: { children: React.ReactNode }) => <span className="text-muted">{children}</span>;

function Overview({ p, site, db }: { p: Place; site?: (typeof SITE_BY_ID)[string]; db: PlaceDb }) {
  const [wiki, setWiki] = useState<{ extract: string; url: string } | null | 'loading' | 'error'>(p.wiki ? 'loading' : null);
  useEffect(() => { if (p.wiki) wikiExtract(p.wiki).then(setWiki, () => setWiki('error')); }, [p.wiki]);
  const reg = REGION_BY_ID[p.r];
  return (
    <>
      <section className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
        <h2 className="font-bold">על המקום</h2>
        {site && <p>{site.desc} <span className="text-xs text-muted">(קטלוג CampIL)</span></p>}
        {wiki === 'loading' && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={14} className="animate-spin" />טוענים תיאור מוויקיפדיה…</p>}
        {wiki && typeof wiki === 'object' && <><p className="leading-relaxed">{wiki.extract}</p><p className="text-xs text-muted">מתוך <a className="font-bold text-moss underline" href={wiki.url} target="_blank" rel="noreferrer">ויקיפדיה</a> (CC BY-SA). לא נבדק מול המפעיל.</p></>}
        {wiki === 'error' && <p className="text-sm text-muted">התיאור מוויקיפדיה לא נטען (צריך חיבור). <a className="font-bold text-moss" href={wikiUrl(p.wiki!)} target="_blank" rel="noreferrer">לערך</a></p>}
        {!site && !p.wiki && <p className="text-sm text-muted">אין לנו תיאור ממקור מוכר למקום הזה. מוצגים רק שם, סוג ומיקום.</p>}
      </section>
      <section className="rounded-xl2 border border-line bg-surface p-4">
        <h2 className="mb-2 font-bold">פרטים</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">אזור</dt><dd>{reg.name}</dd>
          {p.in && (() => { const parent = db.places.find(x => x.id === p.in); return parent ? <><dt className="text-muted">בתוך</dt><dd><a className="font-bold text-moss" href={href(`/place/${encodeURIComponent(parent.id)}`)}>{parent.he}</a></dd></> : null; })()}
          <dt className="text-muted">סוג</dt><dd>{p.c.map(c => CAT_HE[c]).join(' · ')}</dd>
          <dt className="text-muted">מיקום</dt><dd className="num" dir="ltr">{p.lat.toFixed(5)}, {p.lon.toFixed(5)}</dd>
          <dt className="text-muted">עונות מומלצות</dt><dd>{reg.bestSeasons.map(s => SEASON_HE[s]).join(', ')} <span className="text-xs text-muted">(לפי האזור)</span></dd>
          {p.her && <><dt className="text-muted">מורשת</dt><dd>אתר מוכרז / רשום כמורשת (Wikidata)</dd></>}
          {p.op && <><dt className="text-muted">מפעיל</dt><dd>{p.op} <span className="text-xs text-muted">(OSM)</span></dd></>}
          {p.km && <><dt className="text-muted">אורך</dt><dd>{p.km} ק״מ <span className="text-xs text-muted">(OSM)</span></dd></>}
          <dt className="text-muted">שעות פעילות</dt><dd>{p.hours ? <>{p.hours} <span className="text-xs text-muted">(לפי OSM — לבדוק באתר)</span></> : <Unknown>לא ידוע</Unknown>}</dd>
          <dt className="text-muted">עלות כניסה</dt><dd>{p.fac?.fee === true ? 'בתשלום (OSM) — המחיר באתר הרשמי' : p.fac?.fee === false ? 'ללא תשלום (OSM)' : <Unknown>לא ידוע</Unknown>}</dd>
          <dt className="text-muted">הזמנה מראש</dt><dd>{site?.booking ? site.booking : <Unknown>לא ידוע — לבדוק</Unknown>}</dd>
          <dt className="text-muted">כלבים</dt><dd>{p.fac?.dog ? `${p.fac.dog === 'yes' ? 'מותר' : p.fac.dog === 'no' ? 'אסור' : p.fac.dog} (OSM)` : <Unknown>לא ידוע</Unknown>}</dd>
          <dt className="text-muted">נגישות</dt><dd>{p.fac?.wheelchair ? `${p.fac.wheelchair === 'yes' ? 'נגיש' : p.fac.wheelchair === 'limited' ? 'נגיש חלקית' : 'לא נגיש'} (OSM)` : <Unknown>לא ידוע</Unknown>}</dd>
          <dt className="text-muted">אתר רשמי</dt><dd>{p.web ? <a className="inline-flex items-center gap-1 font-bold text-moss" href={p.web} target="_blank" rel="noreferrer">לאתר<ExternalLink size={13} /></a> : site ? <a className="inline-flex items-center gap-1 font-bold text-moss" href={site.officialUrl} target="_blank" rel="noreferrer">אתר המפעיל<ExternalLink size={13} /></a> : <Unknown>לא ידוע</Unknown>}</dd>
        </dl>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-raised/60 p-2 text-xs"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" />לא אומת מול המפעיל. שעות, מחירים, סגירות ותנאי שטח — רק באתר הרשמי ובשילוט במקום.</p>
      </section>
      <NearbyStrip db={db} p={p} title="קרוב לכאן" km={5} />
    </>
  );
}

function PlaceRow({ x, k, from }: { x: Place; k: number; from?: Place }) {
  const [drive, setDrive] = useState<string | null>(null);
  return (
    <li className="flex items-center gap-3 rounded-xl2 border border-line bg-surface p-2.5">
      {x.img ? <img src={x.img.thumb} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl bg-raised object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-raised"><MapPin size={20} className="text-moss" /></span>}
      <a href={href(`/place/${encodeURIComponent(x.id)}`)} className="min-w-0 flex-1"><span className="block truncate font-bold">{x.he}</span>
        <span className="block truncate text-xs text-muted">{CAT_HE[x.c[0]]} · <span className="num">{km1(k)}</span> ק״מ בקו אווירי{drive ? ` · ${drive}` : ''}</span></a>
      {from && !drive && <button type="button" className="min-h-11 shrink-0 rounded-full px-2 text-xs font-bold text-moss" aria-label={`זמן נסיעה ל${x.he}`} onClick={() => { setDrive('מחשבים…'); fetchRoute(from, x).then(r => setDrive(r.source === 'osrm' && r.minutes ? `כ-${r.minutes} דק׳ נסיעה (${Math.round(r.km)} ק״מ)` : 'זמן נסיעה לא זמין'), () => setDrive('זמן נסיעה לא זמין')); }}><Car size={15} className="inline" /> נסיעה</button>}
    </li>
  );
}

function NearbyStrip({ db, p, title, km, cats }: { db: PlaceDb; p: Place; title: string; km: number; cats?: PlaceCat[] }) {
  const list = useMemo(() => nearby(db, p, km, cats, p.id).slice(0, 6), [db, p, km, cats]);
  if (!list.length) return null;
  return <section className="space-y-2"><h2 className="font-bold">{title}</h2><ul className="space-y-2">{list.map(n => <PlaceRow key={n.p.id} x={n.p} k={n.km} from={p} />)}</ul></section>;
}

const RADII = [5, 10, 20, 50];
function Around({ db, p }: { db: PlaceDb; p: Place }) {
  const [r, setR] = useState(10); const [custom, setCustom] = useState('');
  const [g, setG] = useState<string | null>(null);
  const cats = g ? CAT_GROUPS.find(x => x.id === g)!.cats : undefined;
  const list = useMemo(() => nearby(db, p, r, cats, p.id), [db, p, r, cats]);
  const [n, setN] = useState(20);
  return (
    <section className="space-y-3" aria-label="מה בסביבה">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="רדיוס">{RADII.map(x => <Chip key={x} active={r === x} onClick={() => setR(x)}>עד {x} ק״מ</Chip>)}
        <label className="flex items-center gap-1 text-sm">אחר:<input inputMode="numeric" className="field !h-9 w-16" value={custom} onChange={e => setCustom(e.target.value)} onBlur={() => { const v = Number(custom); if (v > 0 && v <= 150) setR(v); }} aria-label="רדיוס בקילומטרים" /></label></div>
      <div className="scroll-x -mx-4 flex gap-2 px-4" role="group" aria-label="סוג מקום"><Chip active={!g} onClick={() => setG(null)}>הכול</Chip>{CAT_GROUPS.map(x => <Chip key={x.id} active={g === x.id} onClick={() => setG(x.id)}>{x.label}</Chip>)}</div>
      <p className="text-sm text-muted">{list.length} מקומות · המרחקים בקו אווירי, לא מרחק נסיעה. "נסיעה" מחשב זמן נסיעה לפי OSRM.</p>
      <ul className="space-y-2">{list.slice(0, n).map(x => <PlaceRow key={x.p.id} x={x.p} k={x.km} from={p} />)}</ul>
      {list.length > n && <Button variant="soft" onClick={() => setN(n + 20)}>עוד {Math.min(20, list.length - n)}</Button>}
    </section>
  );
}

function Trails({ db, p }: { db: PlaceDb; p: Place }) {
  const list = useMemo(() => nearby(db, p, 15, TRAIL, p.id).slice(0, 20), [db, p]);
  return (
    <section className="space-y-3" aria-label="מסלולים">
      <p className="text-sm text-muted">שבילים ומסלולים מסומנים במפה הפתוחה (OpenStreetMap) עד 15 ק״מ. אורך — רק כשמסומן; קושי, משך והתאמה לילדים — לא ידועים מהמקור, ויש לבדוק בשילוט ובאתר הרשמי.</p>
      {list.length ? <ul className="space-y-2">{list.map(x => (
        <li key={x.p.id} className="rounded-xl2 border border-line bg-surface p-3"><a href={href(`/place/${encodeURIComponent(x.p.id)}`)} className="font-bold">{x.p.he}</a>
          <p className="text-xs text-muted">{CAT_HE[x.p.c.find(c => TRAIL.includes(c))!]} · <span className="num">{km1(x.km)}</span> ק״מ בקו אווירי{x.p.km ? ` · אורך ${x.p.km} ק״מ (OSM)` : ' · אורך לא ידוע'}</p></li>))}</ul>
        : <p className="rounded-xl2 border border-line p-3 text-sm">לא מצאנו מסלולים מסומנים בקרבת המקום במאגר. אפשר לחפש בלשונית "מסלול" בתוכנית הטיול (מסלולי הליכה מהמפה) או באתר המפעיל.</p>}
    </section>
  );
}

function FacRow({ label, v }: { label: string; v: boolean | string | undefined }) {
  const yes = v === true || v === 'yes' || v === 'designated', no = v === false || v === 'no';
  return <li className="flex items-center justify-between gap-2 border-b border-line py-2 last:border-0"><span>{label}</span>{yes ? <Badge tone="ok"><Check size={12} />יש</Badge> : no ? <Badge><X size={12} />אין</Badge> : v === 'limited' ? <Badge tone="warn">חלקי</Badge> : <span className="text-sm text-muted">לא ידוע</span>}</li>;
}
function Facilities({ p }: { p: Place }) {
  const [am, setAm] = useState<Amenity[] | null>(null); const [e, setE] = useState<string | null>(null);
  useEffect(() => { amenitiesNear(p.lat, p.lon).then(setAm, x => setE(x.message)); }, [p.id]);
  const f = p.fac ?? {};
  const kinds = Object.keys(AMENITY_HE) as Amenity['kind'][];
  return (
    <>
      <section className="rounded-xl2 border border-line bg-surface p-4">
        <h2 className="font-bold">מה מסומן במקום עצמו</h2>
        <ul>{[['שירותים', f.toilets], ['מי שתייה', f.water], ['מקלחות', f.shower], ['חשמל', f.power], ['מקום למדורה', f.fire], ['מתקן מנגל', f.bbq], ['סככה / מחסה', f.shelter], ['נגישות לכיסא גלגלים', f.wheelchair], ['כלבים', f.dog]].map(([l, v]) => <FacRow key={l as string} label={l as string} v={v as any} />)}</ul>
        <p className="mt-2 text-xs text-muted">"לא ידוע" = אף אחד לא סימן במפה הפתוחה — זה לא אומר שאין. לא מציגים מתקן כקיים בלי מקור.</p>
      </section>
      <section className="rounded-xl2 border border-line bg-surface p-4" aria-label="מתקנים בסביבה">
        <h2 className="font-bold">מתקנים מסומנים עד 600 מ׳ (OpenStreetMap)</h2>
        {e ? <p className="text-sm text-muted">{e}</p> : !am ? <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={14} className="animate-spin" />בודקים במפה…</p> : (
          <ul className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">{kinds.map(k => { const l = am.filter(a => a.kind === k).sort((a, b) => a.m - b.m); return (
            <li key={k} className="rounded-xl bg-raised/50 p-2.5"><span className="block font-bold">{AMENITY_HE[k]}</span><span className="text-sm text-muted">{l.length ? `${l.length} · הקרוב ${l[0].m} מ׳` : 'לא מסומן'}</span></li>); })}</ul>)}
      </section>
    </>
  );
}

function WeatherTab({ p }: { p: Place }) {
  const fc = useForecast(p.lat, p.lon);
  const trip = nextTrip(useStore(s => s.trips));
  const inTrip = trip && (trip.places?.some(x => x.id === p.id) || (p.site && trip.siteIds.includes(p.site)));
  const avail = trip ? availability(trip.start, trip.end) : 'forecast';
  const days = (fc.data?.days ?? []).filter(d => !inTrip || (d.date >= trip!.start && d.date <= trip!.end));
  const cond = placeConditions(p, inTrip ? days : days.slice(0, 7));
  const flood = p.c.some(c => ['stream', 'waterfall', 'cave', 'spring'].includes(c)) || ['judean_desert', 'central_negev', 'arava', 'eilat'].includes(p.r);
  return (
    <>
      <section className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
        <h2 className="font-bold">{inTrip ? `בימי הטיול (${trip!.name || 'הטיול הקרוב'})` : 'התחזית לימים הקרובים'}</h2>
        {inTrip && avail === 'too_far' ? <p className="font-bold">עדיין אין תחזית אמינה לתאריך זה.</p>
          : fc.isLoading ? <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={14} className="animate-spin" />טוענים תחזית…</p>
          : fc.isError ? <p className="text-sm text-muted">התחזית לא זמינה כרגע.</p>
          : days.length ? <DayStrip days={inTrip ? days : days.slice(0, 7)} compact /> : <p className="text-sm text-muted">אין תחזית לימים האלה.</p>}
        {cond.length > 0 && <ul className="space-y-1.5" aria-label="מה לשים לב">{cond.map((c, i) => <li key={i} className={cx('flex items-start gap-2 rounded-xl p-2 text-sm', c.level === 'danger' ? 'bg-danger/10 font-bold text-danger' : 'bg-warn/10')}><AlertTriangle size={15} className="mt-0.5 shrink-0" /><span><span className="num">{c.day.slice(8, 10)}/{c.day.slice(5, 7)}</span> — {c.text}</span></li>)}</ul>}
        {!cond.length && days.length > 0 && <p className="text-sm">התחזית לא מעלה בעיה מיוחדת לסוג המקום הזה. זה לא אישור בטיחות — לבדוק התרעות רשמיות לפני היציאה.</p>}
        <SourceLine f={fc.data} />
      </section>
      <OfficialAlerts flood={flood} regions={[p.r]} />
    </>
  );
}

function Sleep({ db, p }: { db: PlaceDb; p: Place }) {
  const isSleep = p.c.some(c => SLEEP.includes(c));
  const f = p.fac ?? {};
  const around = useMemo(() => nearby(db, p, 20, SLEEP, p.id).slice(0, 8), [db, p]);
  return (
    <>
      {isSleep ? (
        <section className="rounded-xl2 border border-line bg-surface p-4">
          <h2 className="flex items-center gap-2 font-bold"><Tent size={18} className="text-moss" />לינה במקום — לפי מה שמסומן</h2>
          <ul>{[['לינה באוהלים', f.tents], ['קרוואנים', f.caravans], ['תשלום', f.fee], ['שירותים', f.toilets], ['מקלחות', f.shower], ['מי שתייה', f.water], ['חשמל', f.power], ['מדורה', f.fire], ['חניון שטח (בלי שירותים)', f.backcountry]].map(([l, v]) => <FacRow key={l as string} label={l as string} v={v as any} />)}</ul>
          <p className="mt-2 text-sm"><span className="font-bold">הזמנה מראש, מחיר ושעות:</span> לא ידוע — {p.web ? <a className="font-bold text-moss" href={p.web} target="_blank" rel="noreferrer">לבדוק באתר</a> : 'לבדוק אצל המפעיל'}. האם הלינה מותרת בכל עונה — לבדוק באתר הרשמי.</p>
        </section>
      ) : <p className="rounded-xl2 border border-line bg-surface p-4 text-sm">המקום הזה לא מסומן כמקום לינה. לינת שטח מותרת רק בחניוני לינה מוסדרים — הנה חניונים מסומנים בסביבה.</p>}
      <section className="space-y-2"><h2 className="font-bold">חניוני לינה וקרוואנים עד 20 ק״מ</h2>
        {around.length ? <ul className="space-y-2">{around.map(n => <PlaceRow key={n.p.id} x={n.p} k={n.km} from={p} />)}</ul> : <p className="text-sm text-muted">לא נמצאו חניוני לינה מסומנים במאגר בטווח הזה.</p>}</section>
      <section className="rounded-xl2 border border-line bg-surface p-4 text-sm"><h2 className="mb-1 font-bold">ציוד מומלץ לאזור</h2><p>{REGION_BY_ID[p.r].climateNote} רשימת ציוד מלאה לפי התחזית והמשתתפים נבנית בתוכנית הטיול.</p></section>
    </>
  );
}

/** Recommendations: the fit of this place for the next trip, and the best-fitting places around it. */
function Recs({ db, p }: { db: PlaceDb; p: Place }) {
  const trips = useStore(s => s.trips);
  const t = nextTrip(trips);
  const fc = useForecast(p.lat, p.lon);
  const al = useAlertCtx();
  const ctx = useMemo(() => t ? { ...fitContextFor(t, fc.data?.days ?? [], availability(t.start, t.end), tripPoint(t)), ...al } : null, [t, fc.data, al]);
  const fit = ctx ? fitScore(p, ctx) : null;
  const alts = useMemo(() => ctx ? nearby(db, p, 20, undefined, p.id).map(n => ({ n, f: fitScore(n.p, { ...ctx, base: { lat: p.lat, lon: p.lon, label: p.he } }) })).filter(x => x.f.score != null).sort((a, b) => b.f.score! - a.f.score!).slice(0, 5) : [], [ctx, db, p]);
  return (
    <>
      {!t ? <p className="rounded-xl2 border border-line bg-surface p-4 text-sm">ההתאמה מחושבת מול טיול מתוכנן (מי מגיע, תאריכים, מה אוהבים). <a className="font-bold text-moss" href={href('/new')}>לתכנן טיול</a></p> : <FitCard fit={fit!} t={t} />}
      {alts.length > 0 && <section className="space-y-2"><h2 className="font-bold">מה עוד מתאים לשלב באותו יום (עד 20 ק״מ)</h2>
        <ul className="space-y-2">{alts.map(({ n, f }) => <li key={n.p.id} className="rounded-xl2 border border-line bg-surface p-3"><a className="flex items-center justify-between gap-2 font-bold" href={href(`/place/${encodeURIComponent(n.p.id)}`)}><span className="min-w-0 truncate">{n.p.he}</span><span className="num shrink-0 rounded-full bg-raised px-2 text-sm">{f.score}/100</span></a><p className="text-xs text-muted">{CAT_HE[n.p.c[0]]} · <span className="num">{km1(n.km)}</span> ק״מ בקו אווירי · {f.summary}</p></li>)}</ul></section>}
      <Ask db={db} p={p} />
    </>
  );
}

export function FitCard({ fit, t }: { fit: Fit; t: Trip }) {
  return (
    <section className="space-y-2 rounded-xl2 border border-line bg-surface p-4" aria-label="התאמה לטיול">
      <div className="flex items-center justify-between gap-2"><h2 className="font-bold">התאמה ל{t.name || 'הטיול הקרוב'}</h2>{fit.score != null ? <span className="num rounded-full bg-forest px-3 py-1 font-extrabold text-onforest">{fit.score}/100</span> : <Badge tone="danger">לא מומלץ בתנאים</Badge>}</div>
      {fit.excluded ? <p className="font-bold text-danger">{fit.excluded}</p> : <p className="text-sm"><span className="font-bold">למה? </span>{fit.summary}</p>}
      {fit.parts.length > 0 && <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-moss">איך חושב הציון</summary>
        <table className="w-full text-sm"><tbody>{fit.parts.map(x => <tr key={x.id} className="border-t border-line"><td className="py-1.5 pe-2 font-bold">{x.label}</td><td className="num py-1.5 pe-2 whitespace-nowrap">{x.pts}/{x.max}</td><td className="py-1.5 text-muted">{x.why}</td></tr>)}</tbody></table>
        <p className="mt-1 text-xs text-muted">הציון הוא התאמה לטיול שלכם, לא ציון בטיחות. נוסחה קבועה ומתועדת — בלי AI.</p></details>}
    </section>
  );
}

/** "Ask CampIL": fixed questions answered from the data on this page — no language model, every answer cites its source. */
function Ask({ db, p }: { db: PlaceDb; p: Place }) {
  const [q, setQ] = useState<string | null>(null);
  const near = (cats: PlaceCat[], k = 10) => nearby(db, p, k, cats, p.id).slice(0, 3);
  const list = (xs: { p: Place; km: number }[]) => xs.length ? xs.map(x => `${x.p.he} (${km1(x.km)} ק״מ)`).join(', ') : null;
  const QS: [string, () => { a: string; src: string }][] = [
    ['מה מיוחד במקום?', () => ({ a: p.wiki ? 'התיאור המלא בלשונית "סקירה", מתוך ויקיפדיה.' : 'אין לנו תיאור ממקור מוכר — רק שם, סוג ומיקום.', src: p.wiki ? 'ויקיפדיה' : '—' })],
    ['יש מקום לפיקניק?', () => { const x = list(near(['picnic'], 5)); return { a: (p.fac?.bbq || p.c.includes('picnic') ? 'במקום עצמו מסומן אזור פיקניק / מנגל. ' : '') + (x ? `חניוני יום מסומנים בקרבת מקום: ${x}.` : 'לא נמצאו חניוני יום מסומנים עד 5 ק״מ.'), src: 'OpenStreetMap' }; }],
    ['יש חניון לילה באזור?', () => { const x = list(near(SLEEP, 20)); return { a: x ? `חניוני לינה מסומנים: ${x}. הזמנה ומחירים — באתר המפעיל.` : 'לא נמצאו חניוני לינה מסומנים עד 20 ק״מ.', src: 'OpenStreetMap / Wikidata' }; }],
    ['מה אפשר לעשות עם ילדים?', () => { const x = list(near(['park', 'attraction', 'zoo', 'visitor_center', 'botanical', 'beach'], 15)); return { a: x ? `מקומות מהסוגים שמתאימים בדרך כלל למשפחות: ${x}. התאמה בפועל (אורך, קושי) — לבדוק.` : 'לא מצאנו אטרקציות משפחתיות מסומנות עד 15 ק״מ.', src: 'Wikidata / OpenStreetMap' }; }],
    ['מה לעשות אם צפוי גשם?', () => { const x = list(near(['visitor_center', 'castle', 'archaeological', 'attraction'], 20)); return { a: `לא להיכנס לנחלים, מפלים ומערות ביום גשם — סכנת שיטפון. ${x ? `חלופות לבדוק (לא בערוצי נחלים): ${x}.` : ''} לבדוק את התרעות השירות המטאורולוגי.`, src: 'כללי בטיחות + המאגר' }; }],
    ['מה כדאי לקחת?', () => ({ a: `${REGION_BY_ID[p.r].climateNote} מים, כובע וקרם הגנה תמיד. רשימה מלאה לפי התחזית נבנית בתוכנית הטיול.`, src: 'מאפייני האזור' })],
  ];
  const ans = q ? QS.find(x => x[0] === q)![1]() : null;
  return (
    <section className="space-y-2 rounded-xl2 border border-line bg-surface p-4" aria-label="שאלו את CampIL">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-bold"><Sparkles size={17} className="text-sunset" />שאלו את CampIL</h2><span className="rounded-full bg-raised px-2.5 py-1 text-xs font-bold text-muted">מבוסס כללים — בלי AI</span></div>
      <div className="flex flex-wrap gap-2">{QS.map(([l]) => <Chip key={l} active={q === l} onClick={() => setQ(l)}>{l}</Chip>)}</div>
      {ans && <div role="status" className="rounded-xl bg-raised/60 p-3"><p>{ans.a}</p><p className="mt-1 text-xs text-muted">מקור: {ans.src}</p></div>}
    </section>
  );
}

function Sources({ p, db }: { p: Place; db: PlaceDb }) {
  return (
    <footer className="space-y-1 border-t border-line pt-3 text-xs text-muted">
      <p className="font-bold">מקורות</p>
      <p className="flex flex-wrap gap-x-3 gap-y-1">{p.qid && <a className="underline" href={wikidataUrl(p.qid)} target="_blank" rel="noreferrer">Wikidata {p.qid}</a>}{p.osm && <a className="underline" href={osmUrl(p.osm)} target="_blank" rel="noreferrer">OpenStreetMap</a>}{p.wiki && <a className="underline" href={wikiUrl(p.wiki)} target="_blank" rel="noreferrer">ויקיפדיה</a>}{p.site && <span>קטלוג CampIL</span>}</p>
      <p>{db.attribution}. עודכן: Wikidata {db.sources.wikidata?.slice(0, 10) ?? '—'}{db.sources.osm ? `, OSM ${db.sources.osm.slice(0, 10)}` : ''}.</p>
    </footer>
  );
}

function AddToTrip({ p, trips, onClose }: { p: Place; trips: Trip[]; onClose: () => void }) {
  const updateTrip = useStore(s => s.updateTrip);
  const open = trips.filter(t => t.status === 'planning' && !t.example);
  const add = (t: Trip) => {
    if (p.site && !t.siteIds.includes(p.site)) updateTrip(t.id, { siteIds: [...t.siteIds, p.site] });
    else if (!p.site && !(t.places ?? []).some(x => x.id === p.id)) {
      const tp: TripPlace = { id: p.id, name: p.he, lat: p.lat, lon: p.lon, label: CAT_HE[p.c[0]], source: p.src.includes('wd') ? 'wd' : 'osm', url: p.qid ? wikidataUrl(p.qid) : osmUrl(p.osm!), website: p.web, addedAt: new Date().toISOString() };
      updateTrip(t.id, { places: [...(t.places ?? []), tp] });
    }
    toast(`נוסף ל${t.name || 'טיול'}`); onClose();
  };
  return (
    <Sheet open onClose={onClose} title={`הוספת ${p.he} לטיול`}>
      {open.length ? <ul className="space-y-2">{open.map(t => <li key={t.id}><button type="button" onClick={() => add(t)} className="flex min-h-12 w-full items-center justify-between rounded-xl2 border border-line p-3 text-start hover:border-moss"><span className="font-bold">{t.name || REGION_BY_ID[t.regionId ?? 'center']?.name || 'טיול'}</span><span className="text-sm text-muted">{t.start}</span></button></li>)}</ul>
        : <div className="space-y-2"><p>אין טיול בתכנון.</p><Button onClick={() => go('/new')}>לתכנן טיול חדש</Button></div>}
      <p className="mt-3 text-xs text-muted">התוכנית לא משתנה בלי אישורכם — המקום נוסף לרשימת המקומות, ואפשר להסיר אותו בעריכת הטיול.</p>
    </Sheet>
  );
}
