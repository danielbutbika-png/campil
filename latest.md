# CI 586c66e — 2026-11-01T06:57Z
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
 [32m✓[39m src/intel/dayBuilder.test.ts[2m > [22mbuild my day[2m > [22mcoffee first, the restaurant around lunch, back to base at the end
 [32m✓[39m src/intel/dayBuilder.test.ts[2m > [22mbuild my day[2m > [22mdrive times from routing are used; without them each leg is an estimate
 [32m✓[39m src/intel/dayBuilder.test.ts[2m > [22mbuild my day[2m > [22mchanging a stay length moves everything after it
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22ma recipe is ready when every ingredient and tool is there
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22m"almost" lists what is missing (ingredients and tools count together)
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mready recipes come first; vegan diet filters out eggs
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mbasics like salt and oil are not asked for
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mfinds owned gear from the inventory by name
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mfinds the right knot from an everyday need
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mevery knot is complete: illustration for every step, mistakes, 3-question quiz with a valid answer
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mno knot claims life-safety use, and the safety note says so
 [32m✓[39m src/data/academy/academy.test.ts[2m > [22mCampIL Academy[2m > [22mthe library lists knots and guides with categories
 [32m✓[39m src/services/discover.test.ts[2m > [22mdiscover: OSM → places[2m > [22mcoffee carts are told apart from cafes, with the evidence
 [32m✓[39m src/services/discover.test.ts[2m > [22mdiscover: OSM → places[2m > [22mkashrut and diets only as tagged — never assumed
 [32m✓[39m src/services/discover.test.ts[2m > [22mdiscover: OSM → places[2m > [22mnameless or unrelated elements are dropped; ids are stable
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mdrops older app caches of its own environment
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mkeeps the current build, saved maps and runtime caches
 [32m✓[39m src/lib/sw.test.ts[2m > [22mservice worker cache cleanup[2m > [22mnever touches the other environment
 [32m✓[39m src/engine/planB.test.ts[2m > [22mweather plan B[2m > [22mrain + flood-prone planned place → nearby non-flood alternatives in the same region
 [32m✓[39m src/engine/planB.test.ts[2m > [22mweather plan B[2m > [22mwind avoids exposed places; heat prefers water
 [32m✓[39m src/engine/planB.test.ts[2m > [22mweather plan B[2m > [22mnothing without a real forecast, nothing for booked lodging, nothing when weather is fine
 [32m✓[39m src/lib/tripOps.test.ts[2m > [22mtrip operations[2m > [22ma copy is fresh, dated two weeks ahead, and never linked to the shared original
 [32m✓[39m src/lib/tripOps.test.ts[2m > [22mtrip operations[2m > [22mfinds the trip that ended in the last week, ignoring the example
 [32m✓[39m src/lib/music.test.ts[2m > [22moriginal music (composition)[2m > [22mis deterministic per trip: same seed → same notes; another trip → another tune
 [32m✓[39m src/lib/music.test.ts[2m > [22moriginal music (composition)[2m > [22mevery mood makes a loop of reasonable length, with an intro bar of pad only
 [32m✓[39m src/lib/music.test.ts[2m > [22moriginal music (composition)[2m > [22mcalm has no drums; adventure and happy do
 [32m✓[39m src/lib/music.test.ts[2m > [22moriginal music (composition)[2m > [22mthe random generator is in [0,1)
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
 [32m✓[39m src/lib/openingHours.test.ts[2m > [22mopening_hours (simple forms only)[2m > [22ma Fri–Sat coffee cart is closed on Monday and open Friday morning
 [32m✓[39m src/lib/openingHours.test.ts[2m > [22mopening_hours (simple forms only)[2m > [22mseveral rules, lists, off, 24/7
 [32m✓[39m src/lib/openingHours.test.ts[2m > [22mopening_hours (simple forms only)[2m > [22manything complex is "unknown", never a guess
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mconverts mAh to Wh only with a voltage
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22msums daily use of devices
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mgives a range, not a single number, and reports batteries it cannot count
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22manything on a trip that is not shared, and the organiser always
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22ma member: only their own items, by account id
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22molder items without an account id: by name
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mreads the date a photo was taken from EXIF
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mpicks photos spread over the whole trip, keeping first and last
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mvideo length = intro + photos × seconds + ending
 [32m✓[39m src/services/detour.test.ts[2m > [22mdetour from a routing matrix[2m > [22ma stop on the road adds ~0 minutes; a side trip adds the extra driving
 [32m✓[39m src/services/detour.test.ts[2m > [22mdetour from a routing matrix[2m > [22mmissing routes → null for that stop
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mreads a track: name, waypoints, distance and climb
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22msimplifies a straight line to its ends but keeps distance from the original
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mkeeps corners when simplifying
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mrejects files that are not GPX
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mexports a valid GPX that reads back the same places and track

[2m Test Files [22m [1m[32m39 passed[39m[22m[90m (39)[39m
[2m      Tests [22m [1m[32m266 passed[39m[22m[90m (266)[39m
[2m   Start at [22m 06:46:17
[2m   Duration [22m 5.48s[2m (transform 1.43s, setup 0ms, collect 3.11s, tests 662ms, environment 392ms, prepare 3.73s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2246 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, /home/runner/work/campil/campil/src/screens/trip/JournalTab.tsx, dynamic import will not move module into another chunk.
[39m
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/services/placesDb.ts is dynamically imported by /home/runner/work/campil/campil/src/components/SiteCard.tsx but also statically imported by /home/runner/work/campil/campil/src/components/DayIdeas.tsx, /home/runner/work/campil/campil/src/components/DestSearch.tsx, /home/runner/work/campil/campil/src/intel/dayPlan.ts, /home/runner/work/campil/campil/src/intel/placeFit.ts, /home/runner/work/campil/campil/src/screens/Destination.tsx, /home/runner/work/campil/campil/src/screens/Places.tsx, /home/runner/work/campil/campil/src/screens/Wizard.tsx, /home/runner/work/campil/campil/src/services/discover.ts, /home/runner/work/campil/campil/src/services/gazetteer.ts, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html                 [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-C4Cq21u9.css         [39m[1m[2m   47.86 kB[22m[1m[22m[2m │ gzip:   9.62 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css   [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36mchevron-down-BrDlVqXq.js   [39m[1m[2m    0.33 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m
[2mdist/[22m[36msearch-BwNgkdHI.js         [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist/[22m[36mrotate-ccw-DKaw_ErR.js     [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-BIJ36e-X.js         [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36mroute-REJwQh9W.js          [39m[1m[2m    0.46 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m
[2mdist/[22m[36mchef-hat-BBWQSRT_.js       [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36mprinter-fAE9eygZ.js        [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m
[2mdist/[22m[36mpackage-Dox_qVVm.js        [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-DXMDZApI.js            [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js      [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js            [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-DVAc6p6y.js          [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mrouting-BIVxrImF.js        [39m[1m[2m    3.79 kB[22m[1m[22m[2m │ gzip:   2.09 kB[22m
[2mdist/[22m[36mplaces-D1Q9TkrR.js         [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[36mJoin-BYyOYTnj.js           [39m[1m[2m    4.16 kB[22m[1m[22m[2m │ gzip:   2.13 kB[22m
[2mdist/[22m[36mmusic-B3UuOYx3.js          [39m[1m[2m    4.58 kB[22m[1m[22m[2m │ gzip:   2.02 kB[22m
[2mdist/[22m[36mRouteFuel-u3RyMSM4.js      [39m[1m[2m    5.13 kB[22m[1m[22m[2m │ gzip:   2.51 kB[22m
[2mdist/[22m[36mplaceFit-BMfiBwvO.js       [39m[1m[2m    5.15 kB[22m[1m[22m[2m │ gzip:   2.84 kB[22m
[2mdist/[22m[36mJournalTab-B4mRBR9l.js     [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.17 kB[22m
[2mdist/[22m[36mCook-DHwejHYn.js           [39m[1m[2m    7.37 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist/[22m[36mMapScreen-CdPhghDN.js      [39m[1m[2m    7.39 kB[22m[1m[22m[2m │ gzip:   3.14 kB[22m
[2mdist/[22m[36mDesignSystem-B4S1gqJY.js   [39m[1m[2m    7.71 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist/[22m[36mExplore-Cn12dzNA.js        [39m[1m[2m    8.98 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist/[22m[36mIsraelMap-BPE9ksdR.js      [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mPlaces-DbOog_aJ.js         [39m[1m[2m    9.91 kB[22m[1m[22m[2m │ gzip:   4.36 kB[22m
[2mdist/[22m[36mCampSearch-DGeoQ8X3.js     [39m[1m[2m   10.88 kB[22m[1m[22m[2m │ gzip:   4.94 kB[22m
[2mdist/[22m[36mVehiclePicker-MHejBnXb.js  [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-C2JG04KB.js        [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist/[22m[36mMore-CdqMwOu0.js           [39m[1m[2m   19.50 kB[22m[1m[22m[2m │ gzip:   7.74 kB[22m
[2mdist/[22m[36mWhereTo-DMsdpGPr.js        [39m[1m[2m   22.41 kB[22m[1m[22m[2m │ gzip:   7.63 kB[22m
[2mdist/[22m[36mDiscover-CrbCuHBg.js       [39m[1m[2m   27.12 kB[22m[1m[22m[2m │ gzip:  10.52 kB[22m
[2mdist/[22m[36mDestination-BwT81g2R.js    [39m[1m[2m   27.44 kB[22m[1m[22m[2m │ gzip:   9.12 kB[22m
[2mdist/[22m[36mBoxScreen-9LfIVM5J.js      [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist/[22m[36mGear-C8UC6y4B.js           [39m[1m[2m   43.76 kB[22m[1m[22m[2m │ gzip:  14.14 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js      [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-CAvS66zP.js         [39m[1m[2m   73.95 kB[22m[1m[22m[2m │ gzip:  20.01 kB[22m
[2mdist/[22m[36mTripPlan-Ba5YXLTn.js       [39m[1m[2m  135.99 kB[22m[1m[22m[2m │ gzip:  43.33 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js      [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-CApTCXpN.js          [39m[1m[2m  552.04 kB[22m[1m[22m[2m │ gzip: 187.48 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js      [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-DZsLBen9.js    [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 8.84s[39m
[36mvite v5.4.21 [32mbuilding for staging...[36m[39m
transforming...
[32m✓[39m 2246 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, /home/runner/work/campil/campil/src/screens/trip/JournalTab.tsx, dynamic import will not move module into another chunk.
[39m
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/services/placesDb.ts is dynamically imported by /home/runner/work/campil/campil/src/components/SiteCard.tsx but also statically imported by /home/runner/work/campil/campil/src/components/DayIdeas.tsx, /home/runner/work/campil/campil/src/components/DestSearch.tsx, /home/runner/work/campil/campil/src/intel/dayPlan.ts, /home/runner/work/campil/campil/src/intel/placeFit.ts, /home/runner/work/campil/campil/src/screens/Destination.tsx, /home/runner/work/campil/campil/src/screens/Places.tsx, /home/runner/work/campil/campil/src/screens/Wizard.tsx, /home/runner/work/campil/campil/src/services/discover.ts, /home/runner/work/campil/campil/src/services/gazetteer.ts, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist-staging/[22m[32mindex.html                 [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist-staging/[22m[35mindex-C4Cq21u9.css         [39m[1m[2m   47.86 kB[22m[1m[22m[2m │ gzip:   9.62 kB[22m
[2mdist-staging/[22m[35mIsraelMapGL-KizArRWY.css   [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist-staging/[22m[36mchevron-down-C62AVBH9.js   [39m[1m[2m    0.33 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m
[2mdist-staging/[22m[36msearch-D_TTETuE.js         [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist-staging/[22m[36mrotate-ccw-BdLjjmq-.js     [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist-staging/[22m[36mupload-BuJryyB0.js         [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist-staging/[22m[36mroute-Dv7WWyPQ.js          [39m[1m[2m    0.46 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m
[2mdist-staging/[22m[36mchef-hat-BvWqmHDd.js       [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist-staging/[22m[36mprinter-CKx1jPw6.js        [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m
[2mdist-staging/[22m[36mpackage-CGAS7e-H.js        [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist-staging/[22m[36mcar-DMiFhWTF.js            [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist-staging/[22m[36mindex.esm-B4Jzzju4.js      [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist-staging/[22m[36mosm-dRGSVYye.js            [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist-staging/[22m[36mTrips-DTLrhhlZ.js          [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist-staging/[22m[36mrouting-Bp90pMQi.js        [39m[1m[2m    3.79 kB[22m[1m[22m[2m │ gzip:   2.09 kB[22m
[2mdist-staging/[22m[36mplaces-D1Q9TkrR.js         [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist-staging/[22m[36mJoin-NEysrIZ4.js           [39m[1m[2m    4.16 kB[22m[1m[22m[2m │ gzip:   2.13 kB[22m
[2mdist-staging/[22m[36mmusic-B3UuOYx3.js          [39m[1m[2m    4.58 kB[22m[1m[22m[2m │ gzip:   2.02 kB[22m
[2mdist-staging/[22m[36mRouteFuel-qv7H4hjl.js      [39m[1m[2m    5.13 kB[22m[1m[22m[2m │ gzip:   2.52 kB[22m
[2mdist-staging/[22m[36mplaceFit-D0qamziE.js       [39m[1m[2m    5.15 kB[22m[1m[22m[2m │ gzip:   2.84 kB[22m
[2mdist-staging/[22m[36mJournalTab-CMzGqkRB.js     [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.17 kB[22m
[2mdist-staging/[22m[36mCook-cVkoiq53.js           [39m[1m[2m    7.37 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist-staging/[22m[36mMapScreen-CZbvl8OY.js      [39m[1m[2m    7.39 kB[22m[1m[22m[2m │ gzip:   3.14 kB[22m
[2mdist-staging/[22m[36mDesignSystem-C9h4n6UM.js   [39m[1m[2m    7.71 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist-staging/[22m[36mExplore-DNKYl2FB.js        [39m[1m[2m    8.98 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist-staging/[22m[36mIsraelMap-DMQ9LBNA.js      [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist-staging/[22m[36mPlaces-DwkeTmoB.js         [39m[1m[2m    9.91 kB[22m[1m[22m[2m │ gzip:   4.36 kB[22m
[2mdist-staging/[22m[36mCampSearch-C_611mST.js     [39m[1m[2m   10.88 kB[22m[1m[22m[2m │ gzip:   4.95 kB[22m
[2mdist-staging/[22m[36mVehiclePicker-Bqwvq65b.js  [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist-staging/[22m[36mAcademy-DA2Up2TT.js        [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist-staging/[22m[36mMore-DcdKR7zu.js           [39m[1m[2m   19.50 kB[22m[1m[22m[2m │ gzip:   7.74 kB[22m
[2mdist-staging/[22m[36mWhereTo-BT3zqQTO.js        [39m[1m[2m   22.41 kB[22m[1m[22m[2m │ gzip:   7.63 kB[22m
[2mdist-staging/[22m[36mDiscover-B-uIxHWV.js       [39m[1m[2m   27.12 kB[22m[1m[22m[2m │ gzip:  10.52 kB[22m
[2mdist-staging/[22m[36mDestination-DAEBn3CY.js    [39m[1m[2m   27.44 kB[22m[1m[22m[2m │ gzip:   9.11 kB[22m
[2mdist-staging/[22m[36mBoxScreen-MemzFRdG.js      [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist-staging/[22m[36mGear-C5GGBDQH.js           [39m[1m[2m   43.76 kB[22m[1m[22m[2m │ gzip:  14.14 kB[22m
[2mdist-staging/[22m[36mindex.esm-CCAWpmwl.js      [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist-staging/[22m[36mWizard-BP02J6dP.js         [39m[1m[2m   73.95 kB[22m[1m[22m[2m │ gzip:  20.01 kB[22m
[2mdist-staging/[22m[36mTripPlan-CUzk4lu0.js       [39m[1m[2m  135.99 kB[22m[1m[22m[2m │ gzip:  43.34 kB[22m
[2mdist-staging/[22m[36mindex.esm-D_Ez9UD8.js      [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist-staging/[22m[36mindex-Bj0B2qjJ.js          [39m[1m[2m  552.24 kB[22m[1m[22m[2m │ gzip: 187.58 kB[22m
[2mdist-staging/[22m[36mindex.esm-1jP3d1p-.js      [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist-staging/[22m[36mIsraelMapGL-Cl4N-guZ.js    [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 8.77s[39m
```

## rules
```
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-11-01T06:46:45.177Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d593 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-11-01T06:46:45.198Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d594 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L79:24 for 'delete' @ L79, false for 'delete' @ L79

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22mthe organiser hands the trip to their Google id (add it and make it the owner)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member re-joins under their Google id with the key they joined with
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot add another id for someone else
[22m[39m[2026-11-01T06:46:45.417Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d59d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot add another id for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot take ownership
[22m[39m[2026-11-01T06:46:45.469Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d59f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot take ownership
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22ma person reads and writes their own list
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mpersonal trip index (users/{uid})[2m > [22m[2mnobody else can read or change someone's list
[22m[39m[2026-11-01T06:46:45.617Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5a6 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L130, false for 'update' @ L130

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mnobody else can read or change someone's list
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mlisting every user is not allowed
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member adds a photo as themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma member cannot add an item in someone else's name
[22m[39m[2026-11-01T06:46:45.822Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5af error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'create' @ L121

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member cannot add an item in someone else's name
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-11-01T06:46:45.884Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5b2 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L124:26 for 'delete' @ L124, false for 'delete' @ L124

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-11-01T06:46:45.905Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5b3 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L121:26 for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-11-01T06:46:45.929Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5b4 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22manother family cannot delete or overwrite a member's photo
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author edits and deletes their own photo
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2mthe author cannot hand the item to someone else
[22m[39m[2026-11-01T06:46:46.076Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5bb error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author cannot hand the item to someone else
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe organiser may remove any item
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22molder items without an author id stay editable by members (no data migration needed)
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma removed member or a stranger cannot add items
[22m[39m[2026-11-01T06:46:46.264Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5c4 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L121:26 for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'create' @ L121

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma removed member or a stranger cannot add items
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe shared trip document no longer carries any key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member reads only their own family's key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mthe organiser reads every key and may replace one; members and strangers may not write
[22m[39m[2026-11-01T06:46:46.557Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5d1 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L88:25 for 'create' @ L88, evaluation error at L88:25 for 'update' @ L88, false for 'update' @ L88

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser reads every key and may replace one; members and strangers may not write
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma newcomer with the right key joins: join record, then their own entry (no key in it)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record is readable only by its owner
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-11-01T06:46:46.850Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5df error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-11-01T06:46:46.873Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5e0 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma wrong key, or the key of another family, is refused
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mwithout a join record nobody can add themselves
[22m[39m[2026-11-01T06:46:46.953Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5e3 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mwithout a join record nobody can add themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma join record cannot be written for someone else
[22m[39m[2026-11-01T06:46:47.017Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5e6 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L97, false for 'update' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record cannot be written for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-11-01T06:46:47.124Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5ea error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-11-01T06:46:47.143Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5eb error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'update' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mafter the organiser replaces the key, an old join record no longer lets anyone in
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2man expired link admits nobody, even with the right key
[22m[39m[2026-11-01T06:46:47.233Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5ef error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22man expired link admits nobody, even with the right key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser removes the old keys from the shared document and from member entries
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma member cannot remove or change keys in the shared document
[22m[39m[2026-11-01T06:46:47.459Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7c53d5f7 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member cannot remove or change keys in the shared document

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m59 passed[39m[22m[90m (59)[39m
[2m   Start at [22m 06:46:39
[2m   Duration [22m 7.98s[2m (transform 64ms, setup 0ms, collect 184ms, tests 7.45s, environment 0ms, prepare 150ms)[22m

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
✓ e2e-dayplan
✓ e2e-shortlink
✓ e2e-location
✓ e2e-discover
✓ overflow-audit
all browser suites passed
```

## deploy
```
To https://github.com/danielbutbika-png/campil
   48742aa..5051dcc  main -> main
 * [new tag]         deploy-staging-20261101-0656-586c66e -> deploy-staging-20261101-0656-586c66e
```
