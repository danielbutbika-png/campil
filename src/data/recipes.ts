import type { MealType } from '../lib/types';

export type Kashrut = 'meat' | 'dairy' | 'parve';
export interface Ingredient { name: string; qty: number; unit: string; shop: 'fresh' | 'dry' | 'cold' | 'bakery' | 'meat' | 'drinks' | 'alcohol' }
export interface Recipe {
  id: string; name: string; types: MealType[]; kashrut: Kashrut; vegetarian: boolean; vegan: boolean;
  allergens: string[]; prepMin: number; gear: string[]; steps: string[]; grill?: 'meat' | 'veg';
  ingredients: Ingredient[]; // per one serving
}

// Quantities are per serving. Shopping totals multiply by servings and round up to sensible units.
export const RECIPES: Recipe[] = [
  { id: 'shakshuka', name: 'שקשוקה במחבת על הגזייה', types: ['breakfast', 'dinner'], kashrut: 'parve', vegetarian: true, vegan: false, allergens: ['ביצים'], prepMin: 25,
    gear: ['מחבת גדולה', 'גזייה'], steps: ['מטגנים בצל ופלפל', 'מוסיפים עגבניות ותבלינים ומבשלים 10 דק׳', 'שוברים ביצים, מכסים ומבשלים עד שהחלבון מתייצב'],
    ingredients: [{ name: 'ביצים', qty: 2, unit: 'יח׳', shop: 'cold' }, { name: 'עגבניות', qty: 1.5, unit: 'יח׳', shop: 'fresh' }, { name: 'פלפל אדום', qty: 0.3, unit: 'יח׳', shop: 'fresh' }, { name: 'בצל', qty: 0.3, unit: 'יח׳', shop: 'fresh' }, { name: 'פיתות', qty: 1, unit: 'יח׳', shop: 'bakery' }] },
  { id: 'israeli-breakfast', name: 'ארוחת בוקר ישראלית', types: ['breakfast'], kashrut: 'dairy', vegetarian: true, vegan: false, allergens: ['חלב', 'גלוטן', 'ביצים'], prepMin: 20,
    gear: ['קרש חיתוך', 'סכין', 'מחבת'], steps: ['חותכים סלט ירקות', 'מכינים חביתות', 'מגישים עם גבינות ולחם'],
    ingredients: [{ name: 'ביצים', qty: 1, unit: 'יח׳', shop: 'cold' }, { name: 'מלפפונים', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'עגבניות', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'גבינה לבנה', qty: 60, unit: 'גר׳', shop: 'cold' }, { name: 'גבינה צהובה פרוסה', qty: 40, unit: 'גר׳', shop: 'cold' }, { name: 'לחם', qty: 0.15, unit: 'כיכר', shop: 'bakery' }] },
  { id: 'granola', name: 'יוגורט וגרנולה', types: ['breakfast', 'snack'], kashrut: 'dairy', vegetarian: true, vegan: false, allergens: ['חלב', 'אגוזים', 'גלוטן'], prepMin: 5,
    gear: ['קערות'], steps: ['מחלקים יוגורט לקערות', 'מוסיפים גרנולה ופירות'],
    ingredients: [{ name: 'יוגורט', qty: 1, unit: 'גביע', shop: 'cold' }, { name: 'גרנולה', qty: 50, unit: 'גר׳', shop: 'dry' }, { name: 'בננות', qty: 0.5, unit: 'יח׳', shop: 'fresh' }] },
  { id: 'pancakes', name: 'פנקייקים על הגזייה', types: ['breakfast'], kashrut: 'dairy', vegetarian: true, vegan: false, allergens: ['חלב', 'גלוטן', 'ביצים'], prepMin: 30,
    gear: ['מחבת', 'קערת ערבוב', 'מטרפה'], steps: ['מערבבים תערובת עם חלב וביצה', 'מטגנים בחום בינוני', 'מגישים עם סילאן או ריבה'],
    ingredients: [{ name: 'תערובת פנקייק', qty: 70, unit: 'גר׳', shop: 'dry' }, { name: 'חלב', qty: 100, unit: 'מ״ל', shop: 'cold' }, { name: 'ביצים', qty: 0.5, unit: 'יח׳', shop: 'cold' }, { name: 'סילאן', qty: 15, unit: 'גר׳', shop: 'dry' }] },
  { id: 'pita-tuna', name: 'פיתות טונה וירקות', types: ['lunch'], kashrut: 'parve', vegetarian: false, vegan: false, allergens: ['דגים', 'גלוטן'], prepMin: 10,
    gear: ['פותחן קופסאות'], steps: ['מערבבים טונה עם תירס', 'ממלאים פיתות עם ירקות'],
    ingredients: [{ name: 'טונה בשימורים', qty: 0.7, unit: 'קופסה', shop: 'dry' }, { name: 'תירס בשימורים', qty: 0.25, unit: 'קופסה', shop: 'dry' }, { name: 'פיתות', qty: 1.5, unit: 'יח׳', shop: 'bakery' }, { name: 'מלפפונים', qty: 0.5, unit: 'יח׳', shop: 'fresh' }] },
  { id: 'hummus-plate', name: 'צלחת חומוס וירקות', types: ['lunch', 'snack'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: ['שומשום', 'גלוטן'], prepMin: 10,
    gear: ['קרש חיתוך', 'סכין'], steps: ['פורסים חומוס בצלחת', 'חותכים מקלות ירקות', 'מגישים עם פיתות'],
    ingredients: [{ name: 'חומוס מוכן', qty: 100, unit: 'גר׳', shop: 'cold' }, { name: 'גזרים', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'מלפפונים', qty: 0.5, unit: 'יח׳', shop: 'fresh' }, { name: 'פיתות', qty: 1, unit: 'יח׳', shop: 'bakery' }] },
  { id: 'sandwiches', name: 'כריכים לדרך', types: ['lunch'], kashrut: 'dairy', vegetarian: true, vegan: false, allergens: ['חלב', 'גלוטן'], prepMin: 15,
    gear: ['קופסאות מזון אטומות'], steps: ['מכינים בבית או בבוקר', 'שומרים בצידנית עד ההגשה'],
    ingredients: [{ name: 'לחם', qty: 0.2, unit: 'כיכר', shop: 'bakery' }, { name: 'גבינה צהובה פרוסה', qty: 40, unit: 'גר׳', shop: 'cold' }, { name: 'עגבניות', qty: 0.5, unit: 'יח׳', shop: 'fresh' }] },
  // 'bbq' and 'veg-grill': the grilled items come from the trip's grill choice (data/grill.ts); these are the sides.
  { id: 'bbq', name: 'על האש — מנגל בשרי', types: ['dinner'], kashrut: 'meat', vegetarian: false, vegan: false, allergens: ['גלוטן'], prepMin: 45, grill: 'meat',
    gear: ['מנגל או גריל גז', 'פחמים', 'מלקחיים'], steps: ['מדליקים מנגל רק במקום שמותר בו', 'צולים לפי המתכונים של כל פריט', 'מגישים עם סלט, פיתות וסלטים'],
    ingredients: [{ name: 'פיתות', qty: 1.5, unit: 'יח׳', shop: 'bakery' }, { name: 'עגבניות', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'מלפפונים', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'חומוס מוכן', qty: 60, unit: 'גר׳', shop: 'cold' }, { name: 'פחמים', qty: 0.4, unit: 'ק״ג', shop: 'dry' }] },
  { id: 'veg-grill', name: 'על האש — מנגל צמחוני', types: ['dinner'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: ['גלוטן'], prepMin: 40, grill: 'veg',
    gear: ['מנגל או גריל', 'רשת נפרדת או נייר אפייה', 'מלקחיים נפרדים'], steps: ['צולים על רשת נפרדת מהבשר', 'צולים לפי המתכונים של כל פריט', 'מגישים עם סלט ופיתות'],
    ingredients: [{ name: 'פיתות', qty: 1.5, unit: 'יח׳', shop: 'bakery' }, { name: 'עגבניות', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'מלפפונים', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'חומוס מוכן', qty: 60, unit: 'גר׳', shop: 'cold' }] },
  { id: 'majadra', name: 'מג׳דרה וסלט', types: ['dinner', 'lunch'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: [], prepMin: 35,
    gear: ['סיר', 'גזייה'], steps: ['מטגנים בצל עד שהוא שחום', 'מוסיפים אורז ועדשים מושרות, מים ומלח', 'מבשלים מכוסה על אש קטנה 20 דקות', 'מגישים עם סלט ירקות'],
    ingredients: [{ name: 'אורז', qty: 70, unit: 'גר׳', shop: 'dry' }, { name: 'עדשים חומות', qty: 40, unit: 'גר׳', shop: 'dry' }, { name: 'בצל', qty: 0.5, unit: 'יח׳', shop: 'fresh' }, { name: 'מלפפונים', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'עגבניות', qty: 1, unit: 'יח׳', shop: 'fresh' }] },
  { id: 'pan-toast', name: 'טוסטים במחבת', types: ['dinner', 'lunch', 'breakfast'], kashrut: 'dairy', vegetarian: true, vegan: false, allergens: ['חלב', 'גלוטן'], prepMin: 20,
    gear: ['מחבת או מחבת טוסטים', 'גזייה'], steps: ['ממלאים לחם בגבינה צהובה ועגבנייה', 'קולים במחבת עם מכסה, 3 דקות לכל צד'],
    ingredients: [{ name: 'לחם טוסט', qty: 4, unit: 'פרוסות', shop: 'bakery' }, { name: 'גבינה צהובה פרוסה', qty: 60, unit: 'גר׳', shop: 'cold' }, { name: 'עגבניות', qty: 0.5, unit: 'יח׳', shop: 'fresh' }] },
  { id: 'pasta', name: 'פסטה ברוטב עגבניות', types: ['dinner', 'lunch'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: ['גלוטן'], prepMin: 25,
    gear: ['סיר', 'גזייה', 'מסננת'], steps: ['מרתיחים מים ומבשלים פסטה', 'מחממים רוטב', 'מערבבים ומגישים'],
    ingredients: [{ name: 'פסטה', qty: 110, unit: 'גר׳', shop: 'dry' }, { name: 'רוטב עגבניות', qty: 120, unit: 'גר׳', shop: 'dry' }, { name: 'מים לבישול', qty: 0.8, unit: 'ליטר', shop: 'dry' }] },
  { id: 'potjie', name: 'תבשיל קטניות בסיר אחד', types: ['dinner'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: [], prepMin: 40,
    gear: ['סיר', 'גזייה'], steps: ['מטגנים בצל', 'מוסיפים עדשים, ירקות ומים', 'מבשלים עד ריכוך'],
    ingredients: [{ name: 'עדשים כתומות', qty: 70, unit: 'גר׳', shop: 'dry' }, { name: 'בצל', qty: 0.3, unit: 'יח׳', shop: 'fresh' }, { name: 'גזרים', qty: 0.5, unit: 'יח׳', shop: 'fresh' }, { name: 'תפוחי אדמה', qty: 1, unit: 'יח׳', shop: 'fresh' }] },
  { id: 'foil-potatoes', name: 'תפוחי אדמה בגחלים', types: ['dinner', 'snack'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: [], prepMin: 50,
    gear: ['נייר אלומיניום', 'מלקחיים'], steps: ['עוטפים בנייר כסף', 'טומנים בגחלים כ-40 דק׳', 'מגישים עם מלח ושמן זית'],
    ingredients: [{ name: 'תפוחי אדמה', qty: 1.5, unit: 'יח׳', shop: 'fresh' }, { name: 'בטטות', qty: 0.5, unit: 'יח׳', shop: 'fresh' }] },
  { id: 'schnitzel', name: 'שניצל מוכן מראש ופירה', types: ['dinner', 'lunch'], kashrut: 'meat', vegetarian: false, vegan: false, allergens: ['גלוטן', 'ביצים'], prepMin: 20,
    gear: ['מחבת', 'סיר'], steps: ['מחממים שניצלים שהוכנו בבית', 'מכינים פירה מאבקה'],
    ingredients: [{ name: 'שניצלים מוכנים', qty: 2, unit: 'יח׳', shop: 'cold' }, { name: 'אבקת פירה', qty: 40, unit: 'גר׳', shop: 'dry' }] },
  { id: 'smores', name: 'מרשמלו וביסקוויטים', types: ['snack'], kashrut: 'parve', vegetarian: false, vegan: false, allergens: ['גלוטן'], prepMin: 15,
    gear: ['שיפודים', 'מדורה או מנגל'], steps: ['קולים מרשמלו', 'לוחצים בין שני ביסקוויטים עם קוביית שוקולד'],
    ingredients: [{ name: 'מרשמלו', qty: 4, unit: 'יח׳', shop: 'dry' }, { name: 'ביסקוויטים', qty: 4, unit: 'יח׳', shop: 'dry' }, { name: 'שוקולד מריר', qty: 15, unit: 'גר׳', shop: 'dry' }] },
  { id: 'fruit-snack', name: 'פירות וחטיפים לדרך', types: ['snack'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: [], prepMin: 5,
    gear: ['קופסאות מזון אטומות'], steps: ['שוטפים פירות בבית', 'מחלקים לקופסאות'],
    ingredients: [{ name: 'תפוחים', qty: 1, unit: 'יח׳', shop: 'fresh' }, { name: 'תמרים', qty: 40, unit: 'גר׳', shop: 'dry' }, { name: 'בייגלה', qty: 30, unit: 'גר׳', shop: 'dry' }] },
  { id: 'veg-wraps', name: 'טורטיות ירקות וטחינה', types: ['lunch', 'dinner'], kashrut: 'parve', vegetarian: true, vegan: true, allergens: ['שומשום', 'גלוטן'], prepMin: 15,
    gear: ['קרש חיתוך', 'סכין'], steps: ['חותכים ירקות', 'מורחים טחינה על טורטיה', 'מגלגלים'],
    ingredients: [{ name: 'טורטיות', qty: 2, unit: 'יח׳', shop: 'bakery' }, { name: 'טחינה מוכנה', qty: 40, unit: 'גר׳', shop: 'cold' }, { name: 'חסה', qty: 0.15, unit: 'ראש', shop: 'fresh' }, { name: 'גזרים', qty: 0.5, unit: 'יח׳', shop: 'fresh' }] },
];
export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map(r => [r.id, r]));
export const ALLERGENS = ['גלוטן', 'חלב', 'ביצים', 'אגוזים', 'שומשום', 'דגים'];
export const MEAL_LABEL: Record<MealType, string> = { breakfast: 'בוקר', lunch: 'צהריים', dinner: 'ערב', snack: 'נשנוש' };
export const KASHRUT_LABEL: Record<Kashrut, string> = { meat: 'בשרי', dairy: 'חלבי', parve: 'פרווה' };
