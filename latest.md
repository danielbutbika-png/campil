# CI 362db7f — 2026-10-29T09:08Z
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
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mno-food trip: no cooking gear or food, but drinking water stays
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mscales daily clothing by nights
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mskips fans on a cold trip, includes them on hot nights
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22ma child without an age gets child items, not adult hygiene items
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mgender and age of participants drive personal and hygiene items
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mflags shortfall when more people than plates
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mwater: 3 L per person by default (5 in the desert), or the user own amount
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mday trip leaves tent and bedding at home
 [32m✓[39m src/engine/engine.test.ts[2m > [22mpacking[2m > [22mreadiness and merge keep packed state
 [32m✓[39m src/engine/engine.test.ts[2m > [22mscoring[2m > [22mpenalises exposed sites in heat and explains why
 [32m✓[39m src/engine/engine.test.ts[2m > [22mmeals & schedule[2m > [22mplans meals respecting allergies and builds a shopping list
 [32m✓[39m src/engine/engine.test.ts[2m > [22mmeals & schedule[2m > [22mday trip visits every chosen place; no meals when there is no food
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
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22ma recipe is ready when every ingredient and tool is there
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22m"almost" lists what is missing (ingredients and tools count together)
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mready recipes come first; vegan diet filters out eggs
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mbasics like salt and oil are not asked for
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mfinds owned gear from the inventory by name
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
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mconverts mAh to Wh only with a voltage
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22msums daily use of devices
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mgives a range, not a single number, and reports batteries it cannot count
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mreads the date a photo was taken from EXIF
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mpicks photos spread over the whole trip, keeping first and last
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mvideo length = intro + photos × seconds + ending
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mreads a track: name, waypoints, distance and climb
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22msimplifies a straight line to its ends but keeps distance from the original
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mkeeps corners when simplifying
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mrejects files that are not GPX
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mexports a valid GPX that reads back the same places and track

[2m Test Files [22m [1m[32m22 passed[39m[22m[90m (22)[39m
[2m      Tests [22m [1m[32m119 passed[39m[22m[90m (119)[39m
[2m   Start at [22m 09:01:26
[2m   Duration [22m 3.99s[2m (transform 1.05s, setup 0ms, collect 2.18s, tests 463ms, environment 474ms, prepare 2.48s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2215 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-BDcWYEWu.css          [39m[1m[2m   42.92 kB[22m[1m[22m[2m │ gzip:   8.80 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36msearch-BQUrg2H2.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist/[22m[36mrotate-ccw-CLE8SGVP.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-BI0ydf_z.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36mchef-hat-HRNW6aul.js        [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36mprinter-BXcJK7Fr.js         [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m
[2mdist/[22m[36mpackage-DH3PsmAB.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-Cpcxryrr.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-CHg4RSpp.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mJoin-C0inycwq.js            [39m[1m[2m    4.03 kB[22m[1m[22m[2m │ gzip:   2.03 kB[22m
[2mdist/[22m[36mplaces-D1Q9TkrR.js          [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[36mRouteFuel-oeWlldzp.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist/[22m[36mJournalTab-Dqw_j6qV.js      [39m[1m[2m    6.79 kB[22m[1m[22m[2m │ gzip:   3.05 kB[22m
[2mdist/[22m[36mMapScreen-CCejhcHm.js       [39m[1m[2m    7.36 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist/[22m[36mCook-BI8JO1Oh.js            [39m[1m[2m    7.38 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist/[22m[36mExplore-BSKbomIH.js         [39m[1m[2m    8.99 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist/[22m[36mIsraelMap-Bf6MLIeB.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mCampSearch-DeyX4o3d.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.93 kB[22m
[2mdist/[22m[36mTripTypePicker-BpQlmFxI.js  [39m[1m[2m   10.86 kB[22m[1m[22m[2m │ gzip:   3.82 kB[22m
[2mdist/[22m[36mVehiclePicker-BTzncoC8.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-DI7pZZiF.js         [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist/[22m[36mMore-Dxi8ilHH.js            [39m[1m[2m   19.06 kB[22m[1m[22m[2m │ gzip:   7.50 kB[22m
[2mdist/[22m[36mBoxScreen-q0xyrbnU.js       [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist/[22m[36mGear-B79V2gEg.js            [39m[1m[2m   43.99 kB[22m[1m[22m[2m │ gzip:  14.16 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-CX0gV2gM.js          [39m[1m[2m   76.37 kB[22m[1m[22m[2m │ gzip:  20.50 kB[22m
[2mdist/[22m[36mTripPlan-BARCDHvr.js        [39m[1m[2m   91.93 kB[22m[1m[22m[2m │ gzip:  28.60 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-_VLzkeUz.js           [39m[1m[2m  493.42 kB[22m[1m[22m[2m │ gzip: 166.76 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-C0pl8kl0.js     [39m[1m[2m1,064.91 kB[22m[1m[22m[2m │ gzip: 289.26 kB[22m
[32m✓ built in 9.28s[39m
```

## rules
```
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mfamily B cannot change family A
[22m[39m[2026-10-29T09:01:51.525Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1d1 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L71:40 for 'update' @ L71, false for 'update' @ L71

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot change family A
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mfamily B cannot delete family A
[22m[39m[2026-10-29T09:01:51.593Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1d3 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L71:40 for 'delete' @ L71, false for 'delete' @ L71

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mfamily B cannot delete family A
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot read another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot overwrite another family
[22m[39m[2026-10-29T09:01:51.751Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1d7 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L73:26 for 'create' @ L73, evaluation error at L71:40 for 'update' @ L71, false for 'update' @ L71

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot overwrite another family
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser can seed a family that has no list yet
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member cannot move themselves to another family
[22m[39m[2026-10-29T09:01:51.932Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1db error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot move themselves to another family
[22m[39m[2026-10-29T09:01:52.015Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1dd error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member updates only their own family progress
[22m[39m[2026-10-29T09:01:52.160Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1e0 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member updates only their own family progress
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member reads the trip and photos
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member edits shared gear and the plan
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member updates their own last-seen time
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot add someone else
[22m[39m[2026-10-29T09:01:52.466Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1e9 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot add someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-29T09:01:52.541Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1eb error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-29T09:01:52.580Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1ec error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-29T09:01:52.629Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1ed error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot change access, owner or invite keys
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot make themselves organiser
[22m[39m[2026-10-29T09:01:52.717Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1ef error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot make themselves organiser
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins family B with family B's current key, then reads B only
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join after the organiser's link expiry
[22m[39m[2026-10-29T09:01:52.978Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1f6 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join after the organiser's link expiry
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins before the link expiry
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2ma member cannot extend the link expiry
[22m[39m[2026-10-29T09:01:53.179Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1fb error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma member cannot extend the link expiry
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join with a wrong key
[22m[39m[2026-10-29T09:01:53.257Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1fd error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join with a wrong key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot use family A's key to enter family B
[22m[39m[2026-10-29T09:01:53.325Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab1ff error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot use family A's key to enter family B
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join as organiser
[22m[39m[2026-10-29T09:01:53.382Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab201 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join as organiser
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join a closed trip with a key
[22m[39m[2026-10-29T09:01:53.468Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab204 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join a closed trip with a key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma closed trip takes a request from a Google user, and the requester still cannot read
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-29T09:01:53.756Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab210 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-29T09:01:53.786Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab211 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-29T09:01:53.849Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab213 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'update' @ L66, false for 'update' @ L66

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-29T09:01:53.875Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x665ab214 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L65:24 for 'delete' @ L65, false for 'delete' @ L65

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m32 passed[39m[22m[90m (32)[39m
[2m   Start at [22m 09:01:47
[2m   Duration [22m 5.96s[2m (transform 46ms, setup 0ms, collect 174ms, tests 5.40s, environment 0ms, prepare 195ms)[22m

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
✓ e2e-explore
✓ e2e-smartcamp
✓ e2e-cook
✓ e2e-daytrip
✓ overflow-audit
all browser suites passed
```

## deploy
```
To https://github.com/danielbutbika-png/campil
   e48ee37..655fd12  main -> main
 * [new tag]         deploy-prod-20261029-0908-362db7f -> deploy-prod-20261029-0908-362db7f
```
