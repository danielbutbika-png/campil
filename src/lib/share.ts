import type { Trip, Member } from './types';
import { fmtRange, tripLength } from './util';
import { REGION_BY_ID } from '../data/regions';
import { SITE_BY_ID, navLinks } from '../data/sites';
import { CAT_BY_ID } from '../data/catalog';
import { toast } from '../components/ui';

export async function shareText(title: string, text: string) {
  if (navigator.share) { try { await navigator.share({ title, text }); return; } catch (e: any) { if (e?.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); toast('הועתק — אפשר להדביק בוואטסאפ'); }
  catch { open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
}
export const whatsappURL = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export function tripSummary(t: Trip) {
  const { nights } = tripLength(t.start, t.end);
  const lines = [`🏕️ ${t.name}`, `📅 ${fmtRange(t.start, t.end)}${nights ? ` · ${nights} לילות` : ''}`];
  if (t.regionId) lines.push(`📍 ${REGION_BY_ID[t.regionId].name}`);
  for (const id of t.siteIds) { const s = SITE_BY_ID[id]; if (s) lines.push(`• ${s.name} — ${navLinks(s.lat, s.lon).waze}`); }
  lines.push('', 'תוכנן ב-CampIL');
  return lines.join('\n');
}

export function packingText(t: Trip, members: Member[] = t.participants, who?: string) {
  const items = t.packing.filter(p => !p.removed && (!who || p.assignee === who));
  const by = new Map<string, string[]>();
  for (const p of items) { const k = CAT_BY_ID[p.category]?.name ?? 'שונות'; by.set(k, [...(by.get(k) ?? []), `${p.packed ? '✅' : '⬜'} ${p.name}${p.qty > 1 ? ` ×${p.qty}` : ''}${p.assignee && !who ? ` (${members.find(m => m.id === p.assignee)?.name ?? ''})` : ''}`]); }
  const name = who ? members.find(m => m.id === who)?.name : null;
  return [`🎒 רשימת ציוד — ${t.name}${name ? ` — ${name}` : ''}`, ...[...by].flatMap(([k, v]) => ['', `*${k}*`, ...v])].join('\n');
}

export function download(name: string, data: string, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
