// Official weather warnings from the Israel Meteorological Service (IMS) RSS feeds → one JSON file the app reads.
// IMS terms (ims.gov.il/sites/default/files/docs/terms_use.pdf): reuse allowed with a prominent credit to IMS;
// no guarantee of accuracy or continuity — so the file records when it was checked and which feeds failed,
// and the app says "could not check" instead of "no warnings" whenever the data is missing or old.
// The browser cannot read ims.gov.il directly (no CORS), so this runs in GitHub Actions.
// Usage: node ims.mjs <out.json> [more out paths…]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const UA = 'CampIL-alerts/1.0 (https://github.com/danielbutbika-png/campil; family trip planner)';
const BASE = 'https://ims.gov.il';
const outs = process.argv.slice(2); if (!outs.length) outs.push('/tmp/ims-alerts.json');
const get = async (u, kind = 'text') => { const r = await fetch(u, { headers: { 'User-Agent': UA } }); if (!r.ok) throw new Error(`${r.status} ${u}`); return kind === 'json' ? r.json() : r.text(); };
const decode = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
// CDATA → entities → tags (the feeds encode their HTML as entities, so tags appear only after decoding)
const strip = s => decode(decode((s ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
const tag = (x, t) => strip((x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) ?? [])[1]);

const res = { source: 'השירות המטאורולוגי הישראלי', sourceUrl: 'https://ims.gov.il', terms: 'https://ims.gov.il/sites/default/files/docs/terms_use.pdf', checkedAt: new Date().toISOString(), ok: false, feeds: [] };
try {
  const idx = (await get(`${BASE}/he/rss_data`, 'json')).data?.alert ?? {};
  for (const [area, kinds] of Object.entries(idx)) {
    for (const [type, f] of Object.entries(kinds ?? {})) {
      if (!f?.file_path) continue;
      const feed = { area, type, url: BASE + f.file_path, ok: false, items: [] };
      try {
        const xml = await get(feed.url);
        feed.title = tag(xml.split('<item')[0], 'title');
        feed.updated = tag(xml.split('<item')[0], 'lastBuildDate') || tag(xml.split('<item')[0], 'pubDate') || f.datetime;
        feed.items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(m => ({ title: tag(m[0], 'title'), text: tag(m[0], 'description').slice(0, 1500), pubDate: tag(m[0], 'pubDate'), link: tag(m[0], 'link') || feed.url, guid: tag(m[0], 'guid') })).filter(i => i.title || i.text);
        feed.ok = true;
      } catch (e) { feed.error = String(e.message ?? e); }
      res.feeds.push(feed);
      await new Promise(r => setTimeout(r, 400));
    }
  }
  res.ok = res.feeds.length > 0 && res.feeds.every(f => f.ok);
} catch (e) { res.error = String(e.message ?? e); }
for (const o of outs) { mkdirSync(dirname(o), { recursive: true }); writeFileSync(o, JSON.stringify(res)); }
console.log(`IMS: ${res.feeds.length} feeds, ok=${res.ok}, items=${res.feeds.reduce((n, f) => n + f.items.length, 0)}${res.error ? ' error=' + res.error : ''}`);
