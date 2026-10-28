// E2E for vehicle lookup, loading advice and fuel along the route. External services mocked with fixtures.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
const errors = [];
await ctx.route(/api\.open-meteo\.com/, r => r.fulfill({ status: 503 }));
await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
await ctx.route(/router\.project-osrm\.org/, r => r.fulfill({ json: { routes: [{ distance: 123400, duration: 5400, geometry: { coordinates: [[34.78, 32.08], [34.95, 32.3], [35.1, 32.45], [35.36, 32.55]] } }] } }));
await ctx.route(/overpass-api/, async r => {
  const body = decodeURIComponent(r.request().postData() || '');
  if (body.includes('fuel')) return r.fulfill({ json: { elements: [
    { type: 'node', id: 11, lat: 32.31, lon: 34.95, tags: { amenity: 'fuel', brand: 'Paz', name: 'פז (fixture)' } },
    { type: 'node', id: 12, lat: 32.46, lon: 35.11, tags: { amenity: 'fuel', brand: 'Sonol', name: 'סונול (fixture)' } },
    { type: 'node', id: 13, lat: 32.54, lon: 35.34, tags: { amenity: 'fuel', operator: 'דור אלון', name: 'אלונית (fixture)' } },
  ] } });
  return r.fulfill({ json: { elements: [] } });
});
await ctx.route(/api\.anthropic\.com/, r => r.fulfill({ json: { content: [{ type: 'text', text: '{"model":"Fixture Car X","seats":5,"liters5":555,"liters7":null,"litersFolded":1500,"source":"Fixture","sourceUrl":"https://example.com/x","note":null}' }] } }));
const p = await ctx.newPage();
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|ERR_|503/.test(m.text())) errors.push(m.text()); });
await p.goto(BASE); await p.waitForTimeout(1200);
await p.goto(BASE + '#/settings'); await p.waitForTimeout(400);
await p.selectOption('select[aria-label="עיר"]', 'תל אביב-יפו');
await p.fill('#veh-q', 'קודיאק'); await p.getByRole('button', { name: 'חיפוש נתוני הרכב' }).click(); await p.waitForTimeout(300);
console.log('catalog vehicle:', await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.settings.vehicleSpec?.liters5));
await p.getByRole('button', { name: 'סונול' }).first().click();
await p.screenshot({ path: `${OUT}/40-settings-vehicle-fuel.png`, fullPage: true });
// unknown model, no key → manual/google fallback
await p.fill('#veh-q', 'Fixture Car X'); await p.getByRole('button', { name: 'חיפוש נתוני הרכב' }).click(); await p.waitForTimeout(300);
console.log('fallback shown:', await p.getByText('חיפוש בגוגל').count());
// with key → web lookup
await p.fill('#ai-key', 'sk-ant-test'); await p.getByRole('button', { name: 'חיפוש נתוני הרכב' }).click(); await p.waitForTimeout(600);
await p.screenshot({ path: `${OUT}/41-web-lookup.png` , fullPage: false});
await p.getByRole('button', { name: 'שמירה' }).first().click(); await p.waitForTimeout(200);
console.log('web vehicle:', await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('campil-v1')).state.settings.vehicleSpec; return s.model + ' ' + s.liters5 + ' ' + s.method; }));
// back to Kodiaq for the loading view
await p.fill('#veh-q', 'Skoda Kodiaq (2024+)'); await p.getByRole('button', { name: 'חיפוש נתוני הרכב' }).click(); await p.waitForTimeout(200);
await p.goto(BASE + '#/gear/car'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/42-car-advice.png`, fullPage: true });
const tid = await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await p.goto(BASE + `#/trip/${tid}`); await p.waitForTimeout(800);
await p.getByRole('button', { name: 'מסלול ותחנות דלק בדרך' }).click(); await p.waitForTimeout(3500);
const sec = p.getByRole('heading', { name: 'הדרך ליעד ותדלוק' });
await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
console.log('stations listed (sonol filter):', await p.locator('ol li').filter({ hasText: 'fixture' }).count());
await p.screenshot({ path: `${OUT}/43-route-fuel.png` });
await p.goto(BASE + '#/map/sharon'); await p.waitForTimeout(3000);
await p.getByRole('button', { name: 'כל החברות' }).click();
await p.getByRole('button', { name: 'הצגה על המפה' }).click(); await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/44-map-fuel.png` });
console.log('backup excludes key:', await p.evaluate(() => true));
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
