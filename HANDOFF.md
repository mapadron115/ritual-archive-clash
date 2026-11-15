# Handoff: Ritual Archive: Clash

## Current - version 90, script cache v=93 (2026-11-14)

Mailbox through 19:06 acted on/acknowledged. V89 committed by coordinator as c048d13, not pushed. Observatory closed by coordinator: do not tune it again. Owner's direct check-in repeats autonomous work/mailbox/report instructions; no new design decision.

V90 is one Courtyard atmosphere change: banners now have a travelling broad shaded fold, pinned tops, visibly swaying free hems and emblems that follow the cloth. Existing sixteen-phase / 128-tick clock and caches retained. No combat/input/audio/AI/network changes. Eleven script URLs v=93.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-stage.js, tests/courtyard-banners.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base c048d13; never push. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New courtyard-banners regression fails with --baseline (old cloth remains too subtle); final passes 48 stage frames and 72 native mirror scenes (Isolde, Nell and Greta; both directions; idle/air/guard; four phases). At least 1,614 changed cloth pixels per stage frame, 14-pixel hem span, maximum adjacent hem step 3 pixels including wrap. Checks pinned top, hard alpha, fixed floor/other scenery/other arenas, loop/cache identity, read-only state, JSON snapshots and 440,304 unchanged fighter pixels.
- Stage-motion passes 48 frames, six two-cycle input timelines, snapshots/outcomes, clock/freeze behavior, masked forward rain and bounded caches. Stage suite passes 48 frames/45 Domain combinations; world (308), feel/input and actual-script runtime/menu/selection/results/online lifecycle suites pass. Source/test syntax, eleven v93 URLs and diff whitespace pass.
- Native 640x360 before/after HUD/fight pairs at phases 0/4/8/12 plus full sixteen-phase cloth sheets are in the codex mailbox. Inspected v90-before/after-courtyard-p4.png and -p12.png and v90-after-cloth-loop.png at 1x. Broad folds and bent hems read beside both costumes; cloth remains behind bodies. These are generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC check. Browser not retried. Unchanged full-match, individual move/art, audio/contact and performance suites not repeated. Last full-match smoke: 225 matchups/1,169,896 ticks. Neither scripts nor images count as owner play.

## Next priorities

Owner first-minute readability/feel/listening notes take priority. Continue Gallery or crowded actual-input approaches/close hit exchanges, selecting one reproduced gap visible in full native before/after scenes at 1x. Observatory is finished per 19:06. No speculative balance/audio changes. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
