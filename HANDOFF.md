# Handoff: Ritual Archive: Clash

## Current - version 25, script cache v=29 (2026-11-14)

All mailbox entries through 05:53 acted on/acknowledged; coordinator committed v22-v23 as 0f1f85c, not pushed. V24 distinguishes Absolute Counter with round jade shields (report below in mailbox). V25 replaces the four shared walk cells with eight advancing and eight guarded retreat cells. Existing walkT chooses three-tick steps; signed velocity relative to facing selects advance/retreat immediately on reversals and opponent crossings. Supporting soles stay at the floor; swing knees lift/pass/reach. Thick calf contours now terminate inside boots for these cells. Twelve added poses bring each build/costume to 109. All eleven scripts v=29. No simulation fields, control delay, movement speeds, combat timings/rules, hitboxes, damage, roster or art-name changes.

Commit: none per coordinator 01:34/03:00; HEAD/base 0f1f85c. No add/commit attempt; coordinator commits, never push. Combined v24-v25 changed files: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/pixel.js, src/pixel-domain.js, tests/domain-backdrops.cjs; new tests/footwork.cjs. No simulation/definition/AI files changed.

Visually inspected v24-domain-comparison.png and v25-footwork-phases.png, v25-footwork-silhouettes.png, v25-footwork-scene.png in the codex mailbox. Runtime composites saved for both versions. These are exact renderer/memory-canvas previews, not browser captures. Ready for coordinator review/commit and owner's play before publication.

## Verification and limits

- V25 footwork: 60 actual walk/reversal/opponent-crossing timelines, 480 main/mirror grounded frames, 360 support-foot boundaries with <=2 native-pixel drift at normal speeds; distinct advance/retreat masks for all builds; impact/global/time-stop holds, snapshot/read-only stability, attack/rematch transitions and identical outcomes against unrendered controls. This is reduced sliding at discrete pose changes, not continuous foot locking; buffs/slows may slide more.
- V25 regressions: pixel 3,270 bounded hard-alpha <=24-color frames; animation 135 actual move timelines/60 grounded body contacts; feel eleven simulation groups plus real keyboard/remote handlers; fifteen unique idle silhouettes; real HTML script-order/menu/input/pause/rematch/host-guest integration pass. git diff --check passes. Audio/summon/contact/art/airborne-specific suites and full-match smoke not rerun in V25 (unchanged branches). Last full-match smoke: 225 ordered matchups/1,169,896 ticks.
- V24 scenery: 360 opaque motion frames, 45 unchanged floors, 45 actual Domain timelines across three stages; finite cache/fallback, broad three-tone palettes, cinematic holds, snapshot/read-only stability and identical outcomes. Stage 24 frames/45 Domain combinations; world 308 frames; runtime integration pass.
- Quiet repeat of Node CPU raster sample after concurrent tests ended: world+HUD 120 frames/stage, medians 1.89-2.13 ms/p95 2.76-3.23 ms; cached Domains 24 frames/kind, medians 2.69-3.50 ms/p95 3.15-5.18 ms. Cold Domain builds 4.60-9.21 ms before a round (Absolute Counter 9.21 ms). Earlier concurrent sample was noisy, not used for comparison. These samples use ordinary idle/Domain scenes, not movement/effects stress; exclude browser upload/display/audio/input and are not visible FPS.
- Not played by a person. No live browser motion/layout/sound/FPS, listening, keyboard rollover or real two-computer check. Earlier browser host unavailable/Opera UI denied. Both clients must reload all scripts (v1 input encoding changed).

## Previous work

- V9-v11 (c4c9888): attack-specific startup/recoil/settle and launch-to-get-up animation; exact grounded body origins; original Rainlit Gallery and Dawn Observatory, eight motion frames each, host-selected stage metadata; stronger punch pull-back/rear-leg weight. V8 (f54794a): all 60 card labels complete and Greta limb details. V1-v7 (28c4491): freeze-safe input, fair guard/AI reaction, original pixel roster/stage/effects/HUD and fifteen distinct silhouettes. Previews/reports remain in mailbox.
- V12-v13 (f524ad3): three-phase directional hit/guard/break effects; original snap/bass contact synthesis, block clinks, guard-break crack and quieter landings. Shared audio compression/master, cached noise, bounded voices, cleanup, mute-tail fade and gesture resume. Rules unchanged.
- V14-v15 (5653028): five velocity-selected airborne phases, takeoff/landing/body-impact dust with coalescing and lifecycle caps; short velocity-aligned projectile wakes with birth/flight/expiry phases. No simulation state or rules changed.

- V16-v17 (fff8cc7): open arch, curled crest and floor-reaching air reactions; four hound bounds, bite/release/wait, Nue wing/dive/bank and Toad extension/recoil. Existing state alone drives these cached frames.
- V18-v19 (a560f33): navy summon contours, three-tone volumes and separate tucked paws; twenty art poses with slash load/sweep, cannon brace/recoil, clap separation, sign opening, bow release and throw follow-through. Same rules and clocks.

- V20 (c79814c), V21 (378f061): open palm/spoken casts, Domain/Maximum anticipation and actual held releases. V22-V23 (0f1f85c): compressed guard/stun recovery and fifteen layered Domain spaces. V24 (uncommitted): round jade shields distinguish Absolute Counter from the emerald crags of Everything I Have.

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 109 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-domain.js: fifteen cached Domain spaces and active-clock motes. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: victory anticipation and settling from existing round clocks, preserving all rules. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v24-v25; candidate ready for owner's motion/play/listening check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
