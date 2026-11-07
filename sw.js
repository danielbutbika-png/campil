// CampIL service worker. On install it saves every file of this build (list injected at build time by
// vite.config.ts), so the whole app — map screen included — opens with no signal after a single visit.
// Production and staging share an origin, so every cache name carries the environment prefix.
const BUILD = '619ff2668a';
const P = 'campil-'; // 'campil-' (production) or 'campil-stg-' (staging)
const VERSION = P + 'app-' + BUILD;
const RT_FONTS = P + 'rt-fonts', RT_MAP = P + 'rt-map', OFFLINE_MAP = P + 'offline-map', RT_DATA = P + 'rt-data';
const PRECACHE = ["./Academy-jahFI5p0.js","./BoxScreen--FPF4Aym.js","./CampSearch-BkhvFRz3.js","./Cook-MtwY5UNN.js","./DesignSystem-BMuVFIu4.js","./Destination-DHIU9gFu.js","./Discover-DuLpD0Ni.js","./Explore-B4tHz2Gv.js","./Gear-Bw-N00QQ.js","./IsraelMap-CW2wkxb_.js","./IsraelMapGL-KizArRWY.css","./IsraelMapGL-fBIvcFHv.js","./Join-3APN54He.js","./JournalTab-DdQRNzAP.js","./MapScreen-DF--M3Bf.js","./More-TjWCeb2w.js","./Places-DBMz4RH0.js","./RouteFuel-C_jXdPt6.js","./TripPlan-BFVnTvnF.js","./Trips-CLD-6lXe.js","./VehiclePicker-CD0iTzNb.js","./WhereTo-CqmFmYLz.js","./Wizard-BvPUq8Vy.js","./car-Dg-f9iuH.js","./chef-hat-Bgj1Mh5-.js","./chevron-down-DTd1YSb6.js","./data/gazetteer.json","./data/places.json","./icon-192.png","./icon-512.png","./icon.svg","./index-By433N4_.js","./index-C4Cq21u9.css","./index.esm-1jP3d1p-.js","./index.esm-B4Jzzju4.js","./index.esm-CCAWpmwl.js","./index.esm-D_Ez9UD8.js","./index.html","./manifest.webmanifest","./music-B3UuOYx3.js","./osm-dRGSVYye.js","./package-sK27_Rdl.js","./placeFit-kor8vrO1.js","./places-D1Q9TkrR.js","./printer-65hfZ_k4.js","./rotate-ccw-DAJulGh4.js","./route-D1mOPeSL.js","./routing-RBXlPk5R.js","./search-B4BJbfVk.js","./upload-lBUehi7M.js"];
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
