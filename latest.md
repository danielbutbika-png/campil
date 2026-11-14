# CI 27a7433 — 2026-11-14T10:29Z
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
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22ma recipe is ready when every ingredient and tool is there
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22m"almost" lists what is missing (ingredients and tools count together)
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mready recipes come first; vegan diet filters out eggs
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mbasics like salt and oil are not asked for
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mfinds owned gear from the inventory by name
 [32m✓[39m src/services/discover.test.ts[2m > [22mdiscover: OSM → places[2m > [22mcoffee carts are told apart from cafes, with the evidence
 [32m✓[39m src/services/discover.test.ts[2m > [22mdiscover: OSM → places[2m > [22mkashrut and diets only as tagged — never assumed
 [32m✓[39m src/services/discover.test.ts[2m > [22mdiscover: OSM → places[2m > [22mnameless or unrelated elements are dropped; ids are stable
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
 [32m✓[39m src/data/sites.test.ts[2m > [22msite catalogue[2m > [22mhas unique ids, known regions and coordinates inside Israel
 [32m✓[39m src/data/sites.test.ts[2m > [22msite catalogue[2m > [22mincludes the guide places, credited and unverified
 [32m✓[39m src/data/sites.test.ts[2m > [22msite catalogue[2m > [22mdoes not duplicate a place already in the catalogue by name
 [32m✓[39m src/lib/openingHours.test.ts[2m > [22mopening_hours (simple forms only)[2m > [22ma Fri–Sat coffee cart is closed on Monday and open Friday morning
 [32m✓[39m src/lib/openingHours.test.ts[2m > [22mopening_hours (simple forms only)[2m > [22mseveral rules, lists, off, 24/7
 [32m✓[39m src/lib/openingHours.test.ts[2m > [22mopening_hours (simple forms only)[2m > [22manything complex is "unknown", never a guess
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22manything on a trip that is not shared, and the organiser always
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22ma member: only their own items, by account id
 [32m✓[39m src/lib/authorship.test.ts[2m > [22mwho may change a journal entry or photo[2m > [22molder items without an account id: by name
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mconverts mAh to Wh only with a voltage
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22msums daily use of devices
 [32m✓[39m src/engine/power.test.ts[2m > [22mpower calculator[2m > [22mgives a range, not a single number, and reports batteries it cannot count
 [32m✓[39m src/services/detour.test.ts[2m > [22mdetour from a routing matrix[2m > [22ma stop on the road adds ~0 minutes; a side trip adds the extra driving
 [32m✓[39m src/services/detour.test.ts[2m > [22mdetour from a routing matrix[2m > [22mmissing routes → null for that stop
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mreads the date a photo was taken from EXIF
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mpicks photos spread over the whole trip, keeping first and last
 [32m✓[39m src/engine/album.test.ts[2m > [22malbum[2m > [22mvideo length = intro + photos × seconds + ending
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mreads a track: name, waypoints, distance and climb
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22msimplifies a straight line to its ends but keeps distance from the original
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mkeeps corners when simplifying
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mrejects files that are not GPX
 [32m✓[39m src/engine/gpx.test.ts[2m > [22mGPX[2m > [22mexports a valid GPX that reads back the same places and track

[2m Test Files [22m [1m[32m40 passed[39m[22m[90m (40)[39m
[2m      Tests [22m [1m[32m269 passed[39m[22m[90m (269)[39m
[2m   Start at [22m 10:18:27
[2m   Duration [22m 4.00s[2m (transform 1.15s, setup 0ms, collect 2.46s, tests 466ms, environment 337ms, prepare 2.65s)[22m

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
[2mdist/[22m[35mindex-C_EvkipB.css         [39m[1m[2m   48.06 kB[22m[1m[22m[2m │ gzip:   9.66 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css   [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36mchevron-down-DzY0oHcM.js   [39m[1m[2m    0.33 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m
[2mdist/[22m[36msearch-gJiTVXm0.js         [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist/[22m[36mrotate-ccw-DgbK6vOq.js     [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-D8VQD09Q.js         [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36mroute-DTqs87lA.js          [39m[1m[2m    0.46 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m
[2mdist/[22m[36mchef-hat-CidkN9I0.js       [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36mprinter-CYlkSMvM.js        [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36mpackage-Df-yVV6j.js        [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-JxaMBcm2.js            [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js      [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js            [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-nQtn1s2T.js          [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mrouting-DDDhO7lS.js        [39m[1m[2m    3.79 kB[22m[1m[22m[2m │ gzip:   2.09 kB[22m
[2mdist/[22m[36mplaces-D1Q9TkrR.js         [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[36mJoin-Cxg_7pTn.js           [39m[1m[2m    4.16 kB[22m[1m[22m[2m │ gzip:   2.13 kB[22m
[2mdist/[22m[36mmusic-B3UuOYx3.js          [39m[1m[2m    4.58 kB[22m[1m[22m[2m │ gzip:   2.02 kB[22m
[2mdist/[22m[36mRouteFuel-D4-eUyqQ.js      [39m[1m[2m    5.13 kB[22m[1m[22m[2m │ gzip:   2.51 kB[22m
[2mdist/[22m[36mplaceFit-5mO0wmor.js       [39m[1m[2m    5.15 kB[22m[1m[22m[2m │ gzip:   2.84 kB[22m
[2mdist/[22m[36mJournalTab-BQNwsVU_.js     [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.17 kB[22m
[2mdist/[22m[36mCook-Be9e0LO0.js           [39m[1m[2m    7.37 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist/[22m[36mMapScreen-C__I1Hx9.js      [39m[1m[2m    7.39 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist/[22m[36mDesignSystem-CHlvW9fM.js   [39m[1m[2m    7.71 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist/[22m[36mExplore-Dpu2Bti0.js        [39m[1m[2m    8.98 kB[22m[1m[22m[2m │ gzip:   3.77 kB[22m
[2mdist/[22m[36mIsraelMap-C0C5Zhbi.js      [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mPlaces-DDcHcXj_.js         [39m[1m[2m    9.91 kB[22m[1m[22m[2m │ gzip:   4.36 kB[22m
[2mdist/[22m[36mCampSearch-BXQWP0aR.js     [39m[1m[2m   10.88 kB[22m[1m[22m[2m │ gzip:   4.94 kB[22m
[2mdist/[22m[36mVehiclePicker-gNDBWgo-.js  [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-CPFLqfMn.js        [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist/[22m[36mMore-B7iMNjWf.js           [39m[1m[2m   19.50 kB[22m[1m[22m[2m │ gzip:   7.74 kB[22m
[2mdist/[22m[36mWhereTo-MmCKguCM.js        [39m[1m[2m   22.41 kB[22m[1m[22m[2m │ gzip:   7.63 kB[22m
[2mdist/[22m[36mDiscover-CPj8n0fZ.js       [39m[1m[2m   27.12 kB[22m[1m[22m[2m │ gzip:  10.52 kB[22m
[2mdist/[22m[36mDestination-DMIXsiAQ.js    [39m[1m[2m   27.49 kB[22m[1m[22m[2m │ gzip:   9.14 kB[22m
[2mdist/[22m[36mBoxScreen-CRuQMfPA.js      [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist/[22m[36mGear-Ddfd0P-q.js           [39m[1m[2m   43.76 kB[22m[1m[22m[2m │ gzip:  14.13 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js      [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-KBxYg-_A.js         [39m[1m[2m   73.95 kB[22m[1m[22m[2m │ gzip:  20.01 kB[22m
[2mdist/[22m[36mTripPlan-qu0ZkmEg.js       [39m[1m[2m  140.26 kB[22m[1m[22m[2m │ gzip:  44.59 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js      [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-CzEHq-7f.js          [39m[1m[2m  579.97 kB[22m[1m[22m[2m │ gzip: 194.29 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js      [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-gztZfnXN.js    [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 6.87s[39m
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
[2mdist-staging/[22m[35mindex-C_EvkipB.css         [39m[1m[2m   48.06 kB[22m[1m[22m[2m │ gzip:   9.66 kB[22m
[2mdist-staging/[22m[35mIsraelMapGL-KizArRWY.css   [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist-staging/[22m[36mchevron-down-C9uhYMD7.js   [39m[1m[2m    0.33 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m
[2mdist-staging/[22m[36msearch-Bmve1ft9.js         [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist-staging/[22m[36mrotate-ccw-D02iNsua.js     [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist-staging/[22m[36mupload--9xkdHgj.js         [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist-staging/[22m[36mroute-6SDrAqoD.js          [39m[1m[2m    0.46 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m
[2mdist-staging/[22m[36mchef-hat-BrHpJjdq.js       [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist-staging/[22m[36mprinter-DhzP5Azy.js        [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist-staging/[22m[36mpackage-BTHUmzd9.js        [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist-staging/[22m[36mcar-ziG_jmQD.js            [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist-staging/[22m[36mindex.esm-B4Jzzju4.js      [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist-staging/[22m[36mosm-dRGSVYye.js            [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist-staging/[22m[36mTrips-Bz-FODXz.js          [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist-staging/[22m[36mrouting-ercq4r2b.js        [39m[1m[2m    3.79 kB[22m[1m[22m[2m │ gzip:   2.09 kB[22m
[2mdist-staging/[22m[36mplaces-D1Q9TkrR.js         [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist-staging/[22m[36mJoin-BbODWyWb.js           [39m[1m[2m    4.16 kB[22m[1m[22m[2m │ gzip:   2.13 kB[22m
[2mdist-staging/[22m[36mmusic-B3UuOYx3.js          [39m[1m[2m    4.58 kB[22m[1m[22m[2m │ gzip:   2.02 kB[22m
[2mdist-staging/[22m[36mRouteFuel-K6Kpp7OP.js      [39m[1m[2m    5.13 kB[22m[1m[22m[2m │ gzip:   2.51 kB[22m
[2mdist-staging/[22m[36mplaceFit-5tglbOFD.js       [39m[1m[2m    5.15 kB[22m[1m[22m[2m │ gzip:   2.84 kB[22m
[2mdist-staging/[22m[36mJournalTab-NGHTPZJJ.js     [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.17 kB[22m
[2mdist-staging/[22m[36mCook-FWT_Ly-p.js           [39m[1m[2m    7.37 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist-staging/[22m[36mMapScreen-s0RB7554.js      [39m[1m[2m    7.39 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist-staging/[22m[36mDesignSystem-C9gjKK2o.js   [39m[1m[2m    7.71 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist-staging/[22m[36mExplore-D9CkP6vL.js        [39m[1m[2m    8.98 kB[22m[1m[22m[2m │ gzip:   3.77 kB[22m
[2mdist-staging/[22m[36mIsraelMap-BPSfq4NH.js      [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist-staging/[22m[36mPlaces-DIQV-LBD.js         [39m[1m[2m    9.91 kB[22m[1m[22m[2m │ gzip:   4.36 kB[22m
[2mdist-staging/[22m[36mCampSearch-CYNH2fKE.js     [39m[1m[2m   10.88 kB[22m[1m[22m[2m │ gzip:   4.94 kB[22m
[2mdist-staging/[22m[36mVehiclePicker-BxnBS97-.js  [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist-staging/[22m[36mAcademy-Ydr9Y8dg.js        [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.75 kB[22m
[2mdist-staging/[22m[36mMore-3wT12H8a.js           [39m[1m[2m   19.50 kB[22m[1m[22m[2m │ gzip:   7.74 kB[22m
[2mdist-staging/[22m[36mWhereTo-CKvKfpqU.js        [39m[1m[2m   22.41 kB[22m[1m[22m[2m │ gzip:   7.63 kB[22m
[2mdist-staging/[22m[36mDiscover-Dm86A8tq.js       [39m[1m[2m   27.12 kB[22m[1m[22m[2m │ gzip:  10.52 kB[22m
[2mdist-staging/[22m[36mDestination-DLo5iEFC.js    [39m[1m[2m   27.49 kB[22m[1m[22m[2m │ gzip:   9.14 kB[22m
[2mdist-staging/[22m[36mBoxScreen-DAkuy5Kf.js      [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist-staging/[22m[36mGear-BlPEpWAy.js           [39m[1m[2m   43.76 kB[22m[1m[22m[2m │ gzip:  14.13 kB[22m
[2mdist-staging/[22m[36mindex.esm-CCAWpmwl.js      [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist-staging/[22m[36mWizard-Jn-ZulU2.js         [39m[1m[2m   73.95 kB[22m[1m[22m[2m │ gzip:  20.01 kB[22m
[2mdist-staging/[22m[36mTripPlan-jWOScW-x.js       [39m[1m[2m  140.26 kB[22m[1m[22m[2m │ gzip:  44.58 kB[22m
[2mdist-staging/[22m[36mindex.esm-D_Ez9UD8.js      [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist-staging/[22m[36mindex-CPjzxoL0.js          [39m[1m[2m  580.17 kB[22m[1m[22m[2m │ gzip: 194.39 kB[22m
[2mdist-staging/[22m[36mindex.esm-1jP3d1p-.js      [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist-staging/[22m[36mIsraelMapGL-CbW2pdbO.js    [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 6.83s[39m
```

## rules
```
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-11-14T10:18:48.276Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab15 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L81:24 for 'update' @ L81, false for 'update' @ L81

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-11-14T10:18:48.295Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab16 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'delete' @ L80, false for 'delete' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22mthe organiser hands the trip to their Google id (add it and make it the owner)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member re-joins under their Google id with the key they joined with
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot add another id for someone else
[22m[39m[2026-11-14T10:18:48.479Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab1f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L81:24 for 'update' @ L81, false for 'update' @ L81

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot add another id for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot take ownership
[22m[39m[2026-11-14T10:18:48.517Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab21 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L81:24 for 'update' @ L81, false for 'update' @ L81

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot take ownership
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22ma person reads and writes their own list
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mpersonal trip index (users/{uid})[2m > [22m[2mnobody else can read or change someone's list
[22m[39m[2026-11-14T10:18:48.658Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab28 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L143, false for 'update' @ L143

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mnobody else can read or change someone's list
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mlisting every user is not allowed
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member adds a photo as themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma member cannot add an item in someone else's name
[22m[39m[2026-11-14T10:18:48.844Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab31 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L134, evaluation error at L135:26 for 'update' @ L135, false for 'create' @ L134

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member cannot add an item in someone else's name
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-11-14T10:18:48.893Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab34 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L137:26 for 'delete' @ L137, false for 'delete' @ L137

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-11-14T10:18:48.908Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab35 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L134:26 for 'create' @ L134, evaluation error at L135:26 for 'update' @ L135, false for 'update' @ L135

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-11-14T10:18:48.929Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab36 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L135:26 for 'update' @ L135, false for 'update' @ L135

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22manother family cannot delete or overwrite a member's photo
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author edits and deletes their own photo
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2mthe author cannot hand the item to someone else
[22m[39m[2026-11-14T10:18:49.035Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab3d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L135:26 for 'update' @ L135, false for 'update' @ L135

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author cannot hand the item to someone else
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe organiser may remove any item
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22molder items without an author id stay editable by members (no data migration needed)
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma removed member or a stranger cannot add items
[22m[39m[2026-11-14T10:18:49.185Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab46 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L134:26 for 'create' @ L134, evaluation error at L135:26 for 'update' @ L135, false for 'create' @ L134

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma removed member or a stranger cannot add items
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe shared trip document no longer carries any key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member reads only their own family's key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mthe organiser reads every key and may replace one; members and strangers may not write
[22m[39m[2026-11-14T10:18:49.453Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab53 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L89:25 for 'create' @ L89, evaluation error at L89:25 for 'update' @ L89, false for 'update' @ L89

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser reads every key and may replace one; members and strangers may not write
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma newcomer with the right key joins: join record, then their own entry (no key in it)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record is readable only by its owner
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-11-14T10:18:49.714Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab61 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L98:34 for 'create' @ L98, evaluation error at L98:34 for 'update' @ L98, false for 'create' @ L98

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-11-14T10:18:49.732Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab62 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L98:34 for 'create' @ L98, evaluation error at L98:34 for 'update' @ L98, false for 'create' @ L98

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma wrong key, or the key of another family, is refused
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mwithout a join record nobody can add themselves
[22m[39m[2026-11-14T10:18:49.805Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab65 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L81:24 for 'update' @ L81, false for 'update' @ L81

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mwithout a join record nobody can add themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma join record cannot be written for someone else
[22m[39m[2026-11-14T10:18:49.877Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab68 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L98, false for 'update' @ L98

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record cannot be written for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-11-14T10:18:49.950Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab6c error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L81:24 for 'update' @ L81, false for 'update' @ L81

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-11-14T10:18:49.965Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab6d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L98:34 for 'create' @ L98, evaluation error at L98:34 for 'update' @ L98, false for 'update' @ L98

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mafter the organiser replaces the key, an old join record no longer lets anyone in
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2man expired link admits nobody, even with the right key
[22m[39m[2026-11-14T10:18:50.027Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab71 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L98:34 for 'create' @ L98, evaluation error at L98:34 for 'update' @ L98, false for 'create' @ L98

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22man expired link admits nobody, even with the right key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser removes the old keys from the shared document and from member entries
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma member cannot remove or change keys in the shared document
[22m[39m[2026-11-14T10:18:50.165Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x1934ab79 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L81:24 for 'update' @ L81, false for 'update' @ L81

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member cannot remove or change keys in the shared document

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m66 passed[39m[22m[90m (66)[39m
[2m   Start at [22m 10:18:43
[2m   Duration [22m 6.45s[2m (transform 52ms, setup 0ms, collect 133ms, tests 6.07s, environment 0ms, prepare 101ms)[22m

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
✓ e2e-famalbum
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
   b5c4dc2..a97c0eb  main -> main
 * [new tag]         deploy-staging-20261114-1029-27a7433 -> deploy-staging-20261114-1029-27a7433
```
