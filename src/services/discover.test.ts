import { describe, it, expect } from 'vitest';
import { fromOsm, coffeeKind } from './discover';

const el = (tags: Record<string, string>, id = 1) => ({ type: 'node', id, lat: 32.9, lon: 35.7, tags });
describe('discover: OSM → places', () => {
  it('coffee carts are told apart from cafes, with the evidence', () => {
    expect(coffeeKind({ amenity: 'cafe', name: 'עגלת הקפה של יוסי' })).toMatchObject({ cat: 'cart', sure: true });
    expect(coffeeKind({ amenity: 'cafe', name: 'Coffee Truck Golan' }).cat).toBe('cart');
    expect(coffeeKind({ amenity: 'cafe', name: 'קפה בטבע' }).cat).toBe('cart');
    expect(coffeeKind({ amenity: 'cafe', name: 'קפה ג׳ו', street_vendor: 'yes' })).toMatchObject({ cat: 'cart', sure: false });
    expect(coffeeKind({ amenity: 'cafe', name: 'ארומה' }).cat).toBe('cafe');
    expect(coffeeKind({ shop: 'bakery', name: 'מאפיית הגליל' }).cat).toBe('breakfast');
  });
  it('kashrut and diets only as tagged — never assumed', () => {
    const r = fromOsm(el({ amenity: 'restaurant', name: 'מסעדה', 'diet:kosher': 'yes', outdoor_seating: 'yes' }))!;
    expect(r.cat).toBe('restaurant'); expect(r.kosher).toBe('yes'); expect(r.outdoor).toBe(true);
    const u = fromOsm(el({ amenity: 'restaurant', name: 'אחרת' }))!;
    expect(u.kosher).toBeUndefined(); expect(u.vegetarian).toBeUndefined();
  });
  it('nameless or unrelated elements are dropped; ids are stable', () => {
    expect(fromOsm(el({ amenity: 'cafe' }))).toBeNull();
    expect(fromOsm(el({ amenity: 'bank', name: 'בנק' }))).toBeNull();
    expect(fromOsm(el({ tourism: 'viewpoint', name: 'תצפית' }, 42))!.id).toBe('osm:n42');
  });
});
