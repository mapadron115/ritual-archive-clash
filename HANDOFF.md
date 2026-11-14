# Handoff: Ritual Archive: Clash

## Current - version 82, script cache v=85 (2026-11-14)

All mailbox entries through 15:54 acted on/acknowledged. V81 committed by coordinator as e2705b3, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change. Optional rounder body-dust note remains deferred.

V82 gives the third basic punch a broad pale rising fist wake during its four existing active ticks. It distinguishes the lifting finish from the two straight punches, follows build height, facing and enlarged bodies, and draws behind both fighters. The move clock holds it through hit-stop/freeze/time stop; recovery/interruption clears it. Existing impact silhouettes and recovery blinks suppress it. Whiff scenes expose at least 732 changed pixels at native size. Windup/recovery and both opaque bodies match v81 exactly. No simulation, hitbox/reach, damage/timing, sound, input, AI, roster/style or network changes. Eleven script URLs v=85.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/hook-sweep.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base e2705b3; never push. Ready for review/commit and owner feel/motion assessment before publication. No design decision pending.

## Verification and limits

- New hook-sweep regression failed on v81's absent wake. V82 passes 180 real three-press whiff/hit/block chains across all fifteen builds/mirror costumes/slots/directions, 8,868 parallel-state ticks, 1,620 native frames/snapshots, 144 move-clock freeze holds and 120 third-punch contacts. Also checks both bodies, unchanged windup/recovery, 120 normal reflections/120 giant bounds, hard alpha/floor bounds, ten edge/fractional crops, interruption/other-move cleanup, recovery blinking and impact-silhouette suppression. Reference rendering suppresses the wake after HEAD includes it, keeping the regression usable after commit.
- Existing punch-chain (360 timelines/270 immediate third-press transitions), kick-sweep (180 timelines/1,620 frames), contact readability (240 timelines/3,480 rasters), floor impact (60 knockdowns/420 rasters), world (308), feel/input and actual-script runtime/menu/selection/results/online regressions pass. Source/test syntax and diff whitespace checks pass.
- Exported 72 before/72 after native 640x360 fight/HUD scenes with real contact effects: whiff/hit/block, ticks 6/7/9/11, all stages/both directions. Inspected courtyard right-t7 before/after, Gallery whiff left-t9, Observatory block left-t7/t9 and a diagnostic courtyard block right-t7 at 1x. The upward wake is plainly visible; both bodies stay in front. All 36 windup/recovery PNG pairs have identical SHA256; all 36 active pairs differ. Runtime/title/selection/attract rasters retained; inspected runtime frame, byte-identical to v81. These are memory rasters, not browser screenshots or observed motion.
- No browser retry after v77's unavailable access host. No human play/listening, native layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged broad full-match/art/audio/performance suites not repeated. Human motion assessment is needed for the brief wake's rhythm.
- Prior detailed evidence remains in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/15:54, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. Third-punch motion, kick motion, first contact and body landing now have broad cues; owner motion assessment should judge their rhythm. Optional future dust pass: rounder billowing puffs rather than peaks. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
