# Handoff: Ritual Archive: Clash

## Current - version 117 WEB/cache v=120; mobile v116/cache v=119 (2026-11-15)

Mailbox through 18:47 read/acted on; reread at completion, unchanged. V116 committed/live as 0ecd0d7. V117 follows the ordered change from HUD/cues to the fighters: one reproduced grounded-hit animation gap. Alternate web/mobile; owner phone feedback jumps the queue. V118 MOBILE must measure a busy fight's real mobile-renderer frame cost (Domains, sparks, dust, trails), cut the heaviest reproduced cost without changing the look, or report cheap timings and choose another phone-specific gap. Arenas, optional Rapid Slash and mobile cluster placement/opacity remain deferred.

Reproduced on v116: an actual jab's grounded victim has only hit/hitrecover, two similar backward leans. The new audit fails the phase/silhouette group before the fix. Native before strips show the stiff reaction; this is script/raster evidence, not browser observation or play.

Desktop-only src/desktop-animation.js adds a head/shoulder snap with dropped arms, a low folded brace, then a rising return. Selection uses the existing serialized stT countdown (>10, >5, final 5); short recoveries start at their corresponding later phase. Freezes/time stops hold it, repeat hits use the refreshed countdown, and snapshots need no prior event. Airborne hits, knockdowns, guard, attacks, casts and portraits delegate unchanged. Shared pixel.js adds only optional pose.planted support to the existing ankle rule so the three new poses keep heavy calves inside their boots. All 4,020 existing build/costume sprites remain byte-identical; mobile does not load the adapter. No combat, timing, input, roster, sound or style change. All thirteen desktop script URLs use v=120; mobile stays v=119.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel.js, src/desktop-animation.js (new), tests/ground-hit.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs. HEAD/base 0ecd0d75aa5605fffb63dbc2d8017eaba41e7ae1; no commit attempt per 01:34/03:00. Never pushed. Owner directly repeated autonomous check-in/report instructions, without new design direction.

## Verification and limits

- node tests/ground-hit.cjs --out=PATH: three groups pass; 8,670 timeline ticks, 4,680 read-only body rasters, 2,700 freeze-held pose checks, 4,020 byte-identical existing sprites. Actual jab input connects across all fifteen builds, both costumes and facings and produces three distinct silhouettes. Additional actual hit timelines cover 8/15/16/22/40 recovery ticks, paired controls, event-free snapshots, floor/clipping checks, hit-stop/cinematic/time-stop holds and unchanged non-ground-hit states/portraits. Fixed v116 --baseline --preview-only fails only the animation group (two poses); other two groups pass.
- node tests/runtime.cjs passes actual thirteen-script boot/menu/input/results/online checks plus new real keyboard-to-hit animation painting in AI/local/host loops and three event-free guest snapshots. node tests/desktop-guard.cjs, desktop-domain.cjs, mobile-guard.cjs, mobile-install.cjs, feel.cjs, animation.cjs and airborne.cjs pass. Imported mobile harness completes CPU match/results/rematch/title in 2,943 frames (long match skips raster uploads), with existing upper-HUD identity, labels, targets/gaps and safe-area checks. Baseline HUD tests exclude the new desktop adapter from their old/shared script sets; no assertion relaxed. Syntax and diff checks pass. mobile/, simulation, fighters, AI, main.js and render.js unchanged. Unchanged full-world/art/stage/audio/performance suites not repeated.
- Before/after previews in codex mailbox: 96 native 640x360 scenes and sixteen six-frame strips, actual jab/kick timelines, Isolde main/right and Greta mirror/left, courtyard/gallery. Inspected Isolde jab before/after, folded brace, Greta mirrored kick and full jab strips at native scene size. Export: node tests/ground-hit.cjs --baseline --preview-only --out=PATH, then current --out=PATH. These are exact renderer stills, not browser screenshots or motion checks.
- No browser/phone, motion/FPS/latency, physical touch/keyboard, audible sound, native focus/CSS, OS lifecycle/install, two-device WebRTC or owner play checked. Script-tested is not played. Owner check: take ordinary unblocked jabs and kicks; the head should snap back, body fold, then rise without changing when controls return. Check light/heavy builds and both directions. Short hit recoveries intentionally enter the later pose rather than extending stun.

## Next priorities

V117 ready for coordinator review/commit/publication under 18:47. Next v118 MOBILE frame-cost audit as above, using the actual mobile renderer path and reporting machine/timing limits honestly; no phone performance claim from Node timings. No decision needed; one-version run ready for coordinator commit.

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
