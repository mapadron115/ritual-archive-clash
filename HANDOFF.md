# Handoff: Ritual Archive: Clash

## Current - v155 WEB/cache v=158; mobile v154/cache v=157 (2026-11-16 15:07:19 UTC)

Mailbox through 2026-11-16 09:51 acted on; v154 accepted/live as 2d4f114. Owner directly repeated autonomous check-in and mailbox reporting, with no new design direction. One version this run. Coordinator commits; never push.

Round of Applause had no punching body on its delayed tick-13 melee hit: Bram held clap recovery. Desktop now loads src/desktop-applause.js after Guided Shell. The original tick-6 clap/swap stays; ticks 9-12 hold a drawn-back fist in a low lunge, 13-15 extend the fist, 16-20 follow through, 21-24 withdraw and 25-27 rise to guard. Existing serialized move age holds through freezes and event-free guest snapshots. All 28 desktop script URLs use v=158. Mobile stays v154/v=157. No combat, timing, costs/damage, swap eligibility, physics, effects, input, HUD, audio, roster/name, style or dependency change; all existing src/mobile files are unchanged.

Commit: none; HEAD/base 2d4f114790deb331c064ef1915b9a678a122d3b9. No add/commit attempt per 01:34/03:00; never pushed. Seven files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-applause.js (new), tests/applause-body.cjs (new), tests/runtime.cjs and tests/desktop-guard.cjs. Guard's historical-source fixture excludes the new adapter just as it excludes the other later adapters.

## Verification and limits

- Applause-body PASS: five groups / 7,200 parallel ticks / 3,600 raster checks / 9,720 frozen holds / 10,240 unchanged defaults / 120 changed scenes. Actual inputs, both slots/facings, full/low HP, hit/guard/rear/jump/far/wall and failed swaps against Infinity/down and KO interruptions. Exact independent simulation parity; tick-6 swap and 22-unit lunge velocity, tick-13 hit, 28 CE/230-tick cooldown and recovery retained. Bram's 1.05 multiplier still turns base 95 into 99.75 damage against the close unguarded/back-turned target. Far targets escape. Early clap, other moves, interruptions, airborne states, portraits and Domains stay exact. All-stage differences fit body unions; sprites retain hard alpha, palette limits, cell bounds and floor contact.
- --baseline --preview-only reproduces both missing-lunge/punch groups; preview-only deliberately permits those expected failures. Three unaffected groups still pass.
- Full 28-script actual-HTML runtime integration PASS: 31 PASS lines, exit zero. Includes the new AI/local/host keyboard checks and 24 event-free guest snapshots for clap/lunge/punch/recovery, plus all prior menu/input/online lifecycle and fighter-animation regressions. Memory-canvas/DOM shell, not a browser.
- Desktop-guard PASS: seven groups / 2,713 HUD/snapshot checks / 26,114 parallel ticks. Guided-body PASS: five groups / 12,480 parallel ticks / 2,064 raster comparisons. Feel PASS: eleven simulation groups plus keyboard/remote handlers.
- Four changed/new JS files parse. All 28 desktop resource paths exist at v=158. Existing 40 src/mobile files match HEAD content with checkout EOL differences allowed; current working-file SHA-256 inventory is in v155-protected-files.json. Protected Git diff and git diff --check pass. Unchanged standalone full-roster/world/mobile suites not repeated. No performance claim.
- 136 move PNGs plus four runtime previews in codex mailbox: before/after fifteen-frame body/native-scene strips plus individual scenes, both costumes/facings, close hits and unobscured far whiffs. Inspected body strips, mirror bodies, native lunge/contact and before/after unobscured tick-13 whiff. Export: node tests/applause-body.cjs --out=PATH (add --baseline --preview-only for before). Generated renderer stills, not browser screenshots or observed motion. Logs use v155- here.
- No browser/phone, physical keys/touch, live motion/FPS/latency, audible audio, real two-device WebRTC or owner play of v155. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Next proposed v156 MOBILE: bring the reviewed Round of Applause body across, unless phone feedback jumps the queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
