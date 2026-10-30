# תהליך שחרור גרסה

## מה קיים (נבדק בקוד: `.github/workflows/ci.yml`)
- push לענף `staging` → typecheck, unit, build, rules (Emulator), e2e → **רק אם הכול עבר** → פרסום ל-`/campil/staging/` (פרויקט Firebase `campil-staging`) + תגית `deploy-staging-<תאריך>-<commit>`.
- push לענף `source` → אותן בדיקות → פרסום ל-`/campil/` (ייצור, `campil-771aa`) + תגית `deploy-prod-…`.
- כל הרצה כותבת דו"ח לענף `ci-reports` (`<commit>.md`, `latest.md`).
- חזרה לאחור: Actions ← CI ← Run workflow ← `ref` = commit או תגית קודמת, `target` = production.

## כלל מ-30.10.2026
1. Claude מפרסם **רק ל-staging**.
2. לייצור — רק אחרי אישור מפורש של דניאל בצ'אט, לכל גרסה.
3. לפני בקשת אישור: CI של staging ירוק + רשימת שינויים + מה לא נבדק.
4. כללי Firestore: מתפרסמים ידנית בקונסולה (staging ואז ייצור). קוד שתלוי בכללים חדשים מסומן כך בבקשת האישור.

## אופציונלי (דורש פעולה בהגדרות GitHub)
Environment בשם `production` עם Required reviewer — אז גם push לענף `source` ימתין לאישור בממשק GitHub. מומלץ; ממומש בשורה אחת ב-workflow אחרי שהסביבה נוצרת.
