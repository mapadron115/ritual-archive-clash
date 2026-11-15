# Handoff: Ritual Archive: Clash

## Current - version 112, mobile cache v=115; desktop v=108 (2026-11-15)

Mailbox through 17:48 read/acted on; reread at completion, unchanged. V111 committed/published by coordinator as 921f7f1. V112 completes the ordered mobile touch-feedback/denied-button audit. From v113 alternate one web version, then one mobile version, even before owner feedback; phone feedback jumps the queue. Coordinator commits/pushes reviewed versions; Codex still never pushes or attempts commits (01:34/03:00). Owner directly repeated autonomous check-in/report instructions, no new design direction. Arenas remain closed; optional Rapid Slash and control-cluster placement/opacity deferred.

Reproduced against v111 before fixing: low-CE A1 flashed other unavailable arts/Domain, Domain had no immediate denial flash, airborne full-gauge Domain said FULL READY, short taps had no persistent visual. CSS source also put held/active after denial, hiding the touched button's crimson field. Eight initial audit groups failed in the actual-script memory DOM; these are script/source findings, not observed phone behavior.

Mobile-only: ten fight controls keep a 120 ms visual touch acknowledgement without extending input. Touching an unavailable art/Domain/Maximum highlights only that button's current reason for up to 300 ms. Crimson field and paired rails win over held/active CSS. This is local availability feedback, not a confirmed simulation rejection/cast or server acknowledgement; real input still follows existing buffering/transport. Readiness clears old denial; cancellation and lifecycle changes clear feedback. Full-gauge/low-HP Domain/Maximum says LAND FIRST while airborne. Simulation, damage, roster, sounds and desktop unchanged.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, mobile/mobile.css, mobile/touch.js, tests/mobile.cjs (v111 adapter option and state-aware preview models), tests/mobile-feedback.cjs (new). HEAD/base 921f7f1615ada4fbb4179229f3a150aabfc3e5f9; no commit attempt; never pushed. All twelve mobile scripts and linked stylesheet/manifest/icons use v=115; desktop scripts remain v=108. Icon bytes unchanged.

## Verification and limits

- node tests/mobile-feedback.cjs passes eight pointer/feedback groups plus static CSS cascade guard: ten short taps/input edges, 120/300 ms expiry, scoped low CE, Domain/used Maximum, airborne Domain, setup/cooldown/HP/ground reasons, free CE/swap/HP-ready exceptions, readiness clearing stale denial, guest slot, unrelated nope isolation, cancellation, duplicate contacts, pause/menu/start/select/background/resize/watch cleanup. Feedback rendering leaves simulation snapshots unchanged.
- Same command runs existing mobile input/overlay/CPU-match checks: multitouch, ten real commands, actual attacks/jump/guard/arts, freeze taps, host/guest encoding, all roster names/states, read-only HUD, safe-area target geometry and full CPU match to two wins/results/rematch/title. Last current-adapter run: 2,802 main-loop frames (drawing skipped during long match). Script-tested is not played.
- node tests/mobile-audio.cjs passes existing mobile-menu/lifecycle suites and eight audio groups, including menu actions, room transitions, immediate neutral input, stale callbacks, interruption/mute/unlock/source disposal. node tests/runtime.cjs, node tests/feel.cjs and node tests/mobile-install.cjs pass. Source/test syntax and git diff --check pass. git diff --exit-code HEAD -- index.html src confirms byte-identical desktop/shared files. Unchanged stage/world/individual-art/full-roster/performance/audio-synthesis suites not repeated.
- node tests/mobile-feedback.cjs --feedback-baseline --preview-only --preview-dir=PATH loads actual 921f7f1 touch adapter; reproduces all eight original audit failures and exports before models. Current --preview-dir=PATH exports after models. Twenty-four v112 models in codex mailbox: held/released low-CE A1, Domain and punch tap, before/after at 667x375, 844x390 and portrait 390x844. Inspected 667 held/Domain pairs, 844 punch pair, portrait, plus initial released pair. Eight landscape pixel comparisons show 4,821-18,832 changed pixels, all confined to right control cluster; arena/HUD identical. Preview CPU choice/frame origin fixed for fair pairs.
- Models use the game's renderer, actual pointer handlers and current button data, with bitmap CSS/layout approximations. Not browser screenshots. No browser/phone used, no native :active/capture/CSS/font/compositing, real touch/scroll/focus, motion/FPS/latency, audible feedback, OS/background/installed behavior, trusted audio policy, real two-device WebRTC or owner play checked. The :active/held priority is a static source check only. Please verify on phone that short taps are visible, an unavailable held art/Domain flashes only itself, reasons remain readable, and move+attack/cancel/resume stay responsive.

## Next priorities

V112 ready for coordinator review/commit/publication under 17:48. Next v113 is WEB per new alternating order: candidate first-minute Domain/Maximum readiness and failed-input feedback audit, reproduce before selecting a fix. Then v114 mobile. Owner phone feedback takes priority. No decision blocks the next audit; leave this one-version run ready for coordinator commit.

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
