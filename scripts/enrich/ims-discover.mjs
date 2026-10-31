// One-off: find where the IMS RSS page gets its feed paths (the page renders them with a template).
import { writeFileSync } from 'node:fs';
const UA = 'CampIL-data-refresh/1.0 (https://github.com/danielbutbika-png/campil)';
const out = [];
const get = async u => { try { const r = await fetch(u, { headers: { 'User-Agent': UA } }); return { status: r.status, type: r.headers.get('content-type'), cors: r.headers.get('access-control-allow-origin'), text: await r.text() }; } catch (e) { return { status: 0, text: String(e) }; } };
for (const page of ['https://ims.gov.il/en/RSS_ForecastAlerts', 'https://ims.gov.il/he/RSS_ForecastAlerts']) {
  const h = await get(page); out.push(`## ${page} ${h.status}`);
  const urls = [...new Set([...h.text.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]))];
  out.push(...urls.filter(u => /rss|alert|\.js|json|api/i.test(u)).slice(0, 80));
  for (const m of h.text.matchAll(/.{0,160}rss_data.{0,160}/g)) out.push('CTX ' + m[0]);
  for (const js of urls.filter(u => /\.js/.test(u)).slice(0, 25)) {
    const full = js.startsWith('http') ? js : 'https://ims.gov.il' + js; const j = await get(full);
    for (const m of j.text.matchAll(/.{0,200}(rss_data|rss|alert)[^"']{0,40}["'][^"']{0,120}.{0,80}/gi)) { out.push(`JS ${js}: ${m[0]}`); if (out.length > 600) break; }
  }
}
for (const u of ['https://ims.gov.il/en/rss_data', 'https://ims.gov.il/he/rss_data', 'https://ims.gov.il/en/api/rss', 'https://ims.gov.il/sites/default/files/ims_data/rss/alert/rssAlert_General_country_en.xml', 'https://ims.gov.il/sites/default/files/ims_data/rss/alert/rssAlert_General_country_he.xml']) {
  const r = await get(u); out.push(`TRY ${u} → ${r.status} ${r.type} cors=${r.cors} :: ${r.text.slice(0, 400).replace(/\s+/g, ' ')}`);
}
writeFileSync('/tmp/IMS.md', out.join('\n'));
console.log(out.length);
