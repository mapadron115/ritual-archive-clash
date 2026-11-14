# Handoff: Ritual Archive: Clash

## Current - version 76, script cache v=79 (2026-11-14)

All mailbox entries through 15:15 acted on/acknowledged. V75 committed by coordinator as a73c7d4, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change.

V76 fixes a remaining identity mismatch: time-stop notices called the owner P1/P2 while actor tags used YOU/CPU, CPU1/CPU2 or YOU/FOE. Notices now use the same role helper as tags/results. The longest label, CPU1 TIME STOP, fits the existing plaque at the same font size. Local P1/P2 wording is retained. No world-renderer, combat, input, AI, sound or networking changes. Eleven script URLs v=79.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, tests/time-stop.cjs. No add/commit attempt per 01:34/03:00; HEAD/base a73c7d4; never push. Ready for review/commit and owner assessment before publication. No design decision pending.

## Verification and limits

- V76 regression fails on v75 at actual P1 TIME STOP versus expected YOU TIME STOP. Passes 30 actual cast/mode/owner identity combinations, literal glyph/width checks, snapshots and all three stage compositions. Existing stop suite passes ten real lifecycles, 1,800 parallel-state ticks/rasters, 24 freeze holds and 52 composites, retaining expiry, KO/reset, Rewind exclusion and 75% stopped-time punch damage.
- Watch identity (18,000 parallel-state ticks/422 rasters/two swaps/90 endings), opening (210 timelines/30,660 ticks), damage readability (300 contacts/4,992 layouts), results (180 endings/4,500 rasters plus 60 score histories/180 consecutive draws), guard HUD/recovery, HUD (75), feel/input (eleven groups plus handlers) and runtime/menu/results/online regressions pass. Changed source/test syntax, eleven matching cache URLs and diff whitespace checks pass.
- Exported 102 before and 102 after 640x360 native scenes and 18 lifecycle sheets per version into the codex mailbox, plus runtime/title/selection/attract assets. Inspected Watch Courtyard before/after, AI Gallery CPU and guest Observatory YOU notices at 1x, all with crossed mirror actors and stacked status lanes. These are memory-raster composites with transient FX omitted in identity scenes, not browser screenshots, motion or play.
- No native browser retry this run after v74's unavailable access host. No human play/listening, browser layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged broad full-match/animation/pixel/stage/world/audio/performance suites not repeated.
- Prior regression evidence and detailed previews remain in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Retry native browser fight/move-list/results review when the surface works; remaining broad visual refinements follow. Watch identity and third-punch soles are addressed. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
