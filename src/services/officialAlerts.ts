// Official weather warnings from the Israel Meteorological Service (IMS), as published by the "IMS alerts" job
// (scripts/alerts/ims.mjs → live/ims-alerts.json, every 30 minutes). Credit to IMS is required and always shown.
// Missing or old data means "could not check" — never "no warnings", and never "safe".
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RegionId } from '../lib/types';
import type { PlaceCat } from './placesDb';
import { REGIONS } from '../data/regions';
import { SITE_BY_ID } from '../data/sites';
import { haversineKm } from '../lib/util';

export type ImsArea = 'country' | 'north' | 'center' | 'south';
export type ImsType = 'general' | 'visibility' | 'sea' | 'flood' | 'storm' | 'fire';
export interface ImsItem { title: string; text: string; pubDate: string; link: string; guid?: string }
export interface ImsFeed { area: ImsArea; type: ImsType; url: string; ok: boolean; items: ImsItem[]; title?: string; updated?: string; error?: string }
export interface ImsFile { source: string; sourceUrl: string; terms: string; checkedAt: string; ok: boolean; feeds: ImsFeed[]; error?: string }
export interface OfficialAlert extends ImsItem { area: ImsArea; type: ImsType }
export type AlertsState = { kind: 'fresh'; checkedAt: string; partial: boolean } | { kind: 'stale'; checkedAt: string } | { kind: 'missing' };

export const IMS_CREDIT = 'מקור: השירות המטאורולוגי הישראלי';
export const TYPE_HE: Record<ImsType, string> = { general: 'אזהרה כללית', visibility: 'ראות לקויה', sea: 'ים', flood: 'שיטפונות', storm: 'סערה, רוחות ושלג', fire: 'שריפות וחום' };
export const AREA_HE: Record<ImsArea, string> = { country: 'כל הארץ', north: 'צפון', center: 'מרכז', south: 'דרום' };
/** IMS splits the country into north / center / south; a region may touch two of them. */
export const AREAS_OF: Record<RegionId, ImsArea[]> = {
  golan: ['north'], hula: ['north'], upper_galilee: ['north'], lower_galilee: ['north'], carmel: ['north'],
  sharon: ['center'], center: ['center'], jerusalem: ['center'], judean_desert: ['center', 'south'],
  north_negev: ['south'], central_negev: ['south'], arava: ['south'], eilat: ['south'],
};
export const STALE_HOURS = 8;

/** Fresh = checked within 8 hours (the job runs every 30 minutes and checks in at least every 6). */
export function alertsState(f: ImsFile | null | undefined, now = Date.now()): AlertsState {
  if (!f?.checkedAt || !f.feeds?.length) return { kind: 'missing' };
  const h = (now - Date.parse(f.checkedAt)) / 36e5;
  return h <= STALE_HOURS ? { kind: 'fresh', checkedAt: f.checkedAt, partial: !f.ok } : { kind: 'stale', checkedAt: f.checkedAt };
}
/** Active warnings for these regions (plus country-wide ones). */
export function alertsFor(f: ImsFile | null | undefined, regions: RegionId[]): OfficialAlert[] {
  if (!f) return [];
  const areas = new Set<ImsArea>(['country', ...regions.flatMap(r => AREAS_OF[r] ?? [])]);
  // the general feed repeats the specific ones (sea, visibility…): keep each warning once, from its specific feed
  const all = f.feeds.filter(x => areas.has(x.area)).sort((a, b) => Number(a.type === 'general') - Number(b.type === 'general'))
    .flatMap(x => x.items.map(i => ({ ...i, area: x.area, type: x.type })));
  const seen = new Set<string>();
  return all.filter(a => { const k = (a.text || a.title).replace(/\s+/g, ' ').trim(); if (seen.has(k)) return false; seen.add(k); return true; });
}
const WATERY: PlaceCat[] = ['stream', 'waterfall', 'spring', 'cave', 'lake'];
/** An official warning that rules a place out (the activity there conflicts with it), or null. */
export function conflictingAlert(cats: PlaceCat[], floodProne: boolean, alerts: OfficialAlert[]): OfficialAlert | null {
  return alerts.find(a =>
    (a.type === 'flood' && (cats.some(c => WATERY.includes(c)) || floodProne)) ||
    (a.type === 'sea' && cats.includes('beach')) ||
    (a.type === 'fire' && cats.some(c => c === 'forest' || c === 'campsite' || c === 'picnic')) ||
    (a.type === 'storm' && cats.some(c => c === 'campsite' || c === 'caravan' || c === 'peak' || c === 'viewpoint')),
  ) ?? null;
}

const URL_ = () => `${import.meta.env.BASE_URL}live/ims-alerts.json`;
export function useOfficialAlerts() {
  return useQuery<ImsFile | null>({
    queryKey: ['ims-alerts'], staleTime: 10 * 60e3, refetchInterval: 15 * 60e3, retry: 1,
    queryFn: async () => { const r = await fetch(URL_(), { cache: 'no-store' }); if (!r.ok) return null; return r.json(); },
  });
}

/** Every region a trip touches: its region, its catalogue sites, and the places added to it. */
export function tripRegions(t: Pick<import('../lib/types').Trip, 'regionId' | 'siteIds' | 'places'>): RegionId[] {
  const near = (lat: number, lon: number) => REGIONS.reduce((a, r) => (haversineKm({ lat, lon }, r) < haversineKm({ lat, lon }, a) ? r : a)).id;
  const out = new Set<RegionId>();
  if (t.regionId) out.add(t.regionId);
  for (const id of t.siteIds) { const s = SITE_BY_ID[id]; if (s) out.add(s.region); }
  for (const p of t.places ?? []) out.add(near(p.lat, p.lon));
  return [...out];
}

/** For scoring: every warning in force (filtered per place by area inside fitScore), and whether we could check. */
export function useAlertCtx(): { alerts: OfficialAlert[]; alertsChecked: boolean } {
  const q = useOfficialAlerts();
  return useMemo(() => ({ alerts: (q.data?.feeds ?? []).flatMap(x => x.items.map(i => ({ ...i, area: x.area, type: x.type }))), alertsChecked: alertsState(q.data).kind === 'fresh' }), [q.data]);
}
