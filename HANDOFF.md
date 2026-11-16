# Handoff: Ritual Archive: Clash

## Current - v143 WEB/cache v=146; mobile v142/cache v=145 (2026-11-16 08:19:04 UTC)

Mailbox through 2026-11-16 03:05 acted on; completion reread unchanged; v142 accepted/published as e386577. Owner directly repeated autonomous check-in and reporting; no new design direction. One version this run. Coordinator commits; never push.

V143 fixes Granite Blast's early arm withdrawal while its beam remains visible. New desktop-only src/desktop-granite.js coils at move ticks 8-11, aims at 12-14, drives on the original tick-15 shot, braces backward at 18-30 and withdraws at 31-34. Serialized move age holds every boundary during freezes and event-free snapshots. All 22 desktop script URLs use v=146. Combat, beam geometry/lifetime, costs/damage, kickback physics, input and HUD unchanged. Mobile remains v142.

Commit: none; HEAD/base e386577fee7e00852f2495ec2629c645df2b1fc4. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-granite.js (new), tests/granite-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Granite-body PASS: five groups / 3,200 parallel ticks / 1,968 rasters / 4,320 freeze holds / 9,384 unchanged defaults / 144 changed scenes. Actual input edges in both slots/facings, full/low HP, hit/guard/rear/jump targets. Exact tick-15 beam, 22 CE/80-tick cooldown, 115 damage (28.75 guarded), -7-facing kickback and recovery retained. Native gauntlets stay on the beam line through all 15 rendered active ages (ticks 15-29). Event-free snapshots, freeze/hit-stop/time-stop, hard alpha, <=24 colors, bounded cells and floor-aligned soles pass. All-stage changes fit old/new body unions; HUD, other moves, Domains and old sprites stay exact.
- --baseline --preview-only omits just Granite: two animation groups fail as expected, three parity/default/render groups pass. Preview-only deliberately permits expected failures. Initial fixture copy accidentally named the new adapter in its old-source list; corrected before reproducing the baseline.
- Full runtime PASS: actual 22-script boot/main loop, menus, input, results/rematch, online lifecycle and every existing animation path. Granite Blast passes through AI/local/host keyboard casts and thirty first event-free guest snapshots. Focused AI-mode casts disable AI; no balance claim. Initial attempt stopped because the new test block preceded its maximumPaintBase helper; corrected test placement, then the complete final run passed. No game change required. No tests remain running.
- Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Feel PASS: eleven groups plus real keyboard/remote input handlers. Mobile-install PASS. Five changed/new JS files parse; protected-file and git diff --check pass. 33 protected tracked source/mobile files match exact Git blobs; untouched mobile/index.html differs only in pre-existing checkout line endings. New adapter is desktop-only.
- 68 PNGs in codex mailbox: paired fifteen-frame body/native scene strips plus individual scenes in main/right/Courtyard and mirror/left/Gallery. Inspected old/new main bodies, mirror bodies, old/new tick-18 brace, release, mirror tick-24 brace and tick-31 withdrawal. Generated renderer stills, not browser screenshots or motion. Export: node tests/granite-body.cjs --out=PATH; --baseline --preview-only reproduces the old bodies.
- No browser/phone, physical touch/keys, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v143. Historical full-roster/world and unchanged dedicated mobile suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reload-working iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5. Proposed next v144 MOBILE: bring the reviewed Granite Blast body across; owner phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
