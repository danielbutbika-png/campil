import { useEffect, useRef, useState } from 'react';
import { mapStyleAvailable } from '../lib/offline';
import maplibregl, { type Map as MLMap, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import regions from '../data/regions.geo.json';
import outline from '../data/israel-outline.geo.json';
import { REGION_BY_ID } from '../data/regions';
import type { RegionId, Site } from '../lib/types';
import type { OsmPlace } from '../services/osm';
import { BRAND_BY_ID, navApps, type FuelStation } from '../services/fuel';

// Basemap: OpenFreeMap (free OSM vector tiles, no key). If it can't load (offline), we fall back to
// a plain style that still draws the region polygons, so the map remains usable.
const BASE = 'https://tiles.openfreemap.org/styles/positron';
try { if (maplibregl.getRTLTextPluginStatus() === 'unavailable') maplibregl.setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js', true); } catch { /* optional */ }
const BLANK: StyleSpecification = { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#e9efe6' } }] };
const PALETTE = ['#2f6b3f', '#4f8f5a', '#3c6e9f', '#2c8c99', '#5d7a3a', '#8a6d3b', '#a0522d', '#7a6a9e', '#c99a2e', '#b5562f', '#c47a3a', '#d9822b', '#2c7a8c'];
const fc = { ...regions, features: (regions as any).features.map((f: any, i: number) => ({ ...f, id: i, properties: { ...f.properties, name: REGION_BY_ID[f.properties.id as RegionId].short, color: PALETTE[i % PALETTE.length] } })) };

export function IsraelMap({ selected, onSelect, sites = [], osm = [], onSite, className, interactive = true, route, fuel = [], fitTo }: {
  selected?: RegionId | null; onSelect?: (r: RegionId) => void; sites?: Site[]; osm?: OsmPlace[]; onSite?: (s: Site) => void; className?: string; interactive?: boolean;
  route?: [number, number][] | null; fuel?: FuelStation[]; fitTo?: [number, number, number, number] | null;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(false);
  const [basemap, setBasemap] = useState<'ok' | 'fallback'>('ok');
  const cb = useRef({ onSelect, onSite, sites }); cb.current = { onSelect, onSite, sites };

  useEffect(() => {
    let fellBack = false; const labels: maplibregl.Marker[] = [];
    const m = new maplibregl.Map({ container: el.current!, style: navigator.onLine ? BASE : BLANK, center: [35.0, 31.4], zoom: 6.2, minZoom: 5.5, maxZoom: 16, attributionControl: { compact: true }, cooperativeGestures: !interactive, dragRotate: false, pitchWithRotate: false });
    map.current = m;
    m.touchZoomRotate.disableRotation();
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    const install = () => {
      if (m.getSource('regions')) return;
      m.addSource('outline', { type: 'geojson', data: outline as any });
      m.addSource('regions', { type: 'geojson', data: fc as any });
      m.addLayer({ id: 'r-fill', type: 'fill', source: 'regions', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['case', ['boolean', ['feature-state', 'sel'], false], 0.5, ['boolean', ['feature-state', 'hover'], false], 0.34, 0.2] } });
      m.addLayer({ id: 'r-line', type: 'line', source: 'regions', paint: { 'line-color': '#1d3a29', 'line-width': ['case', ['boolean', ['feature-state', 'sel'], false], 3, 1], 'line-opacity': .7 } });
      m.addLayer({ id: 'o-line', type: 'line', source: 'outline', paint: { 'line-color': '#1d3a29', 'line-width': 1.5 } });
      // Region labels as HTML markers: native Hebrew shaping and app fonts, independent of map glyphs.
      for (const f of fc.features as any[]) {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = f.properties.name; b.className = 'region-label'; b.setAttribute('aria-label', `בחירת אזור ${f.properties.name}`);
        b.onclick = ev => { ev.stopPropagation(); cb.current.onSelect?.(f.properties.id); };
        labels.push(new maplibregl.Marker({ element: b }).setLngLat([f.properties.labelLon, f.properties.labelLat]).addTo(m));
      }
      m.addSource('sites', { type: 'geojson', data: empty() });
      m.addLayer({ id: 'sites', type: 'circle', source: 'sites', paint: { 'circle-radius': 7, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });
      m.addSource('osm', { type: 'geojson', data: empty() });
      m.addLayer({ id: 'osm', type: 'circle', source: 'osm', paint: { 'circle-radius': 5, 'circle-color': '#d66a2a', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } });
      m.addSource('route', { type: 'geojson', data: empty() });
      m.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 7 } });
      m.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#d66a2a', 'line-width': 4 } });
      m.addSource('fuel', { type: 'geojson', data: empty() });
      m.addLayer({ id: 'fuel', type: 'circle', source: 'fuel', paint: { 'circle-radius': 6.5, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#1c241e', 'circle-stroke-width': 1.5 } });
      m.on('click', 'fuel', e => {
        const p = e.features![0].properties as any; const [lon, lat] = (e.features![0].geometry as any).coordinates;
        const links = navApps(lat, lon).map(a => `<a href="${a.url}" target="_blank" rel="noreferrer" style="display:inline-block;margin:4px 4px 0 0;padding:4px 10px;border-radius:999px;background:#efe7d6;color:#1c241e;font-weight:700;text-decoration:none">${a.name}</a>`).join('');
        new maplibregl.Popup({ closeButton: true }).setLngLat([lon, lat]).setHTML(`<div dir="rtl"><strong>${escapeHtml(p.name)}</strong><br/><span style="font-size:12px">${escapeHtml(p.brand)}${p.along ? ` · ק״מ ${p.along} במסלול` : ''}</span><div>${links}</div></div>`).addTo(m);
      });
      m.on('mouseenter', 'fuel', () => (m.getCanvas().style.cursor = 'pointer')); m.on('mouseleave', 'fuel', () => (m.getCanvas().style.cursor = ''));
      let hover: number | null = null;
      m.on('mousemove', 'r-fill', e => { const id = e.features?.[0]?.id as number; if (hover !== null) m.setFeatureState({ source: 'regions', id: hover }, { hover: false }); hover = id; m.setFeatureState({ source: 'regions', id }, { hover: true }); m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'r-fill', () => { if (hover !== null) m.setFeatureState({ source: 'regions', id: hover }, { hover: false }); hover = null; m.getCanvas().style.cursor = ''; });
      m.on('click', 'r-fill', e => { const f = m.queryRenderedFeatures(e.point, { layers: ['sites', 'osm'] }); if (f.length) return; const id = e.features?.[0]?.properties?.id; if (id) cb.current.onSelect?.(id); });
      m.on('click', 'sites', e => { const id = e.features?.[0]?.properties?.id; const s = cb.current.sites.find(x => x.id === id); if (s) cb.current.onSite?.(s); });
      m.on('click', 'osm', e => {
        const p = e.features![0].properties as any; const [lon, lat] = (e.features![0].geometry as any).coordinates;
        const links = navApps(lat, lon).map(a => `<a href="${a.url}" target="_blank" rel="noreferrer" style="display:inline-block;margin:4px 4px 0 0;padding:4px 10px;border-radius:999px;background:#efe7d6;color:#1c241e;font-weight:700;text-decoration:none">${a.name}</a>`).join('');
        new maplibregl.Popup({ closeButton: true }).setLngLat([lon, lat]).setHTML(`<div dir="rtl"><strong>${escapeHtml(p.name)}</strong><br/><span style="font-size:12px">${escapeHtml(p.kind)}</span>${p.url ? ` · <a href="${p.url}" target="_blank" rel="noreferrer" style="font-size:12px">OSM</a>` : ''}<div>${links}</div></div>`).addTo(m);
      });
      for (const l of ['sites', 'osm']) { m.on('mouseenter', l, () => (m.getCanvas().style.cursor = 'pointer')); m.on('mouseleave', l, () => (m.getCanvas().style.cursor = '')); }
      const zl = () => el.current?.classList.toggle('labels-far', m.getZoom() < 7.2);
      m.on('zoomend', zl); zl();
      setReady(true);
    };
    m.on('load', install);
    // no signal, but the area was saved with "prepare for the field": use the real map from the device
    if (!navigator.onLine) mapStyleAvailable().then(ok => { if (ok && !fellBack) { setBasemap('ok'); m.setStyle(BASE); m.once('styledata', install); } });
    m.on('error', e => {
      if (fellBack || m.loaded()) return;
      if (String((e as any).error?.message || '').match(/Failed to fetch|NetworkError|style|404|403/i)) { fellBack = true; setBasemap('fallback'); m.setStyle(BLANK); m.once('styledata', install); }
    });
    const t = setTimeout(() => { if (!m.loaded() && !fellBack) { fellBack = true; setBasemap('fallback'); m.setStyle(BLANK); m.once('styledata', install); } }, 8000);
    return () => { clearTimeout(t); m.remove(); };
  }, []);

  useEffect(() => {
    const m = map.current; if (!m || !ready) return;
    document.querySelectorAll('.region-label').forEach(e => e.classList.toggle('sel', e.textContent === REGION_BY_ID[selected as RegionId]?.short));
    fc.features.forEach((f: any) => m.setFeatureState({ source: 'regions', id: f.id }, { sel: f.properties.id === selected }));
    const f = fc.features.find((x: any) => x.properties.id === selected);
    if (f) { const [w, s, e, n] = f.properties.bbox; m.fitBounds([[w, s], [e, n]], { padding: 50, maxZoom: 10, duration: 700 }); }
    else m.fitBounds([[34.25, 29.45], [35.9, 33.4]], { padding: 24, duration: 500 });
  }, [selected, ready]);

  useEffect(() => {
    const m = map.current; if (!m || !ready) return;
    (m.getSource('sites') as any)?.setData({ type: 'FeatureCollection', features: sites.map(s => ({ type: 'Feature', properties: { id: s.id, color: s.type === 'campsite' ? '#2f6b3f' : s.type === 'beach' ? '#2c8c99' : '#1d3a29' }, geometry: { type: 'Point', coordinates: [s.lon, s.lat] } })) });
    (m.getSource('osm') as any)?.setData({ type: 'FeatureCollection', features: osm.map(p => ({ type: 'Feature', properties: { name: p.name, kind: (p as any).label ?? (p.kind === 'camp_site' ? 'חניון לינה' : p.kind === 'caravan_site' ? 'חניון קרוואנים' : 'חניון יום'), url: p.url ?? '' }, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } })) });
  }, [sites, osm, ready]);

  useEffect(() => {
    const m = map.current; if (!m || !ready) return;
    (m.getSource('route') as any)?.setData(route?.length ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route } } : empty());
    (m.getSource('fuel') as any)?.setData({ type: 'FeatureCollection', features: fuel.map(f => ({ type: 'Feature', properties: { name: f.name, brand: BRAND_BY_ID[f.brand].name, color: BRAND_BY_ID[f.brand].color, along: f.alongKm != null ? Math.round(f.alongKm) : '' }, geometry: { type: 'Point', coordinates: [f.lon, f.lat] } })) });
    if (fitTo) m.fitBounds([[fitTo[0], fitTo[1]], [fitTo[2], fitTo[3]]], { padding: 40, duration: 600 });
  }, [route, fuel, fitTo?.join(','), ready]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div ref={el} style={{ position: "absolute", inset: 0 }} role="application" aria-label="מפת אזורי הטיול בישראל. אפשר לבחור אזור גם מהרשימה." />
      {basemap === 'fallback' && <span className="absolute bottom-2 right-2 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold shadow">מפת הרקע אינה זמינה — מוצגים גבולות האזורים בלבד</span>}
    </div>
  );
}
const empty = () => ({ type: 'FeatureCollection', features: [] } as any);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
