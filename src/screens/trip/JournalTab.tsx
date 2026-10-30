import { useEffect, useState } from 'react';
import { Camera, MapPin, Plus, Share2, Trash2, Pencil, LocateFixed, BookOpen } from 'lucide-react';
import type { Trip, JournalEntry } from '../../lib/types';
import { useStore } from '../../lib/store';
import { useCloud } from '../../lib/cloud/sync';
import { canChange } from '../../lib/authorship';
import { useGeolocation } from '../../lib/hooks';
import { compressImage, putPhoto, photoURL, deletePhoto, getPhoto } from '../../lib/photos';
import { SITE_BY_ID, navLinks } from '../../data/sites';
import { fmtDate, todayISO, uid } from '../../lib/util';
import { Button, Sheet, Empty, cx, toast } from '../../components/ui';
import { shareText } from '../../lib/share';
import { whoAmI } from '../../components/Collab';

export function Photo({ id, className, alt = '' }: { id: string; className?: string; alt?: string }) {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => { let on = true; photoURL(id).then(x => on && setU(x)); return () => { on = false; }; }, [id]);
  return u ? <img src={u} alt={alt} className={className} loading="lazy" /> : <div className={cx('animate-pulse bg-raised', className)} />;
}

export default function JournalTab({ t }: { t: Trip }) {
  const entries = useStore(s => s.journal.filter(j => j.tripId === t.id).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)));
  const remove = useStore(s => s.removeEntry);
  const [edit, setEdit] = useState<JournalEntry | null>(null);
  const myUid = useCloud(s => s.uid);
  const blank = (): JournalEntry => ({ id: uid('j'), tripId: t.id, createdAt: new Date().toISOString(), date: todayISO() >= t.start && todayISO() <= t.end ? todayISO() : t.start, title: '', text: '', photoIds: [], author: whoAmI(), ...(t.shared && myUid ? { byUid: myUid } : {}) });
  const share = async (e: JournalEntry) => {
    const text = `${e.title}\n${fmtDate(e.date)}\n\n${e.text}${e.loc ? `\n📍 ${navLinks(e.loc.lat, e.loc.lon).google}` : ''}`;
    if (navigator.canShare && e.photoIds.length) {
      const files = (await Promise.all(e.photoIds.slice(0, 5).map(async (id, i) => { const b = await getPhoto(id); return b ? new File([b], `campil-${i + 1}.jpg`, { type: 'image/jpeg' }) : null; }))).filter(Boolean) as File[];
      if (navigator.canShare({ files })) { try { await navigator.share({ title: e.title, text, files }); return; } catch { /* fall through */ } }
    }
    shareText(e.title, text);
  };
  return (
    <div className="space-y-5">
      <Button icon={<Plus size={18} />} onClick={() => setEdit(blank())}>רשומה חדשה</Button>
      {!entries.length && <Empty icon={<BookOpen size={36} />} title="היומן עוד ריק" body="תעדו רגעים מהטיול: תמונות, סיפור קצר ומיקום. הכול נשמר במכשיר." />}
      <div className="columns-1 gap-4 md:columns-2">
        {entries.map(e => (
          <article key={e.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
            {e.photoIds.length > 0 && <div className={cx('grid gap-0.5', e.photoIds.length > 1 && 'grid-cols-2')}>{e.photoIds.slice(0, 4).map((p, i) => <Photo key={p} id={p} alt={`${e.title} ${i + 1}`} className={cx('w-full object-cover', e.photoIds.length === 1 ? 'aspect-[4/3]' : 'aspect-square')} />)}</div>}
            <div className="space-y-2 p-4">
              <div className="flex items-start gap-2"><div className="flex-1"><h3 className="font-bold">{e.title || 'ללא כותרת'}</h3><p className="text-xs text-muted">{fmtDate(e.date, true)}{e.loc?.label && ` · ${e.loc.label}`}{t.shared && e.author ? ` · ${e.author}` : ''}</p></div>
                <button aria-label="שיתוף" onClick={() => share(e)} className="text-muted hover:text-ink"><Share2 size={17} /></button>
                {canChange(t, e, { uid: myUid, name: whoAmI() }) && <button aria-label="עריכה" onClick={() => setEdit(e)} className="text-muted hover:text-ink"><Pencil size={17} /></button>}
              </div>
              {e.text && <p className="whitespace-pre-line text-sm">{e.text}</p>}
              {e.loc && <a className="inline-flex items-center gap-1 text-sm font-bold text-moss" href={navLinks(e.loc.lat, e.loc.lon).google} target="_blank" rel="noreferrer"><MapPin size={14} />במפה</a>}
            </div>
          </article>
        ))}
      </div>
      {edit && <EntrySheet t={t} e={edit} onClose={() => setEdit(null)} onDelete={() => { edit.photoIds.forEach(id => deletePhoto(id).catch(() => {})); remove(edit.id); setEdit(null); toast('הרשומה נמחקה'); }} />}
    </div>
  );
}

function EntrySheet({ t, e, onClose, onDelete }: { t: Trip; e: JournalEntry; onClose: () => void; onDelete: () => void }) {
  const upsert = useStore(s => s.upsertEntry);
  const exists = useStore(s => s.journal.some(j => j.id === e.id));
  const [d, setD] = useState(e);
  const [busy, setBusy] = useState(false);
  const geo = useGeolocation();
  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true);
    try { const ids: string[] = []; for (const f of Array.from(files)) { const id = uid('p'); await putPhoto(id, await compressImage(f)); ids.push(id); } setD(x => ({ ...x, photoIds: [...x.photoIds, ...ids] })); }
    catch { toast('לא הצלחנו לשמור את התמונה — ייתכן שהאחסון במכשיר מלא'); }
    setBusy(false);
  };
  return (
    <Sheet open onClose={onClose} title={exists ? 'עריכת רשומה' : 'רשומה חדשה'} wide footer={<><Button disabled={busy} onClick={() => { upsert({ ...d, title: d.title.trim() || fmtDate(d.date) }); onClose(); toast('נשמר ביומן'); }}>שמירה</Button>{exists && <Button variant="danger" icon={<Trash2 size={16} />} onClick={onDelete}>מחיקה</Button>}</>}>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div><label className="label" htmlFor="jt">כותרת</label><input id="jt" className="field" placeholder="הזריחה מעל המכתש" value={d.title} onChange={x => setD({ ...d, title: x.target.value })} /></div>
          <div><label className="label" htmlFor="jd">תאריך</label><input id="jd" type="date" className="field" value={d.date} onChange={x => setD({ ...d, date: x.target.value })} /></div>
        </div>
        <div><label className="label" htmlFor="jx">הסיפור</label><textarea id="jx" className="field min-h-32" value={d.text} onChange={x => setD({ ...d, text: x.target.value })} /></div>
        <div>
          <span className="label">תמונות</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {d.photoIds.map(p => <div key={p} className="relative"><Photo id={p} className="aspect-square w-full rounded-xl object-cover" /><button aria-label="הסרת תמונה" onClick={() => setD({ ...d, photoIds: d.photoIds.filter(x => x !== p) })} className="absolute left-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"><Trash2 size={14} /></button></div>)}
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-muted hover:border-moss"><span className="flex flex-col items-center gap-1 text-sm font-bold"><Camera size={22} />{busy ? 'שומר…' : 'הוספה'}</span><input type="file" accept="image/*" multiple className="sr-only" onChange={x => addPhotos(x.target.files)} /></label>
          </div>
        </div>
        <div>
          <span className="label">מיקום</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="soft" icon={<LocateFixed size={15} />} disabled={geo.loading} onClick={async () => { const p = await geo.request(); if (p) setD({ ...d, loc: { ...p, label: 'המיקום שלי' } }); }}>{geo.loading ? 'מאתר…' : 'המיקום הנוכחי'}</Button>
            {t.siteIds.map(id => SITE_BY_ID[id]).filter(Boolean).map(s => <Button key={s.id} size="sm" variant={d.loc?.label === s.name ? 'primary' : 'soft'} onClick={() => setD({ ...d, loc: { lat: s.lat, lon: s.lon, label: s.name } })}>{s.name}</Button>)}
            {d.loc && <Button size="sm" variant="ghost" onClick={() => setD({ ...d, loc: undefined })}>ללא מיקום</Button>}
          </div>
          {geo.error && <p className="mt-1 text-sm text-danger">{geo.error}</p>}
          {d.loc && <p className="num mt-1 text-xs text-muted">{d.loc.label} · {d.loc.lat.toFixed(4)}, {d.loc.lon.toFixed(4)}</p>}
        </div>
      </div>
    </Sheet>
  );
}
