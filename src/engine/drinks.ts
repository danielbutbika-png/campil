// Drinks for a trip: water (official recommendation), soft drinks and alcohol (adjustable estimates).
import type { Trip, Settings, DrinkPlan } from '../lib/types';
import { tripLength } from '../lib/util';
import { qtyLabel } from './planner';

const SINGULAR: Record<string, string> = { 'שישיות': 'שישייה', 'בקבוקים': 'בקבוק' };

/** Desert / southern regions, where the recommendation is 5 L per person. */
export const DESERT = new Set(['arava', 'eilat', 'central_negev', 'north_negev', 'judean_desert']);
export const WATER_SOURCE = { label: 'קק״ל ורשות הטבע והגנים: לפחות 3 ליטר לאדם, 5 ליטר בדרום ובמדבר', url: 'https://www.ias.co.il/?p=127045' };
export const DRINK_DEFAULTS = { softL: 0.5, beerPerAdult: 2, adultsPerWine: 3 };

type T = Pick<Trip, 'start' | 'end' | 'kind' | 'regionId' | 'adults' | 'children'> & Partial<Pick<Trip, 'participants' | 'drinks'>>;

export function waterPerPerson(t: T, s: Pick<Settings, 'waterLitersPerPersonDay'>): { liters: number; why: string } {
  if (t.drinks?.waterL) return { liters: t.drinks.waterL, why: 'כמות שהגדרתם לטיול' };
  if (s.waterLitersPerPersonDay) return { liters: s.waterLitersPerPersonDay, why: 'כמות שהגדרתם בהגדרות' };
  const desert = !!t.regionId && DESERT.has(t.regionId);
  return { liters: desert ? 5 : 3, why: desert ? 'המלצה לדרום ולמדבר: 5 ליטר לאדם' : 'המלצה: לפחות 3 ליטר לאדם' };
}

export interface DrinkLine { key: string; name: string; qty: number; unit: string; shop: 'drinks' | 'alcohol'; label: string; recipes: string[] }

export function drinkPlan(t: T, s: Pick<Settings, 'waterLitersPerPersonDay'>) {
  const { days, nights } = tripLength(t.start, t.end);
  const people = t.participants?.length || t.adults + t.children;
  const adults = t.participants?.length ? t.participants.filter(p => (p.age ?? (p.role === 'adult' ? 30 : 10)) >= 18).length : t.adults;
  const d: Required<DrinkPlan> = { waterL: 0, softL: DRINK_DEFAULTS.softL, beerPerAdult: DRINK_DEFAULTS.beerPerAdult, adultsPerWine: DRINK_DEFAULTS.adultsPerWine, alcohol: t.kind !== 'day', ...stripUndef(t.drinks ?? {}) } as Required<DrinkPlan>;
  const w = waterPerPerson(t, s);
  const waterL = Math.ceil(w.liters * people * days);
  const softL = d.softL * people * days;
  const evenings = t.kind === 'day' ? 1 : nights;
  const lines: DrinkLine[] = [];
  const add = (name: string, qty: number, unit: string, shop: DrinkLine['shop'], why: string) => { if (qty > 0) { const u = qty === 1 ? SINGULAR[unit] ?? unit : unit; lines.push({ key: `drink|${name}`, name, qty, unit: u, shop, label: qtyLabel(qty, u), recipes: [why] }); } };
  add('מים מינרליים 1.5 ל׳ (שישיות)', Math.ceil(waterL / 9), 'שישיות', 'drinks', `${w.liters} ל׳ × ${people} משתתפים × ${days} ימים = ${waterL} ל׳ · ${w.why}`);
  add('שתייה קלה / מיץ 1.5 ל׳', Math.ceil(softL / 1.5), 'בקבוקים', 'drinks', `${d.softL} ל׳ לאדם ליום × ${people} × ${days} ימים (הערכה)`);
  if (d.alcohol && adults) {
    add('בירה (בקבוק/פחית 330 מ״ל)', Math.ceil(d.beerPerAdult * adults * evenings), 'יח׳', 'alcohol', `${d.beerPerAdult} לכל מבוגר לערב × ${adults} מבוגרים × ${evenings} ערבים (הערכה)`);
    add('יין (בקבוק 750 מ״ל)', Math.ceil((adults / d.adultsPerWine) * evenings), 'בקבוקים', 'alcohol', `בקבוק לכל ${d.adultsPerWine} מבוגרים לערב × ${evenings} ערבים (הערכה)`);
  }
  return { lines, people, adults, days, evenings, water: { ...w, total: waterL }, plan: d };
}
const stripUndef = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
