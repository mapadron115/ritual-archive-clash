# Handoff: Ritual Archive: Clash

## Current — version 7, script cache v=11 (2026-11-14)

Completed every mailbox order through coordinator 01:17: approved feel changes, one-fighter pixel style checkpoint, all fifteen fighters, original courtyard, effects, HUD/menu treatment, then fifteen distinct idle silhouettes/builds. Preview PNGs and version-by-version reports are in C:/Users/mapad/dev/ritual-archive-board/codex/. Latest: v7-black-silhouettes.png, v7-roster-stances.png, v7-runtime-frame.png. ART_DIRECTION.md documents the original art rules.

Feel: short keyboard/online presses survive between ticks and impact/Domain/time freezes. Jump/attack buffers last nine active ticks; held attacks do not auto-repeat. Guard input is prepared for both slots before attacks; computer threat defense waits 10–16 active ticks. Existing damage, strike ranges and hitboxes preserved.

Art: native 640x360 integer raster, enlarged without smoothing. Original 144x128 fighter cells with grounded root (64,120), authored key poses, individual idle stances, 86–107-pixel silhouette heights, distinct shoulders/limb weights and mirror palettes. Original archive courtyard, discrete cloth, all projectile/summon/Domain/impact/status effects and bitmap HUD. Stable scale replaces fractional camera zoom. No external art/font/image dependencies. Removed inactive cartoon renderer. Rematches clear lingering effects; title preview uses all 15.

**Git blocker:** executable works at C:/Program Files/Git/cmd/git.exe, but git add/commit fail creating .git/index.lock: Permission denied. This run exposes .git read-only. HEAD remains 14d1b9a; v1–v7 are uncommitted. Coordinator 01:34 says no more commit attempts; coordinator commits this run. Never push. All ten script tags use v=11.

## Verification and limits
- node tests/feel.cjs: 11 simulation groups plus real main.js input-handler shell checks.
- node tests/smoke.cjs: 90 art activations, 30 ultimates, all 225 ordered full matches incl. mirrors; 1,169,896 ticks, finite state, all completed.
- node tests/pixel.cjs: 720 original/mirror pose images, hard alpha, bounds and <=24 colors.
- node tests/silhouettes.cjs: 15 unique black masks and visible height/weight spread.
- node tests/stage.cjs: layer alpha, floor coverage, cloth frames.
- node tests/world.cjs: 308 frames across every art/ultimate/projectile, summons and Black Flash.
- node tests/hud.cjs: 75 roster/mode/status combinations; label wrapping.
- node tests/runtime.cjs: actual HTML script order, title/select/start/input-to-frame/pause/rematch and composite pixel presentation using memory canvas/DOM shell.
- node tests/performance.cjs: ordinary Node/V8 CPU raster only, 120-frame sample ~1.43 ms median / 1.92 ms p95; excludes browser upload/display/audio/input latency.
- git diff --check passes. Generated previews visually inspected. **Not played by a person.** Browser host unavailable and Opera UI control denied; no browser screenshots, live motion/sound/FPS, keyboard rollover or two-computer online test. Both online clients must reload the updated scripts (new press encoding).

## Code and next run
- src/sim.js: plain serializable state, 60-Hz step(S,[mask0,mask1]), central hit(), hooks, freeze/round rules. Low ten input bits held; upper bits explicit presses (INPUT_SHIFT).
- src/fighters.js and fighters2.js: 15 fighters, ART[id] and optional _can/_re, DOMAIN[kind]. src/ai.js: tactics and active-tick reaction clock.
- src/pixel.js: integer raster, bitmap font, material palettes, poses/builds and sprite cache. pixel-stage.js: courtyard/layers/cloth. pixel-world.js: complete world/effect raster and canvas presentation. pixel-hud.js: portraits/meters/cards/tags. src/render.js: original event/FX lifecycle plus drawWorld/drawHUD entry points. src/main.js: DOM menus/input/audio/PeerJS/loop.
- Open index.html directly, or serve this folder with any local HTTP server. No installation needed. Node is on PATH for tests.
- Next: coordinator reviews/commits this candidate; owner checks feel, motion, sound, browser performance and online. No currently outstanding implementation order. Read AGENTS.md and the mailbox before any new version.

## Standing decisions
Original fighters/assets/poses only; technique/art names from owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing questionable names Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added in this run. Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps with foe/imbued stone only. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, 8-second Zone. AI balance remains uneven; simulation wins are not human balance.

Live: https://mapadron115.github.io/ritual-archive-clash/ . Coordinator obtains owner's publication approval and pushes; never push from Codex. Restrict work to this folder and the named codex mailbox, never other teams.
