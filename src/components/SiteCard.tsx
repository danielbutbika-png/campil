import { Heart, Navigation, ExternalLink, MapPin, Clock, Mountain, Baby, Accessibility, Dog, Tent, ShieldAlert, Sun } from 'lucide-react';
import type { Site } from '../lib/types';
import { SITE_TYPE_LABEL, navLinks } from '../data/sites';
import { REGION_BY_ID } from '../data/regions';
import { INTEREST_HE, type Scored } from '../engine/scoring';
import { useStore } from '../lib/store';
import { Scene } from './Scene';
import { Badge, Blaze, cx, Sheet } from './ui';
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

export function SiteSheet({ site, onClose }: { site: Site | null; onClose: () => void }) {
  if (!site) return null;
  const n = navLinks(site.lat, site.lon);
  const reg = REGION_BY_ID[site.region];
  const rows: [any, string, string][] = [
    [MapPin, 'אזור', reg.name], [MapPin, 'קואורדינטות', `${site.lat.toFixed(4)}, ${site.lon.toFixed(4)}`],
    [Mountain, 'רמת קושי', site.difficulty ? DIFF[site.difficulty] : 'לא צוין'], [Clock, 'אורך / משך', site.lengthKm ? `${site.lengthKm} ק״מ${site.durationH ? ` · ${site.durationH}` : ''}` : 'לא אומת'],
    [Baby, 'התאמה למשפחות', site.family ? 'כן' : 'לא צוין'], [Accessibility, 'עגלות / כיסאות גלגלים', tri(site.stroller)], [Dog, 'חיות מחמד', tri(site.pets)],
    [Sun, 'עונה מומלצת', site.season ?? 'לא צוין'], [Tent, 'לינה', site.lodging ? 'מוכר כאתר לינה — לאמת הזמנה ומתקנים' : 'לא ידוע'],
  ];
  return (
    <Sheet open onClose={onClose} title={site.name} wide>
      <div className="space-y-4">
        <div className="h-40 overflow-hidden rounded-2xl"><Scene kind={site.type === 'beach' ? 'sea' : reg.scene} seed={site.name.length + site.lat} className="h-full w-full" /></div>
        <p>{site.desc}</p>
        <div className="flex flex-wrap gap-1.5">{site.tags.map(t => <Badge key={t}>{INTEREST_HE[t]}</Badge>)}</div>
        <dl className="grid gap-2 sm:grid-cols-2">{rows.map(([I, k, v]) => <div key={k} className="flex items-start gap-2 rounded-xl bg-raised/50 px-3 py-2"><I size={16} className="mt-1 shrink-0 text-moss" /><div><dt className="text-xs text-muted">{k}</dt><dd className="num font-semibold">{v}</dd></div></div>)}</dl>
        <div className="rounded-xl border border-warn/40 bg-warn/8 p-3 text-sm">
          <p className="font-bold">מחירים, שעות, מתקנים וסגירות</p>
          <p>לא מוצגים כאן כי לא אומתו. {site.sourceNote}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="inline-flex h-11 items-center gap-2 rounded-full bg-forest px-4 font-bold text-onforest" href={site.officialUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} />אתר המפעיל</a>
          <a className="inline-flex h-11 items-center gap-2 rounded-full bg-raised px-4 font-bold" href={n.waze} target="_blank" rel="noreferrer"><Navigation size={16} />Waze</a>
          <a className="inline-flex h-11 items-center gap-2 rounded-full bg-raised px-4 font-bold" href={n.google} target="_blank" rel="noreferrer"><Navigation size={16} />Google Maps</a>
        </div>
        <p className="text-xs text-muted">מקור: קטלוג CampIL · סטטוס: {site.verified ? `אומת ${site.checkedAt}` : 'לא אומת מול המפעיל'}</p>
      </div>
    </Sheet>
  );
}

export function useSiteSheet() {
  const [site, setSite] = useState<Site | null>(null);
  return { open: setSite, el: <SiteSheet site={site} onClose={() => setSite(null)} /> };
}
