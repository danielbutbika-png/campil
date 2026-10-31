// "לאן מטיילים?" — type freely; suggestions as you type (areas, valleys, localities, places). Enter takes the best
// match; with no match, the web is searched (OpenStreetMap) on Enter.
import { useEffect, useId, useState } from 'react';
import { MapPin, Search, Loader2, Mountain, Home as HomeI, Trees } from 'lucide-react';
import { loadWhere, suggest, type Suggestion, type GazName } from '../services/gazetteer';
import type { Place } from '../services/placesDb';
import { searchByName } from '../services/places';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { haversineKm } from '../lib/util';
import { cx, toast } from './ui';

const nearestRegion = (lat: number, lon: number) => REGIONS.reduce((a, r) => (haversineKm({ lat, lon }, r) < haversineKm({ lat, lon }, a) ? r : a)).id;
const ICON = { valley: Trees, area: Trees, range: Mountain, desert: Mountain, locality: HomeI, place: MapPin } as const;

export function WhereTo({ onPick, placeholder = 'למשל: עמק המעיינות, קצרין, נחל עמוד', label = 'לאן מטיילים?', initial = '' }: { onPick: (s: Suggestion) => void; placeholder?: string; label?: string; initial?: string }) {
  const id = useId();
  const [data, setData] = useState<{ names: GazName[]; places: Place[] } | null>(null);
  useEffect(() => { loadWhere().then(setData, () => setData({ names: [], places: [] })); }, []);
  const [q, setQ] = useState(initial); const [open, setOpen] = useState(false); const [active, setActive] = useState(0); const [busy, setBusy] = useState(false);
  const list = data && q.trim().length >= 2 ? suggest(q, data.names, data.places) : [];
  const choose = (s: Suggestion) => { onPick(s); setQ(s.label); setOpen(false); };
  const enter = async () => {
    if (list[active] ?? list[0]) return choose(list[active] ?? list[0]);
    if (q.trim().length < 2) return;
    setBusy(true);
    try { const w = (await searchByName(q.trim()))[0]; if (!w) toast('לא מצאנו את המקום — נסו שם אחר'); else choose({ id: 'osm:' + w.id, label: w.name, sub: `${w.label} · OpenStreetMap`, lat: w.lat, lon: w.lon, region: nearestRegion(w.lat, w.lon), kind: 'locality' }); }
    catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="relative">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted" aria-hidden />
        <input id={id} className="field ps-10" role="combobox" aria-expanded={open && list.length > 0} aria-controls={id + '-l'} aria-autocomplete="list" autoComplete="off" placeholder={placeholder} value={q}
          aria-activedescendant={open && list[active] ? `${id}-o${active}` : undefined}
          onChange={e => { setQ(e.target.value); setOpen(true); setActive(0); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, list.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); } else if (e.key === 'Enter') { e.preventDefault(); enter(); } else if (e.key === 'Escape') setOpen(false); }} />
        {busy && <Loader2 size={16} className="absolute inset-y-0 end-3 my-auto animate-spin text-muted" />}
      </div>
      {open && list.length > 0 && (
        <ul id={id + '-l'} role="listbox" aria-label="הצעות" className="absolute inset-x-0 z-30 mt-1 max-h-80 overflow-auto rounded-xl2 border border-line bg-surface shadow-lift">
          {list.map((s, i) => { const I = ICON[s.kind]; return (
            <li key={s.id} id={`${id}-o${i}`} role="option" aria-selected={i === active} onMouseDown={e => { e.preventDefault(); choose(s); }} onMouseEnter={() => setActive(i)}
              className={cx('flex min-h-12 cursor-pointer items-center gap-2 px-3 py-2', i === active && 'bg-raised')}>
              <I size={16} className="shrink-0 text-moss" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block font-bold">{s.label}</span><span className="block truncate text-xs text-muted">{s.sub} · {REGION_BY_ID[s.region].name}{s.matched ? ` · ידוע גם כ"${s.matched}"` : ''}</span></span>
            </li>); })}
        </ul>)}
      {open && q.trim().length >= 2 && data && !list.length && !busy && <p className="mt-1 text-xs text-muted">אין הצעה מהמאגר — Enter יחפש ברשת.</p>}
    </div>
  );
}
