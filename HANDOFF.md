# Handoff: Ritual Archive: Clash

## Current - v153 WEB/cache v=156; mobile v152/cache v=155 (2026-11-16 14:07:51 UTC)

Mailbox through 2026-11-16 08:53 acted on; v152 accepted/live as 0cf7507. Owner directly repeated autonomous check-in and mailbox reporting; no new design direction. One version this run. Coordinator commits; never push.

Reproduced Guided Shell sharing the generic cannon body and beam-style recoil despite its slow homing shell and no kickback. New desktop-only src/desktop-guided.js cradles at move ticks 8-11, lifts at 12-15, lofts on the unchanged tick-16 release, holds a guiding hand at 19-25 and recovers at 26-30. Serialized move age holds through freezes and event-free guest snapshots. All 27 desktop scripts use v=156. Mobile, combat, homing path/speed/lifetime, costs/damage, physics, effects, HUD and inputs remain unchanged.

Commit: none; HEAD/base 0cf75071b96f895f40ac0693d97aa2731643b000. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-guided.js (new), tests/guided-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Guided-body PASS: five groups / 12,480 parallel ticks / 2,064 rasters / 5,616 frozen holds / 10,082 unchanged defaults / 120 changed scenes. Actual inputs in both slots/facings, full/low HP and hit/guard/rear/jump/far/wall fixtures. Complete homing flight matches an independent pre-adapter simulation; 85 damage (17 guard), tick-16 release, 30 CE/300-tick cooldown and recovery retained. Rear and far targets can be reached later by the existing homing behavior. Snapshot bodies agree; all-stage changes fit body unions; other moves, Domains, portraits, HUD and prior sprites stay exact. Hard-alpha sprites are bounded, <=24 colors and floor aligned.
- --baseline --preview-only omits only Guided and reproduces two animation failures; simulation/default/scene groups pass. Preview-only deliberately permits those expected failures. Final baseline checks also cover 12,480 ticks. Initial 120-tick fixture was extended to 260 to include the distant shell hit; no simulation change.
- Full runtime PASS: actual 27-script HTML/main-loop boot, menus/input/results/rematch/online callbacks and every prior animation path. Guided Shell passes actual AI/local/host keyboard handlers and 26 first event-free guest snapshots. Focused AI-mode casts disable AI and use keys; no balance claim. All 30 PASS lines, process exited zero; no tests remain running. Log: v153-runtime.log.
- Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Historical source fixtures exclude Guided only where that old commit lacks its file; current HTML/runtime load it. Feel (eleven groups plus keyboard/remote handlers) and mobile-install PASS. Five changed/new JS files parse; 27 versioned paths exist and share v=156. All 38 other tracked src/mobile files equal exact HEAD blobs; untouched mobile/index.html retains its pre-existing normalized-equal CRLF/LF difference. git diff --check passes. Unchanged dedicated mobile/full-roster/world suites not repeated. No performance claim.
- 60 PNGs in codex mailbox: thirteen-frame native scene/body strips plus each scene in both costumes/facings, before and after. Inspected before/after body strips and release, mirror bodies/release, native cradle/lift and guiding hand. Export: node tests/guided-body.cjs --out=PATH. Generated renderer stills, not browser screenshots or observed motion. Logs use v153- here.
- No browser/phone, physical keys/touch, live motion/FPS/latency, audible audio, native CSS/focus/events, installation/backgrounding, real two-device WebRTC or owner play of v153. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Next proposed v154 MOBILE: bring this reviewed Guided Shell body across, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
