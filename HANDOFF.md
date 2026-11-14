# Handoff: Ritual Archive: Clash

## Current - version 83, script cache v=86 (2026-11-14)

All mailbox entries through 16:01 acted on/acknowledged. V82 committed by coordinator as 578b33f, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change. The optional 15:44 dust-shape note is now addressed.

V83 replaces the knockdown burst's crown-like peaks with overlapping rounded dust billows. Broad pale caps roll outward and flatten through the same first six thud ages, retaining the navy edge and shaded floor fold. Both bodies remain in front. Jump/ordinary landing dust and thud ages 6-23 match v82 exactly. No simulation, hitboxes/reach, damage/timing, event lifetime, sound, input, AI, roster/style or network changes. Eleven script URLs v=86.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/floor-impact.cjs. No add/commit attempt per 01:34/03:00; HEAD/base 578b33f; never push. Ready for review/commit and owner feel/motion assessment before publication. No decision pending.

## Verification and limits

- Updated floor-impact regression failed against v82's pointed caps before editing. V83 passes 60 actual three-press knockdowns across all fifteen builds/mirror costumes/slots/directions, 4,458 parallel-state ticks and 420 native scene/snapshot checks. Minimum initial visible dust area: 1,235 pixels. Rounded symmetric caps, unchanged body pixels, bright material, hard alpha/floor bounds, 120 fractional/edge crops, event coalescing, expiry and unchanged jump/land/late thud all checked.
- Existing airborne (real launch/jump/land/thud, 54 dust frames), contact readability (240 timelines/5,040 ticks/3,480 rasters), world (308), feel/input and actual-script runtime/menu/selection/results/online regressions pass. Source/test syntax, cache URLs and diff whitespace checks pass.
- Exported 24 before/24 after native 640x360 fight/HUD scenes, three stages/both directions, thud ages 1/3/5/8. Inspected courtyard right-t1, Gallery left-t3 and Observatory right-t5 pairs at 1x. Rounded puffs read clearly beside the fallen body. All 18 early pairs differ; all six age-8 pairs have identical SHA256. Runtime sample is byte-identical to v82; runtime/title/selection/attract rasters retained. These are memory rasters, not browser screenshots or observed motion.
- No browser retry after v77's unavailable access host. No human play/listening, native layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged full-match/art/audio/performance and other move suites not repeated. A person must judge the short billow-to-debris transition in motion.
- Prior detailed evidence remains in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/15:54/16:01, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. Contact, kick, third-punch and body-landing cues now have broad readable shapes. Assess their rhythm in human play before further fine motion work. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
