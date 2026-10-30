// Who may change a journal entry or a photo of a shared trip: its author or the organiser.
// The same rule is enforced by the Firestore security rules (trips/{id}/journal); this only hides buttons that would fail.
import type { Trip } from './types';

export function canChange(t: Pick<Trip, 'shared'>, item: { byUid?: string; by?: string; author?: string }, me: { uid?: string; name: string }) {
  if (!t.shared || t.shared.role === 'owner') return true;
  if (item.byUid) return item.byUid === me.uid;
  return (item.by ?? item.author) === me.name; // older items without an account id
}
