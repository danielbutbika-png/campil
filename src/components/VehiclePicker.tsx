import { useState } from 'react';
import { Search, ExternalLink, Car, Check, Loader2, KeyRound } from 'lucide-react';
import { useStore } from '../lib/store';
import { VEHICLES, findVehicle, googleSearchURL, type VehicleSpec } from '../data/vehicles';
import { searchVehicleOnline } from '../services/vehicleSearch';
import { Button, Badge, Segmented, cx, toast } from './ui';
import { href } from '../lib/router';

const METHOD = { catalog: ['מאגר מאומת', 'ok'], web: ['חיפוש ברשת', 'info'], manual: ['הוזן ידנית', 'muted'] } as const;

export function VehicleCard({ spec }: { spec: VehicleSpec }) {
  return (
    <div className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2"><Car size={20} className="text-moss" /><p className="flex-1 font-bold">{spec.model}</p><Badge tone={METHOD[spec.method][1] as any}>{METHOD[spec.method][0]}</Badge></div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-raised/60 p-2"><dt className="text-xs text-muted">{spec.seats === 7 ? '5 מושבים' : 'מושבים פתוחים'}</dt><dd className="num text-xl font-extrabold">{spec.liters5} ל׳</dd></div>
        <div className="rounded-xl bg-raised/60 p-2"><dt className="text-xs text-muted">7 מושבים</dt><dd className="num text-xl font-extrabold">{spec.seats === 7 ? (spec.liters7 ? `${spec.liters7} ל׳` : 'לא פורסם') : '—'}</dd></div>
        <div className="rounded-xl bg-raised/60 p-2"><dt className="text-xs text-muted">מושבים מקופלים</dt><dd className="num text-xl font-extrabold">{spec.litersFolded ? `${spec.litersFolded} ל׳` : '—'}</dd></div>
      </dl>
      {spec.note && <p className="text-sm text-muted">{spec.note}</p>}
      <p className="text-xs text-muted">מקור: {spec.sourceUrl ? <a className="font-bold text-moss" href={spec.sourceUrl} target="_blank" rel="noreferrer">{spec.source}</a> : spec.source} · נבדק {spec.checkedAt}. הנתון לפי היצרן לשוק האירופי; גרסאות בישראל עשויות להשתנות מעט.</p>
    </div>
  );
}

export function VehiclePicker() {
  const { settings: s, setSettings } = useStore();
  const [q, setQ] = useState(s.vehicleSpec?.model ?? s.vehicle ?? '');
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<VehicleSpec | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [manual, setManual] = useState({ seats: '5' as '5' | '7', l5: '', l7: '' });
  const save = (spec: VehicleSpec) => { setSettings({ vehicleSpec: spec, vehicle: spec.model, trunkLiters: spec.liters5 }); setFound(null); setMiss(null); toast('נתוני הרכב נשמרו'); };

  const search = async () => {
    const term = q.trim(); if (!term) return toast('כתבו דגם רכב');
    setMiss(null); setFound(null);
    const local = findVehicle(term);
    if (local) { save(local); return; }
    if (!s.aiKey) { setMiss(term); return; }
    setBusy(true);
    try { setFound(await searchVehicleOnline(term, s.aiKey, s.aiModel || 'claude-sonnet-5-5')); }
    catch (e: any) { setMiss(term); toast(e.message); }
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); search(); }}>
        <label className="sr-only" htmlFor="veh-q">דגם הרכב</label>
        <input id="veh-q" list="veh-list" className="field min-w-[12rem] flex-1" placeholder="למשל: Skoda Kodiaq או טוסון" value={q} onChange={e => setQ(e.target.value)} />
        <datalist id="veh-list">{VEHICLES.map(v => <option key={v.id} value={v.model} />)}</datalist>
        <Button type="submit" disabled={busy} icon={busy ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}>{busy ? 'מחפש ברשת…' : 'חיפוש נתוני הרכב'}</Button>
      </form>
      <p className="text-xs text-muted">החיפוש בודק קודם מאגר של {VEHICLES.length} דגמים נפוצים עם מקורות. דגם אחר נחפש ברשת{s.aiKey ? '' : ' — אחרי שמגדירים מפתח חיפוש (למטה)'}.</p>

      {found && (
        <div className="space-y-2 rounded-xl2 border-2 border-moss p-3">
          <p className="font-bold">נמצא ברשת — בדקו את המקור לפני השמירה</p>
          <VehicleCard spec={found} />
          <div className="flex gap-2"><Button icon={<Check size={16} />} onClick={() => save(found)}>שמירה</Button><Button variant="ghost" onClick={() => setFound(null)}>לא נכון</Button></div>
        </div>
      )}

      {miss && (
        <div className="space-y-3 rounded-xl2 border border-warn/50 bg-warn/5 p-4">
          <p className="font-bold">"{miss}" לא נמצא במאגר{s.aiKey ? ' וגם לא בחיפוש ברשת' : ''}</p>
          <div className="flex flex-wrap gap-2">
            <a className="inline-flex h-10 items-center gap-1.5 rounded-full bg-raised px-4 text-sm font-bold" href={googleSearchURL(miss)} target="_blank" rel="noreferrer"><ExternalLink size={15} />חיפוש בגוגל</a>
            {!s.aiKey && <a className="inline-flex h-10 items-center gap-1.5 rounded-full bg-raised px-4 text-sm font-bold" href={href('/settings') + ''} onClick={() => document.getElementById('ai-key')?.focus()}><KeyRound size={15} />הפעלת חיפוש אוטומטי</a>}
          </div>
          <p className="text-sm">מצאתם את הנתון? הזינו אותו לפי מפרט היצרן:</p>
          <Segmented label="מספר מושבים" value={manual.seats} onChange={v => setManual({ ...manual, seats: v })} options={[{ v: '5', label: '5 מושבים' }, { v: '7', label: '7 מושבים' }]} />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label" htmlFor="m5">{manual.seats === '7' ? 'נפח עם 5 מושבים (ל׳)' : 'נפח תא מטען (ל׳)'}</label><input id="m5" type="number" min={50} className="field" value={manual.l5} onChange={e => setManual({ ...manual, l5: e.target.value })} /></div>
            {manual.seats === '7' && <div><label className="label" htmlFor="m7">נפח עם 7 מושבים (ל׳)</label><input id="m7" type="number" min={0} className="field" value={manual.l7} onChange={e => setManual({ ...manual, l7: e.target.value })} /></div>}
          </div>
          <Button onClick={() => { const l5 = +manual.l5; if (!(l5 >= 50)) return toast('הזינו נפח בליטרים'); save({ id: 'manual', model: miss, aliases: [], seats: manual.seats === '7' ? 7 : 5, liters5: l5, liters7: manual.l7 ? +manual.l7 : null, source: 'הוזן ידנית', sourceUrl: '', checkedAt: new Date().toISOString().slice(0, 10), method: 'manual' }); }}>שמירה</Button>
        </div>
      )}

      {s.vehicleSpec && !found && <VehicleCard spec={s.vehicleSpec} />}
    </div>
  );
}

export function AiKeyField() {
  const { settings: s, setSettings } = useStore();
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="label" htmlFor="ai-key">מפתח Claude API לחיפוש ברשת (לא חובה)</label>
      <div className="flex gap-2">
        <input id="ai-key" type={show ? 'text' : 'password'} autoComplete="off" className={cx('field flex-1 font-mono text-sm')} placeholder="sk-ant-…" value={s.aiKey ?? ''} onChange={e => setSettings({ aiKey: e.target.value.trim() || undefined })} />
        <Button variant="soft" onClick={() => setShow(!show)}>{show ? 'הסתרה' : 'הצגה'}</Button>
      </div>
      <p className="text-xs text-muted">משמש רק לחיפוש נתוני רכב שלא נמצאים במאגר. המפתח נשמר במכשיר הזה בלבד ונשלח רק ל-api.anthropic.com. לא נכלל בקובץ הגיבוי. כל חיפוש כרוך בעלות קטנה לפי חשבון ה-API שלכם.</p>
    </div>
  );
}
