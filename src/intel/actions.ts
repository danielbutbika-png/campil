// Actions behind recommendations: a typed, previewable change to the trip. Nothing is applied without the user's
// approval (ProposalSheet), the user may untick any line, and the change is computed here in code — never guessed.
import type { Trip, PackItem, TaskItem, CategoryId, GearItem } from '../lib/types';
import { needsCharge, type Recommendation } from './engine';
import { MEAL_LABEL } from '../data/recipes';
import { uid } from '../lib/util';

export interface ProposalItem { id: string; label: string; detail?: string }
export type ProposalKind = 'packing' | 'tasks' | 'servings';
export interface Proposal { kind: ProposalKind; title: string; items: ProposalItem[] }

// concrete gear for a forecast type (only what the packing list doesn't already have)
const WX_GEAR: Record<string, [string, CategoryId][]> = {
  cold: [['שכבה תרמית לכל משתתף', 'clothing'], ['כובע צמר', 'clothing'], ['שמיכה נוספת', 'sleep']],
  rain: [['מעיל גשם לכל משתתף', 'clothing'], ['ברזנט / יריעה מעל האוהל', 'tents'], ['שקיות אטומות לבגדים', 'misc']],
  heat: [['כובע רחב שוליים', 'clothing'], ['מים נוספים', 'food'], ['צל נוסף (גזיבו / יריעה)', 'furniture']],
  uv: [['קרם הגנה', 'hygiene'], ['משקפי שמש', 'clothing']],
  wind: [['יתדות נוספים', 'tents'], ['חבלי מתיחה נוספים', 'tents']],
  warm_night: [['מאוורר נטען', 'power']],
};
const has = (t: Trip, name: string) => { const n = name.split(/[ /(]/)[0]; return t.packing.some(p => !p.removed && p.name.includes(n)); };

/** The change a recommendation can make, or none. */
export function proposalFor(r: Recommendation, t: Trip, inventory?: GearItem[]): Proposal | undefined {
  if (r.id === 'charge') {
    const items = t.packing.filter(p => !p.removed && !p.packed && needsCharge(p, inventory));
    const open = items.filter(p => !t.tasks.some(k => !k.done && k.text === `לטעון: ${p.name}`));
    if (open.length) return { kind: 'tasks', title: 'להוסיף משימות טעינה לערב שלפני', items: open.map(p => ({ id: p.id, label: `לטעון: ${p.name}`, detail: 'ערב לפני' })) };
  }
  if (r.id === 'food-count') {
    const people = t.participants.length;
    const short = t.meals.filter(m => m.recipeId && m.servings + (m.alt?.recipeId ? m.alt.servings : 0) < people);
    if (short.length) return { kind: 'servings', title: `לעדכן את מספר הסועדים ל-${people}`, items: short.map(m => ({ id: m.id, label: `יום ${m.day + 1} · ${MEAL_LABEL[m.type]}`, detail: `${m.servings} → ${people - (m.alt?.recipeId ? m.alt.servings : 0)} סועדים` })) };
  }
  if (r.id.startsWith('wx-') && r.id !== 'wx-pending') {
    const kind = Object.keys(WX_GEAR).find(k => r.id.includes(k) || r.kind === k);
    const gear = (kind ? WX_GEAR[kind] : []).filter(([n]) => !has(t, n));
    if (gear.length) return { kind: 'packing', title: 'להוסיף לרשימת הציוד', items: gear.map(([n, c]) => ({ id: `${c}|${n}`, label: n })) };
  }
  return undefined;
}

/** Apply only the approved lines. Pure: returns the patch for updateTrip. */
export function applyProposal(t: Trip, p: Proposal, approved: string[]): Partial<Trip> {
  const ok = new Set(approved);
  if (p.kind === 'tasks') {
    const add: TaskItem[] = p.items.filter(i => ok.has(i.id)).map(i => ({ id: uid('t'), when: 'ערב לפני', text: i.label, done: false, dueOffsetDays: -1 }));
    return { tasks: [...t.tasks, ...add].sort((a, b) => a.dueOffsetDays - b.dueOffsetDays) };
  }
  if (p.kind === 'servings') {
    const people = t.participants.length;
    return { meals: t.meals.map(m => {
      if (!ok.has(m.id)) return m;
      const n = Math.max(1, people - (m.alt?.recipeId ? m.alt.servings : 0));
      return { ...m, servings: n, eq: m.eq ? Math.round((m.eq / m.servings) * n * 10) / 10 : undefined };
    }) };
  }
  const add: PackItem[] = p.items.filter(i => ok.has(i.id)).map(i => { const [cat, name] = i.id.split('|'); return { id: uid('pk'), name, category: cat as CategoryId, qty: 1, reason: 'הוסף מהמלצה לפי התחזית', source: 'manual', packed: false }; });
  return { packing: [...t.packing, ...add] };
}
