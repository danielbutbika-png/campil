import { useEffect, useState } from 'react';
import { ExternalLink, AlertCircle, WifiOff, Wifi, CloudUpload, Check, Loader2, Map as MapIcon, CloudSun, Smartphone, ShieldAlert, Download, RefreshCw } from 'lucide-react';
import type { Trip, RegionId } from '../lib/types';
import { useOfficialAlerts, alertsState, alertsFor, AREAS_OF, AREA_HE, TYPE_HE, IMS_CREDIT } from '../services/officialAlerts';
import { useStore } from '../lib/store';
import { useOnline } from '../lib/hooks';
import { useCloud } from '../lib/cloud/sync';
import { prepareTrip, MAP_TERMS_URL, type Progress } from '../lib/offline';
import { Button, cx, toast } from './ui';
import { href } from '../lib/router';
import { ago } from './Collab';
import { typeChecks, typeGuides, typesLabel } from '../engine/tripTypes';
import { LESSONS } from '../data/academy';
import { Prov } from './Provenance';

/** Connection and sync state of a shared trip, always visible in the trip header. */
export function SyncBadge({ t }: { t: Trip }) {
  const online = useOnline();
  const pending = useCloud(s => s.pending), last = useCloud(s => s.lastSync), status = useCloud(s => s.status);
  const [, tick] = useState(0); useEffect(() => { const i = setInterval(() => tick(x => x + 1), 30_000); return () => clearInterval(i); }, []);
  if (!t.shared) return null;
  const [Icon, text, tone] = !online
    ? [WifiOff, pending ? `אין קליטה · ${pending} שינויים שמורים במכשיר` : 'אין קליטה · הכול שמור במכשיר', 'bg-warn/90 text-black']
    : pending ? [CloudUpload, `מסנכרן ${pending} שינויים…`, 'bg-info/90 text-white']
    : status === 'error' ? [CloudUpload, 'בעיה בסנכרון — ננסה שוב', 'bg-danger/90 text-white']
    : [Check, last ? `מסונכרן · ${ago(last)}` : 'מסונכרן', 'bg-black/35 text-white'];
  return <span role="status" className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur', tone)}><Icon size={13} aria-hidden />{text}</span>;
}

const STEP_HE: Record<Progress['step'], string> = { app: 'האפליקציה', forecast: 'תחזית', map: 'מפת האזור' };

/** "Prepare the trip for no signal": app, plan & gear (already local), forecast, map of the area. */
export function FieldCard({ t, point }: { t: Trip; point: { lat: number; lon: number } | null }) {
  const online = useOnline();
  const updateTrip = useStore(s => s.updateTrip);
  const [p, setP] = useState<Progress | null>(null);
  const prep = t.offline;
  const run = async () => {
    try {
      const r = await prepareTrip(t, point, setP);
      updateTrip(t.id, { offline: r });
      toast(r.skipped ? `הטיול מוכן — ${r.skipped}` : 'הטיול מוכן לשימוש ללא קליטה');
    } catch (e: any) { toast(e?.message ?? 'ההכנה נכשלה — נסו שוב'); }
    setP(null);
  };
  const rows: [boolean, React.ReactNode, string][] = [
    [true, <Smartphone size={15} />, 'האפליקציה עצמה, כולל המפה — נשמרת בביקור הראשון'],
    [true, <Check size={15} />, 'תוכנית הטיול, הציוד, התפריט, המשימות והיומן — תמיד במכשיר'],
    [!!prep?.forecast, <CloudSun size={15} />, prep?.forecast ? `תחזית שנשמרה ${ago(prep.at)}` : 'תחזית ליעד'],
    [!!prep?.tiles, <MapIcon size={15} />, prep?.tiles ? `מפת האזור: ${prep.tiles} אריחים (${(prep.bytes / 1048576).toFixed(1)}MB), עד ${prep.radiusKm} ק״מ מהיעד` : 'מפת האזור (עד 20 ק״מ מהיעד) + מפה כללית של הארץ'],
  ];
  return (
    <section aria-labelledby="field-h" className="space-y-3 rounded-xl2 border-2 border-moss/40 bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="field-h" className="flex flex-1 items-center gap-2 font-display text-xl">{online ? <Wifi size={20} className="text-moss" /> : <WifiOff size={20} className="text-warn" />}מוכנים לשטח בלי קליטה?</h2>
        {prep && <span className="text-xs font-bold text-ok">הוכן {ago(prep.at)}</span>}
      </div>
      <ul className="space-y-1.5">{rows.map(([ok, icon, text], i) => (
        <li key={i} className={cx('flex items-center gap-2 text-sm', ok ? 'text-ink' : 'text-muted')}><span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', ok ? 'bg-ok/15 text-ok' : 'bg-raised')}>{ok ? <Check size={14} /> : icon}</span>{text}</li>))}
      </ul>
      {p ? (
        <div className="space-y-1" aria-live="polite">
          <p className="flex items-center gap-2 text-sm font-bold"><Loader2 size={15} className="animate-spin" />שומרים: {STEP_HE[p.step]}{p.step === 'map' ? ` ${p.done}/${p.total}` : ''}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-raised"><div className="h-full bg-moss transition-all" style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }} /></div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" icon={prep ? <RefreshCw size={15} /> : <Download size={15} />} disabled={!online} onClick={run}>{prep ? 'רענון לפני היציאה' : 'הכנת הטיול לשימוש ללא קליטה'}</Button>
          <a href={href('/guide/emergency')} className="inline-flex items-center gap-1 text-sm font-bold text-danger"><ShieldAlert size={15} />מספרי חירום</a>
          {!online && <span className="text-xs text-muted">צריך חיבור כדי להכין — עשו את זה בבית.</span>}
        </div>
      )}
      <p className="text-xs text-muted">סימונים ושינויים בלי קליטה נשמרים במכשיר ונשלחים לשותפים כשהקליטה חוזרת. המפה נשמרת לפי <a className="underline" href={MAP_TERMS_URL} target="_blank" rel="noreferrer">תנאי OpenFreeMap</a> (עד 3,000 אריחים או 50MB).</p>
    </section>
  );
}

/** CampIL doesn't receive official alerts automatically: point to the official sources before leaving. */
export function OfficialAlerts({ flood, regions }: { flood: boolean; regions?: RegionId[] }) {
  const links: [string, string, string][] = [
    ['השירות המטאורולוגי', 'https://ims.gov.il', 'התרעות מזג אוויר, שיטפונות ועומסי חום'],
    ['רשות הטבע והגנים', 'https://www.parks.org.il', 'סגירות, הזמנות ושעות פתיחה בשמורות ובגנים'],
    ['קק״ל', 'https://www.kkl.org.il', 'חניוני יער ואתרי קק״ל'],
  ];
  return (
    <section aria-labelledby="alerts-h" className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
      <h2 id="alerts-h" className="flex items-center gap-2 font-bold"><AlertCircle size={18} className="text-warn" />התרעות רשמיות — לבדוק לפני היציאה</h2>
      {regions?.length ? <LiveAlerts regions={regions} /> : null}
      <p className="text-sm text-muted">{regions?.length ? 'אזהרות השירות המטאורולוגי נבדקות כאן אוטומטית. סגירות אתרים — רק באתרי המפעילים.' : 'CampIL לא מקבלת התרעות רשמיות אוטומטית.'} ההמלצות כאן לא מחליפות את הגופים הרשמיים.{flood ? ' יש כאן אתרים בערוצי נחלים — בדקו התרעות שיטפונות גם לאזור שבמעלה הנחל.' : ''}</p>
      <ul className="grid gap-2 sm:grid-cols-3">{links.map(([n, u, d]) => (
        <li key={u}><a href={u} target="_blank" rel="noreferrer" className="flex h-full flex-col rounded-xl border border-line p-3 hover:border-moss"><span className="flex items-center gap-1 font-bold">{n}<ExternalLink size={13} /></span><span className="text-xs text-muted">{d}</span></a></li>))}</ul>
      <p className="text-sm font-semibold">חירום: מד״א 101 · משטרה 100 · כבאות והצלה 102</p>
    </section>
  );
}

/** Warnings in force from the IMS feeds for these regions — or an honest "could not check". */
export function LiveAlerts({ regions }: { regions: RegionId[] }) {
  const q = useOfficialAlerts();
  const st = alertsState(q.data);
  const list = alertsFor(q.data, regions);
  const when = (iso: string) => new Date(iso).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  const areas = [...new Set(regions.flatMap(r => AREAS_OF[r]))].map(a => AREA_HE[a]).join(', ');
  if (q.isLoading) return <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={14} className="animate-spin" />בודקים אזהרות רשמיות…</p>;
  return (
    <div className="space-y-2" aria-live="polite">
      {list.length > 0 && <ul className="space-y-2" aria-label="אזהרות רשמיות בתוקף">{list.map((a, i) => (
        <li key={i} className={cx('rounded-xl border-2 p-3', a.type === 'flood' || /אדומה|כתומה/.test(a.title) ? 'border-danger bg-danger/10' : 'border-warn bg-warn/10')}>
          <p className="font-bold">{a.title}</p>
          {a.text && <p className="mt-1 whitespace-pre-line text-sm">{a.text}</p>}
          <p className="mt-1 text-xs text-muted">{TYPE_HE[a.type]} · אזור: {AREA_HE[a.area]}{a.pubDate ? ` · פורסם ${when(a.pubDate)}` : ''} · <a className="font-bold underline" href={a.link} target="_blank" rel="noreferrer">{IMS_CREDIT}</a></p>
        </li>))}</ul>}
      {st.kind === 'fresh' && !list.length && <p className="rounded-xl bg-raised/60 p-2.5 text-sm">אין כרגע אזהרות בפיד של השירות המטאורולוגי לאזור {areas} (בדיקה אחרונה {when(st.checkedAt)}). <span className="font-bold">זה לא אישור שהמקום בטוח</span> — סגירות ותנאי שטח באתרי המפעילים.</p>}
      {st.kind === 'fresh' && st.partial && <p className="text-xs text-warn">חלק מהפידים לא נטענו בבדיקה האחרונה — לבדוק גם באתר השירות המטאורולוגי.</p>}
      {st.kind === 'stale' && <p className="rounded-xl bg-warn/10 p-2.5 text-sm font-bold">האזהרות לא עודכנו מאז {when(st.checkedAt)} — לא ניתן לדעת אם יש אזהרה בתוקף. לבדוק באתר השירות המטאורולוגי.</p>}
      {st.kind === 'missing' && <p className="rounded-xl bg-warn/10 p-2.5 text-sm font-bold">לא הצלחנו לבדוק אזהרות רשמיות כרגע. לבדוק באתר השירות המטאורולוגי.</p>}
      {list.length > 0 && <p className="text-xs text-muted">{IMS_CREDIT}. המידע מוצג כפי שפורסם; השירות המטאורולוגי לא אחראי לשימוש בו באפליקציה.</p>}
    </div>
  );
}

/** Checks and guides that the trip's types call for — each check points to who to verify with. */
export function TypeChecks({ t }: { t: Trip }) {
  const checks = typeChecks(t);
  const guides = typeGuides(t, LESSONS.map(l => l.id)).map(id => LESSONS.find(l => l.id === id)!);
  if (!checks.length && !guides.length) return null;
  return (
    <section aria-labelledby="tc-h" className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <h2 id="tc-h" className="font-bold">לבדוק לפני היציאה — לפי סוג הטיול</h2>
      <p className="text-xs text-muted">{typesLabel(t)}. האפליקציה לא קובעת אם מסלול פתוח או בטוח — את זה בודקים אצל הגורם הרשמי.</p>
      {checks.length > 0 && <ul className="space-y-2">{checks.map(c => (
        <li key={c.text} className="flex flex-wrap items-start justify-between gap-2 border-b border-line/60 pb-2 text-sm last:border-0">
          <span className="min-w-0 flex-1">{c.text}</span>
          {c.source ? <Prov kind="official" source={c.source.label} url={c.source.url} /> : <Prov kind="unknown" source="לבדוק אצל המפעיל" />}
        </li>))}</ul>}
      {guides.length > 0 && <div className="flex flex-wrap gap-2">{guides.map(g => <a key={g.id} href={href(g.to)} className="rounded-full bg-raised px-3 py-1.5 text-sm font-bold hover:bg-sand">{g.title}</a>)}</div>}
    </section>
  );
}
