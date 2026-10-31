// Shared trip album: adding photos (with the date they were taken), and making the end-of-trip
// collage and slideshow video on the device. Images live in IndexedDB; the cloud copy is synced by lib/cloud/sync.
import type { AlbumPhoto, Trip } from './types';
import { putPhoto, getPhoto } from './photos';
import { useStore } from './store';
import { fmtRange } from './util';

// ── EXIF: DateTimeOriginal (0x9003) from a JPEG, so photos sort by when they were taken ──
export async function exifDate(file: Blob): Promise<number | null> {
  try {
    const v = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
    if (v.getUint16(0) !== 0xffd8) return null;
    let o = 2;
    while (o + 4 < v.byteLength) {
      const marker = v.getUint16(o), len = v.getUint16(o + 2);
      if (marker === 0xffe1 && v.getUint32(o + 4) === 0x45786966) return readTiff(v, o + 10);
      if ((marker & 0xff00) !== 0xff00) return null;
      o += 2 + len;
    }
  } catch { /* not a JPEG / truncated */ }
  return null;
}
function readTiff(v: DataView, t: number): number | null {
  const le = v.getUint16(t) === 0x4949;
  const u16 = (p: number) => v.getUint16(p, le), u32 = (p: number) => v.getUint32(p, le);
  const ifd = (start: number, want: number): number | null => {
    const n = u16(start);
    for (let i = 0; i < n; i++) { const e = start + 2 + i * 12; if (u16(e) === want) return e; }
    return null;
  };
  const ifd0 = t + u32(t + 4);
  const exifPtr = ifd(ifd0, 0x8769); if (exifPtr == null) return null;
  const e = ifd(t + u32(exifPtr + 8), 0x9003); if (e == null) return null;
  const off = t + u32(e + 8); let s = '';
  for (let i = 0; i < 19; i++) s += String.fromCharCode(v.getUint8(off + i));
  const m = s.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/); if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
}

/** Downscale to ≤1600 px and keep the JPEG under ~650 KB, so one photo fits one Firestore document. */
export async function prepare(file: Blob): Promise<{ blob: Blob; w: number; h: number }> {
  const bmp = await createImageBitmap(file);
  for (const [max, q] of [[1600, 0.82], [1600, 0.7], [1280, 0.7], [1024, 0.65]] as const) {
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise(r => c.toBlob(b => r(b!), 'image/jpeg', q));
    if (blob.size < 650_000 || max === 1024) return { blob, w: c.width, h: c.height };
  }
  throw new Error('unreachable');
}

export const newPhotoId = () => 'ph-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function addPhotos(tripId: string, files: File[], by: string, byUid: string | undefined, onEach?: (done: number) => void): Promise<AlbumPhoto[]> {
  const out: AlbumPhoto[] = [];
  for (const [i, f] of files.entries()) {
    try {
      const { blob, w, h } = await prepare(f);
      const id = newPhotoId();
      await putPhoto(id, blob);
      out.push({ id, tripId, by, byUid, takenAt: (await exifDate(f)) ?? f.lastModified ?? Date.now(), addedAt: Date.now(), w, h });
    } catch { /* unreadable file: skip */ }
    onEach?.(i + 1);
  }
  if (out.length) useStore.getState().upsertPhotos(out);
  return out;
}

export const tripPhotos = (album: AlbumPhoto[], tripId: string, withCollage = false) =>
  album.filter(p => p.tripId === tripId && (withCollage || !p.collage)).sort((a, b) => a.takenAt - b.takenAt);

async function bitmap(id: string) { const b = await getPhoto(id); if (!b) throw new Error('missing photo'); return createImageBitmap(b); }

/** Spread a selection evenly over the whole trip (keeps every day represented). */
export function pick<T>(list: T[], n: number): T[] {
  if (list.length <= n) return list;
  return Array.from({ length: n }, (_, i) => list[Math.round((i * (list.length - 1)) / (n - 1))]);
}

const FONT = 'Assistant, system-ui, Arial, sans-serif';
const cover = (ctx: CanvasRenderingContext2D, img: ImageBitmap, x: number, y: number, w: number, h: number, zoom = 1, fx = 0.5, fy = 0.5) => {
  const k = Math.max(w / img.width, h / img.height) * zoom;
  const sw = w / k, sh = h / k;
  ctx.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, x, y, w, h);
};

// ── Collage ──
/** A justified mosaic: rows of photos at their own aspect ratios, with a title band. */
export async function makeCollage(t: Trip, photos: AlbumPhoto[], families?: string): Promise<Blob> {
  const W = 2048, pad = 12, band = 300;
  const sel = pick(photos, 24);
  const imgs = await Promise.all(sel.map(p => bitmap(p.id).catch(() => null)));
  const items = sel.map((p, i) => ({ p, img: imgs[i]! })).filter(x => x.img);
  // rows aiming at ~4 per row on a 2048 canvas
  const target = (W - pad) / 4.2;
  const rows: { items: typeof items; h: number }[] = [];
  let row: typeof items = [];
  for (const it of items) {
    row.push(it);
    const ar = row.reduce((s, x) => s + x.img.width / x.img.height, 0);
    const h = (W - pad * (row.length + 1)) / ar;
    if (h < target) { rows.push({ items: row, h }); row = []; }
  }
  if (row.length) { const ar = row.reduce((s, x) => s + x.img.width / x.img.height, 0); rows.push({ items: row, h: Math.min(target * 1.6, (W - pad * (row.length + 1)) / ar) }); }
  const H = band + rows.reduce((s, r) => s + r.h + pad, 0) + pad + 70;
  const c = document.createElement('canvas'); c.width = W; c.height = Math.round(H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f6f1e4'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1d3a29'; ctx.fillRect(0, 0, W, band);
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
  ctx.font = `800 104px ${FONT}`; ctx.fillText(t.name, W / 2, 140);
  ctx.font = `600 46px ${FONT}`; ctx.fillStyle = '#e8dcc4';
  ctx.fillText([fmtRange(t.start, t.end), families].filter(Boolean).join(' · '), W / 2, 220);
  let y = band + pad;
  for (const r of rows) {
    const rowW = r.items.reduce((s, it) => s + (it.img.width / it.img.height) * r.h, 0) + pad * (r.items.length - 1);
    let x = W - (W - rowW) / 2; // right-to-left, a short last row is centred
    for (const it of r.items) {
      const w = (it.img.width / it.img.height) * r.h;
      x -= w; ctx.save(); roundRect(ctx, x, y, w, r.h, 14); ctx.clip(); cover(ctx, it.img, x, y, w, r.h); ctx.restore();
      x -= pad;
    }
    y += r.h + pad;
  }
  ctx.fillStyle = '#5d7a3a'; ctx.font = `700 34px ${FONT}`; ctx.fillText(`${photos.length} תמונות · CampIL`, W / 2, H - 28);
  return new Promise(res => c.toBlob(b => res(b!), 'image/jpeg', 0.88));
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ── Video ──
export interface VideoOpts { portrait: boolean; perPhoto: number; max: number; music?: File | null; track?: { mood: import('./music').Mood; seed: string } | null; families?: string }
export function videoSupport(): { ok: boolean; mime: string; ext: string } {
  const R = (window as any).MediaRecorder as typeof MediaRecorder | undefined;
  if (!R || !HTMLCanvasElement.prototype.captureStream) return { ok: false, mime: '', ext: '' };
  for (const [mime, ext] of [['video/mp4;codecs=avc1,mp4a.40.2', 'mp4'], ['video/mp4', 'mp4'], ['video/webm;codecs=vp9,opus', 'webm'], ['video/webm', 'webm']]) if (R.isTypeSupported(mime)) return { ok: true, mime, ext };
  return { ok: false, mime: '', ext: '' };
}
export const videoLength = (n: number, o: Pick<VideoOpts, 'perPhoto' | 'max'>) => 3.5 + Math.min(n, o.max) * o.perPhoto + 3.5;

/**
 * Real-time slideshow: title card, each photo with a slow zoom/pan over a blurred fill, crossfades,
 * day captions, and an end card — recorded from a canvas. Optional music from the user's own file.
 */
export async function renderVideo(t: Trip, photos: AlbumPhoto[], o: VideoOpts, onProgress: (p: number) => void, signal?: AbortSignal): Promise<{ blob: Blob; ext: string }> {
  const sup = videoSupport(); if (!sup.ok) throw new Error('הדפדפן הזה לא יודע להקליט וידאו. נסו Chrome או Safari מעודכנים.');
  const W = o.portrait ? 1080 : 1920, H = o.portrait ? 1920 : 1080, FPS = 30;
  const sel = pick(photos, o.max);
  const imgs = (await Promise.all(sel.map(p => bitmap(p.id).catch(() => null)))).map((img, i) => ({ img, p: sel[i] })).filter(x => x.img) as { img: ImageBitmap; p: AlbumPhoto }[];
  if (!imgs.length) throw new Error('אין תמונות לסרטון');
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const stream = c.captureStream(FPS);
  let audio: AudioContext | null = null, gain: GainNode | null = null;
  const TITLE = 3.5, END = 3.5, D = o.perPhoto, FADE = Math.min(0.9, D / 3);
  const total = TITLE + imgs.length * D + END;
  if (o.music || o.track) {
    audio = new AudioContext();
    // the user's own file, or original music composed on the device for this trip
    const buf = o.music ? await audio.decodeAudioData(await o.music.arrayBuffer()) : await (await import('./music')).renderMusic(o.track!.mood, o.track!.seed, audio.sampleRate);
    const src = audio.createBufferSource(); src.buffer = buf; src.loop = buf.duration < total;
    gain = audio.createGain(); const dest = audio.createMediaStreamDestination();
    src.connect(gain).connect(dest); gain.gain.setValueAtTime(0, audio.currentTime); gain.gain.linearRampToValueAtTime(1, audio.currentTime + 1.5);
    gain.gain.setValueAtTime(1, audio.currentTime + total - 2.5); gain.gain.linearRampToValueAtTime(0, audio.currentTime + total);
    src.start(); dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
  }
  const rec = new MediaRecorder(stream, { mimeType: sup.mime, videoBitsPerSecond: o.portrait ? 8_000_000 : 10_000_000 });
  const chunks: Blob[] = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise<void>(res => (rec.onstop = () => res()));
  const day0 = new Date(t.start + 'T00:00').getTime();
  const nDays = Math.round((new Date(t.end + 'T00:00').getTime() - day0) / 86400000) + 1;
  const dayOf = (p: AlbumPhoto) => Math.floor((p.takenAt - day0) / 86400000);
  const dayTitle = (p: AlbumPhoto) => { const d = dayOf(p); return d >= 0 && d < nDays ? `יום ${d + 1}` : new Date(p.takenAt).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }); };
  const blurred = imgs.map(x => x.img); // drawn with ctx.filter blur

  const draw = (time: number) => {
    ctx.fillStyle = '#10180f'; ctx.fillRect(0, 0, W, H);
    const text = (s: string, y: number, size: number, weight = 800, color = '#fff', alpha = 1) => { ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillText(s, W / 2, y); ctx.globalAlpha = 1; };
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
    const photoAt = (i: number, local: number, alpha: number) => {
      const { img } = imgs[i]; const k = local / (D + FADE); // 0→1 over the shot
      ctx.globalAlpha = alpha;
      ctx.save(); ctx.filter = 'blur(40px) brightness(0.55)'; cover(ctx, blurred[i], -60, -60, W + 120, H + 120); ctx.restore();
      const fit = Math.min(W / img.width, H / img.height), fill = Math.max(W / img.width, H / img.height);
      const base = Math.min(fill, fit * 1.18); // fill the frame when shapes are close; otherwise show it whole over the blur
      const z = base * (1 + 0.08 * (i % 2 ? 1 - k : k));
      const dw = img.width * z, dh = img.height * z;
      const dx = (W - dw) / 2 + (i % 3 === 0 ? 1 : -1) * 30 * (k - 0.5), dy = (H - dh) / 2 + (i % 2 ? -1 : 1) * 20 * (k - 0.5);
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    };
    if (time < TITLE) {
      const a = Math.min(1, time / 0.8);
      photoAt(0, 0, 0.35 * a);
      text(t.name, H / 2 - 20, o.portrait ? 92 : 110, 800, '#fff', a);
      text(fmtRange(t.start, t.end), H / 2 + 70, 48, 600, '#e8dcc4', a);
      if (o.families) text(o.families, H / 2 + 140, 40, 600, '#e8dcc4', a);
      return;
    }
    const tt = time - TITLE;
    if (tt < imgs.length * D) {
      const i = Math.min(imgs.length - 1, Math.floor(tt / D)), local = tt - i * D;
      if (i > 0 && local < FADE) { photoAt(i - 1, D + local, 1); photoAt(i, local, local / FADE); } else photoAt(i, local, 1);
      // day caption when a new day starts
      const d = dayOf(imgs[i].p), newDay = i === 0 || dayOf(imgs[i - 1].p) !== d;
      if (newDay && local < 2.2) { const a = Math.min(1, local / 0.4, (2.2 - local) / 0.4); const g = ctx.createLinearGradient(0, H - 260, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.55 * a})`); ctx.fillStyle = g; ctx.fillRect(0, H - 260, W, 260); text(dayTitle(imgs[i].p), H - 110, 64, 800, '#fff', a); }
      const cap = imgs[i].p.caption; if (cap) text(cap, H - (newDay && local < 2.2 ? 190 : 110), 44, 700, '#fff');
      return;
    }
    const e = tt - imgs.length * D, a = Math.min(1, e / 0.8);
    photoAt(imgs.length - 1, D + FADE, 1 - 0.65 * a);
    text(t.name, H / 2 - 20, 80, 800, '#fff', a);
    text(`${photos.length} תמונות · ${[...new Set(photos.map(p => p.by))].length} צלמים`, H / 2 + 60, 42, 600, '#e8dcc4', a);
    text('CampIL', H / 2 + 140, 40, 700, '#f08c50', a);
  };

  rec.start(1000);
  const t0 = performance.now();
  await new Promise<void>((res, rej) => {
    const tick = () => {
      if (signal?.aborted) { rec.stop(); return rej(new DOMException('aborted', 'AbortError')); }
      const time = (performance.now() - t0) / 1000;
      draw(Math.min(time, total)); onProgress(Math.min(1, time / total));
      if (time >= total) return res();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop(); await done; audio?.close();
  stream.getTracks().forEach(tr => tr.stop());
  return { blob: new Blob(chunks, { type: sup.mime.split(';')[0] }), ext: sup.ext };
}

/** Save a file to this device (Downloads on Android/computer; on iPhone the share sheet's "Save" is offered). */
export async function downloadFile(blob: Blob, name: string): Promise<'downloaded' | 'shared'> {
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const f = new File([blob], name, { type: blob.type });
  // iOS ignores <a download> for media; its share sheet has "Save Video" / "Save Image"
  if (isIOS && (navigator as any).canShare?.({ files: [f] })) { try { await navigator.share({ files: [f] }); } catch { /* cancelled */ } return 'shared'; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
  return 'downloaded';
}

/** Share a file to WhatsApp/other apps when the device supports it; otherwise download it. */
export async function shareFile(blob: Blob, name: string, title: string): Promise<'shared' | 'downloaded'> {
  const f = new File([blob], name, { type: blob.type });
  if ((navigator as any).canShare?.({ files: [f] })) {
    try { await navigator.share({ files: [f], title }); return 'shared'; } catch (e: any) { if (e?.name === 'AbortError') return 'shared'; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
  return 'downloaded';
}
