# Handoff: Ritual Archive: Clash

## Current - versions 18-19, script cache v=23 (2026-11-14)

Acted on every coordinator entry through 04:33; fff8cc7 acknowledged (v16-v17, not pushed). No decision pending. Combat rules, timing, hitboxes, damage, roster and simulation files unchanged.

- V18: navy summon contours and three-tone volumes; outlined, separately placed paws in both tucked hound bounds; shaded Nue feathers/body/head and Toad back/belly/forelegs/toes. Same motion phases, exact mirrors and existing clocks. All ten scripts v=22.
- V19: twenty new art poses (72/build/costume). Slash high load/downward sweep/low follow-through; low braced cannon release/recoil; forward clap and separation; signs opening below chest; bow draw/release and throw follow-through. Release hands closer to existing shot origins. Exact original startup/contact/recovery windows, including short moves. All ten scripts v=23.

Commit: none per coordinator 01:34/03:00; HEAD/base fff8cc7. No add/commit attempt; coordinator commits, never push. Combined inventory: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/pixel-world.js, src/pixel.js, tests/summons.cjs, tests/art-animation.cjs (new).

Mailbox previews visually inspected: v18-summon-phases.png, v18-summon-scene.png, v18-runtime-frame.png; v19-art-phases.png, v19-art-silhouettes.png, v19-art-scene.png (actual first firing ticks), v19-runtime-frame.png. Renderer/memory-canvas output, not browser screenshots. Ready for coordinator review/commit and owner's play before publication.

## Verification and limits

- V18 summon suite: 352 bounded hard-alpha frames, three-tone palettes, exact directional cells, four bounds/wing strokes, bite/release/wait, dive/bank, Toad extension/recoil; six actual art/owner timelines, freeze/time-stop, snapshot stability, expiry/dispel/round cleanup and unchanged outcomes against unrendered simulation. World 308 frames, trails 330 directional frames/26 real samples, feel/input 11 groups plus handlers, runtime/rematch and git diff --check pass.
- V19: 2,160 bounded hard-alpha <=24-color main/mirror frames; 90 actual art/owner timelines and phase boundaries, 180 palette-independent contact/recoil/settle comparisons across all builds; actual cannon/arrow firing-tick alignment, frozen/snapshotted frames and deterministic equivalence. Animation 135 timelines/60 ground contacts, feel/input and runtime/rematch pass; git diff --check passes. V16 airborne/dust and prior stage/HUD/contact/audio/full-match/performance suites not rerun this pass.
- Earlier CPU quiet raster: median 4.20-5.90 ms, p95 5.75-8.36 ms over 120 frames/stage. Excludes browser upload/display/audio/input; not browser FPS or effects stress. Earlier audio uses mocks, nobody has listened. Earlier full-match smoke passed 225 ordered matchups (1,169,896 ticks); not rerun as simulation unchanged.
- Not played by a person. No live browser layout/motion/sound/FPS, keyboard rollover or real two-computer check. Earlier browser host unavailable/Opera UI denied. Both online clients should reload all scripts (v1 input encoding changed).

## Previous work

- V9-v11 (c4c9888): attack-specific startup/recoil/settle and launch-to-get-up animation; exact grounded body origins; original Rainlit Gallery and Dawn Observatory, eight motion frames each, host-selected stage metadata; stronger punch pull-back/rear-leg weight. V8 (f54794a): all 60 card labels complete and Greta limb details. V1-v7 (28c4491): freeze-safe input, fair guard/AI reaction, original pixel roster/stage/effects/HUD and fifteen distinct silhouettes. Previews/reports remain in mailbox.
- V12-v13 (f524ad3): three-phase directional hit/guard/break effects; original snap/bass contact synthesis, block clinks, guard-break crack and quieter landings. Shared audio compression/master, cached noise, bounded voices, cleanup, mute-tail fade and gesture resume. Rules unchanged.
- V14-v15 (5653028): five velocity-selected airborne phases, takeoff/landing/body-impact dust with coalescing and lifecycle caps; short velocity-aligned projectile wakes with birth/flight/expiry phases. No simulation state or rules changed.

- V16-v17 (fff8cc7): open arch, curled crest and floor-reaching air reactions; four hound bounds, bite/release/wait, Nue wing/dive/bank and Toad extension/recoil. Existing state alone drives these cached frames.

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 72 poses/builds, pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: generic cast releases and spoken-art silhouettes, preserving all existing rules. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v18-v19; candidate ready for owner's play/listening check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
