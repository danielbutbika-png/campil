import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { contrast, tokens, PAIRS } from './contrast';

const css = readFileSync('src/index.css', 'utf8');
const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))));
const darkStart = css.indexOf(":root[data-theme='dark']");
const dark = tokens(css.slice(darkStart, css.indexOf('}', darkStart)));

describe('Outdoor Design System — WCAG AA contrast (4.5:1 for text)', () => {
  for (const [name, t] of [['light', light], ['dark', dark]] as const)
    for (const [fg, bg] of PAIRS)
      it(`${name}: ${fg} on ${bg}`, () => { expect(t[fg] && t[bg]).toBeTruthy(); expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5); });
  it('white text on the main buttons (forest, sunset) passes too', () => {
    expect(contrast([255, 255, 255], light.forest)).toBeGreaterThanOrEqual(4.5);
    expect(contrast([255, 255, 255], light.sunset)).toBeGreaterThanOrEqual(4.5);
  });
  it('the decorative sunset is not used for text (documented: under 4.5:1)', () => {
    expect(contrast(light['sunset-deco'], light.bg)).toBeLessThan(4.5);
  });
});
