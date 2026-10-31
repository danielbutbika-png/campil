import { describe, it, expect } from 'vitest';
import { shortJoinPath, parseShortJoin } from './model';

describe('short invite links', () => {
  it('round-trips trip, key, family, expiry and approved-only', () => {
    const p = { t: '74FwWMGJKLH9kFn3ePAY', k: 'xVBkmBkvcv2B7KzP', f: 'fam-wit700n', e: 1793000000000, a: false };
    const path = shortJoinPath(p);
    expect(path).toBe('#/j/74FwWMGJKLH9kFn3ePAY_xVBkmBkvcv2B7KzP_fwit700n_e' + (1793000000000).toString(36));
    expect(parseShortJoin(path.slice(4))).toEqual({ t: p.t, k: p.k, f: p.f, e: p.e });
  });
  it('family ids without the fam- prefix, and approved-only links without a key', () => {
    expect(parseShortJoin(shortJoinPath({ t: 'abcdefgh12', f: 'f1' }).slice(4))).toEqual({ t: 'abcdefgh12', f: 'f1' });
    expect(parseShortJoin(shortJoinPath({ t: 'abcdefgh12', a: true }).slice(4))).toEqual({ t: 'abcdefgh12', a: true });
  });
  it('the link is short: under 100 characters with the site address', () => {
    expect(('https://danielbutbika-png.github.io/campil/' + shortJoinPath({ t: '74FwWMGJKLH9kFn3ePAY', k: 'xVBkmBkvcv2B7KzP', f: 'fam-wit700n' })).length).toBeLessThan(100);
  });
  it('rejects garbage', () => { expect(parseShortJoin('../x')).toBeNull(); expect(parseShortJoin('')).toBeNull(); });
});

import { inviteMessage, familyTitle } from './model';
describe('invitation text', () => {
  it('starts with the family and "הנכם מוזמנים ל…", then the dates and the link', () => {
    const m = inviteMessage({ name: 'טיול משפחות - אגמון החולה', dates: '5–7 בנובמבר' }, 'https://x/#/j/a_b', { name: 'איפרגן' });
    expect(m.split('\n')[0]).toBe('משפחת איפרגן, הנכם מוזמנים ל"טיול משפחות - אגמון החולה" (5–7 בנובמבר).');
    expect(m.endsWith('להצטרפות: https://x/#/j/a_b')).toBe(true);
  });
  it('does not double "משפחת", and works without a family', () => {
    expect(familyTitle('משפחת כהן')).toBe('משפחת כהן');
    expect(inviteMessage({ name: 'סופ״ש בגולן' }, 'L').startsWith('הנכם מוזמנים ל"סופ״ש בגולן".')).toBe(true);
  });
});
