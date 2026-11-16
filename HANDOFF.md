# Handoff: Ritual Archive: Clash

## Current - v157 WEB/cache v=160; mobile v156/cache v=159 (2026-11-16 15:53:47 UTC)

Mailbox through 2026-11-16 10:36 acted on; v156 accepted/live as 5c1d11e. Owner directly repeated autonomous check-in and mailbox reporting, with no new design direction. One version this run. Coordinator commits; never push.

Nell's Nail Projectile used generic throwing poses despite its hammer-driven two-nail release. New desktop-only src/desktop-nail.js raises the hammer clear of the face at move ticks 5-8, drives forward/down on the existing tick-9 release through 11, follows through at 12-14, withdraws at 15-17 and returns at 18-20. Serialized move age holds through freezes and event-free guest snapshots. All 29 desktop script URLs use v=160. Mobile stays v156/v=159. No combat, timing, costs/damage, nail paths/embedding, physics, effects, input, HUD, audio, roster/name, style or dependency change. Every existing src/mobile file stays unchanged.

Commit: none; HEAD/base 5c1d11e872a0c4dbc2f54dce74f7b57d692e10b9. No add/commit attempt per coordinator 01:34/03:00; never pushed. Seven files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-nail.js (new), tests/nail-body.cjs (new), tests/runtime.cjs and tests/desktop-guard.cjs. Guard's historical-source fixture excludes the new adapter, consistent with the other later adapters.

## Verification and limits

- Nail-body PASS: five groups / 5,600 parallel ticks / 2,160 raster checks / 6,048 frozen holds / 10,396 unchanged defaults / 120 changed native scenes. Actual inputs in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity, event-free snapshots and interruptions. Independent simulation stays exact: tick-9 two-nail release, 21-unit horizontal speeds, +/-0.6 vertical speeds, 12 CE/50-tick cooldown and recovery retained; close two-hit damage remains 45.12 after existing combo scaling, with two embedded nails. All-stage changes fit body unions; hard alpha, palette/cell/floor bounds, portraits, Domains, HUD, other moves and early/airborne bodies stay exact.
- --baseline --preview-only reproduces the two missing-hammer animation groups; the three compatibility groups pass. Preview-only deliberately permits those expected failures. The first test draft assumed both projectiles remained in flight on release; corrected it to count a nail that already contacted at the wall. No production combat change.
- Actual 29-script HTML runtime PASS: 32 PASS lines, exit zero. Added real AI/local/host keyboard casts through all five hammer phases and 22 event-free guest snapshots. All prior menu/input/online-lifecycle and fighter-animation checks pass. This is a memory DOM/canvas, not a browser. No tests remain running.
- Desktop-guard PASS: seven groups / 2,713 HUD/snapshot checks / 26,114 parallel ticks. Feel PASS: eleven simulation groups plus real keyboard/remote handlers. Four changed/new JS files parse. All 29 script paths exist at v=160. Protected diff and git diff --check pass; all 41 existing src/mobile files match HEAD allowing checkout EOL differences, SHA-256 inventory in v157-protected-files.json. Standalone full-roster/world/mobile suites not repeated; no performance claim.
- 112 move PNGs plus four runtime previews in codex mailbox: paired native scenes and twelve-frame scene/body strips in both costumes/facings, including distant shots. Inspected before/after body strips, mirror body, wind-up and release at native size, plus the mirrored follow-through scene. Export: node tests/nail-body.cjs --out=PATH. Generated renderer stills, not browser screenshots or observed motion. Logs: v157-nail.log, v157-baseline.log, v157-runtime.log, v157-guard.log and v157-feel.log.
- No browser/phone, physical touch/keys, live motion/FPS/latency, audible audio, real two-device WebRTC or owner play of v157. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Completion mailbox reread unchanged through 10:36. Next proposed v158 MOBILE: bring the reviewed Nail Projectile hammer body across, unless phone feedback jumps the queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
