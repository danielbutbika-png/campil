// "What to do now" — the planning assistant's suggestions for one trip, each with its reason and source.
import { useMemo, useState } from 'react';
import { Lightbulb, ChevronLeft, ExternalLink } from 'lucide-react';
import type { Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { useTripWeather } from '../lib/hooks';
import { recommend } from '../engine/weatherRules';
import { suggest, type Level, type Suggestion } from '../engine/assistant';
import { SITE_BY_ID, SITES } from '../data/sites';
import { todayISO } from '../lib/util';
import { useShopLines } from './Duties';
import { Prov } from './Provenance';
import { cx } from './ui';
import { href } from '../lib/router';

export function useSuggestions(t: Trip): Suggestion[] {
  const { inventory, boxes, siteChecks, settings } = useStore();
  const wx = useTripWeather(t);
  const shopLines = useShopLines(t);
  const sites = useMemo(() => t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean), [t.siteIds]);
  return useMemo(() => suggest({
    trip: t, today: todayISO(), sites, siteChecks, inventory, boxes, trunk: settings.trunkDims ?? null, shopLines,
    wx: { source: wx.source, recs: wx.days.length ? recommend(wx.days, t, sites) : [], rainExpected: wx.source === 'forecast' && wx.flags.rain, flags: wx.flags }, catalog: SITES,
  }), [t, sites, siteChecks, inventory, boxes, settings.trunkDims, shopLines, wx.days, wx.source, wx.flags.rain]);
}

const TONE: Record<Level, string> = { danger: 'border-s-danger', warn: 'border-s-warn', todo: 'border-s-moss', info: 'border-s-line' };
const LEVEL_HE: Record<Level, string> = { danger: 'חשוב', warn: 'לשים לב', todo: 'לעשות', info: 'כדאי' };

export function AssistantCard({ t, max = 4, title = 'מה כדאי לעשות עכשיו' }: { t: Trip; max?: number; title?: string }) {
  const list = useSuggestions(t);
  const [all, setAll] = useState(false);
  if (!list.length) return null;
  const shown = all ? list : list.slice(0, max);
  return (
    <section aria-labelledby="as-h" className="space-y-3">
      <h2 id="as-h" className="flex items-center gap-2 font-display text-xl"><Lightbulb size={20} className="text-sunset" />{title}</h2>
      <ul className="space-y-2">{shown.map(s => {
        const ext = s.action && /^https?:/.test(s.action.to);
        return (
          <li key={s.id} className={cx('space-y-1.5 rounded-xl2 border border-line border-s-4 bg-surface p-3', TONE[s.level])}>
            <p className="flex flex-wrap items-baseline gap-2"><span className={cx('text-xs font-bold', s.level === 'danger' ? 'text-danger' : s.level === 'warn' ? 'text-warn' : 'text-muted')}>{LEVEL_HE[s.level]}</span><span className="font-bold">{s.title}</span></p>
            <p className="text-sm">{s.why}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Prov kind={s.source.kind} source={s.source.label} url={s.source.url} />
              {s.action && <a href={ext ? s.action.to : href(s.action.to)} target={ext ? '_blank' : undefined} rel={ext ? 'noreferrer' : undefined} className="inline-flex items-center gap-1 text-sm font-bold text-moss">{s.action.label}{ext ? <ExternalLink size={13} /> : <ChevronLeft size={15} />}</a>}
            </div>
          </li>);
      })}</ul>
      {list.length > max && <button type="button" className="text-sm font-bold text-moss" onClick={() => setAll(!all)}>{all ? 'פחות' : `עוד ${list.length - max} המלצות`}</button>}
      <p className="text-xs text-muted">ההמלצות מחושבות מהנתונים שלכם ומהתחזית, לפי כללים קבועים. על תנאי שטח, סגירות ובטיחות — רק המקורות הרשמיים.</p>
    </section>
  );
}
