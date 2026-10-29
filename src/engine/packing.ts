// Smart packing list. Quantity rules are explicit and shown to the user as the item's "reason".
import { ageOf } from '../lib/people';
import type { GearItem, Member, PackItem, PersonalTemplateItem, Settings, Trip, CategoryId } from '../lib/types';
import type { WxFlags } from './weatherRules';
import { tripLength, seasonOf } from '../lib/util';
import { waterPerPerson } from './drinks';
import { typeGear, scale } from './tripTypes';

export type WxSource = 'forecast' | 'climate' | 'season';
export interface PackContext { trip: Trip; members?: Member[]; inventory: GearItem[]; template: PersonalTemplateItem[]; settings: Settings; flags: WxFlags; wxSource: WxSource }

const has = (name: string, ...w: string[]) => w.some(x => name.includes(x));
const FAN = ['מאוורר', 'FS-6P', 'להבים'];
const PER_PERSON = ['צלחות', 'קערות', 'כוסות', 'סכו״ם', 'כריות', 'שמיכות', 'כיסאות', 'מברשות שיניים'];
const DAY_TRIP_CATS: CategoryId[] = ['firstaid', 'food', 'cooling'];
const DAY_TRIP_NAMES = ['קרם הגנה', 'דוחה חרקים', 'מגבונים', 'אלכוג׳ל', 'נייר טואלט', 'שקיות זבל', 'מחצלת', 'כיסאות', 'Baseus', 'Anker', 'נייר סופג'];

/** Weather profile used for personal clothing: hot, cold or both (take the larger quantity). */
export function clothingProfile(flags: WxFlags, start: string): { hot: boolean; cold: boolean; why: string } {
  if (flags.known) {
    const hot = (flags.maxT ?? 0) >= 24, cold = (flags.minT ?? 99) <= 14 || flags.rain;
    if (hot || cold) return { hot, cold, why: `טווח ${Math.round(flags.minT!)}°–${Math.round(flags.maxT!)}°${flags.rain ? ', גשם' : ''}` };
    return { hot: true, cold: false, why: `טווח ${Math.round(flags.minT!)}°–${Math.round(flags.maxT!)}°` };
  }
  const s = seasonOf(start);
  return { hot: s !== 'winter', cold: s !== 'summer', why: 'לפי העונה (אין עדיין תחזית)' };
}

export function generatePacking(ctx: PackContext): PackItem[] {
  const { trip, inventory, template, settings, flags } = ctx;
  const { days, nights } = tripLength(trip.start, trip.end);
  const people = trip.adults + trip.children;
  // Group trip: the gear store belongs to the organiser's family (first); every family gets its own personal/basic items.
  const fams = trip.families && trip.families.length > 1 ? trip.families : null;
  const allPs = trip.participants ?? [];
  const famPs = (id: string) => allPs.filter(p => (p.familyId ?? fams![0].id) === id);
  const invPs = fams ? famPs(fams[0].id) : allPs;
  const invPeople = fams ? Math.max(1, invPs.length) : people;
  const dayTrip = trip.kind === 'day';
  const caravan = trip.lodging === 'caravan';
  const water = trip.interests.some(i => i === 'water' || i === 'beach');
  const fansNeeded = flags.known ? (flags.warmNight || flags.heat || (flags.maxT ?? 0) >= 28) : seasonOf(trip.start) === 'summer';
  const out: PackItem[] = [];
  let n = 0;
  const push = (p: Omit<PackItem, 'id' | 'packed'>) => out.push({ ...p, id: `${p.source}-${p.inventoryId ?? p.assignee ?? ''}-${n++}`, packed: false });

  // 1 · Inventory items
  for (const g of inventory) {
    if (g.available === false) continue;
    const name = g.name;
    if (dayTrip && !DAY_TRIP_CATS.includes(g.category) && !has(name, ...DAY_TRIP_NAMES)) continue;
    if (caravan && (g.category === 'tents' || has(name, 'מזרן', 'משאבה'))) continue;
    if (has(name, ...FAN) || (has(name, 'שלטים', 'USB-C') && has(name, 'מאוורר'))) {
      if (!fansNeeded) continue;
    }
    if (g.category === 'pets' && !trip.pets) continue;
    if (g.category === 'kids' && !invPs.some(p => p.role === 'child')) continue;
    let qty = g.qty, reason = g.boxId ? 'מהמאגר — לפי הארגז' : 'מהמאגר — ציוד גדול';
    if (has(name, ...FAN)) reason = flags.known ? `לילה חם/יום חם: עד ${Math.round(flags.maxT!)}° ביום, ${Math.round(flags.minT!)}° בלילה` : 'עונת הקיץ — ייבדק שוב מול התחזית';
    let missing = g.status === 'buy';
    if (has(name, ...PER_PERSON)) {
      const need = has(name, 'שמיכות') && flags.known && (flags.minT ?? 99) <= 8 ? invPeople * 2 : invPeople;
      if (has(name, 'שמיכות') && need > invPeople) reason = `שתיים לאדם — מינימום ${Math.round(flags.minT!)}° בלילה`;
      else reason = `אחד לכל משתתף (${invPeople})${fams ? ` ב${fams[0].name}` : ''}`;
      if (g.qty < need) { missing = true; reason += ` · במאגר ${g.qty}, חסרים ${need - g.qty}`; }
      qty = need;
    }
    // Gender / age specific household items follow the actual participants of this trip.
    const ps = invPs;
    if (has(name, 'גילוח')) { const n = ps.filter(x => x.gender === 'm' && ageOf(x) >= 16).length; if (!n) continue; reason = `${n} משתתפים בגיל 16+`; }
    if (has(name, 'היגיינה נשית')) { const n = ps.filter(x => x.gender === 'f' && ageOf(x) >= 11).length; if (!n) continue; reason = `${n} משתתפות בגיל 11+`; }
    if (has(name, 'גומיות', 'סיכות שיער')) { const n = ps.filter(x => x.gender === 'f').length; if (!n) continue; reason = `${n} משתתפות`; }
    if (has(name, 'דאודורנט')) { const n = ps.filter(x => ageOf(x) >= 10).length; if (!n) continue; qty = n; reason = `אחד לכל משתתף בגיל 10+ (${n})`; }
    if (g.status === 'check') reason += ' · לבדוק קיום ותקינות';
    if (g.status === 'buy') reason += ' · מסומן במאגר כ"צריך להשלים"';
    if (g.charge) reason += ' · לטעון לפני היציאה';
    push({ name, category: g.category, qty, reason, source: 'inventory', inventoryId: g.id, boxId: g.boxId ?? null, missing });
  }

  // 2 · Personal clothing per family member (template = quantities for one night)
  const prof = clothingProfile(flags, trip.start);
  const selected = trip.participants ?? [];
  const daily = ['תחתונים', 'גרביים'];
  for (const m of selected) {
    for (const t of template) {
      if (has(t.name, 'בגד ים') && !water) continue;
      if (dayTrip && has(t.name, 'פיג׳מה', 'תחתונים', 'גרביים', 'מגבת', 'כפכפים')) continue;
      let base = Math.max(prof.hot ? t.hot : 0, prof.cold ? t.cold : 0);
      if (base === 0) continue;
      let reason = `תבנית אישית · ${prof.why}`;
      const isShirt = has(t.name, 'חולצה קצרה') && prof.hot || has(t.name, 'חולצה ארוכה') && prof.cold;
      if (!dayTrip && nights > 1 && (daily.some(d => t.name.includes(d)) || isShirt)) {
        base += nights - 1; reason = `בסיס ללילה אחד + 1 לכל לילה נוסף (${nights} לילות)`;
      }
      if (m.age != null && m.age < 6 && !dayTrip && (has(t.name, 'חולצה קצרה') && prof.hot || has(t.name, 'חולצה ארוכה') && prof.cold || has(t.name, 'מכנס ארוך'))) { base += 1; reason += ' · +1 החלפה לגיל ' + m.age; }
      if (m.age != null && m.age < 6 && dayTrip && has(t.name, 'חולצה')) { base = Math.max(base, 1) + 1; reason = `סט החלפה לגיל ${m.age}`; }
      push({ name: t.name, category: has(t.name, 'נעלי', 'כפכפים') ? 'shoes' : 'clothing', qty: base, reason, source: 'personal', assignee: m.id, boxId: 'b05' });
    }
  }

  // 3 · Rule-based additions (not in inventory)
  const rule = (name: string, category: CategoryId, qty: number, reason: string, unit?: string) => {
    if (inventory.some(g => g.name.includes(name))) return;
    push({ name, category, qty, reason, source: 'rule', unit, missing: false });
  };
  { const w = waterPerPerson(trip, settings); const liters = Math.ceil(w.liters * people * days);
    rule('מים לשתייה', 'food', Math.ceil(liters / 9), `${w.liters} ל׳ × ${people} משתתפים × ${days} ימים = ${liters} ל׳ (שישייה = 9 ל׳) · ${w.why}`, 'שישיות'); }
  /** A rule per family (quantities from that family's people) on group trips; one rule otherwise. */
  const perFamily = (name: string, category: CategoryId, qty: (ps: Member[]) => number, reason: (ps: Member[]) => string, unit?: string) => {
    if (!fams) { const q = qty(allPs); if (q > 0) rule(name, category, q, reason(allPs), unit); return; }
    fams.forEach((f, i) => {
      if (i === 0 && inventory.some(g => g.name.includes(name))) return;
      const ps = famPs(f.id); const q = qty(ps); if (!ps.length || q <= 0) return;
      push({ name, category, qty: q, reason: `${reason(ps)} · ${f.name}`, source: 'rule', unit, missing: false, familyId: f.id });
    });
  };
  const kids = (ps: Member[]) => ps.filter(p => p.role === 'child');
  if (flags.rain) { perFamily('שקיות אטומות לבגדים', 'misc', ps => ps.length, () => 'גשם בתחזית'); rule('כיסוי עמיד למים לציוד', 'tents', 1, 'גשם בתחזית'); }
  if (flags.cold && !dayTrip) { perFamily('שכבה תרמית לשינה', 'clothing', ps => ps.length, () => `מינימום ${Math.round(flags.minT!)}° בלילה`); perFamily('בידוד מהקרקע (מזרן שטח / שמיכת פיקניק)', 'sleep', () => 1, () => `מינימום ${Math.round(flags.minT!)}° בלילה`); }
  if (flags.heat) { perFamily('מגבת קירור / בנדנה לכל משתתף', 'clothing', ps => ps.length, () => `מקסימום ${Math.round(flags.maxT!)}°`); perFamily('בקבוק מים אישי', 'food', ps => ps.length, () => `מקסימום ${Math.round(flags.maxT!)}°`); }
  if (flags.uv) perFamily('משקפי שמש', 'clothing', ps => ps.length, () => 'מדד UV גבוה בתחזית');
  if (flags.wind && !dayTrip && !caravan) perFamily('יתדות וחבלי עיגון נוספים', 'tents', () => 1, () => 'משבי רוח חזקים בתחזית');
  if (trip.children > 0) {
    perFamily('פנס ראש אישי לכל ילד', 'kids', ps => kids(ps).length, ps => `${kids(ps).length} ילדים`);
    rule('משחקי קופסה / קלפים', 'kids', 1, 'לשעות הערב ולמנוחת צהריים');
    perFamily('חיתולים ומגבונים לתינוק', 'kids', ps => (kids(ps).some(p => (p.age ?? 99) < 3) ? 1 : 0), () => 'ילד מתחת לגיל 3');
  }
  if (trip.pets) { rule('אוכל לחיית המחמד', 'pets', days, `${days} ימים`, 'מנות'); rule('קערות מים ואוכל', 'pets', 2, 'חיית מחמד מצטרפת'); rule('רצועה ושקיות איסוף', 'pets', 1, 'חיית מחמד מצטרפת'); }
  perFamily('אפוד זוהר ומשולש אזהרה', 'car', () => 1, () => 'ציוד חובה ברכב — לוודא שנמצא');
  perFamily('מטען לרכב (USB)', 'car', () => 1, () => 'טעינת טלפונים בדרך');
  // Families other than the organiser's have no gear store here: list their basic sleeping/eating needs.
  if (fams) fams.slice(1).forEach(f => {
    const n = famPs(f.id).length; if (!n) return;
    const add = (name: string, category: CategoryId, qty: number, reason: string) => push({ name, category, qty, reason: `${reason} · ${f.name}`, source: 'rule', missing: false, familyId: f.id });
    if (!dayTrip) {
      if (trip.lodging === 'tent') add('אוהל משפחתי', 'tents', 1, 'לינה באוהל פרטי');
      if (!caravan) { add('שק שינה / שמיכה', 'sleep', n, `אחד לכל משתתף (${n})`); add('מזרן שינה', 'sleep', n, `אחד לכל משתתף (${n})`); add('כרית', 'sleep', n, `אחת לכל משתתף (${n})`); }
      add('פנס / תאורה לאוהל', 'misc', 1, 'תאורה בלילה');
    }
    add('כלי אוכל אישיים (צלחת, כוס, סכו״ם)', 'kitchen', n, `לכל משתתף (${n})`);
    add('כיסאות מתקפלים', 'misc', n, `לכל משתתף (${n})`);
  });
  if (!dayTrip) rule('קרש/צלחת ייצוב למנגל או גזייה', 'kitchen', 1, 'הבישול באתר');
  const diets = Object.values(trip.diets ?? {});
  if (diets.some(d => d.kashrut !== 'none')) rule('סט כלים נפרד לחלבי (מחבת, סכו״ם, קרש)', 'kitchen', 1, diets.some(d => d.kashrut === 'mehadrin') ? 'יש משפחות ששומרות כשרות למהדרין' : 'יש משפחות ששומרות כשרות');
  if (diets.some(d => d.style !== 'meat') && diets.some(d => d.style === 'meat')) rule('רשת או משטח נפרד לצלייה צמחונית', 'kitchen', 1, 'יש משפחות צמחוניות/טבעוניות');
  // 4 · Trip types (Trip Type Engine): gear the selected types call for, scaled to people or to a question's answer
  for (const g of typeGear(trip)) {
    const ans = g.qtyFrom ? trip.typeAnswers?.[g.qtyFrom] : undefined;
    if (typeof ans === 'number') { if (ans > 0) rule(g.name, g.category, ans, `${g.reason} (${ans})`, g.unit); continue; }
    if (g.perPeople) perFamily(g.name, g.category, ps => scale(g.qty, ps, days, fams?.length ?? 1), ps => `${g.reason} (${scale(g.qty, ps, days, fams?.length ?? 1)})`, g.unit);
    else { const q = scale(g.qty, allPs, days, fams?.length ?? 1); if (q > 0) rule(g.name, g.category, q, g.reason, g.unit); }
  }
  // No food on this trip: drop cooking gear and food — but never the drinking water.
  if (trip.noFood) return out.filter(p => !(p.category === 'kitchen' || (p.category === 'food' && !has(p.name, 'מים', 'בקבוק'))));
  return out;
}

/** Keep user state (packed, edits, manual items) when regenerating. */
export function mergePacking(prev: PackItem[], next: PackItem[]): PackItem[] {
  const key = (p: PackItem) => `${p.source}|${p.inventoryId ?? ''}|${p.assignee ?? ''}|${p.source === 'rule' ? p.familyId ?? '' : ''}|${p.name}`;
  const old = new Map(prev.map(p => [key(p), p]));
  const merged = next.map(p => { const o = old.get(key(p)); return o ? { ...p, id: o.id, packed: o.packed, removed: o.removed, boxId: o.boxId ?? p.boxId, assignee: o.assignee ?? p.assignee, familyId: o.familyId ?? p.familyId, packedBy: o.packedBy, packedAt: o.packedAt, qty: o.source === 'manual' ? o.qty : p.qty } : p; });
  return [...merged, ...prev.filter(p => p.source === 'manual')];
}

export function readiness(items: PackItem[]) {
  const live = items.filter(p => !p.removed);
  const done = live.filter(p => p.packed).length;
  const byCat = new Map<CategoryId, { total: number; done: number }>();
  for (const p of live) { const c = byCat.get(p.category) ?? { total: 0, done: 0 }; c.total++; if (p.packed) c.done++; byCat.set(p.category, c); }
  return { total: live.length, done, pct: live.length ? Math.round((done / live.length) * 100) : 0, missing: live.filter(p => p.missing && !p.packed).length, byCat };
}
