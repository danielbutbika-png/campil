import { useMemo, useState } from 'react';
import { RefreshCw, ChevronLeft, AlertCircle, ListChecks, Tent, Flag, ExternalLink } from 'lucide-react';
import type { Trip, Site } from '../../lib/types';
import type { TripWx } from '../../lib/hooks';
import { useStore, tasteOf } from '../../lib/store';
import { recommend } from '../../engine/weatherRules';
import { readiness } from '../../engine/packing';
import { rank } from '../../engine/scoring';
import { SITES } from '../../data/sites';
import { CAT_BY_ID } from '../../data/catalog';
import { haversineKm, addDays, fmtDate, todayISO, shortDay } from '../../lib/util';
import { fetchOsm, OSM_KIND_HE, type OsmPlace } from '../../services/osm';
import { RecCards, DayStrip, DayDetail, HourlyChart, NoForecast, SourceLine } from '../../components/Weather';
import { SiteCard, useSiteSheet } from '../../components/SiteCard';
import { Button, Card, Ring, Section, Badge, Blaze, cx } from '../../components/ui';
import { RouteFuel, NavButtons } from '../../components/RouteFuel';
import { stamp, ActivityFeed, Avatars } from '../../components/Collab';
import { OfficialAlerts } from '../../components/Field';
import { DutyBoard, useShopLines } from '../../components/Duties';
import { AssistantCard } from '../../components/Assistant';
import { href } from '../../lib/router';
import { myPacking } from '../../lib/families';
import { FieldCard } from '../../components/Field';
import { Prov } from '../../components/Provenance';

export default function Overview({ t, wx, sites, onFinish }: { t: Trip; wx: TripWx; sites: Site[]; onFinish: () => void }) {
  const st = useStore();
  const sheet = useSiteSheet();
  const [day, setDay] = useState<string | null>(null);
  const recs = useMemo(() => recommend(wx.days, t, sites), [wx.days, t.kind, t.lodging, t.children, sites]);
  const r = readiness(myPacking(t));
  const taste = tasteOf(st);
  const chosen = useMemo(() => rank(sites, t, wx.flags, st.settings, taste), [sites, wx.flags]);
  const nearby = useMemo(() => wx.point ? rank(SITES.filter(s => !t.siteIds.includes(s.id) && haversineKm(wx.point!, s) < 30), t, wx.flags, st.settings, taste).slice(0, 3) : [], [wx.point, t.siteIds, wx.flags]);
  const openTasks = t.tasks.filter(x => !x.done).slice(0, 4);
  const shopLines = useShopLines(t);
  const sel = wx.days.find(d => d.date === day) ?? wx.days[0];
  const [osm, setOsm] = useState<{ loading?: boolean; err?: string; data?: OsmPlace[] }>({});
  const loadOsm = async () => {
    if (!wx.point) return; const d = 0.25;
    setOsm({ loading: true });
    try { const data = await fetchOsm([wx.point.lon - d, wx.point.lat - d, wx.point.lon + d, wx.point.lat + d]); setOsm({ data: data.sort((a, b) => haversineKm(wx.point!, a) - haversineKm(wx.point!, b)).slice(0, 12) }); }
    catch (e: any) { setOsm({ err: e.message }); }
  };
  const ended = t.end < todayISO();

  return (
    <div className="space-y-10">
      {ended && t.status !== 'done' && (
        <Card className="flex flex-wrap items-center gap-3 border-sunset/40 p-4"><Flag className="text-sunset" /><p className="flex-1 font-semibold">הטיול הסתיים. סכמו אותו כדי שההמלצות הבאות ילמדו ממנו.</p><Button size="sm" onClick={onFinish}>סיכום הטיול</Button></Card>
      )}
      {!ended && <FieldCard t={t} point={wx.point ?? null} />}
      {!ended && <OfficialAlerts flood={sites.some(x => x.floodRisk)} />}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Section title="מזג האוויר ביעד" action={<Button size="sm" variant="soft" icon={<RefreshCw size={15} />} onClick={wx.refetch}>רענון</Button>}>
          {wx.point && <p className="-mt-1 text-sm text-muted">לפי הנקודה: {wx.point.label}</p>}
          {wx.status === 'none' && <p className="text-muted">בחרו אזור או אתר כדי לקבל תחזית.</p>}
          {wx.status === 'loading' && <div className="h-36 animate-pulse rounded-xl2 bg-raised" />}
          {wx.status === 'error' && <div className="flex items-center gap-2 rounded-xl2 border border-danger/40 bg-danger/5 p-4 text-sm"><AlertCircle className="text-danger" size={18} /><span className="flex-1">{wx.error ?? 'לא הצלחנו לטעון את התחזית.'} בדקו חיבור ונסו לרענן.</span></div>}
          {wx.avail === 'too_far' && wx.status !== 'none' && <NoForecast start={t.start} onRefresh={wx.refetch} climate={wx.climate} loading={wx.status === 'loading'} />}
          {wx.avail === 'past' && <p className="text-muted">תאריכי הטיול כבר עברו.</p>}
          {wx.days.length > 0 && (
            <div className="space-y-3">
              {wx.avail === 'partial' && <Badge tone="warn">התחזית מכסה רק חלק מהימים — היתר יתווספו כשיתקרב המועד</Badge>}
              <div className="scroll-x flex gap-2" role="tablist" aria-label="ימי הטיול">
                {wx.days.map(d => <button key={d.date} role="tab" aria-selected={sel?.date === d.date} onClick={() => setDay(d.date)} className={cx('rounded-full px-4 py-1.5 text-sm font-bold', sel?.date === d.date ? 'bg-forest text-onforest' : 'bg-raised')}>{shortDay(d.date)} {fmtDate(d.date)}</button>)}
              </div>
              <DayStrip days={wx.days} />
              {sel && <Card className="space-y-4 p-4"><DayDetail d={sel} />{wx.forecast && <HourlyChart hours={wx.forecast.hours} date={sel.date} />}</Card>}
              <SourceLine f={wx.forecast} />
            </div>
          )}
        </Section>
        <Card className="space-y-4 self-start p-5">
          <div className="flex items-center gap-4"><Ring pct={r.pct} size={86} label={`מדד מוכנות ${r.pct}%`} /><div><p className="font-display text-lg">מדד מוכנות</p><p className="num text-sm text-muted">{r.done} מתוך {r.total} פריטי אריזה</p>{r.missing > 0 && <p className="text-sm font-bold text-danger">{r.missing} פריטים חסרים</p>}</div></div>
          <ul className="space-y-1.5">{[...r.byCat].sort((a, b) => b[1].total - a[1].total).slice(0, 7).map(([c, v]) => (
            <li key={c} className="flex items-center gap-2 text-sm"><Blaze color={CAT_BY_ID[c]?.blaze ?? '#777'} /><span className="flex-1">{CAT_BY_ID[c]?.name}</span><span className="num text-muted">{v.done}/{v.total}</span><span className="h-1.5 w-16 overflow-hidden rounded-full bg-line"><span className="block h-full bg-moss" style={{ width: `${(v.done / v.total) * 100}%` }} /></span></li>))}
          </ul>
          <p className="text-xs text-muted">המדד מחושב מפריטים שסומנו כארוזים. הוא אינו אישור בטיחות לטיול.</p>
          <a href={href(`/trip/${t.id}/gear`)} className="flex items-center justify-center gap-1 rounded-full bg-raised py-2.5 font-bold hover:bg-sand">לרשימת הציוד<ChevronLeft size={16} /></a>
        </Card>
      </div>

      {!ended && <AssistantCard t={t} />}
      <DutyBoard t={t} lines={shopLines} compact />
      {t.shared && <Section title="מה קורה בטיול" action={<Avatars t={t} />}><Card className="p-4"><ActivityFeed t={t} /></Card></Section>}

      {(recs.length > 0) && <Section title="המלצות הכנה לפי התחזית"><RecCards recs={recs} /></Section>}

      <Section title="משימות פתוחות" action={<a className="flex items-center text-sm font-bold text-moss" href={href(`/trip/${t.id}/tasks`)}>לכל המשימות<ChevronLeft size={16} /></a>}>
        {openTasks.length ? <ul className="grid gap-2 md:grid-cols-2">{openTasks.map(k => (
          <li key={k.id}><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3"><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--forest))]" checked={k.done} onChange={() => { const s = stamp(); st.updateTrip(t.id, x => ({ tasks: x.tasks.map(y => (y.id === k.id ? { ...y, done: !y.done, doneBy: s.by, doneAt: s.at } : y)) })); }} /><span className="flex-1">{k.text}</span><Badge>{k.dueOffsetDays === 999 ? 'בסיום' : fmtDate(addDays(t.start, k.dueOffsetDays))}</Badge></label></li>))}</ul>
          : <p className="flex items-center gap-2 text-muted"><ListChecks size={18} />כל המשימות הושלמו.</p>}
      </Section>

      <Section title="האתרים בתוכנית">
        {chosen.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{chosen.map(s => <SiteCard key={s.site.id} site={s.site} scored={s} onOpen={() => sheet.open(s.site)} />)}</div>
          : <p className="text-muted">עוד לא נבחרו אתרים. אפשר להוסיף דרך עריכת הטיול או מהמפה.</p>}
      </Section>

      <Section title="מקום הלינה">
        <div className="flex flex-wrap items-center gap-3 rounded-xl2 border border-line bg-surface p-4">
          <Tent className="text-moss" />
          <div className="min-w-0 flex-1"><p className="font-bold">{t.campsiteName ?? 'עוד לא נבחר מקום לינה'}</p>{t.dest && <p className="num text-xs text-muted">{t.dest.lat.toFixed(4)}, {t.dest.lon.toFixed(4)} · התחזית והמסלול מחושבים לפי המקום הזה</p>}</div>
          {t.dest && <NavButtons lat={t.dest.lat} lon={t.dest.lon} small />}
          <a className="inline-flex h-9 items-center gap-1 rounded-full bg-forest px-4 text-sm font-bold text-onforest" href={href(wx.point ? `/camps?near=${wx.point.lat},${wx.point.lon},${encodeURIComponent(wx.point.label)}` : '/camps')}>{t.campsiteName ? 'החלפה' : 'חיפוש מקום לינה'}</a>
        </div>
      </Section>

      {wx.point && <Section title="הדרך ליעד ותדלוק"><RouteFuel dest={wx.point} /></Section>}

      {nearby.length > 0 && <Section title="עוד בסביבה (עד 30 ק״מ)"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{nearby.map(s => <SiteCard key={s.site.id} site={s.site} scored={s} compact onOpen={() => sheet.open(s.site)} onSelect={() => st.updateTrip(t.id, { siteIds: [...t.siteIds, s.site.id] })} />)}</div></Section>}

      {wx.point && (
        <Section title="חניוני לילה ויום בקרבת היעד" action={<Prov kind="community" />}>
          {!osm.data && !osm.loading && <Button variant="soft" icon={<Tent size={17} />} onClick={loadOsm}>חיפוש חניונים ב-OpenStreetMap</Button>}
          {osm.loading && <p className="text-muted">מחפשים…</p>}
          {osm.err && <p className="text-danger">{osm.err}</p>}
          {osm.data && (osm.data.length ? (
            <ul className="grid gap-2 md:grid-cols-2">{osm.data.map(p => (
              <li key={p.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
                <Tent size={18} className="mt-1 shrink-0 text-moss" />
                <div className="min-w-0 flex-1"><p className="font-bold">{p.name}</p><p className="text-xs text-muted">{OSM_KIND_HE[p.kind]} · כ-{haversineKm(wx.point!, p).toFixed(1)} ק״מ</p>
                  <p className="mt-1 flex flex-wrap gap-1 text-xs">{([['שירותים', p.toilets], ['מי שתייה', p.water], ['מקלחות', p.shower], ['בתשלום', p.fee]] as [string, boolean | undefined][]).map(([k, v]) => <Badge key={k} tone={v === true ? 'ok' : 'muted'}>{k}: {v === true ? 'כן' : v === false ? 'לא' : 'לא ידוע'}</Badge>)}</p></div>
                <a href={p.url} target="_blank" rel="noreferrer" aria-label={`${p.name} ב-OpenStreetMap`} className="text-moss"><ExternalLink size={16} /></a>
              </li>))}</ul>) : <p className="text-muted">לא נמצאו חניונים ממופים ברדיוס הזה.</p>)}
          <p className="text-xs text-muted">נתונים: © תורמי OpenStreetMap (ODbL). המתקנים מוצגים רק אם סומנו במפה — לאמת מול המפעיל.</p>
        </Section>
      )}
      {sheet.el}
    </div>
  );
}

