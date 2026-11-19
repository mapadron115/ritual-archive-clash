# Handoff: Ritual Archive: Clash

## 2026-11-19 16:47:45 UTC - v167 DESKTOP: Granite Blast planted preparation and recovery ready

Read AGENTS.md, HANDOFF.md and mailbox through Coordinator 31's 11:32 order; rechecked before version and report. Owner directly requested this autonomous check-in/report. Accepted v166 commit c122903 acknowledged. Earlier entries are recorded as handled; completed the latest desktop audit order, one version only.

Added src/desktop-granite-ready.js: Granite Blast now keeps its wide firing soles during preparation (ticks 0-7) and final recovery (35-40), with hands returning to guard. Previously these windows used narrower generic cannon poses. Ticks 8-34, beam release/duration, costs, damage, combat sources and mobile stay unchanged. Desktop: 35 scripts, cache v=170. Mobile stays v164/cache v=167.

Commit: none; base/HEAD c122903201a32f7547a7eaca7ae170975d020a6b. No add/commit/push attempted; coordinator retains commits. Seven review files: HANDOFF.md, README.md, index.html, tests/runtime.cjs, src/desktop-granite-ready.js (new), tests/granite-ready.cjs (new), tests/granite-ready-runtime.cjs (new).

Verification:
- FULL tests/runtime.cjs PASS, exit 0, through final Bungee Gum and canvas-alpha checks. No implementation edits after suite start. Log: codex/v167-runtime.log.
- granite-ready: six groups PASS, 3,200 paired simulation ticks, 2,080 raster checks, 4,608 frozen holds, 11,150 unchanged pose/sprite checks, 48 changed native scenes. Both slots/facings, full/low HP, hit/rear/guard/jump, beam attachment, event-free snapshots, freezes, interruptions, resets, unrelated moves and Domains covered. All-stage differences confined to body pixels; HUD, floor, hard-alpha sprite bounds unchanged.
- granite-ready-runtime PASS: actual HTML/main-loop AI/local/host keyboard routes and 32 event-free guest snapshots. Baseline preview reproduces two expected missing-pose/footing failures; remaining four groups pass. Diagnostic failures allowed only in preview mode.
- 72 PNGs in codex/v167: before/after sixteen-frame body/native scene strips, both costumes/facings. Viewed old/new P1 strips, mirrored P2 strip and native tick-35 scene. Wide feet hold through move; hands rise to guard, no observed clipping. Generated renderer stills, not browser screenshots or human play.
- Syntax, 35 script path/cache checks, git diff --check pass. Mobile and combat-source diff empty. Focused logs: codex/v167-granite.log, v167-baseline.log, v167-granite-runtime.log. Initial preview export lacked its output directory and initial focused harness extraction had a syntax error; both corrected, reruns passed. No system installation. Existing report bytes preserved when prepending.

Limits/next: no browser/phone session, physical touch, live FPS/latency, audio listening, two-device WebRTC or owner play. The v136 iPhone 12 mini/iOS 26.5 MUTE/MOVES toolbar retest remains pending and jumps the queue. Ready for coordinator review/commit/publication decision; stopping after this version. Recommend bringing reviewed Thunder Clap, Gamma Quake and Granite Blast preparation/recovery to mobile after acceptance, then continue desktop audit. Rapid Slash, arenas, cluster opacity and library-name audit remain deferred. No decision needed.

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
