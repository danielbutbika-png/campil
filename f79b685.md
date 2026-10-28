# CI f79b685 — 2026-10-28T17:14Z
- typecheck: success
- unit: success
- build: success
- rules: success
- e2e: success
- deploy: success

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
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22msays nothing for a trip that already ended
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22mevery suggestion explains why and names its source
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22mflood-prone site + rain → official warning link, danger first
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22muses forecast recommendations only when there is a real forecast
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22mpacking and offline prep only close to departure
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22muses the family's own site check: booking required is a warning with their date
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22mgear due for a check, in this trip
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22msuggests plan B when the forecast hits a flood-prone place
 [32m✓[39m src/engine/assistant.test.ts[2m > [22mplanning assistant[2m > [22mflags items that will not fit the measured trunk
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
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mpersonal items belong to the person's family; organiser gear to family A
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mother families get their own basic gear sized to them
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22ma family sees its own items and shared items only
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mpartners are not notified about another family's private gear
 [32m✓[39m src/engine/families.test.ts[2m > [22mgroup trips: families[2m > [22mparticipants without a family join the first one
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mfuel brands[2m > [22mreads brand from OSM tags
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mfuel brands[2m > [22mfilters by preferred brands; empty = all
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mfuel brands[2m > [22mplaces a station along the route
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22mevery catalogue value has a source link
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22mfinds models by Hebrew alias
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22m7-seat capacity follows the passenger count
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mvehicles[2m > [22mparses a web lookup answer and rejects guesses
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mloading plan[2m > [22msums measured boxes, flags stackable bases and items without volume
 [32m✓[39m src/engine/vehicle-fuel.test.ts[2m > [22mloading plan[2m > [22mwarns when the measured gear exceeds a small trunk
 [32m✓[39m src/engine/tripTypes.test.ts[2m > [22mtrip type engine[2m > [22mthe catalog has 30 distinct types, each with a name and blurb, guides that exist
 [32m✓[39m src/engine/tripTypes.test.ts[2m > [22mtrip type engine[2m > [22msafety-related checks always defer to a source or the operator — never state a place is open/safe
 [32m✓[39m src/engine/tripTypes.test.ts[2m > [22mtrip type engine[2m > [22mcombining types implies settings without dropping existing interests
 [32m✓[39m src/engine/tripTypes.test.ts[2m > [22mtrip type engine[2m > [22mmerges gear once per item, scaled to people
 [32m✓[39m src/engine/tripTypes.test.ts[2m > [22mtrip type engine[2m > [22mpacking gets the types' gear; a question answer overrides the count
 [32m✓[39m src/engine/tripTypes.test.ts[2m > [22mtrip type engine[2m > [22mtasks, checks and questions come from the selected types
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mfills the floor with four boxes, all inside and not overlapping
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mlays a long item flat rather than standing it up past the window line
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mrejects what cannot fit and explains why
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mreports "no room" once the space under the window line is full
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mputs heavy items low and against the seat back, and never on soft bags
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mitems needed on the way go to the tailgate end and are loaded last
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mfits a long bag along the seat back when a volume-first order would leave it out
 [32m✓[39m src/engine/pack3d.test.ts[2m > [22mtrunk packing by dimensions[2m > [22mlists items without dimensions separately instead of guessing
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22msets and clears a duty
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22msummarises per family and what nobody took
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22mquick split keeps existing choices, splits shopping by section and meals in rotation
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22msyncs each duty as its own key
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22muses entered volume first, otherwise computes from dimensions, otherwise unknown
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22madds months without overflowing short months
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mknows when a periodic check is due
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mlists only upcoming trips that still pack the item
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mtotals only entered data and reports what is missing
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mround-trips a trip through the document
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mconcurrent edits on different items both survive
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22memits deletes for removed items and fields
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mparses the Firebase console snippet and round-trips invites
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mresolves regions locally without network
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mmerges catalogue + OSM, de-duplicates and sorts by distance
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mfalls back to catalogue when OSM is down
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22mattributes ticks to whoever ticked, other edits to the last editor
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22mreports nothing when the trip did not change
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22msummarizes several changes into one short notification
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22msums what families bring and what is missing
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22mcaps a family share at what others left, and 0 removes it
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22mpacks part of an item and completes when all units are packed
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22msyncs each family share as its own field (no overwrite between families)
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mfinds the right knot from an everyday need
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mevery knot is complete: illustration for every step, mistakes, 3-question quiz with a valid answer
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mno knot claims life-safety use, and the safety note says so
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mthe library lists knots and guides with categories
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mdrops older app caches of its own environment
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mkeeps the current build, saved maps and runtime caches
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mnever touches the other environment
 [32m✓[39m src/engine/planB.test.ts[2m > [22mweather plan B[2m > [22mrain + flood-prone planned place → nearby non-flood alternatives in the same region
 [32m✓[39m src/engine/planB.test.ts[2m > [22mweather plan B[2m > [22mwind avoids exposed places; heat prefers water
 [32m✓[39m src/engine/planB.test.ts[2m > [22mweather plan B[2m > [22mnothing without a real forecast, nothing for booked lodging, nothing when weather is fine
 [32m✓[39m src/lib/tripOps.test.ts[2m > [22mtrip operations[2m > [22ma copy is fresh, dated two weeks ahead, and never linked to the shared original
 [32m✓[39m src/lib/tripOps.test.ts[2m > [22mtrip operations[2m > [22mfinds the trip that ended in the last week, ignoring the example
 [32m✓[39m src/lib/homeMode.test.ts[2m > [22mhome mode[2m > [22mplans when there is no trip or only the example
 [32m✓[39m src/lib/homeMode.test.ts[2m > [22mhome mode[2m > [22mprepares within a week of the start
 [32m✓[39m src/lib/homeMode.test.ts[2m > [22mhome mode[2m > [22mis in the field from the first to the last day
 [32m✓[39m src/lib/homeMode.test.ts[2m > [22mhome mode[2m > [22mnumbers trip days from 0
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mreads the date a photo was taken from EXIF
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mpicks photos spread over the whole trip, keeping first and last
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mvideo length = intro + photos × seconds + ending
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mreads a track: name, waypoints, distance and climb
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22msimplifies a straight line to its ends but keeps distance from the original
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mkeeps corners when simplifying
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mrejects files that are not GPX
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mexports a valid GPX that reads back the same places and track

[2m Test Files [22m [1m[32m20 passed[39m[22m[90m (20)[39m
[2m      Tests [22m [1m[32m108 passed[39m[22m[90m (108)[39m
[2m   Start at [22m 17:07:59
[2m   Duration [22m 2.39s[2m (transform 606ms, setup 0ms, collect 1.24s, tests 244ms, environment 266ms, prepare 1.72s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2130 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-DADjZ76G.css          [39m[1m[2m   42.09 kB[22m[1m[22m[2m │ gzip:   8.65 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36msearch-Cqb5fEVs.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist/[22m[36mrotate-ccw-L8zG7hvX.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-BBh-0Yhc.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36mpackage-CB4nZ4L0.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-YZr2uyR5.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-bkOuJp6a.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mJoin-NzXuRhWC.js            [39m[1m[2m    4.03 kB[22m[1m[22m[2m │ gzip:   2.03 kB[22m
[2mdist/[22m[36mRouteFuel-Cdk0_mCD.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist/[22m[36mJournalTab-Dt-WHGPf.js      [39m[1m[2m    6.80 kB[22m[1m[22m[2m │ gzip:   3.05 kB[22m
[2mdist/[22m[36mMapScreen-O5VumOE2.js       [39m[1m[2m    7.20 kB[22m[1m[22m[2m │ gzip:   3.08 kB[22m
[2mdist/[22m[36mIsraelMap-BQu8tEah.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mCampSearch-DCa3EI69.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.92 kB[22m
[2mdist/[22m[36mTripTypePicker-C3Cs92HT.js  [39m[1m[2m   11.13 kB[22m[1m[22m[2m │ gzip:   3.98 kB[22m
[2mdist/[22m[36mVehiclePicker-BlRROJET.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-BzolygMX.js         [39m[1m[2m   16.45 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist/[22m[36mMore-D01Ea6d1.js            [39m[1m[2m   19.19 kB[22m[1m[22m[2m │ gzip:   7.47 kB[22m
[2mdist/[22m[36mGear-DeuKzJKk.js            [39m[1m[2m   35.84 kB[22m[1m[22m[2m │ gzip:  11.99 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-QirxzotI.js          [39m[1m[2m   70.28 kB[22m[1m[22m[2m │ gzip:  18.65 kB[22m
[2mdist/[22m[36mTripPlan-DYgNgw2I.js        [39m[1m[2m   90.47 kB[22m[1m[22m[2m │ gzip:  28.15 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-DA39SSuL.js           [39m[1m[2m  492.14 kB[22m[1m[22m[2m │ gzip: 166.32 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-D0Ft1H6q.js     [39m[1m[2m1,064.91 kB[22m[1m[22m[2m │ gzip: 289.26 kB[22m
[32m✓ built in 6.55s[39m
[36mvite v5.4.21 [32mbuilding for staging...[36m[39m
transforming...
[32m✓[39m 2130 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist-staging/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist-staging/[22m[35mindex-DADjZ76G.css          [39m[1m[2m   42.09 kB[22m[1m[22m[2m │ gzip:   8.65 kB[22m
[2mdist-staging/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist-staging/[22m[36msearch-DZK-B3D5.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist-staging/[22m[36mrotate-ccw-kTwJEzzt.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist-staging/[22m[36mupload-rrnXiqSM.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist-staging/[22m[36mpackage-CNBlD3Zd.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist-staging/[22m[36mcar-COEfvsoa.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist-staging/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist-staging/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist-staging/[22m[36mTrips-BrKIlgdg.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist-staging/[22m[36mJoin-BjjXBAE5.js            [39m[1m[2m    4.03 kB[22m[1m[22m[2m │ gzip:   2.03 kB[22m
[2mdist-staging/[22m[36mRouteFuel-rnnitJkb.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist-staging/[22m[36mJournalTab-C84igsgK.js      [39m[1m[2m    6.80 kB[22m[1m[22m[2m │ gzip:   3.05 kB[22m
[2mdist-staging/[22m[36mMapScreen-DZkyuN_S.js       [39m[1m[2m    7.20 kB[22m[1m[22m[2m │ gzip:   3.08 kB[22m
[2mdist-staging/[22m[36mIsraelMap-DkxdLI5J.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist-staging/[22m[36mCampSearch-d_mvSXFS.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.93 kB[22m
[2mdist-staging/[22m[36mTripTypePicker-5z3exdFr.js  [39m[1m[2m   11.13 kB[22m[1m[22m[2m │ gzip:   3.98 kB[22m
[2mdist-staging/[22m[36mVehiclePicker-WeBVb0zN.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist-staging/[22m[36mAcademy-CwWChXuh.js         [39m[1m[2m   16.45 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist-staging/[22m[36mMore-DWNCPZUD.js            [39m[1m[2m   19.19 kB[22m[1m[22m[2m │ gzip:   7.46 kB[22m
[2mdist-staging/[22m[36mGear-DALaEXOu.js            [39m[1m[2m   35.84 kB[22m[1m[22m[2m │ gzip:  11.99 kB[22m
[2mdist-staging/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist-staging/[22m[36mWizard-yQqFJCxv.js          [39m[1m[2m   70.28 kB[22m[1m[22m[2m │ gzip:  18.65 kB[22m
[2mdist-staging/[22m[36mTripPlan-CH191pgB.js        [39m[1m[2m   90.47 kB[22m[1m[22m[2m │ gzip:  28.15 kB[22m
[2mdist-staging/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist-staging/[22m[36mindex-gC_h3Gcm.js           [39m[1m[2m  492.33 kB[22m[1m[22m[2m │ gzip: 166.41 kB[22m
[2mdist-staging/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist-staging/[22m[36mIsraelMapGL-CYRQk0NI.js     [39m[1m[2m1,064.91 kB[22m[1m[22m[2m │ gzip: 289.26 kB[22m
[32m✓ built in 6.84s[39m
```

## rules
```
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mfamily B cannot change family A
[22m[39m[2026-10-28T17:08:30.897Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7792f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L71:40 for 'update' @ L71, false for 'update' @ L71

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot change family A
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mfamily B cannot delete family A
[22m[39m[2026-10-28T17:08:30.965Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77931 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L71:40 for 'delete' @ L71, false for 'delete' @ L71

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot delete family A
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot read another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot overwrite another family
[22m[39m[2026-10-28T17:08:31.062Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77935 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L73:26 for 'create' @ L73, evaluation error at L71:40 for 'update' @ L71, false for 'update' @ L71

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot overwrite another family
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser can seed a family that has no list yet
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member cannot move themselves to another family
[22m[39m[2026-10-28T17:08:31.178Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77939 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot move themselves to another family
[22m[39m[2026-10-28T17:08:31.233Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7793b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member updates only their own family progress
[22m[39m[2026-10-28T17:08:31.312Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7793e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member updates only their own family progress
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member reads the trip and photos
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member edits shared gear and the plan
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member updates their own last-seen time
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot add someone else
[22m[39m[2026-10-28T17:08:31.559Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77947 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot add someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-28T17:08:31.602Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77949 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-28T17:08:31.624Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7794a error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-28T17:08:31.646Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7794b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot change access, owner or invite keys
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot make themselves organiser
[22m[39m[2026-10-28T17:08:31.707Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7794d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot make themselves organiser
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins family B with family B's current key, then reads B only
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join after the organiser's link expiry
[22m[39m[2026-10-28T17:08:31.904Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77954 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join after the organiser's link expiry
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins before the link expiry
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2ma member cannot extend the link expiry
[22m[39m[2026-10-28T17:08:32.005Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77959 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma member cannot extend the link expiry
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join with a wrong key
[22m[39m[2026-10-28T17:08:32.078Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7795b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join with a wrong key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot use family A's key to enter family B
[22m[39m[2026-10-28T17:08:32.133Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7795d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot use family A's key to enter family B
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join as organiser
[22m[39m[2026-10-28T17:08:32.181Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7795f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join as organiser
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join a closed trip with a key
[22m[39m[2026-10-28T17:08:32.251Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77962 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join a closed trip with a key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma closed trip takes a request from a Google user, and the requester still cannot read
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-28T17:08:32.489Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7796e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-28T17:08:32.510Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b7796f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-28T17:08:32.549Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77971 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-28T17:08:32.563Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x30b77972 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L65:24 for 'delete' @ L65, false for 'delete' @ L65

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m32 passed[39m[22m[90m (32)[39m
[2m   Start at [22m 17:08:28
[2m   Duration [22m 3.76s[2m (transform 32ms, setup 0ms, collect 112ms, tests 3.43s, environment 0ms, prepare 92ms)[22m

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
✓ e2e-offline
✓ e2e-field
✓ e2e-home-modes
✓ e2e-warehouse
✓ e2e-trunk
✓ e2e-triptypes
✓ e2e-academy
✓ e2e-safety
✓ overflow-audit
all browser suites passed
```

## deploy
```
To https://github.com/danielbutbika-png/campil
   b4701fc..11fa839  main -> main
 * [new tag]         deploy-staging-20261028-1714-f79b685 -> deploy-staging-20261028-1714-f79b685
```
