# Handoff: Ritual Archive: Clash

## Current - version 91, script cache v=94 (2026-11-14)

Mailbox through 19:21 acted on/acknowledged; final reread unchanged. V90 committed by coordinator as 32cabff, not pushed. Owner directly repeated autonomous check-in/mailbox/report instructions, with no new design decision. Observatory remains closed. One version this run; Gallery audit next.

V91 corrects the Courtyard banner hem as requested: cloth extends 32 native pixels farther, from y221 to y253, to reach waist height, and ends in two pointed swallowtails with an open notch. Both tips follow the travelling fold; pinned upper cloth/emblems remain byte-identical to v90 through y210. Sixteen-phase/128-tick clock, surface/cache budgets and foreground fighter layering retained. No combat/input/audio/AI/network changes. Eleven script URLs v=94.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-stage.js, tests/courtyard-banners.cjs, tests/courtyard-hem.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 32cabff; never push. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New courtyard-hem regression fails with --baseline on v90 (full-length pointed hem missing); final passes 48 stage frames and 72 native mirror scenes (Isolde, Nell and Greta; both directions; idle/air/guard; four phases). At least 1,454 changed cloth pixels per stage frame; pointed hem moves through a 15-pixel span, maximum adjacent step 3 pixels including wrap. Checks two narrow tips/open notch in both banners in all phases, unchanged upper cloth, hard alpha, fixed other scenery/floor/arenas, cache/loop identity, read-only state, JSON snapshots and 440,304 unchanged fighter pixels.
- Existing courtyard-banners passes after extending its allowed cloth bounds and preview crop to the new hem. Stage-motion passes 48 frames/six two-cycle input timelines/snapshots/outcomes/global-clock pause behavior/rain masking/bounded caches. Stage passes 48 frames/45 Domain combinations. World (308 frames), feel/input (eleven groups and keyboard handlers), actual-script runtime/menu/selection/results/online lifecycle, source/test syntax, eleven v94 script URLs and diff whitespace pass.
- Native 640x360 v91-before/after-courtyard-p0/p4/p8/p12.png, Greta air/guard pairs in both directions and before/after sixteen-phase cloth sheets are in the codex mailbox. Inspected the exact p4 pair, after p12, after ch14-air-left-p8, after ch14-guard-right-p4 and after-cloth-loop at 1x. Hems reach the requested height and stay behind bodies. Runtime/menu rasters retained. These are generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC check. Browser not retried. Unchanged full-match, individual move/art, audio/contact and performance suites not repeated. Last full-match smoke: 225 matchups/1,169,896 ticks. Neither scripts nor images count as owner play.

## Next priorities

Gallery first-minute arena motion/readability audit, as ordered at 19:21; choose one reproduced gap plainly visible in full native before/after scenes at 1x. Owner first-minute readability/feel/listening notes take priority. Observatory is finished per 19:06. No speculative balance/audio changes. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
