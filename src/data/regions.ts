import type { RegionId } from '../lib/types';

export type Scene = 'mountain' | 'forest' | 'sea' | 'desert' | 'crater' | 'lake' | 'city';

export interface RegionMeta {
  id: RegionId; name: string; short: string; lat: number; lon: number; // weather point
  scene: Scene; desc: string; bestSeasons: ('winter' | 'spring' | 'summer' | 'autumn')[];
  highlights: string[]; climateNote: string;
}

export const REGIONS: RegionMeta[] = [
  { id: 'golan', name: 'רמת הגולן', short: 'גולן', lat: 32.99, lon: 35.73, scene: 'mountain', bestSeasons: ['spring', 'autumn', 'summer'],
    desc: 'רמה בזלתית עם נחלים, מפלים, בריכות טבעיות ותצפיות על הכנרת והחרמון.',
    highlights: ['מפלים ובריכות', 'מסלולי מים בקיץ', 'תצפיות', 'פריחת אביב'], climateNote: 'לילות קרירים גם בקיץ, חורף קר ולעיתים מושלג בצפון.' },
  { id: 'hula', name: 'אצבע הגליל', short: 'אצבע הגליל', lat: 33.15, lon: 35.6, scene: 'lake', bestSeasons: ['summer', 'autumn', 'spring'],
    desc: 'עמק החולה ומקורות הירדן: נחלים קרים, צל עבות וצפרות בחורף.',
    highlights: ['מקורות הירדן', 'נחלים קרירים', 'צפרות בחולה'], climateNote: 'קיץ חם ולח בעמק, הנחלים קרים כל השנה.' },
  { id: 'upper_galilee', name: 'גליל עליון וגליל מערבי', short: 'גליל עליון', lat: 33.0, lon: 35.3, scene: 'forest', bestSeasons: ['spring', 'autumn', 'summer'],
    desc: 'הרים מיוערים, נחלי איתן שזורמים לים, כפרים ותצפיות מהר מירון.',
    highlights: ['נחל כזיב', 'הר מירון', 'חופי הגליל המערבי'], climateNote: 'ההר קריר יותר מהחוף בכמה מעלות, לחות גבוהה ליד הים.' },
  { id: 'lower_galilee', name: 'גליל תחתון ועמקים', short: 'גליל תחתון', lat: 32.6, lon: 35.4, scene: 'lake', bestSeasons: ['spring', 'autumn', 'winter'],
    desc: 'עמק יזרעאל, עמק המעיינות וחופי הכנרת: בריכות נובעות, הר תבור וארבל.',
    highlights: ['מעיינות עמק המעיינות', 'הר תבור', 'הכנרת'], climateNote: 'עמק המעיינות ובקעת כנרת חמים מאוד בקיץ.' },
  { id: 'carmel', name: 'חיפה והכרמל', short: 'כרמל', lat: 32.68, lon: 35.0, scene: 'forest', bestSeasons: ['spring', 'autumn', 'winter'],
    desc: 'רכס מיוער מעל הים, מערות פרהיסטוריות ושבילים מוצלים.',
    highlights: ['נחל מערות', 'יערות הכרמל', 'חוף דור'], climateNote: 'מתון יחסית, רוחות ים בערב.' },
  { id: 'sharon', name: 'השרון ומישור החוף', short: 'שרון', lat: 32.38, lon: 34.88, scene: 'sea', bestSeasons: ['spring', 'autumn', 'summer'],
    desc: 'חופים, נחלי חוף, כורכר ועתיקות קיסריה.',
    highlights: ['נחל אלכסנדר', 'קיסריה', 'חופי השרון'], climateNote: 'לח בקיץ, חורף מתון.' },
  { id: 'center', name: 'המרכז והשפלה', short: 'מרכז ושפלה', lat: 31.85, lon: 34.85, scene: 'city', bestSeasons: ['spring', 'winter', 'autumn'],
    desc: 'פארקים עירוניים, מקורות הירקון, גבעות השפלה ומערות בית גוברין.',
    highlights: ['מקורות הירקון', 'מערות השפלה', 'פארקים נגישים'], climateNote: 'קיץ לח וחם, חורף נוח לטיולים.' },
  { id: 'jerusalem', name: 'ירושלים והרי יהודה', short: 'הרי יהודה', lat: 31.77, lon: 35.1, scene: 'mountain', bestSeasons: ['spring', 'autumn', 'summer'],
    desc: 'מעיינות בטרסות, יערות אורנים ומערת נטיפים במורדות הרי ירושלים.',
    highlights: ['מעיינות ההר', 'מערת הנטיפים', 'יער ירושלים'], climateNote: 'לילות קרים בחורף, ערבי קיץ נעימים.' },
  { id: 'judean_desert', name: 'מדבר יהודה וים המלח', short: 'ים המלח', lat: 31.3, lon: 35.37, scene: 'desert', bestSeasons: ['winter', 'autumn', 'spring'],
    desc: 'הנקודה הנמוכה בעולם: נווה מדבר עין גדי, מצדה ונחלי מדבר תלולים.',
    highlights: ['עין גדי', 'מצדה', 'ים המלח'], climateNote: 'חום קיצוני בקיץ. בחורף שיטפונות בזק אפשריים בנחלים.' },
  { id: 'north_negev', name: 'צפון הנגב', short: 'צפון הנגב', lat: 31.25, lon: 34.8, scene: 'desert', bestSeasons: ['winter', 'spring'],
    desc: 'יערות ספר, פארקים ושמורות לס, כלניות בחורף ותל באר שבע.',
    highlights: ['יערות הנגב', 'פריחת דרום אדום', 'תל באר שבע'], climateNote: 'יבש. ימים חמים ולילות קרים בחורף.' },
  { id: 'central_negev', name: 'מכתש רמון ומרכז הנגב', short: 'מכתש רמון', lat: 30.61, lon: 34.8, scene: 'crater', bestSeasons: ['autumn', 'spring', 'winter'],
    desc: 'מכתש ענק, שמי לילה כהים, עין עבדת וחניוני לילה מדבריים.',
    highlights: ['מכתש רמון', 'עין עבדת', 'צפייה בכוכבים'], climateNote: 'גובה 800 מ׳: לילות קרים מאוד בחורף, ימים חמים בקיץ.' },
  { id: 'arava', name: 'הערבה', short: 'ערבה', lat: 30.3, lon: 35.15, scene: 'desert', bestSeasons: ['winter', 'autumn', 'spring'],
    desc: 'בקעה מדברית רחבה, שיטים, חי-בר ופארקים מדבריים.',
    highlights: ['תמנע', 'חי-בר יטבתה', 'שמי מדבר'], climateNote: 'חום כבד במרבית השנה, נוח בחורף.' },
  { id: 'eilat', name: 'אילת והרי אילת', short: 'אילת', lat: 29.6, lon: 34.93, scene: 'sea', bestSeasons: ['winter', 'autumn', 'spring'],
    desc: 'שונית אלמוגים, הרי גרניט צבעוניים וקניונים צרים.',
    highlights: ['שמורת האלמוגים', 'הקניון האדום', 'הר צפחות'], climateNote: 'חום קיצוני בקיץ; החורף נעים במיוחד.' },
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map(r => [r.id, r])) as Record<RegionId, RegionMeta>;
