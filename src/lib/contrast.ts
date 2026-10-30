// WCAG 2.x contrast ratio between two "r g b" colours.
const lin = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export const luminance = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export function contrast(a: number[], b: number[]) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/** Tokens of one theme block in index.css: `--name: r g b;` → { name: [r,g,b] }. */
export function tokens(css: string): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const m of css.matchAll(/--([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) out[m[1]] = [+m[2], +m[3], +m[4]];
  return out;
}
/** Text / background pairs the UI actually uses. */
export const PAIRS: [fg: string, bg: string][] = [
  ...['ink', 'muted', 'moss', 'earth', 'sunset', 'info', 'forest', 'danger', 'warn', 'ok'].flatMap(f => ['bg', 'surface', 'raised'].map(b => [f, b] as [string, string])),
  ['onforest', 'forest'],
];
