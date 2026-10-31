// "Ideas for each day" in the schedule tab: a day-by-day proposal from the place database, scored for this trip and
// this day's weather and official warnings. Shows what changed since last time and why. Nothing is added to the
// schedule until the user reviews the list and approves it.
import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, Loader2, AlertTriangle, Sun, Plus, RefreshCw } from 'lucide-react';
import type { Trip, TripPlace, ScheduleItem } from '../lib/types';
import type { TripWx } from '../lib/hooks';
import { tripPoint } from '../lib/hooks';
import { loadPlaces, CAT_HE, wikidataUrl, osmUrl, type PlaceDb } from '../services/placesDb';
import { fitContextFor } from '../intel/placeFit';
import { dayPlan, planInputs, whatChanged, SLOT_HE, type PlanInputs, type Pick } from '../intel/dayPlan';
import { useAlertCtx } from '../services/officialAlerts';
import { availability } from '../services/weather';
import { useStore } from '../lib/store';
import { tripLength, fmtDate, shortDay, uid } from '../lib/util';
import { Button, Sheet, toast } from './ui';
import { href } from '../lib/router';

const KEY = (id: string) => `campil-dayplan-${id}`;
interface Saved { inputs: PlanInputs; picks: string[][] }

export function DayIdeas({ t, wx }: { t: Trip; wx: TripWx }) {
  const [db, setDb] = useState<PlaceDb | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadPlaces().then(setDb, e => setErr(e.message)); }, []);
  const al = useAlertCtx();
  const base = tripPoint(t);
  const { days } = tripLength(t.start, t.end);
  const ctx = useMemo(() => ({ ...fitContextFor(t, wx.source === 'forecast' ? wx.days : [], availability(t.start, t.end), base), ...al }), [t, wx.days, wx.source, base?.lat, base?.lon, al]);
  const inTrip = [...(t.places ?? []).map(p => p.id)];
  const plan = useMemo(() => (db && base ? dayPlan(db, ctx, { start: t.start, days: Math.min(days, 7), radiusKm: t.maxDriveKm ?? 30, exclude: inTrip }) : []), [db, ctx, t.start, days, t.maxDriveKm, inTrip.join()]);
  const inputs = useMemo(() => planInputs(ctx, t.start, t.end), [ctx, t.start, t.end]);
  const picks = plan.map(d => d.picks.map(p => p.p.id));
  const [saved, setSaved] = useState<Saved | null>(() => { try { return JSON.parse(localStorage.getItem(KEY(t.id)) ?? 'null'); } catch { return null; } });
  const changed = saved && JSON.stringify(saved.picks) !== JSON.stringify(picks) ? whatChanged(saved.inputs, inputs) : [];
  const remember = () => { const v = { inputs, picks }; try { localStorage.setItem(KEY(t.id), JSON.stringify(v)); } catch { /* ignore */ } setSaved(v); };
  useEffect(() => { if (plan.length && !saved) remember(); }, [plan.length]);
  const [review, setReview] = useState(false);

  if (!base) return <p className="rounded-xl2 border border-line bg-surface p-4 text-sm">כדי להציע תוכנית יומית צריך יעד או מקום לינה לטיול (עריכת הטיול).</p>;
  if (err) return <p className="rounded-xl2 border border-line bg-surface p-4 text-sm text-muted">{err}</p>;
  if (!db) return <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={15} className="animate-spin" />מכינים הצעות לפי יום…</p>;
  const all = plan.flatMap(d => d.picks.map(k => ({ d, k })));
  return (
    <section aria-labelledby="ideas-h" className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ideas-h" className="flex items-center gap-2 font-display text-xl"><Lightbulb size={20} className="text-sunset" />הצעה לכל יום</h2>
        <span className="rounded-full bg-raised px-2.5 py-1 text-xs font-bold text-muted">מבוסס כללים — בלי AI</span>
      </div>
      <p className="text-sm text-muted">ליד {base.label}, עד {t.maxDriveKm ?? 30} ק״מ בקו אווירי, לפי מי שמגיע, מה שאוהבים, התחזית לכל יום ואזהרות רשמיות. זו הצעה — הלו״ז לא משתנה בלי אישור.</p>
      {changed.length > 0 && (
        <div role="status" className="space-y-1 rounded-xl border-2 border-info/40 bg-info/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-bold"><RefreshCw size={15} />ההצעה השתנתה מאז הפעם הקודמת</p>
          <ul className="list-inside list-disc">{changed.map(c => <li key={c}>{c}</li>)}</ul>
          <button type="button" className="min-h-11 font-bold text-moss" onClick={remember}>הבנתי</button>
        </div>)}
      {wx.avail === 'too_far' && <p className="text-sm font-bold">עדיין אין תחזית אמינה לתאריכי הטיול — ההצעה לא מתחשבת במזג האוויר.</p>}
      {!al.alertsChecked && <p className="text-xs text-warn">לא הצלחנו לבדוק אזהרות רשמיות עכשיו — לבדוק באתר השירות המטאורולוגי.</p>}
      <ol className="space-y-3">{plan.map(d => (
        <li key={d.day} className="rounded-xl border border-line p-3" aria-label={`יום ${d.day + 1}`}>
          <p className="mb-1.5 flex flex-wrap items-center gap-2 font-bold">יום {d.day + 1} · {shortDay(d.date)} {fmtDate(d.date)}{d.wx && <span className="num text-xs font-normal text-muted">{Math.round(d.wx.tMax)}°/{Math.round(d.wx.tMin)}°{d.wx.precip >= 1 ? ` · ${Math.round(d.wx.precip)} מ״מ` : ''}</span>}{d.hot && <span className="flex items-center gap-1 rounded-full bg-warn/15 px-2 text-xs text-warn"><Sun size={12} />יום חם — יוצאים מוקדם</span>}</p>
          {d.picks.length ? <ul className="space-y-1.5">{d.picks.map(k => <PickRow key={k.p.id} k={k} />)}</ul> : <p className="text-sm text-muted">לא מצאנו מקום מתאים בטווח. אפשר להרחיב את מרחק הנסיעה בעריכת הטיול.</p>}
          {d.alts.length > 0 && <p className="mt-1.5 text-xs text-muted">חלופות אם התנאים משתנים: {d.alts.map((a, i) => <span key={a.p.id}>{i ? ', ' : ''}<a className="font-bold text-moss" href={href(`/place/${encodeURIComponent(a.p.id)}`)}>{a.p.he}</a> ({a.fit.score})</span>)}</p>}
          {d.excluded.length > 0 && <details className="mt-1 text-xs"><summary className="min-h-9 cursor-pointer py-1 font-bold text-danger"><AlertTriangle size={12} className="inline" /> {d.excluded.length} מקומות לא מומלצים ביום הזה</summary>
            <ul className="space-y-1">{d.excluded.map(e => <li key={e.p.id}><span className="font-bold">{e.p.he}</span> — {e.reason}</li>)}</ul></details>}
        </li>))}</ol>
      {all.length > 0 && <Button icon={<Plus size={17} />} onClick={() => setReview(true)}>להוסיף ללו״ז ({all.length})</Button>}
      {review && <Approve t={t} items={all} onClose={() => setReview(false)} />}
    </section>
  );
}

function PickRow({ k }: { k: Pick }) {
  return (
    <li className="flex items-start gap-2">
      <span className="num w-12 shrink-0 pt-0.5 text-sm font-bold">{k.time}</span>
      <a href={href(`/place/${encodeURIComponent(k.p.id)}`)} className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="font-bold">{k.p.he}</span><span className="num shrink-0 rounded-full bg-raised px-2 text-xs font-bold" title="ציון התאמה — לא ציון בטיחות">{k.fit.score}/100</span></span>
        <span className="block text-xs text-muted">{SLOT_HE[k.slot]} · {CAT_HE[k.p.c[0]]} · <span className="num">{k.km < 10 ? k.km.toFixed(1) : Math.round(k.km)}</span> ק״מ בקו אווירי</span>
        <span className="block text-xs">{k.fit.summary}</span>
        {k.fit.conditions[0] && <span className="block text-xs text-warn">{k.fit.conditions[0].text}</span>}</a>
    </li>
  );
}

function Approve({ t, items, onClose }: { t: Trip; items: { d: { day: number; date: string }; k: Pick }[]; onClose: () => void }) {
  const up = useStore(s => s.updateTrip);
  const [sel, setSel] = useState(items.map(i => i.k.p.id));
  const apply = () => {
    const chosen = items.filter(i => sel.includes(i.k.p.id));
    up(t.id, x => {
      const sched: ScheduleItem[] = chosen.map(({ d, k }) => ({ id: uid('s'), day: d.day, time: k.time, title: k.p.he, kind: 'activity', note: `הצעת CampIL · ${CAT_HE[k.p.c[0]]} · ${Math.round(k.km)} ק״מ בקו אווירי · לבדוק שעות ומצב לפני היציאה` }));
      const places: TripPlace[] = chosen.filter(({ k }) => !(x.places ?? []).some(p => p.id === k.p.id)).map(({ k }) => ({ id: k.p.id, name: k.p.he, lat: k.p.lat, lon: k.p.lon, label: CAT_HE[k.p.c[0]], source: k.p.src.includes('wd') ? 'wd' : 'osm', url: k.p.qid ? wikidataUrl(k.p.qid) : osmUrl(k.p.osm!), website: k.p.web, addedAt: new Date().toISOString() }));
      return { schedule: [...x.schedule, ...sched], places: [...(x.places ?? []), ...places] };
    });
    toast(`נוספו ${chosen.length} פריטים ללו״ז`); onClose();
  };
  return (
    <Sheet open onClose={onClose} title="להוסיף ללו״ז?" footer={<><Button onClick={apply} disabled={!sel.length}>אישור ({sel.length})</Button><Button variant="ghost" onClick={onClose}>ביטול</Button></>}>
      <p className="mb-2 text-sm text-muted">סמנו מה להוסיף. שום דבר לא נשמר עד שתאשרו; אפשר למחוק כל פריט מהלו״ז אחר כך.</p>
      <ul className="space-y-1">{items.map(({ d, k }) => (
        <li key={k.p.id}><label className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-raised">
          <input type="checkbox" className="h-5 w-5" checked={sel.includes(k.p.id)} onChange={e => setSel(s => (e.target.checked ? [...s, k.p.id] : s.filter(x => x !== k.p.id)))} />
          <span>יום {d.day + 1} · {k.time} · <span className="font-bold">{k.p.he}</span></span></label></li>))}</ul>
    </Sheet>
  );
}
