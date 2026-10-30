# CI 083af97 — 2026-10-30T05:07Z
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
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mself-built menu[2m > [22mportions: adults count 1, a child of unknown age a typical share
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mself-built menu[2m > [22mrecommended quantity follows the people, rounded the way you buy it
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mself-built menu[2m > [22madds foods to a meal (creating it), edits and removes them
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mself-built menu[2m > [22mwhich meals a day has
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mself-built menu[2m > [22mrebuilding the automatic menu keeps foods added by hand
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mgear list edits survive a recalculation[2m > [22ma quantity set by hand is kept
 [32m✓[39m src/engine/selfMenu.test.ts[2m > [22mgear list edits survive a recalculation[2m > [22mwithout a hand edit the new quantity applies
 [32m✓[39m src/services/routing.test.ts[2m > [22mrouting[2m > [22mchains a relation's ways into one line, flipping reversed pieces
 [32m✓[39m src/services/routing.test.ts[2m > [22mrouting[2m > [22mdriving route: one request for all stops, legs named by stop
 [32m✓[39m src/services/routing.test.ts[2m > [22mrouting[2m > [22mdriving route: a readable error when the service is down
 [32m✓[39m src/services/routing.test.ts[2m > [22mrouting[2m > [22mtrails: named marked routes, nearest first, with the mapped length
 [32m✓[39m src/services/routing.test.ts[2m > [22mrouting[2m > [22mclimb is an estimate from a terrain model, marked as such
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22muses entered volume first, otherwise computes from dimensions, otherwise unknown
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22madds months without overflowing short months
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mknows when a periodic check is due
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mlists only upcoming trips that still pack the item
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mtotals only entered data and reports what is missing
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22msets and clears a duty
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22msummarises per family and what nobody took
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22mquick split keeps existing choices, splits shopping by section and meals in rotation
 [32m✓[39m src/engine/duties.test.ts[2m > [22mduties between families[2m > [22msyncs each duty as its own key
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mround-trips a trip through the document
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mthe driving route (it starts at home) is never put in the shared document
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mconcurrent edits on different items both survive
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22memits deletes for removed items and fields
 [32m✓[39m src/engine/cloud.test.ts[2m > [22mshared trip model[2m > [22mparses the Firebase console snippet and round-trips invites
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22msums what families bring and what is missing
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22mcaps a family share at what others left, and 0 removes it
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22mpacks part of an item and completes when all units are packed
 [32m✓[39m src/engine/partial.test.ts[2m > [22mpartial quantities[2m > [22msyncs each family share as its own field (no overwrite between families)
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mresolves regions locally without network
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mmerges catalogue + OSM, de-duplicates and sorts by distance
 [32m✓[39m src/engine/camps.test.ts[2m > [22mcamp search[2m > [22mfalls back to catalogue when OSM is down
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22mattributes ticks to whoever ticked, other edits to the last editor
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22mreports nothing when the trip did not change
 [32m✓[39m src/engine/notify.test.ts[2m > [22mpartner change notifications[2m > [22msummarizes several changes into one short notification
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22ma recipe is ready when every ingredient and tool is there
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22m"almost" lists what is missing (ingredients and tools count together)
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mready recipes come first; vegan diet filters out eggs
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mbasics like salt and oil are not asked for
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mfinds owned gear from the inventory by name
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mdrops older app caches of its own environment
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mkeeps the current build, saved maps and runtime caches
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mnever touches the other environment
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mfinds the right knot from an everyday need
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mevery knot is complete: illustration for every step, mistakes, 3-question quiz with a valid answer
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mno knot claims life-safety use, and the safety note says so
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mthe library lists knots and guides with categories
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

[2m Test Files [22m [1m[32m24 passed[39m[22m[90m (24)[39m
[2m      Tests [22m [1m[32m132 passed[39m[22m[90m (132)[39m
[2m   Start at [22m 04:58:50
[2m   Duration [22m 4.31s[2m (transform 1.20s, setup 0ms, collect 2.39s, tests 489ms, environment 546ms, prepare 3.08s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2221 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-vHlH6jJe.css          [39m[1m[2m   44.29 kB[22m[1m[22m[2m │ gzip:   8.99 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36msearch-BnLye87E.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist/[22m[36mrotate-ccw-1h-AZ_F0.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-BIN0RAbr.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36mchef-hat-BRdL_JtN.js        [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36mprinter-Ui3L5e_j.js         [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36mpackage-DiNrhfym.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-CTq19y70.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-BcWuHHv7.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mJoin-B-Pz56Ke.js            [39m[1m[2m    4.03 kB[22m[1m[22m[2m │ gzip:   2.03 kB[22m
[2mdist/[22m[36mplaces-D1Q9TkrR.js          [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[36mRouteFuel-v0FFpfbp.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist/[22m[36mJournalTab-kMlb0mII.js      [39m[1m[2m    6.79 kB[22m[1m[22m[2m │ gzip:   3.05 kB[22m
[2mdist/[22m[36mMapScreen-gH1ndaOV.js       [39m[1m[2m    7.36 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist/[22m[36mCook-C5n8l5iD.js            [39m[1m[2m    7.38 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist/[22m[36mExplore-D7c_G2Ft.js         [39m[1m[2m    8.99 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist/[22m[36mIsraelMap-tLIJtYFJ.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mCampSearch-bEgyOoga.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.93 kB[22m
[2mdist/[22m[36mTripTypePicker-CcxMQfdd.js  [39m[1m[2m   10.86 kB[22m[1m[22m[2m │ gzip:   3.82 kB[22m
[2mdist/[22m[36mVehiclePicker-DTo32LLB.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-DiW73KBk.js         [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist/[22m[36mMore-DWxeUbNH.js            [39m[1m[2m   19.06 kB[22m[1m[22m[2m │ gzip:   7.50 kB[22m
[2mdist/[22m[36mBoxScreen-SiZgvleo.js       [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist/[22m[36mGear-D9swj1PU.js            [39m[1m[2m   43.99 kB[22m[1m[22m[2m │ gzip:  14.15 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-CUbKIWoL.js          [39m[1m[2m   77.33 kB[22m[1m[22m[2m │ gzip:  20.79 kB[22m
[2mdist/[22m[36mTripPlan-DPE_IHAf.js        [39m[1m[2m  114.78 kB[22m[1m[22m[2m │ gzip:  36.20 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-C4n1MZEu.js           [39m[1m[2m  503.50 kB[22m[1m[22m[2m │ gzip: 170.34 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-CEt4jBBi.js     [39m[1m[2m1,064.91 kB[22m[1m[22m[2m │ gzip: 289.26 kB[22m
[32m✓ built in 9.91s[39m
[36mvite v5.4.21 [32mbuilding for staging...[36m[39m
transforming...
[32m✓[39m 2221 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist-staging/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist-staging/[22m[35mindex-vHlH6jJe.css          [39m[1m[2m   44.29 kB[22m[1m[22m[2m │ gzip:   8.99 kB[22m
[2mdist-staging/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist-staging/[22m[36msearch-CA6yvdr0.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist-staging/[22m[36mrotate-ccw-BDqMRn5-.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist-staging/[22m[36mupload-C384mzD6.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist-staging/[22m[36mchef-hat-DzAMBQs1.js        [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist-staging/[22m[36mprinter-CUra9aVO.js         [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m
[2mdist-staging/[22m[36mpackage-7rbPeJ7g.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist-staging/[22m[36mcar-ClPTSds2.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist-staging/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist-staging/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist-staging/[22m[36mTrips-D2UY1M4E.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist-staging/[22m[36mJoin-Devu24fv.js            [39m[1m[2m    4.03 kB[22m[1m[22m[2m │ gzip:   2.03 kB[22m
[2mdist-staging/[22m[36mplaces-D1Q9TkrR.js          [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist-staging/[22m[36mRouteFuel-CkaXMFL1.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist-staging/[22m[36mJournalTab-CVKpzQvX.js      [39m[1m[2m    6.79 kB[22m[1m[22m[2m │ gzip:   3.05 kB[22m
[2mdist-staging/[22m[36mMapScreen-Bk4mzZCN.js       [39m[1m[2m    7.36 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist-staging/[22m[36mCook-Dmlp5bv_.js            [39m[1m[2m    7.38 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist-staging/[22m[36mExplore-RghxgLhy.js         [39m[1m[2m    8.99 kB[22m[1m[22m[2m │ gzip:   3.77 kB[22m
[2mdist-staging/[22m[36mIsraelMap-_u9LbM-5.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist-staging/[22m[36mCampSearch-EW351HyX.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.93 kB[22m
[2mdist-staging/[22m[36mTripTypePicker-Dk1G9mxe.js  [39m[1m[2m   10.86 kB[22m[1m[22m[2m │ gzip:   3.82 kB[22m
[2mdist-staging/[22m[36mVehiclePicker-Dcwdz4v5.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist-staging/[22m[36mAcademy-CPLssU7Z.js         [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist-staging/[22m[36mMore-BIbcHQS8.js            [39m[1m[2m   19.06 kB[22m[1m[22m[2m │ gzip:   7.51 kB[22m
[2mdist-staging/[22m[36mBoxScreen-mt-3KXbV.js       [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist-staging/[22m[36mGear-B-w6O7Z-.js            [39m[1m[2m   43.99 kB[22m[1m[22m[2m │ gzip:  14.15 kB[22m
[2mdist-staging/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist-staging/[22m[36mWizard-D6GDgu4G.js          [39m[1m[2m   77.33 kB[22m[1m[22m[2m │ gzip:  20.79 kB[22m
[2mdist-staging/[22m[36mTripPlan-eNGs30x1.js        [39m[1m[2m  114.78 kB[22m[1m[22m[2m │ gzip:  36.21 kB[22m
[2mdist-staging/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist-staging/[22m[36mindex-BZ-wAQAR.js           [39m[1m[2m  503.70 kB[22m[1m[22m[2m │ gzip: 170.42 kB[22m
[2mdist-staging/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist-staging/[22m[36mIsraelMapGL-BckpArw0.js     [39m[1m[2m1,064.91 kB[22m[1m[22m[2m │ gzip: 289.26 kB[22m
[32m✓ built in 10.21s[39m
```

## rules
```
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2mthe organiser cannot move themselves to another family
[22m[39m[2026-10-30T04:59:18.247Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b2b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22mthe organiser cannot move themselves to another family
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mfamilies are private from each other[2m > [22m[2ma member updates only their own family progress
[22m[39m[2026-10-30T04:59:18.363Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b2e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mfamilies are private from each other[2m > [22ma member updates only their own family progress
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member reads the trip and photos
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member edits shared gear and the plan
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member updates their own last-seen time
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot add someone else
[22m[39m[2026-10-30T04:59:18.736Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b37 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot add someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-30T04:59:18.820Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b39 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-30T04:59:18.859Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b3a error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot change access, owner or invite keys
[22m[39m[2026-10-30T04:59:18.908Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b3b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot change access, owner or invite keys
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mmembers[2m > [22m[2ma member cannot make themselves organiser
[22m[39m[2026-10-30T04:59:19.000Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b3d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mmembers[2m > [22ma member cannot make themselves organiser
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins family B with family B's current key, then reads B only
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join after the organiser's link expiry
[22m[39m[2026-10-30T04:59:19.240Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b44 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join after the organiser's link expiry
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mjoins before the link expiry
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2ma member cannot extend the link expiry
[22m[39m[2026-10-30T04:59:19.451Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b49 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma member cannot extend the link expiry
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join with a wrong key
[22m[39m[2026-10-30T04:59:19.536Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b4b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join with a wrong key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot use family A's key to enter family B
[22m[39m[2026-10-30T04:59:19.619Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b4d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot use family A's key to enter family B
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join as organiser
[22m[39m[2026-10-30T04:59:19.725Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b4f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join as organiser
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjoining with an invite link[2m > [22m[2mcannot join a closed trip with a key
[22m[39m[2026-10-30T04:59:19.853Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b52 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22mcannot join a closed trip with a key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjoining with an invite link[2m > [22ma closed trip takes a request from a Google user, and the requester still cannot read
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-30T04:59:20.178Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b5e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[22m[39m[2026-10-30T04:59:20.217Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b5f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-30T04:59:20.294Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b61 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-30T04:59:20.320Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b62 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L66:24 for 'delete' @ L66, false for 'delete' @ L66

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22mthe organiser hands the trip to their Google id (add it and make it the owner)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member re-joins under their Google id with the key they joined with
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot add another id for someone else
[22m[39m[2026-10-30T04:59:20.581Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b6b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot add another id for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot take ownership
[22m[39m[2026-10-30T04:59:20.646Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b6d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L67:24 for 'update' @ L67, false for 'update' @ L67

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot take ownership
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22ma person reads and writes their own list
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mpersonal trip index (users/{uid})[2m > [22m[2mnobody else can read or change someone's list
[22m[39m[2026-10-30T04:59:20.838Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x89547b74 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L85, false for 'update' @ L85

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mnobody else can read or change someone's list
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mlisting every user is not allowed

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m39 passed[39m[22m[90m (39)[39m
[2m   Start at [22m 04:59:13
[2m   Duration [22m 7.09s[2m (transform 59ms, setup 0ms, collect 198ms, tests 6.51s, environment 0ms, prepare 181ms)[22m

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
✓ e2e-route
✓ e2e-account
✓ e2e-welcome
✓ e2e-selfbuild
✓ overflow-audit
all browser suites passed
```

## deploy
```
To https://github.com/danielbutbika-png/campil
   4390805..9217e77  main -> main
 * [new tag]         deploy-staging-20261030-0507-083af97 -> deploy-staging-20261030-0507-083af97
```
