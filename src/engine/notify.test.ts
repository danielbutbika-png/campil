import { describe, it, expect } from 'vitest';
import { describeChanges, summarize } from '../lib/cloud/notify';
import { blankTrip } from '../lib/store';

const base = (): any => ({ ...blankTrip([]), name: 'גליל', packing: [{ id: 'p1', name: 'אוהל', category: 'shelter', qty: 1, reason: '', source: 'manual', packed: false }], tasks: [{ id: 'k1', text: 'להזמין מקום', done: false, when: '', dueOffsetDays: -3 }] });

describe('partner change notifications', () => {
  it('attributes ticks to whoever ticked, other edits to the last editor', () => {
    const a = base(); const b = structuredClone(a);
    b.packing[0] = { ...b.packing[0], packed: true, packedBy: 'דנה', packedAt: 1 };
    b.tasks[0] = { ...b.tasks[0], done: true, doneBy: 'יואב', doneAt: 1 };
    b.packing.push({ id: 'p2', name: 'פנס', category: 'light', qty: 2, reason: '', source: 'manual', packed: false });
    b.start = '2030-01-01';
    const c = describeChanges(a, b, 'דנה');
    expect(c).toContainEqual({ by: 'דנה', text: 'ארז/ה: אוהל' });
    expect(c).toContainEqual({ by: 'יואב', text: 'השלים/ה: להזמין מקום' });
    expect(c).toContainEqual({ by: 'דנה', text: 'הוסיף/ה לציוד: פנס' });
    expect(c.some(x => x.text.includes('תאריכי'))).toBe(true);
  });
  it('reports nothing when the trip did not change', () => {
    const a = base(); expect(describeChanges(a, structuredClone(a), 'x')).toEqual([]);
  });
  it('summarizes several changes into one short notification', () => {
    const s = summarize([1, 2, 3, 4, 5, 6].map(i => ({ by: 'דנה', text: `ארז/ה: ${i}` })))!;
    expect(s.title).toBe('דנה'); expect(s.body.split('\n')).toHaveLength(5); expect(s.body).toContain('ועוד 2');
    expect(summarize([{ by: 'דנה', text: 'a' }, { by: 'יואב', text: 'b' }])!.body).toBe('דנה a\nיואב b');
  });
});
