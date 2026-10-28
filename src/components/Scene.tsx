import { useMemo } from 'react';
import type { Scene as SceneT } from '../data/regions';

// Original procedural landscapes (no third-party imagery → no licensing questions).
const W = 800, H = 360;
function rnd(seed: number) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
function ridge(seed: number, base: number, amp: number, rough = 1) {
  const r = rnd(seed); const f = [r() * 2 + 1, r() * 4 + 3, r() * 9 + 7].map(x => x * rough); const ph = [r() * 6, r() * 6, r() * 6];
  let d = `M0 ${H} L0 ${base}`;
  for (let x = 0; x <= W; x += 8) {
    const t = x / W; const y = base - amp * (0.55 * Math.sin(t * f[0] + ph[0]) + 0.3 * Math.sin(t * f[1] + ph[1]) + 0.15 * Math.sin(t * f[2] + ph[2]));
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return d + ` L${W} ${H} Z`;
}
const PAL: Record<SceneT, { sky: [string, string]; layers: string[]; sun: string }> = {
  mountain: { sky: ['#f6c98b', '#9cc3d5'], layers: ['#8aa6a3', '#5d7f6c', '#3c5f47', '#22402e'], sun: '#fff1cf' },
  forest: { sky: ['#f3d9a4', '#a9cbb7'], layers: ['#87a98c', '#5b8a63', '#386a45', '#1e4630'], sun: '#fff4d6' },
  sea: { sky: ['#ffd3a1', '#86b9d6'], layers: ['#d9c49b', '#4d8fb3', '#2f6f95', '#c9b48a'], sun: '#fff0cc' },
  desert: { sky: ['#ffbf7a', '#e9a0a0'], layers: ['#e2b07a', '#c98a55', '#a86a3e', '#7f4c2c'], sun: '#fff0c4' },
  crater: { sky: ['#f9b98a', '#7f8fc1'], layers: ['#c79a76', '#a37455', '#7b5640', '#4d3628'], sun: '#ffe7c2' },
  lake: { sky: ['#f8d7a0', '#9fc7d8'], layers: ['#9bb59e', '#6f9a7a', '#5d9ab8', '#2c5a3a'], sun: '#fff3d1' },
  city: { sky: ['#f6cfa0', '#a7c2d6'], layers: ['#a9b9a3', '#7c9a7f', '#577b5d', '#33543d'], sun: '#fff2d0' },
};

export function Scene({ kind, seed = 3, className, night }: { kind: SceneT; seed?: number; className?: string; night?: boolean }) {
  const id = `sc-${kind}-${seed}-${night ? 'n' : 'd'}`;
  const p = PAL[kind];
  const sky: [string, string] = night ? ['#1d2440', '#0b1020'] : p.sky;
  const shapes = useMemo(() => {
    const L = p.layers;
    if (kind === 'sea') return [
      { d: ridge(seed, 170, 30), fill: L[0], o: .55 }, { d: `M0 ${H} L0 215 ` + Array.from({ length: 51 }, (_, i) => `L${i * 16} ${215 + Math.sin(i * 1.3 + seed) * 2.5}`).join(' ') + ` L${W} ${H} Z`, fill: L[1], o: 1 },
      { d: `M0 ${H} L0 245 ` + Array.from({ length: 51 }, (_, i) => `L${i * 16} ${245 + Math.sin(i * .9 + seed) * 4}`).join(' ') + ` L${W} ${H} Z`, fill: L[2], o: 1 },
      { d: ridge(seed + 9, 300, 26, .6), fill: L[3], o: 1 }];
    if (kind === 'lake') return [
      { d: ridge(seed, 165, 50), fill: L[0], o: .8 }, { d: ridge(seed + 2, 205, 35), fill: L[1], o: 1 },
      { d: `M0 ${H} L0 240 L${W} 236 L${W} ${H} Z`, fill: L[2], o: 1 }, { d: ridge(seed + 4, 305, 22, .7), fill: L[3], o: 1 }];
    if (kind === 'crater') return [
      { d: ridge(seed, 150, 18, .5), fill: L[0], o: .8 },
      { d: `M0 ${H} L0 205 L130 196 C 230 196 260 268 400 270 C 540 268 570 196 670 196 L${W} 205 L${W} ${H} Z`, fill: L[1], o: 1 },
      { d: ridge(seed + 3, 290, 18, .8), fill: L[2], o: 1 }, { d: ridge(seed + 6, 330, 12, 1.4), fill: L[3], o: 1 }];
    return [
      { d: ridge(seed, kind === 'desert' ? 175 : 150, kind === 'mountain' ? 70 : 45), fill: L[0], o: .85 },
      { d: ridge(seed + 1, 205, kind === 'mountain' ? 60 : 38), fill: L[1], o: 1 },
      { d: ridge(seed + 2, 255, 34, 1.2), fill: L[2], o: 1 },
      { d: ridge(seed + 3, 310, 22, 1.6), fill: L[3], o: 1 }];
  }, [kind, seed]);
  const trees = kind === 'forest' || kind === 'mountain' || kind === 'lake';
  const r = rnd(seed * 7);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[1]} /><stop offset="1" stopColor={sky[0]} /></linearGradient>
        <radialGradient id={id + 'g'}><stop offset="0" stopColor={night ? '#e8ecff' : p.sun} stopOpacity=".9" /><stop offset="1" stopColor={night ? '#e8ecff' : p.sun} stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
      {night && Array.from({ length: 60 }, (_, i) => <circle key={i} cx={r() * W} cy={r() * 170} r={r() * 1.3 + .3} fill="#fff" opacity={r() * .7 + .3} />)}
      <circle cx={kind === 'desert' ? 560 : 610} cy={night ? 70 : 120} r={90} fill={`url(#${id}g)`} />
      <circle cx={kind === 'desert' ? 560 : 610} cy={night ? 70 : 120} r={night ? 16 : 26} fill={night ? '#f3f1e6' : p.sun} />
      {shapes.map((s, i) => <path key={i} d={s.d} fill={night ? shade(s.fill) : s.fill} opacity={s.o} />)}
      {trees && Array.from({ length: 26 }, (_, i) => { const x = r() * W, y = 270 + r() * 50, h = 18 + r() * 22; return <path key={i} d={`M${x} ${y} l${h * .28} 0 l-${h * .28} -${h} l-${h * .28} ${h} z`} fill={night ? '#0d1a12' : p.layers[3]} opacity=".9" />; })}
      {kind === 'desert' && Array.from({ length: 4 }, (_, i) => { const x = 80 + i * 190 + r() * 40, y = 300 + r() * 20; return <g key={i} fill={night ? '#120c08' : '#5a3a22'}><rect x={x} y={y - 26} width="3" height="26" /><ellipse cx={x + 1.5} cy={y - 28} rx="16" ry="5" /></g>; })}
    </svg>
  );
}
function shade(hex: string) { const n = parseInt(hex.slice(1), 16); const k = .35; const r = ((n >> 16) & 255) * k + 10, g = ((n >> 8) & 255) * k + 14, b = (n & 255) * k + 24; return `rgb(${r | 0},${g | 0},${b | 0})`; }
