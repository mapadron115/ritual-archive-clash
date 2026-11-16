# Handoff: Ritual Archive: Clash

## Current - version 119 WEB/cache v=122; mobile v118/cache v=121 (2026-11-16 UTC)

Mailbox through 19:12 read/acted on; reread at completion, unchanged. V118 committed/live as 5b13f98. V119 completes the ordered desktop anticipation/release pass. Owner directly repeated autonomous check-in/report instructions without new design direction. One version per run; alternate web/mobile; owner phone feedback jumps the queue. V120 MOBILE or later should load the approved fighter-animation adapter, with mobile regressions and phone-size strips, per 18:58. Arenas, optional Rapid Slash and mobile cluster placement/opacity stay deferred.

Reproduced: Divine Dogs, Nue and Toad use the identical sign body during final startup (mt 6-11) and summon release (mt 12-14). Actual input/summon timelines fail two new audit groups; unrelated/default checks pass. V119 adds summoncoil and summonseal in src/desktop-animation.js: lower the joined hands and body, then lift the seal on the real release tick. Existing gather, recoil and settle remain. Only those three art IDs select the new poses; other sign arts and Domain casts retain their existing bodies. Serialized mt is the clock; hit-stop, cinematic/time stops and event-free snapshots retain the correct pose. Existing planted-sole support keeps calves above the floor.

No combat-rule, timing, cost, damage, hitbox, input/buffer, summon effect, sound, roster, naming, transport or style change. Mobile and shared game/render sources remain byte-identical. All thirteen desktop scripts bumped to v=122; mobile stays v=121. No dependency/installation.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-animation.js, tests/runtime.cjs, tests/summon-cast.cjs (new). HEAD/base 5b13f9882376125fd7f5cbd6af5077307e3df27b; no commit attempt per 01:34/03:00. Never pushed.

## Verification and limits

- node tests/summon-cast.cjs --out=PATH passes four groups: actual inputs for all three arts in both slots/directions, release at tick 12, five body phases, unchanged recovery/cost/summon outcomes via parallel simulations, 380 timeline ticks, 928 read-only body/world rasters, 216 freeze-held checks, event-free snapshots, floor/clipping bounds, interruptions and round reset. 7,944 default checks include all 4,110 pre-existing build/costume sprites, unrelated art phases/states and portraits. Across 96 native world comparisons, 48 changed scenes differ only inside the summoner; 48 gather/recovery scenes are identical. --baseline --preview-only reproduces the two v118 animation failures and passes the other two groups.
- runtime passes its real thirteen-script menus/input/results/rematch/online suite, including all three summons through keyboard/AI/local/host frames and fifteen event-free guest snapshot paintings. ground-hit, desktop-guard, desktop-domain, mobile-guard, mobile-install, feel, art-animation, cast-animation and domain-animation pass. Mobile harness completes CPU match/results/rematch/title in 3,069 frames (long match skips raster uploads), synthetic multitouch, safe-area/target checks, all 45 arts and 20,697 paired guard ticks. Syntax and git diff --check pass. Unchanged full world/stage/performance/audio suites not repeated.
- 64 mailbox PNGs: before/after native 640x360 scenes, six-frame full-scene strips, and native 144x128 body-cell strips for three arts on the Courtyard and mirrored Dogs on the Gallery. Presentation particles use the same deterministic seed in each pair; simulation RNG unchanged. Inspected Dogs before/after body strips, full scenes at mt 11/12 on both stages, and Nue release at 1x. These are exact renderer stills, not browser screenshots or observed motion. Export baseline and candidate with node tests/summon-cast.cjs [--baseline --preview-only] --out=PATH.
- Not checked: browser/phone, physical keyboard/touch, motion/FPS/latency, audible sound, native focus/events/CSS, OS lifecycle/install, two-device WebRTC or owner play. Script-tested is not played. Owner check: cast all three summons; the low preparation should visibly rise at appearance, then settle with unchanged responsiveness. Check guest and mirror palette too.

## Next priorities

V119 ready for coordinator review/commit/publication under 19:12. No decision needed. Next v120 MOBILE: load approved fighter-animation adapter (grounded injury plus summon gesture) without desktop HUD/input adapters; use mobile suite and phone-size strips. Phone performance/physical play remain owner's checks; v118's Node CPU optimization does not establish phone FPS.

Owner dive feel notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
