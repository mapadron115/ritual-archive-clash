# Handoff: Ritual Archive: Clash

## Current - version 96, script cache v=99 (2026-11-15)

Mailbox through 02:14 acted on/acknowledged; final reread unchanged. Coordinator committed v95 as 8445875, not pushed; the overnight stop applied to the previous run. Owner directly repeated autonomous check-in/mailbox/report instructions; no new design decision. One change this run: visible ordinary landing dust. All three arenas remain closed.

V96 replaces the tiny ordinary landing wedges/clusters with low, outlined pale puffs that roll outward beside the boots, then shrink and dim. They use the existing event age and 18-tick lifetime, behind both bodies. Takeoff and knockdown dust are byte-identical to v95. No physics, combat, timing, input, audio, AI or network changes. Eleven script URLs v=99.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/floor-impact.cjs, tests/landing-dust.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 8445875; never pushed. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New landing-dust regression passes 90 actual jump/landing input timelines across all fifteen builds, both costumes/slots and left/neutral/right travel; 5,040 parallel-state ticks and 684 native/snapshot checks. Minimum visible early dust after body/HUD occlusion: 155 pixels. Checks hard alpha, floor bounds, read-only match/effects, clear bodies, outward travel, expiry, 90 edge/fractional crops and byte-identical takeoff/thud frames. Fixed 8445875 baseline exports before scenes; baseline fails on the old 43-pixel cue.
- Existing floor-impact (60 punch-chain knockdowns, 420 native checks), airborne/dust (54 frames), jump-animation (180 input/slow/direction timelines, 120 interruptions), world (308 frames), feel/input (eleven groups and actual keyboard handlers), actual-script runtime/title/selection/move list/results/input and online lifecycle suites pass. Source/new-test syntax, eleven v99 URLs and diff whitespace pass. Floor-impact delegates ordinary landing appearance to the new regression.
- Inspected native 640x360 v96-before/after-ch0-courtyard-p1-t1.png and Greta gallery-p2-t3.png at 1x: the old cue hides in the boots/floor; the pale puffs sit visibly beside them. Also inspected Greta observatory-p1-t9 and Isolde courtyard-p1-t17 for dispersal. Native pairs across all stages, both costumes, Isolde/Greta and five effect ages, plus v96 runtime/menu assets, retained in the codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC check. Browser not retried. Unchanged stage, full-match, other individual move/art, HUD, audio/contact and performance suites not repeated. Last full-match smoke: 225 matchups/1,169,896 ticks. Scripts and stills do not count as owner play.

## Next priorities

Continue the first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. All arenas stay closed; owner play/readability/listening notes take priority. No pending decision for v96. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
