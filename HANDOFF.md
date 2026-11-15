# Handoff: Ritual Archive: Clash

## Current - version 107, mobile cache v=110; desktop v=108 (2026-11-15)

Mailbox through 16:54 read/acted on. V106 accepted/committed as 55a25d1 (not pushed). Owner directly repeated autonomous check-in/report instructions. V107 implements the coordinator's full-height mobile arena / overlay-controls composition. Desktop index/src stays byte-identical; arenas and optional Rapid Slash note stay closed/deferred.

V107 removes the reserved below-stage deck. Arena geometry is 666x374 at (0,0) on 667x375; 693x389 at (75,0) on 844x390; 656x369 at (94,0) with 44px side / 21px bottom safe areas. Controls overlay its lower corners, clear upper health/CE/guard meters and keep >=48px targets / >=6px gaps. Plates are 40% opaque idle / 95% held, with solid labels. Mobile HUD drops bottom cards/hints; three named art buttons and Domain/Maximum carry names, costs, readiness/reasons, cooldown/gauge fills and used state. Full names remain in accessible labels/move lists; only Applause and Shadow Garden use shorter button headings. Actual shared pxArtCardState/domReady drive display; no combat changes. Multitouch held/tap input and rotation cleanup remain as v106.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/mobile.css, mobile/touch.js, tests/mobile.cjs. HEAD/base 55a25d1; no add/commit attempt per 01:34/03:00; never pushed. All twelve mobile script URLs v=110; eleven desktop URLs remain v=108 because shared sources/desktop page are unchanged.

## Verification and limits

- node tests/mobile.cjs passes actual mobile HTML/script loading, ten synthetic pointer commands, multitouch, main-loop movement/attacks, freeze taps, cleanup, CPU/watch, host/guest encoding and rotation. Added all 60 initial button labels/states, read-only display, actual cooldown/denial, CE/HP/setup/air/free-CE/stone-swap states, guest slot and Domain gauge/HP/full/used. Upper meters match desktop pixels; bottom HUD is transparent. All 36 safe-area target bounds and >=6px pairwise gaps pass.
- A complete seeded-simulation CPU match advances through the shared main loop with repeated touch punches, actual AI, round results, match completion, delayed result screen, rematch and title return. Raster drawing skipped during this long lifecycle check; no claim of human play or measured frame rate.
- Existing desktop runtime/menu/input/results/network-lifecycle and feel/input suites pass. Syntax and diff whitespace pass. git diff --exit-code HEAD -- index.html src confirms exact desktop/shared-file preservation.
- Generated before/after models at 844x390, 667x375 and notched 844x390, plus portrait and four roster/CE samples, in codex mailbox. Before loads actual 55a25d1 mobile adapter; after uses live geometry and real fight/HUD rasters, with modeled control plates/text. No CSS engine. Initial whole-button alpha made text too faint; kept plates translucent and made labels solid, then regenerated. Coordinator's Chromium v106 title/selection worked; arena measurement confirmed the original wasted space. V107 browser capture still unavailable.
- Computer/browser capture retried: browser access host unavailable. No actual phone, browser CSS/menu layout or native PointerEvent dispatch, touch feel, sound/listening, motion/FPS, phone keyboard/viewport behavior or real two-computer WebRTC verification. Existing desktop full-match/world/stage/art/audio/performance suites not repeated; source unchanged.

## Next priorities

V108 remains mobile-first: audit real touch menu routes and phone-sized selection/pause/results layout; coordinator browser capture of the new overlay/art labels would help. Then harden mobile online/input lifecycle, and installable manifest/icons last. No app-store packaging. Mobile comes first until a phone match can run start to finish, then alternate mobile and web-audit versions. V107 is ready for coordinator review/commit; owner phone testing needs coordinator publication approval, never a Codex push. No decision blocks the next mobile version.

Owner dive feel/readability notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and obtains owner's publication approval; never push. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
