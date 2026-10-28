// Weather plan B: when the forecast hits a planned place's known weakness, suggest nearby alternatives without it.
// Uses only the real forecast (never climate averages) and the catalog's own flags (flood-prone riverbed,
// exposed to wind, water nearby). It doesn't say a place is closed or unsafe — it says why to reconsider.
import type { Site } from '../lib/types';
import type { WxFlags } from './weatherRules';
import { distKm } from './gpx';

export type PlanBReason = 'flood' | 'wind' | 'heat';
export interface PlanBItem { site: Site; reason: PlanBReason; why: string; alternatives: { site: Site; km: number }[] }
export const PLANB_HE: Record<PlanBReason, string> = { flood: 'גשם צפוי ומדובר בערוץ נחל', wind: 'רוח חזקה צפויה ומדובר באתר חשוף', heat: 'עומס חום צפוי — עדיף מקום עם מים או צל' };

const weak = (s: Site, r: PlanBReason) => (r === 'flood' ? !!s.floodRisk : r === 'wind' ? !!s.exposed : s.type === 'trail' && !s.tags.includes('water'));
const fits = (s: Site, r: PlanBReason) => (r === 'flood' ? !s.floodRisk : r === 'wind' ? !s.exposed : s.tags.includes('water') || s.type === 'spring' || s.type === 'beach');

export function planB(planned: Site[], catalog: Site[], flags: WxFlags, isForecast: boolean): PlanBItem[] {
  if (!isForecast || !flags.known) return [];
  const reasons: PlanBReason[] = [...(flags.rain ? ['flood' as const] : []), ...(flags.wind ? ['wind' as const] : []), ...(flags.extremeHeat ? ['heat' as const] : [])];
  const ids = new Set(planned.map(s => s.id)); const out: PlanBItem[] = [];
  for (const s of planned) for (const r of reasons) {
    if (!weak(s, r) || s.lodging) continue; // lodging is booked — we don't suggest moving it
    const alternatives = catalog.filter(c => !ids.has(c.id) && c.region === s.region && !c.lodging && fits(c, r) && !(r !== 'flood' && flags.rain && c.floodRisk))
      .map(c => ({ site: c, km: Math.round(distKm(s, c) * 10) / 10 })).sort((a, b) => a.km - b.km).slice(0, 3);
    out.push({ site: s, reason: r, why: PLANB_HE[r], alternatives });
  }
  return out;
}
