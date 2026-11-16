# Handoff: Ritual Archive: Clash

## Current - v144 MOBILE/cache v=147; desktop v143/cache v=146 (2026-11-16 08:45:51 UTC)

Mailbox through 2026-11-16 03:35 acted on; completion reread unchanged. V143 accepted/published as 1b8e384. Owner directly repeated autonomous check-in, outstanding orders and reporting; no new design direction. One version this run. Coordinator commits; never push.

V144 mobile loads the existing reviewed src/desktop-granite.js after Blast and before touch.js. Granite Blast coils at move ticks 8-11, aims at 12-14, drives on the original tick-15 shot, braces at 18-30 and withdraws at 31-34. Serialized move age holds through freezes and event-free snapshots. All 25 mobile scripts and local HTML/manifest/icon URLs use v=147; title/error stamps say v144. Desktop, combat, beam, kickback physics, HUD and mobile runtime/CSS unchanged.

Commit: none; HEAD/base 1b8e38452d16e648ff801c8d8bbbf1698e7ff214. No add/commit attempt per 01:34/03:00; never pushed. Fifteen files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile-granite.cjs (new), tests/mobile.cjs, tests/mobile-utility.cjs, and the reference chains in tests/mobile-{animation,beam-body,blast,contract,convergence,maximum,ordinary,quake}.cjs.

## Verification and limits

- Mobile-granite PASS: three groups / 2,560 parallel ticks / 780 rasters / 540 freeze holds / 60 event-free guest snapshots / 2,814 defaults / 144 changed scenes. Synthetic touch/remote casts, both slots/facings, full/low HP, hit/guard/rear/jump. Exact tick-15 beam, 22 CE/80-tick cooldown, 115 damage (28.75 guarded), jump/rear escape, geometry/lifetime, -7-facing kickback and recovery. Every live beam body stays extended. Native world equals desktop; all-stage differences fit old/new body unions; phone HUD/controls, other moves, Domains and portraits exact.
- --granite-baseline --preview-only omits just Granite and reproduces all three missing-animation groups; preview-only deliberately permits expected failures.
- Actual 25-script mobile boot/main-loop input suite PASS: multi-touch, freeze taps, cancellation/background/rotation cleanup, CPU/watch, host/guest encoding, all 60 names/states, safe-area bounds, full scripted CPU match/results/rematch/title return.
- Mobile-blast PASS: three groups / 3,200 ticks / 660 rasters / 396 holds / 44 snapshots / 2,838 defaults / 96 scenes. Eight older reference chains retain Granite; only Blast rerun, seven syntax-checked.
- Mobile-utility PASS: three groups / 26 layouts / 16 mute toggles and v144 stamp. Mobile-present PASS: 73 full-frame normal/deferred comparisons, fifteen Domains, orientations/DPR 3, shake/HUD separation, opaque skipped-copy recovery and no per-frame canvas allocation. Mobile-install and feel (eleven groups plus keyboard/remote handlers) PASS. Install initially caught manifest icons at v=145; bumped all three to v=147 and reran successfully. Initial edit helper unavailable (python); no files changed by that attempt; Node used instead.
- Desktop granite-body PASS: five groups / 3,200 ticks / 1,968 rasters / 4,320 holds / 9,384 defaults / 144 scenes, including gauntlet/beam alignment, hard alpha, <=24 colors, sprite bounds and planted soles. Eleven changed/new JS files parse; protected-file checks and git diff --check PASS. All 33 protected source/mobile files equal exact Git blobs; desktop index.html diff clean. No tests remain running.
- 140 PNGs in codex mailbox: paired fifteen-frame native/body/667x375 phone strips, 812x320 and 844x390 beam-brace scenes, and portrait models in both costumes/facings. Inspected old/new main bodies, mirror bodies, old/new tick-18 phone brace, 812x320 brace, mirror tick-24 brace and portrait. Export: node tests/mobile-granite.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion.
- No browser/phone, physical keys/touch, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v144. Desktop runtime/domain/guard and unchanged dedicated suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reload-working iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5. Proposed next v145 WEB: next reproduced ordinary-art or fighter-feel gap with native strips; owner phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
