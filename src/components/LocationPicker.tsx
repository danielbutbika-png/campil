// The trip's main location (where you sleep / the destination): weather, distances, the day plan and navigation
// all start from it. Pick from the place database as you type, or search the web (OpenStreetMap) on submit.
import { MapPin, X, Crosshair } from 'lucide-react';
import type { Trip, RegionId } from '../lib/types';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { haversineKm } from '../lib/util';
import { tripPoint } from '../lib/hooks';
import { toast } from './ui';
import { WhereTo } from './WhereTo';

const nearestRegion = (lat: number, lon: number): RegionId => REGIONS.reduce((a, r) => (haversineKm({ lat, lon }, r) < haversineKm({ lat, lon }, a) ? r : a)).id;

export function LocationPicker({ t, onChange }: { t: Trip; onChange: (p: Partial<Trip>) => void }) {
  const cur = tripPoint(t);
  const pick = (lat: number, lon: number, label: string, region?: RegionId) => {
    const r = region ?? nearestRegion(lat, lon);
    onChange({ dest: { lat, lon, label }, regionId: r });
    toast(`מיקום הטיול: ${label}${r !== t.regionId ? ` · האזור עודכן ל${REGION_BY_ID[r].name}` : ''}`);
  };
  const here = () => navigator.geolocation?.getCurrentPosition(p => pick(p.coords.latitude, p.coords.longitude, 'המיקום שלי'), () => toast('אין הרשאה למיקום'), { timeout: 10000 });
  return (
    <div className="space-y-2" aria-label="מיקום הטיול" role="group">
      <div className="flex flex-wrap items-center gap-2 rounded-xl2 border border-line bg-raised/40 p-3">
        <MapPin size={18} className="shrink-0 text-moss" />
        <span className="min-w-0 flex-1"><span className="block text-xs text-muted">מיקום נוכחי</span><span className="block font-bold">{cur ? cur.label : 'לא נקבע'}</span>
          {!t.dest && cur && <span className="block text-xs text-muted">{t.siteIds.length ? 'לפי אתר הלינה בתוכנית' : 'מרכז האזור — כדאי לבחור מקום מדויק'}</span>}</span>
        {t.dest && <button type="button" className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold text-muted hover:text-ink" onClick={() => onChange({ dest: undefined })} aria-label="ניקוי המיקום"><X size={15} />ניקוי</button>}
      </div>
      <WhereTo label="מיקום חדש — כתבו בחופשיות" onPick={x => pick(x.lat, x.lon, x.label, x.region)} />
      <button type="button" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-moss" onClick={here}><Crosshair size={15} />המיקום הנוכחי שלי</button>
      <p className="text-xs text-muted">התחזית, המרחקים, ההצעות לכל יום והניווט מחושבים מהמיקום הזה. שינוי שלו לא מוחק דבר מהתוכנית.</p>
    </div>
  );
}
