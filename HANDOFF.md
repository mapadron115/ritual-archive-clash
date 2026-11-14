# Handoff: Ritual Archive: Clash

## Current - version 11, script cache v=15 (2026-11-14)

Acted on coordinator 03:00 (continue independently) and 03:13 review. Completed three versions this run, each reported in the codex mailbox:
- V9: 25 new authored poses, 49 per costume. Paired startup, attack-specific recoil/settle, launch/fall, impact/rest and two get-up poses. Existing move/down clocks hold frames through freezes. Grounded bodies center over the sim root with their lowest opaque pixel on the floor; KO bodies stay down.
- V10: original Rainlit Gallery and Dawn Observatory, each with eight motion frames, plus three stage choices/thumbnails. Online host selects; start messages and snapshots carry presentation-only S.stage. Rounds/rematches preserve it; missing/unknown IDs default to courtyard. No hazards or bounds changes.
- V11: clearer shoulder/fist pull-back, lower hips and rear-leg weight transfer for punches/heavy punches, addressing 03:13 feedback after finishing stages. Existing startup, damage, rules, hitboxes and simulation roots unchanged. V8's complete labels and Greta details retained.

Git: HEAD/base f54794a (coordinator's v8). V9-v11 are uncommitted per 01:34/03:00/03:13; no commit attempts and never push. Coordinator commits combined tree. All ten script URLs use v=15. Combined files: HANDOFF.md, README.md, ART_DIRECTION.md, index.html; src/pixel.js, src/pixel-stage.js, src/pixel-world.js, src/main.js; tests/animation.cjs (new), tests/runtime.cjs, tests/stage.cjs, tests/performance.cjs.

Previews in C:/Users/mapad/dev/ritual-archive-board/codex/: v9-attack-frames.png, v9-knockdown-frames.png, v9-roster-ground-contact.png, v9-runtime-frame.png; v10-courtyard.png, v10-gallery.png, v10-observatory.png, v10-runtime-frame.png; v11-windups.png, v11-attack-frames.png, v11-runtime-frame.png. All listed images visually inspected; generated renderer/memory-canvas output, not browser screenshots. Additional v11 knockdown/ground sheets duplicate unchanged poses.

## Verification and limits
- V11: pixel suite passed 1,470 bounded hard-alpha <=24-color frames; animation passed 135 actual move timelines, 60 original/mirror ground contacts, launch-to-get-up, freeze-safe frames and simulation non-mutation; feel/input (11 groups plus handlers) and runtime integration passed. git diff --check passed.
- V10: stage suite passed 24 opaque animated frames, 45 stage/Domain composites, distinct stages, round persistence and unchanged deterministic combat. Runtime covered stage buttons/thumbnails, rematch, serialized host/guest stage selection/start, guest-disabled controls and safe fallback. Feel/input and 75 HUD states/all 60 labels passed.
- V9: world suite passed 308 arts/ultimate/projectile/summon/effect frames; silhouettes passed 15 unique masks (height 86-107, area 2,145-3,991). Latest concurrent Node CPU raster sample: 120 frames per stage, medians 3.50-4.65 ms, p95 4.48-8.32 ms. Excludes browser upload/display/audio/input; not browser FPS.
- Prior v7 smoke: 90 arts, 30 ultimates, all 225 ordered full matches including mirrors (1,169,896 ticks). Not rerun this rendering/menu pass; combat code unchanged.
- Not played by a person. No live browser menu-layout/capture/motion/sound/FPS, keyboard rollover or real two-computer online check. Previous browser host unavailable/Opera UI denied. Both online clients should reload all scripts (v1 changed input encoding).

## Code and next run
- src/sim.js: plain serializable state; 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held, upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id], optional _can/_re, DOMAIN[kind]. src/ai.js: tactics/active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, 49 poses/builds, pxPose/pxFighterFrame and caches. pixel-stage.js: courtyard/gallery/observatory metadata, art and motion. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop/stage selection.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle builds/stances, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records rules.
- Open index.html directly or serve this folder locally. No installation needed; Node on PATH for script checks.
- Next autonomous pass: directional hit/block sparks with distinct contact/expansion/fragment phases, then sound refinement. Read AGENTS.md/mailbox before each version. Coordinator reviews/commits v9-v11; candidate ready for owner's play check. No question pending.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Combat-rule/damage/roster changes, feature removal or a new art style go to coordinator first. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley need a library audit; no technique/art names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
