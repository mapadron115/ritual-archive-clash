# Handoff: Ritual Archive: Clash

## 2026-11-19 16:06:19 UTC - v165 DESKTOP: Thunder Clap planted preparation and recovery ready

Read AGENTS.md, HANDOFF.md and mailbox through Coordinator 31's 10:52 order. Owner directly requested this autonomous check-in/report. Acknowledged accepted v164 commit 975f812; earlier orders were already recorded as acted on. Completed one desktop ordinary-art/feel audit version; stopping for review.

Thunder Clap's reviewed wide open/close/pull previously snapped into narrower generic feet during preparation and late recovery. Added two original poses in src/desktop-thunder.js: thunderready at ticks 0-5 and thundersettle at 23-27, keeping the same planted soles as ticks 6-22. The palms draw back into guard during recovery. Existing release, hit timing, shockwave, damage, costs and all combat sources unchanged. All 33 desktop scripts use cache v=168. Mobile remains v164/cache v=167, entirely unchanged.

Commit: none; base/HEAD 975f812442d8d6d5c38f3243bc49d4655363477b. No add/commit/push attempted: latest coordinator order retains commits. Seven files for review: HANDOFF.md, README.md, index.html, tests/runtime.cjs, src/desktop-thunder.js (new), tests/thunder-body.cjs (new), tests/thunder-runtime.cjs (new).

Verification:
- FULL tests/runtime.cjs PASS, exit 0, through final Bungee Gum group and final canvas-alpha assertions. Updated script count and Thunder Clap expectations. Log: codex/v165-runtime.log.
- thunder-body: five groups PASS; 1,600 paired simulation ticks, 720 raster checks, 1,296 frozen holds, 11,036 unchanged pose/sprite checks and 36 changed native scenes. Actual inputs, both slots/facings, hit/rear/guard/jump outcomes, cost/cooldown/release parity, event-free snapshots, freezes, interruptions, round resets, unrelated arts and Domains. All-stage changes confined to body pixels; HUD, floor, bounded hard-alpha sprites unchanged. Final log: codex/v165-thunder.log.
- thunder-runtime PASS: actual HTML/script order and main loop; AI/local/host keyboard routes and 20 event-free guest snapshots. Baseline --baseline --preview-only reproduced two expected missing-body/footing failures; remaining three groups passed. Diagnostic failures permitted only in preview mode.
- 44 PNGs in codex/v165: before/after nine-frame native scenes and body strips, both costumes/facings. Viewed old/new P1 strips, new mirrored P2 strip and native tick-23 recovery. Feet stay wide through the move, hands return to guard, no observed clipping. These are generated renderer stills, not browser screenshots or live motion.
- New JavaScript syntax checks, all 33 local script URLs/cache tags and git diff --check pass. Mobile and combat-source diff empty. No implementation edits after the full runtime started.

Limits/next: no browser/phone session, physical touch, live FPS/latency, audio listening, two-device WebRTC or owner play. The v136 iPhone 12 mini/iOS 26.5 MUTE/MOVES toolbar retest remains pending and jumps the queue. Ready for coordinator review/commit/publication decision; never pushed. Recommended next after acceptance: bring the unchanged Thunder Clap adapter to mobile, then resume the desktop ordinary-art/feel audit. Rapid Slash, arenas, cluster opacity and library-name audit remain deferred. No decision needed; no next version started.

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
