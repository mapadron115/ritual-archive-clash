# Handoff: Ritual Archive: Clash

## Current - v148 MOBILE/cache v=151; desktop v147/cache v=150 (2026-11-16 11:12:40 UTC)

Mailbox through 2026-11-16 05:40 acted on; completion reread unchanged. V147 accepted/published as fc559dc. Owner directly repeated autonomous check-in and reporting; no new design direction. One version this run. Coordinator commits; never push.

Mobile loads the existing reviewed src/desktop-blue.js after Reversal Red. Lapse Blue reaches at ticks 6-11, closes the hand on the original tick-12 orb release, draws inward at 15-18 and recovers at 19-23. Serialized move age holds through freezes and first event-free snapshots. All 31 versioned mobile page resource URLs and three manifest icon URLs use v=151; title/error stamps say v148. Desktop, all shared sources and mobile runtime/CSS remain untouched. No combat, input, HUD, effect, audio, physics, roster/name, style or dependency change.

Commit: none; HEAD/base fc559dcb1e0a4183009978ece59778c620b8c2ef. No add/commit attempt per 01:34/03:00; never pushed. Seventeen files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest; tests/mobile-blue.cjs (new), mobile.cjs, mobile-utility.cjs, mobile-animation.cjs, mobile-maximum.cjs, mobile-convergence.cjs, mobile-quake.cjs, mobile-ordinary.cjs, mobile-beam-body.cjs, mobile-contract.cjs, mobile-blast.cjs, mobile-granite.cjs, mobile-red.cjs.

## Verification and limits

- Mobile-blue PASS: three groups / 5,760 parallel ticks / 748 rasters / 396 frozen holds / 44 event-free guest snapshots / 2,832 defaults / 96 changed scenes. Actual synthetic touch/remote casts in both slots/facings, full/low HP and hit/guard/rear/jump/far/wall. Exact simulation/desktop raster parity; tick-12 orb position/lifetime, pull, 20 CE/150-tick cooldown, 85 burst damage (12.75 guarded), recovery and zero kickback preserved. Tested jump still takes burst; rear/far escape. All-stage differences fit old/new body unions; phone HUD/controls, unrelated moves, Domains and portraits remain exact.
- --blue-baseline --preview-only omits only Blue and reproduces all three missing-animation failures; preview-only deliberately permits them. Actual mobile 27-script boot/general input suite passes pointer/multi-touch, freeze buffering, cleanup/rotation, CPU/watch, host/guest encoding, all sixty move names/states, safe-area targets and complete synthetic CPU match/results/rematch/title return. No balance claim.
- All ten updated prior-animation suites PASS: mobile-animation, mobile-maximum, mobile-convergence, mobile-quake, mobile-ordinary, mobile-beam-body, mobile-contract, mobile-blast, mobile-granite and mobile-red. Independent fixtures retain Blue in unrelated-pose comparisons. No tests remain running. Ready for coordinator review/commit/publication, then owner play.
- Mobile-utility PASS: three groups / 26 layouts / 16 toggles and v148 title. Mobile-present PASS: 73 ordinary/deferred full-frame comparisons, fifteen Domains, orientations/DPR 3, opaque skipped-copy recovery and layer separation. Mobile-install and feel (eleven groups plus handlers) PASS. Thirteen changed/new JS files parse; protected-file checks and git diff --check PASS. Thirty-five protected files equal exact HEAD blobs; untouched desktop index.html has only its pre-existing checkout CRLF/LF difference, normalized-equal and clean protected Git diff.
- 108 PNGs in codex mailbox: before/after eleven-frame native body and 667x375 phone strips/scenes in both costumes/facings, plus 812x320, 844x390 and portrait releases. Inspected old/new main body strips, mirror bodies, old/new release, main reach/draw, short-screen release, mirror draw, 844x390 and portrait. Export: node tests/mobile-blue.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion.
- No browser/phone, physical touch/keys, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v148. Unchanged desktop/full-roster/world suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reload-working iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5. Proposed next v149 WEB: next reproduced ordinary-art/fighter-feel gap, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit stay deferred. No question needed.

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
