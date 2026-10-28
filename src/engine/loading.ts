// Car loading advice. Volumes come only from measured box dimensions or user-entered item volumes;
// nothing is guessed. Advice items always say why they apply.
import type { Box, GearItem, Trip } from '../lib/types';
import type { VehicleSpec } from '../data/vehicles';

export interface LoadRow { name: string; liters: number | null; weightKg?: number; zone: 'floor-back' | 'floor' | 'gaps' | 'door' | 'cabin'; why: string; kind: 'box' | 'bag' | 'item' }
export interface Advice { id: string; level: 'ok' | 'info' | 'warn' | 'danger'; title: string; body: string }
export interface LoadPlan { capacity: number | null; capacityWhy: string; used: number; unknown: string[]; pct: number | null; rows: LoadRow[]; advice: Advice[]; stackable: string[][] }

export const boxLiters = (b: Box) => (b.dims ? Math.round((b.dims[0] * b.dims[1] * b.dims[2]) / 1000) : null);
const has = (s: string, ...w: string[]) => w.some(x => s.includes(x));

export function capacityFor(spec: VehicleSpec | null | undefined, manual: number | undefined, people: number): { liters: number | null; why: string; warn?: string } {
  if (spec) {
    if (people > 5 && spec.seats === 7) {
      if (spec.liters7) return { liters: spec.liters7, why: `${spec.model} עם 7 מושבים פתוחים (${people} נוסעים): ${spec.liters7} ל׳` };
      return { liters: null, why: `${spec.model}: ${people} נוסעים מחייבים את השורה השלישית, ונפח תא המטען במצב הזה לא פורסם`, warn: 'עם השורה השלישית פתוחה נשאר מקום קטן מאוד לציוד' };
    }
    if (people > 5) return { liters: null, why: `${spec.model} מתאים ל-5 נוסעים, ובטיול ${people} משתתפים`, warn: `הרכב רשום ל-${spec.seats} מושבים — צריך רכב נוסף או רכב גדול יותר` };
    return { liters: spec.liters5, why: `${spec.model}, ${spec.seats === 7 ? 'שורה שלישית מקופלת' : 'כל המושבים פתוחים'}: ${spec.liters5} ל׳ (${spec.source})` };
  }
  if (manual) return { liters: manual, why: `נפח שהוזן ידנית: ${manual} ל׳` };
  return { liters: null, why: 'לא הוגדר רכב או נפח תא מטען' };
}

export function planLoad(opts: { spec?: VehicleSpec | null; manualLiters?: number; trip?: Trip | null; boxes: Box[]; inventory: GearItem[] }): LoadPlan {
  const { spec, manualLiters, trip, boxes, inventory } = opts;
  const people = trip ? trip.adults + trip.children : 5;
  const cap = capacityFor(spec, manualLiters, people);
  const packing = trip?.packing.filter(p => !p.removed) ?? [];
  const going = (g: GearItem) => (trip ? packing.some(p => p.inventoryId === g.id) : g.available !== false);
  const usedBoxes = boxes.filter(b => !trip || packing.some(p => p.boxId === b.id));
  const big = inventory.filter(g => !g.boxId && g.big && going(g) && !has(g.name, 'קרחומים'));

  const rows: LoadRow[] = [];
  for (const b of usedBoxes) {
    const l = boxLiters(b);
    const heavyKitchen = has(b.name, 'מטבח', 'חשמל');
    const zone: LoadRow['zone'] = b.kind === 'bag' ? (has(b.name, 'אוהל') ? 'floor-back' : 'gaps') : has(b.name, 'ניקיון', 'היגיינה') ? 'door' : 'floor-back';
    const why = has(b.name, 'אוהל') ? 'ארוך וכבד, נפרק ראשון בהגעה — לאורך הרצפה' : heavyKitchen ? 'כבד וקשיח — נמוך וצמוד למשענת המושב' : b.kind === 'bag' ? 'רך וגמיש — ממלא חללים בין הארגזים' : 'ארגז עזרה ראשונה וניקיון — נגיש ליד הדלת';
    rows.push({ name: b.name, liters: l, weightKg: b.weightKg, zone, why, kind: b.kind });
  }
  for (const g of big) {
    const vol = g.volumeL ?? null;
    const zone: LoadRow['zone'] = has(g.name, 'צידנית', 'מים') ? 'door' : has(g.name, 'מזרן', 'שולחן', 'כיסא', 'מחצלת') ? 'floor' : 'gaps';
    const why = has(g.name, 'צידנית') ? 'נפתחת בדרך — אחרונה, ליד הדלת' : has(g.name, 'מים') ? 'כבד — על הרצפה ליד הדלת, מקובע' : has(g.name, 'שולחן', 'כיסא') ? 'שטוח ומקופל — על הרצפה או לאורך הדופן' : has(g.name, 'מזרן') ? 'מקופל — מעל הארגזים הקשיחים, מתחת לקו המשענת' : 'ממלא חלל פנוי';
    rows.push({ name: g.qty > 1 ? `${g.name} ×${g.qty}` : g.name, liters: vol ? vol * g.qty : null, zone, why, kind: 'item' });
  }
  const order: LoadRow['zone'][] = ['floor-back', 'floor', 'gaps', 'door', 'cabin'];
  rows.sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone) || (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.liters ?? 0) - (a.liters ?? 0));
  const used = rows.reduce((s, r) => s + (r.liters ?? 0), 0);
  const unknown = rows.filter(r => r.liters == null).map(r => r.name);
  const pct = cap.liters ? Math.round((used / cap.liters) * 100) : null;

  // Boxes sharing a base footprint can be stacked.
  const byBase = new Map<string, string[]>();
  for (const b of usedBoxes) if (b.kind === 'box' && b.dims) { const k = [b.dims[0], b.dims[1]].sort((x, y) => x - y).join('×'); byBase.set(k, [...(byBase.get(k) ?? []), b.name]); }
  const stackable = [...byBase.values()].filter(g => g.length > 1);

  const advice: Advice[] = [];
  if (cap.warn) advice.push({ id: 'seats', level: 'danger', title: 'מקום הנוסעים', body: cap.warn });
  if (pct != null) {
    if (pct > 100) advice.push({ id: 'over', level: 'danger', title: 'הציוד הנמדד גדול מתא המטען', body: `${used} ל׳ מול ${cap.liters} ל׳. כדאי להוציא ציוד שלא חיוני, לעבור לתיקים רכים, או לשקול ארגז גג. ציוד שאין לו מידות לא נכלל בחישוב — המצב בפועל צפוף יותר.` });
    else if (pct > 80 || (pct > 60 && unknown.length)) advice.push({ id: 'tight', level: 'warn', title: 'העמסה צפופה', body: `${pct}% מנפח תא המטען לפני ${unknown.length} פריטים ללא מידות. מומלץ לבצע העמסת ניסיון יום לפני היציאה.` });
    else advice.push({ id: 'room', level: unknown.length ? 'info' : 'ok', title: unknown.length ? 'מרווח לפי הארגזים הנמדדים' : 'יש מרווח', body: `${pct}% מהנפח לפי הארגזים הנמדדים. השאירו את המרווח לציוד הגדול ולקניות בדרך.` });
  } else advice.push({ id: 'nocap', level: 'info', title: 'הגדירו רכב', body: 'בחרו דגם רכב או הזינו נפח תא מטען כדי לקבל השוואה מספרית.' });
  if (stackable.length) advice.push({ id: 'stack', level: 'info', title: 'ארגזים שאפשר לערום', body: stackable.map(g => g.join(' + ')).join(' · ') + ' — אותו בסיס. הכבד למטה.' });
  if (unknown.length) advice.push({ id: 'unknown', level: 'info', title: 'פריטים בלי נפח', body: `${unknown.join(', ')}. הוסיפו נפח משוער במאגר הציוד כדי לכלול אותם בחישוב.` });
  advice.push({ id: 'low', level: 'info', title: 'כבד נמוך וקדימה', body: 'ארגזים כבדים על רצפת תא המטען וצמודים למשענת המושב האחורי. כך מרכז הכובד נמוך והם לא נעים בבלימה.' });
  advice.push({ id: 'line', level: 'warn', title: 'לא מעל קו המשענת', body: 'אל תעמיסו מעל גובה משענות המושבים בלי רשת או מחיצה — ציוד רופף מסוכן בבלימה ומסתיר את החלון האחורי.' });
  advice.push({ id: 'access', level: 'info', title: 'מה צריך בדרך — אחרון', body: 'צידנית, מים, ערכת עזרה ראשונה ושקית זבל ליד הדלת. ציוד הילדים לנסיעה — בתא הנוסעים.' });
  if (packing.some(p => p.name.includes('מאוורר') || p.name.includes('Baseus') || p.name.includes('Anker'))) advice.push({ id: 'batt', level: 'info', title: 'סוללות וטעינה', body: 'סוללות הגיבוי בתא הנוסעים ולא בשמש — ואפשר לטעון אותן בדרך.' });
  if (spec?.litersFolded && pct != null && pct > 100) advice.push({ id: 'fold', level: 'info', title: 'קיפול מושב', body: `עם מושבים מקופלים הנפח מגיע ל-${spec.litersFolded} ל׳ — רלוונטי רק אם יש מושבים פנויים (${people} נוסעים).` });
  return { capacity: cap.liters, capacityWhy: cap.why, used, unknown, pct, rows, advice, stackable };
}

export const ZONE_HE: Record<LoadRow['zone'], string> = { 'floor-back': 'רצפה, צמוד למשענת', floor: 'רצפה / לאורך הדופן', gaps: 'מילוי חללים', door: 'ליד הדלת — נגיש', cabin: 'תא הנוסעים' };
