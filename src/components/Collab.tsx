import { useEffect, useMemo, useState } from 'react';
import { Users, Copy, Share2, Check, Link2, Loader2, Radio, LogOut, Trash2, Settings2, BadgeCheck, ShieldCheck, Bell, BellOff, Globe, UserMinus, X as XIcon } from 'lucide-react';
import type { Trip } from '../lib/types';
import { useStore } from '../lib/store';
import { useCloud, shareTrip, inviteLink, isOnline, leaveTrip, approve, deny, removeMember, setAccess, signInGoogle, signOutGoogle, setMemberFamily } from '../lib/cloud/sync';
import { isGroup, familyById } from '../lib/families';
import type { Member } from '../lib/cloud/model';
import { parseFirebaseConfig } from '../lib/cloud/model';
import { shareText, tripSummary, whatsappURL } from '../lib/share';
import { Button, Sheet, Badge, cx, toast } from './ui';
import { notifyState, requestNotify, showSystem, type NotifyState } from '../lib/cloud/notify';
import { href, go } from '../lib/router';
import { myPacking } from '../lib/families';

/** Display name used to stamp who packed / completed something. */
export const whoAmI = () => { const s = useStore.getState(); return s.settings.cloud?.myName || s.members.find(m => m.role === 'adult')?.name || 'אני'; };
export const stamp = () => ({ by: whoAmI(), at: Date.now() });

export function ago(ts?: number) {
  if (!ts) return '';
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'עכשיו'; if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.round(m / 60); if (h < 24) return `לפני ${h} ש׳`;
  return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
}

export function Avatar({ m, size = 32, ring = true }: { m: Pick<Member, 'name' | 'color' | 'photo'>; size?: number; ring?: boolean }) {
  return m.photo
    ? <img src={m.photo} alt="" referrerPolicy="no-referrer" className={cx('rounded-full object-cover', ring && 'ring-2 ring-white/80')} style={{ width: size, height: size }} />
    : <span className={cx('grid place-items-center rounded-full font-extrabold text-white', ring && 'ring-2 ring-white/80')} style={{ width: size, height: size, background: m.color, fontSize: size * 0.38 }}>{m.name.slice(0, 1)}</span>;
}
export const Verified = ({ m }: { m?: Member }) => (m?.verified ? <BadgeCheck size={15} className="inline shrink-0 text-info" aria-label="מאומת עם Google" /> : null);

export function Avatars({ t, light }: { t: Trip; light?: boolean }) {
  const members = useCloud(s => (t.shared ? s.members[t.shared.cloudId] : undefined)) ?? {};
  const [, tick] = useState(0); useEffect(() => { const i = setInterval(() => tick(x => x + 1), 30000); return () => clearInterval(i); }, []);
  const list = Object.entries(members);
  if (!t.shared || !list.length) return null;
  return (
    <div className="flex items-center gap-2" aria-label={`${list.length} שותפים`}>
      <div className="flex -space-x-2 space-x-reverse">
        {list.slice(0, 6).map(([uid, m]) => (
          <span key={uid} title={`${m.name}${m.verified ? ' ✓' : ''}${isOnline(m) ? ' — מחובר/ת' : ''}`} className="relative">
            <Avatar m={m} />{isOnline(m) && <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full bg-[#3ccf6e] ring-2 ring-white" />}
          </span>))}
      </div>
      <span className={cx('text-xs font-bold', light ? 'text-white/90' : 'text-muted')}>{list.filter(([, m]) => isOnline(m)).length} מחוברים</span>
    </div>
  );
}

export function ShareSheet({ t, open, onClose }: { t: Trip; open: boolean; onClose: () => void }) {
  const cloud = useStore(s => s.settings.cloud);
  const status = useCloud(s => s.status), err = useCloud(s => s.error);
  const members = useCloud(s => (t.shared ? s.members[t.shared.cloudId] : undefined)) ?? {};
  const meta = useCloud(s => (t.shared ? s.meta[t.shared.cloudId] : undefined));
  const myUid = useCloud(s => s.uid);
  const isOwner = t.shared?.role === 'owner' || (meta && meta.owner === myUid);
  const pending = Object.entries(meta?.pending ?? {});
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(t.shared && cloud ? inviteLink(t.shared.cloudId) : null);
  useEffect(() => { if (t.shared && cloud) setLink(inviteLink(t.shared.cloudId)); }, [t.shared?.cloudId, !!cloud, meta?.access]);
  useEffect(() => { if (open && cloud) import('../lib/cloud/sync').then(m => m.transport()).catch(() => {}); }, [open, !!cloud]);
  const act = (f: () => Promise<unknown>, ok: string) => f().then(() => toast(ok)).catch(e => toast(e.message));
  const start = async () => { setBusy(true); try { setLink(await shareTrip(t.id)); toast('הטיול משותף — שלחו את הקישור'); } catch (e: any) { toast(e.message); } setBusy(false); };
  const msg = link ? `הצטרפו לתכנון "${t.name}" ב-CampIL — רואים ומסמנים יחד בזמן אמת:\n${link}` : '';
  const copy = async () => { try { await navigator.clipboard.writeText(link!); toast('הקישור הועתק'); } catch { toast('לא ניתן להעתיק — סמנו את הקישור ידנית'); } };
  return (
    <Sheet open={open} onClose={onClose} title="שיתוף הטיול">
      <div className="space-y-5">
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 font-bold"><Radio size={18} className="text-sunset" />עריכה משותפת בזמן אמת</h3>
          {!cloud ? (
            <div className="space-y-2 rounded-xl border border-line bg-raised/40 p-3 text-sm">
              <p>כדי לערוך יחד צריך לחבר פעם אחת שרת Firebase (חינמי). אחרי זה כל טיול משותפים בלחיצה.</p>
              <Button size="sm" icon={<Settings2 size={15} />} onClick={() => { onClose(); go('/settings'); setTimeout(() => document.getElementById('cloud')?.scrollIntoView(), 300); }}>להגדרת השיתוף</Button>
            </div>
          ) : !t.shared ? (
            <div className="space-y-2">
              <p className="text-sm text-muted">כל מי שמקבל את הקישור יוכל לערוך את הטיול: ציוד, משימות, תפריט, לו״ז ויומן. כל סימון מראה מי סימן ומתי.</p>
              <Button icon={busy ? <Loader2 size={17} className="animate-spin" /> : <Users size={17} />} disabled={busy} onClick={start}>{busy ? 'מעלה את הטיול…' : 'הפעלת עריכה משותפת'}</Button>
              {status === 'error' && <p className="text-sm text-danger">{err}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {isGroup(t) && isOwner ? <FamilyLinks t={t} /> : <>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2"><Link2 size={16} className="shrink-0 text-muted" /><input readOnly aria-label="קישור הזמנה" className="min-w-0 flex-1 bg-transparent text-xs" dir="ltr" value={link ?? ''} onFocus={e => e.target.select()} /><Button size="sm" variant="soft" icon={<Copy size={14} />} onClick={copy}>העתקה</Button></div>
              <div className="flex flex-wrap gap-2">
                <a className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white" href={whatsappURL(msg)} target="_blank" rel="noreferrer"><Share2 size={15} />שליחה בוואטסאפ</a>
                <Button size="sm" variant="soft" icon={<Share2 size={15} />} onClick={() => shareText(t.name, msg)}>שיתוף אחר</Button>
              </div></>}
              <NotifyCard />
              {isOwner && meta && (
                <div className="space-y-2 rounded-xl border border-line p-3">
                  <p className="text-sm font-bold">מי יכול להצטרף?</p>
                  <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="הרשאת הצטרפות">
                    {([['link', 'כל מי שיש לו את הקישור', 'נכנסים עם שם, בלי התחברות', Globe], ['approved', 'רק מי שאישרתי', 'התחברות עם Google ואישור שלך', ShieldCheck]] as const).map(([v, l, d, I]) => (
                      <button key={v} role="radio" aria-checked={meta.access === v} onClick={() => act(() => setAccess(t.shared!.cloudId, v), v === 'approved' ? 'מעכשיו רק משתתפים מאושרים' : 'הטיול פתוח לכל מי שיש לו קישור')}
                        className={cx('flex items-start gap-2 rounded-xl border p-3 text-right', meta.access === v ? 'border-forest bg-forest/8 ring-2 ring-forest/30' : 'border-line')}>
                        <I size={18} className="mt-0.5 shrink-0 text-moss" /><span><span className="block text-sm font-bold">{l}</span><span className="block text-xs text-muted">{d}</span></span>
                      </button>))}
                  </div>
                  {meta.access === 'approved' && <p className="text-xs text-muted">שימו לב: מי שכבר משתתף נשאר משתתף. אפשר להסיר אנשים מהרשימה למטה. הקישור התעדכן — שלחו את החדש.</p>}
                </div>
              )}
              {isOwner && pending.length > 0 && (
                <div className="space-y-2 rounded-xl border-2 border-sunset/50 bg-sunset/5 p-3">
                  <p className="text-sm font-bold">ממתינים לאישור ({pending.length})</p>
                  {pending.map(([uid, p]) => (
                    <div key={uid} className="flex items-center gap-2">
                      <Avatar m={{ name: p.name, color: '#999', photo: p.photo }} size={30} ring={false} />
                      <span className="min-w-0 flex-1 text-sm"><span className="block font-semibold">{p.name} <BadgeCheck size={14} className="inline text-info" /></span><span className="block truncate text-xs text-muted" dir="ltr">{p.email}</span></span>
                      <Button size="sm" onClick={() => act(() => approve(t.shared!.cloudId, uid), `${p.name} אושר/ה`)}>אישור</Button>
                      <button aria-label={`דחיית ${p.name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-raised" onClick={() => act(() => deny(t.shared!.cloudId, uid), 'הבקשה נדחתה')}><XIcon size={16} /></button>
                    </div>))}
                </div>
              )}
              <ul className="space-y-2">
                {Object.entries(members).map(([uid, m]) => (
                  <li key={uid} className="flex items-center gap-2 text-sm">
                    <Avatar m={m} size={30} ring={false} />
                    <span className="min-w-0 flex-1"><span className="flex items-center gap-1 font-semibold">{m.name}<Verified m={m} />{uid === myUid && <span className="font-normal text-muted"> (אני)</span>}{m.role === 'owner' && <span className="font-normal text-muted"> · מארגן</span>}</span>
                      {m.email && <span className="block truncate text-xs text-muted" dir="ltr">{m.email}</span>}
                      {isGroup(t) && (isOwner && m.role !== 'owner'
                        ? <select aria-label={`המשפחה של ${m.name}`} className="mt-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs font-bold" value={m.familyId ?? ''} onChange={e => act(() => setMemberFamily(t.shared!.cloudId, uid, e.target.value), `${m.name} שויך/ה ל${familyById(t, e.target.value)?.name}`)}><option value="" disabled>בחרו משפחה</option>{t.families!.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
                        : m.familyId && <span className="block text-xs font-bold" style={{ color: familyById(t, m.familyId)?.color }}>{familyById(t, m.familyId)?.name}</span>)}</span>
                    {isOnline(m) ? <Badge tone="ok">מחובר/ת</Badge> : <span className="text-xs text-muted">{m.lastSeen ? `נראה ${ago(m.lastSeen)}` : ''}</span>}
                    {isOwner && uid !== myUid && m.role !== 'owner' && <button aria-label={`הסרת ${m.name}`} title="הסרה מהטיול" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger" onClick={() => removeMember(t.shared!.cloudId, uid).then(f => toast(`${m.name} הוסר/ה. הקישור${f ? ` של ${familyById(t, f)?.name ?? 'המשפחה'}` : ''} הוחלף — שלחו את החדש למי שעוד צריך אותו`), e => toast(e.message))}><UserMinus size={16} /></button>}
                  </li>))}
              </ul>
              <AccountRow compact />
              <p className="text-xs text-muted">הקישור הוא המפתח לטיול — שלחו אותו רק לשותפים. השינויים נשמרים גם בלי קליטה ומסתנכרנים כשהחיבור חוזר.</p>
            </div>
          )}
        </section>
        <section className="space-y-2 border-t border-line pt-4">
          <h3 className="font-bold">שליחת סיכום בלבד</h3>
          <p className="text-sm text-muted">טקסט עם התאריכים, האזור וקישורי ניווט — בלי אפשרות עריכה.</p>
          <Button size="sm" variant="soft" icon={<Share2 size={15} />} onClick={() => shareText(t.name, tripSummary(t))}>שליחת סיכום</Button>
        </section>
      </div>
    </Sheet>
  );
}

export function LeaveOrDelete({ t, onDone }: { t: Trip; onDone: () => void }) {
  const remove = useStore(s => s.removeTrip);
  const owner = t.shared?.role === 'owner';
  return (
    <div className="space-y-2">
      <Button variant="soft" icon={<LogOut size={16} />} onClick={async () => { await leaveTrip(t.id, false); remove(t.id); onDone(); toast(owner ? 'הטיול הוסר מהמכשיר; השותפים ממשיכים לראות אותו' : 'יצאת מהטיול המשותף'); }}>{owner ? 'הסרה מהמכשיר שלי בלבד' : 'יציאה מהטיול המשותף'}</Button>
      {owner && <Button variant="danger" icon={<Trash2 size={16} />} onClick={async () => { await leaveTrip(t.id, true); remove(t.id); onDone(); toast('הטיול נמחק לכל השותפים'); }}>מחיקה לכל השותפים</Button>}
    </div>
  );
}

/** Organiser view of a group trip: one invite per family. */
function FamilyLinks({ t }: { t: Trip }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">לכל משפחה קישור משלה. מי שנכנס דרכו משויך למשפחה, רואה את הציוד שלה ואת הציוד המשותף — ומסמן יחד עם כולם.</p>
      {t.families!.map((f, i) => {
        const link = inviteLink(t.shared!.cloudId, f);
        const msg = `${f.name}, הצטרפו לתכנון "${t.name}" ב-CampIL — הציוד של המשפחה שלכם והציוד המשותף, בזמן אמת:\n${link}`;
        return (
          <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-xl border-2 p-2.5" style={{ borderColor: f.color + '55' }}>
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: f.color }} aria-hidden />
            <span className="min-w-0 flex-1 font-bold">{f.name}{i === 0 && <span className="font-normal text-muted"> (שלי)</span>}</span>
            <a className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-sm font-bold text-white" href={whatsappURL(msg)} target="_blank" rel="noreferrer" aria-label={`שליחה בוואטסאפ ל${f.name}`}><Share2 size={14} />וואטסאפ</a>
            <Button size="sm" variant="soft" icon={<Copy size={14} />} aria-label={`העתקת הקישור של ${f.name}`} onClick={() => navigator.clipboard.writeText(link).then(() => toast(`הקישור של ${f.name} הועתק`), () => shareText(t.name, msg))}>קישור</Button>
          </div>
        );
      })}
    </div>
  );
}

/** Turn partner-change notifications on/off and ask the browser for permission. */
export function NotifyCard() {
  const on = useStore(s => s.settings.notify !== false), setSettings = useStore(s => s.setSettings);
  const [st, setSt] = useState<NotifyState>(() => notifyState());
  const enable = async () => { const r = await requestNotify(); setSt(r); if (r === 'granted') { setSettings({ notify: true }); showSystem('CampIL', 'מעולה! מעכשיו תקבלו כאן התראה כששותף משנה משהו בטיול.').catch(() => {}); } else if (r === 'denied') toast('ההתראות נחסמו בדפדפן'); };
  const note: Record<NotifyState, string> = {
    granted: on ? 'כששותף מסמן, מוסיף או משנה משהו — תקבלו התראה בטלפון. כשהאפליקציה פתוחה מולכם תופיע הודעה קצרה בתחתית.' : 'ההתראות כבויות. השינויים עדיין מתעדכנים אצלכם בזמן אמת.',
    default: 'קבלו התראה בטלפון כששותף מסמן ציוד, משלים משימה או משנה את הטיול.',
    denied: 'ההתראות חסומות בדפדפן. כדי לאפשר: לחיצה על סמל המנעול ליד הכתובת ← הרשאות ← התראות ← לאפשר, ואז לרענן.',
    install: 'באייפון התראות עובדות רק כשהאפליקציה מותקנת: בספארי ← כפתור השיתוף ← "הוספה למסך הבית", ואז לפתוח את CampIL מהמסך הראשי.',
    unsupported: 'הדפדפן הזה לא תומך בהתראות. נסו Chrome באנדרואיד או את האפליקציה המותקנת באייפון.',
  };
  return (
    <div className="space-y-2 rounded-xl border border-line p-3">
      <p className="flex items-center gap-2 text-sm font-bold">{st === 'granted' && on ? <Bell size={16} className="text-sunset" /> : <BellOff size={16} className="text-muted" />}התראות על שינויים של שותפים</p>
      <p className="text-xs text-muted">{note[st]}</p>
      {st === 'default' && <Button size="sm" icon={<Bell size={15} />} onClick={enable}>הפעלת התראות</Button>}
      {st === 'granted' && <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={on ? 'ghost' : 'primary'} icon={on ? <BellOff size={15} /> : <Bell size={15} />} onClick={() => setSettings({ notify: !on })}>{on ? 'כיבוי התראות' : 'הפעלת התראות'}</Button>
        {on && <Button size="sm" variant="soft" onClick={() => showSystem('CampIL · בדיקה', 'כך תיראה התראה כששותף משנה משהו בטיול.').catch(e => toast(e.message))}>התראת בדיקה</Button>}
      </div>}
    </div>
  );
}

export function ActivityFeed({ t }: { t: Trip }) {
  const items = useMemo(() => {
    const ev = [
      ...myPacking(t).filter(p => p.packedAt && p.packedBy).map(p => ({ at: p.packedAt!, by: p.packedBy!, text: `${p.packed ? 'ארז/ה' : 'ביטל/ה סימון'}: ${p.name}` })),
      ...t.tasks.filter(k => k.doneAt && k.doneBy).map(k => ({ at: k.doneAt!, by: k.doneBy!, text: `${k.done ? 'השלים/ה' : 'פתח/ה מחדש'}: ${k.text}` })),
    ];
    return ev.sort((a, b) => b.at - a.at).slice(0, 8);
  }, [t.packing, t.tasks]);
  if (!items.length) return <p className="text-sm text-muted">עוד אין פעילות. סימונים של כל השותפים יופיעו כאן.</p>;
  return (
    <ul className="space-y-1.5">{items.map((e, i) => (
      <li key={i} className="flex items-baseline gap-2 text-sm"><Check size={14} className="shrink-0 text-ok" /><span className="font-bold">{e.by}</span><span className="min-w-0 flex-1 truncate">{e.text}</span><span className="shrink-0 text-xs text-muted">{ago(e.at)}</span></li>))}
    </ul>
  );
}

export function CloudSettings() {
  const { settings, setSettings, members } = useStore();
  const status = useCloud(s => s.status), err = useCloud(s => s.error);
  const [text, setText] = useState('');
  const [name, setName] = useState(settings.cloud?.myName ?? members.find(m => m.role === 'adult')?.name ?? '');
  useEffect(() => { if (settings.cloud) import('../lib/cloud/sync').then(m => m.transport()).catch(() => {}); }, [!!settings.cloud]);
  const save = () => {
    const cfg = parseFirebaseConfig(text);
    if (!cfg) return toast('לא זוהו פרטי Firebase. הדביקו את כל הקטע firebaseConfig');
    if (!name.trim()) return toast('כתבו את השם שיוצג לשותפים');
    setSettings({ cloud: { config: cfg, myName: name.trim() } }); setText(''); toast('השיתוף הוגדר');
    import('../lib/cloud/sync').then(m => m.transport().then(() => toast('החיבור ל-Firebase הצליח')).catch(e => toast(e.message)));
  };
  return (
    <div className="space-y-3">
      {settings.cloud ? (
        <div className="space-y-2 rounded-xl2 border border-line bg-surface p-4">
          <p className="flex flex-wrap items-center gap-2"><span className="font-bold">מחובר לפרויקט</span><code dir="ltr" className="rounded bg-raised px-2 py-0.5 text-sm">{settings.cloud.config.projectId}</code>
            <Badge tone={status === 'on' ? 'ok' : status === 'error' ? 'danger' : 'muted'}>{status === 'on' ? 'פעיל' : status === 'error' ? 'שגיאה' : status === 'connecting' ? 'מתחבר…' : 'לא נבדק'}</Badge></p>
          {err && <p className="text-sm text-danger">{err}</p>}
          <AccountRow />
          <NotifyCard />
          <div><label className="label" htmlFor="cn">השם שלי בטיולים משותפים</label><input id="cn" className="field" value={settings.cloud.myName} onChange={e => setSettings({ cloud: { ...settings.cloud!, myName: e.target.value } })} /></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="soft" onClick={() => import('../lib/cloud/sync').then(m => m.transport().then(() => toast('החיבור תקין')).catch(e => toast(e.message)))}>בדיקת חיבור</Button>
            <Button size="sm" variant="ghost" onClick={() => setSettings({ cloud: null })}>ניתוק</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl2 border border-line bg-surface p-4">
          <p className="text-sm">הגדרה חד-פעמית: יוצרים פרויקט Firebase חינמי ומדביקים כאן את פרטי ההגדרה. <a className="font-bold text-moss" href={href('/guide/firebase')}>מדריך צעד אחר צעד</a></p>
          <div><label className="label" htmlFor="fc">פרטי ההגדרה (firebaseConfig)</label><textarea id="fc" dir="ltr" className="field min-h-36 font-mono text-xs" placeholder={'const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "...",\n  ...\n};'} value={text} onChange={e => setText(e.target.value)} /></div>
          <div><label className="label" htmlFor="cn2">השם שלי (יוצג לשותפים)</label><input id="cn2" className="field" value={name} onChange={e => setName(e.target.value)} /></div>
          <Button onClick={save}>שמירה וחיבור</Button>
        </div>
      )}
      <p className="text-xs text-muted">שותפים שמצטרפים דרך קישור לא צריכים להגדיר כלום — הפרטים מגיעים בתוך הקישור.</p>
    </div>
  );
}

export function AccountRow({ compact }: { compact?: boolean }) {
  const account = useCloud(s => s.account);
  const [busy, setBusy] = useState(false);
  if (!account) return null;
  const go = (f: () => Promise<unknown>) => { setBusy(true); f().then(() => toast(account.provider === 'google' ? 'התנתקת מ-Google' : 'התחברת עם Google')).catch(e => toast(e.message)).finally(() => setBusy(false)); };
  return account.provider === 'google' ? (
    <div className={cx('flex items-center gap-2 rounded-xl border border-line p-2.5', compact && 'text-sm')}>
      <Avatar m={{ name: account.name ?? '?', color: '#3c6e9f', photo: account.photo }} size={30} ring={false} />
      <span className="min-w-0 flex-1"><span className="flex items-center gap-1 font-semibold">{account.name}<BadgeCheck size={15} className="text-info" /></span><span className="block truncate text-xs text-muted" dir="ltr">{account.email}</span></span>
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => go(signOutGoogle)}>התנתקות</Button>
    </div>
  ) : (
    <div className={cx('flex flex-wrap items-center gap-2 rounded-xl border border-line p-2.5', compact && 'text-sm')}>
      <span className="min-w-0 flex-1 text-sm">את/ה מחובר/ת כאורח. התחברות עם Google מוסיפה סימן מאומת ליד השם ומאפשרת להצטרף לטיולים סגורים.</span>
      <Button size="sm" variant="soft" disabled={busy} icon={busy ? <Loader2 size={14} className="animate-spin" /> : <GoogleG />} onClick={() => go(signInGoogle)}>התחברות עם Google</Button>
    </div>
  );
}
export const GoogleG = () => (<svg width="15" height="15" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>);
