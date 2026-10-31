// CampIL service worker. On install it saves every file of this build (list injected at build time by
// vite.config.ts), so the whole app — map screen included — opens with no signal after a single visit.
// Production and staging share an origin, so every cache name carries the environment prefix.
const BUILD = 'c3c7af9010';
const P = 'campil-stg-'; // 'campil-' (production) or 'campil-stg-' (staging)
const VERSION = P + 'app-' + BUILD;
const RT_FONTS = P + 'rt-fonts', RT_MAP = P + 'rt-map', OFFLINE_MAP = P + 'offline-map', RT_DATA = P + 'rt-data';
const PRECACHE = ["./Academy-CAGq8Hee.js","./BoxScreen-BKP5jwuH.js","./CampSearch-Celwi_z3.js","./Cook-DmDSqU5A.js","./DesignSystem-ChfgZTRu.js","./DestSearch-BZoskcu_.js","./Destination-CHJAAjCC.js","./Explore-BYHIH3vr.js","./Gear-BH-yDZzd.js","./IsraelMap-CNEVcj8r.js","./IsraelMapGL-BRuQgE48.js","./IsraelMapGL-KizArRWY.css","./Join-CiRC93M6.js","./JournalTab-CeG0-4FK.js","./MapScreen-we86xIAz.js","./More-DV9FqsPz.js","./Places-791QcufU.js","./RouteFuel-Dvyjmm-m.js","./TripPlan-C3F2aOAT.js","./Trips-DYZckeNW.js","./VehiclePicker-CRyEswmr.js","./Wizard-COJ6vfcA.js","./car-BtQJqeCG.js","./chef-hat-Di37EdbD.js","./data/places.json","./footprints-Bo22TvTE.js","./icon-192.png","./icon-512.png","./icon.svg","./index-C-1CkMCU.css","./index-DMPcmcen.js","./index.esm-1jP3d1p-.js","./index.esm-B4Jzzju4.js","./index.esm-CCAWpmwl.js","./index.esm-D_Ez9UD8.js","./index.html","./manifest.webmanifest","./music-B3UuOYx3.js","./osm-dRGSVYye.js","./package-DCUUU_yx.js","./placeFit-BNJkOHU7.js","./places-D1Q9TkrR.js","./placesDb-Cmc173ik.js","./printer-Ddx7UgPR.js","./rotate-ccw-DCRiJZp7.js","./search-FuLVy6Ej.js","./upload-COTEIYIp.js"];
const SHELL = ['./', ...PRECACHE];
// On update, drop only this environment's older app caches. Saved maps (offline-map) and runtime caches stay.
const stale = k => (k.startsWith(P + 'app-') && k !== VERSION) || (P === 'campil-' && /^campil-[0-9a-f]{10}$/.test(k)); // second: pre-prefix builds
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(stale).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Live data (weather, OSM): network only — the app keeps its own last-good copy and labels it.
  if (/open-meteo\.com|overpass-api/.test(url.host)) return;
  // Official warnings (live/): network first, the last copy only when offline — the app shows when it was checked.
  if (url.origin === location.origin && /\/live\//.test(url.pathname)) {
    e.respondWith(caches.open(RT_DATA).then(c => fetch(req, { cache: 'no-store' }).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => c.match(req))));
    return;
  }
  // The place database (data/): stale-while-revalidate in a cache that survives app updates.
  if (url.origin === location.origin && /\/data\/[^/]+\.json$/.test(url.pathname)) {
    e.respondWith(caches.open(RT_DATA).then(async c => { const hit = await c.match(req); const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }));
    return;
  }
  // Same-origin assets & fonts: stale-while-revalidate.
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.open(url.origin === location.origin ? VERSION : RT_FONTS).then(async c => {
      const hit = await c.match(req, { ignoreSearch: req.mode === 'navigate', ignoreVary: true });
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || (req.mode === 'navigate' ? c.match('./index.html') : undefined));
      return hit || net;
    }));
    return;
  }
  // Map tiles/styles: cache-first — areas saved by "prepare for the field" (campil-offline-map) or viewed before
  // (campil-rt-map, size-capped) work with no signal.
  if (/openfreemap\.org|unpkg\.com/.test(url.host)) {
    e.respondWith(caches.open(RT_MAP).then(async c => {
      const hit = (await caches.match(req.url, { ignoreVary: true, cacheName: OFFLINE_MAP })) || (await c.match(req, { ignoreVary: true })); if (hit) return hit;
      const r = await fetch(req); if (r.ok) { c.put(req, r.clone()); c.keys().then(k => { if (k.length > 1500) c.delete(k[0]); }); } return r;
    }));
  }
});

// Tapping a partner-change notification opens (or focuses) the app on that trip.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    if (w) return w.focus().then(c => (c || w).navigate ? (c || w).navigate(url) : undefined).catch(() => w.focus());
    return self.clients.openWindow(url);
  }));
});
