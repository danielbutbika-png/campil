# CI 8675b7f — 2026-10-31T18:02Z
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
 [32m✓[39m src/services/officialAlerts.test.ts[2m > [22mofficial alerts file[2m > [22mthe copy of the fetcher installed on main is identical to scripts/alerts/ims.mjs
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
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22ma recipe is ready when every ingredient and tool is there
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22m"almost" lists what is missing (ingredients and tools count together)
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mready recipes come first; vegan diet filters out eggs
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mbasics like salt and oil are not asked for
 [32m✓[39m src/engine/cook.test.ts[2m > [22mwhat can we cook[2m > [22mfinds owned gear from the inventory by name
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

[2m Test Files [22m [1m[32m34 passed[39m[22m[90m (34)[39m
[2m      Tests [22m [1m[32m249 passed[39m[22m[90m (249)[39m
[2m   Start at [22m 17:52:41
[2m   Duration [22m 4.63s[2m (transform 1.14s, setup 0ms, collect 2.53s, tests 531ms, environment 444ms, prepare 3.05s)[22m

```

## build
```
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2237 modules transformed.
rendering chunks...
[1m[33m[plugin:vite:reporter][39m[22m [33m[plugin vite:reporter] 
(!) /home/runner/work/campil/campil/src/lib/cloud/sync.ts is dynamically imported by /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Welcome.tsx but also statically imported by /home/runner/work/campil/campil/src/App.tsx, /home/runner/work/campil/campil/src/components/AccountBadge.tsx, /home/runner/work/campil/campil/src/components/Collab.tsx, /home/runner/work/campil/campil/src/components/Field.tsx, /home/runner/work/campil/campil/src/screens/Join.tsx, /home/runner/work/campil/campil/src/screens/TripPlan.tsx, /home/runner/work/campil/campil/src/screens/trip/AlbumTab.tsx, /home/runner/work/campil/campil/src/screens/trip/GearTab.tsx, /home/runner/work/campil/campil/src/screens/trip/JournalTab.tsx, dynamic import will not move module into another chunk.
[39m
computing gzip size...
[2mdist/[22m[32mindex.html                 [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[35mindex-C-1CkMCU.css         [39m[1m[2m   47.45 kB[22m[1m[22m[2m │ gzip:   9.52 kB[22m
[2mdist/[22m[35mIsraelMapGL-KizArRWY.css   [39m[1m[2m   69.94 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m
[2mdist/[22m[36msearch-DADNPQHo.js         [39m[1m[2m    0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist/[22m[36mrotate-ccw-KnhzdYZy.js     [39m[1m[2m    0.41 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36mupload-Bs7hHDN8.js         [39m[1m[2m    0.44 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36mchef-hat-BZMWyzYR.js       [39m[1m[2m    0.51 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36mprinter-DGQQVgGR.js        [39m[1m[2m    0.52 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36mpackage-Dlv-0xFG.js        [39m[1m[2m    0.58 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[36mcar-C_lDycSF.js            [39m[1m[2m    0.61 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist/[22m[36mfootprints-Dw4uoHog.js     [39m[1m[2m    0.65 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m
[2mdist/[22m[36mindex.esm-B4Jzzju4.js      [39m[1m[2m    1.35 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m
[2mdist/[22m[36mosm-dRGSVYye.js            [39m[1m[2m    1.42 kB[22m[1m[22m[2m │ gzip:   0.95 kB[22m
[2mdist/[22m[36mTrips-Be0a_6VN.js          [39m[1m[2m    3.02 kB[22m[1m[22m[2m │ gzip:   1.38 kB[22m
[2mdist/[22m[36mplaces-D1Q9TkrR.js         [39m[1m[2m    4.08 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[36mJoin-B8xkFHj1.js           [39m[1m[2m    4.16 kB[22m[1m[22m[2m │ gzip:   2.13 kB[22m
[2mdist/[22m[36mmusic-B3UuOYx3.js          [39m[1m[2m    4.58 kB[22m[1m[22m[2m │ gzip:   2.02 kB[22m
[2mdist/[22m[36mplacesDb-AQxPju60.js       [39m[1m[2m    4.70 kB[22m[1m[22m[2m │ gzip:   2.50 kB[22m
[2mdist/[22m[36mplaceFit-iUW7ZyCp.js       [39m[1m[2m    5.19 kB[22m[1m[22m[2m │ gzip:   2.86 kB[22m
[2mdist/[22m[36mRouteFuel-1RxJsPgH.js      [39m[1m[2m    5.50 kB[22m[1m[22m[2m │ gzip:   2.60 kB[22m
[2mdist/[22m[36mJournalTab-BMZp1t4w.js     [39m[1m[2m    6.99 kB[22m[1m[22m[2m │ gzip:   3.16 kB[22m
[2mdist/[22m[36mMapScreen-D4_kOlnN.js      [39m[1m[2m    7.36 kB[22m[1m[22m[2m │ gzip:   3.12 kB[22m
[2mdist/[22m[36mCook-B2nMtlBQ.js           [39m[1m[2m    7.37 kB[22m[1m[22m[2m │ gzip:   3.13 kB[22m
[2mdist/[22m[36mDesignSystem-B9DYckAU.js   [39m[1m[2m    7.71 kB[22m[1m[22m[2m │ gzip:   3.22 kB[22m
[2mdist/[22m[36mExplore-CdeYym1j.js        [39m[1m[2m    8.99 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[2mdist/[22m[36mIsraelMap-C6NLraAi.js      [39m[1m[2m    9.51 kB[22m[1m[22m[2m │ gzip:   3.36 kB[22m
[2mdist/[22m[36mPlaces-q6DAuVBt.js         [39m[1m[2m   10.00 kB[22m[1m[22m[2m │ gzip:   4.40 kB[22m
[2mdist/[22m[36mCampSearch-TD0nxS84.js     [39m[1m[2m   10.85 kB[22m[1m[22m[2m │ gzip:   4.93 kB[22m
[2mdist/[22m[36mVehiclePicker-DwYXcYpU.js  [39m[1m[2m   12.82 kB[22m[1m[22m[2m │ gzip:   5.27 kB[22m
[2mdist/[22m[36mAcademy-Di3nU4l3.js        [39m[1m[2m   16.46 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m
[2mdist/[22m[36mDestSearch-CbbMmLz6.js     [39m[1m[2m   17.76 kB[22m[1m[22m[2m │ gzip:   5.81 kB[22m
[2mdist/[22m[36mMore-CPS91XHT.js           [39m[1m[2m   19.47 kB[22m[1m[22m[2m │ gzip:   7.73 kB[22m
[2mdist/[22m[36mDestination-DclRs2jq.js    [39m[1m[2m   27.61 kB[22m[1m[22m[2m │ gzip:   9.20 kB[22m
[2mdist/[22m[36mBoxScreen-DGcnJIU-.js      [39m[1m[2m   30.24 kB[22m[1m[22m[2m │ gzip:  12.02 kB[22m
[2mdist/[22m[36mGear-CV_cWn0q.js           [39m[1m[2m   43.99 kB[22m[1m[22m[2m │ gzip:  14.16 kB[22m
[2mdist/[22m[36mindex.esm-CCAWpmwl.js      [39m[1m[2m   48.25 kB[22m[1m[22m[2m │ gzip:  11.34 kB[22m
[2mdist/[22m[36mWizard-DM4FQchz.js         [39m[1m[2m   72.20 kB[22m[1m[22m[2m │ gzip:  19.30 kB[22m
[2mdist/[22m[36mTripPlan-B3eyXBAt.js       [39m[1m[2m  142.53 kB[22m[1m[22m[2m │ gzip:  45.59 kB[22m
[2mdist/[22m[36mindex.esm-D_Ez9UD8.js      [39m[1m[2m  195.98 kB[22m[1m[22m[2m │ gzip:  38.91 kB[22m
[2mdist/[22m[36mindex-EoZ2OPc8.js          [39m[1m[2m  538.13 kB[22m[1m[22m[2m │ gzip: 182.00 kB[22m
[2mdist/[22m[36mindex.esm-1jP3d1p-.js      [39m[1m[2m  663.33 kB[22m[1m[22m[2m │ gzip: 171.92 kB[22m
[2mdist/[22m[36mIsraelMapGL-B45F_-Kc.js    [39m[1m[2m1,065.02 kB[22m[1m[22m[2m │ gzip: 289.32 kB[22m
[32m✓ built in 8.48s[39m
```

## rules
```
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22mafter removal and key rotation, the removed member loses access and cannot rejoin with the old link
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-31T17:53:07.226Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d231 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mremoving a member[2m > [22m[2monly the organiser can remove members or delete the trip
[22m[39m[2026-10-31T17:53:07.245Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d232 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L79:24 for 'delete' @ L79, false for 'delete' @ L79

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mremoving a member[2m > [22monly the organiser can remove members or delete the trip
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22mthe organiser hands the trip to their Google id (add it and make it the owner)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member re-joins under their Google id with the key they joined with
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot add another id for someone else
[22m[39m[2026-10-31T17:53:07.452Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d23b error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot add another id for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2msigning in with Google on a second device[2m > [22m[2ma member cannot take ownership
[22m[39m[2026-10-31T17:53:07.506Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d23d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22msigning in with Google on a second device[2m > [22ma member cannot take ownership
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22ma person reads and writes their own list
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mpersonal trip index (users/{uid})[2m > [22m[2mnobody else can read or change someone's list
[22m[39m[2026-10-31T17:53:07.673Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d244 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L130, false for 'update' @ L130

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mnobody else can read or change someone's list
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mpersonal trip index (users/{uid})[2m > [22mlisting every user is not allowed
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member adds a photo as themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma member cannot add an item in someone else's name
[22m[39m[2026-10-31T17:53:07.863Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d24d error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'create' @ L121

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma member cannot add an item in someone else's name
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-10-31T17:53:07.919Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d250 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L124:26 for 'delete' @ L124, false for 'delete' @ L124

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-10-31T17:53:07.938Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d251 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L121:26 for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2manother family cannot delete or overwrite a member's photo
[22m[39m[2026-10-31T17:53:07.967Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d252 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22manother family cannot delete or overwrite a member's photo
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author edits and deletes their own photo
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2mthe author cannot hand the item to someone else
[22m[39m[2026-10-31T17:53:08.096Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d259 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L122:26 for 'update' @ L122, false for 'update' @ L122

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe author cannot hand the item to someone else
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22mthe organiser may remove any item
 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22molder items without an author id stay editable by members (no data migration needed)
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2mjournal and photos: authors own their items[2m > [22m[2ma removed member or a stranger cannot add items
[22m[39m[2026-10-31T17:53:08.280Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d262 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L121:26 for 'create' @ L121, evaluation error at L122:26 for 'update' @ L122, false for 'create' @ L121

 [32m✓[39m tests/rules/rules.test.ts[2m > [22mjournal and photos: authors own their items[2m > [22ma removed member or a stranger cannot add items
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe shared trip document no longer carries any key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member reads only their own family's key
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mthe organiser reads every key and may replace one; members and strangers may not write
[22m[39m[2026-10-31T17:53:08.544Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d26f error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L88:25 for 'create' @ L88, evaluation error at L88:25 for 'update' @ L88, false for 'update' @ L88

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser reads every key and may replace one; members and strangers may not write
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma newcomer with the right key joins: join record, then their own entry (no key in it)
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record is readable only by its owner
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-10-31T17:53:08.814Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d27d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma wrong key, or the key of another family, is refused
[22m[39m[2026-10-31T17:53:08.838Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d27e error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma wrong key, or the key of another family, is refused
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mwithout a join record nobody can add themselves
[22m[39m[2026-10-31T17:53:08.926Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d281 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mwithout a join record nobody can add themselves
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma join record cannot be written for someone else
[22m[39m[2026-10-31T17:53:08.995Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d284 error. Code: 7 Message: 7 PERMISSION_DENIED: 
false for 'create' @ L97, false for 'update' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma join record cannot be written for someone else
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-10-31T17:53:09.073Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d288 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2mafter the organiser replaces the key, an old join record no longer lets anyone in
[22m[39m[2026-10-31T17:53:09.093Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d289 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'update' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mafter the organiser replaces the key, an old join record no longer lets anyone in
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2man expired link admits nobody, even with the right key
[22m[39m[2026-10-31T17:53:09.213Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d28d error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L97:34 for 'create' @ L97, evaluation error at L97:34 for 'update' @ L97, false for 'create' @ L97

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22man expired link admits nobody, even with the right key
 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22mthe organiser removes the old keys from the shared document and from member entries
[90mstderr[2m | tests/rules/rules.test.ts[2m > [22m[2minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22m[2ma member cannot remove or change keys in the shared document
[22m[39m[2026-10-31T17:53:09.416Z]  @firebase/firestore: Firestore (12.19.0): GrpcConnection RPC 'Write' stream 0x7328d295 error. Code: 7 Message: 7 PERMISSION_DENIED: 
evaluation error at L80:24 for 'update' @ L80, false for 'update' @ L80

 [32m✓[39m tests/rules/rules.test.ts[2m > [22minvite keys are private to the organiser and to each family (secrets/, joins/)[2m > [22ma member cannot remove or change keys in the shared document

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m59 passed[39m[22m[90m (59)[39m
[2m   Start at [22m 17:53:02
[2m   Duration [22m 7.28s[2m (transform 48ms, setup 0ms, collect 150ms, tests 6.82s, environment 0ms, prepare 131ms)[22m

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
✓ overflow-audit
all browser suites passed
```

## deploy
```
To https://github.com/danielbutbika-png/campil
   c62aac0..176d8c7  main -> main
 * [new tag]         deploy-prod-20261031-1802-8675b7f -> deploy-prod-20261031-1802-8675b7f
```
