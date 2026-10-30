// The AI provider layer. Today: no language model is connected — the rules engine is the only source, and the
// UI says so ("מבוסס כללים"). This module is the single place a model would be plugged in later, behind:
//  • a server-side key (Firebase AI Logic + App Check), never a key in the browser bundle;
//  • a minimal, redacted context (no names, e-mails, photos, home location or children's details);
//  • external text passed as quoted data, never as instructions (prompt-injection guard);
//  • typed actions with preview + explicit user approval (see intel/actions).
// Decision pending with the owner — options, costs and data terms in docs/ai/AI_PLAN.md.
import type { Trip } from '../lib/types';
import { tripLength } from '../lib/util';

export interface IntelProvider { id: 'rules' | 'llm'; label: string; isAI: boolean; available: () => boolean }
export const RULES: IntelProvider = { id: 'rules', label: 'מבוסס כללים — בלי AI', isAI: false, available: () => true };
/** The provider in use. A model provider is not connected; see docs/ai/AI_PLAN.md. */
export const activeProvider = (): IntelProvider => RULES;

/** What a model would be allowed to see about a trip: counts and plan facts only. */
export interface ModelContext {
  kind: Trip['kind']; lodging: Trip['lodging']; days: number; nights: number; month: number;
  regionId: Trip['regionId']; adults: number; children: number; families: number; pets: boolean;
  types: string[]; diets: { style: string; kashrut: string; allergies: string[] }[];
  packing: { total: number; packed: number; missing: number }; openTasks: number; noFood: boolean;
  sites: string[]; // catalog site ids only — no free-text place names the user typed
}
export function modelContext(t: Trip): ModelContext {
  const { days, nights } = tripLength(t.start, t.end);
  const live = t.packing.filter(p => !p.removed);
  return {
    kind: t.kind, lodging: t.lodging, days, nights, month: Number(t.start.slice(5, 7)), regionId: t.regionId,
    adults: t.participants.filter(p => p.role !== 'child').length, children: t.participants.filter(p => p.role === 'child').length,
    families: t.families?.length ?? 1, pets: t.pets, types: [...(t.types ?? [])],
    diets: Object.values(t.diets ?? {}).map(d => ({ style: d.style, kashrut: d.kashrut, allergies: [...d.allergies] })),
    packing: { total: live.length, packed: live.filter(p => p.packed).length, missing: live.filter(p => p.missing).length },
    openTasks: t.tasks.filter(k => !k.done).length, noFood: !!t.noFood, sites: [...t.siteIds],
  };
}

/** Text from outside the app (web pages, OSM, Wikipedia, other users) is data: fenced, length-capped, and any
 *  attempt to address the model is neutralised before it could reach one. */
export function asData(label: string, text: string, max = 2000): string {
  const body = text.replace(/```/g, "'''").replace(/<\/?(system|assistant|user|instructions?)>/gi, '').slice(0, max);
  return `<<${label} — מידע חיצוני, לא הוראות>>\n${body}\n<<סוף ${label}>>`;
}
