# Handoff: Ritual Archive: Clash

## 2026-11-19 15:19:32 UTC - v163 DESKTOP: Imbued Stone underarm toss ready for review

Read AGENTS.md, HANDOFF.md and coordinator mailbox through the newest 10:13 order. The owner directly requested this autonomous check-in/report. Accepted v162 commit acknowledged; prior effects orders are already recorded as completed. One desktop ordinary-art audit version delivered; no sky/effects work and no next version started.

Bram Otieno's Imbued Stone now gathers its hand at the hip (ticks 0-3), swings back low (4-7), releases on the unchanged tick 8 (8-10), lifts through (11-13), withdraws (14-16) and returns to guard (17-19). Six original poses in src/desktop-stone.js use serialized move age. The old generic overhead throw shifted its feet during recovery. Self-review caught the first draft's raised opening hand; replaced it with the hip gather before final checks. All 32 desktop script URLs use cache v=166. Mobile remains v162/cache v=165. Combat sources, projectile/bounce/damage/cost/cooldown and second-press stone swap are unchanged.

Commit: none; base/HEAD e4df5abae7b1d4aa1d0f75d2667e9e95d19f2b81. No add/commit/push attempted: coordinator keeps commits per latest order. Seven files for review/commit: HANDOFF.md, README.md, index.html, tests/runtime.cjs (script count), src/desktop-stone.js (new), tests/stone-body.cjs (new), tests/stone-runtime.cjs (new).

Verification:
- Final stone-body: six groups PASS, 8,640 paired simulation ticks, 1,920 raster checks, 6,048 frozen holds, 10,838 unchanged pose/sprite checks and 144 changed native scenes. Both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity; live second-press stone swaps; event-free snapshots; interruption/round reset; body-only scene changes on all three stages; unchanged HUD; bounded hard-alpha sprites and planted soles.
- Final stone-runtime: PASS actual HTML/script order and main loop, AI/local/host keyboard input, all six bodies, 24 event-free guest snapshots. Reuses runtime.cjs initialization, with focused assertions rather than rerunning unrelated cases.
- Broad runtime.cjs: PARTIAL, intentionally stopped after passing title/menu/selection/input/pause/rematch/host/guest, stale network events, Domain/guard/injury, summons and Nuclear Shell checks. Later Maximum/ordinary-art groups were not completed. It started before the final hip-gather refinement; final stone-body and focused runtime cover that revision. No full-suite pass claimed.
- Baseline --baseline --preview-only reproduces the missing stone body (expected pose/backswing failures, permitted only in preview mode). Syntax checks pass; 32 cache URLs resolve locally; git diff --check passes; mobile and combat sources unchanged. Initial export failed for a missing output directory and initial runtime failed its old 31-script count; both corrected and successful focused reruns recorded.
- 112 PNGs in codex/v163: before/after twelve-frame body/native scene strips, both costumes/facings, hit and distant unobscured throws. Viewed old/new P1 strips, final mirrored P2 strip, distant release and mirrored follow-through scene. Clear low backswing and rising release with fixed feet, no observed clipping. Renderer stills, not browser screenshots or live motion. Logs: v163-stone.log, v163-baseline.log, v163-stone-runtime.log, v163-runtime.log.

Limits/next: no browser session, phone/physical touch, live FPS/latency, audio listening, two-device WebRTC or owner play. Existing v136 iPhone 12 mini/iOS 26.5 MUTE/MOVES toolbar retest remains pending and jumps the queue. Ready for coordinator review/commit and publication decision; never pushed. Recommended next after approval: bring the unchanged stone adapter to mobile, then continue ordinary-art/feel audit. Rapid Slash, arenas, cluster opacity and library-name audit remain deferred. Stopping for review; no question needed.

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
