import { useEffect, useState } from 'react';

// Hash router: works on GitHub Pages sub-paths and offline without server rewrites.
export function useRoute() {
  const [hash, setHash] = useState(() => location.hash.slice(1) || '/');
  useEffect(() => {
    const on = () => { setHash(location.hash.slice(1) || '/'); window.scrollTo({ top: 0 }); };
    addEventListener('hashchange', on); return () => removeEventListener('hashchange', on);
  }, []);
  const parts = hash.split('?')[0].split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts, query: new URLSearchParams(hash.split('?')[1] ?? '') };
}
export const go = (to: string) => { location.hash = to; };
export const href = (to: string) => '#' + to;
