import type { Site, Interest, RegionId } from '../lib/types';

// Curated starter catalogue. Names, locations and general character come from public, widely known
// information. Prices, opening hours, facilities and booking terms are intentionally NOT stated —
// every card links to the operator's official site for verification. `verified: false` is shown in the UI.
const RTG = 'https://www.parks.org.il';
const KKL = 'https://www.kkl.org.il';
const NOTE = 'קטלוג התחלתי של CampIL. מיקום ואופי כללי בלבד — מתקנים, מחירים, שעות וסגירות יש לבדוק באתר המפעיל לפני היציאה.';

type S = Omit<Site, 'verified' | 'sourceNote'> & Partial<Pick<Site, 'verified' | 'sourceNote'>>;
const s = (x: S): Site => ({ verified: false, sourceNote: NOTE, stroller: 'unknown', pets: 'unknown', ...x });
const t = (...x: Interest[]) => x;

export const SITES: Site[] = [
  // רמת הגולן
  s({ id: 'banias', name: 'שמורת הבניאס', region: 'golan', type: 'trail', lat: 33.248, lon: 35.694, operator: 'rtg', officialUrl: RTG,
    desc: 'מעיין שופע, מפל גדול ושביל תלוי מעל הנחל לצד שרידים עתיקים.', tags: t('water', 'family', 'hiking', 'history'), difficulty: 'easy', family: true, season: 'כל השנה' }),
  s({ id: 'gamla', name: 'שמורת גמלא', region: 'golan', type: 'viewpoint', lat: 32.904, lon: 35.744, operator: 'rtg', officialUrl: RTG,
    desc: 'עיר עתיקה על רכס תלול, תצפית עופות דורסים ומפל גבוה.', tags: t('views', 'history', 'hiking'), difficulty: 'moderate', season: 'אביב, סתיו' }),
  s({ id: 'bental', name: 'הר בנטל', region: 'golan', type: 'viewpoint', lat: 33.127, lon: 35.785, operator: 'other', officialUrl: 'https://www.golan.org.il',
    desc: 'תצפית רחבה על החרמון ועמק הבכא, מגיעים ברכב עד הפסגה.', tags: t('views', 'family', 'accessible'), difficulty: 'easy', family: true, season: 'כל השנה' }),
  s({ id: 'nimrod', name: 'מבצר נמרוד', region: 'golan', type: 'attraction', lat: 33.252, lon: 35.714, operator: 'rtg', officialUrl: RTG,
    desc: 'מבצר ימי-ביניימי גדול על שלוחת החרמון עם נוף לעמק החולה.', tags: t('history', 'views', 'family', 'kids'), family: true, season: 'כל השנה' }),
  s({ id: 'yehudiya', name: 'שמורת יהודיה', region: 'golan', type: 'trail', lat: 32.94, lon: 35.71, operator: 'rtg', officialUrl: RTG,
    desc: 'קניוני בזלת ובריכות שחייה. חלק מהמסלולים כוללים סולמות וקטעי שחייה.', tags: t('water', 'hiking'), difficulty: 'hard', exposed: true, floodRisk: true, season: 'קיץ, סתיו' }),
  // אצבע הגליל
  s({ id: 'tel-dan', name: 'שמורת תל דן', region: 'hula', type: 'trail', lat: 33.248, lon: 35.651, operator: 'rtg', officialUrl: RTG,
    desc: 'מקור הירדן הגדול, יער לח וצל עבות ושער כנעני עתיק.', tags: t('water', 'family', 'kids', 'forest', 'history'), difficulty: 'easy', family: true, stroller: 'partial', season: 'כל השנה' }),
  s({ id: 'agamon', name: 'אגמון החולה', region: 'hula', type: 'park', lat: 33.104, lon: 35.607, operator: 'kkl', officialUrl: KKL,
    desc: 'אגם רדוד ושביל מעגלי שטוח לרכיבה והליכה. שיא הצפרות בחורף.', tags: t('family', 'kids', 'accessible', 'water'), difficulty: 'easy', family: true, stroller: 'yes', season: 'סתיו, חורף' }),
  s({ id: 'iyon', name: 'שמורת נחל עיון', region: 'hula', type: 'trail', lat: 33.258, lon: 35.578, operator: 'rtg', officialUrl: RTG,
    desc: 'ארבעה מפלים בקניון ירוק, מפל התנור בקצה המסלול.', tags: t('water', 'hiking', 'family'), difficulty: 'moderate', season: 'חורף, אביב' }),
  s({ id: 'hurshat-tal', name: 'חורשת טל', region: 'hula', type: 'campsite', lat: 33.218, lon: 35.632, operator: 'rtg', officialUrl: RTG,
    desc: 'חורשת אלונים עתיקה ובריכת מים קרים מנחל דן. אתר קמפינג ותיק ומוכר.', tags: t('camping', 'water', 'family', 'kids', 'picnic'), lodging: true, family: true, season: 'קיץ' }),
  // גליל עליון ומערבי
  s({ id: 'kziv', name: 'נחל כזיב ומבצר מונפור', region: 'upper_galilee', type: 'trail', lat: 33.044, lon: 35.226, operator: 'rtg', officialUrl: RTG,
    desc: 'נחל איתן בצל עצי דולב ומבצר צלבני מעל הערוץ.', tags: t('water', 'hiking', 'history', 'forest'), difficulty: 'moderate', season: 'אביב, קיץ, סתיו' }),
  s({ id: 'meron', name: 'שביל הפסגה בהר מירון', region: 'upper_galilee', type: 'trail', lat: 32.997, lon: 35.408, operator: 'rtg', officialUrl: RTG,
    desc: 'מסלול מעגלי סביב פסגת ההר הגבוה בגליל, יער ותצפיות לכל הכיוונים.', tags: t('views', 'forest', 'hiking', 'family'), difficulty: 'easy', family: true, season: 'אביב, סתיו' }),
  s({ id: 'amud', name: 'נחל עמוד', region: 'upper_galilee', type: 'trail', lat: 32.95, lon: 35.51, operator: 'rtg', officialUrl: RTG,
    desc: 'נחל עם גבים, טחנות קמח ועמוד סלע נישא.', tags: t('water', 'hiking'), difficulty: 'moderate', season: 'אביב, סתיו' }),
  s({ id: 'rosh-hanikra', name: 'ראש הנקרה', region: 'upper_galilee', type: 'attraction', lat: 33.093, lon: 35.105, operator: 'other', officialUrl: 'https://www.rosh-hanikra.com',
    desc: 'נקרות ים בצוק הגיר הלבן, מגיעים ברכבל.', tags: t('views', 'family', 'kids', 'beach'), family: true, season: 'כל השנה' }),
  s({ id: 'achziv', name: 'גן לאומי אכזיב', region: 'upper_galilee', type: 'beach', lat: 33.05, lon: 35.102, operator: 'rtg', officialUrl: RTG,
    desc: 'מפרצונים רדודים, בריכות גלים ודשאים מול הים.', tags: t('beach', 'family', 'kids', 'camping', 'picnic'), family: true, lodging: true, season: 'קיץ' }),
  // גליל תחתון ועמקים
  s({ id: 'harod', name: 'מעיין חרוד', region: 'lower_galilee', type: 'campsite', lat: 32.55, lon: 35.357, operator: 'rtg', officialUrl: RTG,
    desc: 'מעיין למרגלות הגלבוע, מדשאות גדולות וצל. מוכר כאתר קמפינג משפחתי.', tags: t('camping', 'family', 'kids', 'water', 'picnic'), lodging: true, family: true, season: 'אביב, סתיו' }),
  s({ id: 'sachne', name: 'גן השלושה (הסחנה)', region: 'lower_galilee', type: 'park', lat: 32.505, lon: 35.443, operator: 'rtg', officialUrl: RTG,
    desc: 'בריכות מים נובעים בטמפרטורה נעימה כל השנה ומדשאות רחבות.', tags: t('water', 'family', 'kids', 'picnic'), family: true, season: 'כל השנה' }),
  s({ id: 'beit-shean', name: 'גן לאומי בית שאן', region: 'lower_galilee', type: 'attraction', lat: 32.504, lon: 35.502, operator: 'rtg', officialUrl: RTG,
    desc: 'עיר רומית-ביזנטית עם רחוב עמודים ותיאטרון גדול.', tags: t('history', 'family'), family: true, exposed: true, season: 'חורף, אביב' }),
  s({ id: 'tavor', name: 'הר תבור', region: 'lower_galilee', type: 'viewpoint', lat: 32.687, lon: 35.39, operator: 'other', officialUrl: 'https://www.parks.org.il',
    desc: 'הר בודד מעל העמק, דרך מתפתלת ושביל עלייה רגלי.', tags: t('views', 'hiking'), difficulty: 'moderate', season: 'אביב, סתיו' }),
  s({ id: 'arbel', name: 'גן לאומי ארבל', region: 'lower_galilee', type: 'viewpoint', lat: 32.82, lon: 35.5, operator: 'rtg', officialUrl: RTG,
    desc: 'מצוק מעל הכנרת, תצפית מרהיבה וירידה תלולה עם יתדות למיטיבי לכת.', tags: t('views', 'hiking'), difficulty: 'hard', exposed: true, season: 'חורף, אביב' }),
  s({ id: 'tzipori', name: 'גן לאומי ציפורי', region: 'lower_galilee', type: 'attraction', lat: 32.752, lon: 35.28, operator: 'rtg', officialUrl: RTG,
    desc: 'פסיפסים מפורסמים ומערכת מים עתיקה.', tags: t('history', 'family'), family: true, season: 'כל השנה' }),
  // כרמל
  s({ id: 'mearot', name: 'שמורת נחל מערות', region: 'carmel', type: 'attraction', lat: 32.668, lon: 34.966, operator: 'rtg', officialUrl: RTG,
    desc: 'מערות פרהיסטוריות באתר מורשת עולמית, שבילים קצרים ומוצלים חלקית.', tags: t('history', 'family', 'kids', 'hiking'), difficulty: 'easy', family: true, season: 'כל השנה' }),
  s({ id: 'muhraka', name: 'המוחרקה', region: 'carmel', type: 'viewpoint', lat: 32.664, lon: 35.084, operator: 'other', officialUrl: KKL,
    desc: 'פסגה ברכס הכרמל עם תצפית לעמק יזרעאל ויער סביב.', tags: t('views', 'forest', 'picnic'), season: 'כל השנה' }),
  s({ id: 'dor', name: 'חוף דור (הבונים)', region: 'carmel', type: 'beach', lat: 32.62, lon: 34.92, operator: 'rtg', officialUrl: RTG,
    desc: 'מפרצי כורכר, איים קטנים ושביל חוף נאה.', tags: t('beach', 'family', 'kids', 'hiking'), family: true, season: 'קיץ, אביב' }),
  s({ id: 'ramat-hanadiv', name: 'רמת הנדיב', region: 'carmel', type: 'park', lat: 32.555, lon: 34.947, operator: 'other', officialUrl: 'https://www.ramat-hanadiv.org.il',
    desc: 'גני זיכרון מטופחים ושבילי טבע מסומנים, חלקם נגישים.', tags: t('family', 'accessible', 'kids', 'hiking'), family: true, stroller: 'yes', season: 'כל השנה' }),
  // שרון
  s({ id: 'alexander', name: 'נחל אלכסנדר — גשר הצבים', region: 'sharon', type: 'park', lat: 32.398, lon: 34.874, operator: 'rtg', officialUrl: RTG,
    desc: 'צבי ים רכים בנחל, שביל לאורך הגדה וגן לאומי בקרבת מקום.', tags: t('family', 'kids', 'water', 'accessible'), family: true, season: 'כל השנה' }),
  s({ id: 'beit-yanai', name: 'חוף בית ינאי', region: 'sharon', type: 'beach', lat: 32.383, lon: 34.862, operator: 'rtg', officialUrl: RTG,
    desc: 'חוף רחב בשפך נחל אלכסנדר. מוכר כאתר לינה חופי — לאמת באתר.', tags: t('beach', 'camping', 'family'), lodging: true, family: true, season: 'קיץ' }),
  s({ id: 'caesarea', name: 'גן לאומי קיסריה', region: 'sharon', type: 'attraction', lat: 32.5, lon: 34.892, operator: 'rtg', officialUrl: RTG,
    desc: 'נמל הורדוס, תיאטרון והיפודרום על שפת הים.', tags: t('history', 'beach', 'family'), family: true, season: 'כל השנה' }),
  s({ id: 'apollonia', name: 'גן לאומי אפולוניה', region: 'sharon', type: 'viewpoint', lat: 32.194, lon: 34.807, operator: 'rtg', officialUrl: RTG,
    desc: 'מבצר צלבני על מצוק כורכר מעל הים.', tags: t('history', 'views'), season: 'כל השנה' }),
  // מרכז ושפלה
  s({ id: 'yarkon-springs', name: 'מקורות הירקון — תל אפק', region: 'center', type: 'park', lat: 32.105, lon: 34.93, operator: 'rtg', officialUrl: RTG,
    desc: 'אגם, מדשאות ומצודה עות׳מאנית ליד מקורות הנחל.', tags: t('family', 'kids', 'water', 'picnic', 'accessible'), family: true, stroller: 'yes', season: 'כל השנה' }),
  s({ id: 'beit-guvrin', name: 'בית גוברין–מרשה', region: 'center', type: 'attraction', lat: 31.6, lon: 34.9, operator: 'rtg', officialUrl: RTG,
    desc: 'מערות פעמון חצובות ועיר תת-קרקעית בגבעות השפלה.', tags: t('history', 'family', 'kids'), family: true, season: 'כל השנה' }),
  s({ id: 'ashkelon', name: 'גן לאומי אשקלון', region: 'center', type: 'beach', lat: 31.67, lon: 34.55, operator: 'rtg', officialUrl: RTG,
    desc: 'עתיקות על חוף הים, מדשאות ושער כנעני.', tags: t('beach', 'history', 'family', 'picnic'), family: true, season: 'אביב, סתיו' }),
  s({ id: 'palmachim', name: 'חוף פלמחים', region: 'center', type: 'beach', lat: 31.93, lon: 34.7, operator: 'rtg', officialUrl: RTG,
    desc: 'מצוקי כורכר ודיונות. חלק מהחוף בשמורה.', tags: t('beach', 'views'), season: 'קיץ' }),
  // ירושלים והרי יהודה
  s({ id: 'ein-hemed', name: 'גן לאומי עין חמד', region: 'jerusalem', type: 'park', lat: 31.796, lon: 35.126, operator: 'rtg', officialUrl: RTG,
    desc: 'נחל קטן, מבנה צלבני ודשאים מוצלים — מתאים לפיקניק משפחתי.', tags: t('picnic', 'family', 'kids', 'water'), family: true, season: 'כל השנה' }),
  s({ id: 'sataf', name: 'סטף', region: 'jerusalem', type: 'trail', lat: 31.77, lon: 35.13, operator: 'kkl', officialUrl: KKL,
    desc: 'מעיינות וטרסות חקלאיות משוחזרות על מדרון מיוער.', tags: t('water', 'hiking', 'forest', 'views'), difficulty: 'moderate', season: 'אביב, סתיו' }),
  s({ id: 'soreq-cave', name: 'מערת הנטיפים (אבשלום)', region: 'jerusalem', type: 'attraction', lat: 31.756, lon: 35.021, operator: 'rtg', officialUrl: RTG,
    desc: 'מערת נטיפים צפופה עם שביל מוסדר. טמפרטורה קבועה בתוך המערה.', tags: t('family', 'kids'), family: true, season: 'כל השנה' }),
  // מדבר יהודה וים המלח
  s({ id: 'ein-gedi', name: 'עין גדי — נחל דוד', region: 'judean_desert', type: 'trail', lat: 31.467, lon: 35.388, operator: 'rtg', officialUrl: RTG,
    desc: 'נווה מדבר עם מפלים ובריכות, יעלים ושפנים לאורך השביל.', tags: t('water', 'family', 'kids', 'hiking', 'desert'), difficulty: 'easy', family: true, floodRisk: true, season: 'חורף, אביב, סתיו' }),
  s({ id: 'arugot', name: 'נחל ערוגות', region: 'judean_desert', type: 'trail', lat: 31.45, lon: 35.38, operator: 'rtg', officialUrl: RTG,
    desc: 'ערוץ מים רחב יותר מנחל דוד, מוביל לבריכה המכונה "הבריכה הנסתרת".', tags: t('water', 'hiking', 'desert'), difficulty: 'moderate', floodRisk: true, season: 'חורף, אביב' }),
  s({ id: 'masada', name: 'מצדה', region: 'judean_desert', type: 'attraction', lat: 31.316, lon: 35.354, operator: 'rtg', officialUrl: RTG,
    desc: 'מבצר הורדוס על צוק מבודד. עלייה ברכבל או בשביל הנחש.', tags: t('history', 'views', 'hiking', 'desert'), difficulty: 'hard', exposed: true, season: 'חורף, סתיו' }),
  s({ id: 'masada-west', name: 'מצדה מערב — אזור לינה', region: 'judean_desert', type: 'campsite', lat: 31.312, lon: 35.345, operator: 'rtg', officialUrl: RTG,
    desc: 'לינת שטח בצד המערבי של מצדה, נקודת מוצא לזריחה בשביל הסוללה.', tags: t('camping', 'desert', 'views'), lodging: true, exposed: true, season: 'חורף, סתיו' }),
  s({ id: 'ein-bokek', name: 'חוף עין בוקק', region: 'judean_desert', type: 'beach', lat: 31.2, lon: 35.363, operator: 'municipal', officialUrl: 'https://www.deadsea.co.il',
    desc: 'רחצה בים המלח בחוף מוסדר באזור המלונות.', tags: t('beach', 'family', 'accessible'), family: true, season: 'חורף, אביב, סתיו' }),
  // צפון הנגב
  s({ id: 'lahav', name: 'יער להב', region: 'north_negev', type: 'park', lat: 31.385, lon: 34.87, operator: 'kkl', officialUrl: KKL,
    desc: 'יער נטע אדם בספר המדבר, שבילים קלים וחניוני יום.', tags: t('forest', 'picnic', 'family'), family: true, season: 'חורף, אביב' }),
  s({ id: 'tel-beer-sheva', name: 'תל באר שבע', region: 'north_negev', type: 'attraction', lat: 31.245, lon: 34.84, operator: 'rtg', officialUrl: RTG,
    desc: 'עיר מקראית עם מערכת מים חצובה, אתר מורשת עולמית.', tags: t('history', 'family'), family: true, exposed: true, season: 'חורף, אביב' }),
  s({ id: 'yatir', name: 'יער יתיר', region: 'north_negev', type: 'park', lat: 31.36, lon: 35.05, operator: 'kkl', officialUrl: KKL,
    desc: 'היער הנטוע הגדול בישראל, על גבול המדבר.', tags: t('forest', 'picnic', 'hiking'), season: 'חורף, אביב' }),
  s({ id: 'eshkol', name: 'פארק אשכול', region: 'north_negev', type: 'park', lat: 31.29, lon: 34.41, operator: 'rtg', officialUrl: RTG,
    desc: 'מעיין בנחל הבשור, מדשאות ופריחת כלניות בחורף באזור.', tags: t('family', 'picnic', 'water'), family: true, season: 'חורף' }),
  // מכתש רמון ומרכז הנגב
  s({ id: 'ramon-visitor', name: 'מרכז המבקרים מכתש רמון', region: 'central_negev', type: 'viewpoint', lat: 30.61, lon: 34.8, operator: 'rtg', officialUrl: RTG,
    desc: 'תצפית על המכתש משפת המצוק במצפה רמון, טיילת לאורך השפה.', tags: t('views', 'family', 'accessible', 'desert'), family: true, season: 'כל השנה' }),
  s({ id: 'beerot', name: 'חניון בארותיים במכתש', region: 'central_negev', type: 'campsite', lat: 30.57, lon: 34.86, operator: 'rtg', officialUrl: RTG,
    desc: 'חניון לינה מדברי בלב המכתש, בסיס לטיולי יום ולשמי לילה כהים.', tags: t('camping', 'desert', 'family'), lodging: true, family: true, exposed: true, season: 'סתיו, אביב, חורף' }),
  s({ id: 'ein-avdat', name: 'עין עבדת', region: 'central_negev', type: 'trail', lat: 30.82, lon: 34.765, operator: 'rtg', officialUrl: RTG,
    desc: 'קניון לבן, גבים ומעיין מדברי.', tags: t('water', 'desert', 'hiking', 'family'), difficulty: 'moderate', floodRisk: true, season: 'סתיו, חורף, אביב' }),
  s({ id: 'avdat', name: 'גן לאומי עבדת', region: 'central_negev', type: 'attraction', lat: 30.794, lon: 34.773, operator: 'rtg', officialUrl: RTG,
    desc: 'עיר נבטית על דרך הבשמים, אתר מורשת עולמית.', tags: t('history', 'desert', 'views'), exposed: true, season: 'סתיו, חורף, אביב' }),
  s({ id: 'sde-boker', name: 'מדרשת בן-גוריון — תצפית צין', region: 'central_negev', type: 'viewpoint', lat: 30.85, lon: 34.785, operator: 'other', officialUrl: RTG,
    desc: 'תצפית מרשימה על קניון נחל צין.', tags: t('views', 'desert', 'family', 'accessible'), family: true, season: 'כל השנה' }),
  // ערבה
  s({ id: 'timna', name: 'פארק תמנע', region: 'arava', type: 'park', lat: 29.78, lon: 34.95, operator: 'other', officialUrl: 'https://www.parktimna.co.il',
    desc: 'עמודי שלמה, הפטרייה ואגם מלאכותי במדבר צבעוני.', tags: t('desert', 'family', 'kids', 'history', 'camping'), family: true, lodging: true, exposed: true, season: 'סתיו, חורף, אביב' }),
  s({ id: 'yotvata', name: 'חי-בר יטבתה', region: 'arava', type: 'attraction', lat: 29.88, lon: 35.04, operator: 'rtg', officialUrl: RTG,
    desc: 'שמורה להשבת חיות מדבר — ראמים, יענים ופראים.', tags: t('family', 'kids', 'desert'), family: true, season: 'סתיו, חורף, אביב' }),
  s({ id: 'sapir-park', name: 'פארק ספיר', region: 'arava', type: 'park', lat: 30.62, lon: 35.19, operator: 'other', officialUrl: 'https://www.arava.co.il',
    desc: 'אגם קטן ודשאים מוצלים בלב הערבה התיכונה.', tags: t('family', 'kids', 'picnic', 'water'), family: true, season: 'חורף, אביב' }),
  // אילת
  s({ id: 'coral-beach', name: 'שמורת חוף האלמוגים', region: 'eilat', type: 'beach', lat: 29.508, lon: 34.92, operator: 'rtg', officialUrl: RTG,
    desc: 'שונית אלמוגים צמודה לחוף, גשרונים לכניסה לשנורקלינג.', tags: t('beach', 'family', 'kids', 'water'), family: true, season: 'כל השנה' }),
  s({ id: 'red-canyon', name: 'הקניון האדום', region: 'eilat', type: 'trail', lat: 29.807, lon: 34.917, operator: 'rtg', officialUrl: RTG,
    desc: 'קניון צר ויפהפה בגווני אדום ולבן, מסלול קצר עם מאחזים.', tags: t('desert', 'hiking', 'family'), difficulty: 'moderate', floodRisk: true, exposed: true, season: 'סתיו, חורף, אביב' }),
  s({ id: 'tzfahot', name: 'הר צפחות', region: 'eilat', type: 'viewpoint', lat: 29.548, lon: 34.925, operator: 'other', officialUrl: RTG,
    desc: 'פסגה מעל אילת עם נוף לארבע מדינות ולמפרץ.', tags: t('views', 'hiking', 'desert'), difficulty: 'moderate', exposed: true, season: 'חורף, אביב' }),
];

export const SITE_BY_ID: Record<string, Site> = Object.fromEntries(SITES.map(x => [x.id, x]));
export const sitesIn = (r: RegionId) => SITES.filter(x => x.region === r);

export const SITE_TYPE_LABEL: Record<Site['type'], string> = {
  trail: 'מסלול', campsite: 'לינה / חניון', attraction: 'אתר', beach: 'חוף', viewpoint: 'תצפית', spring: 'מעיין', park: 'פארק',
};

export const navLinks = (lat: number, lon: number) => ({
  waze: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`,
  google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
});
