// Step-by-step knot illustration: each step draws the new part of the rope; play/pause, speed, manual steps.
// Respects "reduce motion" (no drawing animation, steps still work).
import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import type { Knot, KnotFrame } from '../data/academy/types';
import { Button, cx } from './ui';

const ROPE = ['#c47a3a', '#3c6e9f'];
const SPEEDS = [0.5, 1, 1.5] as const;

function Frame({ frame, prev, speed, tight, animate }: { frame: KnotFrame; prev?: KnotFrame; speed: number; tight?: boolean; animate: boolean }) {
  const before = new Set(prev?.segs.map(s => s.d) ?? []);
  const items = [
    ...(frame.props ?? []).map((p, i) => ({ z: p.z, key: `p${i}`, el: <g dangerouslySetInnerHTML={{ __html: p.svg }} /> })),
    ...frame.segs.map((s, i) => {
      const fresh = animate && !before.has(s.d);
      const anim = fresh ? { strokeDasharray: 1, strokeDashoffset: 1, animation: `knot-draw ${1.4 / speed}s ease-out forwards` } : undefined;
      return { z: s.z, key: `s${i}${s.d}`, el: <g>
        <path d={s.d} fill="none" stroke="rgb(var(--surface))" strokeWidth={13} strokeLinecap="round" pathLength={1} style={anim} />
        <path d={s.d} fill="none" stroke={ROPE[s.rope ?? 0]} strokeWidth={7} strokeLinecap="round" pathLength={1} style={anim} />
      </g> };
    }),
  ].sort((a, b) => a.z - b.z);
  return <g style={{ transform: tight ? 'scale(0.86)' : 'none', transformOrigin: '100px 80px', transition: 'transform .6s' }}>{items.map(x => <g key={x.key}>{x.el}</g>)}</g>;
}

export function KnotViewer({ knot, art }: { knot: Knot; art: KnotFrame[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const reduce = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const step = knot.steps[i]; const last = knot.steps.length - 1;
  useEffect(() => {
    if (!playing) return;
    if (i >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(last, x + 1)), 2600 / speed);
    return () => clearTimeout(t);
  }, [playing, i, speed, last]);
  const prevFrame = i > 0 ? art[knot.steps[i - 1].frame] : undefined;
  return (
    <section aria-label={`איור צעד אחר צעד: ${knot.he}`} className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <svg viewBox="0 0 200 160" className="mx-auto w-full max-w-md rounded-xl bg-[rgb(var(--surface))]" role="img" aria-label={`שלב ${i + 1} מתוך ${last + 1}: ${step.text}`}>
        <Frame key={i} frame={art[step.frame]} prev={prevFrame} speed={speed} tight={step.tight} animate={!reduce} />
      </svg>
      <p className="min-h-12 text-center font-semibold" aria-live="polite"><span className="num text-muted">שלב {i + 1}/{last + 1} · </span>{step.text}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant="soft" icon={<ChevronRight size={16} />} disabled={i === 0} onClick={() => { setPlaying(false); setI(i - 1); }}>הקודם</Button>
        {i < last || playing
          ? <Button size="sm" icon={playing ? <Pause size={16} /> : <Play size={16} />} onClick={() => setPlaying(!playing)}>{playing ? 'השהיה' : 'ניגון'}</Button>
          : <Button size="sm" icon={<RotateCcw size={16} />} onClick={() => { setI(0); setPlaying(true); }}>מההתחלה</Button>}
        <Button size="sm" variant="soft" disabled={i === last} onClick={() => { setPlaying(false); setI(i + 1); }}>הבא<ChevronLeft size={16} /></Button>
      </div>
      <div className="flex items-center justify-center gap-1.5" role="radiogroup" aria-label="מהירות האנימציה">
        <span className="text-xs text-muted">מהירות:</span>
        {SPEEDS.map(s => <button key={s} type="button" role="radio" aria-checked={speed === s} onClick={() => setSpeed(s)} className={cx('min-h-8 rounded-full px-3 text-xs font-bold', speed === s ? 'bg-forest text-onforest' : 'bg-raised')}>{s === 0.5 ? 'איטי' : s === 1 ? 'רגיל' : 'מהיר'}</button>)}
      </div>
      <ol className="flex flex-wrap justify-center gap-1.5" aria-label="מעבר לשלב">
        {knot.steps.map((s, n) => <li key={n}><button type="button" aria-label={`שלב ${n + 1}: ${s.text}`} aria-current={n === i ? 'step' : undefined} onClick={() => { setPlaying(false); setI(n); }} className={cx('grid h-8 w-8 place-items-center rounded-full text-sm font-bold', n === i ? 'bg-forest text-onforest' : n < i ? 'bg-moss/20' : 'bg-raised')}>{n + 1}</button></li>)}
      </ol>
    </section>
  );
}
