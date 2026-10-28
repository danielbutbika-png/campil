import { BadgeCheck, Calculator, Sparkles, HelpCircle, Users, Landmark } from 'lucide-react';
import { cx } from './ui';

/** Where a piece of information comes from — shown wherever the app states a fact, an estimate or a recommendation.
 *  verified: checked against an official/primary source (with date) · official: an official recommendation ·
 *  community: OpenStreetMap or similar open data · estimate: a planning estimate the app uses ·
 *  auto: computed by the app from your data and the forecast · unknown: not checked — verify with the operator. */
export type ProvKind = 'verified' | 'official' | 'community' | 'estimate' | 'auto' | 'unknown';
const META: Record<ProvKind, { label: string; Icon: any; cls: string }> = {
  verified: { label: 'מאומת', Icon: BadgeCheck, cls: 'bg-ok/12 text-ok' },
  official: { label: 'המלצה רשמית', Icon: Landmark, cls: 'bg-info/12 text-info' },
  community: { label: 'מידע קהילתי (OSM)', Icon: Users, cls: 'bg-raised text-muted' },
  estimate: { label: 'הערכה', Icon: Calculator, cls: 'bg-warn/12 text-warn' },
  auto: { label: 'המלצה אוטומטית', Icon: Sparkles, cls: 'bg-moss/12 text-moss' },
  unknown: { label: 'לא אומת', Icon: HelpCircle, cls: 'bg-raised text-muted' },
};

export function Prov({ kind, source, url, date, className }: { kind: ProvKind; source?: string; url?: string; date?: string; className?: string }) {
  const m = META[kind];
  const tip = [m.label, source, date && `נבדק ${date}`].filter(Boolean).join(' · ');
  const inner = <><m.Icon size={12} aria-hidden />{m.label}{source ? <span className="font-normal opacity-80"> · {source}</span> : null}{date ? <span className="font-normal opacity-80"> · {date}</span> : null}</>;
  const cls = cx('inline-flex max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-bold', m.cls, className);
  return url ? <a href={url} target="_blank" rel="noreferrer" title={tip} className={cx(cls, 'underline-offset-2 hover:underline')}>{inner}</a> : <span title={tip} className={cls}>{inner}</span>;
}

export function ProvLegend() {
  return (
    <details className="text-xs text-muted">
      <summary className="cursor-pointer font-bold">מה אומר כל סימון?</summary>
      <ul className="mt-2 space-y-1">{(Object.keys(META) as ProvKind[]).map(k => <li key={k} className="flex flex-wrap items-center gap-2"><Prov kind={k} /><span>{{ verified: 'נבדק מול מקור רשמי או ראשוני, עם תאריך.', official: 'המלצה של גוף רשמי (עם קישור למקור).', community: 'נתון פתוח מ-OpenStreetMap — לא נבדק על ידי CampIL.', estimate: 'הערכת תכנון של האפליקציה — אפשר לשנות.', auto: 'חושב אוטומטית מהנתונים שלכם ומהתחזית — עם הסבר.', unknown: 'לא נבדק — לבדוק באתר המפעיל לפני היציאה.' }[k]}</span></li>)}</ul>
    </details>
  );
}
