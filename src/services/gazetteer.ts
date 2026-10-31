// "Where are you going?" — free text with suggestions as you type: areas and valleys ("עמק המעיינות"), mountain
// ranges, localities and the place database. Names, alternative names and positions come from Wikidata
// (public/data/gazetteer.json, built by scripts/enrich/gazetteer.mjs); the region is the app region that contains them.
import type { RegionId } from '../lib/types';
import { loadPlaces, CAT_HE, type Place } from './placesDb';
import { REGIONS } from '../data/regions';

/** Everyday names that the source lists under another name: the everyday name → the source's name (its position stays
 *  the source's). Only names whose equivalence is common knowledge. */
export const ALIASES: Record<string, string> = { 'עמק המעיינות': 'בקעת בית שאן' };

export type GazKind = 'valley' | 'area' | 'range' | 'desert' | 'locality';
export interface GazName { n: string; a?: string[]; lat: number; lon: number; r: RegionId; k: GazKind; q: string }
export interface Suggestion { id: string; label: string; sub: string; lat: number; lon: number; region: RegionId; kind: GazKind | 'place'; place?: Place; matched?: string }
export const KIND_HE: Record<GazKind, string> = { valley: 'עמק', area: 'אזור', range: 'רכס / רמה', desert: 'מדבר', locality: 'יישוב' };

let gaz: Promise<GazName[]> | null = null;
export function loadGazetteer(): Promise<GazName[]> {
  if (!gaz) gaz = fetch(`${import.meta.env.BASE_URL}data/gazetteer.json`).then(r => (r.ok ? r.json() : { names: [] })).then(d => d.names ?? []).catch(() => { gaz = null; return []; });
  return gaz;
}

const norm = (s: string) => s.replace(/["'״׳()\-–,.]/g, ' ').replace(/\s+/g, ' ').trim();
// a leading "ה" / "ב" / "ל" is often typed ("לעמק המעיינות", "בגולן") — try without it too
const variants = (q: string) => { const k = norm(q); return [k, ...(/^[בלה]\S{2,}/.test(k) ? [k.slice(1)] : [])]; };
/** 0 = exact, 1 = starts with, 2 = a word starts with, 3 = contains; 9 = no match. */
function score(name: string, qs: string[]) {
  const n = norm(name); let best = 9;
  for (const k of qs) { const s = n === k ? 0 : n.startsWith(k) ? 1 : n.split(' ').some(w => w.startsWith(k)) ? 2 : n.includes(k) ? 3 : 9; best = Math.min(best, s); }
  return best;
}
// areas first, then localities, then specific places — a trip "to עמק המעיינות" is about the area
const KIND_RANK: Record<Suggestion['kind'], number> = { valley: 0, area: 0, range: 1, desert: 1, locality: 2, place: 3 };
const PLACE_OK = (p: Place) => !!(p.wiki || p.img || p.site || p.c.some(c => ['nature_reserve', 'national_park', 'campsite', 'beach', 'lake'].includes(c)));

/** Suggestions for free text: best name match first, areas before places, each with its region. */
export function suggest(q: string, names: GazName[], places: Place[], limit = 8): Suggestion[] {
  const qs = variants(q); if (qs[0].length < 2) return [];
  const out: (Suggestion & { s: number })[] = [];
  // the app's own regions (their position is the region's weather point)
  for (const r of REGIONS) { const s = Math.min(score(r.name, qs), score(r.short, qs)); if (s < 9) out.push({ id: 'region:' + r.id, label: r.name, sub: 'אזור טיול', lat: r.lat, lon: r.lon, region: r.id, kind: 'area', s }); }
  // everyday names → the source entity
  for (const [alias, canon] of Object.entries(ALIASES)) { const s = score(alias, qs); const g = s < 9 && names.find(x => x.n === canon); if (g) out.push({ id: 'alias:' + alias, label: alias, sub: `${KIND_HE[g.k]} · ${canon}`, lat: g.lat, lon: g.lon, region: g.r, kind: g.k, s }); }
  for (const g of names) {
    const s0 = score(g.n, qs); const sa = Math.min(9, ...(g.a ?? []).map(a => score(a, qs) + 0.5));
    const s = Math.min(s0, sa); if (s >= 9) continue;
    out.push({ id: 'gaz:' + g.q, label: g.n, sub: KIND_HE[g.k], lat: g.lat, lon: g.lon, region: g.r, kind: g.k, matched: sa < s0 ? (g.a ?? []).find(a => score(a, qs) + 0.5 === sa) : undefined, s });
  }
  for (const p of places) {
    if (!PLACE_OK(p)) continue; const s = score(p.he, qs); if (s >= 9) continue;
    out.push({ id: p.id, label: p.he, sub: CAT_HE[p.c[0]], lat: p.lat, lon: p.lon, region: p.r, kind: 'place', place: p, s });
  }
  const seen = new Set<string>();
  return out.sort((a, b) => a.s - b.s || KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.label.length - b.label.length)
    .filter(x => { const k = `${x.label}|${x.region}|${x.kind === "place" ? "p" : "g"}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, limit);
}

/** Both sources at once (each loads once per session and is kept offline by the service worker). */
export async function loadWhere(): Promise<{ names: GazName[]; places: Place[] }> {
  const [names, db] = await Promise.all([loadGazetteer(), loadPlaces().catch(() => null)]);
  return { names, places: db?.places ?? [] };
}
