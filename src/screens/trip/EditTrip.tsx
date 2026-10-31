import { useState } from 'react';
import type { Trip, Interest, RegionId } from '../../lib/types';
import { useStore, withCounts } from '../../lib/store';
import { FamiliesEditor, missingInfo } from '../../components/Participants';
import { normalizeFamilies, isGroup } from '../../lib/families';
import { REGIONS } from '../../data/regions';
import { SITES } from '../../data/sites';
import { INTEREST_HE } from '../../engine/scoring';
import { tripLength } from '../../lib/util';
import { Button, Chip, Sheet, Toggle, Segmented, toast } from '../../components/ui';
import { TripTypePicker } from '../../components/TripTypePicker';
import { LocationPicker } from '../../components/LocationPicker';
import { DestSearch } from '../../components/DestSearch';
import { impliedBy, typeTasks } from '../../engine/tripTypes';
import { uid } from '../../lib/util';

const INTERESTS = Object.keys(INTEREST_HE) as Interest[];

export default function EditTrip({ t, onClose, onSave }: { t: Trip; onClose: () => void; onSave: (p: Partial<Trip>) => void }) {
  const members = useStore(s => s.members); const famName = useStore(s => s.settings.familyName);
  const [d, setD] = useState(t);
  const set = (p: Partial<Trip>) => setD(x => withCounts({ ...x, ...p }) as Trip);
  const [tried, setTried] = useState(false);
  const { days, nights } = tripLength(d.start, d.end);
  const save = () => {
    if (d.end < d.start) return toast('תאריך החזרה לפני היציאה');
    if (missingInfo(d.participants).length) { setTried(true); return toast('השלימו מגדר לכל משתתף'); }
    if (d.adults < 1) return toast('צריך לפחות מבוגר אחד');
    if (isGroup(d) && d.families!.some(f => !d.participants.some(p => p.familyId === f.id))) return toast('יש משפחה בלי משתתפים');
    onSave({ types: d.types, typeAnswers: d.typeAnswers, tasks: withTypeTasks(t, d), name: d.name, start: d.start, end: d.end, participants: d.participants, families: d.families, adults: d.adults, children: d.children, childAges: d.childAges, memberIds: d.memberIds, pets: d.pets, kind: d.kind, lodging: d.lodging, vehicle: d.vehicle, regionId: d.regionId, siteIds: d.siteIds, interests: d.interests, dest: d.dest, places: d.places });
  };
  const regionSites = SITES.filter(s => !d.regionId || s.region === d.regionId);
  return (
    <Sheet open onClose={onClose} title="עריכת פרטי הטיול" wide footer={<><Button onClick={save}>שמירה ועדכון ההמלצות</Button><Button variant="ghost" onClick={onClose}>ביטול</Button></>}>
      <div className="space-y-5">
        <div><label className="label" htmlFor="en">שם</label><input id="en" className="field" value={d.name} onChange={e => set({ name: e.target.value })} /></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="label" htmlFor="es">יציאה</label><input id="es" type="date" className="field" value={d.start} onChange={e => set({ start: e.target.value, end: e.target.value > d.end ? e.target.value : d.end })} /></div>
          <div><label className="label" htmlFor="ee">חזרה</label><input id="ee" type="date" min={d.start} className="field" value={d.end} onChange={e => set({ end: e.target.value })} /></div>
          <p className="num self-end rounded-xl bg-forest/8 px-4 py-2.5 font-bold text-forest">{days} ימים · {nights} לילות</p>
        </div>
        <div><span className="label">משתתפים ומשפחות</span><FamiliesEditor families={d.families} participants={d.participants} household={members} defaultName={famName || 'המשפחה שלי'} showErrors={tried} onChange={(families, ps) => set({ families, participants: normalizeFamilies(families, ps) })} /></div>
        <div><span className="label">מה מאפיין את הטיול? (אפשר כמה)</span><TripTypePicker types={d.types ?? []} answers={d.typeAnswers ?? {}} onChange={(types, typeAnswers) => set({ types, typeAnswers, ...impliedBy(types, d) })} /></div>
        <Segmented label="סוג הטיול" value={d.kind} onChange={v => set({ kind: v })} options={[{ v: 'camping', label: 'קמפינג' }, { v: 'day', label: 'טיול יום' }, { v: 'combined', label: 'משולב' }]} />
        {d.kind !== 'day' && <Segmented label="לינה" value={d.lodging} onChange={v => set({ lodging: v })} options={[{ v: 'tent', label: 'אוהל' }, { v: 'equipped_site', label: 'חניון מאובזר' }, { v: 'caravan', label: 'קרוואן' }, { v: 'other', label: 'אחר' }]} />}
        <Toggle checked={d.pets} onChange={v => set({ pets: v })} label="חיות מחמד מצטרפות" />
        <div><span className="label">מיקום הטיול (לינה / יעד)</span><LocationPicker t={d} onChange={set} /></div>
        <div><span className="label">תחנות במסלול</span><DestSearch t={d} onChange={set} /></div>
        <div><label className="label" htmlFor="er">אזור</label><select id="er" className="field" value={d.regionId ?? ''} onChange={e => set({ regionId: (e.target.value || null) as RegionId })}><option value="">—</option>{REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
        <div><span className="label">אתרים בתוכנית</span><div className="flex flex-wrap gap-2">{regionSites.map(s => <Chip key={s.id} active={d.siteIds.includes(s.id)} onClick={() => set({ siteIds: d.siteIds.includes(s.id) ? d.siteIds.filter(x => x !== s.id) : [...d.siteIds, s.id] })}>{s.name}</Chip>)}</div></div>
        <div><span className="label">תחומי עניין</span><div className="flex flex-wrap gap-2">{INTERESTS.map(i => <Chip key={i} active={d.interests.includes(i)} onClick={() => set({ interests: d.interests.includes(i) ? d.interests.filter(x => x !== i) : [...d.interests, i] })}>{INTEREST_HE[i]}</Chip>)}</div></div>
      </div>
    </Sheet>
  );
}

const WHEN: Record<string, number> = { 'שבוע לפני': -7, 'יום-יומיים לפני': -2, 'ערב לפני': -1, 'בוקר היציאה': 0 };
/** Tasks of newly selected trip types are added (existing tasks, done or not, are kept). */
function withTypeTasks(before: Trip, after: Trip) {
  const have = new Set(before.tasks.map(k => k.text));
  const add = typeTasks(after).filter(k => !have.has(k.text)).map(k => ({ id: uid('t'), when: k.when, text: k.text, done: false, dueOffsetDays: WHEN[k.when] ?? 0 }));
  return add.length ? [...before.tasks, ...add].sort((a, b) => a.dueOffsetDays - b.dueOffsetDays) : before.tasks;
}
