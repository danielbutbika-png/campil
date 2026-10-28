import { useEffect, useState } from 'react';
import { Users, Loader2, ShieldCheck, Clock } from 'lucide-react';
import { useStore } from '../lib/store';
import { decodeInvite } from '../lib/cloud/model';
import { joinTrip, checkApproval, signInGoogle, transport, useCloud } from '../lib/cloud/sync';
import { GoogleG, AccountRow } from '../components/Collab';
import { Button, Card, toast } from '../components/ui';
import { go } from '../lib/router';
import { Logo } from '../App';

export default function Join({ query }: { query: URLSearchParams }) {
  const st = useStore();
  const cid = query.get('t'); const c = query.get('c'); const approvedOnly = query.get('a') === '1'; const famId = query.get('f') ?? undefined; const famName = query.get('fn'); const key = query.get('k') ?? undefined;
  const account = useCloud(s => s.account);
  const [name, setName] = useState(st.settings.cloud?.myName ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  let cfg: Record<string, string> | null = null;
  try { cfg = c ? decodeInvite(c) : null; } catch { cfg = null; }

  // connect early so the Google button and account state are ready
  useEffect(() => { if (cfg) { if (!st.settings.cloud) st.setSettings({ cloud: { config: cfg, myName: '' } }); transport().catch(e => setErr(e.message)); } }, []);
  // while waiting for approval, check every few seconds
  useEffect(() => {
    if (!waiting || !cid) return;
    const i = setInterval(async () => { const id = await checkApproval(cid).catch(() => null); if (id) { clearInterval(i); finish(id); } }, 5000);
    return () => clearInterval(i);
  }, [waiting]);

  if (!cid || !cfg) return <div className="gutter py-16 text-center"><p className="font-display text-2xl">קישור ההזמנה לא תקין</p><p className="text-muted">בקשו משולח הקישור לשלוח אותו שוב.</p></div>;

  const fresh = !st.onboarded && !st.trips.length;
  const finish = (id: string) => { useStore.setState(s => ({ onboarded: true, members: fresh ? [{ id: 'm-me', name: (s.settings.cloud?.myName || name).trim(), role: 'adult' }] : s.members })); toast('הצטרפת לטיול'); go(`/trip/${id}/gear`); };
  const google = async () => { setBusy(true); setErr(null); try { const a = await signInGoogle(); if (!name.trim() && a.name) setName(a.name); } catch (e: any) { setErr(e.message); } setBusy(false); };
  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim() || account?.name || '';
    if (!n) return toast('כתבו את השם שלכם');
    if (approvedOnly && account?.provider !== 'google') return toast('קודם התחברו עם Google');
    setBusy(true); setErr(null);
    try { const id = await joinTrip(cid, cfg!, n, approvedOnly, famId, key); if (id) finish(id); else setWaiting(true); }
    catch (x: any) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <div className="gutter mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center gap-6 py-10">
      <Logo />
      <Card className="space-y-4 p-6">
        {waiting ? (
          <>
            <Clock className="text-sunset" size={32} />
            <h1 className="font-display text-2xl">הבקשה נשלחה</h1>
            <p className="text-muted">מארגן הטיול צריך לאשר אותך. אפשר להשאיר את המסך פתוח — ברגע שתאושר/י הטיול ייפתח לבד.</p>
            <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={15} className="animate-spin" />בודקים כל כמה שניות…</p>
          </>
        ) : (
          <>
            {approvedOnly ? <ShieldCheck className="text-moss" size={32} /> : <Users className="text-sunset" size={32} />}
            <h1 className="font-display text-2xl">{famName ? `${famName}, הוזמנתם לתכנן טיול יחד` : 'הוזמנתם לתכנן טיול יחד'}</h1>
            {famName && <p className="rounded-xl bg-forest/8 px-3 py-2 text-sm font-semibold text-forest">תצטרפו כ{famName}: תראו את הציוד של המשפחה שלכם (רק אתם) ואת הציוד המשותף לכולם.</p>}
            <p className="text-muted">{approvedOnly ? 'הטיול סגור למשתתפים מאושרים: מתחברים עם Google, שולחים בקשה, והמארגן מאשר.' : 'אחרי ההצטרפות תראו את הטיול, את רשימת הציוד ואת המשימות — ומה שכל אחד מסמן יופיע אצל כולם בזמן אמת.'}</p>
            {account?.provider === 'google' ? <AccountRow compact /> : (
              <Button variant={approvedOnly ? 'primary' : 'soft'} className="w-full" disabled={busy || !account} icon={<GoogleG />} onClick={google}>התחברות עם Google{approvedOnly ? '' : ' (לא חובה)'}</Button>
            )}
            <form onSubmit={join} className="space-y-3">
              <div><label className="label" htmlFor="jn">השם שיוצג לשותפים</label><input id="jn" className="field" autoComplete="given-name" value={name} placeholder={account?.name ?? ''} onChange={e => setName(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={busy || (approvedOnly && account?.provider !== 'google')} icon={busy ? <Loader2 size={17} className="animate-spin" /> : undefined}>{busy ? 'רגע…' : approvedOnly ? 'שליחת בקשת הצטרפות' : 'הצטרפות לטיול'}</Button>
            </form>
          </>
        )}
        {err && <p className="text-sm text-danger">{err}</p>}
      </Card>
      <p className="text-center text-xs text-muted">הנתונים נשמרים ב-Firebase של מארגן הטיול. אפשר לצאת מהטיול בכל רגע.</p>
    </div>
  );
}
