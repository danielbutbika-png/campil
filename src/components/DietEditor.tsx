import type { FamilyDiet, DietPrefs, Trip } from '../lib/types';
import { ALLERGENS } from '../data/recipes';
import { STYLE_HE, KASHRUT_HE, dietFromSettings } from '../engine/menu';
import { Chip, Segmented } from './ui';

/** Diet of one family: meat/vegetarian/vegan, kashrut level, allergies. */
export function DietPicker({ value, onChange, idp }: { value: FamilyDiet; onChange: (d: FamilyDiet) => void; idp: string }) {
  return (
    <div className="space-y-3">
      <Segmented label="מה אוכלים" value={value.style} onChange={v => onChange({ ...value, style: v })} options={(['meat', 'vegetarian', 'vegan'] as const).map(v => ({ v, label: v === 'meat' ? 'בשרי (הכול)' : STYLE_HE[v] }))} />
      <Segmented label="רמת כשרות" value={value.kashrut} onChange={v => onChange({ ...value, kashrut: v })} options={(['none', 'kosher', 'mehadrin'] as const).map(v => ({ v, label: KASHRUT_HE[v] }))} />
      <div role="group" aria-label={`אלרגיות ${idp}`} className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-bold text-muted">ללא:</span>
        {ALLERGENS.map(a => <Chip key={a} active={value.allergies.includes(a)} onClick={() => onChange({ ...value, allergies: value.allergies.includes(a) ? value.allergies.filter(x => x !== a) : [...value.allergies, a] })}>{a}</Chip>)}
      </div>
    </div>
  );
}

/** Diet per family (or one diet for a one-family trip). */
export function DietsEditor({ t, fallback, onChange }: { t: Pick<Trip, 'families' | 'diets' | 'participants'>; fallback: DietPrefs; onChange: (d: Record<string, FamilyDiet>) => void }) {
  const fams = t.families && t.families.length > 1 ? t.families : [{ id: 'all', name: '', color: '#2f6b3f' }];
  const base = dietFromSettings(fallback);
  const cur = (id: string) => t.diets?.[id] ?? base;
  return (
    <div className="space-y-3">
      {fams.map(f => (
        <section key={f.id} className="space-y-2 rounded-xl2 border border-line bg-surface p-3" aria-label={f.name ? `תזונה — ${f.name}` : 'תזונה'}>
          {f.name && <p className="flex items-center gap-2 font-bold"><span className="h-3 w-3 rounded-full" style={{ background: f.color }} />{f.name}<span className="text-xs font-normal text-muted">{(t.participants ?? []).filter(p => p.familyId === f.id).length} משתתפים</span></p>}
          <DietPicker idp={f.name} value={cur(f.id)} onChange={d => onChange({ ...Object.fromEntries(fams.map(x => [x.id, cur(x.id)])), [f.id]: d })} />
        </section>
      ))}
    </div>
  );
}
