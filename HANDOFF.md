# Handoff: Ritual Archive: Clash

## Current - version 97, script cache v=100 (2026-11-15)

Mailbox through 15:31 acted on; final reread unchanged. V96 committed by coordinator as 6abc3b4 (not pushed). Acknowledged owner's publication of v1-v95 at 1dbd5a6, keeping AGENTS.md, and new authorized dive escape rule. Owner directly repeated autonomous check-in/report instructions; no other decision. All arenas remain closed.

V97 locks Howitzer's target at active tick 2 instead of 20, after the opening freeze. Contact stays tick 46: 44 warning ticks (733 ms), previously 26. Blast remains 155 units each side (310 wide), 190 high, 250 damage/100 guarded health damage. Full-gauge OR <=30% HP readiness, once-per-round use, descent, invulnerability and recovery unchanged. Reticle radius now matches actual 155 rather than 150; its existing six-phase countdown derives from the new 44-tick zone. Move explanation teaches moving/jumping clear. No other combat, AI, audio, roster, style or network change. Eleven URLs v=100.

Bram's actual cue-time movement covers 190.08 retreat / 216 forward / 230.25 directional-jump units in 44 ticks. Retreat delayed 8 ticks clears by 0.52, 9 ticks is hit; forward delayed 11 clears, 12 is hit; jump-away delayed 15 (250 ms) clears by 0.73, 16 is hit. There is no separate sprint input. Vertical jump remains caught (171.05 peak height <190); Gideon's slow backstep remains caught, while forward or jump-away at the cue escapes for all fifteen builds. Geometry/body pushes/facing matter; these are measured input timelines, not speed-only estimates or human balance claims.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/fighters2.js, tests/landing-warning.cjs, tests/dive-gap.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 6abc3b4; never pushed. Ready for coordinator review/commit and owner's feel/balance check before publication.

## Verification and limits

- New dive-gap regression: 222 actual Maximum/defender timelines, 23,310 parallel-state ticks, 12 freeze holds; fixed 6abc3b4 comparison proves old cue-time movement was caught. Both slots/full-gauge and low-HP readiness, all fifteen builds, walls, adjacent-tick cutoffs, exact tick-46 event, identical old/new stationary/guard contact snapshots, cost, locked target and JSON determinism pass.
- Landing-warning: all 44 ages, six phases, 180 edge/fractional crops, 18 native world/body/HUD composites (minimum 474 visible bright pixels), 10 real-input timelines, 60 freeze holds, cleanup/read-only/snapshot checks pass. Existing time-stop zone advance retained.
- Feel/input (eleven groups + keyboard handlers), full smoke (90 arts/30 ultimates/225 matches/1,147,397 ticks), Domain animation (30 timelines), world (308 frames), actual-script runtime/menu/input/results and online lifecycle pass. Syntax, eleven v100 URLs and diff whitespace pass.
- Inspected native courtyard P1 away-delay0 t46 before/after: v96 contacts and v97 clears; also inspected after away-delay8 t45 / delay9 t46. Gallery P2 t20 pair shows the earlier lock/countdown; Observatory P2 jumpAway-delay15/16 t46 shows escape/contact. Native pairs for both owners, three stages, five input timings and five active moments plus runtime/menu assets retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged stage/HUD/art/audio/performance suites not repeated. Owner must judge whether this reaction window feels suitably difficult; scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision needed for v97; leave this one-version run ready for coordinator commit.

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
