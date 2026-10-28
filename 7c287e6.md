# CI 7c287e6 — 2026-10-28T10:10Z
- typecheck: success
- unit: success
- build: success
- rules: success
- e2e: failure
- deploy: skipped

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
[2m   Start at [22m 10:04:37
[2m   Duration [22m 1.19s[2m (transform 495ms, setup 0ms, collect 949ms, tests 117ms, environment 1ms, prepare 718ms)[22m

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
[32m✓ built in 6.51s[39m
```

## rules
```
 [32m✓[39m tests/rules/rules.test.ts[2m > [22moutsiders[2m > [22ma stranger who knows the trip id cannot read the trip[33m 1012[2mms[22m[39m
 [32m✓[39m tests/rules/rules.test.ts[2m > [22moutsiders[2m > [22ma signed-out visitor cannot read the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22moutsiders[2m > [22ma stranger cannot read photos or journal
 [32m✓[39m tests/rules/rules.test.ts[2m > [22moutsiders[2m > [22ma stranger cannot read any family list
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2moutsiders[2m > [22m[2ma stranger cannot edit the trip
[22m[39m[2026-10-28T10:04:58.651Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957edf error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22moutsiders[2m > [22ma stranger cannot edit the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member reads and edits their own family list
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot read family A
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mfamily B cannot change family A
[22m[39m[2026-10-28T10:04:58.867Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957ee6 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L68:40 for 'update' @ L68, false for 'update' @ L68

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot change family A
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mfamily B cannot delete family A
[22m[39m[2026-10-28T10:04:58.921Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957ee8 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L68:40 for 'delete' @ L68, false for 'delete' @ L68

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot delete family A
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot read another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot overwrite another family
[22m[39m[2026-10-28T10:04:59.040Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957eec error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L70:26 for 'create' @ L70, evaluation error at L68:40 for 'update' @ L68, false for 'update' @ L68

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot overwrite another family
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser can seed a family that has no list yet
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member cannot move themselves to another family
[22m[39m[2026-10-28T10:04:59.154Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957ef0 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot move themselves to another family
[22m[39m[2026-10-28T10:04:59.219Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957ef2 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member updates only their own family progress
[22m[39m[2026-10-28T10:04:59.308Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957ef5 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member updates only their own family progress
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member reads the trip and photos
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member edits shared gear and the plan
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member updates their own last-seen time
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot add someone else
[22m[39m[2026-10-28T10:04:59.592Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957efe error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot add someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-28T10:04:59.680Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f00 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-28T10:04:59.709Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f01 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-28T10:04:59.742Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f02 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot change access, owner or invite keys
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot make themselves organiser
[22m[39m[2026-10-28T10:04:59.823Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f04 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot make themselves organiser
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins family B with family B's current key, then reads B only
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join with a wrong key
[22m[39m[2026-10-28T10:04:59.983Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f0a error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join with a wrong key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot use family A's key to enter family B
[22m[39m[2026-10-28T10:05:00.045Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f0c error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot use family A's key to enter family B
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join as organiser
[22m[39m[2026-10-28T10:05:00.096Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f0e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join as organiser
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join a closed trip with a key
[22m[39m[2026-10-28T10:05:00.156Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f11 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join a closed trip with a key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma closed trip takes a request from a Google user, and the requester still cannot read
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-28T10:05:00.405Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f1d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-28T10:05:00.426Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f1e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-28T10:05:00.471Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f20 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L63:24 for 'update' @ L63, false for 'update' @ L63

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-28T10:05:00.488Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x6a957f21 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L62:24 for 'delete' @ L62, false for 'delete' @ L62

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m29 passed[39m[22m[90m (29)[39m
[2m   Start at [22m 10:04:55
[2m   Duration [22m 5.34s[2m (transform 34ms, setup 0ms, collect 117ms, tests 4.97s, environment 0ms, prepare 108ms)[22m

[32m[1m✔ [22m[39m Script exited successfully (code 0)
[36m[1mi  emulators:[22m[39m Shutting down emulators.
[36m[1mi  firestore:[22m[39m Stopping Firestore Emulator
[36m[1mi  hub:[22m[39m Stopping emulator hub
[36m[1mi  logging:[22m[39m Stopping Logging Emulator
```

## e2e
```
✓ e2e-collab
✓ e2e-families
✓ e2e-notify
✓ e2e-menu
✓ e2e-album
✗ e2e-offline  (exit 1)
    service worker ready: {"controlled":true,"caches":["campil-db852e7fac"],"cachedFiles":15}
    offline url http://localhost:4173/#/trip/trip-tp8u73hbnba/gear (no main)
    offline load log:
    failed https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Suez+On net::ERR_FAILED
    console Failed to load resource: net::ERR_FAILED
    failed http://localhost:4173/index-OIJL_ooh.js net::ERR_FAILED
    console Failed to load resource: net::ERR_FAILED
    failed http://localhost:4173/index-BQuk8Vfv.css net::ERR_FAILED
    console Failed to load resource: net::ERR_FAILED
    html head: <!DOCTYPE html><html lang="he" dir="rtl"><head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <title>CampIL</title>
        <meta name="description" content="CampIL — תכנון טיולים וקמפינג בישראל: תחזית, ציוד, מפה, ארוחות ותיעו
    node:internal/modules/run_main:123
        triggerUncaughtException(
        ^
    locator.check: Timeout 30000ms exceeded.
    Call log:
      - waiting for locator('input[type=checkbox][aria-label$="ארוז"]').first()
        at /home/runner/work/campil/campil/scripts/e2e-offline.mjs:25:69 {
      log: [
        `  - waiting for locator('input[type=checkbox][aria-label$="ארוז"]').first()`
      ],
      name: 'TimeoutError'
    }
    Node.js v22.23.4
✓ overflow-audit
1 suite(s) failed
```

## deploy
```
```
