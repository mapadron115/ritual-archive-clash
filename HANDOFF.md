# Handoff: Ritual Archive: Clash

## Current - v151 WEB/cache v=154; mobile v150/cache v=153 (2026-11-16 13:13:35 UTC)

Mailbox through 2026-11-16 07:55 acted on; completion reread unchanged. V150 accepted/live as 398c99d. Owner directly repeated autonomous check-in and mailbox reporting; no new design direction. One version this run. Coordinator commits; never push.

Desktop-only src/desktop-grape.js gives Grape Shot a low coil at ticks 6-8, open two-hand firing stance at 9-11, forward release on the unchanged tick-12 fan, upward/backward recoil at 15-20 and recovery at 21-26. Move age holds through freezes and event-free snapshots. All 26 desktop script URLs use v=154. Five pellet paths, three-hit cap, costs/damage, kickback physics and recovery timing are unchanged. Existing shared sources and mobile files were never written.

Commit: none; HEAD/base 398c99d320f2dd26b43124c3bfad80b9502bfccc. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-grape.js (new), tests/grape-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Grape-body PASS: five groups / 5,760 parallel ticks / 2,112 rasters / 5,616 frozen holds / 9,936 unchanged defaults / 120 changed scenes. Actual input casts in both slots/facings, full/low HP and hit/guard/rear/jump/far/wall targets. Exact independent simulation parity, original tick-12 fan geometry/speed/lifetime, 25 CE/130-tick cooldown and recovery retained. Tested hit/wall takes 79.2 total with existing combo scaling, guard 13.5, timed jump 56.4; rear/far targets escape. Snapshot bodies agree. All-stage differences fit exact body unions; HUD, other moves, Domains, portraits and old sprites remain exact. Bounded hard-alpha sprites use <=24 colors and floor-aligned soles.
- Baseline preview omits only Grape and reproduces the two animation failures; simulation/default/scene groups pass. Preview-only permits expected failures. Early copied fixture expectations were corrected for existing combo/chip damage, jumping hits and two surviving wall pellets; no simulation changes.
- Full runtime PASS: actual 26-script HTML/main-loop boot, menus/input/results/rematch/online callbacks and every prior animation path. Grape bodies pass through actual AI/local/host keyboard handlers and 26 first event-free guest snapshots. Focused AI-mode casts disable AI and use keys; no balance claim. All 29 PASS lines; process exited zero. An initial fixture-placement failure was corrected by moving the new block after its common helpers. No tests remain running. Ready for coordinator review/commit/publication, then owner play.
- Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Feel (eleven simulation groups plus keyboard/remote handlers), mobile-install and flame-body (five groups / 5,760 ticks) PASS. Five changed/new JS files parse; all resource paths exist and share v=154. Protected Git diff and git diff --check pass. Thirty-seven of 38 tracked src/mobile files equal exact HEAD blobs; untouched mobile/index.html has only its pre-existing normalized-equal CRLF/LF difference.
- 60 PNGs in codex mailbox: before/after thirteen-frame body/full-scene strips and native scenes in both costumes/facings. Inspected before/after bodies, mirror bodies, main/mirror release, old release, coil, open stance and recoil at native scene size. Export: node tests/grape-body.cjs --out=PATH; add --baseline --preview-only for before. Generated renderer stills, not browser screenshots or observed motion. Logs use v151- here.
- No browser/phone, physical keys/touch, live motion/FPS/latency, audible audio, native CSS/focus/events, installation/backgrounding, real two-device WebRTC or owner play of v151. Dedicated unchanged mobile/full-roster/world suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps queue. Proposed next v152 MOBILE: bring the reviewed Grape body across, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
