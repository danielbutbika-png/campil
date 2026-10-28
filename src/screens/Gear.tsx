import { useMemo, useState } from 'react';
import { Plus, Search, Camera, Package, Car, Boxes, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';
import { useStore, nextTrip } from '../lib/store';
import type { GearItem, Box, CategoryId, GearStatus } from '../lib/types';
import { CATEGORIES, CAT_BY_ID, STATUS_LABEL, CONDITION_LABEL } from '../data/catalog';
import { compressImage, putPhoto } from '../lib/photos';
import { Photo } from './trip/JournalTab';
import { Button, Chip, Sheet, Badge, Blaze, Toggle, Empty, cx, toast } from '../components/ui';
import { href } from '../lib/router';
import { planLoad, ZONE_HE } from '../engine/loading';
import { VehiclePicker } from '../components/VehiclePicker';
import { uid } from '../lib/util';
import { myPacking } from '../lib/families';

const STATUS_TONE: Record<GearStatus, any> = { have: 'ok', home: 'info', check: 'warn', buy: 'danger', per_trip: 'muted' };

export default function Gear({ tab }: { tab: string }) {
  return (
    <div className="gutter mx-auto max-w-6xl space-y-6 py-6">
      <header className="space-y-4"><h1 className="font-display text-3xl">ציוד קמפינג</h1>
        <nav className="flex gap-2" aria-label="אזורי הציוד">
          {[['inventory', 'מאגר הציוד', Package], ['boxes', 'ארגזים ותיקים', Boxes], ['car', 'העמסה לרכב', Car]].map(([k, l, I]: any) => <a key={k} href={href(`/gear/${k}`)} aria-current={tab === k ? 'page' : undefined} className={cx('flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold', tab === k ? 'bg-forest text-onforest' : 'bg-raised')}><I size={16} />{l}</a>)}
        </nav>
      </header>
      {tab === 'boxes' ? <BoxesView /> : tab === 'car' ? <CarView /> : <Inventory />}
    </div>
  );
}

function Inventory() {
  const { inventory, boxes } = useStore();
  const [q, setQ] = useState(''); const [cat, setCat] = useState<CategoryId | 'all'>('all'); const [status, setStatus] = useState<GearStatus | 'all'>('all');
  const [edit, setEdit] = useState<GearItem | null>(null);
  const list = inventory.filter(g => (cat === 'all' || g.category === cat) && (status === 'all' || g.status === status) && (!q || g.name.toLowerCase().includes(q.toLowerCase()) || g.notes?.includes(q)));
  const counts = (s: GearStatus) => inventory.filter(g => g.status === s).length;
  const byCat = CATEGORIES.map(c => ({ c, items: list.filter(g => g.category === c.id) })).filter(x => x.items.length);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(['have', 'home', 'check', 'buy', 'per_trip'] as GearStatus[]).map(s => (
          <button key={s} onClick={() => setStatus(status === s ? 'all' : s)} aria-pressed={status === s} className={cx('rounded-xl2 border bg-surface p-3 text-right transition', status === s ? 'border-forest ring-2 ring-forest/30' : 'border-line')}>
            <span className="num block text-2xl font-extrabold">{counts(s)}</span><span className="text-sm text-muted">{STATUS_LABEL[s]}</span>
          </button>))}
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[12rem] flex-1"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" /><input aria-label="חיפוש בציוד" className="field pr-9" placeholder="חיפוש בציוד" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select aria-label="קטגוריה" className="field w-auto" value={cat} onChange={e => setCat(e.target.value as any)}><option value="all">כל הקטגוריות</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <Button icon={<Plus size={18} />} onClick={() => setEdit({ id: uid('g'), name: '', category: cat === 'all' ? 'misc' : cat, qty: 1, status: 'have', available: true, condition: 'good' })}>פריט חדש</Button>
      </div>
      <p className="text-sm text-muted">המאגר נטען מקובץ הציוד המשפחתי. מזינים פעם אחת — והרשימה של כל טיול נבנית ממנו.</p>
      {byCat.map(({ c, items }) => (
        <section key={c.id} className="rounded-xl2 border border-line bg-surface">
          <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 font-bold"><Blaze color={c.blaze} />{c.name}<span className="num ms-auto text-sm text-muted">{items.length}</span></h2>
          <ul className="divide-y divide-line">{items.map(g => (
            <li key={g.id}><button onClick={() => setEdit(g)} className="flex w-full items-center gap-3 px-4 py-2.5 text-right hover:bg-raised/50">
              {g.photoId ? <Photo id={g.photoId} className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-raised text-muted"><Package size={18} /></span>}
              <span className="min-w-0 flex-1"><span className={cx('block font-semibold', g.available === false && 'text-muted line-through')}>{g.name}</span><span className="block truncate text-xs text-muted">{[boxes.find(b => b.id === g.boxId)?.name ?? (g.big ? 'ציוד גדול' : null), g.spot, g.homeLocation].filter(Boolean).join(' · ')}</span></span>
              <span className="num text-sm font-bold">×{g.qty}</span><Badge tone={STATUS_TONE[g.status]}>{STATUS_LABEL[g.status]}</Badge>
            </button></li>))}</ul>
        </section>
      ))}
      {!byCat.length && <Empty title="לא נמצא ציוד" body="נסו חיפוש אחר או הוסיפו פריט." />}
      {edit && <ItemEditor g={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function ItemEditor({ g, onClose }: { g: GearItem; onClose: () => void }) {
  const { boxes, upsertItem, removeItem, inventory } = useStore();
  const [d, setD] = useState(g); const exists = inventory.some(x => x.id === g.id);
  const set = (p: Partial<GearItem>) => setD(x => ({ ...x, ...p }));
  const photo = async (f?: File) => { if (!f) return; const id = uid('p'); await putPhoto(id, await compressImage(f, 900)); set({ photoId: id }); };
  return (
    <Sheet open onClose={onClose} title={exists ? 'עריכת פריט' : 'פריט חדש'} wide footer={<><Button onClick={() => { if (!d.name.trim()) return toast('כתבו שם פריט'); upsertItem({ ...d, name: d.name.trim(), status: d.status, }); onClose(); toast('נשמר במאגר'); }}>שמירה</Button>{exists && <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => { removeItem(g.id); onClose(); }}>מחיקה</Button>}</>}>
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <label className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-xl2 border-2 border-dashed border-line text-muted hover:border-moss">
          {d.photoId ? <Photo id={d.photoId} className="absolute inset-0 h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-sm font-bold"><Camera size={22} />תמונה</span>}
          <input type="file" accept="image/*" className="sr-only" onChange={e => photo(e.target.files?.[0])} />
        </label>
        <div className="space-y-3">
          <div><label className="label" htmlFor="gn">שם</label><input id="gn" className="field" value={d.name} onChange={e => set({ name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="gc">קטגוריה</label><select id="gc" className="field" value={d.category} onChange={e => set({ category: e.target.value as CategoryId })}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label" htmlFor="gq">כמות</label><input id="gq" type="number" min={0} className="field" value={d.qty} onChange={e => set({ qty: Math.max(0, +e.target.value) })} /></div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor="gs">סטטוס</label><select id="gs" className="field" value={d.status} onChange={e => set({ status: e.target.value as GearStatus })}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="gk">מצב תקינות</label><select id="gk" className="field" value={d.condition ?? 'good'} onChange={e => set({ condition: e.target.value as any })}>{Object.entries(CONDITION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="gb">ארגז / תיק</label><select id="gb" className="field" value={d.boxId ?? ''} onChange={e => set({ boxId: e.target.value || null })}><option value="">ללא (ציוד נפרד)</option>{boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div><label className="label" htmlFor="gsp">מיקום בתוך הארגז</label><input id="gsp" className="field" value={d.spot ?? ''} onChange={e => set({ spot: e.target.value })} /></div>
        <div><label className="label" htmlFor="gh">מיקום אחסון בבית</label><input id="gh" className="field" placeholder="למשל: מחסן, מדף עליון" value={d.homeLocation ?? ''} onChange={e => set({ homeLocation: e.target.value })} /></div>
        <div><label className="label" htmlFor="gvl">נפח ליחידה (ליטר, לא חובה)</label><input id="gvl" type="number" min={0} className="field" placeholder="לחישוב העמסה לרכב" value={d.volumeL ?? ''} onChange={e => set({ volumeL: e.target.value ? +e.target.value : undefined })} /></div>
        <div><label className="label" htmlFor="gno">הערות</label><input id="gno" className="field" value={d.notes ?? ''} onChange={e => set({ notes: e.target.value })} /></div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Toggle checked={d.available !== false} onChange={v => set({ available: v })} label="זמין לטיולים" desc="כבוי = לא ייכנס לרשימות" />
        <Toggle checked={!!d.charge} onChange={v => set({ charge: v })} label="דורש טעינה לפני יציאה" />
      </div>
    </Sheet>
  );
}

const vol = (b: Box) => (b.dims ? Math.round((b.dims[0] * b.dims[1] * b.dims[2]) / 1000) : null);

function BoxesView() {
  const { boxes, inventory, trips } = useStore();
  const [edit, setEdit] = useState<Box | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const nt = nextTrip(trips);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2"><Button icon={<Plus size={18} />} onClick={() => setEdit({ id: uid('b'), name: '', color: '#2f6b3f', category: 'misc', kind: 'box' })}>ארגז / תיק חדש</Button>{nt && <p className="text-sm text-muted">מצב אריזה לפי: <a className="font-bold text-moss" href={href(`/trip/${nt.id}/gear`)}>{nt.name}</a></p>}</div>
      <div className="grid gap-4 md:grid-cols-2">
        {boxes.map(b => {
          const items = inventory.filter(g => g.boxId === b.id);
          const packs = (nt ? myPacking(nt) : undefined)?.filter(p => p.boxId === b.id && !p.removed) ?? [];
          const done = packs.filter(p => p.packed).length;
          const isOpen = open === b.id;
          return (
            <article key={b.id} className="overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
              <div className="h-2" style={{ background: b.color }} />
              <div className="space-y-2 p-4">
                <div className="flex items-start gap-3"><div className="flex-1"><h3 className="font-display text-lg">{b.name}</h3><p className="text-sm text-muted">{b.purpose}</p></div><Button size="sm" variant="ghost" onClick={() => setEdit(b)}>עריכה</Button></div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <Badge>{b.kind === 'bag' ? 'תיק' : 'ארגז'}</Badge>
                  {b.dims && <Badge><span className="num">{b.dims.join('×')} ס״מ</span></Badge>}
                  {vol(b) && <Badge><span className="num">≈{vol(b)} ל׳ חיצוני</span></Badge>}
                  {b.volume && <Badge tone="info">נפח יעד {b.volume} ל׳</Badge>}
                  {b.weightKg && <Badge>{b.weightKg} ק״ג</Badge>}
                  <Badge tone="ok">{items.length} פריטים</Badge>
                </div>
                {nt && packs.length > 0 && <div className="flex items-center gap-2 text-sm"><span className="h-2 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full bg-moss" style={{ width: `${(done / packs.length) * 100}%` }} /></span><span className="num font-bold">{done}/{packs.length} ארוזים</span></div>}
                {b.note && <p className="text-xs text-muted">{b.note}</p>}
                <button onClick={() => setOpen(isOpen ? null : b.id)} aria-expanded={isOpen} className="flex items-center gap-1 text-sm font-bold text-moss">תכולה<ChevronDown size={16} className={cx('transition', isOpen && 'rotate-180')} /></button>
                {isOpen && <ul className="grid gap-1 text-sm sm:grid-cols-2">{items.map(g => <li key={g.id} className="flex justify-between gap-2 rounded-lg bg-raised/50 px-2 py-1"><span>{g.name}</span><span className="num text-muted">×{g.qty}</span></li>)}</ul>}
              </div>
            </article>
          );
        })}
      </div>
      {edit && <BoxEditor b={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function BoxEditor({ b, onClose }: { b: Box; onClose: () => void }) {
  const { upsertBox, removeBox, boxes } = useStore();
  const [d, setD] = useState(b); const exists = boxes.some(x => x.id === b.id);
  const dims = d.dims ?? [0, 0, 0];
  const setDim = (i: number, v: number) => { const n = [...dims] as [number, number, number]; n[i] = v; setD({ ...d, dims: n.every(x => x > 0) ? n : n }); };
  return (
    <Sheet open onClose={onClose} title={exists ? 'עריכת ארגז' : 'ארגז חדש'} footer={<><Button onClick={() => { if (!d.name.trim()) return toast('כתבו שם'); upsertBox({ ...d, dims: d.dims?.every(x => x > 0) ? d.dims : undefined }); onClose(); }}>שמירה</Button>{exists && <Button variant="danger" onClick={() => { removeBox(b.id); onClose(); toast('הארגז נמחק — הפריטים שבו נשארו במאגר'); }}>מחיקה</Button>}</>}>
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_80px] gap-3"><div><label className="label" htmlFor="bn">שם</label><input id="bn" className="field" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} /></div><div><label className="label" htmlFor="bc">צבע</label><input id="bc" type="color" className="field h-[46px] p-1" value={d.color} onChange={e => setD({ ...d, color: e.target.value })} /></div></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="bk">סוג</label><select id="bk" className="field" value={d.kind} onChange={e => setD({ ...d, kind: e.target.value as any })}><option value="box">ארגז קשיח</option><option value="bag">תיק רך</option></select></div>
          <div><label className="label" htmlFor="bcat">קטגוריה</label><select id="bcat" className="field" value={d.category} onChange={e => setD({ ...d, category: e.target.value })}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <fieldset><legend className="label">מידות (ס״מ) — אורך × רוחב × גובה</legend><div className="grid grid-cols-3 gap-2">{['אורך', 'רוחב', 'גובה'].map((l, i) => <input key={l} aria-label={l} type="number" min={0} className="field num" placeholder={l} value={dims[i] || ''} onChange={e => setDim(i, +e.target.value)} />)}</div></fieldset>
        <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="bw">משקל משוער (ק״ג)</label><input id="bw" type="number" min={0} className="field" value={d.weightKg ?? ''} onChange={e => setD({ ...d, weightKg: e.target.value ? +e.target.value : undefined })} /></div><div><label className="label" htmlFor="bp">מהות</label><input id="bp" className="field" value={d.purpose ?? ''} onChange={e => setD({ ...d, purpose: e.target.value })} /></div></div>
      </div>
    </Sheet>
  );
}

function CarView() {
  const { boxes, inventory, settings, trips } = useStore();
  const nt = nextTrip(trips);
  const plan = planLoad({ spec: settings.vehicleSpec, manualLiters: settings.trunkLiters, trip: nt, boxes, inventory });
  const people = nt ? nt.adults + nt.children : null;
  const tone = { ok: 'border-ok/40 bg-ok/5', info: 'border-line bg-surface', warn: 'border-warn/50 bg-warn/5', danger: 'border-danger/50 bg-danger/5' };
  return (
    <div className="space-y-6">
      <section className="space-y-3"><h2 className="font-display text-xl">הרכב</h2><VehiclePicker /></section>
      <section className="space-y-3 rounded-xl2 border border-line bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-display text-xl">נפח הציוד מול תא המטען</h2>{nt && <a className="text-sm font-bold text-moss" href={href(`/trip/${nt.id}/gear`)}>לפי: {nt.name}{people ? ` · ${people} נוסעים` : ''}</a>}</div>
        <p className="text-sm text-muted">{plan.capacityWhy}</p>
        <p className="num">נפח נמדד של הציוד: <b>{plan.used} ל׳</b>{plan.capacity ? <> מתוך <b>{plan.capacity} ל׳</b></> : null}</p>
        {plan.pct != null && <div className="h-4 overflow-hidden rounded-full bg-line" role="meter" aria-valuenow={plan.pct} aria-valuemin={0} aria-valuemax={100} aria-label="ניצול תא המטען"><div className={cx('h-full', plan.pct > 100 ? 'bg-danger' : plan.pct > 80 ? 'bg-warn' : 'bg-moss')} style={{ width: `${Math.min(100, plan.pct)}%` }} /></div>}
        <p className="flex items-start gap-2 rounded-xl bg-warn/10 p-3 text-sm"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" />הערכת נפח בלבד. צורת תא המטען, הקשתות והמידות בפועל קובעים אם הציוד ייכנס — מומלץ לעשות העמסת ניסיון לפני היציאה.</p>
      </section>
      <section className="space-y-3"><h2 className="font-display text-xl">המלצות אריזה ואחסון</h2>
        <div className="grid gap-3 md:grid-cols-2">{plan.advice.map(a => <article key={a.id} className={cx('rounded-xl2 border p-4', tone[a.level])}><h3 className="font-bold">{a.title}</h3><p className="text-sm">{a.body}</p></article>)}</div>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-xl">סדר העמסה מוצע</h2>
        <p className="text-sm text-muted">מה שנכנס ראשון יוצא אחרון: קשיח וכבד בתחתית וצמוד למשענת, רך ממלא חללים, ומה שצריך בדרך — ליד הדלת.</p>
        <ol className="space-y-2">{plan.rows.map((o, i) => (
          <li key={o.name} className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3">
            <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-onforest">{i + 1}</span>
            <div className="min-w-0 flex-1"><p className="font-semibold">{o.name}</p><p className="text-xs text-muted">{o.why}</p></div>
            <div className="flex shrink-0 flex-col items-end gap-1"><Badge tone="info">{ZONE_HE[o.zone]}</Badge><span className="num text-xs text-muted">{o.liters ? `≈${o.liters} ל׳` : 'ללא נפח'}{o.weightKg ? ` · ${o.weightKg} ק״ג` : ''}</span></div>
          </li>))}</ol>
      </section>
    </div>
  );
}
