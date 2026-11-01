// The proactive "found options around your destination" card — shown only after a real search found real places.
import { useEffect, useState } from 'react';
import { Compass, Coffee, Utensils, Footprints, Mountain } from 'lucide-react';
import type { Trip } from '../lib/types';
import { tripPoint } from '../lib/hooks';
import { searchAround, type DiscPlace } from '../services/discover';
import { Button } from './ui';
import { go } from '../lib/router';

export function DiscoverPrompt({ t }: { t: Trip }) {
  const base = tripPoint(t);
  const [found, setFound] = useState<DiscPlace[] | null>(null);
  useEffect(() => { if (!base) return; let off = false; searchAround(base, 15, ['cart', 'cafe', 'breakfast', 'restaurant', 'trail', 'view', 'water', 'family']).then(r => { if (!off) setFound(r); }, () => { if (!off) setFound(null); }); return () => { off = true; }; }, [base?.lat, base?.lon]);
  if (!base || !found?.length) return null;
  const n = (f: (p: DiscPlace) => boolean) => found.filter(f).length;
  const carts = n(p => p.cat === 'cart'), food = n(p => ['cafe', 'breakfast', 'restaurant'].includes(p.cat)), trails = n(p => p.cat === 'trail'), nature = n(p => ['view', 'water', 'family'].includes(p.cat));
  return (
    <section aria-labelledby="disc-h" className="space-y-2 rounded-xl2 border border-forest/30 bg-forest/5 p-4">
      <h2 id="disc-h" className="flex items-center gap-2 font-bold"><Compass size={18} className="text-sunset" />מצאתי אפשרויות לעצירות ופעילויות באזור שבחרת</h2>
      <p className="text-sm">רוצה לגלות עגלות קפה, מסעדות, מסלולים ומקומות מיוחדים בסביבת {base.label}?</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {carts > 0 && <span className="flex items-center gap-1"><Coffee size={14} />{carts} עגלות קפה</span>}
        {food > 0 && <span className="flex items-center gap-1"><Utensils size={14} />{food} מקומות אוכל וקפה</span>}
        {trails > 0 && <span className="flex items-center gap-1"><Footprints size={14} />{trails} מסלולים</span>}
        {nature > 0 && <span className="flex items-center gap-1"><Mountain size={14} />{nature} תצפיות, מים ואטרקציות</span>}
      </p>
      <Button icon={<Compass size={17} />} onClick={() => go(`/discover/${t.id}`)}>גלה מה יש בסביבה</Button>
    </section>
  );
}
