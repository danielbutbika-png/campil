import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Images, Film, LayoutGrid, Share2, Trash2, Download, Loader2, Music, X, Sparkles, Smartphone, Monitor, Check } from 'lucide-react';
import type { Trip, AlbumPhoto } from '../../lib/types';
import { useStore } from '../../lib/store';
import { addPhotos, tripPhotos, makeCollage, renderVideo, shareFile, downloadFile, videoSupport, videoLength } from '../../lib/album';
import { deletePhoto } from '../../lib/photos';
import { useCloud } from '../../lib/cloud/sync';
import { addDays, fmtDate, shortDay, todayISO, tripLength } from '../../lib/util';
import { Button, Sheet, Empty, Section, Badge, Chip, cx, toast } from '../../components/ui';
import { whoAmI } from '../../components/Collab';
import { Photo } from './JournalTab';

/** ASCII file names: some browsers drop non-Latin names and save as "download". */
const fileName = (t: Trip, kind: string, ext: string) => `CampIL-${kind}-${t.start}.${ext}`;
const familiesLine = (t: Trip) => (t.families && t.families.length > 1 ? t.families.map(f => f.name).join(' · ') : undefined);

export default function AlbumTab({ t }: { t: Trip }) {
  const album = useStore(s => s.album);
  const { removePhoto, upsertPhotos } = useStore();
  const myUid = useCloud(s => s.uid);
  const photos = useMemo(() => tripPhotos(album, t.id), [album, t.id]);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [open, setOpen] = useState<AlbumPhoto | null>(null);
  const [collage, setCollage] = useState<{ url: string; blob: Blob } | null>(null);
  const [making, setMaking] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const me = whoAmI();
  const isOwner = !t.shared || t.shared.role === 'owner';
  const ended = t.end < todayISO();
  const people = [...new Set(photos.map(p => p.by))];
  const day0 = new Date(t.start + 'T00:00').getTime();
  const byDay = useMemo(() => {
    const m = new Map<number, AlbumPhoto[]>();
    for (const p of photos) { const d = Math.floor((p.takenAt - day0) / 86400000); const k = d < 0 ? -1 : d; m.set(k, [...(m.get(k) ?? []), p]); }
    return [...m].sort((a, b) => a[0] - b[0]);
  }, [photos]);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files].filter(f => f.type.startsWith('image/'));
    setBusy({ done: 0, total: list.length });
    const out = await addPhotos(t.id, list, me, myUid, done => setBusy({ done, total: list.length }));
    setBusy(null); if (file.current) file.current.value = '';
    toast(out.length ? `נוספו ${out.length} תמונות${t.shared ? ' — כל המשתתפים יראו אותן' : ''}` : 'לא הצלחנו לקרוא את הקבצים');
  };
  const doCollage = async () => {
    if (photos.length < 2) return toast('צריך לפחות 2 תמונות');
    setMaking(true);
    try { const blob = await makeCollage(t, photos, familiesLine(t)); setCollage({ blob, url: URL.createObjectURL(blob) }); }
    catch { toast('יצירת הקולאז׳ נכשלה'); }
    setMaking(false);
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 rounded-xl2 border border-line bg-surface p-4">
        <Images size={34} className="text-moss" />
        <div className="min-w-0 flex-1"><p className="font-display text-xl">אלבום משותף</p>
          <p className="num text-sm text-muted">{photos.length} תמונות{people.length ? ` · צילמו: ${people.join(', ')}` : ''}{t.shared ? ' · כל המשתתפים מוסיפים ורואים' : ''}</p></div>
        <input ref={file} type="file" accept="image/*" multiple className="sr-only" id="album-add" aria-label="בחירת תמונות לאלבום" onChange={e => add(e.target.files)} />
        <Button icon={busy ? <Loader2 size={17} className="animate-spin" /> : <ImagePlus size={17} />} disabled={!!busy} onClick={() => file.current?.click()}>{busy ? `מעלה ${busy.done}/${busy.total}…` : 'הוספת תמונות'}</Button>
      </div>

      {ended && photos.length >= 2 && (
        <div className="space-y-2 rounded-xl2 border-2 border-sunset/40 bg-sunset/5 p-4">
          <p className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-sunset" />הטיול הסתיים — זמן לסיכום</p>
          <p className="text-sm">צרו קולאז׳ וסרטון מכל {photos.length} התמונות של כולם. הם נוצרים בטלפון שלכם ונשמרים רק אצלכם — לא עולים לרשת.</p>
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="accent" icon={<Film size={15} />} onClick={() => setVideoOpen(true)}>יצירת סרטון הטיול</Button><Button size="sm" variant="soft" icon={making ? <Loader2 size={15} className="animate-spin" /> : <LayoutGrid size={15} />} disabled={making} onClick={doCollage}>יצירת קולאז׳</Button></div>
        </div>
      )}

      {photos.length === 0 ? (
        <Empty icon={<Images size={36} />} title="האלבום עוד ריק" body={t.shared ? 'כל משתתף מוסיף את התמונות שלו מהטלפון, וכולם רואים את כולן. בסוף הטיול נכין מהן קולאז׳ וסרטון.' : 'הוסיפו תמונות מהטיול. בסוף נכין מהן קולאז׳ וסרטון.'} />
      ) : (
        <>
          {byDay.map(([d, ps]) => (
            <section key={d} className="space-y-2">
              <h3 className="font-bold">{d < 0 ? 'לפני הטיול' : d >= tripLength(t.start, t.end).days ? `${shortDay(addDays(t.start, d))} ${fmtDate(addDays(t.start, d))}` : `יום ${d + 1} · ${shortDay(addDays(t.start, d))} ${fmtDate(addDays(t.start, d))}`} <span className="num text-sm font-normal text-muted">({ps.length})</span></h3>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
                {ps.map(p => <button key={p.id} onClick={() => setOpen(p)} className="relative" aria-label={`תמונה של ${p.by}${p.caption ? `: ${p.caption}` : ''}`}><Photo id={p.id} alt={p.caption ?? ''} className="aspect-square w-full rounded-lg object-cover" />{t.shared && <span className="absolute bottom-1 right-1 max-w-[90%] truncate rounded-full bg-black/55 px-1.5 text-[10px] font-bold text-white">{p.by}</span>}</button>)}
              </div>
            </section>
          ))}
          {!ended && (
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <Button size="sm" variant="soft" icon={making ? <Loader2 size={15} className="animate-spin" /> : <LayoutGrid size={15} />} disabled={making} onClick={doCollage}>קולאז׳ עכשיו</Button>
              <Button size="sm" variant="soft" icon={<Film size={15} />} onClick={() => setVideoOpen(true)}>סרטון עכשיו</Button>
              <p className="w-full text-xs text-muted">הקולאז׳ והסרטון נוצרים בטלפון שלכם ונשמרים רק אצלכם. בסוף הטיול ({fmtDate(t.end)}) נזכיר לכולם ליצור אותם.</p>
            </div>
          )}
        </>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.collage ? 'קולאז׳ הטיול' : `צילם/ה: ${open?.by ?? ''}`} wide>
        {open && <PhotoView p={open} canEdit={open.by === me || isOwner} onCaption={c => upsertPhotos([{ ...open, caption: c || undefined }])}
          onDelete={async () => { removePhoto(open.id); deletePhoto(open.id).catch(() => {}); setOpen(null); toast('התמונה נמחקה'); }} />}
      </Sheet>
      <Sheet open={!!collage} onClose={() => setCollage(null)} title="קולאז׳ הטיול" wide footer={<>
        <Button icon={<Download size={16} />} onClick={async () => { if (collage && (await downloadFile(collage.blob, fileName(t, 'collage', 'jpg'))) === 'downloaded') toast('הקולאז׳ נשמר בהורדות של המכשיר'); }}>הורדה למכשיר</Button>
        <Button variant="soft" icon={<Share2 size={16} />} onClick={() => collage && shareFile(collage.blob, fileName(t, 'collage', 'jpg'), t.name)}>שליחה בוואטסאפ / שיתוף</Button></>}>
        {collage && <img src={collage.url} alt="קולאז׳ הטיול" className="w-full rounded-xl" />}
      </Sheet>
      {videoOpen && <VideoMaker t={t} photos={photos} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}

function PhotoView({ p, canEdit, onCaption, onDelete }: { p: AlbumPhoto; canEdit: boolean; onCaption: (c: string) => void; onDelete: () => void }) {
  const [cap, setCap] = useState(p.caption ?? '');
  return (
    <div className="space-y-3">
      <Photo id={p.id} alt={p.caption ?? ''} className="max-h-[65dvh] w-full rounded-xl object-contain" />
      <p className="text-sm text-muted">{new Date(p.takenAt).toLocaleString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      {canEdit && !p.collage && <div className="flex gap-2"><label className="sr-only" htmlFor="pcap">כיתוב</label><input id="pcap" className="field" placeholder="כיתוב (יופיע גם בסרטון)" value={cap} onChange={e => setCap(e.target.value)} /><Button variant="soft" onClick={() => { onCaption(cap.trim()); toast('הכיתוב נשמר'); }}>שמירה</Button></div>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="soft" icon={<Download size={15} />} onClick={async () => { const b = await (await import('../../lib/photos')).getPhoto(p.id); if (b) downloadFile(b, `CampIL-${p.id}.jpg`); }}>הורדה</Button>
        {canEdit && <Button size="sm" variant="ghost" icon={<Trash2 size={15} />} onClick={onDelete}>מחיקה</Button>}
      </div>
    </div>
  );
}

function VideoMaker({ t, photos, onClose }: { t: Trip; photos: AlbumPhoto[]; onClose: () => void }) {
  const sup = videoSupport();
  const [portrait, setPortrait] = useState(true);
  const [per, setPer] = useState(3);
  const [max, setMax] = useState(40);
  const [music, setMusic] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [out, setOut] = useState<{ url: string; blob: Blob; ext: string } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const len = Math.round(videoLength(photos.length, { perPhoto: per, max }));
  useEffect(() => () => abort.current?.abort(), []);
  const go = async () => {
    abort.current = new AbortController(); setProgress(0); setOut(null);
    let lock: any = null; try { lock = await (navigator as any).wakeLock?.request('screen'); } catch { /* not supported */ }
    try { const r = await renderVideo(t, photos, { portrait, perPhoto: per, max, music, families: familiesLine(t) }, setProgress, abort.current.signal); setOut({ ...r, url: URL.createObjectURL(r.blob) }); }
    catch (e: any) { if (e?.name !== 'AbortError') toast(e?.message ?? 'יצירת הסרטון נכשלה'); }
    lock?.release?.(); setProgress(null);
  };
  return (
    <Sheet open onClose={() => { abort.current?.abort(); onClose(); }} title="סרטון הטיול" wide footer={out ? <>
      <Button icon={<Download size={16} />} onClick={async () => { if ((await downloadFile(out.blob, fileName(t, 'video', out.ext))) === 'downloaded') toast('הסרטון נשמר בהורדות של המכשיר'); }}>הורדה למכשיר</Button>
      <Button variant="soft" icon={<Share2 size={16} />} onClick={() => shareFile(out.blob, fileName(t, 'video', out.ext), t.name)}>שליחה בוואטסאפ / שיתוף</Button>
      <Button variant="soft" onClick={() => setOut(null)}>סרטון אחר</Button></> : progress == null ? <Button icon={<Film size={16} />} disabled={!sup.ok || photos.length < 2} onClick={go}>יצירת הסרטון ({len} שניות)</Button> : <Button variant="ghost" icon={<X size={16} />} onClick={() => abort.current?.abort()}>ביטול</Button>}>
      {!sup.ok ? <p className="text-danger">הדפדפן הזה לא יודע ליצור וידאו. נסו Chrome באנדרואיד או במחשב, או Safari מעודכן באייפון.</p>
      : out ? <div className="space-y-2"><video src={out.url} controls playsInline className="max-h-[60dvh] w-full rounded-xl bg-black" /><p className="text-xs text-muted">{(out.blob.size / 1e6).toFixed(1)} MB · {out.ext.toUpperCase()}. הסרטון נמצא רק בטלפון שלכם — הורידו אותו לפני שסוגרים. כל משתתף יכול ליצור סרטון משלו מהאלבום המשותף.</p></div>
      : progress != null ? (
        <div className="space-y-3 py-6 text-center">
          <Loader2 size={30} className="mx-auto animate-spin text-sunset" />
          <p className="font-bold">יוצרים את הסרטון… {Math.round(progress * 100)}%</p>
          <div className="h-2 overflow-hidden rounded-full bg-raised"><div className="h-full bg-sunset transition-all" style={{ width: `${progress * 100}%` }} /></div>
          <p className="text-sm text-muted">השאירו את המסך פתוח עד הסוף — הסרטון מוקלט בזמן אמת ({len} שניות).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">סרטון באיכות גבוהה מכל התמונות: פתיח עם שם הטיול, זום ותנועה עדינים, מעברים רכים, כותרת לכל יום, הכיתובים שכתבתם וסיום. {photos.length > max ? `נבחרות ${max} תמונות מפוזרות על כל הימים.` : ''}</p>
          <div><span className="label">פורמט</span><div className="flex flex-wrap gap-2"><Chip active={portrait} onClick={() => setPortrait(true)}><Smartphone size={14} />לאורך — וואטסאפ / סטורי</Chip><Chip active={!portrait} onClick={() => setPortrait(false)}><Monitor size={14} />לרוחב — טלוויזיה / מחשב</Chip></div></div>
          <div><span className="label">שניות לכל תמונה</span><div className="flex gap-2">{[2, 3, 4.5].map(s => <Chip key={s} active={per === s} onClick={() => setPer(s)}>{s === 2 ? 'מהיר' : s === 3 ? 'רגיל' : 'רגוע'}</Chip>)}</div></div>
          <div><span className="label">כמה תמונות</span><div className="flex gap-2">{[20, 40, 80].map(n => <Chip key={n} active={max === n} onClick={() => setMax(n)}>עד {n}</Chip>)}</div></div>
          <div><label className="label flex items-center gap-1.5" htmlFor="vm"><Music size={14} />מוזיקה (לא חובה) — קובץ שיר מהטלפון</label>
            <input id="vm" type="file" accept="audio/*" className="sr-only" onChange={e => setMusic(e.target.files?.[0] ?? null)} />
            <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="soft" icon={<Music size={14} />} onClick={() => document.getElementById('vm')?.click()}>{music ? 'החלפת שיר' : 'בחירת שיר'}</Button>{music && <><span className="min-w-0 truncate text-sm font-semibold" dir="auto">{music.name}</span><button className="text-sm text-muted underline" onClick={() => setMusic(null)}>הסרה</button></>}</div>
            <p className="mt-1 text-xs text-muted">השתמשו בשיר שמותר לכם להשתמש בו. בלי קובץ — הסרטון יהיה שקט.</p></div>
          <Badge tone="info">אורך הסרטון: כ-{len} שניות</Badge>
        </div>
      )}
    </Sheet>
  );
}
