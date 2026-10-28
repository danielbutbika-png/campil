import { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudUpload, Check, Loader2, Map as MapIcon, CloudSun, Smartphone, ShieldAlert, Download, RefreshCw } from 'lucide-react';
import type { Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { useOnline } from '../lib/hooks';
import { useCloud } from '../lib/cloud/sync';
import { prepareTrip, MAP_TERMS_URL, type Progress } from '../lib/offline';
import { Button, cx, toast } from './ui';
import { href } from '../lib/router';
import { ago } from './Collab';

/** Connection and sync state of a shared trip, always visible in the trip header. */
export function SyncBadge({ t }: { t: Trip }) {
  const online = useOnline();
  const pending = useCloud(s => s.pending), last = useCloud(s => s.lastSync), status = useCloud(s => s.status);
  const [, tick] = useState(0); useEffect(() => { const i = setInterval(() => tick(x => x + 1), 30_000); return () => clearInterval(i); }, []);
  if (!t.shared) return null;
  const [Icon, text, tone] = !online
    ? [WifiOff, pending ? `אין קליטה · ${pending} שינויים שמורים במכשיר` : 'אין קליטה · הכול שמור במכשיר', 'bg-warn/90 text-black']
    : pending ? [CloudUpload, `מסנכרן ${pending} שינויים…`, 'bg-info/90 text-white']
    : status === 'error' ? [CloudUpload, 'בעיה בסנכרון — ננסה שוב', 'bg-danger/90 text-white']
    : [Check, last ? `מסונכרן · ${ago(last)}` : 'מסונכרן', 'bg-black/35 text-white'];
  return <span role="status" className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur', tone)}><Icon size={13} aria-hidden />{text}</span>;
}

const STEP_HE: Record<Progress['step'], string> = { app: 'האפליקציה', forecast: 'תחזית', map: 'מפת האזור' };

/** "Prepare the trip for no signal": app, plan & gear (already local), forecast, map of the area. */
export function FieldCard({ t, point }: { t: Trip; point: { lat: number; lon: number } | null }) {
  const online = useOnline();
  const updateTrip = useStore(s => s.updateTrip);
  const [p, setP] = useState<Progress | null>(null);
  const prep = t.offline;
  const run = async () => {
    try {
      const r = await prepareTrip(t, point, setP);
      updateTrip(t.id, { offline: r });
      toast(r.skipped ? `הטיול מוכן — ${r.skipped}` : 'הטיול מוכן לשימוש ללא קליטה');
    } catch (e: any) { toast(e?.message ?? 'ההכנה נכשלה — נסו שוב'); }
    setP(null);
  };
  const rows: [boolean, React.ReactNode, string][] = [
    [true, <Smartphone size={15} />, 'האפליקציה עצמה, כולל המפה — נשמרת בביקור הראשון'],
    [true, <Check size={15} />, 'תוכנית הטיול, הציוד, התפריט, המשימות והיומן — תמיד במכשיר'],
    [!!prep?.forecast, <CloudSun size={15} />, prep?.forecast ? `תחזית שנשמרה ${ago(prep.at)}` : 'תחזית ליעד'],
    [!!prep?.tiles, <MapIcon size={15} />, prep?.tiles ? `מפת האזור: ${prep.tiles} אריחים (${(prep.bytes / 1048576).toFixed(1)}MB), עד ${prep.radiusKm} ק״מ מהיעד` : 'מפת האזור (עד 20 ק״מ מהיעד) + מפה כללית של הארץ'],
  ];
  return (
    <section aria-labelledby="field-h" className="space-y-3 rounded-xl2 border-2 border-moss/40 bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="field-h" className="flex flex-1 items-center gap-2 font-display text-xl">{online ? <Wifi size={20} className="text-moss" /> : <WifiOff size={20} className="text-warn" />}מוכנים לשטח בלי קליטה?</h2>
        {prep && <span className="text-xs font-bold text-ok">הוכן {ago(prep.at)}</span>}
      </div>
      <ul className="space-y-1.5">{rows.map(([ok, icon, text], i) => (
        <li key={i} className={cx('flex items-center gap-2 text-sm', ok ? 'text-ink' : 'text-muted')}><span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', ok ? 'bg-ok/15 text-ok' : 'bg-raised')}>{ok ? <Check size={14} /> : icon}</span>{text}</li>))}
      </ul>
      {p ? (
        <div className="space-y-1" aria-live="polite">
          <p className="flex items-center gap-2 text-sm font-bold"><Loader2 size={15} className="animate-spin" />שומרים: {STEP_HE[p.step]}{p.step === 'map' ? ` ${p.done}/${p.total}` : ''}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-raised"><div className="h-full bg-moss transition-all" style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }} /></div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" icon={prep ? <RefreshCw size={15} /> : <Download size={15} />} disabled={!online} onClick={run}>{prep ? 'רענון לפני היציאה' : 'הכנת הטיול לשימוש ללא קליטה'}</Button>
          <a href={href('/guide/emergency')} className="inline-flex items-center gap-1 text-sm font-bold text-danger"><ShieldAlert size={15} />מספרי חירום</a>
          {!online && <span className="text-xs text-muted">צריך חיבור כדי להכין — עשו את זה בבית.</span>}
        </div>
      )}
      <p className="text-xs text-muted">סימונים ושינויים בלי קליטה נשמרים במכשיר ונשלחים לשותפים כשהקליטה חוזרת. המפה נשמרת לפי <a className="underline" href={MAP_TERMS_URL} target="_blank" rel="noreferrer">תנאי OpenFreeMap</a> (עד 3,000 אריחים או 50MB).</p>
    </section>
  );
}
