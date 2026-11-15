# Handoff: Ritual Archive: Clash

## Current - version 95, script cache v=98 (2026-11-15)

Mailbox through 01:56 acted on/acknowledged; final reread unchanged. Coordinator committed v94 as 7c83acc, not pushed. Owner directly repeated autonomous check-in/mailbox/report instructions; no new design decision. One change this run: a readable, head-following stun crown. All three arenas remain closed.

V95 replaces the three fixed-height pale diamonds with outlined gold five-point stars. They follow the authored folded/rising head through guard-break or shock recovery, orbit on the existing stT clock (holding during impact/global/time-stop pauses), and paint behind both bodies. The crown clears outside stun and is suppressed during impact silhouettes or invulnerability blinks. No combat/input/audio/AI/network changes. Eleven script URLs v=98.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/stun-crown.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 7c83acc; never pushed. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New stun-crown regression passes 120 direct-hit guard-break/shock recovery timelines across all fifteen builds, both costumes/slots and directions; 720 native/snapshot checks and 6,480 pause holds. Minimum visible crown area after HUD/body occlusion: 171 pixels. Checks hard alpha, read-only simulation, clear body pixels, unchanged parallel-state recovery outcomes, cleanup, ordinary-hit exclusion and enlarged edge rendering. Fixed v94 baseline exports before scenes; baseline assertion rejects the old fixed-height cue.
- Existing guard-animation (90 block/break/shock timelines, 300 silhouette comparisons), world (308 frames), HUD (75 states), feel/input (eleven groups and actual keyboard handlers), actual-script runtime/title/selection/move list/results/input and online lifecycle suites pass. Source/new-test syntax, eleven v98 URLs and diff whitespace pass.
- Inspected native 640x360 v95-before/after-ch0-courtyard-left-remaining40.png at 1x: the old pale diamonds float high above the folded head; the gold stars sit close to it and separate from the gate. Also inspected Greta gallery-left-remaining30 and Isolde courtyard-left-remaining5 after frames. Native pairs across all stages, both directions, Isolde/Greta and three recovery moments, plus v95-runtime-frame/selection-assets/title-mark/attract-frame, retained in the codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC check. Browser not retried. Unchanged stage, full-match, individual move/art, audio/contact and performance suites not repeated. Last full-match smoke: 225 matchups/1,169,896 ticks. Scripts and stills do not count as owner play.

## Next priorities

Continue the first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. All arenas stay closed; owner play/readability/listening notes take priority. No pending decision for v95. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
