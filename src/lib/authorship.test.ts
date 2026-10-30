import { describe, it, expect } from 'vitest';
import { canChange } from './authorship';

const shared = (role: 'owner' | 'editor') => ({ shared: { cloudId: 'c', role, joinedAt: '' } });
describe('who may change a journal entry or photo', () => {
  it('anything on a trip that is not shared, and the organiser always', () => {
    expect(canChange({}, { byUid: 'x' }, { uid: 'me', name: 'א' })).toBe(true);
    expect(canChange(shared('owner'), { byUid: 'x' }, { uid: 'me', name: 'א' })).toBe(true);
  });
  it('a member: only their own items, by account id', () => {
    expect(canChange(shared('editor'), { byUid: 'me', by: 'ב' }, { uid: 'me', name: 'א' })).toBe(true);
    expect(canChange(shared('editor'), { byUid: 'x', by: 'א' }, { uid: 'me', name: 'א' })).toBe(false);
  });
  it('older items without an account id: by name', () => {
    expect(canChange(shared('editor'), { author: 'א' }, { uid: 'me', name: 'א' })).toBe(true);
    expect(canChange(shared('editor'), { by: 'ב' }, { uid: 'me', name: 'א' })).toBe(false);
  });
});
