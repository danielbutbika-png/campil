import { Plus, CalendarDays, MapPin, Star, Compass, Copy } from 'lucide-react';
import { useStore } from '../lib/store';
import { readiness } from '../engine/packing';
import { REGION_BY_ID } from '../data/regions';
import { fmtRange, todayISO, tripLength } from '../lib/util';
import { Scene } from '../components/Scene';
import { Button, Badge, Empty, Ring, toast } from '../components/ui';
import { href, go } from '../lib/router';
import type { Trip } from '../lib/types';
import { myPacking } from '../lib/families';
import { duplicateTrip } from '../lib/tripOps';

export default function Trips() {
  const { trips, addTrip } = useStore();
  const today = todayISO();
  const upcoming = trips.filter(t => t.status === 'planning' && t.end >= today).sort((a, b) => a.start.localeCompare(b.start));
  const past = trips.filter(t => t.status === 'done' || t.end < today).sort((a, b) => b.start.localeCompare(a.start));
  const duplicate = (t: Trip) => { const n = duplicateTrip(t, today); addTrip(n); toast('נוצר עותק — עדכנו תאריכים'); go(`/trip/${n.id}`); };
  return (
    <div className="gutter mx-auto max-w-6xl space-y-8 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-3xl">הטיולים שלי</h1><Button variant="accent" icon={<Plus size={18} />} onClick={() => go('/new')}>טיול חדש</Button></header>
      <section className="space-y-3"><h2 className="font-display text-xl">בתכנון</h2>
        {upcoming.length ? <div className="grid gap-4 md:grid-cols-2">{upcoming.map(t => <TripCard key={t.id} t={t} />)}</div>
          : <Empty icon={<Compass size={36} />} title="אין טיולים בתכנון" action={<Button onClick={() => go('/new')}>מתכננים טיול</Button>} />}
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">היסטוריה</h2>
        {past.length ? <div className="grid gap-4 md:grid-cols-2">{past.map(t => <TripCard key={t.id} t={t} onDuplicate={() => duplicate(t)} />)}</div>
          : <p className="text-muted">טיולים שהסתיימו יופיעו כאן. הדירוג שלכם ישפר את ההמלצות הבאות.</p>}
      </section>
    </div>
  );
}

function TripCard({ t, onDuplicate }: { t: Trip; onDuplicate?: () => void }) {
  const r = readiness(myPacking(t)); const reg = t.regionId ? REGION_BY_ID[t.regionId] : null; const { nights } = tripLength(t.start, t.end);
  return (
    <article className="flex overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
      <a href={href(`/trip/${t.id}`)} className="relative w-28 shrink-0 sm:w-36" aria-hidden tabIndex={-1}><Scene kind={reg?.scene ?? 'forest'} seed={t.name.length + 4} className="absolute inset-0 h-full w-full" /></a>
      <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <a href={href(`/trip/${t.id}`)} className="block font-bold hover:text-moss">{t.name}</a>
          <p className="flex flex-wrap gap-x-3 text-sm text-muted"><span className="flex items-center gap-1"><CalendarDays size={14} />{fmtRange(t.start, t.end)}</span><span>{nights ? `${nights} לילות` : 'יום'}</span></p>
          {reg && <p className="flex items-center gap-1 text-sm text-muted"><MapPin size={14} />{reg.name}</p>}
          <div className="flex flex-wrap gap-1.5">{t.example && <Badge>לדוגמה</Badge>}{t.rating ? <Badge tone="accent"><Star size={11} className="fill-current" />{t.rating}/5</Badge> : null}</div>
          {onDuplicate && <button onClick={onDuplicate} className="flex items-center gap-1 text-sm font-bold text-moss"><Copy size={14} />לתכנן שוב</button>}
        </div>
        {t.status === 'planning' && <Ring pct={r.pct} size={56} stroke={6} label={`מוכנות ${r.pct}%`} />}
      </div>
    </article>
  );
}
