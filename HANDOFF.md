# Handoff: Ritual Archive: Clash

## Current - version 110, mobile cache v=113; desktop v=108 (2026-11-15)

Mailbox through 17:31 read/acted on. V109 committed/pushed by coordinator as dd076b1. Coordinator reviews, commits and pushes each version under the owner's standing instruction; Codex still never pushes or attempts commits (01:34/03:00). Owner directly repeated autonomous check-in/report instructions; no new design direction. V110 implements the ordered manifest/icons. Desktop index/src stays byte-identical; arenas and optional Rapid Slash note stay closed/deferred.

Mobile now has a relative manifest with stable mobile identity/scope/start URL, standalone display, landscape preference, matching theme/background colors and original CLASH bitmap icons: 32 favicon, 180 Apple, 192/512 ordinary, padded maskable 512. All icon art uses the existing bitmap font/palette; regenerate via node mobile/make-icons.cjs. No external assets/dependencies. Apple standalone metadata is included. Title has a native expandable Add to home screen guide for Safari/Android, with internet requirement stated. Title gap is 6px to fit the new 48px summary; other layouts/input/lifecycle unchanged. No install popup. Optional offline caching deferred: cache/update lifecycle needs its own version; opening the game requires internet. Browser/OS determines installation menus and orientation support.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/mobile.css, mobile/manifest.webmanifest (new), mobile/make-icons.cjs (new), mobile/icons/ (five new PNGs), tests/mobile-install.cjs (new). HEAD/base dd076b1; no add/commit attempt; never pushed. All twelve mobile scripts, stylesheet, manifest and icon URLs use v=113; eleven desktop script URLs remain v=108.

## Verification and limits

- node tests/mobile-install.cjs passes mobile-only launch/id/scope at GitHub project and localhost roots, standalone/landscape, versioned existing resource links, exact reproducible PNG data, 32/180/192/512 sizes, fully opaque pixels, 192/512 ordinary and maskable purpose, every non-background maskable pixel inside Android's 40% safe circle, installation guide and desktop manifest exclusion.
- node tests/mobile-lifecycle.cjs passes existing touch/main-loop/menu/lifecycle checks (ten commands, multitouch, real attacks, freeze taps, CPU/watch, host/guest memory transports, all art states, safe-area bounds, 19 menu actions, roster/arena authority, close/retry/stale callback isolation, synchronous neutral and host input expiry). Complete CPU match to two wins/results/rematch/title: 2,931 frames; long check skips raster drawing. Script-tested, never called played.
- Existing desktop node tests/runtime.cjs and node tests/feel.cjs pass. New source/test syntax, git diff --check and git diff --exit-code HEAD -- index.html src pass. No shared/desktop/combat change; art/world/stage/full-match/audio/performance suites not repeated.
- Eight v110 previews in codex mailbox: icon sheet at native/small sizes and round mask model; before/after title models at 667x375 and 844x390, separate guide-content models at both sizes, portrait model. Inspected at output size. Icons are actual generated assets; title/guide models use the game's bitmap font, not browser CSS/fonts, and prove no scroll/focus/layout behavior. Portrait keeps the existing rotate gate.
- Browser access retried: host unavailable. No real phone, installation prompt/menu test, manifest browser parsing, OS icon crop/splash, standalone launch, orientation enforcement, native touch/CSS/scroll, audio/listening, background suspension, motion/FPS, real two-device WebRTC or owner play check. No offline support claim. Coordinator's v108 browser measurements remain valid historical evidence only.

## Next priorities

V110 is ready for coordinator review/commit/publication under 17:10/17:31. On phone: install from /mobile/, confirm named icon and mobile standalone launch, rotate, start a CPU match, background/return and Resume. Check the new title guide at 667x375 and 844x390 with safe areas. Next candidate v111: mobile first-gesture sound/unlock and mute/return audit, with a reproduced issue before any fix. Owner phone feedback takes priority. Mobile first until owner confirms a start-to-finish phone match, then alternate mobile/web audits. Overlay opacity/placement awaits owner feedback. No decision blocks the next audit.

Owner dive feel/readability notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
