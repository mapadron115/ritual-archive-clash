# Handoff: Ritual Archive: Clash

## Current - version 21, script cache v=25 (2026-11-14)

Acted on every coordinator entry through 05:12; c79814c acknowledged (v20, not pushed). Optional speech-mouth note: retained the existing mouth and let the lean carry the word, as offered. No decision pending. Combat rules, timing, hitboxes, damage, roster and simulation files unchanged.

- V21: Domain cinematic gathers the arms, closes a high seal, then opens wide; Maximums coil low and prepare their own releases. Held beams, voice, claps, hammer throws, string pulls and slashes follow actual effect ticks. The diving Maximum lifts its knees, descends fist-first and lands in a low impact pose. Eleven new poses (90/build/costume). The real input-driven Domain clock executes tick 1 before the sixty-tick cinematic freeze; drawing preserves that behavior and all existing holds/interruption rules. All ten scripts v=25.

Commit: none per coordinator 01:34/03:00; HEAD/base c79814c. No add/commit attempt; coordinator commits, never push. Inventory: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/pixel.js, tests/domain-animation.cjs (new).

Mailbox previews visually inspected: v21-domain-phases.png, v21-domain-silhouettes.png, v21-domain-scene.png (actual input-driven countdown/release/contact snapshots), v21-runtime-frame.png. Renderer/memory-canvas output, not browser screenshots. Ready for coordinator review/commit and owner's play before publication.

## Verification and limits

- V21: pixel suite 2,700 bounded hard-alpha <=24-color main/mirror frames. New Domain suite: 30 full input-driven Domain/Maximum timelines through expiry, 48 actual effects, 144 release-frame samples, 240 adjacent-phase silhouette comparisons across all builds/costumes, cinematic phases, extra global pause holds, snapshot stability, interruptions/other-owner clock/clash/KO/rematch and deterministic equivalence to an unrendered control. Cast suite 16 timelines/240 silhouettes, art suite 90 timelines/180 silhouettes, animation 135 timelines/60 ground contacts, feel/input 11 groups plus handlers, real-script-order runtime/rematch and git diff --check pass.
- Earlier V18 summon suite: 352 bounded hard-alpha frames, three-tone palettes, exact directional cells, six real summon timelines and lifecycle/freeze checks. World 308 frames and trails 330 directional frames/26 real samples passed. These, airborne/dust, stage/HUD/contact/audio/full-match/performance suites were not rerun in V21; their source remains unchanged.
- Earlier CPU quiet raster: median 4.20-5.90 ms, p95 5.75-8.36 ms over 120 frames/stage. Excludes browser upload/display/audio/input; not browser FPS or effects stress. Earlier audio uses mocks, nobody has listened. Earlier full-match smoke passed 225 ordered matchups (1,169,896 ticks); not rerun as simulation unchanged.
- Not played by a person. No live browser layout/motion/sound/FPS, keyboard rollover or real two-computer check. Earlier browser host unavailable/Opera UI denied. Both online clients should reload all scripts (v1 input encoding changed).

## Previous work

- V9-v11 (c4c9888): attack-specific startup/recoil/settle and launch-to-get-up animation; exact grounded body origins; original Rainlit Gallery and Dawn Observatory, eight motion frames each, host-selected stage metadata; stronger punch pull-back/rear-leg weight. V8 (f54794a): all 60 card labels complete and Greta limb details. V1-v7 (28c4491): freeze-safe input, fair guard/AI reaction, original pixel roster/stage/effects/HUD and fifteen distinct silhouettes. Previews/reports remain in mailbox.
- V12-v13 (f524ad3): three-phase directional hit/guard/break effects; original snap/bass contact synthesis, block clinks, guard-break crack and quieter landings. Shared audio compression/master, cached noise, bounded voices, cleanup, mute-tail fade and gesture resume. Rules unchanged.
- V14-v15 (5653028): five velocity-selected airborne phases, takeoff/landing/body-impact dust with coalescing and lifecycle caps; short velocity-aligned projectile wakes with birth/flight/expiry phases. No simulation state or rules changed.

- V16-v17 (fff8cc7): open arch, curled crest and floor-reaching air reactions; four hound bounds, bite/release/wait, Nue wing/dive/bank and Toad extension/recoil. Existing state alone drives these cached frames.
- V18-v19 (a560f33): navy summon contours, three-tone volumes and separate tucked paws; twenty art poses with slash load/sweep, cannon brace/recoil, clap separation, sign opening, bow release and throw follow-through. Same rules and clocks.

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 90 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: clearer guard impact and guard-break recovery silhouettes using existing block/stun timers, preserving all rules. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v21; candidate ready for owner's play/listening check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
