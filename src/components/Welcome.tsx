// First launch: sign in with Google so trips follow you between phones and your name appears in the app.
// It can be skipped — everything works on the device without an account.
import { useState } from 'react';
import { Loader2, Cloud, Smartphone, BadgeCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { GoogleG } from './Collab';
import { Button } from './ui';

export function Welcome({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const cloud = useStore(s => s.settings.cloud);
  const google = async () => {
    setBusy(true); setErr('');
    try { const m = await import('../lib/cloud/sync'); await m.signInGoogle(); onDone(); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="welcome-h" className="fixed inset-0 z-[80] flex items-end justify-center bg-forest/95 p-4 text-white backdrop-blur sm:items-center">
      <div className="safe-b w-full max-w-md space-y-5 pb-4">
        <div className="space-y-2">
          <h1 id="welcome-h" className="font-display text-4xl">ברוכים הבאים ל-CampIL</h1>
          <p className="text-white/85">התחברו עם חשבון Google כדי שהשם שלכם יופיע באפליקציה, והטיולים המשותפים יגיעו לכל מכשיר שתתחברו ממנו.</p>
        </div>
        <ul className="space-y-2 text-sm text-white/90">
          <li className="flex items-center gap-2"><Cloud size={17} aria-hidden />טיולים משותפים מסתנכרנים בין הטלפונים שלכם</li>
          <li className="flex items-center gap-2"><BadgeCheck size={17} aria-hidden />שותפים לטיול רואים שזה באמת אתם</li>
          <li className="flex items-center gap-2"><Smartphone size={17} aria-hidden />הציוד, התמונות והטיולים שלא שיתפתם נשארים במכשיר</li>
        </ul>
        {err && <p role="alert" className="rounded-xl bg-white/15 p-3 text-sm font-semibold">{err}</p>}
        <div className="space-y-2">
          <Button className="w-full !bg-white !text-ink" disabled={busy || !cloud} icon={busy ? <Loader2 size={16} className="animate-spin" /> : <GoogleG />} onClick={google}>התחברות עם Google</Button>
          <button type="button" className="w-full py-2 text-sm font-bold text-white/80 underline" onClick={onDone}>להמשיך בלי חשבון</button>
        </div>
        <p className="text-xs text-white/60">אפשר להתחבר או להתנתק בכל רגע בהגדרות.</p>
      </div>
    </div>
  );
}
