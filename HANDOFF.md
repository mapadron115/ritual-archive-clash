# Handoff: Ritual Archive: Clash

## Current - v149 WEB/cache v=152; mobile v148/cache v=151 (2026-11-16 11:44:57 UTC)

Mailbox through 2026-11-16 06:25 acted on; completion reread unchanged. V148 accepted/published as adb6118. Owner directly repeated autonomous check-in and mailbox reporting; no new design direction. One version this run. Coordinator commits; never push.

Divine Flame gathers at move ticks 17-25, holds a wide aim at 26-33, releases the rear hand on the unchanged tick-34 arrow, follows through at 37-41 and recovers at 42-48. New desktop-only src/desktop-flame.js uses serialized move age through freezes and event-free snapshots. The front hand stays on the projectile lane; the rear hand releases twenty-nine native pixels backward and both soles stay planted. All 25 desktop script URLs use v=152. Every pre-existing source/mobile file is untouched. No combat, input, HUD, effects, audio, physics, roster/name, style or dependency change.

Commit: none; HEAD/base adb6118d156854f0dad8ff1c4c4ce7c6c4a07677. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-flame.js (new), tests/flame-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Flame-body PASS: five groups / 5,760 parallel ticks / 2,208 rasters / 5,616 frozen holds / 9,764 unchanged defaults / 120 changed scenes. Actual input edges, both slots/facings, full/low HP, hit/guard/rear/jump/far/wall. Exact independent simulation parity, original tick-34 arrow and projectile lane, speed/lifetime/explosion, 40 CE/300-tick cooldown, 140 damage (35 guarded) and recovery preserved. Timed jump and rear targets escape; tested distant target is hit. Event-free snapshot bodies agree. All-stage changes fit exact old/new body unions; HUD, other moves, Domains and portraits stay exact. Hard-alpha sprites use <=24 colors, bounded cells and floor-aligned soles.
- --baseline --preview-only omits only Flame and reproduces two animation failures; parity/default/render groups pass. Preview-only deliberately permits expected failures. Early copied fixture expectations were corrected for the existing jump escape and immediate wall explosion; no simulation change.
- Full runtime PASS: actual 25-script boot, menus/input/results/rematch/online callbacks and every prior animation path. New Flame bodies pass through keyboard handlers in AI/local/host modes and 26 first event-free guest snapshots. Focused AI-mode casts disable AI and use keys; no AI balance claim. 28 PASS lines; process exited zero. No tests remain running.
- Desktop-domain PASS: 525 HUD checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Historical-source filters omit Flame only where old sources lack it. Feel PASS: eleven groups plus keyboard/remote handlers. Mobile-install and blue-body (five groups / 5,760 ticks) PASS. All 25 script resources exist and share v=152; five changed/new JS files parse. Protected-file check: 36 of 37 existing src/mobile files equal exact HEAD blobs; untouched mobile/index.html has only its pre-existing normalized-equal CRLF/LF difference. Protected Git diff and final git diff --check pass. Ready for coordinator review/commit/publication, then owner play.
- 60 native PNGs in codex mailbox: before/after thirteen-frame body/full-scene strips and individual scenes in both costumes/facings. Inspected both main body strips, mirror bodies, old/new main aim and release, and mirror release at full native scene size. Export: node tests/flame-body.cjs --out=PATH. Generated renderer stills, not browser screenshots or observed motion.
- No browser/phone, physical keys/touch, live motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v149. Unchanged mobile/full-roster/world suites not repeated. No performance or human balance claim. Script-tested is not played.
- Owner-confirmed reload-working iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue. Proposed next v150 MOBILE: bring this reviewed Flame body across after coordinator review, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
