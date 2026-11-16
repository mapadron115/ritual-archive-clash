# Handoff: Ritual Archive: Clash

## Current - v146 MOBILE/cache v=149; desktop v145/cache v=148 (2026-11-16 09:54:01 UTC)

Mailbox through 2026-11-16 04:35 acted on; completion reread unchanged; v145 accepted/published as 3251ea5. Owner directly repeated autonomous check-in, outstanding orders and reporting; no new design direction. One version this run. Coordinator commits; never push.

V146 loads the reviewed src/desktop-red.js in the mobile HTML: palm coil at ticks 6-11, drive on the original tick-12 projectile, recoil at 15-18 and recovery at 19-24. Serialized move age holds through freezes and event-free snapshots. All 30 mobile resource URLs and three manifest icon URLs use v=149; title/error stamps say v146. Desktop and all source files unchanged; no mobile runtime/CSS, combat, input, effect or dependency change.

Commit: none; HEAD/base 3251ea57fd3bd9a17bed055c01bfca4afb6dc019. No add/commit attempt per 01:34/03:00; never pushed. Sixteen files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile-red.cjs (new), tests/mobile.cjs, tests/mobile-utility.cjs, tests/mobile-animation.cjs, tests/mobile-beam-body.cjs, tests/mobile-blast.cjs, tests/mobile-contract.cjs, tests/mobile-convergence.cjs, tests/mobile-granite.cjs, tests/mobile-maximum.cjs, tests/mobile-ordinary.cjs, tests/mobile-quake.cjs.

## Verification and limits

- Mobile-red PASS: three groups / 4,320 parallel ticks / 748 rasters / 396 freeze holds / 44 guest snapshots / 2,830 defaults / 96 changed scenes. Actual touch/remote input edges in both slots/facings, full/low HP and hit/guard/rear/jump/far/wall. Exact state and desktop raster parity, tick-12 release, 28 CE/140-tick cooldown, projectile geometry/lifetime, 100 damage (20 guarded), 145 wall damage, escape and recovery. All-stage differences fit old/new body unions; HUD, controls, other moves, Domains and portraits exact.
- --red-baseline --preview-only omits only Red and reproduces three missing-animation groups; preview-only deliberately permits expected failures. Real mobile HTML/main-loop boot also passes complete CPU-match/results/rematch, pointer commands, cleanup, rotation, host/guest encoding and resource HUD. Synthetic CPU results are not balance evidence.
- Mobile-utility PASS: three groups / 26 layouts / 16 toggles, separated >=48 px targets, fixed utility slots and v146 stamp. Mobile-present PASS: 73 normal/deferred full-frame comparisons, fifteen Domains, orientations/DPR 3 and skipped-copy recovery. Mobile-install and feel (eleven groups plus keyboard/remote handlers) PASS. All nine updated prior-animation suites PASS: mobile-animation, mobile-maximum, mobile-convergence, mobile-quake, mobile-ordinary, mobile-beam-body, mobile-contract, mobile-blast and mobile-granite. No tests remain running.
- Twelve changed/new JS files parse; protected-file check and git diff --check PASS. All 34 protected source/mobile files equal exact HEAD blobs. Untouched desktop index.html has one pre-existing CRLF instead of Git LF; normalized equality and clean protected git diff confirmed.
- 108 PNGs in codex mailbox: paired eleven-frame body/phone strips, individual native/667x375 scenes and release at 812x320, 844x390 and portrait. Inspected old/new main bodies, mirror bodies, old/new release, short-screen release, mirrored recoil and portrait. Export: node tests/mobile-red.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion.
- No browser/phone, physical touch/keys, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v146. Unchanged desktop suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reload-working iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5. Proposed next v147 WEB: next reproduced ordinary-art or fighter-feel gap, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
