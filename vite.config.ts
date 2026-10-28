import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

/** Injects the list of built files and a build id into dist/sw.js, so the service worker precaches the
 *  exact files of this version and a new version replaces the old cache. */
function precache(): Plugin {
  let mode = 'production';
  return {
    name: 'campil-precache', apply: 'build',
    configResolved(c) { mode = c.mode; },
    writeBundle(opts) {
      const dir = opts.dir!; const files: string[] = [];
      const walk = (d: string, rel = '') => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p, rel + f + '/'); else files.push(rel + f); } };
      walk(dir);
      const list = files.filter(f => f !== 'sw.js' && !f.endsWith('.map')).sort().map(f => './' + f);
      const id = createHash('sha1').update(list.join('|')).digest('hex').slice(0, 10);
      const sw = join(dir, 'sw.js');
      writeFileSync(sw, readFileSync(sw, 'utf8').replace('__BUILD_ID__', id).replace('__CACHE_PREFIX__', mode === 'staging' ? 'campil-stg-' : 'campil-').replace('__PRECACHE_MANIFEST__', JSON.stringify(list)));
    },
  };
}

// base './' so the build runs from any sub-path (GitHub Pages: /campil/).
// assetsDir '' gives a flat output folder, uploadable through GitHub's web uploader.
export default defineConfig({ base: './', plugins: [react(), precache()], build: { target: 'es2020', chunkSizeWarningLimit: 1500, assetsDir: '' } });
