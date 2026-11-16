# Handoff: Ritual Archive: Clash

## Current - version 118 MOBILE/cache v=121; desktop v117/cache v=120 (2026-11-16 UTC)

Mailbox through 18:58 read/acted on; reread at completion, unchanged. V117 committed/live as 7ae0d0f. V118 completes the ordered mobile frame-cost audit with one mobile-only raster optimization. Owner directly repeated autonomous check-in/report instructions without new design direction. Alternate web/mobile; owner phone feedback jumps the queue. The 18:58 clarification authorizes fighter-animation adapters on mobile in v120 or after, after this audit; mobile HUD/input stay separate. Arenas, optional Rapid Slash and cluster placement/opacity remain deferred.

Reproduced: ordinary PixelSurface.rect dispatches dot once per pixel, including colour lookup/bounds checks. In a separate instrumented busy-frame pass, rectangle work was the largest measured primitive (4.27 ms/frame inclusive, versus 2.95 ms for blits; instrumentation overhead applies). A full-screen rectangle dispatches 230,400 dots; --baseline passes identity checks but fails the new zero-dot-dispatch regression. Busy fixtures use real Domain state from either actor and a real two-Domain clash, plus a bounded stress load through actual hit/block/jump/land/thud/dash/slash/swap/boom handlers. This is a renderer stress fixture, not one naturally played match.

mobile/raster.js loads immediately after shared pixel.js, only on mobile. It replaces rectangle dots with clipped Uint32Array row fills. Native-word colour packing retains RGBA bytes on either endian; WeakMap views follow transient byte arrays. No source in src/ or desktop index.html changed. No combat, timing, input, roster, sound, style or visible-output change. All thirteen mobile scripts/linked resources use v=121; desktop stays v=120. tests/mobile.cjs now expects the thirteenth script, with its assertions retained.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, mobile/raster.js (new), tests/mobile.cjs, tests/mobile-performance.cjs (new). HEAD/base 7ae0d0fc0a40658bc687f1756a55798ca7e3eb88; no commit attempt per 01:34/03:00. Never pushed.

## Verification and limits

- node tests/mobile-performance.cjs --out=PATH passes: 5,835 rectangle rounding/clipping/colour/overwrite comparisons, all 4,020 uncached build/pose/costume sprites, every stage motion cell, all fifteen uncached Domain backdrops, and 360 busy world/HUD pairs across fifteen fighter pairs, both Domain owners and clashes, six effect ages. Full-scene simulation stays read-only. Full-screen rectangle now uses zero dot dispatches. --baseline reproduces the 230,400-dispatch failure, with all equality groups passing.
- Warm interleaved old/new samples, 120 frames per method/scenario, actual mobile drawWorld + drawHUD (including control-state JS and presentation data copies), ordinary V8 rather than contextified Math. Windows x64, Node v26.13.1, Intel Core i9-14900HX. Median / p95 ms: quiet fight 1.825/2.079 -> 1.053/1.250; P1 active Void busy 7.481/8.232 -> 4.452/5.080; P2 active Ovation busy 7.759/8.425 -> 4.564/5.260; both-Domain clash busy 6.142/6.727 -> 3.031/3.523. Busy medians improve 40-51%. Snapshot ticks/effect ages vary deterministically; backdrop/assets are warmed. Timing run completed before parallel regression suites started.
- These are Node CPU raster/control measurements. Memory DOM writes and stub canvas uploads exclude native DOM/CSS, upload, GPU/compositor and display cost. They do not measure a browser frame budget, phone FPS, motion, input latency or phone thermal behavior. No real phone/browser, physical touch/keyboard, audible audio, OS lifecycle/install, two-device WebRTC or owner play checked. Script-tested is not played.
- mobile-guard, mobile-domain, mobile-feedback, mobile-audio (includes mobile menu/lifecycle), mobile-install, runtime and feel pass. Includes actual synthetic-pointer main loops, all fifteen fighters/45 arts, 20,697 paired guard-simulation ticks, guest snapshots/input packets, full CPU-match/results/rematch/title flows and existing safe-area/target checks. Desktop/shared sources byte-identical. Syntax and git diff --check pass. Unchanged full world/art/audio-synthesis suites not repeated; raster equivalence covers unchanged pixels directly.
- Mailbox artifacts: v118-candidate-timings.json, four native Domain/clash scenes, six phone layout models (before/after at 667x375, 844x390, portrait 390x844). Models compare byte-for-byte; inspected both landscape after models at 1x. They combine real game pixels/handlers/control state with approximated layout/CSS/fonts, not browser screenshots. Export with node tests/mobile-performance.cjs --out=PATH. Imported mobile harness finished CPU match in 2,613 frames during preview run (long match skips raster uploads).

## Next priorities

V118 ready for coordinator review/commit/publication under 18:58. No decision needed. Next v119 WEB: reproduce one fighter-animation gap in attack/cast anticipation or follow-through, with native before/after motion strips; no combat-rule/style change. V120 MOBILE or later: load approved fighter-animation adapters, with mobile suite and phone-size strips, per 18:58. Phone performance and physical play remain owner's checks; no claim this desktop CPU audit validates phone speed.

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
