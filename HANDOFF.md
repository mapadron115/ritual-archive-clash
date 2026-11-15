# Handoff: Ritual Archive: Clash

## Current - version 104, script cache v=107 (2026-11-15)

Mailbox through 16:25 acted on; final reread unchanged. v103 accepted/committed by coordinator as 6c176e3 (not pushed). Coordinator reports owner published through v97 (53f628d). Owner directly repeated autonomous check-in/report instructions; no new design decision. All arenas stay closed; Rapid Slash's optional visibility note remains deferred.

V104 makes low health visible across the whole bar: at positive HP <=30% during a fight, a crimson empty lane, broad rose rails and pale end caps frame the existing amber fill. The frame remains conspicuous even under a full recent-damage bar. State-derived and steady through pauses/snapshots; clears above the threshold and on round end. Actual HP/ghost fill lengths and colors, ordinary/result HUDs and other pixels stay identical to v103. No simulation/event, damage, cost, movement, input, AI, audio, roster, style or network changes. Eleven script URLs v=107.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, tests/health-warning.cjs (new), tests/timer-warning.cjs. The timer test retains its fixed v102 clock reference and delegates only the now-changed low-health lanes to the dedicated health regression. No add/commit attempt per 01:34/03:00; HEAD/base 6c176e3; never pushed. Ready for review/commit and owner readability assessment before publication.

## Verification and limits

- New health regression: 90 actual hit/chip/KO timelines across all fifteen builds and both slots; 6,750 parallel ticks; 2,262 read-only native HUD/snapshot checks in five modes; eight pause holds. Exact 30% boundary, differing max HP, almost empty/full ghost, both sides low, stacked statuses and non-fight cleanup pass. Health/ghost fill pixels stay identical. At least 978 changed warning pixels per low-health lane; 1,292 ordinary/result HUDs byte-identical to v103. Fixed v103 baseline fails on absent warning; --baseline --preview-only exports it.
- HUD (75 states), HUD learning (2,115 layouts), eligibility (36 real timelines), guard HUD/recovery, timer warning (nine deadlines/937 HUD checks), feel/input and actual-script runtime/menu/input/results/online lifecycle pass. Round results (180 KO/timeout/draw timelines plus 180 consecutive draws), source/test syntax, eleven matching v107 URLs and diff whitespace pass.
- Inspected courtyard native before/after P1 recovered low-health mirror: amber sliver gains a broad crimson/pale frame. Also inspected gallery stacked-status, two-side one-percent fixture with time-stop/Domain and final-ten-second clock warning. Nine native pairs across three arenas, both slots and two fighter pairs retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged world/stage/full-match/individual art/audio/performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision for v104; leave this one-version run ready for coordinator commit.

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
