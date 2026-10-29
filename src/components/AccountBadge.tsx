// The account photo in the corner, with the connection state as a coloured ring:
// green — connected and everything is synced · yellow — changes waiting to sync · red — no network or a sync problem.
import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { useStore } from '../lib/store';
import { useOnline } from '../lib/hooks';
import { useCloud } from '../lib/cloud/sync';
import { href } from '../lib/router';
import { cx } from './ui';

export type SyncState = 'ok' | 'pending' | 'error' | 'guest';
export function useSyncState(): SyncState {
  const online = useOnline();
  const account = useCloud(s => s.account), status = useCloud(s => s.status), pending = useCloud(s => s.pending);
  if (!account || account.provider !== 'google') return 'guest';
  if (!online || status === 'error') return 'error';
  if (pending > 0 || status === 'connecting') return 'pending';
  return 'ok';
}
const RING: Record<SyncState, string> = { ok: 'ring-[#22c55e]', pending: 'ring-[#facc15]', error: 'ring-[#ef4444]', guest: 'ring-white/50' };
const LABEL: Record<SyncState, string> = { ok: 'מחובר ומסונכרן', pending: 'יש שינויים שממתינים לסנכרון', error: 'אין חיבור או שיש בעיה בסנכרון', guest: 'לא מחובר לחשבון Google' };

export function AccountBadge({ className }: { className?: string }) {
  const account = useCloud(s => s.account);
  const cloud = useStore(s => s.settings.cloud);
  const state = useSyncState();
  const [broken, setBroken] = useState('');
  if (!cloud) return null;
  const g = account?.provider === 'google' ? account : null;
  return (
    <a href={href('/settings')} title={LABEL[state]} aria-label={`${g?.name ?? 'החשבון'} — ${LABEL[state]}`} data-sync={state}
      className={cx('relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-black/30 ring-[3px] ring-offset-2 ring-offset-transparent backdrop-blur transition', RING[state], className)}>
      {g?.photo && broken !== g.photo ? <img src={g.photo} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setBroken(g.photo!)} />
        : g?.name ? <span className="font-bold text-white">{g.name.trim()[0]}</span>
        : <UserRound size={20} className="text-white" aria-hidden />}
    </a>
  );
}
