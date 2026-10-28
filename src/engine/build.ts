import type { Trip } from '../lib/types';
import type { State } from '../lib/store';
import { generatePacking, mergePacking, type WxSource } from './packing';
import { planMeals, buildSchedule, buildTasks } from './planner';
import { flagsFor, type WxFlags } from './weatherRules';
import type { DayWx } from '../services/weather';
import { SITE_BY_ID } from '../data/sites';
import { addDays, todayISO } from '../lib/util';
import { withCounts } from '../lib/store';

type S = Pick<State, 'members' | 'inventory' | 'template' | 'settings' | 'seedTasks'>;

export function packingSignature(t: Trip, flags: WxFlags, s: S) {
  const r = (n?: number) => (n == null ? '' : Math.round(n / 2));
  return JSON.stringify([t.start, t.end, t.adults, t.children, t.childAges, (t.participants ?? []).map(x => `${x.age}${x.gender}${x.familyId ?? ""}`), (t.families ?? []).length, JSON.stringify(t.diets ?? {}), t.pets, t.kind, t.lodging, t.interests, flags.known, r(flags.minT), r(flags.maxT), flags.rain, flags.wind, flags.uv, s.inventory.length, s.settings.waterLitersPerPersonDay, ...(t.types?.length ? [t.types, t.typeAnswers ?? {}] : [])]);
}

/** Fill a trip with its generated plan. Existing user edits are preserved where possible. */
export function materialize(t0: Trip, s: S, days: DayWx[] = [], flags: WxFlags = flagsFor(days), src: WxSource = days.length ? 'forecast' : 'season'): Trip {
  const t = withCounts(t0) as Trip;
  const sites = t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean);
  const packing = mergePacking(t.packing, generatePacking({ trip: t, inventory: s.inventory, template: s.template, settings: s.settings, flags, wxSource: src }));
  return {
    ...t, packing, packingGeneratedAt: new Date().toISOString(), packingSig: packingSignature(t, flags, s),
    meals: t.meals.length ? t.meals : planMeals(t, s.settings.diet),
    schedule: t.schedule.length ? t.schedule : buildSchedule(t, days, sites),
    tasks: t.tasks.length ? t.tasks : buildTasks(s.seedTasks, t, sites),
  };
}

export function exampleTrip(s: S, base: Trip): Trip {
  const start = addDays(todayISO(), 5);
  return materialize({ ...base, name: 'סופ״ש במעיין חרוד', example: true, start, end: addDays(start, 2), regionId: 'lower_galilee', siteIds: ['harod', 'sachne', 'beit-shean'], interests: ['family', 'water', 'camping', 'history'] }, s);
}
