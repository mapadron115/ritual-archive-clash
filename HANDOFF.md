# Handoff: Ritual Archive: Clash

## Current - version 86, script cache v=89 (2026-11-14)

All mailbox entries through 16:23 acted on/acknowledged; final reread unchanged. V85 committed by coordinator as 9ae015b, not pushed. Owner phone encouragement (16:16) and direct check-in both repeat independent work; no design change or decision pending.

V86 replaces Black Flash's six persistent full-length spokes with an original torn black/red rupture, tapered irregular forks, then detached shrinking shards. Uses the same existing 36-tick FX age, beneath both fighters to keep their bodies/impact silhouettes readable. The normal hit contact, banner, particles and Zone effect stay intact. No simulation, chance/damage, hit-stop, Zone duration, FX event/state/lifetime, sound, input, AI, roster/style or network changes. Eleven script URLs v=89. New cache is bounded to 36 local 256x224 rasters (7.875 MiB maximum).

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/black-flash-rupture.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 9ae015b; never push. Ready for review/commit and owner motion/feel assessment before publication.

## Verification and limits

- New regression first failed against v85 because late spokes still covered the contact. Final version passes 240 actual seeded grounded/air punch/kick Black Flashes across all builds/mirror costumes/slots/directions, 10,320 parallel-state ticks and 2,160 native frame/snapshot checks. Minimum visible expanded rupture: 2,660 native pixels. Covers read-only state/FX, unchanged outcomes, original 20-tick hit-stop/Zone activation/36-tick expiry, 37 phase rasters, hard alpha, late contact detachment, 25 fractional/edge crops and clear ordinary/enlarged body/impact silhouettes. First draft's late growth crossed its local raster bounds; geometry capped and final test passes.
- Contact readability (240 timelines/5,040 ticks/3,480 rasters), world (308), feel/input and actual-script runtime/menu/selection/results/online lifecycle suites pass. Source/test syntax, eleven matching v89 URLs and diff whitespace pass. 108 no-Black-Flash world frames are byte-identical to HEAD.
- Exported 54 v86-before/54 after native 640x360 fight/HUD scenes with repeatable particles: all stages/both directions, ages 1/4/7/12/18/26/32/35/36. Inspected courtyard-right-t7 and Observatory-right-t12 pairs at 1x, Gallery-left-t32 pair, Observatory-right-t1 and courtyard-left-t35. Bodies are clearer and late contact is open again. All 48 live-effect pairs differ; six expired pairs have identical SHA256. Runtime/title/selection/attract rasters retained; runtime sample byte-identical to v85. These are memory rasters, not browser screenshots or observed motion.
- Focused Node CPU world-only timing, 120 warm frames per stage: v85 medians 0.66/0.70/0.66 ms, v86 0.38/0.35/0.38 ms; v86 p95 0.49/0.43/0.43 ms (courtyard/gallery/observatory). Includes cached rupture raster, excludes HUD/particles/audio/browser. Not browser FPS.
- No browser retry after v77's unavailable access host. No human play/listening, native layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged full-match/art/audio and other move suites not repeated. Owner must judge the strike-to-shard rhythm in motion.
- Prior detailed evidence remains in dated FROM_CODEX.md. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/12:21, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. Black Flash now disperses and leaves actors clear; assess rhythm in owner play before more tuning. Prefer a different visible arena/move gap next. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
