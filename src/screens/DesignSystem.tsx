// CampIL Outdoor Design System — a living page: tokens (before / now), measured contrast, type, components.
// Values are read from the running stylesheet, so the page always shows what the app really uses.
import { useEffect, useState } from 'react';
import { Mountain, Tent, Compass, Flame, Droplets, Check } from 'lucide-react';
import { contrast, PAIRS } from '../lib/contrast';
import { Button, Chip, Badge, Blaze, Ring } from '../components/ui';
import { Prov } from '../components/Provenance';

// the palette before the Outdoor Design System (29.10.2026), for comparison
const BEFORE: Record<string, string> = { forest: '29 58 41', moss: '52 97 64', raised: '243 236 222', ink: '28 36 30', earth: '139 107 71', info: '52 108 150', ok: '47 125 74', sunset: '168 74 24' };
const NAMES: Record<string, string> = {
  forest: 'Forest — כותרות, כפתור ראשי, ניווט', moss: 'Olive (כהה) — קישורים ופעולות משניות', raised: 'Sand — רקעי כרטיסים משניים', ink: 'Deep Charcoal — טקסט',
  earth: 'Earth — תוויות ומידע משני', info: 'River (כהה) — מידע', ok: 'הצלחה / בוצע', sunset: 'Sunset (לטקסט ולכפתורים)', 'sunset-deco': 'Sunset #D77B45 — קישוט בלבד', river: 'River #347C91 — קישוט ומפות', olive: 'Olive #657553 — קישוט',
};
const hex = (rgb: string) => '#' + rgb.trim().split(/\s+/).map(n => (+n).toString(16).padStart(2, '0')).join('').toUpperCase();
const rgbArr = (v: string) => v.trim().split(/\s+/).map(Number);

export default function DesignSystem() {
  const [vars, setVars] = useState<Record<string, string>>({});
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement); const o: Record<string, string> = {};
    for (const k of ['bg', 'surface', 'raised', 'ink', 'muted', 'line', 'forest', 'moss', 'earth', 'sunset', 'onforest', 'ok', 'warn', 'danger', 'info', 'sunset-deco', 'river', 'olive']) o[k] = cs.getPropertyValue(`--${k}`);
    setVars(o);
  }, []);
  const pairs = PAIRS.filter(([f, b]) => vars[f] && vars[b]).map(([f, b]) => ({ f, b, r: contrast(rgbArr(vars[f]), rgbArr(vars[b])) }));
  return (
    <div className="space-y-10 pb-10">
      <header className="topo relative overflow-hidden bg-forest px-4 pb-10 pt-12 text-onforest">
        <div className="mx-auto max-w-5xl space-y-2">
          <p className="flex items-center gap-2 text-sm font-bold opacity-80"><Mountain size={16} aria-hidden />CampIL Outdoor Design System</p>
          <h1 className="font-display text-4xl">שפת העיצוב של CampIL</h1>
          <p className="max-w-xl opacity-90">Premium Outdoor · Modern Exploration · Digital Field Guide — מדריך שטח דיגיטלי: יער, חול ואדמה, קווי גובה וסימוני שביל. כל צבע כאן נמדד לניגודיות.</p>
        </div>
      </header>
      <div className="gutter mx-auto max-w-5xl space-y-10">
        <section aria-labelledby="pal-h" className="space-y-3">
          <h2 id="pal-h" className="font-display text-2xl">צבעים — לפני ועכשיו</h2>
          <ul className="grid gap-3 sm:grid-cols-2">{Object.keys(NAMES).map(k => vars[k] && (
            <li key={k} className="flex items-center gap-3 rounded-xl2 border border-line bg-surface p-3">
              {BEFORE[k] && <span className="h-12 w-12 shrink-0 rounded-xl border border-line" style={{ background: `rgb(${BEFORE[k]})` }} title={`לפני ${hex(BEFORE[k])}`} />}
              <span className="h-12 w-12 shrink-0 rounded-xl border border-line" style={{ background: `rgb(${vars[k]})` }} />
              <span className="min-w-0 flex-1 text-sm"><span className="block font-bold">{NAMES[k]}</span>
                <span className="num text-muted" dir="ltr">{BEFORE[k] && BEFORE[k] !== vars[k].trim() ? `${hex(BEFORE[k])} → ` : ''}{hex(vars[k])}</span></span>
            </li>))}</ul>
        </section>

        <section aria-labelledby="con-h" className="space-y-3">
          <h2 id="con-h" className="font-display text-2xl">ניגודיות (WCAG AA ≥ 4.5:1)</h2>
          <p className="text-sm text-muted">נמדד עכשיו מהצבעים של ערכת הנושא הפעילה (בהירה/כהה). אותה בדיקה רצה גם בבדיקות האוטומטיות לשתי הערכות.</p>
          <div className="overflow-x-auto rounded-xl2 border border-line"><table className="w-full text-sm">
            <thead className="bg-raised"><tr><th className="p-2 text-right">טקסט</th><th className="p-2 text-right">רקע</th><th className="p-2 text-right">דוגמה</th><th className="p-2 text-right">יחס</th></tr></thead>
            <tbody>{pairs.map(p => (
              <tr key={p.f + p.b} className="border-t border-line"><td className="p-2">{p.f}</td><td className="p-2">{p.b}</td>
                <td className="p-2"><span className="rounded px-2 py-0.5 font-bold" style={{ color: `rgb(${vars[p.f]})`, background: `rgb(${vars[p.b]})` }}>שביל ישראל</span></td>
                <td className={'num p-2 font-bold ' + (p.r >= 4.5 ? 'text-ok' : 'text-danger')}>{p.r.toFixed(2)}{p.r >= 4.5 ? ' ✓' : ' ✗'}</td></tr>))}</tbody>
          </table></div>
        </section>

        <section aria-labelledby="ty-h" className="space-y-3">
          <h2 id="ty-h" className="font-display text-2xl">טיפוגרפיה</h2>
          <div className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
            <p className="font-display text-4xl">Suez One — כותרות כמו שלט שביל</p>
            <p className="text-lg">Assistant — גוף טקסט קריא בעברית, גם בשמש חזקה. ספרות בעמודות שוות: <span className="num">12.5 ק״מ · 340 מ׳</span></p>
            <p className="text-sm text-muted">טקסט משני — מינימום 14px; אזורי מגע לפעולות מרכזיות לפחות 44×44px.</p>
          </div>
        </section>

        <section aria-labelledby="cmp-h" className="space-y-3">
          <h2 id="cmp-h" className="font-display text-2xl">רכיבים</h2>
          <div className="space-y-4 rounded-xl2 border border-line bg-surface p-4">
            <div className="flex flex-wrap gap-2"><Button icon={<Tent size={18} />}>פעולה ראשית</Button><Button variant="accent">מתכננים טיול חדש</Button><Button variant="soft">משני</Button><Button variant="ghost">שקט</Button></div>
            <div className="flex flex-wrap gap-2"><Chip active>נבחר</Chip><Chip>לא נבחר</Chip><Badge tone="ok"><Check size={12} />בוצע</Badge><Badge tone="warn">לשים לב</Badge><Badge tone="danger">חשוב</Badge></div>
            <div className="flex flex-wrap items-center gap-3"><Blaze color="#c0392b" /><Blaze color="#2e6fbf" /><Blaze color="#2e8b57" /><span className="text-sm">סימוני שביל — צבע הסימון כמו בשטח</span></div>
            <div className="flex flex-wrap items-center gap-3"><Ring pct={72} size={64} /><span className="text-sm">מדד מוכנות — תמיד עם הרשימה שמאחוריו</span></div>
            <div className="flex flex-wrap gap-2"><Prov kind="verified" /><Prov kind="official" /><Prov kind="auto" /><Prov kind="estimate" /><Prov kind="community" /><Prov kind="unknown" /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[[Compass, 'כרטיס מדריך שטח', 'כותרת, שורה אחת, פעולה אחת'], [Flame, 'כרטיס מטבח', 'כמות לפי משתתפים'], [Droplets, 'כרטיס מים ותחזית', 'עם מקור ושעת עדכון']].map(([I, t, s]: any) => (
                <div key={t} className="topo-ink rounded-xl2 border border-line bg-raised p-4"><I size={22} className="text-moss" aria-hidden /><p className="mt-2 font-bold">{t}</p><p className="text-sm text-muted">{s}</p></div>))}
            </div>
          </div>
        </section>

        <section aria-labelledby="pr-h" className="space-y-2 text-sm">
          <h2 id="pr-h" className="font-display text-2xl">עקרונות</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>טבע כהקשר, לא כקישוט: קווי גובה עדינים ותמונת נוף אחת למסך — לא מעבר.</li>
            <li>כל צבע מסמן משהו: ירוק יער = פעולה, חול = משטח, אדמה = מידע משני, שקיעה = פעולה בולטת אחת, נהר = מידע.</li>
            <li>מקור וודאות לכל נתון (תוויות מקור); המלצה מציגה "למה" ופעולה אחת.</li>
            <li>מצב שטח: כפתורים גדולים, מעט טקסט, מצב חיבור תמיד גלוי.</li>
            <li>עברית מימין לשמאל מלאה, מצב כהה ובהיר, תנועה מופחתת לפי הגדרות המכשיר.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
