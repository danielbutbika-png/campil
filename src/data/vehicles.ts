// Trunk volumes for vehicles common in Israel. Every value was read from the cited review/spec page on 2026-10-22.
// Figures are the manufacturer-quoted volumes reported for the UK/EU market; Israeli trims can differ slightly.
// liters5 = luggage space with all passenger seats up (for 7-seaters: third row folded, i.e. 5-seat mode).
export interface VehicleSpec {
  id: string; model: string; aliases: string[]; seats: 5 | 7;
  liters5: number; liters7?: number | null; litersFolded?: number;
  note?: string; sourceUrl: string; source: string; checkedAt: string;
  method: 'catalog' | 'web' | 'manual';
}
const D = '2026-10-22';
const v = (x: Omit<VehicleSpec, 'checkedAt' | 'method'>): VehicleSpec => ({ ...x, checkedAt: D, method: 'catalog' });

export const VEHICLES: VehicleSpec[] = [
  v({ id: 'tucson-hev', model: 'Hyundai Tucson Hybrid', aliases: ['טוסון', 'tucson'], seats: 5, liters5: 616, litersFolded: 1795, source: 'DrivingElectric', sourceUrl: 'https://www.drivingelectric.com/hyundai/tucson/practicality' }),
  v({ id: 'sportage', model: 'Kia Sportage (mild-hybrid)', aliases: ['ספורטאז׳', "ספורטאז'", 'sportage'], seats: 5, liters5: 526, litersFolded: 1776, note: 'פלאג-אין: 540 ל׳ לפי אותו מקור', source: 'Carbuyer', sourceUrl: 'https://www.carbuyer.co.uk/kia/sportage/303712/kia-sportage-suv-review/practicality' }),
  v({ id: 'corolla-cross', model: 'Toyota Corolla Cross Hybrid', aliases: ['קורולה קרוס', 'corolla cross'], seats: 5, liters5: 390, litersFolded: 1337, note: 'כולל גלגל חלופי', source: 'Irish Farmers Journal', sourceUrl: 'https://www.farmersjournal.ie/machinery/motors/corolla-cross-completes-toyota-s-suv-range-with-practicality-775885' }),
  v({ id: 'rav4-hev', model: 'Toyota RAV4 Hybrid', aliases: ['ראב 4', 'rav4', 'ראב4'], seats: 5, liters5: 580, litersFolded: 1690, source: 'DrivingElectric', sourceUrl: 'https://www.drivingelectric.com/toyota/rav4/practicality' }),
  v({ id: 'kodiaq-2024', model: 'Skoda Kodiaq (2024+)', aliases: ['קודיאק', 'kodiaq'], seats: 7, liters5: 910, liters7: 340, litersFolded: 2105, note: 'גרסת 7 מושבים: 845 ל׳ כשהשורה השלישית מקופלת', source: 'CarThrottle', sourceUrl: 'https://www.carthrottle.com/news/2024-skoda-kodiaq-here-910-litre-boot' }),
  v({ id: 'karoq', model: 'Skoda Karoq', aliases: ['קארוק', 'karoq'], seats: 5, liters5: 521, litersFolded: 1605, note: 'עם VarioFlex: 479–588 ל׳', source: 'Carbuyer', sourceUrl: 'https://www.carbuyer.co.uk/skoda/karoq/practicality' }),
  v({ id: 'octavia-estate', model: 'Skoda Octavia Estate (2024)', aliases: ['אוקטביה סטיישן', 'octavia'], seats: 5, liters5: 640, litersFolded: 1700, source: 'Carbuyer', sourceUrl: 'https://carbuyer.co.uk/skoda/octavia/octavia-estate/practicality' }),
  v({ id: 'model-y', model: 'Tesla Model Y', aliases: ['טסלה', 'model y', 'מודל y'], seats: 5, liters5: 890, litersFolded: 2138, note: 'לפי המקור; הנפח הכולל עם מושבים מקופלים כולל את התא הקדמי', source: 'DrivingElectric', sourceUrl: 'https://www.drivingelectric.com/tesla/model-y/practicality' }),
  v({ id: 'outlander-phev', model: 'Mitsubishi Outlander PHEV', aliases: ['אאוטלנדר', 'outlander'], seats: 5, liters5: 495, litersFolded: 1422, note: 'ערך מינימלי לפי המקור', source: 'Motor1', sourceUrl: 'https://www.motor1.com/news/741261/mitsubishi-outlander-dimensions-boot-space/' }),
  v({ id: 'ioniq5', model: 'Hyundai Ioniq 5', aliases: ['איוניק 5', 'ioniq 5'], seats: 5, liters5: 527, litersFolded: 1587, source: 'DrivingElectric', sourceUrl: 'https://www.drivingelectric.com/hyundai/ioniq-5/boot-space' }),
  v({ id: 'atto3', model: 'BYD Atto 3', aliases: ['אטו 3', 'atto 3', 'byd'], seats: 5, liters5: 490, litersFolded: 1360, note: 'גרסת Evo לפי המקור', source: 'Auto Express', sourceUrl: 'https://autoexpress.co.uk/byd/atto-3/practicality' }),
  v({ id: 'cx5', model: 'Mazda CX-5', aliases: ['cx-5', 'cx5', 'מאזדה'], seats: 5, liters5: 522, litersFolded: 1620, source: 'Carbuyer', sourceUrl: 'https://www.carbuyer.co.uk/mazda/cx-5/practicality' }),
  v({ id: 'sorento-hev', model: 'Kia Sorento Hybrid', aliases: ['סורנטו', 'sorento'], seats: 7, liters5: 608, liters7: null, litersFolded: 1996, note: 'נפח עם 7 מושבים לא פורסם במקור', source: 'Carbuyer', sourceUrl: 'https://www.carbuyer.co.uk/kia/sorento/practicality' }),
  v({ id: 'santafe-2024', model: 'Hyundai Santa Fe Hybrid (2024+)', aliases: ['סנטה פה', 'santa fe'], seats: 7, liters5: 628, liters7: null, litersFolded: 1949, note: 'היצרן לא מפרסם נפח עם 7 מושבים', source: 'Auto Express', sourceUrl: 'https://www.autoexpress.co.uk/hyundai/santa-fe/practicality' }),
  v({ id: 'mg-zs', model: 'MG ZS Hybrid+ (2024)', aliases: ['zs', 'אם ג׳י', 'mg'], seats: 5, liters5: 443, litersFolded: 1298, source: 'Carbuyer', sourceUrl: 'https://carbuyer.co.uk/mg/zs/306244/mg-zs-review-boot-space-practicality-dimensions' }),
  v({ id: 'niro-hev-1', model: 'Kia Niro Hybrid (2016–2022)', aliases: ['נירו', 'niro'], seats: 5, liters5: 382, litersFolded: 1425, source: 'DrivingElectric', sourceUrl: 'https://www.drivingelectric.com/kia/niro/practicality' }),
];

export function findVehicle(q: string): VehicleSpec | null {
  const s = q.trim().toLowerCase(); if (!s) return null;
  return VEHICLES.find(v => v.model.toLowerCase() === s) ?? VEHICLES.find(v => v.model.toLowerCase().includes(s) || v.aliases.some(a => s.includes(a.toLowerCase()))) ?? null;
}
export const googleSearchURL = (model: string) => `https://www.google.com/search?q=${encodeURIComponent(`${model} נפח תא מטען ליטר`)}`;
