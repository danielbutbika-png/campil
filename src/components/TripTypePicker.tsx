// Pick any combination of trip types; each selection may add a short question (e.g. how many bikes).
import { TRIP_TYPES, GROUP_HE, type TripTypeId, type TypeGroup } from '../data/tripTypes';
import { typeQuestions } from '../engine/tripTypes';
import { cx } from './ui';

export function TripTypePicker({ types, answers, onChange }: { types: TripTypeId[]; answers: Record<string, number | boolean>; onChange: (types: TripTypeId[], answers: Record<string, number | boolean>) => void }) {
  const groups = Object.keys(GROUP_HE) as TypeGroup[];
  const toggle = (id: TripTypeId) => onChange(types.includes(id) ? types.filter(x => x !== id) : [...types, id], answers);
  const qs = typeQuestions({ types });
  return (
    <div className="space-y-3">
      {groups.map(g => (
        <fieldset key={g} className="space-y-1.5">
          <legend className="text-sm font-bold text-muted">{GROUP_HE[g]}</legend>
          <div className="flex flex-wrap gap-2">{TRIP_TYPES.filter(x => x.group === g).map(x => {
            const on = types.includes(x.id);
            return <button key={x.id} type="button" aria-pressed={on} title={x.blurb} onClick={() => toggle(x.id)}
              className={cx('min-h-9 rounded-full border px-3 text-sm font-bold transition', on ? 'border-forest bg-forest text-onforest' : 'border-line bg-surface hover:border-moss')}>{x.name}</button>;
          })}</div>
        </fieldset>
      ))}
      {qs.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{qs.map(q => (
        <div key={q.id}><label className="label" htmlFor={`tq-${q.id}`}>{q.label} <span className="font-normal text-muted">({q.type})</span></label>
          {q.kind === 'number'
            ? <input id={`tq-${q.id}`} type="number" inputMode="numeric" min={q.min} max={q.max} className="field" value={typeof answers[q.id] === 'number' ? (answers[q.id] as number) : ''} onChange={e => onChange(types, { ...answers, [q.id]: e.target.value === '' ? (undefined as any) : Math.max(q.min ?? 0, +e.target.value) })} />
            : <input id={`tq-${q.id}`} type="checkbox" className="h-5 w-5" checked={!!answers[q.id]} onChange={e => onChange(types, { ...answers, [q.id]: e.target.checked })} />}
        </div>))}</div>}
      {types.length > 0 && <p className="text-xs text-muted">נבחרו {types.length}. הציוד, המשימות, המדריכים והבדיקות יותאמו לשילוב.</p>}
    </div>
  );
}
