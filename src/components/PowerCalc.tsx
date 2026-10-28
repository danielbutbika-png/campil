// How long will our batteries last? Batteries in Wh (or mAh + volts), devices in watts × hours a day.
import { Plus, Trash2, BatteryCharging, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/store';
import { runtime, batteryWh, DEFAULT_EFF, type Battery, type Device } from '../engine/power';
import { Prov } from './Provenance';
import { Button } from './ui';

const n = (v: string) => (v === '' ? undefined : Math.max(0, +v));

export function PowerCalc() {
  const { settings, setSettings, inventory } = useStore();
  const pw = settings.power ?? { bats: [], devs: [] };
  const save = (p: Partial<typeof pw>) => setSettings({ power: { ...pw, ...p } });
  const setBat = (i: number, b: Partial<Battery>) => save({ bats: pw.bats.map((x, j) => (j === i ? { ...x, ...b } : x)) });
  const setDev = (i: number, d: Partial<Device>) => save({ devs: pw.devs.map((x, j) => (j === i ? { ...x, ...d } : x)) });
  const eff = pw.eff ?? DEFAULT_EFF;
  const r = runtime(pw.bats, pw.devs, eff);
  const charged = inventory.filter(g => g.charge).map(g => g.name);
  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-xl2 border border-info/40 bg-info/8 p-3 text-sm"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-info" /><span><b>Wh ולא mAh.</b> על סוללות גיבוי כתוב mAh במתח של התא הפנימי (בדרך כלל 3.6–3.85V), לא במתח היציאה. לכן מזינים Wh אם מופיע על המדבקה, או mAh יחד עם המתח שכתוב לידו.</span></p>

      <section className="space-y-2" aria-labelledby="bat-h">
        <h2 id="bat-h" className="font-display text-xl">סוללות</h2>
        {pw.bats.map((b, i) => (
          <div key={i} className="grid gap-2 rounded-xl2 border border-line bg-surface p-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_.7fr_auto] sm:items-end">
            <div><label className="label" htmlFor={`bn${i}`}>שם</label><input id={`bn${i}`} className="field" value={b.name} onChange={e => setBat(i, { name: e.target.value })} /></div>
            <div><label className="label" htmlFor={`bw${i}`}>Wh</label><input id={`bw${i}`} type="number" inputMode="decimal" className="field" value={b.wh ?? ''} onChange={e => setBat(i, { wh: n(e.target.value) })} /></div>
            <div><label className="label" htmlFor={`bm${i}`}>או mAh</label><input id={`bm${i}`} type="number" inputMode="numeric" className="field" value={b.mah ?? ''} onChange={e => setBat(i, { mah: n(e.target.value) })} /></div>
            <div><label className="label" htmlFor={`bv${i}`}>במתח (V)</label><input id={`bv${i}`} type="number" step="0.01" inputMode="decimal" className="field" placeholder="מהמדבקה" value={b.volts ?? ''} onChange={e => setBat(i, { volts: n(e.target.value) })} /></div>
            <div><label className="label" htmlFor={`bc${i}`}>כמות</label><input id={`bc${i}`} type="number" min={1} className="field" value={b.count ?? 1} onChange={e => setBat(i, { count: Math.max(1, +e.target.value || 1) })} /></div>
            <button type="button" aria-label={`הסרת ${b.name || 'סוללה'}`} className="grid h-11 w-11 place-items-center text-muted hover:text-danger" onClick={() => save({ bats: pw.bats.filter((_, j) => j !== i) })}><Trash2 size={17} /></button>
            {batteryWh(b) == null && <p className="text-xs font-bold text-warn sm:col-span-6">חסר: Wh, או mAh יחד עם המתח</p>}
          </div>))}
        <Button size="sm" variant="soft" icon={<Plus size={15} />} onClick={() => save({ bats: [...pw.bats, { name: `סוללה ${pw.bats.length + 1}`, count: 1 }] })}>סוללה</Button>
      </section>

      <section className="space-y-2" aria-labelledby="dev-h">
        <h2 id="dev-h" className="font-display text-xl">מכשירים</h2>
        <p className="text-sm text-muted">ההספק (W) מופיע על המכשיר או על המטען שלו. אם כתוב רק V ו-A — מכפילים (V × A = W).</p>
        {pw.devs.map((d, i) => (
          <div key={i} className="grid gap-2 rounded-xl2 border border-line bg-surface p-3 sm:grid-cols-[1.6fr_1fr_1fr_.7fr_auto] sm:items-end">
            <div><label className="label" htmlFor={`dn${i}`}>מכשיר</label><input id={`dn${i}`} className="field" list="dev-names" value={d.name} onChange={e => setDev(i, { name: e.target.value })} /></div>
            <div><label className="label" htmlFor={`dw${i}`}>הספק (W)</label><input id={`dw${i}`} type="number" step="0.1" inputMode="decimal" className="field" value={d.watts || ''} onChange={e => setDev(i, { watts: n(e.target.value) ?? 0 })} /></div>
            <div><label className="label" htmlFor={`dh${i}`}>שעות ביום</label><input id={`dh${i}`} type="number" step="0.5" inputMode="decimal" className="field" value={d.hoursPerDay || ''} onChange={e => setDev(i, { hoursPerDay: n(e.target.value) ?? 0 })} /></div>
            <div><label className="label" htmlFor={`dc${i}`}>כמות</label><input id={`dc${i}`} type="number" min={1} className="field" value={d.count ?? 1} onChange={e => setDev(i, { count: Math.max(1, +e.target.value || 1) })} /></div>
            <button type="button" aria-label={`הסרת ${d.name || 'מכשיר'}`} className="grid h-11 w-11 place-items-center text-muted hover:text-danger" onClick={() => save({ devs: pw.devs.filter((_, j) => j !== i) })}><Trash2 size={17} /></button>
          </div>))}
        <datalist id="dev-names">{charged.map(c => <option key={c} value={c} />)}</datalist>
        <Button size="sm" variant="soft" icon={<Plus size={15} />} onClick={() => save({ devs: [...pw.devs, { name: '', watts: 0, hoursPerDay: 0, count: 1 }] })}>מכשיר</Button>
      </section>

      <section aria-labelledby="pr-h" className="space-y-2 rounded-xl2 border-2 border-moss/40 bg-surface p-4" aria-live="polite">
        <h2 id="pr-h" className="flex items-center gap-2 font-display text-xl"><BatteryCharging size={20} className="text-moss" />התוצאה</h2>
        <p className="num">סה״כ בסוללות: <b>{r.totalWh} Wh</b> · שמיש בפועל: <b>{r.usable[0]}–{r.usable[1]} Wh</b> · צריכה ביום: <b>{r.perDay} Wh</b></p>
        {r.days ? <p className="num text-lg">מספיק לבערך <b>{r.days[0]}–{r.days[1]} ימים</b></p> : <p className="text-muted">הוסיפו מכשירים עם הספק ושעות כדי לחשב.</p>}
        {r.missing.length > 0 && <p className="text-sm text-warn">לא נספרו: {r.missing.join(', ')} — חסר נתון.</p>}
        <Prov kind="estimate" source={`הפסדי המרה ${Math.round((1 - eff[1]) * 100)}–${Math.round((1 - eff[0]) * 100)}% (הערכת תכנון)`} />
        <p className="text-xs text-muted">טווח ולא מספר מדויק: הקיבולת בפועל תלויה בטמפרטורה, בגיל הסוללה ובכבלים. קור מקטין קיבולת. מכשירים שמשנים הספק (מאוורר במהירויות שונות) — לפי המהירות שתשתמשו בה.</p>
      </section>
    </div>
  );
}
