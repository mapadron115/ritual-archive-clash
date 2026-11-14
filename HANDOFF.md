# Handoff: Ritual Archive: Clash

## Current - version 8, script cache v=12 (2026-11-14)

Completed coordinator 01:55's two fixes, then stopped as ordered. Card labels preserve every letter: key badges moved to the footer, art cards use 59-pixel text areas and the wider Domain cards use 75. All 60 names fit within two lines, including Worldbreaker and Chimera Shadow Garden. Greta now has short sleeves and hems, wrist wraps, proportionate fists with knuckle/thumb lines, and trouser knee panels/seams in main and mirror costumes. Her heavy build remains.

Preview PNGs in C:/Users/mapad/dev/ritual-archive-board/codex/: v8-card-labels-1.png through v8-card-labels-3.png (all fifteen fighters), v8-greta-details.png (main/mirror idle, guard, punch and kick), v8-runtime-frame.png. All visually inspected; exact generated renderer output, not live browser screenshots.

Git: coordinator committed v1-v7 as 28c4491. Version 8 is uncommitted, per 01:34 order: no more commit attempts because .git is read-only; coordinator commits this run. Never push. All ten script URLs now use v=12. Changed this version: index.html, src/pixel.js, src/pixel-hud.js, tests/hud.cjs, tests/pixel.cjs, tests/runtime.cjs, HANDOFF.md.

## Verification and limits
- This run: node tests/hud.cjs passed 75 roster/mode/status combinations and checks all 60 names for retained letters, <=2 lines and bounded widths. node tests/pixel.cjs passed 720 original/mirror pose images with hard alpha, bounds and <=24 colors. node tests/silhouettes.cjs passed 15 unique masks, height 86-107 and area 2,145-3,991 pixels. node tests/runtime.cjs passed real HTML script order, title/select/start/input-to-frame/pause/rematch/composite presentation using a memory canvas/DOM shell. git diff --check passed.
- Prior v7 checks: feel/input handlers; 90 art and 30 ultimate activations; all 225 ordered full matches including mirrors (1,169,896 ticks); stage layers/cloth; 308 world/effect frames. Not rerun this small rendering pass. Combat and input code unchanged.
- Not played by a person. No live browser capture, motion/sound/FPS, keyboard rollover or two-computer online check. Previous browser host unavailable and Opera UI control denied. Both online clients must reload scripts because v1 changed input encoding.

## Code and next run
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), central hit(), hooks, freeze/round rules. Low ten input bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick jump/attack buffers survive freezes; held attacks do not repeat. Guard prepared for both slots before attacks; AI threat defense waits 10-16 active ticks.
- src/fighters.js and fighters2.js: 15 fighters, ART[id] and optional _can/_re, DOMAIN[kind]. src/ai.js: tactics and active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, palettes, poses/builds and sprite cache. pixel-stage.js: original archive courtyard/layers/cloth. pixel-world.js: world/effect raster and presentation. pixel-hud.js: portraits/meters/cards/tags. src/render.js: event/FX lifecycle plus drawWorld/drawHUD. src/main.js: DOM menus/input/audio/PeerJS/loop.
- Native 640x360 integer raster, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual idle stances/builds, mirror palettes, no external art/font dependencies. ART_DIRECTION.md records the art rules.
- Open index.html directly or serve this folder with a local HTTP server. No installation needed. Node is on PATH for script checks.
- Next: coordinator reviews/commits v8; owner checks feel, motion, sound, browser performance and online. No remaining implementation order. Read AGENTS.md and mailbox before any new version.

## Standing decisions
Original fighters/assets/poses only; owner chose pixel art. Technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing names Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
