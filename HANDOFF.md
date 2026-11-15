# Handoff: Ritual Archive: Clash

## Current - version 98, script cache v=101 (2026-11-15)

Mailbox through 15:41 acted on; final reread unchanged. V97 committed by coordinator as 53f628d (not pushed). Owner directly repeated autonomous check-in/report instructions; no other decision. All arenas remain closed. Earlier implementation orders remain acted on.

V98 replaces Rapid Slash's static cyan bar across both fighters' waists with three shaded, pointed ribbons behind both bodies. They contract toward the destination; the outer ribbons clear at age 8 and the last remnant expires at the existing age 12. Local raster/reflection keeps exact facing mirrors; zero-distance wall events draw nothing. The existing event endpoints and FX age drive the cue. No combat, travel, contact, damage, cost, timing, input, AI, audio, roster, style or network rule changes. Other line effects remain identical. Eleven script URLs v=101.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, src/render.js, tests/rapid-trail.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 53f628d; never pushed. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New rapid-trail regression: sixteen actual Rapid Slash hit/block/whiff/wall timelines, both slots/facings/mirror costumes, 352 ticks exactly matching fixed v97 combat; 240 native scene/snapshot checks. Clear occupied fighter pixels, minimum early whiff visibility 761 pixels, read-only state/effects, hard alpha, exact mirrors, contraction/expiry, 120 fractional/edge crops and zero-distance safety pass. Twelve non-dash (slash/rain/cuts/swap) stage comparisons are byte-identical to v97. --baseline fails first on the reproduced body overlap; --baseline --preview-only exports exact fixed 53f628d presentation.
- World (308 frames), feel/input (eleven groups + keyboard handlers), actual-script runtime/menu/input/results and online lifecycle pass. Source/test syntax, eleven matching v101 URLs and diff whitespace pass.
- Inspected native courtyard P1 right hit t4 before/after: cyan waist bar becomes a shaded path behind the bodies; gallery P2 left whiff t1 and courtyard P1 right whiff t8 after show early trail and later contraction. Native before/after scenes for all stages, slots, facings, four contact/travel cases and ages 1/4/8/11, plus runtime/menu assets retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged stage, full-match, individual art, HUD, audio/contact and performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 still gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision for v98; leave this one-version run ready for coordinator commit.

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
