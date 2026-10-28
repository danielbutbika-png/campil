// Route from a GPX file (hiking apps, trail sites): import, show on the map with distance and climb, export the trip.
import { lazy, Suspense, useRef } from 'react';
import { Route as RouteI, Upload, Download, Trash2 } from 'lucide-react';
import type { Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { parseGpx, toGpx } from '../engine/gpx';
import { SITE_BY_ID } from '../data/sites';
import { download } from '../lib/share';
import { Prov } from './Provenance';
import { Button, toast } from './ui';

const IsraelMap = lazy(() => import('./IsraelMap').then(m => ({ default: m.IsraelMap })));

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
  const places = t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean).map(s => ({ name: s.name, lat: s.lat, lon: s.lon }));
  const exportGpx = () => { download(`CampIL-${t.start}.gpx`, toGpx(t.name, places, g), 'application/gpx+xml'); toast('קובץ GPX נשמר — אפשר לפתוח באפליקציית ניווט'); };
  const coords = g?.points.map(p => [p.lon, p.lat] as [number, number]) ?? [];
  const bbox = coords.length ? [Math.min(...coords.map(c => c[0])), Math.min(...coords.map(c => c[1])), Math.max(...coords.map(c => c[0])), Math.max(...coords.map(c => c[1]))] as [number, number, number, number] : null;
  return (
    <section aria-labelledby="gpx-h" className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <h2 id="gpx-h" className="flex items-center gap-2 font-bold"><RouteI size={18} className="text-moss" />מסלול (GPX)</h2>
      {g ? <>
        <p className="num"><b>{g.name}</b> · {g.km} ק״מ{g.gain != null ? ` · עלייה מצטברת ${g.gain} מ׳ · ירידה ${g.loss} מ׳` : ''}{g.waypoints.length ? ` · ${g.waypoints.length} נקודות` : ''}</p>
        <Prov kind="auto" source={`מחושב מהקובץ ${g.source}${g.gain == null ? ' (בקובץ אין נתוני גובה)' : ''}`} />
        {bbox && <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-raised" />}><IsraelMap route={coords} fitTo={bbox} className="h-64 overflow-hidden rounded-xl border border-line" interactive={false} /></Suspense>}
        <p className="text-xs text-muted">המסלול מהקובץ לא נבדק מול השטח — ודאו שהוא מסומן, פתוח ומתאים לכם. ניווט באפליקציה אינו תחליף לבדיקת המסלול.</p>
      </> : <p className="text-sm text-muted">טענו קובץ GPX של המסלול (מאפליקציית ניווט או מאתר מסלולים) — נציג אותו על המפה עם אורך וטיפוס, ונשמור אותו גם לשימוש בלי קליטה.</p>}
      <div className="flex flex-wrap gap-2">
        <input ref={file} type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" className="sr-only" aria-label="קובץ GPX" onChange={e => load(e.target.files?.[0])} />
        <Button size="sm" variant="soft" icon={<Upload size={15} />} onClick={() => file.current?.click()}>{g ? 'החלפת מסלול' : 'טעינת קובץ GPX'}</Button>
        {(g || places.length > 0) && <Button size="sm" variant="soft" icon={<Download size={15} />} onClick={exportGpx}>יצוא GPX</Button>}
        {g && <Button size="sm" variant="ghost" icon={<Trash2 size={15} />} onClick={() => updateTrip(t.id, { gpx: null })}>הסרה</Button>}
      </div>
    </section>
  );
}
