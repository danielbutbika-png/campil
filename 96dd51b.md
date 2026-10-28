# CI 96dd51b — 2026-10-28T09:16Z
- typecheck: success
- unit: success
- build: success
- rules: failure

## typecheck
```

> campil@1.0.0 typecheck
> tsc --noEmit

```

## unit
```

[1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90m/home/runner/work/campil/campil[39m

 [32m✓[39m src/engine/menu.test.ts[2m > [22mshared menu by family diet[2m > [22mportions follow age
 [32m✓[39m src/engine/menu.test.ts[2m > [22mshared menu by family diet[2m > [22mmeat family gets a BBQ, vegetarian family a vegetarian grill alternative, no dairy at a kosher meat meal
 [32m✓[39m src/engine/menu.test.ts[2m > [22mshared menu by family diet[2m > [22ma vegan family only gets vegan dishes; allergies are respected
 [32m✓[39m src/engine/menu.test.ts[2m > [22mshared menu by family diet[2m > [22mshopping list includes grill meat totals
 [32m✓[39m src/engine/menu.test.ts[2m > [22mshopping list: tidy quantities and drinks[2m > [22mwhole items read as plain counts, garlic in heads, meat in kg
 [32m✓[39m src/engine/menu.test.ts[2m > [22mshopping list: tidy quantities and drinks[2m > [22mdrinks: water by recommendation, alcohol only for adults 18+ and not on day trips
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mpersonal items belong to the person's family; organiser gear to family A
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mother families get their own basic gear sized to them
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22ma family sees its own items and shared items only
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mpartners are not notified about another family's private gear
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mparticipants without a family join the first one
 [32m✓[39m src/engine/engine.test.ts[2m > [22mdates[2m > [22mcounts days and nights
 [32m✓[39m src/engine/engine.test.ts[2m > [22mdates[2m > [22mforecast availability
 [32m✓[39m src/engine/engine.test.ts[2m > [22mweather rules[2m > [22mrain recommendation names the value
 [32m✓[39m src/engine/engine.test.ts[2m > [22mweather rules[2m > [22mflood danger only with rain + flood-prone site
 [32m✓[39m src/engine/engine.test.ts[2m > [22mweather rules[2m > [22mcold night shows the minimum
 [32m✓[39m src/engine/engine.test.ts[2m > [22mweather rules[2m > [22mextreme heat suggests changing plans
 [32m✓[39m src/engine/engine.test.ts[2m > [22mweather rules[2m > [22mwind targets tents
 [32m✓[39m src/engine/engine.test.ts[2m > [22mweather rules[2m > [22mcalm weather → single ok card
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mscales daily clothing by nights
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mskips fans on a cold trip, includes them on hot nights
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mgender and age of participants drive personal and hygiene items
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mflags shortfall when more people than plates
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mwater: 3 L per person by default (5 in the desert), or the user own amount
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mday trip leaves tent and bedding at home
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mreadiness and merge keep packed state
 [32m✓[39m src/engine/engine.test.ts[2m > [22mscoring[2m > [22mpenalises exposed sites in heat and explains why
 [32m✓[39m src/engine/engine.test.ts[2m > [22mmeals & schedule[2m > [22mplans meals respecting allergies and builds a shopping list
 [32m✓[39m src/engine/engine.test.ts[2m > [22mmeals & schedule[2m > [22mschedule moves activities early on hot days
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mfuel brands[2m > [22mreads brand from OSM tags
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mfuel brands[2m > [22mfilters by preferred brands; empty = all
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mfuel brands[2m > [22mplaces a station along the route
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22mevery catalogue value has a source link
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22mfinds models by Hebrew alias
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22m7-seat capacity follows the passenger count
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22mparses a web lookup answer and rejects guesses
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mloading plan[2m > [22msums measured boxes, flags stackable bases and items without volume
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mloading plan[2m > [22mwarns when the measured gear exceeds a small trunk
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mresolves regions locally without network
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mmerges catalogue + OSM, de-duplicates and sorts by distance
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mfalls back to catalogue when OSM is down
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mround-trips a trip through the document
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mconcurrent edits on different items both survive
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22memits deletes for removed items and fields
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mparses the Firebase console snippet and round-trips invites
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22mattributes ticks to whoever ticked, other edits to the last editor
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22mreports nothing when the trip did not change
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22msummarizes several changes into one short notification
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mreads the date a photo was taken from EXIF
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mpicks photos spread over the whole trip, keeping first and last
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mvideo length = intro + photos × seconds + ending

[2m Test Files [22m [1m[32m8 passed[39m[22m[90m (8)[39m
[2m      Tests [22m [1m[32m51 passed[39m[22m[90m (51)[39m
[2m   Start at [22m 09:15:36
[2m   Duration [22m 1.67s[2m (transform 596ms, setup 0ms, collect 1.19s, tests 207ms, environment 2ms, prepare 1.31s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2100 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/photos.ts is dynamically imported by /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx but also statically imported by /home/runner/work/campil/campil/src/lib/album.ts, /home/runner/work/campil/campil/src/lib/cloud/sync.ts, /home/runner/work/campil/campil/src/screens/Gear.tsx, /home/runner/work/campil/campil/src/screens/More.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/JournalTab.tsx, dynamic import will not move module into another chunk.
[39m
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html              [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-BQuk8Vfv.css      [39m[1m[2m   39.66 kB[22m[1m[22m[2m │ gzip:   8.19 kB[22m
[2mdist/[22m[35mIsraelMap-KizArRWY.css  [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js   [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mMapScreen-3kEDkUrA.js   [39m[1m[2m    7.05 kB[22m[1m[22m[2m │ gzip:   3.02 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js   [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js   [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-OIJL_ooh.js       [39m[1m[2m  650.19 kB[22m[1m[22m[2m │ gzip: 204.78 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js   [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMap-HVOOjjIN.js   [39m[1m[2m1,072.59 kB[22m[1m[22m[2m │ gzip: 290.10 kB[22m
[32m✓ built in 8.76s[39m
```

## rules
```

> campil@1.0.0 test:rules
> npx --yes firebase-tools@13 emulators:exec --only firestore --project demo-campil "npx vitest run -c vitest.rules.config.ts" --reporter=verbose

npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated json-ptr@3.1.1: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated uuid@8.3.2: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm warn deprecated uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm warn deprecated uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm warn deprecated uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
error: unknown option '--reporter=verbose'
```
