// Visual trunk loading by dimensions: the family measures the trunk once; boxes and big items with entered
// dimensions are placed in 3D; the plan is drawn from above and from the side, with the rear-window line.
import { useMemo, useState } from 'react';
import { Ruler, AlertTriangle } from 'lucide-react';
import type { Box, GearItem, Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { packTrunk, UNPLACED_HE, type PackInput, type Placed, type Trunk } from '../engine/pack3d';
import { todayISO, fmtDate } from '../lib/util';
import { Button, cx } from './ui';
import { href } from '../lib/router';

const has = (s: string, ...w: string[]) => w.some(x => s.includes(x));
const COLORS = ['#2f6b3f', '#3c6e9f', '#a0522d', '#7a6a9e', '#2c8c99', '#8a6d3b', '#c0392b', '#5d7a3a'];

export function trunkInputs(boxes: Box[], inventory: GearItem[], trip?: Trip | null): PackInput[] {
  const packing = trip?.packing.filter(p => !p.removed) ?? [];
  const going = (g: GearItem) => (trip ? packing.some(p => p.inventoryId === g.id) : g.available !== false);
  const usedBoxes = boxes.filter(b => !trip || packing.some(p => p.boxId === b.id));
  return [
    ...usedBoxes.map(b => ({ id: b.id, name: b.name, dims: b.dims ?? null, weightKg: b.weightKg, soft: b.kind === 'bag' })),
    ...inventory.filter(g => !g.boxId && g.big && going(g)).map(g => ({ id: g.id, name: g.name, dims: g.dims ?? null, qty: g.qty, weightKg: g.weightKg, soft: has(g.name, 'מזרן', 'שק', 'מחצלת'), needOnWay: has(g.name, 'צידנית', 'מים', 'קרחומים') })),
  ];
}

const zoneOf = (p: Placed, t: Trunk) => `${p.z === 0 ? 'רצפה' : `קומה ${p.z < t.height / 2 ? 2 : 3}`}, ${p.x + p.d / 2 < t.depth / 3 ? 'צמוד למושב' : p.x + p.d / 2 > (2 * t.depth) / 3 ? 'ליד הדלת' : 'באמצע'}`;

function MeasureForm({ cur, onSave }: { cur?: Trunk; onSave: (t: Trunk) => void }) {
  const [v, setV] = useState({ depth: cur?.depth ?? 0, width: cur?.width ?? 0, height: cur?.height ?? 0 });
  const f = (k: keyof Trunk, label: string, hint: string) => (
    <div><label className="label" htmlFor={`tr-${k}`}>{label} (ס״מ)</label><input id={`tr-${k}`} type="number" inputMode="numeric" min={20} max={300} className="field" value={v[k] || ''} onChange={e => setV({ ...v, [k]: Math.max(0, +e.target.value) })} /><p className="mt-1 text-xs text-muted">{hint}</p></div>
  );
  const ok = v.depth >= 20 && v.width >= 20 && v.height >= 15;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {f('depth', 'עומק', 'מגב המושב האחורי עד הדלת, בגובה הרצפה')}
        {f('width', 'רוחב', 'במקום הצר ביותר — בין בתי הגלגלים')}
        {f('height', 'גובה עד החלון', 'מהרצפה עד תחתית החלון האחורי (או כיסוי תא המטען)')}
      </div>
      <Button disabled={!ok} onClick={() => onSave(v)}>שמירת המידות</Button>
    </div>
  );
}

export function TrunkPlan({ trip }: { trip?: Trip | null }) {
  const { boxes, inventory, settings, setSettings } = useStore();
  const trunk = settings.trunkDims;
  const [editing, setEditing] = useState(!trunk);
  const items = useMemo(() => trunkInputs(boxes, inventory, trip), [boxes, inventory, trip]);
  const r = useMemo(() => (trunk ? packTrunk(trunk, items) : null), [trunk, items]);
  const fs = trunk ? Math.max(5, Math.round(Math.max(trunk.depth, trunk.width) / 16)) : 7;
  const color = (p: Placed) => COLORS[items.findIndex(i => i.id === p.id) % COLORS.length];
  const save = (t: Trunk) => { setSettings({ trunkDims: { ...t, measuredAt: todayISO() } }); setEditing(false); };

  return (
    <section aria-labelledby="tp-h" className="space-y-4 rounded-xl2 border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tp-h" className="flex items-center gap-2 font-display text-xl"><Ruler size={20} className="text-moss" />העמסה לפי מידות</h2>
        {trunk && !editing && <button type="button" className="text-sm font-bold text-moss" onClick={() => setEditing(true)}>תא מטען {trunk.depth}×{trunk.width}×{trunk.height} ס״מ · נמדד {fmtDate(trunk.measuredAt)} · עריכה</button>}
      </div>
      {editing || !trunk ? <>
        <p className="text-sm">אין מאגר ציבורי של מידות פנים לתא מטען, ולכן מודדים פעם אחת עם מטר. הגובה הוא עד תחתית החלון האחורי — מעליו הציוד חוסם את שדה הראייה ועלול לעוף קדימה בבלימה.</p>
        <MeasureForm cur={trunk} onSave={save} />
      </> : r && <>
        <p className="num text-sm">{r.placed.length} פריטים נכנסו · ניצול {r.usedPct}% מהנפח מתחת לקו החלון{r.unplaced.length ? <> · <b className="text-danger">{r.unplaced.length} לא נכנסו</b></> : ''}{r.unknown.length ? ` · ${r.unknown.length} בלי מידות` : ''}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <figure className="space-y-1">
            <figcaption className="text-sm font-bold">מבט מלמעלה</figcaption>
            <svg viewBox={`-2 -14 ${trunk.width + 4} ${trunk.depth + 28}`} className="w-full max-w-xs rounded-lg bg-raised/60" role="img" aria-label={`מבט מלמעלה על תא המטען: ${r.placed.length} פריטים`}>
              <text x={trunk.width / 2} y={-4} textAnchor="middle" fontSize="7" fill="currentColor">מושב אחורי</text>
              <rect x={0} y={0} width={trunk.width} height={trunk.depth} fill="none" stroke="currentColor" strokeWidth="1" />
              {[...r.placed].sort((a, b) => a.z - b.z).map(p => (
                <g key={p.key} opacity={p.z === 0 ? 1 : 0.75}>
                  <rect x={trunk.width - p.y - p.w} y={p.x} width={p.w} height={p.d} fill={color(p)} fillOpacity={p.z === 0 ? 0.55 : 0.35} stroke={color(p)} strokeWidth="0.8" strokeDasharray={p.z ? '3 2' : undefined} />
                  <text x={trunk.width - p.y - p.w / 2} y={p.x + p.d / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">{p.order}</text>
                </g>))}
              <text x={trunk.width / 2} y={trunk.depth + 10} textAnchor="middle" fontSize="7" fill="currentColor">דלת תא המטען</text>
            </svg>
          </figure>
          <figure className="space-y-1">
            <figcaption className="text-sm font-bold">מבט מהצד</figcaption>
            <svg viewBox={`-4 ${-fs * 2} ${trunk.depth + 8} ${trunk.height + fs * 4}`} className="w-full rounded-lg bg-raised/60" role="img" aria-label={`מבט מהצד: גובה ההעמסה ${r.maxZ} ס״מ מתוך ${trunk.height} עד קו החלון`}>
              <line x1={0} x2={trunk.depth} y1={0} y2={0} stroke="#c0392b" strokeWidth="1" strokeDasharray="4 3" />
              <text x={trunk.depth / 2} y={-fs / 2} textAnchor="middle" fontSize={fs} fill="#c0392b">קו החלון — לא מעל</text>
              <rect x={0} y={0} width={trunk.depth} height={trunk.height} fill="none" stroke="currentColor" strokeWidth="1" />
              {r.placed.map(p => <rect key={p.key} x={p.x} y={trunk.height - p.z - p.h} width={p.d} height={p.h} fill={color(p)} fillOpacity={0.3} stroke={color(p)} strokeWidth="0.6" />)}
              <text x={0} y={trunk.height + fs * 1.4} textAnchor="start" fontSize={fs} fill="currentColor">מושב</text><text x={trunk.depth} y={trunk.height + fs * 1.4} textAnchor="end" fontSize={fs} fill="currentColor">דלת</text>
            </svg>
          </figure>
        </div>
        <ol className="space-y-1.5" aria-label="סדר העמסה לפי מידות">{r.placed.map(p => (
          <li key={p.key} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
            <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: color(p) }}>{p.order}</span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{p.name}</span><span className="num block text-xs text-muted">{zoneOf(p, trunk)} · {p.d}×{p.w}×{p.h} ס״מ{p.h > Math.min(p.d, p.w) ? ' · עומד' : ''}{p.soft ? ' · רך' : ''}</span></span>
          </li>))}</ol>
        {r.unplaced.length > 0 && (
          <div className="space-y-1 rounded-xl border border-danger/40 bg-danger/5 p-3" role="alert">
            <p className="flex items-center gap-2 font-bold text-danger"><AlertTriangle size={16} />לא נכנסו לתא המטען</p>
            <ul className="text-sm">{r.unplaced.map(u => <li key={u.key}>{u.name} — {UNPLACED_HE[u.reason]}</li>)}</ul>
            <p className="text-xs text-muted">אפשרויות: גגון או ארגז גג, מקום ברגליים (לא מול כריות אוויר), השארת ציוד בבית, או רכב נוסף.</p>
          </div>)}
        {r.unknown.length > 0 && <p className="text-sm text-muted">בלי מידות, ולכן לא בציור: {r.unknown.map(u => u.name).join(', ')}. <a className="font-bold text-moss" href={href('/gear/inventory')}>הוספת מידות במחסן</a></p>}
        <p className={cx('text-xs text-muted')}>שרטוט תכנון לפי המידות שהזנתם. תא מטען אמיתי מעוגל, ותיקים רכים נדחסים — בדקו בפועל, ואל תעמיסו מעל קו החלון.</p>
      </>}
    </section>
  );
}
