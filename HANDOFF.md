# Handoff: Ritual Archive: Clash

## Current - version 109, mobile cache v=112; desktop v=108 (2026-11-15)

Mailbox through 17:18 read/acted on. V108 committed/pushed by coordinator as 2af2431. Coordinator reviews, commits and pushes each version under the owner's standing instruction; Codex still never pushes. Owner directly repeated autonomous check-in/report instructions; no new design direction. V109 implements the ordered mobile lifecycle pass and Back-width fix. Desktop index/src stays byte-identical; arenas and optional Rapid Slash note stay closed/deferred.

V109 sends guest neutral input immediately on clear, before animation frames can be suspended. Offline blur/hidden/pagehide/freeze opens Pause and return requires Resume; online stays locally unpaused. Touch capture is released; stale capture loss cannot cancel a new press. Hidden/portrait input is rejected. Return clears local/remote input and frame backlog. Mobile hosts expire guest controls after 1,000 ms without packets (existing guest heartbeat every seven frames). Host browser suspension can still stall the authoritative simulation; no background execution guarantee. Closed/error connections return to Online with retry guidance, pending closes are handled before open, retries replace stale room status, extra guests cannot replace a live connection, and pending host/join can be cancelled before G.mode changes. Selection/close clears remote input and pending results. No combat/shared-source change. All ordinary mobile buttons now have min-width:48px, including Back.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/mobile.css, mobile/touch.js, tests/mobile.cjs, tests/mobile-lifecycle.cjs (new). HEAD/base 2af2431; no add/commit attempt per 01:34/03:00; never pushed. All twelve mobile script URLs and CSS use v=112; eleven desktop URLs remain v=108.

## Verification and limits

- node tests/mobile-lifecycle.cjs includes the mobile/menu suites plus synchronous guest release without a frame, heartbeat renewal/one-second expiry through real host steps, single-use taps, offline background/page-cache pause and explicit resume, hidden input rejection, capture release/stale capture events, online lists/rotation, hidden host return, selection/rematch reset, close/error/pending-close, retry/cancel/stale callback isolation and extra-guest rejection. The initial regression failed against v108's absent immediate release. Memory transports/events, no real network.
- Included mobile/menu suites still pass actual HTML/script order, ten commands, multitouch, main-loop movement/attacks, freeze taps, CPU/watch, online encoding, rotation, all fight labels/states/read-only HUD and 36 safe-area fight bounds/gaps. All 19 menu action routes, roster/arena permissions, full descriptions, room typing and guest exits pass. Complete CPU match reaches two wins, delayed results, rematch and title (last run 2,944 frames); long check skips raster drawing, no human-play/FPS claim.
- Existing desktop runtime/menu/input/results/network-lifecycle and feel/input suites pass. Syntax and diff whitespace pass. git diff --exit-code HEAD -- index.html src confirms exact desktop/shared-file preservation.
- Five v109 return-to-app models in codex mailbox: before/after at 667x375 and 844x390, plus portrait. Before illustrates v108's continuing offline arena; after illustrates the existing Pause route now opened automatically. Inspected at output size. These use existing renderer/menu models, not browser screenshots or measured CSS. Fight geometry/opacity/cards unchanged (666x374 at 667x375; 693x389 at 844x390; 656x369 with safe areas).
- Computer/browser capture retried: browser access host unavailable. No actual phone, OS background/page-cache behavior, browser CSS/native PointerEvents, touch feel, sound/listening, motion/FPS, phone keyboard/viewport or real two-device WebRTC verification. Coordinator measured v108 selection/pause in Chromium; v109 Back min-width still needs browser measurement. Existing desktop full-match/world/stage/art/audio/performance suites not repeated; source unchanged.

## Next priorities

V109 is ready for coordinator review/commit/publication under the 17:10 standing instruction. Browser/phone checks: background either role while holding controls, return and make a fresh press, disconnect/rejoin, and measure Back >=48px. V110: mobile installable manifest/icons; offline play only if simple. No automatic reconnection claim or app-store packaging. Mobile first until owner confirms a phone match start to finish, then alternate mobile/web audits. Await owner feedback before changing overlay opacity/placement. No decision blocks the next version.

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
