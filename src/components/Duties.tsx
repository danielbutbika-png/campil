// Who does what between families: a family picker for a single duty, and a board of each family's share.
import { Users2, Shuffle } from 'lucide-react';
import type { Trip, Duty } from '../lib/types';
import { useStore } from '../lib/store';
import { isGroup, myFamily } from '../lib/families';
import { setDuty, dutySummary, autoSplit } from '../engine/duties';
import { shoppingList, type ShopLine } from '../engine/planner';
import { drinkPlan } from '../engine/drinks';
import { useMemo } from 'react';
import { stamp } from './Collab';
import { Button, cx, toast } from './ui';

export function useDuty(t: Trip) {
  const updateTrip = useStore(s => s.updateTrip);
  return (key: string, p: Partial<Duty>) => {
    const s = p.done !== undefined ? stamp() : null;
    updateTrip(t.id, x => ({ duties: setDuty(x, key, s ? { ...p, by: p.done ? s.by : undefined, at: p.done ? s.at : undefined } : p) }));
  };
}

/** Compact "which family" select + done checkbox for one duty. Renders nothing outside multi-family trips. */
export function FamilyDuty({ t, k, label, doneLabel }: { t: Trip; k: string; label: string; doneLabel: string }) {
  const set = useDuty(t);
  if (!isGroup(t)) return null;
  const d = t.duties?.[k]; const fam = t.families!.find(f => f.id === d?.familyId);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: fam?.color ?? 'transparent', border: fam ? 'none' : '1.5px dashed currentColor' }} />
        <select aria-label={label} className="rounded-lg border border-line bg-surface px-2 py-1 text-sm" value={d?.familyId ?? ''} onChange={e => set(k, { familyId: e.target.value || undefined, ...(e.target.value ? {} : { done: undefined }) })}>
          <option value="">{label}: לא נקבע</option>{t.families!.map(f => <option key={f.id} value={f.id}>{f.name}{f.id === myFamily(t) ? ' (אתם)' : ''}</option>)}
        </select>
      </span>
      {fam && doneLabel && <label className="inline-flex items-center gap-1 text-sm"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--forest))]" checked={!!d?.done} onChange={e => set(k, { done: e.target.checked || undefined })} />{doneLabel}</label>}
    </span>
  );
}

/** Each family's share — meals to prepare, items to buy, tasks, units of shared gear — and what nobody took yet. */
export function DutyBoard({ t, lines, compact }: { t: Trip; lines: ShopLine[]; compact?: boolean }) {
  const updateTrip = useStore(s => s.updateTrip);
  if (!isGroup(t)) return null;
  const { rows, unassigned } = dutySummary(t, lines);
  const mine = myFamily(t);
  const open = unassigned.meals + unassigned.shop;
  const frac = (a: number, b: number) => (b ? `${a}/${b}` : '—');
  return (
    <section aria-labelledby="duty-h" className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="duty-h" className="flex items-center gap-2 font-bold"><Users2 size={18} className="text-moss" />מי אחראי על מה</h2>
        {!compact && open > 0 && <Button size="sm" variant="soft" icon={<Shuffle size={15} />} onClick={() => { updateTrip(t.id, x => ({ duties: autoSplit(x, lines) })); toast('החלוקה עודכנה — אפשר לשנות כל שורה'); }}>חלוקה מהירה של מה שלא נקבע</Button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] text-sm">
          <thead><tr className="text-right text-xs text-muted"><th className="py-1 font-semibold">משפחה</th><th className="font-semibold">ארוחות (מוכן)</th><th className="font-semibold">קניות (נקנה)</th><th className="font-semibold">משימות</th><th className="font-semibold">ציוד משותף</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.family.id} className={cx('border-t border-line', r.family.id === mine && 'font-bold')}>
              <td className="py-1.5"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: r.family.color }} />{r.family.name}</span></td>
              <td className="num">{frac(r.mealsDone, r.meals)}</td><td className="num">{frac(r.bought, r.shop)}</td><td className="num">{frac(r.tasksDone, r.tasks)}</td><td className="num">{r.brings ? `${r.brings} יח׳` : '—'}</td>
            </tr>))}</tbody>
        </table>
      </div>
      <p className={cx('text-sm', open || unassigned.missingUnits ? 'font-semibold text-warn' : 'text-ok')}>
        {open || unassigned.missingUnits
          ? `עוד לא נקבע: ${[unassigned.meals && `${unassigned.meals} ארוחות`, unassigned.shop && `${unassigned.shop} פריטי קנייה`, unassigned.missingUnits && `${unassigned.missingUnits} יח׳ ציוד משותף`].filter(Boolean).join(' · ')}`
          : 'הארוחות, הקניות והציוד המשותף חולקו בין המשפחות'}
      </p>
      {unassigned.tasks > 0 && <p className="text-xs text-muted">{unassigned.tasks} משימות פתוחות בלי משפחה אחראית — אפשר לשייך בלשונית המשימות.</p>}
    </section>
  );
}

/** The trip's full shopping list (menu + drinks), as the meals tab shows it. */
export function useShopLines(t: Trip) {
  const settings = useStore(s => s.settings);
  return useMemo(() => [...shoppingList(t.meals, t, settings.diet), ...drinkPlan(t, settings).lines], [t, settings]);
}
