# Handoff: Ritual Archive: Clash

## Current - version 34, script cache v=38 (2026-11-14)

All mailbox entries through 08:32 acted on/acknowledged. Coordinator committed v33 as a7d8836, not pushed. Before drawing, ranked first-minute gaps in FROM_CODEX.md as requested: selection/start flow, title, first-hit readability, HUD learning, round ending, sound/motion validation, then further animation detail. V34 works the top item instead of the planned third-punch soles.

Selection now shows all fifteen portrait choices on each side, two selected full-body previews (including mirror costumes), compact arena choices, mode-specific quick controls and expandable full move lists/rules. Back/Fight stay outside the scrolling body. Fighter/stage clicks preserve the existing choice buttons and keyboard focus; arrows/Home/End browse a roster, Enter/Space use native button activation. Names, rules, move descriptions and all modes retained. Eleven scripts v=38. No simulation, definition, AI, sprite, audio or combat changes.

Commit: none per coordinator 01:34/03:00; HEAD/base a7d8836. No add/commit attempt; coordinator commits, never push. V34 files: HANDOFF.md, README.md, ART_DIRECTION.md, index.html, src/main.js, tests/runtime.cjs.

Visually inspected v34-selection-assets.png (actual main/mirror menu canvases for all fifteen) and v34-runtime-frame.png in the codex mailbox. These are exact canvas previews, not browser captures or an HTML-layout rendering. Browser host unavailable; Opera Computer Use explicitly denied. Candidate for coordinator review/commit, especially browser selection layout at desktop/small sizes and keyboard flow, then owner play before publication.

## Verification and limits

- V34: 150 fighter selections across AI/local/watch/host/guest; full move lists, online restrictions, stable button/focus identity, six arrow/Home/End navigation boundaries and 30 exact main/mirror preview canvases pass. Real script-order/start/input/pause/rematch/host-guest integration, eleven feel/input groups and handlers, 75 HUD states/all 60 names, 32 sound families/mocked audio lifecycle, syntax and git diff --check pass. No browser CSS/layout verification, human play/listening/FPS or real online check. Unchanged sprite/animation/stage/world/Domain/full-match/performance suites not repeated.

- V32-V33: first-/second-punch return passes across all builds/slots/facings, exact eight/nine recovery ticks, fixed grounded soles and 240/270 immediate chain transitions. Actual whiff/hit/block chains, freezes, snapshots, rendering independence, interruptions and held-input suppression pass. Last pixel bounds check: 4,020 hard-alpha <=24-color frames. Prior complete counts and exclusions remain in the dated mailbox reports.
- V29-V31: far-arm second-punch load, third-punch high follow-through and kick fold/plant checks pass across both slots/facings/costumes. Air direction: 120 actual world-painter root-reflection/forward-contact raster checks; Greta was correctly facing left. Contact events are cleared each test tick so old first-punch events cannot count as later contacts. Detailed counts/previews remain in the dated mailbox reports.
- V26-V28: air normals 360 timelines/240 silhouettes/120 grounded hit-block contacts; jumps 180 timelines/90 silhouettes/120 interruptions; victory 180 timelines/120 grounded frames/120 silhouettes. Floor clearance, phase boundaries, pauses, snapshots, rendering independence, interruptions, held inputs, round/rematch and identical outcomes pass. Delayed airborne winners skip early victory phases. Air guarding remains prohibited by the original rules. Details in prior reports.
- Earlier regressions: airborne reactions/dust/54 cells; 60 footwork timelines/480 grounded frames/360 support boundaries (<=2 native-pixel drift); fifteen unique idle silhouettes. Last full-match smoke: 225 ordered matchups/1,169,896 ticks.
- Last quiet Node CPU raster sample (V25): world+HUD medians 1.89-2.13 ms/p95 2.76-3.23 ms; cached Domains medians 2.69-3.50 ms/p95 3.15-5.18 ms. Cold cells 4.60-9.21 ms before rounds. Idle/Domain scenes, excluding browser display/upload/audio/input and movement/effects stress; not visible FPS. Not repeated this run.
- Not played by a person. No live browser motion/layout/sound/FPS, listening, keyboard rollover or real two-computer check. Earlier browser host unavailable/Opera UI denied. Both clients must reload all scripts (v1 input encoding changed).

## Previous work

- V9-v11 (c4c9888): attack-specific startup/recoil/settle and launch-to-get-up animation; exact grounded body origins; original Rainlit Gallery and Dawn Observatory, eight motion frames each, host-selected stage metadata; stronger punch pull-back/rear-leg weight. V8 (f54794a): all 60 card labels complete and Greta limb details. V1-v7 (28c4491): freeze-safe input, fair guard/AI reaction, original pixel roster/stage/effects/HUD and fifteen distinct silhouettes. Previews/reports remain in mailbox.
- V12-v13 (f524ad3): three-phase directional hit/guard/break effects; original snap/bass contact synthesis, block clinks, guard-break crack and quieter landings. Shared audio compression/master, cached noise, bounded voices, cleanup, mute-tail fade and gesture resume. Rules unchanged.
- V14-v15 (5653028): five velocity-selected airborne phases, takeoff/landing/body-impact dust with coalescing and lifecycle caps; short velocity-aligned projectile wakes with birth/flight/expiry phases. No simulation state or rules changed.

- V16-v17 (fff8cc7): open arch, curled crest and floor-reaching air reactions; four hound bounds, bite/release/wait, Nue wing/dive/bank and Toad extension/recoil. Existing state alone drives these cached frames.
- V18-v19 (a560f33): navy summon contours, three-tone volumes and separate tucked paws; twenty art poses with slash load/sweep, cannon brace/recoil, clap separation, sign opening, bow release and throw follow-through. Same rules and clocks.

- V20 (c79814c), V21 (378f061): open palm/spoken casts, Domain/Maximum anticipation and actual held releases. V22-V23 (0f1f85c): compressed guard/stun recovery and fifteen layered Domain spaces. V24-V25 (7ca6ad5): round jade shields distinguish Absolute Counter; advance/retreat footwork. V26-V27 (9f6d34f): victory and jump phases. V28 (9084ed6): suspended air normals. V29 (7c14592): direction checks and second-punch far-arm load.

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-domain.js: fifteen cached Domain spaces and active-clock motes. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: title/mode presentation, the second first-minute priority. Keep the attract fight visible, make mode choice clear and preserve every existing mode. Third-punch sole work is deferred. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v34; browser layout and owner play remain unverified. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
