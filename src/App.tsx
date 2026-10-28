import { useEffect, lazy, Suspense } from 'react';
import { Home as HomeI, Map as MapI, Backpack, Compass, MoreHorizontal, Plus, WifiOff } from 'lucide-react';
import { useRoute, href } from './lib/router';
import { useOnline } from './lib/hooks';
import { useStore } from './lib/store';
import { cx } from './components/ui';
import Home from './screens/Home';
const Trips = lazy(() => import('./screens/Trips'));
const Wizard = lazy(() => import('./screens/Wizard'));
const TripPlan = lazy(() => import('./screens/TripPlan'));
const Gear = lazy(() => import('./screens/Gear'));
const CampSearch = lazy(() => import('./screens/CampSearch'));
const Join = lazy(() => import('./screens/Join'));
import { startSync } from './lib/cloud/sync';
import { tripPhotos } from './lib/album';
import { todayISO } from './lib/util';
import { toast } from './components/ui';
import { showSystem } from './lib/cloud/notify';
import { go } from './lib/router';
import { key, STAGING } from './lib/env';

// End of trip: remind this device once to make the collage and video (they're made and kept on the device only).
function useTripEndReminder() {
  const trips = useStore(s => s.trips), album = useStore(s => s.album);
  useEffect(() => {
    const today = todayISO();
    let seen: Record<string, 1> = {}; try { seen = JSON.parse(localStorage.getItem(key('campil-end-nudge')) ?? '{}'); } catch { /* blocked */ }
    for (const t of trips) {
      if (t.end >= today || t.example || seen[t.id] || tripPhotos(album, t.id).length < 2) continue;
      seen[t.id] = 1; try { localStorage.setItem(key('campil-end-nudge'), JSON.stringify(seen)); } catch { /* blocked */ }
      const msg = `הטיול "${t.name}" הסתיים — צרו קולאז׳ וסרטון מ-${tripPhotos(album, t.id).length} התמונות`;
      if (document.visibilityState !== 'visible' && 'Notification' in window && Notification.permission === 'granted') showSystem('CampIL', msg, { tag: 'end-' + t.id, url: `./#/trip/${t.id}/album` }).catch(() => {});
      else { toast(msg); if (location.hash === '#/' || !location.hash) go(`/trip/${t.id}/album`); }
    }
  }, [trips, album]);
}
const More = lazy(() => import('./screens/More'));
const GuideView = lazy(() => import('./screens/More').then(m => ({ default: m.GuideView })));
const Albums = lazy(() => import('./screens/More').then(m => ({ default: m.Albums })));
const Settings = lazy(() => import('./screens/More').then(m => ({ default: m.Settings })));
const About = lazy(() => import('./screens/More').then(m => ({ default: m.About })));

const MapScreen = lazy(() => import('./screens/MapScreen'));
const Academy = lazy(() => import('./screens/Academy'));
const KnotPage = lazy(() => import('./screens/Academy').then(m => ({ default: m.KnotPage })));

const NAV = [
  { to: '/', label: 'בית', I: HomeI, match: (p: string) => p === '/' },
  { to: '/trips', label: 'טיולים', I: Compass, match: (p: string) => p.startsWith('/trip') || p === '/new' },
  { to: '/map', label: 'מפה', I: MapI, match: (p: string) => p.startsWith('/map') || p === '/camps' },
  { to: '/gear', label: 'ציוד', I: Backpack, match: (p: string) => p.startsWith('/gear') },
  { to: '/more', label: 'עוד', I: MoreHorizontal, match: (p: string) => ['/more', '/guides', '/guide', '/academy', '/albums', '/settings', '/about'].some(x => p.startsWith(x)) },
];

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2" aria-label="CampIL">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden><rect width="64" height="64" rx="16" fill={light ? '#f6f1e4' : 'rgb(var(--forest))'} /><path d="M12 48 L32 16 L52 48 Z" fill="none" stroke={light ? '#1d3a29' : 'rgb(var(--onforest))'} strokeWidth="4.5" strokeLinejoin="round" /><path d="M32 48 L32 30" stroke="#d66a2a" strokeWidth="4.5" strokeLinecap="round" /><circle cx="48" cy="17" r="5" fill="#d66a2a" /></svg>
      <span className={cx('font-display text-2xl', light ? 'text-white' : 'text-forest')} dir="ltr">Camp<span className={light ? 'text-[#f08c50]' : 'text-sunset'}>IL</span></span>
    </span>
  );
}

export default function App() {
  const { path, parts, query } = useRoute();
  const online = useOnline();
  const theme = useStore(s => s.settings.theme);
  useTripEndReminder();
  useEffect(() => {
    // A Firebase config baked in at build time (VITE_FIREBASE_CONFIG) connects sharing with no setup on the phone.
    const built = import.meta.env.VITE_FIREBASE_CONFIG as string | undefined;
    const st = useStore.getState();
    if (built && !st.settings.cloud && !location.hash.startsWith('#/join')) { // an invite link brings its own config (Join applies it)
      try { st.setSettings({ cloud: { config: JSON.parse(built), myName: st.members.find(m => m.role === 'adult')?.name ?? '' } }); } catch { /* malformed */ } }
    startSync();
  }, []);
  useEffect(() => { const r = document.documentElement; if (theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', theme); }, [theme]);

  let screen;
  if (path === '/') screen = <Home />;
  else if (path === '/trips') screen = <Trips />;
  else if (path === '/new') screen = <Wizard />;
  else if (parts[0] === 'trip' && parts[1]) screen = <TripPlan id={parts[1]} tab={parts[2] ?? 'overview'} />;
  else if (parts[0] === 'map') screen = <MapScreen region={parts[1] as any} />;
  else if (parts[0] === 'gear') screen = <Gear tab={parts[1] ?? 'inventory'} />;
  else if (path === '/join') screen = <Join query={query} />;
  else if (path === '/camps') screen = <CampSearch query={query} />;
  else if (path === '/more') screen = <More />;
  else if (path === '/academy' || path === '/guides') screen = <Academy />;
  else if (parts[0] === 'academy' && parts[1] === 'knot') screen = <KnotPage id={parts[2]} />;
  else if (parts[0] === 'guide') screen = <GuideView id={parts[1]} />;
  else if (path === '/albums') screen = <Albums />;
  else if (path === '/settings') screen = <Settings />;
  else if (path === '/about') screen = <About />;
  else screen = <Home />;

  return (
    <div className="min-h-dvh lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">דילוג לתוכן</a>
      {/* Desktop rail */}
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-l border-line bg-surface px-5 py-6 lg:flex">
        <a href={href('/')}><Logo /></a>
        <a href={href('/new')} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sunset font-bold text-white shadow-card hover:brightness-105"><Plus size={18} />מתכננים טיול חדש</a>
        <nav aria-label="ניווט ראשי" className="flex flex-col gap-1">
          {NAV.map(n => <a key={n.to} href={href(n.to)} aria-current={n.match(path) ? 'page' : undefined} className={cx('flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition', n.match(path) ? 'bg-forest/10 text-forest' : 'text-muted hover:bg-raised hover:text-ink')}><n.I size={20} />{n.label}</a>)}
        </nav>
        <p className="mt-auto text-xs text-muted">נתוני מזג אוויר: Open-Meteo · מפה: © OpenStreetMap, OpenFreeMap</p>
      </aside>
      <div className="min-w-0 flex-1">
        {STAGING && <div role="note" className="no-print bg-warn px-4 py-1.5 text-center text-sm font-bold text-white safe-t">סביבת בדיקות — נתונים נפרדים מהאפליקציה האמיתית</div>}
        {!online && <div role="status" className="no-print sticky top-0 z-40 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm font-bold text-bg safe-t"><WifiOff size={16} />אין חיבור לאינטרנט — הנתונים שלכם שמורים במכשיר, תחזיות ומפות יוצגו מהשמירה האחרונה</div>}
        <main id="main" className="pb-28 lg:pb-10"><Suspense fallback={<div role="status" className="p-8 text-muted">טוען…</div>}>{screen}</Suspense></main>
      </div>
      {/* Mobile tab bar */}
      <nav aria-label="ניווט ראשי" className="no-print safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pt-1.5 backdrop-blur lg:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch justify-between">
          {NAV.map((n, i) => (
            <li key={n.to} className="flex flex-1 justify-center">
              {i === 2 ? null : null}
              <a href={href(n.to)} aria-current={n.match(path) ? 'page' : undefined} className={cx('flex min-w-[3.8rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-bold', n.match(path) ? 'text-forest' : 'text-muted')}>
                <span className={cx('grid h-8 w-12 place-items-center rounded-full transition', n.match(path) && 'bg-forest/12')}><n.I size={21} /></span>{n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
