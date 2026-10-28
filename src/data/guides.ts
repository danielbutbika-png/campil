export interface Guide { id: string; title: string; blurb: string; minutes: number; tone: 'safety' | 'family' | 'skills'; body: { h?: string; p?: string; list?: string[]; code?: string }[]; links?: { label: string; url: string }[] }

export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      function signedIn() { return request.auth != null; }
      function isOwner() { return signedIn() && resource.data.owner == request.auth.uid; }
      function isMember() { return signedIn() && request.auth.uid in resource.data.members; }
      function openLink() { return resource.data.get('access', 'link') == 'link'; }
      function changed() { return request.resource.data.diff(resource.data).affectedKeys(); }
      function onlyMine(f) { return request.resource.data.get(f, {}).diff(resource.data.get(f, {})).affectedKeys().hasOnly([request.auth.uid]); }
      function safeEdit() { return !changed().hasAny(['owner', 'access', 'pending']) && (!changed().hasAny(['members']) || onlyMine('members')); }

      allow get: if isOwner() || isMember() || (signedIn() && openLink());
      allow list: if false;
      allow create: if signedIn() && request.resource.data.owner == request.auth.uid;
      allow delete: if isOwner();
      allow update: if isOwner()
        || (signedIn() && openLink() && safeEdit())
        || (isMember() && safeEdit())
        || (signedIn() && request.auth.token.email is string && changed().hasOnly(['pending', 'updatedAt']) && onlyMine('pending'));

      match /journal/{entryId} {
        function trip() { return get(/databases/$(database)/documents/trips/$(tripId)).data; }
        allow read, write: if request.auth != null && (trip().owner == request.auth.uid || request.auth.uid in trip().members || trip().get('access', 'link') == 'link');
      }
    }
  }
}`;

export const GUIDES: Guide[] = [
  { id: 'firebase', title: 'הגדרת עריכה משותפת (Firebase)', blurb: 'הגדרה חד-פעמית של כ-10 דקות, ואחריה כל טיול משותף בלחיצה.', minutes: 10, tone: 'skills',
    body: [
      { p: 'Firebase הוא שירות של Google ששומר את הטיולים המשותפים ומסנכרן אותם בין הטלפונים. בהיקף של טיולים משפחתיים השימוש נשאר בתוך המכסה החינמית.' },
      { h: '1. יצירת פרויקט', list: ['להיכנס ל-console.firebase.google.com עם חשבון Google.', 'Add project (או Create a project) ← שם: campil ← להמשיך.', 'אפשר לכבות את Google Analytics ← Create project.'] },
      { h: '2. שיטות כניסה', list: ['בתפריט: Authentication ← Get started.', 'לשונית Sign-in method ← Anonymous ← Enable ← Save.', 'Sign-in method ← Google ← Enable ← לבחור Support email ← Save.', 'לשונית Settings ← Authorized domains ← Add domain ← danielbutbika-png.github.io'] },
      { h: '3. מסד נתונים', list: ['Build ← Firestore Database ← Create database.', 'מיקום: me-west1 (תל אביב) או eur3 ← Next.', 'Start in production mode ← Create.'] },
      { h: '4. כללי אבטחה', p: 'בלשונית Rules של Firestore למחוק את מה שיש ולהדביק את הכללים הבאים, ואז Publish:', code: '__RULES__' },
      { h: '5. פרטי ההגדרה', list: ['גלגל השיניים ליד Project Overview ← Project settings.', 'למטה, Your apps ← הסמל </> (Web).', 'App nickname: CampIL ← Register app (בלי Hosting).', 'להעתיק את כל הקטע const firebaseConfig = { … }.'] },
      { h: '6. חיבור באפליקציה', list: ['ב-CampIL: עוד ← הגדרות ← שיתוף בזמן אמת.', 'להדביק את הקטע, לכתוב את השם שלך ← שמירה וחיבור.', 'בטיול: כפתור השיתוף ← הפעלת עריכה משותפת ← שליחה בוואטסאפ.'] },
      { p: 'השותפים רק פותחים את הקישור, כותבים את השם שלהם — ונכנסים. הם לא צריכים חשבון Firebase.' },
    ], links: [{ label: 'Firebase Console', url: 'https://console.firebase.google.com' }] },
  { id: 'first-night', title: 'הלילה הראשון באוהל עם ילדים', blurb: 'איך להפוך את הלילה הראשון לחוויה ולא למבחן סבולת.', minutes: 4, tone: 'family',
    body: [
      { p: 'הלילה הראשון קובע אם הילדים ירצו לצאת שוב. התכנון פשוט: להגיע באור, להקים מהר, ולהשאיר זמן למשחק.' },
      { h: 'לפני השקיעה', list: ['להגיע לאתר לפחות שעתיים לפני החשכה.', 'להקים קודם את האוהל והשינה, ורק אחר כך את המטבח.', 'לתת לכל ילד תפקיד קבוע: יתדות, פנסים, מזרנים.'] },
      { h: 'בלילה', list: ['פנס אישי לכל ילד, ופנס תלוי במרכז האוהל.', 'שכבה חמה נוספת ליד כל שק שינה — גם בקיץ הלילה מתקרר.', 'לסמן מראש את הדרך לשירותים.'] },
    ] },
  { id: 'heat', title: 'טיול בעומס חום', blurb: 'מתי לצאת, מה לבחור ומתי לוותר.', minutes: 3, tone: 'safety',
    body: [
      { p: 'בימי עומס חום מתכננים את הפעילות לשעות הבוקר המוקדמות ואחר הצהריים המאוחרות, ובוחרים מסלולים מוצלים או מסלולי מים.' },
      { list: ['לשתות לפני הצמא ולשאת מספיק מים לכל משתתף.', 'כובע רחב, ביגוד בהיר ומקום מוצל להפסקות.', 'לוותר על מסלולים חשופים ותלולים בשעות החמות.', 'להכיר סימני התייבשות ומכת חום, ולהזעיק עזרה במוקד 101 במקרה חירום.'] },
      { p: 'בדקו את האזהרות של השירות המטאורולוגי ושל רשות הטבע והגנים לפני היציאה. CampIL מציגה את התחזית אך אינה מחליפה הנחיות רשמיות.' },
    ], links: [{ label: 'השירות המטאורולוגי', url: 'https://ims.gov.il' }, { label: 'רשות הטבע והגנים', url: 'https://www.parks.org.il' }] },
  { id: 'floods', title: 'שיטפונות בזק בנחלים', blurb: 'למה גשם רחוק מסוכן גם כשאצלכם שמש.', minutes: 3, tone: 'safety',
    body: [
      { p: 'שיטפון יכול להגיע לערוץ גם כשהגשם יורד עשרות קילומטרים משם. במדבר יהודה, בנגב ובערבה הסיכון גבוה בחורף ובמעברי עונות.' },
      { list: ['אל תיכנסו לערוצים צרים כשיש תחזית לגשם באזור או במעלה הנחל.', 'אל תלונו בערוץ של נחל.', 'אם מתחילים לשמוע רעש מים או רואים מים עכורים — לעלות מיד לגדה גבוהה.', 'אם יש התרעה רשמית — לא יוצאים למסלול.'] },
    ], links: [{ label: 'השירות המטאורולוגי — התרעות', url: 'https://ims.gov.il' }] },
  { id: 'wind', title: 'הקמת אוהל ברוח', blurb: 'עיגון נכון, כיוון פתח וגיבוי לילי.', minutes: 3, tone: 'skills',
    body: [
      { list: ['להציב את הצד הצר של האוהל מול כיוון הרוח.', 'לעגן את כל החבלים ולא רק את הפינות; יתדות ספייר זמינות.', 'להוריד את ה-Tarp או ההצללה כשהמשבים מתחזקים.', 'לבדוק אם יש מחסה טבעי באתר — ולהתרחק מעצים עם ענפים יבשים.'] },
      { p: 'כשהתחזית מראה משבים חזקים, שקלו לדחות את הלינה או לבחור אתר מוגן יותר.' },
    ] },
  { id: 'leave-no-trace', title: 'משאירים מקום נקי', blurb: 'עקרונות פשוטים לשמירה על השטח.', minutes: 2, tone: 'skills',
    body: [
      { list: ['מוציאים את כל האשפה איתנו — גם קליפות ושאריות.', 'מדליקים אש רק במקומות מותרים ובכלי מתאים, ומכבים במים עד הסוף.', 'לא קוטפים פרחים ולא מאכילים חיות בר.', 'נשארים על השבילים המסומנים.'] },
    ] },
  { id: 'trail-marks', title: 'קוראים סימוני שבילים', blurb: 'מה אומרים הפסים הצבעוניים על הסלעים.', minutes: 2, tone: 'skills',
    body: [
      { p: 'שבילים בישראל מסומנים בשלושה פסים: לבן, צבע, לבן. הצבע מבחין בין שבילים באותו אזור, ושביל ישראל מסומן בכתום, כחול ולבן.' },
      { list: ['סימון כפול אחד מעל השני מציין פנייה.', 'אם לא ראיתם סימון זמן רב — חוזרים לסימון האחרון.', 'צבעי הסימון של האפליקציה בהשראת השיטה הזו, לזיהוי קטגוריות.'] },
    ] },
  { id: 'emergency', title: 'מספרי חירום ומידע בשטח', blurb: 'מה לשמור בטלפון לפני היציאה.', minutes: 1, tone: 'safety',
    body: [
      { list: ['מד״א — 101', 'משטרה — 100', 'כבאות והצלה — 102', 'לשתף מיקום ותוכנית מסלול עם מישהו שלא יוצא לטיול.', 'סוללת גיבוי טעונה ותאורה לכל משתתף.'] },
    ] },
];
