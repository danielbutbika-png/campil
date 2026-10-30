// "What to do now" — the planning assistant's suggestions for one trip, each with its reason and source.
import { useMemo, useState } from 'react';
import { Lightbulb, ChevronLeft, ExternalLink, Check, X, Sparkles } from 'lucide-react';
import { proposalFor, applyProposal, type Proposal } from '../intel/actions';
import { insights, detectMore, tripReadiness, homeInsights, type Recommendation, type Certainty, type EvidenceKind } from '../intel/engine';
import { activeProvider } from '../intel/provider';
import type { Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { useTripWeather } from '../lib/hooks';
import { recommend } from '../engine/weatherRules';
import { suggest, type Level, type Suggestion } from '../engine/assistant';
import { SITE_BY_ID, SITES } from '../data/sites';
import { todayISO } from '../lib/util';
import { useShopLines } from './Duties';
import { Prov } from './Provenance';
import { cx, toast, Ring, Sheet, Button } from './ui';
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

export function useInsights(t: Trip): Recommendation[] {
  const sugg = useSuggestions(t);
  const shopLines = useShopLines(t);
  const state = useStore(s => s.insightState ?? {});
  const inventory = useStore(s => s.inventory);
  return useMemo(() => { const now = Date.now(); return insights(sugg, detectMore(t, todayISO(), shopLines, now, inventory), state, t.id, now); }, [sugg, t, shopLines, state, inventory]);
}

const TONE: Record<Level, string> = { danger: 'border-s-danger', warn: 'border-s-warn', todo: 'border-s-moss', info: 'border-s-line' };
const LEVEL_HE: Record<Level, string> = { danger: 'חשוב', warn: 'לשים לב', todo: 'לעשות', info: 'כדאי' };
const CERT_HE: Record<Certainty, string> = { high: 'ודאות גבוהה', medium: 'ודאות בינונית — הערכה', low: 'ודאות נמוכה — לבדוק' };
const EVID_HE: Record<EvidenceKind, string> = { fact: 'עובדה', calc: 'חישוב', estimate: 'הערכה', ai: 'ניסוח AI', missing: 'מידע חסר' };

/** One recommendation: what was found, why it matters, what to do, what it rests on, how sure — and one action. */
export function InsightCard({ t, r, scope }: { t?: Trip; r: Recommendation; scope?: string }) {
  const setInsight = useStore(s => s.setInsight);
  const inventory = useStore(s => s.inventory);
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState(false);
  const proposal = useMemo(() => (t ? proposalFor(r, t, inventory) : undefined), [r, t, inventory]);
  const key = `${scope ?? t?.id ?? 'home'}:${r.id}`;
  const ext = r.action && /^https?:/.test(r.action.to);
  const mark = (status: 'done' | 'dismissed', quiet = false) => { setInsight(key, { status, at: Date.now(), sig: r.sig }); if (!quiet) toast(status === 'done' ? 'סומן כבוצע' : 'ההמלצה הוסתרה — תחזור אם המצב ישתנה'); };
  return (
    <li className={cx('space-y-2 rounded-xl2 border border-line border-s-4 bg-surface p-3', TONE[r.level])} data-rec={r.id}>
      <p className="flex flex-wrap items-baseline gap-2"><span className={cx('text-xs font-bold', r.level === 'danger' ? 'text-danger' : r.level === 'warn' ? 'text-warn' : 'text-muted')}>{LEVEL_HE[r.level]}</span><span className="font-bold">{r.title}</span></p>
      <p className="text-sm">{r.why}</p>
      {r.todo && <p className="text-sm"><span className="font-bold">מה לעשות: </span>{r.todo}</p>}
      {open && <div className="space-y-1.5 rounded-xl bg-raised/60 p-2.5 text-sm" aria-label="על מה ההמלצה מבוססת">
        <ul className="space-y-0.5">{r.evidence.map((e, i) => <li key={i}><span className="font-bold">{EVID_HE[e.kind]}: </span>{e.text}</li>)}</ul>
        <p>{CERT_HE[r.certainty]} · חושב {new Date(r.updatedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} · {r.engine === 'rules' ? 'מנוע כללים (בלי AI)' : 'AI'}</p>
      </div>}
      <Prov kind={r.source.kind} source={r.source.label} url={r.source.url} />
      <div className="flex flex-wrap items-center gap-2">
        {proposal && <button type="button" onClick={() => setReview(true)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-sunset px-4 text-sm font-bold text-white"><Sparkles size={15} />{proposal.title}</button>}
        {r.action && <a href={ext ? r.action.to : href(r.action.to)} target={ext ? '_blank' : undefined} rel={ext ? 'noreferrer' : undefined} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-forest px-4 text-sm font-bold text-onforest">{r.action.label}{ext ? <ExternalLink size={14} /> : <ChevronLeft size={16} />}</a>}
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-bold text-moss" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'פחות' : 'למה?'}</button>
        <span className="flex-1" />
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-bold text-muted hover:text-ink" onClick={() => mark('done')} aria-label={`בוצע: ${r.title}`}><Check size={16} className="inline" /> בוצע</button>
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-bold text-muted hover:text-ink" onClick={() => mark('dismissed')} aria-label={`לא רלוונטי: ${r.title}`}><X size={16} className="inline" /> לא רלוונטי</button>
      </div>
      {proposal && t && review && <ProposalSheet t={t} p={proposal} onClose={() => setReview(false)} onDone={() => mark('done', true)} />}
    </li>
  );
}

/** Preview of a change: every line can be unticked; nothing is saved until "approve". */
function ProposalSheet({ t, p, onClose, onDone }: { t: Trip; p: Proposal; onClose: () => void; onDone: () => void }) {
  const updateTrip = useStore(s => s.updateTrip);
  const [sel, setSel] = useState<string[]>(p.items.map(i => i.id));
  const apply = () => { updateTrip(t.id, x => applyProposal(x, p, sel)); onDone(); onClose(); toast(`עודכן: ${sel.length} ${p.kind === 'tasks' ? 'משימות' : p.kind === 'servings' ? 'ארוחות' : 'פריטים'}`); };
  return (
    <Sheet open onClose={onClose} title={p.title} footer={<><Button onClick={apply} disabled={!sel.length}>אישור ({sel.length})</Button><Button variant="ghost" onClick={onClose}>ביטול</Button></>}>
      <div className="space-y-3">
        <p className="text-sm text-muted">זו הצעה. סמנו מה להוסיף — שום דבר לא נשמר עד שתאשרו.</p>
        <ul className="space-y-1" aria-label="השינויים המוצעים">{p.items.map(i => (
          <li key={i.id}><label className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-raised">
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--forest))]" checked={sel.includes(i.id)} onChange={e => setSel(x => (e.target.checked ? [...x, i.id] : x.filter(y => y !== i.id)))} />
            <span className="flex-1">{i.label}{i.detail && <span className="block text-xs text-muted">{i.detail}</span>}</span>
          </label></li>))}</ul>
      </div>
    </Sheet>
  );
}

export function AssistantCard({ t, max = 3, title = 'מה כדאי לעשות עכשיו' }: { t: Trip; max?: number; title?: string }) {
  const list = useInsights(t);
  const [all, setAll] = useState(false);
  if (!list.length) return null;
  const shown = all ? list : list.slice(0, max);
  const provider = activeProvider();
  return (
    <section aria-labelledby="as-h" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="as-h" className="flex items-center gap-2 font-display text-xl"><Lightbulb size={20} className="text-sunset" />{title}</h2>
        <span className="rounded-full bg-raised px-2.5 py-1 text-xs font-bold text-muted" title="אין מודל AI מחובר — ההמלצות מחושבות בכללים קבועים מהנתונים שלכם">{provider.label}</span>
      </div>
      <ul className="space-y-2">{shown.map(r => <InsightCard key={r.id} t={t} r={r} />)}</ul>
      {list.length > max && <button type="button" className="min-h-11 text-sm font-bold text-moss" onClick={() => setAll(!all)}>{all ? 'פחות' : `עוד ${list.length - max} המלצות`}</button>}
      <p className="text-xs text-muted">מחושב מהנתונים שלכם ומהתחזית לפי כללים קבועים. על תנאי שטח, סגירות ובטיחות — רק המקורות הרשמיים; זו לא הנחיית בטיחות.</p>
    </section>
  );
}

/** Home with no upcoming trip: recommendations from the family's own gear and past trips. */
export function HomeInsights() {
  const inventory = useStore(s => s.inventory), trips = useStore(s => s.trips), state = useStore(s => s.insightState ?? {});
  const list = useMemo(() => { const now = Date.now(); return insights([], homeInsights(inventory, trips, todayISO(), now), state, 'home', now); }, [inventory, trips, state]);
  if (!list.length) return null;
  return (
    <section aria-labelledby="hi-h" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="hi-h" className="flex items-center gap-2 font-display text-xl"><Lightbulb size={20} className="text-sunset" />לפני הטיול הבא</h2>
        <span className="rounded-full bg-raised px-2.5 py-1 text-xs font-bold text-muted">{activeProvider().label}</span>
      </div>
      <ul className="space-y-2">{list.map(r => <InsightCard key={r.id} r={r} scope="home" />)}</ul>
    </section>
  );
}

/** "How ready are we" — a transparent checklist: every line shows its numbers and weight. */
export function TripReadiness({ t }: { t: Trip }) {
  const shopLines = useShopLines(t);
  const wx = useTripWeather(t);
  const fcFresh = wx.source === 'forecast' && !!wx.forecast && !wx.forecast.stale;
  const { pct, items } = useMemo(() => tripReadiness(t, shopLines, fcFresh), [t, shopLines, fcFresh]);
  return (
    <section aria-labelledby="rd-h" className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={64} />
        <div><h2 id="rd-h" className="font-display text-xl">מוכנות לטיול</h2><p className="text-xs text-muted">ממוצע משוקלל של הרשימה — כל שורה עם המספרים שלה</p></div>
      </div>
      <ul className="space-y-1.5" aria-label="רשימת מוכנות">{items.map(i => (
        <li key={i.id}><a href={href(i.to ?? '/')} className="flex min-h-11 items-center gap-2 rounded-xl px-2 hover:bg-raised">
          <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold', i.done >= i.total ? 'bg-ok text-white' : 'bg-raised text-muted')}>{i.done >= i.total ? <Check size={14} /> : ''}</span>
          <span className="min-w-0 flex-1 text-sm">{i.label}{i.note && <span className="block text-xs text-muted">{i.note}</span>}</span>
          <span className="num shrink-0 text-sm font-bold">{i.total === 1 ? (i.done ? 'כן' : 'עוד לא') : `${i.done}/${i.total}`}</span>
          <span className="num w-10 shrink-0 text-xs text-muted" title="משקל בחישוב">×{i.weight}</span>
        </a></li>))}</ul>
    </section>
  );
}
