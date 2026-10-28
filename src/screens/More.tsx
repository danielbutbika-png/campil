import { useRef, useState } from 'react';
import { Tent, BookOpen, Images, Settings as Cog, Info, ChevronLeft, LocateFixed, Download, Upload, RotateCcw, Plus, Trash2, ExternalLink, Smartphone, ChefHat } from 'lucide-react';
import { useStore, pickData } from '../lib/store';
import { VehiclePicker, AiKeyField } from '../components/VehiclePicker';
import { FuelBrandChips } from '../components/RouteFuel';
import { GUIDES, FIRESTORE_RULES } from '../data/guides';
import { CloudSettings } from '../components/Collab';
import { useGeolocation } from '../lib/hooks';
import { download } from '../lib/share';
import { blobToDataURL, dataURLToBlob, getPhoto, putPhoto } from '../lib/photos';
import { fmtDate, uid } from '../lib/util';
import { Photo } from './trip/JournalTab';
import { Button, Card, Segmented, Sheet, Toggle, Blaze, Empty, Badge, toast } from '../components/ui';
import { href } from '../lib/router';
import type { Member } from '../lib/types';
import { wipeDevice } from '../lib/privacy';

export default function More() {
  const items = [
    { to: '/camps', I: Tent, t: 'חיפוש מקום לקמפינג', s: 'חניונים לפי מקום, אזור או מיקום — עם ניווט' },
    { to: '/cook', I: ChefHat, t: 'מה אפשר להכין ממה שיש?', s: 'מתכונים לפי המצרכים והכלים שיש לכם' },
    { to: '/academy', I: BookOpen, t: 'האקדמיה לשטח', s: 'קשרים וחבלים, בטיחות, אוהלים ומיומנויות — עם בדיקת ידע' },
    { to: '/albums', I: Images, t: 'אלבומי טיולים', s: 'כל התמונות והסיפורים' },
    { to: '/settings', I: Cog, t: 'הגדרות', s: 'משפחה, נקודת יציאה, תזונה, גיבוי' },
    { to: '/about', I: Info, t: 'מקורות מידע ואודות', s: 'מאיפה הנתונים ומה לא מאומת' },
  ];
  return (
    <div className="gutter mx-auto max-w-3xl space-y-4 py-6">
      <h1 className="font-display text-3xl">עוד</h1>
      {items.map(i => <a key={i.to} href={href(i.to)} className="flex items-center gap-4 rounded-xl2 border border-line bg-surface p-4 hover:border-moss"><i.I className="text-moss" /><span className="flex-1"><span className="block font-bold">{i.t}</span><span className="text-sm text-muted">{i.s}</span></span><ChevronLeft className="text-muted" /></a>)}
    </div>
  );
}

const TONE = { safety: ['בטיחות', '#c0392b'], family: ['משפחה', '#3c6e9f'], skills: ['מיומנויות', '#2f6b3f'] } as const;
export function Guides() {
  return (
    <div className="gutter mx-auto max-w-4xl space-y-5 py-6">
      <h1 className="font-display text-3xl">מדריכים וטיפים</h1>
      <div className="grid gap-3 md:grid-cols-2">{GUIDES.map(g => (
        <a key={g.id} href={href(`/guide/${g.id}`)} className="flex flex-col gap-2 rounded-xl2 border border-line bg-surface p-5 hover:border-moss">
          <span className="flex items-center gap-2 text-xs font-bold text-muted"><Blaze color={TONE[g.tone][1]} />{TONE[g.tone][0]} · {g.minutes} דק׳</span>
          <span className="font-display text-lg">{g.title}</span><span className="text-muted">{g.blurb}</span>
        </a>))}</div>
    </div>
  );
}
export function GuideView({ id }: { id: string }) {
  const g = GUIDES.find(x => x.id === id);
  if (!g) return <div className="p-8">המדריך לא נמצא</div>;
  return (
    <article className="gutter mx-auto max-w-2xl space-y-5 py-6">
      <a href={href('/academy')} className="text-sm font-bold text-moss">← האקדמיה לשטח</a>
      <p className="flex items-center gap-2 text-sm font-bold text-muted"><Blaze color={TONE[g.tone][1]} />{TONE[g.tone][0]}</p>
      <h1 className="font-display text-3xl">{g.title}</h1>
      <p className="text-lg text-muted">{g.blurb}</p>
      {g.body.map((b, i) => <div key={i} className="space-y-2">{b.h && <h2 className="font-display text-xl">{b.h}</h2>}{b.p && <p className="leading-relaxed">{b.p}</p>}{b.list && <ul className="space-y-1.5">{b.list.map(l => <li key={l} className="flex gap-2"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />{l}</li>)}</ul>}{b.code && <CodeBlock text={b.code === '__RULES__' ? FIRESTORE_RULES : b.code} />}</div>)}
      {g.links && <div className="flex flex-wrap gap-2 pt-2">{g.links.map(l => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-raised px-4 py-2 text-sm font-bold"><ExternalLink size={14} />{l.label}</a>)}</div>}
      <p className="text-xs text-muted">המידע כללי ואינו מחליף הנחיות רשמיות של הגורמים המוסמכים.</p>
    </article>
  );
}

export function Albums() {
  const { journal, trips, album } = useStore();
  const withPhotos = trips.map(t => ({ t, photos: [...album.filter(a => a.tripId === t.id).sort((a, b) => Number(!!b.collage) - Number(!!a.collage) || a.takenAt - b.takenAt).map(a => ({ p: a.id, j: { title: a.caption ?? '' } })), ...journal.filter(j => j.tripId === t.id).flatMap(j => j.photoIds.map(p => ({ p, j })))], entries: journal.filter(j => j.tripId === t.id).length + album.filter(a => a.tripId === t.id).length })).filter(x => x.entries);
  return (
    <div className="gutter mx-auto max-w-6xl space-y-6 py-6">
      <h1 className="font-display text-3xl">אלבומי טיולים</h1>
      {!withPhotos.length && <Empty icon={<Images size={36} />} title="עוד אין אלבומים" body="הוסיפו תמונות לאלבום של כל טיול, והן יופיעו כאן." />}
      {withPhotos.map(({ t, photos }) => (
        <section key={t.id} className="space-y-3">
          <div className="flex items-end justify-between"><h2 className="font-display text-xl">{t.name}</h2><a href={href(`/trip/${t.id}/album`)} className="text-sm font-bold text-moss">לאלבום המשותף</a></div>
          {photos.length ? <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">{photos.map(({ p, j }) => <a key={p} href={href(`/trip/${t.id}/album`)} title={j.title}><Photo id={p} alt={j.title} className="aspect-square w-full rounded-lg object-cover" /></a>)}</div> : <p className="text-sm text-muted">רשומות טקסט בלבד</p>}
        </section>
      ))}
    </div>
  );
}

const CITIES: [string, number, number][] = [['ירושלים', 31.778, 35.235], ['תל אביב-יפו', 32.08, 34.78], ['חיפה', 32.794, 34.99], ['באר שבע', 31.252, 34.791], ['ראשון לציון', 31.964, 34.804], ['פתח תקווה', 32.087, 34.887], ['אשדוד', 31.804, 34.655], ['נתניה', 32.329, 34.857], ['חולון', 32.011, 34.772], ['רחובות', 31.894, 34.811], ['מודיעין', 31.898, 35.01], ['כפר סבא', 32.175, 34.907], ['רעננה', 32.184, 34.871], ['הרצליה', 32.166, 34.843], ['חדרה', 32.434, 34.919], ['עפולה', 32.607, 35.289], ['נצרת', 32.699, 35.303], ['כרמיאל', 32.919, 35.296], ['טבריה', 32.794, 35.531], ['קריית שמונה', 33.207, 35.571], ['צפת', 32.965, 35.496], ['אשקלון', 31.669, 34.571], ['קריית גת', 31.61, 34.764], ['דימונה', 31.07, 35.033], ['אילת', 29.557, 34.952]];

export function Settings() {
  const st = useStore();
  const { settings: s, setSettings, members } = st;
  const geo = useGeolocation();
  const [m, setM] = useState<Member | null>(null);
  const [reset, setReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const exportAll = async () => {
    const photos: Record<string, string> = {};
    const ids = [...st.journal.flatMap(j => j.photoIds), ...st.inventory.map(g => g.photoId).filter(Boolean) as string[]];
    for (const id of ids) { const b = await getPhoto(id).catch(() => undefined); if (b) photos[id] = await blobToDataURL(b); }
    download(`campil-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: 'CampIL', exportedAt: new Date().toISOString(), data: { ...pickData(st), settings: { ...st.settings, aiKey: undefined } }, photos }));
    toast('קובץ הגיבוי נשמר');
  };
  const importAll = async (f?: File) => {
    if (!f) return;
    try { const j = JSON.parse(await f.text()); if (j.app !== 'CampIL' || !j.data) throw 0; for (const [id, u] of Object.entries<string>(j.photos ?? {})) await putPhoto(id, await dataURLToBlob(u)); st.importAll({ ...j.data, settings: { ...j.data.settings, aiKey: st.settings.aiKey } }); toast('הנתונים שוחזרו מהגיבוי'); }
    catch { toast('הקובץ אינו גיבוי תקין של CampIL'); }
  };
  return (
    <div className="gutter mx-auto max-w-3xl space-y-8 py-6">
      <h1 className="font-display text-3xl">הגדרות</h1>
      <section className="space-y-3"><h2 className="font-display text-xl">המשפחה</h2>
        <ul className="grid gap-2 sm:grid-cols-2">{members.map(x => <li key={x.id}><button onClick={() => setM(x)} className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-right hover:border-moss"><span className="font-bold">{x.name}</span><span className="text-sm text-muted">{x.role === 'adult' ? 'מבוגר' : 'ילד'}{x.age != null ? ` · ${x.age}` : ''}</span></button></li>)}</ul>
        <Button size="sm" variant="soft" icon={<Plus size={16} />} onClick={() => setM({ id: uid('m'), name: '', role: 'child' })}>בן/בת משפחה</Button>
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">נקודת יציאה</h2>
        <p className="text-sm text-muted">משמשת לחישוב מרחק (קו אווירי) ולתחזית במסך הבית. נשמרת רק במכשיר.</p>
        <div className="flex flex-wrap gap-2">
          <select aria-label="עיר" className="field w-auto flex-1" value={s.home?.label ?? ''} onChange={e => { const c = CITIES.find(x => x[0] === e.target.value); setSettings({ home: c ? { label: c[0], lat: c[1], lon: c[2] } : undefined }); }}>
            <option value="">בחרו עיר</option>{s.home && !CITIES.some(c => c[0] === s.home!.label) && <option value={s.home.label}>{s.home.label}</option>}{CITIES.map(c => <option key={c[0]} value={c[0]}>{c[0]}</option>)}
          </select>
          <Button variant="soft" icon={<LocateFixed size={16} />} disabled={geo.loading} onClick={async () => { const p = await geo.request(); if (p) { setSettings({ home: { ...p, label: 'המיקום שלי' } }); toast('נקודת היציאה עודכנה'); } }}>{geo.loading ? 'מאתר…' : 'המיקום שלי'}</Button>
        </div>
        {geo.error && <p className="text-sm text-danger">{geo.error}</p>}
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">הרכב שאיתו נוסעים</h2>
        <p className="text-sm text-muted">בחרו דגם — האפליקציה תמצא את נפח תא המטען ותבנה המלצות אריזה והעמסה בלשונית ציוד ← העמסה לרכב.</p>
        <VehiclePicker />
        <a href={href('/gear/car')} className="inline-flex items-center gap-1 text-sm font-bold text-moss">להמלצות האריזה וההעמסה<ChevronLeft size={16} /></a>
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">תדלוק</h2>
        <p className="text-sm text-muted">אילו חברות דלק להציג במפה ובמסלול לטיול. בלי בחירה — כל התחנות.</p>
        <FuelBrandChips value={s.fuelBrands ?? []} onChange={v => setSettings({ fuelBrands: v })} />
        <div className="max-w-xs"><label className="label" htmlFor="fb">מרחק מקסימלי מהדרך</label><select id="fb" className="field" value={s.fuelBufferKm ?? 2} onChange={e => setSettings({ fuelBufferKm: +e.target.value })}>{[1, 2, 3, 5].map(k => <option key={k} value={k}>עד {k} ק״מ</option>)}</select></div>
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">מים</h2>
        <div className="max-w-xs"><label className="label" htmlFor="sw">מים לשתייה: ליטר לאדם ליום</label><input id="sw" type="number" min={0} step={0.5} className="field" value={s.waterLitersPerPersonDay ?? ''} onChange={e => setSettings({ waterLitersPerPersonDay: e.target.value ? +e.target.value : undefined })} placeholder="לא הוגדר" /></div>
        <p className="text-xs text-muted">אין כלל אחיד לצריכת מים — הוא תלוי בחום, במאמץ ובגיל. הכמות שתגדירו תשמש לחישוב ברשימת הציוד.</p>
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">תזונה</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Toggle checked={s.diet.kosher} onChange={v => setSettings({ diet: { ...s.diet, kosher: v } })} label="כשרות" />
          <Toggle checked={s.diet.vegetarian} onChange={v => setSettings({ diet: { ...s.diet, vegetarian: v } })} label="צמחוני" />
          <Toggle checked={s.diet.vegan} onChange={v => setSettings({ diet: { ...s.diet, vegan: v } })} label="טבעוני" />
        </div>
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">תצוגה</h2>
        <Segmented label="ערכת צבעים" value={s.theme} onChange={v => setSettings({ theme: v })} options={[{ v: 'system', label: 'לפי המכשיר' }, { v: 'light', label: 'בהיר' }, { v: 'dark', label: 'כהה' }]} />
      </section>
      <section id="cloud" className="space-y-3"><h2 className="font-display text-xl">שיתוף בזמן אמת</h2><CloudSettings /></section>
      <section className="space-y-3"><h2 className="font-display text-xl">חיפוש ברשת</h2><AiKeyField /></section>
      <section className="space-y-3"><h2 className="font-display text-xl">גיבוי וסנכרון</h2>
        <Card className="space-y-3 p-4">
          <p className="text-sm">הנתונים נשמרים במכשיר הזה (מצב אורח). כדי להעביר למכשיר אחר או לשמור גיבוי — ייצאו קובץ ושחזרו אותו במכשיר השני. הקובץ כולל את התמונות.</p>
          <div className="flex flex-wrap gap-2"><Button variant="soft" icon={<Download size={16} />} onClick={exportAll}>ייצוא גיבוי</Button><Button variant="soft" icon={<Upload size={16} />} onClick={() => file.current?.click()}>שחזור מגיבוי</Button><input ref={file} type="file" accept="application/json,.json" className="sr-only" onChange={e => importAll(e.target.files?.[0])} /></div>
        </Card>
        <Button variant="danger" icon={<RotateCcw size={16} />} onClick={() => setReset(true)}>איפוס או מחיקת הנתונים</Button>
      </section>
      <section className="space-y-2"><h2 className="flex items-center gap-2 font-display text-xl"><Smartphone size={20} />התקנה כאפליקציה</h2>
        <p className="text-sm text-muted">באייפון: Safari ← שיתוף ← "הוספה למסך הבית". באנדרואיד: Chrome ← תפריט ← "התקנת אפליקציה". לאחר ההתקנה CampIL נפתחת במסך מלא ועובדת גם בלי קליטה.</p>
      </section>
      {m && <MemberSheet m={m} onClose={() => setM(null)} />}
      <Sheet open={reset} onClose={() => setReset(false)} title="לאפס את כל הנתונים?" footer={<><Button variant="danger" onClick={() => { st.resetAll(); setReset(false); toast('האפליקציה אופסה'); }}>איפוס</Button><Button variant="danger" onClick={async () => { await wipeDevice(); location.replace(location.pathname); }}>מחיקה מלאה מהמכשיר</Button><Button variant="ghost" onClick={() => setReset(false)}>ביטול</Button></>}>
        <p><b>איפוס:</b> כל הטיולים, היומן והשינויים במאגר הציוד יימחקו, והמאגר יחזור לקובץ הציוד המקורי.</p>
        <p className="mt-2"><b>מחיקה מלאה מהמכשיר:</b> בנוסף — כל התמונות, המפות שנשמרו לשטח, ההתחברות לשיתוף וההגדרות.</p>
        <p className="mt-2 text-sm text-muted">טיולים משותפים נשמרים גם אצל השותפים ובשרת השיתוף. כדי להסיר אתכם מהם — "יציאה מהטיול" בחלון השיתוף לפני המחיקה (המארגן יכול למחוק את הטיול כולו). מומלץ לייצא גיבוי קודם.</p>
      </Sheet>
    </div>
  );
}

function MemberSheet({ m, onClose }: { m: Member; onClose: () => void }) {
  const { upsertMember, removeMember, members } = useStore();
  const [d, setD] = useState(m); const exists = members.some(x => x.id === m.id);
  return (
    <Sheet open onClose={onClose} title={exists ? 'עריכת בן/בת משפחה' : 'הוספה למשפחה'} footer={<><Button onClick={() => { if (!d.name.trim()) return toast('כתבו שם'); upsertMember({ ...d, name: d.name.trim() }); onClose(); }}>שמירה</Button>{exists && <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => { removeMember(m.id); onClose(); }}>הסרה</Button>}</>}>
      <div className="space-y-3">
        <div><label className="label" htmlFor="mn">שם</label><input id="mn" className="field" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} /></div>
        <Segmented label="תפקיד" value={d.role} onChange={v => setD({ ...d, role: v })} options={[{ v: 'adult', label: 'מבוגר' }, { v: 'child', label: 'ילד/ה' }]} />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="ma">גיל (לא חובה)</label><input id="ma" type="number" min={0} max={120} className="field" value={d.age ?? ''} onChange={e => setD({ ...d, age: e.target.value ? +e.target.value : undefined })} /></div>
          <div><label className="label" htmlFor="mg">מגדר (לא חובה)</label><select id="mg" className="field" value={d.gender ?? ''} onChange={e => setD({ ...d, gender: (e.target.value || undefined) as any })}><option value="">—</option><option value="f">נקבה</option><option value="m">זכר</option></select></div>
        </div>
        <p className="text-xs text-muted">ביגוד אישי נבנה לכל בן משפחה מתבנית הביגוד שבקובץ הציוד.</p>
      </div>
    </Sheet>
  );
}

export function About() {
  const rows: [string, string, string][] = [
    ['תחזית מזג אוויר', 'Open-Meteo Forecast API — עד 16 ימים, ללא מפתח', 'https://open-meteo.com'],
    ['נתוני עבר לתאריכים רחוקים', 'Open-Meteo Historical (ERA5) — מסומן תמיד "לא תחזית"', 'https://open-meteo.com/en/docs/historical-weather-api'],
    ['גבולות ואזורים', 'Natural Earth 1:10m (נחלת הכלל), מחולק לאזורי טיול', 'https://www.naturalearthdata.com'],
    ['מפת רקע', 'OpenFreeMap · © תורמי OpenStreetMap', 'https://openfreemap.org'],
    ['חניונים חיים', 'OpenStreetMap דרך Overpass API (ODbL)', 'https://www.openstreetmap.org/copyright'],
    ['קטלוג אתרים', 'קטלוג התחלתי של CampIL — מיקום ואופי כללי; פרטים יש לאמת אצל רשות הטבע והגנים / קק״ל', 'https://www.parks.org.il'],
    ['נפח תא מטען', 'מאגר דגמים עם קישור למקור לכל ערך (נבדק 22.10.2026); דגם אחר — חיפוש ברשת דרך Claude API או הזנה ידנית', ''],
    ['מסלול נסיעה', 'OSRM (Project OSRM, נתוני OpenStreetMap)', 'https://project-osrm.org'],
    ['תחנות דלק', 'OpenStreetMap — amenity=fuel, זיהוי חברה לפי תגיות brand/operator/name', 'https://www.openstreetmap.org/copyright'],
    ['ציוד משפחתי', 'יובא מקובץ "מערכת אחסון וצ׳ק ליסט — קמפינג משפחתי"', ''],
  ];
  return (
    <div className="gutter mx-auto max-w-3xl space-y-6 py-6">
      <h1 className="font-display text-3xl">מקורות מידע ואודות</h1>
      <ul className="space-y-2">{rows.map(([k, v, u]) => <li key={k} className="rounded-xl border border-line bg-surface p-3"><p className="font-bold">{k}</p><p className="text-sm text-muted">{v}</p>{u && <a className="text-sm font-bold text-moss" href={u} target="_blank" rel="noreferrer">{u.replace('https://', '')}</a>}</li>)}</ul>
      <Card className="space-y-2 p-4"><h2 className="font-bold">מה CampIL לא עושה</h2>
        <ul className="list-inside list-disc space-y-1 text-sm"><li>לא ממציאה תחזית, מחירים, דירוגים, שעות פתיחה או מתקנים.</li><li>לא מציגה אתר כבטוח או פתוח — יש לבדוק מול המפעיל והתרעות רשמיות.</li><li>מדד המוכנות אינו אישור בטיחות.</li><li>חישובי נפח לרכב הם הערכה בלבד.</li></ul>
      </Card>
      <Card className="space-y-2 p-4"><h2 className="font-bold">פרטיות</h2><p className="text-sm">כל הנתונים, כולל תמונות, נשמרים במכשיר בלבד. האפליקציה פונה לשירותים חיצוניים רק עם קואורדינטות (מזג אוויר, מפה, חניונים).</p></Card>
      <Badge>גרסה 1.0 · {fmtDate(new Date().toISOString().slice(0, 10))}</Badge>
    </div>
  );
}

function CodeBlock({ text }: { text: string }) {
  return (
    <div className="relative">
      <pre dir="ltr" className="overflow-x-auto rounded-xl bg-ink p-4 text-left text-xs leading-relaxed text-bg"><code>{text}</code></pre>
      <button className="absolute right-2 top-2 rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink" onClick={async () => { try { await navigator.clipboard.writeText(text); toast('הועתק'); } catch { toast('סמנו והעתיקו ידנית'); } }}>העתקה</button>
    </div>
  );
}
