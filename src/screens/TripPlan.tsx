import { useEffect, useMemo, useState } from 'react';
import { Share2, Pencil, Trash2, CheckCircle2, CalendarDays, MapPin, Users, ArrowRight, Star } from 'lucide-react';
import { useStore } from '../lib/store';
import { useTripWeather } from '../lib/hooks';
import { fmtRange, tripLength, diffDays, todayISO } from '../lib/util';
import { REGION_BY_ID } from '../data/regions';
import { materialize, packingSignature } from '../engine/build';
import { planMeals, buildSchedule } from '../engine/planner';
import { SITE_BY_ID } from '../data/sites';
import { Scene } from '../components/Scene';
import { Button, Badge, Sheet, cx, toast } from '../components/ui';
import { href, go } from '../lib/router';
import type { Trip } from '../lib/types';
import Overview from './trip/Overview';
import { ShareSheet, Avatars, LeaveOrDelete } from '../components/Collab';
import { SyncBadge } from '../components/Field';
import GearTab from './trip/GearTab';
import MealsTab from './trip/MealsTab';
import { ScheduleTab, TasksTab } from './trip/PlanTabs';
import JournalTab from './trip/JournalTab';
import AlbumTab from './trip/AlbumTab';
import type { PackItem } from '../lib/types';
import { regenScope, isGroup, itemFamily } from '../lib/families';
import { useCloud } from '../lib/cloud/sync';
import EditTrip from './trip/EditTrip';
import SafetyTab from './trip/SafetyTab';

const TABS = [['overview', 'סקירה'], ['gear', 'ציוד'], ['meals', 'מטבח שטח'], ['schedule', 'לוח זמנים'], ['tasks', 'משימות'], ['safety', 'בטיחות'], ['album', 'אלבום'], ['journal', 'יומן']] as const;

export default function TripPlan({ id, tab }: { id: string; tab: string }) {
  const st = useStore();
  const t = st.trips.find(x => x.id === id);
  const [edit, setEdit] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [finish, setFinish] = useState(false);
  if (!t) return <div className="gutter py-16 text-center"><p className="font-display text-2xl">הטיול לא נמצא</p><a className="font-bold text-moss" href={href('/trips')}>לרשימת הטיולים</a></div>;
  return <Plan t={t} tab={tab} st={st} edit={edit} setEdit={setEdit} confirmDel={confirmDel} setConfirmDel={setConfirmDel} finish={finish} setFinish={setFinish} />;
}

function Plan({ t, tab, st, edit, setEdit, confirmDel, setConfirmDel, finish, setFinish }: any) {
  const [share, setShare] = useState(false);
  const wx = useTripWeather(t);
  const sites = useMemo(() => (t as Trip).siteIds.map(i => SITE_BY_ID[i]).filter(Boolean), [t.siteIds]);
  const reg = t.regionId ? REGION_BY_ID[t.regionId as keyof typeof REGION_BY_ID] : null;
  const { nights } = tripLength(t.start, t.end);
  const until = diffDays(todayISO(), t.start);

  // Keep the packing list in sync with trip details and the latest forecast (user edits are preserved).
  useEffect(() => {
    if (wx.status === 'loading') return;
    // Each device regenerates only its part of a shared list (see regenScope): no family overwrites another's.
    const scope = regenScope(t, t.shared ? useCloud.getState().meta[t.shared.cloudId]?.progress : undefined);
    if (!scope) return;
    const sig = packingSignature(t, wx.flags, st);
    if (sig === t.packingSig) return;
    const next = materialize(t, st, wx.days, wx.flags, wx.source);
    // A partner family's device makes its personal and basic list only: the gear store on this device is the
    // organiser's in a shared trip (a partner's app starts with a sample store, not their real gear).
    const gen = t.shared?.role === 'editor' ? next.packing.filter((p: PackItem) => p.source !== 'inventory') : next.packing;
    const packing = isGroup(t) && t.shared ? [...(t.packing as PackItem[]).filter(p => !scope(itemFamily(t, p))), ...gen.filter(p => scope(itemFamily(t, p)))] : gen;
    st.updateTrip(t.id, { packing, packingSig: next.packingSig, packingGeneratedAt: next.packingGeneratedAt });
    if (t.packingSig) toast(wx.source === 'forecast' ? 'רשימת הציוד עודכנה לפי התחזית' : 'רשימת הציוד עודכנה');
  }, [wx.status, wx.flags, t.start, t.end, t.adults, t.children, t.kind, t.lodging, t.pets, t.interests, t.participants, st.inventory, st.settings.waterLitersPerPersonDay]);

  const saveEdit = (p: Partial<Trip>) => {
    const changedCore = p.start !== t.start || p.end !== t.end || p.adults !== t.adults || p.children !== t.children || p.kind !== t.kind || JSON.stringify(p.participants) !== JSON.stringify(t.participants);
    const merged = { ...t, ...p } as Trip;
    const extra: Partial<Trip> = {};
    if (changedCore) { extra.meals = planMeals(merged, st.settings.diet); extra.schedule = buildSchedule(merged, wx.days, merged.siteIds.map(i => SITE_BY_ID[i]).filter(Boolean)); }
    else if (JSON.stringify(p.siteIds) !== JSON.stringify(t.siteIds)) extra.schedule = buildSchedule(merged, wx.days, merged.siteIds.map(i => SITE_BY_ID[i]).filter(Boolean));
    st.updateTrip(t.id, { ...p, ...extra, example: false });
    setEdit(false); toast(changedCore ? 'הטיול עודכן — התפריט, הלו״ז והציוד חושבו מחדש' : 'הטיול עודכן');
  };

  return (
    <div>
      <header className="relative isolate overflow-hidden text-white">
        <Scene kind={reg?.scene ?? 'forest'} seed={t.name.length + 4} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
        <div className="gutter mx-auto max-w-6xl space-y-3 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="no-print flex items-center justify-between gap-2">
            <a href={href('/trips')} className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-sm font-bold backdrop-blur"><ArrowRight size={16} />הטיולים שלי</a>
            <div className="flex gap-1.5">
              <button onClick={() => setShare(true)} className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur hover:bg-black/45" aria-label="שיתוף הטיול"><Share2 size={18} /></button>
              <button onClick={() => setEdit(true)} className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur hover:bg-black/45" aria-label="עריכת פרטי הטיול"><Pencil size={18} /></button>
              <button onClick={() => setConfirmDel(true)} className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur hover:bg-black/45" aria-label="מחיקת הטיול"><Trash2 size={18} /></button>
            </div>
          </div>
          <div className="pt-8">
            <div className="mb-1 flex flex-wrap gap-2">{t.example && <Badge className="!bg-white/20 !text-white">טיול לדוגמה — אפשר לערוך או למחוק</Badge>}{t.status === 'done' ? <Badge className="!bg-white/20 !text-white">הסתיים</Badge> : until >= 0 && <Badge className="!bg-sunset !text-white">{until === 0 ? 'יוצאים היום' : `בעוד ${until} ימים`}</Badge>}</div>
            <h1 className="font-display text-3xl drop-shadow md:text-5xl">{t.name}</h1>
            {t.shared && <div className="mt-2 flex flex-wrap items-center gap-2"><Avatars t={t} light /><SyncBadge t={t} /></div>}
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-white/90"><span className="flex items-center gap-1"><CalendarDays size={15} />{fmtRange(t.start, t.end)}{nights ? ` · ${nights} לילות` : ' · טיול יום'}</span>{reg && <span className="flex items-center gap-1"><MapPin size={15} />{reg.name}</span>}<span className="flex items-center gap-1"><Users size={15} />{t.adults + t.children} משתתפים</span></p>
          </div>
        </div>
      </header>
      <nav aria-label="חלקי התוכנית" className="no-print sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="scroll-x gutter mx-auto flex max-w-6xl gap-1 py-2">
          {TABS.map(([k, l]) => <a key={k} href={href(`/trip/${t.id}/${k}`)} aria-current={tab === k ? 'page' : undefined} className={cx('whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition', tab === k ? 'bg-forest text-onforest' : 'text-muted hover:bg-raised')}>{l}</a>)}
        </div>
      </nav>
      <div className="gutter mx-auto max-w-6xl py-6">
        {tab === 'overview' && <Overview t={t} wx={wx} sites={sites} onFinish={() => setFinish(true)} />}
        {tab === 'gear' && <GearTab t={t} />}
        {tab === 'meals' && <MealsTab t={t} />}
        {tab === 'schedule' && <ScheduleTab t={t} wx={wx} />}
        {tab === 'tasks' && <TasksTab t={t} />}
        {tab === 'safety' && <SafetyTab t={t} wx={wx} />}
        {tab === 'album' && <AlbumTab t={t} />}
        {tab === 'journal' && <JournalTab t={t} />}
      </div>
      {edit && <EditTrip t={t} onClose={() => setEdit(false)} onSave={saveEdit} />}
      {t.shared ? (
        <Sheet open={confirmDel} onClose={() => setConfirmDel(false)} title="טיול משותף">
          <LeaveOrDelete t={t} onDone={() => { setConfirmDel(false); go('/trips'); }} />
        </Sheet>
      ) : (
        <Sheet open={confirmDel} onClose={() => setConfirmDel(false)} title="למחוק את הטיול?" footer={<><Button variant="danger" onClick={() => { st.removeTrip(t.id); go('/trips'); toast('הטיול נמחק'); }}>מחיקה</Button><Button variant="ghost" onClick={() => setConfirmDel(false)}>ביטול</Button></>}>
          <p>הטיול, רשימת הציוד, התפריט ורשומות היומן שלו יימחקו מהמכשיר. אי אפשר לבטל.</p>
        </Sheet>
      )}
      <ShareSheet t={t} open={share} onClose={() => setShare(false)} />
      <FinishSheet open={finish} onClose={() => setFinish(false)} t={t} />
    </div>
  );
}

function FinishSheet({ open, onClose, t }: { open: boolean; onClose: () => void; t: Trip }) {
  const up = useStore(s => s.updateTrip);
  const [rating, setRating] = useState(t.rating ?? 0); const [notes, setNotes] = useState(t.notes ?? '');
  return (
    <Sheet open={open} onClose={onClose} title="סיכום הטיול" footer={<Button icon={<CheckCircle2 size={18} />} onClick={() => { up(t.id, { status: 'done', rating, notes }); onClose(); toast('נשמר בהיסטוריה — ההמלצות הבאות ילמדו ממנו'); }}>שמירה בהיסטוריה</Button>}>
      <div className="space-y-4">
        <div><span className="label">איך היה?</span><div className="flex gap-1" role="radiogroup" aria-label="דירוג הטיול">{[1, 2, 3, 4, 5].map(n => <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} כוכבים`} onClick={() => setRating(n)}><Star size={34} className={n <= rating ? 'fill-sunset text-sunset' : 'text-line'} /></button>)}</div></div>
        <div><label className="label" htmlFor="fn">מה למדנו לפעם הבאה? (מה חסר, מה מיותר)</label><textarea id="fn" className="field min-h-28" value={notes} onChange={e => setNotes(e.target.value)} /></div>
        <p className="text-sm text-muted">הדירוג משמש להמלצות עתידיות בלבד ונשמר במכשיר שלכם.</p>
      </div>
    </Sheet>
  );
}
