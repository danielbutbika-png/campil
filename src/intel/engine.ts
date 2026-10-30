// CampIL Intelligence Engine — one recommendation model for every part of the app.
// Today the only active source is the deterministic rules engine (engine/assistant + the detectors below):
// quantities, dates and counts are computed in code, facts come from the family's data, the forecast and
// official sources. A language model, if one is connected later (see docs/ai/AI_PLAN.md), may only explain or
// rephrase — it never decides numbers or safety, and nothing changes the user's data without their approval.
import type { Trip, PackItem } from '../lib/types';
import type { ProvKind } from '../components/Provenance';
import type { Suggestion, Level } from '../engine/assistant';
import type { ShopLine } from '../engine/planner';
import { readiness } from '../engine/packing';
import { dutyKey } from '../engine/duties';
import { isGroup, myPacking } from '../lib/families';
import { diffDays } from '../lib/util';

/** How sure the statement is — shown to the user, never hidden. */
export type Certainty = 'high' | 'medium' | 'low';
/** What kind of statement a piece of evidence is. */
export type EvidenceKind = 'fact' | 'calc' | 'estimate' | 'ai' | 'missing';
export interface Evidence { kind: EvidenceKind; text: string }
export interface Recommendation {
  id: string;                 // stable per trip + rule, so a dismissal sticks
  kind: string;               // the rule family: 'weather' | 'packing' | 'tasks' | 'charge' | 'food' | 'shopping' | …
  level: Level;               // urgency band
  title: string;              // what was found, in one line
  why: string;                // why it matters now
  todo?: string;              // what to do
  evidence: Evidence[];       // the data it rests on
  source: { kind: ProvKind; label: string; url?: string };
  updatedAt: number;          // when this was computed
  certainty: Certainty;
  priority: number;           // higher first
  action?: { label: string; to: string };
  engine: 'rules' | 'ai';     // 'ai' only when a connected model wrote the text
  sig: string;                // changes when the underlying facts change (re-shows a dismissed card)
}
export type RecStatus = 'done' | 'dismissed';
export interface RecState { status: RecStatus; at: number; sig: string }

const BASE: Record<Level, number> = { danger: 100, warn: 70, todo: 50, info: 20 };
const CERTAINTY: Record<ProvKind, Certainty> = { verified: 'high', official: 'high', auto: 'high', estimate: 'medium', community: 'low', unknown: 'low' };
const EVIDENCE: Record<ProvKind, EvidenceKind> = { verified: 'fact', official: 'fact', auto: 'calc', estimate: 'estimate', community: 'estimate', unknown: 'missing' };
const TODO: Record<string, string> = {
  pack: 'לעבור על הרשימה ולסמן מה כבר ארוז', tasks: 'לסגור את המשימות שהגיע זמנן', offline: 'לשמור במכשיר תחזית ומפה לפני היציאה (צריך חיבור)',
  gearcheck: 'לבדוק את הפריטים ולסמן "נבדק"', duties: 'לבחור לכל ארוחה ופריט מי אחראי', brings: 'לסגור מי מביא את מה שחסר',
  typechecks: 'לעבור על הבדיקות מול המקור הרשמי', trunk: 'לעדכן את תכנון ההעמסה או להוריד פריטים', planb: 'לשקול את החלופות באותו אזור',
  flood: 'לבדוק את התרעות השירות המטאורולוגי לפני היציאה', 'wx-pending': 'לחזור לכאן כשהתחזית תיפתח', return: 'להחזיר את הציוד לבעליו',
};
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

/** The rules engine's suggestion as a recommendation. */
export function fromSuggestion(s: Suggestion, now: number): Recommendation {
  const k = s.id.replace(/-.*$/, '');
  return {
    id: s.id, kind: k, level: s.level, title: s.title, why: s.why, todo: TODO[s.id] ?? TODO[k] ?? s.action?.label,
    evidence: [{ kind: EVIDENCE[s.source.kind], text: s.why }], source: s.source, updatedAt: now, certainty: CERTAINTY[s.source.kind],
    priority: BASE[s.level] - Math.min(30, Math.max(0, s.when)), action: s.action, engine: 'rules', sig: hash(s.title + '|' + s.why),
  };
}

const CHARGE = /טעינ|סוללה|סוללות|פנס|מטען|פאוור|power ?bank|מצבר|רמקול|נטען/i;
/** Extra detectors, beyond engine/assistant. Pure functions of the trip and its shopping lines. */
export function detectMore(t: Trip, today: string, shopLines: ShopLine[], now: number): Recommendation[] {
  const out: Recommendation[] = [];
  if (t.status !== 'planning' || t.end < today) return out;
  const until = diffDays(today, t.start);
  const route = (tab: string) => `/trip/${t.id}/${tab}`;
  const mk = (r: Omit<Recommendation, 'updatedAt' | 'engine' | 'sig'>): Recommendation => ({ ...r, updatedAt: now, engine: 'rules', sig: hash(r.title + '|' + r.why) });

  // things to charge the evening before (packing items that run on batteries / need charging)
  const mine: PackItem[] = myPacking(t).filter(p => !p.removed);
  const charge = mine.filter(p => p.category === 'power' || CHARGE.test(p.name));
  if (until >= 0 && until <= 2 && charge.length && charge.some(p => !p.packed))
    out.push(mk({ id: 'charge', kind: 'charge', level: until <= 1 ? 'warn' : 'todo', title: `${charge.length} פריטים שצריך לטעון לפני היציאה`,
      why: charge.slice(0, 5).map(p => p.name).join(', ') + (charge.length > 5 ? '…' : '') + ` · יוצאים ${until === 0 ? 'היום' : until === 1 ? 'מחר' : 'בעוד יומיים'}.`,
      todo: 'לחבר לטעינה הערב, ולסמן "ארוז" אחרי', evidence: [{ kind: 'fact', text: 'פריטי חשמל ותאורה ברשימת הציוד שלכם' }, { kind: 'calc', text: `${charge.filter(p => !p.packed).length} עוד לא ארוזים` }],
      source: { kind: 'auto', label: 'רשימת הציוד שלכם' }, certainty: 'high', priority: BASE[until <= 1 ? 'warn' : 'todo'] - until, action: { label: 'לרשימת הציוד', to: route('gear') } }));

  // food: dishes planned for fewer people than are coming (participants were added after the menu was made)
  const people = t.participants.length;
  const short = t.noFood ? [] : t.meals.filter(m => m.recipeId && m.servings + (m.alt?.recipeId ? m.alt.servings : 0) < people);
  if (short.length && until >= 0)
    out.push(mk({ id: 'food-count', kind: 'food', level: 'warn', title: `${short.length} ארוחות מתוכננות לפחות אנשים ממה שמגיעים`,
      why: `בטיול ${people} משתתפים; בחלק מהמנות מספר הסועדים קטן יותר (למשל ${short[0].servings}). הכמויות ברשימת הקניות נגזרות מזה.`,
      todo: 'לעדכן מספר סועדים בארוחות, או לבנות את התפריט מחדש', evidence: [{ kind: 'fact', text: `${people} משתתפים בטיול` }, { kind: 'calc', text: `${short.length} מנות עם פחות סועדים` }],
      source: { kind: 'auto', label: 'התפריט והמשתתפים בטיול' }, certainty: 'high', priority: BASE.warn - Math.max(0, until), action: { label: 'לתפריט', to: route('meals') } }));

  // one-family trip with several adults: shopping nobody took yet
  const adults = t.participants.filter(p => p.role !== 'child').length;
  if (!isGroup(t) && adults > 1 && until >= 0 && until <= 5) {
    const open = shopLines.filter(l => !t.pantry[l.key] && !t.duties?.[dutyKey.shop(l.key)]?.memberId);
    if (open.length >= 3)
      out.push(mk({ id: 'shop-open', kind: 'shopping', level: 'todo', title: `${open.length} פריטי קנייה בלי מישהו שקונה אותם`,
        why: open.slice(0, 4).map(l => l.name).join(', ') + (open.length > 4 ? '…' : ''), todo: 'לבחור ברשימת הקניות מי קונה כל פריט',
        evidence: [{ kind: 'calc', text: `${open.length} מתוך ${shopLines.length} פריטים בלי שיבוץ` }], source: { kind: 'auto', label: 'רשימת הקניות' },
        certainty: 'high', priority: BASE.todo - until, action: { label: 'לרשימת הקניות', to: route('meals') } }));
  }
  return out;
}

/** Everything for one trip: rules + detectors, without what the user already handled, most important first. */
export function insights(suggestions: Suggestion[], extra: Recommendation[], state: Record<string, RecState>, tripId: string, now: number): Recommendation[] {
  const all = [...suggestions.map(s => fromSuggestion(s, now)), ...extra];
  const seen = new Set<string>();
  return all.filter(r => {
    if (seen.has(r.id)) return false; seen.add(r.id);
    const st = state[`${tripId}:${r.id}`];
    return !st || st.sig !== r.sig; // handled — unless the facts behind it changed since
  }).sort((a, b) => b.priority - a.priority);
}

export interface ReadinessItem { id: string; label: string; done: number; total: number; weight: number; to?: string; note?: string }
/** Trip readiness from a transparent checklist: each line shows its own numbers and weight — no invented score. */
export function tripReadiness(t: Trip, shopLines: ShopLine[], fcFresh: boolean): { pct: number; items: ReadinessItem[] } {
  const r = readiness(myPacking(t));
  const tasks = t.tasks.filter(k => k.dueOffsetDays !== 999);
  const shop = shopLines.length;
  const bought = shopLines.filter(l => t.pantry[l.key] || t.duties?.[dutyKey.shop(l.key)]?.done).length;
  const manual = ['operator', 'alerts', 'contact'];
  const items: ReadinessItem[] = [
    { id: 'pack', label: 'ציוד ארוז', done: r.done, total: r.total, weight: 3, to: `/trip/${t.id}/gear` },
    { id: 'tasks', label: 'משימות לפני היציאה', done: tasks.filter(k => k.done).length, total: tasks.length, weight: 2, to: `/trip/${t.id}/tasks` },
    ...(t.noFood ? [] : [{ id: 'shop', label: 'קניות (יש / נקנה)', done: bought, total: shop, weight: 2, to: `/trip/${t.id}/meals` }]),
    { id: 'safety', label: 'בדיקות בטיחות שסימנתם', done: manual.filter(k => t.safety?.[k]).length, total: manual.length, weight: 2, to: `/trip/${t.id}/safety` },
    { id: 'forecast', label: 'תחזית עדכנית לימי הטיול', done: fcFresh ? 1 : 0, total: 1, weight: 1, to: `/trip/${t.id}`, note: fcFresh ? undefined : 'נפתחת כ-16 יום לפני' },
    { id: 'offline', label: 'מוכן לשימוש בלי קליטה', done: t.offline ? 1 : 0, total: 1, weight: 1, to: `/trip/${t.id}` },
  ].filter(i => i.total > 0);
  const w = items.reduce((s, i) => s + i.weight, 0);
  const pct = w ? Math.round((items.reduce((s, i) => s + i.weight * (i.done / i.total), 0) / w) * 100) : 0;
  return { pct, items };
}
