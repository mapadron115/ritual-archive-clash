# Handoff: Ritual Archive: Clash

## Current - v150 MOBILE/cache v=153; desktop v149/cache v=152 (2026-11-16 12:41:34 UTC)

Mailbox through 2026-11-16 06:55 acted on; completion reread unchanged. V149 accepted/published as c34101f. Owner directly repeated autonomous check-in and mailbox reporting; no new design direction. One version this run. Coordinator commits; never push.

Mobile loads the reviewed src/desktop-flame.js after Lapse Blue. Divine Flame gathers at ticks 17-25, aims wide at 26-33, releases the rear hand on the unchanged tick-34 arrow, follows through at 37-41 and recovers at 42-48. Serialized move age holds through freezes and event-free guest snapshots. All 32 versioned page resources and three manifest icon URLs use v=153; title/error stamps say v150. Desktop, shared sources and mobile runtime/CSS were never written. Combat, effects, physics, input, HUD, audio, roster/name, style and dependencies are unchanged.

Commit: none; HEAD/base c34101f9670d29f4c90007b46d584931087aaea0. No add/commit attempt per 01:34/03:00; never pushed. Eighteen files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile-flame.cjs (new), tests/mobile.cjs, tests/mobile-utility.cjs and eleven prior mobile-animation fixtures (animation, maximum, convergence, quake, ordinary, beam-body, contract, blast, granite, red, blue).

## Verification and limits

- Mobile-flame PASS: three groups / 5,760 parallel ticks / 884 raster comparisons / 468 frozen holds / 52 event-free guest snapshots / 2,804 defaults / 120 changed scenes. Synthetic touch/remote casts in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall. Independent simulation and desktop-world parity; tick-34 arrow/lane/speed/lifetime/explosion, 40 CE/300-tick cooldown, 140 damage (35 guarded), recovery and zero kickback preserved. Timed jump and rear targets escape; tested distant target is hit. All-stage differences fit old/new body unions; HUD/controls, unrelated moves, Domains and portraits remain exact.
- --flame-baseline --preview-only omits only Flame and reproduces all three missing-animation groups; preview-only deliberately permits expected failures. Copied fixture names/projectile checks were corrected before the first run; no simulation change.
- Actual 28-script mobile boot/general input suite PASS: pointer/multi-touch, freeze taps, cleanup/background/rotation, CPU/watch, host/guest encoding, all sixty move names/states, safe-area targets and synthetic CPU match/results/rematch/title return. Scripted CPU outcomes are not balance evidence.
- All eleven prior animation regressions PASS: animation, maximum, convergence, quake, ordinary, beam-body, contract, blast, granite, red and blue. Each independent fixture now includes Flame for unrelated-pose comparisons. All test processes exited zero; none remain running.
- Mobile-utility PASS: three groups / 26 layouts / 16 toggles, separated fixed utility slots and v150 title. Mobile-present PASS: 73 ordinary/deferred frame comparisons, fifteen Domains, orientations/DPR 3, opaque skipped-copy recovery, separated layers and no per-frame canvas allocation. Mobile-install and feel (eleven groups plus keyboard/remote handlers) PASS.
- Fourteen changed/new JS files parse; all versioned resources exist. Thirty of 31 protected files equal exact HEAD blobs; untouched desktop index.html retains its pre-existing normalized-equal CRLF/LF checkout difference. Protected Git diff and git diff --check pass. Ready for coordinator review/commit/publication, then owner play.
- 124 PNGs in codex mailbox: before/after thirteen-frame body/667x375 phone strips, native scenes, 812x320 and 844x390 release scenes and portrait models. Inspected both main body strips, mirror bodies, native aim, main/mirror release, short-screen and 844x390 release, and portrait. Export: node tests/mobile-flame.cjs --out=PATH. Generated renderer/layout stills, not browser screenshots or observed motion.
- No browser/phone, physical touch/keys, live motion/FPS/latency, audible audio, native CSS/focus/events, OS installation/backgrounding, real two-device WebRTC or owner play of v150. Unchanged desktop/full-roster/world suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue. Proposed next v151 WEB: next reproduced ordinary-art/fighter-feel gap, unless phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
