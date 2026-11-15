# Handoff: Ritual Archive: Clash

## Current - version 99, script cache v=102 (2026-11-15)

Mailbox through 15:46 acted on; final reread unchanged. V98 committed by coordinator as 25ee956 (not pushed); coordinator reports owner published through v97 (53f628d). Owner directly repeated autonomous check-in/report instructions; no other decision. All arenas remain closed. Earlier implementation orders remain acted on. Rapid Slash's optional visibility note is deferred as directed.

V99 replaces Dismantle/Cleave's static red baton across Karasu's arm with a shaded rose crescent ahead of the hand. It sweeps down and contracts behind both bodies through the existing nine-tick effect; Cleave is broader than Dismantle. Those two release events now carry facing in their previously unused b field, avoiding guesses from subsequent actor positions on either client. Original raster reflection keeps exact mirrors. No combat, projectile, contact, damage, cost, timing, input, AI, audio, roster, style or network rule changes. Every other slash-event user and other line effects remain identical. Eleven script URLs v=102.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/fighters.js, src/pixel-world.js, src/render.js, tests/slash-cue.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base 25ee956; never pushed. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New slash-cue regression: 32 actual Dismantle/Cleave hit/block/whiff/wall timelines, both slots/facings/mirror costumes, 672 ticks matching fixed v98 except the new effect-facing field; 480 native scene/snapshot checks and 32 serialized event replays. Clear occupied fighter pixels, minimum early whiff visibility 396 pixels, read-only state/effects, hard alpha, exact mirrors, sweep/contraction/expiry, 200 fractional/edge crops and simultaneous releases pass. Thirty-nine actual legacy-slash scenes and fifteen other effect scenes are byte-identical to v98. --baseline fails on reproduced body overlap; --baseline --preview-only exports fixed 25ee956 presentation.
- Rapid-trail (sixteen timelines, 240 native checks), world (308 frames), feel/input (eleven groups + keyboard handlers), actual-script runtime/menu/input/results and online lifecycle pass. Source/test syntax, eleven matching v102 URLs and diff whitespace pass.
- Inspected native courtyard P1 right Cleave whiff t3 before/after: the straight red baton becomes a bright curved sweep ahead of a clear forearm. Gallery P2 left Dismantle whiff t1, courtyard Cleave hit t3 and late whiff t8 inspected for facing, contact and contraction. Native pairs for both moves, all stages, slots, facings, hit/guard/whiff and ages 1/3/6/8, plus runtime/menu assets retained in codex mailbox. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC. Browser not retried. Unchanged stage, full-match, other individual art, HUD, audio/contact and performance suites not repeated. Scripts/stills do not count as played.

## Next priorities

Owner dive feel/readability notes take priority. V97 still gives 44 active warning ticks before tick-46 impact: 250 damage, 310-unit width, unchanged cost. Bram's retreat delayed 8 ticks escapes, 9 is hit; jump-away delayed 15 escapes, 16 is hit. Owner must judge the feel.

Otherwise continue first-minute fighter/hit/HUD/round-flow audit, one reproduced visible change and native before/after pair per version. Arenas stay closed. No pending decision for v99; leave this one-version run ready for coordinator commit.

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
