// "What can we cook from what we have?" — mark ingredients and kitchen gear; see ready / almost-ready recipes.
import { useMemo, useState } from 'react';
import { ChefHat, Clock, Check, ShoppingBasket } from 'lucide-react';
import { useStore } from '../lib/store';
import { whatCanICook, allIngredients, allGear, gearFromInventory, BASICS, type CookMatch } from '../engine/cook';
import { KASHRUT_LABEL, type Recipe } from '../data/recipes';
import { todayISO } from '../lib/util';
import type { FamilyDiet } from '../lib/types';
import { Badge, Button, Chip, Sheet, cx, toast } from '../components/ui';

const STATUS_HE: Record<CookMatch['status'], string> = { ready: 'אפשר להכין', almost: 'חסרים 1–2 פריטים', far: 'חסר הרבה' };

export default function Cook() {
  const { settings, setSettings, inventory, trips } = useStore();
  const cook = settings.cook ?? { ing: [], gear: gearFromInventory(inventory) };
  const save = (p: Partial<typeof cook>) => setSettings({ cook: { ...cook, ...p } });
  const toggle = (k: 'ing' | 'gear', v: string) => save({ [k]: cook[k].includes(v) ? cook[k].filter(x => x !== v) : [...cook[k], v] });
  const [useDiet, setUseDiet] = useState(true);
  const [open, setOpen] = useState<Recipe | null>(null);
  const [showFar, setShowFar] = useState(false);
  const diet: FamilyDiet = { style: settings.diet.vegan ? 'vegan' : settings.diet.vegetarian ? 'vegetarian' : 'meat', kashrut: settings.diet.kosher ? 'kosher' : 'none', allergies: settings.diet.allergies };
  const list = useMemo(() => whatCanICook(cook.ing, cook.gear, useDiet ? diet : undefined), [cook, useDiet, settings.diet]);
  const ings = allIngredients(); const gear = allGear();
  const trip = trips.filter(t => t.status === 'planning' && t.end >= todayISO() && !t.example).sort((a, b) => a.start.localeCompare(b.start))[0];
  const fromPantry = () => {
    if (!trip) return;
    const names = Object.entries(trip.pantry).filter(([, v]) => v).map(([k]) => k.split('|')[0]).filter(n => ings.includes(n));
    save({ ing: [...new Set([...cook.ing, ...names])] }); toast(names.length ? `נוספו ${names.length} מצרכים שסימנתם "יש" בטיול` : 'לא סומנו מצרכים כ"יש" ברשימת הקניות של הטיול');
  };
  const shown = list.filter(m => showFar || m.status !== 'far');
  return (
    <div className="gutter mx-auto max-w-5xl space-y-6 py-6">
      <header className="space-y-1"><h1 className="flex items-center gap-2 font-display text-3xl"><ChefHat size={28} className="text-moss" />מה אפשר להכין ממה שיש?</h1>
        <p className="text-muted">סמנו מצרכים וכלים שיש לכם. {BASICS.slice(0, 3).join(', ')} ותבלינים נחשבים כבסיס שיש תמיד.</p></header>

      <section aria-labelledby="ing-h" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="ing-h" className="font-bold">מצרכים ({cook.ing.length})</h2>
          <div className="flex gap-2">{trip && <Button size="sm" variant="soft" icon={<ShoppingBasket size={15} />} onClick={fromPantry}>ממה שסימנתם "יש" בטיול</Button>}{cook.ing.length > 0 && <Button size="sm" variant="ghost" onClick={() => save({ ing: [] })}>ניקוי</Button>}</div></div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="מצרכים שיש">{ings.map(n => <Chip key={n} active={cook.ing.includes(n)} onClick={() => toggle('ing', n)}>{n}</Chip>)}</div>
      </section>
      <section aria-labelledby="gr-h" className="space-y-2">
        <h2 id="gr-h" className="font-bold">כלים ({cook.gear.length})</h2>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="כלים שיש">{gear.map(n => <Chip key={n} active={cook.gear.includes(n)} onClick={() => toggle('gear', n)}>{n}</Chip>)}</div>
        <p className="text-xs text-muted">סומנו מראש כלים שמופיעים במאגר הציוד שלכם.</p>
      </section>

      <section aria-labelledby="res-h" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="res-h" className="font-display text-xl">מתכונים</h2>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={useDiet} onChange={e => setUseDiet(e.target.checked)} />לפי התזונה בהגדרות{settings.diet.allergies.length ? ` (בלי ${settings.diet.allergies.join(', ')})` : ''}</label></div>
        <ul className="grid gap-3 sm:grid-cols-2" aria-label="מתכונים מתאימים" aria-live="polite">{shown.map(m => (
          <li key={m.recipe.id} className={cx('space-y-2 rounded-xl2 border bg-surface p-4', m.status === 'ready' ? 'border-ok/50' : 'border-line')}>
            <div className="flex flex-wrap items-center gap-2"><span className="flex-1 font-bold">{m.recipe.name}</span><Badge tone={m.status === 'ready' ? 'ok' : m.status === 'almost' ? 'warn' : 'muted'}>{m.status === 'ready' && <Check size={12} />}{STATUS_HE[m.status]}</Badge></div>
            <p className="num text-sm text-muted"><Clock size={13} className="inline" /> {m.recipe.prepMin} דק׳ · {KASHRUT_LABEL[m.recipe.kashrut]} · {m.have}/{m.total} מצרכים</p>
            {m.missingIng.length > 0 && <p className="text-sm">חסר: {m.missingIng.join(', ')}</p>}
            {m.missingGear.length > 0 && <p className="text-sm text-warn">צריך כלים: {m.missingGear.join(', ')}</p>}
            <Button size="sm" variant="soft" onClick={() => setOpen(m.recipe)}>מתכון</Button>
          </li>))}</ul>
        {!shown.length && <p className="text-muted">{cook.ing.length ? 'אין עדיין מתכון קרוב — סמנו עוד מצרכים או כלים.' : 'סמנו מצרכים כדי לראות מתכונים.'}</p>}
        {list.some(m => m.status === 'far') && <button type="button" className="text-sm font-bold text-moss" onClick={() => setShowFar(!showFar)}>{showFar ? 'רק מה שקרוב' : 'הצגת כל המתכונים שיש להם חלק מהמצרכים'}</button>}
      </section>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''}>
        {open && <div className="space-y-3">
          <div className="flex flex-wrap gap-2"><Badge>{KASHRUT_LABEL[open.kashrut]}</Badge>{open.allergens.map(a => <Badge key={a} tone="warn">{a}</Badge>)}</div>
          <div><h4 className="font-bold">מצרכים למנה</h4><ul className="list-inside list-disc text-sm">{open.ingredients.map(i => <li key={i.name} className={cook.ing.includes(i.name) ? '' : 'text-muted'}>{i.name} — {i.qty} {i.unit}{!cook.ing.includes(i.name) && !BASICS.some(b => i.name.startsWith(b)) ? ' (חסר)' : ''}</li>)}</ul></div>
          <div><h4 className="font-bold">כלים</h4><p className="text-sm">{open.gear.join(', ')}</p></div>
          <div><h4 className="font-bold">הכנה</h4><ol className="list-inside list-decimal space-y-1 text-sm">{open.steps.map(s => <li key={s}>{s}</li>)}</ol></div>
          <p className="text-xs text-muted">בטיחות מזון בשטח: מוצרי בשר, עוף, חלב וביצים שומרים בצידנית קרה, ומבשלים בשר ועוף עד הסוף.</p>
        </div>}
      </Sheet>
    </div>
  );
}
