// Turns a partner's edit (local trip → incoming cloud version) into short Hebrew lines,
// and delivers them as a system notification (app in background) or a toast (app open).
import type { Trip, PackItem } from '../types';

export interface Change { by: string | null; text: string }

const byId = <T extends { id: string }>(a: T[] = []) => new Map(a.map(x => [x.id, x]));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** What changed between my copy and the incoming one. `editor` is the last writer's name (doc.editedBy). */
export function describeChanges(prev: Trip, next: Trip, editor: string | null, keep: (p: PackItem) => boolean = () => true): Change[] {
  const out: Change[] = [];
  // only items this device may see: another family's private gear is not announced
  const P = byId(prev.packing.filter(p => keep(next.packing.find(x => x.id === p.id) ?? p))), N = byId(next.packing.filter(keep));
  for (const [id, n] of N) {
    const p = P.get(id);
    if (!p) { if (!n.removed) out.push({ by: editor, text: `הוסיף/ה לציוד: ${n.name}` }); continue; }
    if (p.packed !== n.packed) out.push({ by: n.packedBy ?? editor, text: `${n.packed ? 'ארז/ה' : 'ביטל/ה סימון'}: ${n.name}` });
    if (!p.removed && n.removed) out.push({ by: editor, text: `הסיר/ה מהציוד: ${n.name}` });
    else if (p.removed && !n.removed) out.push({ by: editor, text: `החזיר/ה לציוד: ${n.name}` });
    if (p.qty !== n.qty) out.push({ by: editor, text: `שינה/תה כמות: ${n.name} ×${n.qty}` });
    if (p.assignee !== n.assignee) out.push({ by: editor, text: `שינה/תה אחראי/ת: ${n.name}` });
  }
  for (const [id, p] of P) if (!N.has(id) && !p.removed) out.push({ by: editor, text: `מחק/ה מהציוד: ${p.name}` });

  const PT = byId(prev.tasks), NT = byId(next.tasks);
  for (const [id, n] of NT) {
    const p = PT.get(id);
    if (!p) { out.push({ by: editor, text: `הוסיף/ה משימה: ${n.text}` }); continue; }
    if (p.done !== n.done) out.push({ by: n.doneBy ?? editor, text: `${n.done ? 'השלים/ה' : 'פתח/ה מחדש'}: ${n.text}` });
    else if (p.text !== n.text || p.assignee !== n.assignee) out.push({ by: editor, text: `עדכן/ה משימה: ${n.text}` });
  }
  for (const [id, p] of PT) if (!NT.has(id)) out.push({ by: editor, text: `מחק/ה משימה: ${p.text}` });

  if (!same(prev.meals, next.meals)) out.push({ by: editor, text: 'עדכן/ה את התפריט' });
  if (!same(prev.schedule, next.schedule)) out.push({ by: editor, text: 'עדכן/ה את הלו״ז' });
  if (!same(prev.pantry, next.pantry)) out.push({ by: editor, text: 'עדכן/ה את רשימת הקניות' });
  if (prev.start !== next.start || prev.end !== next.end) out.push({ by: editor, text: 'שינה/תה את תאריכי הטיול' });
  if (prev.name !== next.name) out.push({ by: editor, text: `שינה/תה את שם הטיול ל"${next.name}"` });
  if (!same(prev.siteIds, next.siteIds) || prev.regionId !== next.regionId) out.push({ by: editor, text: 'עדכן/ה את היעדים' });
  if (!same(prev.participants, next.participants)) out.push({ by: editor, text: 'עדכן/ה את המשתתפים' });
  return out;
}

/** One notification body: "דנה ארז/ה: אוהל · …", at most 4 lines, plus a count of the rest. */
export function summarize(changes: Change[]): { title: string; body: string } | null {
  if (!changes.length) return null;
  const names = [...new Set(changes.map(c => c.by).filter(Boolean))] as string[];
  const lines = changes.slice(0, 4).map(c => (c.by && names.length > 1 ? `${c.by} ${c.text}` : c.text));
  const more = changes.length - lines.length;
  return { title: names.length ? names.join(', ') : 'שותף', body: lines.join('\n') + (more > 0 ? `\nועוד ${more} שינויים` : '') };
}

export type NotifyState = 'unsupported' | 'install' | 'denied' | 'default' | 'granted';
const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

export function notifyState(): NotifyState {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return isIOS() && !standalone() ? 'install' : 'unsupported';
  return Notification.permission as NotifyState;
}

export async function requestNotify(): Promise<NotifyState> {
  if (notifyState() !== 'default') return notifyState();
  try { await Notification.requestPermission(); } catch { /* old Safari: callback form */ }
  return notifyState();
}

/** Show a system notification through the service worker (required on Android), falling back to the page API. */
export async function showSystem(title: string, body: string, opts: { tag?: string; url?: string } = {}) {
  const o: NotificationOptions & Record<string, unknown> = { body, tag: opts.tag, renotify: !!opts.tag, lang: 'he', dir: 'rtl', icon: './icon-192.png', badge: './icon-192.png', data: { url: opts.url ?? './' } };
  const reg = await navigator.serviceWorker?.getRegistration().catch(() => undefined);
  if (reg) return reg.showNotification(title, o);
  const n = new Notification(title, o); n.onclick = () => { focus(); if (opts.url) location.href = opts.url; n.close(); };
}
