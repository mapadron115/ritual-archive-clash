# Handoff: Ritual Archive: Clash

## Current - version 108, mobile cache v=111; desktop v=108 (2026-11-15)

Mailbox through 17:10 read/acted on. V107 committed/pushed by coordinator as d7c4da4; coordinator now reviews, commits and pushes each version under the owner's standing instruction. Codex still never pushes. Owner directly repeated autonomous check-in/report instructions; no new design direction. V108 implements the ordered mobile menu pass. Desktop index/src stays byte-identical; arenas and optional Rapid Slash note stay closed/deferred.

V108 splits selection into three >=48px page buttons: each fighter, then Arena / moves. Each shows the current choice; one full-width roster has five columns at >=600px (three below). Back/Fight stays outside scrolling content. Online authority remains shared; guest opens on their own fighter page and remote updates preserve the current page. Complete move names/descriptions/costs/passives use vertical entries, with touch instructions and restored combo/kick/Black Flash rules. Pause actions stay above the scrolling list. Title/online/results can scroll in short viewports. Guest results expose Change fighters/Main menu while reserving Rematch for the host. Room-code typing consumes keyboard shortcuts; Enter joins. Optional roster arrows follow the new grid. No combat/shared-source change.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/mobile.css, mobile/touch.js, tests/mobile.cjs, tests/mobile-menu.cjs (new). HEAD/base d7c4da4; no add/commit attempt per 01:34/03:00; never pushed. All twelve mobile script URLs and CSS use v=111; eleven desktop URLs remain v=108.

## Verification and limits

- node tests/mobile-menu.cjs includes the mobile suite plus 19 actual HTML action routes, all 120 roster/12 arena choice states across AI/watch/host/guest, all 60 full move descriptions/costs/passives, restored rules, four grid-navigation boundaries, pause/resume/returns, every result action including guest exits, room-code typing/Enter, mocked host/join callbacks and stable remote selection labels. Disabled remote choices are updated through refresh rather than activated. No real network.
- node tests/mobile.cjs still passes actual-script-order, ten synthetic pointer commands, multitouch, main-loop movement/attacks, freeze taps, cleanup, CPU/watch, host/guest encoding, rotation, all 60 fight labels/states, read-only HUD, real cooldown/denial/setup states, guest slot and Domain gauge/HP/full/used. Upper meters stay identical, lower HUD transparent; all 36 safe-area fight target bounds/gaps pass. A complete CPU match still reaches two wins, delayed results, rematch and title through the shared main loop with synthetic touch punches. Long lifecycle check skips raster drawing; no human-play/FPS claim.
- Existing desktop runtime/menu/input/results/network-lifecycle and feel/input suites pass. Syntax and diff whitespace pass. git diff --exit-code HEAD -- index.html src confirms exact desktop/shared-file preservation.
- Twelve v108 menu models in codex mailbox: before/after selection at 667x375 and 844x390; pause/results/guest results at both; notched selection and portrait. Before structure checked against d7c4da4 CSS; text, placement and scrolling are illustrative models, not CSS rendering. Existing v107 fight geometry/opacity/cards remain unchanged (666x374 at 667x375; 693x389 at 844x390; 656x369 with safe areas).
- Computer/browser capture retried: browser access host unavailable. No actual phone, browser CSS/menu layout or native PointerEvent dispatch, touch feel, sound/listening, motion/FPS, phone keyboard/viewport behavior or real two-computer WebRTC verification. Existing desktop full-match/world/stage/art/audio/performance suites not repeated; source unchanged.

## Next priorities

V108 is ready for coordinator review/commit/publication under the 17:10 standing instruction; browser review of selection scrolling, expanded move lists and guest exits remains needed. V109: mobile online/input lifecycle, especially held input when backgrounded and reconnect/room transitions; then installable manifest/icons. No app-store packaging. Mobile first until owner confirms a phone match start to finish, then alternate mobile/web audits. Await owner phone feedback before changing overlay opacity/placement. No decision blocks the next version.

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
