# Handoff: Ritual Archive: Clash

## Current - version 105, script cache v=108 (2026-11-15)

Mailbox through 16:36 read and acknowledged. V104 accepted/committed as 45af126 (not pushed). Owner directly repeated autonomous check-in/report instructions. New coordinator relayed the owner's separate mobile-game order during v105: mobile takes priority from v106; details below. Coordinator reports owner published through v97 (53f628d). Arenas stay closed; Rapid Slash's optional visibility note remains deferred.

V105 makes rejected-art feedback visible: the existing actor-wide nope effect gives unavailable cards a crimson field, pale two-pixel rails and brighter existing text. Previously only two thin horizontal lines changed. Ready cards and other actors stay clear; cooldown/progress bars, complete names, reasons and existing eighteen-update lifecycle are retained. Ordinary HUDs and all pixels outside affected cards stay identical to v104. No simulation/event, damage, cost, movement, input, AI, audio, roster, style or network changes. Eleven script URLs v=108.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, tests/art-denial.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 45af126; never pushed. Ready for review/commit and owner readability assessment before publication.

## Verification and limits

- New art-denial regression: 196 real rejected-command timelines across fifteen builds/both slots (energy, cooldown, HP and setup), 3,724 parallel ticks, 992 read-only native HUD/snapshot-with-FX checks. Actual events, held-key suppression, all eighteen effect updates, expiry, both actors, five modes, ready-card transitions and used Domains pass. At least 2,472 changed pixels per affected card; 393 ordinary HUDs byte-identical to v104. Fixed v104 baseline fails on absent feedback; --baseline --preview-only exports it.
- HUD (75 states), HUD learning (2,115 layouts), eligibility (36 real timelines), health warning (90 timelines/2,262 checks), guard HUD/recovery, timer warning (nine deadlines/937 checks), feel/input and actual-script runtime/menu/input/results/online lifecycle pass. Source/test syntax and diff whitespace pass. Eleven matching v108 URLs verified.
- Inspected native courtyard low-CE before/after: unavailable cards now read crimson at a glance. Also inspected gallery P2 low CE, courtyard Nell missing nail (ready Nail Projectile stays clear), and observatory Mirela low HP (ready Maximum stays clear). Eighteen native pairs across three arenas, both slots and three fighter pairs retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged world/stage/full-match/individual art/audio/performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

V106 priority: separate phone-browser Clash in mobile/, mobile/index.html, with its own touch input, layout and menus. Share existing simulation/fighters/art read-only; preserve the desktop game. Start with thumb-sized multitouch movement/jump/guard and attack/art/Domain controls, then landscape fitting, portrait rotation card and safe areas; touch menus/CPU/online; installable manifest/icons last. Script real pointer input including simultaneous movement/attack; inspect 844x390, 667x375 and portrait stills. No real phone available. No app-store packaging. Mobile comes first until a phone match can run start to finish, then alternate mobile and web-audit versions. Read the full 16:36 order before v106. One visible change per version; no decision pending for v105.

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
