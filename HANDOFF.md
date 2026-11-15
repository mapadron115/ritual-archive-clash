# Handoff: Ritual Archive: Clash

## Current - version 111, mobile cache v=114; desktop v=108 (2026-11-15)

Mailbox through 17:39 read/acted on. V110 committed/published by coordinator as 01ff353. Coordinator reviews, commits and pushes each version under the owner's standing instruction; Codex still never pushes or attempts commits (01:34/03:00). Owner directly repeated autonomous check-in/report instructions; no new design direction. V111 completes the ordered first-touch audio/mute/return audit. Desktop index/src stays byte-identical; arenas and optional Rapid Slash note stay closed/deferred.

Reproduced before fixing with tests/mobile-audio.cjs against v110: first menu click did not create/unlock audio; unmute did not retry suspended audio; interrupted audio did not retry; 60 suspended boom events allocated 120 nodes; backgrounding left master gain at .65; muted return/unmute stayed suspended. All seven original audit groups failed. These are actual-code/mock-Web-Audio findings, not observed phone behavior.

Mobile-only audio adapter now retries on window capture click/pointerup/keydown gestures, keeps existing fight pointerdown retry, retries interrupted contexts, and retries unmute. MUTE/UNMUTE text and aria-pressed stay synchronized for touch and M. Backgrounding immediately gates master gain, stops/disconnects active sources and clears effect coalescing. Audio stays gated after return until a fresh gesture. Suspended/interrupted effects are dropped, not queued; statechange disposes active voices during OS interruption. Cleanup is idempotent against delayed onended. Mute survives background/return and menu/rematch transitions in the current page. No persistence across reload is claimed. Sound synthesis/timbre, combat and online simulation unchanged.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, mobile/touch.js, tests/mobile.cjs (preview label reads actual button), tests/mobile-audio.cjs (new). HEAD/base 01ff353; no add/commit attempt; never pushed. All twelve mobile scripts, stylesheet, manifest and icon URLs use v=114; eleven desktop scripts remain v=108. Icons unchanged.

## Verification and limits

- node tests/mobile-audio.cjs --preview-dir=PATH passes eight audio groups: first-menu unlock/watch/start, suspended unmute and keyboard/touch labels, interrupted release retry, no suspended queue, background online silence/fresh gesture, offline Resume/mute/input continuity, OS interruption/pending resume/source disposal, missing API/throwing/rejected resume. Mocked source cleanup checks late onended cannot double-decrement voices. No audio buffers are rendered or listened to.
- That command also runs mobile-lifecycle/mobile-menu/mobile: ten real input commands, multitouch, real attacks/freeze taps, CPU/watch, memory host/guest transports, all art states, safe-area bounds, 19 menu routes, roster/arena authority, disconnect/retry/stale callbacks, synchronous neutral and host expiry. Final complete CPU match: 2,974 main-loop frames to two wins/results/rematch/title; long match skips raster drawing. Script-tested, never called played.
- node tests/audio.cjs, node tests/runtime.cjs, node tests/feel.cjs and node tests/mobile-install.cjs pass. Source/test syntax and git diff --check pass; git diff --exit-code HEAD -- index.html src passes. Unchanged world/stage/individual-art/full-roster-match/performance suites not repeated.
- Six v111 phone-size sound/muted preview models saved in codex mailbox (667x375, 844x390, portrait 390x844). Inspected landscape MUTE/UNMUTE and portrait examples at output size; existing 52x48 target unchanged. Bitmap/layout models use the game's renderer and actual button text, not browser CSS/fonts or captured browser states.
- No browser or real phone/audio device used this run. No trusted autoplay-policy/user-activation test, audible quality/latency, real OS interruption/background/page-cache behavior, native touch/CSS/scroll/focus, standalone audio return, motion/FPS, two-device WebRTC or owner play. Window gesture capture is explicitly dispatched in the memory DOM; it has no bubbling or trusted activation. Browser/OS can still deny audio; failure remains nonfatal and retryable. No claim of universal Safari recovery.

## Next priorities

V111 is ready for coordinator review/commit/publication under 17:10/17:39. Phone check: title tap -> Watch or CPU -> hear round/fight cues, mute/unmute, background/return, tap Resume (offline) or a fresh control (online), and verify old sounds never burst on return. Repeat after a system audio interruption, with mute both on and off, and from the home-screen app. Owner phone feedback takes priority. Without feedback, next candidate v112: audit mobile first-minute touch feedback and denied-button state, reproduce before fixing. Mobile first until owner confirms a start-to-finish phone match; then alternate mobile/web audits. Overlay placement/opacity awaits feedback. No decision blocks the next audit.

Owner dive feel/readability notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.
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
