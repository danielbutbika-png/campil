// Battery & power calculator. Wh is energy; mAh is charge and means nothing without the voltage it was measured at.
// Power banks print mAh at the internal cell voltage (usually 3.6–3.85 V), not at the 5 V USB output — so the
// calculator always converts through Wh and applies a conversion-loss range instead of a single "exact" answer.
export interface Battery { name: string; wh?: number; mah?: number; volts?: number; count?: number }
export interface Device { name: string; watts: number; hoursPerDay: number; count?: number }

/** Wh from either Wh or mAh+V. Returns null when mAh is given without a voltage — the user must say which. */
export function batteryWh(b: Battery): number | null {
  const n = b.count ?? 1;
  if (b.wh && b.wh > 0) return b.wh * n;
  if (b.mah && b.mah > 0 && b.volts && b.volts > 0) return (b.mah * b.volts / 1000) * n;
  return null;
}
export const DEFAULT_EFF: [number, number] = [0.6, 0.85]; // planning estimate for USB power-bank conversion losses

export function dailyWh(devs: Device[]) { return devs.reduce((s, d) => s + Math.max(0, d.watts) * Math.max(0, d.hoursPerDay) * (d.count ?? 1), 0); }

/** Usable energy and how long it lasts, as a range [pessimistic, optimistic]. */
export function runtime(bats: Battery[], devs: Device[], eff: [number, number] = DEFAULT_EFF) {
  const whs = bats.map(batteryWh);
  const missing = bats.filter((_, i) => whs[i] == null).map(b => b.name);
  const total = whs.reduce<number>((s, w) => s + (w ?? 0), 0);
  const usable: [number, number] = [total * eff[0], total * eff[1]];
  const perDay = dailyWh(devs);
  const days: [number, number] | null = perDay > 0 ? [usable[0] / perDay, usable[1] / perDay] : null;
  return { totalWh: round(total), usable: usable.map(round) as [number, number], perDay: round(perDay), days: days && (days.map(d => Math.round(d * 10) / 10) as [number, number]), missing };
}
const round = (x: number) => Math.round(x * 10) / 10;
