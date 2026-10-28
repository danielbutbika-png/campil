import { useEffect, useMemo, useState } from 'react';
import { Plus, MapPin, ChevronLeft, Backpack, Images, BookOpen, Tent, CalendarDays, AlertTriangle, LocateFixed } from 'lucide-react';
import { useStore, nextTrip, blankTrip, tasteOf } from '../lib/store';
import { useForecast, useTripWeather, tripPoint } from '../lib/hooks';
import { greeting, fmtRange, seasonOf, SEASON_HE, diffDays, todayISO, tripLength } from '../lib/util';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { SITES } from '../data/sites';
import { GUIDES } from '../data/guides';
import { rank } from '../engine/scoring';
import { readiness } from '../engine/packing';
import { exampleTrip } from '../engine/build';
import { Scene } from '../components/Scene';
import { WxIcon, DayStrip, SourceLine } from '../components/Weather';
import { SiteCard, useSiteSheet } from '../components/SiteCard';
import { Button, Card, Ring, Section, Badge, Blaze, cx } from '../components/ui';
import { href, go } from '../lib/router';
import { wmoText } from '../services/weather';
import type { Trip } from '../lib/types';
import { Logo } from '../App';
import { myPacking } from '../lib/families';
import { homeMode, type HomeMode } from '../lib/homeMode';
import { ModeSwitch, PrepPanel, FieldPanel, AfterPanel } from '../components/HomeModes';
import { recentlyEnded } from '../lib/tripOps';

const HERO: { scene: any; caption: string }[] = [
  { scene: 'mountain', caption: 'רמת הגולן' }, { scene: 'desert', caption: 'מדבר יהודה' }, { scene: 'crater', caption: 'מכתש רמון' }, { scene: 'forest', caption: 'הגליל העליון' }, { scene: 'sea', caption: 'חופי הגליל המערבי' },
];

export default function Home() {
  const st = useStore();
  const { members, trips, settings, onboarded, inventory, journal } = st;
  const sheet = useSiteSheet();
  const [hi, setHi] = useState(0);
  useEffect(() => { const t = setInterval(() => setHi(i => (i + 1) % HERO.length), 7000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (onboarded) return;
    useStore.setState(s => ({ onboarded: true, trips: s.trips.length ? s.trips : [exampleTrip(s, blankTrip(s.members))] }));
  }, [onboarded]);

  const upcoming = nextTrip(trips);
  const real = !!upcoming && !upcoming.example;
  const recent = recentlyEnded(trips, todayISO());
  const dateMode = homeMode(upcoming);
  const auto: HomeMode = dateMode === 'plan' && recent ? 'after' : dateMode;
  const modes: HomeMode[] = [...(recent ? ['after' as const] : []), 'plan', ...(real ? ['prep' as const, 'field' as const] : [])];
  const [override, setOverride] = useState<HomeMode | null>(null);
  const mode: HomeMode = modes.length > 1 && override && modes.includes(override) ? override : modes.includes(auto) ? auto : 'plan';
  const name = members.find(m => m.role === 'adult')?.name;
  const point = upcoming ? tripPoint(upcoming) : null;
  const here = settings.home ?? point ?? { lat: REGION_BY_ID.center.lat, lon: REGION_BY_ID.center.lon, label: 'מרכז הארץ' };
  const fc = useForecast(here.lat, here.lon);
  const today = fc.data?.days[0];
  const season = seasonOf(todayISO());
  const taste = tasteOf(st);
  const seasonal = REGIONS.filter(r => r.bestSeasons[0] === season || r.bestSeasons.includes(season)).sort((a, b) => a.bestSeasons.indexOf(season) - b.bestSeasons.indexOf(season)).slice(0, 6);
  const ctx = { start: todayISO(), kind: 'camping' as const, children: members.filter(m => m.role === 'child').length, childAges: members.map(m => m.age ?? 30).filter(a => a < 18), interests: ['family' as const] };
  const camps = useMemo(() => rank(SITES.filter(s => s.type === 'campsite' || s.lodging), ctx, null, settings, taste).slice(0, 6), [settings.home, trips.length]);
  const trails = useMemo(() => rank(SITES.filter(s => s.type === 'trail'), ctx, null, settings, taste).slice(0, 6), [settings.home, trips.length]);
  const missing = inventory.filter(g => g.status === 'buy').length;
  const photos = journal.reduce((n, j) => n + j.photoIds.length, 0);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-forest text-white">
        {HERO.map((h, i) => <Scene key={h.scene} kind={h.scene} seed={i + 2} className={cx('absolute inset-0 -z-10 h-full w-full transition-opacity duration-[1400ms]', i === hi ? 'opacity-100' : 'opacity-0')} />)}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        <div className="gutter mx-auto max-w-6xl space-y-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-12">
          <div className="flex items-center justify-between lg:hidden"><Logo light /><span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold backdrop-blur">{HERO[hi].caption}</span></div>
          <div className="max-w-xl space-y-2 pt-6 md:pt-14">
            <p className="text-lg font-semibold text-white/90">{greeting()}{name ? `, ${name}` : ''}</p>
            <h1 className="font-display text-4xl leading-tight drop-shadow md:text-6xl">{mode === 'field' ? 'טיול נעים!' : mode === 'prep' ? 'עוד רגע יוצאים' : mode === 'after' ? 'ברוכים השבים!' : 'לאן יוצאים הפעם?'}</h1>
            <p className="text-white/85">{mode === 'field' ? 'מה מתוכנן היום, ניווט, תמונות ומספרי חירום.' : mode === 'after' ? 'אלבום וסרטון, טיפול בציוד, ומה לשפר לפעם הבאה.' : mode === 'prep' ? 'מה נשאר לארוז ולעשות, התחזית, ושמירת הטיול לשימוש בלי קליטה.' : 'תכנון, ציוד, תחזית ותיעוד — במקום אחד, מותאם למשפחה שלכם.'}</p>
          </div>
          {modes.length > 1 && <ModeSwitch mode={mode} auto={auto} onChange={setOverride} modes={modes} />}
          <div className={cx('flex flex-wrap items-center gap-3', mode !== 'plan' && 'hidden')}>
            <Button variant="accent" size="lg" icon={<Plus size={22} />} onClick={() => go('/new')}>מתכננים טיול חדש</Button>
            <Button size="lg" className="!bg-white/15 backdrop-blur hover:!bg-white/25" icon={<Tent size={20} />} onClick={() => go('/camps')}>מקום לקמפינג</Button>
            {today && (
              <a href={href('/settings')} className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-2.5 backdrop-blur hover:bg-black/40">
                <WxIcon code={today.code} size={30} className="!text-white" />
                <span className="leading-tight"><span className="num block text-xl font-extrabold">{Math.round(fc.data?.current?.t ?? today.tMax)}°</span><span className="text-xs text-white/85">{wmoText(fc.data?.current?.code ?? today.code)} · {here.label}</span></span>
                <span className="num text-sm text-white/85">{Math.round(today.tMax)}° / {Math.round(today.tMin)}°</span>
              </a>
            )}
            {fc.isError && <span className="rounded-2xl bg-black/30 px-4 py-2.5 text-sm backdrop-blur">התחזית לא זמינה כרגע</span>}
          </div>
          {!settings.home && <a href={href('/settings')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 underline-offset-4 hover:underline"><LocateFixed size={15} />הגדירו נקודת יציאה כדי לקבל מרחקים ותחזית מקומית</a>}
        </div>
      </header>

      <div className="gutter mx-auto max-w-6xl space-y-10">
        {/* Upcoming trip */}
        {mode === 'after' && recent ? <AfterPanel t={recent} /> : mode === 'field' && upcoming ? <FieldPanel t={upcoming} /> : mode === 'prep' && upcoming ? <PrepPanel t={upcoming} /> : upcoming ? <UpcomingTrip t={upcoming} /> : (
          <Card className="flex flex-col items-start gap-3 p-6 md:flex-row md:items-center">
            <Tent className="text-moss" size={36} /><div className="flex-1"><p className="font-display text-xl">אין טיול מתוכנן</p><p className="text-muted">האשף ישאל כמה שאלות ויבנה תוכנית, רשימת ציוד וארוחות.</p></div>
            <Button onClick={() => go('/new')} icon={<Plus size={18} />}>טיול חדש</Button>
          </Card>
        )}

        {/* Quick access */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { to: '/gear', I: Backpack, t: 'מאגר הציוד', s: `${inventory.length} פריטים${missing ? ` · ${missing} להשלים` : ''}` },
            { to: '/gear/boxes', I: Tent, t: 'ארגזים ואריזה', s: 'מה נמצא איפה' },
            { to: '/albums', I: Images, t: 'אלבומי טיולים', s: photos ? `${photos} תמונות` : 'עוד אין תמונות' },
            { to: '/guides', I: BookOpen, t: 'מדריכים וטיפים', s: `${GUIDES.length} מדריכים` },
          ].map(q => (
            <a key={q.to} href={href(q.to)} className="group flex flex-col gap-2 rounded-xl2 border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <q.I className="text-moss" size={24} /><span className="font-bold">{q.t}</span><span className="text-sm text-muted">{q.s}</span>
            </a>
          ))}
        </div>

        {mode !== 'field' && <>
        <Section title={`מה טוב ב${SEASON_HE[season]}`} action={<a href={href('/map')} className="flex items-center text-sm font-bold text-moss">למפה<ChevronLeft size={16} /></a>}>
          <div className="scroll-x -mx-4 flex gap-3 px-4 pb-2">
            {seasonal.map((r, i) => (
              <a key={r.id} href={href(`/map/${r.id}`)} className="group relative h-48 w-60 shrink-0 overflow-hidden rounded-xl2 shadow-card">
                <Scene kind={r.scene} seed={i + 11} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 space-y-1 p-4 text-white"><span className="font-display block text-xl">{r.name}</span><span className="block text-sm text-white/85">{r.highlights.slice(0, 2).join(' · ')}</span></span>
              </a>
            ))}
          </div>
        </Section>

        <Section title="חניוני לילה ואתרי לינה">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{camps.slice(0, 3).map(s => <SiteCard key={s.site.id} site={s.site} scored={s} onOpen={() => sheet.open(s.site)} />)}</div>
        </Section>

        <Section title="מסלולים פופולריים">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{trails.slice(0, 3).map(s => <SiteCard key={s.site.id} site={s.site} scored={s} onOpen={() => sheet.open(s.site)} />)}</div>
        </Section>

        <Section title="מדריכים לקמפינג" action={<a href={href('/guides')} className="flex items-center text-sm font-bold text-moss">לכל המדריכים<ChevronLeft size={16} /></a>}>
          <div className="grid gap-3 md:grid-cols-3">
            {GUIDES.filter(g => g.id !== 'firebase').slice(0, 3).map(g => (
              <a key={g.id} href={href(`/guide/${g.id}`)} className="flex flex-col gap-2 rounded-xl2 border border-line bg-surface p-4 hover:border-moss">
                <span className="flex items-center gap-2 text-xs font-bold text-muted"><Blaze color={g.tone === 'safety' ? '#c0392b' : g.tone === 'family' ? '#3c6e9f' : '#2f6b3f'} />{g.tone === 'safety' ? 'בטיחות' : g.tone === 'family' ? 'משפחה' : 'מיומנויות'} · {g.minutes} דק׳ קריאה</span>
                <span className="font-bold">{g.title}</span><span className="text-sm text-muted">{g.blurb}</span>
              </a>
            ))}
          </div>
        </Section>
        </>}
        <SourceLine f={fc.data} />
      </div>
      {sheet.el}
    </div>
  );
}

function UpcomingTrip({ t }: { t: Trip }) {
  const wx = useTripWeather(t);
  const r = readiness(myPacking(t));
  const until = diffDays(todayISO(), t.start);
  const { nights } = tripLength(t.start, t.end);
  const reg = t.regionId ? REGION_BY_ID[t.regionId] : null;
  const alerts = wx.flags.known ? [wx.flags.extremeHeat && 'עומס חום', wx.flags.rain && 'גשם', wx.flags.severeWind && 'רוח חזקה', wx.flags.veryCold && 'לילה קר'].filter(Boolean) : [];
  return (
    <a href={href(`/trip/${t.id}`)} className="block overflow-hidden rounded-xl2 border border-line bg-surface shadow-card transition hover:shadow-lift">
      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">הטיול הקרוב</Badge>{t.example && <Badge>טיול לדוגמה</Badge>}
            <span className="text-sm font-bold text-muted">{until > 0 ? `בעוד ${until} ימים` : until === 0 ? 'היום!' : 'בעיצומו'}</span>
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl">{t.name || reg?.name || 'טיול חדש'}</h2>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted"><span className="flex items-center gap-1"><CalendarDays size={15} />{fmtRange(t.start, t.end)}</span><span>{nights ? `${nights} לילות` : 'טיול יום'}</span>{reg && <span className="flex items-center gap-1"><MapPin size={15} />{reg.name}</span>}</p>
          </div>
          {wx.days.length > 0 && <DayStrip days={wx.days} compact />}
          {wx.avail === 'too_far' && <p className="text-sm text-muted">התחזית תיפתח כ-16 ימים לפני היציאה.</p>}
          {alerts.length > 0 && <p className="flex items-center gap-2 text-sm font-bold text-warn"><AlertTriangle size={16} />שימו לב: {alerts.join(', ')} — פרטים בתוכנית</p>}
        </div>
        <div className="flex items-center gap-4 border-t border-line bg-raised/40 p-5 md:flex-col md:justify-center md:border-r md:border-t-0">
          <Ring pct={r.pct} size={92} label={`מוכנות לטיול ${r.pct}%`} />
          <div className="md:text-center"><p className="font-bold">מוכנות לאריזה</p><p className="num text-sm text-muted">{r.done} מתוך {r.total} פריטים{r.missing ? ` · ${r.missing} חסרים` : ''}</p><p className="mt-1 flex items-center gap-1 text-sm font-bold text-moss md:justify-center">לתוכנית המלאה<ChevronLeft size={16} /></p></div>
        </div>
      </div>
    </a>
  );
}
