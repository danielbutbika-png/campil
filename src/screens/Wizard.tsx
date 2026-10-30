import { useMemo, useState, lazy, Suspense } from 'react';
import { z } from 'zod';
import { ArrowRight, ArrowLeft, Check, Tent, Sun, Layers, Caravan, Home as HomeI, Sparkles, MapPin, Dog, Car, Users } from 'lucide-react';
import { useStore, blankTrip, tasteOf, withCounts } from '../lib/store';
import { FamiliesEditor } from '../components/Participants';
import { normalizeFamilies, isGroup } from '../lib/families';
import { DietsEditor } from '../components/DietEditor';
import { STYLE_HE, KASHRUT_HE } from '../engine/menu';
import { Utensils } from 'lucide-react';
import type { Interest, RegionId, Trip } from '../lib/types';
import { tripLength, fmtRange, todayISO, seasonOf, SEASON_HE, haversineKm } from '../lib/util';
import { REGIONS, REGION_BY_ID } from '../data/regions';
import { SITES, sitesIn } from '../data/sites';
import { rank, INTEREST_HE } from '../engine/scoring';
import { materialize } from '../engine/build';
import { useForecast } from '../lib/hooks';
import { flagsFor } from '../engine/weatherRules';
import { Button, Chip, Segmented, Toggle, Badge, Card, cx, toast } from '../components/ui';
import { SiteCard, useSiteSheet } from '../components/SiteCard';
import { go } from '../lib/router';
import { TripTypePicker } from '../components/TripTypePicker';
import { impliedBy } from '../engine/tripTypes';
import { DestSearch } from '../components/DestSearch';
import { SITE_BY_ID } from '../data/sites';

const IsraelMap = lazy(() => import('../components/IsraelMap').then(m => ({ default: m.IsraelMap })));

const STEPS = ['סוג ולינה', 'אזור', 'משתתפים', 'העדפות ואתרים', 'סיכום'];
const LAST = STEPS.length - 1;
const INTERESTS: Interest[] = ['water', 'family', 'hiking', 'views', 'beach', 'forest', 'desert', 'accessible', 'kids', 'history', 'camping', 'picnic'];

const stepWhen = z.object({
  start: z.string().min(10, 'בחרו תאריך יציאה'),
  end: z.string().min(10, 'בחרו תאריך חזרה'),
}).refine(v => v.end >= v.start, { message: 'תאריך החזרה לפני תאריך היציאה', path: ['end'] })
  .refine(v => v.start >= todayISO(), { message: 'תאריך היציאה כבר עבר', path: ['start'] });
const stepWho = z.object({
  participants: z.array(z.object({ gender: z.enum(['m', 'f'], { required_error: 'חסר מגדר' }) }).passthrough())
    .min(1, 'הוסיפו לפחות משתתף אחד')
    .refine(ps => ps.some(p => p.role !== 'child'), 'צריך לפחות מבוגר אחד בטיול'),
});

const dietLabel = (d?: import('../lib/types').FamilyDiet) => d ? [STYLE_HE[d.style], KASHRUT_HE[d.kashrut], ...d.allergies.map(a => `ללא ${a}`)].join(', ') : 'לפי ההגדרות';

export default function Wizard() {
  const st = useStore();
  const [t, setT] = useState<Trip>(() => ({ ...blankTrip(st.members), vehicle: st.settings.vehicle }));
  const [step, setStep] = useState(0);
  const [wantRecs, setWantRecs] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPErr, setShowPErr] = useState(false);
  const sheet = useSiteSheet();
  const set = (p: Partial<Trip>) => setT(x => withCounts({ ...x, ...p }) as Trip);
  const { days, nights } = tripLength(t.start, t.end);
  const taste = tasteOf(st);
  const regionFc = useForecast(t.regionId ? REGION_BY_ID[t.regionId].lat : undefined, t.regionId ? REGION_BY_ID[t.regionId].lon : undefined);
  const flags = useMemo(() => regionFc.data ? flagsFor(regionFc.data.days.filter(d => d.date >= t.start && d.date <= t.end)) : null, [regionFc.data, t.start, t.end]);

  const regionRecs = useMemo(() => {
    const season = seasonOf(t.start);
    return REGIONS.map(r => {
      const top = rank(sitesIn(r.id), { ...t, regionId: null }, null, st.settings, taste).slice(0, 3);
      let score = top.reduce((a, b) => a + b.score, 0) / Math.max(1, top.length);
      const why: string[] = [];
      if (r.bestSeasons[0] === season) { score += 12; why.push(`מומלץ במיוחד ב${SEASON_HE[season]}`); } else if (r.bestSeasons.includes(season)) { score += 5; why.push(`מתאים ל${SEASON_HE[season]}`); } else { score -= 10; why.push(`פחות מומלץ ב${SEASON_HE[season]}`); }
      const tagHits = t.interests.filter(i => sitesIn(r.id).some(s => s.tags.includes(i)));
      if (tagHits.length) why.push(`יש כאן: ${tagHits.slice(0, 3).map(i => INTEREST_HE[i]).join(', ')}`);
      if (st.settings.home) { const km = haversineKm(st.settings.home, r); why.push(`כ-${Math.round(km)} ק״מ בקו אווירי`); if (t.maxDriveKm && km > t.maxDriveKm) score -= 25; }
      if (taste.regions[r.id]) { score += 5; why.push('אהבתם טיול כאן בעבר'); }
      return { r, score: Math.round(score), why };
    }).sort((a, b) => b.score - a.score);
  }, [t.start, t.interests, t.children, t.maxDriveKm, st.settings.home]);

  const ranked = useMemo(() => rank(t.regionId ? sitesIn(t.regionId) : SITES, t, flags, st.settings, taste), [t, flags]);

  const validate = (schema: z.ZodTypeAny) => {
    const r = schema.safeParse(t);
    if (r.success) { setErrors({}); return true; }
    const e: Record<string, string> = {}; r.error.issues.forEach(i => { const k = i.path[0] as string; if (!e[k]) e[k] = k === 'participants' && i.path.length > 1 ? 'השלימו מגדר לכל משתתף' : i.message; });
    setErrors(e); if (e.participants) setShowPErr(true); toast(Object.values(e)[0]); return false;
  };
  const next = () => {
    if (step === 0 && !validate(stepWhen)) return;
    if (step === 1 && !t.regionId) { const best = regionRecs[0].r.id; set({ regionId: best }); toast(`בחרנו עבורכם: ${REGION_BY_ID[best].name}`); }
    if (step === 2) {
      if (!validate(stepWho)) return;
      if (isGroup(t) && t.families!.some(f => !t.participants.some(p => p.familyId === f.id))) return toast('יש משפחה בלי משתתפים — הוסיפו לה אנשים או הסירו אותה');
    }
    setStep(s => Math.min(LAST, s + 1)); scrollTo({ top: 0 });
  };
  const finish = () => {
    const daysWx = regionFc.data?.days.filter(d => d.date >= t.start && d.date <= t.end) ?? [];
    const first = SITE_BY_ID[t.siteIds[0]]?.name ?? t.places?.[0]?.name;
    const name = t.name.trim() || (t.kind === 'day' && first ? `טיול יום ל${first}` : `${t.kind === 'day' ? 'טיול יום' : 'קמפינג'} ב${REGION_BY_ID[t.regionId!].short}`);
    const built = materialize({ ...t, name }, st, daysWx);
    const done = t.packingMode === 'manual' ? { ...built, packing: [] } : built;
    st.addTrip(done); toast('התוכנית מוכנה'); go(`/trip/${done.id}`);
  };

  return (
    <div className="gutter mx-auto max-w-4xl space-y-6 py-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3"><h1 className="font-display text-3xl">טיול חדש</h1><Button variant="ghost" size="sm" onClick={() => history.back()}>ביטול</Button></div>
        <ol className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="שלבי האשף">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)} className="w-full text-right">
                <span className={cx('mb-1.5 block h-1.5 rounded-full', i <= step ? 'bg-forest' : 'bg-line')} />
                <span className={cx('block text-[11px] font-bold leading-tight sm:text-sm', i === step ? 'text-ink' : 'text-muted')}>{i + 1}. {s}</span>
              </button>
            </li>
          ))}
        </ol>
      </header>

      {step === 0 && (
        <div className="space-y-6 rise">
          <div className="space-y-2"><h2 className="font-display text-xl">מה מאפיין את הטיול?</h2><p className="text-sm text-muted">אפשר לבחור כמה — למשל קמפינג משפחתי + מסלול רטוב. לא חובה.</p>
            <TripTypePicker types={t.types ?? []} answers={t.typeAnswers ?? {}} onChange={(types, typeAnswers) => set({ types, typeAnswers, ...impliedBy(types, t), ...(impliedBy(types, t).kind === 'day' ? { end: t.start } : {}) })} />
          </div>
          <div className="space-y-2"><h2 className="font-display text-xl">איזה טיול?</h2>
            <Segmented label="סוג הטיול" value={t.kind} onChange={v => set({ kind: v, end: v === 'day' ? t.start : t.end })} options={[{ v: 'camping', label: 'קמפינג', icon: <Tent size={18} /> }, { v: 'day', label: 'טיול יום', icon: <Sun size={18} /> }, { v: 'combined', label: 'משולב', icon: <Layers size={18} /> }]} />
          </div>
          {t.kind === 'day' && <div className="space-y-2"><h2 className="font-display text-xl">לאן נוסעים?</h2>
            <p className="text-sm text-muted">חפשו מקום ולחצו עליו — הוא יתווסף למסלול של היום. אפשר להוסיף כמה.</p>
            <DestSearch t={t} onChange={set} />
          </div>}
          {t.kind !== 'day' && <div className="space-y-2"><h2 className="font-display text-xl">איפה ישנים?</h2>
            <Segmented label="סוג לינה" value={t.lodging} onChange={v => set({ lodging: v })} options={[{ v: 'tent', label: 'אוהל פרטי', icon: <Tent size={18} /> }, { v: 'equipped_site', label: 'חניון מאובזר', icon: <MapPin size={18} /> }, { v: 'caravan', label: 'קרוואן', icon: <Caravan size={18} /> }, { v: 'other', label: 'אירוח אחר', icon: <HomeI size={18} /> }]} />
          </div>}
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="start">תאריך יציאה</label><input id="start" type="date" min={todayISO()} className={cx('field', errors.start && 'border-danger')} value={t.start} onChange={e => set({ start: e.target.value, end: t.kind === 'day' || e.target.value > t.end ? e.target.value : t.end })} aria-invalid={!!errors.start} aria-describedby="start-err" />{errors.start && <p id="start-err" className="mt-1 text-sm text-danger">{errors.start}</p>}</div>
            {t.kind !== 'day' && <div><label className="label" htmlFor="end">תאריך חזרה</label><input id="end" type="date" min={t.start} className={cx('field', errors.end && 'border-danger')} value={t.end} onChange={e => set({ end: e.target.value })} aria-invalid={!!errors.end} />{errors.end && <p className="mt-1 text-sm text-danger">{errors.end}</p>}</div>}
            <div className="flex flex-col justify-end"><div className="rounded-xl bg-forest/8 px-4 py-2.5 font-bold text-forest" aria-live="polite"><span className="num">{days}</span> ימים · <span className="num">{nights}</span> לילות</div></div>
          </div>
          <div><label className="label" htmlFor="tname">שם הטיול (לא חובה)</label><input id="tname" className="field" placeholder="למשל: חנוכה בגליל" value={t.name} onChange={e => set({ name: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label flex items-center gap-1.5" htmlFor="veh"><Car size={16} />באיזה רכב נוסעים?</label><input id="veh" className="field" placeholder="דגם הרכב" value={t.vehicle} onChange={e => set({ vehicle: e.target.value })} /></div>
            <div className="flex items-end"><div className="w-full"><Toggle checked={t.pets} onChange={v => set({ pets: v })} label="חיות מחמד מצטרפות" desc="נוסיף ציוד ונסמן אתרים לבדיקה" /></div></div>
          </div>
          <div className="space-y-2"><span className="label">{t.kind === 'day' ? 'רוצים עוד רעיונות?' : 'יעד'}</span>
            <Segmented label="יעד" value={wantRecs ? 'recs' : 'mine'} onChange={v => setWantRecs(v === 'recs')} options={[{ v: 'recs', label: 'רוצים המלצות', icon: <Sparkles size={18} /> }, { v: 'mine', label: 'כבר בחרנו יעד', icon: <MapPin size={18} /> }]} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5 rise">
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <Suspense fallback={<div className="h-[380px] rounded-xl2 bg-raised" />}>
              <IsraelMap selected={t.regionId} onSelect={r => set({ regionId: r, siteIds: [] })} className="h-[380px] overflow-hidden rounded-xl2 border border-line lg:h-[520px]" />
            </Suspense>
            <div className="space-y-3">
              {wantRecs && <><h2 className="font-display text-xl">מומלץ לתאריכים שלכם</h2>
                {regionRecs.slice(0, 3).map(({ r, why }, i) => (
                  <button key={r.id} type="button" onClick={() => set({ regionId: r.id, siteIds: [] })} aria-pressed={t.regionId === r.id} className={cx('w-full rounded-xl2 border p-3 text-right transition', t.regionId === r.id ? 'border-forest bg-forest/8 ring-2 ring-forest/30' : 'border-line bg-surface hover:border-moss')}>
                    <span className="flex items-center gap-2 font-bold">{i === 0 && <Badge tone="accent">הכי מתאים</Badge>}{r.name}</span>
                    <span className="mt-1 block text-sm text-muted">{why.join(' · ')}</span>
                  </button>))}</>}
              <label className="label" htmlFor="region-list">או בחרו מהרשימה</label>
              <select id="region-list" className="field" value={t.regionId ?? ''} onChange={e => set({ regionId: (e.target.value || null) as RegionId, siteIds: [] })}>
                <option value="">— בחרו אזור —</option>{REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {t.regionId && <Card className="p-4"><p className="font-bold">{REGION_BY_ID[t.regionId].name}</p><p className="text-sm text-muted">{REGION_BY_ID[t.regionId].desc}</p><p className="mt-1 text-sm"><span className="font-semibold">אקלים: </span>{REGION_BY_ID[t.regionId].climateNote}</p></Card>}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rise">
          <h2 className="flex items-center gap-2 font-display text-xl"><Users size={20} />מי יוצא?</h2>
          <p className="text-sm text-muted">מבוגר או ילד, ומגדר, לכל משתתף. יוצאים כמה משפחות יחד? לחצו "יוצאים עם עוד משפחות" — כל משפחה תקבל קישור משלה ותראה רק את הציוד שלה ואת הציוד המשותף.</p>
          <FamiliesEditor families={t.families} participants={t.participants} household={st.members} defaultName={st.settings.familyName || 'המשפחה שלי'} showErrors={showPErr}
            onChange={(families, participants) => set({ families, participants: normalizeFamilies(families, participants) })} />
          {errors.participants && <p className="text-sm font-semibold text-danger">{errors.participants}</p>}
          <div className="space-y-2 border-t border-line pt-5">
            <h2 className="font-display text-xl">רשימת ציוד</h2>
            <Segmented label="רשימת ציוד" value={t.packingMode === 'manual' ? 'manual' : 'auto'} onChange={v => set({ packingMode: v === 'manual' ? 'manual' : undefined })} options={[{ v: 'auto', label: 'רשימה אוטומטית' }, { v: 'manual', label: 'בונים בעצמנו' }]} />
            <p className="text-sm text-muted">{t.packingMode === 'manual' ? 'הרשימה תתחיל ריקה, ותוסיפו בעצמכם (עם הצעות מהמחסן).' : 'נבנית מהמחסן שלכם לפי התחזית, המשתתפים וסוג הטיול — וכל פריט אפשר לערוך או להסיר.'}</p>
          </div>
          <div className="space-y-3 border-t border-line pt-5">
            <h2 className="flex items-center gap-2 font-display text-xl"><Utensils size={20} />מה אוכלים?</h2>
            <Segmented label="אוכל בטיול" value={t.noFood ? 'none' : t.menuMode === 'manual' ? 'manual' : 'food'} onChange={v => set({ noFood: v === 'none' || undefined, menuMode: v === 'manual' ? 'manual' : undefined })} options={[{ v: 'food', label: 'תפריט מוכן' }, { v: 'manual', label: 'בונים בעצמנו' }, { v: 'none', label: 'בלי אוכל' }]} />
            {t.menuMode === 'manual' && !t.noFood && <p className="text-sm text-muted">בלשונית האוכל של הטיול תוסיפו לכל ארוחה מה שרוצים, עם כמות מומלצת לפי מספר המבוגרים והילדים.</p>}
            {t.noFood ? <p className="text-sm text-muted">לא נבנה תפריט ורשימת קניות, וציוד הבישול לא ייכנס לרשימה. מים לשתייה נשארים ברשימת הציוד. אפשר לשנות אחר כך בלשונית האוכל.</p> : <>
            <p className="text-sm text-muted">{isGroup(t) ? 'לכל משפחה: בשרי, צמחוני או טבעוני, רמת כשרות ואלרגיות. נבנה תפריט משותף אחד — עם חלופה למי שלא אוכל את המנה העיקרית — וכמויות לפי הגילים.' : 'בשרי, צמחוני או טבעוני, רמת כשרות ואלרגיות — לפי זה נבנה תפריט עם כמויות.'}</p>
            <DietsEditor t={t} fallback={st.settings.diet} onChange={diets => set({ diets })} /></>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 rise">
          <fieldset><legend className="label">מה מעניין אתכם?</legend>
            <div className="flex flex-wrap gap-2">{INTERESTS.map(i => <Chip key={i} active={t.interests.includes(i)} onClick={() => set({ interests: t.interests.includes(i) ? t.interests.filter(x => x !== i) : [...t.interests, i] })}>{INTEREST_HE[i]}</Chip>)}</div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="diff">רמת קושי</label><select id="diff" className="field" value={t.difficulty} onChange={e => set({ difficulty: e.target.value as any })}><option value="any">כל הרמות</option><option value="easy">קל</option><option value="moderate">בינוני</option><option value="hard">מאתגר</option></select></div>
            <div><label className="label" htmlFor="drive">מרחק נסיעה מקסימלי</label><select id="drive" className="field" value={t.maxDriveKm ?? ''} onChange={e => set({ maxDriveKm: e.target.value ? Number(e.target.value) : undefined })} disabled={!st.settings.home}><option value="">ללא הגבלה</option>{[50, 100, 150, 250].map(k => <option key={k} value={k}>עד {k} ק״מ (קו אווירי)</option>)}</select>{!st.settings.home && <p className="mt-1 text-xs text-muted">הגדירו נקודת יציאה בהגדרות כדי לסנן לפי מרחק</p>}</div>
            <div><label className="label" htmlFor="budget">תקציב</label><select id="budget" className="field" value={t.budget} onChange={e => set({ budget: e.target.value as any })}><option value="any">גמיש</option><option value="low">חסכוני</option><option value="free">ללא עלות כניסה</option></select>{t.budget !== 'any' && <p className="mt-1 text-xs text-muted">מחירים אינם מאומתים — נזכיר לבדוק באתר המפעיל</p>}</div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2"><h2 className="font-display text-xl">אתרים ומסלולים {t.regionId && `ב${REGION_BY_ID[t.regionId].short}`}</h2><span className="text-sm text-muted">נבחרו {t.siteIds.length} · {flags?.known ? 'הדירוג משקלל את התחזית' : 'התחזית תשוקלל כשתהיה זמינה'}</span></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ranked.map(s => <SiteCard key={s.site.id} site={s.site} scored={s} onOpen={() => sheet.open(s.site)} selected={t.siteIds.includes(s.site.id)} onSelect={() => set({ siteIds: t.siteIds.includes(s.site.id) ? t.siteIds.filter(x => x !== s.site.id) : [...t.siteIds, s.site.id] })} />)}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rise">
          <Card className="space-y-3 p-5">
            <h2 className="font-display text-2xl">{t.name || `${t.kind === 'day' ? 'טיול יום' : 'קמפינג'} ב${t.regionId ? REGION_BY_ID[t.regionId].short : ''}`}</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[['תאריכים', `${fmtRange(t.start, t.end)} · ${days} ימים, ${nights} לילות`], ['משתתפים', `${isGroup(t) ? t.families!.map(f => `${f.name}: ${t.participants.filter(p => p.familyId === f.id).map(p => p.name).join(', ')}`).join(' · ') : t.participants.map(p => `${p.name} (${p.role === 'child' ? 'ילד/ה' : 'מבוגר/ת'}, ${p.gender === 'f' ? 'נ' : 'ז'})`).join(', ')}${t.pets ? ' + חיית מחמד' : ''}`], ['אזור', t.regionId ? REGION_BY_ID[t.regionId].name : '—'], ['לינה', t.kind === 'day' ? 'ללא' : { tent: 'אוהל פרטי', equipped_site: 'חניון מאובזר', caravan: 'קרוואן', other: 'אירוח אחר' }[t.lodging]], ['תזונה', t.noFood ? 'בלי אוכל' : t.menuMode === 'manual' ? 'תפריט שבונים בעצמנו' : Object.values(t.diets ?? {}).length ? (isGroup(t) ? t.families!.map(f => `${f.name}: ${dietLabel(t.diets?.[f.id])}`).join(' · ') : dietLabel(t.diets?.all)) : dietLabel(undefined)], ['תחומי עניין', t.interests.map(i => INTEREST_HE[i]).join(', ') || '—'], ['אתרים בתוכנית', t.siteIds.length || t.places?.length ? [...t.siteIds.map(id => SITES.find(s => s.id === id)?.name), ...(t.places ?? []).map(p => p.name)].join(', ') : 'עוד לא נבחרו']].map(([k, v]) => <div key={k}><dt className="text-sm text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
            </dl>
          </Card>
          <p className="text-muted">ניצור עכשיו: תחזית ליעד, המלצות הכנה, רשימת ציוד מהמאגר שלכם, תפריט ורשימת קניות, לוח זמנים ומשימות לפני היציאה. הכול ניתן לעריכה.</p>
          {t.pets && <p className="flex items-center gap-2 text-sm font-semibold text-warn"><Dog size={16} />נבדוק אתרים לגבי חיות מחמד — המדיניות משתנה בין אתרים.</p>}
        </div>
      )}

      <div className="no-print sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 flex gap-3 rounded-full border border-line bg-surface/95 p-2 shadow-lift backdrop-blur lg:bottom-4">
        {step > 0 && <Button variant="soft" icon={<ArrowRight size={18} />} onClick={() => setStep(s => s - 1)}>הקודם</Button>}
        <div className="flex-1" />
        {step < LAST ? <Button onClick={next}>{step === 1 && !t.regionId ? 'בחרו בשבילי' : 'המשך'}<ArrowLeft size={18} /></Button>
          : <Button variant="accent" icon={<Check size={18} />} onClick={finish}>בנו לי תוכנית</Button>}
      </div>
      {sheet.el}
    </div>
  );
}
