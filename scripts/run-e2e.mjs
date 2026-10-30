// Runs the browser scenarios against a running preview server (npm run preview) and fails on any
// "…: false" check, a non-"none" errors line, or a crash. Usage: node scripts/run-e2e.mjs [outDir]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'e2e-shots'; mkdirSync(OUT, { recursive: true });
const SUITES = ['e2e-collab', 'e2e-families', 'e2e-notify', 'e2e-menu', 'e2e-album', 'e2e-offline', 'e2e-field', 'e2e-home-modes', 'e2e-warehouse', 'e2e-trunk', 'e2e-triptypes', 'e2e-academy', 'e2e-safety', 'e2e-explore', 'e2e-smartcamp', 'e2e-cook', 'e2e-daytrip', 'e2e-route', 'e2e-account', 'e2e-welcome', 'e2e-selfbuild', 'e2e-freetext', 'overflow-audit'];
let failed = 0;
for (const s of SUITES) {
  const r = spawnSync('node', [`scripts/${s}.mjs`, OUT], { encoding: 'utf8', timeout: 300_000, env: process.env });
  const out = (r.stdout || '') + (r.stderr || '');
  const lines = out.split('\n').filter(l => l && !l.includes('agent-proxy'));
  const bad = lines.filter(l => /:\s*false\b/.test(l) || (/^errors:/.test(l) && !/errors: none/.test(l)) || /^\d+ problems$/.test(l));
  const ok = r.status === 0 && !bad.length;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${s}${ok ? '' : `  (exit ${r.status})`}`);
  for (const l of ok ? [] : (bad.length ? bad : lines.slice(-45))) console.log('    ' + l);
}
console.log(failed ? `${failed} suite(s) failed` : 'all browser suites passed');
process.exit(failed ? 1 : 0);
