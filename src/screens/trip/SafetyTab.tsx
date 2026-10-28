// Safety center for one trip: what's checked and what isn't, daylight, the trip's type checks, weather plan B,
// sharing the plan with someone who stays home, and official sources. The app never rules a place safe.
import { useMemo } from 'react';
import { ShieldCheck, Sun, Share2, Copy, AlertTriangle, Check, X, HelpCircle, Repeat } from 'lucide-react';
import type { Trip, Site } from '../../lib/types';
import type { TripWx } from '../../lib/hooks';
import { useStore } from '../../lib/store';
import { SITE_BY_ID, SITES } from '../../data/sites';
import { planB } from '../../engine/planB';
import { readiness } from '../../engine/packing';
import { addDays, fmtDate, shortDay, tripLength, todayISO } from '../../lib/util';
import { REGION_BY_ID } from '../../data/regions';
import { OfficialAlerts, TypeChecks } from '../../components/Field';
import { Prov, ProvLegend } from '../../components/Provenance';
import { Button, Card, cx, toast } from '../../components/ui';
import { shareText, whatsappURL } from '../../lib/share';
import { href } from '../../lib/router';

/** Plain-text trip plan for someone who isn't coming — no names of children, no private gear. */
export function planText(t: Trip, sites: Site[]) {
  const { days } = tripLength(t.start, t.end);
  const lines = [`תוכנית טיול: ${t.name}`, `תאריכים: ${fmtDate(t.start)}${t.end !== t.start ? ` – ${fmtDate(t.end)}` : ''}`, `משתתפים: ${t.adults} מבוגרים${t.children ? `, ${t.children} ילדים` : ''}${t.vehicle ? ` · רכב: ${t.vehicle}` : ''}`];
  if (t.regionId) lines.push(`אזור: ${REGION_BY_ID[t.regionId].name}`);
  const all = [...sites.map(s => ({ name: s.name, lat: s.lat, lon: s.lon })), ...(t.places ?? [])];
  if (all.length) { lines.push('', 'מקומות:'); for (const s of all) lines.push(`• ${s.name} — https://maps.google.com/?q=${s.lat},${s.lon}`); }
  if (t.gpx) lines.push('', `מסלול: ${t.gpx.name} (${t.gpx.km} ק״מ)`);
  for (let d = 0; d < days; d++) {
    const items = t.schedule.filter(s => s.day === d).sort((a, b) => a.time.localeCompare(b.time));
    if (items.length) lines.push('', `${shortDay(addDays(t.start, d))} ${fmtDate(addDays(t.start, d))}:`, ...items.map(s => `${s.time} ${s.title}`));
  }
  lines.push('', `חזרה מתוכננת: ${fmtDate(t.end)}${(() => { const l = t.schedule.filter(s => s.day === days - 1).sort((a, b) => b.time.localeCompare(a.time))[0]; return l ? ` (${l.time})` : ''; })()}`, 'אם אין קשר הרבה אחרי זמן החזרה — לנסות שוב, ואם צריך: משטרה 100, מד״א 101.');
  return lines.join('\n');
}

type Row = { id: string; label: string; status: 'ok' | 'no' | 'unknown'; kind: 'auto' | 'manual'; hint?: string; to?: string };

export default function SafetyTab({ t, wx }: { t: Trip; wx: TripWx }) {
  const updateTrip = useStore(s => s.updateTrip);
  const sites = useMemo(() => t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean), [t.siteIds]);
  const today = todayISO();
  const fcFresh = wx.source === 'forecast' && wx.forecast && !wx.forecast.stale;
  const fa = t.packing.filter(p => !p.removed && /עזרה ראשונה/.test(p.name));
  const faStatus: Row['status'] = !fa.length ? 'no' : fa.every(p => p.packed) ? 'ok' : 'unknown';
  const r = readiness(t.packing);
  const m = (id: string) => (t.safety?.[id] ? 'ok' : 'no') as Row['status'];
  const toggle = (id: string) => updateTrip(t.id, x => ({ safety: { ...(x.safety ?? {}), [id]: !x.safety?.[id] } }));
  const rows: Row[] = [
    { id: 'fc', label: 'תחזית עדכנית לימי הטיול', status: fcFresh ? 'ok' : wx.source === 'forecast' ? 'unknown' : 'no', kind: 'auto', hint: fcFresh ? 'Open-Meteo' : 'התחזית נפתחת כ-16 יום לפני; ריענון בסקירה' },
    { id: 'offline', label: 'הטיול הוכן לשימוש בלי קליטה במכשיר הזה', status: t.offline ? 'ok' : 'no', kind: 'auto', to: `/trip/${t.id}` },
    { id: 'fa', label: 'ערכת עזרה ראשונה ארוזה', status: faStatus, kind: 'auto', hint: fa.length ? undefined : 'אין ברשימת הציוד — כדאי להוסיף', to: `/trip/${t.id}/gear` },
    { id: 'pack', label: `ציוד ארוז (${r.pct}%)`, status: r.pct >= 90 ? 'ok' : 'unknown', kind: 'auto', to: `/trip/${t.id}/gear` },
    { id: 'operator', label: 'בדקנו אצל המפעיל שהאתרים פתוחים ואת תנאי הכניסה', status: m('operator'), kind: 'manual' },
    { id: 'alerts', label: 'בדקנו היום התרעות רשמיות לאזור', status: m('alerts'), kind: 'manual' },
    { id: 'contact', label: 'מישהו שלא מצטרף יודע את התוכנית ומתי חוזרים', status: m('contact'), kind: 'manual' },
  ];
  const daylight = wx.source === 'forecast' ? wx.days.filter(d => d.sunrise || d.sunset) : [];
  const b = useMemo(() => planB(sites, SITES, wx.flags, wx.source === 'forecast'), [sites, wx.flags, wx.source]);
  const swap = (from: string, to: string) => { updateTrip(t.id, x => ({ siteIds: x.siteIds.map(id => (id === from ? to : id)) })); toast('האתר הוחלף בתוכנית'); };
  const text = planText(t, sites);
  const shared = () => { if (!t.safety?.contact) toggle('contact'); };

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-xl2 border border-line bg-surface p-3 text-sm"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-moss" />האפליקציה לא קובעת אם מסלול בטוח או פתוח, ואין לה יכולת איתור או הזעקת עזרה כשאין קליטה. כאן מרוכז מה נבדק ומה עוד לא.</p>

      <section aria-labelledby="chk-h" className="space-y-2">
        <h2 id="chk-h" className="font-display text-xl">לפני היציאה</h2>
        <ul className="divide-y divide-line rounded-xl2 border border-line bg-surface">{rows.map(row => (
          <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            {row.kind === 'manual'
              ? <input type="checkbox" aria-label={row.label} className="h-5 w-5 accent-[rgb(var(--forest))]" checked={row.status === 'ok'} onChange={() => toggle(row.id)} />
              : <span className={cx('grid h-6 w-6 place-items-center rounded-full', row.status === 'ok' ? 'bg-ok/15 text-ok' : row.status === 'no' ? 'bg-danger/12 text-danger' : 'bg-raised text-muted')} aria-label={row.status === 'ok' ? 'בוצע' : row.status === 'no' ? 'לא בוצע' : 'חלקי'}>{row.status === 'ok' ? <Check size={14} /> : row.status === 'no' ? <X size={14} /> : <HelpCircle size={14} />}</span>}
            <span className="min-w-0 flex-1"><span className="block">{row.label}</span><span className="block text-xs text-muted">{[row.kind === 'auto' ? 'נבדק אוטומטית מנתוני הטיול' : 'סימון שלכם', row.hint].filter(Boolean).join(' · ')}</span></span>
            {row.to && row.status !== 'ok' && <a href={href(row.to)} className="text-sm font-bold text-moss">לטיפול</a>}
          </li>))}</ul>
      </section>

      <TypeChecks t={t} />

      <section aria-labelledby="day-h" className="space-y-2">
        <h2 id="day-h" className="flex items-center gap-2 font-display text-xl"><Sun size={20} className="text-sunset" />שעות אור</h2>
        {daylight.length ? <ul className="grid gap-2 sm:grid-cols-3">{daylight.map(d => <li key={d.date} className="rounded-xl border border-line bg-surface p-3 text-sm"><span className="font-bold">{shortDay(d.date)} {fmtDate(d.date)}</span><span className="num block">זריחה {d.sunrise?.slice(0, 5) ?? '—'} · שקיעה {d.sunset?.slice(0, 5) ?? '—'}</span></li>)}</ul>
          : <p className="text-sm text-muted">יופיעו כשתיפתח התחזית לתאריכים (כ-16 יום לפני).</p>}
        {daylight.length > 0 && <Prov kind="auto" source="Open-Meteo" />}
        <p className="text-xs text-muted">תכננו לסיים מסלולים לפני השקיעה — בעמקים ובנחלים מחשיך מוקדם יותר.</p>
      </section>

      {b.length > 0 && (
        <section aria-labelledby="pb-h" className="space-y-2">
          <h2 id="pb-h" className="flex items-center gap-2 font-display text-xl"><Repeat size={20} className="text-info" />תוכנית חלופית לפי התחזית</h2>
          {b.map(x => (
            <Card key={x.site.id + x.reason} className="space-y-2 p-4">
              <p className="flex items-center gap-2 font-bold"><AlertTriangle size={16} className="text-warn" />{x.site.name}: {x.why}</p>
              {x.alternatives.length ? <ul className="space-y-1.5">{x.alternatives.map(a => <li key={a.site.id} className="flex flex-wrap items-center gap-2 text-sm"><span className="flex-1">{a.site.name} <span className="num text-muted">· {a.km} ק״מ בקו אווירי</span></span><Button size="sm" variant="soft" onClick={() => swap(x.site.id, a.site.id)}>להחליף</Button></li>)}</ul>
                : <p className="text-sm text-muted">אין באזור אתר חלופי בקטלוג שמתאים לתנאים.</p>}
              <Prov kind="auto" source="תחזית Open-Meteo וסימוני הקטלוג" />
            </Card>))}
          <p className="text-xs text-muted">החלופות לא אומתו מול המפעיל — לבדוק פתיחה ותנאים לפני שמחליפים.</p>
        </section>)}

      <section aria-labelledby="sh-h" className="space-y-2">
        <h2 id="sh-h" className="font-display text-xl">לשתף את התוכנית עם מי שנשאר בבית</h2>
        <p className="text-sm text-muted">נשלח רק מה שכאן: תאריכים, מקומות, לו״ז ומתי חוזרים — בלי שמות ילדים ובלי רשימות ציוד. אתם בוחרים למי לשלוח.</p>
        <div className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-raised/60 p-3 text-right text-sm" dir="rtl" aria-label="התוכנית שתישלח">{text}</div>
        <div className="flex flex-wrap gap-2">
          <a className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white" href={whatsappURL(text)} target="_blank" rel="noreferrer" onClick={shared}><Share2 size={15} />וואטסאפ</a>
          <Button size="sm" variant="soft" icon={<Share2 size={15} />} onClick={() => { shareText(t.name, text); shared(); }}>שיתוף אחר</Button>
          <Button size="sm" variant="soft" icon={<Copy size={15} />} onClick={async () => { try { await navigator.clipboard.writeText(text); toast('הועתק'); shared(); } catch { toast('לא ניתן להעתיק — סמנו ידנית'); } }}>העתקה</Button>
        </div>
      </section>

      {t.end >= today && <OfficialAlerts flood={sites.some(x => x.floodRisk)} />}
      <ProvLegend />
    </div>
  );
}
