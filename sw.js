// CampIL service worker. On install it saves every file of this build (list injected at build time by
// vite.config.ts), so the whole app — map screen included — opens with no signal after a single visit.
const BUILD = 'e379cd38c8';
const VERSION = 'campil-' + BUILD;
const PRECACHE = ["./CampSearch-BWJBn5Br.js","./Collab-BIDUYq4j.js","./DietEditor-BEVWaVPE.js","./Gear-0S_cH7Eg.js","./IsraelMap-BzrKOCl7.js","./IsraelMapGL-I7xQak_6.js","./IsraelMapGL-KizArRWY.css","./Join-BkgeBIvR.js","./JournalTab-BcFLiNS8.js","./MapScreen-G9mURKbZ.js","./More-Cv_zGUqy.js","./RouteFuel-ClhbpwQy.js","./TripPlan-C3BbgXdT.js","./Trips-n8Xwzr4g.js","./VehiclePicker-DqsZYGvT.js","./Wizard-G8kNXHR9.js","./car-Dj69-GLx.js","./check-B1S8uzeP.js","./copy-BaMI2W_e.js","./fuel-CjwRYtR8.js","./icon-192.png","./icon-512.png","./icon.svg","./index-DBieL3C2.css","./index-DP37k1xp.js","./index.esm-1jP3d1p-.js","./index.esm-B4Jzzju4.js","./index.esm-CCAWpmwl.js","./index.esm-D_Ez9UD8.js","./index.html","./manifest.webmanifest","./offline-DQEJo9iq.js","./osm-dRGSVYye.js","./package-Cw6kHiHo.js","./search-Bi6lpL2E.js","./settings-2-Fw9kbPHQ.js","./smartphone-DouKAKL7.js","./star-ChWyMh68.js"];
const SHELL = ['./', ...PRECACHE];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && !k.startsWith('campil-rt')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Live data (weather, OSM): network only — the app keeps its own last-good copy and labels it.
  if (/open-meteo\.com|overpass-api/.test(url.host)) return;
  // Same-origin assets & fonts: stale-while-revalidate.
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.open(url.origin === location.origin ? VERSION : 'campil-rt-fonts').then(async c => {
      const hit = await c.match(req, { ignoreSearch: req.mode === 'navigate', ignoreVary: true });
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || (req.mode === 'navigate' ? c.match('./index.html') : undefined));
      return hit || net;
    }));
    return;
  }
  // Map tiles/styles: cache-first — areas saved by "prepare for the field" (campil-offline-map) or viewed before
  // (campil-rt-map, size-capped) work with no signal.
  if (/openfreemap\.org|unpkg\.com/.test(url.host)) {
    e.respondWith(caches.open('campil-rt-map').then(async c => {
      const hit = (await caches.match(req.url, { ignoreVary: true, cacheName: 'campil-offline-map' })) || (await c.match(req, { ignoreVary: true })); if (hit) return hit;
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
