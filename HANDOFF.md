# Handoff: Ritual Archive: Clash

## Current - version 89, script cache v=92 (2026-11-14)

All mailbox entries through 17:59 acted on/acknowledged. V88 committed by coordinator as e75d367, not pushed. Owner's direct check-in repeats autonomous work/mailbox/report instructions; no new design decision.

V89 follows the arena audit and reproduces the coordinator's edge-on cartwheel observation: the Observatory now has a second, fixed angled brass meridian, retaining an open globe shape as its moving hoop turns edge-on. The ring is built once into the existing static stage surface, behind the moving hoop, axle, hub and fighters. No extra retained surfaces, clock or combat/input/audio/AI/network changes. Eleven script URLs v=92.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-stage.js, tests/observatory-globe.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base e75d367; never push. Candidate for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New globe regression first fails with the meridian suppressed (no enclosed aperture); final passes 48 stage frames and 270 native edge-on fight snapshots across all fifteen mirror matches, both directions and idle/air/guard. Checks a 4,337-pixel enclosed opening, at least 1,297 changed stage pixels / 1,016 changed fight pixels, 1,535,424 unchanged fighter pixels, hard alpha, fixed floor/other scenery, read-only state, JSON snapshots and cache/loop identity. Suppression keeps the baseline useful after commit.
- Existing hoop suite passes 498 stage/fight frames; 3,110 open/edge-on changed instrument pixels, seam/mid-turn differences 724/1,982, maximum lit rim step <=12 px. Stage motion passes 48 opaque frames, six two-cycle input timelines, fixed floors, snapshots/outcomes, clock/freeze behavior, masked rain and bounded caches; pointer centroid max step remains 9.12 px. Stage suite passes 48 frames/45 Domain combinations; world (308), feel/input and actual-script runtime/menu/selection/results/online lifecycle suites pass. Source/test syntax, eleven v92 URLs and diff whitespace pass.
- Native stage audit previews: Isolde, Nell and Greta across the three stages were inspected at 1x; no reproduced costume/background contrast fault was selected. V89 before/after native 640x360 HUD/fight pairs and full sixteen-phase instrument contact sheets are in the mailbox. Inspected ch0-idle-right-p8 before/after, ch0-idle-left-p8 before/after, ch14-air-left-p7, ch14-guard-right-p9 and the after-loop sheet at 1x. Fixed ellipse stays visibly open behind the edge-on hoop; bodies stay in front. Runtime/selection/title/attract rasters also retained. These are memory rasters, not browser screenshots or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Browser not retried this static pass. Unchanged full-match, individual move/art, audio, contact and performance suites not repeated. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound; coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor images count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/12:21, select only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. The staged native audit found no obvious costume/value issue in the sampled scenes; inspect crowded actual-input approaches and close hit exchanges next, changing only a reproduced gap. Review the Observatory in motion and recent contact/ground/air-kick cues before further tuning. Retry native browser fight/move-list/results review when the surface works. No speculative balance/audio changes. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
