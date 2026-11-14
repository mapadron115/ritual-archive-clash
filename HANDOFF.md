# Handoff: Ritual Archive: Clash

## Current - version 23, script cache v=27 (2026-11-14)

All mailbox entries through 05:32 acted on/acknowledged; 378f061 is v21's commit, not pushed. V22 completed guard impact/stun recovery (seven added poses, 97/build/costume). V23 replaces all fifteen flat Domain/Maximum backdrops with distinct layered three-tone pixel spaces, navy contours and shaded volumes. Existing colors/ideas, target-following spotlight and stage floor preserved. Sparse eight-phase motes follow active Domain time and hold during pauses. Both selected spaces cache before the round; finite cache is about 10.4 MiB for all fifteen. No combat rule/timing/state, hitbox, damage, roster or art-name changes. All eleven scripts v=27; new pixel-domain.js loads before pixel-world.js.

Commit: none per coordinator 01:34/03:00; HEAD/base 378f061. No add/commit attempt; coordinator commits, never push. Combined V22-V23 inventory: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/main.js, src/pixel.js, src/pixel-world.js, src/pixel-domain.js (new); tests/guard-animation.cjs and tests/domain-backdrops.cjs (new); tests/airborne.cjs, animation.cjs, art-animation.cjs, cast-animation.cjs, contacts.cjs, domain-animation.cjs, hud.cjs, performance.cjs, runtime.cjs, stage.cjs, summons.cjs, trails.cjs, world.cjs. Existing test loaders include the new module; runtime checks eleven scripts/prewarming; performance adds Domain samples.

Visually inspected mailbox V22 phase/silhouette/contact scene/runtime images and v23-domain-backdrops.png (all fifteen), v23-domain-scene.png and v23-runtime-frame.png. Exact renderer/memory-canvas output, not browser captures. Ready for coordinator review/commit and owner's play before publication.

## Verification and limits

- V23: new backdrop suite passes 360 opaque hard-alpha motion frames, 45 unchanged stage floors, 45 actual input-driven Domain timelines across three stages, fifteen distinct broad three-tone palettes, finite cache/fallback, frozen cinematic frames, JSON stability/read-only drawing and identical outcomes against unrendered controls. Domain animation passes 30 timelines/48 effects/144 release samples/240 silhouettes. World 308 frames; stage 24 frames/45 Domain combinations; HUD 75 states/all 60 labels; silhouettes fifteen unique builds; runtime/rematch/host-guest/prewarming pass.
- V23 regressions: guard 90 timelines/300 silhouettes; cast 16/240; art 90/180; airborne real reaction/dust lifecycle/54 cells; contacts 88 cells; summons 352 cells/six timelines; trails 330 cells/26 samples; audio 32 mocked event families/missing API/rejected resume. git diff --check passes. V22 pixel 2,910 bounded <=24-color main/mirror frames, animation 135 timelines/60 ground contacts and feel/input eleven groups plus handlers passed earlier this run; unchanged branches not rerun in V23. Full-match smoke not rerun; combat unchanged (previous 225 ordered matchups/1,169,896 ticks).
- Current Node CPU only: quiet world+HUD 120 frames/stage, medians 2.23-2.36 ms/p95 2.81-3.97 ms. Cached Domain world+HUD 24 frames/kind, medians 3.24-3.61 ms/p95 3.57-4.64 ms. Cold background builds 5.44-8.58 ms, done before a round. Excludes browser upload/display/audio/input, effects stress and visible FPS.
- Not played by a person. No live browser motion/layout/sound/FPS, listening, keyboard rollover or real two-computer check. Earlier browser host unavailable/Opera UI denied. Both clients must reload all scripts (v1 input encoding changed).

## Previous work

- V9-v11 (c4c9888): attack-specific startup/recoil/settle and launch-to-get-up animation; exact grounded body origins; original Rainlit Gallery and Dawn Observatory, eight motion frames each, host-selected stage metadata; stronger punch pull-back/rear-leg weight. V8 (f54794a): all 60 card labels complete and Greta limb details. V1-v7 (28c4491): freeze-safe input, fair guard/AI reaction, original pixel roster/stage/effects/HUD and fifteen distinct silhouettes. Previews/reports remain in mailbox.
- V12-v13 (f524ad3): three-phase directional hit/guard/break effects; original snap/bass contact synthesis, block clinks, guard-break crack and quieter landings. Shared audio compression/master, cached noise, bounded voices, cleanup, mute-tail fade and gesture resume. Rules unchanged.
- V14-v15 (5653028): five velocity-selected airborne phases, takeoff/landing/body-impact dust with coalescing and lifecycle caps; short velocity-aligned projectile wakes with birth/flight/expiry phases. No simulation state or rules changed.

- V16-v17 (fff8cc7): open arch, curled crest and floor-reaching air reactions; four hound bounds, bite/release/wait, Nue wing/dive/bank and Toad extension/recoil. Existing state alone drives these cached frames.
- V18-v19 (a560f33): navy summon contours, three-tone volumes and separate tucked paws; twenty art poses with slash load/sweep, cannon brace/recoil, clap separation, sign opening, bow release and throw follow-through. Same rules and clocks.

- V20 (c79814c), V21 (378f061): open palm/spoken casts, Domain/Maximum anticipation and actual held releases. V22 (uncommitted): compressed guard contact and phased stun recovery; see current verification and mailbox.

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 97 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-domain.js: fifteen cached Domain spaces and active-clock motes. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: clearer grounded foot planting and movement/turn silhouettes from existing walk/velocity clocks, preserving all rules. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v22-v23; candidate ready for owner's play/listening check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
