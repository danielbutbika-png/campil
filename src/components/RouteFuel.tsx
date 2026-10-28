import { useMemo, useState, lazy, Suspense } from 'react';
import { Fuel, Route as RouteI, Navigation, Settings2, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { BRANDS, BRAND_BY_ID, fetchRoute, fuelAlongRoute, filterBrands, navApps, type BrandId, type FuelStation, type Route } from '../services/fuel';
import { Button, Chip, Badge, cx } from './ui';
import { href } from '../lib/router';

const IsraelMap = lazy(() => import('./IsraelMap').then(m => ({ default: m.IsraelMap })));

export function FuelBrandChips({ value, onChange }: { value: BrandId[]; onChange: (v: BrandId[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="חברות דלק">
      <Chip active={!value.length} onClick={() => onChange([])}>כל החברות</Chip>
      {BRANDS.map(b => (
        <Chip key={b.id} active={value.includes(b.id)} onClick={() => onChange(value.includes(b.id) ? value.filter(x => x !== b.id) : [...value, b.id])}>
          <span className="h-3 w-3 rounded-full border border-black/20" style={{ background: b.color }} />{b.name}
        </Chip>
      ))}
    </div>
  );
}

export function NavButtons({ lat, lon, small }: { lat: number; lon: number; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {navApps(lat, lon).map(a => <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className={cx('inline-flex items-center gap-1 rounded-full bg-raised font-bold hover:bg-sand', small ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm')}><Navigation size={small ? 12 : 14} />{a.name}</a>)}
    </div>
  );
}

/** Route from the home point to the trip destination, with fuel stations along it (filtered by preferred brands). */
export function RouteFuel({ dest }: { dest: { lat: number; lon: number; label: string } }) {
  const { settings, setSettings } = useStore();
  const home = settings.home;
  const [state, setState] = useState<{ loading?: boolean; err?: string; route?: Route; all?: FuelStation[] }>({});
  const brands = settings.fuelBrands ?? [];
  const list = useMemo(() => filterBrands(state.all ?? [], brands), [state.all, brands]);
  const load = async () => {
    if (!home) return;
    setState({ loading: true });
    try { const route = await fetchRoute(home, dest); setState({ route, loading: true }); const all = await fuelAlongRoute(route, settings.fuelBufferKm || 2); setState({ route, all }); }
    catch (e: any) { setState(s => ({ ...s, loading: false, err: e.message })); }
  };
  if (!home) return <p className="flex flex-wrap items-center gap-2 text-muted">כדי לחשב מסלול ותחנות דלק בדרך צריך נקודת יציאה. <a className="font-bold text-moss" href={href('/settings')}>הגדרת נקודת יציאה</a></p>;
  const r = state.route;
  const bbox = r ? (() => { const xs = r.coords.map(c => c[0]), ys = r.coords.map(c => c[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as [number, number, number, number]; })() : null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{home.label} ← {dest.label}</span>
        {!state.all && <Button size="sm" icon={state.loading ? <Loader2 size={16} className="animate-spin" /> : <Fuel size={16} />} disabled={state.loading} onClick={load}>{state.loading ? 'מחשב מסלול ותחנות…' : 'מסלול ותחנות דלק בדרך'}</Button>}
        <NavButtons lat={dest.lat} lon={dest.lon} small />
      </div>
      <FuelBrandChips value={brands} onChange={v => setSettings({ fuelBrands: v })} />
      {state.err && <p className="text-sm text-danger">{state.err}</p>}
      {r && (
        <>
          <p className="num flex flex-wrap items-center gap-2 text-sm font-semibold"><RouteI size={16} className="text-sunset" />
            {r.source === 'osrm' ? <>כ-{Math.round(r.km)} ק״מ נסיעה{r.minutes ? ` · כ-${Math.floor(r.minutes / 60) ? `${Math.floor(r.minutes / 60)} ש׳ ` : ''}${r.minutes % 60} דק׳ ללא עומסים` : ''}</> : <>המסלול המדויק לא זמין — מוצג קו אווירי ({Math.round(r.km)} ק״מ)</>}
          </p>
          <Suspense fallback={<div className="h-72 rounded-xl2 bg-raised" />}>
            <IsraelMap route={r.coords} fuel={list} fitTo={bbox} className="h-72 overflow-hidden rounded-xl2 border border-line md:h-96" interactive={false} />
          </Suspense>
          {state.all && (list.length ? (
            <ol className="grid gap-2 md:grid-cols-2">
              {list.slice(0, 30).map(f => (
                <li key={f.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-black/20" style={{ background: BRAND_BY_ID[f.brand].color }} aria-hidden />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-bold">{f.name}</p>
                    <p className="num text-xs text-muted">{BRAND_BY_ID[f.brand].name} · ק״מ {Math.round(f.alongKm ?? 0)} במסלול{f.offKm != null && f.offKm > 0.5 ? ` · ${f.offKm.toFixed(1)} ק״מ מהדרך` : ''}{f.open24 ? ' · 24/7 לפי OSM' : ''}</p>
                    <NavButtons lat={f.lat} lon={f.lon} small />
                  </div>
                </li>
              ))}
            </ol>) : <p className="text-muted">לא נמצאו תחנות של החברות שנבחרו לאורך המסלול.</p>)}
          <p className="text-xs text-muted">מסלול: OSRM (נתוני OpenStreetMap). תחנות: © תורמי OpenStreetMap, ברדיוס {settings.fuelBufferKm || 2} ק״מ מהדרך. שעות פתיחה ומחירים — לבדוק באפליקציית הניווט.</p>
          <a href={href('/settings')} className="inline-flex items-center gap-1 text-sm font-bold text-moss"><Settings2 size={14} />העדפות תדלוק</a>
        </>
      )}
      {!r && <Badge>{brands.length ? `מסונן: ${brands.map(b => BRAND_BY_ID[b].name).join(', ')}` : 'כל חברות הדלק'}</Badge>}
    </div>
  );
}
