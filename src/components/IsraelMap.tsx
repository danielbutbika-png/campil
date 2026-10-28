// The map engine (maplibre, ~1MB) is heavy to parse on a phone. This shell paints the regions at once as a
// light SVG you can already tap, and loads the real map when the browser is idle — then lays it on top.
import { Suspense, lazy, useEffect, useState, type ComponentProps } from 'react';
import regions from '../data/regions.geo.json';
import { REGION_BY_ID } from '../data/regions';
import type { RegionId } from '../lib/types';

const GL = lazy(() => import('./IsraelMapGL'));
type Props = ComponentProps<typeof GL>;

// Simple equirectangular projection of Israel's bounding box into a 300×600 viewBox.
const W = 34.2, E = 35.95, S = 29.4, N = 33.4, K = Math.cos((31.4 * Math.PI) / 180);
const VW = 300, VH = ((N - S) / ((E - W) * K)) * VW;
const px = (lon: number, lat: number) => `${(((lon - W) / (E - W)) * VW).toFixed(1)},${(((N - lat) / (N - S)) * VH).toFixed(1)}`;
const SHAPES = (regions as any).features.map((f: any) => ({
  id: f.properties.id as RegionId,
  d: (f.geometry.coordinates as number[][][]).map(ring => 'M' + ring.map(([lon, lat]) => px(lon, lat)).join('L') + 'Z').join(''),
}));

function Preview({ selected, onSelect }: Pick<Props, 'selected' | 'onSelect'>) {
  return (
    <svg viewBox={`0 0 ${VW} ${VH.toFixed(0)}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full bg-[#e9efe6]" aria-hidden>
      {SHAPES.map((s: any) => (
        <path key={s.id} d={s.d} fill={s.id === selected ? '#2f6b3f' : '#4f8f5a'} fillOpacity={s.id === selected ? 0.55 : 0.22} stroke="#1d3a29" strokeWidth={s.id === selected ? 2 : 0.8}
          className={onSelect ? 'cursor-pointer' : undefined} onClick={onSelect ? () => onSelect(s.id) : undefined}>
          <title>{REGION_BY_ID[s.id as RegionId].short}</title>
        </path>
      ))}
    </svg>
  );
}

/** Wait for the first paint and an idle moment before pulling in the map engine. */
function useIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as any;
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2000 }); return () => w.cancelIdleCallback(id); }
    const t = setTimeout(() => setIdle(true), 400); return () => clearTimeout(t);
  }, []);
  return idle;
}

export function IsraelMap(props: Props) {
  const idle = useIdle();
  return (
    <div className={props.className} style={{ position: 'relative' }}>
      <Preview selected={props.selected} onSelect={props.onSelect} />
      {idle && <div className="absolute inset-0"><Suspense fallback={null}><GL {...props} className="h-full w-full" /></Suspense></div>}
    </div>
  );
}
