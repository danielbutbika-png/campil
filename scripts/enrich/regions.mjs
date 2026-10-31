// The app's own region polygons (src/data/regions.geo.json) — every place is assigned by point-in-polygon.
import { readFileSync } from 'node:fs';
const regions = JSON.parse(readFileSync(new URL('../../src/data/regions.geo.json', import.meta.url), 'utf8')).features;
const inside = (x, y, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
export const regionOf = (lat, lon) => {
  for (const f of regions) { const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; if (polys.some(p => inside(lon, lat, p[0]))) return f.properties.id; }
  return null;
};
