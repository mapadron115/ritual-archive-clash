# Handoff: Ritual Archive: Clash

## Current - v154 MOBILE/cache v=157; desktop v153/cache v=156 (2026-11-16 14:43:16 UTC)

Mailbox through 2026-11-16 09:20 acted on; v153 accepted/live as c69372d. Owner directly repeated autonomous check-in and mailbox reporting; no new design direction. One version this run. Coordinator commits; never push.

Mobile now loads the reviewed src/desktop-guided.js after Grape Shot: Guided Shell cradles at ticks 8-11, lifts at 12-15, lofts on the unchanged tick-16 release, holds a guiding hand at 19-25 and recovers at 26-30. Serialized move age holds through freezes and event-free guest snapshots. All 34 versioned page resources and three manifest icons use v=157; title/error stamps say v154. Desktop/shared sources and mobile runtime/CSS stay byte-identical. No combat, flight, timing, costs/damage, physics, effects, input, HUD, audio, roster/name, style or dependency change.

Commit: none; HEAD/base c69372daf10117b83689af727a2f2f89cbf1d1d7. No add/commit attempt per 01:34/03:00; never pushed. Twenty files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile-guided.cjs (new), tests/mobile.cjs, tests/mobile-utility.cjs, and the thirteen prior mobile animation fixtures listed below.

## Verification and limits

- Mobile-guided PASS: three groups / 12,480 parallel ticks / 884 raster comparisons / 468 frozen holds / 52 event-free guest snapshots / 2,822 unchanged defaults / 120 changed scenes. Synthetic touch/remote casts in both slots/facings, full/low HP and hit/guard/rear/jump/far/wall fixtures. Complete homing flight matches an independent simulation; tick-16 release, no kickback, 30 CE/300-tick cooldown, 85 damage (17 guard), lifetime and recovery retained. Rear/far targets are reached later by existing homing. Exact desktop world parity; changes fit body unions; phone HUD/controls, other moves, Domains and portraits stay exact.
- --guided-baseline --preview-only omits only Guided and reproduces all three missing-animation groups. Preview-only deliberately permits those expected failures.
- Actual 30-script mobile HTML boot/general input suite passes pointer/multi-touch, freeze taps, cleanup/rotation, CPU/watch, host/guest encoding, all sixty labels/states, safe-area targets and complete synthetic CPU match/results/rematch/title return. Scripted CPU outcomes are not human balance evidence.
- All thirteen prior suites PASS: mobile-animation, mobile-maximum, mobile-convergence, mobile-quake, mobile-ordinary, mobile-beam-body, mobile-contract, mobile-blast, mobile-granite, mobile-red, mobile-blue, mobile-flame and mobile-grape. Independent fixtures retain Guided for unrelated-pose comparisons. Mobile-utility PASS: three groups / 26 layouts / 16 toggles and v154 stamp. Mobile-present PASS: 73 full-frame comparisons, fifteen Domains, deferred-copy faults, orientations/DPR 3, layer separation and no per-frame canvas allocation. Mobile-install and feel (eleven groups plus keyboard/remote handlers) PASS. Sequential runner exited zero: ALL 17 SUITES PASS; no tests remain running.
- Sixteen changed/new JS files parse; 34 resource paths and three icons exist and share v=157. SHA-256 confirms all 33 protected desktop/shared/mobile-runtime files byte-identical to run start. Protected Git diff and git diff --check pass. Unchanged dedicated desktop runtime/full-roster/world suites not repeated. No performance claim.
- 124 PNGs in codex mailbox: before/after thirteen-frame body/667x375 phone strips, native scenes, 812x320 and 844x390 release scenes and portrait models, both costumes/facings. Inspected before/after body strips/release, mirror bodies/release, native cradle/lift/guide, short-screen release, 844x390 and portrait. Export: node tests/mobile-guided.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion. Logs use v154- here.
- No browser/phone, physical keys/touch, live motion/FPS/latency, audible audio, native CSS/focus/events, installation/backgrounding, real two-device WebRTC or owner play of v154. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Next proposed v155 WEB: next reproduced ordinary-art or fighter-feel gap with native strips, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
