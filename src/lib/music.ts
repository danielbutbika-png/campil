// Original background music for trip videos, composed on the device — no samples, no network, no licences.
// compose() is pure (mood + seed → note events); renderMusic() synthesises them with an OfflineAudioContext.
// The seed is the trip name, so every trip gets its own tune and the same trip always the same one.
export type Mood = 'adventure' | 'calm' | 'campfire' | 'happy';
export const MOODS: { id: Mood; name: string; blurb: string }[] = [
  { id: 'adventure', name: 'הרפתקה', blurb: 'קצבי ואנרגטי' },
  { id: 'calm', name: 'שקט בטבע', blurb: 'רך ונינוח' },
  { id: 'campfire', name: 'מדורה', blurb: 'חם, בסגנון גיטרה' },
  { id: 'happy', name: 'שמח', blurb: 'קליל ומקפיץ' },
];
export type Voice = 'pad' | 'pluck' | 'bass' | 'bell' | 'kick' | 'hat' | 'clap';
export interface NoteEv { t: number; dur: number; voice: Voice; midi: number; vel: number }
interface Style { bpm: number; key: number; prog: number[][]; drums: 'none' | 'soft' | 'full'; arp: 'up' | 'strum' | 'none'; melody: boolean }
// chords as scale-degree triads in a major key (0 = I, 5 = vi …); key = MIDI root
const STYLE: Record<Mood, Style> = {
  adventure: { bpm: 112, key: 50, prog: [[0], [4], [5], [3]], drums: 'full', arp: 'up', melody: true },
  calm: { bpm: 72, key: 53, prog: [[0], [5], [3], [4]], drums: 'none', arp: 'up', melody: true },
  campfire: { bpm: 92, key: 55, prog: [[0], [3], [0], [4]], drums: 'soft', arp: 'strum', melody: false },
  happy: { bpm: 124, key: 48, prog: [[0], [3], [4], [0]], drums: 'full', arp: 'up', melody: true },
};
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const PENTA = [0, 2, 4, 7, 9];
const deg = (key: number, d: number) => key + MAJOR[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
const triad = (key: number, d: number) => [deg(key, d), deg(key, d + 2), deg(key, d + 4)];
/** Small deterministic PRNG (mulberry32) from a string seed. */
export function rng(seed: string) {
  let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** A loop of `bars` 4/4 bars: intro bar (pad only), body with an A and a B melody, so the loop does not feel short. */
export function compose(mood: Mood, seed: string, bars = 16): { events: NoteEv[]; seconds: number; bpm: number } {
  const s = STYLE[mood]; const r = rng(seed + mood); const beat = 60 / s.bpm; const ev: NoteEv[] = [];
  // per-trip variation: a different progression rotation and melody shape
  const rot = Math.floor(r() * s.prog.length);
  const prog = s.prog.map((_, i) => s.prog[(i + rot) % s.prog.length][0]);
  const motifA = Array.from({ length: 8 }, () => Math.floor(r() * PENTA.length));
  const motifB = Array.from({ length: 8 }, () => Math.floor(r() * PENTA.length));
  for (let b = 0; b < bars; b++) {
    const t0 = b * 4 * beat; const d = prog[b % prog.length]; const ch = triad(s.key, d);
    ev.push(...ch.map(m => ({ t: t0, dur: 4 * beat, voice: 'pad' as const, midi: m + 12, vel: 0.22 })));
    if (b === 0) continue; // intro: pad only
    ev.push({ t: t0, dur: 2 * beat, voice: 'bass', midi: ch[0] - 12, vel: 0.5 }, { t: t0 + 2 * beat, dur: 2 * beat, voice: 'bass', midi: (b % 2 ? ch[2] : ch[0]) - 12, vel: 0.42 });
    if (s.arp === 'up') for (let i = 0; i < 8; i++) ev.push({ t: t0 + i * beat / 2, dur: beat / 2, voice: 'pluck', midi: [...ch, ch[0] + 12][i % 4] + 12, vel: i % 2 ? 0.2 : 0.28 });
    if (s.arp === 'strum') for (const off of [0, 1, 1.5, 2.5, 3]) ch.concat(ch[0] + 12).forEach((m, k) => ev.push({ t: t0 + off * beat + k * 0.018, dur: beat * 1.2, voice: 'pluck', midi: m + 12, vel: off % 1 ? 0.16 : 0.24 }));
    if (s.melody && b >= 2) {
      const motif = Math.floor(b / 4) % 2 ? motifB : motifA;
      for (let i = 0; i < 8; i++) {
        if (r() < (mood === 'calm' ? 0.55 : 0.3)) continue; // rests keep it light
        const pc = PENTA[motif[i]]; ev.push({ t: t0 + i * beat / 2, dur: beat * (mood === 'calm' ? 1.5 : 0.6), voice: 'bell', midi: s.key + 24 + pc, vel: 0.2 });
      }
    }
    if (s.drums !== 'none') for (let i = 0; i < 8; i++) {
      const tt = t0 + i * beat / 2;
      if (s.drums === 'full' && i % 4 === 0) ev.push({ t: tt, dur: 0.3, voice: 'kick', midi: 0, vel: 0.8 });
      if (s.drums === 'full' && i % 4 === 2) ev.push({ t: tt, dur: 0.2, voice: 'clap', midi: 0, vel: 0.35 });
      if (s.drums === 'soft' && i % 4 === 0) ev.push({ t: tt, dur: 0.25, voice: 'kick', midi: 0, vel: 0.45 });
      ev.push({ t: tt, dur: 0.05, voice: 'hat', midi: 0, vel: s.drums === 'full' ? (i % 2 ? 0.1 : 0.16) : 0.07 });
    }
  }
  return { events: ev, seconds: bars * 4 * beat, bpm: s.bpm };
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
/** Synthesise a composition (browser only). Returns a loopable AudioBuffer. */
export async function renderMusic(mood: Mood, seed: string, sampleRate = 32000): Promise<AudioBuffer> {
  const { events, seconds } = compose(mood, seed);
  const OAC = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const ctx: OfflineAudioContext = new OAC(2, Math.ceil(seconds * sampleRate), sampleRate);
  const master = ctx.createDynamicsCompressor(); const out = ctx.createGain(); out.gain.value = 0.9;
  master.connect(out).connect(ctx.destination);
  const noise = ctx.createBuffer(1, sampleRate, sampleRate); const nd = noise.getChannelData(0); const nr = rng('noise'); for (let i = 0; i < nd.length; i++) nd[i] = nr() * 2 - 1;
  const env = (g: GainNode, t: number, a: number, peak: number, d: number) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  for (const e of events) {
    const g = ctx.createGain(); g.connect(master);
    if (e.voice === 'kick') { const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, e.t); o.frequency.exponentialRampToValueAtTime(42, e.t + 0.18); env(g, e.t, 0.004, e.vel, 0.26); o.connect(g); o.start(e.t); o.stop(e.t + 0.35); continue; }
    if (e.voice === 'hat' || e.voice === 'clap') { const n = ctx.createBufferSource(); n.buffer = noise; const f = ctx.createBiquadFilter(); f.type = e.voice === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = e.voice === 'hat' ? 7000 : 1500; n.connect(f).connect(g); env(g, e.t, 0.002, e.vel, e.voice === 'hat' ? 0.04 : 0.15); n.start(e.t); n.stop(e.t + 0.25); continue; }
    const f = hz(e.midi);
    if (e.voice === 'pad') { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(g); for (const det of [-6, 6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(e.t); o.stop(e.t + e.dur + 0.1); } g.gain.setValueAtTime(0.0001, e.t); g.gain.linearRampToValueAtTime(e.vel * 0.5, e.t + e.dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, e.t + e.dur + 0.05); continue; }
    const o = ctx.createOscillator(); o.frequency.value = f;
    if (e.voice === 'bass') { o.type = 'triangle'; env(g, e.t, 0.01, e.vel, e.dur * 0.9); }
    else if (e.voice === 'pluck') { o.type = 'triangle'; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, e.t); lp.frequency.exponentialRampToValueAtTime(600, e.t + 0.3); o.connect(lp).connect(g); env(g, e.t, 0.003, e.vel, Math.max(0.25, e.dur)); o.start(e.t); o.stop(e.t + e.dur + 0.4); continue; }
    else { o.type = 'sine'; const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 3; const g2 = ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2).connect(g); o2.start(e.t); o2.stop(e.t + e.dur + 0.6); env(g, e.t, 0.005, e.vel, e.dur + 0.5); }
    o.connect(g); o.start(e.t); o.stop(e.t + e.dur + 0.6);
  }
  return ctx.startRendering();
}
