// Transparent match score: every point added or removed comes with a reason the UI shows.
import type { Interest, Site, Trip, Settings } from '../lib/types';
import type { WxFlags } from './weatherRules';
import { haversineKm, seasonOf, SEASON_HE, clamp } from '../lib/util';

export interface Taste { tags: Partial<Record<Interest, number>>; regions: Record<string, number>; favorites: string[] }
export interface Scored { site: Site; score: number; reasons: string[]; warnings: string[]; km?: number }

const INTEREST_HE: Record<Interest, string> = {
  water: 'מים ומעיינות', family: 'משפחתי', hiking: 'הליכה', views: 'תצפיות', beach: 'חופים', forest: 'יערות', desert: 'מדבר',
  accessible: 'נגיש', kids: 'קל לילדים', history: 'היסטוריה', camping: 'לינת שטח', picnic: 'פיקניק',
};
export { INTEREST_HE };

export function scoreSite(site: Site, trip: Partial<Trip>, flags: WxFlags | null, settings?: Settings, taste?: Taste): Scored {
  let score = 40; const reasons: string[] = []; const warnings: string[] = [];
  const add = (n: number, why: string) => { score += n; if (n > 0) reasons.push(why); else warnings.push(why); };

  if (trip.regionId && site.region === trip.regionId) add(20, 'באזור שבחרתם');
  const hits = (trip.interests ?? []).filter(i => site.tags.includes(i));
  if (hits.length) add(Math.min(24, hits.length * 8), `מתאים ל: ${hits.map(h => INTEREST_HE[h]).join(', ')}`);

  const kids = trip.children ?? 0, ages = trip.childAges ?? [];
  if (kids > 0 && site.family) add(10, 'מתאים למשפחות עם ילדים');
  if (kids > 0 && site.difficulty === 'hard') add(ages.some(a => a < 9) ? -25 : -10, 'מסלול קשה — פחות מתאים לילדים צעירים');
  if (trip.difficulty && trip.difficulty !== 'any' && site.difficulty) {
    if (site.difficulty === trip.difficulty) add(8, 'ברמת הקושי שביקשתם');
    else if (trip.difficulty === 'easy' && site.difficulty !== 'easy') add(-12, 'קשה מהרמה שביקשתם');
  }
  if (trip.interests?.includes('accessible') && site.stroller === 'yes') add(10, 'מתאים לעגלות');

  if (flags?.known) {
    if (flags.heat && site.tags.includes('water')) add(10, `מים ביום חם (${Math.round(flags.maxT!)}°)`);
    if (flags.heat && site.exposed) add(flags.extremeHeat ? -25 : -12, `חשוף לשמש ביום של ${Math.round(flags.maxT!)}°`);
    if (flags.rain && site.floodRisk) add(-35, 'ערוץ נחל עם סיכון שיטפון — גשם בתחזית');
    if ((flags.cold || flags.rain) && site.type === 'beach') add(-8, 'חוף ביום קר או גשום');
    if (flags.wind && site.type === 'campsite' && site.exposed) add(-10, 'אתר לינה חשוף ברוח חזקה');
  }
  if (trip.start) {
    const he = SEASON_HE[seasonOf(trip.start)];
    if (site.season && (site.season.includes(he) || site.season.includes('כל השנה'))) add(6, `מומלץ ב${he}`);
    else if (site.season) add(-6, `העונה המומלצת: ${site.season}`);
  }
  if (trip.kind && trip.kind !== 'day' && site.lodging) add(8, 'יש אפשרות לינה (לאמת)');
  if (trip.pets && site.pets === 'no') add(-15, 'כניסת חיות מחמד לא מותרת');

  let km: number | undefined;
  if (settings?.home) {
    km = haversineKm(settings.home, site);
    if (trip.maxDriveKm && km > trip.maxDriveKm) add(-15, `כ-${Math.round(km)} ק״מ בקו אווירי — מעבר לטווח שבחרתם`);
  }
  if (taste) {
    const t = site.tags.reduce((s, tag) => s + (taste.tags[tag] ?? 0), 0);
    if (t > 0) add(Math.min(8, t * 2), 'דומה לטיולים שאהבתם');
    if (taste.favorites.includes(site.id)) add(10, 'שמרתם במועדפים');
  }
  return { site, score: clamp(Math.round(score), 0, 100), reasons, warnings, km };
}

export function rank(sites: Site[], trip: Partial<Trip>, flags: WxFlags | null, settings?: Settings, taste?: Taste) {
  return sites.map(s => scoreSite(s, trip, flags, settings, taste)).sort((a, b) => b.score - a.score);
}
