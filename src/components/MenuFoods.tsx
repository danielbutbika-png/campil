// Foods added to a meal by hand, and the picker with recommended quantities for the people on this trip.
import { useMemo, useState } from 'react';
import { Plus, X, Search, RotateCcw } from 'lucide-react';
import type { Trip, MealType, MenuFood } from '../lib/types';
import { useStore } from '../lib/store';
import { FOODS, FOOD_GROUP_HE, FOOD_NOTE, type FoodGroup } from '../data/foods';
import { MEAL_LABEL } from '../data/recipes';
import { portions, suggested, foodQty, fromFood, custom, addFood, updateFood } from '../engine/selfMenu';
import { qtyLabel } from '../engine/planner';
import { Button, Chip, Sheet, toast } from './ui';
import { Prov } from './Provenance';

export function usePortions(t: Trip) {
  const diet = useStore(s => s.settings.diet);
  return useMemo(() => portions(t, diet), [t.participants, t.families, t.adults, t.children, diet]);
}

/** The foods of one meal: quantity (recommended unless changed), reset, remove. */
export function FoodList({ t, slotId, items }: { t: Trip; slotId: string; items: MenuFood[] }) {
  const updateTrip = useStore(s => s.updateTrip);
  const eq = usePortions(t);
  if (!items.length) return null;
  const up = (id: string, p: Partial<MenuFood> | null) => updateTrip(t.id, x => ({ meals: updateFood(x.meals, slotId, id, p) }));
  return (
    <ul className="space-y-1" aria-label="מזון שהוספתם">
      {items.map(i => {
        const rec = i.per != null ? suggested(i.per, i.unit, eq) : null;
        return (
          <li key={i.id} className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{i.name}</span>
            <input aria-label={`כמות ${i.name}`} type="number" min={0} step={i.unit === 'יח׳' ? 1 : 50} className="num w-20 rounded-lg border border-line bg-surface px-2 py-1"
              value={foodQty(i, eq)} onChange={e => up(i.id, { qty: Math.max(0, +e.target.value) })} />
            <span className="w-8 text-xs text-muted">{i.unit}</span>
            {rec != null && i.qty != null && i.qty !== rec && <button type="button" aria-label={`חזרה לכמות המומלצת ל${i.name}`} title={`מומלץ: ${qtyLabel(rec, i.unit)}`} className="text-muted hover:text-ink" onClick={() => up(i.id, { qty: undefined })}><RotateCcw size={14} /></button>}
            <button type="button" aria-label={`הסרת ${i.name}`} className="text-muted hover:text-danger" onClick={() => up(i.id, null)}><X size={16} /></button>
          </li>);
      })}
    </ul>
  );
}

/** Pick foods for a meal: each shows the amount recommended for everyone on this trip. */
export function FoodPicker({ t, target, onClose }: { t: Trip; target: { day: number; type: MealType } | null; onClose: () => void }) {
  const updateTrip = useStore(s => s.updateTrip);
  const eq = usePortions(t);
  const [q, setQ] = useState(''); const [g, setG] = useState<FoodGroup | 'all'>('all');
  const [name, setName] = useState(''); const [qty, setQty] = useState(1); const [unit, setUnit] = useState('יח׳');
  if (!target) return null;
  const adults = t.participants.filter(p => p.role !== 'child').length, kids = t.participants.length - adults;
  const add = (item: MenuFood) => { updateTrip(t.id, x => ({ meals: addFood(x.meals, target.day, target.type, item, x.participants.length) })); toast(`${item.name} נוסף ל${MEAL_LABEL[target.type]}`); };
  const list = FOODS.filter(x => (g === 'all' || x.group === g) && (!q.trim() || x.name.includes(q.trim())));
  return (
    <Sheet open onClose={onClose} title={`מוסיפים ל${MEAL_LABEL[target.type]} · יום ${target.day + 1}`}>
      <div className="space-y-4">
        <div className="space-y-1 rounded-xl bg-raised/60 p-3 text-sm">
          <p className="num font-bold">{t.participants.length} משתתפים ({adults} מבוגרים, {kids} ילדים) = {eq.toLocaleString('he-IL')} מנות מבוגר</p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted"><Prov kind="estimate" />{FOOD_NOTE}</p>
        </div>
        <div className="relative"><Search size={16} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted" aria-hidden />
          <input aria-label="חיפוש מזון" className="field ps-9" placeholder="חיפוש: פסטה, עוף, פיתות…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="סוג מזון">
          <Chip active={g === 'all'} onClick={() => setG('all')}>הכול</Chip>
          {(Object.keys(FOOD_GROUP_HE) as FoodGroup[]).map(k => <Chip key={k} active={g === k} onClick={() => setG(k)}>{FOOD_GROUP_HE[k]}</Chip>)}
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line" aria-label="מזון לבחירה">
          {list.map(x => (
            <li key={x.id}><button type="button" onClick={() => add(fromFood(x))} className="flex w-full items-center gap-2 p-2.5 text-right hover:bg-raised">
              <span className="min-w-0 flex-1"><span className="block font-semibold">{x.name}</span><span className="num block text-xs text-muted">{qtyLabel(x.per, x.unit)} למבוגר{x.note ? ` · ${x.note}` : ''}</span></span>
              <span className="num shrink-0 text-sm font-bold">{qtyLabel(suggested(x.per, x.unit, eq), x.unit)}</span>
              <Plus size={16} className="shrink-0 text-moss" aria-hidden />
            </button></li>))}
          {!list.length && <li className="p-3 text-sm text-muted">לא נמצא ברשימה — אפשר להוסיף בעצמכם למטה.</li>}
        </ul>
        <form className="space-y-2 rounded-xl border border-dashed border-line p-3" onSubmit={e => { e.preventDefault(); if (!name.trim()) return toast('כתבו מה להוסיף'); add(custom(name, qty, unit)); setName(''); setQty(1); }}>
          <p className="text-sm font-bold">משהו אחר</p>
          <div className="flex flex-wrap gap-2">
            <input aria-label="שם המזון" className="field min-w-0 flex-1" placeholder={q || 'למשל: מלוואח'} value={name} onChange={e => setName(e.target.value)} />
            <input aria-label="כמות" type="number" min={0} className="field num w-20" value={qty} onChange={e => setQty(Math.max(0, +e.target.value))} />
            <select aria-label="יחידה" className="field w-24" value={unit} onChange={e => setUnit(e.target.value)}><option value="יח׳">יח׳</option><option value="גר׳">גר׳</option><option value="מ״ל">מ״ל</option><option value="ק״ג">ק״ג</option><option value="ליטר">ליטר</option></select>
            <Button type="submit" size="sm" icon={<Plus size={15} />}>הוספה</Button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}
