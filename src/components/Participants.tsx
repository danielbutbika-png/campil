import { UserPlus, Baby, X, Users, Home } from 'lucide-react';
import type { Member, Family } from '../lib/types';
import { newFamily } from '../lib/families';
import { isChild } from '../lib/store';
import { uid } from '../lib/util';
import { cx } from './ui';

/** Per-trip participant list: every person has an age and a gender, which drive packing, meals, scoring and recommendations. */
export function missingInfo(ps: Member[]) { return ps.filter(p => p.age == null || !p.gender); }

export function ParticipantsEditor({ value, onChange, family, showErrors }: { value: Member[]; onChange: (v: Member[]) => void; family: Member[]; showErrors?: boolean }) {
  const set = (id: string, p: Partial<Member>) => onChange(value.map(x => (x.id === id ? { ...x, ...p } : x)));
  const add = (child: boolean) => {
    const n = value.filter(x => x.id.startsWith('g')).length + 1;
    onChange([...value, { id: uid('g'), name: child ? `ילד/ה ${n}` : `מבוגר/ת ${n}`, role: child ? 'child' : 'adult', age: undefined, gender: undefined }]);
  };
  const absent = family.filter(f => !value.some(v => v.id === f.id));
  const adults = value.filter(p => !isChild(p)).length, kids = value.length - adults;
  const ages = value.filter(isChild).map(p => p.age).filter(a => a != null).sort((a, b) => a! - b!);
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {value.map((p, i) => {
          const bad = showErrors && (p.age == null || !p.gender);
          return (
            <li key={p.id} className={cx('grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border bg-surface p-2.5 sm:grid-cols-[1fr_88px_auto_auto]', bad ? 'border-danger' : 'border-line')}>
              <input aria-label={`שם משתתף ${i + 1}`} className="field py-2" value={p.name} onChange={e => set(p.id, { name: e.target.value })} />
              <button type="button" aria-label={`הסרת ${p.name}`} onClick={() => onChange(value.filter(x => x.id !== p.id))} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger sm:order-last"><X size={18} /></button>
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <label className="sr-only" htmlFor={`age-${p.id}`}>גיל של {p.name}</label>
                <input id={`age-${p.id}`} type="number" inputMode="numeric" min={0} max={110} placeholder="גיל" className={cx('field num py-2', bad && p.age == null && 'border-danger')}
                  value={p.age ?? ''} onChange={e => { const a = e.target.value === '' ? undefined : Math.max(0, Math.min(110, +e.target.value)); set(p.id, { age: a, role: a != null && a < 18 ? 'child' : a != null ? 'adult' : p.role }); }} />
                <span className="text-xs font-bold text-muted sm:hidden">{p.age != null ? (p.age < 18 ? 'ילד/ה' : 'מבוגר/ת') : ''}</span>
              </div>
              <div role="radiogroup" aria-label={`מגדר של ${p.name}`} className={cx('col-span-2 flex overflow-hidden rounded-xl border sm:col-span-1', bad && !p.gender ? 'border-danger' : 'border-line')}>
                {([['f', 'נקבה'], ['m', 'זכר']] as const).map(([g, l]) => (
                  <button key={g} type="button" role="radio" aria-checked={p.gender === g} onClick={() => set(p.id, { gender: g })}
                    className={cx('flex-1 px-3 py-2 text-sm font-bold transition', p.gender === g ? 'bg-forest text-onforest' : 'bg-surface hover:bg-raised')}>{l}</button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => add(false)} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-bold hover:border-moss"><UserPlus size={16} />מבוגר/ת</button>
        <button type="button" onClick={() => add(true)} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-bold hover:border-moss"><Baby size={16} />ילד/ה</button>
        {absent.map(f => <button key={f.id} type="button" onClick={() => onChange([...value, { ...f }])} className="inline-flex items-center gap-1 rounded-full bg-raised px-3.5 py-2 text-sm font-bold hover:bg-sand">+ {f.name}</button>)}
        {absent.length > 1 && <button type="button" onClick={() => onChange([...value, ...absent.map(f => ({ ...f }))])} className="inline-flex items-center gap-1 rounded-full bg-raised px-3.5 py-2 text-sm font-bold hover:bg-sand"><Users size={15} />כל המשפחה</button>}
      </div>
      <p className="num text-sm font-semibold text-muted" aria-live="polite">
        סה״כ {value.length} משתתפים: {adults} מבוגרים, {kids} ילדים{ages.length ? ` (גילים ${ages.join(', ')})` : ''} · {value.filter(p => p.gender === 'f').length} נשים/בנות, {value.filter(p => p.gender === 'm').length} גברים/בנים
      </p>
      <p className="text-xs text-muted">הגיל והמגדר קובעים את רשימת הביגוד האישית, פריטי היגיינה, כמויות האוכל, התאמת המסלולים וההמלצות לפי מזג האוויר.</p>
    </div>
  );
}

/** Participants grouped into households. One household = the classic single-family editor. */
export function FamiliesEditor({ families, participants, onChange, household, defaultName, showErrors }: {
  families: Family[] | undefined; participants: Member[]; household: Member[]; defaultName: string; showErrors?: boolean;
  onChange: (families: Family[] | undefined, participants: Member[]) => void;
}) {
  const group = (families?.length ?? 0) > 1;
  const toGroup = () => {
    const a = newFamily(0, defaultName), b = newFamily(1);
    onChange([a, b], participants.map(p => ({ ...p, familyId: a.id })));
  };
  const toSingle = () => {
    const keep = families![0].id;
    const others = participants.filter(p => p.familyId !== keep).length;
    if (others && !confirm(`המשתתפים של שאר המשפחות (${others}) יוסרו מהטיול. להמשיך?`)) return;
    onChange(undefined, participants.filter(p => p.familyId === keep).map(p => ({ ...p, familyId: undefined })));
  };
  if (!group) return (
    <div className="space-y-3">
      <ParticipantsEditor value={participants} onChange={v => onChange(undefined, v)} family={household} showErrors={showErrors} />
      <button type="button" onClick={toGroup} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-moss px-3.5 py-2 text-sm font-bold text-moss hover:bg-moss/5"><Home size={16} />יוצאים עם עוד משפחות</button>
    </div>
  );
  const fams = families!;
  const setFam = (id: string, p: Partial<Family>) => onChange(fams.map(f => (f.id === id ? { ...f, ...p } : f)), participants);
  const setPeople = (id: string, v: Member[]) => onChange(fams, [...participants.filter(p => p.familyId !== id), ...v.map(p => ({ ...p, familyId: id }))]);
  const removeFam = (f: Family) => {
    const n = participants.filter(p => p.familyId === f.id).length;
    if (n && !confirm(`להסיר את ${f.name} ואת ${n} המשתתפים שלה?`)) return;
    const rest = fams.filter(x => x.id !== f.id);
    if (rest.length < 2) onChange(undefined, participants.filter(p => p.familyId !== f.id).map(p => ({ ...p, familyId: undefined })));
    else onChange(rest, participants.filter(p => p.familyId !== f.id));
  };
  const total = participants.length;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">כל משפחה רואה ומסמנת רק את הציוד האישי שלה. ציוד משותף — כולם רואים ומסמנים יחד.</p>
      {fams.map((f, i) => (
        <section key={f.id} className="space-y-3 rounded-xl2 border-2 p-3" style={{ borderColor: f.color + '55' }} aria-label={f.name}>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: f.color }} aria-hidden />
            <label className="sr-only" htmlFor={`fam-${f.id}`}>שם המשפחה</label>
            <input id={`fam-${f.id}`} className="field py-2 font-bold" value={f.name} onChange={e => setFam(f.id, { name: e.target.value })} placeholder="שם המשפחה" />
            {i === 0 ? <span className="shrink-0 rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest">המשפחה שלי</span>
              : <button type="button" aria-label={`הסרת ${f.name}`} onClick={() => removeFam(f)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger"><X size={18} /></button>}
          </div>
          <ParticipantsEditor value={participants.filter(p => p.familyId === f.id)} onChange={v => setPeople(f.id, v)} family={i === 0 ? household : []} showErrors={showErrors} />
        </section>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onChange([...fams, newFamily(fams.length)], participants)} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-sm font-bold text-onforest"><Home size={16} />הוספת משפחה</button>
        <button type="button" onClick={toSingle} className="text-sm font-bold text-muted underline">רק משפחה אחת</button>
        <span className="num ms-auto text-sm font-semibold text-muted">{fams.length} משפחות · {total} משתתפים</span>
      </div>
    </div>
  );
}
