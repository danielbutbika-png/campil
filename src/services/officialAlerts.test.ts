import { describe, it, expect } from 'vitest';
import { alertsState, alertsFor, type ImsFile } from './officialAlerts';
import { readFileSync } from 'node:fs';

const f = (h: number, ok = true): ImsFile => ({ source: 'IMS', sourceUrl: '', terms: '', ok, checkedAt: new Date(Date.now() - h * 36e5).toISOString(), feeds: [
  { area: 'north', type: 'flood', url: '', ok: true, items: [{ title: 'שיטפונות בצפון', text: '', pubDate: '', link: '' }] },
  { area: 'south', type: 'fire', url: '', ok: true, items: [] },
  { area: 'country', type: 'sea', url: '', ok: true, items: [{ title: 'ים גבוה', text: '', pubDate: '', link: '' }] }] });

describe('official alerts file', () => {
  it('freshness: ≤8h fresh, older stale, missing file = missing (never "no warnings")', () => {
    expect(alertsState(f(1)).kind).toBe('fresh'); expect(alertsState(f(9)).kind).toBe('stale');
    expect(alertsState(null).kind).toBe('missing'); expect(alertsState({ ...f(1), feeds: [] }).kind).toBe('missing');
    expect((alertsState(f(1, false)) as any).partial).toBe(true);
  });
  it('region → IMS area: Golan gets north + country-wide; Eilat gets country-wide only', () => {
    expect(alertsFor(f(1), ['golan']).map(a => a.title)).toEqual(['שיטפונות בצפון', 'ים גבוה']);
    expect(alertsFor(f(1), ['eilat']).map(a => a.title)).toEqual(['ים גבוה']);
  });
  it('a warning repeated in the general feed is shown once, from its specific feed', () => {
    const x = f(1); x.feeds.push({ area: 'country', type: 'general', url: '', ok: true, items: [{ title: 'ים גבוה (כללי)', text: '', pubDate: '', link: '' }] });
    x.feeds[2].items[0].text = 'אזהרה צהובה על ים גבוה'; x.feeds[3].items[0].text = 'אזהרה צהובה על ים גבוה';
    const l = alertsFor(x, ['eilat']); expect(l.length).toBe(1); expect(l[0].type).toBe('sea');
  });
  it('the copy of the fetcher installed on main is identical to scripts/alerts/ims.mjs', () => {
    expect(readFileSync('deploy/main/.github/alerts/ims.mjs', 'utf8')).toBe(readFileSync('scripts/alerts/ims.mjs', 'utf8'));
  });
});
