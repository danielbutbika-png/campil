// Shared-trip document model. A trip is stored as one Firestore document whose list-like parts
// (packing, tasks, meals, schedule, pantry) are maps keyed by item id. Edits are sent as per-field
// patches, so two people ticking different items at the same moment never overwrite each other.
import type { Trip } from '../types';

export const DELETE = Symbol('delete');
export type Patch = { path: string[]; value: unknown | typeof DELETE };
export interface Member { name: string; color: string; role: 'owner' | 'editor'; lastSeen?: number; joinedAt?: number; verified?: boolean; email?: string; photo?: string; familyId?: string; k?: string }
export interface Pending { name: string; email?: string; photo?: string; at: number; familyId?: string }
export type Access = 'link' | 'approved';
export interface TripDoc {
  v: 1; owner: string; createdAt: number; updatedAt?: number;
  members: Record<string, Member>; access?: Access; editedBy?: { uid: string; name: string; at: number };
  /** invite keys: `all` for a one-family trip, `fam[familyId]` per family; rotated when someone is removed */
  invite?: { all?: string; fam?: Record<string, string>; until?: number };
  /** per-family packing progress (counts only — the private lists live in families/{id}) */
  progress?: Record<string, { packed: number; total: number; at: number }>; pending?: Record<string, Pending>;
  core: Record<string, unknown>;
  packing: Record<string, any>; tasks: Record<string, any>; meals: Record<string, any>; schedule: Record<string, any>; pantry: Record<string, boolean>;
  duties?: Record<string, any>;
}

export const MAPS = ['packing', 'tasks', 'meals', 'schedule'] as const;
// Local-only fields that are never shared.
const LOCAL = new Set(['shared', 'packingSig', 'packingGeneratedAt', 'example', 'offline', 'id', 'packing', 'tasks', 'meals', 'schedule', 'pantry', 'duties', 'drive']); // drive starts at this device's home — never shared

/** Firestore rejects `undefined`; JSON round-trip drops it. */
export const clean = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function coreOf(t: Trip) { const c: Record<string, unknown> = {}; for (const [k, v] of Object.entries(t)) if (!LOCAL.has(k) && v !== undefined) c[k] = v; return clean(c); }

export function toDoc(t: Trip, owner: string, me: Member): TripDoc {
  const m = (arr: any[]) => Object.fromEntries(arr.map((x, i) => [x.id, clean({ ...x, ord: x.ord ?? i })]));
  return { v: 1, owner, createdAt: Date.now(), access: 'link', pending: {}, members: { [owner]: me }, core: coreOf(t), packing: m(t.packing), tasks: m(t.tasks), meals: m(t.meals), schedule: m(t.schedule), pantry: { ...t.pantry }, duties: clean({ ...(t.duties ?? {}) }) };
}

const MEAL_ORDER = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 } as Record<string, number>;
export function fromDoc(d: TripDoc, local?: Trip): Trip {
  const list = (o: Record<string, any> = {}) => Object.values(o);
  return {
    ...(local ?? {}), ...(d.core as any), id: local?.id ?? (d.core as any).id,
    packing: list(d.packing).sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0)),
    tasks: list(d.tasks).sort((a, b) => a.dueOffsetDays - b.dueOffsetDays || (a.ord ?? 0) - (b.ord ?? 0)),
    meals: list(d.meals).sort((a, b) => a.day - b.day || (MEAL_ORDER[a.type] ?? 9) - (MEAL_ORDER[b.type] ?? 9)),
    schedule: list(d.schedule).sort((a, b) => a.day - b.day || String(a.time).localeCompare(String(b.time))),
    pantry: { ...(d.pantry ?? {}) },
    duties: { ...(d.duties ?? {}) },
    shared: local?.shared, packingSig: local?.packingSig, packingGeneratedAt: local?.packingGeneratedAt, offline: local?.offline, drive: local?.drive,
  } as Trip;
}

/** Field-level patches that turn `prev` into `next`. */
export function diffTrip(prev: Trip, next: Trip): Patch[] {
  const out: Patch[] = [];
  const pc = coreOf(prev), nc = coreOf(next);
  for (const k of new Set([...Object.keys(pc), ...Object.keys(nc)])) {
    if (!(k in nc)) out.push({ path: ['core', k], value: DELETE });
    else if (!same(pc[k], nc[k])) out.push({ path: ['core', k], value: nc[k] });
  }
  for (const key of MAPS) {
    const a = new Map((prev[key] as any[]).map(x => [x.id, x])), b = new Map((next[key] as any[]).map(x => [x.id, x]));
    let i = 0;
    for (const [id, item] of b) {
      const old = a.get(id);
      const withOrd = { ...item, ord: item.ord ?? old?.ord ?? Date.now() + i++ };
      if (!old) { out.push({ path: [key, id], value: clean(withOrd) }); continue; }
      // item-level field patches keep concurrent edits of different fields of one item intact
      for (const f of new Set([...Object.keys(old), ...Object.keys(item)])) {
        if (f === 'ord') continue;
        if (!(f in item) || item[f] === undefined) { if (old[f] !== undefined) out.push({ path: [key, id, f], value: DELETE }); }
        else if (f === 'brings' && old[f] && typeof item[f] === 'object') {
          // per-family keys, so two families updating their share at the same time don't overwrite each other
          for (const k of new Set([...Object.keys(old[f]), ...Object.keys(item[f])])) {
            if (!(k in item[f])) out.push({ path: [key, id, f, k], value: DELETE });
            else if (old[f][k] !== item[f][k]) out.push({ path: [key, id, f, k], value: item[f][k] });
          }
        }
        else if (!same(old[f], item[f])) out.push({ path: [key, id, f], value: clean(item[f]) });
      }
    }
    for (const id of a.keys()) if (!b.has(id)) out.push({ path: [key, id], value: DELETE });
  }
  for (const k of new Set([...Object.keys(prev.pantry ?? {}), ...Object.keys(next.pantry ?? {})])) {
    const nv = next.pantry?.[k];
    if (nv === undefined) out.push({ path: ['pantry', k], value: DELETE });
    else if (prev.pantry?.[k] !== nv) out.push({ path: ['pantry', k], value: nv });
  }
  // one key per responsibility, so families taking different duties at once don't collide
  for (const k of new Set([...Object.keys(prev.duties ?? {}), ...Object.keys(next.duties ?? {})])) {
    const nv = next.duties?.[k];
    if (nv === undefined) out.push({ path: ['duties', k], value: DELETE });
    else if (!same(prev.duties?.[k], nv)) out.push({ path: ['duties', k], value: clean(nv) });
  }
  return out;
}

/** Apply patches to a document (used by the local transport and tests; Firestore does this server-side). */
export function applyPatches(d: any, patches: Patch[]) {
  for (const p of patches) {
    let o = d;
    for (const k of p.path.slice(0, -1)) o = o[k] ??= {};
    const last = p.path[p.path.length - 1];
    if (p.value === DELETE) delete o[last]; else o[last] = p.value;
  }
  return d;
}

export const PALETTE = ['#2f6b3f', '#d66a2a', '#3c6e9f', '#a0522d', '#7a6a9e', '#2c8c99', '#c0392b', '#8a6d3b'];
export const randomId = (n = 20) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, x => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 56]).join(''); };

/** Accepts the snippet Firebase shows (`const firebaseConfig = {...}`) or plain JSON. */
export function parseFirebaseConfig(text: string): Record<string, string> | null {
  const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const o: Record<string, string> = {};
  for (const k of keys) { const m = text.match(new RegExp(`["']?${k}["']?\\s*:\\s*["']([^"']+)["']`)); if (m) o[k] = m[1]; }
  return o.apiKey && o.projectId && o.appId ? o : null;
}
export const encodeInvite = (cfg: Record<string, string>) => btoa(unescape(encodeURIComponent(JSON.stringify(cfg)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const decodeInvite = (s: string) => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));

/** The Firebase config baked into this build (VITE_FIREBASE_CONFIG), if any. */
export function builtConfig(): Record<string, string> | null {
  try { const b = import.meta.env.VITE_FIREBASE_CONFIG as string | undefined; return b ? JSON.parse(b) : null; } catch { return null; }
}
const sameProject = (a: Record<string, string>, b: Record<string, string> | null) => !!b && a.projectId === b.projectId && a.apiKey === b.apiKey && a.appId === b.appId;

export interface JoinParams { t: string; k?: string; f?: string; e?: number; a?: boolean }
/** Short invite path: #/j/<trip>_<key>[_f<family>][_e<until, base 36>][_a]. Ids are letters and digits only.
 *  The Firebase config is left out when it is this build's own (every installed CampIL has it). */
export function shortJoinPath(p: JoinParams): string {
  const f = p.f ? `_f${p.f.startsWith('fam-') ? p.f.slice(4) : '~' + p.f}` : '';
  return `#/j/${p.t}_${p.k ?? ''}${f}${p.e ? `_e${p.e.toString(36)}` : ''}${p.a ? '_a' : ''}`;
}
export function parseShortJoin(seg: string): JoinParams | null {
  const [t, k, ...rest] = decodeURIComponent(seg).split('_'); if (!t || !/^[A-Za-z0-9]{8,40}$/.test(t)) return null;
  const out: JoinParams = { t, ...(k ? { k } : {}) };
  for (const r of rest) {
    if (r.startsWith('f')) out.f = r[1] === '~' ? r.slice(2) : 'fam-' + r.slice(1);
    else if (r.startsWith('e')) out.e = parseInt(r.slice(1), 36);
    else if (r === 'a') out.a = true;
  }
  return out;
}
export const configIsBuilt = (cfg: Record<string, string>) => sameProject(cfg, builtConfig());

/** "משפחת כהן" — a family name as written in an invitation (kept as is if it already says משפחה/משפחת). */
export const familyTitle = (name: string) => (/^משפח(ת|ה)\s/.test(name.trim()) ? name.trim() : `משפחת ${name.trim()}`);
/** The WhatsApp / share text of an invitation: who is invited, to what, when — then the link. */
export function inviteMessage(trip: { name: string; dates?: string }, link: string, family?: { name: string } | null): string {
  const who = family?.name?.trim() ? `${familyTitle(family.name)}, הנכם מוזמנים` : 'הנכם מוזמנים';
  return [
    `${who} ל"${trip.name.trim() || 'טיול'}"${trip.dates ? ` (${trip.dates})` : ''}.`,
    family ? 'ב-CampIL נתכנן יחד: הציוד של המשפחה שלכם, הציוד המשותף והמשימות — בזמן אמת.' : 'ב-CampIL נתכנן יחד את הציוד, המשימות והתפריט — בזמן אמת.',
    `להצטרפות: ${link}`,
  ].join('\n');
}
