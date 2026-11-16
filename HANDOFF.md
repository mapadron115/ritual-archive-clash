# Handoff: Ritual Archive: Clash

## Current - version 121 MOBILE/cache v=124; desktop v119/cache v=122 (2026-11-16 UTC)

Mailbox through 19:45 read/acted on, reread unchanged at completion. V120 committed/live as 6f5e739. Owner directly repeated autonomous check-in/report instructions, no new design direction. One version per run; coordinator commits; never push.

V121 delivers the requested early mobile-only error display. It precedes all game scripts, stays hidden on clean runs, retains the first uncaught error/resource-load failure/unhandled rejection, and shows message, first stack frame (WebKit/V8), viewport/DPR and backing dimensions. Console reporting stays enabled. All fifteen mobile scripts and linked resources use v=124; desktop remains v=122. No rendering/gameplay/animation/input/audio source changed.

UNRESOLVED: owner's iPhone 12 mini / iOS 26.5 frozen world, falling HP and smeared CPU labels. Not reproduced in the memory-canvas runtime; no native browser or WebKit/device test available (CUA browser inventory says browser access host unavailable). Per 19:33, ship diagnostics with evidence, without claiming a fix or adding old-iOS fallbacks. Next: coordinator review/publication and the owner's phone retest; an error screenshot can identify a JS failure. If freezing persists with no overlay, investigate native canvas/compositor/context loss using device evidence; this overlay cannot detect silent failed uploads. No speculative renderer rewrite made.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, mobile/mobile.css, mobile/diagnostics.js (new), tests/mobile.cjs, tests/mobile-diagnostics.cjs (new). HEAD/base 6f5e739872772f04d2ee8ef4094252a37c0b169d; no commit attempt per 01:34/03:00. Never pushed.

## Verification and limits

- node tests/mobile-diagnostics.cjs --out=PATH passes nine error/rejection formats, early boot, WebKit/V8 first stack line, resource capture, first-error retention, safe bounded text and clean-hidden markup. Actual mobile HTML/main loop: 80 full 1280x720 pixel comparisons, 157 native-size modeled uploads, 158 world/HUD draws, DPR 3 at 812x375 and 375x812, title/selection/fight, all new hit/summon poses, all fifteen Domains, moving CPU tags, multitouch, rotation and visibility/page-cache return. Checks include screen shake; simulation snapshots are unchanged by drawing. No per-frame canvas creation in these samples.
- Actual backing sizes remain 1280x720 arena and 640x360 scratch/ImageData regardless of CSS dimensions/DPR. No world getImageData, OffscreenCanvas, createImageBitmap, canvas filter/roundRect or WeakRef/FinalizationRegistry use was found; raster uses WeakMap plus native-word views over CPU arrays. Audit dropped the superseded old-iOS compatibility work. Does not establish native iOS memory safety or compositor correctness.
- Fault injections: skipping only world uploads intentionally creates stale world/moving HUD and is caught by the pixel oracle, while diagnostics stays hidden; restoring uploads redraws correctly. Throwing in real world upload surfaces the first error and aborts HUD that frame; later errors cannot overwrite it and recovered frames render. Both are deliberate models, not reproductions of the owner's cause. World and HUD reuse one scratch canvas sequentially; native WebKit behavior remains unchecked.
- mobile, mobile-audio (includes mobile-menu/lifecycle), mobile-animation, mobile-install, runtime and feel pass. Animation: 922 ticks, 887 rasters, 36 freeze holds, 3,414 unchanged defaults. Final diagnostic CPU match: 2,828 frames (long match skips uploads). Syntax and git diff --check pass. git diff --exit-code HEAD -- index.html src mobile/raster.js mobile/touch.js confirms desktop/shared/render/gameplay/control byte identity. Unchanged standalone guard/domain/feedback, performance, art/stage/world and synthesis suites not repeated. No per-frame diagnostic work was added; no new FPS measurement.
- Two inspected mailbox PNGs: v121-error-model-812x375.png and v121-error-model-375x812.png. Exact game bitmap plus approximate overlay/font/layout, labeled generated models; not browser screenshots. No native CSS, physical input, phone/Safari, motion/FPS/latency, audible sound, OS installation/memory behavior, two-device WebRTC or owner play performed by Codex. Script-tested is not played. Arenas, optional Rapid Slash and cluster placement/opacity remain deferred.

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
