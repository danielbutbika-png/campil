import { useState } from 'react';
import { Car, Tent, Utensils, Footprints, Coffee, Package, Plus, RefreshCw, Trash2, Sunrise, Sunset } from 'lucide-react';
import type { Trip, ScheduleItem, TaskItem } from '../../lib/types';
import type { TripWx } from '../../lib/hooks';
import { useStore } from '../../lib/store';
import { buildSchedule, buildTasks } from '../../engine/planner';
import { SITE_BY_ID } from '../../data/sites';
import { addDays, fmtDate, shortDay, tripLength, uid } from '../../lib/util';
import { Button, Sheet, Badge, cx, toast } from '../../components/ui';
import { stamp, ago } from '../../components/Collab';

const KIND_I = { drive: Car, camp: Tent, meal: Utensils, activity: Footprints, rest: Coffee, pack: Package };
const KIND_HE = { drive: 'נסיעה', camp: 'מחנה', meal: 'ארוחה', activity: 'פעילות', rest: 'מנוחה', pack: 'אריזה' };

export function ScheduleTab({ t, wx }: { t: Trip; wx: TripWx }) {
  const up = useStore(s => s.updateTrip);
  const { days } = tripLength(t.start, t.end);
  const [edit, setEdit] = useState<ScheduleItem | null>(null);
  const save = (it: ScheduleItem) => { up(t.id, x => ({ schedule: x.schedule.some(s => s.id === it.id) ? x.schedule.map(s => (s.id === it.id ? it : s)) : [...x.schedule, it] })); setEdit(null); };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setEdit({ id: uid('s'), day: 0, time: '10:00', title: '', kind: 'activity' })}>פריט ללו״ז</Button>
        <Button size="sm" variant="ghost" icon={<RefreshCw size={15} />} onClick={() => { up(t.id, { schedule: buildSchedule(t, wx.days, t.siteIds.map(i => SITE_BY_ID[i]).filter(Boolean)) }); toast('לוח הזמנים נבנה מחדש לפי התחזית והאתרים'); }}>בנייה מחדש</Button>
      </div>
      <p className="text-sm text-muted">שעות מוצעות. בימים חמים הפעילות מוקדמת לבוקר ונוספת מנוחת צהריים.</p>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: days }, (_, d) => {
          const date = addDays(t.start, d); const w = wx.days.find(x => x.date === date);
          const items = t.schedule.filter(s => s.day === d).sort((a, b) => a.time.localeCompare(b.time));
          return (
            <section key={d} className="rounded-xl2 border border-line bg-surface p-4">
              <header className="mb-3 flex flex-wrap items-center gap-2"><h3 className="font-display text-lg">יום {d + 1} · {shortDay(date)} {fmtDate(date)}</h3>
                {w && <span className="num ms-auto flex items-center gap-2 text-xs text-muted"><span>{Math.round(w.tMax)}°/{Math.round(w.tMin)}°</span>{w.sunrise && <span className="flex items-center gap-0.5"><Sunrise size={13} />{w.sunrise}</span>}{w.sunset && <span className="flex items-center gap-0.5"><Sunset size={13} />{w.sunset}</span>}</span>}
              </header>
              <ol className="relative space-y-1 border-r-2 border-line pr-4">
                {items.map(s => { const I = KIND_I[s.kind]; return (
                  <li key={s.id} className="relative">
                    <span className="absolute -right-[1.45rem] top-3 grid h-5 w-5 place-items-center rounded-full bg-surface ring-2 ring-line"><span className={cx('h-2 w-2 rounded-full', s.kind === 'activity' ? 'bg-sunset' : 'bg-moss')} /></span>
                    <button onClick={() => setEdit(s)} className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-right hover:bg-raised">
                      <span className="num w-12 shrink-0 pt-0.5 font-bold">{s.time}</span><I size={18} className="mt-0.5 shrink-0 text-moss" />
                      <span className="flex-1"><span className="block font-semibold">{s.title}</span>{s.note && <span className="block text-xs text-muted">{s.note}</span>}</span>
                    </button>
                  </li>); })}
                {!items.length && <li className="py-2 text-sm text-muted">אין פריטים ליום זה</li>}
              </ol>
            </section>
          );
        })}
      </div>
      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={edit.title ? 'עריכת פריט' : 'פריט חדש'} footer={<><Button onClick={() => edit.title.trim() ? save(edit) : toast('כתבו כותרת')}>שמירה</Button>{t.schedule.some(s => s.id === edit.id) && <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => { up(t.id, x => ({ schedule: x.schedule.filter(s => s.id !== edit.id) })); setEdit(null); }}>מחיקה</Button>}</>}>
          <div className="space-y-3">
            <div><label className="label" htmlFor="st">כותרת</label><input id="st" className="field" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label" htmlFor="sd">יום</label><select id="sd" className="field" value={edit.day} onChange={e => setEdit({ ...edit, day: +e.target.value })}>{Array.from({ length: days }, (_, i) => <option key={i} value={i}>יום {i + 1}</option>)}</select></div>
              <div><label className="label" htmlFor="sh">שעה</label><input id="sh" type="time" className="field" value={edit.time} onChange={e => setEdit({ ...edit, time: e.target.value })} /></div>
              <div><label className="label" htmlFor="sk">סוג</label><select id="sk" className="field" value={edit.kind} onChange={e => setEdit({ ...edit, kind: e.target.value as any })}>{Object.entries(KIND_HE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="sn">הערה</label><input id="sn" className="field" value={edit.note ?? ''} onChange={e => setEdit({ ...edit, note: e.target.value })} /></div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

const WHEN_ORDER = ['שבוע לפני', 'יום-יומיים לפני', 'ערב לפני', 'בוקר היציאה', 'רגע לפני', 'בסיום הטיול'];
export function TasksTab({ t }: { t: Trip }) {
  const { seedTasks, updateTrip } = useStore();
  const members = t.participants;
  const [text, setText] = useState(''); const [when, setWhen] = useState('יום-יומיים לפני');
  const set = (id: string, p: Partial<TaskItem>) => updateTrip(t.id, x => ({ tasks: x.tasks.map(k => (k.id === id ? { ...k, ...p } : k)) }));
  const groups = WHEN_ORDER.map(w => ({ w, items: t.tasks.filter(k => k.when === w) })).filter(g => g.items.length);
  const done = t.tasks.filter(k => k.done).length;
  const due = (k: TaskItem) => (k.dueOffsetDays === 999 ? fmtDate(t.end) : fmtDate(addDays(t.start, k.dueOffsetDays)));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><p className="num font-bold">{done}/{t.tasks.length} משימות הושלמו</p>
        <Button size="sm" variant="ghost" icon={<RefreshCw size={15} />} onClick={() => { updateTrip(t.id, { tasks: buildTasks(seedTasks, t, t.siteIds.map(i => SITE_BY_ID[i]).filter(Boolean)) }); toast('רשימת המשימות שוחזרה'); }}>שחזור ברירת מחדל</Button></div>
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); if (!text.trim()) return; updateTrip(t.id, x => ({ tasks: [...x.tasks, { id: uid('t'), when, text: text.trim(), done: false, dueOffsetDays: ({ 'שבוע לפני': -7, 'יום-יומיים לפני': -2, 'ערב לפני': -1, 'בסיום הטיול': 999 } as any)[when] ?? 0 }] })); setText(''); }}>
        <input aria-label="משימה חדשה" className="field min-w-[12rem] flex-1" placeholder="משימה חדשה" value={text} onChange={e => setText(e.target.value)} />
        <select aria-label="מתי" className="field w-auto" value={when} onChange={e => setWhen(e.target.value)}>{WHEN_ORDER.map(w => <option key={w}>{w}</option>)}</select>
        <Button type="submit" icon={<Plus size={16} />}>הוספה</Button>
      </form>
      {groups.map(g => (
        <section key={g.w} className="rounded-xl2 border border-line bg-surface">
          <h3 className="flex items-center gap-2 border-b border-line px-4 py-3 font-bold">{g.w}<Badge className="ms-auto">{due(g.items[0])}</Badge></h3>
          <ul className="divide-y divide-line">{g.items.map(k => (
            <li key={k.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <input type="checkbox" aria-label={k.text} className="h-5 w-5 accent-[rgb(var(--forest))]" checked={k.done} onChange={() => { const s = stamp(); set(k.id, { done: !k.done, doneBy: s.by, doneAt: s.at }); }} />
              <span className="min-w-0 flex-1"><span className={cx(k.done && 'text-muted line-through')}>{k.text}</span>{k.done && k.doneBy && t.shared && <span className="block text-xs font-bold text-ok">✓ {k.doneBy} · {ago(k.doneAt)}</span>}</span>
              <select aria-label="אחראי" className="rounded-lg border border-line bg-surface px-2 py-1 text-sm" value={k.assignee ?? ''} onChange={e => set(k.id, { assignee: e.target.value || undefined })}><option value="">אחראי</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
              <button aria-label="מחיקת משימה" className="text-muted hover:text-danger" onClick={() => updateTrip(t.id, x => ({ tasks: x.tasks.filter(y => y.id !== k.id) }))}><Trash2 size={16} /></button>
            </li>))}</ul>
        </section>
      ))}
    </div>
  );
}
