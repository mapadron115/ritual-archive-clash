# Handoff: Ritual Archive: Clash

## Current - version 102, script cache v=105 (2026-11-15)

Mailbox through 16:11 acted on; final reread unchanged. V101 committed by coordinator as bbf19d0 (not pushed); coordinator reports owner published through v97 (53f628d). Owner directly repeated autonomous check-in/report instructions; no other decision. All arenas remain closed. Earlier implementation orders remain acted on. Rapid Slash's optional visibility note is deferred as directed.

V102 makes ordinary jump takeoffs register at native size. Two tiny floor wedges/specks become low, outlined pale dust plumes with rounded caps that spread, shrink and dim on the existing twelve-tick FX clock, behind both bodies. Narrower than the unchanged landing cloud. No simulation, event, damage, cost, movement, input, AI, audio, roster, style or network changes. Eleven script URLs v=105.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/takeoff-dust.cjs (new), tests/landing-dust.cjs, tests/floor-impact.cjs. The older suites defer takeoff appearance to its new dedicated regression; their landing/thud assertions remain. No add/commit attempt per 01:34/03:00; HEAD/base bbf19d0; never pushed. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New takeoff-dust regression: 90 actual straight/left/right jump-to-landing timelines across all fifteen builds, both slots/mirror costumes; 3,420 ticks exactly matching fixed v101 bbf19d0; 570 native scene/snapshot checks. Read-only state/effects, clear bodies, hard alpha, exact symmetry, outward travel, contraction/expiry, 60 fractional/edge crops and 126 byte-identical landing/thud scenes pass. Minimum early visibility 276 pixels; baseline fails at 104. --baseline --preview-only exports fixed v101.
- Landing dust (90 timelines, 684 native checks), floor impact (60 timelines, 420 native checks), airborne reactions (54 dust frames plus actual input/freeze/coalescing/expiry), world (308 frames), feel/input (eleven groups + keyboard handlers), actual-script runtime/menu/input/results and online lifecycle pass. Source/test syntax, eleven matching v105 URLs and diff whitespace pass.
- Inspected native courtyard Isolde P1 takeoff t1 before/after and gallery Greta P2 t3 before/after: nearly invisible wedges/specks become distinct low pale plumes. Also inspected observatory Isolde t6 and courtyard t11; they spread, dim and disperse. Forty-eight native pairs across two builds, all three stages, both slots and ages 1/3/6/11 retained in codex mailbox, plus runtime/menu assets. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged stage, full-match, individual art/beam/HUD/audio and performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 still gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision for v102; leave this one-version run ready for coordinator commit.

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
