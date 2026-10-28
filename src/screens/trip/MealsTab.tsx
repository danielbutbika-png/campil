import { useMemo, useState } from 'react';
import { Share2, RefreshCw, Clock, Users, Flame, Leaf, AlertTriangle, ChefHat, Pencil } from 'lucide-react';
import type { Trip, MealSlot, FamilyDiet } from '../../lib/types';
import { useStore } from '../../lib/store';
import { RECIPES, RECIPE_BY_ID, MEAL_LABEL, KASHRUT_LABEL, type Recipe } from '../../data/recipes';
import { MEATS, VEG, DEFAULT_GRILL, MEAT_G_PER_ADULT, type GrillItem } from '../../data/grill';
import { planMeals, shoppingList, SHOP_LABEL, SHOP_ORDER } from '../../engine/planner';
import { drinkPlan, WATER_SOURCE, DRINK_DEFAULTS } from '../../engine/drinks';
import { Wine, Droplets } from 'lucide-react';
import { dietGroups, eats, anyKosher, anyMehadrin, grillTotals, grillItemsFor, STYLE_HE, KASHRUT_HE, APPETITE_NOTE } from '../../engine/menu';
import { DietsEditor } from '../../components/DietEditor';
import { addDays, fmtDate, shortDay, tripLength } from '../../lib/util';
import { Button, Chip, Sheet, Badge, Section, cx, toast } from '../../components/ui';
import { shareText } from '../../lib/share';

const fmtQty = (q: number, unit: string) => unit === 'גר׳' ? (q >= 1000 ? `${(Math.ceil(q / 100) / 10).toLocaleString('he-IL')} ק״ג` : `${Math.ceil(q / 50) * 50} גר׳`) : `${Math.ceil(q - 1e-9)} ${unit}`;

export default function MealsTab({ t }: { t: Trip }) {
  const { settings, updateTrip } = useStore();
  const fallback = settings.diet;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [grillRecipe, setGrillRecipe] = useState<GrillItem | null>(null);
  const [editDiets, setEditDiets] = useState(false);
  const [draft, setDraft] = useState<Record<string, FamilyDiet> | undefined>(t.diets);
  const { days } = tripLength(t.start, t.end);
  const groups = useMemo(() => dietGroups(t, fallback), [t.participants, t.families, t.diets, fallback]);
  const drinks = useMemo(() => drinkPlan(t, settings), [t.start, t.end, t.kind, t.regionId, t.participants, t.drinks, settings.waterLitersPerPersonDay]);
  const shop = useMemo(() => [...shoppingList(t.meals, t, fallback), ...drinks.lines], [t.meals, t.grill, t.diets, t.participants, drinks]);
  const setDrinks = (p: Partial<NonNullable<Trip['drinks']>>) => updateTrip(t.id, x => ({ drinks: { ...(x.drinks ?? {}), ...p } }));
  const grill = useMemo(() => grillTotals(t, fallback), [t.meals, t.grill, t.diets, t.participants]);
  const choice = t.grill ?? DEFAULT_GRILL;
  const kosher = anyKosher(groups), mehadrin = anyMehadrin(groups);
  const hasMeat = t.meals.some(m => [m.recipeId, m.alt?.recipeId].some(id => id && RECIPE_BY_ID[id]?.kashrut === 'meat'));
  const hasDairy = t.meals.some(m => [m.recipeId, m.alt?.recipeId].some(id => id && RECIPE_BY_ID[id]?.kashrut === 'dairy'));
  const hasGrill = grill.lines.length > 0;
  const setSlot = (id: string, p: Partial<MealSlot>) => updateTrip(t.id, x => ({ meals: x.meals.map(m => (m.id === id ? { ...m, ...p } : m)) }));
  const rebuild = (diets = t.diets) => { updateTrip(t.id, x => ({ diets, meals: planMeals({ ...x, diets }, fallback), pantry: {} })); toast('התפריט נבנה מחדש לפי ההרכב'); };
  const toggleGrill = (kind: 'meats' | 'veg', id: string) => {
    const cur = choice[kind]; const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    if (!next.length) return toast('צריך לפחות פריט אחד');
    updateTrip(t.id, { grill: { ...choice, [kind]: next } });
  };
  const sections = SHOP_ORDER.filter(sec => shop.some(s => s.shop === sec));
  const menuRecipes = [...new Set(t.meals.flatMap(m => [m.recipeId, m.alt?.recipeId]).filter(Boolean) as string[])].map(id => RECIPE_BY_ID[id]).filter(Boolean);
  const grillChosen = [...(hasMeat ? grillItemsFor('meat', t) : []), ...grillItemsFor('veg', t)].filter((g, i, a) => a.indexOf(g) === i && grill.lines.some(l => l.item.id === g.id));
  const listText = () => [`🛒 רשימת קניות — ${t.name}`, `${drinks.people} משתתפים · ${drinks.days} ימים`, ...sections.flatMap(sec => { const rows = shop.filter(s => s.shop === sec && !t.pantry[s.key]); return rows.length ? ['', `*${SHOP_LABEL[sec]}*`, ...rows.map(s => `⬜ ${s.label} ${s.name}`)] : []; })].join('\n');
  const dishOptions = (type: MealSlot['type'], forAlt: { slot: MealSlot } | null) => {
    const main = forAlt?.slot.recipeId ? RECIPE_BY_ID[forAlt.slot.recipeId] : null;
    const eaters = forAlt ? groups.filter(g => !main || !eats(g.diet, main)) : groups;
    return RECIPES.filter(x => x.types.includes(type) || (forAlt && x.id === forAlt.slot.alt?.recipeId)).map(x => ({ x, fit: eaters.filter(g => eats(g.diet, x)).length, all: eaters.length }));
  };

  return (
    <div className="space-y-10">
      <Section title="מי אוכל מה" action={<Button size="sm" variant="soft" icon={<Pencil size={14} />} onClick={() => { setDraft(t.diets); setEditDiets(true); }}>עריכה</Button>}>
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map(g => (
            <div key={g.key} className="rounded-xl2 border border-line bg-surface p-3">
              <p className="font-bold">{g.name || 'כל המשתתפים'} <span className="num text-sm font-normal text-muted">· {g.people.length} סועדים ({g.eq.toLocaleString('he-IL')} מנות מבוגר)</span></p>
              <div className="mt-1.5 flex flex-wrap gap-1.5"><Badge tone={g.diet.style === 'meat' ? 'muted' : 'ok'}>{g.diet.style === 'meat' ? 'בשרי' : STYLE_HE[g.diet.style]}</Badge><Badge tone="info">{KASHRUT_HE[g.diet.kashrut]}</Badge>{g.diet.allergies.map(a => <Badge key={a} tone="warn">ללא {a}</Badge>)}</div>
            </div>))}
        </div>
        <p className="text-xs text-muted">{APPETITE_NOTE}.</p>
        <Button size="sm" variant="ghost" icon={<RefreshCw size={15} />} onClick={() => rebuild()}>בניית תפריט מחדש לפי ההרכב</Button>
      </Section>

      {(mehadrin || (kosher && hasMeat && hasDairy)) && (
        <div className="space-y-1 rounded-xl2 border border-info/40 bg-info/8 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold"><AlertTriangle size={16} />כשרות</p>
          {mehadrin && <p>יש משפחות ששומרות כשרות למהדרין: לקנות בשר, עוף, מוצרי חלב ולחם בהכשר מהדרין, ולבדוק את ההכשר על כל מוצר.</p>}
          {kosher && hasMeat && hasDairy && <p>בתפריט יש ארוחות בשריות וחלביות: להביא כלים נפרדים (מחבת, סכו״ם, קרש חיתוך) ולסמן אותם. בארוחה בשרית לא מוגשת חלופה חלבית.</p>}
        </div>
      )}

      {hasGrill && (
        <Section title="על האש — מה קונים וכמה">
          <div className="space-y-4 rounded-xl2 border border-line bg-surface p-4">
            {grill.meatMeals > 0 && <p className="flex flex-wrap items-baseline gap-2"><Flame size={18} className="self-center text-sunset" /><span className="font-display text-2xl num">{grill.meatKg.toLocaleString('he-IL')} ק״ג</span><span className="text-sm text-muted">בשר נא סה״כ · {grill.meatMeals} {grill.meatMeals === 1 ? 'ארוחת מנגל' : 'ארוחות מנגל'} · {grill.meatEq.toLocaleString('he-IL')} מנות מבוגר × {MEAT_G_PER_ADULT} גר׳ (הערכה מקובלת 300–400 גר׳ למבוגר)</span></p>}
            {hasMeat && <div><p className="label">בשרים — בחרו מה עולה על האש (הכמות מתחלקת ביניהם)</p><div className="flex flex-wrap gap-2">{MEATS.map(m => <Chip key={m.id} active={choice.meats.includes(m.id)} onClick={() => toggleGrill('meats', m.id)}>{m.name}</Chip>)}</div></div>}
            <div><p className="label flex items-center gap-1.5"><Leaf size={14} />צמחוני / טבעוני{kosher && hasMeat ? ' — בארוחה בשרית יוגשו רק פריטים פרווה' : ''}</p><div className="flex flex-wrap gap-2">{VEG.map(m => <Chip key={m.id} active={choice.veg.includes(m.id)} onClick={() => toggleGrill('veg', m.id)}>{m.name}{m.kashrut === 'dairy' ? ' (חלבי)' : m.vegan ? '' : ''}</Chip>)}</div></div>
            <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {grill.lines.map(l => <li key={l.item.id} className="flex items-baseline justify-between gap-2 border-b border-line/60 py-1"><span>{l.item.name}</span><span className="num font-bold">{fmtQty(l.qty, l.unit)}</span></li>)}
            </ul>
            <p className="text-xs text-muted">הכמויות נכנסות אוטומטית לרשימת הקניות. כמות מומלצת — לא מחייבת; משפחות עם ילדים קטנים יכולות להוריד.</p>
          </div>
        </Section>
      )}

      <Section title="תפריט הטיול">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: days }, (_, d) => (
            <section key={d} className="rounded-xl2 border border-line bg-surface">
              <h3 className="border-b border-line px-4 py-3 font-bold">יום {d + 1} · {shortDay(addDays(t.start, d))} {fmtDate(addDays(t.start, d))}</h3>
              <ul className="divide-y divide-line">
                {t.meals.filter(m => m.day === d).map(m => {
                  const r = m.recipeId ? RECIPE_BY_ID[m.recipeId] : null;
                  const a = m.alt?.recipeId ? RECIPE_BY_ID[m.alt.recipeId] : null;
                  return (
                    <li key={m.id} className="space-y-1.5 px-4 py-3">
                      <div className="flex items-center gap-2"><span className="w-14 shrink-0 text-sm font-bold text-muted">{MEAL_LABEL[m.type]}</span>
                        <select aria-label={`מנה ל${MEAL_LABEL[m.type]} יום ${d + 1}`} className="field min-w-0 flex-1 py-1.5 text-sm" value={m.recipeId ?? ''} onChange={e => setSlot(m.id, { recipeId: e.target.value || null })}>
                          <option value="">— ללא —</option>{dishOptions(m.type, null).map(({ x, fit, all }) => <option key={x.id} value={x.id}>{x.name}{fit < all ? (fit ? ' (לא לכולם)' : ' (לא מתאים)') : ''}</option>)}
                        </select>
                      </div>
                      {r && <div className="flex flex-wrap items-center gap-2 ps-16 text-xs text-muted"><button className="font-bold text-moss" onClick={() => setRecipe(r)}>מתכון</button><span>{KASHRUT_LABEL[r.kashrut]}</span><span className="flex items-center gap-0.5"><Users size={12} />
                        <input aria-label="מספר סועדים" type="number" min={1} className="num w-12 rounded border border-line bg-surface px-1" value={m.servings} onChange={e => { const n = Math.max(1, +e.target.value); setSlot(m.id, { servings: n, eq: m.eq ? Math.round((m.eq / m.servings) * n * 10) / 10 : undefined }); }} /></span></div>}
                      {m.alt && (
                        <div className="ms-16 space-y-1 rounded-lg bg-moss/8 p-2">
                          <p className="text-xs font-bold text-moss">חלופה ל{m.alt.who} · {m.alt.servings} סועדים</p>
                          <select aria-label={`חלופה ל${MEAL_LABEL[m.type]} יום ${d + 1}`} className="field py-1 text-sm" value={m.alt.recipeId ?? ''} onChange={e => setSlot(m.id, { alt: { ...m.alt!, recipeId: e.target.value || null } })}>
                            <option value="">— ללא —</option>{dishOptions(m.type, { slot: m }).filter(o => o.fit === o.all).map(({ x }) => <option key={x.id} value={x.id}>{x.name}</option>)}
                          </select>
                          {a && <button className="text-xs font-bold text-moss" onClick={() => setRecipe(a)}>מתכון · {KASHRUT_LABEL[a.kashrut]}</button>}
                        </div>
                      )}
                    </li>);
                })}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section title="מתכונים מומלצים">
        <p className="text-sm text-muted">לפי מה שבתפריט ומה שבחרתם לעלות על האש.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grillChosen.map(g => (
            <button key={g.id} onClick={() => setGrillRecipe(g)} className="rounded-xl2 border border-line bg-surface p-3 text-right hover:border-moss">
              <span className="flex items-center gap-1.5 font-bold">{g.kashrut === 'meat' ? <Flame size={15} className="text-sunset" /> : <Leaf size={15} className="text-moss" />}{g.recipe.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{g.recipe.minutes} דק׳ · {KASHRUT_LABEL[g.kashrut]}{g.vegan ? ' · טבעוני' : ''}</span>
            </button>))}
          {menuRecipes.filter(r => !r.grill).map(r => (
            <button key={r.id} onClick={() => setRecipe(r)} className="rounded-xl2 border border-line bg-surface p-3 text-right hover:border-moss">
              <span className="flex items-center gap-1.5 font-bold"><ChefHat size={15} className="text-muted" />{r.name}</span>
              <span className="mt-0.5 block text-xs text-muted">{r.prepMin} דק׳ · {KASHRUT_LABEL[r.kashrut]}{r.vegan ? ' · טבעוני' : r.vegetarian ? ' · צמחוני' : ''}</span>
            </button>))}
        </div>
      </Section>

      <Section title="רשימת קניות מאוחדת" action={<Button size="sm" variant="soft" icon={<Share2 size={15} />} onClick={() => shareText('רשימת קניות', listText())}>שיתוף</Button>}>
        <p className="text-sm text-muted">מסודר לפי מחלקות בסופר, עם כמויות מעוגלות כלפי מעלה (מתכונים × מנות לפי הגיל). סמנו מה כבר יש — השיתוף שולח רק את מה שחסר.</p>
        <div className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
          <p className="flex items-center gap-2 font-bold"><Droplets size={17} className="text-info" />שתייה</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="dw">מים — ליטר לאדם ליום</label><input id="dw" type="number" min={1} step={0.5} className="field num" value={t.drinks?.waterL ?? ''} placeholder={`${drinks.water.liters} (מומלץ)`} onChange={e => setDrinks({ waterL: e.target.value ? +e.target.value : undefined })} />
              <p className="mt-1 text-xs text-muted">{drinks.water.why} · <a className="underline" href={WATER_SOURCE.url} target="_blank" rel="noreferrer">מקור</a> · ביום חם ובמסלול ארוך — יותר.</p></div>
            <div><label className="label" htmlFor="ds">שתייה קלה / מיץ — ליטר לאדם ליום</label><input id="ds" type="number" min={0} step={0.25} className="field num" value={t.drinks?.softL ?? ''} placeholder={`${DRINK_DEFAULTS.softL} (הערכה)`} onChange={e => setDrinks({ softL: e.target.value === '' ? undefined : +e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--forest))]" checked={drinks.plan.alcohol} onChange={e => setDrinks({ alcohol: e.target.checked })} /><Wine size={16} />אלכוהול למבוגרים ({drinks.adults} בגיל 18+)</label>
          {drinks.plan.alcohol && <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="db">בירות לכל מבוגר בערב</label><input id="db" type="number" min={0} className="field num" value={t.drinks?.beerPerAdult ?? ''} placeholder={`${DRINK_DEFAULTS.beerPerAdult} (הערכה)`} onChange={e => setDrinks({ beerPerAdult: e.target.value === '' ? undefined : +e.target.value })} /></div>
            <div><label className="label" htmlFor="dv">בקבוק יין לכל … מבוגרים בערב</label><input id="dv" type="number" min={1} className="field num" value={t.drinks?.adultsPerWine ?? ''} placeholder={`${DRINK_DEFAULTS.adultsPerWine} (הערכה)`} onChange={e => setDrinks({ adultsPerWine: e.target.value ? Math.max(1, +e.target.value) : undefined })} /></div>
            <p className="text-xs text-muted sm:col-span-2">מי שנוהג לא שותה.{kosher ? ' יין — בהכשר המתאים למשפחות ששומרות כשרות.' : ''}</p>
          </div>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(sec => (
            <section key={sec} className="rounded-xl2 border border-line bg-surface">
              <h3 className="border-b border-line px-4 py-3 font-bold">{SHOP_LABEL[sec]}</h3>
              <ul className="divide-y divide-line">{shop.filter(s => s.shop === sec).map(s => (
                <li key={s.key}><label className="flex cursor-pointer items-center gap-3 px-4 py-2.5">
                  <input type="checkbox" className="h-5 w-5 shrink-0 accent-[rgb(var(--forest))]" checked={!!t.pantry[s.key]} onChange={e => updateTrip(t.id, x => ({ pantry: { ...x.pantry, [s.key]: e.target.checked } }))} />
                  <span className={cx('min-w-0 flex-1', t.pantry[s.key] && 'text-muted line-through')}>{s.name}<span className="block truncate text-xs text-muted">{s.recipes.join(', ')}</span></span>
                  <span className="num shrink-0 font-bold">{s.unit === 'יח׳' ? `× ${s.label}` : s.label}</span>{t.pantry[s.key] && <Badge>יש</Badge>}
                </label></li>))}</ul>
            </section>
          ))}
        </div>
        {!shop.length && <p className="text-muted">אין מנות בתפריט עדיין.</p>}
      </Section>

      <Sheet open={!!recipe} onClose={() => setRecipe(null)} title={recipe?.name ?? ''}>
        {recipe && <div className="space-y-4">
          <div className="flex flex-wrap gap-2"><Badge>{KASHRUT_LABEL[recipe.kashrut]}</Badge><Badge><Clock size={12} />{recipe.prepMin} דק׳</Badge>{recipe.vegan ? <Badge tone="ok">טבעוני</Badge> : recipe.vegetarian && <Badge tone="ok">צמחוני</Badge>}{recipe.allergens.map(a => <Badge key={a} tone="warn">{a}</Badge>)}</div>
          {recipe.grill && <p className="rounded-xl bg-raised/60 p-3 text-sm">מה עולה על האש נקבע בכרטיס "על האש" — לכל פריט יש מתכון משלו ב"מתכונים מומלצים".</p>}
          <div><h4 className="font-bold">מצרכים למנה אחת</h4><ul className="list-inside list-disc text-sm">{recipe.ingredients.map(i => <li key={i.name}>{i.name} — {i.qty} {i.unit}</li>)}</ul></div>
          <div><h4 className="font-bold">ציוד</h4><p className="text-sm">{recipe.gear.join(', ')}</p></div>
          <div><h4 className="font-bold">הכנה</h4><ol className="list-inside list-decimal space-y-1 text-sm">{recipe.steps.map(s => <li key={s}>{s}</li>)}</ol></div>
        </div>}
      </Sheet>
      <Sheet open={!!grillRecipe} onClose={() => setGrillRecipe(null)} title={grillRecipe?.recipe.title ?? ''}>
        {grillRecipe && <div className="space-y-4">
          <div className="flex flex-wrap gap-2"><Badge>{KASHRUT_LABEL[grillRecipe.kashrut]}</Badge><Badge><Clock size={12} />{grillRecipe.recipe.minutes} דק׳</Badge>{grillRecipe.vegan && <Badge tone="ok">טבעוני</Badge>}{grillRecipe.allergens.map(a => <Badge key={a} tone="warn">{a}</Badge>)}</div>
          <div><h4 className="font-bold">מצרכים למנת מבוגר (כשזה הפריט היחיד על האש)</h4><ul className="list-inside list-disc text-sm">{[grillRecipe.portion, ...grillRecipe.recipe.extra].map(i => <li key={i.name}>{i.name} — {i.qty} {i.unit}</li>)}</ul></div>
          <div><h4 className="font-bold">הכנה</h4><ol className="list-inside list-decimal space-y-1 text-sm">{grillRecipe.recipe.steps.map(s => <li key={s}>{s}</li>)}</ol></div>
          {grillRecipe.recipe.tip && <p className="rounded-xl bg-warn/10 p-3 text-sm font-semibold">{grillRecipe.recipe.tip}</p>}
        </div>}
      </Sheet>
      <Sheet open={editDiets} onClose={() => setEditDiets(false)} title="מי אוכל מה" wide footer={<><Button onClick={() => { setEditDiets(false); rebuild(draft); }}>שמירה ובניית תפריט</Button><Button variant="soft" onClick={() => { setEditDiets(false); updateTrip(t.id, { diets: draft }); toast('נשמר — התפריט לא השתנה'); }}>שמירה בלבד</Button></>}>
        <DietsEditor t={{ ...t, diets: draft }} fallback={fallback} onChange={setDraft} />
      </Sheet>
    </div>
  );
}
