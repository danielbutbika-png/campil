// Live web lookup of a car's trunk volume. A static PWA has no server, so the search runs through the
// Claude API (with its web-search tool) using the user's own API key, stored only on this device.
import type { VehicleSpec } from '../data/vehicles';

export interface WebLookup { ok: true; spec: VehicleSpec }
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

const PROMPT = (model: string) => `Find the official luggage/boot (trunk) capacity in litres for this car: "${model}" (as sold in Israel or Europe).
Use web search and prefer the manufacturer's spec sheet or a reputable review. Reply with ONLY one JSON object, no prose:
{"model": string, "seats": 5|7, "liters5": number /* seats up; for 7-seaters third row folded */, "liters7": number|null /* all 7 seats up, null if unpublished */, "litersFolded": number|null, "source": string /* site name */, "sourceUrl": string, "note": string|null}
If you cannot find a published figure, reply {"error": "not_found"}. Never estimate.`;

export async function searchVehicleOnline(model: string, apiKey: string, apiModel: string): Promise<VehicleSpec> {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: apiModel, max_tokens: 1500, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }], messages: [{ role: 'user', content: PROMPT(model) }] }),
  });
  if (r.status === 401) throw new Error('מפתח ה-API אינו תקין');
  if (!r.ok) throw new Error(`החיפוש נכשל (${r.status})`);
  const j = await r.json();
  return parseLookup(j, model);
}

/** Pull the JSON answer out of the final text block. Exported for tests. */
export function parseLookup(j: any, asked: string): VehicleSpec {
  const text = (j.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('לא התקבלה תשובה מובנית מהחיפוש');
  const d = JSON.parse(m[0]);
  if (d.error || !Number.isFinite(d.liters5) || d.liters5 < 50 || d.liters5 > 3000 || !/^https?:\/\//.test(d.sourceUrl ?? '')) throw new Error('לא נמצא נתון מפורסם לדגם הזה');
  return {
    id: 'web-' + asked.replace(/\s+/g, '-').toLowerCase(), model: d.model || asked, aliases: [], seats: d.seats === 7 ? 7 : 5,
    liters5: Math.round(d.liters5), liters7: Number.isFinite(d.liters7) ? Math.round(d.liters7) : null, litersFolded: Number.isFinite(d.litersFolded) ? Math.round(d.litersFolded) : undefined,
    note: d.note ?? undefined, source: d.source || new URL(d.sourceUrl).hostname, sourceUrl: d.sourceUrl, checkedAt: new Date().toISOString().slice(0, 10), method: 'web',
  };
}
