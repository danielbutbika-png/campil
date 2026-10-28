import { useMemo, useState } from 'react';
import { X, Heart, Tent, List, Map as MapI, CloudSun, Fuel, Search } from 'lucide-react';
import { IsraelMap } from '../components/IsraelMap';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { SITES, sitesIn, SITE_TYPE_LABEL } from '../data/sites';
import regionsGeo from '../data/regions.geo.json';
import { useStore, tasteOf } from '../lib/store';
import { useForecast } from '../lib/hooks';
import { rank } from '../engine/scoring';
import { flagsFor } from '../engine/weatherRules';
import { fetchOsm, type OsmPlace } from '../services/osm';
import { fuelInBox, filterBrands, type FuelStation } from '../services/fuel';
import { FuelBrandChips } from '../components/RouteFuel';
import { todayISO } from '../lib/util';
import { Scene } from '../components/Scene';
import { DayStrip, SourceLine } from '../components/Weather';
import { SiteCard, useSiteSheet } from '../components/SiteCard';
import { Button, Chip, Badge, cx } from '../components/ui';
import { go } from '../lib/router';
import type { RegionId, Site } from '../lib/types';

type F = 'all' | Site['type'] | 'fav';

export default function MapScreen({ region }: { region?: RegionId }) {
  const st = useStore();
  const sel = region && REGION_BY_ID[region] ? region : null;
  const [filter, setFilter] = useState<F>('all');
  const [osm, setOsm] = useState<{ loading?: boolean; err?: string; data: OsmPlace[] }>({ data: [] });
  const [mobileList, setMobileList] = useState(false);
  const sheet = useSiteSheet();
  const r = sel ? REGION_BY_ID[sel] : null;
  const fc = useForecast(r?.lat, r?.lon);
  const flags = fc.data ? flagsFor(fc.data.days.slice(0, 3)) : null;
  const pool = (sel ? sitesIn(sel) : SITES).filter(s => filter === 'all' || (filter === 'fav' ? st.favorites.includes(s.id) : s.type === filter));
  const ranked = useMemo(() => rank(pool, { start: todayISO(), regionId: sel, interests: ['family'], children: st.members.filter(m => m.role === 'child').length, childAges: st.members.filter(m => m.role === 'child').map(m => m.age ?? 8) }, flags, st.settings, tasteOf(st)), [pool.length, sel, filter, flags]);
  const loadOsm = async () => {
    if (!sel) return; const f = (regionsGeo as any).features.find((x: any) => x.properties.id === sel);
    setOsm({ loading: true, data: [] });
    try { setOsm({ data: await fetchOsm(f.properties.bbox) }); } catch (e: any) { setOsm({ err: e.message, data: [] }); }
  };
  const [fuel, setFuel] = useState<{ loading?: boolean; err?: string; all?: FuelStation[] }>({});
  const shownFuel = useMemo(() => filterBrands(fuel.all ?? [], st.settings.fuelBrands ?? []), [fuel.all, st.settings.fuelBrands]);
  const loadFuel = async () => {
    if (!sel) return; const f = (regionsGeo as any).features.find((x: any) => x.properties.id === sel);
    setFuel({ loading: true });
    try { setFuel({ all: await fuelInBox(f.properties.bbox) }); } catch (e: any) { setFuel({ err: e.message }); }
  };
  const select = (id: RegionId) => { setOsm({ data: [] }); setFuel({}); go(`/map/${id}`); };

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[1fr_440px]">
      <div className={cx('relative h-[58dvh] lg:h-full', mobileList && 'hidden lg:block')}>
        <IsraelMap selected={sel} onSelect={select} sites={pool} osm={osm.data} fuel={shownFuel} onSite={s => sheet.open(s)} className="h-full w-full" />
        <div className="absolute right-3 top-3 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-2">
          <select aria-label="בחירת אזור מרשימה" className="field w-auto bg-surface/95 py-2 text-sm font-bold shadow-card" value={sel ?? ''} onChange={e => e.target.value ? select(e.target.value as RegionId) : go('/map')}>
            <option value="">כל הארץ — בחרו אזור</option>{REGIONS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
      </div>
      <aside className="space-y-5 border-line bg-bg pb-10 lg:overflow-y-auto lg:border-r">
        <div className="gutter flex items-center gap-2 pt-4 lg:hidden">
          <Button size="sm" variant="soft" icon={mobileList ? <MapI size={16} /> : <List size={16} />} onClick={() => setMobileList(!mobileList)}>{mobileList ? 'הצגת מפה' : 'מסך מלא לרשימה'}</Button>
          <Button size="sm" variant="soft" icon={<Tent size={16} />} onClick={() => go('/camps')}>חיפוש קמפינג</Button>
          <Button size="sm" variant="soft" icon={<Search size={16} />} onClick={() => go('/explore')}>חיפוש מקומות</Button>
        </div>
        {r ? (
          <div className="space-y-4">
            <div className="relative h-36 overflow-hidden"><Scene kind={r.scene} seed={r.name.length} className="h-full w-full" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="gutter absolute inset-x-0 bottom-0 pb-3 text-white"><h1 className="font-display text-2xl">{r.name}</h1><p className="text-sm text-white/85">{r.highlights.join(' · ')}</p></div>
              <button onClick={() => go('/map')} aria-label="ניקוי בחירת האזור" className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white"><X size={18} /></button>
            </div>
            <div className="gutter space-y-3">
              <p>{r.desc}</p>
              <p className="text-sm"><span className="font-bold">אקלים: </span>{r.climateNote}</p>
              <div className="space-y-2"><h2 className="flex items-center gap-2 font-bold"><CloudSun size={18} className="text-moss" />תחזית לאזור</h2>
                {fc.data ? <><DayStrip days={fc.data.days.slice(0, 7)} compact /><SourceLine f={fc.data} /></> : fc.isError ? <p className="text-sm text-muted">התחזית לא זמינה כרגע.</p> : <div className="h-28 animate-pulse rounded-xl bg-raised" />}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="accent" onClick={() => go('/new')}>מתכננים טיול לכאן</Button>
                <Button size="sm" variant="soft" icon={<Tent size={15} />} onClick={() => go(`/camps?near=${r.lat},${r.lon},${encodeURIComponent(r.name)}`)}>חיפוש מקום לינה באזור</Button>
                <Button size="sm" variant="soft" icon={<Tent size={15} />} disabled={osm.loading} onClick={loadOsm}>{osm.loading ? 'טוען…' : osm.data.length ? `${osm.data.length} חניונים מ-OSM על המפה` : 'חניונים מ-OpenStreetMap'}</Button>
              </div>
              <div className="space-y-2 rounded-xl2 border border-line bg-surface p-3">
                <div className="flex flex-wrap items-center gap-2"><Fuel size={17} className="text-moss" /><span className="font-bold">תחנות דלק באזור</span>
                  <Button size="sm" variant="soft" className="ms-auto" disabled={fuel.loading} onClick={loadFuel}>{fuel.loading ? 'טוען…' : fuel.all ? `${shownFuel.length} תחנות על המפה` : 'הצגה על המפה'}</Button></div>
                <FuelBrandChips value={st.settings.fuelBrands ?? []} onChange={v => st.setSettings({ fuelBrands: v })} />
                {fuel.err && <p className="text-sm text-danger">{fuel.err}</p>}
                {fuel.all && <p className="text-xs text-muted">לחיצה על תחנה במפה פותחת ניווט ב-Waze, Google Maps או Apple Maps. © תורמי OpenStreetMap.</p>}
              </div>
              {osm.err && <p className="text-sm text-danger">{osm.err}</p>}
              {osm.data.length > 0 && <p className="text-xs text-muted">נקודות כתומות: חניוני לילה ויום ממופים ב-OpenStreetMap (© תורמי OSM). המתקנים לא אומתו.</p>}
            </div>
          </div>
        ) : (
          <div className="gutter space-y-2 pt-5"><h1 className="font-display text-2xl">מפת הטיולים</h1><p className="text-muted">לחצו על אזור במפה או בחרו מהרשימה כדי לראות תחזית, מסלולים, חניונים ואטרקציות.</p>
            <div className="flex flex-wrap gap-2 pt-1">{REGIONS.map(x => <Chip key={x.id} onClick={() => select(x.id)}>{x.short}</Chip>)}</div></div>
        )}
        <div className="gutter space-y-3">
          <h2 className="font-bold">{r ? `מקומות ב${r.short}` : 'מקומות בכל הארץ'}</h2>
          <div className="scroll-x -mx-4 flex gap-2 px-4">
            {(['all', 'trail', 'campsite', 'attraction', 'beach', 'viewpoint', 'park'] as F[]).map(f => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'הכול' : SITE_TYPE_LABEL[f as Site['type']]}</Chip>)}
            <Chip active={filter === 'fav'} onClick={() => setFilter('fav')}><Heart size={14} />מועדפים</Chip>
          </div>
          <p className="text-sm text-muted">{ranked.length} מקומות{flags?.known ? ' · הדירוג משקלל את תחזית 3 הימים הקרובים' : ''}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{ranked.map(s => <SiteCard key={s.site.id} site={s.site} scored={s} onOpen={() => sheet.open(s.site)} />)}</div>
          {!ranked.length && <p className="py-6 text-center text-muted">{filter === 'fav' ? 'עוד לא שמרתם מקומות במועדפים.' : 'אין מקומות בסינון הזה.'}</p>}
          <Badge>הקטלוג הוא נקודת פתיחה — יש לאמת פרטים באתר המפעיל</Badge>
        </div>
      </aside>
      {sheet.el}
    </div>
  );
}
