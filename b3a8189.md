# CI b3a8189 — 2026-10-31T05:38Z
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
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22muses entered volume first, otherwise computes from dimensions, otherwise unknown
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22madds months without overflowing short months
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mknows when a periodic check is due
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mlists only upcoming trips that still pack the item
 [32m✓[39m src/engine/warehouse.test.ts[2m > [22mwarehouse[2m > [22mtotals only entered data and reports what is missing
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
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: ink on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: ink on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: ink on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: muted on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: muted on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: muted on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: moss on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: moss on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: moss on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: earth on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: earth on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: earth on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: sunset on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: sunset on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: sunset on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: info on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: info on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: info on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: forest on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: forest on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: forest on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: danger on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: danger on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: danger on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: warn on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: warn on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: warn on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: ok on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: ok on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: ok on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mlight: onforest on forest
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: ink on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: ink on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: ink on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: muted on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: muted on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: muted on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: moss on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: moss on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: moss on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: earth on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: earth on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: earth on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: sunset on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: sunset on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: sunset on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: info on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: info on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: info on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: forest on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: forest on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: forest on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: danger on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: danger on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: danger on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: warn on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: warn on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: warn on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: ok on bg
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: ok on surface
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: ok on raised
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mdark: onforest on forest
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mwhite text on the main buttons (forest, sunset) passes too
 [32m✓[39m src/lib/contrast.test.ts[2m > [22mOutdoor Design System — WCAG AA contrast (4.5:1 for text)[2m > [22mthe decorative sunset is not used for text (documented: under 4.5:1)
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mconverts mAh to Wh only with a voltage
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22msums daily use of devices
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mgives a range, not a single number, and reports batteries it cannot count
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22manything on a trip that is not shared, and the organiser always
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22ma member: only their own items, by account id
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22molder items without an account id: by name
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mreads the date a photo was taken from EXIF
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mpicks photos spread over the whole trip, keeping first and last
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mvideo length = intro + photos × seconds + ending
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mreads a track: name, waypoints, distance and climb
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22msimplifies a straight line to its ends but keeps distance from the original
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mkeeps corners when simplifying
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mrejects files that are not GPX
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mexports a valid GPX that reads back the same places and track

[2m Test Files [22m [1m[32m30 passed[39m[22m[90m (30)[39m
[2m      Tests [22m [1m[32m226 passed[39m[22m[90m (226)[39m
[2m   Start at [22m 05:29:30
[2m   Duration [22m 3.07s[2m (transform 889ms, setup 0ms, collect 1.90s, tests 316ms, environment 279ms, prepare 1.89s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2232 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, /home/runner/work/campil/campil/src/screens/trip/JournalTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-Dii-n6Wd.css          [39m[1m[2m   47.37 kB[22m[1m[22m[2m │ gzip:   9.49 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36msearch-DvdXNJ0M.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist/[22m[36mrotate-ccw-BrPm97HN.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-D-jO1qPP.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mchef-hat-B0Dk7_sS.js        [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36mprinter-DAmzoAD0.js         [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36mpackage-BT0DDAzx.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-DXMO4Wp2.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist/[22m[36mfootprints-BAD5sjap.js      [39m[1m[2m    0.65 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-8TA-gFLx.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mplaces-D1Q9TkrR.js          [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[36mJoin-BDvAt-yZ.js            [39m[1m[2m    4.15 kB[22m[1m[22m[2m │ gzip:   2.12 kB[22m
[2mdist/[22m[36mplaceFit-C4dENL-p.js        [39m[1m[2m    4.67 kB[22m[1m[22m[2m │ gzip:   2.61 kB[22m
[2mdist/[22m[36mplacesDb-oEBMmsw0.js        [39m[1m[2m    4.70 kB[22m[1m[22m[2m │ gzip:   2.50 kB[22m
[2mdist/[22m[36mRouteFuel-CYAb82ZV.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.59 kB[22m
[2mdist/[22m[36mJournalTab-DYUm7_xR.js      [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.16 kB[22m
[2mdist/[22m[36mMapScreen-hh-lDKWW.js       [39m[1m[2m    7.36 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist/[22m[36mCook-9-ub1-OK.js            [39m[1m[2m    7.38 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist/[22m[36mDesignSystem-DxBMABXg.js    [39m[1m[2m    7.72 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist/[22m[36mExplore-CNryoAKn.js         [39m[1m[2m    8.99 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist/[22m[36mIsraelMap-Cd5bw05O.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mPlaces-DnbIwWJ3.js          [39m[1m[2m    9.97 kB[22m[1m[22m[2m │ gzip:   4.38 kB[22m
[2mdist/[22m[36mCampSearch-B112nC1v.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.93 kB[22m
[2mdist/[22m[36mTripTypePicker-CsLvZyci.js  [39m[1m[2m   10.86 kB[22m[1m[22m[2m │ gzip:   3.82 kB[22m
[2mdist/[22m[36mVehiclePicker-DwHjBIFn.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-DLdaGZmH.js         [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.75 kB[22m
[2mdist/[22m[36mMore-Dp3eSQwB.js            [39m[1m[2m   19.48 kB[22m[1m[22m[2m │ gzip:   7.73 kB[22m
[2mdist/[22m[36mDestination-BtLjM-Q-.js     [39m[1m[2m   27.56 kB[22m[1m[22m[2m │ gzip:   9.18 kB[22m
[2mdist/[22m[36mBoxScreen-DZT8TE65.js       [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist/[22m[36mGear-CCs7_cRt.js            [39m[1m[2m   43.99 kB[22m[1m[22m[2m │ gzip:  14.16 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-BktKRumP.js          [39m[1m[2m   77.33 kB[22m[1m[22m[2m │ gzip:  20.79 kB[22m
[2mdist/[22m[36mTripPlan-Dpybaf6P.js        [39m[1m[2m  125.08 kB[22m[1m[22m[2m │ gzip:  39.98 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-BIyohtjd.js           [39m[1m[2m  531.88 kB[22m[1m[22m[2m │ gzip: 179.30 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-DgIWIkOm.js     [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 6.61s[39m
[36mvite v5.4.21 [32mbuilding for staging...[36m[39m
transforming...
[32m✓[39m 2232 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, /home/runner/work/campil/campil/src/screens/trip/JournalTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist-staging/[22m[32mindex.html                  [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist-staging/[22m[35mindex-Dii-n6Wd.css          [39m[1m[2m   47.37 kB[22m[1m[22m[2m │ gzip:   9.49 kB[22m
[2mdist-staging/[22m[35mIsraelMapGL-KizArRWY.css    [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist-staging/[22m[36msearch-Cs8jo2qF.js          [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist-staging/[22m[36mrotate-ccw-B3rwAVz8.js      [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist-staging/[22m[36mupload-CpB96Lzf.js          [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist-staging/[22m[36mchef-hat-CKWC7-Sc.js        [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist-staging/[22m[36mprinter-CRMXSPXz.js         [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m
[2mdist-staging/[22m[36mpackage-C3dNBtcY.js         [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist-staging/[22m[36mcar-rDfaemFm.js             [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist-staging/[22m[36mfootprints-BL20ZKn8.js      [39m[1m[2m    0.65 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m
[2mdist-staging/[22m[36mindex.esm-B4Jzzju4.js       [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist-staging/[22m[36mosm-dRGSVYye.js             [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist-staging/[22m[36mTrips-BPePPvpn.js           [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist-staging/[22m[36mplaces-D1Q9TkrR.js          [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist-staging/[22m[36mJoin-CIdWpyO6.js            [39m[1m[2m    4.15 kB[22m[1m[22m[2m │ gzip:   2.12 kB[22m
[2mdist-staging/[22m[36mplaceFit-BEtkVnVf.js        [39m[1m[2m    4.67 kB[22m[1m[22m[2m │ gzip:   2.61 kB[22m
[2mdist-staging/[22m[36mplacesDb-DSPI9ieS.js        [39m[1m[2m    4.70 kB[22m[1m[22m[2m │ gzip:   2.50 kB[22m
[2mdist-staging/[22m[36mRouteFuel-_nL82S44.js       [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist-staging/[22m[36mJournalTab-DcR2DpDe.js      [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.17 kB[22m
[2mdist-staging/[22m[36mMapScreen-BTrlqhGG.js       [39m[1m[2m    7.36 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist-staging/[22m[36mCook-DHOfMDzY.js            [39m[1m[2m    7.38 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist-staging/[22m[36mDesignSystem-BCvb_Aez.js    [39m[1m[2m    7.72 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist-staging/[22m[36mExplore-DNqpGoUs.js         [39m[1m[2m    8.99 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist-staging/[22m[36mIsraelMap-Cz_Utbsk.js       [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist-staging/[22m[36mPlaces-Co1040SX.js          [39m[1m[2m    9.97 kB[22m[1m[22m[2m │ gzip:   4.38 kB[22m
[2mdist-staging/[22m[36mCampSearch-Bps5uDcH.js      [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.92 kB[22m
[2mdist-staging/[22m[36mTripTypePicker-CaaDSdTA.js  [39m[1m[2m   10.86 kB[22m[1m[22m[2m │ gzip:   3.82 kB[22m
[2mdist-staging/[22m[36mVehiclePicker-CcfkufIQ.js   [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist-staging/[22m[36mAcademy-GXqZ-To1.js         [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.75 kB[22m
[2mdist-staging/[22m[36mMore-Dj6oyTMt.js            [39m[1m[2m   19.48 kB[22m[1m[22m[2m │ gzip:   7.72 kB[22m
[2mdist-staging/[22m[36mDestination-BS714NZr.js     [39m[1m[2m   27.56 kB[22m[1m[22m[2m │ gzip:   9.18 kB[22m
[2mdist-staging/[22m[36mBoxScreen-BIQCojVg.js       [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist-staging/[22m[36mGear-DRUMGOwj.js            [39m[1m[2m   43.99 kB[22m[1m[22m[2m │ gzip:  14.15 kB[22m
[2mdist-staging/[22m[36mindex.esm-CCAWpmwl.js       [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist-staging/[22m[36mWizard-B2b6ZoCB.js          [39m[1m[2m   77.33 kB[22m[1m[22m[2m │ gzip:  20.79 kB[22m
[2mdist-staging/[22m[36mTripPlan-CJZgvW9O.js        [39m[1m[2m  125.08 kB[22m[1m[22m[2m │ gzip:  39.98 kB[22m
[2mdist-staging/[22m[36mindex.esm-D_Ez9UD8.js       [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist-staging/[22m[36mindex-Cl8alKzZ.js           [39m[1m[2m  532.08 kB[22m[1m[22m[2m │ gzip: 179.37 kB[22m
[2mdist-staging/[22m[36mindex.esm-1jP3d1p-.js       [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist-staging/[22m[36mIsraelMapGL-XWUowVka.js     [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 6.43s[39m
```

## rules
```
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-31T05:29:49.872Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad113 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-31T05:29:49.888Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad114 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L79:24 for 'delete' @ L79, false for 'delete' @ L79

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22mthe organiser hands the trip to their Google id (add it and make it the owner)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member re-joins under their Google id with the key they joined with
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot add another id for someone else
[22m[39m[2026-10-31T05:29:50.054Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad11d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot add another id for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot take ownership
[22m[39m[2026-10-31T05:29:50.101Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad11f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot take ownership
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22ma person reads and writes their own list
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mpersonal trip index (users/{uid})[2m > [22m[2mnobody else can read or change someone's list
[22m[39m[2026-10-31T05:29:50.203Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad126 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L130, false for 'update' @ L130

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mnobody else can read or change someone's list
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mlisting every user is not allowed
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member adds a photo as themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma member cannot add an item in someone else's name
[22m[39m[2026-10-31T05:29:50.347Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad12f error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'create' @ L121

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member cannot add an item in someone else's name
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-10-31T05:29:50.391Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad132 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L124:26 for 'delete' @ L124, false for 'delete' @ L124

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-10-31T05:29:50.404Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad133 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L121:26 for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-10-31T05:29:50.419Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad134 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22manother family cannot delete or overwrite a member's photo
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author edits and deletes their own photo
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2mthe author cannot hand the item to someone else
[22m[39m[2026-10-31T05:29:50.563Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad13b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author cannot hand the item to someone else
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe organiser may remove any item
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22molder items without an author id stay editable by members (no data migration needed)
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma removed member or a stranger cannot add items
[22m[39m[2026-10-31T05:29:50.722Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad144 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L121:26 for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'create' @ L121

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma removed member or a stranger cannot add items
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe shared trip document no longer carries any key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member reads only their own family's key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mthe organiser reads every key and may replace one; members and strangers may not write
[22m[39m[2026-10-31T05:29:50.950Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad151 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L88:25 for 'create' @ L88, evaluation error at L88:25 for 'update' @ L88, false for 'update' @ L88

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser reads every key and may replace one; members and strangers may not write
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma newcomer with the right key joins: join record, then their own entry (no key in it)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record is readable only by its owner
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-10-31T05:29:51.196Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad15f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-10-31T05:29:51.216Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad160 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma wrong key, or the key of another family, is refused
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mwithout a join record nobody can add themselves
[22m[39m[2026-10-31T05:29:51.295Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad163 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mwithout a join record nobody can add themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma join record cannot be written for someone else
[22m[39m[2026-10-31T05:29:51.349Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad166 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L97, false for 'update' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record cannot be written for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-10-31T05:29:51.416Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad16a error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-10-31T05:29:51.437Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad16b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'update' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mafter the organiser replaces the key, an old join record no longer lets anyone in
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2man expired link admits nobody, even with the right key
[22m[39m[2026-10-31T05:29:51.509Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad16f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22man expired link admits nobody, even with the right key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser removes the old keys from the shared document and from member entries
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma member cannot remove or change keys in the shared document
[22m[39m[2026-10-31T05:29:51.653Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x4c1ad177 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member cannot remove or change keys in the shared document

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m59 passed[39m[22m[90m (59)[39m
[2m   Start at [22m 05:29:46
[2m   Duration [22m 5.61s[2m (transform 42ms, setup 0ms, collect 116ms, tests 5.27s, environment 0ms, prepare 83ms)[22m

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
✓ e2e-freetext
✓ e2e-intel
✓ e2e-actions
✓ e2e-destination
✓ overflow-audit
all browser suites passed
```

## deploy
```
To https://github.com/danielbutbika-png/campil
   8dabf9a..a6bccd8  main -> main
 * [new tag]         deploy-staging-20261031-0538-b3a8189 -> deploy-staging-20261031-0538-b3a8189
```
