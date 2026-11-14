# Handoff: Ritual Archive: Clash

## Current - version 75, script cache v=78 (2026-11-14)

All mailbox entries through 15:05 acted on/acknowledged. V74 committed by coordinator as ef66ad7, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change.

V75 fixes ambiguous Watch identities: both fighters were tagged CPU, while results called them P1/P2. Numbered CPU1/CPU2 now follow the actors through position swaps and identify winners and scores in round/match results, including mirrors. Uses one role helper for tags and results. The compact form fits the existing opening plaques and damage exclusions; no world-renderer, combat, input, AI, sound or networking changes. Eleven script URLs v=78.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, tests/opening-banner.cjs, tests/readability.cjs, tests/watch-identity.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base ef66ad7; never push. Ready for review/commit and owner assessment before publication. No design decision pending.

## Verification and limits

- V75 regression fails against committed v74 (P1/P2 result roles versus numbered computer identities). Passes 18,000 parallel-state Watch ticks, 422 read-only actor/snapshot rasters across all builds/mirrors/stages/edges/airborne lanes, two actual position swaps and 90 actual KO/timeout/draw endings with complete winner names, scores and match-screen identities. Other real mode roles unchanged.
- Opening checks now reserve the widest CPU1 tag: 210 actual timelines/30,660 parallel ticks/24,154 clear layouts. Damage readability now checks both local and Watch modes: 300 contact timelines/4,992 raster/layout checks. Damage stacks (18 timelines/11,700 layouts), results (180 endings/4,500 rasters plus 60 score histories/180 consecutive draws), HUD learning (2,115 states/90 art inputs/60 Domain uses), HUD (75), feel/input (eleven groups plus handlers) and runtime/menu/results/online regressions pass. Changed source/test syntax, eleven matching cache URLs and diff whitespace checks pass.
- Exported nine before and nine final after 640x360 native scenes into the codex mailbox, plus runtime/title/selection/attract assets. Inspected courtyard mirrors before/after, Gallery crossed mirrors and Observatory mirror results at 1x. These are memory-raster composites with transient FX omitted, not browser screenshots, motion or play.
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
