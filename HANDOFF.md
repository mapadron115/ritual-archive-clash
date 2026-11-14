# Handoff: Ritual Archive: Clash

## Current - version 78, script cache v=81 (2026-11-14)

All mailbox entries through 15:23 acted on/acknowledged. V77 committed by coordinator as ad32119, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change.

V78 fixes close-range shadow layering: each actor's shadow previously drew with its body, so slot 2's shadow erased parts of slot 1's soles during movement/crossings and under downed bodies. Both shadows now draw in one ground pass before floor effects and both bodies. Their shape, color and height response remain the same, including hidden recovery bodies and impact-frame suppression. No combat, animation, AI, input, audio or network changes. Eleven script URLs v=81.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/gum-tether.cjs, tests/shadow-layering.cjs (new). The tether composite fixture now includes the separate ground pass; its full suite passes. No add/commit attempt per 01:34/03:00; HEAD/base ad32119; never push. Ready for review/commit and owner assessment before publication. No design decision pending.

## Verification and limits

- New shadow-layering regression fails on committed v77: 24,627 body-pixel overpaints across 1,488 frames. V78 passes with zero across the same 166,848 samples, 1,380 parallel-state movement/contact ticks, actual jump crossings/launch/knockdown/KO, all builds/mirrors/stages, enlarged bodies, recovery blink, snapshots and freeze-held poses.
- Footwork, airborne/dust, hook grounding, contacts, world, status effects, gum tether, round results, damage readability/stacks, feel/input and actual-script runtime/menu/selection/results/online regressions pass. Source syntax, eleven matching cache URLs and diff whitespace checks pass.
- Exported 28 before/28 after full native 640x360 scenes in the codex mailbox. Inspected before/after observatory close-walk and downed-Greta compositions at 1x: the nearby shadow no longer cuts the soles. Runtime/title/selection/attract rasters also exported; runtime frame is byte-identical to v77 (matching SHA256). These are memory-raster composites, not browser screenshots or motion.
- No browser retry after v77's unavailable access host. No human play/listening, native layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged broad full-match/art/audio/performance suites not repeated.
- Prior regression evidence and detailed previews remain in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Retry native browser fight/move-list/results review when the surface works; remaining visible arena/motion faults follow. Close-range shadow layering, Watch identity and third-punch soles are addressed. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
