# Handoff: Ritual Archive: Clash

## Current - version 80, script cache v=83 (2026-11-14)

All mailbox entries through 15:38 acted on/acknowledged. V79 committed by coordinator as 48ef319, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change.

V80 makes knockdowns meet the floor visibly: the first six thud ages now throw a broad dust fan with a dark outline and pale ridge. Before, the first age was shallow beige triangles barely distinct from the courtyard (350 visible pixels in the reproduced third-punch scene); afterward, every tested initial scene exposes at least 850 burst pixels. Jump/ordinary landing dust and thud ages 6-23 match HEAD byte for byte. The burst draws behind bodies and stays above the floor. Event clocks, lifetimes, damage, hit-stop, shake, sound and all simulation/input/AI/network behavior remain unchanged. Eleven script URLs v=83.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/floor-impact.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 48ef319; never push. Ready for review/commit and owner feel/motion assessment before publication. No design decision pending.

## Verification and limits

- New floor-impact regression fails on committed v79's first body landing. V80 passes 60 actual three-press punch-chain knockdowns across all builds/mirrors/slots/directions, 4,458 parallel-state ticks and 420 native scene/snapshot checks. Minimum 850 visible burst pixels at displayed ages 1/3; bright material, hard alpha, bounds, 120 edge/fractional crops, read-only state/effects, coalescing and expiry checked. All jump/landing/late-thud frames match HEAD.
- Contact readability (240 timelines/5,040 ticks/3,480 rasters), airborne/dust (54 frames, actual launch/landing/freeze/coalescing/expiry), world (308), feel/input and actual-script runtime/menu/selection/results/online regressions pass. Source syntax, eleven matching cache URLs and diff whitespace checks pass.
- Exported 24 before/24 after full native 640x360 scenes in the codex mailbox: actual third-punch body landings at ages 1/3/5/8 across all stages and both directions. Inspected courtyard age 1, Gallery age 3 and Observatory age 5 at 1x; the outlined ground burst is plainly larger and brighter, with bodies drawn in front. Runtime/title/selection/attract rasters exported; runtime frame matches v79 SHA256. These are memory-raster composites, not browser screenshots or motion.
- No browser retry after v77's unavailable access host. No human play/listening, native layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged broad full-match/art/audio/performance suites not repeated.
- Prior regression evidence and detailed previews remain in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/15:38, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. First contact and body landing now read distinctly; owner motion assessment should judge their rhythm. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
