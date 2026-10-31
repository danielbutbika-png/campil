// Coverage report over the merged place list: the 30 categories of the product brief × the app's 13 regions.
// Usage: node scripts/enrich/coverage.mjs public/data/places.json > docs/data/COVERAGE.md
import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync(process.argv[2] || 'public/data/places.json', 'utf8'));
const P = d.places;
const regions = [...readFileSync('src/data/regions.ts', 'utf8').matchAll(/\{ id: '(\w+)', name: '([^']+)', short: '([^']+)'/g)].map(m => ({ id: m[1], name: m[2], short: m[3] }));
const curated = [...readFileSync('src/data/sites.ts', 'utf8').matchAll(/region: '(\w+)'/g)].map(m => m[1]);
const has = (...c) => p => p.c.some(x => c.includes(x));
const kinneret = p => p.lat > 32.7 && p.lat < 32.9 && p.lon > 35.5 && p.lon < 35.66;
// the brief's categories → what the sources can actually tell; null = no open source has this (shown as a gap)
const CATS = [
  ['שמורות טבע', has('nature_reserve')], ['גנים לאומיים', has('national_park')], ['מסלולי טיול רגליים', has('trail')],
  ['מסלולים משפחתיים קלים', null], ['מסלולים נגישים', p => p.fac?.wheelchair === 'yes'], ['מסלולי מים', null],
  ['מעיינות ונחלים', has('spring', 'stream')], ['מפלים', has('waterfall')], ['אגמים ומאגרים', has('lake')],
  ['חופי ים', p => has('beach')(p) && !kinneret(p)], ['חופי כנרת', p => has('beach')(p) && kinneret(p)], ['תצפיות נוף', has('viewpoint')],
  ['פריחה עונתית', null], ['צפרות', has('birding')], ['אתרי טבע מיוחדים', null], ['מערות', has('cave')],
  ['מורשת והיסטוריה', p => has('castle')(p) || !!p.her], ['ארכיאולוגיה', has('archaeological')], ['פארקים ויערות', has('park', 'forest', 'botanical')],
  ['חניוני יום ופיקניק', has('picnic')], ['חניוני לילה בתשלום', p => has('campsite')(p) && p.fac?.fee === true], ['חניוני לילה ללא תשלום', p => has('campsite')(p) && p.fac?.fee === false],
  ['חניוני לילה — תשלום לא ידוע', p => has('campsite')(p) && p.fac?.fee === undefined], ['גלמפינג', null], ['חניוני קרוואנים', has('caravan')],
  ['אטרקציות משפחתיות', has('attraction', 'zoo')], ['מרכזי מבקרים', has('visitor_center')], ['מסלולי אופניים', has('bicycle')],
  ['מסלולי רכב מותרים', null], ['נקודות צילום', null], ['תצפית כוכבים', has('observatory')],
];
const rich = p => !!(p.wiki || p.img || p.fac || p.site); // something to show beyond a name and a pin
const L = [`# דוח כיסוי מקומות — CampIL`, '', `נוצר אוטומטית ${new Date().toISOString().slice(0, 10)} מתוך הנתונים שבאפליקציה.`, `מקורות: Wikidata (${(d.sources.wikidata || '').slice(0, 10)}), OpenStreetMap (${(d.sources.osm || '—').slice(0, 10)}), והקטלוג הידני של CampIL.`, ''];
L.push('## סיכום', '', `- **קטלוג ידני:** ${curated.length} מקומות (0 מאומתים מול המפעיל).`, `- **מאגר מורחב:** ${P.length} מקומות עם מזהה מקור; ${P.filter(p => p.wiki).length} עם ערך בוויקיפדיה; ${P.filter(p => p.img).length} עם תמונה ברישיון חופשי; ${P.filter(p => p.fac).length} עם מתקנים מסומנים ב-OSM; ${P.filter(p => p.web).length} עם אתר רשמי.`, `- **מידע לא מספק** (שם ומיקום בלבד): ${P.filter(p => !rich(p)).length}.`, `- **מאומת מול המפעיל (שעות, מחירים, סגירות):** 0 — מקורות פתוחים לא מספקים זאת באופן אמין. מוצג "לא אומת" עם קישור לאתר הרשמי.`, '');
L.push('## לפי אזור', '', '| אזור | קטלוג | במאגר | עם תוכן (ערך/תמונה/מתקנים) | מידע לא מספק | חניוני לינה | חופים | מעיינות ומפלים |', '|---|---|---|---|---|---|---|---|');
for (const r of regions) { const w = P.filter(p => p.r === r.id); L.push(`| ${r.name} | ${curated.filter(x => x === r.id).length} | ${w.length} | ${w.filter(rich).length} | ${w.filter(p => !rich(p)).length} | ${w.filter(has('campsite', 'caravan')).length} | ${w.filter(has('beach')).length} | ${w.filter(has('spring', 'waterfall')).length} |`); }
L.push('', '## 30 הקטגוריות × אזורים', '', `| קטגוריה | ${regions.map(r => r.short).join(' | ')} | סה״כ |`, `|---|${regions.map(() => '---:').join('|')}|---:|`);
for (const [name, f] of CATS) { if (!f) { L.push(`| ${name} | ${regions.map(() => '·').join(' | ')} | **אין מקור** |`); continue; } const row = regions.map(r => P.filter(p => p.r === r.id && f(p)).length); L.push(`| ${name} | ${row.map(n => (n ? n : '**0**')).join(' | ')} | ${row.reduce((a, b) => a + b, 0)} |`); }
L.push('', '## פערים', '');
const thin = regions.map(r => ({ r, n: P.filter(p => p.r === r.id && rich(p)).length })).filter(x => x.n < 15);
L.push(`- **אזורים עם פחות מ-15 מקומות בעלי תוכן:** ${thin.length ? thin.map(x => `${x.r.name} (${x.n})`).join(', ') : 'אין'}.`);
L.push(`- **קטגוריות שאין להן מקור פתוח אמין:** ${CATS.filter(c => !c[1]).map(c => c[0]).join(', ')}. לא ימולאו בניחוש — דורשות הזנה ידנית מאומתת או מקור רשמי.`);
for (const r of regions) { const miss = CATS.filter(c => c[1] && !P.some(p => p.r === r.id && c[1](p))).map(c => c[0]); if (miss.length) L.push(`- ${r.name} — אין: ${miss.join(', ')}`); }
console.log(L.join('\n'));
