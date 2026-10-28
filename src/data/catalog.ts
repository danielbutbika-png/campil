import type { CategoryId } from '../lib/types';

export const CATEGORIES: { id: CategoryId; name: string; blaze: string }[] = [
  { id: 'tents', name: 'אוהלים והצללה', blaze: '#2f6b3f' },
  { id: 'sleep', name: 'ציוד שינה', blaze: '#5b4b8a' },
  { id: 'power', name: 'תאורה וחשמל', blaze: '#d9822b' },
  { id: 'clothing', name: 'ביגוד אישי', blaze: '#3c6e9f' },
  { id: 'shoes', name: 'הנעלה', blaze: '#6b4f3a' },
  { id: 'kitchen', name: 'מטבח ובישול', blaze: '#b5562f' },
  { id: 'food', name: 'מזון ושתייה', blaze: '#c99a2e' },
  { id: 'cooling', name: 'קירור ואחסון מזון', blaze: '#2c8c99' },
  { id: 'furniture', name: 'ריהוט קמפינג', blaze: '#8a6d3b' },
  { id: 'hygiene', name: 'היגיינה', blaze: '#4f8f8a' },
  { id: 'kids', name: 'ציוד לילדים', blaze: '#d1495b' },
  { id: 'firstaid', name: 'עזרה ראשונה', blaze: '#c0392b' },
  { id: 'car', name: 'ציוד לרכב', blaze: '#4a4a4a' },
  { id: 'cleaning', name: 'ניקיון ואשפה', blaze: '#5d7a3a' },
  { id: 'pets', name: 'ציוד לחיות מחמד', blaze: '#9c6b30' },
  { id: 'misc', name: 'שונות', blaze: '#777777' },
];
export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<CategoryId, (typeof CATEGORIES)[number]>;

export const STATUS_LABEL = { have: 'יש / נרכש', home: 'יש בבית', check: 'לבדוק', buy: 'צריך להשלים', per_trip: 'לפי טיול' } as const;
export const CONDITION_LABEL = { good: 'תקין', worn: 'בלאי', repair: 'דורש תיקון' } as const;
