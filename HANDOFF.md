# Handoff: Ritual Archive: Clash

## 2026-11-19 16:26:20 UTC - v166 DESKTOP: Gamma Quake preparation ready

Coordinator 31 accepted v165 as c62d641 and ordered the next desktop ordinary-art/feel audit item. Owner directly requested this autonomous check-in/report. Earlier entries are recorded as handled. One version only; commits remain with coordinator, never push.

Added src/desktop-quake-ready.js: planted low fist gather at ticks 0-4, then fist rise at 5-9. Feet match the reviewed quakeopen/impact/pull/rise. Ticks 10 onward, combat sources and mobile remain unchanged. Desktop: 34 scripts, cache v=169. Mobile stays v164/cache v=167.

Focused tests/quake-ready.cjs passes five groups: 1,600 paired simulation ticks, 960 raster checks, 1,728 frozen holds, 11,098 unchanged pose/sprite checks, 48 changed native scenes. Baseline preview reproduces two expected missing-pose/footing failures; other three groups pass. Both slots/facings, cost/cooldown/release/damage, hit/rear/guard/jump, event-free snapshots, interruptions, Domains, resets, all-stage body-only changes and unchanged HUD covered. FULL tests/runtime.cjs PASS, exit 0, through final Bungee Gum and canvas-alpha checks. Focused tests/quake-ready-runtime.cjs PASS: actual HTML/main-loop AI/local/host keyboard routes and 24 event-free guest snapshots. No implementation edits after the full suite started.

56 generated PNGs and focused logs in mailbox codex/v166 and v166-*.log. Viewed before/after P1 strips, mirrored P2 strip and native tick-5 scene: fist rises clearly and feet stay planted, no observed clipping. Renderer stills, not browser screenshots or human play. Syntax, all 34 script path/cache checks and git diff --check pass. Mobile and combat-source diff empty.

Commit: none; base/HEAD c62d64158965c1c667d1676c66ea8134e224bf38. No add/commit/push attempted: coordinator retains commits. Seven review files: HANDOFF.md, README.md, index.html, tests/runtime.cjs, src/desktop-quake-ready.js (new), tests/quake-ready.cjs (new), tests/quake-ready-runtime.cjs (new). Ready for coordinator review/commit/publication decision; stopping after this version.

No browser/phone session, physical touch, live FPS/latency, audio listening, two-device WebRTC or owner play. The v136 iPhone 12 mini/iOS 26.5 MUTE/MOVES toolbar retest remains pending and jumps the queue. Next after acceptance: port reviewed Thunder Clap and Gamma Quake preparation to mobile; then continue desktop audit. Rapid Slash, arenas, cluster opacity and library-name audit remain deferred.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, fighter poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
