import { useMemo, useState } from 'react';
import { Plus, Printer, Share2, Copy, RotateCcw, EyeOff, Search, Info } from 'lucide-react';
import type { Trip, PackItem, CategoryId } from '../../lib/types';
import { useStore } from '../../lib/store';
import { CATEGORIES, CAT_BY_ID } from '../../data/catalog';
import { readiness } from '../../engine/packing';
import { Button, Chip, Ring, Sheet, Blaze, Badge, cx, toast } from '../../components/ui';
import { shareText, packingText } from '../../lib/share';
import { uid } from '../../lib/util';
import { stamp, ago } from '../../components/Collab';
import { useCloud } from '../../lib/cloud/sync';
import { isGroup, itemFamily, familyById, visibleIn, useFamilyView, myFamily, canSeeAll, type View } from '../../lib/families';
import { Prov } from '../../components/Provenance';
import { WATER_SOURCE } from '../../engine/drinks';
import { coverage, setShare, packedUnits, packUnits } from '../../engine/partial';

type Group = 'category' | 'box' | 'person' | 'family';

export default function GearTab({ t }: { t: Trip }) {
  const { boxes, trips, updatePack, updateTrip } = useStore();
  const members = t.participants;
  const [group, setGroup] = useState<Group>('category');
  const [filter, setFilter] = useState<'all' | 'todo' | 'missing'>('all');
  const [q, setQ] = useState('');
  const [add, setAdd] = useState(false);
  const [copyFrom, setCopyFrom] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);
  const [why, setWhy] = useState<PackItem | null>(null);
  const group2 = isGroup(t);
  const [view, setView, viewOpts] = useFamilyView(t);
  const mine = t.packing.filter(p => visibleIn(t, p, view));
  const r = readiness(mine);
  const items = mine.filter(p => (showRemoved ? p.removed : !p.removed) && (filter === 'all' || (filter === 'todo' ? !p.packed : p.missing)) && (!q || p.name.includes(q)));
  const groups = useMemo(() => {
    const m = new Map<string, { title: string; color: string; items: PackItem[] }>();
    for (const p of items) {
      let k: string, title: string, color: string;
      if (group === 'category') { k = p.category; title = CAT_BY_ID[p.category]?.name ?? 'שונות'; color = CAT_BY_ID[p.category]?.blaze ?? '#777'; }
      else if (group === 'box') { const b = boxes.find(x => x.id === p.boxId); k = b?.id ?? 'loose'; title = b?.name ?? 'ללא ארגז / ציוד גדול'; color = b?.color ?? '#999'; }
      else if (group === 'family') { const f = familyById(t, itemFamily(t, p)); k = f?.id ?? 'shared'; title = f ? `${f.name} — רק המשפחה רואה` : 'משותף לכולם'; color = f?.color ?? '#5d7a3a'; }
      else { const mm = members.find(x => x.id === p.assignee); k = mm?.id ?? 'shared'; title = mm?.name ?? 'משותף'; color = mm ? '#3c6e9f' : '#5d7a3a'; }
      const g = m.get(k) ?? { title, color, items: [] }; g.items.push(p); m.set(k, g);
    }
    return [...m.values()].sort((a, b) => b.items.length - a.items.length);
  }, [items, group, t.families]);
  const prev = trips.filter(x => x.id !== t.id && x.packing.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-xl2 border border-line bg-surface p-4">
        <Ring pct={r.pct} size={70} />
        <div className="flex-1"><p className="font-display text-xl">רשימת ציוד{group2 && view !== 'all' ? ` — ${familyById(t, view)?.name}` : ''}</p><p className="num text-sm text-muted">{r.done}/{r.total} ארוזים{r.missing ? ` · ${r.missing} חסרים` : ''} · עודכנה אוטומטית לפי פרטי הטיול והתחזית</p></div>
        <div className="no-print flex flex-wrap gap-2">
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setAdd(true)}>פריט</Button>
          <Button size="sm" variant="soft" icon={<Share2 size={16} />} onClick={() => shareText('רשימת ציוד', packingText({ ...t, packing: mine }, members))}>שיתוף</Button>
          <Button size="sm" variant="soft" icon={<Printer size={16} />} onClick={() => print()}>PDF / הדפסה</Button>
          {prev.length > 0 && <Button size="sm" variant="soft" icon={<Copy size={16} />} onClick={() => setCopyFrom(true)}>משטיול קודם</Button>}
        </div>
      </div>

      {group2 && (
        <div className="no-print space-y-2 rounded-xl2 border border-line bg-surface p-3">
          {viewOpts.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="איזו משפחה להציג">
              {viewOpts.map(v => { const f = familyById(t, v); return <Chip key={v} active={view === v} onClick={() => setView(v)}>{f ? <><span className="me-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />{f.name}</> : 'כל המשפחות'}</Chip>; })}
            </div>
          ) : familyById(t, view) ? <p className="flex items-center gap-2 font-bold"><span className="inline-block h-3 w-3 rounded-full" style={{ background: familyById(t, view)?.color }} />{familyById(t, view)?.name}</p>
            : <p className="font-bold">עוד לא שויכתם למשפחה</p>}
          <p className="text-xs text-muted">{view === 'all' ? 'כל הציוד של כל המשפחות — עד שמשתפים את הטיול. אחרי השיתוף כל משפחה רואה רק את הרשימה שלה.' : familyById(t, view) ? 'מוצג: הציוד של המשפחה שלכם — רק אתם רואים ומסמנים אותו — והציוד המשותף לכולם.' : 'בינתיים מוצג רק הציוד המשותף. המארגן יכול לשייך אתכם למשפחה.'}</p>
          {t.shared && <FamilyProgress t={t} />}
        </div>
      )}

      <div className="no-print flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" /><input aria-label="חיפוש פריט" className="field pr-9" placeholder="חיפוש פריט" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select aria-label="קיבוץ" className="field w-auto" value={group} onChange={e => setGroup(e.target.value as Group)}><option value="category">לפי קטגוריה</option><option value="box">לפי ארגז / תיק</option><option value="person">לפי משתתף</option>{group2 && <option value="family">משותף / משפחה</option>}</select>
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>הכול</Chip><Chip active={filter === 'todo'} onClick={() => setFilter('todo')}>לא ארוז</Chip><Chip active={filter === 'missing'} onClick={() => setFilter('missing')}>חסר</Chip>
        <Chip active={showRemoved} onClick={() => setShowRemoved(!showRemoved)}><EyeOff size={14} />הוסרו</Chip>
      </div>

      <h2 className="print-only text-2xl font-bold">{t.name} — רשימת ציוד</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map(g => {
          const done = g.items.filter(i => i.packed).length;
          return (
            <section key={g.title} className="break-inside-avoid rounded-xl2 border border-line bg-surface">
              <header className="flex items-center gap-2 border-b border-line px-4 py-3"><Blaze color={g.color} /><h3 className="flex-1 font-bold">{g.title}</h3><span className="num text-sm text-muted">{done}/{g.items.length}</span>
                {group === 'person' && g.items[0]?.assignee && <button className="no-print text-sm font-bold text-moss" onClick={() => shareText(g.title, packingText(t, members, g.items[0].assignee))}>שליחה</button>}
              </header>
              <ul className="divide-y divide-line">
                {g.items.map(p => (
                  <li key={p.id} className={cx('flex items-center gap-3 px-4 py-2.5', p.packed && 'bg-ok/5')}>
                    <input type="checkbox" aria-label={`${p.name} ארוז`} className="h-5 w-5 shrink-0 accent-[rgb(var(--forest))]" checked={p.packed} onChange={() => { const s = stamp(); updatePack(t.id, p.id, { packed: !p.packed, packedQty: undefined, packedBy: s.by, packedAt: s.at }); }} />
                    <div className="min-w-0 flex-1">
                      <p className={cx('font-semibold', p.packed && 'text-muted line-through')}>{p.name}{p.missing && <Badge tone="danger" className="ms-2">חסר</Badge>}{!p.packed && (p.packedQty ?? 0) > 0 && <Badge tone="info" className="ms-2">ארוזים {packedUnits(p)}/{p.qty}</Badge>}</p>
                      {isGroup(t) && itemFamily(t, p) === null && p.brings && <ShareLine t={t} p={p} />}
                      <p className="truncate text-xs text-muted">{p.packed && p.packedBy && t.shared ? <span className="font-bold text-ok">✓ {p.packedBy} · {ago(p.packedAt)} · </span> : null}{group2 && group !== 'family' && <FamTag t={t} p={p} />}{group !== 'person' && p.assignee ? `${members.find(m => m.id === p.assignee)?.name} · ` : ''}{p.reason}</p>
                    </div>
                    <button className="no-print text-muted hover:text-ink" aria-label={`למה ${p.name} ברשימה`} onClick={() => setWhy(p)}><Info size={17} /></button>
                    <div className="no-print flex items-center rounded-full bg-raised">
                      <button aria-label="הפחתת כמות" className="h-8 w-8 font-bold" onClick={() => updatePack(t.id, p.id, { qty: Math.max(1, p.qty - 1) })}>−</button>
                      <span className="num w-7 text-center text-sm font-bold">{p.qty}</span>
                      <button aria-label="הוספת כמות" className="h-8 w-8 font-bold" onClick={() => updatePack(t.id, p.id, { qty: p.qty + 1 })}>+</button>
                    </div>
                    <span className="print-only num">×{p.qty}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {!groups.length && <p className="py-10 text-center text-muted">אין פריטים להצגה בסינון הזה.</p>}

      <ItemSheet t={t} item={why} onClose={() => setWhy(null)} />
      <AddItem t={t} view={view} open={add} onClose={() => setAdd(false)} onAdd={p => updateTrip(t.id, x => ({ packing: [...x.packing, p] }))} />
      <Sheet open={copyFrom} onClose={() => setCopyFrom(false)} title="העתקת פריטים מטיול קודם">
        <p className="mb-3 text-sm text-muted">יועתקו הפריטים שהוספתם ידנית ושינויי הכמויות. סימוני "ארוז" מתאפסים.</p>
        <ul className="space-y-2">{prev.map(p => (
          <li key={p.id}><button className="w-full rounded-xl border border-line p-3 text-right hover:border-moss" onClick={() => {
            const manual = p.packing.filter(i => i.source === 'manual').map(i => ({ ...i, id: uid('pk'), packed: false }));
            const qty = new Map(p.packing.map(i => [i.name + (i.assignee ?? ''), i.qty]));
            updateTrip(t.id, x => ({ packing: [...x.packing.map(i => ({ ...i, qty: qty.get(i.name + (i.assignee ?? '')) ?? i.qty })), ...manual] }));
            setCopyFrom(false); toast(`הועתקו ${manual.length} פריטים ידניים והכמויות עודכנו`);
          }}><span className="font-bold">{p.name}</span><span className="block text-sm text-muted">{p.packing.length} פריטים</span></button></li>))}</ul>
      </Sheet>
    </div>
  );
}

function ItemSheet({ t, item, onClose }: { t: Trip; item: PackItem | null; onClose: () => void }) {
  const { boxes, updatePack } = useStore();
  const members = t.participants;
  if (!item) return null;
  const up = (p: Partial<PackItem>) => updatePack(t.id, item.id, p);
  const live = t.packing.find(x => x.id === item.id) ?? item;
  return (
    <Sheet open onClose={onClose} title={live.name} footer={<>{live.removed ? <Button variant="soft" icon={<RotateCcw size={16} />} onClick={() => { up({ removed: false }); onClose(); }}>החזרה לרשימה</Button> : <Button variant="danger" onClick={() => { up({ removed: true }); onClose(); }}>הסרה מהרשימה</Button>}<Button variant="ghost" onClick={onClose}>סגירה</Button></>}>
      <div className="space-y-4">
        <div className="rounded-xl bg-raised/60 p-3"><p className="text-sm font-bold text-muted">למה זה ברשימה</p><p>{live.reason}</p><div className="mt-1.5">{live.source === 'manual' ? <span className="text-xs text-muted">נוסף ידנית</span> : /קק״ל|רשות הטבע/.test(live.reason) ? <Prov kind="official" source="קק״ל ורשות הטבע והגנים" url={WATER_SOURCE.url} /> : <Prov kind="auto" source={{ inventory: 'ממאגר הציוד שלכם', personal: 'מתבנית הביגוד', rule: 'כלל לפי פרטי הטיול והתחזית' }[live.source]} />}</div></div>
        {isGroup(t) && (
          <div><label className="label" htmlFor="fm">מי רואה את הפריט?</label>
            <select id="fm" className="field" value={itemFamily(t, live) ?? ''} onChange={e => up({ familyId: e.target.value, assignee: live.assignee && t.participants.find(m => m.id === live.assignee)?.familyId !== e.target.value ? undefined : live.assignee })}>
              <option value="">משותף לכל המשפחות</option>
              {t.families!.filter(f => canSeeAll(t) || f.id === myFamily(t)).map(f => <option key={f.id} value={f.id}>רק {f.name}</option>)}
            </select></div>)}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="as">שיוך למשתתף</label><select id="as" className="field" value={live.assignee ?? ''} onChange={e => up({ assignee: e.target.value || undefined, familyId: undefined })}><option value="">ללא שיוך</option>{members.filter(m => !isGroup(t) || canSeeAll(t) || m.familyId === myFamily(t)).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><label className="label" htmlFor="bx">ארגז / תיק</label><select id="bx" className="field" value={live.boxId ?? ''} onChange={e => up({ boxId: e.target.value || null })}><option value="">ללא ארגז</option>{boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        </div>
        <PartialPack t={t} p={live} up={up} />
        {isGroup(t) && itemFamily(t, live) === null && <WhoBrings t={t} p={live} up={up} />}
        <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={!!live.missing} onChange={e => up({ missing: e.target.checked })} />סימון כחסר (צריך לקנות / להשלים)</label>
      </div>
    </Sheet>
  );
}

function AddItem({ t, view, open, onClose, onAdd }: { t: Trip; view: View; open: boolean; onClose: () => void; onAdd: (p: PackItem) => void }) {
  const [name, setName] = useState(''); const [cat, setCat] = useState<CategoryId>('misc'); const [qty, setQty] = useState(1); const [err, setErr] = useState('');
  const fam0 = isGroup(t) ? (view !== 'all' ? view : myFamily(t)!) : '';
  const [fam, setFam] = useState<string>(fam0);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) { setErr('כתבו שם פריט'); return; } onAdd({ id: uid('pk'), name: name.trim(), category: cat, qty, reason: 'נוסף ידנית', source: 'manual', packed: false, ...(isGroup(t) ? { familyId: fam } : {}) }); setName(''); setQty(1); setErr(''); onClose(); toast('הפריט נוסף'); };
  return (
    <Sheet open={open} onClose={onClose} title="הוספת פריט לרשימה">
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label" htmlFor="an">שם הפריט</label><input id="an" className={cx('field', err && 'border-danger')} value={name} onChange={e => setName(e.target.value)} aria-invalid={!!err} />{err && <p className="mt-1 text-sm text-danger">{err}</p>}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="ac">קטגוריה</label><select id="ac" className="field" value={cat} onChange={e => setCat(e.target.value as CategoryId)}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label" htmlFor="aq">כמות</label><input id="aq" type="number" min={1} className="field" value={qty} onChange={e => setQty(Math.max(1, +e.target.value))} /></div>
        </div>
        {isGroup(t) && <div><span className="label">מי רואה את הפריט?</span>
          <div className="flex flex-wrap gap-2">
            <Chip active={fam === fam0} onClick={() => setFam(fam0)}>רק {familyById(t, fam0)?.name}</Chip>
            <Chip active={fam === ''} onClick={() => setFam('')}>משותף לכל המשפחות</Chip>
          </div></div>}
        <Button type="submit" className="w-full">הוספה</Button>
      </form>
    </Sheet>
  );
}

/** Each family's packing progress (counts only — the lists themselves stay private to each family). */
function FamilyProgress({ t }: { t: Trip }) {
  const progress = useCloud(s => s.meta[t.shared!.cloudId]?.progress) ?? {};
  const fams = t.families ?? [];
  if (!fams.some(f => progress[f.id])) return null;
  return (
    <div className="space-y-1.5 border-t border-line pt-2">
      <p className="text-xs font-bold text-muted">התקדמות המשפחות</p>
      <ul className="grid gap-1.5 sm:grid-cols-2">{fams.map(f => { const p = progress[f.id]; const pct = p && p.total ? Math.round((p.packed / p.total) * 100) : 0; return (
        <li key={f.id} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: f.color }} /><span className="min-w-0 flex-1 truncate">{f.name}</span>
          {p ? <><span className="h-1.5 w-16 overflow-hidden rounded-full bg-raised" aria-hidden><span className="block h-full bg-ok" style={{ width: `${pct}%` }} /></span><span className="num text-xs font-bold">{p.packed}/{p.total}</span></> : <span className="text-xs text-muted">עוד לא התחילו</span>}</li>); })}</ul>
    </div>
  );
}

function FamTag({ t, p }: { t: Trip; p: PackItem }) {
  const f = familyById(t, itemFamily(t, p));
  return f ? <span className="font-bold" style={{ color: f.color }}>{f.name} · </span> : <span className="font-bold text-moss">משותף · </span>;
}

function Count({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center rounded-full bg-raised" role="group" aria-label={label}>
      <button type="button" aria-label={`${label}: פחות`} className="h-10 w-10 text-lg font-bold disabled:opacity-40" disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <input aria-label={label} type="number" inputMode="numeric" min={0} max={max} className="num w-12 bg-transparent text-center font-bold" value={value} onChange={e => onChange(+e.target.value || 0)} />
      <button type="button" aria-label={`${label}: יותר`} className="h-10 w-10 text-lg font-bold disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

/** Pack part of an item: "packed 5 of 10" — completes the item when all units are in. */
function PartialPack({ p, up }: { t: Trip; p: PackItem; up: (x: Partial<PackItem>) => void }) {
  if (p.qty < 2) return null;
  const n = packedUnits(p);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3">
      <div><p className="font-bold">כמה כבר ארוז?</p><p className="num text-sm text-muted">{n} מתוך {p.qty}{n && n < p.qty ? ` · נשארו ${p.qty - n}` : ''}</p></div>
      <Count label="יחידות ארוזות" value={n} max={p.qty} onChange={v => { const s = stamp(); up({ ...packUnits(p, v), packedBy: s.by, packedAt: s.at }); }} />
    </div>
  );
}

/** Shared item in a multi-family trip: each family says how many units it brings; the rest shows as missing. */
function WhoBrings({ t, p, up }: { t: Trip; p: PackItem; up: (x: Partial<PackItem>) => void }) {
  const c = coverage(p); const mine = myFamily(t); const all = canSeeAll(t);
  return (
    <section aria-labelledby="wb-h" className="space-y-2 rounded-xl border border-line p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="wb-h" className="font-bold">מי מביא כמה</h3>
        <p className={cx('num text-sm font-bold', c.covered ? 'text-ok' : 'text-warn')} aria-live="polite">{c.covered ? `מכוסה: ${c.brought} מתוך ${c.need}` : `${c.brought} מתוך ${c.need} · חסרים ${c.missing}`}</p>
      </div>
      <ul className="space-y-2">{t.families!.map(f => {
        const v = p.brings?.[f.id] ?? 0; const edit = all || f.id === mine;
        const max = v + c.missing;
        return (
          <li key={f.id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: f.color }} />{f.name}{f.id === mine && <span className="text-xs text-muted">(אתם)</span>}</span>
            {edit ? <span className="flex items-center gap-2">
              {c.missing > 0 && <Button size="sm" variant="soft" onClick={() => up({ brings: setShare(p, f.id, max) })}>את כל השאר</Button>}
              <Count label={`כמה ${f.name} מביאים`} value={v} max={max} onChange={n => up({ brings: setShare(p, f.id, n) })} />
            </span> : <span className="num font-bold">{v || '—'}</span>}
          </li>);
      })}</ul>
      <p className="text-xs text-muted">כל משפחה מעדכנת את החלק שלה; השינוי מגיע לכולם.</p>
    </section>
  );
}

function ShareLine({ t, p }: { t: Trip; p: PackItem }) {
  const c = coverage(p);
  const parts = t.families!.filter(f => p.brings?.[f.id]).map(f => `${f.name} ${p.brings![f.id]}`);
  return <p className={cx('num text-xs font-bold', c.covered ? 'text-ok' : 'text-warn')}>{parts.join(' · ')}{c.covered ? ' · מכוסה' : ` · חסרים ${c.missing}`}</p>;
}
