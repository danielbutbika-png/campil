// Home screen panels for the two trip-time modes: "preparing" (the week before) and "in the field" (during the trip).
// Everything shown here comes from the trip itself, the forecast service, or fixed official sources —
// nothing about terrain, closures or safety is generated.
import { Images, Star, Wrench, Copy, Backpack, ListChecks, ShoppingCart, ChevronLeft, CalendarDays, Navigation, Camera, NotebookPen, Clock, AlertTriangle, Phone } from 'lucide-react';
import type { Trip } from '../lib/types';
import { useTripWeather, tripPoint } from '../lib/hooks';
import { readiness } from '../engine/packing';
import { myPacking } from '../lib/families';
import { diffDays, todayISO, tripLength, fmtRange, fmtDate, addDays } from '../lib/util';
import { REGION_BY_ID } from '../data/regions';
import { SITE_BY_ID } from '../data/sites';
import { navApps } from '../services/fuel';
import { tripDay, HOME_MODE_HE, type HomeMode } from '../lib/homeMode';
import { DayStrip, SourceLine, WxIcon } from './Weather';
import { FieldCard, OfficialAlerts } from './Field';
import { AssistantCard } from './Assistant';
import { Ring, Card, Badge, Button, cx, toast } from './ui';
import { useStore } from '../lib/store';
import { tripPhotos } from '../lib/album';
import { duplicateTrip } from '../lib/tripOps';
import { go } from '../lib/router';
import { href } from '../lib/router';

const tripName = (t: Trip) => t.name || (t.regionId ? REGION_BY_ID[t.regionId].name : 'הטיול');

export function ModeSwitch({ mode, auto, onChange, modes }: { mode: HomeMode; auto: HomeMode; onChange: (m: HomeMode | null) => void; modes: HomeMode[] }) {
  return (
    <div role="radiogroup" aria-label="מצב מסך הבית" className="inline-flex max-w-full flex-wrap rounded-full bg-black/30 p-1 backdrop-blur">
      {modes.map(m => (
        <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => onChange(m === auto ? null : m)}
          className={cx('min-h-9 whitespace-nowrap rounded-full px-3 text-sm font-bold transition sm:px-4', mode === m ? 'bg-white text-forest' : 'text-white/90 hover:bg-white/15')}>
          {HOME_MODE_HE[m]}{m === auto ? <span className="sr-only"> (לפי התאריכים)</span> : null}
        </button>
      ))}
    </div>
  );
}

function Alerts({ t }: { t: Trip }) {
  const wx = useTripWeather(t);
  const alerts = wx.flags.known ? [wx.flags.extremeHeat && 'עומס חום', wx.flags.rain && 'גשם', wx.flags.severeWind && 'רוח חזקה', wx.flags.veryCold && 'לילה קר'].filter(Boolean) : [];
  return alerts.length ? <p className="flex items-center gap-2 text-sm font-bold text-warn"><AlertTriangle size={16} />לפי התחזית: {alerts.join(', ')} — פרטים בתוכנית</p> : null;
}

function Tile({ to, I, title, sub, tone }: { to: string; I: any; title: string; sub: string; tone?: 'warn' }) {
  return (
    <a href={href(to)} className="flex items-center gap-3 rounded-xl2 border border-line bg-surface p-4 shadow-card transition hover:border-moss">
      <I size={22} className={tone === 'warn' ? 'text-warn' : 'text-moss'} />
      <span className="min-w-0 flex-1"><span className="block font-bold">{title}</span><span className="block truncate text-sm text-muted">{sub}</span></span>
      <ChevronLeft size={18} className="text-muted" />
    </a>
  );
}

/** The week before: what's left to pack and do, the forecast, and saving the trip for no signal. */
export function PrepPanel({ t }: { t: Trip }) {
  const wx = useTripWeather(t);
  const mine = myPacking(t);
  const r = readiness(mine);
  const left = mine.filter(p => !p.removed && !p.packed);
  const until = diffDays(todayISO(), t.start);
  const tasks = t.tasks.filter(x => !x.done).sort((a, b) => a.dueOffsetDays - b.dueOffsetDays);
  const due = tasks.filter(x => x.dueOffsetDays !== 999 && addDays(t.start, x.dueOffsetDays) <= todayISO());
  return (
    <section aria-labelledby="prep-h" className="space-y-4">
      <Card className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{until === 0 ? 'יוצאים היום' : until === 1 ? 'יוצאים מחר' : `עוד ${until} ימים`}</Badge><span className="flex items-center gap-1 text-sm text-muted"><CalendarDays size={15} />{fmtRange(t.start, t.end)}</span></div>
          <h2 id="prep-h" className="font-display text-2xl">ההכנות ל{tripName(t)}</h2>
          {wx.days.length > 0 && <DayStrip days={wx.days} compact />}
          {wx.avail === 'too_far' && <p className="text-sm text-muted">התחזית לתאריכים תיפתח כ-16 ימים לפני היציאה.</p>}
          <Alerts t={t} />
        </div>
        <div className="flex items-center gap-3 md:flex-col"><Ring pct={r.pct} size={96} label={`ארוז ${r.pct}%`} /><p className="num text-sm text-muted md:text-center">{r.done} מתוך {r.total} ארוזים</p></div>
      </Card>
      <AssistantCard t={t} max={3} />
      <div className="grid gap-3 md:grid-cols-3">
        <Tile to={`/trip/${t.id}/gear`} I={Backpack} title={left.length ? `${left.length} פריטים לארוז` : 'הכול ארוז'} sub={left.slice(0, 3).map(p => p.name).join(' · ') || 'כל הכבוד'} tone={left.length ? 'warn' : undefined} />
        <Tile to={`/trip/${t.id}/tasks`} I={ListChecks} title={tasks.length ? `${tasks.length} משימות פתוחות` : 'אין משימות פתוחות'} sub={due.length ? `${due.length} כבר בזמן: ${due[0].text}` : tasks[0]?.text ?? '—'} tone={due.length ? 'warn' : undefined} />
        <Tile to={`/trip/${t.id}/meals`} I={ShoppingCart} title="תפריט ורשימת קניות" sub="כמויות לפי המשפחות בטיול" />
      </div>
      <FieldCard t={t} point={tripPoint(t)} />
      <SourceLine f={wx.forecast} />
    </section>
  );
}

/** During the trip: today's plan and weather, navigation, quick capture, and official/emergency sources. */
export function FieldPanel({ t }: { t: Trip }) {
  const wx = useTripWeather(t);
  const today = todayISO();
  const live = tripDay(t, today);
  const day = live ?? 0;
  const { days } = tripLength(t.start, t.end);
  const w = wx.source === 'forecast' ? wx.days.find(d => d.date === (live === null ? t.start : today)) : undefined;
  const plan = t.schedule.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
  const now = new Date().toTimeString().slice(0, 5);
  const next = live === null ? undefined : plan.find(s => s.time >= now);
  const camp = t.siteIds.map(id => SITE_BY_ID[id]).find(s => s?.lodging) ?? null;
  const point = tripPoint(t);
  const nav = camp ?? point;
  return (
    <section aria-labelledby="field-panel-h" className="space-y-4">
      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">{live === null ? <Badge>תצוגה מקדימה — הטיול מתחיל ב-{fmtDate(t.start)}; מוצג היום הראשון</Badge> : <><Badge tone="accent">יום {day + 1} מתוך {days}</Badge><span className="text-sm text-muted">{fmtDate(today)}</span></>}</div>
        <h2 id="field-panel-h" className="font-display text-2xl">{live === null ? 'יום ראשון' : 'היום'} ב{tripName(t)}</h2>
        {w ? (
          <p className="flex items-center gap-3"><WxIcon code={w.code} size={32} /><span className="num text-lg font-extrabold">{Math.round(w.tMax)}° / {Math.round(w.tMin)}°</span>{w.sunset && <span className="text-sm text-muted">שקיעה {w.sunset.slice(11, 16)}</span>}</p>
        ) : <p className="text-sm text-muted">{navigator.onLine ? 'אין תחזית לתאריך הזה.' : 'אין קליטה — מוצגת התחזית האחרונה שנשמרה, אם נשמרה.'}</p>}
        <Alerts t={t} />
        {plan.length ? (
          <ol className="space-y-1.5" aria-label="הלו״ז להיום">
            {plan.map(s => (
              <li key={s.id} className={cx('flex items-start gap-3 rounded-xl px-3 py-2', s === next ? 'bg-moss/10 font-bold' : '')}>
                <span className="num w-12 shrink-0 text-sm text-muted">{s.time}</span><span className="flex-1">{s.title}{s.note && <span className="block text-xs font-normal text-muted">{s.note}</span>}</span>
                {s === next && <span className="flex items-center gap-1 text-xs text-moss"><Clock size={13} />הבא</span>}
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-muted">אין פריטים בלו״ז להיום.</p>}
        <a href={href(`/trip/${t.id}/schedule`)} className="inline-flex items-center text-sm font-bold text-moss">ללו״ז המלא<ChevronLeft size={16} /></a>
      </Card>
      {nav && (
        <Card className="space-y-2 p-4">
          <p className="flex items-center gap-2 font-bold"><Navigation size={18} className="text-moss" />ניווט ל{'name' in nav ? nav.name : nav.label}</p>
          <div className="flex flex-wrap gap-2">{navApps(nav.lat, nav.lon).map(a => <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="rounded-full bg-raised px-4 py-2 text-sm font-bold hover:bg-sand">{a.name}</a>)}</div>
          <p className="text-xs text-muted">אפליקציות הניווט צריכות קליטה, אלא אם שמרתם בהן מפה מראש.</p>
        </Card>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        <Tile to={`/trip/${t.id}/album`} I={Camera} title="הוספת תמונות" sub="לאלבום המשותף של הטיול" />
        <Tile to={`/trip/${t.id}/journal`} I={NotebookPen} title="יומן הטיול" sub="רגע שרוצים לזכור" />
        <Tile to={`/trip/${t.id}/gear`} I={Backpack} title="רשימת הציוד" sub="גם לאריזה בחזרה" />
      </div>
      <a href="tel:101" className="flex items-center justify-center gap-2 rounded-xl2 bg-danger py-3 font-bold text-white"><Phone size={18} />חירום — מד״א 101</a>
      <OfficialAlerts flood={t.siteIds.some(id => SITE_BY_ID[id]?.floodRisk)} />
      <SourceLine f={wx.forecast} />
    </section>
  );
}

/** After the trip: album and video, gear care, lessons for next time, and planning the next one. */
export function AfterPanel({ t }: { t: Trip }) {
  const { album, inventory, updateTrip, addTrip } = useStore();
  const photos = tripPhotos(album, t.id).length;
  const inTrip = new Set(t.packing.filter(p => !p.removed && p.inventoryId).map(p => p.inventoryId!));
  const care: string[] = [];
  if (t.packing.some(p => !p.removed && p.category === 'tents' && p.packed)) care.push('לפתוח ולייבש את האוהל והברזנטים לפני אחסון — ציוד שנארז לח מתעפש');
  const charge = inventory.filter(g => inTrip.has(g.id) && g.charge).map(g => g.name);
  if (charge.length) care.push(`לטעון לפני החזרה לארגז: ${charge.slice(0, 4).join(', ')}${charge.length > 4 ? '…' : ''}`);
  const borrowed = inventory.filter(g => inTrip.has(g.id) && g.borrowedFrom?.trim());
  for (const g of borrowed) care.push(`להחזיר: ${g.name} ← ${g.borrowedFrom}`);
  const missing = t.packing.filter(p => !p.removed && p.missing).map(p => p.name);
  if (missing.length) care.push(`להשלים לפעם הבאה: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);
  return (
    <section aria-labelledby="after-h" className="space-y-4">
      <Card className="space-y-3 p-5">
        <h2 id="after-h" className="font-display text-2xl">אחרי {tripName(t)}</h2>
        <p className="text-sm text-muted">{fmtRange(t.start, t.end)}{t.status === 'done' && t.rating ? ` · דירגתם ${t.rating}/5` : ''}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Tile to={`/trip/${t.id}/album`} I={Images} title={photos ? `${photos} תמונות באלבום` : 'אלבום הטיול'} sub={photos > 1 ? 'קולאז׳ וסרטון — נוצרים ונשמרים בטלפון' : 'הוסיפו תמונות מהטיול'} />
          {t.status !== 'done' && <Tile to={`/trip/${t.id}`} I={Star} title="סיכום ודירוג" sub="מה אהבתם — משפיע על ההמלצות הבאות" />}
        </div>
      </Card>
      {care.length > 0 && (
        <Card className="space-y-2 p-5">
          <h3 className="flex items-center gap-2 font-bold"><Wrench size={18} className="text-moss" />טיפול בציוד</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">{care.map(c => <li key={c}>{c}</li>)}</ul>
          <a href={href('/gear/inventory')} className="inline-flex items-center text-sm font-bold text-moss">למחסן הציוד<ChevronLeft size={16} /></a>
        </Card>)}
      <Card className="space-y-2 p-5">
        <label htmlFor="lessons" className="font-bold">מה לשפר בפעם הבאה?</label>
        <textarea id="lessons" className="field min-h-24" placeholder="למשל: להביא עוד שמיכה, לצאת שעה מוקדם יותר, החניון היה רועש" defaultValue={t.lessons ?? ''} onBlur={e => { if (e.target.value !== (t.lessons ?? '')) { updateTrip(t.id, { lessons: e.target.value || undefined }); toast('נשמר — יופיע בטיול הבא שתשכפלו מזה'); } }} />
        <Button variant="soft" icon={<Copy size={16} />} onClick={() => { const n = duplicateTrip(t, todayISO()); addTrip(n); toast('נוצר טיול חדש מאותה תוכנית — עדכנו תאריכים'); go(`/trip/${n.id}`); }}>לתכנן שוב את אותו טיול</Button>
      </Card>
    </section>
  );
}
