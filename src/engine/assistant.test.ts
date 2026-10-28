import { describe, it, expect } from 'vitest';
import { suggest, type AssistantInput } from './assistant';

const trip = (p: any = {}) => ({ id: 't', name: 'טיול', status: 'planning', start: '2026-10-30', end: '2026-11-01', packing: [], tasks: [], meals: [], schedule: [], pantry: {}, participants: [], siteIds: [], ...p }) as any;
const input = (p: Partial<AssistantInput> = {}): AssistantInput => ({ trip: trip(), today: '2026-10-28', sites: [], siteChecks: {}, inventory: [], boxes: [], trunk: null, shopLines: [], wx: { source: 'forecast', recs: [], rainExpected: false }, ...p });
const ids = (x: AssistantInput) => suggest(x).map(s => s.id);

describe('planning assistant', () => {
  it('says nothing for a trip that already ended', () => {
    expect(suggest(input({ trip: trip({ start: '2026-10-01', end: '2026-10-02' }) }))).toEqual([]);
  });
  it('every suggestion explains why and names its source', () => {
    const s = suggest(input({ trip: trip({ tasks: [{ id: 'k', text: 'לבדוק גז', done: false, dueOffsetDays: -2 }], packing: [{ id: 'p', name: 'אוהל', qty: 1, packed: false }] }), sites: [{ id: 's', name: 'עין גדי', officialUrl: 'https://www.parks.org.il' } as any] }));
    expect(s.length).toBeGreaterThan(2);
    for (const x of s) { expect(x.why.length).toBeGreaterThan(5); expect(x.source.label.length).toBeGreaterThan(2); }
  });
  it('flood-prone site + rain → official warning link, danger first', () => {
    const s = suggest(input({ sites: [{ id: 'n', name: 'נחל דרגות', floodRisk: true, officialUrl: 'x' } as any], wx: { source: 'forecast', recs: [], rainExpected: true }, siteChecks: { n: { at: '2026-10-20' } } }));
    expect(s[0]).toMatchObject({ id: 'flood', level: 'danger', source: { kind: 'official' } });
  });
  it('uses forecast recommendations only when there is a real forecast', () => {
    const rec = { id: 'heat', kind: 'heat', severity: 'warning', title: 'עומס חום', reason: '36° ביום ב׳', actions: [] } as any;
    expect(ids(input({ wx: { source: 'forecast', recs: [rec], rainExpected: false } }))).toContain('wx-heat');
    expect(ids(input({ wx: { source: 'climate', recs: [rec], rainExpected: false } }))).not.toContain('wx-heat');
  });
  it('packing and offline prep only close to departure', () => {
    const p = { packing: [{ id: 'p', name: 'אוהל', qty: 1, packed: false }] };
    expect(ids(input({ trip: trip(p) }))).toEqual(expect.arrayContaining(['pack', 'offline']));
    expect(ids(input({ trip: trip({ ...p, start: '2026-11-20', end: '2026-11-22' }) }))).not.toContain('pack');
    expect(ids(input({ trip: trip({ ...p, offline: { at: 1 } }) }))).not.toContain('offline');
  });
  it('uses the family\'s own site check: booking required is a warning with their date', () => {
    const s = suggest(input({ sites: [{ id: 's', name: 'חניון', officialUrl: 'x' } as any], siteChecks: { s: { at: '2026-10-25', booking: 'required', url: 'https://book' } } }));
    expect(s.find(x => x.id === 'book-s')).toMatchObject({ level: 'warn', source: { kind: 'verified', url: 'https://book' } });
    expect(s.find(x => x.id === 'site-s')).toBeUndefined();
  });
  it('gear due for a check, in this trip', () => {
    const s = suggest(input({ trip: trip({ packing: [{ id: 'p', name: 'כירה', qty: 1, packed: true, inventoryId: 'g' }] }), inventory: [{ id: 'g', name: 'כירת גז', qty: 1, status: 'check' } as any] }));
    expect(s.find(x => x.id === 'gearcheck')?.why).toContain('כירת גז');
  });
  it('suggests plan B when the forecast hits a flood-prone place', () => {
    const nahal = { id: 'n', name: 'נחל', region: 'golan', type: 'trail', lat: 33, lon: 35.7, tags: [], floodRisk: true, officialUrl: 'x' } as any;
    const alt = { ...nahal, id: 'a', name: 'יער', floodRisk: false };
    const s = suggest(input({ sites: [nahal], catalog: [nahal, alt], siteChecks: { n: { at: '2026-10-25' } }, wx: { source: 'forecast', recs: [], rainExpected: true, flags: { known: true, rain: true } as any } }));
    expect(s.find(x => x.id === 'planb')).toMatchObject({ level: 'warn', action: { to: '/trip/t/safety' } });
  });
  it('flags items that will not fit the measured trunk', () => {
    const s = suggest(input({ trunk: { depth: 80, width: 100, height: 40 }, trip: trip({ packing: [{ id: 'p', name: 'שולחן', qty: 1, packed: false, inventoryId: 'g' }] }), inventory: [{ id: 'g', name: 'שולחן', qty: 1, big: true, dims: [150, 60, 8] } as any] }));
    expect(s.find(x => x.id === 'trunk')?.why).toContain('שולחן');
  });
});
