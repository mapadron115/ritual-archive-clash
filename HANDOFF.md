# Handoff: Ritual Archive: Clash

## Current - v137 WEB/cache v=140; mobile v136/cache v=139 (2026-11-16 05:12:13 UTC)

Mailbox through 2026-11-15 23:58 acted on. Coordinator 4 accepted/published v135 as 34a8b92 and v136 as 951f61e. Owner directly requested autonomous check-in, outstanding orders and a report; no new design direction. One version this run. Coordinator commits; never push.

V137 fixes Piercing Blood's ordinary-art body: low gather at move ticks 13-19, joined-hand aim at 20-25, sustained feed at 26-39, withdrawal at 40-44; original early startup and final settle remain. Beam release stays tick 26. Feed covers every visible beam age (26-38), with one follow-through tick. Release-hand centerline error drops 7.52 -> 0.10 native pixels. src/desktop-piercing.js selects solely from serialized move age, including freezes and event-free snapshots. Nineteen desktop scripts use v=140. All mobile files and pre-existing src files are unchanged. No combat, HUD, effects/audio, names, style or dependency changes.

Commit: none; HEAD/base 951f61e21d7409dfb19bc993a68c62e99ca8b46f. No add/commit attempt per 01:34/03:00; never pushed. Ready for coordinator review/commit/publication. Eight files: HANDOFF.md, README.md, index.html, src/desktop-piercing.js (new), tests/piercing-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs.

## Verification and limits

- Piercing-body PASS: five groups / 3,200 parallel ticks / 1,816 rasters / 4,032 frozen holds / 9,044 unchanged defaults / 132 body-only all-stage scene changes. Actual full/low-health hit/guard/rear/jump inputs in both slots/facings retain 30 HP/30 CE cost, cooldown, tick-26 beam release, width/origin/duration, 150 damage / 37.5 guarded / tested rear and jump zero, and recovery. Every visible beam age holds joined hands; native hand alignment throughout feed, exact HUD, hard alpha, <=24 colors, cell bounds/soles, other moves/Domains/portraits and event-free snapshots checked. Baseline omits only this adapter: two animation/alignment groups fail, other three pass; preview-only intentionally permits those failures.
- Full runtime PASS: actual nineteen-script HTML/main-loop boot; menus/input/results/rematch/online and all prior fighter paths; new Piercing Blood AI/local/host keyboard casts and 28 event-free guest snapshots. Focused AI-mode casts disable AI and use keys; no balance evidence.
- AP Shot-body PASS: five groups / 3,200 ticks / 1,428 rasters / 3,168 holds. Ordinary-body PASS: six / 3,200 / 1,280 / 2,304; 202 Quake face pixels. Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Feel (11 simulation groups plus handlers), mobile-install, five changed/new JS syntax checks, protected-file comparison and git diff --check PASS. Historical filters omit the new adapter only when absent from old commits; current runtime retains it.
- 64 mailbox PNGs: paired fourteen-frame native scene/body strips for main/right/Courtyard and mirror/left/Gallery, plus individual scenes. Inspected before/after main bodies, mirror bodies, before/after main tick 29, main gather and mirrored release/stream. Generated renderer stills, not browser captures or observed motion. Export: node tests/piercing-body.cjs --out=PATH; baseline adds --baseline --preview-only.
- No browser/phone, physical keys/touch, motion/FPS/latency, audible audio, native CSS/events, OS install/backgrounding, two-device WebRTC or owner play of v137. Unchanged full-roster/world, dedicated mobile gameplay/presentation/performance suites not repeated. No performance claim. Script-tested is not played.
- Owner correction via 23:34: smeared screenshot was an OLD TAB; current reloaded arena works on iPhone 12 mini/iOS 26.5. Retain v122 renderer. V136's fixed utility slots still need the owner's device retest; no new phone result through 23:58.
- Next v138 MOBILE: bring reviewed AP Shot and Piercing Blood bodies across; owner MUTE/toolbar retest takes priority. Arenas, optional Rapid Slash, general cluster opacity and library audit remain deferred. No question needed.

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
