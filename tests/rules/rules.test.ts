// Security rules tests — run against the Firestore emulator:
//   npx firebase-tools emulators:exec --only firestore --project demo-campil "npx vitest run -c vitest.rules.config.ts"
// Scenario: trip T, organiser O in family A, member MA (A), member MB (B), stranger S, removed member R.
import { readFileSync } from 'node:fs';
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteField, deleteDoc, FieldPath } from 'firebase/firestore';

let env: RulesTestEnvironment;
const T = 'trip-1';
const KEY_A = 'key-family-a', KEY_B = 'key-family-b', KEY_ALL = 'key-all';
const trip = () => ({
  v: 1, owner: 'O', createdAt: 1, access: 'link', pending: {},
  invite: { all: KEY_ALL, fam: { A: KEY_A, B: KEY_B } },
  members: {
    O: { name: 'מארגן', role: 'owner', familyId: 'A', color: '#000' },
    MA: { name: 'א', role: 'editor', familyId: 'A', k: KEY_A, color: '#111' },
    MB: { name: 'ב', role: 'editor', familyId: 'B', k: KEY_B, color: '#222' },
  },
  core: { name: 'טיול', families: [{ id: 'A', name: 'משפחה א' }, { id: 'B', name: 'משפחה ב' }] },
  packing: { shared1: { id: 'shared1', name: 'מים', packed: false } },
  tasks: {}, meals: {}, schedule: {}, pantry: {}, progress: {},
});
const as = (uid: string, email?: string) => env.authenticatedContext(uid, email ? { email } : {}).firestore();
const tripRef = (db: any) => doc(db, 'trips', T);
const fam = (db: any, f: string) => doc(db, 'trips', T, 'families', f);
const upd = (ref: any, ...pairs: unknown[]) => (updateDoc as any)(ref, ...pairs);

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-campil', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});
afterAll(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(tripRef(db), trip());
    await setDoc(fam(db, 'A'), { packing: { a1: { id: 'a1', name: 'שק שינה של א', packed: false } } });
    await setDoc(fam(db, 'B'), { packing: { b1: { id: 'b1', name: 'תרופה של ב', packed: false } } });
    await setDoc(doc(db, 'trips', T, 'journal', 'p1'), { kind: 'photo', by: 'א', data: 'x' });
  });
});

describe('outsiders', () => {
  it('a stranger who knows the trip id cannot read the trip', async () => { await assertFails(getDoc(tripRef(as('S')))); });
  it('a signed-out visitor cannot read the trip', async () => { await assertFails(getDoc(tripRef(env.unauthenticatedContext().firestore()))); });
  it('a stranger cannot read photos or journal', async () => { await assertFails(getDoc(doc(as('S'), 'trips', T, 'journal', 'p1'))); });
  it('a stranger cannot read any family list', async () => { await assertFails(getDoc(fam(as('S'), 'A'))); });
  it('a stranger cannot edit the trip', async () => { await assertFails(upd(tripRef(as('S')), 'core.name', 'נפרץ')); });
});

describe('families are private from each other', () => {
  it('a member reads and edits their own family list', async () => {
    await assertSucceeds(getDoc(fam(as('MA'), 'A')));
    await assertSucceeds(upd(fam(as('MA'), 'A'), new FieldPath('packing', 'a1', 'packed'), true));
  });
  it('family B cannot read family A', async () => { await assertFails(getDoc(fam(as('MB'), 'A'))); });
  it('family B cannot change family A', async () => { await assertFails(upd(fam(as('MB'), 'A'), new FieldPath('packing', 'a1', 'packed'), true)); });
  it('family B cannot delete family A', async () => { await assertFails(deleteDoc(fam(as('MB'), 'A'))); });
  it('the organiser cannot read another family', async () => { await assertFails(getDoc(fam(as('O'), 'B'))); });
  it('the organiser cannot overwrite another family', async () => { await assertFails(setDoc(fam(as('O'), 'B'), { packing: {} })); });
  it('the organiser can seed a family that has no list yet', async () => { await assertSucceeds(setDoc(fam(as('O'), 'C'), { packing: { c1: { id: 'c1' } } })); });
  it('a member cannot move themselves to another family', async () => { await assertFails(upd(tripRef(as('MB')), 'members.MB.familyId', 'A')); });
  it('the organiser cannot move themselves to another family', async () => { await assertFails(upd(tripRef(as('O')), 'members.O.familyId', 'B')); });
  it('a member updates only their own family progress', async () => {
    await assertSucceeds(upd(tripRef(as('MA')), 'progress.A', { packed: 1, total: 2 }));
    await assertFails(upd(tripRef(as('MA')), 'progress.B', { packed: 0, total: 9 }));
  });
});

describe('members', () => {
  it('a member reads the trip and photos', async () => {
    await assertSucceeds(getDoc(tripRef(as('MB'))));
    await assertSucceeds(getDoc(doc(as('MB'), 'trips', T, 'journal', 'p1')));
  });
  it('a member edits shared gear and the plan', async () => {
    await assertSucceeds(upd(tripRef(as('MB')), new FieldPath('packing', 'shared1', 'packed'), true, 'core.name', 'שם חדש'));
  });
  it('a member updates their own last-seen time', async () => { await assertSucceeds(upd(tripRef(as('MB')), 'members.MB.lastSeen', 5)); });
  it('a member cannot add someone else', async () => { await assertFails(upd(tripRef(as('MB')), 'members.X', { role: 'editor', familyId: 'B', k: KEY_B })); });
  it('a member cannot change access, owner or invite keys', async () => {
    await assertFails(upd(tripRef(as('MB')), 'access', 'approved'));
    await assertFails(upd(tripRef(as('MB')), 'owner', 'MB'));
    await assertFails(upd(tripRef(as('MB')), 'invite.fam.A', 'mine'));
  });
  it('a member cannot make themselves organiser', async () => { await assertFails(upd(tripRef(as('MB')), 'members.MB.role', 'owner')); });
});

describe('joining with an invite link', () => {
  it('joins family B with family B\'s current key, then reads B only', async () => {
    await assertSucceeds(upd(tripRef(as('N')), 'members.N', { name: 'חדש', role: 'editor', familyId: 'B', k: KEY_B, color: '#333' }));
    await assertSucceeds(getDoc(fam(as('N'), 'B')));
    await assertFails(getDoc(fam(as('N'), 'A')));
  });
  it('cannot join after the organiser\'s link expiry', async () => {
    await env.withSecurityRulesDisabled(async ctx => { await updateDoc(tripRef(ctx.firestore()), 'invite.until', Date.now() - 60_000); });
    await assertFails(upd(tripRef(as('N')), 'members.N', { role: 'editor', familyId: 'B', k: KEY_B }));
  });
  it('joins before the link expiry', async () => {
    await env.withSecurityRulesDisabled(async ctx => { await updateDoc(tripRef(ctx.firestore()), 'invite.until', Date.now() + 86_400_000); });
    await assertSucceeds(upd(tripRef(as('N')), 'members.N', { role: 'editor', familyId: 'B', k: KEY_B }));
  });
  it('a member cannot extend the link expiry', async () => { await assertFails(upd(tripRef(as('MB')), 'invite.until', Date.now() + 1e10)); });
  it('cannot join with a wrong key', async () => { await assertFails(upd(tripRef(as('N')), 'members.N', { role: 'editor', familyId: 'B', k: 'guess' })); });
  it('cannot use family A\'s key to enter family B', async () => { await assertFails(upd(tripRef(as('N')), 'members.N', { role: 'editor', familyId: 'B', k: KEY_A })); });
  it('cannot join as organiser', async () => { await assertFails(upd(tripRef(as('N')), 'members.N', { role: 'owner', familyId: 'B', k: KEY_B })); });
  it('cannot join a closed trip with a key', async () => {
    await env.withSecurityRulesDisabled(ctx => updateDoc(tripRef(ctx.firestore()), { access: 'approved' }));
    await assertFails(upd(tripRef(as('N')), 'members.N', { role: 'editor', familyId: 'B', k: KEY_B }));
  });
  it('a closed trip takes a request from a Google user, and the requester still cannot read', async () => {
    await env.withSecurityRulesDisabled(ctx => updateDoc(tripRef(ctx.firestore()), { access: 'approved' }));
    await assertSucceeds(upd(tripRef(as('G', 'g@example.com')), 'pending.G', { name: 'ג', at: 1, familyId: 'B' }));
    await assertFails(getDoc(tripRef(as('G', 'g@example.com'))));
  });
});

describe('removing a member', () => {
  it('after removal and key rotation, the removed member loses access and cannot rejoin with the old link', async () => {
    await env.withSecurityRulesDisabled(ctx => updateDoc(tripRef(ctx.firestore()), { 'members.R': { role: 'editor', familyId: 'B', k: KEY_B } }));
    await assertSucceeds(getDoc(fam(as('R'), 'B')));
    await assertSucceeds(upd(tripRef(as('O')), 'members.R', deleteField(), 'invite.fam.B', 'key-b-2'));
    await assertFails(getDoc(tripRef(as('R'))));
    await assertFails(getDoc(fam(as('R'), 'B')));
    await assertFails(getDoc(doc(as('R'), 'trips', T, 'journal', 'p1')));
    await assertFails(upd(tripRef(as('R')), 'members.R', { role: 'editor', familyId: 'B', k: KEY_B }));
    await assertFails(upd(tripRef(as('R2')), 'members.R2', { role: 'editor', familyId: 'B', k: KEY_B })); // new anonymous id, old link
  });
  it('only the organiser can remove members or delete the trip', async () => {
    await assertFails(upd(tripRef(as('MA')), 'members.MB', deleteField()));
    await assertFails(deleteDoc(tripRef(as('MA'))));
    await assertSucceeds(deleteDoc(tripRef(as('O'))));
  });
});
