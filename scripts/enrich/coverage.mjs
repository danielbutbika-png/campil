// Coverage report: places per region and category — curated catalogue vs. Wikidata — and the gaps.
// Usage: node scripts/enrich/coverage.mjs [places.wd.json] > docs/data/COVERAGE.md
import { readFileSync } from 'node:fs';
const wd = JSON.parse(readFileSync(process.argv[2] || 'src/data/places.wd.json', 'utf8'));
const src = readFileSync('src/data/sites.ts', 'utf8');
const regions = [...readFileSync('src/data/regions.ts', 'utf8').matchAll(/\{ id: '(\w+)', name: '([^']+)'/g)].map(m => ({ id: m[1], name: m[2] }));
const cur = [...src.matchAll(/id: '([^']+)', name: '([^']+)', region: '(\w+)', type: '(\w+)'/g)].map(m => ({ id: m[1], name: m[2], region: m[3], type: m[4] }));
const CAT_HE = { nature_reserve: 'שמורות טבע', national_park: 'גנים לאומיים', spring: 'מעיינות', waterfall: 'מפלים', stream: 'נחלים', lake: 'אגמים ומאגרים', beach: 'חופים', cave: 'מערות', viewpoint: 'תצפיות', archaeological: 'אתרים ארכיאולוגיים', castle: 'מבצרים', forest: 'יערות', park: 'פארקים', campsite: 'חניוני לינה', trail: 'שבילים', visitor_center: 'מרכזי מבקרים', observatory: 'תצפית כוכבים', zoo: 'גני חיות', peak: 'פסגות', botanical: 'גנים בוטניים' };
const cats = Object.keys(CAT_HE);
const good = p => !!p.hewiki; // "quality" = has a Hebrew Wikipedia article (a description we can show, with a source)
const L = [];
L.push(`# כיסוי מקומות לפי אזורים וקטגוריות`, '', `נוצר אוטומטית ${new Date().toISOString().slice(0, 10)} · מקור: Wikidata (${wd.fetchedAt.slice(0, 10)}), הקטלוג של CampIL.`, '');
L.push(`**קטלוג CampIL (מקומות שנבחרו ידנית):** ${cur.length} מקומות, 0 מאומתים מול המפעיל.`, `**Wikidata בתוך אזורי האפליקציה:** ${wd.count} מקומות; ${wd.places.filter(good).length} עם ערך בוויקיפדיה העברית; ${wd.places.filter(p => p.image).length} עם תמונה ברישיון חופשי.`, '');
L.push('## לפי אזור', '', '| אזור | בקטלוג | ב-Wikidata | עם ערך בוויקיפדיה | עם תמונה חופשית | עם אתר רשמי | קטגוריות חסרות (0 מקומות איכותיים) |', '|---|---|---|---|---|---|---|');
for (const r of regions) {
  const w = wd.places.filter(p => p.region === r.id);
  const missing = cats.filter(c => !w.some(p => p.cats.includes(c) && good(p))).map(c => CAT_HE[c]);
  L.push(`| ${r.name} | ${cur.filter(c => c.region === r.id).length} | ${w.length} | ${w.filter(good).length} | ${w.filter(p => p.image).length} | ${w.filter(p => p.web).length} | ${missing.join(', ') || '—'} |`);
}
L.push('', '## לפי קטגוריה (מקומות עם ערך בוויקיפדיה)', '', `| קטגוריה | ${regions.map(r => r.name.split(' ')[0]).join(' | ')} | סה״כ |`, `|---|${regions.map(() => '---').join('|')}|---|`);
for (const c of cats) { const row = regions.map(r => wd.places.filter(p => p.region === r.id && p.cats.includes(c) && good(p)).length); L.push(`| ${CAT_HE[c]} | ${row.join(' | ')} | ${row.reduce((a, b) => a + b, 0)} |`); }
const thin = regions.filter(r => wd.places.filter(p => p.region === r.id && good(p)).length < 15).map(r => r.name);
L.push('', '## אזורים בכיסוי דל (פחות מ-15 מקומות עם ערך)', '', thin.length ? thin.map(x => `- ${x}`).join('\n') : '—', '');
L.push('## מה "מאומת" אומר כאן', '', '- **מזהה מקור:** כל מקום מ-Wikidata נושא מזהה (Q…) — שם, מיקום וקטגוריה ניתנים לבדיקה.', '- **לא מאומת מול המפעיל:** שעות, מחירים, מתקנים, הזמנה וסגירות — לא נלקחים מכאן, ומוצגים "לא ידוע" עד בדיקה באתר הרשמי.', '- **תמונות:** רק ברישיון חופשי (CC0 / CC BY / CC BY-SA / נחלת הכלל) עם קרדיט ליוצר.', '');
console.log(L.join('\n'));
