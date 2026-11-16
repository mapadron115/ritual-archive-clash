# Handoff: Ritual Archive: Clash

## Current - Clash PAUSED; v161 WEB/cache v=164 ready; mobile v160/cache v=163 (2026-11-16 17:12:58 UTC)

Mailbox through 2026-11-16 12:12 acted on; v160 accepted/live as 1b6b6eb. Owner directly repeated autonomous check-in/reporting, then paused Clash through the coordinator. V161 finished testing as the pause arrived; only handoff/report finalized afterward. No more Clash work until coordinator resumes it. After v161 review, the next run is the mailbox sky-trial brief, already read; no sky work started. This session has an image-generation tool. One version this run. Coordinator commits; never push.

Reproduced Bungee Gum's generic overhead throw and dropping recovery hand. Desktop now loads src/desktop-gum.js after Paper: Pim coils the wrist low at ticks 4-7, flicks an open hand along the existing strand lane at 8-10, follows through at 11-13, withdraws at 14-16 and returns at 17-19. Serialized age holds through freezes and event-free snapshots. All 31 desktop script URLs use cache v=164. Mobile and every existing src file remain byte-identical. Combat, timing, strand flight/attachment, costs/damage, physics, effects, input, HUD, audio, roster/names, style and dependencies stay unchanged.

Commit: none; HEAD/base 1b6b6eb0da51619cb79fc510fe4a3a3ed8ffa2e3. No add/commit attempt per coordinator 01:34/03:00; never pushed. Seven files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-gum.js (new), tests/gum-body.cjs (new), tests/runtime.cjs and tests/desktop-guard.cjs.

## Verification and limits

- Gum-body PASS: five groups / 8,400 parallel ticks / 2,096 raster checks / 6,048 frozen holds / 10,696 unchanged defaults / 120 changed native scenes. Actual inputs in both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity, event-free snapshots, interruptions and round resets. Exact independent simulation parity; tick-8 strand, speed 21, radius 12, 15 damage, 10 CE/60-tick cooldown, attachment and recovery retained. All-stage differences fit body unions; HUD, early/airborne bodies, other moves, portraits and Domains stay exact. Palette, hard-alpha, sprite/floor bounds and fixed soles pass.
- --baseline --preview-only reproduces the two missing-body groups and passes the other three; expected failures deliberately permitted. The first new-pose run caught a three-native-pixel palm-height error; corrected the pose to the actual 78-unit strand lane. No simulation change.
- Desktop-guard PASS: seven groups / 2,713 HUD/snapshot checks / 26,114 parallel ticks. Feel PASS: eleven simulation groups plus actual keyboard/remote handlers. Actual 31-script runtime PASS: 34 groups, exit zero, including Gum's AI/local/host keyboard casts and 24 event-free guest snapshots. All final test processes completed; none remain running.
- Four changed/new JS files parse; all 31 desktop resource paths exist at v=164. Git mobile diff and git diff --check pass. All 37 protected existing src/mobile files match start SHA-256 inventory, v161-protected-files.json. Unchanged standalone full-roster/world/mobile suites not repeated; no performance claim.
- 112 move PNGs plus four runtime previews in the codex mailbox: paired native scenes and twelve-frame body/full-scene strips, both costumes/facings, close hits and distant casts. Inspected before/after P1 body strips, mirror strip, distant release pair, close low coil, mirror follow-through and final runtime frame. Export: node tests/gum-body.cjs --out=PATH. Generated renderer stills, not browser screenshots or observed motion. Final logs: v161-gum.log, v161-baseline-final.log, v161-guard.log, v161-feel.log and v161-runtime-final.log. An earlier runtime was stopped before final source/harness changes; its partial log is superseded.
- No browser/phone, physical touch/keys, live motion/FPS/latency, audible audio, real two-device WebRTC or owner play of v161. Script-tested is not played. Owner-confirmed reloaded iPhone arena remains accepted; v136 MUTE/MOVES still awaits toolbar-height retest on iPhone 12 mini/iOS 26.5 and jumps the queue.
- Ready for coordinator review/commit/publication, then owner play. Clash paused per 12:12; no v162 started. After v161 review, next run is sky-trial/SKY_TRIAL_BRIEF.md in the codex mailbox. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. Completion mailbox reread through 12:12. No question needed.

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
