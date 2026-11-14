// CampIL service worker. On install it saves every file of this build (list injected at build time by
// vite.config.ts), so the whole app — map screen included — opens with no signal after a single visit.
// Production and staging share an origin, so every cache name carries the environment prefix.
const BUILD = '4fe8f37a38';
const P = 'campil-'; // 'campil-' (production) or 'campil-stg-' (staging)
const VERSION = P + 'app-' + BUILD;
const RT_FONTS = P + 'rt-fonts', RT_MAP = P + 'rt-map', OFFLINE_MAP = P + 'offline-map', RT_DATA = P + 'rt-data';
const PRECACHE = ["./Academy-CPFLqfMn.js","./BoxScreen-CRuQMfPA.js","./CampSearch-BXQWP0aR.js","./Cook-Be9e0LO0.js","./DesignSystem-CHlvW9fM.js","./Destination-DMIXsiAQ.js","./Discover-CPj8n0fZ.js","./Explore-Dpu2Bti0.js","./Gear-Ddfd0P-q.js","./IsraelMap-C0C5Zhbi.js","./IsraelMapGL-KizArRWY.css","./IsraelMapGL-gztZfnXN.js","./Join-Cxg_7pTn.js","./JournalTab-BQNwsVU_.js","./MapScreen-C__I1Hx9.js","./More-B7iMNjWf.js","./Places-DDcHcXj_.js","./RouteFuel-D4-eUyqQ.js","./TripPlan-qu0ZkmEg.js","./Trips-nQtn1s2T.js","./VehiclePicker-gNDBWgo-.js","./WhereTo-MmCKguCM.js","./Wizard-KBxYg-_A.js","./car-JxaMBcm2.js","./chef-hat-CidkN9I0.js","./chevron-down-DzY0oHcM.js","./data/gazetteer.json","./data/places.json","./icon-192.png","./icon-512.png","./icon.svg","./index-C_EvkipB.css","./index-CzEHq-7f.js","./index.esm-1jP3d1p-.js","./index.esm-B4Jzzju4.js","./index.esm-CCAWpmwl.js","./index.esm-D_Ez9UD8.js","./index.html","./manifest.webmanifest","./music-B3UuOYx3.js","./osm-dRGSVYye.js","./package-Df-yVV6j.js","./placeFit-5mO0wmor.js","./places-D1Q9TkrR.js","./printer-CYlkSMvM.js","./rotate-ccw-DgbK6vOq.js","./route-DTqs87lA.js","./routing-DDDhO7lS.js","./search-gJiTVXm0.js","./upload-D8VQD09Q.js"];
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
