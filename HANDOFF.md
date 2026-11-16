# Handoff: Ritual Archive: Clash

## Current - v158 MOBILE/cache v=161; desktop v157/cache v=160 (2026-11-16 16:11:06 UTC)

Mailbox through 2026-11-16 11:07 acted on; v157 accepted/live as 8a50050. Owner directly repeated autonomous check-in and mailbox reporting, with no new design direction. One version this run. Coordinator commits; never push.

Mobile now loads the existing src/desktop-nail.js after Round of Applause. Nell raises the hammer clear of her face at ticks 5-8, drives forward/down on the existing tick-9 two-nail release through 11, follows through at 12-14, withdraws at 15-17 and returns at 18-20. Serialized move age holds through freezes and event-free snapshots. All 36 mobile resource URLs (32 scripts) use v=161; title/error stamps say v158. Desktop stays v157/v=160. No combat, timing, costs/damage, nail paths/embedding, physics, effects, input, HUD, audio, roster/name, style or dependency change. All src and existing mobile runtime/CSS/assets unchanged.

Commit: none; HEAD/base 8a50050c3ae9dcabc775b63bbfca6cff90c98b80. No add/commit attempt per coordinator 01:34/03:00; never pushed. Seven files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, tests/mobile-nail.cjs (new), tests/mobile.cjs, tests/mobile-applause.cjs and tests/mobile-utility.cjs.

## Verification and limits

- Mobile-nail PASS: three groups / 5,600 parallel ticks / 912 raster comparisons / 432 frozen holds / 48 event-free guest snapshots / 2,836 unchanged defaults / 120 changed native scenes. Synthetic touch/remote inputs in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity. Exact independent simulation and desktop-world parity: tick-9 two-nail release, horizontal speeds 21, vertical speeds +/-0.6, 12 CE/50-tick cooldown, embedding and recovery retained. Close two-hit damage remains 45.12 with two embedded nails. All-stage differences fit body unions; mobile HUD/controls, early/airborne/interrupted bodies, other moves, portraits and Domains stay exact.
- --nail-baseline --preview-only reproduces all three missing-body groups; preview-only deliberately permits those expected failures. No fixture corrections or production combat changes.
- Mobile-applause PASS: three groups / 7,200 parallel ticks / 1,380 raster comparisons / 540 frozen holds / 60 guest snapshots / 2,830 unchanged defaults / 120 changed scenes. Its independent reference now includes Nail so other-move checks stay current. Both focused suites render each frame but omit redundant memory-canvas uploads during long input sweeps; sampled worlds are compared directly, and generic integration/guest checks retain full uploads.
- Mobile utility PASS: three groups / 26 layouts / 16 mute toggles. Generic actual-32-script mobile integration runs within each suite and passes: complete scripted CPU match/results/rematch/title return, ten commands, multi-touch, buffers/cleanup, CPU/watch, mocked host/guest input, rotation, HUD/controls and 36 safe-area bounds. Memory DOM/canvas, not a browser/phone. No tests remain running.
- Four changed/new CJS files parse; all 36 versioned mobile resources exist at v=161. Protected Git diff and git diff --check pass. Start SHA-256 inventory in v158-protected-files.json: 37 desktop/src/mobile top-level files match start and HEAD (EOL normalized); assets also unchanged in Git. Unchanged desktop runtime, feel, full-roster/world suites not repeated. No performance claim.
- 232 PNGs in codex mailbox: paired native scenes, twelve-frame body/667x375 phone strips in both costumes/facings, close hits/far whiffs, 812x320/844x390 release and portrait models. Inspected old/new body strips, mirror body, old/new unobscured phone release, short/large landscape release and portrait. Export: node tests/mobile-nail.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion. Logs: v158-nail.log, v158-applause.log, v158-utility.log and v158-baseline.log.
- No browser/phone, physical touch/keys, live motion/FPS/latency, audible audio, real two-device WebRTC or owner play of v158. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Completion mailbox reread unchanged through 11:07. Next proposed v159 WEB: next reproduced ordinary-art or fighter-feel gap with native strips, unless phone feedback jumps the queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
