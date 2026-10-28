import { describe, it, expect } from 'vitest';
import { toDoc, fromDoc, diffTrip, applyPatches, parseFirebaseConfig, encodeInvite, decodeInvite, DELETE } from '../lib/cloud/model';
import { blankTrip } from '../lib/store';
import { materialize } from './build';
import { useStore } from '../lib/store';

const base = () => { const s = useStore.getState(); return materialize({ ...blankTrip(s.members), name: 'בדיקה', regionId: 'golan' }, s); };
const me = { name: 'אבי', color: '#000', role: 'owner' as const };

describe('shared trip model', () => {
  it('round-trips a trip through the document', () => {
    const t = base(); const d = toDoc(t, 'u1', me);
    const back = fromDoc(JSON.parse(JSON.stringify(d)), t);
    expect(back.packing.map(p => p.id)).toEqual(t.packing.map(p => p.id));
    expect(back.tasks.length).toBe(t.tasks.length); expect(back.meals.length).toBe(t.meals.length);
    expect(diffTrip(t, back)).toEqual([]);
  });
  it('concurrent edits on different items both survive', () => {
    const t = base(); let doc: any = JSON.parse(JSON.stringify(toDoc(t, 'u1', me)));
    const a = { ...t, packing: t.packing.map((p, i) => (i === 0 ? { ...p, packed: true, packedBy: 'אבי', packedAt: 1 } : p)) };
    const b = { ...t, packing: t.packing.map((p, i) => (i === 1 ? { ...p, packed: true, packedBy: 'מיכל', packedAt: 2 } : p)) };
    doc = applyPatches(doc, diffTrip(t, a)); doc = applyPatches(doc, diffTrip(t, b));
    const r = fromDoc(doc, t);
    expect(r.packing[0].packedBy).toBe('אבי'); expect(r.packing[1].packedBy).toBe('מיכל');
  });
  it('emits deletes for removed items and fields', () => {
    const t = base(); const n = { ...t, tasks: t.tasks.slice(1), name: 'שם חדש' };
    const p = diffTrip(t, n);
    expect(p).toContainEqual({ path: ['tasks', t.tasks[0].id], value: DELETE });
    expect(p).toContainEqual({ path: ['core', 'name'], value: 'שם חדש' });
    expect(p.every(x => !x.path.includes('shared'))).toBe(true);
  });
  it('parses the Firebase console snippet and round-trips invites', () => {
    const cfg = parseFirebaseConfig(`const firebaseConfig = {\n  apiKey: "AIzaXYZ",\n  authDomain: "campil-1.firebaseapp.com",\n  projectId: "campil-1",\n  storageBucket: "campil-1.appspot.com",\n  messagingSenderId: "123",\n  appId: "1:123:web:abc"\n};`)!;
    expect(cfg.projectId).toBe('campil-1');
    expect(decodeInvite(encodeInvite(cfg))).toEqual(cfg);
    expect(parseFirebaseConfig('hello')).toBeNull();
  });
});
