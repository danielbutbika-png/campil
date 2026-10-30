// CampIL service worker. On install it saves every file of this build (list injected at build time by
// vite.config.ts), so the whole app — map screen included — opens with no signal after a single visit.
// Production and staging share an origin, so every cache name carries the environment prefix.
const BUILD = '83500f6c82';
const P = 'campil-'; // 'campil-' (production) or 'campil-stg-' (staging)
const VERSION = P + 'app-' + BUILD;
const RT_FONTS = P + 'rt-fonts', RT_MAP = P + 'rt-map', OFFLINE_MAP = P + 'offline-map';
const PRECACHE = ["./Academy-DiW73KBk.js","./BoxScreen-SiZgvleo.js","./CampSearch-bEgyOoga.js","./Cook-C5n8l5iD.js","./Explore-D7c_G2Ft.js","./Gear-D9swj1PU.js","./IsraelMap-tLIJtYFJ.js","./IsraelMapGL-CEt4jBBi.js","./IsraelMapGL-KizArRWY.css","./Join-B-Pz56Ke.js","./JournalTab-kMlb0mII.js","./MapScreen-gH1ndaOV.js","./More-DWxeUbNH.js","./RouteFuel-v0FFpfbp.js","./TripPlan-DPE_IHAf.js","./TripTypePicker-CcxMQfdd.js","./Trips-BcWuHHv7.js","./VehiclePicker-DTo32LLB.js","./Wizard-CUbKIWoL.js","./car-CTq19y70.js","./chef-hat-BRdL_JtN.js","./icon-192.png","./icon-512.png","./icon.svg","./index-C4n1MZEu.js","./index-vHlH6jJe.css","./index.esm-1jP3d1p-.js","./index.esm-B4Jzzju4.js","./index.esm-CCAWpmwl.js","./index.esm-D_Ez9UD8.js","./index.html","./manifest.webmanifest","./osm-dRGSVYye.js","./package-DiNrhfym.js","./places-D1Q9TkrR.js","./printer-Ui3L5e_j.js","./rotate-ccw-1h-AZ_F0.js","./search-BnLye87E.js","./upload-BIN0RAbr.js"];
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
