# Handoff: Ritual Archive: Clash

## Current - v160 MOBILE/cache v=163; desktop v159/cache v=162 (2026-11-16 16:50:04 UTC)

Mailbox through 2026-11-16 11:46 acted on; v159 accepted/live as d2a9fe8. Owner directly repeated autonomous check-in and mailbox reporting, with no new design direction. One version this run. Coordinator commits; never push.

Mobile loads the existing reviewed src/desktop-paper.js after Nail Projectile. Finn gathers his palm at the ribs at ticks 5-9, drives into the unchanged orb origin/lane at 10-12, follows through at 13-16, withdraws at 17-20 and returns at 21-23. Serialized age holds through freezes and event-free snapshots. All 37 mobile page resources (33 scripts) and three manifest icons use cache v=163; title/error stamps say v160. Manifest icons were still at v157; their URLs now match the page for the install audit. Desktop index.html and all src files are byte-identical; mobile runtime/CSS/assets stay byte-identical. Combat, timing, costs/damage, orb physics, effects, input, HUD, audio, roster/names, style and dependencies stay unchanged.

Commit: none; HEAD/base d2a9fe8428fe7a39ec66af0731dd7e2948a766dc. No add/commit attempt per coordinator 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile-paper.cjs (new), tests/mobile.cjs, tests/mobile-nail.cjs and tests/mobile-utility.cjs.

## Verification and limits

- Mobile-paper PASS: three groups / 8,400 parallel ticks / 912 exact raster comparisons / 432 frozen holds / 48 event-free guest snapshots / 2,830 unchanged defaults / 120 changed native scenes. Synthetic touch/remote inputs in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity; full-flight independent simulation and desktop-world parity. Tick-10 orb, speed 15, radius 20, 72 damage, 15 CE/70-tick cooldown and recovery retained. All-stage differences fit body unions; phone HUD/controls, other moves, early/airborne/interrupted bodies, portraits and Domains stay exact.
- --paper-baseline --preview-only reproduces all three missing-body groups, deliberately permitting expected failures. No combat fixture corrections.
- Mobile-nail PASS: three groups / 5,600 parallel ticks / 912 raster comparisons / 432 frozen holds / 48 snapshots / 2,836 unchanged defaults / 120 changed scenes. Its unaffected-body reference includes Paper. Both suites execute actual 33-script mobile HTML order and the mobile suite first: pointer/multi-touch/input cleanup, CPU/watch, full CPU match/results/rematch, host/guest encoding, rotation, art labels and 36 safe-area target bounds pass. Memory DOM/canvas, not a browser.
- Mobile-utility PASS: three groups, 26 layouts and 16 actual MUTE clicks; >=48px targets, overlap/safe-area/toolbar-height bounds and fixed MUTE/MOVES slots. Mobile-install PASS: all local page resources, three manifest icons, nested launch/scope, reproducible icon pixels and install guide.
- All four changed/new JS tests parse; 37 page resources exist at v=163. Git desktop diff and git diff --check pass. All 42 protected files match the start SHA-256 inventory, v160-protected-files.json. All test processes completed; no tests remain running. Unchanged desktop runtime/full-roster/world suites not repeated; no performance claim.
- 232 move PNGs in the codex mailbox: paired native scenes, twelve-frame body/667x375 phone strips, 812x320 and 844x390 release scenes and portrait models, both costumes/facings and distant casts. Inspected before/after body strips, mirror strip, unobscured far release before/after, short/wide phone release scenes and portrait prompt. Export: node tests/mobile-paper.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion. Logs: v160-paper.log, v160-nail.log, v160-utility.log and v160-baseline.log.
- No browser/phone, physical touch/keys, live motion/FPS/latency, audible audio, real two-device WebRTC or owner play of v160. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Completion mailbox reread unchanged through 11:46. Next proposed v161 WEB: the next reproduced ordinary-art or fighter-feel gap with native strips, unless phone feedback jumps the queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, fighter poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
