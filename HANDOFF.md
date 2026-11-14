# Handoff: Ritual Archive: Clash

## Current - versions 14-15, script cache v=19 (2026-11-14)

Acted on every coordinator entry through 03:54. v12-v13 committed as f524ad3 (not pushed). Continuing independently under 03:00; no decision pending. Combat rules, timing, hitboxes, damage, roster and simulation files unchanged this run.

- V14 (v=18): three original airborne reaction poses (52 per costume) bridge launch, arched ascent, tucked crest, fall and landing brace. Existing vertical velocity holds them through freezes. Separate takeoff, landing and body-impact dust sequences; paired land/thud events merge into one larger cloud. Dust expires, caps at 32 and clears on rematch.
- V15 (v=19): short velocity-aligned projectile wakes with birth growth, repeating flight detail and expiry shortening. Blade streaks, energy ribbons, stone chips, shell exhaust and gum beads keep the existing cores readable. Uses only existing age/life/velocity; no history or fields added to simulation. Stationary pebbles have no wakes. Every script URL v=19.

Commit: none per coordinator 01:34/03:00; HEAD/base f524ad3. No add/commit attempt. Coordinator commits; never push. Combined inventory: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/pixel.js, src/pixel-world.js, src/render.js, src/main.js, tests/airborne.cjs (new), tests/trails.cjs (new), tests/runtime.cjs.

Previews in codex mailbox, all visually inspected: v14-airborne-frames.png, v14-floor-dust.png, v14-runtime-frame.png; v15-energy-trails.png, v15-physical-trails.png, v15-trail-scene.png, v15-runtime-frame.png. Generated renderer/memory-canvas output, not browser screenshots. Ready for coordinator review/commit and owner's play before publication.

## Verification and limits

- V14: airborne suite passes actual launch through get-up, freeze holds, real jump/land/thud wiring, coalescing, expiry/cap, 54 bounded hard-alpha dust frames and read-only rendering. Pixel suite: 1,560 bounded <=24-color main/mirror frames. Animation: 135 move timelines and 60 ground contacts. Feel/input and runtime/rematch pass.
- V15: trail suite passes 330 directional hard-alpha frames, every projectile family, 26 real art/owner samples, growth/expiry shortening, stationary/expired absence, freeze and JSON stability, read-only rendering. World suite: 308 opaque art/ultimate/projectile/summon/Black Flash frames. Runtime and git diff --check pass.
- Latest Node CPU raster sample: 120 frames per stage, median 4.20-5.90 ms, p95 5.75-8.36 ms. Quiet world+HUD sample; excludes browser upload/display/audio/input, not browser FPS or an effects stress test.
- Earlier v13 audio suite: 32 event families, envelopes/mixing/mute/resume/noise reuse/voice cap/cleanup, mock Web Audio only; nobody has listened yet. v12 contact suite: 88 frames, exact mirrors, event wiring and lifecycle. Prior stage/HUD/silhouette suites pass; not rerun this pass. Prior full-match smoke: 90 arts, 30 ultimates, all 225 ordered matches including mirrors (1,169,896 ticks); not rerun because simulation unchanged.
- Not played by a person. No live browser menu-layout/capture/motion/sound/FPS, keyboard rollover or real two-computer check. Earlier browser host unavailable/Opera UI denied. Both online clients should reload all scripts (v1 input encoding changed).

## Previous work

- V9-v11 (c4c9888): attack-specific startup/recoil/settle and launch-to-get-up animation; exact grounded body origins; original Rainlit Gallery and Dawn Observatory, eight motion frames each, host-selected stage metadata; stronger punch pull-back/rear-leg weight. V8 (f54794a): all 60 card labels complete and Greta limb details. V1-v7 (28c4491): freeze-safe input, fair guard/AI reaction, original pixel roster/stage/effects/HUD and fifteen distinct silhouettes. Previews/reports remain in mailbox.
- V12-v13 (f524ad3): three-phase directional hit/guard/break effects; original snap/bass contact synthesis, block clinks, guard-break crack and quieter landings. Shared audio compression/master, cached noise, bounded voices, cleanup, mute-tail fade and gesture resume. Rules unchanged.

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 52 poses/builds, pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: attack-specific motion accents and clearer summon motion, preserving all existing rules. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v14-v15; candidate ready for owner's play/listening check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
