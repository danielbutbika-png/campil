// CampIL service worker. On install it saves every file of this build (list injected at build time by
// vite.config.ts), so the whole app — map screen included — opens with no signal after a single visit.
// Production and staging share an origin, so every cache name carries the environment prefix.
const BUILD = '819e65b5a8';
const P = 'campil-'; // 'campil-' (production) or 'campil-stg-' (staging)
const VERSION = P + 'app-' + BUILD;
const RT_FONTS = P + 'rt-fonts', RT_MAP = P + 'rt-map', OFFLINE_MAP = P + 'offline-map';
const PRECACHE = ["./Academy-DLdaGZmH.js","./BoxScreen-DZT8TE65.js","./CampSearch-B112nC1v.js","./Cook-9-ub1-OK.js","./DesignSystem-DxBMABXg.js","./Destination-BtLjM-Q-.js","./Explore-CNryoAKn.js","./Gear-CCs7_cRt.js","./IsraelMap-Cd5bw05O.js","./IsraelMapGL-DgIWIkOm.js","./IsraelMapGL-KizArRWY.css","./Join-BDvAt-yZ.js","./JournalTab-DYUm7_xR.js","./MapScreen-hh-lDKWW.js","./More-Dp3eSQwB.js","./Places-DnbIwWJ3.js","./RouteFuel-CYAb82ZV.js","./TripPlan-Dpybaf6P.js","./TripTypePicker-CsLvZyci.js","./Trips-8TA-gFLx.js","./VehiclePicker-DwHjBIFn.js","./Wizard-BktKRumP.js","./car-DXMO4Wp2.js","./chef-hat-B0Dk7_sS.js","./data/places.json","./footprints-BAD5sjap.js","./icon-192.png","./icon-512.png","./icon.svg","./index-BIyohtjd.js","./index-Dii-n6Wd.css","./index.esm-1jP3d1p-.js","./index.esm-B4Jzzju4.js","./index.esm-CCAWpmwl.js","./index.esm-D_Ez9UD8.js","./index.html","./manifest.webmanifest","./osm-dRGSVYye.js","./package-BT0DDAzx.js","./placeFit-C4dENL-p.js","./places-D1Q9TkrR.js","./placesDb-oEBMmsw0.js","./printer-DAmzoAD0.js","./rotate-ccw-BrPm97HN.js","./search-DvdXNJ0M.js","./upload-D-jO1qPP.js"];
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
