# Handoff: Ritual Archive: Clash

## Current - version 103, script cache v=106 (2026-11-15)

Mailbox through 16:18 acted on; final reread unchanged. V102 committed by coordinator as 5472545 (not pushed); coordinator reports owner published through v97 (53f628d). Owner directly repeated autonomous check-in/report instructions; no other decision. All arenas remain closed. Earlier implementation orders remain acted on. Rapid Slash's optional visibility note is deferred as directed.

V103 makes the final ten seconds conspicuous: a wider crimson clock panel, pale digits and inward warning markers replace the ordinary gold/navy clock from 600 ticks through 1. Steady, state-derived cue holds during hit-stop/freeze, agrees with snapshots and clears when the fight ends. Other HUD pixels and ordinary/result clocks stay identical. No simulation, event, damage, cost, movement, input, AI, audio, roster, style or network changes. Eleven script URLs v=106.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, tests/timer-warning.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 5472545; never pushed. Ready for coordinator review/commit and owner readability assessment before publication.

## Verification and limits

- New timer-warning regression: nine actual timeout/draw timelines; 5,949 parallel ticks; 937 read-only native HUD/snapshot checks across all builds, arenas and five modes; 24 hit-stop/freeze holds. Exact 601/600 and 1/0 boundaries, time-stop clock behavior, deadline outcomes and result cleanup pass. At least 1,876 changed warning pixels, confined to the clock area; 372 ordinary/result HUDs byte-identical to v102. Fixed v102 baseline fails on absent warning; --baseline --preview-only exports it.
- HUD (75 states), HUD learning (2,115 layouts), eligibility (36 real timelines), guard HUD/recovery, time-stop, watch identity, round results (180 timelines plus 180 consecutive draws), opening banners (210 timelines), feel/input and actual-script runtime/menu/input/results/online lifecycle pass. Source/test syntax, eleven matching v106 URLs and diff whitespace pass.
- Inspected native courtyard 600-tick before/after: gold clock becomes a broad crimson warning. Also inspected gallery Nell mirror at 60 ticks, observatory at 1 tick and subsequent TIME UP result. Thirty native before/after pairs across two fighter pairs, three arenas and five clock boundaries, plus time-up result retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged world/stage/full-match/individual art/audio/performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 still gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision for v103; leave this one-version run ready for coordinator commit.

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
