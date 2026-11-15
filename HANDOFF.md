# Handoff: Ritual Archive: Clash

## Current - version 101, script cache v=104 (2026-11-15)

Mailbox through 16:04 acted on; final reread unchanged. V100 committed by coordinator as 04be1ca (not pushed); coordinator reports owner published through v97 (53f628d). Owner directly repeated autonomous check-in/report instructions; no other decision. All arenas remain closed. Earlier implementation orders remain acted on. Rapid Slash's optional visibility note is deferred as directed.

V101 moves the beam draw pass immediately before both fighter bodies. Reproduced Nuclear Shell hiding almost the entire launched or guarding defender at 1x; the full reaction now stays readable inside its cone. Applies to Granite Blast, Piercing Blood, AP Shot, Nuclear Shell and Convergence. Beam geometry, materials, clocks and contact effects stay unchanged. Outside occupied fighter pixels, scenes remain byte-identical to v100. No simulation, event, damage, cost, movement, input, AI, audio, roster, style or network changes. Eleven script URLs v=104.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/beam-layering.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 04be1ca; never pushed. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New beam-layering regression: 60 actual hit/guard/wall timelines across five beam families, both slots/facings/mirror costumes; 4,856 ticks exactly matching fixed v100 04be1ca; 720 native scene/snapshot checks. Clear occupied body pixels, unchanged pixels outside bodies, read-only state/effects, full lifecycle/expiry, visible lanes (minimum 1,276 pixels), 809,676 revealed body pixels across sampled scenes and 18 byte-identical non-beam scenes pass. --baseline fails on reproduced occlusion; --baseline --preview-only exports fixed v100 presentation.
- Contact-readability (240 actual timelines, 3,480 native scenes/snapshots), beams (184 hard-alpha mirrored frames, ten real timelines, 60 freeze holds), Maximum charge and Convergence charge (six real timelines and 156 freeze holds each), world (308 frames), feel/input (eleven groups + keyboard handlers), actual-script runtime/menu/input/results and online lifecycle pass. Source/test syntax, eleven matching v104 URLs and diff whitespace pass.
- Inspected native courtyard P1 right Nuclear Shell hit t4 before/after: an almost invisible defender becomes a complete launched silhouette inside the unchanged cone. Also inspected gallery P2 left Nuclear Shell guard t8 before/after: the hidden defender now visibly guards. Inspected gallery P2 left Piercing Blood guard t4 pair for the narrower ribbons. Native pairs for all five beams, three stages, P1 right hits and P2 left guards, ages 1/4/8/final retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged stage, full-match, unrelated art/HUD/audio and performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 still gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision for v101; leave this one-version run ready for coordinator commit.

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
