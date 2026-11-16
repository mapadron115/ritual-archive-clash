# Handoff: Ritual Archive: Clash

## Current - v145 WEB/cache v=148; mobile v144/cache v=147 (2026-11-16 09:13:30 UTC)

Mailbox through 2026-11-16 04:00 acted on; completion reread unchanged; v144 accepted/published as 5003427. Owner directly repeated autonomous check-in, outstanding orders and reporting; no new design direction. One version this run. Coordinator commits; never push.

V145 adds desktop-only src/desktop-red.js: Reversal Red draws its palm in at ticks 6-11, drives on the original tick-12 projectile, recoils at 15-18 and returns at 19-24. The hand advances forty native pixels into the shot lane; soles stay planted. Serialized move age holds through freezes and event-free snapshots. All 23 desktop script URLs use v=148. Combat, projectile/effects, movement physics, input, HUD and every mobile file unchanged.

Commit: none; HEAD/base 5003427812855189d56b3dbf6cd7a0f7bd7016ec. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-red.js (new), tests/red-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Red-body PASS: five groups / 5,280 parallel ticks / 1,924 rasters / 4,752 freeze holds / 9,550 defaults / 96 changed scenes. Actual input edges in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall. Exact tick-12 release, 28 CE/140-tick cooldown, projectile speed/radius/lifetime, 100 damage (20 guarded), 145 wall damage, jump/rear/far escape, recovery and no physical kickback. Event-free snapshots agree. All-stage differences fit old/new body unions; HUD, other moves, Domains, portraits and old sprites exact. New sprites retain hard alpha, <=24 colors, bounded cells and floor-aligned soles.
- --baseline --preview-only omits just Red and reproduces two missing-animation groups; three parity/default/render groups pass. Preview-only deliberately permits expected failures. Initial fixture wrongly expected the wall-target projectile to survive its launch tick; corrected for the existing immediate collision and pop, then the full suite passed. No combat fix needed.
- Full 23-script runtime PASS: actual HTML/main-loop boot, menus/input/results/rematch/online lifecycle and all existing animation paths. New Red keys pass in AI/local/host modes, plus 22 first event-free guest snapshots. Focused casts disable AI; no balance evidence. Process exited zero; no tests remain running.
- Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Historical-source filters exclude Red only where absent from old source; current HTML/runtime load it. Feel (eleven groups plus keyboard/remote handlers) and mobile-install PASS.
- Five changed/new JS files parse; git diff --check PASS. Protected mobile/pre-existing source diff clean. Of 35 protected tracked source/mobile files, 34 equal exact Git blobs; untouched mobile/index.html has one pre-existing CRLF instead of LF (normalized equality confirmed). No new dependency.
- 52 PNGs in codex mailbox: paired eleven-frame native/body strips and individual scenes in main/right/Courtyard and mirror/left/Gallery. Inspected old/new main bodies, mirror bodies, old/new tick-12 scene, main tick-6 coil/tick-15 recoil and mirror tick-12 drive/tick-18 recoil. Export: node tests/red-body.cjs --out=PATH. Generated renderer stills, not browser screenshots or observed motion.
- No browser/phone, physical keys/touch, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v145. Historical full-roster/world and unchanged dedicated mobile suites not repeated. No performance claim. Script-tested is not played.
- Owner-confirmed reload-working iPhone arena remains accepted; v136 MUTE/MOVES awaits toolbar-height retest on iPhone 12 mini/iOS 26.5. Proposed next v146 MOBILE: reviewed Red body, unless owner feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
