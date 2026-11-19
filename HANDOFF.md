# Handoff: Ritual Archive: Clash

## 2026-11-19 17:48:09 UTC - v168 DESKTOP: Reversal Red planted preparation and recovery ready

Read AGENTS.md, HANDOFF.md and mailbox through Coordinator 31's 12:32 order, rechecked before version/report. Owner directly requested this autonomous check-in/report. Accepted v167 commit 4193fb3 acknowledged; earlier entries are recorded as handled. Completed one desktop ordinary-art/feel audit version; commits remain with coordinator.

Added src/desktop-red-ready.js: Reversal Red keeps the reviewed wide soles through preparation (ticks 0-5) and final recovery (25-31), returning the open palm to guard. Previously these windows used generic cast poses with narrower feet. Ticks 6-24, projectile release, damage, costs, combat sources and mobile are unchanged. Desktop: 36 scripts, cache v=171. Mobile remains v164/cache v=167.

Commit: none; base/HEAD 4193fb373e10d6583cc9d83ff18e131661e16292. No add/commit/push attempted. Seven review files: HANDOFF.md, README.md, index.html, tests/runtime.cjs, src/desktop-red-ready.js (new), tests/red-ready.cjs (new), tests/red-ready-runtime.cjs (new).

Verification:
- FULL tests/runtime.cjs PASS, exit 0, through final Bungee Gum and canvas-alpha checks.
- red-ready: six groups PASS; 5,280 paired simulation ticks, 2,068 raster checks, 5,184 frozen holds, 11,212 unchanged pose/sprite checks, 48 changed native scenes. Both slots/facings, full/low HP, hit/rear/guard/jump/far/wall, projectile attachment, event-free snapshots, freezes, interruptions, resets, unrelated moves and Domains covered. All-stage differences confined to body pixels; HUD, floor and hard-alpha bounds unchanged.
- red-ready-runtime PASS: actual HTML/main-loop AI/local/host keyboard routes and 24 event-free guest snapshots. Baseline preview reproduces two expected missing-pose/footing failures; other four groups pass. Diagnostic failures allowed only in preview mode.
- 56 PNGs in codex/v168: before/after twelve-frame body/native scene strips, both costumes/facings. Viewed before/after P1 strips, mirrored P2 strip and native tick-25 recovery scene. Stable feet and a readable return to guard; no observed clipping. Generated renderer stills, not browser screenshots or human play.
- Syntax, 36 script paths/cache tags and git diff --check pass. Mobile and combat-source diff empty. Logs: codex/v168-runtime.log, v168-red.log, v168-red-runtime.log, v168-baseline.log. Initial helper attempt found Python unavailable; used existing Node instead, no installation. Corrected two log-only snapshot count labels after runtime started; no implementation/assertion changes after suite start.

Limits/next: no browser/phone session, physical touch, live FPS/latency, audio listening, two-device WebRTC or owner play. The v136 iPhone 12 mini/iOS 26.5 MUTE/MOVES toolbar retest remains pending and jumps the queue. Ready for coordinator review/commit/publication decision; stopping after this version. Recommend Lapse Blue preparation/recovery next in the desktop audit; reviewed mobile ports, Rapid Slash, arenas, cluster opacity and library-name audit remain deferred. No decision needed.

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
