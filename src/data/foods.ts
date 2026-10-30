// Foods for a self-built menu, with a planning portion for ONE adult at ONE meal.
// These are planning estimates (shown as such and editable), not nutritional advice; a child's share follows
// engine/menu.appetite (e.g. 60% at age 4–8). Quantities are raw/uncooked unless stated.
export interface Food { id: string; name: string; per: number; unit: 'גר׳' | 'מ״ל' | 'יח׳'; shop: 'fresh' | 'meat' | 'cold' | 'bakery' | 'dry'; group: FoodGroup; note?: string }
export type FoodGroup = 'veg' | 'protein' | 'dairy' | 'carbs' | 'bread' | 'sweet';
export const FOOD_GROUP_HE: Record<FoodGroup, string> = { veg: 'ירקות ופירות', protein: 'בשר, עוף וחלבון', dairy: 'חלב, ביצים וממרחים', carbs: 'פחמימות', bread: 'לחם ומאפים', sweet: 'נשנושים ומתוקים' };

const f = (id: string, name: string, per: number, unit: Food['unit'], shop: Food['shop'], group: FoodGroup, note?: string): Food => ({ id, name, per, unit, shop, group, note });
export const FOODS: Food[] = [
  f('tomato', 'עגבניות', 100, 'גר׳', 'fresh', 'veg'), f('cucumber', 'מלפפונים', 100, 'גר׳', 'fresh', 'veg'), f('pepper', 'פלפלים', 70, 'גר׳', 'fresh', 'veg'),
  f('onion', 'בצל', 40, 'גר׳', 'fresh', 'veg'), f('carrot', 'גזר', 60, 'גר׳', 'fresh', 'veg'), f('lettuce', 'חסה / עלים לסלט', 40, 'גר׳', 'fresh', 'veg'),
  f('potato', 'תפוחי אדמה', 250, 'גר׳', 'fresh', 'veg'), f('sweetpotato', 'בטטות', 200, 'גר׳', 'fresh', 'veg'), f('corn', 'תירס (קלחים)', 1, 'יח׳', 'fresh', 'veg'),
  f('fruit', 'פירות (תפוח / בננה / תפוז)', 1, 'יח׳', 'fresh', 'veg'), f('watermelon', 'אבטיח', 300, 'גר׳', 'fresh', 'veg', 'משקל עם קליפה'),
  f('chicken-breast', 'חזה עוף', 180, 'גר׳', 'meat', 'protein'), f('chicken-legs', 'שוקיים / כנפיים', 300, 'גר׳', 'meat', 'protein', 'משקל עם עצם'),
  f('mince', 'בשר טחון (קבב / המבורגר)', 180, 'גר׳', 'meat', 'protein'), f('steak', 'סטייק / אנטריקוט', 220, 'גר׳', 'meat', 'protein'),
  f('schnitzel', 'שניצל', 150, 'גר׳', 'meat', 'protein'), f('sausages', 'נקניקיות', 2, 'יח׳', 'meat', 'protein'),
  f('tofu', 'טופו', 150, 'גר׳', 'cold', 'protein'), f('tuna', 'טונה (קופסה)', 0.5, 'יח׳', 'dry', 'protein', 'קופסה של כ-160 גר׳'),
  f('eggs', 'ביצים', 2, 'יח׳', 'cold', 'dairy'), f('yellow-cheese', 'גבינה צהובה', 40, 'גר׳', 'cold', 'dairy'), f('white-cheese', 'גבינה לבנה', 50, 'גר׳', 'cold', 'dairy'),
  f('cottage', 'קוטג׳', 60, 'גר׳', 'cold', 'dairy'), f('yogurt', 'יוגורט / מעדן', 1, 'יח׳', 'cold', 'dairy'), f('milk', 'חלב', 200, 'מ״ל', 'cold', 'dairy'),
  f('hummus', 'חומוס', 60, 'גר׳', 'cold', 'dairy'), f('tahini', 'טחינה מוכנה', 40, 'גר׳', 'cold', 'dairy'), f('cold-cuts', 'נקניק פרוס', 40, 'גר׳', 'cold', 'dairy'),
  f('pasta', 'פסטה (יבשה)', 100, 'גר׳', 'dry', 'carbs'), f('rice', 'אורז (יבש)', 80, 'גר׳', 'dry', 'carbs'), f('couscous', 'קוסקוס (יבש)', 80, 'גר׳', 'dry', 'carbs'),
  f('ptitim', 'פתיתים (יבשים)', 80, 'גר׳', 'dry', 'carbs'), f('cereal', 'דגני בוקר', 45, 'גר׳', 'dry', 'carbs'), f('oats', 'שיבולת שועל', 50, 'גר׳', 'dry', 'carbs'),
  f('tomato-sauce', 'רוטב עגבניות', 100, 'גר׳', 'dry', 'carbs'), f('canned-corn', 'תירס בשימורים', 50, 'גר׳', 'dry', 'veg'),
  f('pita', 'פיתות', 1.5, 'יח׳', 'bakery', 'bread'), f('bread', 'לחם (פרוסות)', 3, 'יח׳', 'bakery', 'bread', 'כיכר ≈ 20 פרוסות'), f('rolls', 'לחמניות', 1.5, 'יח׳', 'bakery', 'bread'),
  f('laffa', 'לאפות', 1, 'יח׳', 'bakery', 'bread'), f('cake', 'עוגה / עוגיות', 50, 'גר׳', 'bakery', 'sweet'),
  f('snacks', 'חטיפים', 30, 'גר׳', 'dry', 'sweet'), f('chocolate', 'שוקולד', 25, 'גר׳', 'dry', 'sweet'), f('marshmallow', 'מרשמלו', 25, 'גר׳', 'dry', 'sweet'),
  f('nuts', 'אגוזים / גרעינים', 30, 'גר׳', 'dry', 'sweet'), f('popcorn', 'פופקורן', 20, 'גר׳', 'dry', 'sweet'),
];
export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map(x => [x.id, x]));
export const FOOD_NOTE = 'מנה למבוגר בארוחה אחת — הערכת תכנון; ילדים לפי גיל. אפשר לשנות כל כמות.';
