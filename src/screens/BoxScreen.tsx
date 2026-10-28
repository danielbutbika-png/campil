// A gear box opened from its QR code: see what's inside and update it on the spot.
import { useState } from 'react';
import { Package, Minus, Plus, LogOut, ShoppingCart, Wrench, Backpack, Printer } from 'lucide-react';
import { useStore, nextTrip } from '../lib/store';
import { todayISO } from '../lib/util';
import { STATUS_LABEL } from '../data/catalog';
import { QrImage, boxUrl } from '../components/BoxQr';
import { Badge, Button, toast } from '../components/ui';
import { href } from '../lib/router';
import type { GearItem } from '../lib/types';

export default function BoxScreen({ id }: { id: string }) {
  const { boxes, inventory, trips, upsertItem, updatePack } = useStore();
  const box = boxes.find(b => b.id === id);
  const [adding, setAdding] = useState('');
  if (!box) return <div className="gutter mx-auto max-w-lg space-y-3 py-16 text-center"><Package size={40} className="mx-auto text-muted" /><p className="font-display text-2xl">הארגז לא נמצא במכשיר הזה</p><p className="text-muted">הקוד פותח את מאגר הציוד של המכשיר שסורק. סרקו ממכשיר שבו הארגז נמצא במאגר.</p><a className="font-bold text-moss" href={href('/gear/boxes')}>לארגזים</a></div>;
  const items = inventory.filter(g => g.boxId === box.id);
  const others = inventory.filter(g => g.boxId !== box.id).sort((a, b) => a.name.localeCompare(b.name, 'he'));
  const nt = nextTrip(trips.filter(t => !t.example));
  const up = (g: GearItem, p: Partial<GearItem>, msg?: string) => { upsertItem({ ...g, ...p }); if (msg) toast(msg); };
  const take = (g: GearItem) => {
    const p = nt?.packing.find(x => x.inventoryId === g.id && !x.removed);
    if (!nt || !p) return toast(nt ? 'הפריט לא ברשימת הציוד של הטיול הקרוב' : 'אין טיול קרוב');
    updatePack(nt.id, p.id, { packed: true, packedQty: undefined }); toast(`סומן כארוז ל"${nt.name}"`);
  };
  return (
    <div className="gutter mx-auto max-w-3xl space-y-5 py-6">
      <header className="flex items-start gap-4">
        <div className="h-12 w-3 rounded-full" style={{ background: box.color }} />
        <div className="flex-1"><h1 className="font-display text-3xl">{box.name}</h1>{box.purpose && <p className="text-muted">{box.purpose}</p>}<p className="text-sm text-muted">{items.length} פריטים{nt ? ` · הטיול הקרוב: ${nt.name}` : ''}</p></div>
      </header>
      <ul className="space-y-2" aria-label="תכולת הארגז">{items.map(g => {
        const inTrip = nt?.packing.find(x => x.inventoryId === g.id && !x.removed);
        return (
          <li key={g.id} className="space-y-2 rounded-xl2 border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2"><span className="flex-1 font-semibold">{g.name}</span><Badge tone={g.status === 'buy' ? 'danger' : g.status === 'check' ? 'warn' : 'ok'}>{STATUS_LABEL[g.status]}</Badge>{inTrip?.packed && <Badge tone="ok">ארוז לטיול</Badge>}</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-full bg-raised" role="group" aria-label={`כמות ${g.name}`}>
                <button type="button" aria-label="פחות" className="h-9 w-9" onClick={() => up(g, { qty: Math.max(0, g.qty - 1) })}><Minus size={15} className="mx-auto" /></button>
                <span className="num w-8 text-center font-bold">{g.qty}</span>
                <button type="button" aria-label="יותר" className="h-9 w-9" onClick={() => up(g, { qty: g.qty + 1 })}><Plus size={15} className="mx-auto" /></button>
              </div>
              {nt && inTrip && !inTrip.packed && <Button size="sm" variant="soft" icon={<Backpack size={14} />} onClick={() => take(g)}>נלקח לטיול</Button>}
              <Button size="sm" variant="soft" icon={<Wrench size={14} />} onClick={() => up(g, { lastChecked: todayISO(), status: g.status === 'check' ? 'have' : g.status }, 'סומן: נבדק היום')}>נבדק</Button>
              <Button size="sm" variant="soft" icon={<ShoppingCart size={14} />} onClick={() => up(g, { status: 'buy' }, 'סומן כחסר — להשלים')}>חסר</Button>
              <Button size="sm" variant="ghost" icon={<LogOut size={14} />} onClick={() => up(g, { boxId: null }, 'הוצא מהארגז')}>הוצאה</Button>
            </div>
          </li>);
      })}</ul>
      {!items.length && <p className="text-muted">הארגז ריק במאגר.</p>}
      <div className="flex flex-wrap items-end gap-2 rounded-xl2 border border-line bg-surface p-3">
        <div className="min-w-[12rem] flex-1"><label className="label" htmlFor="addbox">הכנסת פריט לארגז</label>
          <select id="addbox" className="field" value={adding} onChange={e => setAdding(e.target.value)}><option value="">בחרו פריט מהמאגר…</option>{others.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        <Button disabled={!adding} onClick={() => { const g = inventory.find(x => x.id === adding)!; up(g, { boxId: box.id }, `${g.name} הוכנס לארגז`); setAdding(''); }}>הכנסה</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-xl2 border border-line bg-surface p-3">
        <QrImage text={boxUrl(box.id)} size={110} label={`קוד QR של ${box.name}`} />
        <p className="flex-1 text-sm text-muted">הקוד מכיל רק קישור עם מזהה הארגז — בלי רשימת התכולה ובלי פרטים אישיים.</p>
        <a href={href('/gear/labels')} className="inline-flex items-center gap-1 text-sm font-bold text-moss"><Printer size={15} />מדבקות להדפסה</a>
      </div>
    </div>
  );
}

/** Printable QR labels for all boxes. */
export function BoxLabels() {
  const boxes = useStore(s => s.boxes);
  return (
    <div className="gutter mx-auto max-w-4xl space-y-4 py-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-2"><h1 className="font-display text-3xl">מדבקות QR לארגזים</h1><Button icon={<Printer size={16} />} onClick={() => print()}>הדפסה</Button></div>
      <p className="no-print text-sm text-muted">מדביקים על כל ארגז. סריקה במצלמת הטלפון פותחת את הארגז באפליקציה. הקוד מכיל רק קישור עם מזהה הארגז.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{boxes.map(b => (
        <li key={b.id} className="flex break-inside-avoid flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-3 text-center">
          <QrImage text={boxUrl(b.id)} size={140} label={`קוד QR של ${b.name}`} />
          <span className="font-bold" style={{ color: b.color }}>{b.name}</span>
        </li>))}</ul>
    </div>
  );
}
