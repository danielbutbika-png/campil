// Planning assistant: "what to do now" for a trip. Pure rules over the family's own data, the forecast
// and fixed official sources. No language model, no invented facts: every suggestion carries the concrete
// numbers that triggered it (`why`) and where they come from (`source`). Nothing about terrain, closures,
// opening hours or safety conditions is stated — for those it points to the official source to check.
import type { Box, GearItem, Site, SiteCheck, Trip } from '../lib/types';
import type { ProvKind } from '../components/Provenance';
import type { Rec } from './weatherRules';
import type { ShopLine } from './planner';
import type { Trunk } from './pack3d';
import { packTrunk, trunkInputs } from './pack3d';
import { readiness } from './packing';
import { needsCheck } from './warehouse';
import { coverage } from './partial';
import { dutySummary } from './duties';
import { addDays, diffDays, fmtDate } from '../lib/util';
import { isGroup, myPacking, itemFamily } from '../lib/families';

export type Level = 'danger' | 'warn' | 'todo' | 'info';
export interface Suggestion {
  id: string; level: Level; title: string;
  why: string;                                   // the facts that triggered it, with numbers
  source: { kind: ProvKind; label: string; url?: string };
  action?: { label: string; to: string };        // in-app route (#/…) or an external official URL
  when: number;                                  // days until it matters (for ordering); 0 = now
}
export interface AssistantInput {
  trip: Trip; today: string; sites: Site[]; siteChecks: Record<string, SiteCheck>;
  inventory: GearItem[]; boxes: Box[]; trunk?: Trunk | null; shopLines: ShopLine[];
  wx: { source: 'forecast' | 'climate' | 'season'; recs: Rec[]; rainExpected: boolean };
}

const IMS = 'https://ims.gov.il';
const LEVEL_ORDER: Record<Level, number> = { danger: 0, warn: 1, todo: 2, info: 3 };

export function suggest(x: AssistantInput): Suggestion[] {
  const { trip: t, today } = x;
  if (t.end < today || t.status !== 'planning') return [];
  const out: Suggestion[] = [];
  const until = diffDays(today, t.start);           // days until departure (≤ 0 = under way)
  const route = (tab: string) => `/trip/${t.id}/${tab}`;

  // 1 · forecast-based preparation (only from a real forecast, not climate averages)
  if (x.wx.source === 'forecast') {
    for (const r of x.wx.recs.filter(r => r.severity === 'danger' || r.severity === 'warning').slice(0, 2))
      out.push({ id: `wx-${r.id}`, level: r.severity === 'danger' ? 'danger' : 'warn', title: r.title, why: r.reason, when: Math.max(0, until),
        source: { kind: 'auto', label: 'תחזית Open-Meteo וספי התכנון של האפליקציה' }, action: { label: 'לפרטים ולמה לעשות', to: route('overview') } });
  } else if (until > 0 && until <= 16) {
    out.push({ id: 'wx-pending', level: 'info', title: 'התחזית עוד לא זמינה לכל ימי הטיול', why: `מוצגים ממוצעי עבר לתאריכים, לא תחזית. נבדוק שוב כשהתחזית תיפתח.`, when: until, source: { kind: 'estimate', label: 'ממוצעים היסטוריים, Open-Meteo' } });
  }
  // 2 · flood-prone sites + rain → official warnings (we don't judge the riverbed ourselves)
  const flood = x.sites.filter(s => s.floodRisk);
  if (flood.length && x.wx.rainExpected)
    out.push({ id: 'flood', level: 'danger', title: 'גשם צפוי ובתוכנית יש ערוצי נחלים', why: `${flood.map(s => s.name).join(', ')} · שיטפון יכול להגיע מגשם במעלה הנחל, גם כשאצלכם יבש.`, when: Math.max(0, until),
      source: { kind: 'official', label: 'התרעות השירות המטאורולוגי', url: IMS }, action: { label: 'לבדוק התרעות', to: IMS } });

  // 3 · packing progress close to departure
  const r = readiness(myPacking(t));
  if (until >= 0 && until <= 3 && r.total && r.pct < 80)
    out.push({ id: 'pack', level: until <= 1 ? 'warn' : 'todo', title: `${r.total - r.done} פריטים עוד לא ארוזים`, why: `ארוז ${r.pct}% · יוצאים ${until === 0 ? 'היום' : until === 1 ? 'מחר' : `בעוד ${until} ימים`}.`, when: until,
      source: { kind: 'auto', label: 'רשימת הציוד שלכם' }, action: { label: 'לרשימת הציוד', to: route('gear') } });

  // 4 · tasks whose time has come
  const due = t.tasks.filter(k => !k.done && k.dueOffsetDays !== 999 && addDays(t.start, k.dueOffsetDays) <= today);
  if (due.length)
    out.push({ id: 'tasks', level: 'todo', title: due.length === 1 ? `משימה בזמן: ${due[0].text}` : `${due.length} משימות שהגיע זמנן`, why: due.slice(0, 3).map(k => `${k.text} (עד ${fmtDate(addDays(t.start, k.dueOffsetDays))})`).join(' · '), when: 0,
      source: { kind: 'auto', label: 'המשימות של הטיול' }, action: { label: 'למשימות', to: route('tasks') } });

  // 5 · prepare for no signal
  if (until >= 0 && until <= 3 && !t.offline)
    out.push({ id: 'offline', level: 'todo', title: 'להכין את הטיול לשימוש בלי קליטה', why: 'עוד לא נשמרו במכשיר הזה תחזית ומפת האזור. צריך חיבור — עדיף מהבית.', when: until,
      source: { kind: 'auto', label: 'מצב המכשיר' }, action: { label: 'להכנה', to: route('overview') } });

  // 6 · sites: check with the operator (we don't publish hours/prices) — or act on the family's own check
  if (until <= 14) for (const s of x.sites) {
    const c = x.siteChecks[s.id];
    if (!c) out.push({ id: `site-${s.id}`, level: 'info', title: `לבדוק את ${s.name} לפני היציאה`, why: 'שעות, הזמנה מראש וסגירות לא מופיעים באפליקציה — רק אצל המפעיל.', when: Math.max(0, until - 1),
      source: { kind: 'unknown', label: 'עוד לא נבדק' }, action: { label: 'לאתר המפעיל', to: s.officialUrl } });
    else if (c.booking === 'required') out.push({ id: `book-${s.id}`, level: 'warn', title: `${s.name}: נדרשת הזמנה מראש`, why: `לפי הבדיקה שלכם מ-${fmtDate(c.at)}. ודאו שההזמנה בוצעה.`, when: Math.max(0, until - 2),
      source: { kind: 'verified', label: `הבדיקה שלכם · ${fmtDate(c.at)}`, url: c.url }, action: c.url ? { label: 'לאתר ההזמנה', to: c.url } : undefined });
  }

  // 7 · gear in this trip that is due for its periodic check
  const inTrip = new Set(t.packing.filter(p => !p.removed && p.inventoryId).map(p => p.inventoryId!));
  const toCheck = x.inventory.filter(g => inTrip.has(g.id) && needsCheck(g, today));
  if (toCheck.length && until >= 0)
    out.push({ id: 'gearcheck', level: 'todo', title: `${toCheck.length} פריטי ציוד לבדוק לפני היציאה`, why: toCheck.slice(0, 4).map(g => g.name).join(', ') + (toCheck.length > 4 ? '…' : ''), when: Math.max(0, until - 2),
      source: { kind: 'auto', label: 'מחסן הציוד שלכם' }, action: { label: 'למחסן', to: '/gear/inventory' } });

  // 8 · borrowed gear: take it back home / return it
  const borrowed = x.inventory.filter(g => inTrip.has(g.id) && g.borrowedFrom?.trim());
  if (borrowed.length && until <= 0)
    out.push({ id: 'return', level: 'info', title: 'ציוד מושאל להחזיר אחרי הטיול', why: borrowed.map(g => `${g.name} ← ${g.borrowedFrom}`).join(' · '), when: diffDays(today, t.end),
      source: { kind: 'auto', label: 'מחסן הציוד שלכם' } });

  // 9 · several families: what nobody took yet
  if (isGroup(t)) {
    const { unassigned } = dutySummary(t, x.shopLines);
    if (unassigned.meals + unassigned.shop)
      out.push({ id: 'duties', level: until <= 3 ? 'warn' : 'todo', title: 'עוד לא נקבע מי מכין ומי קונה', why: [unassigned.meals && `${unassigned.meals} ארוחות`, unassigned.shop && `${unassigned.shop} פריטי קנייה`].filter(Boolean).join(' · ') + ' בלי משפחה אחראית.', when: Math.max(0, until - 3),
        source: { kind: 'auto', label: 'חלוקת האחריות בטיול' }, action: { label: 'לחלוקה', to: route('meals') } });
    const short = t.packing.filter(p => !p.removed && itemFamily(t, p) === null && p.brings && coverage(p).missing);
    if (short.length)
      out.push({ id: 'brings', level: 'todo', title: 'ציוד משותף שעוד חסר', why: short.slice(0, 4).map(p => `${p.name}: חסרים ${coverage(p).missing}`).join(' · '), when: Math.max(0, until - 2),
        source: { kind: 'auto', label: '"מי מביא כמה" בטיול' }, action: { label: 'לציוד', to: route('gear') } });
  }

  // 10 · measured trunk: things that won't fit
  if (x.trunk && until >= 0 && until <= 7) {
    const res = packTrunk(x.trunk, trunkInputs(x.boxes, x.inventory, t));
    if (res.unplaced.length)
      out.push({ id: 'trunk', level: 'warn', title: `${res.unplaced.length} פריטים לא נכנסים לתא המטען`, why: `${[...new Set(res.unplaced.map(u => u.name))].join(', ')} — לפי המידות שמדדתם.`, when: Math.max(0, until - 1),
        source: { kind: 'auto', label: 'העמסה לפי מידות' }, action: { label: 'לתכנון ההעמסה', to: '/gear/car' } });
  }

  return out.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.when - b.when);
}
