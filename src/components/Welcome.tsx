// Sign-in is required: until this device has signed in with Google once, this screen covers the app.
// After that the app opens with no network too (the account is remembered on the device).
import { useState } from 'react';
import { Loader2, Cloud, Smartphone, BadgeCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { useOnline } from '../lib/hooks';
import { GoogleG } from './Collab';
import { Button } from './ui';

export function Welcome() {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const cloud = useStore(s => s.settings.cloud);
  const online = useOnline();
  const google = async () => {
    setBusy(true); setErr('');
    try { const m = await import('../lib/cloud/sync'); await m.signInGoogle(); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="welcome-h" className="fixed inset-0 z-[80] flex items-end justify-center bg-forest/95 p-4 text-white backdrop-blur sm:items-center">
      <div className="safe-b w-full max-w-md space-y-5 pb-4">
        <div className="space-y-2">
          <h1 id="welcome-h" className="font-display text-4xl">ברוכים הבאים ל-CampIL</h1>
          <p className="text-white/85">כדי להשתמש באפליקציה צריך להתחבר עם חשבון Google — כך השם שלכם מופיע, והטיולים המשותפים מגיעים לכל מכשיר שתתחברו ממנו.</p>
        </div>
        <ul className="space-y-2 text-sm text-white/90">
          <li className="flex items-center gap-2"><Cloud size={17} aria-hidden />טיולים משותפים מסתנכרנים בין הטלפונים שלכם</li>
          <li className="flex items-center gap-2"><BadgeCheck size={17} aria-hidden />שותפים לטיול רואים שזה באמת אתם</li>
          <li className="flex items-center gap-2"><Smartphone size={17} aria-hidden />הציוד, התמונות והטיולים שלא שיתפתם נשארים במכשיר</li>
        </ul>
        {!online && <p role="status" className="rounded-xl bg-white/15 p-3 text-sm font-semibold">אין חיבור לאינטרנט. ההתחברות הראשונה צריכה רשת — אחריה האפליקציה עובדת גם בלי קליטה.</p>}
        {err && <p role="alert" className="rounded-xl bg-white/15 p-3 text-sm font-semibold">{err}</p>}
        <div className="space-y-2">
          <Button className="w-full !bg-white !text-ink" disabled={busy || !cloud || !online} icon={busy ? <Loader2 size={16} className="animate-spin" /> : <GoogleG />} onClick={google}>התחברות עם Google</Button>
        </div>
        <p className="text-xs text-white/60">נשמר רק השם, האימייל והתמונה מהחשבון. הציוד והטיולים שלא שיתפתם לא עולים לענן.</p>
      </div>
    </div>
  );
}
