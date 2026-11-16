# Handoff: Ritual Archive: Clash

## Current - v159 WEB/cache v=162; mobile v158/cache v=161 (2026-11-16 16:33:07 UTC)

Mailbox through 2026-11-16 11:14 acted on; v158 accepted/live as 8f2b920. Owner directly repeated autonomous check-in and mailbox reporting, with no new design direction. One version this run. Coordinator commits; never push.

Reproduced Paper's generic cast with actual inputs. New desktop-only src/desktop-paper.js gathers Finn's palm at his ribs at ticks 5-9, drives into the unchanged orb origin/lane on tick 10 through 12, follows through at 13-16, withdraws at 17-20 and returns at 21-23. Serialized age holds through freezes and event-free snapshots. All 30 desktop script URLs use v=162. Mobile stays v158/v=161. Combat, timing, costs/damage, orb physics, effects, input, HUD, audio, roster/names, style and dependencies stay unchanged. All 42 existing src/mobile files are byte-identical to start; new adapter only.

Commit: none; HEAD/base 8f2b920241877e3194c93faa89afd985af7468b1. No add/commit attempt per coordinator 01:34/03:00; never pushed. Seven files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-paper.js (new), tests/paper-body.cjs (new), tests/runtime.cjs and tests/desktop-guard.cjs.

## Verification and limits

- Paper-body PASS: five groups / 8,400 parallel ticks / 2,016 raster checks / 6,048 frozen holds / 10,540 unchanged defaults / 120 changed native scenes. Actual inputs in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity; full-flight independent simulation parity, event-free snapshots, interruptions and resets. Tick-10 orb, speed 15, radius 20, 72 damage, 15 CE/70-tick cooldown and recovery retained. Palm meets original shot origin within six native pixels and its lane within two; 47-pixel forward hand drive with fixed soles. All-stage differences fit body unions; alpha, palette/cell/floor bounds, HUD, other moves, portraits and Domains remain exact.
- --baseline --preview-only reproduces two missing-body groups; three compatibility groups pass. Preview-only deliberately permits those expected failures. No combat fixture corrections.
- Actual 30-script desktop runtime PASS: 33 groups, exit zero. AI/local/host keys exercise all five Paper phases; 24 event-free guest snapshots retain the same bodies. All prior menu/input/online-lifecycle and animation checks pass. Memory DOM/canvas, not a browser. All final test processes completed; no tests remain running.
- Desktop-guard PASS: seven groups / 2,713 HUD/snapshot checks / 26,114 parallel ticks. Feel PASS: eleven simulation groups plus actual keyboard/remote handlers. Guard historical-source fixture excludes the new adapter consistently with prior adapters.
- Four changed/new JS files parse; all 30 script paths exist at v=162. Protected Git diff and git diff --check pass; the 42-file start hash inventory was rechecked.
- 112 move PNGs plus four runtime previews in codex mailbox: paired native scenes and twelve-frame body/scene strips in both costumes/facings, close hits and distant casts before contact. Inspected before/after body strips, final body strip, old/new release, unobscured far release and mirror follow-through. Export: node tests/paper-body.cjs --out=PATH. Generated renderer stills, not browser screenshots or observed motion. Logs: v159-paper.log, v159-baseline.log, v159-runtime.log, v159-guard.log and v159-feel.log. Start hashes: v159-protected-files.json.
- No browser/phone, physical keys/touch, live motion/FPS/latency, audible audio, real two-device WebRTC or owner play of v159. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue. Unchanged full-roster/world/mobile suites not repeated; no performance claim.
- Ready for coordinator review/commit/publication, then owner play. Completion mailbox reread unchanged through 11:14. Next proposed v160 MOBILE: bring the reviewed Paper body across, unless phone feedback jumps the queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
