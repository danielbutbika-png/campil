export type RegionId =
  | 'golan' | 'hula' | 'upper_galilee' | 'lower_galilee' | 'carmel' | 'sharon' | 'center'
  | 'jerusalem' | 'judean_desert' | 'north_negev' | 'central_negev' | 'arava' | 'eilat';

export type Interest =
  | 'water' | 'family' | 'hiking' | 'views' | 'beach' | 'forest' | 'desert'
  | 'accessible' | 'kids' | 'history' | 'camping' | 'picnic';

export type GearStatus = 'have' | 'home' | 'check' | 'buy' | 'per_trip';
export type Condition = 'good' | 'worn' | 'repair';

export type CategoryId =
  | 'tents' | 'sleep' | 'power' | 'clothing' | 'shoes' | 'kitchen' | 'food' | 'cooling'
  | 'furniture' | 'hygiene' | 'kids' | 'firstaid' | 'car' | 'cleaning' | 'pets' | 'misc';

export interface Member { id: string; name: string; role: 'adult' | 'child'; age?: number; gender?: 'm' | 'f'; familyId?: string }
/** A household inside a group trip. Personal gear of a family is shown only to that family. */
export interface Family { id: string; name: string; color: string }

export interface Box {
  id: string; name: string; color: string; category: CategoryId | string;
  dims?: [number, number, number]; // cm L×W×H
  volume?: string | null; weightKg?: number; kind: 'box' | 'bag'; purpose?: string; note?: string;
}

export interface GearItem {
  id: string; name: string; category: CategoryId; qty: number; status: GearStatus;
  condition?: Condition; boxId?: string | null; spot?: string; homeLocation?: string;
  notes?: string; owner?: string /* who uses it, from the family gear file (e.g. 'משפחתי') */; charge?: boolean; perTrip?: boolean; big?: boolean;
  photoId?: string; available?: boolean; volumeL?: number; // per unit, optional
  // Warehouse (all optional, entered by the family — never estimated by the app):
  dims?: [number, number, number]; // per unit, cm L×W×H (packed/folded size)
  weightKg?: number;               // per unit
  borrowedFrom?: string;           // set only when the item isn't ours (lent by another family / friend)
  lastChecked?: string;            // ISO date of the last check (tent poles, gas, batteries…)
  checkEveryMonths?: number;       // how often it should be checked; empty = no reminder
}

export interface PersonalTemplateItem { name: string; hot: number; cold: number; sub?: string; notes?: string }

export type TripKind = 'camping' | 'day' | 'combined';
export type Lodging = 'tent' | 'equipped_site' | 'caravan' | 'other';

export interface Trip {
  id: string; name: string; createdAt: string;
  start: string; end: string; // ISO dates yyyy-mm-dd
  participants: Member[]; // who is going: age + gender per person (source of truth)
  families?: Family[]; // group trips: 2+ households; empty/undefined = one household
  diets?: Record<string, FamilyDiet>; // by family id ('all' on a one-family trip)
  grill?: GrillChoice;
  drinks?: DrinkPlan;
  adults: number; children: number; childAges: number[]; memberIds: string[]; // derived from participants
  pets: boolean; kind: TripKind; lodging: Lodging; vehicle: string;
  regionId: RegionId | null; siteIds: string[]; campsiteName?: string;
  dest?: { lat: number; lon: number; label: string };
  interests: Interest[]; maxDriveKm?: number; difficulty: 'easy' | 'moderate' | 'hard' | 'any';
  budget: 'free' | 'low' | 'any';
  packing: PackItem[]; packingGeneratedAt?: string;
  meals: MealSlot[]; pantry: Record<string, boolean>;
  schedule: ScheduleItem[]; tasks: TaskItem[];
  status: 'planning' | 'done'; packingSig?: string; example?: boolean;
  /** set once the end-of-trip collage was made and shared with everyone */
  albumFinal?: { collageId: string; at: number; by: string };
  /** this device: what was saved for use with no signal (never synced) */
  offline?: import('./offline').Prepared;
  shared?: { cloudId: string; role: 'owner' | 'editor'; joinedAt: string; familyId?: string };
  rating?: number; notes?: string;
}

export interface PackItem {
  id: string; name: string; category: CategoryId; qty: number; unit?: string;
  reason: string; source: 'inventory' | 'rule' | 'personal' | 'manual';
  inventoryId?: string; boxId?: string | null; assignee?: string; packed: boolean; missing?: boolean;
  removed?: boolean; packedBy?: string; packedAt?: number; ord?: number;
  /** Owning family: an id, '' = shared with everyone, undefined = derived (see lib/families). */
  familyId?: string;
  /** Shared items in a multi-family trip: how many units each family brings (familyId → units). */
  brings?: Record<string, number>;
  /** Partly packed: units packed so far (0 < packedQty < qty). Fully packed uses `packed`. */
  packedQty?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
/** servings = people eating the dish; eq = adult-equivalent portions (children eat less). alt = second dish for those who don't eat the main one. */
export interface MealSlot { id: string; day: number; type: MealType; recipeId: string | null; servings: number; eq?: number; alt?: { recipeId: string | null; servings: number; eq?: number; who?: string } }
export type DietStyle = 'meat' | 'vegetarian' | 'vegan';
export type KashrutLevel = 'none' | 'kosher' | 'mehadrin';
/** What one family (or the whole trip) eats. */
export interface FamilyDiet { style: DietStyle; kashrut: KashrutLevel; allergies: string[] }
/** Choice of grill items for the shared BBQ meals. */
export interface GrillChoice { meats: string[]; veg: string[] }
/** Drinks for the shopping list. Undefined fields use the recommended defaults (engine/drinks). */
export interface DrinkPlan { waterL?: number; softL?: number; alcohol?: boolean; beerPerAdult?: number; adultsPerWine?: number }

export interface ScheduleItem { id: string; day: number; time: string; title: string; note?: string; kind: 'drive' | 'camp' | 'meal' | 'activity' | 'rest' | 'pack' }

export interface TaskItem { id: string; when: string; text: string; done: boolean; assignee?: string; dueOffsetDays: number; doneBy?: string; doneAt?: number; ord?: number }

export interface JournalEntry {
  id: string; tripId: string; createdAt: string; date: string; title: string; text: string;
  photoIds: string[]; loc?: { lat: number; lon: number; label?: string }; author?: string;
}

/** A photo in a trip's shared album. The image itself is in IndexedDB under `id`. */
export interface AlbumPhoto { id: string; tripId: string; by: string; byUid?: string; takenAt: number; addedAt: number; caption?: string; w: number; h: number; collage?: boolean }

/** What a user checked themselves on the operator's site (kept on this device). */
export interface SiteCheck { at: string; url?: string; booking?: 'required' | 'recommended' | 'none'; access?: 'yes' | 'partial' | 'no'; lodging?: 'yes' | 'no'; note?: string }

export interface DietPrefs { kosher: boolean; vegetarian: boolean; vegan: boolean; allergies: string[] }

export interface Settings {
  familyName: string; home?: { lat: number; lon: number; label: string };
  vehicle: string; trunkLiters?: number; waterLitersPerPersonDay?: number;
  /** Trunk interior measured by the family (cm): depth seat-back→tailgate, narrowest width, floor→bottom of rear window. */
  trunkDims?: { depth: number; width: number; height: number; measuredAt: string };
  diet: DietPrefs; theme: 'system' | 'light' | 'dark';
  vehicleSpec?: import('../data/vehicles').VehicleSpec | null;
  fuelBrands: import('../services/fuel').BrandId[]; fuelBufferKm: number;
  aiKey?: string; aiModel?: string;
  cloud?: { config: Record<string, string>; myName: string } | null;
  /** Partner-change notifications; undefined = on. */
  notify?: boolean;
}

export interface Site {
  id: string; name: string; region: RegionId; type: 'trail' | 'campsite' | 'attraction' | 'beach' | 'viewpoint' | 'spring' | 'park';
  lat: number; lon: number; desc: string; tags: Interest[];
  lengthKm?: number; durationH?: string; difficulty?: 'easy' | 'moderate' | 'hard';
  family?: boolean; stroller?: 'yes' | 'partial' | 'no' | 'unknown'; pets?: 'yes' | 'no' | 'unknown';
  season?: string; lodging?: boolean; operator: 'rtg' | 'kkl' | 'municipal' | 'other';
  officialUrl: string; exposed?: boolean; floodRisk?: boolean; verified: boolean; sourceNote: string; checkedAt?: string;
  /** filled only when checked against the operator (else shown as unknown) */
  booking?: 'required' | 'recommended' | 'none'; facilities?: string[];
}
