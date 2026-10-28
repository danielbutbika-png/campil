// Division of responsibility between families in a shared trip: who prepares each meal, who buys each
// shopping line, who handles each task — and how far each family has got.
import type { Duty, Family, Trip } from '../lib/types';
import type { ShopLine } from './planner';
import { coverage } from './partial';
import { itemFamily } from '../lib/families';

export const dutyKey = { meal: (id: string) => `meal:${id}`, shop: (key: string) => `shop:${key}`, task: (id: string) => `task:${id}` };

export function setDuty(t: Pick<Trip, 'duties'>, key: string, p: Partial<Duty>): Record<string, Duty> {
  const next = { ...(t.duties ?? {}) };
  const d = { ...(next[key] ?? {}), ...p };
  for (const k of Object.keys(d) as (keyof Duty)[]) if (d[k] === undefined || d[k] === '') delete d[k];
  if (Object.keys(d).length) next[key] = d; else delete next[key];
  return next;
}

export interface FamilyDuties { family: Family; meals: number; mealsDone: number; shop: number; bought: number; tasks: number; tasksDone: number; brings: number }
/** Per family: what it took on and how much is done. `unassigned` counts what nobody has taken yet. */
export function dutySummary(t: Trip, lines: ShopLine[]) {
  const fams = t.families ?? [];
  const rows: FamilyDuties[] = fams.map(f => ({ family: f, meals: 0, mealsDone: 0, shop: 0, bought: 0, tasks: 0, tasksDone: 0, brings: 0 }));
  const by = (id?: string) => rows.find(r => r.family.id === id);
  const d = t.duties ?? {};
  const unassigned = { meals: 0, shop: 0, tasks: 0, missingUnits: 0 };
  for (const m of t.meals) { if (!m.recipeId) continue; const x = d[dutyKey.meal(m.id)]; const r = by(x?.familyId); if (r) { r.meals++; if (x!.done) r.mealsDone++; } else unassigned.meals++; }
  for (const l of lines) { if (t.pantry[l.key]) continue; const x = d[dutyKey.shop(l.key)]; const r = by(x?.familyId); if (r) { r.shop++; if (x!.done) r.bought++; } else unassigned.shop++; }
  for (const k of t.tasks) { const x = d[dutyKey.task(k.id)]; const r = by(x?.familyId); if (r) { r.tasks++; if (k.done) r.tasksDone++; } else if (!k.done) unassigned.tasks++; }
  for (const p of t.packing) {
    if (p.removed || itemFamily(t, p) !== null) continue;
    for (const [fid, n] of Object.entries(p.brings ?? {})) { const r = by(fid); if (r) r.brings += n; }
    unassigned.missingUnits += coverage(p).missing && p.brings ? coverage(p).missing : 0;
  }
  return { rows, unassigned };
}

/** Quick split of what nobody took yet: shopping by store section and meals by day, rotating between families,
 *  so each family shops in few places and cooks on its own days. Existing choices are kept. */
export function autoSplit(t: Trip, lines: ShopLine[]): Record<string, Duty> {
  const fams = t.families ?? []; if (fams.length < 2) return t.duties ?? {};
  let duties = { ...(t.duties ?? {}) };
  const sections = [...new Set(lines.filter(l => !t.pantry[l.key]).map(l => l.shop))];
  sections.forEach((sec, i) => { for (const l of lines) if (l.shop === sec && !t.pantry[l.key] && !duties[dutyKey.shop(l.key)]?.familyId) duties = setDuty({ duties }, dutyKey.shop(l.key), { familyId: fams[i % fams.length].id }); });
  const days = [...new Set(t.meals.map(m => m.day))].sort((a, b) => a - b);
  let i = 0;
  for (const day of days) for (const m of t.meals.filter(x => x.day === day && x.recipeId)) {
    if (!duties[dutyKey.meal(m.id)]?.familyId) duties = setDuty({ duties }, dutyKey.meal(m.id), { familyId: fams[i % fams.length].id });
    i++;
  }
  return duties;
}
