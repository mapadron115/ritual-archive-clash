# Handoff: Ritual Archive: Clash

## Current - version 127 WEB/cache v=130; mobile v126/cache v=129 (2026-11-16 UTC)

Mailbox through 21:10 read/acted on; v126 committed/live as cc124a8. Owner directly repeated autonomous check-in/report instructions; no new design direction. One version per run; coordinator commits; never push. No new iPhone retest result; that still takes priority.

V127 replaces Oren's static twelve-tick late Resounding Voice tell with a drawn-back inhale at Domain ticks 12-19 and a lower planted brace at 20-23. Existing tick-24 word/open-mouth release, health cost, hit/guard/miss and recovery stay exact. Two original poses and one branch extend desktop-maximum.js, selected only by serialized Domain age. No new clock/event/state. All fourteen desktop script URLs use v=130; mobile remains v=129. Mobile and every other src file unchanged. No combat-rule, damage, timing, roster/name, style, audio, effects, dependency or installation changes.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-maximum.js, tests/voice-body.cjs (new), tests/maximum-body.cjs, tests/runtime.cjs. HEAD/base cc124a8b10a4af3bbc7ee369163c1f582db57dd5. No add/commit attempt per 01:34/03:00; never pushed. Ready for coordinator review/commit/publication.

## Verification and limits

- voice-body: four groups pass, 1,940 parallel ticks, 3,928 rasters, 384 freeze holds, 8,296 unchanged-default/sprite checks and sixteen changed native worlds. Both slots/facings; hit, guard and disoriented rear-facing miss; exact tick-24 word, 40 self HP / 230 hit / 92 guard / zero miss damage. Complete simulation equality, read-only drawing, event-free snapshots, interruption/portrait/other-owner/clash/round fallback, hard alpha, <=24 colors, sprite/ground bounds and unchanged effects/defaults pass.
- --baseline --preview-only omits only this voice branch while retaining Nuclear Shell and Everything I Have: reproduces the static-body failure; the other three groups pass. Preview-only deliberately permits this failure to export before strips.
- maximum-body and allout-body pass. The former's unrelated-Domain check now excludes only the additional intentional voice window, covered by voice-body. Desktop-domain (525 read-only HUD checks), desktop-guard (2,713 HUD checks / 26,114 parallel ticks), mobile-install and feel pass. Syntax and git diff --check pass. Diff confirms mobile and all other src files unchanged. Complete runtime PASS: actual fourteen-script HTML boot, menus/input/results/rematch/online, earlier hit/summon/Nuclear Shell/allout paths, and new voice AI/local/host keyboard frames plus sixteen event-free guest snapshots.
- Forty PNGs in the mailbox: courtyard/main/right and Gallery/mirror/left, before/after eight native 640x360 scenes, full-scene strips and body strips. Inspected main before/after body strips, mirror after strip and tick-20 native full-scene pair. Export: node tests/voice-body.cjs --baseline --preview-only --out=PATH, then node tests/voice-body.cjs --out=PATH. Exact renderer stills, not browser screenshots or observed motion.
- Initial test fixtures exposed auto-facing defeating a rear miss and the unchanged resonator extending beyond the fighter cell. The rear case now uses existing disorientation; bounds are checked on the raw body while full-world differences still include all effects. No production change was needed for those fixture corrections.
- Unchanged historical art/stage/world/audio/animation and mobile runtime/performance/presentation/diagnostics suites not repeated. No performance claim. No browser/phone, physical touch/keys, observed motion/FPS/latency, audible audio, native CSS/events/focus, OS install/lifecycle, two-device WebRTC or owner play. Script-tested is not played. iPhone frozen-world cause remains UNCONFIRMED; separate buffers/opaque fill remain a mitigation awaiting device retest.
- Next v128 MOBILE: bring the later Maximum body poses to phone with phone-size strips and a frame-cost comparison, desktop unchanged, under the 18:58 fighter-animation clarification. Phone retest jumps the queue. Arenas, optional Rapid Slash and control-cluster placement/opacity remain deferred.

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
