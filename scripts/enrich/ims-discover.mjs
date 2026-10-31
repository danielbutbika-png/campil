// One-off: read the IMS RSS page controller to learn where feed paths come from, then try the warning feeds.
import { writeFileSync } from 'node:fs';
const UA = 'CampIL-data-refresh/1.0 (https://github.com/danielbutbika-png/campil)';
const out = [];
const get = async u => { try { const r = await fetch(u, { headers: { 'User-Agent': UA } }); return { status: r.status, type: r.headers.get('content-type'), cors: r.headers.get('access-control-allow-origin'), text: await r.text() }; } catch (e) { return { status: 0, text: String(e) }; } };
const ctl = await get('https://ims.gov.il/themes/imst/js/app/pages/rss/rss.controller.js?v=13102026');
out.push('## rss.controller.js ' + ctl.status, ctl.text.slice(0, 6000));
const urls = [...new Set([...ctl.text.matchAll(/["'`](\/?[a-z_\/]*(?:api|rss|json)[^"'`\s]*)["'`]/gi)].map(m => m[1]))];
out.push('## candidate urls', ...urls);
for (const u of urls.slice(0, 10)) { const full = u.startsWith('http') ? u : 'https://ims.gov.il' + (u.startsWith('/') ? '' : '/') + u; const r = await get(full); out.push(`TRY ${full} → ${r.status} ${r.type} cors=${r.cors}`, r.text.slice(0, 3000)); }
writeFileSync('/tmp/IMS.md', out.join('\n'));
