import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Box, GearItem, JournalEntry, Member, PersonalTemplateItem, Settings, Trip, PackItem, Interest , AlbumPhoto } from './types';
import seed from '../data/seed.json';
import { uid, todayISO, addDays } from './util';
import type { Taste } from '../engine/scoring';
import { SITE_BY_ID } from '../data/sites';

export interface State {
  version: number;
  settings: Settings; members: Member[]; boxes: Box[]; inventory: GearItem[]; template: PersonalTemplateItem[]; seedTasks: { when: string; text: string }[];
  trips: Trip[]; journal: JournalEntry[]; album: AlbumPhoto[]; favorites: string[]; onboarded: boolean;
  setSettings: (p: Partial<Settings>) => void;
  upsertMember: (m: Member) => void; removeMember: (id: string) => void;
  upsertItem: (g: GearItem) => void; removeItem: (id: string) => void;
  upsertBox: (b: Box) => void; removeBox: (id: string) => void;
  addTrip: (t: Trip) => void; updateTrip: (id: string, p: Partial<Trip> | ((t: Trip) => Partial<Trip>)) => void; removeTrip: (id: string) => void;
  updatePack: (tripId: string, itemId: string, p: Partial<PackItem>) => void;
  upsertEntry: (e: JournalEntry) => void; removeEntry: (id: string) => void;
  upsertPhotos: (ps: AlbumPhoto[]) => void; removePhoto: (id: string) => void;
  toggleFavorite: (siteId: string) => void;
  importAll: (data: Partial<State>) => void; resetAll: () => void;
}

export const isChild = (p: Member) => (p.age != null ? p.age < 18 : p.role === 'child');
/** Derive the count fields every engine uses from the trip's participant list. */
export function withCounts<T extends Pick<Trip, 'participants'>>(t: T) {
  const ps = t.participants.map(p => ({ ...p, role: isChild(p) ? 'child' as const : 'adult' as const }));
  return { ...t, participants: ps, adults: ps.filter(p => !isChild(p)).length, children: ps.filter(isChild).length, childAges: ps.filter(p => isChild(p) && p.age != null).map(p => p.age!), memberIds: ps.map(p => p.id) };
}
export const blankTrip = (members: Member[]): Trip => {
  const start = addDays(todayISO(), 7);
  return {
    id: uid('trip-'), name: '', createdAt: new Date().toISOString(), start, end: addDays(start, 1),
    ...withCounts({ participants: members.map(m => ({ ...m })) }),
    pets: false, kind: 'camping', lodging: 'tent', vehicle: '', regionId: null, siteIds: [], interests: ['family'],
    difficulty: 'easy', budget: 'any', packing: [], meals: [], pantry: {}, schedule: [], tasks: [], status: 'planning',
  };
};

const initial = () => {
  const members = seed.members as Member[];
  return {
    version: 1,
    settings: { familyName: 'המשפחה שלי', vehicle: '', diet: { kosher: true, vegetarian: false, vegan: false, allergies: [] }, theme: 'system', fuelBrands: [], fuelBufferKm: 2, aiModel: 'claude-sonnet-5-5' } as Settings,
    members, boxes: seed.boxes as Box[], inventory: (seed.items as GearItem[]).map(g => ({ ...g, available: true })),
    template: seed.personalTemplate as PersonalTemplateItem[], seedTasks: seed.tasks, trips: [] as Trip[], journal: [] as JournalEntry[], album: [] as AlbumPhoto[], favorites: [] as string[], onboarded: false,
  };
};

export const useStore = create<State>()(persist((set, get) => ({
  ...initial(),
  setSettings: p => set(s => ({ settings: { ...s.settings, ...p } })),
  upsertMember: m => set(s => ({ members: s.members.some(x => x.id === m.id) ? s.members.map(x => (x.id === m.id ? m : x)) : [...s.members, m] })),
  removeMember: id => set(s => ({ members: s.members.filter(x => x.id !== id) })),
  upsertItem: g => set(s => ({ inventory: s.inventory.some(x => x.id === g.id) ? s.inventory.map(x => (x.id === g.id ? g : x)) : [...s.inventory, g] })),
  removeItem: id => set(s => ({ inventory: s.inventory.filter(x => x.id !== id) })),
  upsertBox: b => set(s => ({ boxes: s.boxes.some(x => x.id === b.id) ? s.boxes.map(x => (x.id === b.id ? b : x)) : [...s.boxes, b] })),
  removeBox: id => set(s => ({ boxes: s.boxes.filter(x => x.id !== id), inventory: s.inventory.map(g => (g.boxId === id ? { ...g, boxId: null } : g)) })),
  addTrip: t => set(s => ({ trips: [...s.trips, t] })),
  updateTrip: (id, p) => set(s => ({ trips: s.trips.map(t => (t.id === id ? { ...t, ...(typeof p === 'function' ? p(t) : p) } : t)) })),
  removeTrip: id => set(s => ({ trips: s.trips.filter(t => t.id !== id), journal: s.journal.filter(j => j.tripId !== id), album: s.album.filter(p => p.tripId !== id) })),
  updatePack: (tripId, itemId, p) => set(s => ({ trips: s.trips.map(t => (t.id === tripId ? { ...t, packing: t.packing.map(i => (i.id === itemId ? { ...i, ...p } : i)) } : t)) })),
  upsertEntry: e => set(s => ({ journal: s.journal.some(x => x.id === e.id) ? s.journal.map(x => (x.id === e.id ? e : x)) : [...s.journal, e] })),
  removeEntry: id => set(s => ({ journal: s.journal.filter(x => x.id !== id) })),
  upsertPhotos: ps => set(s => { const m = new Map(s.album.map(p => [p.id, p])); for (const p of ps) m.set(p.id, { ...m.get(p.id), ...p }); return { album: [...m.values()] }; }),
  removePhoto: id => set(s => ({ album: s.album.filter(p => p.id !== id) })),
  toggleFavorite: id => set(s => ({ favorites: s.favorites.includes(id) ? s.favorites.filter(x => x !== id) : [...s.favorites, id] })),
  importAll: data => set(() => ({ ...pickData(data) })),
  resetAll: () => set(() => initial()),
}), {
  name: 'campil-v1', version: 3, storage: createJSONStorage(() => localStorage), partialize: s => pickData(s) as any,
  // v1 trips stored only family member ids + counts → rebuild an explicit participant list.
  migrate: (p: any) => {
    if (p?.settings) p.settings = { fuelBrands: [], fuelBufferKm: 2, aiModel: 'claude-sonnet-5-5', ...p.settings };
    if (p?.trips) p.trips = p.trips.map((t: any) => t.participants ? t : withCounts({ ...t, participants: [
      ...(p.members ?? []).filter((m: Member) => (t.memberIds ?? []).includes(m.id)).map((m: Member) => ({ ...m })),
    ] }));
    return p;
  },
}));

const KEYS = ['version', 'settings', 'members', 'boxes', 'inventory', 'template', 'seedTasks', 'trips', 'journal', 'album', 'favorites', 'onboarded'] as const;
export function pickData(s: Partial<State>) { const o: any = {}; for (const k of KEYS) if (s[k] !== undefined) o[k] = s[k]; return o; }

/** Preferences learned from history: interests and site tags of rated/completed trips, plus favorites. */
export function tasteOf(s: Pick<State, 'trips' | 'favorites'>): Taste {
  const tags: Taste['tags'] = {}; const regions: Record<string, number> = {};
  for (const t of s.trips) {
    if (t.status !== 'done' && !t.rating) continue;
    const w = t.rating ? (t.rating - 2.5) / 2.5 : 0.5;
    for (const i of t.interests) tags[i] = (tags[i] ?? 0) + w;
    for (const id of t.siteIds) for (const tag of SITE_BY_ID[id]?.tags ?? []) tags[tag as Interest] = (tags[tag as Interest] ?? 0) + w / 2;
    if (t.regionId) regions[t.regionId] = (regions[t.regionId] ?? 0) + w;
  }
  return { tags, regions, favorites: s.favorites };
}

export const nextTrip = (trips: Trip[]) => trips.filter(t => t.status === 'planning' && t.end >= todayISO()).sort((a, b) => a.start.localeCompare(b.start))[0];
