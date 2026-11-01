// Minimal reader for simple OpenStreetMap opening_hours ("Mo-Fr 08:00-14:00; Sa 09:00-12:00", "24/7", "Fr-Sa 07:00-13:00").
// Anything it cannot read fully returns null ("unknown") — never a guess. Holidays (PH) and exceptions are not read.
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const dayList = (spec: string): number[] | null => {
  const out: number[] = [];
  for (const part of spec.split(',')) {
    const m = /^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?$/.exec(part.trim()); if (!m) return null;
    const a = DAYS.indexOf(m[1]), b = m[2] ? DAYS.indexOf(m[2]) : a;
    for (let i = a; ; i = (i + 1) % 7) { out.push(i); if (i === b) break; }
  }
  return out;
};
const mins = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
/** true = open, false = closed (per the tag), null = cannot tell. `date` ISO day, `time` HH:MM. */
export function openAt(oh: string | undefined, date: string, time: string): boolean | null {
  if (!oh) return null; const s = oh.trim(); if (s === '24/7') return true;
  const day = new Date(date + 'T12:00').getDay(); const t = mins(time); let known = false; let open = false;
  for (const rule of s.split(';').map(x => x.trim()).filter(Boolean)) {
    const m = /^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?,?)+)\s+(off|closed|(?:\d\d:\d\d-\d\d:\d\d,?\s*)+)$/.exec(rule);
    if (!m) return null; // PH, months, "sunrise", comments… — not read
    const days = dayList(m[1]); if (!days) return null;
    if (!days.includes(day)) continue;
    known = true; open = false;
    if (m[2] === 'off' || m[2] === 'closed') continue;
    for (const span of m[2].split(',').map(x => x.trim()).filter(Boolean)) { const [a, b] = span.split('-').map(mins); if (t >= a && t < (b <= a ? b + 1440 : b)) open = true; }
  }
  return known ? open : false; // rules covered days, and this day is not among them → closed
}
