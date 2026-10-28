// CampIL Academy — the field-skills library (knots + guides): search by need, categories, favourites, progress.
import { useMemo, useState } from 'react';
import { Search, Star, CheckCircle2, GraduationCap, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import { LESSONS, searchLessons, type Lesson } from '../data/academy';
import { KNOT_BY_ID, KNOT_SAFETY, KNOTS } from '../data/academy/knots';
import { KNOT_ART } from '../data/academy/knotArt';
import { CATEGORY_HE, LEVEL_HE, type AcademyCategory, type Knot } from '../data/academy/types';
import { KnotViewer } from '../components/KnotViewer';
import { Badge, Button, Chip, cx, toast } from '../components/ui';
import { href } from '../lib/router';

function useAcademy() {
  const a = useStore(s => s.academy) ?? { fav: [], learned: [], quiz: {} };
  const setAcademy = useStore(s => s.setAcademy);
  const toggle = (k: 'fav' | 'learned', id: string) => setAcademy(x => ({ ...x, [k]: x[k].includes(id) ? x[k].filter(y => y !== id) : [...x[k], id] }));
  return { a, toggle, setAcademy };
}

function LessonCard({ l }: { l: Lesson }) {
  const { a, toggle } = useAcademy();
  const fav = a.fav.includes(l.id), learned = a.learned.includes(l.id);
  return (
    <li className="relative">
      <a href={href(l.to)} className="flex h-full flex-col gap-1.5 rounded-xl2 border border-line bg-surface p-4 pe-12 hover:border-moss">
        <span className="flex flex-wrap items-center gap-1.5 text-xs"><Badge>{CATEGORY_HE[l.category]}</Badge><Badge tone={l.level === 1 ? 'ok' : 'info'}>{LEVEL_HE[l.level]}</Badge><span className="text-muted">{l.minutes} דק׳</span>{learned && <span className="flex items-center gap-1 font-bold text-ok"><CheckCircle2 size={13} />נלמד</span>}</span>
        <span className="font-bold">{l.title}</span><span className="text-sm text-muted">{l.sub}</span>
      </a>
      <button type="button" aria-pressed={fav} aria-label={fav ? `הסרת ${l.title} מהמועדפים` : `הוספת ${l.title} למועדפים`} onClick={() => toggle('fav', l.id)} className="absolute end-2 top-2 grid h-10 w-10 place-items-center rounded-full hover:bg-raised"><Star size={18} className={fav ? 'fill-sunset text-sunset' : 'text-muted'} /></button>
    </li>
  );
}

export default function Academy() {
  const { a } = useAcademy();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<AcademyCategory | 'all' | 'fav'>('all');
  const found = useMemo(() => (q.trim() ? searchLessons(q) : null), [q]);
  const list = found ?? LESSONS.filter(l => cat === 'all' || (cat === 'fav' ? a.fav.includes(l.id) : l.category === cat));
  const cats = [...new Set(LESSONS.map(l => l.category))];
  const learned = LESSONS.filter(l => a.learned.includes(l.id)).length;
  return (
    <div className="gutter mx-auto max-w-5xl space-y-6 py-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 font-display text-3xl"><GraduationCap size={30} className="text-moss" />האקדמיה לשטח</h1>
        <p className="text-muted">מיומנויות לטיול ולקמפינג — עם איורים, שלבים ובדיקת ידע. הכול זמין גם בלי קליטה.</p>
        <div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-line" role="meter" aria-valuemin={0} aria-valuemax={LESSONS.length} aria-valuenow={learned} aria-label="התקדמות"><div className="h-full bg-moss" style={{ width: `${(learned / LESSONS.length) * 100}%` }} /></div><span className="num text-sm font-bold">{learned}/{LESSONS.length} נלמדו</span></div>
      </header>
      <div className="relative"><Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        <input aria-label="מה צריך לעשות?" className="field pr-10" placeholder="מה צריך לעשות? למשל: למתוח חבל לאוהל" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {!found && <div className="flex flex-wrap gap-2" role="group" aria-label="קטגוריות">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>הכול</Chip>
        {cats.map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{CATEGORY_HE[c]}</Chip>)}
        <Chip active={cat === 'fav'} onClick={() => setCat('fav')}><Star size={14} />מועדפים</Chip>
      </div>}
      {found && <p className="text-sm text-muted" aria-live="polite">{found.length ? `${found.length} תוצאות ל"${q}"` : `לא מצאנו מדריך ל"${q}". נסו מילים אחרות — למשל "חבל", "אוהל", "חום".`}</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map(l => <LessonCard key={l.id} l={l} />)}</ul>
      {!found && cat === 'fav' && !list.length && <p className="text-muted">עוד אין מועדפים — סמנו ★ על מדריך.</p>}
    </div>
  );
}

function Quiz({ k }: { k: Knot }) {
  const { a, setAcademy } = useAcademy();
  const [ans, setAns] = useState<Record<number, number>>({});
  const done = Object.keys(ans).length === k.quiz.length;
  const score = k.quiz.filter((q, i) => ans[i] === q.correct).length;
  const finish = () => { setAcademy(x => ({ ...x, quiz: { ...x.quiz, [k.id]: Math.max(score, x.quiz[k.id] ?? 0) }, learned: score === k.quiz.length && !x.learned.includes(k.id) ? [...x.learned, k.id] : x.learned })); toast(score === k.quiz.length ? 'כל הכבוד — סומן כנלמד' : `${score} מתוך ${k.quiz.length} — נסו שוב`); };
  return (
    <section aria-labelledby="qz-h" className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <h2 id="qz-h" className="font-bold">בדיקת ידע{a.quiz[k.id] != null && <span className="num text-sm font-normal text-muted"> · הציון הטוב שלכם: {a.quiz[k.id]}/{k.quiz.length}</span>}</h2>
      {k.quiz.map((q, i) => (
        <fieldset key={i} className="space-y-1.5"><legend className="font-semibold">{i + 1}. {q.q}</legend>
          <div className="grid gap-1.5">{q.options.map((o, j) => {
            const picked = ans[i] === j, show = ans[i] != null;
            return <button key={j} type="button" disabled={show} onClick={() => setAns({ ...ans, [i]: j })} aria-pressed={picked}
              className={cx('rounded-xl border px-3 py-2 text-right text-sm', show && j === q.correct ? 'border-ok bg-ok/10 font-bold' : picked ? 'border-danger bg-danger/10' : 'border-line')}>{o}</button>;
          })}</div>
          {ans[i] != null && <p className={cx('text-sm', ans[i] === q.correct ? 'text-ok' : 'text-danger')} aria-live="polite">{ans[i] === q.correct ? 'נכון. ' : 'לא בדיוק. '}{q.why}</p>}
        </fieldset>))}
      <div className="flex gap-2">{done && <Button size="sm" onClick={finish}>סיום ({score}/{k.quiz.length})</Button>}{Object.keys(ans).length > 0 && <Button size="sm" variant="ghost" onClick={() => setAns({})}>מחדש</Button>}</div>
    </section>
  );
}

export function KnotPage({ id }: { id: string }) {
  const k = KNOT_BY_ID[id];
  const { a, toggle } = useAcademy();
  if (!k) return <div className="gutter py-16 text-center"><p className="font-display text-2xl">המדריך לא נמצא</p><a className="font-bold text-moss" href={href('/academy')}>לאקדמיה</a></div>;
  const fav = a.fav.includes(k.id), learned = a.learned.includes(k.id);
  return (
    <article className="gutter mx-auto max-w-3xl space-y-5 py-6">
      <a href={href('/academy')} className="inline-flex items-center gap-1 text-sm font-bold text-moss"><ChevronLeft size={16} className="rotate-180" />האקדמיה לשטח</a>
      <header className="space-y-2">
        <div className="flex flex-wrap gap-1.5"><Badge>{CATEGORY_HE.knots}</Badge><Badge tone={k.level === 1 ? 'ok' : 'info'}>רמה: {LEVEL_HE[k.level]}</Badge><Badge>{k.materials}</Badge></div>
        <h1 className="font-display text-3xl">{k.he}</h1>
        <p className="text-muted" dir="auto">{k.en}{k.heSource === 'descriptive' ? ' · השם העברי הוא תיאור שלנו' : k.heSource === 'official' ? ' · השם העברי כפי שמופיע במדריכי משרד החינוך' : ''}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="soft" icon={<Star size={16} className={fav ? 'fill-sunset text-sunset' : ''} />} aria-pressed={fav} onClick={() => toggle('fav', k.id)}>{fav ? 'במועדפים' : 'למועדפים'}</Button>
          <Button size="sm" variant={learned ? 'primary' : 'soft'} icon={<CheckCircle2 size={16} />} aria-pressed={learned} onClick={() => toggle('learned', k.id)}>{learned ? 'נלמד' : 'סימון כנלמד'}</Button>
        </div>
      </header>
      <p className="flex items-start gap-2 rounded-xl2 border border-warn/40 bg-warn/8 p-3 text-sm font-semibold" role="note"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-warn" />{KNOT_SAFETY}</p>
      <p>{k.purpose}</p>
      <KnotViewer knot={k} art={KNOT_ART[k.id]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl2 border border-line bg-surface p-4"><h2 className="font-bold text-ok">מתאים ל־</h2><ul className="mt-1 list-inside list-disc text-sm">{k.uses.map(u => <li key={u}>{u}</li>)}</ul></section>
        <section className="rounded-xl2 border border-line bg-surface p-4"><h2 className="font-bold text-danger">לא מתאים ל־</h2><ul className="mt-1 list-inside list-disc text-sm">{k.notFor.map(u => <li key={u}>{u}</li>)}</ul></section>
      </div>
      <section className="rounded-xl2 border border-line bg-surface p-4"><h2 className="font-bold">טעויות נפוצות</h2><ul className="mt-1 list-inside list-disc text-sm">{k.mistakes.map(m => <li key={m}>{m}</li>)}</ul></section>
      <Quiz k={k} />
      <section className="space-y-2"><h2 className="font-bold">קשרים נוספים</h2>
        <div className="flex flex-wrap gap-2">{KNOTS.filter(x => x.id !== k.id).map(x => <a key={x.id} href={href(`/academy/knot/${x.id}`)} className="rounded-full bg-raised px-3 py-1.5 text-sm font-bold hover:bg-sand">{x.he}</a>)}</div>
      </section>
    </article>
  );
}
