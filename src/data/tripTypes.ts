// Trip Type Engine — catalog. One table of trip types; each type contributes small modules (implied settings,
// gear, tasks, guides, checks, questions). Types combine freely ("family camping + water hike") and the engines
// merge their modules — no per-type wizard.
// Content rules: gear and tasks are general planning practice; anything about a specific place (open/closed,
// permitted, conditions) is phrased as a check against the operator / official source — never as a fact.
import type { CategoryId, Interest, Lodging, TripKind } from '../lib/types';

export type TripTypeId =
  | 'family_camping' | 'group_camping' | 'day_hike' | 'multi_trek' | 'israel_trail' | 'car_camping' | 'caravan' | 'glamping'
  | 'cabin' | 'desert' | 'forest' | 'beach' | 'kinneret' | 'streams' | 'water_hike' | 'cycling' | 'offroad' | 'toddlers'
  | 'kids' | 'accessible' | 'dogs' | 'photography' | 'birding' | 'bloom' | 'astronomy' | 'history' | 'picnic' | 'school_group'
  | 'public_transport' | 'abroad';

export type TypeGroup = 'stay' | 'move' | 'place' | 'who' | 'theme';
export const GROUP_HE: Record<TypeGroup, string> = { stay: 'לינה', move: 'איך מטיילים', place: 'סביבה', who: 'מי מצטרף', theme: 'נושא' };

/** qty: a number, or scaled by the trip's participants. */
export type Qty = number | 'perPerson' | 'perAdult' | 'perChild' | 'perFamily' | 'perDay';
export interface TypeGear { name: string; category: CategoryId; qty: Qty; why: string; unit?: string; dayOnly?: boolean; qtyFrom?: string /* question id that overrides the count */ }
export interface TypeCheck { text: string; source?: { label: string; url: string } }
export interface TypeQuestion { id: string; label: string; kind: 'number' | 'yesno'; min?: number; max?: number }
export interface TripType {
  id: TripTypeId; name: string; group: TypeGroup; blurb: string;
  implies?: { kind?: TripKind; lodging?: Lodging; pets?: boolean; interests?: Interest[] };
  gear?: TypeGear[]; tasks?: { when: string; text: string }[]; guides?: string[]; checks?: TypeCheck[]; questions?: TypeQuestion[];
}

const INPA = { label: 'רשות הטבע והגנים', url: 'https://www.parks.org.il' };
const KKL = { label: 'קק״ל', url: 'https://www.kkl.org.il' };
const IMS = { label: 'השירות המטאורולוגי', url: 'https://ims.gov.il' };
const TRAIL = { label: 'החברה להגנת הטבע — שביל ישראל', url: 'https://www.teva.org.il' };

export const TRIP_TYPES: TripType[] = [
  // ── לינה ──
  { id: 'family_camping', name: 'קמפינג משפחתי', group: 'stay', blurb: 'לינה בשטח עם המשפחה', implies: { kind: 'camping', lodging: 'tent', interests: ['camping', 'family'] }, guides: ['first-night', 'wind', 'tautline', 'figure8'] },
  { id: 'group_camping', name: 'קמפינג קבוצתי', group: 'stay', blurb: 'כמה משפחות או חברים יחד', implies: { kind: 'camping' },
    gear: [{ name: 'שולחן מתקפל נוסף לאזור משותף', category: 'misc', qty: 1, why: 'אזור אוכל משותף לכמה משפחות' }],
    tasks: [{ when: 'שבוע לפני', text: 'לחלק בין המשפחות מי מכין ומי קונה (במטבח שטח ← חלוקה מהירה)' }], guides: ['tautline', 'bowline'] },
  { id: 'car_camping', name: 'קמפינג עם רכב', group: 'stay', blurb: 'חונים ליד מקום הלינה', implies: { kind: 'camping' },
    checks: [{ text: 'לבדוק אצל מפעיל החניון שמותר להגיע ברכב עד מקום הלינה ומה תנאי הדרך' }] },
  { id: 'caravan', name: 'טיול קרוואנים', group: 'stay', blurb: 'לינה בקרוואן', implies: { kind: 'camping', lodging: 'caravan' },
    gear: [{ name: 'כבל מאריך חיצוני לחיבור חשמל', category: 'power', qty: 1, why: 'חיבור לעמדת חשמל בחניון' }, { name: 'צינור מים למילוי מכל', category: 'misc', qty: 1, why: 'מילוי מים בחניון' }],
    checks: [{ text: 'לוודא מראש שבחניון יש עמדות לקרוואנים, חשמל ופינוי מים — אצל המפעיל' }] },
  { id: 'glamping', name: 'גלמפינג', group: 'stay', blurb: 'לינה מאובזרת', implies: { kind: 'camping', lodging: 'equipped_site' },
    checks: [{ text: 'לברר עם המקום מה כלול (מצעים, מגבות, מטבח) כדי לא לסחוב כפול' }] },
  { id: 'cabin', name: 'יורט / צימר', group: 'stay', blurb: 'לינה במבנה', implies: { kind: 'camping', lodging: 'other' },
    checks: [{ text: 'לברר עם המקום מה כלול ומה מביאים' }] },
  // ── תנועה ──
  { id: 'day_hike', name: 'טיול רגלי יומי', group: 'move', blurb: 'יוצאים וחוזרים באותו יום', implies: { kind: 'day', interests: ['hiking'] },
    gear: [{ name: 'תרמיל יום לכל מבוגר', category: 'misc', qty: 'perAdult', why: 'נשיאת מים ואוכל במסלול', dayOnly: true }],
    tasks: [{ when: 'ערב לפני', text: 'לבדוק אורך מסלול ושעת שקיעה, ולתכנן לסיים לפני החושך' }], guides: ['trail-marks', 'heat'] },
  { id: 'multi_trek', name: 'טרק רב-יומי', group: 'move', blurb: 'כמה ימים ברגל עם הציוד על הגב', implies: { kind: 'camping', interests: ['hiking'] },
    gear: [{ name: 'תרמיל גב גדול לכל מבוגר', category: 'misc', qty: 'perAdult', why: 'נשיאת ציוד לינה' }, { name: 'ערכת עזרה ראשונה קלה לדרך', category: 'firstaid', qty: 1, why: 'מרחק מרכב ומשירותים' }, { name: 'סוללת גיבוי לטלפון', category: 'power', qty: 'perAdult', why: 'ימים בלי טעינה' }],
    tasks: [{ when: 'שבוע לפני', text: 'לתכנן נקודות מים ולינה לכל יום, ולוודא אותן מול מקורות רשמיים' }, { when: 'בוקר היציאה', text: 'להשאיר אצל מישהו שלא מצטרף את המסלול ואת זמני ההגעה הצפויים' }],
    guides: ['trail-marks', 'emergency'], checks: [{ text: 'לבדוק סגירות ואזורי אש לאורך המסלול', source: INPA }] },
  { id: 'israel_trail', name: 'שביל ישראל', group: 'move', blurb: 'קטעים בשביל הארצי', implies: { kind: 'camping', interests: ['hiking'] },
    gear: [{ name: 'סוללת גיבוי לטלפון', category: 'power', qty: 'perAdult', why: 'ימים בלי טעינה' }],
    tasks: [{ when: 'שבוע לפני', text: 'לבדוק את מצב הקטע ונקודות המים העדכניות במקורות השביל' }], guides: ['trail-marks'],
    checks: [{ text: 'לבדוק מידע עדכני על קטעי השביל', source: TRAIL }] },
  { id: 'cycling', name: 'רכיבת אופניים', group: 'move', blurb: 'מסלול אופניים', implies: { interests: ['hiking'] },
    gear: [{ name: 'קסדה לכל רוכב', category: 'misc', qty: 'perPerson', qtyFrom: 'bikes', why: 'רכיבה' }, { name: 'ערכת תיקון פנצ׳ר ומשאבה', category: 'misc', qty: 1, why: 'תקלה בדרך' }, { name: 'מנעול אופניים', category: 'misc', qty: 1, why: 'עצירות' }],
    questions: [{ id: 'bikes', label: 'כמה אופניים?', kind: 'number', min: 0, max: 20 }],
    checks: [{ text: 'לוודא שהמסלול מותר לאופניים ומתאים לרמת הרוכבים — אצל מפעיל השטח' }] },
  { id: 'offroad', name: '4x4 במסלולים מותרים', group: 'move', blurb: 'דרכי עפר לרכב שטח', implies: {},
    gear: [{ name: 'ערכת חילוץ (רצועה, שאקלים)', category: 'car', qty: 1, why: 'נסיעת שטח' }, { name: 'מד לחץ אוויר ומדחס', category: 'car', qty: 1, why: 'הורדת והחזרת לחץ בצמיגים' }],
    tasks: [{ when: 'שבוע לפני', text: 'לוודא שהדרכים מותרות לנסיעה ופתוחות — במפות ובמקורות רשמיים' }, { when: 'יום-יומיים לפני', text: 'לא לנסוע בשטח ברכב יחיד — לתאם רכב נוסף' }],
    checks: [{ text: 'נסיעה רק בדרכים מסומנות ומותרות; לבדוק סגירות בשטחי שמורה ואש', source: INPA }] },
  { id: 'public_transport', name: 'בתחבורה ציבורית', group: 'move', blurb: 'בלי רכב פרטי', implies: {},
    tasks: [{ when: 'יום-יומיים לפני', text: 'לבדוק לוחות זמנים של הקווים בכל כיוון, כולל חזרה בערב' }],
    checks: [{ text: 'קווים ושעות — רק במקורות התחבורה הציבורית הרשמיים; לתכנן גיבוי לחזרה' }] },
  // ── סביבה ──
  { id: 'desert', name: 'טיול מדבר', group: 'place', blurb: 'נגב, ערבה, מדבר יהודה', implies: { interests: ['desert'] },
    gear: [{ name: 'כובע רחב שוליים לכל משתתף', category: 'clothing', qty: 'perPerson', why: 'שמש חזקה' }, { name: 'מכל מים נוסף לרכב', category: 'food', qty: 1, why: 'רזרבה במדבר' }],
    guides: ['heat', 'floods'], checks: [{ text: 'לבדוק התרעות שיטפונות ועומס חום לאזור', source: IMS }] },
  { id: 'forest', name: 'יער וחורש', group: 'place', blurb: 'יערות, חורש ים-תיכוני', implies: { interests: ['forest'] },
    checks: [{ text: 'לבדוק הגבלות הבערת אש בתקופת הטיול', source: KKL }] },
  { id: 'beach', name: 'חופים', group: 'place', blurb: 'ים וחוף', implies: { interests: ['beach'] },
    gear: [{ name: 'שמשייה / צל לחוף', category: 'misc', qty: 1, why: 'צל בחוף' }, { name: 'קרם הגנה', category: 'hygiene', qty: 1, why: 'שמש' }],
    checks: [{ text: 'רחצה רק בחוף מוכרז ובשעות שירותי ההצלה — לבדוק את שעות החוף' }] },
  { id: 'kinneret', name: 'כנרת', group: 'place', blurb: 'חופי הכנרת', implies: { interests: ['beach', 'water'] },
    gear: [{ name: 'נעלי מים לכל משתתף', category: 'shoes', qty: 'perPerson', why: 'חוף אבנים' }],
    checks: [{ text: 'רחצה רק בחוף מוכרז; לברר אם החוף בתשלום או דורש הזמנה — אצל המפעיל' }] },
  { id: 'streams', name: 'נחלים ומעיינות', group: 'place', blurb: 'מסלולי נחל ומעיינות', implies: { interests: ['water'] },
    gear: [{ name: 'נעלי מים לכל משתתף', category: 'shoes', qty: 'perPerson', why: 'הליכה במים' }],
    guides: ['floods'], checks: [{ text: 'לבדוק אם המסלול והמעיין פתוחים ואם מותר להיכנס למים', source: INPA }, { text: 'לבדוק התרעות שיטפונות — גם כשבאזור עצמו יבש', source: IMS }] },
  { id: 'water_hike', name: 'מסלול רטוב', group: 'place', blurb: 'הולכים בתוך המים', implies: { interests: ['water'] },
    gear: [{ name: 'נעלי מים לכל משתתף', category: 'shoes', qty: 'perPerson', why: 'הליכה בתוך המים' }, { name: 'סט בגדים להחלפה לכל משתתף', category: 'clothing', qty: 'perPerson', why: 'אחרי המסלול הרטוב' }, { name: 'שקיות אטומות לטלפונים ומסמכים', category: 'misc', qty: 'perFamily', why: 'מסלול רטוב' }, { name: 'מגבת לכל משתתף', category: 'hygiene', qty: 'perPerson', why: 'בסוף המסלול' }],
    tasks: [{ when: 'ערב לפני', text: 'לארוז בגדי החלפה ומגבות בתיק נפרד שנשאר ברכב לסוף המסלול' }],
    guides: ['floods'], checks: [{ text: 'לבדוק אם המסלול פתוח, עומק המים והגבלות גיל/הליכה במים', source: INPA }, { text: 'לבדוק התרעות שיטפונות', source: IMS }] },
  // ── מי מצטרף ──
  { id: 'toddlers', name: 'עם פעוטות', group: 'who', blurb: 'ילדים עד גיל 3', implies: { interests: ['kids'] },
    gear: [{ name: 'מנשא / עגלת שטח', category: 'kids', qty: 1, why: 'פעוטות במסלול' }, { name: 'בגדי החלפה נוספים לפעוט', category: 'kids', qty: 2, why: 'לכלוך ומים' }],
    tasks: [{ when: 'שבוע לפני', text: 'לבחור מסלולים קצרים עם צל ושירותים קרובים' }], guides: ['first-night'] },
  { id: 'kids', name: 'עם ילדים', group: 'who', blurb: 'ילדים בגילאי בית ספר', implies: { interests: ['kids', 'family'] },
    gear: [{ name: 'משרוקית לכל ילד', category: 'kids', qty: 'perChild', why: 'קריאה לעזרה אם מתרחקים' }], guides: ['first-night'] },
  { id: 'accessible', name: 'טיול נגיש', group: 'who', blurb: 'כיסא גלגלים, עגלה או קושי בהליכה', implies: { interests: ['accessible'] },
    tasks: [{ when: 'שבוע לפני', text: 'לברר עם כל אתר את רמת הנגישות בפועל (שבילים, שירותים, חניה)' }],
    checks: [{ text: 'לבדוק מידע נגישות לאתרים', source: INPA }] },
  { id: 'dogs', name: 'עם כלבים', group: 'who', blurb: 'הכלב מצטרף', implies: { pets: true },
    gear: [{ name: 'מים וקערה לכלב לדרך', category: 'pets', qty: 1, why: 'הכלב מצטרף' }],
    checks: [{ text: 'לבדוק בכל אתר אם מותר להכניס כלבים ובאילו תנאים — המדיניות משתנה בין אתרים', source: INPA }] },
  { id: 'school_group', name: 'בית ספר / קבוצה מאורגנת', group: 'who', blurb: 'קבוצה עם אחראים', implies: {},
    tasks: [{ when: 'שבוע לפני', text: 'לבדוק את דרישות הגוף המארגן לטיולי קבוצות (אישורים, מלווים, חובשים)' }],
    checks: [{ text: 'טיולי קבוצות ובתי ספר כפופים לנהלים של הגוף המארגן — לפעול לפיהם' }] },
  // ── נושא ──
  { id: 'photography', name: 'צילום', group: 'theme', blurb: 'יציאה לצלם', gear: [{ name: 'סוללות וכרטיסי זיכרון רזרביים', category: 'power', qty: 1, why: 'צילום' }],
    tasks: [{ when: 'ערב לפני', text: 'לבדוק שעות זריחה ושקיעה בתחזית' }] },
  { id: 'birding', name: 'צפרות', group: 'theme', blurb: 'צפייה בציפורים', implies: { interests: ['views'] }, gear: [{ name: 'משקפת', category: 'misc', qty: 'perFamily', why: 'צפייה בציפורים' }] },
  { id: 'bloom', name: 'פריחה וטבע', group: 'theme', blurb: 'עונת פריחה', implies: { interests: ['views'] },
    tasks: [{ when: 'שבוע לפני', text: 'לבדוק דיווחי פריחה עדכניים לאזור במקורות רשמיים' }], guides: ['leave-no-trace'], checks: [{ text: 'לא קוטפים פרחים מוגנים', source: INPA }] },
  { id: 'astronomy', name: 'אסטרונומיה', group: 'theme', blurb: 'תצפית כוכבים', gear: [{ name: 'פנס ראש עם אור אדום', category: 'misc', qty: 'perPerson', why: 'שומר על ראיית לילה' }, { name: 'שמיכה / מחצלת לשכיבה', category: 'misc', qty: 'perFamily', why: 'תצפית' }],
    tasks: [{ when: 'ערב לפני', text: 'לבדוק בתחזית עננות לשעות הלילה' }] },
  { id: 'history', name: 'היסטוריה ומורשת', group: 'theme', blurb: 'אתרים היסטוריים', implies: { interests: ['history'] },
    tasks: [{ when: 'שבוע לפני', text: 'לבדוק שעות פתיחה והזמנה מראש באתרים — אצל המפעיל' }] },
  { id: 'picnic', name: 'פיקניק', group: 'theme', blurb: 'יום כיף בחוץ', implies: { kind: 'day', interests: ['picnic'] },
    gear: [{ name: 'מחצלת פיקניק', category: 'misc', qty: 'perFamily', why: 'ישיבה', dayOnly: true }, { name: 'שקיות זבל', category: 'cleaning', qty: 2, why: 'משאירים מקום נקי' }], guides: ['leave-no-trace'] },
  { id: 'abroad', name: 'טיול בחו״ל', group: 'place', blurb: 'יעד מחוץ לישראל', implies: {},
    gear: [{ name: 'מתאם שקע חשמל ליעד', category: 'power', qty: 1, why: 'שקעים שונים' }],
    tasks: [{ when: 'שבוע לפני', text: 'לבדוק תוקף דרכונים, ביטוח נסיעות ודרישות כניסה ליעד' }],
    checks: [{ text: 'האזורים, האתרים והתחזית באפליקציה מכסים את ישראל בלבד — לטיול בחו״ל משתמשים בציוד, ברשימות ובתפריט' }] },
];

export const TYPE_BY_ID = Object.fromEntries(TRIP_TYPES.map(t => [t.id, t])) as Record<TripTypeId, TripType>;
