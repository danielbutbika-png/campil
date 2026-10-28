import { useMemo, useState, lazy, Suspense, useEffect } from 'react';
import { Search, LocateFixed, Home as HomeI, Tent, Loader2, ExternalLink, Plus, MapPin, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { useGeolocation } from '../lib/hooks';
import { REGIONS } from '../data/regions';
import { searchCamps, applyFacilities, type CampResult, type Center, type Facility } from '../services/camps';
import { NavButtons } from '../components/RouteFuel';
import { useSiteSheet } from '../components/SiteCard';
import { Button, Chip, Badge, Sheet, Toggle, Empty, toast } from '../components/ui';
import { fmtRange, todayISO, uid } from '../lib/util';
import { go } from '../lib/router';
import { Prov } from '../components/Provenance';

const IsraelMap = lazy(() => import('../components/IsraelMap').then(m => ({ default: m.IsraelMap })));
const FAC: [Facility, string][] = [['toilets', 'שירותים'], ['water', 'מי שתייה'], ['shower', 'מקלחות'], ['free', 'ללא תשלום']];
const tri = (v?: boolean) => (v === true ? 'כן' : v === false ? 'לא' : 'לא ידוע');

export default function CampSearch({ query }: { query: URLSearchParams }) {
  const { settings } = useStore();
  const geo = useGeolocation();
  const sheet = useSiteSheet();
  const [q, setQ] = useState(query.get('q') ?? '');
  const [radius, setRadius] = useState(25);
  const [day, setDay] = useState(false);
  const [fac, setFac] = useState<Facility[]>([]);
  const [st, setSt] = useState<{ loading?: boolean; center?: Center | null; results?: CampResult[]; err?: string; note?: string }>({});
  const [addTo, setAddTo] = useState<CampResult | null>(null);
  const shown = useMemo(() => applyFacilities(st.results ?? [], fac), [st.results, fac]);

  const run = async (o: { query?: string; center?: Center | null }) => {
    if (!o.query?.trim() && !o.center) return toast('כתבו שם מקום או בחרו "ליד המיקום שלי"');
    setSt({ loading: true });
    try {
      const r = await searchCamps({ query: o.query, center: o.center, radiusKm: radius, includeDay: day });
      if (!r.center && !r.results.length) setSt({ err: `לא מצאנו מקום בשם "${o.query}". נסו שם יישוב, שמורה או אזור.` });
      else setSt({ center: r.center, results: r.results, note: r.osmError });
    } catch (e: any) { setSt({ err: e.message || 'החיפוש נכשל' }); }
  };
  useEffect(() => { const n = query.get('near'); if (n) { const [lat, lon, ...l] = n.split(','); run({ center: { lat: +lat, lon: +lon, label: l.join(',') || 'היעד' } }); } }, []);

  const pts = shown.map(r => ({ id: r.id, name: r.name, lat: r.lat, lon: r.lon, kind: 'camp_site', label: r.kind, url: r.url ?? '' })) as any[];
  const bbox = shown.length ? [Math.min(...shown.map(r => r.lon)) - .03, Math.min(...shown.map(r => r.lat)) - .03, Math.max(...shown.map(r => r.lon)) + .03, Math.max(...shown.map(r => r.lat)) + .03] as [number, number, number, number] : null;

  return (
    <div className="gutter mx-auto max-w-6xl space-y-5 py-6">
      <header className="space-y-1"><h1 className="font-display text-3xl">חיפוש מקום לקמפינג</h1><p className="text-muted">חניוני לילה, חניוני קרוואנים ואתרי לינה — לפי שם, אזור או מיקום, עם ניווט ישיר.</p></header>
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); run({ query: q }); }}>
        <div className="relative min-w-[14rem] flex-1"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" /><input aria-label="מקום לחיפוש" className="field pr-9" placeholder="למשל: מצפה רמון, כנרת, עין גדי, חניון…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <Button type="submit" disabled={st.loading} icon={st.loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}>חיפוש</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="soft" icon={<LocateFixed size={15} />} disabled={geo.loading} onClick={async () => { const p = await geo.request(); if (p) run({ center: { ...p, label: 'המיקום שלי' } }); }}>{geo.loading ? 'מאתר…' : 'ליד המיקום שלי'}</Button>
        {settings.home && <Button size="sm" variant="soft" icon={<HomeI size={15} />} onClick={() => run({ center: settings.home! })}>ליד {settings.home.label}</Button>}
        <select aria-label="רדיוס חיפוש" className="field w-auto py-1.5 text-sm" value={radius} onChange={e => setRadius(+e.target.value)}>{[10, 25, 50, 100].map(k => <option key={k} value={k}>עד {k} ק״מ</option>)}</select>
      </div>
      {geo.error && <p className="text-sm text-danger">{geo.error}</p>}
      <div className="scroll-x -mx-4 flex gap-2 px-4">{REGIONS.map(r => <Chip key={r.id} onClick={() => { setQ(r.name); run({ center: { lat: r.lat, lon: r.lon, label: r.name } }); }}>{r.short}</Chip>)}</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="מתקנים">{FAC.map(([k, l]) => <Chip key={k} active={fac.includes(k)} onClick={() => setFac(fac.includes(k) ? fac.filter(x => x !== k) : [...fac, k])}>{l}</Chip>)}</div>
        <div className="sm:w-64"><Toggle checked={day} onChange={setDay} label="כולל חניוני יום" /></div>
      </div>
      {fac.length > 0 && <p className="text-xs text-muted">סינון מתקנים מציג רק מקומות שהמתקן מסומן בהם במפה. מקומות שלא סומנו לא יופיעו.</p>}

      {st.err && <p className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm">{st.err}</p>}
      {st.note && <p className="text-sm text-warn">{st.note}</p>}
      {st.results && (
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <Suspense fallback={<div className="h-80 rounded-xl2 bg-raised" />}>
            <IsraelMap osm={pts} fitTo={bbox} className="h-80 overflow-hidden rounded-xl2 border border-line lg:sticky lg:top-4 lg:h-[70dvh]" />
          </Suspense>
          <div className="space-y-3">
            <p className="num text-sm font-semibold text-muted">{shown.length} מקומות{st.center ? ` ליד ${st.center.label}` : ''}</p>
            {!shown.length && <Empty icon={<Tent size={32} />} title="לא נמצאו מקומות" body="נסו רדיוס גדול יותר, הסירו סינון מתקנים או חפשו שם אחר." />}
            {shown.map(r => (
              <article key={r.id} className="space-y-2 rounded-xl2 border border-line bg-surface p-4 shadow-card">
                <div className="flex items-start gap-2">
                  <Tent size={18} className="mt-1 shrink-0 text-moss" />
                  <div className="min-w-0 flex-1"><h2 className="font-bold">{r.name}</h2><p className="num text-xs text-muted">{r.kind}{r.km != null ? ` · ${r.km.toFixed(1)} ק״מ` : ''}{r.operator ? ` · ${r.operator}` : ''}</p></div>
                  {r.source === 'catalog' ? <Prov kind="unknown" source="קטלוג CampIL" /> : <Prov kind="community" />}
                </div>
                {r.source === 'osm' && <div className="flex flex-wrap gap-1 text-xs">{([['שירותים', r.toilets], ['מי שתייה', r.water], ['מקלחות', r.shower]] as [string, boolean | undefined][]).map(([k, v]) => <Badge key={k} tone={v ? 'ok' : 'muted'}>{k}: {tri(v)}</Badge>)}<Badge tone={r.fee === false ? 'ok' : 'muted'}>תשלום: {tri(r.fee)}</Badge></div>}
                {r.site && <p className="text-sm">{r.site.desc}</p>}
                <NavButtons lat={r.lat} lon={r.lon} small />
                <div className="flex flex-wrap gap-3 pt-1 text-sm font-bold">
                  <button className="flex items-center gap-1 text-moss" onClick={() => setAddTo(r)}><Plus size={15} />הוספה לטיול</button>
                  {r.site && <button className="flex items-center gap-1 text-moss" onClick={() => sheet.open(r.site!)}><MapPin size={15} />פרטים</button>}
                  {r.website && <a className="flex items-center gap-1 text-moss" href={r.website} target="_blank" rel="noreferrer"><ExternalLink size={14} />אתר</a>}
                  {r.url && <a className="flex items-center gap-1 text-muted" href={r.url} target="_blank" rel="noreferrer"><ExternalLink size={14} />OSM</a>}
                </div>
              </article>
            ))}
            <p className="text-xs text-muted">מקורות: קטלוג CampIL ו-© תורמי OpenStreetMap; איתור מקומות: Nominatim. מתקנים, תשלום והזמנה — לאמת מול המפעיל לפני ההגעה.</p>
          </div>
        </div>
      )}
      {!st.results && !st.loading && !st.err && <Empty icon={<Tent size={36} />} title="איפה לנים הלילה?" body="חפשו שם מקום, בחרו אזור או לחצו על ״ליד המיקום שלי״." />}
      {addTo && <AddToTrip r={addTo} onClose={() => setAddTo(null)} />}
      {sheet.el}
    </div>
  );
}

function AddToTrip({ r, onClose }: { r: CampResult; onClose: () => void }) {
  const { trips, updateTrip } = useStore();
  const open = trips.filter(t => t.status === 'planning' && t.end >= todayISO()).sort((a, b) => a.start.localeCompare(b.start));
  const add = (id: string) => {
    updateTrip(id, t => ({
      dest: { lat: r.lat, lon: r.lon, label: r.name }, campsiteName: r.name,
      siteIds: r.site && !t.siteIds.includes(r.site.id) ? [...t.siteIds, r.site.id] : t.siteIds,
      tasks: [...t.tasks, { id: uid('t'), when: 'שבוע לפני', text: `לבדוק זמינות והזמנה: ${r.name}`, done: false, dueOffsetDays: -7 }],
    }));
    onClose(); toast('נקבע כמקום הלינה — התחזית והמסלול חושבו לפיו'); go(`/trip/${id}`);
  };
  return (
    <Sheet open onClose={onClose} title={`הוספת ${r.name} לטיול`}>
      {open.length ? (
        <ul className="space-y-2">{open.map(t => (
          <li key={t.id}><button onClick={() => add(t.id)} className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-right hover:border-moss">
            <span className="flex-1"><span className="block font-bold">{t.name}</span><span className="text-sm text-muted">{fmtRange(t.start, t.end)}{t.campsiteName ? ` · כרגע: ${t.campsiteName}` : ''}</span></span>
            {t.campsiteName === r.name ? <Check className="text-ok" /> : <Plus className="text-moss" />}
          </button></li>))}</ul>
      ) : <div className="space-y-3"><p>אין טיול בתכנון.</p><Button onClick={() => go('/new')}>טיול חדש</Button></div>}
      <p className="mt-3 text-xs text-muted">המקום יוגדר כנקודת הלינה של הטיול: התחזית, המלצות ההכנה והמסלול לתדלוק יחושבו לפיו, ותתווסף משימת הזמנה.</p>
    </Sheet>
  );
}
