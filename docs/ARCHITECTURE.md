# CampIL — ארכיטקטורה

## שכבות
```
screens/ (מסכים, טעינה לפי דרישה)  ─┐
components/ (רכיבי ממשק משותפים)    ├─► lib/store (zustand, שמירה במכשיר)  ─► lib/cloud (Firestore: סנכרון, מיגרציה)
engine/ (חוקים טהורים + בדיקות)  ◄──┘        │
data/ (קטלוגים סטטיים)                       └─► services/ (Open-Meteo, OSM, OSRM)
public/sw.js (Service Worker: כל הבנייה נשמרת, מפות שמורות)
```
- **engine/** — פונקציות טהורות בלי React ובלי רשת: packing, menu, planner, drinks, scoring, weatherRules, warehouse, pack3d, partial, duties, assistant, loading. כל קובץ עם בדיקות `*.test.ts`.
- **מקור אמת:** המכשיר (localStorage + IndexedDB לתמונות). Firestore הוא שכבת שיתוף, לא תנאי לעבודה.
- **ניתוב:** hash (`#/trip/:id/:tab`) — עובד ב-GitHub Pages ובלי רשת.

## ישויות (מזהים יציבים, `uid()`)
| ישות | איפה | הערות |
|---|---|---|
| משתמש | Firebase Auth (אנונימי / Google) | אין חשבון בלי שיתוף |
| משפחה (`Family`) | `trip.families[]` | צבע, שם; שיוך משתתפים |
| משתתף (`Member`) | `trip.participants[]` | גיל, מגדר, משפחה |
| טיול (`Trip`) | store + `trips/{id}` | ליבה, ציוד, משימות, ארוחות, לו״ז, מזווה, אחריות |
| פריט אריזה (`PackItem`) | `trips/{id}.packing` / `families/{fid}.packing` | פרטי למשפחה או משותף; `brings`, `packedQty` |
| ציוד במחסן (`GearItem`) | store (מכשיר) | מידות, משקל, בדיקות |
| משימה / ארוחה / אירוע לו״ז | מפות לפי מזהה | תיקוני שדה, בלי דריסה |
| אחריות (`Duty`) | `trips/{id}.duties[key]` | `meal:` / `shop:` / `task:` |
| תמונה | IndexedDB + `journal/{id}` | קולאז׳/סרטון — במכשיר בלבד |

## סנכרון
- כל שינוי הופך ל"תיקונים" ברמת שדה (`diffTrip`): `packing.<id>.<field>`, `brings.<family>`, `duties.<key>`, `pantry.<key>` — שני מכשירים שמשנים דברים שונים לא דורסים זה את זה.
- ציוד פרטי של משפחה במסמך נפרד שרק היא קוראת (כללים ב-`firestore.rules`, בדיקות ב-`tests/rules`).
- בלי רשת: Firestore persistentLocalCache + מונה "ממתין לשליחה" במסך.

## סביבות
- `source` → ייצור `/campil/`, `staging` → `/campil/staging/` (פרויקט Firebase נפרד, אחסון מכשיר עם קידומת `campil-stg-`).
- פרסום רק דרך CI אחרי: טיפוסים (כולל קוד לא בשימוש) → יחידה → בנייה → כללים מול Emulator → תרחישי דפדפן.

## הרחבה (Release 2+)
- **מנוע סוגי טיולים:** קטלוג אחד (`data/tripTypes.ts`) של סוגים; לכל סוג "מודולים" — שאלות, חוקי ציוד, משימות, מדריכים, בדיקות בטיחות. המנועים הקיימים קוראים את הסוגים שנבחרו (`trip.types[]`) במקום תנאים קשיחים.
- **האקדמיה:** תוכן מובנה (`data/academy/*`) + רכיב צופה אחד (שלבים, אנימציה, בוחן); התקדמות ומועדפים במכשיר.
