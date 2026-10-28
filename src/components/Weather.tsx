import { Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudSnow, CloudLightning, CloudFog, Wind, Droplets, Umbrella, RefreshCw, AlertTriangle, Info, Snowflake, Flame, ShieldAlert, CheckCircle2, Thermometer } from 'lucide-react';
import type { DayWx, Forecast, HourWx, Climate } from '../services/weather';
import { wmoIcon, wmoText, FORECAST_HORIZON } from '../services/weather';
import type { Rec } from '../engine/weatherRules';
import { shortDay, fmtDate, addDays, todayISO } from '../lib/util';
import { cx, Badge, Button } from './ui';

export function WxIcon({ code, size = 22, className }: { code: number; size?: number; className?: string }) {
  const k = wmoIcon(code);
  const I = { sun: Sun, cloud: Cloud, 'cloud-sun': CloudSun, rain: CloudRain, drizzle: CloudDrizzle, snow: CloudSnow, storm: CloudLightning, fog: CloudFog }[k] ?? Cloud;
  return <I size={size} className={cx(k === 'sun' ? 'text-sunset' : k === 'rain' || k === 'storm' ? 'text-info' : 'text-muted', className)} aria-label={wmoText(code)} />;
}

export function DayStrip({ days, compact }: { days: DayWx[]; compact?: boolean }) {
  return (
    <div className="scroll-x -mx-1 flex gap-2 px-1 pb-1">
      {days.map(d => (
        <div key={d.date} className={cx('flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-line bg-surface px-3 py-3 text-center', compact ? 'w-[5.6rem]' : 'w-[6.4rem]')}>
          <span className="text-sm font-bold">{shortDay(d.date)}</span>
          {!compact && <span className="text-xs text-muted">{fmtDate(d.date)}</span>}
          <WxIcon code={d.code} size={26} />
          <span className="num whitespace-nowrap font-bold">{Math.round(d.tMax)}°<span className="font-semibold text-muted"> / {Math.round(d.tMin)}°</span></span>
          {(d.precipProb ?? 0) > 0 && <span className="num flex items-center gap-0.5 text-xs font-semibold text-info"><Umbrella size={12} />{d.precipProb}%</span>}
          {!compact && <span className="num flex items-center gap-0.5 text-xs text-muted"><Wind size={12} />{Math.round(d.gusts)}</span>}
        </div>
      ))}
    </div>
  );
}

export function DayDetail({ d }: { d: DayWx }) {
  const rows: [string, string][] = [
    ['טמפרטורת יום (מקס׳)', `${Math.round(d.tMax)}°`], ['טמפרטורת לילה (מינ׳)', `${Math.round(d.tMin)}°`],
    ...(d.feelsMax != null ? [['מורגש (מקס׳)', `${Math.round(d.feelsMax)}°`] as [string, string]] : []),
    ['סיכוי למשקעים', d.precipProb != null ? `${d.precipProb}%` : '—'], ['כמות משקעים', `${d.precip.toFixed(1)} מ״מ`],
    ['רוח / משבים', `${Math.round(d.wind)} / ${Math.round(d.gusts)} קמ״ש`], ['לחות ממוצעת', d.humidity != null ? `${Math.round(d.humidity)}%` : '—'],
    ['מדד UV', d.uv != null ? String(Math.round(d.uv)) : 'לא זמין'], ['זריחה / שקיעה', d.sunrise ? `${d.sunrise} / ${d.sunset}` : '—'],
  ];
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">{rows.map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="num font-bold">{v}</dd></div>)}</dl>;
}

/** Hourly temperature line + precipitation bars, drawn to scale. */
export function HourlyChart({ hours, date }: { hours: HourWx[]; date: string }) {
  const hs = hours.filter(h => h.time.startsWith(date));
  if (hs.length < 2) return null;
  const W = 640, H = 170, P = { l: 30, r: 10, t: 16, b: 26 };
  const ts = hs.map(h => h.t); const lo = Math.floor(Math.min(...ts) - 1), hi = Math.ceil(Math.max(...ts) + 1);
  const x = (i: number) => P.l + (i / (hs.length - 1)) * (W - P.l - P.r);
  const y = (t: number) => P.t + (1 - (t - lo) / (hi - lo)) * (H - P.t - P.b);
  const line = hs.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(h.t).toFixed(1)}`).join(' ');
  const area = `${line} L${x(hs.length - 1)} ${H - P.b} L${x(0)} ${H - P.b} Z`;
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  return (
    <div className="overflow-x-auto" dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full min-w-[480px]" role="img" aria-label={`תחזית שעתית ל-${fmtDate(date)}`}>
        {ticks.map(t => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--muted))">{t}°</text></g>)}
        {hs.map((h, i) => h.pp > 0 && <rect key={i} x={x(i) - 5} width="10" y={H - P.b - (h.pp / 100) * 50} height={(h.pp / 100) * 50} fill="rgb(var(--info))" opacity=".35" rx="2" />)}
        <path d={area} fill="rgb(var(--sunset))" opacity=".12" />
        <path d={line} fill="none" stroke="rgb(var(--sunset))" strokeWidth="2.5" strokeLinejoin="round" />
        {hs.map((h, i) => i % 3 === 0 && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">{h.time.slice(11, 13)}</text>)}
        {(() => { const m = ts.indexOf(Math.max(...ts)); return <g><circle cx={x(m)} cy={y(ts[m])} r="4.5" fill="rgb(var(--sunset))" /><text x={x(m)} y={y(ts[m]) - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--ink))">{Math.round(ts[m])}°</text></g>; })()}
      </svg>
      <p className="text-xs text-muted" dir="rtl">קו: טמפרטורה לפי שעה · עמודות: סיכוי למשקעים</p>
    </div>
  );
}

const SEV = { info: { tone: 'info', I: Info, l: 'מידע' }, advice: { tone: 'accent', I: Info, l: 'המלצה' }, warning: { tone: 'warn', I: AlertTriangle, l: 'אזהרה' }, danger: { tone: 'danger', I: ShieldAlert, l: 'סכנה' } } as const;
const KIND_I = { rain: CloudRain, cold: Snowflake, heat: Flame, wind: Wind, uv: Sun, warm_night: Thermometer, flood: Droplets, ok: CheckCircle2 };

export function RecCards({ recs }: { recs: Rec[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {recs.map(r => { const s = SEV[r.severity]; const K = KIND_I[r.kind]; return (
        <article key={r.id} className={cx('rounded-2xl border bg-surface p-4', r.severity === 'danger' ? 'border-danger/50' : r.severity === 'warning' ? 'border-warn/50' : 'border-line')}>
          <div className="mb-2 flex items-center gap-2"><K size={20} className={r.severity === 'danger' ? 'text-danger' : r.severity === 'warning' ? 'text-warn' : 'text-moss'} /><h3 className="font-bold">{r.title}</h3><Badge tone={s.tone as any} className="ms-auto">{s.l}</Badge></div>
          <p className="mb-2 text-sm"><span className="font-semibold text-muted">הסיבה: </span><span className="num">{r.reason}</span></p>
          <ul className="space-y-1 text-sm">{r.actions.map(a => <li key={a} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />{a}</li>)}</ul>
        </article>); })}
    </div>
  );
}

export function NoForecast({ start, onRefresh, climate, loading }: { start: string; onRefresh: () => void; climate?: Climate; loading?: boolean }) {
  const opens = addDays(start, -FORECAST_HORIZON);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-dashed border-line bg-raised/50 p-4">
        <p className="font-bold">עדיין אין תחזית לתאריכים האלה</p>
        <p className="text-sm text-muted">תחזית אמינה זמינה עד 16 ימים קדימה. היא תיפתח בסביבות {fmtDate(opens > todayISO() ? opens : todayISO())}. לא נציג תחזית מומצאת.</p>
        <Button variant="soft" size="sm" className="mt-3" icon={<RefreshCw size={15} />} onClick={onRefresh}>רענון</Button>
      </div>
      {loading && <p className="text-sm text-muted">טוען נתוני עבר…</p>}
      {climate && (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="font-bold">מה היה בתאריכים האלה בשנים קודמות</h3><Badge tone="warn">נתוני עבר — לא תחזית</Badge></div>
          <p className="mb-3 text-xs text-muted">ממוצע תצפיות {climate.years.length} שנים ({climate.years.at(-1)}–{climate.years[0]}), Open-Meteo Historical (ERA5).</p>
          <div className="scroll-x flex gap-2">{climate.days.map(d => (
            <div key={d.date} className="w-[5.8rem] shrink-0 rounded-xl bg-raised/60 p-2 text-center text-sm">
              <div className="font-bold">{shortDay(d.date)} {fmtDate(d.date).split(' ')[0]}</div>
              <div className="num font-bold">{Math.round(d.tMax)}° / {Math.round(d.tMin)}°</div>
              <div className="num text-xs text-info">גשם ב-{d.rainYears} מ-{climate.years.length} שנים</div>
            </div>))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SourceLine({ f }: { f?: Forecast & { stale?: boolean } }) {
  if (!f) return null;
  const t = new Date(f.fetchedAt);
  return <p className="text-xs text-muted">מקור: Open-Meteo · עודכן {t.toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}{f.stale && <span className="font-bold text-warn"> · אין חיבור — מוצגת התחזית האחרונה שנשמרה</span>}</p>;
}

export const todayWx = (f?: Forecast) => f?.days.find(d => d.date === todayISO());
