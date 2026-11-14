# Handoff: Ritual Archive: Clash

## Current - version 87, script cache v=90 (2026-11-14)

All mailbox entries through 16:49 acted on/acknowledged. V86 committed by coordinator as 5f437e9, not pushed. Owner's direct check-in repeats autonomous work/mailbox/report instructions; no design change or decision pending.

V87 gives the airborne kick a horizontal sweep beneath the extended shin, behind both fighters. Its tail shortens toward the boot across the existing eight active ticks, becoming smaller/dimmer in the second half. The existing move clock holds it during freezes; landing, recovery and interruption clear it immediately. Normal/enlarged builds and both facings follow the fighter root. No new FX state/cache, simulation, timing, reach, damage, input, AI, sound, roster/style or network changes. Eleven script URLs v=90.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/air-kick-sweep.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 5f437e9; never push. Candidate for review/commit and owner motion/feel assessment before publication.

## Verification and limits

- New regression first failed against v86: zero visible airborne boot sweep. Final check passes 300 actual early/crest/late/hit/block jumping-kick timelines across all builds/mirror costumes/slots/directions: 12,240 parallel-state ticks, 2,520 native frames/snapshots, 120 contacts, 288 freeze holds and 240 normal/enlarged hard-alpha shapes. Minimum first-half visible whiff sweep: 332 native pixels. Covers read-only state/FX, unchanged outcomes, clear bodies, reflection, 20 fractional/edge crops, interruption/landing cleanup, impact silhouettes and decreasing late-phase area.
- Air attacks (360 timelines/120 real hit/block contacts), grounded kick and hook (180 timelines/1,620 frames each), contact readability (240 timelines/3,480 frames), Black Flash (240 timelines/2,160 frames), world (308), feel/input and actual-script runtime/menu/selection/results/online lifecycle suites pass. Source/test syntax, eleven matching v90 URLs and diff whitespace pass.
- Exported 264 before/264 after native 640x360 fight/HUD scenes with seeded particles: Isolde/Greta, all stages/both directions, early/crest whiffs and descending hit/block. 141 active pairs differ; 120 windup/recovery pairs are byte-identical. Three active Greta-left-hit-t8 pairs are also identical because the sweep is obscured by contact/body rendering. Inspected courtyard-right early t6/t13, Gallery-left Greta-crest t8, Gallery-right crest t8, Observatory-left crest t11, Gallery-right Greta-hit t6, plus both block directions. Initial/crest arcs read at 1x; faces/boots stay clear; late shape contracts to the boot. Draft late geometry left a long spur, so tightened contraction and added the area regression. These are memory rasters, not browser screenshots or observed motion.
- v87-runtime-frame.png (byte-identical to v86), v87-selection-assets.png, v87-title-mark.png and v87-attract-frame.png retained in mailbox. No human play/listening, native browser layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. No browser retry after v77's unavailable access host. Unchanged full-match, art/audio, stage, floor-impact and performance suites not repeated. Owner must judge the eight-tick air-kick sweep in motion.
- Prior detailed evidence remains in dated FROM_CODEX.md. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/12:21, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. Ground/air kicks now have different paths; assess their weight in motion before more tuning. Prefer an arena motion/readability audit next after the recent contact/move passes. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and obtains owner's publication approval; never push. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
