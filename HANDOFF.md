# Handoff: Ritual Archive: Clash

## Current - v141 WEB/cache v=144; mobile v140/cache v=143 (2026-11-16 07:11:19 UTC)

Mailbox through 2026-11-16 01:52 acted on. V140 accepted/published as 2648ab9. Owner directly repeated autonomous check-in, outstanding orders and a mailbox report; no new design direction. One version this run. Coordinator commits; never push.

V141 reproduces Dax Morrow's Explosion using the generic palm while kickback slides his body backward. New desktop-only src/desktop-blast.js loads the palm at move ticks 4-7, drives it forward on the original tick-eight blast, folds the head/torso back at 11-14 and recovers low at 15-18. Original early startup and tick-19 settle remain. Serialized move age holds through freezes and first event-free guest snapshots. Combat timing, sweat scaling, costs/damage, blast effects and kickback physics unchanged. All 21 desktop scripts use v=144. Mobile and all twenty pre-existing source files untouched.

Commit: none; HEAD/base 2648ab9fe3aa23a0b416c475637f5c4e2ff918cc. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-blast.js (new), tests/blast-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Blast-body PASS: five groups / 4,000 parallel ticks / 1,700 rasters / 3,960 frozen holds / 9,288 unchanged defaults / 96 changed scenes. Actual input edges in both slots/facings with empty/full sweat, hit/guard/rear/jump/far targets. Exact state parity, CE/cooldown, tick-eight release, blast center/radius, recoil velocity and recovery retained; 70 base damage, 103.6 with full sweat and 15% through guard. Jumping at this distance still gets hit, as before. Event-free snapshots and freeze/hit-stop/time-stop bodies agree. Native differences on all three stages stay inside old/new body unions; HUD/other moves/Domains/portraits stay exact. Hard alpha, <=24 colors, bounded cells and floor soles pass. Baseline omits only this adapter: two animation groups deliberately fail; the other three pass. Preview-only permits those expected failures.
- Full runtime PASS: actual 21-script HTML/main-loop boot, menus/input/results/rematch/online callbacks and all prior fighter-animation paths, plus real Explosion keys in AI/local/host modes and 22 event-free guest snapshots. Focused AI-mode casts disable AI and use keys; no AI balance claim. Initial fixture assumptions about the pre-motion blast event and old 20-script count were corrected; no simulation fix was needed.
- Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Historical filters exclude only the adapter absent from their old source; current HTML/runtime load it. Feel PASS: eleven simulation groups plus keyboard/remote handlers. Mobile-install PASS. Five changed/new JS files parse; protected mobile diff and final git diff --check PASS. No tests remain running. Thirty-two of 33 protected source/mobile files exactly match Git blobs; untouched mobile/index.html has only its pre-existing checkout line-ending difference.
- 52 PNGs in codex mailbox: paired eleven-frame body/native scene strips and individual scenes in main/right/Courtyard and mirror/left/Gallery. Inspected both main strips, mirror strip, before/after main release, main kickback and mirror release/kickback. Generated renderer stills, not browser screenshots or observed motion. Export: node tests/blast-body.cjs --out=PATH; add --baseline --preview-only for before.
- No browser/phone, physical keys/touch, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v141. No performance claim. Historical full-roster/world and unchanged dedicated mobile suites not repeated. Script-tested is not played.
- Owner correction via 23:34 stands: reloaded arena works on iPhone 12 mini/iOS 26.5. V136 MUTE/MOVES still awaits toolbar-height retest; no new result through 01:52. Retain v122 presenter. Proposed next v142 MOBILE: bring the reviewed Explosion body across; owner phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
