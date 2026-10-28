// Meals, shopping list, day schedule and pre-trip tasks.
import type { DietPrefs, MealSlot, MealType, ScheduleItem, TaskItem, Trip, Site } from '../lib/types';
import { RECIPES, RECIPE_BY_ID, type Recipe } from '../data/recipes';
import { planMenu, grillItemsFor, grillIngredients, dishContext, type MenuTrip } from './menu';
import type { DayWx } from '../services/weather';
import { T } from './weatherRules';
import { tripLength, uid } from '../lib/util';

export function allowedRecipes(diet: DietPrefs) {
  return RECIPES.filter(r => (!diet.vegetarian || r.vegetarian || r.vegan) && (!diet.vegan || r.vegan) && !r.allergens.some(a => diet.allergies.includes(a)));
}

/** Shared menu built from each family's diet (see engine/menu). */
export function planMeals(trip: MenuTrip, diet: DietPrefs): MealSlot[] { return planMenu(trip, diet); }

export interface ShopLine { key: string; name: string; qty: number; unit: string; shop: string; label: string; recipes: string[] }
const nice = (q: number, unit: string): [number, string] => {
  if (unit === 'גר׳') { const g = Math.ceil(q / 50) * 50; return g >= 1000 ? [Math.ceil(g / 100) / 10, 'ק״ג'] : [g, 'גר׳']; }
  if (unit === 'מ״ל') { const m = Math.ceil(q / 50) * 50; return m >= 1000 ? [Math.ceil(m / 100) / 10, 'ליטר'] : [m, 'מ״ל']; }
  if (unit === 'שן') { const h = Math.ceil(q / 10); return [h, h === 1 ? 'ראש' : 'ראשים']; } // a head of garlic ≈ 10 cloves
  return [Math.ceil(q - 1e-9), unit];
};
/** "3", "1.5 ק״ג", "2 ראשים" — counts of whole items read without a unit. */
export const qtyLabel = (q: number, unit: string) => (unit === 'יח׳' ? `${q}` : `${q.toLocaleString('he-IL')} ${unit}`);

export function shoppingList(meals: MealSlot[], t?: MenuTrip, diet?: DietPrefs): ShopLine[] {
  const m = new Map<string, ShopLine>();
  const add = (i: { name: string; qty: number; unit: string; shop: string }, n: number, label: string) => {
    const key = `${i.name}|${i.unit}`;
    const l = m.get(key) ?? { key, name: i.name, qty: 0, unit: i.unit, shop: i.shop, label: '', recipes: [] };
    l.qty += i.qty * n; if (!l.recipes.includes(label)) l.recipes.push(label); m.set(key, l);
  };
  for (const s of meals) {
    for (const which of ['main', 'alt'] as const) {
      const id = which === 'main' ? s.recipeId : s.alt?.recipeId; const r = id ? RECIPE_BY_ID[id] : null; if (!r) continue;
      const n = which === 'main' ? s.eq ?? s.servings : s.alt!.eq ?? s.alt!.servings; if (!n) continue;
      for (const i of r.ingredients) add(i, n, r.name);
      if (r.grill && t && diet) for (const i of grillIngredients(grillItemsFor(r.grill, t, dishContext(t, diet, s, which)))) add(i, n, r.name);
    }
  }
  return [...m.values()].map(l => { const [q, u] = nice(l.qty, l.unit); return { ...l, qty: q, unit: u, label: qtyLabel(q, u) }; }).sort((a, b) => SHOP_ORDER.indexOf(a.shop) - SHOP_ORDER.indexOf(b.shop) || a.name.localeCompare(b.name, 'he'));
}
export const SHOP_ORDER = ['fresh', 'meat', 'cold', 'bakery', 'dry', 'drinks', 'alcohol'];
export const SHOP_LABEL: Record<string, string> = { fresh: 'ירקות ופירות', meat: 'בשר ועוף', cold: 'מקרר — חלב, ביצים ומוכנים', bakery: 'מאפים ולחם', dry: 'מזווה ויבשים', drinks: 'שתייה', alcohol: 'אלכוהול (18+)' };

export function buildSchedule(trip: Trip, days: DayWx[], sites: Site[]): ScheduleItem[] {
  const { days: n } = tripLength(trip.start, trip.end);
  const out: ScheduleItem[] = [];
  const add = (day: number, time: string, title: string, kind: ScheduleItem['kind'], note?: string) => out.push({ id: uid('s'), day, time, title, kind, note });
  const acts = [...sites];
  const nextAct = () => acts.shift();
  for (let d = 0; d < n; d++) {
    const w = days.find(x => x.date === addDaysLocal(trip.start, d));
    const hot = w ? w.tMax >= T.heat : false;
    const sunset = w?.sunset;
    const morning = hot ? '06:30' : '09:00', afternoon = hot ? '16:30' : '14:30';
    const heatNote = hot && w ? `מקסימום ${Math.round(w.tMax)}° — פעילות בשעות הקרירות` : undefined;
    if (d === 0) {
      add(d, '08:00', 'יציאה מהבית', 'drive', 'שעה מוצעת — לעדכן לפי זמן הנסיעה');
      const a = nextAct(); if (a) add(d, '11:00', a.name, 'activity', heatNote);
      add(d, '13:00', 'ארוחת צהריים', 'meal');
      if (trip.kind !== 'day') add(d, '15:00', 'הגעה והקמת המחנה', 'camp', sunset ? `שקיעה ${sunset} — לסיים להקים לפני החשכה` : 'לסיים להקים לפני החשכה');
      if (trip.kind !== 'day') { add(d, '19:00', 'ארוחת ערב', 'meal'); add(d, '20:30', 'ערב סביב המנגל / סיפורים', 'rest'); }
      else add(d, '16:00', 'חזרה הביתה', 'drive');
      continue;
    }
    add(d, '07:30', 'ארוחת בוקר', 'meal');
    if (d === n - 1) {
      add(d, '09:00', 'קיפול המחנה', 'pack', 'לייבש אוהל ו-Tarp לפני קיפול, לספור יתדות');
      const a = nextAct(); if (a) add(d, '11:00', a.name, 'activity', heatNote);
      add(d, '13:00', 'ארוחת צהריים', 'meal'); add(d, '14:30', 'נסיעה הביתה', 'drive');
    } else {
      const a = nextAct(); add(d, morning, a?.name ?? 'מסלול בוקר', 'activity', heatNote);
      add(d, '13:00', 'ארוחת צהריים', 'meal');
      if (hot) add(d, '13:30', 'מנוחה בצל', 'rest', 'שעות החום');
      const b = nextAct(); add(d, afternoon, b?.name ?? 'פעילות אחר הצהריים', 'activity');
      add(d, '19:00', 'ארוחת ערב', 'meal');
    }
  }
  return out;
}
function addDaysLocal(s: string, n: number) { const [y, m, d] = s.split('-').map(Number); const x = new Date(y, m - 1, d + n); const z = (k: number) => String(k).padStart(2, '0'); return `${x.getFullYear()}-${z(x.getMonth() + 1)}-${z(x.getDate())}`; }

const WHEN_OFFSET: Record<string, number> = { 'שבוע לפני': -7, 'יום-יומיים לפני': -2, 'ערב לפני': -1, 'בוקר היציאה': 0, 'רגע לפני': 0, 'בסיום הטיול': 999 };
export function buildTasks(seed: { when: string; text: string }[], trip: Trip, sites: Site[]): TaskItem[] {
  const t: TaskItem[] = [];
  const add = (when: string, text: string) => t.push({ id: uid('t'), when, text, done: false, dueOffsetDays: WHEN_OFFSET[when] ?? 0 });
  add('שבוע לפני', 'לבדוק באתר המפעיל שהאתרים פתוחים ואת תנאי הכניסה');
  const lodging = sites.filter(s => s.lodging);
  if (trip.kind !== 'day' && lodging.length) add('שבוע לפני', `להזמין מקום לינה: ${lodging.map(s => s.name).join(', ')}`);
  if (trip.kind !== 'day' && !lodging.length) add('שבוע לפני', 'לבחור ולהזמין מקום לינה');
  add('שבוע לפני', 'לעבור על רשימת הציוד ולהזמין את מה שחסר');
  add('ערב לפני', 'לרענן את התחזית באפליקציה ולעדכן את רשימת הציוד');
  for (const s of seed) add(s.when, s.text);
  if (trip.pets) add('יום-יומיים לפני', 'לבדוק מדיניות חיות מחמד באתרים');
  add('בוקר היציאה', 'לשתף את תוכנית הטיול עם מישהו שלא מצטרף');
  return t.sort((a, b) => a.dueOffsetDays - b.dueOffsetDays);
}
export { RECIPES };
export type { Recipe };
