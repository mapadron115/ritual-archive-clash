# Handoff: Ritual Archive: Clash

## Current - version 27, script cache v=31 (2026-11-14)

All mailbox entries through 06:13 acted on/acknowledged. Coordinator committed v24-v25 as 7ca6ad5, not pushed. V26 adds lowered-guard, fist-lift and settled victory cells around the original raised peak; existing KO phaseT drives them only for living grounded idle winners. Recovery/airborne winners join the current phase when eligible; ties never celebrate and match-over settles. V27 adds tucked crest, unfolded descent and floor-reaching approach to ordinary jumps. Existing velocity/height selects these cells; attacks, hits, KO and Maximum casts keep priority. Six added cells bring each build/costume to 115. All eleven scripts v=31. No simulation fields, controls, timing, combat rules, damage, hitboxes, roster or names changed.

Commit: none per coordinator 01:34/03:00; HEAD/base 7ca6ad5. No add/commit attempt; coordinator commits, never push. Combined v26-v27 files: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/pixel.js; new tests/victory.cjs and tests/jump-animation.cjs. No simulation/definition/AI files changed.

Visually inspected v26-victory-phases/silhouettes/scene.png and v27-jump-phases/silhouettes/scene.png in the codex mailbox; runtime composites saved for both. Exact renderer/memory-canvas previews, not browser captures. Ready for coordinator review/commit and owner's play before publication.

## Verification and limits

- V27: 180 real straight/directional/Domain-slowed jump timelines across all builds/both slots, 90 costume silhouette comparisons and 120 actual air-attack/hit/KO interruptions. Floor clearance, impact/global/time-stop holds, snapshots, read-only rendering, held-input/landing/rematch transitions and identical outcomes pass. Floor-clearance addition was verified by a second full run of the targeted suite.
- V26: 180 KO/timeout/airborne-winner timelines, 120 grounded costume frames and 120 phase silhouette comparisons. Tied timeouts, recovery eligibility, impact/global holds, JSON snapshots, round/rematch and identical outcomes pass; rerun after V27. Delayed airborne winners correctly skip early victory phases.
- Regressions: 3,450 bounded hard-alpha <=24-color fighter frames; 135 actual move timelines/60 grounded body contacts; airborne reactions/dust/54 cells; 60 footwork timelines/480 grounded frames/360 support boundaries (<=2 native-pixel drift); fifteen unique idle silhouettes; real HTML script-order/menu/input/pause/rematch/host-guest integration; git diff --check. Eleven feel/input groups passed in V26; not repeated in V27. Audio, summons, Domain, stage, contact and full-match suites not rerun for unchanged branches. Last full-match smoke: 225 ordered matchups/1,169,896 ticks.
- Last quiet Node CPU raster sample (V25): world+HUD medians 1.89-2.13 ms/p95 2.76-3.23 ms; cached Domains medians 2.69-3.50 ms/p95 3.15-5.18 ms. Cold cells 4.60-9.21 ms before rounds. Idle/Domain scenes, excluding browser display/upload/audio/input and movement/effects stress; not visible FPS. Not repeated this run.
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
- src/pixel.js: integer raster, bitmap font, palettes, 115 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-domain.js: fifteen cached Domain spaces and active-clock motes. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: distinct airborne punch/kick wind-ups and recovery, preserving all rules. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v24-v25; candidate ready for owner's motion/play/listening check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
