# Handoff: Ritual Archive: Clash

## Current - version 115 WEB/cache v=118; mobile v114/cache v=117 (2026-11-15)

Mailbox through 18:22 read/acted on; reread at completion, unchanged. V114 committed/live as af40a94. V115 completes the ordered desktop guard-break/recovery HUD audit. Alternate web/mobile; owner phone feedback jumps the queue. From v117 WEB, favour fighter reactions, poses, anticipation/follow-through and Domain cast moments, per 18:22. One reproduced visible gap per version. Coordinator commits/pushes reviewed versions; Codex never attempts either (01:34/03:00). Owner directly repeated autonomous check-in/report instructions; no new design direction. Arenas closed; optional Rapid Slash and mobile cluster placement/opacity remain deferred.

Reproduced on v114 desktop before fixing: GUARD 100% remains bright during attack/cast recovery and while jumping, although held guard cannot protect in those states. Six of seven audit groups fail; existing hit/stun/down locks, ordinary blocking, three-kick breaks and restoration already pass. These are script/renderer findings, not observed browser behavior.

Desktop-only adapter now extends the existing GUARD LOCKED/dim-strength treatment to committed attacks and Domain/Maximum casts; free airborne states say LAND TO GUARD. Strength remains actual guardHp, never a recovery-progress bar. Ordinary blocking, grounded free states and existing injury locks stay byte-identical. Labels describe restrictions of the current action, not guaranteed defense against every hit, incoming direction or buffered command. Shared pixel-hud.js only extracts its old state/text into a helper with an identical default; mobile presentation stays unchanged. No combat, timing, input, sound, roster or transport change. All twelve desktop scripts use v=118; mobile stays v=117.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, src/desktop-feedback.js, tests/desktop-guard.cjs (new), tests/desktop-domain.cjs, tests/runtime.cjs. HEAD/base af40a9414898b4b0020ffc4f75ad647a170b4679; no commit attempt; never pushed.

## Verification and limits

- node tests/desktop-guard.cjs: seven groups pass, 2,713 read-only native HUD/snapshot checks, 26,114 parallel simulation ticks; 1,277 changed and 1,436 identical HUDs. Actual keyboard commands through simulation for chained basics, all 45 arts, held Rock, all fifteen Domain/Maximum casts, jumps/air attacks, both slots, guard restoration, hit/block/break/shock/down, strength boundaries, stacked statuses, freezes/time stop and newRound. Actual front hits distinguish full damage during kick/cast/jump from guarded chip. Fixed v114 baseline fails six groups and passes existing recovery behavior.
- node tests/runtime.cjs passes actual twelve-script boot/menu/input/results/rematch/online checks plus real AI/local/host attack/cast/jump frames and five event-free guest snapshots. node tests/desktop-domain.cjs passes ten groups/525 HUD checks and confirms shared/mobile default byte-identical; its region guard now allows intended v115 guard lanes. node tests/guard-recovery.cjs and guard-hud.cjs pass real three-kick and all-build injury recovery/held-guard checks. node tests/feel.cjs, mobile-feedback.cjs and mobile-install.cjs pass. Mobile suite includes a full CPU match/results/rematch/title in 2,754 frames (long match skips raster uploads). Syntax/diff checks pass. git diff --exit-code HEAD -- mobile src/sim.js src/fighters.js src/fighters2.js src/ai.js src/main.js src/render.js passes. Unchanged animation/stage/world/full-roster/performance/audio suites not repeated.
- Twenty native 640x360 before/after scenes in codex mailbox: kick recovery, cast hold, air guard, break recovery and restored guard on Courtyard/Gallery. Inspected kick/cast/air pairs at 1x. PNG pixel comparisons: six changed scenes differ by 1,297-1,320 pixels, all inside P1 guard lane; four break/restored comparisons are identical. Export: node tests/desktop-guard.cjs --baseline --preview-only --out=PATH, then current --out=PATH. Exact game-renderer previews, not browser screenshots.
- No browser/phone, motion/FPS/latency, physical keyboard/touch, audible sound, native focus/event behavior, OS lifecycle/install, two-device WebRTC or owner play checked. Script-tested is not played. Owner check: hold guard during a kick, long art, Maximum and jump; cue should return to strength on landing/recovery, and ordinary block stun should stay protective. Check guest and both local slots.

## Next priorities

V115 ready for coordinator review/commit/publication under 18:22. Next v116 MOBILE per alternation: candidate guard-button availability/readability audit against real jump, cast and recovery states; reproduce before selecting one visible fix. Owner phone feedback first. V117 WEB shifts to a reproduced fighter-animation gap per the new direction. No decision needed; leave this one-version run ready for coordinator commit.

Owner dive feel notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.

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
