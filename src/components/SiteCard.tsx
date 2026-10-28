import { Heart, Navigation, ExternalLink, MapPin, Clock, Mountain, Baby, Accessibility, Dog, Tent, ShieldAlert, Sun, CalendarCheck } from 'lucide-react';
import type { Site, SiteCheck } from '../lib/types';
import { Prov, ProvLegend, type ProvKind } from './Provenance';
import { SITE_TYPE_LABEL, navLinks } from '../data/sites';
import { REGION_BY_ID } from '../data/regions';
import { INTEREST_HE, type Scored } from '../engine/scoring';
import { useStore } from '../lib/store';
import { Scene } from './Scene';
import { Badge, Blaze, cx, Sheet, Button, toast } from './ui';
import { useState } from 'react';

const TYPE_BLAZE: Record<Site['type'], string> = { trail: '#c0392b', campsite: '#2f6b3f', attraction: '#3c6e9f', beach: '#2c8c99', viewpoint: '#d9822b', spring: '#2c8c99', park: '#5d7a3a' };
const DIFF = { easy: 'קל', moderate: 'בינוני', hard: 'קשה' };
const tri = (v?: string) => (v === 'yes' ? 'כן' : v === 'no' ? 'לא' : v === 'partial' ? 'חלקית' : 'לא ידוע');

export function SiteCard({ site, scored, onOpen, selected, onSelect, compact }: { site: Site; scored?: Scored; onOpen?: () => void; selected?: boolean; onSelect?: () => void; compact?: boolean }) {
  const fav = useStore(s => s.favorites.includes(site.id));
  const toggle = useStore(s => s.toggleFavorite);
  const reg = REGION_BY_ID[site.region];
  const warn = scored?.warnings[0];
  return (
    <article className={cx('group relative flex flex-col overflow-hidden rounded-xl2 border bg-surface shadow-card transition', selected ? 'border-forest ring-2 ring-forest/40' : 'border-line')}>
      <button type="button" onClick={onOpen} className="relative block h-28 w-full overflow-hidden text-right" aria-label={`פרטים על ${site.name}`}>
        <Scene kind={site.type === 'beach' ? 'sea' : reg.scene} seed={site.name.length + site.lat} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold text-white backdrop-blur"><Blaze color={TYPE_BLAZE[site.type]} />{SITE_TYPE_LABEL[site.type]}</span>
        {scored && <span className="num absolute bottom-3 right-3 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-extrabold text-forest shadow">{scored.score}% התאמה</span>}
      </button>
      <button type="button" onClick={() => toggle(site.id)} aria-pressed={fav} aria-label={fav ? 'הסרה מהמועדפים' : 'הוספה למועדפים'} className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 shadow"><Heart size={17} className={fav ? 'fill-sunset text-sunset' : 'text-muted'} /></button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-bold leading-tight">{site.name}</h3>
          <p className="text-xs text-muted">{reg.name}{scored?.km != null && <> · כ-{Math.round(scored.km)} ק״מ בקו אווירי</>}</p>
        </div>
        {!compact && <p className="text-sm text-ink/85">{site.desc}</p>}
        {scored && scored.reasons.length > 0 && <p className="text-sm"><span className="font-bold text-moss">למה זה מתאים לכם? </span>{scored.reasons.slice(0, 3).join(' · ')}</p>}
        {warn && <p className="flex items-start gap-1.5 text-sm font-semibold text-warn"><ShieldAlert size={16} className="mt-0.5 shrink-0" />{warn}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {site.difficulty && <Badge>{DIFF[site.difficulty]}</Badge>}
          {site.family && <Badge tone="ok">משפחתי</Badge>}
          {site.lodging && <Badge tone="info">לינה (לאמת)</Badge>}
          {site.floodRisk && <Badge tone="warn">ערוץ נחל</Badge>}
          {site.exposed && <Badge tone="warn">חשוף לשמש</Badge>}
        </div>
        {onSelect && <button type="button" onClick={onSelect} aria-pressed={selected} className={cx('mt-2 h-10 rounded-full text-sm font-bold transition', selected ? 'bg-forest text-onforest' : 'bg-raised hover:bg-sand')}>{selected ? '✓ בתוכנית' : 'הוספה לתוכנית'}</button>}
      </div>
    </article>
  );
}

const BOOK_HE = { required: 'נדרשת הזמנה מראש', recommended: 'מומלץ להזמין', none: 'לא נדרשת הזמנה' } as const;
const ACC_HE = { yes: 'נגיש', partial: 'נגיש חלקית', no: 'לא נגיש' } as const;

export function SiteSheet({ site, onClose }: { site: Site | null; onClose: () => void }) {
  const check = useStore(s => (site ? s.siteChecks[site.id] : undefined));
  const setCheck = useStore(s => s.setSiteCheck);
  const [editing, setEditing] = useState(false);
  if (!site) return null;
  const n = navLinks(site.lat, site.lon);
  const reg = REGION_BY_ID[site.region];
  const mine = check ? { kind: 'verified' as const, source: 'בדיקה שלך', url: check.url, date: check.at } : null;
  const unk = { kind: 'unknown' as const };
  const cat = { kind: 'estimate' as const, source: 'קטלוג CampIL' };
  type Row = [any, string, string, { kind: ProvKind; source?: string; url?: string; date?: string }];
  const rows: Row[] = [
    [MapPin, 'אזור ומיקום', `${reg.name} · ${site.lat.toFixed(4)}, ${site.lon.toFixed(4)}`, cat],
    [Tent, 'לינה', check?.lodging ? (check.lodging === 'yes' ? 'יש לינה' : 'אין לינה') : site.lodging ? 'מוכר כאתר לינה' : 'לא ידוע — לבדוק באתר המפעיל', check?.lodging ? mine! : site.lodging ? cat : unk],
    [CalendarCheck, 'הזמנה מראש', check?.booking ? BOOK_HE[check.booking] : site.booking ? BOOK_HE[site.booking] : 'לא ידוע — לבדוק באתר המפעיל', check?.booking ? mine! : site.booking && site.verified ? { kind: 'verified', date: site.checkedAt } : unk],
    [Accessibility, 'נגישות', check?.access ? ACC_HE[check.access] : site.stroller && site.stroller !== 'unknown' ? `עגלות: ${tri(site.stroller)}` : 'לא ידוע — לבדוק באתר המפעיל', check?.access ? mine! : site.stroller && site.stroller !== 'unknown' ? cat : unk],
    [Mountain, 'רמת קושי', site.difficulty ? DIFF[site.difficulty] : 'לא צוין', site.difficulty ? cat : unk],
    [Clock, 'אורך / משך', site.lengthKm ? `${site.lengthKm} ק״מ${site.durationH ? ` · ${site.durationH}` : ''}` : 'לא ידוע', site.lengthKm ? cat : unk],
    [Baby, 'התאמה למשפחות', site.family ? 'כן' : 'לא צוין', cat], [Dog, 'חיות מחמד', tri(site.pets), site.pets && site.pets !== 'unknown' ? cat : unk],
    [Sun, 'עונה מומלצת', site.season ?? 'לא צוין', cat],
  ];
  return (
    <Sheet open onClose={onClose} title={site.name} wide>
      <div className="space-y-4">
        <div className="h-40 overflow-hidden rounded-2xl"><Scene kind={site.type === 'beach' ? 'sea' : reg.scene} seed={site.name.length + site.lat} className="h-full w-full" /></div>
        <p>{site.desc}</p>
        <div className="flex flex-wrap gap-1.5">{site.tags.map(t => <Badge key={t}>{INTEREST_HE[t]}</Badge>)}</div>
        <dl className="grid gap-2 sm:grid-cols-2">{rows.map(([I, k, v, pv]) => <div key={k} className="flex min-w-0 items-start gap-2 rounded-xl bg-raised/50 px-3 py-2"><I size={16} className="mt-1 shrink-0 text-moss" /><div className="min-w-0"><dt className="text-xs text-muted">{k}</dt><dd className="num font-semibold">{v}</dd><Prov {...pv} className="mt-0.5" /></div></div>)}</dl>
        <div className="rounded-xl border border-warn/40 bg-warn/8 p-3 text-sm">
          <p className="font-bold">מחירים, שעות פתיחה, מתקנים וסגירות</p>
          <p>לא מוצגים — אין לנו מקור מאומת ועדכני. {site.sourceNote}</p>
        </div>
        <div className="space-y-2 rounded-xl border border-line p-3">
          <div className="flex flex-wrap items-center gap-2"><p className="flex-1 text-sm font-bold">{check ? `בדקת באתר המפעיל ב-${check.at}` : 'בדקתם באתר המפעיל? שמרו את מה שמצאתם'}</p>
            <Button size="sm" variant="soft" onClick={() => setEditing(!editing)}>{check ? 'עדכון' : 'הוספת בדיקה'}</Button>
            {check && <Button size="sm" variant="ghost" onClick={() => setCheck(site.id, null)}>מחיקה</Button>}</div>
          {check?.note && <p className="text-sm text-muted">{check.note}</p>}
          {editing && <CheckForm site={site} init={check} onSave={c => { setCheck(site.id, c); setEditing(false); toast('הבדיקה נשמרה במכשיר'); }} />}
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="inline-flex h-11 items-center gap-2 rounded-full bg-forest px-4 font-bold text-onforest" href={site.officialUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} />אתר המפעיל</a>
          <a className="inline-flex h-11 items-center gap-2 rounded-full bg-raised px-4 font-bold" href={n.waze} target="_blank" rel="noreferrer"><Navigation size={16} />Waze</a>
          <a className="inline-flex h-11 items-center gap-2 rounded-full bg-raised px-4 font-bold" href={n.google} target="_blank" rel="noreferrer"><Navigation size={16} />Google Maps</a>
        </div>
        <ProvLegend />
      </div>
    </Sheet>
  );
}

function CheckForm({ site, init, onSave }: { site: Site; init?: SiteCheck; onSave: (c: SiteCheck) => void }) {
  const [c, setC] = useState<SiteCheck>(init ?? { at: new Date().toISOString().slice(0, 10), url: site.officialUrl });
  const sel = (k: keyof SiteCheck, opts: [string, string][], label: string) => (
    <div><label className="label" htmlFor={`ck-${k}`}>{label}</label><select id={`ck-${k}`} className="field" value={(c[k] as string) ?? ''} onChange={e => setC({ ...c, [k]: e.target.value || undefined })}><option value="">לא בדקתי</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
  );
  return (
    <form className="grid gap-2 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); onSave(c); }}>
      {sel('booking', Object.entries(BOOK_HE), 'הזמנה מראש')}
      {sel('access', Object.entries(ACC_HE), 'נגישות')}
      {sel('lodging', [['yes', 'יש לינה'], ['no', 'אין לינה']], 'לינה')}
      <div><label className="label" htmlFor="ck-at">תאריך הבדיקה</label><input id="ck-at" type="date" className="field" value={c.at} onChange={e => setC({ ...c, at: e.target.value })} /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="ck-url">קישור לעמוד שבדקתם</label><input id="ck-url" type="url" dir="ltr" className="field" value={c.url ?? ''} onChange={e => setC({ ...c, url: e.target.value || undefined })} /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="ck-note">הערות (שעות, מחיר, סגירות…)</label><input id="ck-note" className="field" value={c.note ?? ''} onChange={e => setC({ ...c, note: e.target.value || undefined })} /></div>
      <Button type="submit" size="sm" className="sm:col-span-2">שמירה</Button>
    </form>
  );
}
export function useSiteSheet() {
  const [site, setSite] = useState<Site | null>(null);
  return { open: setSite, el: <SiteSheet site={site} onClose={() => setSite(null)} /> };
}
