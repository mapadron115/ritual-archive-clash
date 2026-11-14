# Handoff: Ritual Archive: Clash

## Current - version 84, script cache v=87 (2026-11-14)

All mailbox entries through 16:07 acted on/acknowledged. V83 committed by coordinator as 33f8b7c, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change. No decision pending.

V84 gives the first two punches short, tapered straight wakes beneath their fists, making the opening blows' paths visible beside the kick sweep and rising finisher. The cross slopes from the rear shoulder. Wakes follow build/facing/enlargement behind both bodies, using only the existing three active ticks; freezes hold them, recovery/interruption clears them, and impact silhouettes/recovery blinks suppress them. No simulation, hitboxes/reach, damage/timing, FX state/lifetimes, sound, input, AI, roster/style or network changes. Eleven script URLs v=87.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/straight-punch-wake.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 33f8b7c; never push. Ready for review/commit and owner feel/motion assessment before publication.

## Verification and limits

- New straight-punch-wake regression failed on v83's absent wake before implementation. V84 passes 180 actual two-press whiff/hit/block chains across all builds/mirror costumes/slots/directions, 5,880 parallel-state ticks, 2,700 native frames/snapshots, 216 freeze holds and 240 contacts. Minimum visible whiff wake: 357 pixels. Checks unchanged body/windup/recovery pixels, reflection, enlarged bounds, hard alpha/floor bounds, 20 fractional/edge crops, interruption cleanup and impact/blink suppression. First draft hid too much behind Greta's late jab; the visibility test caught it, and the wider final ribbon passes.
- Existing jab animation (180 timelines/240 second-press transitions), punch-chain (360 timelines/270 third-press transitions), kick/hook sweeps (180 timelines each), floor impact (60 knockdowns/420 rasters), contact readability (240 timelines/3,480 rasters), world (308), feel/input and actual-script runtime/menu/selection/results/online regressions pass. Source/test syntax, eleven matching v87 URLs and diff whitespace checks pass.
- Exported 144 before/144 after native 640x360 fight/HUD scenes for Isolde and the same matrix for Greta: both punches, whiff/hit/block, all stages/both directions, ages 3/4/6/7. Inspected courtyard right jab-t4, Gallery left cross-t6 and Greta courtyard left jab-t6 pairs at 1x, plus Observatory right cross-block-t4. In each matrix all 72 active pairs differ and all 72 windup/recovery pairs have identical SHA256. Runtime sample is byte-identical to v83; runtime/title/selection/attract rasters retained. These are memory rasters, not browser screenshots or observed motion.
- No browser retry after v77's unavailable access host. No human play/listening, native layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged full-match/art/audio/performance and other move suites not repeated. A person must judge the three-tick punch wakes in motion.
- Prior detailed evidence remains in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/16:07, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. Basic grounded blows, contact and body-landing cues now have broad readable shapes. Prefer a different visible first-minute gap next; assess these cues' rhythm in human play before further fine motion work. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
