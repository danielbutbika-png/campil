// Grill items for the shared BBQ ("על האש") meals: what to buy, how much, and a short recipe for each.
// Amounts are planning estimates (raw weight), shown to the user as such and editable in the menu.
import type { Kashrut, Ingredient } from './recipes';

export interface GrillItem {
  id: string; name: string; kashrut: Kashrut; vegan: boolean; allergens: string[];
  /** quantity for one adult portion when it is the only item on the grill */
  portion: Ingredient;
  recipe: { title: string; minutes: number; extra: Ingredient[]; steps: string[]; tip?: string };
}

/** Raw meat per adult at a BBQ meal: a common planning estimate is 300–400 g; we use 350 g. */
export const MEAT_G_PER_ADULT = 350;

export const MEATS: GrillItem[] = [
  { id: 'pargiot', name: 'פרגיות', kashrut: 'meat', vegan: false, allergens: [], portion: { name: 'פרגיות', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'פרגיות במרינדת לימון ושום', minutes: 20, extra: [{ name: 'לימון', qty: 0.25, unit: 'יח׳', shop: 'fresh' }, { name: 'שום', qty: 1, unit: 'שן', shop: 'fresh' }, { name: 'שמן זית', qty: 10, unit: 'מ״ל', shop: 'dry' }],
      steps: ['בבית: מערבבים מיץ לימון, שום כתוש, שמן זית, פפריקה, מלח ופלפל', 'משרים את הפרגיות במרינדה בקופסה סגורה ומחזיקים בצידנית', 'צולים על גחלים לוהטות כ-5–6 דקות לכל צד, עד שהבשר לבן לגמרי בפנים'],
      tip: 'עוף צריך להיות עשוי לגמרי (74° בפנים). מלקחיים נפרדים לבשר נא ולבשר מוכן.' } },
  { id: 'kebab', name: 'קבב', kashrut: 'meat', vegan: false, allergens: [], portion: { name: 'קבב (בשר טחון)', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'קבב ביתי על האש', minutes: 25, extra: [{ name: 'בצל', qty: 0.2, unit: 'יח׳', shop: 'fresh' }, { name: 'פטרוזיליה', qty: 0.1, unit: 'צרור', shop: 'fresh' }],
      steps: ['בבית: לשים בשר טחון עם בצל מגורר, פטרוזיליה קצוצה, מלח, פלפל ובהרט', 'מעצבים קציצות מוארכות או על שיפודים ומקררים', 'צולים 4–5 דקות לכל צד, עד שאין ורוד בפנים'],
      tip: 'בשר טחון צולים עד הסוף (71° בפנים).' } },
  { id: 'chicken-skewers', name: 'שיפודי חזה עוף', kashrut: 'meat', vegan: false, allergens: [], portion: { name: 'חזה עוף לשיפודים', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'שיפודי עוף בתבלין שווארמה', minutes: 20, extra: [{ name: 'תבלין שווארמה', qty: 3, unit: 'גר׳', shop: 'dry' }, { name: 'שמן', qty: 10, unit: 'מ״ל', shop: 'dry' }],
      steps: ['בבית: חותכים לקוביות ומערבבים עם שמן ותבלין', 'משחילים על שיפודים (שיפודי עץ — להשרות קודם במים)', 'צולים 10–12 דקות תוך סיבוב, עד שהעוף לבן בפנים'],
      tip: 'חזה עוף מתייבש מהר — להוריד מהאש ברגע שהוא עשוי.' } },
  { id: 'sausages', name: 'נקניקיות', kashrut: 'meat', vegan: false, allergens: [], portion: { name: 'נקניקיות', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'נקניקיות בלחמנייה', minutes: 10, extra: [{ name: 'לחמניות', qty: 1, unit: 'יח׳', shop: 'bakery' }],
      steps: ['צולים על אש בינונית תוך סיבוב עד שהן חמות לכל אורכן', 'מגישים בלחמנייה עם חרדל וקטשופ'], tip: 'האהובות על ילדים — כדאי להכין ראשונות.' } },
  { id: 'entrecote', name: 'סטייק אנטריקוט', kashrut: 'meat', vegan: false, allergens: [], portion: { name: 'אנטריקוט', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'אנטריקוט על הגחלים', minutes: 15, extra: [{ name: 'מלח גס', qty: 3, unit: 'גר׳', shop: 'dry' }],
      steps: ['מוציאים מהצידנית כחצי שעה לפני הצלייה', 'מפזרים מלח גס ממש לפני הצלייה', 'צולים על אש חזקה 3–5 דקות לכל צד, לפי מידת העשייה הרצויה', 'נותנים לנוח 5 דקות לפני החיתוך'] } },
  { id: 'wings', name: 'כנפיים', kashrut: 'meat', vegan: false, allergens: [], portion: { name: 'כנפי עוף', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'כנפיים בסילאן וצ׳ילי', minutes: 30, extra: [{ name: 'סילאן', qty: 15, unit: 'גר׳', shop: 'dry' }],
      steps: ['בבית: משרים בסילאן, רוטב סויה, שום וצ׳ילי', 'צולים על אש בינונית כ-20–25 דקות תוך הפיכה', 'מוודאים שהבשר ליד העצם עשוי לגמרי'] } },
  { id: 'burgers', name: 'המבורגרים', kashrut: 'meat', vegan: false, allergens: ['גלוטן'], portion: { name: 'המבורגר בקר', qty: MEAT_G_PER_ADULT, unit: 'גר׳', shop: 'meat' },
    recipe: { title: 'המבורגר בלחמנייה', minutes: 15, extra: [{ name: 'לחמניות המבורגר', qty: 1, unit: 'יח׳', shop: 'bakery' }, { name: 'עגבניות', qty: 0.3, unit: 'יח׳', shop: 'fresh' }],
      steps: ['צולים 4–5 דקות לכל צד, עד שאין ורוד בפנים', 'מחממים לחמניות על הרשת חצי דקה', 'מגישים עם עגבנייה, חסה ורטבים'] } },
];

export const VEG: GrillItem[] = [
  { id: 'veg-burger', name: 'המבורגר צמחי', kashrut: 'parve', vegan: true, allergens: ['סויה'], portion: { name: 'המבורגר צמחי', qty: 2, unit: 'יח׳', shop: 'cold' },
    recipe: { title: 'המבורגר צמחי על האש', minutes: 12, extra: [{ name: 'לחמניות', qty: 1, unit: 'יח׳', shop: 'bakery' }],
      steps: ['צולים על רשת נקייה או על נייר אפייה, 4 דקות לכל צד', 'מגישים בלחמנייה עם ירקות'], tip: 'רשת או משטח נפרדים מהבשר.' } },
  { id: 'portobello', name: 'פטריות פורטובלו', kashrut: 'parve', vegan: true, allergens: [], portion: { name: 'פטריות פורטובלו', qty: 200, unit: 'גר׳', shop: 'fresh' },
    recipe: { title: 'פורטובלו בשמן זית ושום', minutes: 15, extra: [{ name: 'שמן זית', qty: 10, unit: 'מ״ל', shop: 'dry' }, { name: 'שום', qty: 1, unit: 'שן', shop: 'fresh' }],
      steps: ['מברישים בשמן זית, שום כתוש, מלח ופלפל', 'צולים 5–6 דקות לכל צד עד שהן רכות'] } },
  { id: 'veg-skewers', name: 'שיפודי ירקות', kashrut: 'parve', vegan: true, allergens: [], portion: { name: 'ירקות לשיפודים (פלפל, בצל, קישוא, שרי)', qty: 300, unit: 'גר׳', shop: 'fresh' },
    recipe: { title: 'שיפודי ירקות צבעוניים', minutes: 20, extra: [{ name: 'שמן זית', qty: 10, unit: 'מ״ל', shop: 'dry' }],
      steps: ['בבית: חותכים לקוביות גדולות ומשחילים', 'מברישים בשמן ותבלינים', 'צולים 10–12 דקות תוך סיבוב'] } },
  { id: 'corn', name: 'תירס', kashrut: 'parve', vegan: true, allergens: [], portion: { name: 'קלחי תירס', qty: 1.5, unit: 'יח׳', shop: 'fresh' },
    recipe: { title: 'תירס על הגחלים', minutes: 20, extra: [],
      steps: ['עוטפים בנייר כסף (או צולים עם העלים)', 'מניחים על הגחלים 15–20 דקות ומסובבים', 'מגישים עם מלח'] } },
  { id: 'eggplant', name: 'חציל בגחלים', kashrut: 'parve', vegan: true, allergens: ['שומשום'], portion: { name: 'חצילים', qty: 0.5, unit: 'יח׳', shop: 'fresh' },
    recipe: { title: 'חציל שרוף עם טחינה', minutes: 30, extra: [{ name: 'טחינה מוכנה', qty: 30, unit: 'גר׳', shop: 'cold' }],
      steps: ['מניחים חציל שלם ישר על הגחלים', 'מסובבים עד שהקליפה שרופה והחציל רך לגמרי (20–30 דק׳)', 'פותחים, מוציאים את הבשר ומגישים עם טחינה ולימון'] } },
  { id: 'halloumi', name: 'חלומי', kashrut: 'dairy', vegan: false, allergens: ['חלב'], portion: { name: 'גבינת חלומי', qty: 120, unit: 'גר׳', shop: 'cold' },
    recipe: { title: 'חלומי צלוי', minutes: 8, extra: [],
      steps: ['פורסים לפרוסות של 1 ס״מ', 'צולים 2 דקות לכל צד על רשת נקייה', 'מגישים מיד עם עגבניות וזעתר'], tip: 'חלבי — לא באותה ארוחה עם בשר במשפחות ששומרות כשרות.' } },
];

export const GRILL_BY_ID: Record<string, GrillItem> = Object.fromEntries([...MEATS, ...VEG].map(g => [g.id, g]));
export const DEFAULT_GRILL = { meats: ['pargiot', 'kebab', 'sausages'], veg: ['veg-burger', 'corn', 'veg-skewers'] };
