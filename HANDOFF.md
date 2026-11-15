# Handoff: Ritual Archive: Clash

## Current - version 114 MOBILE/cache v=117; desktop v113/cache v=116 (2026-11-15)

Mailbox through 18:11 read/acted on; reread at completion, unchanged. V113 committed/live as 3c95ebc. V114 completes the ordered mobile Domain/Maximum button audit. Alternate web/mobile; owner phone feedback jumps the queue. Coordinator commits and pushes reviewed versions; Codex never attempts either (01:34/03:00). Owner directly repeated autonomous check-in/report instructions; no new design direction. Arenas closed; optional Rapid Slash and mobile cluster placement/opacity remain deferred.

Reproduced on actual v113 mobile adapter before fixing: a full-gauge airborne tap lands and casts in two physics ticks before the next drawing, leaving the old LAND FIRST crimson warning on USED 1/1. Real clashes, consumed guest snapshots, freeze-buffered qualification, changed reasons and round contexts also retain stale denial. Six of eight initial audit groups failed; expanded baseline fails seven of nine. Names/types/gauge/HP/air/used labels and held input already pass. Script findings, not observed phone behavior.

Mobile-only touch.js fix ties Domain/Maximum denial to the touched reason, round, fighter and local slot. Changed reason, readiness or context invalidates it permanently, including when ready is skipped between drawings or snapshots. Intro/KO presses produce no Domain availability warning. Fresh used-move presses still respond; 120 ms touch acknowledgement and other art feedback remain. Input, buffering, simulation, sound, transport and desktop untouched. This remains local availability feedback, not cast/host confirmation. All twelve mobile scripts and linked resources use v=117; desktop remains v=116.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, mobile/touch.js, tests/mobile.cjs, tests/mobile-domain.cjs (new). HEAD/base 3c95ebce8c1057f9e62559c7f1e6118b5e92d663; no commit attempt; never pushed.

## Verification and limits

- node tests/mobile-domain.cjs: nine groups, 214 read-only state checks. All fifteen names/types and both slots, gauge/HP/air/used reasons, real two-tick main-loop landing/casts for every fighter, real clash, guest input packet and snapshot callback, freeze-buffered gauge/HP crossings, newRound/phase/actor/slot cleanup, fresh used press and held-input expiry. Parallel simulations remain identical. Included mobile suite completes CPU match to results/rematch/title (2,591 frames in final run; long match skips raster uploads).
- node tests/mobile-feedback.cjs passes eight feedback groups/CSS guard and existing multitouch/encoding/overlay checks. node tests/mobile-audio.cjs passes nineteen menu routes, online lifecycle/stale callback checks and eight mocked audio groups. node tests/runtime.cjs, node tests/feel.cjs and node tests/mobile-install.cjs pass. Syntax/diff checks pass. git diff --exit-code HEAD -- index.html src confirms desktop/shared code byte-identical. Unchanged stage/world/animation/full-roster/performance/audio-synthesis suites not repeated.
- Eighteen before/after phone-size layout models in codex mailbox: Domain, Maximum and clash at 667x375, 844x390 and portrait 390x844. Inspected landscape Domain/Maximum/clash pairs and portrait at 1x. Six landscape pixel comparisons: 4,839-4,865 changed pixels, confined to Domain/Maximum button; portrait identical. Test-only preview hooks fix the clock/input/frame origin. Export: node tests/mobile-domain.cjs --domain-baseline --preview-only --out=PATH, then current --out=PATH.
- Models use real renderer, pointer handlers and button state with bitmap approximations of CSS/font/layout; not browser screenshots. No browser/phone, motion/FPS/latency, physical touch/keyboard, native styling/capture, audible sound, OS lifecycle/install, two-device WebRTC or owner play checked. Script-tested is not played. Phone check: land into a buffered Domain/Maximum and clash; successful consumed move should not flash as unavailable, but touching USED should; verify guest, pause/return and a complete match.

## Next priorities

V114 ready for coordinator review/commit/publication under 18:11. Next v115 WEB per alternation: candidate first-minute guard-break/recovery HUD audit, comparing actual recovery against locked/ready cues; reproduce before selecting a visible fix. Owner phone feedback takes priority. No decision needed. Leave this one-version run ready for coordinator commit.

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
