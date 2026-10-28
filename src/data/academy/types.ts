// CampIL Academy — content types.
export interface KnotSeg { d: string; z: number; rope?: 0 | 1 }
export interface KnotFrame { props?: { z: number; svg: string }[]; segs: KnotSeg[] }
export interface QuizQ { q: string; options: string[]; correct: number; why: string }
export type Level = 1 | 2 | 3;
export const LEVEL_HE: Record<Level, string> = { 1: 'קל', 2: 'בינוני', 3: 'מתקדם' };

export interface Knot {
  id: string; he: string; en: string;
  /** 'official' = the Hebrew name used by the Ministry of Education's field guide; 'descriptive' = our description */
  heSource: 'official' | 'common' | 'descriptive';
  purpose: string; uses: string[]; notFor: string[]; level: Level; materials: string;
  steps: { text: string; frame: number; tight?: boolean }[];
  mistakes: string[]; quiz: QuizQ[];
  /** everyday phrases people search with ("למתוח חבל לאוהל") */
  needs: string[];
}

export type AcademyCategory = 'knots' | 'shelter' | 'navigation' | 'safety' | 'nature' | 'family';
export const CATEGORY_HE: Record<AcademyCategory, string> = {
  knots: 'קשרים וחבלים', shelter: 'אוהלים ומחסה', navigation: 'ניווט והתמצאות', safety: 'בטיחות', nature: 'טבע וסביבה', family: 'משפחה וילדים',
};
