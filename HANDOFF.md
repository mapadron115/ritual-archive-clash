# Handoff: Ritual Archive: Clash

## Current - version 128 MOBILE/cache v=131; desktop v127/cache v=130 (2026-11-16 02:39:02 UTC)

Mailbox through 21:26 read/acted on; v127 committed/live as 7d1ef98. Owner directly repeated autonomous check-in/report instructions; no new design direction. One version per run; coordinator commits; never push. No new iPhone retest result; that still takes priority.

V128 closes mobile's missing Maximum-body poses by loading the existing src/desktop-maximum.js after desktop-animation.js and before touch.js. Nuclear Shell coils/braces at Domain ages 36-71; Everything I Have coils/drives at 12-39 until contact; Resounding Voice inhales/plants at 12-23. Same six original poses and serialized ages as desktop. No source adapter edits or combat changes. All seventeen mobile script URLs, linked assets and manifest icons use v=131; error heading says v128. Desktop index.html and every src file remain byte-identical. Mobile touch, raster, presentation, diagnostics, CSS and icon pixels unchanged.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile.cjs, tests/mobile-maximum.cjs (new), tests/mobile-performance.cjs. HEAD/base 7d1ef9849d99446451f844cc12d2babf046a08cb. No add/commit attempt per 01:34/03:00; never pushed. Ready for coordinator review/commit/publication.

## Verification and limits

- mobile-maximum: five groups PASS; 3,228 parallel simulation ticks, 312 raster comparisons, 288 freeze holds, 48 event-free guest packets, 3,022 unchanged defaults and 52 changed native worlds. Actual touch/remote host casts, both slots/facings, normal/guarded damage, exact release ages, health/CE costs, full simulation/world parity, read-only rendering, body-only differences and exact phone HUD/control output. --maximum-baseline --preview-only omits only this adapter: five groups fail as expected, explicitly reproducing all three missing bodies. Preview-only permits these expected failures.
- mobile-animation: five groups PASS (924 ticks / 888 rasters / 36 holds / 3,414 defaults). mobile-slide, mobile-guard (1,217 checks / 20,697 ticks), mobile-domain (214 checks), mobile-install, mobile-present (73 normal/deferred full-canvas comparisons) and mobile-diagnostics (80 full-canvas comparisons plus fault injection) PASS. Complete desktop runtime and feel PASS. Syntax, git diff --check and desktop/source identity PASS.
- mobile-performance --maximum-cost: same fast raster in both variants; 120 warm frames per variant/scenario, seven scenarios, two interleaved comparisons. Repeated Maximum medians before -> after: Nuclear 1.713 -> 1.705 ms; allout 1.644 -> 1.611 ms; voice 1.762 -> 1.762 ms. P95: 2.163 -> 2.214 / 2.042 -> 2.040 / 2.128 -> 2.131 ms. No material CPU regression demonstrated in these samples; other scripted checks ran concurrently. Node i9-14900HX measurements exclude browser canvas upload/GPU/DOM cost and do not establish phone FPS. 5,835 rectangle cases, 4,350 uncached sprites, all stage/Domain backdrops and 360 busy worlds/HUDs retain primitive parity.
- 172 PNGs in mailbox: 168 Maximum before/after native scenes, 667x375 models and six-frame phone/body strips, both facings/costumes, plus four performance scenes. v128-maximum-timings.json records the repeated sample. Inspected nuclear main body pair and tick-60 phone pair, allout main phone strip, voice main body pair and mirrored phone strip. These are exact renderer stills/layout models, not browser screenshots or observed motion. Export: node tests/mobile-maximum.cjs --out=PATH.
- Fixtures corrected for mobile connection-open stopping a match, normal main-loop event draining, cross-realm pixel arrays and CE regeneration after allout's release. The install check caught manifest icon URLs omitted from the initial cache bump; fixed and rerun PASS.
- No browser/phone, physical touch/keys, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play. Unchanged historical art/audio/world and dedicated mobile menu/lifecycle/audio/feedback/blit suites not repeated. Script-tested is not played. iPhone frozen-world cause remains UNCONFIRMED; separate buffers/opaque fill remain a mitigation awaiting device retest.
- Next v129 WEB: audit Convergence's remaining static late-charge body, or another reproduced anticipation/recovery gap, with native strips; mobile unchanged. Phone retest jumps the queue. Arenas, optional Rapid Slash and control-cluster placement/opacity remain deferred.


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
