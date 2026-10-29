import type { Member } from './types';
/** Age used for age-dependent estimates: the stated age when it fits the role, otherwise a typical age for the role. */
export const ageOf = (p: Pick<Member, 'age' | 'role'>) => (p.age != null && (p.age < 18) === (p.role === 'child') ? p.age : p.role === 'child' ? 8 : 30);
